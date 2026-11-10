import { createHash, randomUUID } from 'node:crypto';
import { query, writeTransaction, type Query } from '../db/operational-query';
import { jakartaDate } from '../lib/billing-data';
import { currentFinanceMonth, monthBounds, type CashJournalRow, type CashPeriodSummary, type CashReconciliation, type LedgerScope } from '../lib/cash-data';
import { monthWindow, RESERVE_ACCOUNT, UNCATEGORIZED, type CashTrend } from '../lib/planning-data';
import type { UserSession } from '../types/auth';
import { putCashSetting, readCashSetting } from './expense-operations.service';
import { OperationalError, operationalAudit } from './operational-mutation';

const transfers = "'INTERNAL_TRANSFER','MUTASI_KAS_INTERNAL','RESERVE_TRANSFER'";
const expenseSources = "'EXPENSE','EXPENSE_REVERSAL'";
const paymentSources = "'PAYMENT','PAYMENT_REVERSAL'";
const incomeSql=`CASE WHEN source_type='PAYMENT_REVERSAL' THEN -amount
  WHEN direction='IN' AND source_type NOT IN (${transfers},'OPENING_BALANCE','EXPENSE_REVERSAL') THEN amount ELSE 0 END`;
const outgoingSql=`CASE WHEN source_type='EXPENSE_REVERSAL' THEN -amount
  WHEN direction='OUT' AND source_type NOT IN (${transfers},'OPENING_BALANCE','PAYMENT_REVERSAL') THEN amount ELSE 0 END`;
const periodSummarySql=`COALESCE(SUM(${incomeSql}),0) AS income,COALESCE(SUM(${outgoingSql}),0) AS outgoing,
  COALESCE(SUM(CASE WHEN source_type IN (${transfers}) THEN delta ELSE 0 END),0) AS transfers,
  COALESCE(SUM(CASE WHEN source_type='OPENING_BALANCE' THEN delta ELSE 0 END),0) AS opening_entries,COUNT(*) AS journal_count`;
export const CASH_PAGE_SIZE = 20;
export const CASH_CSV_LIMIT = 10_000;
const round = (value:number) => Math.round(value*100)/100;

interface LedgerQuery {
  month?: string; accountId?: string; search?: string; source?: string; category?:string; page?: number; scope?: LedgerScope; export?: boolean; pageSize?: number;
}
type RawJournal = {
  id:string|null; account_id:string|null; account_name:string|null; entry_date:string|null; direction:string|null; amount:string|number|null;
  source_type:string|null; source_id:string|null; description:string|null; running_balance:string|number|null;
  opening:string|number; closing:string|number; income:string|number; outgoing:string|number; transfers:string|number; opening_entries:string|number;
  journal_count:string|number; total_count:string|number;
};

export async function getCashLedger(input: LedgerQuery, run: Query = query) {
  const accountId = input.scope ? '' : input.accountId;
  const month = input.scope ? '' : input.month;
  const [start,end] = month ? monthBounds(month) : ['0000-00-00','9999-99-99'];
  const predicates:string[] = [];
  const filterValues:string[] = [];
  const scope = input.scope;
  if (scope) {
    predicates.push(`source_id=? AND source_type IN (${scope.type==='payment'?paymentSources:scope.type==='expense'?expenseSources:transfers})`);
    filterValues.push(scope.id);
  } else {
    if (input.search) {
      const search = '%' + input.search.toLowerCase().replace(/[!%_]/g,value=>'!'+value) + '%';
      predicates.push("(LOWER(description) LIKE ? ESCAPE '!' OR LOWER(id) LIKE ? ESCAPE '!' OR LOWER(COALESCE(source_id,'')) LIKE ? ESCAPE '!')");
      filterValues.push(search,search,search);
    }
    if (input.source==='expense') predicates.push(`source_type IN (${expenseSources})`);
    if (input.source==='payment') predicates.push(`source_type IN (${paymentSources})`);
    if (input.source==='transfer') predicates.push(`source_type IN (${transfers})`);
    if (input.source==='manual') predicates.push(`source_type NOT IN (${expenseSources},${paymentSources},${transfers},'OPENING_BALANCE')`);
    if (input.category) {
      predicates.push(`source_type IN (${expenseSources})`);
      const categoryJoin='SELECT 1 FROM expenses e JOIN expense_categories c ON c.id=e.category_id WHERE e.id=with_balances.source_id';
      predicates.push(input.category===UNCATEGORIZED ? `NOT EXISTS (${categoryJoin})` : `EXISTS (${categoryJoin} AND c.id=?)`);
      if (input.category!==UNCATEGORIZED) filterValues.push(input.category);
    }
  }
  const page = Math.min(Math.max(1,input.page || 1),100_000);
  const limit = input.export ? CASH_CSV_LIMIT : Math.max(1,Math.min(250,input.pageSize || CASH_PAGE_SIZE));
  const accountSql = accountId ? 'WHERE id=?' : '';
  const ledgerSql = accountId ? 'WHERE l.account_id=?' : '';
  const order = 'entry_date, CASE WHEN created_at IS NULL THEN 0 ELSE 1 END, created_at, id';
  const reverseOrder = 'entry_date DESC, CASE WHEN created_at IS NULL THEN 0 ELSE 1 END DESC, created_at DESC, id DESC';
  const rows = await run<RawJournal>(`WITH current_total AS (
    SELECT COALESCE(SUM(balance),0) AS balance FROM accounts ${accountSql}
  ), journal AS (
    SELECT l.id,l.account_id,l.entry_date,l.direction,l.amount,l.source_type,l.source_id,l.description,l.created_at,
      CASE WHEN l.direction='IN' THEN l.amount ELSE -l.amount END AS delta
    FROM ledger_entries l ${ledgerSql}
  ), prior AS (
    SELECT current_total.balance-COALESCE(SUM(CASE WHEN j.entry_date>=? THEN j.delta ELSE 0 END),0) AS opening,
      current_total.balance-COALESCE(SUM(CASE WHEN j.entry_date>=? THEN j.delta ELSE 0 END),0) AS closing
    FROM current_total LEFT JOIN journal j ON true GROUP BY current_total.balance
  ), period_rows AS (
    SELECT * FROM journal WHERE entry_date>=? AND entry_date<?
  ), period_summary AS (
    SELECT ${periodSummarySql} FROM period_rows
  ), with_balances AS (
    SELECT period_rows.*,prior.opening+SUM(delta) OVER (ORDER BY ${order} ROWS UNBOUNDED PRECEDING) AS running_balance
    FROM period_rows CROSS JOIN prior
  ), filtered AS (
    SELECT * FROM with_balances ${predicates.length ? 'WHERE '+predicates.join(' AND ') : ''}
  ), filtered_count AS (SELECT COUNT(*) AS total_count FROM filtered),
  page_rows AS (SELECT * FROM filtered ORDER BY ${reverseOrder} LIMIT ? OFFSET ?)
  SELECT f.id,f.account_id,a.name AS account_name,f.entry_date,f.direction,f.amount,f.source_type,f.source_id,f.description,f.running_balance,
    prior.opening,prior.closing,s.income,s.outgoing,s.transfers,s.opening_entries,s.journal_count,filtered_count.total_count
  FROM prior CROSS JOIN period_summary s CROSS JOIN filtered_count LEFT JOIN page_rows f ON true LEFT JOIN accounts a ON a.id=f.account_id
  ORDER BY f.entry_date DESC, CASE WHEN f.created_at IS NULL THEN 0 ELSE 1 END DESC, f.created_at DESC, f.id DESC`,
  [...(accountId?[accountId,accountId]:[]),start,end,start,end,...filterValues,limit,input.export?0:(page-1)*limit]);

  const first = rows[0];
  const summary:CashPeriodSummary = {opening:round(Number(first.opening)),closing:round(Number(first.closing)),income:round(Number(first.income)),
    outgoing:round(Number(first.outgoing)),transfers:round(Number(first.transfers)),openingEntries:round(Number(first.opening_entries)),count:Number(first.journal_count)};
  const entries:CashJournalRow[] = rows.filter(row=>Boolean(row.id)).map(row=>({id:row.id!,accountId:row.account_id,accountName:row.account_name,entryDate:row.entry_date!,direction:row.direction!,
    amount:Number(row.amount),sourceType:row.source_type!,sourceId:row.source_id,description:row.description!,runningBalance:round(Number(row.running_balance))}));
  return {summary,entries,total:Number(first.total_count),page};
}

export async function getCashMonthlySummaries(endMonth:string,range:number,run:Query=query):Promise<CashTrend[]> {
  const months=monthWindow(endMonth,range);
  const [start]=monthBounds(months[0]);
  const [,end]=monthBounds(endMonth);
  const rows=await run<{month:string|null;balance:number|string;tail:number|string;delta:number|string;income:number|string;
    outgoing:number|string;transfers:number|string;opening_entries:number|string;journal_count:number|string}>(`WITH journal AS (
      SELECT entry_date,source_type,direction,amount,CASE WHEN direction='IN' THEN amount ELSE -amount END AS delta
      FROM ledger_entries WHERE entry_date>=?
    ), tail AS (SELECT COALESCE(SUM(delta),0) AS delta FROM journal WHERE entry_date>=?),
    total AS (SELECT COALESCE(SUM(balance),0) AS balance FROM accounts),
    monthly AS (SELECT SUBSTR(entry_date,1,7) AS month,SUM(delta) AS delta,${periodSummarySql}
      FROM journal WHERE entry_date<? GROUP BY SUBSTR(entry_date,1,7))
    SELECT monthly.*,tail.delta AS tail,total.balance FROM total CROSS JOIN tail LEFT JOIN monthly ON true`,[start,end,end]);
  const indexed=new Map(rows.map(row=>[row.month,row]));
  let closing=round(Number(rows[0].balance)-Number(rows[0].tail));
  return months.slice().reverse().map(month=>{
    const row=indexed.get(month);
    const opening=round(closing-Number(row?.delta || 0));
    const summary={month,opening,closing,income:round(Number(row?.income || 0)),outgoing:round(Number(row?.outgoing || 0)),
      transfers:round(Number(row?.transfers || 0)),openingEntries:round(Number(row?.opening_entries || 0)),count:Number(row?.journal_count || 0)};
    closing=opening;
    return summary;
  }).reverse();
}

type SavedReconciliation = NonNullable<CashReconciliation['saved']>;
const reconKey = (accountId:string,month:string) => 'cash-recon:'+createHash('sha256').update(`${accountId}|${month}`).digest('hex');

export async function getCashReconciliation(accountId:string,month:string,run:Query=query):Promise<CashReconciliation> {
  const [start,end] = monthBounds(month);
  const [journal,{summary},saved] = await Promise.all([
    run<{id:string;entry_date:string;direction:string;amount:string|number;source_type:string;source_id:string|null;description:string}>(`SELECT id,entry_date,direction,amount,source_type,source_id,description FROM ledger_entries
      WHERE account_id=? AND entry_date>=? AND entry_date<? ORDER BY id`,[accountId,start,end]),
    getCashLedger({accountId,month},run),readCashSetting<SavedReconciliation>(run,reconKey(accountId,month)),
  ]);
  const fingerprint = createHash('sha256').update(JSON.stringify([accountId,month,summary.opening,summary.closing,journal])).digest('hex');
  const status = !saved ? 'UNREVIEWED' : saved.fingerprint!==fingerprint ? 'STALE' : round(saved.statementBalance-saved.bookBalance)===0 ? 'MATCHED' : 'DIFFERENT';
  return {month,accountId,fingerprint,summary,saved,status};
}

export async function saveCashReconciliation(input:{accountId:string;month:string;expectedVersion:string;statementBalance:number;note:string},actor:UserSession) {
  if (input.month>currentFinanceMonth()) throw new OperationalError('Rekonsiliasi hanya untuk bulan berjalan atau sebelumnya.',400);
  return writeTransaction(async (run,lock)=>{
    const [account] = await run('SELECT id FROM accounts WHERE id=? AND is_active=true AND type<>?'+lock,[input.accountId,RESERVE_ACCOUNT]);
    if (!account) throw new OperationalError('Rekening tidak aktif atau tidak ditemukan.',404);
    const current = await getCashReconciliation(input.accountId,input.month,run);
    if (current.fingerprint!==input.expectedVersion) throw new OperationalError('Jurnal berubah di perangkat lain. Muat ulang sebelum menyimpan.');
    const bookBalance = current.summary.closing;
    const difference = round(input.statementBalance-bookBalance);
    if (difference!==0 && input.note.trim().length<5) throw new OperationalError('Isi catatan selisih sebelum menyimpan.',400);
    const saved = {fingerprint:current.fingerprint,statementBalance:input.statementBalance,bookBalance,note:input.note,at:new Date().toISOString(),by:actor.fullName};
    await putCashSetting(run,reconKey(input.accountId,input.month),saved,'Rekonsiliasi kas per rekening dan bulan');
    await operationalAudit(run,actor,'ledger.reconcile','ACCOUNT',input.accountId,{month:input.month,...saved,difference});
    return {...current,saved,status:difference===0?'MATCHED':'DIFFERENT'};
  });
}

export async function saveCashAccount(input:{id?:string;name:string;code:string;type:string;bankName?:string;accountNumber?:string;balance:number},actor:UserSession) {
  return writeTransaction(async (run,lock)=>{
    const id = input.id || `acc-${randomUUID()}`;
    const code = input.code.toUpperCase();
    if ((await run('SELECT id FROM accounts WHERE UPPER(code)=? AND id<>?',[code,id])).length) throw new OperationalError('Kode rekening sudah dipakai.');
    const bank = ['BANK','SAVINGS'].includes(input.type);
    const bankName = bank ? input.bankName || null : null;
    const accountNumber = bank ? input.accountNumber || null : null;
    let balance = input.balance;
    if (input.id) {
      const [current] = await run<{balance:number|string}>('SELECT balance FROM accounts WHERE id=? AND is_active=true AND type<>?'+lock,[id,RESERVE_ACCOUNT]);
      if (!current) throw new OperationalError('Rekening tidak ditemukan.',404);
      balance = Number(current.balance);
      await run('UPDATE accounts SET name=?,code=?,type=?,bank_name=?,account_number=? WHERE id=?',[input.name,code,input.type,bankName,accountNumber,id]);
    } else {
      await run(`INSERT INTO accounts (id,community_id,name,code,type,bank_name,account_number,balance,is_active) VALUES (?,'comm-01',?,?,?,?,?,?,true)`,
        [id,input.name,code,input.type,bankName,accountNumber,balance]);
      if (balance>0) await run(`INSERT INTO ledger_entries (id,account_id,entry_date,direction,amount,source_type,description,created_by)
        VALUES (?,?,?,'IN',?,'OPENING_BALANCE',?,?)`,[`led-${randomUUID()}`,id,jakartaDate(),balance,`Saldo awal: ${input.name}`,actor.id]);
    }
    await operationalAudit(run,actor,input.id?'account.update':'account.create','ACCOUNT',id,{name:input.name,code,type:input.type,opening:input.id?undefined:balance});
    return {...input,id,code,bankName,accountNumber,balance};
  });
}
