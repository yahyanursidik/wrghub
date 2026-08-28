import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { n as recordAuditLog } from "./audit.service_D4o7GGen.mjs";
import { z } from "zod";
//#region src/pages/api/billing/invoices/update.ts
var update_exports = /* @__PURE__ */ __exportAll({ POST: () => POST });
var updateInvoiceSchema = z.object({
	invoiceId: z.string().min(1),
	invoiceNumber: z.string().optional(),
	propertyCode: z.string().optional(),
	status: z.enum([
		"PAID",
		"UNPAID",
		"PENDING_VERIFICATION",
		"VOID"
	]).optional(),
	total: z.number().optional(),
	paidAmount: z.number().optional(),
	dueDate: z.string().optional(),
	paidAt: z.string().nullable().optional(),
	notes: z.string().optional()
});
var POST = async ({ request }) => {
	try {
		const body = await request.json();
		const validated = updateInvoiceSchema.parse(body);
		if (process.env.DATABASE_URL) await recordAuditLog({
			actorName: "Pengurus Komplek",
			action: "billing.update_invoice",
			entityType: "INVOICE",
			entityId: validated.invoiceNumber || validated.invoiceId,
			newValue: {
				invoiceId: validated.invoiceId,
				house: validated.propertyCode,
				status: validated.status,
				total: validated.total,
				updatedAt: (/* @__PURE__ */ new Date()).toISOString()
			}
		});
		return new Response(JSON.stringify({
			data: {
				success: true,
				...validated,
				updatedAt: (/* @__PURE__ */ new Date()).toISOString()
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
				code: "INVOICE_UPDATE_FAILED",
				message: err.message
			}
		}), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/billing/invoices/update@_@ts
var page = () => update_exports;
//#endregion
export { page };
