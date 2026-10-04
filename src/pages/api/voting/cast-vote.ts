import type { APIRoute } from 'astro';
import { z } from 'zod';
import { castVote, VoteAlreadyCastError } from '../../../services/voting.service';

export const prerender = false;

const voteSchema = z.object({
  targetType: z.enum(['ELECTION', 'POLL']).default('ELECTION'),
  targetId: z.string().min(1),
  choiceId: z.string().min(1),
  propertyCode: z.string().min(1),
  voterName: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = voteSchema.parse(body);

    const result = await castVote({
      pollId: validated.targetId,
      optionId: validated.choiceId,
      propertyCode: validated.propertyCode,
      voterName: validated.voterName,
    });

    return new Response(
      JSON.stringify({
        data: {
          voteId: result.voteId,
          receiptCode: result.receiptCode,
          targetType: validated.targetType,
          targetId: validated.targetId,
          choiceId: validated.choiceId,
          propertyCode: validated.propertyCode,
          status: 'RECORDED_AND_VERIFIED',
          castAt: new Date().toISOString(),
          tally: result.tally,
          totalVoted: result.totalVoted,
        },
        meta: {},
        error: null,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    if (err instanceof VoteAlreadyCastError) {
      return new Response(
        JSON.stringify({
          data: null,
          error: { code: 'ALREADY_VOTED', message: err.message },
        }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }
    const isZod = err instanceof z.ZodError;
    return new Response(
      JSON.stringify({
        data: null,
        error: { code: isZod ? 'VOTE_VALIDATION_FAILED' : err?.name === 'VoteAlreadyCastError' ? 'ALREADY_VOTED' : 'VOTE_FAILED', message: isZod ? 'Data suara tidak lengkap.' : err?.message || 'Gagal mencatat suara' },
      }),
      { status: isZod ? 400 : err instanceof VoteAlreadyCastError ? 409 : 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
