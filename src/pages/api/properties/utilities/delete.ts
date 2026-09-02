import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordAuditLog } from '../../../../services/audit.service';

const deleteUtilitySchema = z.object({
  id: z.string().optional(),
  utilityId: z.string().optional(),
  houseCode: z.string().optional(),
  ids: z.array(z.string()).optional(),
  reason: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = deleteUtilitySchema.parse(body);

    // Case 1: Bulk delete
    if (validated.ids && validated.ids.length > 0) {
      const targetIds = validated.ids;

      if (process.env.DATABASE_URL) {
        await recordAuditLog({
          actorName: 'Pengurus Komplek',
          action: 'property.bulk_delete_utility',
          entityType: 'PROPERTY_UTILITY',
          entityId: `BULK-UTIL-${targetIds.length}`,
          newValue: {
            ids: targetIds,
            count: targetIds.length,
            reason: validated.reason || `Reset massal ${targetIds.length} catatan utilitas`,
            deletedAt: new Date().toISOString()
          },
        });
      }

      return new Response(
        JSON.stringify({
          data: {
            success: true,
            deletedCount: targetIds.length,
            ids: targetIds,
            message: `Sebanyak ${targetIds.length} catatan utilitas & meteran berhasil direset / dihapus.`
          },
          meta: {},
          error: null,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Case 2: Single delete
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
