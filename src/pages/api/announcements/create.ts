import type { APIRoute } from 'astro';
import { z } from 'zod';
import { createAnnouncement } from '../../../services/announcement.service';

const annSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(5),
  category: z.string().default('INFO'),
  audience: z.string().default('ALL'),
  scheduledAt: z.string().optional(),
  location: z.string().optional(),
  isPinned: z.boolean().default(false),
  createdBy: z.string().default('user-ketua'),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = annSchema.parse(body);
    const id = await createAnnouncement(validated);

    return new Response(
      JSON.stringify({
        data: { id, message: 'Pengumuman berhasil dipublikasikan.' },
        meta: {},
        error: null,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        data: null,
        error: { code: 'ANNOUNCEMENT_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
