import { billingMonthKey } from './billing-data';
import { currentFinanceMonth, financeMonthPattern, type CashPeriodSummary, type ExpenseCategory } from './cash-data';

export const BUDGET_TABS=['budget_matrix','sinking_fund','public_transparency','manual_form'] as const;
export const ANALYTICS_TABS=['financial_trends','block_compliance','utility_efficiency','security_sla'] as const;
export type BudgetTab=typeof BUDGET_TABS[number];
export type AnalyticsTab=typeof ANALYTICS_TABS[number];
export const reportRanges=[3,6,12] as const;
export const reportTargets=[24,48,72] as const;
export type ReportRange=typeof reportRanges[number];
export type ReportTarget=typeof reportTargets[number];
export const RESERVE_ACCOUNT='RESERVE';
export const UNCATEGORIZED='uncategorized';

export const isReportMonth=(value:string)=>financeMonthPattern.test(value) && value>='1900-01' && value<='2199-12';
export function reportMonth(value:string|null){return value && isReportMonth(value) ? value : currentFinanceMonth();}
export function monthWindow(end:string,range:number) {
  const [year,month]=end.split('-').map(Number);
  return Array.from({length:range},(_,index)=>{
    const offset=year*12+month-range+index;
    return billingMonthKey(Math.floor(offset/12),offset%12+1);
  });
}
export function analyticsFilters(params:URLSearchParams) {
  const month=reportMonth(params.get('month'));
  const tab=ANALYTICS_TABS.find(value=>value===params.get('tab')) || 'financial_trends';
  const range=reportRanges.find(value=>value===Number(params.get('range'))) || 6;
  const target=reportTargets.find(value=>value===Number(params.get('target'))) || 48;
  const requested=Number(params.get('archivePage'));
  const archivePage=Number.isSafeInteger(requested) && requested>0 ? Math.min(requested,10000) : 1;
  return {month,tab,range,target,archivePage};
}
export type AnalyticsFilters=ReturnType<typeof analyticsFilters>;
export const roundCash=(value:number)=>Math.round((value+Number.EPSILON)*100)/100;
export const rate=(n:number,d:number)=>d ? Math.round(n/d*1000)/10 : null;
const decimal=new Intl.NumberFormat('id-ID',{maximumFractionDigits:1});
export const percentText=(value:number|null)=>value===null?'—':decimal.format(value)+'%';
export const decimalText=(value:number|null)=>value===null?'—':decimal.format(value);

export type BudgetAllocation={id:string;categoryId:string;amount:number;pic:string;notes:string};
export type BudgetPlan={month:string;version:number;state:'DRAFT'|'APPROVED';items:BudgetAllocation[];approved?:{by:string;at:string};revision?:string};
export type BudgetActual={id:string|null;name:string;amount:number;count:number};
export type AnnualTemplate={id:string;name:string;count:number};
export type ReserveFund={id:string;accountId:string;name:string;target:number;targetMonth:string;purpose:string;balance:number;archivedAt?:string};
export type BudgetWorkspace={month:string;plan:BudgetPlan;actual:BudgetActual[];categories:ExpenseCategory[];annual:AnnualTemplate[];billingPeriodId:string|null;cash:CashPeriodSummary};
export function budgetRows({plan,actual,categories}:BudgetWorkspace) {
  const index=new Map(actual.map(item=>[item.id || UNCATEGORIZED,item]));
  const rows=plan.items.map(item=>({id:item.categoryId,name:categories.find(cat=>cat.id===item.categoryId)?.name || 'Kategori lama',
    allocation:item,actual:index.get(item.categoryId)?.amount || 0,count:index.get(item.categoryId)?.count || 0}));
  const unplanned=actual.filter(item=>!plan.items.some(pos=>pos.categoryId===item.id)).map(item=>({id:item.id || UNCATEGORIZED,name:item.name,
    allocation:null,actual:item.amount,count:item.count}));
  return [...rows,...unplanned].sort((a,b)=>Number(!a.allocation)-Number(!b.allocation) || a.name.localeCompare(b.name,'id'));
}

export type CashTrend=CashPeriodSummary & {month:string};
export type ComplianceStats={houses:number;occupied:number;issued:number;paid:number;pending:number;received:number;remaining:number;rate:number|null};
export type BlockCompliance=ComplianceStats & {block:string};
export type ComplianceReport=ComplianceStats & {periodId:string|null;blocks:BlockCompliance[]};
export type UtilityReport={houses:number;records:number;electricity:number;waterMeters:number;usableReadings:number;waterUsage:number|null;
  invalidReadings:number;solar:number;biopori:number;costs:BudgetActual[]};
export type ServiceReport={total:number;open:number;done:number;measured:number;onTime:number;avgHours:number|null;targetRate:number|null};
export type SecurityReport={complaints:ServiceReport;security:ServiceReport;patrols:number;categories:{name:string;total:number;open:number}[]};
export type AnalyticsSnapshot={id:string;month:string;at:string;by:string;notes:string;target:ReportTarget;cash:CashTrend;compliance:ComplianceStats;
  security:SecurityReport;utilities:UtilityReport;budget:{planned:number;actual:number;state:BudgetPlan['state']}};
export type AnalyticsWorkspace={filters:AnalyticsFilters;trends:CashTrend[];cash:CashTrend;compliance:ComplianceReport;utilities:UtilityReport;security:SecurityReport;
  snapshots:AnalyticsSnapshot[];moreSnapshots:boolean;budget:AnalyticsSnapshot['budget']};
export const ARCHIVE_PAGE_SIZE=12;
