import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { a as recordExpense } from "./finance.service__UcNKyki.mjs";
import { z } from "zod";
//#region src/pages/api/expenses/create.ts
var create_exports = /* @__PURE__ */ __exportAll({ POST: () => POST });
var expenseSchema = z.object({
	categoryId: z.string().default("cat-pemeliharaan"),
	accountId: z.string().default("acc-main"),
	title: z.string().min(3),
	description: z.string().optional(),
	amount: z.number().positive(),
	expenseDate: z.string().default(() => (/* @__PURE__ */ new Date()).toISOString().substring(0, 10)),
	recordedBy: z.string().default("user-bendahara")
});
var POST = async ({ request }) => {
	try {
		const body = await request.json();
		const validated = expenseSchema.parse(body);
		const id = await recordExpense(validated);
		return new Response(JSON.stringify({
			data: {
				id,
				message: "Pengeluaran berhasil dicatat dan arus kas diperbarui."
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
				code: "EXPENSE_CREATION_FAILED",
				message: err.message
			}
		}), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/expenses/create@_@ts
var page = () => create_exports;
//#endregion
export { page };
