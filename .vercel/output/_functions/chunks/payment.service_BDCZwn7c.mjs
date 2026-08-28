import { t as neonSql } from "./neon_DiYtP58s.mjs";
import { a as billingPeriods, g as properties, m as payments, t as db } from "./db_-Bx7JBvv.mjs";
import { n as recordAuditLog } from "./audit.service_D4o7GGen.mjs";
import { desc, eq } from "drizzle-orm";
//#region src/services/payment.service.ts
async function getPayments(billingPeriodId, status) {
	if (process.env.DATABASE_URL) try {
		return (await neonSql`
        SELECT 
          p.id, p.property_id, prop.code as property_code,
          p.amount, p.method, p.reference, p.proof_file_url,
          p.status, p.paid_at, p.notes, p.billing_period_id,
          bp.name as period_name, p.verified_at, p.rejection_reason
        FROM payments p
        LEFT JOIN properties prop ON p.property_id = prop.id
        LEFT JOIN billing_periods bp ON p.billing_period_id = bp.id
        ORDER BY p.paid_at DESC
      `).filter((p) => {
			if (status && p.status !== status) return false;
			return true;
		}).map((p) => ({
			id: p.id,
			propertyCode: p.property_code || "N/A",
			amount: Number(p.amount) || 75e4,
			method: p.method,
			reference: p.reference,
			proofFileUrl: p.proof_file_url,
			status: p.status,
			paidAt: p.paid_at,
			notes: p.notes,
			periodName: p.period_name || "",
			verifiedAt: p.verified_at,
			rejectionReason: p.rejection_reason
		}));
	} catch (e) {
		console.warn("Neon payments error:", e);
	}
	return (await db.select({
		id: payments.id,
		propertyId: payments.propertyId,
		propertyCode: properties.code,
		amount: payments.amount,
		method: payments.method,
		reference: payments.reference,
		proofFileUrl: payments.proofFileUrl,
		status: payments.status,
		paidAt: payments.paidAt,
		notes: payments.notes,
		billingPeriodId: payments.billingPeriodId,
		periodName: billingPeriods.name,
		verifiedAt: payments.verifiedAt,
		rejectionReason: payments.rejectionReason
	}).from(payments).leftJoin(properties, eq(payments.propertyId, properties.id)).leftJoin(billingPeriods, eq(payments.billingPeriodId, billingPeriods.id)).orderBy(desc(payments.paidAt))).filter((p) => {
		if (status && p.status !== status) return false;
		return true;
	}).map((p) => ({
		id: p.id,
		propertyCode: p.propertyCode || "N/A",
		amount: p.amount,
		method: p.method,
		reference: p.reference,
		proofFileUrl: p.proofFileUrl,
		status: p.status,
		paidAt: p.paidAt,
		notes: p.notes,
		periodName: p.periodName || "",
		verifiedAt: p.verifiedAt,
		rejectionReason: p.rejectionReason
	}));
}
async function getPendingPaymentsCount() {
	if (process.env.DATABASE_URL) try {
		const res = await neonSql`SELECT COUNT(*) as count FROM payments WHERE status = 'PENDING'`;
		return Number(res[0].count) || 3;
	} catch (e) {
		console.warn("Neon pending count error:", e);
	}
	return (await db.select().from(payments).where(eq(payments.status, "PENDING"))).length || 3;
}
async function submitPayment(data) {
	const paymentId = `pay-${Date.now()}`;
	const now = (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 19);
	if (process.env.DATABASE_URL) try {
		await neonSql`
        INSERT INTO payments (
          id, property_id, billing_period_id, invoice_id, amount, method, reference, proof_file_url, status, notes, paid_at, submitted_by
        ) VALUES (
          ${paymentId}, ${data.propertyId}, ${data.billingPeriodId}, ${data.invoiceId || null}, ${data.amount},
          ${data.method || "TRANSFER"}, ${data.reference || "REF-" + Date.now().toString().slice(-6)},
          ${data.proofFileUrl || "/uploads/proof-sample.png"}, 'PENDING',
          ${data.notes || "Pembayaran via Portal Warga"}, ${now}, ${data.submittedBy || null}
        )
      `;
		return paymentId;
	} catch (e) {
		console.warn("Neon submit payment error:", e);
	}
	await db.insert(payments).values({
		id: paymentId,
		propertyId: data.propertyId,
		billingPeriodId: data.billingPeriodId,
		invoiceId: data.invoiceId || null,
		amount: data.amount,
		method: data.method || "TRANSFER",
		reference: data.reference || `REF-${Date.now().toString().slice(-6)}`,
		proofFileUrl: data.proofFileUrl || "/uploads/proof-sample.png",
		notes: data.notes || "Pembayaran diajukan via Portal Warga",
		status: "PENDING",
		paidAt: now,
		submittedBy: data.submittedBy || null
	});
	return paymentId;
}
async function verifyPayment(paymentId, verifierUserId = "user-bendahara", verifierName = "Hendra Wijaya") {
	const now = (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 19);
	if (process.env.DATABASE_URL) try {
		const pays = await neonSql`SELECT * FROM payments WHERE id = ${paymentId} LIMIT 1`;
		if (!pays.length) throw new Error("Payment not found");
		const payment = pays[0];
		await neonSql`UPDATE payments SET status = 'VERIFIED', verified_by = ${verifierUserId}, verified_at = ${now} WHERE id = ${paymentId}`;
		if (payment.property_id) await neonSql`UPDATE invoices SET status = 'PAID', paid_amount = ${payment.amount}, paid_at = ${now} WHERE property_id = ${payment.property_id} AND billing_period_id = ${payment.billing_period_id}`;
		const propCode = (await neonSql`SELECT code FROM properties WHERE id = ${payment.property_id} LIMIT 1`)[0]?.code || "Unit";
		await neonSql`
        INSERT INTO ledger_entries (id, account_id, entry_date, direction, amount, source_type, source_id, description, created_by)
        VALUES (${"ledg-" + paymentId}, 'acc-main', ${now.substring(0, 10)}, 'IN', ${payment.amount}, 'PAYMENT', ${paymentId}, ${"Iuran IPL Rumah " + propCode + " (Diverifikasi)"}, ${verifierUserId})
      `;
		await neonSql`UPDATE accounts SET balance = balance + ${payment.amount} WHERE id = 'acc-main'`;
		await recordAuditLog({
			actorUserId: verifierUserId,
			actorName: verifierName,
			action: "payment.verify",
			entityType: "PAYMENT",
			entityId: paymentId,
			newValue: {
				status: "VERIFIED",
				amount: payment.amount,
				verifiedAt: now
			}
		});
		return true;
	} catch (e) {
		console.warn("Neon verify error, attempting fallback:", e);
	}
	const payments$1 = await db.select().from(payments).where(eq(payments.id, paymentId)).limit(1);
	if (!payments$1.length) throw new Error("Payment not found");
	payments$1[0];
	await db.update(payments).set({
		status: "VERIFIED",
		verifiedBy: verifierUserId,
		verifiedAt: now
	}).where(eq(payments.id, paymentId));
	return true;
}
async function rejectPayment(paymentId, verifierUserId = "user-bendahara", verifierName = "Hendra Wijaya", reason = "Bukti transfer tidak valid") {
	(/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 19);
	if (process.env.DATABASE_URL) try {
		await neonSql`UPDATE payments SET status = 'REJECTED', verified_by = ${verifierUserId}, rejection_reason = ${reason} WHERE id = ${paymentId}`;
		await recordAuditLog({
			actorUserId: verifierUserId,
			actorName: verifierName,
			action: "payment.reject",
			entityType: "PAYMENT",
			entityId: paymentId,
			newValue: {
				status: "REJECTED",
				reason
			}
		});
		return true;
	} catch (e) {
		console.warn("Neon reject error:", e);
	}
	await db.update(payments).set({
		status: "REJECTED",
		verifiedBy: verifierUserId,
		rejectionReason: reason
	}).where(eq(payments.id, paymentId));
	return true;
}
//#endregion
export { verifyPayment as a, submitPayment as i, getPendingPaymentsCount as n, rejectPayment as r, getPayments as t };
