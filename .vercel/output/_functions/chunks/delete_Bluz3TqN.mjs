import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { t as neonSql } from "./neon_DiYtP58s.mjs";
import { n as recordAuditLog } from "./audit.service_D4o7GGen.mjs";
import { z } from "zod";
//#region src/pages/api/properties/delete.ts
var delete_exports = /* @__PURE__ */ __exportAll({ POST: () => POST });
var deleteSchema = z.object({
	propertyId: z.string().min(1),
	propertyCode: z.string().optional(),
	reason: z.string().optional()
});
var POST = async ({ request }) => {
	try {
		const body = await request.json();
		const validated = deleteSchema.parse(body);
		if (process.env.DATABASE_URL) {
			await neonSql`
        UPDATE properties
        SET is_active = false, updated_at = NOW()
        WHERE id = ${validated.propertyId} OR code = ${validated.propertyCode || ""};
      `;
			await recordAuditLog({
				actorName: "Pengurus Komplek",
				action: "property.delete",
				entityType: "PROPERTY",
				entityId: validated.propertyId,
				newValue: {
					code: validated.propertyCode,
					reason: validated.reason || "Dihapus oleh pengurus komplek",
					deletedAt: (/* @__PURE__ */ new Date()).toISOString()
				}
			});
			return new Response(JSON.stringify({
				data: {
					success: true,
					id: validated.propertyId,
					message: `Unit rumah ${validated.propertyCode || validated.propertyId} berhasil dihapus dari direktori aktif.`
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
			message: "Unit rumah dihapus (mock mode)."
		} }), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({
			data: null,
			error: {
				code: "PROPERTY_DELETE_FAILED",
				message: err.message
			}
		}), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/properties/delete@_@ts
var page = () => delete_exports;
//#endregion
export { page };
