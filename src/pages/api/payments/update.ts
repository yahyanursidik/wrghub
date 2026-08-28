import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordAuditLog } from '../../../services/audit.service';

const updatePaymentSchema = z.object({
  paymentId: z.string().min(1),
  amount: z.number().optional(),
  method: z.string().optional(),
  reference: z.string().optional(),
  status: z.enum(['PENDING', 'VERIFIED', 'REJECTED']).optional(),
  paidAt: z.string().optional(),
  notes: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = updatePaymentSchema.parse(body);

    if (process.env.DATABASE_URL) {
      await recordAuditLog({
        actorName: 'Bendahara Komplek',
        action: 'payment.update_payment',
        entityType: 'PAYMENT',
        entityId: validated.paymentId,
        newValue: {
          paymentId: validated.paymentId,
          amount: validated.amount,
          method: validated.method,
          status: validated.status,
          updatedAt: new Date().toISOString(),
        },
      });
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
        error: { code: 'PAYMENT_UPDATE_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
