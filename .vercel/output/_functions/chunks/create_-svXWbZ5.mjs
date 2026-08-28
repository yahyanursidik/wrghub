import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { t as neonSql } from "./neon_DiYtP58s.mjs";
import { n as recordAuditLog } from "./audit.service_D4o7GGen.mjs";
import { z } from "zod";
//#region src/pages/api/properties/create.ts
var create_exports = /* @__PURE__ */ __exportAll({ POST: () => POST });
var propertySchema = z.object({
	code: z.string().min(2),
	number: z.string().min(1),
	blockId: z.string(),
	address: z.string(),
	occupancyStatus: z.enum([
		"OWNER_OCCUPIED",
		"RENTED",
		"VACANT",
		"RENOVATION"
	]),
	ownerName: z.string().optional(),
	ownerPhone: z.string().optional(),
	ownerNik: z.string().optional(),
	buildingType: z.string().optional(),
	landArea: z.number().optional(),
	buildingArea: z.number().optional(),
	plnCapacity: z.string().optional(),
	pamMeterNo: z.string().optional(),
	monthlyRate: z.number().optional(),
	handoverDate: z.string().optional(),
	notes: z.string().optional()
});
var POST = async ({ request }) => {
	try {
		const body = await request.json();
		const validated = propertySchema.parse(body);
		const id = `prop-${validated.code.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
		const blkClean = (validated.blockId || validated.code).toLowerCase();
		let validBlockId = "blk-a";
		if (blkClean.includes("b") || blkClean.includes("sariwangi-2")) validBlockId = "blk-b";
		else if (blkClean.includes("c") || blkClean.includes("kav")) validBlockId = "blk-c";
		else if (blkClean.includes("d")) validBlockId = "blk-d";
		else validBlockId = "blk-a";
		if (process.env.DATABASE_URL) {
			await neonSql`
        INSERT INTO properties (
          id, community_id, block_id, code, number, address, occupancy_status, is_active, notes
        ) VALUES (
          ${id}, 'comm-01', ${validBlockId}, ${validated.code}, ${validated.number},
          ${validated.address}, ${validated.occupancyStatus === "RENOVATION" ? "OWNER_OCCUPIED" : validated.occupancyStatus}, true, ${validated.notes || null}
        )
        ON CONFLICT (id) DO UPDATE SET
          occupancy_status = ${validated.occupancyStatus === "RENOVATION" ? "OWNER_OCCUPIED" : validated.occupancyStatus},
          notes = ${validated.notes || null},
          updated_at = NOW();
      `;
			if (validated.ownerName && validated.occupancyStatus !== "VACANT") {
				const pId = `person-${id}`;
				await neonSql`
          INSERT INTO persons (id, name, phone, email, is_active)
          VALUES (
            ${pId},
            ${validated.ownerName},
            ${validated.ownerPhone || "0812-0000-0000"},
            ${validated.code.toLowerCase() + "@wargahub.id"},
            true
          )
          ON CONFLICT (id) DO UPDATE SET
            name = ${validated.ownerName},
            phone = ${validated.ownerPhone || "0812-0000-0000"};
        `;
				await neonSql`
          INSERT INTO property_ownerships (id, property_id, person_id, is_active, started_at)
          VALUES (${"own-" + id}, ${id}, ${pId}, true, '2026-01-01')
          ON CONFLICT (id) DO NOTHING;
        `;
			}
			await recordAuditLog({
				actorName: "Pengurus Komplek",
				action: "property.create_or_update",
				entityType: "PROPERTY",
				entityId: id,
				newValue: {
					code: validated.code,
					owner: validated.ownerName,
					status: validated.occupancyStatus,
					pln: validated.plnCapacity,
					pam: validated.pamMeterNo,
					landArea: validated.landArea,
					buildingArea: validated.buildingArea
				}
			});
			return new Response(JSON.stringify({
				data: {
					id,
					code: validated.code,
					address: validated.address,
					ownerName: validated.ownerName,
					occupancyStatus: validated.occupancyStatus,
					message: `Data rumah ${validated.code} berhasil disimpan ke sistem.`
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
			code: validated.code,
			message: "Properti disimpan (mock)."
		} }), {
			status: 201,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({
			data: null,
			error: {
				code: "PROPERTY_UPSERT_FAILED",
				message: err.message
			}
		}), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/properties/create@_@ts
var page = () => create_exports;
//#endregion
export { page };
