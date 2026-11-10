import { billingMonthKey } from './billing-data';
import { currentFinanceMonth, financeMonthPattern, type CashPeriodSummary } from './cash-data';

export const transparencyTabs = ['cashflow_summary','public_ledger','dues_breakdown','citizen_confirm','audit_faq'] as const;
export type TransparencySubTab = typeof transparencyTabs[number];
export const publicCashCategories = {
  DUES:'Iuran warga', SECURITY:'Keamanan', CLEANING:'Kebersihan', UTILITIES:'Utilitas', FACILITIES:'Fasilitas umum',
  AID:'Bantuan sosial', EXPENSE:'Pengeluaran operasional lain', STAFF_LOAN:'Kasbon petugas',
  TRANSFER:'Mutasi internal', OPENING:'Saldo awal rekening', OTHER:'Kas lainnya',
} as const;
export type PublicCashCategory = keyof typeof publicCashCategories;
export const PUBLIC_JOURNAL_PAGE_SIZE = 20;
export const PUBLIC_CSV_LIMIT = 10_000;
export interface PublicReportPeriod {year:number;month:number}
export interface PublicReportFilters {tab:TransparencySubTab;direction:''|'IN'|'OUT';category:PublicCashCategory|'';page:number}
export interface PublicJournalEntry {reference:string;date:string;direction:'IN'|'OUT';category:PublicCashCategory;label:string;amount:number;balance:number}
export interface PublicDuesMonth {month:number;billed:number;paid:number;received:number;remaining:number}
export interface PublicTransparencyData {
  period:PublicReportPeriod;periodLabel:string;currentMonth:string;previousMonth:string|null;nextMonth:string|null;
  communityName:string;bank:{name:string;number:string;holder:string}|null;
  cash:CashPeriodSummary;cashReconciled:boolean;duesCash:number;loanCashIn:number;loanCashOut:number;homes:number;dues:PublicDuesMonth[];
  outgoing:{category:PublicCashCategory;amount:number}[];journal:{rows:PublicJournalEntry[];total:number;page:number};
  shareUrl:string;qrCode:string;
  duty:{handover:string;current:number;upcoming:{date:string;turn:number}[]}|null;
}
export function publicReportPeriod(year?:string|null,month?:string|null,period?:string|null):PublicReportPeriod {
  const now=currentFinanceMonth();
  const [currentYear,currentMonth]=now.split('-').map(Number);
  const y=Number(year),m=Number(month);
  let key = period && financeMonthPattern.test(period) ? period :
    billingMonthKey(Number.isInteger(y)&&y>=1900&&y<=2199?y:currentYear,Number.isInteger(m)&&m>=1&&m<=12?m:currentMonth);
  if(key<'1900-01' || key>now) key=now;
  const [validYear,validMonth]=key.split('-').map(Number);
  return {year:validYear,month:validMonth};
}
export function publicReportFilters(params:URLSearchParams):PublicReportFilters {
  const tab=params.get('tab') as TransparencySubTab;
  const dir=params.get('direction');
  const category=params.get('category') || '';
  const page=params.get('page') || '';
  return {tab:transparencyTabs.includes(tab)?tab:'cashflow_summary',direction:dir==='IN'||dir==='OUT'?dir:'',
    category:Object.hasOwn(publicCashCategories,category)?category as PublicCashCategory:'',
    page:/^\d{1,5}$/.test(page)?Math.max(1,Number(page)):1};
}
export function publicReportPath(period:PublicReportPeriod|string,tab:TransparencySubTab='cashflow_summary',params:Record<string,string|number|null|undefined>={}) {
  const month=typeof period==='string'?period:billingMonthKey(period.year,period.month);
  const search=new URLSearchParams(tab==='cashflow_summary'?undefined:{tab});
  for(const [key,value] of Object.entries(params)) if(value!==undefined && value!==null && value!=='') search.set(key,String(value));
  return '/transparency/'+month.replace('-','/')+(search.size?'?'+search:'');
}
