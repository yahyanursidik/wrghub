import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { query, writeTransaction, type Query } from '../db/operational-query';
import type { UserSession } from '../types/auth';
import { archiveInput, dateField, idField, OperationalError, operationalAudit, requiredIds, textField } from './operational-mutation';

export interface PaymentListItem {
  id:string; propertyCode:string; amount:number; method:string; reference:string|null; proofFileUrl:string|null;
  proofUrl?:string|null; billingPeriodId?:string|null; invoiceId?:string|null; status:string; paidAt:string; notes:string|null;
  periodName?:string; invoiceNumber?:string; verifiedAt?:string|null; rejectionReason?:string|null;
}
type Row={id:string;property_id:string|null;property_code:string|null;billing_period_id:string|null;invoice_id:string|null;amount:number|string;method:string;
  reference:string|null;proof_file_url:string|null;status:string;paid_at:string|Date;notes:string|null;period_name:string|null;
  verified_at:string|Date|null;rejection_reason:string|null;invoice_number:string|null};
const iso=(value:string|Date)=>value instanceof Date?value.toISOString():value;
export async function getPayments(billingPeriodId?:string,status?:string,propertyId?:string,paymentId?:string):Promise<PaymentListItem[]> {
  const conditions:string[]=[];
  const values:string[]=[];
  for (const [column,value] of [['p.billing_period_id',billingPeriodId],['p.status',status],['p.property_id',propertyId],['p.id',paymentId]]) {
    if(value) {conditions.push(column+'=?');values.push(value);}
  }
  const rows=await query<Row>(`SELECT p.id,p.property_id,p.billing_period_id,p.invoice_id,p.amount,p.method,p.reference,p.proof_file_url,
    p.status,p.paid_at,p.notes,p.verified_at,p.rejection_reason,pr.code AS property_code,b.name AS period_name,i.invoice_number FROM payments p
    LEFT JOIN properties pr ON pr.id=p.property_id LEFT JOIN billing_periods b ON b.id=p.billing_period_id LEFT JOIN invoices i ON i.id=p.invoice_id
    ${conditions.length?'WHERE '+conditions.join(' AND '):''} ORDER BY p.paid_at DESC,p.created_at DESC,p.id`,values);
  return rows.map(row=>({id:row.id,propertyCode:row.property_code || 'N/A',invoiceId:row.invoice_id,billingPeriodId:row.billing_period_id,amount:Number(row.amount),
    method:row.method,reference:row.reference,proofFileUrl:row.proof_file_url,status:row.status,paidAt:iso(row.paid_at),notes:row.notes,
    periodName:row.period_name || '',invoiceNumber:row.invoice_number || undefined,verifiedAt:row.verified_at ? iso(row.verified_at) : null,rejectionReason:row.rejection_reason}));
}
export async function getPendingPaymentsCount() {
  const [row]=await query<{count:number|string}>("SELECT count(*) AS count FROM payments WHERE status='PENDING'");
  return Number(row.count);
}

const rupiah = z.number().int().positive().max(1e12);
const paymentFields=z.object({
  amount:rupiah,method:textField(40).min(1).default('TRANSFER'),reference:textField(100).optional(),
  proofFileUrl:textField(1500).refine(value=>value.startsWith('https://') || (value.startsWith('/uploads/') && !value.includes('..')),'Tautan bukti tidak valid.').optional(),
  notes:textField(2000).optional(),
});
export const paymentSubmit=paymentFields.extend({propertyId:idField,billingPeriodId:idField,invoiceId:idField.optional()});
export const paymentVerify=z.object({paymentId:idField,accountId:idField.optional()});
export const paymentReject=z.object({paymentId:idField,reason:textField(500).min(2).default('Bukti pembayaran tidak valid.')});
export const manualPayment=paymentFields.extend({
  propertyCode:textField(64).min(1),periodName:textField(100).min(1),
  status:z.enum(['PENDING','VERIFIED']).default('VERIFIED'),paidAt:dateField.optional(),proofUrl:textField(1500).refine(value=>value.startsWith('https://')).optional(),
  accountId:idField.optional(),
});
type InvoiceRow={id:string;property_id:string;billing_period_id:string;status:string;total:number|string;paid_amount:number|string};
type PendingRow={id:string;property_id:string;billing_period_id:string;invoice_id:string|null;amount:number|string;status:string;paid_at:string|Date};
const payable=new Set(['UNPAID','PARTIAL','PARTIALLY_PAID','PENDING_VERIFICATION','OVERDUE']);
async function findInvoice(run:Query,lock:string,propertyId:string,periodId:string,invoiceId?:string|null) {
  const rows=await run<InvoiceRow>(`SELECT id,property_id,billing_period_id,status,total,paid_amount FROM invoices
    WHERE property_id=? AND billing_period_id=? ${invoiceId?'AND id=?':''} ORDER BY id LIMIT 2`+lock,
    invoiceId?[propertyId,periodId,invoiceId]:[propertyId,periodId]);
  if(rows.length!==1) throw new OperationalError('Pilih tagihan yang tepat untuk rumah dan periode ini.',400);
  return rows[0];
}
function checkAmount(invoice:InvoiceRow,amount:number) {
  if(!payable.has(invoice.status)) throw new OperationalError('Tagihan ini tidak menerima pembayaran.');
  if(!Number.isSafeInteger(amount)||amount<=0||amount>Number(invoice.total)-Number(invoice.paid_amount))
    throw new OperationalError('Nominal melebihi sisa tagihan atau tidak valid.',400);
}
async function insertPending(run:Query,invoice:InvoiceRow,input:z.output<typeof paymentFields>,actor:UserSession,paidAt:string) {
  checkAmount(invoice,input.amount);
  const pending=await run(`SELECT id FROM payments WHERE status='PENDING' AND
    (invoice_id=? OR (invoice_id IS NULL AND property_id=? AND billing_period_id=?)) LIMIT 1`,[invoice.id,invoice.property_id,invoice.billing_period_id]);
  if(pending.length) throw new OperationalError('Tagihan ini sudah memiliki pembayaran yang menunggu verifikasi.');
  const id=`pay-${randomUUID()}`;
  const reference=input.reference || id;
  const previous=await run("SELECT id FROM payments WHERE invoice_id=? AND upper(reference)=upper(?) AND status='VERIFIED' LIMIT 1",[invoice.id,reference]);
  if(previous.length) throw new OperationalError('Referensi ini sudah dibukukan pada tagihan tersebut.');
  await run(`INSERT INTO payments (id,property_id,billing_period_id,invoice_id,amount,method,reference,proof_file_url,status,notes,paid_at,submitted_by)
    VALUES (?,?,?,?,?,?,?,?,'PENDING',?,?,?)`,
    [id,invoice.property_id,invoice.billing_period_id,invoice.id,input.amount,input.method,reference,input.proofFileUrl || null,input.notes || null,paidAt,actor.id]);
  await operationalAudit(run,actor,'payment.submit','PAYMENT',id,{invoiceId:invoice.id,amount:input.amount});
  return {id,property_id:invoice.property_id,billing_period_id:invoice.billing_period_id,invoice_id:invoice.id,amount:input.amount,status:'PENDING',paid_at:paidAt};
}
export async function submitPayment(input:z.output<typeof paymentSubmit>,actor:UserSession) {
  return writeTransaction(async(run,lock)=>{
    const invoice=await findInvoice(run,lock,input.propertyId,input.billingPeriodId,input.invoiceId);
    const row=await insertPending(run,invoice,input,actor,new Date().toISOString());
    return {id:row.id,status:row.status,message:'Pembayaran menunggu verifikasi.'};
  });
}
async function bookPayment(run:Query,lock:string,payment:PendingRow,invoice:InvoiceRow,actor:UserSession,accountId='acc-main') {
  if(payment.status!=='PENDING') throw new OperationalError('Pembayaran sudah diproses.');
  const amount=Number(payment.amount);
  checkAmount(invoice,amount);
  const [account]=await run('SELECT id FROM accounts WHERE id=? AND is_active=true'+lock,[accountId]);
  if(!account) throw new OperationalError('Rekening kas penerima tidak aktif atau belum dikonfigurasi.');
  const [property]=await run<{code:string}>('SELECT code FROM properties WHERE id=?',[invoice.property_id]);
  const now=new Date().toISOString();
  const date=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const paidAmount=Number(invoice.paid_amount)+amount;
  const invoiceStatus=paidAmount===Number(invoice.total)?'PAID':'PARTIAL';
  await run("UPDATE payments SET status='VERIFIED',invoice_id=?,verified_by=?,verified_at=?,updated_at=? WHERE id=?",[invoice.id,actor.id,now,now,payment.id]);
  await run('UPDATE invoices SET status=?,paid_amount=?,paid_at=?,updated_at=? WHERE id=?',[invoiceStatus,paidAmount,invoiceStatus==='PAID'?now:null,now,invoice.id]);
  await run('INSERT INTO payment_allocations (id,payment_id,invoice_id,amount) VALUES (?,?,?,?)',[`alloc-${payment.id}`,payment.id,invoice.id,amount]);
  const ledgerId=`ledg-${payment.id}`;
  await run(`INSERT INTO ledger_entries (id,account_id,entry_date,direction,amount,source_type,source_id,description,created_by)
    VALUES (?,?,?,'IN',?,'PAYMENT',?,?,?)`,[ledgerId,accountId,date,amount,payment.id,'Iuran rumah '+(property?.code || invoice.property_id),actor.id]);
  const [updatedAccount]=await run<{balance:number|string}>('UPDATE accounts SET balance=balance+? WHERE id=? RETURNING balance',[amount,accountId]);
  await operationalAudit(run,actor,'payment.verify','PAYMENT',payment.id,{invoiceId:invoice.id,invoiceStatus,ledgerId,amount,accountId});
  return {id:payment.id,invoiceId:invoice.id,status:'VERIFIED',invoiceStatus,paidAmount,amount,ledgerId,accountId,accountBalance:Number(updatedAccount.balance),verifiedAt:now};
}
export async function recordInvoicePayment(run:Query,lock:string,invoice:InvoiceRow,input:z.output<typeof paymentFields>,actor:UserSession,paidAt:string,accountId?:string) {
  const row=await insertPending(run,invoice,input,actor,paidAt);
  return {...await bookPayment(run,lock,row,invoice,actor,accountId), reference:row.id, paidAt};
}

export async function verifyPayment(input:z.output<typeof paymentVerify>,actor:UserSession) {
  return writeTransaction(async(run,lock)=>{
    const [row]=await run<PendingRow>('SELECT id,property_id,billing_period_id,invoice_id,amount,status,paid_at FROM payments WHERE id=?'+lock,[input.paymentId]);
    if(!row) throw new OperationalError('Pembayaran tidak ditemukan.',404);
    if(row.status!=='PENDING') throw new OperationalError('Pembayaran sudah diproses.');
    const invoice=await findInvoice(run,lock,row.property_id,row.billing_period_id,row.invoice_id);
    return bookPayment(run,lock,row,invoice,actor,input.accountId);
  });
}
export async function rejectPayment(input:z.output<typeof paymentReject>,actor:UserSession) {
  return writeTransaction(async run=>{
    const now=new Date().toISOString();
    const result=await run("UPDATE payments SET status='REJECTED',verified_by=?,rejection_reason=?,updated_at=? WHERE id=? AND status='PENDING' RETURNING id",
      [actor.id,input.reason,now,input.paymentId]);
    if(!result.length) throw new OperationalError('Pembayaran tidak ditemukan atau sudah diproses.');
    await operationalAudit(run,actor,'payment.reject','PAYMENT',input.paymentId,{reason:input.reason});
    return {id:input.paymentId,status:'REJECTED'};
  });
}
export async function recordManualPayment(input:z.output<typeof manualPayment>,actor:UserSession) {
  return writeTransaction(async(run,lock)=>{
    const matches=await run<{property_id:string;period_id:string}>(`SELECT DISTINCT p.id AS property_id,b.id AS period_id FROM invoices i
      JOIN properties p ON p.id=i.property_id JOIN billing_periods b ON b.id=i.billing_period_id
      WHERE lower(p.code)=lower(?) AND lower(b.name)=lower(?) ORDER BY p.id,b.id LIMIT 2`,[input.propertyCode,input.periodName]);
    if(matches.length!==1) throw new OperationalError('Rumah atau periode tidak cocok dengan satu tagihan.',404);
    const invoice=await findInvoice(run,lock,matches[0].property_id,matches[0].period_id);
    const paidAt=input.paidAt ? input.paidAt+'T12:00:00+07:00' : new Date().toISOString();
    const row=await insertPending(run,invoice,{...input,proofFileUrl:input.proofFileUrl || input.proofUrl},actor,paidAt);
    const verified=input.status==='VERIFIED' ? await bookPayment(run,lock,row,invoice,actor,input.accountId) : null;
    const [payment]=await run<{reference:string;invoice_number:string}>('SELECT p.reference,i.invoice_number FROM payments p JOIN invoices i ON i.id=p.invoice_id WHERE p.id=?',[row.id]);
    return {...verified,id:row.id,invoiceId:invoice.id,invoiceNumber:payment.invoice_number,propertyCode:input.propertyCode,periodName:input.periodName,amount:input.amount,method:input.method,
      reference:payment.reference,status:input.status,paidAt,notes:input.notes || null,proofFileUrl:input.proofFileUrl || input.proofUrl || null};
  });
}

export const paymentEdit = paymentFields.partial().extend({
  paymentId:idField, status:z.literal('PENDING').optional(), paidAt:dateField.optional(),
});
export async function editPendingPayment(input:z.output<typeof paymentEdit>,actor:UserSession) {
  await writeTransaction(async (run,lock)=>{
    const [row] = await run<PendingRow & {method:string;reference:string;notes:string|null}>('SELECT * FROM payments WHERE id=?'+lock,[input.paymentId]);
    if(!row) throw new OperationalError('Pembayaran tidak ditemukan.',404);
    if(row.status!=='PENDING') throw new OperationalError('Hanya pembayaran yang menunggu verifikasi dapat diubah.');
    const invoice=await findInvoice(run,lock,row.property_id,row.billing_period_id,row.invoice_id);
    const amount=input.amount ?? Number(row.amount);
    checkAmount(invoice,amount);
    const reference=input.reference || row.reference || row.id;
    if((await run("SELECT id FROM payments WHERE invoice_id=? AND upper(reference)=upper(?) AND status='VERIFIED' LIMIT 1",[invoice.id,reference])).length)
      throw new OperationalError('Referensi ini sudah dibukukan pada tagihan tersebut.');
    await run('UPDATE payments SET amount=?,method=?,reference=?,paid_at=?,notes=?,updated_at=? WHERE id=?',
      [amount,input.method ?? row.method,reference,input.paidAt ? input.paidAt+'T12:00:00+07:00' : iso(row.paid_at),
        input.notes ?? row.notes,new Date().toISOString(),row.id]);
    await operationalAudit(run,actor,'payment.update','PAYMENT',row.id,{invoiceId:invoice.id,amount});
  });
  return (await getPayments(undefined,undefined,undefined,input.paymentId))[0];
}
export const paymentRemove=archiveInput.extend({paymentId:idField.optional()});
export async function removeUnbookedPayments(input:z.output<typeof paymentRemove>,actor:UserSession) {
  const ids=requiredIds({...input,id:input.id || input.paymentId}).sort();
  return writeTransaction(async (run,lock)=>{
    for(const id of ids) {
      const [row]=await run<{status:string}>('SELECT status FROM payments WHERE id=?'+lock,[id]);
      if(!row) throw new OperationalError('Pembayaran tidak ditemukan.',404);
      if(row.status==='VERIFIED' || (await run("SELECT id FROM ledger_entries WHERE source_type='PAYMENT' AND source_id=? LIMIT 1",[id])).length ||
        (await run('SELECT id FROM payment_allocations WHERE payment_id=? LIMIT 1',[id])).length)
        throw new OperationalError('Pembayaran yang sudah dibukukan tidak dapat dihapus.');
      await run('DELETE FROM payments WHERE id=?',[id]);
      await operationalAudit(run,actor,'payment.delete','PAYMENT',id,{status:row.status,reason:input.reason || null});
    }
    return {ids};
  });
}
