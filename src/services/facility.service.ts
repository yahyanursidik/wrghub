import { neonSql } from '../db/neon';
import { db, schema } from '../db';
import { desc, eq, like, notLike } from 'drizzle-orm';
import { writeTransaction } from '../db/operational-query';
import { readReservation, type ReservationStatus } from '../lib/reservation';

export { listCatalog as getFacilities, countCatalogRepairs as getNeedingRepairCount } from './catalog.service';

export async function getMaintenanceRequests() {
  if (process.env.DATABASE_URL) {
    try {
      const rows = await neonSql`
        SELECT 
          mr.id, mr.title, mr.description,
          mr.cost_estimate as "costEstimate", mr.actual_cost as "actualCost",
          mr.status, mr.scheduled_date as "scheduledDate", mr.performed_by as "performedBy",
          f.name as "facilityName", f.location as "facilityLocation"
        FROM maintenance_requests mr
        LEFT JOIN facilities f ON mr.facility_id = f.id
        WHERE mr.title NOT LIKE 'Reservasi:%'
        ORDER BY mr.created_at DESC
      `;
      return rows.map((r: any) => ({
        ...r,
        costEstimate: Number(r.costEstimate) || 0,
        actualCost: Number(r.actualCost) || 0,
      }));
    } catch (e) {
      console.warn('Neon maintenance error:', e);
    }
  }

  return await db.select({
    id: schema.maintenanceRequests.id,
    title: schema.maintenanceRequests.title,
    description: schema.maintenanceRequests.description,
    costEstimate: schema.maintenanceRequests.costEstimate,
    actualCost: schema.maintenanceRequests.actualCost,
    status: schema.maintenanceRequests.status,
    scheduledDate: schema.maintenanceRequests.scheduledDate,
    performedBy: schema.maintenanceRequests.performedBy,
    facilityName: schema.facilities.name,
    facilityLocation: schema.facilities.location,
  })
  .from(schema.maintenanceRequests)
  .leftJoin(schema.facilities, eq(schema.maintenanceRequests.facilityId, schema.facilities.id))
  .where(notLike(schema.maintenanceRequests.title, 'Reservasi:%'));
}

/** Use the existing reservation records, and expose new ones to their linked house. */
export async function getFacilityBookings(propertyId?: string) {
  const rows = process.env.DATABASE_URL
    ? await neonSql`SELECT mr.id, mr.facility_id as "facilityId", f.name as "facilityName", mr.description, mr.scheduled_date as "date", mr.performed_by as "residentName", mr.status FROM maintenance_requests mr LEFT JOIN facilities f ON f.id = mr.facility_id WHERE mr.title LIKE 'Reservasi:%' ORDER BY mr.created_at DESC`
    : await db.select({ id: schema.maintenanceRequests.id, facilityId: schema.maintenanceRequests.facilityId, facilityName: schema.facilities.name, description: schema.maintenanceRequests.description, date: schema.maintenanceRequests.scheduledDate, residentName: schema.maintenanceRequests.performedBy, status: schema.maintenanceRequests.status }).from(schema.maintenanceRequests).leftJoin(schema.facilities, eq(schema.maintenanceRequests.facilityId, schema.facilities.id)).where(like(schema.maintenanceRequests.title, 'Reservasi:%')).orderBy(desc(schema.maintenanceRequests.createdAt));
  return rows.flatMap(row => {
    const details = readReservation(row.description);
    if (propertyId !== undefined && details.propertyId !== propertyId) return [];
    return [{
      id: String(row.id), bookingNumber: String(row.id), facilityId: String(row.facilityId || ''), facilityName: String(row.facilityName || 'Fasilitas'),
      propertyCode: details.propertyCode || '—', residentName: String(row.residentName || '—'), phone: details.phone || '—',
      date: row.date ? new Date(row.date).toISOString().slice(0, 10) : '—', startTime: details.startTime, endTime: details.endTime,
      purpose: details.purpose, depositAmount: 0,
      status: row.status === 'IN_PROGRESS' ? 'APPROVED' as const : row.status === 'RESOLVED' ? 'COMPLETED' as const : row.status === 'CANCELLED' ? 'REJECTED' as const : 'PENDING' as const,
    }];
  });
}

const storedStatus = { PENDING: 'PLANNED', APPROVED: 'IN_PROGRESS', COMPLETED: 'RESOLVED', REJECTED: 'CANCELLED' };
function changeError(current: string, status: ReservationStatus) {
  const allowed = current === 'PLANNED' ? ['APPROVED', 'REJECTED'] : current === 'IN_PROGRESS' ? ['COMPLETED', 'REJECTED'] : [];
  return !allowed.includes(status) ? 'Status reservasi sudah berubah. Muat ulang daftar.' : null;
}
function slotConflict(description: string | null, rows: { description: string | null }[]) {
  const requested = readReservation(description);
  if (requested.startTime === '-' || requested.endTime === '-') return rows.length > 0;
  return rows.some(({ description }) => {
    const reserved = readReservation(description);
    return reserved.startTime === '-' || reserved.endTime === '-' ||
      (requested.startTime < reserved.endTime && reserved.startTime < requested.endTime);
  });
}

export async function changeReservationStatus(id: string, status: ReservationStatus) {
  return writeTransaction(async (run, lock) => {
    const [scope] = await run<{facility_id:string}>("SELECT facility_id FROM maintenance_requests WHERE id=? AND title LIKE 'Reservasi:%'",[id]);
    if (!scope) return { outcome: 'missing' as const };
    const [facility] = await run<{condition:string;archived_at:string|null}>('SELECT condition,archived_at FROM facilities WHERE id=?'+lock,[scope.facility_id]);
    const [row] = await run<{status:string;description:string;scheduled_date:string|null}>('SELECT status,description,scheduled_date FROM maintenance_requests WHERE id=?'+lock,[id]);
    if (!row) return { outcome: 'missing' as const };
    const invalid = changeError(row.status,status);
    if (invalid) return { outcome: 'conflict' as const, message: invalid };
    if (status === 'APPROVED') {
      if (!facility || facility.archived_at || facility.condition !== 'GOOD') return {outcome:'conflict' as const,message:'Fasilitas sedang tidak tersedia.'};
      const others = await run<{description:string}>("SELECT description FROM maintenance_requests WHERE facility_id=? AND scheduled_date=? AND status='IN_PROGRESS' AND title LIKE 'Reservasi:%' AND id<>?",[scope.facility_id,row.scheduled_date,id]);
      if (slotConflict(row.description,others)) return {outcome:'conflict' as const,message:'Jadwal bertabrakan dengan reservasi yang sudah disetujui.'};
    }
    await run('UPDATE maintenance_requests SET status=? WHERE id=?',[storedStatus[status],id]);
    return {outcome:'saved' as const};
  });
}
