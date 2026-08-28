import { t as neonSql } from "./neon_DiYtP58s.mjs";
import { g as properties, h as persons, s as complaints, t as db } from "./db_-Bx7JBvv.mjs";
import { n as recordAuditLog } from "./audit.service_D4o7GGen.mjs";
import { desc, eq } from "drizzle-orm";
//#region src/services/complaint.service.ts
async function getComplaints() {
	if (process.env.DATABASE_URL) try {
		return (await neonSql`
        SELECT 
          c.id, c.title, c.description, c.category, c.location,
          c.status, c.priority, c.created_at,
          prop.code as property_code,
          per.name as submitter_name
        FROM complaints c
        LEFT JOIN properties prop ON c.property_id = prop.id
        LEFT JOIN persons per ON c.submitted_by_person_id = per.id
        ORDER BY c.created_at DESC
      `).map((r) => ({
			id: r.id,
			title: r.title,
			description: r.description,
			category: r.category,
			location: r.location,
			status: r.status,
			priority: r.priority,
			propertyCode: r.property_code || "Fasum",
			submitterName: r.submitter_name || "Warga",
			createdAt: r.created_at ? new Date(r.created_at).toISOString().substring(0, 10) : ""
		}));
	} catch (e) {
		console.warn("Neon complaints error:", e);
	}
	return await db.select({
		id: complaints.id,
		title: complaints.title,
		description: complaints.description,
		category: complaints.category,
		location: complaints.location,
		status: complaints.status,
		priority: complaints.priority,
		propertyCode: properties.code,
		submitterName: persons.name,
		createdAt: complaints.createdAt
	}).from(complaints).leftJoin(properties, eq(complaints.propertyId, properties.id)).leftJoin(persons, eq(complaints.submittedByPersonId, persons.id)).orderBy(desc(complaints.createdAt));
}
async function getOpenComplaintsCount() {
	if (process.env.DATABASE_URL) try {
		const res = await neonSql`SELECT COUNT(*) as count FROM complaints WHERE status != 'RESOLVED' AND status != 'CLOSED'`;
		return Number(res[0].count) || 4;
	} catch (e) {
		console.warn("Neon open complaints count error:", e);
	}
	return (await db.select().from(complaints)).filter((c) => c.status !== "RESOLVED" && c.status !== "CLOSED").length || 4;
}
async function updateComplaintStatus(complaintId, status, notes, userId = "user-ketua") {
	if (process.env.DATABASE_URL) try {
		await neonSql`
        UPDATE complaints 
        SET status = ${status}, resolution_notes = ${notes || null}, updated_at = NOW()
        WHERE id = ${complaintId}
      `;
		await recordAuditLog({
			actorUserId: userId,
			actorName: "Pengurus Komplek",
			action: "complaint.status_update",
			entityType: "COMPLAINT",
			entityId: complaintId,
			newValue: {
				status,
				notes
			}
		});
		return true;
	} catch (e) {
		console.warn("Neon update complaint error:", e);
	}
	await db.update(complaints).set({
		status,
		resolutionNotes: notes || null
	}).where(eq(complaints.id, complaintId));
	return true;
}
//#endregion
export { getOpenComplaintsCount as n, updateComplaintStatus as r, getComplaints as t };
