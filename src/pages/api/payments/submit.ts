import type { APIRoute } from 'astro';
import { z } from 'zod';
import { submitPayment } from '../../../services/payment.service';

const submitSchema = z.object({
  propertyId: z.string(),
  billingPeriodId: z.string(),
  amount: z.number().positive(),
  method: z.string().default('TRANSFER'),
  reference: z.string().optional(),
  proofFileUrl: z.string().optional(),
  notes: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = submitSchema.parse(body);
    const paymentId = await submitPayment(validated);

    return new Response(
      JSON.stringify({
        data: { id: paymentId, message: 'Pembayaran berhasil diajukan dan menunggu verifikasi.' },
        meta: {},
        error: null,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        data: null,
        error: {
          code: 'INVALID_PAYMENT_PAYLOAD',
          message: err.message || 'Data pembayaran tidak valid.',
        },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
