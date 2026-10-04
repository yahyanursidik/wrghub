import type { APIRoute } from 'astro';
import { z } from 'zod';
import { deletePolls } from '../../../../services/voting.service';

export const prerender = false;

const deletePollSchema = z.object({
  id: z.string().optional(),
  ids: z.array(z.string()).optional(),
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

    const deleted = await deletePolls(targetIds);

    return new Response(
      JSON.stringify({
        data: {
          success: true,
          ids: targetIds,
          deleted,
          message: `Sebanyak ${deleted} polling berhasil dihapus.`,
        },
        meta: {},
        error: null,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    const isZod = err instanceof z.ZodError;
    return new Response(
      JSON.stringify({
        data: null,
        error: { code: 'POLL_DELETE_FAILED', message: isZod ? 'Permintaan hapus tidak valid.' : err?.message || 'Gagal menghapus polling' },
      }),
      { status: isZod ? 400 : 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
