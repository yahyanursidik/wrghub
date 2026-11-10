import type { APIRoute } from 'astro';
import { z } from 'zod';
import { writeTransaction } from '../../../db/operational-query';
import { BILLING_COMMUNITY_ID, selectReceivingBank } from '../../../lib/billing-data';
import { getAccounts } from '../../../services/finance.service';
import { mutation, OperationalError, operationalAudit, textField } from '../../../services/operational-mutation';

const settingsSchema = z.object({
  communityName: textField(250).min(3),
  rtRw: textField(100), address: textField(500),
  monthlyRate: z.number().int().positive().max(1e9).optional(),
  bankName: textField(100).min(1).optional(), bankAccount: textField(100).min(1).optional(),
  accountHolder: textField(150).optional(), qrisNmid: textField(100).optional(),
  securityPhone: textField(50), rwHeadPhone: textField(50),
  balance: z.number().optional(),
}).refine(input=>Boolean(input.bankName)===Boolean(input.bankAccount),'Isi nama bank dan nomor rekening bersama.');

type SavedProfile = {monthlyRate?:number;bankAccount?:string;accountHolder?:string;qrisNmid?:string};

export const POST: APIRoute = mutation(settingsSchema, (input, actor) => writeTransaction(async (run, lock) => {
  if (input.balance !== undefined) throw new OperationalError('Saldo hanya dapat dikoreksi melalui jurnal Buku kas.');
  const [community] = await run('SELECT id FROM communities WHERE id=?'+lock,[BILLING_COMMUNITY_ID]);
  if (!community) throw new OperationalError('Profil lingkungan belum tersedia.');
  const [saved] = await run<{value:string}>("SELECT value FROM settings WHERE key='community_profile' LIMIT 1");
  let previous:SavedProfile = {};
  if (saved) { try { previous = JSON.parse(saved.value) || {}; } catch {} }
  const accounts = await getAccounts(run);
  let bank = selectReceivingBank(accounts);
  if (input.bankName && input.bankAccount) {
    const target = bank || accounts.find(item=>['BANK','SAVINGS'].includes(item.type));
    if (!target) throw new OperationalError('Buat rekening penerima di Buku kas terlebih dahulu.');
    await run('UPDATE accounts SET bank_name=?,account_number=? WHERE id=? AND is_active=true',[input.bankName,input.bankAccount,target.id]);
    bank = {...target,bankName:input.bankName,accountNumber:input.bankAccount};
  }

  const bankAccount = bank?.accountNumber || '';
  const sameAccount = Boolean(bankAccount && previous.bankAccount===bankAccount);
  const profile = {
    communityName:input.communityName,rtRw:input.rtRw,address:input.address,
    monthlyRate:input.monthlyRate ?? previous.monthlyRate ?? 250000,
    bankName:bank ? bank.bankName || bank.name : '',bankAccount,
    accountHolder:bankAccount ? input.accountHolder ?? (sameAccount ? previous.accountHolder || '' : '') : '',
    qrisNmid:bankAccount ? input.qrisNmid ?? (sameAccount ? previous.qrisNmid || '' : '') : '',
    securityPhone:input.securityPhone,rwHeadPhone:input.rwHeadPhone,
  };
  await run('UPDATE communities SET name=?,address=? WHERE id=?',[profile.communityName,profile.address,BILLING_COMMUNITY_ID]);
  await run("INSERT INTO settings (id,community_id,key,value,description,updated_at) VALUES (?,?,?,?,?,?) "+
    "ON CONFLICT (key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at",
    ['set-profile',BILLING_COMMUNITY_ID,'community_profile',JSON.stringify(profile),'Profil lingkungan',new Date().toISOString()]);
  await operationalAudit(run,actor,'settings.update','COMMUNITY_SETTINGS',BILLING_COMMUNITY_ID,{communityName:profile.communityName});
  return {success:true,bankInfo:{bankName:profile.bankName,accountNumber:profile.bankAccount,accountHolder:profile.accountHolder,qrisNmid:profile.qrisNmid}};
}));
