import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordAuditLog } from '../../../../services/audit.service';

const createInvoiceSchema = z.object({
  propertyCode: z.string().min(1),
  houseCode: z.string().optional(),
  areaLabel: z.string().optional(),
  ownerName: z.string().optional(),
  periodName: z.string().default('Agustus 2026'),
  securityFee: z.number().default(150000),
  cleaningFee: z.number().default(50000),
  sinkingFund: z.number().default(50000),
  additionalFee: z.number().default(0),
  total: z.number().default(250000),
  dueDate: z.string().default('2026-08-10'),
  status: z.enum(['PAID', 'UNPAID', 'PENDING_VERIFICATION', 'VOID']).default('UNPAID'),
  notes: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = createInvoiceSchema.parse(body);

    const house = (validated.houseCode || validated.propertyCode).toUpperCase();
    const cleanHouse = house.replace(/[^A-Z0-9]/g, '');
    const cleanPeriod = validated.periodName.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const invoiceNumber = `INV-${cleanPeriod.slice(0, 6)}-${cleanHouse}`;

    const newInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      propertyId: `prop-${house.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      propertyCode: house,
      areaLabel: validated.areaLabel || (house.startsWith('KAV') ? 'Kavling' : house.startsWith('SW') ? 'Jl. Sariwangi Indah' : `Blok ${house.split('-')[0]}`),
      ownerName: validated.ownerName || 'Warga Terdaftar',
      billingPeriodName: validated.periodName,
      securityFee: validated.securityFee,
      cleaningFee: validated.cleaningFee,
      sinkingFund: validated.sinkingFund,
      additionalFee: validated.additionalFee,
      total: validated.total || (validated.securityFee + validated.cleaningFee + validated.sinkingFund + validated.additionalFee),
      paidAmount: validated.status === 'PAID' ? validated.total : 0,
      dueDate: validated.dueDate,
      issuedAt: new Date().toISOString(),
      paidAt: validated.status === 'PAID' ? new Date().toISOString() : null,
      status: validated.status,
      notes: validated.notes || null,
    };

    if (process.env.DATABASE_URL) {
      await recordAuditLog({
        actorName: 'Pengurus Komplek',
        action: 'billing.create_invoice',
        entityType: 'INVOICE',
        entityId: newInvoice.invoiceNumber,
        newValue: {
          house: newInvoice.propertyCode,
          period: validated.periodName,
          total: newInvoice.total,
          status: validated.status,
        },
      });
    }

    return new Response(
      JSON.stringify({
        data: newInvoice,
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
