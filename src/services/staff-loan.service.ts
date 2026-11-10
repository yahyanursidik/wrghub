import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { query, readSnapshot, writeTransaction, type Query } from '../db/operational-query';
import { jakartaDate } from '../lib/billing-data';
import { monthBounds } from '../lib/cash-data';
import { isCashAccount, isRepayable, type InstallmentRecord, type LoanAction, type LoanDisbursement, type LoanPolicyConfig,
  type LoanStatus, type PayrollExpense, type StaffLoan } from '../lib/staff-loan-data';
import { RESERVE_ACCOUNT } from '../lib/planning-data';
import type { UserSession } from '../types/auth';
import { dateField, idField, operationalAudit, OperationalError, textField } from './operational-mutation';
import { payrollInstallments, readLoanLink, savePayrollInstallments, staffInstallmentKey, writeLoanLink } from './staff-loan-links';

const cash = z.number().int().nonnegative().max(1e12);
const principal = z.number().int().positive().max(1e12);
const fields = z.object({
  staffName:textField().min(2),staffRole:z.enum(['SATPAM','PETUGAS_KEBERSIHAN','PETUGAS_TAMAN','TEKNISI']),staffPhone:textField(50),staffSince:z.union([dateField,z.literal('')]),
  baseSalary:cash,loanType:z.enum(['KASBON_CICILAN','GAJI_DI_AWAL','DANA_DARURAT']),totalLoanAmount:principal,
  monthlyDeduction:principal,tenorMonths:z.number().int().min(1).max(60),
  loanDate:dateField,purpose:textField(1000).min(3),notes:textField(2000),
});
export const loanInput = fields.extend({staffPhone:fields.shape.staffPhone.default(''),staffSince:fields.shape.staffSince.default(''),
  baseSalary:cash.default(0),loanType:fields.shape.loanType.default('KASBON_CICILAN'),notes:fields.shape.notes.default('')});
export const loanCreation = loanInput.extend({requestId:idField.optional()});
const action = z.object({at:z.string(),by:z.string(),reason:z.string()});
const storedLoan = loanInput.extend({
  disbursementSource:textField(160).default(''),decision:action.optional(), archived:action.optional(),
  disbursement:z.object({accountId:idField,accountName:z.string(),date:dateField,journalId:idField,
    reversal:action.extend({journalId:idField}).optional()}).optional(),
});
export const loanUpdate = fields.partial().extend({loanId:idField});
const loanIdInput = z.object({loanId:idField});
export const loanDecision = loanIdInput.extend({decision:z.enum(['APPROVE','REJECT']),notes:textField(1000).optional()});
export const loanArchive = loanIdInput.extend({reason:textField(1000).min(3)});
export const loanDisburse = loanIdInput.extend({accountId:idField,date:dateField});
export const installmentInput = loanIdInput.extend({
  installmentAmount:principal,paymentMethod:z.enum(['POTONG_GAJI','TUNAI_CASH','TRANSFER_BCA','TRANSFER_BANK','EWALLET']),
  installmentDate:dateField,notes:textField(1000).optional(),requestId:idField.optional(),accountId:idField.optional(),
  expenseId:idField.optional(),netPayrollConfirmed:z.literal(true).optional(),
});
export const loanReverse = loanArchive.extend({installmentId:idField.optional()});
export const loanPolicy = z.object({
  maxLoanRatio:z.number().min(0).max(100),maxTenorMonths:z.number().int().min(1).max(60),minWorkingMonths:z.number().int().min(0).max(600),
  approvalMode:z.enum(['LEADERSHIP','FINANCE']),defaultAccountId:z.union([idField,z.literal('')]),repaymentNotes:textField(3000),
});
const defaultPolicy:LoanPolicyConfig={maxLoanRatio:50,maxTenorMonths:12,minWorkingMonths:0,approvalMode:'LEADERSHIP',defaultAccountId:'',repaymentNotes:''};
const policyKey='staff_loan_policy_v1';
export const isLoanLeader = (role:UserSession['role']) => role==='SUPER_ADMIN' || role==='CHAIRMAN';
export const canApproveLoan = (role:UserSession['role'],policy:LoanPolicyConfig) => isLoanLeader(role) || (role==='TREASURER' && policy.approvalMode==='FINANCE');
type LoanRow={id:string;payload:string;amount:number|string;status:'PENDING_APPROVAL'|'ACTIVE_INSTALLMENT'|'REJECTED';approved_by:string|null;archived_at:string|null};
type InstallmentRow={id:string;loan_id:string;installment_no:number;amount:number|string;payment_date:string;payment_method:InstallmentRecord['paymentMethod'];received_by:string;notes:string|null};
type InstallmentLink={id:string;accountId?:string;accountName?:string;journalId?:string;expenseId?:string;reversal?:LoanAction & {journalId?:string}};
type LockedAccount={id:string;name:string;type:string;balance:string|number;is_active:boolean|number};
type PostedExpense={id:string;expense_date:string;status:string;amount:number|string;account_id:string|null};
const loanSelect='SELECT id,payload,amount,status,approved_by,archived_at FROM staff_loans';
const installmentColumns='id,loan_id,installment_no,amount,payment_date,payment_method,received_by,notes';

function dueDate(date:string,months:number) {
  const original=new Date(date+'T00:00:00.000Z');
  const day=original.getUTCDate();
  original.setUTCDate(1);
  original.setUTCMonth(original.getUTCMonth()+months);
  const last=new Date(Date.UTC(original.getUTCFullYear(),original.getUTCMonth()+1,0)).getUTCDate();
  original.setUTCDate(Math.min(day,last));
  return original.toISOString().slice(0,10);
}
function mapInstallment(row:InstallmentRow,link?:InstallmentLink):InstallmentRecord {
  return {id:row.id,installmentNo:row.installment_no,amount:Number(row.amount),paymentDate:row.payment_date,paymentMethod:row.payment_method,
    receivedBy:row.received_by,notes:row.notes || undefined,accountName:link?.accountName,journalId:link?.journalId,expenseId:link?.expenseId,
    legacy:!link,reversal:link?.reversal};
}
function mapLoan(row:LoanRow,records:InstallmentRow[],links:Map<string,InstallmentLink>):StaffLoan {
  const {disbursementSource, ...data}=storedLoan.parse(JSON.parse(row.payload));
  const installments=records.map(item=>mapInstallment(item,links.get(item.id)));
  const paidAmount=installments.reduce((sum,item)=>sum+(item.reversal?0:item.amount),0);
  const remainingBalance=Number(row.amount)-paidAmount;
  const deadline=dueDate(data.disbursement?.date || data.loanDate,data.tenorMonths);
  const legacyDisbursement=row.status==='ACTIVE_INSTALLMENT' && !data.decision && !data.disbursement;
  const status:LoanStatus=row.archived_at?'ARCHIVED':row.status==='REJECTED'?'REJECTED':row.status==='PENDING_APPROVAL'?'PENDING_APPROVAL'
    :data.disbursement?.reversal?'CANCELLED':!data.disbursement && !legacyDisbursement?'AWAITING_DISBURSEMENT'
    :remainingBalance<=0?'PAID_OFF':deadline<jakartaDate()?'OVERDUE':'ACTIVE_INSTALLMENT';
  return {...data,id:row.id,legacySource:disbursementSource,legacyDisbursement,paidAmount,remainingBalance:Math.max(0,remainingBalance),dueDate:deadline,
    approvedBy:row.approved_by || '',status,installments};
}
async function installmentsFor(run:Query,loanId?:string) {
  return run<InstallmentRow>('SELECT '+installmentColumns+' FROM staff_loan_installments '+(loanId?'WHERE loan_id=? ':'')+'ORDER BY installment_no,id',loanId?[loanId]:[]);
}
async function getLinks(run:Query,records?:InstallmentRow[]) {
  if(records && !records.length) return new Map<string,InstallmentLink>();
  const keys=records?.map(item=>staffInstallmentKey(item.id));
  const rows=keys
    ? (await Promise.all(Array.from({length:Math.ceil(keys.length/400)},(_,index)=>{
      const batch=keys.slice(index*400,(index+1)*400);
      return run<{value:string}>('SELECT value FROM settings WHERE key IN ('+batch.map(()=>'?').join(',')+')',batch);
    }))).flat()
    : await run<{value:string}>("SELECT value FROM settings WHERE key LIKE 'sl-i-%'");
  return new Map(rows.map(row=>{const item=JSON.parse(row.value) as InstallmentLink;return [item.id,item];}));
}
async function one(run:Query,row:LoanRow|string) {
  const found=typeof row==='string'?(await run<LoanRow>(loanSelect+' WHERE id=?',[row]))[0]:row;
  if(!found) throw new OperationalError('Kasbon tidak ditemukan.',404);
  const installments=await installmentsFor(run,found.id);
  return mapLoan(found,installments,await getLinks(run,installments));
}
async function lockedLoan(run:Query,lock:string,id:string) {
  const [row]=await run<LoanRow>(loanSelect+' WHERE id=? AND archived_at IS NULL'+lock,[id]);
  if(!row) throw new OperationalError('Kasbon tidak ditemukan.',404);
  return row;
}
export async function listStaffLoans(includePersonal=true) {
  const [rows,installments,links]=await readSnapshot(run=>Promise.all([
    run<LoanRow>(loanSelect+' ORDER BY created_at DESC,id'),installmentsFor(run),getLinks(run),
  ]));
  const byLoan=new Map<string,InstallmentRow[]>();
  for(const item of installments) {
    const group=byLoan.get(item.loan_id) || [];
    group.push(item); byLoan.set(item.loan_id,group);
  }
  return rows.map(row=>{
    const loan=mapLoan(row,byLoan.get(row.id) || [],links);
    return includePersonal?loan:{...loan,staffPhone:'',staffSince:'',baseSalary:null,notes:'',purpose:'',legacySource:'',
      installments:loan.installments.map(item=>({...item,notes:undefined}))};
  });
}
export async function getLoanPolicy(run:Query=query) {
  const saved=await readLoanLink<Partial<LoanPolicyConfig>>(run,policyKey);
  return loanPolicy.parse({...defaultPolicy,...saved});
}
export async function saveLoanPolicy(data:LoanPolicyConfig,actor:UserSession) {
  if(!isLoanLeader(actor.role)) throw new OperationalError('Kebijakan hanya dapat diubah oleh Ketua atau Admin.',403);
  return writeTransaction(async(run,lock)=>{
    if(data.defaultAccountId) await cashAccount(run,lock,data.defaultAccountId);
    await writeLoanLink(run,policyKey,data,'Kebijakan kasbon');
    await operationalAudit(run,actor,'loan.policy','STAFF_LOAN_POLICY',policyKey,data);
    return data;
  });
}
async function validateTerms(run:Query,data:z.output<typeof loanInput>,knownPolicy?:LoanPolicyConfig) {
  const policy=knownPolicy || await getLoanPolicy(run);
  if(data.loanDate>jakartaDate()) throw new OperationalError('Tanggal pengajuan tidak boleh melewati hari ini.',400);
  if(data.staffSince && data.staffSince>data.loanDate) throw new OperationalError('Tanggal mulai kerja harus sebelum atau sama dengan pengajuan.',400);
  if(policy.minWorkingMonths && (!data.staffSince || dueDate(data.staffSince,policy.minWorkingMonths)>data.loanDate))
    throw new OperationalError('Masa kerja belum memenuhi kebijakan kasbon.');
  if(data.tenorMonths>policy.maxTenorMonths) throw new OperationalError('Tenor melebihi batas kebijakan kasbon.');
  if(data.baseSalary<=0) throw new OperationalError('Isi gaji pokok untuk memeriksa batas kasbon.');
  if(data.totalLoanAmount>data.baseSalary*policy.maxLoanRatio/100) throw new OperationalError('Nominal melebihi batas kasbon terhadap gaji.');
  if(data.monthlyDeduction>data.totalLoanAmount || data.monthlyDeduction>data.baseSalary || data.monthlyDeduction*data.tenorMonths<data.totalLoanAmount)
    throw new OperationalError('Angsuran dan tenor tidak sesuai dengan pokok kasbon.');
}
export async function createLoan({requestId,...data}:z.output<typeof loanCreation>,actor:UserSession) {
  return writeTransaction(async run=>{
    const id='loan-'+(requestId || randomUUID());
    if(id.length>64) throw new OperationalError('Identitas pengajuan tidak valid.',400);
    const previous=async (row?:LoanRow)=>{
      if(!row || JSON.stringify(loanInput.parse(JSON.parse(row.payload)))!==JSON.stringify(loanInput.parse(data)))
        throw new OperationalError('Identitas pengajuan telah digunakan.');
      return one(run,row);
    };
    if(requestId) {
      const [found]=await run<LoanRow>(loanSelect+' WHERE id=?',[id]);
      if(found) return previous(found);
    }
    await validateTerms(run,data);
    const inserted=await run<{id:string}>("INSERT INTO staff_loans (id,payload,amount,status,created_at) VALUES (?,?,?,'PENDING_APPROVAL',?) ON CONFLICT(id) DO NOTHING RETURNING id",
      [id,JSON.stringify(data),data.totalLoanAmount,new Date().toISOString()]);
    if(!inserted.length) return previous((await run<LoanRow>(loanSelect+' WHERE id=?',[id]))[0]);
    await operationalAudit(run,actor,'loan.create','STAFF_LOAN',id,{amount:data.totalLoanAmount});
    return one(run,id);
  });
}
export async function updateLoan({loanId,...data}:z.output<typeof loanUpdate>,actor:UserSession) {
  return writeTransaction(async(run,lock)=>{
    const row=await lockedLoan(run,lock,loanId);
    if(row.status!=='PENDING_APPROVAL') throw new OperationalError('Hanya pengajuan menunggu yang dapat diubah.');
    const updated=storedLoan.parse({...JSON.parse(row.payload),...data});
    await validateTerms(run,updated);
    await run('UPDATE staff_loans SET payload=?,amount=? WHERE id=?',[JSON.stringify(updated),updated.totalLoanAmount,loanId]);
    await operationalAudit(run,actor,'loan.update','STAFF_LOAN',loanId,{amount:updated.totalLoanAmount});
    return one(run,loanId);
  });
}
const auditAction = (actor:UserSession,reason=''):LoanAction => ({at:new Date().toISOString(),by:actor.fullName,reason});
export async function decideLoan(data:z.output<typeof loanDecision>,actor:UserSession) {
  return writeTransaction(async(run,lock)=>{
    const policy=await getLoanPolicy(run);
    if(!canApproveLoan(actor.role,policy)) throw new OperationalError('Persetujuan mengikuti peran dalam kebijakan kasbon.',403);
    const row=await lockedLoan(run,lock,data.loanId);
    if(row.status!=='PENDING_APPROVAL') throw new OperationalError('Pengajuan sudah diproses.');
    const payload=storedLoan.parse(JSON.parse(row.payload));
    const approved=data.decision==='APPROVE';
    if(approved) await validateTerms(run,payload,policy);
    if(!approved && (data.notes?.length || 0)<3) throw new OperationalError('Isi alasan penolakan.',400);
    const status=approved?'ACTIVE_INSTALLMENT':'REJECTED';
    const decision=auditAction(actor,data.notes);
    await run('UPDATE staff_loans SET status=?,approved_by=?,payload=? WHERE id=?',[status,approved?actor.fullName:null,JSON.stringify({...payload,decision}),data.loanId]);
    await operationalAudit(run,actor,'loan.decision','STAFF_LOAN',data.loanId,{status,reason:decision.reason});
    return {loan:await one(run,data.loanId)};
  });
}
export async function archiveLoan(data:z.output<typeof loanArchive>,actor:UserSession) {
  return writeTransaction(async(run,lock)=>{
    const row=await lockedLoan(run,lock,data.loanId);
    const payload=storedLoan.parse(JSON.parse(row.payload));
    if(row.status!=='PENDING_APPROVAL') {
      if(row.status!=='ACTIVE_INSTALLMENT' || !payload.decision || payload.disbursement)
        throw new OperationalError('Pengajuan ini tidak dapat ditarik.');
      if(!canApproveLoan(actor.role,await getLoanPolicy(run)))
        throw new OperationalError('Hanya pemberi persetujuan yang dapat menarik pengajuan yang sudah disetujui.',403);
    }
    const archived=auditAction(actor,data.reason);
    await run('UPDATE staff_loans SET archived_at=?,payload=? WHERE id=?',[archived.at,JSON.stringify({...JSON.parse(row.payload),archived}),row.id]);
    await operationalAudit(run,actor,'loan.archive','STAFF_LOAN',row.id,{reason:archived.reason});
    return {id:row.id,loan:await one(run,row.id)};
  });
}
async function cashAccount(run:Query,lock:string,id:string,active=true) {
  const [account]=await run<LockedAccount>('SELECT id,name,type,balance,is_active FROM accounts WHERE id=?'+lock,[id]);
  if(!account || (active && !account.is_active) || account.type===RESERVE_ACCOUNT) throw new OperationalError('Pilih rekening kas operasional yang tersedia.');
  return account;
}
function requireDate(date:string,first:string) {
  if(date<first || date>jakartaDate()) throw new OperationalError('Tanggal transaksi harus antara '+first+' dan hari ini.',400);
}
async function postJournal(run:Query,account:LockedAccount,actor:UserSession,entry:{date:string;amount:number;direction:'IN'|'OUT';source:string;sourceId:string;description:string}) {
  const delta=entry.direction==='IN'?entry.amount:-entry.amount;
  if(delta<0 && Number(account.balance)<entry.amount) throw new OperationalError('Saldo rekening tidak cukup.');
  const id='led-'+randomUUID();
  await run('INSERT INTO ledger_entries (id,account_id,entry_date,direction,amount,source_type,source_id,description,created_by) VALUES (?,?,?,?,?,?,?,?,?)',
    [id,account.id,entry.date,entry.direction,entry.amount,entry.source,entry.sourceId,entry.description,actor.id]);
  await run('UPDATE accounts SET balance=balance+? WHERE id=?',[delta,account.id]);
  return id;
}
export async function disburseLoan(data:z.output<typeof loanDisburse>,actor:UserSession) {
  return writeTransaction(async(run,lock)=>{
    const row=await lockedLoan(run,lock,data.loanId);
    const payload=storedLoan.parse(JSON.parse(row.payload));
    if(payload.disbursement && !payload.disbursement.reversal && payload.disbursement.accountId===data.accountId && payload.disbursement.date===data.date)
      return {loan:await one(run,row)};
    if(row.status!=='ACTIVE_INSTALLMENT' || !payload.decision || payload.disbursement) throw new OperationalError('Pengajuan belum disetujui atau pencairannya sudah tercatat.');
    requireDate(data.date,payload.loanDate);
    const account=await cashAccount(run,lock,data.accountId);
    const journalId=await postJournal(run,account,actor,{date:data.date,amount:Number(row.amount),direction:'OUT',
      source:'STAFF_LOAN_DISBURSEMENT',sourceId:row.id,description:'Pencairan kasbon petugas'});
    const disbursement:LoanDisbursement={accountId:account.id,accountName:account.name,date:data.date,journalId};
    await run('UPDATE staff_loans SET payload=? WHERE id=?',[JSON.stringify({...payload,disbursement}),row.id]);
    await operationalAudit(run,actor,'loan.disburse','STAFF_LOAN',row.id,{...disbursement,amount:Number(row.amount)});
    return {loan:await one(run,row.id)};
  });
}
async function lockedExpense(run:Query,lock:string,id:string) {
  const [row]=await run<PostedExpense>('SELECT id,expense_date,status,amount,account_id FROM expenses WHERE id=?'+lock,[id]);
  if(!row) throw new OperationalError('Jurnal gaji tidak ditemukan.',404);
  return row;
}
export async function listPayrollExpenses(month:string):Promise<PayrollExpense[]> {
  const [start,end]=monthBounds(month);
  const rows=await query<{id:string;title:string;expense_date:string;amount:number|string;account_name:string}>(
    "SELECT e.id,e.title,e.expense_date,e.amount,a.name AS account_name FROM expenses e JOIN accounts a ON a.id=e.account_id "+
    "WHERE e.status='APPROVED' AND e.expense_date>=? AND e.expense_date<? "+
    "AND 1=(SELECT COUNT(*) FROM ledger_entries l WHERE l.source_id=e.id AND l.source_type='EXPENSE') "+
    "AND EXISTS(SELECT 1 FROM ledger_entries l WHERE l.source_id=e.id AND l.source_type='EXPENSE' AND l.direction='OUT' "+
    "AND l.account_id=e.account_id AND l.entry_date=e.expense_date AND l.amount=e.amount) ORDER BY e.expense_date DESC,e.title,e.id",[start,end]);
  return rows.map(row=>({id:row.id,title:row.title,date:row.expense_date,amount:Number(row.amount),accountName:row.account_name}));
}
export async function recordInstallment(data:z.output<typeof installmentInput>,actor:UserSession) {
  return writeTransaction(async(run,lock)=>{
    const row=await lockedLoan(run,lock,data.loanId);
    const loan=await one(run,row);
    const id='inst-'+(data.requestId || randomUUID());
    if(id.length>64) throw new OperationalError('Identitas angsuran tidak valid.',400);
    const [existing]=await run<InstallmentRow>('SELECT '+installmentColumns+' FROM staff_loan_installments WHERE id=?',[id]);
    if(existing) {
      const link=await readLoanLink<InstallmentLink>(run,staffInstallmentKey(id));
      if(existing.loan_id!==row.id || Number(existing.amount)!==data.installmentAmount || existing.payment_method!==data.paymentMethod ||
        existing.payment_date!==data.installmentDate || (existing.notes || '')!==(data.notes || '') || link?.accountId!==data.accountId || link?.expenseId!==data.expenseId)
        throw new OperationalError('Identitas angsuran telah digunakan.');
      return {loan,installment:mapInstallment(existing,link)};
    }
    if(!isRepayable(loan)) throw new OperationalError('Cairkan kasbon yang disetujui sebelum mencatat angsuran.');
    requireDate(data.installmentDate,loan.disbursement?.date || loan.loanDate);
    if(data.installmentAmount>loan.remainingBalance) throw new OperationalError('Angsuran melebihi sisa kasbon.');
    let link:InstallmentLink={id};
    if(data.paymentMethod==='POTONG_GAJI') {
      if(!data.expenseId || !data.netPayrollConfirmed || data.accountId) throw new OperationalError('Pilih jurnal gaji bersih dan konfirmasi potongan.',400);
      const period=data.installmentDate.slice(0,7);
      if(loan.installments.some(item=>!item.reversal && item.paymentMethod==='POTONG_GAJI' && item.paymentDate.startsWith(period)))
        throw new OperationalError('Potongan kasbon ini sudah dicatat untuk bulan tersebut.');
      if(data.installmentAmount>loan.monthlyDeduction) throw new OperationalError('Potongan melebihi angsuran yang disetujui.');
      const expense=await lockedExpense(run,lock,data.expenseId);
      const [journal]=await run<{total:number|string;matched:number|string}>(
        "SELECT COUNT(*) AS total,COALESCE(SUM(CASE WHEN direction='OUT' AND account_id=? AND entry_date=? AND amount=? THEN 1 ELSE 0 END),0) AS matched "+
        "FROM ledger_entries WHERE source_type='EXPENSE' AND source_id=?",[expense.account_id,expense.expense_date,Number(expense.amount),expense.id]);
      if(expense.status!=='APPROVED' || expense.expense_date!==data.installmentDate || Number(journal.total)!==1 || Number(journal.matched)!==1)
        throw new OperationalError('Pilih pengeluaran gaji bersih yang sudah dibukukan pada tanggal tersebut.');
      const linked=await payrollInstallments(run,expense.id);
      await savePayrollInstallments(run,expense.id,[...linked,id]);
      link={id,expenseId:expense.id};
    } else {
      if(!data.accountId || data.expenseId || data.netPayrollConfirmed) throw new OperationalError('Pilih rekening penerima angsuran.',400);
      const account=await cashAccount(run,lock,data.accountId);
      if((data.paymentMethod==='TUNAI_CASH')!==isCashAccount(account.type)) throw new OperationalError('Metode pembayaran tidak sesuai dengan jenis rekening.',400);
      const journalId=await postJournal(run,account,actor,{date:data.installmentDate,amount:data.installmentAmount,direction:'IN',
        source:'STAFF_LOAN_INSTALLMENT',sourceId:id,description:'Pelunasan pokok kasbon petugas'});
      link={id,accountId:account.id,accountName:account.name,journalId};
    }
    const [saved]=await run<InstallmentRow>('INSERT INTO staff_loan_installments ('+installmentColumns+') VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING RETURNING '+installmentColumns,
      [id,row.id,loan.installments.length+1,data.installmentAmount,data.installmentDate,data.paymentMethod,actor.fullName,data.notes || null]);
    if(!saved) throw new OperationalError('Identitas angsuran telah digunakan.');
    await writeLoanLink(run,staffInstallmentKey(id),link,'Tautan jurnal angsuran kasbon');
    await operationalAudit(run,actor,'loan.installment','STAFF_LOAN',row.id,{installmentId:id,amount:data.installmentAmount,...link});
    return {loan:await one(run,row),installment:mapInstallment(saved,link)};
  });
}
export async function reverseLoanMovement(data:z.output<typeof loanReverse>,actor:UserSession) {
  return writeTransaction(async(run,lock)=>{
    const row=await lockedLoan(run,lock,data.loanId);
    const loan=await one(run,row);
    const reversal=auditAction(actor,data.reason);
    const today=jakartaDate();
    if(data.installmentId) {
      const item=loan.installments.find(item=>item.id===data.installmentId);
      const key=staffInstallmentKey(data.installmentId);
      const link=await readLoanLink<InstallmentLink>(run,key);
      if(!item || !link || link.reversal) throw new OperationalError('Angsuran tidak tertaut atau sudah dibalik.');
      let journalId:string|undefined;
      if(link.accountId) {
        const account=await cashAccount(run,lock,link.accountId,false);
        journalId=await postJournal(run,account,actor,{date:today,amount:item.amount,direction:'OUT',
          source:'STAFF_LOAN_INSTALLMENT_REVERSAL',sourceId:item.id,description:'Pembalikan pelunasan kasbon'});
      } else if(link.expenseId) {
        await lockedExpense(run,lock,link.expenseId);
        const linked=await payrollInstallments(run,link.expenseId);
        await savePayrollInstallments(run,link.expenseId,linked.filter(id=>id!==item.id));
      }
      await writeLoanLink(run,key,{...link,reversal:{...reversal,journalId}},'Tautan jurnal angsuran kasbon');
      await operationalAudit(run,actor,'loan.installment.reverse','STAFF_LOAN',row.id,{installmentId:item.id,reason:data.reason,journalId});
    } else {
      const payout=loan.disbursement;
      if(!payout || payout.reversal || loan.installments.some(item=>!item.reversal))
        throw new OperationalError('Pencairan hanya dapat dibalik setelah semua angsuran terkait dibalik.');
      const account=await cashAccount(run,lock,payout.accountId,false);
      const journalId=await postJournal(run,account,actor,{date:today,amount:Number(row.amount),direction:'IN',
        source:'STAFF_LOAN_DISBURSEMENT_REVERSAL',sourceId:row.id,description:'Pembalikan pencairan kasbon'});
      const payload=storedLoan.parse(JSON.parse(row.payload));
      await run('UPDATE staff_loans SET payload=? WHERE id=?',[JSON.stringify({...payload,disbursement:{...payout,reversal:{...reversal,journalId}}}),row.id]);
      await operationalAudit(run,actor,'loan.disburse.reverse','STAFF_LOAN',row.id,{reason:data.reason,journalId});
    }
    return {loan:await one(run,row.id)};
  });
}
