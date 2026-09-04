import { neonSql } from '../db/neon';
import { db, schema } from '../db';
import { eq } from 'drizzle-orm';

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
  .leftJoin(schema.facilities, eq(schema.maintenanceRequests.facilityId, schema.facilities.id));
}
