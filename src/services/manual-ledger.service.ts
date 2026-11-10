import { randomUUID } from 'node:crypto';
import { writeTransaction, type Query } from '../db/operational-query';
import { jakartaDate } from '../lib/billing-data';
import { isEditableJournal } from '../lib/cash-data';
import type { UserSession } from '../types/auth';
import { OperationalError, operationalAudit } from './operational-mutation';

export interface ManualLedgerInput {
  accountId:string; entryDate:string; direction:'IN'|'OUT'; amount:number;
  sourceType:string; description:string; referenceNo?:string; createdBy?:string;
}
type JournalRecord = {id:string;account_id:string;entry_date:string;direction:'IN'|'OUT';amount:number|string;
  source_type:string;source_id:string|null;description:string};
const journalColumns = 'id,account_id,entry_date,direction,amount,source_type,source_id,description';
const signed = (direction:string,amount:number) => direction==='IN' ? amount : -amount;
const editable = (source:string) => {
  if (!isEditableJournal(source)) throw new OperationalError('Entri terhubung ke transaksi lain. Gunakan menu sumbernya untuk koreksi.',400);
};
const validateAmount = (amount:number) => {
  if (!Number.isFinite(amount) || amount<=0) throw new OperationalError('Nominal harus lebih dari nol.',400);
};
function validatePostedDate(date:string) {
  if (date>jakartaDate()) throw new OperationalError('Tanggal jurnal tidak boleh melewati hari ini.',400);
}
async function lockAccounts(run:Query,lock:string,ids:string[]) {
  const unique = [...new Set(ids)].sort();
  return run<{id:string;balance:number|string;is_active:boolean|number}>(
    'SELECT id,balance,is_active FROM accounts WHERE id IN ('+unique.map(()=>'?').join(',')+') ORDER BY id'+lock,unique);
}
async function insertJournal(run:Query,entry:ManualLedgerInput & {id:string; sourceId:string|null; createdBy?:string|null; createdAt:string}) {
  await run(`INSERT INTO ledger_entries (id,account_id,entry_date,direction,amount,source_type,source_id,description,created_by,created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?)`,[entry.id,entry.accountId,entry.entryDate,entry.direction,entry.amount,entry.sourceType,entry.sourceId,entry.description,entry.createdBy || null,entry.createdAt]);
  await run('UPDATE accounts SET balance=balance+? WHERE id=?',[signed(entry.direction,entry.amount),entry.accountId]);
}
export async function createManualLedgerEntry(input:ManualLedgerInput,actor?:UserSession) {
  validateAmount(input.amount);
  if (actor) validatePostedDate(input.entryDate);
  editable(input.sourceType);
  const entry = {...input,id:`led-${randomUUID()}`,sourceId:input.referenceNo || null,createdBy:actor?.id || input.createdBy,createdAt:new Date().toISOString()};
  await writeTransaction(async (run,lock)=>{
    if (!(await lockAccounts(run,lock,[entry.accountId]))[0]?.is_active) throw new OperationalError('Rekening tidak ditemukan atau tidak aktif.');
    await insertJournal(run,entry);
    if (actor) await operationalAudit(run,actor,'ledger.manual.create','LEDGER_ENTRY',entry.id,{accountId:entry.accountId,date:entry.entryDate,direction:entry.direction,amount:entry.amount});
  });
  return entry;
}
export async function updateManualLedgerEntry(id:string,patch:Partial<ManualLedgerInput>,actor?:UserSession) {
  if (patch.amount!==undefined) validateAmount(patch.amount);
  if (actor && patch.entryDate) validatePostedDate(patch.entryDate);
  return writeTransaction(async (run,lock)=>{
    const [row] = await run<JournalRecord>('SELECT '+journalColumns+' FROM ledger_entries WHERE id=?'+lock,[id]);
    if (!row) throw new OperationalError('Entri tidak ditemukan.',404);
    editable(row.source_type);
    const next = {accountId:patch.accountId || row.account_id,entryDate:patch.entryDate || row.entry_date,amount:patch.amount ?? Number(row.amount),
      direction:patch.direction || row.direction,description:patch.description ?? row.description,referenceNo:patch.referenceNo ?? row.source_id};
    const accounts = await lockAccounts(run,lock,[row.account_id,next.accountId]);
    if (!accounts.some(account=>account.id===next.accountId && account.is_active)) throw new OperationalError('Rekening tujuan tidak aktif.');
    await run('UPDATE accounts SET balance=balance-? WHERE id=?',[signed(row.direction,Number(row.amount)),row.account_id]);
    await run('UPDATE accounts SET balance=balance+? WHERE id=?',[signed(next.direction,next.amount),next.accountId]);
    await run('UPDATE ledger_entries SET account_id=?,entry_date=?,direction=?,amount=?,description=?,source_id=? WHERE id=?',
      [next.accountId,next.entryDate,next.direction,next.amount,next.description,next.referenceNo || null,id]);
    if (actor) await operationalAudit(run,actor,'ledger.manual.update','LEDGER_ENTRY',id,{before:row,after:next});
    return {id,...next};
  });
}
export async function transferBetweenAccounts(input:{fromAccountId:string;toAccountId:string;amount:number;description:string;entryDate:string},actor?:UserSession) {
  validateAmount(input.amount);
  if (actor) validatePostedDate(input.entryDate);
  if (input.fromAccountId===input.toAccountId) throw new OperationalError('Rekening asal dan tujuan harus berbeda.',400);
  const transferId = `transfer-${randomUUID()}`;
  const outEntry = {id:`led-${randomUUID()}`,accountId:input.fromAccountId,entryDate:input.entryDate,direction:'OUT' as const,amount:input.amount,
    sourceType:'INTERNAL_TRANSFER',sourceId:transferId,description:input.description,createdBy:actor?.id,createdAt:new Date().toISOString()};
  const inEntry = {...outEntry,id:`led-${randomUUID()}`,accountId:input.toAccountId,direction:'IN' as const};
  await writeTransaction(async (run,lock)=>{
    const accounts = await lockAccounts(run,lock,[input.fromAccountId,input.toAccountId]);
    if (accounts.filter(account=>account.is_active).length!==2) throw new OperationalError('Rekening asal atau tujuan tidak aktif.');
    if (Number(accounts.find(account=>account.id===input.fromAccountId)?.balance)<input.amount) throw new OperationalError('Saldo rekening asal tidak cukup.');
    await insertJournal(run,outEntry);
    await insertJournal(run,inEntry);
    if (actor) await operationalAudit(run,actor,'ledger.transfer','INTERNAL_TRANSFER',transferId,{...input,entries:[outEntry.id,inEntry.id]});
  });
  return {transferId,outEntry,inEntry};
}
export async function deleteManualLedgerEntry(id:string,actor?:UserSession,reason?:string) {
  return writeTransaction(async (run,lock)=>{
    const [pointer] = await run<JournalRecord>('SELECT '+journalColumns+' FROM ledger_entries WHERE id=?',[id]);
    if (!pointer) throw new OperationalError('Entri tidak ditemukan atau sudah dihapus.',404);
    const transfer = pointer.source_type==='INTERNAL_TRANSFER' && pointer.source_id;
    if (!transfer) editable(pointer.source_type);
    const rows = transfer
      ? await run<JournalRecord>("SELECT "+journalColumns+" FROM ledger_entries WHERE source_type='INTERNAL_TRANSFER' AND source_id=? ORDER BY id"+lock,[transfer])
      : await run<JournalRecord>('SELECT '+journalColumns+' FROM ledger_entries WHERE id=?'+lock,[id]);
    if (transfer && (rows.length!==2 || !rows.some(row=>row.id===id) || rows[0].direction===rows[1].direction || Number(rows[0].amount)!==Number(rows[1].amount) || rows[0].account_id===rows[1].account_id)) {
      throw new OperationalError('Pasangan mutasi tidak lengkap. Periksa melalui rekonsiliasi.');
    }
    if (!rows.length) throw new OperationalError('Entri sudah dihapus.',404);
    const accounts = await lockAccounts(run,lock,rows.map(row=>row.account_id));
    if (transfer) {
      const credited = rows.find(row=>row.direction==='IN')!;
      if (Number(accounts.find(account=>account.id===credited.account_id)?.balance)<Number(credited.amount)) throw new OperationalError('Saldo rekening tujuan tidak cukup untuk membatalkan mutasi.');
    }
    for (const row of rows) {
      await run('UPDATE accounts SET balance=balance-? WHERE id=?',[signed(row.direction,Number(row.amount)),row.account_id]);
      await run('DELETE FROM ledger_entries WHERE id=?',[row.id]);
    }
    if (actor) await operationalAudit(run,actor,transfer?'ledger.transfer.cancel':'ledger.manual.delete',transfer?'INTERNAL_TRANSFER':'LEDGER_ENTRY',transfer || id,{reason,entries:rows});
    return {success:true,id,ids:rows.map(row=>row.id)};
  });
}
