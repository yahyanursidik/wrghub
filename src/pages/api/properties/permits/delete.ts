import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordAuditLog } from '../../../../services/audit.service';

const deletePermitSchema = z.object({
  id: z.string().optional(),
  permitId: z.string().optional(),
  houseCode: z.string().optional(),
  contractorName: z.string().optional(),
  ids: z.array(z.string()).optional(),
  reason: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = deletePermitSchema.parse(body);

    // Case 1: Bulk delete
    if (validated.ids && validated.ids.length > 0) {
      const targetIds = validated.ids;

      if (process.env.DATABASE_URL) {
        await recordAuditLog({
          actorName: 'Pengurus Komplek',
          action: 'property.bulk_delete_permit',
          entityType: 'RENOVATION_PERMIT',
          entityId: `BULK-PERM-${targetIds.length}`,
          newValue: {
            ids: targetIds,
            count: targetIds.length,
            reason: validated.reason || `Penghapusan massal ${targetIds.length} izin renovasi & pekerja`,
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
            message: `Sebanyak ${targetIds.length} izin renovasi & akses pekerja berhasil dibatalkan / dihapus.`
          },
          meta: {},
          error: null,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Case 2: Single delete
    const targetId = validated.permitId || validated.id || '';

    if (!targetId) {
      throw new Error('ID surat izin renovasi wajib disertakan.');
    }

    if (process.env.DATABASE_URL) {
      await recordAuditLog({
        actorName: 'Pengurus Komplek',
        action: 'property.delete_permit',
        entityType: 'RENOVATION_PERMIT',
        entityId: targetId,
        newValue: {
          permitId: targetId,
          house: validated.houseCode,
          contractor: validated.contractorName,
          reason: validated.reason || 'Dibatalkan / Dihapus dari sistem pengawasan',
          deletedAt: new Date().toISOString()
        },
      });
    }

    return new Response(
      JSON.stringify({
        data: {
          success: true,
          id: targetId,
          message: `Izin renovasi ${targetId} berhasil dibatalkan / dihapus dari sistem pengawasan.`
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
        error: { code: 'DELETE_PERMIT_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
