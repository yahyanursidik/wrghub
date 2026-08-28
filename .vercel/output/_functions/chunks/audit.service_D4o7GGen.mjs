import { t as neonSql } from "./neon_DiYtP58s.mjs";
import { i as auditLogs, t as db } from "./db_-Bx7JBvv.mjs";
import { desc } from "drizzle-orm";
//#region src/services/audit.service.ts
async function recordAuditLog(log) {
	const id = `aud-${Date.now()}`;
	const oldJson = log.oldValue ? JSON.stringify(log.oldValue) : null;
	const newJson = log.newValue ? JSON.stringify(log.newValue) : null;
	if (process.env.DATABASE_URL) try {
		await neonSql`
        INSERT INTO audit_logs (
          id, actor_user_id, actor_name, action, entity_type, entity_id, old_value_json, new_value_json, ip_address, user_agent
        ) VALUES (
          ${id}, ${log.actorUserId || null}, ${log.actorName}, ${log.action}, ${log.entityType},
          ${log.entityId}, ${oldJson}, ${newJson}, ${log.ipAddress || null}, ${log.userAgent || null}
        )
      `;
		return id;
	} catch (e) {
		console.warn("Neon audit log error:", e);
	}
	await db.insert(auditLogs).values({
		id,
		actorUserId: log.actorUserId || null,
		actorName: log.actorName,
		action: log.action,
		entityType: log.entityType,
		entityId: log.entityId,
		oldValueJson: oldJson,
		newValueJson: newJson,
		ipAddress: log.ipAddress || null,
		userAgent: log.userAgent || null
	});
	return id;
}
async function getAuditLogs(limit = 20) {
	if (process.env.DATABASE_URL) try {
		return (await neonSql`
        SELECT 
          id, actor_user_id as "actorUserId", actor_name as "actorName",
          action, entity_type as "entityType", entity_id as "entityId",
          old_value_json as "oldValueJson", new_value_json as "newValueJson",
          ip_address as "ipAddress", user_agent as "userAgent",
          created_at as "createdAt"
        FROM audit_logs
        ORDER BY created_at DESC
        LIMIT ${limit}
      `).map((r) => ({
			...r,
			createdAt: r.createdAt ? new Date(r.createdAt).toISOString().replace("T", " ").substring(0, 19) : ""
		}));
	} catch (e) {
		console.warn("Neon get audit logs error:", e);
	}
	return (await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit)).map((r) => ({
		...r,
		createdAt: r.createdAt ? new Date(r.createdAt).toISOString().replace("T", " ").substring(0, 19) : ""
	}));
}
//#endregion
export { recordAuditLog as n, getAuditLogs as t };
