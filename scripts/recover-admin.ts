import { randomUUID } from 'node:crypto';
import { createInterface } from 'node:readline/promises';
import { pathToFileURL } from 'node:url';
import { Writable } from 'node:stream';
import postgres from 'postgres';
import { postgresSsl } from '../src/db/postgres-connection';
import { hashPassword } from '../src/lib/passwords';
import { minimumNewPassword, isStrongAccountPassword } from '../src/lib/account-recovery';

type Account={id:string;username:string;role:string;is_active:boolean};
const unavailable='Username pengurus aktif yang tepat tidak ditemukan.';
const privileged=(role:string)=>role==='CHAIRMAN' || role==='SUPER_ADMIN';
export async function inspectAdmin(sql:ReturnType<typeof postgres>,username:string) {
  const rows=await sql<Account[]>`SELECT id,username,role,is_active FROM users WHERE lower(username)=lower(${username}) LIMIT 2`;
  if(rows.length!==1 || !rows[0].is_active || !privileged(rows[0].role)) throw Error(unavailable);
  return rows[0];
}
export async function recoverAdmin(sql:ReturnType<typeof postgres>,account:Account,password:string) {
  if(!isStrongAccountPassword(password) || password.toLowerCase().includes(account.username.toLowerCase()) && account.username.length>=6)
    throw Error('Pilih kata sandi baru yang kuat dan tidak memuat username.');
  const hash=hashPassword(password);
  return sql.begin(async tx=>{
    const [locked]=await tx<Account[]>`SELECT id,username,role,is_active FROM users WHERE id=${account.id} FOR UPDATE`;
    if(!locked?.is_active || locked.username!==account.username || locked.role!==account.role || !privileged(locked.role)) throw Error(unavailable);
    await tx`UPDATE users SET password_hash=${hash},updated_at=NOW() WHERE id=${locked.id}`;
    const [schema]=await tx`SELECT to_regclass('public.account_recovery_tokens') IS NOT NULL AS present`;
    if(schema.present) await tx`DELETE FROM account_recovery_tokens WHERE user_id=${locked.id}`;
    await tx`INSERT INTO audit_logs (id,actor_name,action,entity_type,entity_id,new_value_json)
      VALUES (${'aud-'+randomUUID()},'Operator basis data','user.operator_recovery','USER',${locked.id},${JSON.stringify({at:new Date().toISOString()})})`;
  });
}
async function hidden(prompt:string) {
  process.stdout.write(prompt);
  const output=new Writable({write(_chunk,_encoding,done){done();}});
  const reader=createInterface({input:process.stdin,output,terminal:true});
  try {return await reader.question('');}
  finally {reader.close();process.stdout.write('\n');}
}
async function main() {
  const [mode,username,...rest]=process.argv.slice(2);
  if(!['--inspect','--apply'].includes(mode) || !username || rest.length) throw Error('Gunakan --inspect <username> atau --apply <username>.');
  const url=process.env.WARGAHUB_RECOVERY_DATABASE_URL;
  if(!url) throw Error('Atur WARGAHUB_RECOVERY_DATABASE_URL untuk PostgreSQL yang Anda kelola. Skrip tidak mengambil URL dari .env.');
  const target=new URL(url);
  if(!['postgres:','postgresql:'].includes(target.protocol)) throw Error('Target harus PostgreSQL.');
  if(mode==='--apply' && !process.stdin.isTTY) throw Error('Perubahan memerlukan terminal interaktif.');
  const sql=postgres(url,{ssl:postgresSsl(url),max:1});
  try {
    const account=await inspectAdmin(sql,username);
    console.log('Target: '+target.hostname+target.pathname+' · '+account.username+' · '+account.role);
    if(mode==='--inspect') return;
    const terminal=createInterface({input:process.stdin,output:process.stdout});
    let confirmation:string;
    try {confirmation=await terminal.question('Untuk melanjutkan, ketik kembali username persis seperti di atas: ');}
    finally {terminal.close();}
    if(confirmation!==account.username) throw Error('Dibatalkan: username konfirmasi tidak cocok.');
    const password=await hidden('Kata sandi baru (minimal '+minimumNewPassword+' karakter, tidak ditampilkan): ');
    if(password!==await hidden('Ulangi kata sandi: ')) throw Error('Kata sandi tidak sama.');
    await recoverAdmin(sql,account,password);
    console.log('Kata sandi diperbarui. Masuk kembali melalui halaman admin.');
  } finally {await sql.end();}
}
if(process.argv[1] && pathToFileURL(process.argv[1]).href===import.meta.url) {
  main().catch(error=>{
    console.error(error?.name==='PostgresError'?'Operasi PostgreSQL gagal. Tidak ada kata sandi yang dicetak.':error?.message || 'Pemulihan gagal.');
    process.exitCode=1;
  });
}
