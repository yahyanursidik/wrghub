import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { n as recordAuditLog } from "./audit.service_D4o7GGen.mjs";
import { z } from "zod";
//#region src/pages/api/properties/update.ts
var update_exports = /* @__PURE__ */ __exportAll({ POST: () => POST });
var propUpdateSchema = z.object({
	propertyCode: z.string().default("A-17"),
	buildingType: z.string().optional(),
	landArea: z.number().optional(),
	buildingArea: z.number().optional(),
	plnCapacity: z.string().optional(),
	pamMeterNo: z.string().optional(),
	occupancyStatus: z.string().optional()
});
var POST = async ({ request }) => {
	try {
		const body = await request.json();
		const validated = propUpdateSchema.parse(body);
		const updated = {
			propertyCode: validated.propertyCode,
			buildingType: validated.buildingType || "Tipe 72/120",
			landArea: validated.landArea || 120,
			buildingArea: validated.buildingArea || 72,
			plnCapacity: validated.plnCapacity || "3.500 VA",
			pamMeterNo: validated.pamMeterNo || "PAM-88301",
			occupancyStatus: validated.occupancyStatus || "DIHUNI_PEMILIK",
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		if (process.env.DATABASE_URL) await recordAuditLog({
			actorName: `Warga Rumah ${validated.propertyCode}`,
			action: "property.update_specs",
			entityType: "PROPERTY_SPECS",
			entityId: `prop-${validated.propertyCode}`,
			newValue: updated
		});
		return new Response(JSON.stringify({
			data: updated,
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
				code: "PROPERTY_UPDATE_FAILED",
				message: err.message
			}
		}), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/properties/update@_@ts
var page = () => update_exports;
//#endregion
export { page };
