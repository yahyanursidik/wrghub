import type { APIRoute } from 'astro';
import { z } from 'zod';
import { neonSql } from '../../../db/neon';
import { recordAuditLog } from '../../../services/audit.service';

const deleteSchema = z.object({
  id: z.string().optional(),
  propertyId: z.string().optional(),
  code: z.string().optional(),
  propertyCode: z.string().optional(),
  ids: z.array(z.string()).optional(),
  propertyCodes: z.array(z.string()).optional(),
  reason: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = deleteSchema.parse(body);

    // Case 1: Bulk delete
    if (validated.ids && validated.ids.length > 0) {
      const targetIds = validated.ids;
      const targetCodes = validated.propertyCodes || [];

      if (process.env.DATABASE_URL) {
        for (const tid of targetIds) {
          try {
            await neonSql`
              UPDATE properties
              SET is_active = false, updated_at = NOW()
              WHERE id = ${tid};
            `;
          } catch (e) {
            console.error(`Error soft-deleting property ${tid}:`, e);
          }
        }

        await recordAuditLog({
          actorName: 'Pengurus Komplek',
          action: 'property.bulk_delete',
          entityType: 'PROPERTY',
          entityId: `BULK-${targetIds.length}`,
          newValue: {
            ids: targetIds,
            codes: targetCodes,
            count: targetIds.length,
            reason: validated.reason || `Penghapusan massal ${targetIds.length} unit rumah`,
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
            message: `Sebanyak ${targetIds.length} unit rumah berhasil dihapus dari direktori aktif.`
          },
          meta: {},
          error: null,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Case 2: Single delete
    const targetId = validated.propertyId || validated.id || '';
    const targetCode = validated.propertyCode || validated.code || '';

    if (!targetId && !targetCode) {
      throw new Error('ID atau kode unit rumah wajib disertakan.');
    }

    if (process.env.DATABASE_URL) {
      // Soft-delete property
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
