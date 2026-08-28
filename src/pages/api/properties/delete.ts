import type { APIRoute } from 'astro';
import { z } from 'zod';
import { neonSql } from '../../../db/neon';
import { recordAuditLog } from '../../../services/audit.service';

const deleteSchema = z.object({
  propertyId: z.string().min(1),
  propertyCode: z.string().optional(),
  reason: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = deleteSchema.parse(body);

    if (process.env.DATABASE_URL) {
      // Soft-delete or remove property
      await neonSql`
        UPDATE properties
        SET is_active = false, updated_at = NOW()
        WHERE id = ${validated.propertyId} OR code = ${validated.propertyCode || ''};
      `;

      await recordAuditLog({
        actorName: 'Pengurus Komplek',
        action: 'property.delete',
        entityType: 'PROPERTY',
        entityId: validated.propertyId,
        newValue: {
          code: validated.propertyCode,
          reason: validated.reason || 'Dihapus oleh pengurus komplek',
          deletedAt: new Date().toISOString()
        },
      });

      return new Response(
        JSON.stringify({
          data: {
            success: true,
            id: validated.propertyId,
            message: `Unit rumah ${validated.propertyCode || validated.propertyId} berhasil dihapus dari direktori aktif.`
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
