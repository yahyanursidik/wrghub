import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { n as recordAuditLog } from "./audit.service_D4o7GGen.mjs";
import { z } from "zod";
//#region src/pages/api/properties/vehicles/delete.ts
var delete_exports = /* @__PURE__ */ __exportAll({ POST: () => POST });
var deleteVehicleSchema = z.object({
	vehicleId: z.string().min(1),
	plateNumber: z.string().optional(),
	houseCode: z.string().optional(),
	reason: z.string().optional()
});
var POST = async ({ request }) => {
	try {
		const body = await request.json();
		const validated = deleteVehicleSchema.parse(body);
		if (process.env.DATABASE_URL) await recordAuditLog({
			actorName: "Pengurus Komplek",
			action: "property.delete_vehicle",
			entityType: "PROPERTY_VEHICLE",
			entityId: validated.vehicleId,
			newValue: {
				plate: validated.plateNumber,
				house: validated.houseCode,
				reason: validated.reason || "Dihapus dari master kendaraan",
				deletedAt: (/* @__PURE__ */ new Date()).toISOString()
			}
		});
		return new Response(JSON.stringify({
			data: {
				success: true,
				id: validated.vehicleId,
				message: `Kendaraan ${validated.plateNumber || validated.vehicleId} berhasil dinonaktifkan / dihapus dari master akses gerbang.`
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
				code: "DELETE_VEHICLE_FAILED",
				message: err.message
			}
		}), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/properties/vehicles/delete@_@ts
var page = () => delete_exports;
//#endregion
export { page };
