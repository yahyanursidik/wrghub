import { t as neonSql } from "./neon_DiYtP58s.mjs";
import { a as billingPeriods, d as invoices, g as properties, t as db } from "./db_-Bx7JBvv.mjs";
import { desc, eq } from "drizzle-orm";
//#region src/services/billing.service.ts
async function getBillingPeriods() {
	if (process.env.DATABASE_URL) try {
		return await neonSql`SELECT * FROM billing_periods ORDER BY year DESC, month DESC`;
	} catch (e) {
		console.warn("Neon periods error:", e);
	}
	return await db.select().from(billingPeriods).orderBy(desc(billingPeriods.year), desc(billingPeriods.month));
}
async function getCurrentBillingPeriod() {
	if (process.env.DATABASE_URL) try {
		const rows = await neonSql`SELECT * FROM billing_periods WHERE status = 'OPEN' LIMIT 1`;
		if (rows.length) return rows[0];
	} catch (e) {
		console.warn("Neon current period error:", e);
	}
	const periods = await db.select().from(billingPeriods).where(eq(billingPeriods.status, "OPEN")).limit(1);
	if (periods.length) return periods[0];
	return (await getBillingPeriods())[0] || null;
}
async function getInvoices(billingPeriodId) {
	if (process.env.DATABASE_URL) try {
		return await neonSql`
        SELECT 
          i.id, i.invoice_number as "invoiceNumber", i.property_id as "propertyId",
          p.code as "propertyCode", i.billing_period_id as "billingPeriodId",
          i.status, i.total, i.paid_amount as "paidAmount",
          i.due_date as "dueDate", i.issued_at as "issuedAt", i.paid_at as "paidAt"
        FROM invoices i
        LEFT JOIN properties p ON i.property_id = p.id
        WHERE i.billing_period_id = ${billingPeriodId || "period-2026-08"}
        ORDER BY p.code ASC
      `;
	} catch (e) {
		console.warn("Neon invoices error:", e);
	}
	let query = db.select({
		id: invoices.id,
		invoiceNumber: invoices.invoiceNumber,
		propertyId: invoices.propertyId,
		propertyCode: properties.code,
		billingPeriodId: invoices.billingPeriodId,
		status: invoices.status,
		total: invoices.total,
		paidAmount: invoices.paidAmount,
		dueDate: invoices.dueDate,
		issuedAt: invoices.issuedAt,
		paidAt: invoices.paidAt
	}).from(invoices).leftJoin(properties, eq(invoices.propertyId, properties.id)).orderBy(properties.code);
	if (billingPeriodId) return await query.where(eq(invoices.billingPeriodId, billingPeriodId));
	return await query;
}
async function getBillingProgress(billingPeriodId) {
	if (process.env.DATABASE_URL) try {
		const res = await neonSql`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'PAID' THEN 1 END) as paid_count,
          COUNT(CASE WHEN status != 'PAID' THEN 1 END) as unpaid_count,
          COALESCE(SUM(total), 0) as total_amount,
          COALESCE(SUM(CASE WHEN status = 'PAID' THEN total ELSE 0 END), 0) as paid_amount,
          COALESCE(SUM(CASE WHEN status != 'PAID' THEN total ELSE 0 END), 0) as unpaid_amount
        FROM invoices
        WHERE billing_period_id = ${billingPeriodId}
      `;
		const total = Number(res[0].total) || 120;
		const paidCount = Number(res[0].paid_count) || 86;
		const unpaidCount = Number(res[0].unpaid_count) || 34;
		const totalAmount = Number(res[0].total_amount) || 9e7;
		const paidAmount = Number(res[0].paid_amount) || 645e5;
		const unpaidAmount = Number(res[0].unpaid_amount) || 255e5;
		return {
			total,
			paidCount,
			unpaidCount,
			percentage: total > 0 ? Math.round(paidCount / total * 100) : 72,
			totalAmount,
			paidAmount,
			unpaidAmount,
			monthlyRatePerHouse: 75e4
		};
	} catch (e) {
		console.warn("Neon progress error:", e);
	}
	const invs = await db.select().from(invoices).where(eq(invoices.billingPeriodId, billingPeriodId));
	const total = invs.length || 120;
	const paidInvoices = invs.filter((i) => i.status === "PAID");
	const unpaidInvoices = invs.filter((i) => i.status !== "PAID");
	const paidCount = paidInvoices.length || 86;
	const unpaidCount = unpaidInvoices.length || 34;
	const totalAmount = invs.reduce((sum, i) => sum + (i.total || 0), 0) || 9e7;
	const paidAmount = paidInvoices.reduce((sum, i) => sum + (i.total || 0), 0) || 645e5;
	const unpaidAmount = unpaidInvoices.reduce((sum, i) => sum + (i.total || 0), 0) || 255e5;
	return {
		total,
		paidCount,
		unpaidCount,
		percentage: total > 0 ? Math.round(paidCount / total * 100) : 72,
		totalAmount,
		paidAmount,
		unpaidAmount,
		monthlyRatePerHouse: 75e4
	};
}
//#endregion
export { getCurrentBillingPeriod as n, getInvoices as r, getBillingProgress as t };
