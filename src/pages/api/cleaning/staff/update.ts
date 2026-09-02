import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordAuditLog } from '../../../../services/audit.service';

const updateStaffSchema = z.object({
  id: z.string().min(1),
  name: z.string().optional(),
  role: z.string().optional(),
  phone: z.string().optional(),
  zoneAssignment: z.string().optional(),
  salary: z.number().optional(),
  employmentStatus: z.string().optional(),
  status: z.enum(['ACTIVE', 'LEAVE', 'SICK', 'INACTIVE']).optional(),
  notes: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = updateStaffSchema.parse(body);

    if (process.env.DATABASE_URL) {
      await recordAuditLog({
        actorName: 'Pengurus Komplek',
        action: 'cleaning.update_staff',
        entityType: 'CLEANING_STAFF',
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
        error: { code: 'STAFF_UPDATE_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
