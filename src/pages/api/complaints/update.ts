import type { APIRoute } from 'astro';
import { z } from 'zod';
import { updateComplaintStatus } from '../../../services/complaint.service';

const updateSchema = z.object({
  complaintId: z.string(),
  status: z.enum(['REPORTED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
  notes: z.string().optional(),
  userId: z.string().default('user-ketua'),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = updateSchema.parse(body);
    await updateComplaintStatus(validated.complaintId, validated.status, validated.notes, validated.userId);

    return new Response(
      JSON.stringify({
        data: { message: 'Status aduan berhasil diperbarui.' },
        meta: {},
        error: null,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        data: null,
        error: { code: 'UPDATE_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
