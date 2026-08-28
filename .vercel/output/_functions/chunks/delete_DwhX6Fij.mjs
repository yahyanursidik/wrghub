import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { n as recordAuditLog } from "./audit.service_D4o7GGen.mjs";
import { z } from "zod";
//#region src/pages/api/billing/invoices/delete.ts
var delete_exports = /* @__PURE__ */ __exportAll({ POST: () => POST });
var deleteInvoiceSchema = z.object({
	invoiceId: z.string().min(1),
	invoiceNumber: z.string().optional(),
	propertyCode: z.string().optional(),
	reason: z.string().optional()
});
var POST = async ({ request }) => {
	try {
		const body = await request.json();
		const validated = deleteInvoiceSchema.parse(body);
		if (process.env.DATABASE_URL) await recordAuditLog({
			actorName: "Pengurus Komplek",
			action: "billing.delete_invoice",
			entityType: "INVOICE",
			entityId: validated.invoiceNumber || validated.invoiceId,
			newValue: {
				invoiceId: validated.invoiceId,
				house: validated.propertyCode,
				reason: validated.reason || "Dibatalkan / Dihapus dari sistem tagihan",
				deletedAt: (/* @__PURE__ */ new Date()).toISOString()
			}
		});
		return new Response(JSON.stringify({
			data: {
				success: true,
				id: validated.invoiceId,
				message: `Invoice ${validated.invoiceNumber || validated.invoiceId} berhasil dibatalkan / dihapus.`
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
				code: "DELETE_INVOICE_FAILED",
				message: err.message
			}
		}), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/billing/invoices/delete@_@ts
var page = () => delete_exports;
//#endregion
export { page };
