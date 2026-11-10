import type { APIRoute } from 'astro';
import { and, eq, notLike } from 'drizzle-orm';
import { z } from 'zod';
import { neonSql } from '../../../db/neon';
import { db, schema } from '../../../db';
import { recordAuditLog } from '../../../services/audit.service';
import type { UserSession } from '../../../types/auth';

const input = z.object({
  requestId: z.string().min(1).max(180),
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED']),
  notes: z.string().trim().max(2000).optional(),
});

export const POST: APIRoute = async ({ request, session }) => {
  const actor = await session?.get('wargahub_user') as UserSession | undefined;
  if (!actor) return Response.json({ error: { message: 'Silakan masuk kembali.' } }, { status: 401 });
  const body = input.safeParse(await request.json().catch(() => null));
  if (!body.success) return Response.json({ error: { message: 'Status perawatan tidak valid.' } }, { status: 400 });
  const { requestId, status, notes } = body.data;
  const completedDate = status === 'RESOLVED' ? new Date().toISOString().slice(0, 10) : null;
  const mr = schema.maintenanceRequests;
  try {
    const rows = process.env.DATABASE_URL
      ? await neonSql`UPDATE maintenance_requests SET status = ${status}, completed_date = ${completedDate}
        WHERE id = ${requestId} AND title NOT LIKE 'Reservasi:%' RETURNING id`
      : await db.update(mr).set({ status, completedDate }).where(and(eq(mr.id, requestId), notLike(mr.title, 'Reservasi:%'))).returning({ id: mr.id });
    if (!rows.length) return Response.json({ error: { message: 'Pekerjaan perawatan tidak ditemukan.' } }, { status: 404 });
    await recordAuditLog({ actorUserId: actor.id, actorName: actor.fullName, action: 'facility.status_update',
      entityType: 'MAINTENANCE_REQUEST', entityId: requestId, newValue: { status, notes } });
    return Response.json({ data: { id: requestId, status }, error: null });
  } catch (error) {
    console.error('Pembaruan perawatan:', error);
    return Response.json({ error: { message: 'Perubahan belum bisa dipastikan. Muat ulang daftar.' } }, { status: 503 });
  }
};
