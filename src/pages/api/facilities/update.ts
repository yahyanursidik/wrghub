import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordAuditLog } from '../../../services/audit.service';

const updateFacilitySchema = z.object({
  id: z.string().min(1),
  name: z.string().optional(),
  code: z.string().optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  capacity: z.number().optional(),
  hourlyRate: z.number().optional(),
  operatingHours: z.string().optional(),
  condition: z.enum(['GOOD', 'NEEDS_REPAIR', 'UNDER_MAINTENANCE', 'DAMAGED']).optional(),
  picName: z.string().optional(),
  notes: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = updateFacilitySchema.parse(body);

    if (process.env.DATABASE_URL) {
      await recordAuditLog({
        actorName: 'Pengurus Sarana',
        action: 'facility.update',
        entityType: 'FACILITY',
        entityId: validated.id,
        newValue: {
          ...validated,
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
        error: { code: 'FACILITY_UPDATE_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
