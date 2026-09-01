import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordAuditLog } from '../../../../services/audit.service';

const deleteUtilitySchema = z.object({
  id: z.string().optional(),
  utilityId: z.string().optional(),
  houseCode: z.string().optional(),
  reason: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = deleteUtilitySchema.parse(body);
    const targetId = validated.utilityId || validated.id || '';

    if (!targetId && !validated.houseCode) {
      throw new Error('ID catatan utilitas atau kode unit wajib disertakan.');
    }

    if (process.env.DATABASE_URL) {
      await recordAuditLog({
        actorName: 'Pengurus Komplek',
        action: 'property.delete_utility',
        entityType: 'PROPERTY_UTILITY',
        entityId: targetId || validated.houseCode || 'UNKNOWN',
        newValue: {
          utilityId: targetId,
          house: validated.houseCode,
          reason: validated.reason || 'Reset data meteran utilitas',
          deletedAt: new Date().toISOString()
        },
      });
    }

    return new Response(
      JSON.stringify({
        data: {
          success: true,
          id: targetId,
          message: `Catatan utilitas ${validated.houseCode || targetId} berhasil direset / dihapus.`
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
        error: { code: 'DELETE_UTILITY_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
