import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { n as recordAuditLog } from "./audit.service_D4o7GGen.mjs";
import { z } from "zod";
//#region src/pages/api/whatsapp/templates/create.ts
var create_exports = /* @__PURE__ */ __exportAll({ POST: () => POST });
var templateSchema = z.object({
	title: z.string().min(2),
	category: z.enum([
		"KEUANGAN",
		"KEAMANAN",
		"LINGKUNGAN",
		"MUSYAWARAH",
		"SOSIAL",
		"LAINNYA"
	]).default("KEUANGAN"),
	description: z.string().optional(),
	templateText: z.string().min(5),
	tags: z.array(z.string()).optional(),
	targetType: z.enum([
		"WARGA_INDIVIDU",
		"GRUP_WARGA",
		"PENGURUS",
		"SATPAM"
	]).default("WARGA_INDIVIDU")
});
var POST = async ({ request }) => {
	try {
		const body = await request.json();
		const validated = templateSchema.parse(body);
		const newTemplate = {
			id: `WATPL-${Date.now()}`,
			title: validated.title,
			category: validated.category,
			description: validated.description || "",
			templateText: validated.templateText,
			tags: validated.tags || ["WhatsApp", validated.category],
			targetType: validated.targetType,
			isCustom: true,
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		if (process.env.DATABASE_URL) await recordAuditLog({
			actorName: "Pengurus Komplek",
			action: "whatsapp.create_template",
			entityType: "WHATSAPP_TEMPLATE",
			entityId: newTemplate.id,
			newValue: {
				title: validated.title,
				category: validated.category,
				targetType: validated.targetType
			}
		});
		return new Response(JSON.stringify({
			data: newTemplate,
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
				code: "TEMPLATE_CREATION_FAILED",
				message: err.message
			}
		}), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/whatsapp/templates/create@_@ts
var page = () => create_exports;
//#endregion
export { page };
