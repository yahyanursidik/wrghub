import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordAdminDirectIuran } from '../../../../services/billing.service';
import { recordAuditLog } from '../../../../services/audit.service';

const createInvoiceSchema = z.object({
  propertyCode: z.string().min(1),
  houseCode: z.string().optional(),
  areaLabel: z.string().optional(),
  ownerName: z.string().optional(),
  periodName: z.string().default('September 2026'),
  securityFee: z.number().default(150000),
  cleaningFee: z.number().default(50000),
  sinkingFund: z.number().default(50000),
  additionalFee: z.number().default(0),
  total: z.number().default(250000),
  dueDate: z.string().default('2026-09-10'),
  status: z.enum(['PAID', 'UNPAID', 'PENDING_VERIFICATION', 'VOID']).default('UNPAID'),
  paymentMethod: z.string().optional(),
  paidAt: z.string().optional(),
  notes: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = createInvoiceSchema.parse(body);

    const house = (validated.houseCode || validated.propertyCode).toUpperCase();
    const result = await recordAdminDirectIuran({
      ...validated,
      propertyCode: house,
    });

    if (process.env.DATABASE_URL) {
      await recordAuditLog({
        actorName: 'Kepala Komplek / Admin',
        action: 'billing.create_invoice',
        entityType: 'INVOICE',
        entityId: result.invoice.invoiceNumber,
        newValue: {
          house: result.invoice.propertyCode,
          period: validated.periodName,
          total: result.invoice.total,
          status: validated.status,
          method: validated.paymentMethod || 'CASH',
        },
      });
    }

    return new Response(
      JSON.stringify({
        data: {
          ...result.invoice,
          payment: result.payment,
          newBalance: result.newBalance,
          message: result.message,
        },
        meta: {},
        error: null,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        data: null,
        error: { code: 'INVOICE_CREATION_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

