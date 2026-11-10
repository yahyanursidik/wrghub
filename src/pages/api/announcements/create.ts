import type { APIRoute } from 'astro';
import { z } from 'zod';
import type { UserSession } from '../../../types/auth';
import { announcementFields } from '../../../lib/announcement-input';
import { createAnnouncement } from '../../../services/announcement.service';

const input = announcementFields.extend({
  category: announcementFields.shape.category.default('INFO'), audience: announcementFields.shape.audience.default('ALL'),
  scheduledAt: announcementFields.shape.scheduledAt.default(null), location: announcementFields.shape.location.default(null), isPinned: z.boolean().default(false),
});
export const POST: APIRoute = async ({ request, session }) => {
  const actor = await session?.get('wargahub_user') as UserSession | undefined;
  if (!actor) return Response.json({ error: { message: 'Silakan masuk kembali.' } }, { status: 401 });
  const body = input.safeParse(await request.json().catch(() => null));
  if (!body.success) return Response.json({ error: { message: body.error.issues[0]?.message } }, { status: 400 });
  try {
    const id = await createAnnouncement(body.data, actor);
    return Response.json({ data: { id, ...body.data, isPublished: true, createdAt: new Date().toISOString() }, error: null }, { status: 201 });
  } catch (error) {
    console.error('Penerbitan pengumuman:', error);
    return Response.json({ error: { message: 'Penerbitan belum bisa dipastikan. Muat ulang daftar.' } }, { status: 503 });
  }
};
