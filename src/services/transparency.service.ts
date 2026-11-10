import { createHash } from 'node:crypto';
import QRCode from 'qrcode';
import { readSnapshot, type Query } from '../db/operational-query';
import { BILLING_COMMUNITY_ID, billingMonthKey, billingMonthLabel } from '../lib/billing-data';
import { currentFinanceMonth, ledgerSources, monthBounds } from '../lib/cash-data';
import { roundCash } from '../lib/planning-data';
import { PUBLIC_CSV_LIMIT, PUBLIC_JOURNAL_PAGE_SIZE, publicReportPath,
  type PublicCashCategory, type PublicDuesMonth, type PublicJournalEntry, type PublicReportFilters,
  type PublicReportPeriod, type PublicTransparencyData } from '../lib/transparency-data';
import { getCashLedger, getCashReconciliation, outgoingSql } from './cash-ledger.service';
import { getCommunityProfile } from './settings.service';

// Project only fields safe for anonymous visitors. Custom category names, notes,
// descriptions, payment references, people, and account IDs stay in the admin ledger.
const safeJournal =
  "SELECT l.id,l.entry_date,l.direction,l.amount,l.source_type,l.created_at,CASE "+
  "WHEN l.source_type IN ('PAYMENT','PAYMENT_REVERSAL') THEN 'DUES' "+
  "WHEN l.source_type IN ('STAFF_LOAN_DISBURSEMENT','STAFF_LOAN_INSTALLMENT','STAFF_LOAN_DISBURSEMENT_REVERSAL','STAFF_LOAN_INSTALLMENT_REVERSAL') THEN 'STAFF_LOAN' "+
  "WHEN l.source_type IN ('INTERNAL_TRANSFER','MUTASI_KAS_INTERNAL','RESERVE_TRANSFER') THEN 'TRANSFER' "+
  "WHEN l.source_type='OPENING_BALANCE' THEN 'OPENING' "+
  "WHEN l.source_type IN ('EXPENSE','EXPENSE_REVERSAL') THEN CASE "+
  "WHEN UPPER(c.code) IN ('KEAMANAN','SECURITY') THEN 'SECURITY' "+
  "WHEN UPPER(c.code) IN ('KEBERSIHAN','CLEANING','SAMPAH') THEN 'CLEANING' "+
  "WHEN UPPER(c.code) IN ('UTILITAS','UTILITIES','LISTRIK','AIR','PJU') THEN 'UTILITIES' "+
  "WHEN UPPER(c.code) IN ('FASUM','FASILITAS','PEMELIHARAAN','INFRASTRUKTUR') THEN 'FACILITIES' "+
  "WHEN UPPER(c.code) IN ('SOSIAL','BANSOS','BANTUAN_SOSIAL','DANA_SOSIAL') THEN 'AID' ELSE 'EXPENSE' END "+
  "ELSE 'OTHER' END AS category "+
  "FROM ledger_entries l LEFT JOIN expenses e ON e.id=l.source_id AND l.source_type IN ('EXPENSE','EXPENSE_REVERSAL') "+
  "LEFT JOIN expense_categories c ON c.id=e.category_id WHERE l.entry_date>=? AND l.entry_date<?";
const safeSources = new Map(Object.entries(ledgerSources));
const stableOrder='entry_date,CASE WHEN created_at IS NULL THEN 0 ELSE 1 END,created_at,id';
const newestFirst='entry_date DESC,CASE WHEN created_at IS NULL THEN 0 ELSE 1 END DESC,created_at DESC,id DESC';

type CashRow={id:string|null;entry_date:string;direction:'IN'|'OUT';amount:number|string;source_type:string;category:PublicCashCategory;
  running_balance:number|string;total_count:number|string;page:number|string};
async function readPublicJournal(run:Query,month:string,opening:number,filters:PublicReportFilters,download=false) {
  const where=(filters.direction?' AND direction=?':'')+(filters.category?' AND category=?':'');
  const flags=[filters.direction,filters.category].filter(Boolean);
  const limit=download?PUBLIC_CSV_LIMIT:PUBLIC_JOURNAL_PAGE_SIZE;
  const rows=await run<CashRow>("WITH journal AS ("+safeJournal+"), with_balances AS ("+
    "SELECT journal.*,?+SUM(CASE WHEN direction='IN' THEN amount ELSE -amount END) OVER (ORDER BY "+stableOrder+" ROWS UNBOUNDED PRECEDING) AS running_balance FROM journal), "+
    "filtered AS (SELECT * FROM with_balances WHERE 1=1"+where+"), counted AS (SELECT COUNT(*) AS total_count FROM filtered), "+
    "numbered AS (SELECT filtered.*,ROW_NUMBER() OVER (ORDER BY "+newestFirst+") AS row_no FROM filtered), "+
    "bounds AS (SELECT counted.*,CASE WHEN total_count=0 THEN 1 WHEN total_count<=? THEN CAST((total_count+? - 1) / ? AS INTEGER) ELSE ? END AS page FROM counted) "+
    "SELECT n.id,n.entry_date,n.direction,n.amount,n.source_type,n.category,n.running_balance,b.total_count,b.page FROM bounds b LEFT JOIN numbered n "+
    "ON n.row_no>(b.page-1)*? AND n.row_no<=b.page*? ORDER BY n.row_no",
    [...monthBounds(month),opening,...flags,(download?1:filters.page)*limit,limit,limit,download?1:filters.page,limit,limit]);
  const entries:PublicJournalEntry[]=rows.flatMap(row=>row.id?[{
    reference:'JRN-'+createHash('sha256').update('public-report:'+row.id).digest('hex').slice(0,12).toUpperCase(),
    date:row.entry_date,direction:row.direction,amount:Number(row.amount),balance:roundCash(Number(row.running_balance)),category:row.category,
    label:safeSources.get(row.source_type) || (row.direction==='IN'?'Penerimaan kas':'Pengeluaran kas'),
  }]:[]);
  return {rows:entries,total:Number(rows[0].total_count),page:Number(rows[0].page)};
}

export async function getPublicJournalExport(period:PublicReportPeriod,filters:PublicReportFilters) {
  const month=billingMonthKey(period.year,period.month);
  return readSnapshot(async run=>{
    const {summary}=await getCashLedger({month,pageSize:1},run);
    return readPublicJournal(run,month,summary.opening,filters,true);
  });
}

type DuesRow={month:number;billed:number|string;paid:number|string;received:number|string;remaining:number|string};
async function publicDuty(run:Query):Promise<PublicTransparencyData['duty']> {
  const [row]=await run<{value:string}>("SELECT value FROM settings WHERE key='security_shift_roster'");
  if(!row) return null;
  try {
    const {shifts,handoverTime,rotationStartDate}=JSON.parse(row.value);
    if(!Array.isArray(shifts) || !shifts.length || typeof handoverTime!=='string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(handoverTime) ||
      typeof rotationStartDate!=='string' || !/^\d{4}-\d{2}-\d{2}$/.test(rotationStartDate)) return null;
    const start=Date.parse(rotationStartDate+'T00:00:00Z');
    if(!Number.isFinite(start)) return null;
    const now=new Date(Date.now()+7*60*60*1000);
    const today=now.toISOString().slice(0,10);
    const day=86_400_000;
    const delta=Math.floor((Date.parse(today)-start)/day);
    if(delta<0) return null;
    const nowClock=now.toISOString().slice(11,16);
    const turn=(offset:number)=>((offset%shifts.length)+shifts.length)%shifts.length+1;
    return {handover:handoverTime,current:turn(delta-(nowClock<handoverTime?1:0)),
      upcoming:Array.from({length:3},(_,i)=>({date:new Date(Date.parse(today)+day*(i+1)).toISOString().slice(0,10),turn:turn(delta+i+1)}))};
  } catch {return null;}
}
const monthShift = (period:PublicReportPeriod,delta:number) => {
  const shifted=new Date(Date.UTC(period.year,period.month-1+delta,1));
  return billingMonthKey(shifted.getUTCFullYear(),shifted.getUTCMonth()+1);
};
export async function getPublicMonthlyReport(period:PublicReportPeriod,filters:PublicReportFilters,origin:string):Promise<PublicTransparencyData> {
  const {year,month}=period;
  const key=billingMonthKey(year,month);
  const currentMonth=currentFinanceMonth();
  const shareUrl=new URL(publicReportPath(period,filters.tab,{direction:filters.tab==='public_ledger'?filters.direction:undefined,
    category:filters.tab==='public_ledger'?filters.category:undefined}),origin).toString();
  const [data,profile,qrCode]=await Promise.all([
    readSnapshot(async run=>{
      const {summary}=await getCashLedger({month:key,pageSize:1},run);
       const [categories,invoices,[housing],journal,duty,accounts]=await Promise.all([
        run<{category:PublicCashCategory;outgoing:number|string;dues:number|string;loan_in:number|string;loan_out:number|string}>(
          "WITH journal AS ("+safeJournal+") SELECT category,COALESCE(SUM("+outgoingSql+"),0) AS outgoing,"+
          "COALESCE(SUM(CASE WHEN source_type='PAYMENT' THEN amount WHEN source_type='PAYMENT_REVERSAL' THEN -amount ELSE 0 END),0) AS dues,"+
          "COALESCE(SUM(CASE WHEN source_type='STAFF_LOAN_INSTALLMENT' THEN amount WHEN source_type='STAFF_LOAN_INSTALLMENT_REVERSAL' THEN -amount ELSE 0 END),0) AS loan_in,"+
          "COALESCE(SUM(CASE WHEN source_type='STAFF_LOAN_DISBURSEMENT' THEN amount WHEN source_type='STAFF_LOAN_DISBURSEMENT_REVERSAL' THEN -amount ELSE 0 END),0) AS loan_out "+
          "FROM journal GROUP BY category",monthBounds(key)),
        run<DuesRow>("WITH house_month AS (SELECT p.month,i.property_id,"+
          "SUM(CASE WHEN i.status='PAID' THEN 0 ELSE CASE WHEN i.total>i.paid_amount THEN i.total-i.paid_amount ELSE 0 END END) AS remaining,"+
          "SUM(CASE WHEN i.status='PAID' OR i.paid_amount>i.total THEN i.total WHEN i.paid_amount<0 THEN 0 ELSE i.paid_amount END) AS received "+
          "FROM invoices i JOIN billing_periods p ON p.id=i.billing_period_id JOIN properties h ON h.id=i.property_id "+
          "WHERE p.year=? AND p.month<=? AND h.community_id=? AND h.is_active=true AND lower(h.code) NOT LIKE '%dummy%' AND h.code<>'A-99' "+
          "AND i.status NOT IN ('VOID','WAIVED','CANCELLED') GROUP BY p.month,i.property_id) "+
          "SELECT month,COUNT(*) AS billed,SUM(CASE WHEN remaining=0 THEN 1 ELSE 0 END) AS paid,SUM(received) AS received,SUM(remaining) AS remaining "+
          "FROM house_month GROUP BY month ORDER BY month",[year,month,BILLING_COMMUNITY_ID]),
        run<{total:number|string}>("SELECT COUNT(*) AS total FROM properties WHERE community_id=? AND is_active=true AND lower(code) NOT LIKE '%dummy%' AND code<>'A-99'",[BILLING_COMMUNITY_ID]),
         filters.tab==='public_ledger'?readPublicJournal(run,key,summary.opening,filters):{rows:[],total:0,page:1},
         filters.tab==='audit_faq'?publicDuty(run):null,
         run<{id:string}>('SELECT id FROM accounts'),
       ]);
       const reconciliations=await Promise.all(accounts.map(account=>getCashReconciliation(account.id,key,run)));
       const cashReconciled=accounts.length>0 && reconciliations.every(item=>item.status==='MATCHED');
      const dues:PublicDuesMonth[]=Array.from({length:month},(_,index)=>{
        const row=invoices.find(item=>Number(item.month)===index+1);
        return {month:index+1,billed:Number(row?.billed || 0),paid:Number(row?.paid || 0),received:roundCash(Number(row?.received || 0)),remaining:roundCash(Number(row?.remaining || 0))};
      });
      const total=(name:'dues'|'loan_in'|'loan_out')=>roundCash(categories.reduce((sum,row)=>sum+Number(row[name]),0));
       return {cash:summary,cashReconciled,duesCash:total('dues'),loanCashIn:total('loan_in'),loanCashOut:total('loan_out'),homes:Number(housing.total),dues,journal,duty,
        outgoing:categories.filter(row=>Number(row.outgoing)!==0).map(row=>({category:row.category,amount:roundCash(Number(row.outgoing))})).sort((a,b)=>b.amount-a.amount)};
    }),
    getCommunityProfile(),
    QRCode.toDataURL(shareUrl,{margin:2,width:180}).catch(()=>''),
  ]);
  const previous=monthShift(period,-1);
  const next=monthShift(period,1);
  return {...data,period,periodLabel:billingMonthLabel(year,month),currentMonth,previousMonth:previous>='1900-01'?previous:null,nextMonth:next<=currentMonth?next:null,
    communityName:profile.communityName,bank:profile.bankAccount?{name:profile.bankName,number:profile.bankAccount,holder:profile.accountHolder}:null,shareUrl,qrCode};
}
