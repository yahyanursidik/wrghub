import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { query, writeTransaction, type Query } from '../db/operational-query';
import type { UserSession } from '../types/auth';
import { dateField, idField, operationalAudit, OperationalError, textField } from './operational-mutation';

const cash = z.number().int().nonnegative().max(1e12);
const principal = z.number().int().positive().max(1e12);
const roles = ['SATPAM','PETUGAS_KEBERSIHAN','PETUGAS_TAMAN','TEKNISI'] as const;
const types = ['KASBON_CICILAN','GAJI_DI_AWAL','DANA_DARURAT'] as const;
const methods = ['POTONG_GAJI','TUNAI_CASH','TRANSFER_BCA','TRANSFER_BANK','EWALLET'] as const;
export const loanInput = z.object({
  staffName:textField().min(2),staffRole:z.enum(roles),staffPhone:textField(50).default(''),baseSalary:cash.default(0),
  loanType:z.enum(types).default('KASBON_CICILAN'),totalLoanAmount:principal,monthlyDeduction:principal,tenorMonths:z.number().int().min(1).max(60),
  loanDate:dateField,purpose:textField(1000).min(3),disbursementSource:textField(160).default(''),notes:textField(2000).default(''),
});
export const loanUpdate = loanInput.partial().extend({loanId:idField});
export const loanIdInput = z.object({loanId:idField});
export const loanDecision = loanIdInput.extend({decision:z.enum(['APPROVE','REJECT']),notes:textField(1000).optional()});
export const installmentInput = loanIdInput.extend({
  installmentAmount:principal,paymentMethod:z.enum(methods),installmentDate:dateField,notes:textField(1000).optional(),requestId:idField.optional(),
});
export const loanPolicy = z.object({
  maxLoanRatio:z.number().min(0).max(100),maxTenorMonths:z.number().int().min(1).max(60),minWorkingMonths:z.number().int().min(0).max(600),
  requiredApprovers:textField(200),defaultDisbursementSource:textField(160),repaymentNotes:textField(3000),
});
const defaultPolicy:z.output<typeof loanPolicy>={maxLoanRatio:50,maxTenorMonths:12,minWorkingMonths:0,requiredApprovers:'Ketua atau Bendahara',defaultDisbursementSource:'',repaymentNotes:''};

type LoanRow={id:string;payload:string;amount:number|string;status:'PENDING_APPROVAL'|'ACTIVE_INSTALLMENT'|'REJECTED';approved_by:string|null};
type InstallmentRow={id:string;loan_id:string;installment_no:number;amount:number|string;payment_date:string;payment_method:typeof methods[number];received_by:string;notes:string|null};
const allLoanRows = 'SELECT id,payload,amount,status,approved_by FROM staff_loans WHERE archived_at IS NULL';
function dueDate(date:string,months:number) {
  const original = new Date(date+'T00:00:00.000Z');
  const day = original.getUTCDate();
  original.setUTCDate(1);
  original.setUTCMonth(original.getUTCMonth()+months);
  const last=new Date(Date.UTC(original.getUTCFullYear(),original.getUTCMonth()+1,0)).getUTCDate();
  original.setUTCDate(Math.min(day,last));
  return original.toISOString().slice(0,10);
}
function mapInstallment(row:InstallmentRow) {
  return {id:row.id,installmentNo:row.installment_no,amount:Number(row.amount),paymentDate:row.payment_date,paymentMethod:row.payment_method,receivedBy:row.received_by,notes:row.notes || undefined};
}
function mapLoan(row:LoanRow,records:InstallmentRow[]) {
  const data=loanInput.parse(JSON.parse(row.payload));
  const installments=records.map(mapInstallment);
  const paidAmount=installments.reduce((sum,item)=>sum+item.amount,0);
  const remainingBalance=Number(row.amount)-paidAmount;
  const deadline=dueDate(data.loanDate,data.tenorMonths);
  const today = new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const status = row.status === 'PENDING_APPROVAL' ? 'PENDING_APPROVAL' as const : remainingBalance === 0 ? 'PAID_OFF' as const : deadline < today ? 'OVERDUE' as const : 'ACTIVE_INSTALLMENT' as const;
  return {...data,id:row.id,paidAmount,remainingBalance,remainingTenorMonths:Math.ceil(Math.max(0,remainingBalance)/data.monthlyDeduction),
    dueDate:deadline,approvedBy:row.approved_by || '',status,installments};
}
async function one(run:Query,id:string) {
  const [row]=await run<LoanRow>(allLoanRows + ' AND id=?',[id]);
  if(!row) throw new OperationalError('Kasbon tidak ditemukan.',404);
  return mapLoan(row,await run<InstallmentRow>('SELECT * FROM staff_loan_installments WHERE loan_id=? ORDER BY installment_no',[id]));
}
export async function listStaffLoans() {
  const rows=await query<LoanRow>(allLoanRows + " AND status <> 'REJECTED' ORDER BY created_at DESC,id");
  const installments=await query<InstallmentRow>(`SELECT i.* FROM staff_loan_installments i JOIN staff_loans l ON l.id=i.loan_id
    WHERE l.archived_at IS NULL ORDER BY i.installment_no`);
  return rows.map(row=>mapLoan(row,installments.filter(i=>i.loan_id===row.id)));
}
const policyKey='staff_loan_policy_v1';
export async function getLoanPolicy(run:Query=query) {
  const [row]=await run<{value:string}>('SELECT value FROM settings WHERE key=?',[policyKey]);
  return row ? loanPolicy.parse(JSON.parse(row.value)) : defaultPolicy;
}
export async function saveLoanPolicy(data:z.output<typeof loanPolicy>,actor:UserSession) {
  return writeTransaction(async run=>{
    await run(`INSERT INTO settings(id,key,value,description) VALUES (?,?,?,?)
      ON CONFLICT (key) DO UPDATE SET value=excluded.value`,[policyKey,policyKey,JSON.stringify(data),'Kebijakan kasbon']);
    await operationalAudit(run,actor,'loan.policy','STAFF_LOAN_POLICY',policyKey,data);
    return data;
  });
}
async function validateTerms(run:Query,data:z.output<typeof loanInput>) {
  const policy=await getLoanPolicy(run);
  if(data.tenorMonths > policy.maxTenorMonths) throw new OperationalError('Tenor melebihi batas kebijakan kasbon.');
  if(data.baseSalary && data.totalLoanAmount > data.baseSalary*policy.maxLoanRatio/100) throw new OperationalError('Nominal melebihi batas kasbon terhadap gaji.');
  if(data.monthlyDeduction > data.totalLoanAmount || data.monthlyDeduction*data.tenorMonths < data.totalLoanAmount)
    throw new OperationalError('Potongan per bulan dan tenor tidak menutup pokok kasbon.');
}
export async function createLoan(data:z.output<typeof loanInput>,actor:UserSession) {
  return writeTransaction(async run=>{
    await validateTerms(run,data);
    const id=`loan-${randomUUID()}`;
    await run("INSERT INTO staff_loans (id,payload,amount,status,created_at) VALUES (?,?,?,'PENDING_APPROVAL',?)",[id,JSON.stringify(data),data.totalLoanAmount,new Date().toISOString()]);
    await operationalAudit(run,actor,'loan.create','STAFF_LOAN',id,{amount:data.totalLoanAmount});
    return one(run,id);
  });
}
export async function updateLoan(data:z.output<typeof loanUpdate>,actor:UserSession) {
  return writeTransaction(async(run,lock)=>{
    const [old]=await run<LoanRow>(allLoanRows + ' AND id=?' + lock,[data.loanId]);
    if(!old || old.status==='REJECTED') throw new OperationalError('Kasbon tidak ditemukan.',404);
    const previous=loanInput.parse(JSON.parse(old.payload));
    const updated=loanInput.parse({...previous,...data});
    if(old.status!=='PENDING_APPROVAL' && ['totalLoanAmount','tenorMonths','monthlyDeduction','loanDate','loanType','staffName'].some(key=>previous[key as keyof typeof previous]!==updated[key as keyof typeof updated]))
      throw new OperationalError('Pokok, penerima, dan jadwal tidak dapat diubah setelah persetujuan.');
    if(old.status==='PENDING_APPROVAL') await validateTerms(run,updated);
    await run('UPDATE staff_loans SET payload=?,amount=? WHERE id=?',[JSON.stringify(updated),updated.totalLoanAmount,data.loanId]);
    await operationalAudit(run,actor,'loan.update','STAFF_LOAN',data.loanId,{amount:updated.totalLoanAmount});
    return one(run,data.loanId);
  });
}
export async function decideLoan(data:z.output<typeof loanDecision>,actor:UserSession) {
  return writeTransaction(async(run,lock)=>{
    const [old]=await run<LoanRow>(allLoanRows + ' AND id=?' + lock,[data.loanId]);
    if(!old || old.status!=='PENDING_APPROVAL') throw new OperationalError('Pengajuan sudah diproses.');
    if(data.decision==='APPROVE') await validateTerms(run,loanInput.parse(JSON.parse(old.payload)));
    const status=data.decision==='APPROVE'?'ACTIVE_INSTALLMENT':'REJECTED';
    await run('UPDATE staff_loans SET status=?,approved_by=? WHERE id=?',[status,data.decision==='APPROVE'?actor.fullName:null,data.loanId]);
    await operationalAudit(run,actor,'loan.decision','STAFF_LOAN',data.loanId,{status,notes:data.notes || null});
    return data.decision==='APPROVE' ? {loan:await one(run,data.loanId)} : {loan:null};
  });
}
export async function archiveLoan(data:z.output<typeof loanIdInput>,actor:UserSession) {
  return writeTransaction(async(run,lock)=>{
    const [old]=await run<LoanRow>(allLoanRows + ' AND id=?' + lock,[data.loanId]);
    if(!old) throw new OperationalError('Kasbon tidak ditemukan.',404);
    if(old.status==='ACTIVE_INSTALLMENT') throw new OperationalError('Kasbon disetujui dipertahankan dalam riwayat.');
    await run('UPDATE staff_loans SET archived_at=? WHERE id=?',[new Date().toISOString(),data.loanId]);
    await operationalAudit(run,actor,'loan.archive','STAFF_LOAN',data.loanId,{status:old.status});
    return {id:data.loanId};
  });
}
export async function recordInstallment(data:z.output<typeof installmentInput>,actor:UserSession) {
  return writeTransaction(async(run,lock)=>{
    const [old]=await run<LoanRow>(allLoanRows + ' AND id=?' + lock,[data.loanId]);
    if(!old || old.status!=='ACTIVE_INSTALLMENT') throw new OperationalError('Kasbon belum disetujui atau tidak tersedia.');
    const id=data.requestId ? `inst-${data.requestId}` : `inst-${randomUUID()}`;
    if (id.length > 64) throw new OperationalError('Identitas angsuran tidak valid.',400);
    const existing=(await run<InstallmentRow>('SELECT * FROM staff_loan_installments WHERE id=?',[id]))[0];
    if(existing) {
      if(existing.loan_id!==data.loanId || Number(existing.amount)!==data.installmentAmount || existing.payment_method!==data.paymentMethod || existing.payment_date!==data.installmentDate)
        throw new OperationalError('Identitas angsuran telah digunakan.');
      return {loan:await one(run,data.loanId),installment:mapInstallment(existing)};
    }
    const loan=await one(run,data.loanId);
    if(data.installmentDate<loan.loanDate) throw new OperationalError('Tanggal angsuran mendahului tanggal kasbon.');
    if(data.installmentAmount>loan.remainingBalance) throw new OperationalError('Angsuran melebihi sisa kasbon.');
    const [row]=await run<InstallmentRow>(`INSERT INTO staff_loan_installments
      (id,loan_id,installment_no,amount,payment_date,payment_method,received_by,notes) VALUES (?,?,?,?,?,?,?,?) RETURNING *`,
      [id,data.loanId,loan.installments.length+1,data.installmentAmount,data.installmentDate,data.paymentMethod,actor.fullName,data.notes || null]);
    await operationalAudit(run,actor,'loan.installment','STAFF_LOAN',data.loanId,{installmentId:id,amount:data.installmentAmount});
    return {loan:await one(run,data.loanId),installment:mapInstallment(row)};
  });
}
