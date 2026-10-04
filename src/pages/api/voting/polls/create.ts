import type { APIRoute } from 'astro';
import { z } from 'zod';
import { createPoll, POLL_CATEGORIES } from '../../../../services/voting.service';

export const prerender = false;

const createPollSchema = z.object({
  title: z.string().min(3),
  category: z.enum(['KEAMANAN', 'INFRASTRUKTUR', 'FASUM', 'KEUANGAN', 'LINGKUNGAN', 'LAINNYA']).default('INFRASTRUKTUR'),
  budgetEstimate: z.number().optional().default(0),
  description: z.string().min(5),
  endDate: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = createPollSchema.parse(body);

    const poll = await createPoll({
      title: validated.title,
      category: validated.category as (typeof POLL_CATEGORIES)[number],
      budgetEstimate: validated.budgetEstimate,
      description: validated.description,
      endsAt: validated.endDate,
    });

    return new Response(
      JSON.stringify({
        data: { poll },
        meta: {},
        error: null,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    const isZod = err instanceof z.ZodError;
    const message = isZod
      ? `Data polling tidak valid: ${err.issues.map((i) => `${i.path.join('.') || 'field'} — ${i.message}`).join('; ')}`
      : err?.message || 'Gagal membuat polling';
    return new Response(
      JSON.stringify({
        data: null,
        error: { code: isZod ? 'POLL_VALIDATION_FAILED' : 'POLL_CREATION_FAILED', message },
      }),
      { status: isZod ? 400 : 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
