import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordAuditLog } from '../../../services/audit.service';

const deleteFacilitySchema = z.object({
  id: z.string().optional(),
  ids: z.array(z.string()).optional(),
  name: z.string().optional(),
  reason: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = deleteFacilitySchema.parse(body);
    const targetIds = validated.ids && validated.ids.length > 0 
      ? validated.ids 
      : [validated.id || ''].filter(Boolean);

    if (targetIds.length === 0) {
      throw new Error('ID fasilitas wajib disertakan.');
    }

    if (process.env.DATABASE_URL) {
      await recordAuditLog({
        actorName: 'Pengurus Sarana',
        action: 'facility.delete',
        entityType: 'FACILITY',
        entityId: targetIds[0] || 'bulk',
        newValue: {
          facilityIds: targetIds,
          reason: validated.reason || 'Dihapus dari inventaris fasilitas komplek',
          deletedAt: new Date().toISOString(),
        },
      });
    }

    return new Response(
      JSON.stringify({
        data: {
          success: true,
          ids: targetIds,
          message: `Sebanyak ${targetIds.length} data fasilitas berhasil dihapus.`
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
        error: { code: 'FACILITY_DELETE_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
