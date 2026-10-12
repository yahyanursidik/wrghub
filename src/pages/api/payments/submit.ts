import type { APIRoute } from 'astro';
import { z } from 'zod';
import { submitPayment } from '../../../services/payment.service';
import { getAllInvoices } from '../../../services/billing.service';

const submitSchema = z.object({
  propertyId: z.string(),
  billingPeriodId: z.string(),
  invoiceId: z.string().optional(),
  amount: z.number().positive(),
  method: z.string().default('TRANSFER'),
  reference: z.string().optional(),
  proofFileUrl: z.string().refine(value => (value.startsWith('/uploads/') && !value.includes('..')) || value.startsWith('https://'), 'Tautan bukti harus menggunakan HTTPS atau berkas unggahan aplikasi.').optional(),
  notes: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = submitSchema.parse(body);
    if (validated.invoiceId) {
      const invoice = (await getAllInvoices()).find(invoice => invoice.id === validated.invoiceId);
      if (!invoice || invoice.propertyId !== validated.propertyId || invoice.billingPeriodId !== validated.billingPeriodId) throw new Error('Tagihan tidak terkait rumah atau periode yang dipilih.');
      if (['PAID', 'WAIVED', 'CANCELLED'].includes(invoice.status)) throw new Error('Tagihan ini tidak dapat menerima konfirmasi pembayaran.');
      if (validated.amount > Math.max(0, Number(invoice.total) - Number(invoice.paidAmount))) throw new Error('Nominal melebihi sisa tagihan.');
    }
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
