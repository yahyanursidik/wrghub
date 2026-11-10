import type { APIRoute } from 'astro';
import { z } from 'zod';
import type { UserSession } from '../../../types/auth';
import { archiveAnnouncements } from '../../../services/announcement.service';

const id = z.string().min(1).max(180);
const input = z.object({ id: id.optional(), ids: z.array(id).min(1).max(100).optional() });
export const POST: APIRoute = async ({ request, session }) => {
  const actor = await session?.get('wargahub_user') as UserSession | undefined;
  if (!actor) return Response.json({ error: { message: 'Silakan masuk kembali.' } }, { status: 401 });
  const body = input.safeParse(await request.json().catch(() => null));
  if (!body.success) return Response.json({ error: { message: 'Pilih pengumuman yang akan diarsipkan.' } }, { status: 400 });
  const ids = body.data.ids ?? (body.data.id ? [body.data.id] : []);
  if (!ids.length) return Response.json({ error: { message: 'Pilih pengumuman yang akan diarsipkan.' } }, { status: 400 });
  try {
    const archived = await archiveAnnouncements([...new Set(ids)], actor);
    if (!archived.length) return Response.json({ error: { message: 'Pengumuman aktif tidak ditemukan.' } }, { status: 404 });
    return Response.json({ data: { ids: archived }, error: null });
  } catch (error) {
    console.error('Pengarsipan pengumuman:', error);
    return Response.json({ error: { message: 'Status arsip belum bisa dipastikan. Muat ulang daftar.' } }, { status: 503 });
  }
};
