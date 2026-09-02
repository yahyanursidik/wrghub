import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordAuditLog } from '../../../../services/audit.service';

const deleteGuardSchema = z.object({
  id: z.string().optional(),
  ids: z.array(z.string()).optional(),
  reason: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = deleteGuardSchema.parse(body);

    // Case 1: Bulk Delete
    if (validated.ids && validated.ids.length > 0) {
      const targetIds = validated.ids;

      if (process.env.DATABASE_URL) {
        await recordAuditLog({
          actorName: 'Kepala Keamanan Komplek',
          action: 'security.bulk_delete_guard',
          entityType: 'SECURITY_GUARD',
          entityId: `BULK-SEC-${targetIds.length}`,
          newValue: {
            ids: targetIds,
            count: targetIds.length,
            reason: validated.reason || `Penonaktifan massal ${targetIds.length} personel satpam`,
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
            message: `Sebanyak ${targetIds.length} data personel satpam berhasil dihapus / dinonaktifkan.`
          },
          meta: {},
          error: null,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Case 2: Single Delete
    const targetId = validated.id || '';
    if (!targetId) {
      throw new Error('ID personel satpam wajib disertakan.');
    }

    if (process.env.DATABASE_URL) {
      await recordAuditLog({
        actorName: 'Kepala Keamanan Komplek',
        action: 'security.delete_guard',
        entityType: 'SECURITY_GUARD',
        entityId: targetId,
        newValue: {
          guardId: targetId,
          reason: validated.reason || 'Penonaktifan personel satpam',
          deletedAt: new Date().toISOString()
        },
      });
    }

    return new Response(
      JSON.stringify({
        data: {
          success: true,
          id: targetId,
          message: `Personel satpam ${targetId} berhasil dihapus / dinonaktifkan.`
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
        error: { code: 'GUARD_DELETE_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
