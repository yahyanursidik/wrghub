import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { t as neonSql } from "./neon_DiYtP58s.mjs";
import "./db_-Bx7JBvv.mjs";
import { n as recordAuditLog } from "./audit.service_D4o7GGen.mjs";
import { z } from "zod";
//#region src/pages/api/vehicles/create.ts
var create_exports = /* @__PURE__ */ __exportAll({ POST: () => POST });
var vehicleSchema = z.object({
	propertyId: z.string(),
	plateNumber: z.string().min(3),
	type: z.string().default("Mobil"),
	brand: z.string().min(2),
	model: z.string().min(2),
	color: z.string().default("Hitam"),
	year: z.string().optional(),
	ownerPersonId: z.string().optional()
});
var POST = async ({ request }) => {
	try {
		const body = await request.json();
		const validated = vehicleSchema.parse(body);
		const id = `veh-${Date.now()}`;
		if (process.env.DATABASE_URL) {
			await neonSql`
        INSERT INTO vehicles (
          id, property_id, owner_person_id, plate_number, type, brand, model, color, year, is_active
        ) VALUES (
          ${id}, ${validated.propertyId}, ${validated.ownerPersonId || "person-budi"},
          ${validated.plateNumber.toUpperCase()}, ${validated.type}, ${validated.brand},
          ${validated.model}, ${validated.color}, ${validated.year || "2022"}, true
        );
      `;
			await recordAuditLog({
				actorName: "Warga / Penghuni",
				action: "vehicle.register",
				entityType: "VEHICLE",
				entityId: id,
				newValue: {
					plateNumber: validated.plateNumber,
					brand: validated.brand,
					model: validated.model
				}
			});
			return new Response(JSON.stringify({
				data: {
					id,
					message: "Kendaraan baru berhasil didaftarkan ke sistem komplek."
				},
				meta: {},
				error: null
			}), {
				status: 201,
				headers: { "Content-Type": "application/json" }
			});
		}
		return new Response(JSON.stringify({ data: {
			id,
			message: "Kendaraan terdaftar."
		} }), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({
			data: null,
			error: {
				code: "VEHICLE_REGISTRATION_FAILED",
				message: err.message
			}
		}), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/vehicles/create@_@ts
var page = () => create_exports;
//#endregion
export { page };
