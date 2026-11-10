import QRCode from 'qrcode';
import { query } from '../db/operational-query';
import { billingMonthKey, billingMonthLabel, financeDate, invoiceCollected, invoiceRemaining, BILLING_MONTHS } from '../lib/billing-data';
import { currentFinanceMonth, ledgerSources, monthBounds } from '../lib/cash-data';
import { getBillableProperties } from './billing.service';
import { getCashLedger } from './cash-ledger.service';
import { getCommunityProfile, getSecurityShiftRoster, type SecurityShiftRoster } from './settings.service';

export interface MonthStatus {
  monthIndex: number;
  monthCode: string; // '01'..'08'
  monthName: string; // 'Jan', 'Feb', ...
  fullName: string;  // 'Januari 2026'
  isPaid: boolean;
  isBilled?: boolean;
  amount: number;
  paidAt?: string;
}

export interface HouseholdDuesRecord {
  propertyId: string;
  propertyCode: string;
  residentName: string;
  months: MonthStatus[];
  paidMonthsCount: number;
  totalMonthsCount: number;
  unpaidMonths: string[];
  totalPaidAmount: number;
  totalArrearsAmount: number;
  isFullyPaid: boolean;
  isCurrentMonthPaid?: boolean;
}

export interface UnpaidHouseDetail {
  propertyCode: string;
  residentName: string;
  unpaidMonths: string[];
  arrearsAmount: number;
  paidMonthsCount: number;
  phone?: string;
  isCurrentMonthPaid?: boolean;
}

export interface PublicLedgerEntry {
  id: string;
  date: string;
  voucherRef: string;
  category: string;
  description: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  balance: number;
  reconciled: boolean;
  notes?: string;
}

export interface PublicTransparencyData {
  periodName: string;
  year: number;
  month: number;
  totalProperties: number;
  paidProperties: number;
  unpaidProperties: number;
  paidPercentage: number;
  unpaidPercentage: number;
  income: number;
  expense: number;
  openingBalance: number;
  closingBalance: number;
  unpaidHouses: string[];
  unpaidDetailedList: UnpaidHouseDetail[];
  currentMonthUnpaidList?: UnpaidHouseDetail[];
  pastArrearsList?: UnpaidHouseDetail[];
  householdDuesList: HouseholdDuesRecord[];
  ledgerEntries: PublicLedgerEntry[];
  journalCount: number;
  expenseBreakdown: Array<{
    name: string;
    percentage: number;
    amount: number;
    icon: string;
  }>;
  // Bukti pengeluaran riil per periode (sumber modal "Lihat Nota")
  expenseItems: Array<{
    id: string;
    date: string;
    title: string;
    description: string;
    amount: number;
    categoryName: string;
  }>;
  // Roster jadwal shift & penugasan area jaga (publik, dikelola pengurus)
  securityRoster: SecurityShiftRoster;
  // Tampilan roster siap-render: petugas yang sedang dinas hari ini + jadwal
  // rotasi estafet 7 hari ke depan (dihitung server per zona WIB).
  securityRosterView?: {
    onDutyIndex: number;
    handoverTime: string;
    weekSchedule: Array<{
      iso: string;
      dayShort: string;
      dayNum: number;
      monthShort: string;
      officerIndex: number;
      isToday: boolean;
    }>;
  };
  bankInfo?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  qrCodeDataUrl: string;
  lastUpdatedAt: string;
  communityName: string;
}

export async function getPublicMonthlyReport(year:number,month:number,origin:string):Promise<PublicTransparencyData> {
  const period = billingMonthKey(year,month);
  const [start,end] = monthBounds(period);
  const [cash,properties,invoices,expenseRows,[dues],profile] = await Promise.all([
    getCashLedger({month:period,pageSize:250}),
    getBillableProperties(),
    query<{property_id:string;month:number;status:string;total:number|string;paid_amount:number|string;paid_at:string|null}>(`SELECT i.property_id,p.month,i.status,i.total,i.paid_amount,i.paid_at
      FROM invoices i JOIN billing_periods p ON p.id=i.billing_period_id WHERE p.year=? AND p.month<=? AND i.status NOT IN ('VOID','WAIVED','CANCELLED')`,[year,month]),
    query<{id:string;title:string|null;date:string;amount:number|string;type:string;category:string;icon:string}>(`SELECT l.id,e.title,l.entry_date AS date,l.amount,l.source_type AS type,
      COALESCE(c.name,'Pengeluaran lain') AS category,COALESCE(c.icon,'CircleDot') AS icon
      FROM ledger_entries l LEFT JOIN expenses e ON e.id=l.source_id LEFT JOIN expense_categories c ON c.id=e.category_id
      WHERE l.source_type IN ('EXPENSE','EXPENSE_REVERSAL') AND l.entry_date>=? AND l.entry_date<? ORDER BY l.entry_date,l.id`,[start,end]),
    query<{amount:number|string}>(`SELECT COALESCE(SUM(CASE WHEN source_type='PAYMENT_REVERSAL' THEN -amount ELSE amount END),0) AS amount FROM ledger_entries
      WHERE source_type IN ('PAYMENT','PAYMENT_REVERSAL') AND entry_date>=? AND entry_date<?`,[start,end]),
    getCommunityProfile(),
  ]);
  const bankInfo = {bankName:profile.bankName,accountNumber:profile.bankAccount,accountHolder:profile.accountHolder};
  const invoiceIndex = new Map<string,typeof invoices>();
  for (const invoice of invoices) {
    const key = invoice.property_id+'|'+invoice.month;
    const group = invoiceIndex.get(key) || [];
    group.push(invoice);
    invoiceIndex.set(key,group);
  }
  const householdDuesList:HouseholdDuesRecord[] = [];
  const unpaidDetailedList:UnpaidHouseDetail[] = [];
  const currentMonthUnpaidList:UnpaidHouseDetail[] = [];
  const pastArrearsList:UnpaidHouseDetail[] = [];
  for (const property of properties) {
    let totalPaidAmount=0;
    let totalArrearsAmount=0;
    let paidMonthsCount=0;
    const unpaidMonths:string[] = [];
    const months = Array.from({length:month},(_,index)=>{
      const m = index+1;
      const group = invoiceIndex.get(property.id+'|'+m) || [];
      const bill = group.map(item=>({status:item.status,total:Number(item.total),paidAmount:Number(item.paid_amount)}));
      const isBilled = bill.length>0;
      const amount = bill.reduce((sum,item)=>sum+item.total,0);
      const remaining = bill.reduce((sum,item)=>sum+invoiceRemaining(item),0);
      const isPaid = isBilled && remaining===0;
      const fullName = billingMonthLabel(year,m);
      const paidAt = group.map(item=>item.paid_at).filter((value):value is string=>Boolean(value)).sort().at(-1);
      totalPaidAmount += bill.reduce((sum,item)=>sum+invoiceCollected(item),0);
      totalArrearsAmount += remaining;
      if (isPaid) paidMonthsCount++;
      if (remaining>0) unpaidMonths.push(fullName);
      return {monthIndex:m,monthCode:String(m).padStart(2,'0'),monthName:BILLING_MONTHS[index].slice(0,3),fullName,isPaid,isBilled,amount,paidAt};
    });
    const isCurrentMonthPaid = months[month-1]?.isPaid || false;
    const billedThisMonth = months[month-1]?.isBilled || false;
    const record = {propertyId:property.id,propertyCode:property.code,residentName:property.code,months,paidMonthsCount,
      totalMonthsCount:months.filter(item=>item.isBilled).length,unpaidMonths,totalPaidAmount,totalArrearsAmount,isFullyPaid:months.some(item=>item.isBilled) && !unpaidMonths.length,isCurrentMonthPaid};
    householdDuesList.push(record);
    if (unpaidMonths.length) {
      const item = {propertyCode:property.code,residentName:property.code,unpaidMonths,arrearsAmount:totalArrearsAmount,paidMonthsCount,isCurrentMonthPaid};
      unpaidDetailedList.push(item);
      if (billedThisMonth && !isCurrentMonthPaid) currentMonthUnpaidList.push(item);
      else pastArrearsList.push(item);
    }
  }
  const totalProps = properties.length;
  const paidProps = householdDuesList.filter(item=>item.isCurrentMonthPaid).length;
  const unpaidProps = currentMonthUnpaidList.length;
  const categories = new Map<string,{name:string;amount:number;icon:string}>();
  const expenseById = new Map(expenseRows.map(row=>[row.id,row]));
  const expenseItems = expenseRows.map(row=>{
    const amount = Number(row.amount)*(row.type==='EXPENSE_REVERSAL'?-1:1);
    const entry = categories.get(row.category) || {name:row.category,amount:0,icon:row.icon};
    entry.amount += amount;
    categories.set(row.category,entry);
    return {id:row.id,date:financeDate(row.date),title:(row.type==='EXPENSE_REVERSAL'?'Pembatalan: ':'')+(row.title || 'Pengeluaran kas'),
      description:'',amount,categoryName:row.category};
  });
  const positive = [...categories.values()].reduce((sum,item)=>sum+Math.max(0,item.amount),0);
  const expenseBreakdown = [...categories.values()].sort((a,b)=>b.amount-a.amount).map(item=>({...item,percentage:positive?Math.max(0,item.amount)/positive*100:0}));
  const ledgerEntries:PublicLedgerEntry[] = cash.entries.map(row=>{
    const linked = expenseById.get(row.id);
    const label = ledgerSources[row.sourceType] || (row.direction==='IN'?'Penerimaan lain':'Pengeluaran lain');
    return {id:row.id,date:financeDate(row.entryDate),voucherRef:'JRN-'+row.id.slice(-8).toUpperCase(),
      category:linked?.category || label,description:linked?.title ? (row.sourceType==='EXPENSE_REVERSAL'?'Pembatalan: ':'')+linked.title : label,
      type:row.direction==='IN'?'INCOME':'EXPENSE',amount:row.amount,balance:row.runningBalance,reconciled:false};
  });
  let qrCodeDataUrl = '';
  const securityRoster = await getSecurityShiftRoster().catch(() => null);
  let securityRosterView: PublicTransparencyData['securityRosterView'];
  if (securityRoster && securityRoster.shifts.length > 0) {
    // Rotasi estafet: petugas bergantian selang-seling tiap hari pada jam serah
    // terima (WIB). Dinas berjalan pagi-s/d-pagi, sehingga sebelum jam serah
    // terima yang dinas masih petugas dari tanggal sebelumnya.
    const DAY_SHORT = ['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'];
    const MONTH_SHORT = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES'];
    const n = securityRoster.shifts.length;
    const handoverTime = securityRoster.handoverTime || '07:00';
    const handoverHour = parseInt(handoverTime.split(':')[0], 10) || 7;
    const nowWib = new Date(Date.now() + 7 * 3600 * 1000);
    const eff = new Date(nowWib);
    if (nowWib.getUTCHours() < handoverHour) {
      eff.setUTCDate(eff.getUTCDate() - 1);
    }
    const effIso = eff.toISOString().slice(0, 10);
    const startIso = securityRoster.rotationStartDate || effIso;
    const days = Math.floor((Date.parse(effIso) - Date.parse(startIso)) / 86400000);
    const onDutyIndex = ((days % n) + n) % n;

    const weekSchedule = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(nowWib);
      d.setUTCDate(d.getUTCDate() + i);
      const iso = d.toISOString().slice(0, 10);
      return {
        iso,
        dayShort: DAY_SHORT[d.getUTCDay()],
        dayNum: d.getUTCDate(),
        monthShort: MONTH_SHORT[d.getUTCMonth()],
        officerIndex: (((days + i) % n) + n) % n,
        isToday: i === 0,
      };
    });

    securityRosterView = { onDutyIndex, handoverTime, weekSchedule };
  }
  try {
    qrCodeDataUrl = await QRCode.toDataURL(`${origin}/transparency/${year}/${month.toString().padStart(2, '0')}`, {
      margin: 1,
      width: 140,
      color: { dark: '#18201D', light: '#FFFFFF' }
    });
  } catch (e) {
    qrCodeDataUrl = '';
  }

  return {
    periodName:billingMonthLabel(year,month),year,month,
    totalProperties:totalProps,paidProperties:paidProps,unpaidProperties:unpaidProps,
    paidPercentage:totalProps?paidProps/totalProps*100:0,unpaidPercentage:totalProps?unpaidProps/totalProps*100:0,
    income:Number(dues?.amount || 0),expense:cash.summary.outgoing,openingBalance:cash.summary.opening,closingBalance:cash.summary.closing,
    unpaidHouses:unpaidDetailedList.map(item=>item.propertyCode),unpaidDetailedList,currentMonthUnpaidList,pastArrearsList,householdDuesList,
    ledgerEntries,journalCount:cash.summary.count,expenseBreakdown,expenseItems,
    securityRoster:securityRoster || {shifts:[],notes:'Roster jadwal shift petugas jaga akan diperbarui oleh pengurus.'},
    securityRosterView,bankInfo,qrCodeDataUrl,lastUpdatedAt:new Date().toLocaleString('id-ID',{dateStyle:'long',timeStyle:'short',timeZone:'Asia/Jakarta'})+' WIB',
    communityName:profile.communityName,
  };
}
export function publicReportPeriod(year: string|null|undefined, month: string|null|undefined) {
  const fallback = currentFinanceMonth().split('-').map(Number);
  const requestedYear = Number(year);
  const requestedMonth = Number(month);
  return {year: Number.isInteger(requestedYear) && requestedYear>=1900 && requestedYear<=2199?requestedYear:fallback[0],
    month: Number.isInteger(requestedMonth) && requestedMonth>=1 && requestedMonth<=12?requestedMonth:fallback[1]};
}
