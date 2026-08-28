import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordAuditLog } from '../../../services/audit.service';

const voteSchema = z.object({
  targetType: z.enum(['ELECTION', 'POLL']),
  targetId: z.string(),
  choiceId: z.string(),
  propertyCode: z.string().default('A-17'),
  voterName: z.string().default('Budi Santoso'),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = voteSchema.parse(body);

    const voteReceipt = {
      voteId: `VOTE-${Date.now()}-${validated.propertyCode.replace('-', '')}`,
      targetType: validated.targetType,
      targetId: validated.targetId,
      choiceId: validated.choiceId,
      propertyCode: validated.propertyCode,
      voterName: validated.voterName,
      status: 'RECORDED_AND_VERIFIED',
      castAt: new Date().toISOString(),
    };

    if (process.env.DATABASE_URL) {
      await recordAuditLog({
        actorName: validated.voterName,
        action: 'voting.cast_vote',
        entityType: validated.targetType === 'ELECTION' ? 'RW_ELECTION_VOTE' : 'COMMUNITY_POLL_VOTE',
        entityId: voteReceipt.voteId,
        newValue: { targetId: validated.targetId, choiceId: validated.choiceId, house: validated.propertyCode },
      });
    }

    return new Response(
      JSON.stringify({
        data: voteReceipt,
        meta: {},
        error: null,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        data: null,
        error: { code: 'VOTE_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
