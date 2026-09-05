import type { APIRoute } from 'astro';
import { z } from 'zod';
import { neonSql } from '../../../../db/neon';
import { db, schema } from '../../../../db';
import { eq } from 'drizzle-orm';
import { recordAuditLog } from '../../../../services/audit.service';

const updateInvoiceSchema = z.object({
  invoiceId: z.string().min(1),
  invoiceNumber: z.string().optional(),
  propertyCode: z.string().optional(),
  status: z.enum(['PAID', 'UNPAID', 'PENDING_VERIFICATION', 'VOID']).optional(),
  total: z.number().optional(),
  paidAmount: z.number().optional(),
  dueDate: z.string().optional(),
  paidAt: z.string().nullable().optional(),
  notes: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = updateInvoiceSchema.parse(body);

    if (process.env.DATABASE_URL) {
      try {
        const rows = await neonSql`SELECT id, status, total, property_id, billing_period_id FROM invoices WHERE id = ${validated.invoiceId} OR invoice_number = ${validated.invoiceNumber || validated.invoiceId} LIMIT 1`;
        if (rows.length > 0) {
          const inv = rows[0];
          const wasPaid = inv.status === 'PAID';
          const newStatus = validated.status || inv.status;
          const newTotal = validated.total || Number(inv.total) || 250000;
          const isNowPaid = newStatus === 'PAID';
          const paidAtTs = validated.paidAt ? `${validated.paidAt} 10:00:00` : new Date().toISOString().replace('T', ' ').slice(0, 19);

          await neonSql`
            UPDATE invoices
            SET status = ${newStatus},
                total = ${newTotal},
                paid_amount = ${isNowPaid ? newTotal : 0},
                paid_at = ${isNowPaid ? paidAtTs : null},
                notes = COALESCE(${validated.notes || null}, notes)
            WHERE id = ${inv.id}
          `;

          if (isNowPaid && !wasPaid) {
            const payId = `pay-upd-${Date.now()}`;
            const refStr = `TRF-UPD-${Date.now().toString().slice(-4)}`;
            await neonSql`
              INSERT INTO payments (
                id, property_id, billing_period_id, invoice_id, amount, method, reference, proof_file_url, status, notes, paid_at, verified_by, verified_at
              ) VALUES (
                ${payId}, ${inv.property_id}, ${inv.billing_period_id}, ${inv.id}, ${newTotal}, 'TRANSFER', ${refStr}, '/uploads/proof-sample.png', 'VERIFIED', 'Pelunasan Tagihan Warga oleh Pengurus', ${paidAtTs}, 'user-admin', ${paidAtTs}
              )
            `;

            await neonSql`
              INSERT INTO ledger_entries (
                id, account_id, entry_date, direction, amount, source_type, source_id, description, created_by
              ) VALUES (
                ${'ledg-' + payId}, 'acc-main', ${validated.paidAt || new Date().toISOString().slice(0, 10)}, 'IN', ${newTotal}, 'PAYMENT', ${payId}, 'Penerimaan Iuran Warga (Pelunasan)', 'user-admin'
              )
            `;

            await neonSql`UPDATE accounts SET balance = balance + ${newTotal} WHERE id = 'acc-main'`;
          }
        }
      } catch (dbErr) {
        console.warn('Neon update invoice error:', dbErr);
      }

      await recordAuditLog({
        actorName: 'Kepala Komplek / Admin',
        action: 'billing.update_invoice',
        entityType: 'INVOICE',
        entityId: validated.invoiceNumber || validated.invoiceId,
        newValue: {
          invoiceId: validated.invoiceId,
          house: validated.propertyCode,
          status: validated.status,
          total: validated.total,
          updatedAt: new Date().toISOString(),
        },
      });
    }

    // SQLite update
    try {
      if (validated.status) {
        await db.update(schema.invoices)
          .set({
            status: validated.status,
            total: validated.total,
            paidAmount: validated.status === 'PAID' ? validated.total : 0,
            paidAt: validated.status === 'PAID' ? new Date().toISOString() : null,
          })
          .where(eq(schema.invoices.id, validated.invoiceId));
      }
    } catch (sqErr) {
      console.warn('SQLite update invoice error:', sqErr);
    }

    return new Response(
      JSON.stringify({
        data: {
          success: true,
          ...validated,
          updatedAt: new Date().toISOString(),
        },
        meta: {},
        error: null,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        data: null,
        error: { code: 'INVOICE_UPDATE_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
