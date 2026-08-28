import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { n as recordAuditLog } from "./audit.service_D4o7GGen.mjs";
import { z } from "zod";
//#region src/pages/api/properties/vehicles/create.ts
var create_exports = /* @__PURE__ */ __exportAll({ POST: () => POST });
var vehicleSchema = z.object({
	propertyId: z.string().default("prop-a-17"),
	houseCode: z.string().optional(),
	ownerName: z.string().optional(),
	plateNumber: z.string().min(3),
	type: z.string().default("Mobil"),
	brand: z.string().min(1),
	model: z.string().min(1),
	color: z.string().default("Hitam"),
	year: z.number().optional(),
	rfidTag: z.string().optional(),
	gateAccess: z.string().default("SEMUA_GERBANG"),
	rfidStatus: z.enum([
		"AKTIF",
		"DIBLOKIR",
		"PENDING_VERIFIKASI"
	]).default("AKTIF"),
	notes: z.string().optional()
});
var POST = async ({ request }) => {
	try {
		const body = await request.json();
		const validated = vehicleSchema.parse(body);
		const newVehicle = {
			id: `veh-${Date.now()}`,
			propertyId: validated.propertyId,
			houseCode: validated.houseCode || validated.propertyId.replace("prop-", "").toUpperCase(),
			ownerName: validated.ownerName || "Warga Terdaftar",
			plateNumber: validated.plateNumber.toUpperCase(),
			type: validated.type,
			brand: validated.brand,
			model: validated.model,
			color: validated.color,
			year: validated.year || (/* @__PURE__ */ new Date()).getFullYear(),
			rfidTag: validated.rfidTag || `RFID-${Math.floor(1e6 + Math.random() * 9e6)}`,
			gateAccess: validated.gateAccess,
			rfidStatus: validated.rfidStatus,
			notes: validated.notes || null,
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		if (process.env.DATABASE_URL) await recordAuditLog({
			actorName: "Pengurus Komplek",
			action: "property.register_vehicle",
			entityType: "PROPERTY_VEHICLE",
			entityId: newVehicle.id,
			newValue: {
				plate: newVehicle.plateNumber,
				house: newVehicle.houseCode,
				type: newVehicle.type,
				rfid: newVehicle.rfidTag,
				status: newVehicle.rfidStatus
			}
		});
		return new Response(JSON.stringify({
			data: newVehicle,
			meta: {},
			error: null
		}), {
			status: 201,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({
			data: null,
			error: {
				code: "CREATE_VEHICLE_FAILED",
				message: err.message
			}
		}), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/properties/vehicles/create@_@ts
var page = () => create_exports;
//#endregion
export { page };
