import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordAuditLog } from '../../../services/audit.service';

const createFacilitySchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  category: z.string().min(2),
  location: z.string().min(2),
  capacity: z.number().optional().default(30),
  hourlyRate: z.number().optional().default(0),
  operatingHours: z.string().optional().default('06:00 - 22:00 WIB'),
  condition: z.enum(['GOOD', 'NEEDS_REPAIR', 'UNDER_MAINTENANCE', 'DAMAGED']).default('GOOD'),
  picName: z.string().optional().default('Pengurus Sarana'),
  notes: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = createFacilitySchema.parse(body);

    const newFacility = {
      id: `fac-${Date.now().toString().slice(-4)}`,
      name: validated.name,
      code: validated.code.toUpperCase(),
      category: validated.category,
      location: validated.location,
      capacity: validated.capacity,
      hourlyRate: validated.hourlyRate,
      operatingHours: validated.operatingHours,
      condition: validated.condition,
      picName: validated.picName,
      notes: validated.notes || null,
      createdAt: new Date().toISOString(),
    };

    if (process.env.DATABASE_URL) {
      await recordAuditLog({
        actorName: 'Pengurus Sarana',
        action: 'facility.create',
        entityType: 'FACILITY',
        entityId: newFacility.id,
        newValue: {
          name: validated.name,
          code: validated.code,
          category: validated.category,
          condition: validated.condition,
        },
      });
    }

    return new Response(
      JSON.stringify({
        data: newFacility,
        meta: {},
        error: null,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        data: null,
        error: { code: 'FACILITY_CREATION_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
