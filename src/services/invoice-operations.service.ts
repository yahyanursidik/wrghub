import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { writeTransaction, type Query } from '../db/operational-query';
import type { UserSession } from '../types/auth';
import { dateField, idField, OperationalError, operationalAudit, textField } from './operational-mutation';
import { recordInvoicePayment } from './payment.service';

const money=z.number().int().nonnegative().max(1e9);
const amount=money.positive();
const months=['januari','februari','maret','april','mei','juni','juli','agustus','september','oktober','november','desember'];
export const invoiceCreate=z.object({
  propertyCode:textField(64).min(1),periodName:textField(100).min(2),total:amount,dueDate:dateField,
  status:z.enum(['UNPAID','PAID']).default('UNPAID'),paymentMethod:textField(40).optional(),paidAt:dateField.optional(),
  securityFee:money.optional(),cleaningFee:money.optional(),sinkingFund:money.optional(),additionalFee:money.optional(),notes:textField(2000).optional(),
});
export const invoiceEdit=z.object({invoiceId:idField,status:z.literal('UNPAID').optional(),total:amount.optional(),dueDate:dateField.optional(),notes:textField(2000).optional()});
export const invoiceCancel=z.object({invoiceId:idField,reason:textField(500).optional()});
const timeNow=()=>new Date().toISOString();
type Period={id:string;name:string;year:number;month:number;status:string};
async function readInvoice(run:Query,id:string) {
  const [row]=await run<{id:string;property_id:string;property_code:string;period_name:string;invoice_number:string;status:string;total:number|string;paid_amount:number|string;due_date:string;issued_at:string;paid_at:string|null;notes:string|null}>(`SELECT i.*,p.code AS property_code,b.name AS period_name FROM invoices i
    JOIN properties p ON p.id=i.property_id JOIN billing_periods b ON b.id=i.billing_period_id WHERE i.id=?`,[id]);
  return {id:row.id,propertyId:row.property_id,propertyCode:row.property_code,periodName:row.period_name,invoiceNumber:row.invoice_number,status:row.status,total:Number(row.total),
    paidAmount:Number(row.paid_amount),dueDate:row.due_date,issuedAt:row.issued_at,paidAt:row.paid_at,notes:row.notes};
}
export async function createInvoice(data:z.output<typeof invoiceCreate>,actor:UserSession) {
  return writeTransaction(async (run,lock)=>{
    const [property]=await run<{id:string;community_id:string;code:string}>('SELECT id,community_id,code FROM properties WHERE lower(code)=lower(?) AND is_active=true',[data.propertyCode]);
    if(!property?.community_id) throw new OperationalError('Rumah aktif tidak ditemukan.',404);
    await run('SELECT id FROM communities WHERE id=?'+lock,[property.community_id]);
    const exact=await run<Period>('SELECT id,name,year,month,status FROM billing_periods WHERE community_id=? AND lower(name)=lower(?) LIMIT 2',[property.community_id,data.periodName]);
    const [namedMonth,namedYear]=data.periodName.toLowerCase().split(/\s+/);
    const year=exact[0]?.year || Number(namedYear), month=exact[0]?.month || months.indexOf(namedMonth)+1;
    if(exact.length>1 || !Number.isInteger(year) || year<2025 || year>2100 || !month) throw new OperationalError('Pilih periode yang valid, misalnya November 2026.',400);
    const yearMonth=year+'-'+String(month).padStart(2,'0');
    const start=yearMonth+'-01';
    if(data.dueDate<start) throw new OperationalError('Jatuh tempo mendahului awal periode.',400);
    const matching=await run<Period>('SELECT id,name,year,month,status FROM billing_periods WHERE community_id=? AND year=? AND month=? LIMIT 2',[property.community_id,year,month]);
    if(matching.length>1 || (matching[0] && matching[0].status!=='OPEN')) throw new OperationalError('Periode sudah ditutup atau ganda.');
    const periodId=matching[0]?.id || 'period-'+yearMonth;
    if(!matching[0]) await run("INSERT INTO billing_periods (id,community_id,year,month,name,due_date,status) VALUES (?,?,?,?,?,?,'OPEN')",
      [periodId,property.community_id,year,month,data.periodName,data.dueDate]);
    if((await run('SELECT id FROM invoices WHERE property_id=? AND billing_period_id=? LIMIT 1',[property.id,periodId])).length)
      throw new OperationalError('Rumah sudah memiliki tagihan periode ini. Buka Pembayaran untuk mencatat setoran.');
    const id='inv-'+randomUUID();
    const invoiceNumber='INV-'+yearMonth.replace('-','')+'-'+property.code.replace(/[^A-Za-z0-9]/g,'').toUpperCase()+'-'+id.slice(4,12).toUpperCase();
    await run("INSERT INTO invoices (id,property_id,billing_period_id,invoice_number,status,subtotal,total,paid_amount,due_date,issued_at,notes) VALUES (?,?,?,?,'UNPAID',?,?,0,?,?,?)",
      [id,property.id,periodId,invoiceNumber,data.total,data.total,data.dueDate,start,data.notes || null]);
    const parts: [string,number][] = [['Keamanan',data.securityFee || 0],['Kebersihan',data.cleaningFee || 0],['Kas lingkungan',data.sinkingFund || 0],['Tambahan',data.additionalFee || 0]];
    const items = parts.reduce((sum,part)=>sum+part[1],0) === data.total ? parts.filter(part=>part[1]>0) : [['Iuran lingkungan',data.total] as [string,number]];
    for(const [description,value] of items) await run('INSERT INTO invoice_items (id,invoice_id,description,amount) VALUES (?,?,?,?)',['item-'+randomUUID(),id,description,value]);
    await operationalAudit(run,actor,'billing.create_invoice','INVOICE',id,{periodId,total:data.total});
    const payment = data.status==='PAID' ? await recordInvoicePayment(run,lock,{id,property_id:property.id,billing_period_id:periodId,status:'UNPAID',total:data.total,paid_amount:0},
      {amount:data.total,method:data.paymentMethod || 'CASH',notes:data.notes},actor,data.paidAt ? data.paidAt+'T12:00:00+07:00' : timeNow()) : null;
    return {...await readInvoice(run,id),payment,newBalance:payment?.accountBalance};
  });
}
async function guardUnbooked(run:Query,lock:string,id:string) {
  const [invoice]=await run<{id:string;property_id:string;billing_period_id:string;status:string;paid_amount:number|string;total:number|string;issued_at:string}>(
    'SELECT id,property_id,billing_period_id,status,paid_amount,total,issued_at FROM invoices WHERE id=?'+lock,[id]);
  if(!invoice) throw new OperationalError('Tagihan tidak ditemukan.',404);
  if(!['UNPAID','OVERDUE'].includes(invoice.status) || Number(invoice.paid_amount)>0 ||
    (await run(`SELECT id FROM payments WHERE status IN ('VERIFIED','PENDING') AND
      (invoice_id=? OR (invoice_id IS NULL AND property_id=? AND billing_period_id=?)) LIMIT 1`,[id,invoice.property_id,invoice.billing_period_id])).length)
    throw new OperationalError('Tagihan dengan pembayaran atau riwayat pelunasan tidak dapat diubah atau dibatalkan di sini.');
  return invoice;
}
export async function editInvoice(data:z.output<typeof invoiceEdit>,actor:UserSession) {
  return writeTransaction(async(run,lock)=>{
    const invoice=await guardUnbooked(run,lock,data.invoiceId);
    if(data.dueDate && data.dueDate<invoice.issued_at.slice(0,10)) throw new OperationalError('Jatuh tempo mendahului tanggal terbit.',400);
    await run('UPDATE invoices SET subtotal=coalesce(?,subtotal),total=coalesce(?,total),due_date=coalesce(?,due_date),notes=coalesce(?,notes),updated_at=? WHERE id=?',
      [data.total ?? null,data.total ?? null,data.dueDate ?? null,data.notes ?? null,timeNow(),data.invoiceId]);
    if(data.total !== undefined && data.total!==Number(invoice.total)) {
      await run('DELETE FROM invoice_items WHERE invoice_id=?',[data.invoiceId]);
      await run('INSERT INTO invoice_items (id,invoice_id,description,amount) VALUES (?,?,?,?)',['item-'+randomUUID(),data.invoiceId,'Iuran lingkungan',data.total]);
    }
    await operationalAudit(run,actor,'billing.update_invoice','INVOICE',data.invoiceId,{total:data.total,dueDate:data.dueDate});
    return readInvoice(run,data.invoiceId);
  });
}
export async function cancelInvoice(data:z.output<typeof invoiceCancel>,actor:UserSession) {
  return writeTransaction(async(run,lock)=>{
    await guardUnbooked(run,lock,data.invoiceId);
    await run("UPDATE invoices SET status='CANCELLED',updated_at=? WHERE id=?",[timeNow(),data.invoiceId]);
    await operationalAudit(run,actor,'billing.cancel_invoice','INVOICE',data.invoiceId,{reason:data.reason || null});
    return {id:data.invoiceId,status:'CANCELLED'};
  });
}
