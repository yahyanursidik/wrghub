import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordAuditLog } from '../../../../services/audit.service';

const deleteInvoiceSchema = z.object({
  id: z.string().optional(),
  invoiceId: z.string().optional(),
  invoiceNumber: z.string().optional(),
  propertyCode: z.string().optional(),
  reason: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = deleteInvoiceSchema.parse(body);
    const targetId = validated.invoiceId || validated.id || validated.invoiceNumber || '';

    if (!targetId) {
      throw new Error('ID atau nomor tagihan wajib disertakan.');
    }

    if (process.env.DATABASE_URL) {
      await recordAuditLog({
        actorName: 'Pengurus Komplek',
        action: 'billing.delete_invoice',
        entityType: 'INVOICE',
        entityId: validated.invoiceNumber || targetId,
        newValue: {
          invoiceId: targetId,
          house: validated.propertyCode,
          reason: validated.reason || 'Dibatalkan / Dihapus dari sistem tagihan',
          deletedAt: new Date().toISOString(),
        },
      });
    }

    return new Response(
      JSON.stringify({
        data: {
          success: true,
          id: validated.invoiceId,
          message: `Invoice ${validated.invoiceNumber || validated.invoiceId} berhasil dibatalkan / dihapus.`
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
        error: { code: 'DELETE_INVOICE_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
