import { t as neonSql } from "./neon_DiYtP58s.mjs";
import { p as maintenanceRequests, t as db, u as facilities } from "./db_-Bx7JBvv.mjs";
import { eq } from "drizzle-orm";
//#region src/services/facility.service.ts
async function getFacilities() {
	if (process.env.DATABASE_URL) try {
		return (await neonSql`SELECT * FROM facilities ORDER BY code ASC`).map((r) => ({
			id: r.id,
			name: r.name,
			code: r.code,
			category: r.category,
			location: r.location,
			condition: r.condition,
			notes: r.notes
		}));
	} catch (e) {
		console.warn("Neon facilities error:", e);
	}
	return await db.select().from(facilities);
}
async function getNeedingRepairCount() {
	if (process.env.DATABASE_URL) try {
		const res = await neonSql`SELECT COUNT(*) as count FROM facilities WHERE condition != 'GOOD'`;
		return Number(res[0].count) || 2;
	} catch (e) {
		console.warn("Neon repair count error:", e);
	}
	return (await db.select().from(facilities)).filter((f) => f.condition !== "GOOD").length || 2;
}
async function getMaintenanceRequests() {
	if (process.env.DATABASE_URL) try {
		return (await neonSql`
        SELECT 
          mr.id, mr.title, mr.description,
          mr.cost_estimate as "costEstimate", mr.actual_cost as "actualCost",
          mr.status, mr.scheduled_date as "scheduledDate", mr.performed_by as "performedBy",
          f.name as "facilityName", f.location as "facilityLocation"
        FROM maintenance_requests mr
        LEFT JOIN facilities f ON mr.facility_id = f.id
        ORDER BY mr.created_at DESC
      `).map((r) => ({
			...r,
			costEstimate: Number(r.costEstimate) || 0,
			actualCost: Number(r.actualCost) || 0
		}));
	} catch (e) {
		console.warn("Neon maintenance error:", e);
	}
	return await db.select({
		id: maintenanceRequests.id,
		title: maintenanceRequests.title,
		description: maintenanceRequests.description,
		costEstimate: maintenanceRequests.costEstimate,
		actualCost: maintenanceRequests.actualCost,
		status: maintenanceRequests.status,
		scheduledDate: maintenanceRequests.scheduledDate,
		performedBy: maintenanceRequests.performedBy,
		facilityName: facilities.name,
		facilityLocation: facilities.location
	}).from(maintenanceRequests).leftJoin(facilities, eq(maintenanceRequests.facilityId, facilities.id));
}
//#endregion
export { getMaintenanceRequests as n, getNeedingRepairCount as r, getFacilities as t };
