import { billingMonthKey, invoiceCollected, invoiceRemaining } from './billing-data';
import { cashRupiah, financeMonth, type CashPeriodSummary } from './cash-data';

const publicOrigin = 'https://wrghub.vercel.app';
const portalUrl = publicOrigin + '/warga';
const grouped = new Intl.NumberFormat('id-ID',{maximumFractionDigits:1});
const longDate = new Intl.DateTimeFormat('id-ID',{day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Jakarta'});

export const financeWhatsAppTemplates = {
  dues_detail:'Laporan iuran lengkap', dues_summary:'Ringkasan iuran', dues_thr:'Iuran & THR penjaga',
  cash:'Laporan kas bulanan', bank:'Siaran rekening resmi',
} as const;
export type FinanceWhatsAppTemplate = keyof typeof financeWhatsAppTemplates;
export type WhatsAppDuesPeriod = {id:string;name:string;year:number;month:number;status:string};
export type WhatsAppDuesInvoice = {
  propertyId:string;propertyCode:string;billingPeriodId:string;status:string;total:number;paidAmount:number;pendingPaymentId?:string|null;
};
export interface FinanceWhatsAppProfile {
  communityName:string;bankName:string;bankAccount:string;accountHolder:string;
}

type Unit = {code:string;remaining:number;pending:boolean};
export interface WhatsAppDuesReport {
  period:WhatsAppDuesPeriod;paid:Unit[];unpaid:Unit[];pending:Unit[];
  earlier: {code:string;months:string[];remaining:number}[];
  billed:number;received:number;remaining:number;
}

const periodOrder = (period:WhatsAppDuesPeriod) => period.year*12+period.month;
const eligible = (invoice:WhatsAppDuesInvoice) => invoice.propertyId && !['WAIVED','VOID','CANCELLED'].includes(invoice.status);
const byCode = <T extends {code:string}>(a:T,b:T) => a.code.localeCompare(b.code,'id',{numeric:true});

export function preferredWhatsAppPeriod(periods:WhatsAppDuesPeriod[],id:string,today:string) {
  const [year,month] = today.split('-').map(Number);
  return periods.find(item=>item.id===id) || periods.find(item=>item.year===year && item.month===month) || periods.find(item=>item.status==='OPEN') || periods[0];
}

export function getWhatsAppDuesReport(period:WhatsAppDuesPeriod,periods:WhatsAppDuesPeriod[],invoices:WhatsAppDuesInvoice[]):WhatsAppDuesReport {
  const active = new Map<string,Unit>();
  const past = new Map<string,{code:string;periods:Map<string,WhatsAppDuesPeriod>;remaining:number}>();
  const periodsById = new Map(periods.map(item=>[item.id,item]));
  let billed=0,received=0,remaining=0;
  for (const invoice of invoices) {
    if (!eligible(invoice)) continue;
    const left = invoiceRemaining(invoice);
    if (invoice.billingPeriodId===period.id) {
      const unit = active.get(invoice.propertyId) || {code:invoice.propertyCode,remaining:0,pending:false};
      unit.remaining += left;
      unit.pending ||= left>0 && Boolean(invoice.pendingPaymentId);
      active.set(invoice.propertyId,unit);
      billed += invoice.total;
      received += invoiceCollected(invoice);
      remaining += left;
    } else if (left>0) {
      const earlier = periodsById.get(invoice.billingPeriodId);
      if (!earlier || periodOrder(earlier)>=periodOrder(period)) continue;
      const unit = past.get(invoice.propertyId) || {code:invoice.propertyCode,periods:new Map<string,WhatsAppDuesPeriod>(),remaining:0};
      unit.remaining += left;
      unit.periods.set(earlier.id,earlier);
      past.set(invoice.propertyId,unit);
    }
  }
  const units = [...active.values()].sort(byCode);
  return {period,paid:units.filter(unit=>unit.remaining===0),pending:units.filter(unit=>unit.remaining>0 && unit.pending),
    unpaid:units.filter(unit=>unit.remaining>0 && !unit.pending),earlier:[...past.values()].sort(byCode).map(unit=>({code:unit.code,
      months:[...unit.periods.values()].sort((a,b)=>periodOrder(a)-periodOrder(b)).map(item=>item.name),remaining:unit.remaining})),billed,received,remaining};
}

export function financeWhatsAppBank(profile:FinanceWhatsAppProfile|null) {
  const account = profile?.bankAccount.trim() || '';
  return /^\d[\d\s.-]*\d$/.test(account) && account.replace(/\D/g,'').length>=5 ?
    [profile?.bankName.trim() || 'Rekening bank',account,profile?.accountHolder.trim() ? 'a.n. '+profile.accountHolder.trim() : ''].filter(Boolean).join(' · ') : '';
}

type MessageOptions = {date:string;greeting:string;title:string;notes:string;includeUnits:boolean;profile:FinanceWhatsAppProfile|null};
type MessageSource =
  {template:'dues_detail'|'dues_summary'|'dues_thr';report:WhatsAppDuesReport} |
  {template:'cash';summary:CashPeriodSummary;month:string} |
  {template:'bank'};

function limited<T>(items:T[],format:(item:T)=>string) {
  const count = 16;
  return [...items.slice(0,count).map(format),...(items.length>count?['… dan '+(items.length-count)+' rumah lainnya.']:[])];
}
const transparencyUrl = (month:string)=>publicOrigin+'/transparency/'+month.replace('-','/');

export function buildFinanceWhatsAppMessage(source:MessageSource,options:MessageOptions) {
  const {profile,date,greeting,title,notes,includeUnits} = options;
  const bank = financeWhatsAppBank(profile);
  if (source.template==='bank' && !bank) return '';
  const dateValue = date ? new Date(date+'T12:00:00+07:00') : null;
  const dateText = dateValue && Number.isFinite(dateValue.getTime()) ? longDate.format(dateValue) : '';
  const community = profile?.communityName.trim() || 'Lingkungan WargaHub';
  const period = source.template==='bank'?'':source.template==='cash'?financeMonth(source.month):source.report.period.name;
  const heading = (title.trim() || financeWhatsAppTemplates[source.template]).replaceAll('{tanggal}',dateText).replaceAll('{bulan}',period);
  const body = [`*${heading}*`,community,...(period?[`Periode: *${period}*`]:[]),...(dateText?[`Diperbarui: ${dateText}`]:[]),'',greeting.trim() || 'Halo Bapak/Ibu warga,',''];

  if (source.template==='cash') {
    const {summary} = source;
    body.push('📊 *Ringkasan Buku Kas*',`• Saldo awal: *${cashRupiah(summary.opening)}*`,`• Pemasukan bersih: *${cashRupiah(summary.income)}*`,
      `• Pengeluaran bersih: *${cashRupiah(summary.outgoing)}*`,`• Saldo akhir: *${cashRupiah(summary.closing)}*`,'',
      'Laporan transparansi warga:',transparencyUrl(source.month));
  } else if (source.template==='bank') {
    body.push('💳 *Rekening resmi pembayaran iuran*',bank,'','Cantumkan kode rumah saat transfer. Konfirmasi pembayaran dan buka kuitansi di portal warga:',portalUrl);
  } else {
    const report = source.report;
    const issued = report.paid.length+report.unpaid.length+report.pending.length;
    if (!issued) body.push('Belum ada tagihan aktif untuk periode ini.','');
    if (includeUnits && source.template!=='dues_summary' && issued) {
      const sections = [
        {label:'✅ *Sudah lunas',items:report.paid,format:(unit:Unit)=>`• ${unit.code}`},
        {label:'⏳ *Menunggu verifikasi',items:report.pending,format:(unit:Unit)=>`• ${unit.code} · sisa ${cashRupiah(unit.remaining)}`},
        {label:'📌 *Belum lunas',items:report.unpaid,format:(unit:Unit)=>`• ${unit.code} · sisa ${cashRupiah(unit.remaining)}`},
      ];
      for (const {label,items,format} of sections) if (items.length) body.push(`${label} (${items.length} rumah)*`,...limited(items,format),'');
    }
    if (includeUnits && source.template!=='dues_summary' && report.earlier.length) {
      body.push('📅 *Sisa dari periode sebelumnya*',...limited(report.earlier,unit=>`• ${unit.code} · ${unit.months.join(', ')} · ${cashRupiah(unit.remaining)}`),'');
    }
    body.push('📊 *Ringkasan iuran periode ini*',`• Lunas: *${report.paid.length}/${issued} rumah*${issued?` (${grouped.format(report.paid.length/issued*100)}%)`:''}`,
      ...(report.pending.length?[`• Menunggu verifikasi: *${report.pending.length} rumah*`]:[]),`• Total tagihan: *${cashRupiah(report.billed)}*`,
      `• Iuran terbayar: *${cashRupiah(report.received)}*`,`• Sisa tagihan: *${cashRupiah(report.remaining)}*`,'',
      'Rekap iuran:',publicOrigin+'/rekap-iuran?'+new URLSearchParams({period:report.period.id}),
      'Laporan transparansi:',transparencyUrl(billingMonthKey(report.period.year,report.period.month)));
    if (bank) body.push('','💳 *Rekening resmi iuran*',bank,'Konfirmasi pembayaran: '+portalUrl);
  }
  if (notes.trim()) body.push('','*Catatan pengurus*',notes.trim());
  body.push('','Terima kasih.','*Pengurus '+community+'*');
  return body.join('\n');
}

/** Empty means the user will choose a recipient in WhatsApp; null means invalid. */
export function financeWhatsAppNumber(value:string):string|null {
  const raw = value.trim();
  if (!raw) return '';
  const compact = raw.replace(/[\s()-]/g,'');
  if (!/^\+?\d+$/.test(compact)) return null;
  const digits = compact.startsWith('+') ? compact.slice(1) : compact.startsWith('00') ? compact.slice(2) : compact.replace(/^0/,'62');
  return /^[1-9]\d{7,14}$/.test(digits) ? digits : null;
}

export function financeWhatsAppLink(message:string,number:string):string|null {
  const recipient = financeWhatsAppNumber(number);
  if (!message.trim() || recipient===null) return null;
  return 'https://wa.me/'+recipient+'?'+new URLSearchParams({text:message.trim()}).toString().replace(/\+/g,'%20');
}
