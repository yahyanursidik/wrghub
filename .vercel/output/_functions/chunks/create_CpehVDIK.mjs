import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import "./neon_DiYtP58s.mjs";
import { n as recordAuditLog } from "./audit.service_D4o7GGen.mjs";
import { z } from "zod";
//#region src/pages/api/properties/occupants/create.ts
var create_exports = /* @__PURE__ */ __exportAll({ POST: () => POST });
var occupantSchema = z.object({
	propertyId: z.string().default("prop-a-17"),
	houseCode: z.string().optional(),
	fullName: z.string().min(1),
	relation: z.string(),
	idCardNumber: z.string().optional(),
	familyCardNumber: z.string().optional(),
	gender: z.string().optional(),
	birthPlaceDate: z.string().optional(),
	religion: z.string().optional(),
	occupation: z.string().optional(),
	phone: z.string().optional(),
	email: z.string().optional(),
	domicileStatus: z.string().optional(),
	bloodType: z.string().optional(),
	isEmergencyContact: z.boolean().default(false),
	notes: z.string().optional()
});
var POST = async ({ request }) => {
	try {
		const body = await request.json();
		const validated = occupantSchema.parse(body);
		const newOccupant = {
			id: `occ-${Date.now()}`,
			propertyId: validated.propertyId,
			houseCode: validated.houseCode || validated.propertyId.replace("prop-", "").toUpperCase(),
			fullName: validated.fullName,
			relation: validated.relation,
			idCardNumber: validated.idCardNumber || "3171xxxxxxxx0001",
			familyCardNumber: validated.familyCardNumber || "3171xxxxxxxx0002",
			gender: validated.gender || "LAKI_LAKI",
			birthPlaceDate: validated.birthPlaceDate || "Jakarta, 12-03-1985",
			religion: validated.religion || "ISLAM",
			occupation: validated.occupation || "Karyawan Swasta",
			phone: validated.phone || "0812-xxxx-xxxx",
			email: validated.email || `${validated.fullName.toLowerCase().replace(/[^a-z]/g, "")}@wargahub.id`,
			domicileStatus: validated.domicileStatus || "KTP_SETEMPAT",
			bloodType: validated.bloodType || "O",
			isEmergencyContact: validated.isEmergencyContact,
			status: "VERIFIED",
			notes: validated.notes || null,
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		if (process.env.DATABASE_URL) await recordAuditLog({
			actorName: "Pengurus Komplek",
			action: "property.add_occupant",
			entityType: "PROPERTY_OCCUPANT",
			entityId: newOccupant.id,
			newValue: {
				name: validated.fullName,
				relation: validated.relation,
				house: newOccupant.houseCode,
				nik: validated.idCardNumber,
				phone: validated.phone
			}
		});
		return new Response(JSON.stringify({
			data: newOccupant,
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
				code: "CREATE_OCCUPANT_FAILED",
				message: err.message
			}
		}), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/properties/occupants/create@_@ts
var page = () => create_exports;
//#endregion
export { page };
