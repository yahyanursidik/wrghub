import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { z } from 'zod';
import { query, writeTransaction, type Query } from '../db/operational-query';
import { hashPassword } from '../lib/passwords';
import { isStrongAccountPassword, mayManageCredential, minimumNewPassword, recoveryCodePattern } from '../lib/account-recovery';
import type { UserRole, UserSession } from '../types/auth';
import { idField, operationalAudit, OperationalError, textField } from './operational-mutation';

const duration = 20 * 60_000;
const digest = (token: string) => createHash('sha256').update(token).digest('hex');
const passwordInput = z.string().min(minimumNewPassword).max(1024).refine(isStrongAccountPassword,'Pilih kata sandi yang lebih kuat.');
export const issueRecoveryInput = z.object({userId:idField, identityVerified:z.literal(true)});
export const redeemRecoveryInput = z.object({code:z.string().trim().regex(recoveryCodePattern),newPassword:passwordInput});
export const changeCredentialInput = z.object({userId:idField,newPassword:z.string().min(6).max(1024),reason:textField(250).optional()});
type Account = {id:string;role:UserRole;username:string;is_active:number|boolean};
type Token = {user_id:string;expires_at:string;issued_role:UserRole};
async function user(run:Query,id:string,lock='') {
  const [row]=await run<Account>('SELECT id,role,username,is_active FROM users WHERE id=?'+lock,[id]);
  return row;
}
async function writeCredential(run:Query,userId:string,hash:string,now:string) {
  if (process.env.DATABASE_URL) await run('UPDATE users SET password_hash=?,updated_at=? WHERE id=?',[hash,now,userId]);
  else await run(`INSERT INTO settings (id,key,value,description,updated_at) VALUES (?,?,?,?,?)
    ON CONFLICT (key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at`,
    ['credential-'+userId,'auth.password.'+userId,hash,'Hashed login credential',now]);
}
export async function issueRecoveryCode(data:z.output<typeof issueRecoveryInput>, actor:UserSession) {
  return writeTransaction(async(run,lock)=>{
    const target=await user(run,data.userId,lock);
    if (!target?.is_active) throw new OperationalError('Akun aktif tidak ditemukan.',404);
    if (!mayManageCredential(actor,target)) throw new OperationalError('Pemulihan akun ini memerlukan super admin.',403);
    const code=randomBytes(32).toString('base64url');
    const expiresAt=new Date(Date.now()+duration).toISOString();
    await run(`INSERT INTO account_recovery_tokens (user_id,token_hash,issued_role,expires_at) VALUES (?,?,?,?)
      ON CONFLICT (user_id) DO UPDATE SET token_hash=excluded.token_hash,issued_role=excluded.issued_role,expires_at=excluded.expires_at`,
      [target.id,digest(code),target.role,expiresAt]);
    await operationalAudit(run,actor,'user.recovery_issued','USER',target.id,{expiresAt});
    return {code,expiresAt,username:target.username};
  });
}
const invalidCode=()=>new OperationalError('Kode tidak valid atau sudah kedaluwarsa. Minta kode baru kepada pengurus.',400);
export async function redeemRecoveryCode(data:z.output<typeof redeemRecoveryInput>) {
  const tokenHash=digest(data.code);
  const [candidate]=await query<Token>('SELECT user_id,expires_at,issued_role FROM account_recovery_tokens WHERE token_hash=?',[tokenHash]);
  if (!candidate || candidate.expires_at<=new Date().toISOString()) throw invalidCode();
  const hash=hashPassword(data.newPassword);
  return writeTransaction(async(run,lock)=>{
    const target=await user(run,candidate.user_id,lock);
    const [token]=await run<Token>('SELECT user_id,expires_at,issued_role FROM account_recovery_tokens WHERE user_id=? AND token_hash=?',[candidate.user_id,tokenHash]);
    const now=new Date().toISOString();
    if (!target?.is_active || !token || token.issued_role!==target.role || token.expires_at<=now) throw invalidCode();
    await writeCredential(run,target.id,hash,now);
    await run('DELETE FROM account_recovery_tokens WHERE user_id=?',[target.id]);
    await run(`INSERT INTO audit_logs (id,actor_user_id,actor_name,action,entity_type,entity_id,new_value_json)
      VALUES (?,?,'Pemulihan akun','user.recovery_completed','USER',?,?)`,['aud-'+randomUUID(),target.id,target.id,JSON.stringify({at:now})]);
    return {message:'Kata sandi diperbarui. Masuk kembali dengan kata sandi baru.'};
  });
}
export function canUsePassword(password:string, role:UserRole) {
  const isGuardPin=role==='SECURITY' && /^\d{6}$/.test(password) && !/^(\d)\1+$/.test(password) && password!=='123456';
  return isGuardPin || passwordInput.safeParse(password).success;
}

export async function changeAccountCredential(data:z.output<typeof changeCredentialInput>,actor:UserSession) {
  return writeTransaction(async(run,lock)=>{
    const target=await user(run,data.userId,lock);
    if (!target?.is_active) throw new OperationalError('Akun aktif tidak ditemukan.',404);
    if (!mayManageCredential(actor,target)) throw new OperationalError('Akun ini hanya dapat diubah oleh super admin.',403);
    if (!canUsePassword(data.newPassword,target.role)) throw new OperationalError('Gunakan sedikitnya '+minimumNewPassword+' karakter dan hindari kata sandi umum.',400);
    await writeCredential(run,target.id,hashPassword(data.newPassword),new Date().toISOString());
    await run('DELETE FROM account_recovery_tokens WHERE user_id=?',[target.id]);
    await operationalAudit(run,actor,'user.password_updated','USER',target.id,{reason:data.reason || null});
    return {success:true,userId:target.id,message:'Kata sandi diperbarui.'};
  });
}
