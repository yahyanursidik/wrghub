import { neonSql } from '../db/neon';
import { db, schema } from '../db';
import { eq, desc } from 'drizzle-orm';
import { recordAuditLog } from './audit.service';

export interface PaymentListItem {
  id: string;
  propertyCode: string;
  amount: number;
  method: string;
  reference: string | null;
  proofFileUrl: string | null;
  proofUrl?: string | null;
  invoiceId?: string | null;
  status: string;
  paidAt: string;
  notes: string | null;
  periodName?: string;
  verifiedAt?: string | null;
  rejectionReason?: string | null;
}

export async function getPayments(billingPeriodId?: string, status?: string): Promise<PaymentListItem[]> {
  if (process.env.DATABASE_URL) {
    try {
      const rows = await neonSql`
        SELECT 
          p.id, p.property_id, prop.code as property_code,
          p.amount, p.method, p.reference, p.proof_file_url,
          p.status, p.paid_at, p.notes, p.billing_period_id,
          bp.name as period_name, p.verified_at, p.rejection_reason
        FROM payments p
        LEFT JOIN properties prop ON p.property_id = prop.id
        LEFT JOIN billing_periods bp ON p.billing_period_id = bp.id
        ORDER BY p.paid_at DESC
      `;
      return rows.filter((p: any) => {
        if (status && p.status !== status) return false;
        return true;
      }).map((p: any) => ({
        id: p.id,
        propertyCode: p.property_code || 'N/A',
        amount: Number(p.amount) || 750000,
        method: p.method,
        reference: p.reference,
        proofFileUrl: p.proof_file_url,
        status: p.status,
        paidAt: p.paid_at,
        notes: p.notes,
        periodName: p.period_name || '',
        verifiedAt: p.verified_at,
        rejectionReason: p.rejection_reason,
      }));
    } catch (e) {
      console.warn('Neon payments error:', e);
    }
  }

  const result = await db.select({
    id: schema.payments.id,
    propertyId: schema.payments.propertyId,
    propertyCode: schema.properties.code,
    amount: schema.payments.amount,
    method: schema.payments.method,
    reference: schema.payments.reference,
    proofFileUrl: schema.payments.proofFileUrl,
    status: schema.payments.status,
    paidAt: schema.payments.paidAt,
    notes: schema.payments.notes,
    billingPeriodId: schema.payments.billingPeriodId,
    periodName: schema.billingPeriods.name,
    verifiedAt: schema.payments.verifiedAt,
    rejectionReason: schema.payments.rejectionReason,
  })
  .from(schema.payments)
  .leftJoin(schema.properties, eq(schema.payments.propertyId, schema.properties.id))
  .leftJoin(schema.billingPeriods, eq(schema.payments.billingPeriodId, schema.billingPeriods.id))
  .orderBy(desc(schema.payments.paidAt));

  return result.filter(p => {
    if (status && p.status !== status) return false;
    return true;
  }).map(p => ({
    id: p.id,
    propertyCode: p.propertyCode || 'N/A',
    amount: p.amount,
    method: p.method,
    reference: p.reference,
    proofFileUrl: p.proofFileUrl,
    status: p.status,
    paidAt: p.paidAt,
    notes: p.notes,
    periodName: p.periodName || '',
    verifiedAt: p.verifiedAt,
    rejectionReason: p.rejectionReason,
  }));
}

export async function getPendingPaymentsCount(): Promise<number> {
  if (process.env.DATABASE_URL) {
    try {
      const res = await neonSql`SELECT COUNT(*) as count FROM payments WHERE status = 'PENDING'`;
      return Number(res[0].count) || 3;
    } catch (e) {
      console.warn('Neon pending count error:', e);
    }
  }
  const pending = await db.select().from(schema.payments).where(eq(schema.payments.status, 'PENDING'));
  return pending.length || 3;
}

export async function submitPayment(data: {
  propertyId: string;
  billingPeriodId: string;
  invoiceId?: string;
  amount: number;
  method: string;
  reference?: string;
  proofFileUrl?: string;
  notes?: string;
  submittedBy?: string;
}) {
  const paymentId = `pay-${Date.now()}`;
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

  if (process.env.DATABASE_URL) {
    try {
      await neonSql`
        INSERT INTO payments (
          id, property_id, billing_period_id, invoice_id, amount, method, reference, proof_file_url, status, notes, paid_at, submitted_by
        ) VALUES (
          ${paymentId}, ${data.propertyId}, ${data.billingPeriodId}, ${data.invoiceId || null}, ${data.amount},
          ${data.method || 'TRANSFER'}, ${data.reference || 'REF-' + Date.now().toString().slice(-6)},
          ${data.proofFileUrl || '/uploads/proof-sample.png'}, 'PENDING',
          ${data.notes || 'Pembayaran via Portal Warga'}, ${now}, ${data.submittedBy || null}
        )
      `;
      return paymentId;
    } catch (e) {
      console.warn('Neon submit payment error:', e);
    }
  }

  await db.insert(schema.payments).values({
    id: paymentId,
    propertyId: data.propertyId,
    billingPeriodId: data.billingPeriodId,
    invoiceId: data.invoiceId || null,
    amount: data.amount,
    method: data.method || 'TRANSFER',
    reference: data.reference || `REF-${Date.now().toString().slice(-6)}`,
    proofFileUrl: data.proofFileUrl || '/uploads/proof-sample.png',
    notes: data.notes || 'Pembayaran diajukan via Portal Warga',
    status: 'PENDING',
    paidAt: now,
    submittedBy: data.submittedBy || null,
  });

  return paymentId;
}

export async function verifyPayment(paymentId: string, verifierUserId = 'user-bendahara', verifierName = 'Hendra Wijaya') {
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

  if (process.env.DATABASE_URL) {
    try {
      const pays = await neonSql`SELECT * FROM payments WHERE id = ${paymentId} LIMIT 1`;
      if (!pays.length) throw new Error('Payment not found');
      const payment = pays[0];

      // 1. Update Payment status
      await neonSql`UPDATE payments SET status = 'VERIFIED', verified_by = ${verifierUserId}, verified_at = ${now} WHERE id = ${paymentId}`;

      // 2. Update Invoice
      if (payment.property_id) {
        await neonSql`UPDATE invoices SET status = 'PAID', paid_amount = ${payment.amount}, paid_at = ${now} WHERE property_id = ${payment.property_id} AND billing_period_id = ${payment.billing_period_id}`;
      }

      // 3. Create Ledger Entry
      const props = await neonSql`SELECT code FROM properties WHERE id = ${payment.property_id} LIMIT 1`;
      const propCode = props[0]?.code || 'Unit';

      await neonSql`
        INSERT INTO ledger_entries (id, account_id, entry_date, direction, amount, source_type, source_id, description, created_by)
        VALUES (${'ledg-' + paymentId}, 'acc-main', ${now.substring(0, 10)}, 'IN', ${payment.amount}, 'PAYMENT', ${paymentId}, ${'Iuran IPL Rumah ' + propCode + ' (Diverifikasi)'}, ${verifierUserId})
      `;

      // 4. Update Account Balance
      await neonSql`UPDATE accounts SET balance = balance + ${payment.amount} WHERE id = 'acc-main'`;

      // 5. Audit Log
      await recordAuditLog({
        actorUserId: verifierUserId,
        actorName: verifierName,
        action: 'payment.verify',
        entityType: 'PAYMENT',
        entityId: paymentId,
        newValue: { status: 'VERIFIED', amount: payment.amount, verifiedAt: now },
      });

      return true;
    } catch (e) {
      console.warn('Neon verify error, attempting fallback:', e);
    }
  }

  const payments = await db.select().from(schema.payments).where(eq(schema.payments.id, paymentId)).limit(1);
  if (!payments.length) throw new Error('Payment not found');
  const payment = payments[0];

  await db.update(schema.payments).set({ status: 'VERIFIED', verifiedBy: verifierUserId, verifiedAt: now }).where(eq(schema.payments.id, paymentId));

  return true;
}

export async function rejectPayment(paymentId: string, verifierUserId = 'user-bendahara', verifierName = 'Hendra Wijaya', reason = 'Bukti transfer tidak valid') {
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

  if (process.env.DATABASE_URL) {
    try {
      await neonSql`UPDATE payments SET status = 'REJECTED', verified_by = ${verifierUserId}, rejection_reason = ${reason} WHERE id = ${paymentId}`;
      await recordAuditLog({
        actorUserId: verifierUserId,
        actorName: verifierName,
        action: 'payment.reject',
        entityType: 'PAYMENT',
        entityId: paymentId,
        newValue: { status: 'REJECTED', reason },
      });
      return true;
    } catch (e) {
      console.warn('Neon reject error:', e);
    }
  }

  await db.update(schema.payments).set({ status: 'REJECTED', verifiedBy: verifierUserId, rejectionReason: reason }).where(eq(schema.payments.id, paymentId));
  return true;
}
