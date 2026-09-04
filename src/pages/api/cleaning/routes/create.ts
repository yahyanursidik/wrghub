import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordAuditLog } from '../../../../services/audit.service';

const createRouteSchema = z.object({
  routeName: z.string().min(2),
  days: z.array(z.string()).min(1),
  operationalHours: z.string().min(2),
  targetBlocks: z.string().min(2),
  assignedStaffNames: z.array(z.string()).min(1),
  vehicleUsed: z.string().min(2),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = createRouteSchema.parse(body);

    const newRoute = {
      id: `RTE-${Date.now().toString().slice(-4)}`,
      routeName: validated.routeName,
      days: validated.days,
      operationalHours: validated.operationalHours,
      targetBlocks: validated.targetBlocks,
      assignedStaffNames: validated.assignedStaffNames,
      vehicleUsed: validated.vehicleUsed,
      statusToday: 'SCHEDULED' as const,
      createdAt: new Date().toISOString(),
    };

    if (process.env.DATABASE_URL) {
      await recordAuditLog({
        actorName: 'Pengurus Komplek',
        action: 'cleaning.create_route',
        entityType: 'CLEANING_ROUTE',
        entityId: newRoute.id,
        newValue: {
          routeName: validated.routeName,
          days: validated.days,
          targetBlocks: validated.targetBlocks,
          assignedStaff: validated.assignedStaffNames,
        },
      });
    }

    return new Response(
      JSON.stringify({
        data: newRoute,
        meta: {},
        error: null,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        data: null,
        error: { code: 'ROUTE_CREATION_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
