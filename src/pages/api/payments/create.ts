import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordAuditLog } from '../../../services/audit.service';

const createPaymentSchema = z.object({
  propertyCode: z.string().min(1),
  houseCode: z.string().optional(),
  ownerName: z.string().optional(),
  periodName: z.string().default('Agustus 2026'),
  amount: z.number().min(1000),
  method: z.enum(['BCA_TRANSFER', 'QRIS', 'CASH', 'MANDIRI_TRANSFER', 'BRI_TRANSFER', 'LAINNYA']).default('BCA_TRANSFER'),
  reference: z.string().optional(),
  proofUrl: z.string().optional(),
  paidAt: z.string().default(() => new Date().toISOString().slice(0, 10)),
  status: z.enum(['PENDING', 'VERIFIED', 'REJECTED']).default('VERIFIED'),
  notes: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = createPaymentSchema.parse(body);

    const house = (validated.houseCode || validated.propertyCode).toUpperCase();
    const newPayment = {
      id: `pay-${Date.now()}`,
      propertyId: `prop-${house.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      propertyCode: house,
      ownerName: validated.ownerName || `Warga Rumah ${house}`,
      billingPeriodName: validated.periodName,
      amount: validated.amount,
      method: validated.method,
      reference: validated.reference || `TRX-${house}-${Date.now().toString().slice(-4)}`,
      proofUrl: validated.proofUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      status: validated.status,
      paidAt: validated.paidAt,
      verifiedAt: validated.status === 'VERIFIED' ? new Date().toISOString() : null,
      verifierName: validated.status === 'VERIFIED' ? 'Bendahara Komplek (Hendra Wijaya)' : null,
      notes: validated.notes || null,
      createdAt: new Date().toISOString(),
    };

    if (process.env.DATABASE_URL) {
      await recordAuditLog({
        actorName: 'Bendahara Komplek',
        action: 'payment.record_payment',
        entityType: 'PAYMENT',
        entityId: newPayment.id,
        newValue: {
          house: newPayment.propertyCode,
          amount: newPayment.amount,
          method: newPayment.method,
          status: newPayment.status,
          reference: newPayment.reference,
        },
      });
    }

    return new Response(
      JSON.stringify({
        data: newPayment,
        meta: {},
        error: null,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        data: null,
        error: { code: 'PAYMENT_RECORD_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
