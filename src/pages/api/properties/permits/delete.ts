import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordAuditLog } from '../../../../services/audit.service';

const deletePermitSchema = z.object({
  id: z.string().optional(),
  permitId: z.string().optional(),
  houseCode: z.string().optional(),
  contractorName: z.string().optional(),
  reason: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = deletePermitSchema.parse(body);
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
