import type { APIRoute } from 'astro';
import { z } from 'zod';
import { neonSql } from '../../../db/neon';
import { recordAuditLog } from '../../../services/audit.service';

const deleteSchema = z.object({
  id: z.string().optional(),
  propertyId: z.string().optional(),
  code: z.string().optional(),
  propertyCode: z.string().optional(),
  reason: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = deleteSchema.parse(body);
    const targetId = validated.propertyId || validated.id || '';
    const targetCode = validated.propertyCode || validated.code || '';

    if (!targetId && !targetCode) {
      throw new Error('ID atau kode unit rumah wajib disertakan.');
    }

    if (process.env.DATABASE_URL) {
      // Soft-delete or remove property
      await neonSql`
        UPDATE properties
        SET is_active = false, updated_at = NOW()
        WHERE id = ${targetId} OR code = ${targetCode};
      `;

      await recordAuditLog({
        actorName: 'Pengurus Komplek',
        action: 'property.delete',
        entityType: 'PROPERTY',
        entityId: targetId || targetCode,
        newValue: {
          code: targetCode,
          reason: validated.reason || 'Dihapus oleh pengurus komplek',
          deletedAt: new Date().toISOString()
        },
      });

      return new Response(
        JSON.stringify({
          data: {
            success: true,
            id: targetId || targetCode,
            message: `Unit rumah ${targetCode || targetId} berhasil dihapus dari direktori aktif.`
          },
          meta: {},
          error: null,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        data: {
          success: true,
          message: 'Unit rumah dihapus (mock mode).'
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        data: null,
        error: { code: 'PROPERTY_DELETE_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
