import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordAuditLog } from '../../../../services/audit.service';

const deletePollSchema = z.object({
  id: z.string().optional(),
  ids: z.array(z.string()).optional(),
  title: z.string().optional(),
  reason: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = deletePollSchema.parse(body);
    const targetIds = validated.ids && validated.ids.length > 0 
      ? validated.ids 
      : [validated.id || ''].filter(Boolean);

    if (targetIds.length === 0) {
      throw new Error('ID polling wajib disertakan.');
    }

    if (process.env.DATABASE_URL) {
      await recordAuditLog({
        actorName: 'Panitia Pemilu Warga',
        action: 'voting.delete_poll',
        entityType: 'COMMUNITY_POLL',
        entityId: targetIds[0] || 'bulk',
        newValue: {
          pollIds: targetIds,
          reason: validated.reason || 'Dihapus dari daftar polling musyawarah',
          deletedAt: new Date().toISOString(),
        },
      });
    }

    return new Response(
      JSON.stringify({
        data: {
          success: true,
          ids: targetIds,
          message: `Sebanyak ${targetIds.length} polling berhasil dihapus.`
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
        error: { code: 'POLL_DELETE_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
