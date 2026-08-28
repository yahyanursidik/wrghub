import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { n as recordAuditLog } from "./audit.service_D4o7GGen.mjs";
import { z } from "zod";
//#region src/pages/api/properties/utilities/delete.ts
var delete_exports = /* @__PURE__ */ __exportAll({ POST: () => POST });
var deleteUtilitySchema = z.object({
	utilityId: z.string().min(1),
	houseCode: z.string().optional(),
	reason: z.string().optional()
});
var POST = async ({ request }) => {
	try {
		const body = await request.json();
		const validated = deleteUtilitySchema.parse(body);
		if (process.env.DATABASE_URL) await recordAuditLog({
			actorName: "Pengurus Komplek",
			action: "property.delete_utility",
			entityType: "PROPERTY_UTILITY",
			entityId: validated.utilityId,
			newValue: {
				utilityId: validated.utilityId,
				house: validated.houseCode,
				reason: validated.reason || "Reset data meteran utilitas",
				deletedAt: (/* @__PURE__ */ new Date()).toISOString()
			}
		});
		return new Response(JSON.stringify({
			data: {
				success: true,
				id: validated.utilityId,
				message: `Catatan utilitas ${validated.utilityId} berhasil direset / dihapus.`
			},
			meta: {},
			error: null
		}), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({
			data: null,
			error: {
				code: "DELETE_UTILITY_FAILED",
				message: err.message
			}
		}), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/properties/utilities/delete@_@ts
var page = () => delete_exports;
//#endregion
export { page };
