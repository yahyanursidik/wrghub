import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { r as updateComplaintStatus } from "./complaint.service_CHdQ-3sY.mjs";
import { z } from "zod";
//#region src/pages/api/complaints/update.ts
var update_exports = /* @__PURE__ */ __exportAll({ POST: () => POST });
var updateSchema = z.object({
	complaintId: z.string(),
	status: z.enum([
		"REPORTED",
		"ACKNOWLEDGED",
		"IN_PROGRESS",
		"RESOLVED",
		"CLOSED"
	]),
	notes: z.string().optional(),
	userId: z.string().default("user-ketua")
});
var POST = async ({ request }) => {
	try {
		const body = await request.json();
		const validated = updateSchema.parse(body);
		await updateComplaintStatus(validated.complaintId, validated.status, validated.notes, validated.userId);
		return new Response(JSON.stringify({
			data: { message: "Status aduan berhasil diperbarui." },
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
				code: "UPDATE_FAILED",
				message: err.message
			}
		}), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/complaints/update@_@ts
var page = () => update_exports;
//#endregion
export { page };
