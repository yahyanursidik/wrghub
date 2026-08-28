import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { t as createAnnouncement } from "./announcement.service_BsCLrcAc.mjs";
import { z } from "zod";
//#region src/pages/api/announcements/create.ts
var create_exports = /* @__PURE__ */ __exportAll({ POST: () => POST });
var annSchema = z.object({
	title: z.string().min(3),
	content: z.string().min(5),
	category: z.string().default("INFO"),
	audience: z.string().default("ALL"),
	scheduledAt: z.string().optional(),
	location: z.string().optional(),
	isPinned: z.boolean().default(false),
	createdBy: z.string().default("user-ketua")
});
var POST = async ({ request }) => {
	try {
		const body = await request.json();
		const validated = annSchema.parse(body);
		const id = await createAnnouncement(validated);
		return new Response(JSON.stringify({
			data: {
				id,
				message: "Pengumuman berhasil dipublikasikan."
			},
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
				code: "ANNOUNCEMENT_FAILED",
				message: err.message
			}
		}), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/announcements/create@_@ts
var page = () => create_exports;
//#endregion
export { page };
