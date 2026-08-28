import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { t as neonSql } from "./neon_DiYtP58s.mjs";
import { n as recordAuditLog } from "./audit.service_D4o7GGen.mjs";
import { z } from "zod";
//#region src/pages/api/settings/update.ts
var update_exports = /* @__PURE__ */ __exportAll({ POST: () => POST });
var settingsSchema = z.object({
	communityName: z.string().min(3),
	rtRw: z.string(),
	address: z.string(),
	monthlyRate: z.number().positive(),
	bankName: z.string(),
	bankAccount: z.string(),
	accountHolder: z.string(),
	securityPhone: z.string(),
	rwHeadPhone: z.string()
});
var POST = async ({ request }) => {
	try {
		const body = await request.json();
		const validated = settingsSchema.parse(body);
		if (process.env.DATABASE_URL) {
			await neonSql`
        UPDATE communities
        SET name = ${validated.communityName},
            address = ${validated.address}
        WHERE id = 'comm-01';
      `;
			await neonSql`
        INSERT INTO settings (id, community_id, key, value, description, updated_at)
        VALUES ('set-profile', 'comm-01', 'community_profile', ${JSON.stringify(validated)}, 'Pengaturan utama profil komplek', NOW())
        ON CONFLICT (id) DO UPDATE SET value = ${JSON.stringify(validated)}, updated_at = NOW();
      `;
			await recordAuditLog({
				actorName: "Ketua Komplek",
				action: "settings.update",
				entityType: "COMMUNITY_SETTINGS",
				entityId: "comm-01",
				newValue: validated
			});
			return new Response(JSON.stringify({
				data: {
					success: true,
					message: "Pengaturan profil komplek berhasil diperbarui dan disimpan ke database."
				},
				meta: {},
				error: null
			}), {
				status: 200,
				headers: { "Content-Type": "application/json" }
			});
		}
		return new Response(JSON.stringify({ data: { message: "Pengaturan disimpan." } }), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({
			data: null,
			error: {
				code: "SETTINGS_UPDATE_FAILED",
				message: err.message
			}
		}), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/settings/update@_@ts
var page = () => update_exports;
//#endregion
export { page };
