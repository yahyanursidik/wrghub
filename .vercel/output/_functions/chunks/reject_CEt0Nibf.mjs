import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { r as rejectPayment } from "./payment.service_BDCZwn7c.mjs";
import { z } from "zod";
//#region src/pages/api/payments/reject.ts
var reject_exports = /* @__PURE__ */ __exportAll({ POST: () => POST });
var rejectSchema = z.object({
	paymentId: z.string(),
	reason: z.string().default("Bukti transfer tidak valid atau tidak terbaca"),
	verifierUserId: z.string().optional(),
	verifierName: z.string().optional()
});
var POST = async ({ request }) => {
	try {
		const body = await request.json();
		const validated = rejectSchema.parse(body);
		await rejectPayment(validated.paymentId, validated.verifierUserId, validated.verifierName, validated.reason);
		return new Response(JSON.stringify({
			data: { message: "Pembayaran ditolak dan audit log dicatat." },
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
				code: "REJECT_FAILED",
				message: err.message
			}
		}), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/payments/reject@_@ts
var page = () => reject_exports;
//#endregion
export { page };
