import type { APIRoute } from 'astro';
import { z } from 'zod';
import type { UserSession } from '../../../types/auth';
import { announcementFields } from '../../../lib/announcement-input';
import { updateAnnouncement } from '../../../services/announcement.service';

const input = announcementFields.partial().extend({ id: z.string().min(1).max(180) })
  .refine(({ id, ...fields }) => Object.keys(fields).length > 0);
export const POST: APIRoute = async ({ request, session }) => {
  const actor = await session?.get('wargahub_user') as UserSession | undefined;
  if (!actor) return Response.json({ error: { message: 'Silakan masuk kembali.' } }, { status: 401 });
  const body = input.safeParse(await request.json().catch(() => null));
  if (!body.success) return Response.json({ error: { message: 'Perubahan pengumuman tidak valid.' } }, { status: 400 });
  try {
    const { id, ...fields } = body.data;
    const saved = await updateAnnouncement(id, fields, actor);
    if (!saved) return Response.json({ error: { message: 'Pengumuman aktif tidak ditemukan.' } }, { status: 404 });
    return Response.json({ data: { id, ...fields }, error: null });
  } catch (error) {
    console.error('Pembaruan pengumuman:', error);
    return Response.json({ error: { message: 'Perubahan belum bisa dipastikan. Muat ulang daftar.' } }, { status: 503 });
  }
};
