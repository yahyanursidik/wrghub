import type { APIRoute } from 'astro';
import { z } from 'zod';
import { complaintStatuses } from '../../../lib/complaint-status';
import { updateComplaintStatus } from '../../../services/complaint.service';
import type { UserSession } from '../../../types/auth';

const input = z.object({
  complaintId: z.string().min(1), status: z.enum(complaintStatuses),
  notes: z.string().trim().max(2000).optional(),
}).refine(body => body.status !== 'RESOLVED' || Boolean(body.notes), 'Tulis hasil penanganan sebelum menyelesaikan aduan.');

export const POST: APIRoute = async ({ request, session }) => {
  const body = input.safeParse(await request.json().catch(() => null));
  if (!body.success) return Response.json({ error: { message: body.error.issues[0]?.message } }, { status: 400 });
  const actor = await session?.get('wargahub_user') as UserSession | undefined;
  if (!actor) return Response.json({ error: { message: 'Silakan masuk kembali.' } }, { status: 401 });
  try {
    const result = await updateComplaintStatus(body.data.complaintId, body.data.status, body.data.notes, actor);
    if (result.outcome === 'missing') return Response.json({ error: { message: 'Aduan tidak ditemukan.' } }, { status: 404 });
    if (result.outcome === 'conflict') return Response.json({ error: { message: 'Status tidak dapat diubah. Muat ulang daftar aduan.' } }, { status: 409 });
    return Response.json({ data: result.data, error: null });
  } catch (error) {
    console.error('Gagal memperbarui aduan:', error);
    return Response.json({ error: { message: 'Perubahan belum bisa dipastikan. Muat ulang aduan sebelum mencoba lagi.' } }, { status: 503 });
  }
};
