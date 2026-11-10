import assert from 'node:assert/strict';
import { buildFinanceWhatsAppMessage, financeWhatsAppLink, financeWhatsAppNumber, getWhatsAppDuesReport, preferredWhatsAppPeriod, type WhatsAppDuesInvoice } from '../src/lib/finance-whatsapp';

const periods = [
  {id:'next',name:'November 2026',year:2026,month:11,status:'OPEN'},
  {id:'selected',name:'Oktober 2026',year:2026,month:10,status:'CLOSED'},
  {id:'previous',name:'September 2026',year:2026,month:9,status:'CLOSED'},
];
const invoice = (propertyCode:string,billingPeriodId:string,status:string,total:number,paidAmount=0,pendingPaymentId?:string):WhatsAppDuesInvoice =>
  ({propertyId:propertyCode,propertyCode,billingPeriodId,status,total,paidAmount,pendingPaymentId});
const report = getWhatsAppDuesReport(periods[1],periods,[
  invoice('A-01','selected','PARTIAL',250000,90000,'waiting'),
  invoice('A-01','selected','PAID',50000,50000),
  invoice('A-02','selected','PAID',200000),
  invoice('A-03','selected','WAIVED',100000),
  invoice('A-04','selected','CANCELLED',100000),
  invoice('A-05','previous','PARTIAL',80000,30000),
  invoice('A-06','next','UNPAID',9999999),
]);
assert.equal(preferredWhatsAppPeriod(periods,'','2026-10-30')?.id,'selected');
assert.deepEqual(report.paid.map(item=>item.code),['A-02']);
assert.deepEqual(report.pending.map(item=>item.code),['A-01']);
assert.deepEqual([report.billed,report.received,report.remaining],[500000,340000,160000]);
assert.deepEqual(report.earlier,[{code:'A-05',months:['September 2026'],remaining:50000}]);

const options = {date:'2026-10-31',greeting:'Wilujeng enjing.',title:'Rekap {bulan}',notes:'Catatan uji.',includeUnits:true,
  profile:{communityName:'Lingkungan Uji',bankName:'Bank Uji',bankAccount:'01234567890',accountHolder:'Pemegang Uji'}};
const full = buildFinanceWhatsAppMessage({template:'dues_detail',report},options);
assert.match(full,/Rekap Oktober 2026/);
assert.match(full,/31 Oktober 2026/);
assert.match(full,/A-01.*Rp160\.000/);
assert.match(full,/A-05.*September 2026.*Rp50\.000/);
assert.match(full,/\/rekap-iuran\?period=selected/);
assert.match(full,/\/transparency\/2026\/10/);
assert.match(full,/Bank Uji · 01234567890 · a\.n\. Pemegang Uji/);
assert.doesNotMatch(full,/A-03|A-04|A-06|9\.999\.999|November 2026/);
const short = buildFinanceWhatsAppMessage({template:'dues_summary',report},options);
assert.doesNotMatch(short,/A-01|A-05/);
assert.match(short,/Rp340\.000/);
const noAccount = buildFinanceWhatsAppMessage({template:'bank'},{...options,profile:{...options.profile,bankAccount:'BCA_MAIN'}});
assert.equal(noAccount,'');
const cash = buildFinanceWhatsAppMessage({template:'cash',month:'2026-10',summary:{opening:1000000,closing:940000,income:100000,outgoing:160000,transfers:0,openingEntries:0,count:2}},options);
assert.match(cash,/Saldo akhir menurut buku kas: \*Rp940\.000\*/);
assert.match(cash,/Pengeluaran yang belum dicatat belum mengurangi angka ini/);
assert.doesNotMatch(cash,/01234567890/);

assert.equal(financeWhatsAppNumber('0812-3456-7890'),'6281234567890');
assert.equal(financeWhatsAppNumber('+1 (202) 555-0123'),'12025550123');
assert.equal(financeWhatsAppNumber('0062 812 3456 7890'),'6281234567890');
assert.equal(financeWhatsAppNumber('0812abcd890'),null);
assert.equal(financeWhatsAppLink(full,'123'),null);
const blankRecipient = new URL(financeWhatsAppLink(full,'')!);
assert.equal(blankRecipient.origin,'https://wa.me');
assert.equal(blankRecipient.pathname,'/');
assert.equal(blankRecipient.searchParams.get('text'),full);
assert.equal(new URL(financeWhatsAppLink(full,'0812 3456 7890')!).pathname,'/6281234567890');
console.log('PASS template WA keuangan: periode, saldo parsial, antrean, pengecualian tagihan, laporan kas, rekening resmi, dan tautan tanpa mengirim pesan.');
