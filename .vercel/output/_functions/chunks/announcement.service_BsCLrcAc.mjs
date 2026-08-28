import { t as neonSql } from "./neon_DiYtP58s.mjs";
import { r as announcements, t as db } from "./db_-Bx7JBvv.mjs";
import { n as recordAuditLog } from "./audit.service_D4o7GGen.mjs";
import { desc } from "drizzle-orm";
//#region src/services/announcement.service.ts
async function getAnnouncements() {
	if (process.env.DATABASE_URL) try {
		return (await neonSql`
        SELECT 
          id, title, content, category, audience,
          scheduled_at as "scheduledAt", location,
          is_pinned as "isPinned", is_published as "isPublished",
          created_at as "createdAt"
        FROM announcements
        WHERE is_published = true
        ORDER BY is_pinned DESC, created_at DESC
      `).map((r) => ({
			...r,
			createdAt: r.createdAt ? new Date(r.createdAt).toISOString().substring(0, 10) : ""
		}));
	} catch (e) {
		console.warn("Neon announcements error:", e);
	}
	return (await db.select().from(announcements).orderBy(desc(announcements.isPinned), desc(announcements.createdAt))).map((r) => ({
		...r,
		createdAt: r.createdAt ? new Date(r.createdAt).toISOString().substring(0, 10) : ""
	}));
}
async function createAnnouncement(data) {
	const id = `ann-${Date.now()}`;
	if (process.env.DATABASE_URL) try {
		await neonSql`
        INSERT INTO announcements (
          id, community_id, title, content, category, audience, scheduled_at, location, is_pinned, is_published, created_by
        ) VALUES (
          ${id}, 'comm-01', ${data.title}, ${data.content}, ${data.category || "INFO"},
          ${data.audience || "ALL"}, ${data.scheduledAt || null}, ${data.location || null},
          ${data.isPinned || false}, true, ${data.createdBy || "user-ketua"}
        )
      `;
		await recordAuditLog({
			actorUserId: data.createdBy || "user-ketua",
			actorName: "Ketua Komplek",
			action: "announcement.create",
			entityType: "ANNOUNCEMENT",
			entityId: id,
			newValue: { title: data.title }
		});
		return id;
	} catch (e) {
		console.warn("Neon create announcement error:", e);
	}
	await db.insert(announcements).values({
		id,
		communityId: "comm-01",
		title: data.title,
		content: data.content,
		category: data.category || "INFO",
		audience: data.audience || "ALL",
		scheduledAt: data.scheduledAt || null,
		location: data.location || null,
		isPinned: data.isPinned || false,
		isPublished: true,
		createdBy: data.createdBy || "user-ketua"
	});
	return id;
}
//#endregion
export { getAnnouncements as n, createAnnouncement as t };
