import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { n as recordAuditLog } from "./audit.service_D4o7GGen.mjs";
import { z } from "zod";
//#region src/pages/api/properties/permits/delete.ts
var delete_exports = /* @__PURE__ */ __exportAll({ POST: () => POST });
var deletePermitSchema = z.object({
	permitId: z.string().min(1),
	houseCode: z.string().optional(),
	contractorName: z.string().optional(),
	reason: z.string().optional()
});
var POST = async ({ request }) => {
	try {
		const body = await request.json();
		const validated = deletePermitSchema.parse(body);
		if (process.env.DATABASE_URL) await recordAuditLog({
			actorName: "Pengurus Komplek",
			action: "property.delete_permit",
			entityType: "RENOVATION_PERMIT",
			entityId: validated.permitId,
			newValue: {
				permitId: validated.permitId,
				house: validated.houseCode,
				contractor: validated.contractorName,
				reason: validated.reason || "Dibatalkan / Dihapus dari sistem pengawasan",
				deletedAt: (/* @__PURE__ */ new Date()).toISOString()
			}
		});
		return new Response(JSON.stringify({
			data: {
				success: true,
				id: validated.permitId,
				message: `Izin renovasi ${validated.permitId} berhasil dibatalkan / dihapus dari sistem pengawasan.`
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
				code: "DELETE_PERMIT_FAILED",
				message: err.message
			}
		}), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/properties/permits/delete@_@ts
var page = () => delete_exports;
//#endregion
export { page };
