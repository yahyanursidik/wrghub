import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { n as recordAuditLog } from "./audit.service_D4o7GGen.mjs";
import { z } from "zod";
//#region src/pages/api/properties/occupants/delete.ts
var delete_exports = /* @__PURE__ */ __exportAll({ POST: () => POST });
var deleteOccupantSchema = z.object({
	occupantId: z.string().min(1),
	fullName: z.string().optional(),
	houseCode: z.string().optional(),
	reason: z.string().optional()
});
var POST = async ({ request }) => {
	try {
		const body = await request.json();
		const validated = deleteOccupantSchema.parse(body);
		if (process.env.DATABASE_URL) await recordAuditLog({
			actorName: "Pengurus Komplek",
			action: "property.delete_occupant",
			entityType: "PROPERTY_OCCUPANT",
			entityId: validated.occupantId,
			newValue: {
				name: validated.fullName,
				house: validated.houseCode,
				reason: validated.reason || "Dihapus dari database kependudukan",
				deletedAt: (/* @__PURE__ */ new Date()).toISOString()
			}
		});
		return new Response(JSON.stringify({
			data: {
				success: true,
				id: validated.occupantId,
				message: `Data kependudukan ${validated.fullName || validated.occupantId} berhasil dihapus/dinonaktifkan.`
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
				code: "DELETE_OCCUPANT_FAILED",
				message: err.message
			}
		}), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/properties/occupants/delete@_@ts
var page = () => delete_exports;
//#endregion
export { page };
