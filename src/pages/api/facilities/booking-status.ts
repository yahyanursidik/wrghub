import type { APIRoute } from 'astro';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db, schema } from '../../../db';
import { neonSql } from '../../../db/neon';
import { recordAuditLog } from '../../../services/audit.service';
import { authorizeApi } from '../../../lib/api-authorization';

const inputSchema = z.object({ id: z.string().min(1), status: z.enum(['PENDING', 'APPROVED', 'COMPLETED', 'REJECTED']) });
const storedStatus = { PENDING: 'PLANNED', APPROVED: 'IN_PROGRESS', COMPLETED: 'RESOLVED', REJECTED: 'CANCELLED' };
export const POST: APIRoute = async (context) => {
  const authorization = await authorizeApi(context, ['SUPER_ADMIN', 'CHAIRMAN', 'SECRETARY', 'MAINTENANCE', 'SECURITY']);
  if (authorization.response) return authorization.response;
  const { request } = context;
  try {
    const input = inputSchema.parse(await request.json());
    if (process.env.DATABASE_URL) {
      const rows = await neonSql`UPDATE maintenance_requests SET status = ${storedStatus[input.status]} WHERE id = ${input.id} AND title LIKE 'Reservasi:%' RETURNING id`;
      if (!rows.length) throw new Error('Reservasi tidak ditemukan.');
    } else {
      const [booking] = await db.select().from(schema.maintenanceRequests).where(eq(schema.maintenanceRequests.id, input.id));
      if (!booking?.title.startsWith('Reservasi:')) throw new Error('Reservasi tidak ditemukan.');
      await db.update(schema.maintenanceRequests).set({ status: storedStatus[input.status] }).where(eq(schema.maintenanceRequests.id, input.id));
    }
    await recordAuditLog({ actorName: 'Pengurus fasilitas', action: 'facility.booking_status', entityType: 'FACILITY_BOOKING', entityId: input.id, newValue: { status: input.status } });
    return Response.json({ data: input, error: null });
  } catch (error) { return Response.json({ error: { message: error instanceof Error ? error.message : 'Status reservasi belum tersimpan.' } }, { status: 400 }); }
};
