import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordAuditLog } from '../../../../services/audit.service';

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

    const newPoll = {
      id: `poll-${Date.now().toString().slice(-4)}`,
      title: validated.title,
      category: validated.category,
      budgetEstimate: validated.budgetEstimate,
      description: validated.description,
      status: 'ACTIVE',
      totalVotes: 0,
      createdAt: new Date().toISOString(),
      endDate: validated.endDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      options: [
        { label: 'Setuju Disetujui', count: 0, percentage: 0 },
        { label: 'Tidak Setuju', count: 0, percentage: 0 },
        { label: 'Abstain', count: 0, percentage: 0 },
      ],
    };

    if (process.env.DATABASE_URL) {
      await recordAuditLog({
        actorName: 'Panitia Musyawarah / Pengurus',
        action: 'voting.create_poll',
        entityType: 'COMMUNITY_POLL',
        entityId: newPoll.id,
        newValue: {
          title: validated.title,
          category: validated.category,
          budget: validated.budgetEstimate,
        },
      });
    }

    return new Response(
      JSON.stringify({
        data: newPoll,
        meta: {},
        error: null,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        data: null,
        error: { code: 'POLL_CREATION_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
