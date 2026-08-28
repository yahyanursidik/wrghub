import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { n as recordAuditLog } from "./audit.service_D4o7GGen.mjs";
import { z } from "zod";
//#region src/pages/api/whatsapp/templates/delete.ts
var delete_exports = /* @__PURE__ */ __exportAll({ POST: () => POST });
var deleteTemplateSchema = z.object({
	templateId: z.string().min(1),
	title: z.string().optional(),
	reason: z.string().optional()
});
var POST = async ({ request }) => {
	try {
		const body = await request.json();
		const validated = deleteTemplateSchema.parse(body);
		if (process.env.DATABASE_URL) await recordAuditLog({
			actorName: "Pengurus Komplek",
			action: "whatsapp.delete_template",
			entityType: "WHATSAPP_TEMPLATE",
			entityId: validated.templateId,
			newValue: {
				templateId: validated.templateId,
				title: validated.title,
				reason: validated.reason || "Dihapus dari template wa.me",
				deletedAt: (/* @__PURE__ */ new Date()).toISOString()
			}
		});
		return new Response(JSON.stringify({
			data: {
				success: true,
				id: validated.templateId,
				message: `Template WhatsApp ${validated.templateId} berhasil dihapus.`
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
				code: "DELETE_TEMPLATE_FAILED",
				message: err.message
			}
		}), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/whatsapp/templates/delete@_@ts
var page = () => delete_exports;
//#endregion
export { page };
