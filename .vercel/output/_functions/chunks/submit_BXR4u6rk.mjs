import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { i as submitPayment } from "./payment.service_BDCZwn7c.mjs";
import { z } from "zod";
//#region src/pages/api/payments/submit.ts
var submit_exports = /* @__PURE__ */ __exportAll({ POST: () => POST });
var submitSchema = z.object({
	propertyId: z.string(),
	billingPeriodId: z.string(),
	amount: z.number().positive(),
	method: z.string().default("TRANSFER"),
	reference: z.string().optional(),
	proofFileUrl: z.string().optional(),
	notes: z.string().optional()
});
var POST = async ({ request }) => {
	try {
		const body = await request.json();
		const validated = submitSchema.parse(body);
		const paymentId = await submitPayment(validated);
		return new Response(JSON.stringify({
			data: {
				id: paymentId,
				message: "Pembayaran berhasil diajukan dan menunggu verifikasi."
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
				code: "INVALID_PAYMENT_PAYLOAD",
				message: err.message || "Data pembayaran tidak valid."
			}
		}), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/payments/submit@_@ts
var page = () => submit_exports;
//#endregion
export { page };
