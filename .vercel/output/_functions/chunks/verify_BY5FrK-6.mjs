import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { a as verifyPayment } from "./payment.service_BDCZwn7c.mjs";
import { z } from "zod";
//#region src/pages/api/payments/verify.ts
var verify_exports = /* @__PURE__ */ __exportAll({ POST: () => POST });
var verifySchema = z.object({
	paymentId: z.string(),
	verifierUserId: z.string().optional(),
	verifierName: z.string().optional()
});
var POST = async ({ request }) => {
	try {
		const body = await request.json();
		const validated = verifySchema.parse(body);
		await verifyPayment(validated.paymentId, validated.verifierUserId, validated.verifierName);
		return new Response(JSON.stringify({
			data: { message: "Pembayaran berhasil diverifikasi, tagihan dilunasi, dan kas diperbarui." },
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
				code: "VERIFICATION_FAILED",
				message: err.message
			}
		}), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/payments/verify@_@ts
var page = () => verify_exports;
//#endregion
export { page };
