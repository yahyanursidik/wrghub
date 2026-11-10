import type { APIRoute } from 'astro';
import { z } from 'zod';
import { reservationStatuses } from '../../../lib/reservation';
import { changeReservationStatus } from '../../../services/facility.service';
import { recordAuditLog } from '../../../services/audit.service';
import { authorizeApi } from '../../../lib/api-authorization';

const input = z.object({ id: z.string().min(1).max(180), status: z.enum(reservationStatuses) });
export const POST: APIRoute = async context => {
  const authorization = await authorizeApi(context, ['SUPER_ADMIN', 'CHAIRMAN', 'SECRETARY', 'MAINTENANCE', 'SECURITY']);
  if (authorization.response) return authorization.response;
  const body = input.safeParse(await context.request.json().catch(() => null));
  if (!body.success) return Response.json({ error: { message: 'Status reservasi tidak valid.' } }, { status: 400 });
  const { id, status } = body.data;
  const actor = authorization.user;
  try {
    const result = await changeReservationStatus(id, status);
    if (result.outcome === 'missing') return Response.json({ error: { message: 'Reservasi tidak ditemukan.' } }, { status: 404 });
    if (result.outcome === 'conflict') return Response.json({ error: { message: result.message } }, { status: 409 });
    await recordAuditLog({ actorUserId: actor.id, actorName: actor.fullName, action: 'facility.booking_status',
      entityType: 'FACILITY_BOOKING', entityId: id, newValue: { status } });
    return Response.json({ data: { id, status, approvedBy: actor.fullName }, error: null });
  } catch (error) {
    console.error('Pembaruan reservasi:', error);
    return Response.json({ error: { message: 'Perubahan belum bisa dipastikan. Muat ulang daftar.' } }, { status: 503 });
  }
};
