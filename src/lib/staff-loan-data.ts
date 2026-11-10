export const staffLoanTabs = ['active_loans','new_requests','payroll_deductions','repayment_history','loan_policies'] as const;
export type StaffLoanSubTab = typeof staffLoanTabs[number];
export const staffRoles = {SATPAM:'Satpam',PETUGAS_KEBERSIHAN:'Kebersihan',PETUGAS_TAMAN:'Petugas taman',TEKNISI:'Teknisi'} as const;
export const loanTypes = {KASBON_CICILAN:'Kasbon cicilan',GAJI_DI_AWAL:'Gaji di awal',DANA_DARURAT:'Dana darurat'} as const;
export const loanMethods = {POTONG_GAJI:'Potong gaji',TUNAI_CASH:'Tunai',TRANSFER_BCA:'Transfer BCA',TRANSFER_BANK:'Transfer bank',EWALLET:'Dompet digital'} as const;
export const loanStatuses = {PENDING_APPROVAL:'Menunggu persetujuan',AWAITING_DISBURSEMENT:'Siap dicairkan',ACTIVE_INSTALLMENT:'Berjalan',OVERDUE:'Lewat jatuh tempo',PAID_OFF:'Lunas',REJECTED:'Ditolak',ARCHIVED:'Ditarik',CANCELLED:'Pencairan dibalik'} as const;
export type LoanStatus = keyof typeof loanStatuses;
export type LoanMethod = keyof typeof loanMethods;
export type StaffRole = keyof typeof staffRoles;
export type LoanType = keyof typeof loanTypes;
export type ApprovalMode = 'LEADERSHIP'|'FINANCE';

export interface LoanPolicyConfig {
  maxLoanRatio:number; maxTenorMonths:number; minWorkingMonths:number; approvalMode:ApprovalMode; defaultAccountId:string; repaymentNotes:string;
}
export interface LoanAccount {id:string;name:string;type:string;balance:number}
export interface PayrollExpense {id:string;title:string;date:string;amount:number;accountName:string}
export interface LoanAction {at:string;by:string;reason:string}
export interface LoanDisbursement {accountId:string;accountName:string;date:string;journalId:string;reversal?:LoanAction & {journalId:string}}
export interface InstallmentRecord {
  id:string;installmentNo:number;amount:number;paymentDate:string;paymentMethod:LoanMethod;receivedBy:string;notes?:string;
  accountName?:string;journalId?:string;expenseId?:string;legacy:boolean;reversal?:LoanAction & {journalId?:string};
}
export interface StaffLoan {
  id:string;staffName:string;staffRole:StaffRole;staffPhone:string;staffSince:string;baseSalary:number|null;loanType:LoanType;totalLoanAmount:number;
  monthlyDeduction:number;tenorMonths:number;loanDate:string;purpose:string;notes:string;legacySource:string;
  status:LoanStatus;decision?:LoanAction;archived?:LoanAction;disbursement?:LoanDisbursement;legacyDisbursement:boolean;
  paidAmount:number;remainingBalance:number;dueDate:string;approvedBy:string;installments:InstallmentRecord[];
}
export const isRepayable = (loan:StaffLoan) => loan.status==='ACTIVE_INSTALLMENT' || loan.status==='OVERDUE';
export const isCashAccount = (type:string) => ['CASH','PETTY_CASH'].includes(type);
export function loanPath(params:Record<string,string|number|null|undefined>={}) {
  const search=new URLSearchParams();
  for(const [key,value] of Object.entries(params)) if(value!==undefined && value!==null && value!=='') search.set(key,String(value));
  return '/admin/staff-loans'+(search.size?'?'+search.toString():'');
}
export const loanReceiptNumber = (id:string) => 'KB-'+id.slice(-12).toUpperCase();
