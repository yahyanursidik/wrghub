import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordAuditLog } from '../../../services/audit.service';

const deletePaymentSchema = z.object({
  id: z.string().optional(),
  paymentId: z.string().optional(),
  propertyCode: z.string().optional(),
  amount: z.number().optional(),
  reason: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = deletePaymentSchema.parse(body);
    const targetId = validated.paymentId || validated.id || '';

    if (!targetId) {
      throw new Error('ID pembayaran wajib disertakan.');
    }

    if (process.env.DATABASE_URL) {
      await recordAuditLog({
        actorName: 'Bendahara Komplek',
        action: 'payment.delete_payment',
        entityType: 'PAYMENT',
        entityId: targetId,
        newValue: {
          paymentId: targetId,
          house: validated.propertyCode,
          amount: validated.amount,
          reason: validated.reason || 'Dihapus dari mutasi pembayaran iuran',
          deletedAt: new Date().toISOString(),
        },
      });
    }

    return new Response(
      JSON.stringify({
        data: {
          success: true,
          id: validated.paymentId,
          message: `Data pembayaran ${validated.paymentId} berhasil dihapus.`
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
        error: { code: 'PAYMENT_DELETE_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
