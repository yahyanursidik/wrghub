import type { APIRoute } from 'astro';
import { z } from 'zod';
import { rejectPayment } from '../../../services/payment.service';

const rejectSchema = z.object({
  paymentId: z.string(),
  reason: z.string().default('Bukti transfer tidak valid atau tidak terbaca'),
  verifierUserId: z.string().optional(),
  verifierName: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = rejectSchema.parse(body);
    await rejectPayment(validated.paymentId, validated.verifierUserId, validated.verifierName, validated.reason);

    return new Response(
      JSON.stringify({
        data: { message: 'Pembayaran ditolak dan audit log dicatat.' },
        meta: {},
        error: null,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        data: null,
        error: { code: 'REJECT_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
