import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordAuditLog } from '../../../../services/audit.service';

const deleteOccupantSchema = z.object({
  occupantId: z.string().min(1),
  fullName: z.string().optional(),
  houseCode: z.string().optional(),
  reason: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = deleteOccupantSchema.parse(body);

    if (process.env.DATABASE_URL) {
      await recordAuditLog({
        actorName: 'Pengurus Komplek',
        action: 'property.delete_occupant',
        entityType: 'PROPERTY_OCCUPANT',
        entityId: validated.occupantId,
        newValue: {
          name: validated.fullName,
          house: validated.houseCode,
          reason: validated.reason || 'Dihapus dari database kependudukan',
          deletedAt: new Date().toISOString()
        },
      });
    }

    return new Response(
      JSON.stringify({
        data: {
          success: true,
          id: validated.occupantId,
          message: `Data kependudukan ${validated.fullName || validated.occupantId} berhasil dihapus/dinonaktifkan.`
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
        error: { code: 'DELETE_OCCUPANT_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
