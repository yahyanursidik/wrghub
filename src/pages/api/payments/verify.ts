import type { APIRoute } from 'astro';
import { z } from 'zod';
import { verifyPayment } from '../../../services/payment.service';

const verifySchema = z.object({
  paymentId: z.string(),
  verifierUserId: z.string().optional(),
  verifierName: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = verifySchema.parse(body);
    await verifyPayment(validated.paymentId, validated.verifierUserId, validated.verifierName);

    return new Response(
      JSON.stringify({
        data: { message: 'Pembayaran berhasil diverifikasi, tagihan dilunasi, dan kas diperbarui.' },
        meta: {},
        error: null,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        data: null,
        error: { code: 'VERIFICATION_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
