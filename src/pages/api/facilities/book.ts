import type { APIRoute } from 'astro';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { writeTransaction } from '../../../db/operational-query';
import { encodeReservation } from '../../../lib/reservation';
import { isResidentRole } from '../../../lib/access-policy';
import { getFacilityBookings } from '../../../services/facility.service';
import { getProperties } from '../../../services/property.service';
import { OperationalError, operationalAudit } from '../../../services/operational-mutation';
import type { UserSession } from '../../../types/auth';

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const input = z.object({
  facilityId: z.string().min(1).max(180), propertyId: z.string().min(1).optional(),
  propertyCode: z.string().trim().max(60).optional(), residentName: z.string().trim().min(1).max(120).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), startTime: time, endTime: time,
  purpose: z.string().trim().min(3).max(600), contactPhone: z.string().trim().max(30).optional(),
});
export const POST: APIRoute = async ({ request, session }) => {
  const actor = await session?.get('wargahub_user') as UserSession | undefined;
  if (!actor) return Response.json({ error: { message: 'Silakan masuk kembali.' } }, { status: 401 });
  const body = input.safeParse(await request.json().catch(() => null));
  if (!body.success) return Response.json({ error: { message: 'Lengkapi data reservasi.' } }, { status: 400 });
  const data = body.data;
  const date = new Date(`${data.date}T00:00:00.000Z`);
  if (data.endTime <= data.startTime || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== data.date)
    return Response.json({ error: { message: 'Periksa tanggal dan rentang waktu reservasi.' } }, { status: 400 });
  try {
    const resident = isResidentRole(actor.role);
    const propertyId = resident ? actor.propertyId : data.propertyId;
    const propertyCode = resident ? actor.propertyCode : data.propertyCode;
    const property = propertyId || propertyCode ? (await getProperties()).find(item => propertyId ? item.id === propertyId : item.code.toLowerCase() === propertyCode?.toLowerCase()) : undefined;
    if ((resident || propertyId || propertyCode) && !property)
      return Response.json({ error: { message: 'Rumah pemohon tidak ditemukan.' } }, { status: 404 });
    const id = await writeTransaction(async (run, lock) => {
      const [facility] = await run<{name:string;condition:string}>('SELECT name,condition FROM facilities WHERE id=? AND archived_at IS NULL'+lock,[data.facilityId]);
      if (!facility) throw new OperationalError('Fasilitas tidak ditemukan.',404);
      if (facility.condition !== 'GOOD') throw new OperationalError('Fasilitas ini belum bisa dipesan.');
      const id = 'res-' + randomUUID();
      const title = 'Reservasi: ' + facility.name + ' (' + data.date + ')';
      const performedBy = resident ? actor.fullName : data.residentName || actor.fullName;
      const description = encodeReservation({propertyId:property?.id ?? null,propertyCode:property?.code ?? null,
        purpose:data.purpose,startTime:data.startTime,endTime:data.endTime,phone:data.contactPhone || null});
      await run("INSERT INTO maintenance_requests (id,facility_id,title,description,cost_estimate,actual_cost,status,scheduled_date,performed_by) VALUES (?,?,?,?,0,0,'PLANNED',?,?)",
        [id,data.facilityId,title,description,data.date,performedBy]);
      await operationalAudit(run,actor,'facility.book','FACILITY_BOOKING',id,{facilityId:data.facilityId,propertyId:property?.id,date:data.date});
      return id;
    });
    const booking = (await getFacilityBookings(property?.id)).find(item => item.id === id);
    if (!booking) throw new Error('Reservasi tidak muncul pada pembacaan ulang.');
    return Response.json({ data: booking, error: null }, { status: 201 });
  } catch (error) {
    if (error instanceof OperationalError) return Response.json({error:{message:error.message}},{status:error.status});
    console.error('Pengajuan reservasi gagal', error instanceof Error ? error.name : typeof error);
    return Response.json({ error: { message: 'Penyimpanan belum bisa dipastikan. Muat ulang daftar reservasi.' } }, { status: 503 });
  }
};
