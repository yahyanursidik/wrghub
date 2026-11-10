import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { query, writeTransaction, type Query } from '../db/operational-query';
import { BILLING_COMMUNITY_ID } from '../lib/billing-data';
import { currentFinanceMonth } from '../lib/cash-data';
import { complaintIsOpen } from '../lib/complaint-status';
import { ARCHIVE_PAGE_SIZE, rate, roundCash, type AnalyticsFilters, type AnalyticsSnapshot, type AnalyticsWorkspace, type BlockCompliance, type ComplianceReport, type ComplianceStats,
  type SecurityReport, type ServiceReport, type UtilityReport } from '../lib/planning-data';
import { readPropertyProfile } from '../lib/property-profile';
import type { UserSession } from '../types/auth';
import { readBudgetPlan } from './budget-planning.service';
import { getCashMonthlySummaries } from './cash-ledger.service';
import { monthField } from './expense-input';
import { getExpenseCashTotals, getExpenseCategories, putCashSetting } from './expense-operations.service';
import { OperationalError, operationalAudit, textField } from './operational-mutation';
import { countRecordedPatrols, jakartaMonthTimes, monthTimeSql, recordedTime } from './security-patrol.service';

const community=BILLING_COMMUNITY_ID;
const houseWhere="p.community_id=? AND p.is_active=true AND LOWER(p.code) NOT LIKE '%dummy%' AND p.code<>'A-99'";
const snapshotPrefix='analytics-archive:';
const billedStatuses="'VOID','WAIVED','CANCELLED'";
const counts=()=>({houses:0,occupied:0,issued:0,paid:0,pending:0,received:0,remaining:0});
const countedKeys=['houses','occupied','issued','paid','pending','received','remaining'] as const;
type Count=ReturnType<typeof counts>;
const computed=(stats:Count):ComplianceStats=>({...stats,received:roundCash(stats.received),remaining:roundCash(stats.remaining),rate:rate(stats.paid,stats.issued)});

async function loadCompliance(month:string,run:Query):Promise<ComplianceReport> {
  const [year,number]=month.split('-').map(Number);
  const [periods,homes]=await Promise.all([
    run<{id:string}>('SELECT id FROM billing_periods WHERE community_id=? AND year=? AND month=? ORDER BY id LIMIT 1',[community,year,number]),
    run<{id:string;block:string;occupancy_status:string}>(`SELECT p.id,COALESCE(NULLIF(b.name,''),'Tanpa blok') AS block,p.occupancy_status
      FROM properties p LEFT JOIN blocks b ON b.id=p.block_id WHERE ${houseWhere}`,[community]),
  ]);
  const periodId=periods[0]?.id || null;
  const invoices=periodId ? await run<{property_id:string;remaining:string|number;received:string|number;pending:number}>(`SELECT i.property_id,
    SUM(CASE WHEN i.status='PAID' OR i.paid_amount>=i.total THEN 0 WHEN i.paid_amount<=0 THEN i.total ELSE i.total-i.paid_amount END) AS remaining,
    SUM(CASE WHEN i.status='PAID' OR i.paid_amount>=i.total THEN i.total WHEN i.paid_amount<=0 THEN 0 ELSE i.paid_amount END) AS received,
    MAX(CASE WHEN i.status<>'PAID' AND i.paid_amount<i.total AND EXISTS (SELECT 1 FROM payments pm WHERE pm.status='PENDING'
      AND (pm.invoice_id=i.id OR (pm.invoice_id IS NULL AND pm.property_id=i.property_id AND pm.billing_period_id=i.billing_period_id))) THEN 1 ELSE 0 END) AS pending
    FROM invoices i WHERE i.billing_period_id=? AND i.status NOT IN (${billedStatuses}) GROUP BY i.property_id`,[periodId]) : [];
  const index=new Map(invoices.map(row=>[row.property_id,row]));
  const grouped=new Map<string,Count>();
  for(const home of homes) {
    const stats=grouped.get(home.block) || counts();
    stats.houses++;
    if(['OWNER_OCCUPIED','RENTED','OCCUPIED'].includes(home.occupancy_status)) stats.occupied++;
    const invoice=index.get(home.id);
    if(invoice){
      stats.issued++;
      if(Number(invoice.remaining)===0) stats.paid++;
      else if(Number(invoice.pending)) stats.pending++;
      stats.received+=Number(invoice.received);
      stats.remaining+=Number(invoice.remaining);
    }
    grouped.set(home.block,stats);
  }
  const total=counts();
  const blocks:BlockCompliance[]=[...grouped].sort(([a],[b])=>a.localeCompare(b,'id',{numeric:true})).map(([block,stats])=>{
    for(const key of countedKeys) total[key]+=stats[key];
    return {block,...computed(stats)};
  });
  return {periodId,blocks,...computed(total)};
}

const utilities=new Set(['LISTRIK','LISTRIK FASUM','PJU','LISTRIK PJU','PLN','PAM','PDAM','AIR','AIR BERSIH','AIR FASUM','UTILITAS','LISTRIK DAN AIR']);
const categoryKey=(value:string)=>value.toUpperCase().replace(/[-_]+/g,' ').replace(/\s+/g,' ').trim();
async function loadUtilityRecords(run:Query) {
  const rows=await run<{profile_json:string;pln_customer_id:string|null;meter_previous:string|number|null;meter_current:string|number|null;
    has_biopori:boolean|number;has_solar_panel:boolean|number}>(`SELECT p.profile_json,u.pln_customer_id,u.meter_previous,u.meter_current,u.has_biopori,u.has_solar_panel
    FROM property_utilities u JOIN properties p ON p.id=u.property_id WHERE u.archived_at IS NULL AND ${houseWhere}`,[community]);
  const stats={records:rows.length,electricity:0,waterMeters:0,usableReadings:0,waterUsage:0,invalidReadings:0,solar:0,biopori:0};
  for(const row of rows){
    const profile=readPropertyProfile(row.profile_json);
    if(row.pln_customer_id?.trim() || profile.plnCapacity?.trim()) stats.electricity++;
    if(row.has_solar_panel) stats.solar++;
    if(row.has_biopori) stats.biopori++;
    const previous=row.meter_previous===null?NaN:Number(row.meter_previous);
    const current=row.meter_current===null?NaN:Number(row.meter_current);
    const hasReadings=previous>0 || current>0;
    if(profile.pamMeterNo?.trim() || hasReadings) stats.waterMeters++;
    if(!hasReadings) continue;
    if(!Number.isFinite(previous) || !Number.isFinite(current) || previous<0 || current<previous) {stats.invalidReadings++;continue;}
    stats.usableReadings++;
    stats.waterUsage+=current-previous;
  }
  return {...stats,waterUsage:stats.usableReadings?roundCash(stats.waterUsage):null};
}

type ComplaintRow={category:string;status:string;created_at:string|Date;resolved_at:string|Date|null};
function serviceStats(rows:ComplaintRow[],target:number):ServiceReport {
  const completed=rows.filter(row=>!complaintIsOpen(row.status));
  const times=completed.flatMap(row=>{
    const hours=row.resolved_at?(recordedTime(row.resolved_at).getTime()-recordedTime(row.created_at).getTime())/3_600_000:NaN;
    return Number.isFinite(hours) && hours>=0 ? [hours] : [];
  });
  const onTime=times.filter(hours=>hours<=target).length;
  return {total:rows.length,open:rows.length-completed.length,done:completed.length,measured:times.length,onTime,
    avgHours:times.length?Math.round(10*times.reduce((sum,hours)=>sum+hours,0)/times.length)/10:null,targetRate:rate(onTime,times.length)};
}

async function loadSecurity(month:string,target:number,run:Query):Promise<SecurityReport> {
  const [rows,patrols]=await Promise.all([
    run<ComplaintRow>(`SELECT category,status,created_at,resolved_at FROM complaints WHERE ${monthTimeSql('created_at')}
      AND (property_id IS NULL OR property_id IN (SELECT id FROM properties WHERE community_id=?))`,[...jakartaMonthTimes(month),community]),
    countRecordedPatrols(month,run),
  ]);
  const categories=new Map<string,{name:string;total:number;open:number}>();
  for(const row of rows){
    const name=row.category || 'LAINNYA';
    const item=categories.get(name) || {name,total:0,open:0};
    item.total++;
    if(complaintIsOpen(row.status)) item.open++;
    categories.set(name,item);
  }
  return {complaints:serviceStats(rows,target),security:serviceStats(rows.filter(row=>row.category==='KEAMANAN'),target),patrols,
    categories:[...categories.values()].sort((a,b)=>b.total-a.total || a.name.localeCompare(b.name,'id'))};
}

async function loadSnapshots(month:string,page:number,run:Query) {
  const rows=await run<{value:string}>('SELECT value FROM settings WHERE key LIKE ? ORDER BY updated_at DESC,id DESC LIMIT ? OFFSET ?',
    [snapshotPrefix+month+':%',ARCHIVE_PAGE_SIZE+1,(page-1)*ARCHIVE_PAGE_SIZE]);
  return {snapshots:rows.slice(0,ARCHIVE_PAGE_SIZE).map(row=>JSON.parse(row.value) as AnalyticsSnapshot),moreSnapshots:rows.length>ARCHIVE_PAGE_SIZE};
}

export async function getAnalyticsWorkspace(filters:AnalyticsFilters,run:Query=query,includeHistory=true):Promise<AnalyticsWorkspace> {
  const {month,range,target,archivePage}=filters;
  const [trends,compliance,meters,categories,actual,plan,security,archives]=await Promise.all([
    getCashMonthlySummaries(month,range,run),loadCompliance(month,run),loadUtilityRecords(run),getExpenseCategories(run),
    getExpenseCashTotals(month,run),readBudgetPlan(month,run),loadSecurity(month,target,run),includeHistory?loadSnapshots(month,archivePage,run):{snapshots:[],moreSnapshots:false},
  ]);
  const utilityIds=new Set(categories.filter(item=>utilities.has(categoryKey(item.code)) || utilities.has(categoryKey(item.name))).map(item=>item.id));
  const utilityReport:UtilityReport={houses:compliance.houses,...meters,costs:actual.filter(item=>item.id && utilityIds.has(item.id))};
  return {filters,trends,cash:trends[trends.length-1],compliance,utilities:utilityReport,security,...archives,
    budget:{planned:roundCash(plan.items.reduce((sum,item)=>sum+item.amount,0)),actual:roundCash(actual.reduce((sum,item)=>sum+item.amount,0)),state:plan.state}};
}

export const analyticsSnapshotInput=z.object({month:monthField,target:z.union([z.literal(24),z.literal(48),z.literal(72)]).default(48),notes:textField(500).default('')}).strict();
export async function saveAnalyticsSnapshot(input:z.output<typeof analyticsSnapshotInput>,actor:UserSession) {
  if(input.month>currentFinanceMonth()) throw new OperationalError('Periode laporan belum dimulai.',400);
  return writeTransaction(async run=>{
    if(process.env.DATABASE_URL) await run('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');
    const data=await getAnalyticsWorkspace({month:input.month,target:input.target,range:3,tab:'financial_trends',archivePage:1},run,false);
    const {periodId:_period,blocks:_blocks,...compliance}=data.compliance;
    const snapshot:AnalyticsSnapshot={id:`snap-${randomUUID()}`,at:new Date().toISOString(),by:actor.fullName,notes:input.notes,target:input.target,
      month:input.month,cash:data.cash,compliance,security:data.security,utilities:data.utilities,budget:data.budget};
    await putCashSetting(run,snapshotPrefix+input.month+':'+snapshot.id,snapshot,'Arsip indikator bulanan');
    await operationalAudit(run,actor,'analytics.snapshot.save','ANALYTICS_SNAPSHOT',snapshot.id,{month:input.month,target:input.target});
    return snapshot;
  });
}
