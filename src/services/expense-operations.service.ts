import { createHash, randomUUID } from 'node:crypto';
import { query, writeTransaction, type Query } from '../db/operational-query';
import { jakartaDate, proofLink } from '../lib/billing-data';
import { aidTypes, currentFinanceMonth, monthBounds, proofMaxBytes, proofMimes, scheduledExpenseDate, type AidType, type ExpenseCategory, type ExpenseDetails, type ExpenseRow, type FacilityProject, type RecurringExpenseConfigItem, type RecurringPreviewRow } from '../lib/cash-data';
import type { UserSession } from '../types/auth';
import { getAccounts } from './finance.service';
import { OperationalError, operationalAudit } from './operational-mutation';

const community = 'comm-01';
const configKey = 'recurring_expenses_config';
const detailsKey = (id: string) => `cash-expense:${id}`;
const projectKey = (id: string) => `cash-project:${id}`;
const hash = (value: string) => createHash('sha256').update(value).digest('hex');
const rounded = (value: number) => Math.round(value * 100) / 100;

export async function putCashSetting(run: Query, key: string, value: unknown, description: string) {
  await run(`INSERT INTO settings (id,community_id,key,value,description,updated_at) VALUES (?,?,?,?,?,CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=CURRENT_TIMESTAMP`,
    [`cash-${hash(key).slice(0, 36)}`, community, key, JSON.stringify(value), description]);
}
export async function readCashSetting<T>(run: Query, key: string, lock = ''): Promise<T | null> {
  const [row] = await run<{value:string}>('SELECT value FROM settings WHERE key=?' + lock, [key]);
  return row ? JSON.parse(row.value) as T : null;
}

export async function getExpenseCategories(run: Query = query) {
  return run<ExpenseCategory>('SELECT id,name,code FROM expense_categories ORDER BY name,id');
}

export async function addExpenseCategory(name:string,actor:UserSession) {
  return writeTransaction(async (run,lock)=>{
    await run('SELECT id FROM communities WHERE id=?'+lock,[community]);
    if ((await run('SELECT id FROM expense_categories WHERE LOWER(name)=LOWER(?)',[name])).length) throw new OperationalError('Kategori ini sudah tersedia.');
    const id = `cat-${randomUUID()}`;
    const code = id.toUpperCase();
    await run('INSERT INTO expense_categories (id,community_id,name,code,icon) VALUES (?,?,?,?,?)',[id,community,name,code,'CircleDot']);
    await operationalAudit(run,actor,'expense.category.create','EXPENSE_CATEGORY',id,{name});
    return {id,name,code};
  });
}

type ExpenseRecord = { id:string; category_id:string|null; account_id:string|null; title:string; description:string|null; amount:number|string; expense_date:string; status:string };
type JournalRecord = { id:string; account_id:string|null; amount:number|string; entry_date:string; direction:string };
type ExpenseRead = ExpenseRecord & { category_name:string|null;account_name:string|null;has_proof:number;journal_count:number|string;matching_journal_count:number|string;details_json:string|null };

export async function getExpenses(id?: string): Promise<ExpenseRow[]> {
  const rows = await query<ExpenseRead>(`WITH expense_journals AS (
      SELECT source_id,COUNT(*) AS journal_count, MIN(account_id) AS account_id, MIN(entry_date) AS entry_date,
        MIN(amount) AS amount, MIN(direction) AS direction
      FROM ledger_entries WHERE source_type='EXPENSE' ${id ? 'AND source_id=?' : ''} GROUP BY source_id
    ) SELECT e.id,e.category_id,e.account_id,e.title,e.description,e.amount,e.expense_date,e.status,c.name AS category_name,a.name AS account_name,
      CASE WHEN e.receipt_file_url IS NOT NULL AND e.receipt_file_url<>'' THEN 1 ELSE 0 END AS has_proof,
      COALESCE(j.journal_count,0) AS journal_count,
      CASE WHEN j.journal_count=1 AND j.account_id=e.account_id AND j.entry_date=e.expense_date AND j.amount=e.amount AND j.direction='OUT' THEN 1 ELSE 0 END AS matching_journal_count,
      s.value AS details_json
    FROM expenses e LEFT JOIN expense_categories c ON c.id=e.category_id LEFT JOIN accounts a ON a.id=e.account_id
    LEFT JOIN expense_journals j ON j.source_id=e.id LEFT JOIN settings s ON s.key=('cash-expense:' || e.id)
    ${id ? 'WHERE e.id=?' : ''} ORDER BY e.expense_date DESC,e.created_at DESC,e.id DESC`, id ? [id, id] : []);
  return rows.map(row=>({id:row.id,title:row.title,description:row.description,amount:Number(row.amount),expenseDate:row.expense_date,
    status:row.status,categoryId:row.category_id,categoryName:row.category_name,accountId:row.account_id,accountName:row.account_name,
    hasProof:Number(row.has_proof)===1,journalCount:Number(row.journal_count),journalMatches:Number(row.matching_journal_count)===1,
    details:row.details_json ? JSON.parse(row.details_json) as ExpenseDetails : {}}));
}

export async function getExpenseCashTotals(month:string,run:Query=query) {
  const [start,end] = monthBounds(month);
  const rows = await run<{id:string|null;name:string|null;amount:number|string;count:number|string}>(`SELECT c.id,c.name,
    SUM(CASE WHEN l.source_type='EXPENSE_REVERSAL' THEN -l.amount ELSE l.amount END) AS amount,COUNT(*) AS count
    FROM ledger_entries l LEFT JOIN expenses e ON e.id=l.source_id LEFT JOIN expense_categories c ON c.id=e.category_id
    WHERE l.source_type IN ('EXPENSE','EXPENSE_REVERSAL') AND l.entry_date>=? AND l.entry_date<?
    GROUP BY c.id,c.name ORDER BY amount DESC,c.id`,[start,end]);
  return rows.map(row=>({...row,name:row.name || 'Pengeluaran tanpa kategori',amount:Number(row.amount),count:Number(row.count)}));
}

export function parseExpenseProof(value: string) {
  const match = value.match(/^data:(image\/(?:jpeg|png|webp)|application\/pdf);base64,([A-Za-z0-9+/]+={0,2})$/);
  if (!match || match[2].length > Math.ceil(proofMaxBytes / 3) * 4) throw new OperationalError('Gunakan JPG, PNG, WebP, atau PDF maksimal 1,5 MB.', 400);
  const mime = match[1] as keyof typeof proofMimes;
  const bytes = Buffer.from(match[2], 'base64');
  const valid = mime==='image/jpeg' ? bytes.subarray(0,3).toString('hex')==='ffd8ff' :
    mime==='image/png' ? bytes.subarray(0,8).toString('hex')==='89504e470d0a1a0a' :
    mime==='image/webp' ? bytes.subarray(0,4).toString()==='RIFF' && bytes.subarray(8,12).toString()==='WEBP' : bytes.subarray(0,5).toString()==='%PDF-';
  if (!valid || bytes.length > proofMaxBytes || bytes.toString('base64')!==match[2]) throw new OperationalError('Format atau ukuran bukti tidak valid.', 400);
  return {mime, bytes, extension:proofMimes[mime]};
}

export async function getExpenseProof(id: string) {
  const [row] = await query<{receipt_file_url:string|null}>('SELECT receipt_file_url FROM expenses WHERE id=?', [id]);
  return row?.receipt_file_url || null;
}

export interface ExpenseInput {
  categoryId?: string; categoryName?: string; accountId?: string; title: string; amount: number; expenseDate: string;
  description?: string; vendor?: string; receiptFile?: string | null; proofUrl?: string; bookNow?: boolean;
}

function receiptValue(input: Pick<ExpenseInput, 'receiptFile' | 'proofUrl'>) {
  if (input.receiptFile) { parseExpenseProof(input.receiptFile); return input.receiptFile; }
  if (input.receiptFile===null) return null;
  if (input.proofUrl) {
    const url = proofLink(input.proofUrl);
    if (!url || !url.startsWith('https://')) throw new OperationalError('Tautan bukti harus memakai HTTPS.',400);
    return url;
  }
  return undefined;
}

type BalanceRow = {id:string;balance:string|number;is_active:boolean|number;type:string};
async function lockBalances(run: Query, lock: string, ids: (string|null|undefined)[]) {
  const unique = [...new Set(ids.filter((id): id is string => Boolean(id)))].sort();
  return unique.length ? run<BalanceRow>(`SELECT id,balance,is_active,type FROM accounts WHERE id IN (${unique.map(()=>'?').join(',')}) ORDER BY id${lock}`,unique) : [];
}
function activeAccount(accounts: BalanceRow[], id: string) {
  const found = accounts.find(row=>row.id===id && row.is_active && row.type!=='RESERVE');
  if (!found) throw new OperationalError('Pilih rekening kas yang aktif.');
  return Number(found.balance);
}
function requireFunds(available: number, amount: number) {
  if (rounded(available - amount) < 0) throw new OperationalError('Saldo rekening tidak cukup. Periksa jurnal atau pilih rekening lain.');
}
function requirePostedDate(date: string) {
  if (date>jakartaDate()) throw new OperationalError('Tanggal pembayaran tidak boleh melewati hari ini.',400);
}
async function selectCategory(run: Query, input: {categoryId?: string;categoryName?: string}) {
  const categories = await getExpenseCategories(run);
  const category = categories.find(item=>item.id===input.categoryId) ||
    categories.find(item=>input.categoryName && item.name.toLowerCase()===input.categoryName.toLowerCase());
  if (!category) throw new OperationalError('Pilih kategori pengeluaran yang tersedia.',400);
  return category.id;
}
async function getLockedExpense(run: Query, lock: string, id: string) {
  const [row] = await run<ExpenseRecord>('SELECT id,category_id,account_id,title,description,amount,expense_date,status FROM expenses WHERE id=?'+lock,[id]);
  if (!row) throw new OperationalError('Pengeluaran tidak ditemukan.',404);
  return row;
}
async function expenseJournal(run: Query, lock: string, id: string) {
  return run<JournalRecord>("SELECT id,account_id,amount,entry_date,direction FROM ledger_entries WHERE source_id=? AND source_type='EXPENSE' ORDER BY id"+lock,[id]);
}
function singleExpenseJournal(rows: JournalRecord[]) {
  if (rows.length!==1 || rows[0].direction!=='OUT' || !rows[0].account_id) {
    throw new OperationalError('Jurnal lama belum lengkap. Periksa Buku Kas sebelum mengubah pengeluaran ini.');
  }
  return rows[0] as JournalRecord & {account_id:string};
}
async function postExpenseJournal(run: Query, id: string, accountId: string, date: string, amount: number, title: string, actor: UserSession) {
  await run(`INSERT INTO ledger_entries (id,account_id,entry_date,direction,amount,source_type,source_id,description,created_by)
    VALUES (?,?,?,'OUT',?,'EXPENSE',?,?,?)`,[`led-${randomUUID()}`,accountId,date,amount,id,title,actor.id]);
  await run('UPDATE accounts SET balance=balance-? WHERE id=?',[amount,accountId]);
}

async function insertExpense(run: Query, lock: string, actor: UserSession, input: ExpenseInput, details: ExpenseDetails, id: string) {
  const categoryId = await selectCategory(run,input);
  const accountId = input.accountId || (await getAccounts(run))[0]?.id;
  if (!accountId) throw new OperationalError('Siapkan rekening kas di Buku Kas terlebih dahulu.');
  const book = input.bookNow!==false;
  const balance = activeAccount(await lockBalances(run,lock,[accountId]),accountId);
  if (book) { requirePostedDate(input.expenseDate); requireFunds(balance,input.amount); }
  const status = book ? 'APPROVED' : 'PENDING';
  await run(`INSERT INTO expenses (id,community_id,category_id,account_id,title,description,amount,expense_date,receipt_file_url,recorded_by,approved_by,status)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,[id,community,categoryId,accountId,input.title,input.description || null,input.amount,input.expenseDate,receiptValue(input) || null,actor.id,book ? actor.id : null,status]);
  const metadata = {...details,vendor:input.vendor || details.vendor};
  if (Object.values(metadata).some(Boolean)) await putCashSetting(run,detailsKey(id),metadata,'Rincian internal pengeluaran');
  if (book) await postExpenseJournal(run,id,accountId,input.expenseDate,input.amount,input.title,actor);
  await operationalAudit(run,actor,book?'expense.record':'expense.draft','EXPENSE',id,{title:input.title,categoryId,accountId,amount:input.amount,date:input.expenseDate,status});
  return {id,status};
}

export async function recordExpense(input: ExpenseInput, actor: UserSession, details: ExpenseDetails = {}) {
  const id = `exp-${randomUUID()}`;
  return writeTransaction(async (run,lock)=>{
    if (details.projectId && !await readCashSetting(run,projectKey(details.projectId))) throw new OperationalError('Proyek tidak ditemukan.',404);
    return insertExpense(run,lock,actor,input,details,id);
  });
}

export async function updateExpense(id: string, patch: Partial<ExpenseInput> & { recipientName?:string; aidType?:AidType; memo?:string }, actor: UserSession) {
  return writeTransaction(async (run,lock)=>{
    const before = await getLockedExpense(run,lock,id);
    if (!['APPROVED','PENDING'].includes(before.status)) throw new OperationalError('Pengeluaran ini tidak dapat diubah.');
    const existingDetails = await readCashSetting<ExpenseDetails>(run,detailsKey(id)) || {};
    if (!existingDetails.aidType && (patch.aidType || patch.recipientName!==undefined || patch.memo!==undefined)) throw new OperationalError('Rincian bantuan hanya berlaku untuk bantuan sosial.',400);
    const details = {...existingDetails, ...Object.fromEntries(Object.entries({vendor:patch.vendor,recipientName:patch.recipientName,aidType:patch.aidType,memo:patch.memo}).filter(([,value])=>value!==undefined))};
    const title = details.aidType ? `Bantuan sosial · ${aidTypes[details.aidType]}` : patch.title ?? before.title;
    const description = details.aidType ? null : patch.description===undefined ? before.description : patch.description || null;
    const categoryId = patch.categoryId || patch.categoryName ? await selectCategory(run,patch) : before.category_id;
    const accountId = patch.accountId || before.account_id;
    if (!accountId || !categoryId) throw new OperationalError('Pilih rekening dan kategori pengeluaran.',400);
    const amount = patch.amount ?? Number(before.amount);
    const date = patch.expenseDate ?? before.expense_date;
    const links = await expenseJournal(run,lock,id);
    if (before.status==='PENDING' && links.length) throw new OperationalError('Draf sudah memiliki jurnal. Periksa Buku Kas.');
    const posted = before.status==='APPROVED' ? singleExpenseJournal(links) : null;
    const accounts = await lockBalances(run,lock,[accountId,posted?.account_id]);
    const balance = activeAccount(accounts,accountId);
    if (posted) {
      requirePostedDate(date);
      const available = balance + (posted.account_id===accountId ? Number(posted.amount) : 0);
      if (posted.account_id!==accountId || Number(posted.amount)!==amount) requireFunds(available,amount);
      if (posted.account_id===accountId) {
        await run('UPDATE accounts SET balance=balance+? WHERE id=?',[rounded(Number(posted.amount)-amount),accountId]);
      } else {
        await run('UPDATE accounts SET balance=balance+? WHERE id=?',[Number(posted.amount),posted.account_id]);
        await run('UPDATE accounts SET balance=balance-? WHERE id=?',[amount,accountId]);
      }
      await run('UPDATE ledger_entries SET account_id=?,entry_date=?,amount=?,description=? WHERE id=?',[accountId,date,amount,title,posted.id]);
    }
    const receipt = receiptValue(patch);
    await run(`UPDATE expenses SET category_id=?,account_id=?,title=?,description=?,amount=?,expense_date=?${receipt!==undefined?',receipt_file_url=?':''} WHERE id=?`,
      [categoryId,accountId,title,description,amount,date,...(receipt!==undefined?[receipt]:[]),id]);
    if (Object.keys(details).length) await putCashSetting(run,detailsKey(id),details,'Rincian internal pengeluaran');
    await operationalAudit(run,actor,'expense.update','EXPENSE',id,{previous:{accountId:before.account_id,amount:Number(before.amount),date:before.expense_date,title:before.title,bookedAmount:posted ? Number(posted.amount) : null},accountId,amount,date,title});
    return {id,status:before.status};
  });
}

export async function bookExpense(id: string, actor: UserSession) {
  return writeTransaction(async (run,lock)=>{
    const row = await getLockedExpense(run,lock,id);
    if (row.status!=='PENDING' || !row.account_id || !row.category_id || (await expenseJournal(run,lock,id)).length) throw new OperationalError('Hanya draf dengan rekening dan kategori yang dapat dibukukan.');
    requirePostedDate(row.expense_date);
    const amount = Number(row.amount);
    requireFunds(activeAccount(await lockBalances(run,lock,[row.account_id]),row.account_id),amount);
    await postExpenseJournal(run,id,row.account_id,row.expense_date,amount,row.title,actor);
    await run("UPDATE expenses SET status='APPROVED',approved_by=? WHERE id=?",[actor.id,id]);
    await operationalAudit(run,actor,'expense.book','EXPENSE',id,{accountId:row.account_id,amount,date:row.expense_date});
    return {id,status:'APPROVED'};
  });
}

export async function cancelExpenses(ids: string[], reason: string, actor: UserSession) {
  return writeTransaction(async (run,lock)=>{
    const unique = [...new Set(ids)].sort();
    const records: {row:ExpenseRecord;posted:(JournalRecord & {account_id:string})|null}[] = [];
    for (const id of unique) {
      const row = await getLockedExpense(run,lock,id);
      if (!['APPROVED','PENDING'].includes(row.status)) throw new OperationalError('Pengeluaran sudah dibatalkan atau tidak dapat dibatalkan.');
      const links = await expenseJournal(run,lock,id);
      if (row.status==='PENDING' && links.length) throw new OperationalError('Draf sudah memiliki jurnal. Periksa Buku Kas.');
      records.push({row,posted:row.status==='APPROVED' ? singleExpenseJournal(links) : null});
    }
    await lockBalances(run,lock,records.map(item=>item.posted?.account_id));
    for (const {row,posted} of records) {
      if (posted) {
        await run(`INSERT INTO ledger_entries (id,account_id,entry_date,direction,amount,source_type,source_id,description,created_by)
          VALUES (?,?,?,'IN',?,'EXPENSE_REVERSAL',?,?,?)`,[`led-${randomUUID()}`,posted.account_id,jakartaDate(),Number(posted.amount),row.id,`Pembatalan: ${row.title}`,actor.id]);
        await run('UPDATE accounts SET balance=balance+? WHERE id=?',[Number(posted.amount),posted.account_id]);
      }
      await run("UPDATE expenses SET status='CANCELLED' WHERE id=?",[row.id]);
      await operationalAudit(run,actor,'expense.cancel','EXPENSE',row.id,{reason,title:row.title,amount:Number(row.amount),refunded:posted ? Number(posted.amount) : 0});
    }
    return {ids:unique,count:unique.length};
  });
}

type StoredProject = Omit<FacilityProject,'actualSpent'>;
export async function getFacilityProjects(expenses: ExpenseRow[]): Promise<FacilityProject[]> {
  const rows = await query<{value:string}>("SELECT value FROM settings WHERE key LIKE 'cash-project:%' ORDER BY key");
  const totals = new Map<string,number>();
  for (const expense of expenses) {
    const id = expense.details.projectId;
    if (id && expense.status==='APPROVED' && expense.journalMatches) totals.set(id,rounded((totals.get(id) || 0)+expense.amount));
  }
  return rows.map(({value})=>{
    const project = JSON.parse(value) as StoredProject;
    return {...project,actualSpent:totals.get(project.id) || 0};
  }).sort((a,b)=>b.startDate.localeCompare(a.startDate) || a.projectName.localeCompare(b.projectName));
}

export async function saveFacilityProject(input: Omit<StoredProject,'id'> & {id?:string}, actor: UserSession) {
  return writeTransaction(async (run,lock)=>{
    const id = input.id || `prj-${randomUUID()}`;
    if (input.id && !await readCashSetting(run,projectKey(id),lock)) throw new OperationalError('Proyek tidak ditemukan.',404);
    if (input.targetCompletionDate && input.targetCompletionDate<input.startDate) throw new OperationalError('Target selesai harus setelah tanggal mulai.',400);
    if (input.facilityId && !(await run('SELECT id FROM facilities WHERE id=? AND archived_at IS NULL',[input.facilityId])).length) throw new OperationalError('Fasilitas aktif tidak ditemukan.',404);
    const project = {...input,id};
    await putCashSetting(run,projectKey(id),project,'Proyek fasilitas warga');
    await operationalAudit(run,actor,input.id?'facility-project.update':'facility-project.create','FACILITY_PROJECT',id,{...project});
    return project;
  });
}

function configVersion(items: RecurringExpenseConfigItem[]) { return hash(JSON.stringify(items)); }

async function ensureConfigRow(run: Query) {
  await run(`INSERT INTO settings (id,community_id,key,value,description) VALUES (?,?,?,'[]','Rencana pengeluaran rutin')
    ON CONFLICT(key) DO NOTHING`,[`cash-${hash(configKey).slice(0,36)}`,community,configKey]);
}

export async function getRecurringExpensesConfig(run: Query = query, lock = '') {
  const items = await readCashSetting<RecurringExpenseConfigItem[]>(run,configKey,lock) || [];
  if (!Array.isArray(items)) throw new Error('Invalid recurring configuration');
  return {items,version:configVersion(items)};
}

export async function saveRecurringExpensesConfig(items: RecurringExpenseConfigItem[], expectedVersion: string, actor: UserSession) {
  return writeTransaction(async (run,lock)=>{
    await ensureConfigRow(run);
    const before = await getRecurringExpensesConfig(run,lock);
    if (before.version!==expectedVersion) throw new OperationalError('Rencana berubah di perangkat lain. Muat ulang sebelum menyimpan.');
    if (new Set(items.map(item=>item.id)).size!==items.length) throw new OperationalError('Pos rutin duplikat.',400);
    const [categories, accounts] = await Promise.all([getExpenseCategories(run),getAccounts(run)]);
    const next = items.map(item=>{
      const category = categories.find(entry=>entry.id===item.categoryId) || categories.find(entry=>entry.name.toLowerCase()===item.categoryName?.toLowerCase());
      const old = before.items.find(entry=>entry.id===item.id);
      if ((!category || !accounts.some(account=>account.id===item.accountId)) && (!old || old.categoryId!==item.categoryId || old.accountId!==item.accountId)) {
        throw new OperationalError('Pilih rekening dan kategori yang tersedia.',400);
      }
      return {...item,categoryId:category?.id || item.categoryId,categoryName:category?.name || item.categoryName};
    });
    await putCashSetting(run,configKey,next,'Rencana pengeluaran rutin');
    await operationalAudit(run,actor,'expense.recurring.configure','RECURRING_EXPENSE','recurring-config',{count:next.length,active:next.filter(item=>item.isActive).length});
    return {items:next,version:configVersion(next)};
  });
}

async function recurringRows(run: Query, items: RecurringExpenseConfigItem[], month: string): Promise<RecurringPreviewRow[]> {
  const [start,end] = monthBounds(month);
  const [existing,accounts,categories] = await Promise.all([
    run<{id:string;title:string}>('SELECT id,title FROM expenses WHERE expense_date>=? AND expense_date<? ORDER BY id',[start,end]),
    getAccounts(run),getExpenseCategories(run),
  ]);
  const accountNames = new Map(accounts.map(account=>[account.id,account.name]));
  const today = jakartaDate();
  return items.filter(item=>item.isActive && (!(item.frequency && item.frequency!=='MONTHLY') || item.executionMonth===Number(month.slice(5))))
    .map(item=>{
      const id = `exp-r-${hash(item.id+'|'+month).slice(0,32)}`;
      const title = `${item.title} (Bulan ${month})`;
      const date = scheduledExpenseDate(month,item.executionDay);
      const already = existing.find(row=>row.id===id || row.title.trim().toLowerCase()===title.toLowerCase());
      const accountName = accountNames.get(item.accountId);
      const category = categories.some(row=>row.id===item.categoryId || row.name.toLowerCase()===item.categoryName?.toLowerCase());
      return {id,itemId:item.id,title,amount:item.amount,accountName:accountName || 'Rekening tidak aktif',date,
        state:already?'BOOKED':!accountName||!category?'UNAVAILABLE':date>today?'NOT_DUE':'READY',expenseId:already?.id};
    });
}

export async function previewRecurringExpenses(month: string, run: Query = query, config?: Awaited<ReturnType<typeof getRecurringExpensesConfig>>) {
  const saved = config || await getRecurringExpensesConfig(run);
  const rows = await recurringRows(run,saved.items,month);
  return {rows,version:hash(JSON.stringify([month,saved.version,rows])),month};
}

export async function postRecurringExpenses(month: string, itemIds: string[], expectedVersion: string, actor: UserSession) {
  if (month>currentFinanceMonth()) throw new OperationalError('Pilih bulan berjalan atau bulan sebelumnya.',400);
  return writeTransaction(async (run,lock)=>{
    await ensureConfigRow(run);
    const config = await getRecurringExpensesConfig(run,lock);
    const preview = await previewRecurringExpenses(month,run,config);
    if (preview.version!==expectedVersion) throw new OperationalError('Pratinjau berubah. Periksa kembali pos yang akan dicatat.');
    const selected = [...new Set(itemIds)].map(id=>preview.rows.find(row=>row.itemId===id && row.state==='READY'));
    if (selected.some(row=>!row)) throw new OperationalError('Pilih pos yang siap dicatat.',400);
    const planned = selected.map(row=>({row:row!,item:config.items.find(item=>item.id===row!.itemId)!}));
    await lockBalances(run,lock,planned.map(({item})=>item.accountId));
    const created = [];
    for (const {row,item} of planned) {
      created.push(await insertExpense(run,lock,actor,{categoryId:item.categoryId,categoryName:item.categoryName,accountId:item.accountId,
        title:row.title,amount:row.amount,expenseDate:row.date,description:item.description,vendor:item.vendor},
        {recurringId:item.id,recurringMonth:month},row.id));
    }
    return {ids:created.map(item=>item.id),count:created.length,total:rounded(planned.reduce((sum,{row})=>sum+row.amount,0))};
  });
}
