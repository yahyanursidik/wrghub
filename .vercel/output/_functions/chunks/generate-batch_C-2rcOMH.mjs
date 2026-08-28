import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { t as neonSql } from "./neon_DiYtP58s.mjs";
import "./db_-Bx7JBvv.mjs";
import { n as recordAuditLog } from "./audit.service_D4o7GGen.mjs";
import { z } from "zod";
//#region src/pages/api/billing/generate-batch.ts
var generate_batch_exports = /* @__PURE__ */ __exportAll({ POST: () => POST });
var batchSchema = z.object({
	year: z.number().int().min(2025).max(2030),
	month: z.number().int().min(1).max(12),
	name: z.string(),
	dueDate: z.string(),
	feeAmount: z.number().positive().default(75e4),
	createdBy: z.string().default("user-ketua")
});
var POST = async ({ request }) => {
	try {
		const body = await request.json();
		const { year, month, name, dueDate, feeAmount, createdBy } = batchSchema.parse(body);
		const periodId = `period-${year}-${month.toString().padStart(2, "0")}`;
		const periodCode = `${year}${month.toString().padStart(2, "0")}`;
		if (process.env.DATABASE_URL) {
			await neonSql`
        INSERT INTO billing_periods (id, community_id, year, month, name, due_date, status)
        VALUES (${periodId}, 'comm-01', ${year}, ${month}, ${name}, ${dueDate}, 'OPEN')
        ON CONFLICT (id) DO UPDATE SET name = ${name}, due_date = ${dueDate};
      `;
			const properties = await neonSql`SELECT id, code FROM properties WHERE is_active = true ORDER BY code ASC`;
			for (const prop of properties) {
				const invId = `inv-${prop.code.toLowerCase()}-${periodCode}`;
				const invNumber = `INV-${periodCode}-${prop.code.replace("-", "")}`;
				await neonSql`
          INSERT INTO invoices (
            id, property_id, billing_period_id, invoice_number, status, subtotal, total, paid_amount, due_date, issued_at
          ) VALUES (
            ${invId}, ${prop.id}, ${periodId}, ${invNumber}, 'UNPAID', ${feeAmount}, ${feeAmount}, 0, ${dueDate}, ${(/* @__PURE__ */ new Date()).toISOString().substring(0, 10)}
          )
          ON CONFLICT (id) DO NOTHING;
        `;
				await neonSql`
          INSERT INTO invoice_items (id, invoice_id, fee_type_id, description, amount)
          VALUES (${"item-" + invId}, ${invId}, 'fee-ipl', ${"Iuran IPL " + name}, ${feeAmount})
          ON CONFLICT (id) DO NOTHING;
        `;
			}
			await recordAuditLog({
				actorUserId: createdBy,
				actorName: "Ketua / Pengurus Komplek",
				action: "billing.generate_batch",
				entityType: "BILLING_PERIOD",
				entityId: periodId,
				newValue: {
					periodName: name,
					totalInvoices: properties.length,
					feeAmount
				}
			});
			return new Response(JSON.stringify({
				data: {
					periodId,
					totalGenerated: properties.length,
					message: `Tagihan periode ${name} berhasil dibuat untuk ${properties.length} unit rumah.`
				},
				meta: {},
				error: null
			}), {
				status: 201,
				headers: { "Content-Type": "application/json" }
			});
		}
		return new Response(JSON.stringify({ data: { message: "Tagihan batch dibuat." } }), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({
			data: null,
			error: {
				code: "BATCH_GENERATION_FAILED",
				message: err.message || "Gagal generate tagihan masal."
			}
		}), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/billing/generate-batch@_@ts
var page = () => generate_batch_exports;
//#endregion
export { page };
