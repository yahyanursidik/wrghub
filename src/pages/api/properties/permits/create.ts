import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordAuditLog } from '../../../../services/audit.service';

const permitSchema = z.object({
  propertyCode: z.string().default('A-17'),
  workType: z.string(), // RENOVASI_RINGAN | RENOVASI_SEDANG | PERBAIKAN_ATAP | LAINNYA
  contractorName: z.string(),
  workersCount: z.number().default(2),
  startDate: z.string(),
  endDate: z.string(),
  description: z.string(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = permitSchema.parse(body);

    const newPermit = {
      id: `PERMIT-${Date.now()}`,
      propertyCode: validated.propertyCode,
      workType: validated.workType,
      contractorName: validated.contractorName,
      workersCount: validated.workersCount,
      startDate: validated.startDate,
      endDate: validated.endDate,
      description: validated.description,
      status: 'APPROVED', // APPROVED | PENDING_REVIEW
      securityNotified: true,
      issuedAt: new Date().toISOString(),
    };

    if (process.env.DATABASE_URL) {
      await recordAuditLog({
        actorName: `Warga Rumah ${validated.propertyCode}`,
        action: 'property.create_permit',
        entityType: 'RENOVATION_PERMIT',
        entityId: newPermit.id,
        newValue: { contractor: validated.contractorName, workers: validated.workersCount, period: `${validated.startDate} - ${validated.endDate}` },
      });
    }

    return new Response(
      JSON.stringify({
        data: newPermit,
        meta: {},
        error: null,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        data: null,
        error: { code: 'PERMIT_CREATION_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
