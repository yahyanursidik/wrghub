import type { APIRoute } from 'astro';
import { z } from 'zod';
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
      await recordAuditLog({
        actorName: 'Pengurus Komplek',
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
