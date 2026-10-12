import { neonSql } from '../db/neon';
import { db, schema } from '../db';
import { eq, like, notLike } from 'drizzle-orm';

export async function getFacilities() {
  if (process.env.DATABASE_URL) {
    try {
      const rows = await neonSql`SELECT * FROM facilities ORDER BY code ASC`;
      return rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        code: r.code,
        category: r.category,
        location: r.location,
        condition: r.condition,
        notes: r.notes,
      }));
    } catch (e) {
      console.warn('Neon facilities error:', e);
    }
  }
  return await db.select().from(schema.facilities);
}

export async function getNeedingRepairCount() {
  if (process.env.DATABASE_URL) {
    try {
      const res = await neonSql`SELECT COUNT(*) as count FROM facilities WHERE condition != 'GOOD'`;
      return Number(res[0]?.count ?? 0);
    } catch (e) {
      console.warn('Neon repair count error:', e);
    }
  }
  const all = await db.select().from(schema.facilities);
  return all.filter(f => f.condition !== 'GOOD').length;
}

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

/** Read the existing reservation records separately from maintenance work. */
export async function getFacilityBookings() {
  const rows = process.env.DATABASE_URL
    ? await neonSql`SELECT mr.id, mr.facility_id as "facilityId", f.name as "facilityName", mr.description, mr.scheduled_date as "date", mr.performed_by as "residentName", mr.status FROM maintenance_requests mr LEFT JOIN facilities f ON f.id = mr.facility_id WHERE mr.title LIKE 'Reservasi:%' ORDER BY mr.created_at DESC`
    : await db.select({ id: schema.maintenanceRequests.id, facilityId: schema.maintenanceRequests.facilityId, facilityName: schema.facilities.name, description: schema.maintenanceRequests.description, date: schema.maintenanceRequests.scheduledDate, residentName: schema.maintenanceRequests.performedBy, status: schema.maintenanceRequests.status }).from(schema.maintenanceRequests).leftJoin(schema.facilities, eq(schema.maintenanceRequests.facilityId, schema.facilities.id)).where(like(schema.maintenanceRequests.title, 'Reservasi:%'));
  return rows.map(row => {
    const description = row.description || '';
    const times = description.match(/Waktu:\s*(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
    return {
      id: row.id, bookingNumber: row.id, facilityId: row.facilityId || '', facilityName: row.facilityName || 'Fasilitas',
      propertyCode: '-', residentName: row.residentName || '-', phone: description.match(/Kontak:\s*([^|]+)/)?.[1]?.trim() || '-',
      date: row.date ? new Date(row.date).toISOString().slice(0, 10) : '-', startTime: times?.[1] || '-', endTime: times?.[2] || '-',
      purpose: description.match(/Keperluan:\s*([^|]+)/)?.[1]?.trim() || description, depositAmount: 0,
      status: row.status === 'IN_PROGRESS' ? 'APPROVED' as const : row.status === 'RESOLVED' ? 'COMPLETED' as const : row.status === 'CANCELLED' ? 'REJECTED' as const : 'PENDING' as const,
    };
  });
}
