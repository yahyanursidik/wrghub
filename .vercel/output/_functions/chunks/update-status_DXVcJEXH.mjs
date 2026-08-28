import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { t as neonSql } from "./neon_DiYtP58s.mjs";
import { n as recordAuditLog } from "./audit.service_D4o7GGen.mjs";
import { z } from "zod";
//#region src/pages/api/facilities/update-status.ts
var update_status_exports = /* @__PURE__ */ __exportAll({ POST: () => POST });
var statusSchema = z.object({
	requestId: z.string(),
	status: z.string(),
	approvedBy: z.string().default("user-ketua"),
	notes: z.string().optional()
});
var POST = async ({ request }) => {
	try {
		const body = await request.json();
		const validated = statusSchema.parse(body);
		if (process.env.DATABASE_URL) {
			await neonSql`
        UPDATE maintenance_requests
        SET status = ${validated.status},
            completed_date = ${validated.status === "COMPLETED" ? (/* @__PURE__ */ new Date()).toISOString().substring(0, 10) : null}
        WHERE id = ${validated.requestId};
      `;
			await recordAuditLog({
				actorName: "Pengurus / Pengelola Sarana",
				action: "facility.status_update",
				entityType: "MAINTENANCE_REQUEST",
				entityId: validated.requestId,
				newValue: {
					status: validated.status,
					notes: validated.notes
				}
			});
			return new Response(JSON.stringify({
				data: {
					success: true,
					message: `Status permohonan sarana berhasil diubah menjadi ${validated.status}.`
				},
				meta: {},
				error: null
			}), {
				status: 200,
				headers: { "Content-Type": "application/json" }
			});
		}
		return new Response(JSON.stringify({ data: {
			success: true,
			message: "Status diupdate."
		} }), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({
			data: null,
			error: {
				code: "STATUS_UPDATE_FAILED",
				message: err.message
			}
		}), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/facilities/update-status@_@ts
var page = () => update_status_exports;
//#endregion
export { page };
