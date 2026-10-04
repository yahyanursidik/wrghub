import type { APIRoute } from 'astro';
import { z } from 'zod';
import { updatePoll } from '../../../../services/voting.service';

export const prerender = false;

const updatePollSchema = z.object({
  id: z.string().min(1),
  title: z.string().optional(),
  status: z.enum(['ACTIVE', 'CLOSED']).optional(),
  budgetEstimate: z.number().optional(),
  description: z.string().optional(),
  endDate: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = updatePollSchema.parse(body);

    await updatePoll(validated.id, {
      status: validated.status,
      title: validated.title,
      description: validated.description,
      budgetEstimate: validated.budgetEstimate,
      endsAt: validated.endDate,
    });

    return new Response(
      JSON.stringify({
        data: { success: true, id: validated.id, updatedAt: new Date().toISOString() },
        meta: {},
        error: null,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    const isZod = err instanceof z.ZodError;
    const message = isZod ? 'Data pembaruan polling tidak valid.' : err?.message || 'Gagal memperbarui polling';
    return new Response(
      JSON.stringify({
        data: null,
        error: { code: 'POLL_UPDATE_FAILED', message },
      }),
      { status: isZod ? 400 : 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
