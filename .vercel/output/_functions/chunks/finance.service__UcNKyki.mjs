import { t as neonSql } from "./neon_DiYtP58s.mjs";
import { c as expenseCategories, f as ledgerEntries, l as expenses, n as accounts, t as db } from "./db_-Bx7JBvv.mjs";
import { n as recordAuditLog } from "./audit.service_D4o7GGen.mjs";
import { desc, eq } from "drizzle-orm";
//#region src/services/finance.service.ts
async function getAccounts() {
	if (process.env.DATABASE_URL) try {
		return (await neonSql`SELECT * FROM accounts WHERE is_active = true`).map((r) => ({
			...r,
			balance: Number(r.balance) || 0
		}));
	} catch (e) {
		console.warn("Neon accounts error:", e);
	}
	return await db.select().from(accounts).where(eq(accounts.isActive, true));
}
async function getMainAccountBalance() {
	if (process.env.DATABASE_URL) try {
		const rows = await neonSql`SELECT balance FROM accounts WHERE id = 'acc-main' LIMIT 1`;
		if (rows.length) return Number(rows[0].balance) || 12845e4;
	} catch (e) {
		console.warn("Neon balance error:", e);
	}
	return (await db.select().from(accounts).where(eq(accounts.id, "acc-main")).limit(1))[0]?.balance || 12845e4;
}
async function getLedgerEntries(limit = 30) {
	if (process.env.DATABASE_URL) try {
		return (await neonSql`SELECT * FROM ledger_entries ORDER BY entry_date DESC, created_at DESC LIMIT ${limit}`).map((r) => ({
			id: r.id,
			accountId: r.account_id,
			entryDate: r.entry_date,
			direction: r.direction,
			amount: Number(r.amount) || 0,
			sourceType: r.source_type,
			sourceId: r.source_id,
			description: r.description,
			createdBy: r.created_by,
			createdAt: r.created_at
		}));
	} catch (e) {
		console.warn("Neon ledger error:", e);
	}
	return await db.select().from(ledgerEntries).orderBy(desc(ledgerEntries.entryDate), desc(ledgerEntries.createdAt)).limit(limit);
}
async function getExpenses() {
	if (process.env.DATABASE_URL) try {
		return (await neonSql`
        SELECT 
          e.id, e.title, e.description, e.amount, e.expense_date,
          ec.name as category_name, ec.icon as category_icon, e.status
        FROM expenses e
        LEFT JOIN expense_categories ec ON e.category_id = ec.id
        ORDER BY e.expense_date DESC
      `).map((r) => ({
			id: r.id,
			title: r.title,
			description: r.description,
			amount: Number(r.amount) || 0,
			expenseDate: r.expense_date,
			categoryName: r.category_name,
			categoryIcon: r.category_icon,
			status: r.status
		}));
	} catch (e) {
		console.warn("Neon expenses error:", e);
	}
	return await db.select({
		id: expenses.id,
		title: expenses.title,
		description: expenses.description,
		amount: expenses.amount,
		expenseDate: expenses.expenseDate,
		categoryName: expenseCategories.name,
		categoryIcon: expenseCategories.icon,
		status: expenses.status
	}).from(expenses).leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id)).orderBy(desc(expenses.expenseDate));
}
async function recordExpense(data) {
	const expenseId = `exp-${Date.now()}`;
	const accountId = data.accountId || "acc-main";
	if (process.env.DATABASE_URL) try {
		await neonSql`
        INSERT INTO expenses (
          id, community_id, category_id, account_id, title, description, amount, expense_date, recorded_by, approved_by, status
        ) VALUES (
          ${expenseId}, 'comm-01', ${data.categoryId}, ${accountId}, ${data.title},
          ${data.description || null}, ${data.amount}, ${data.expenseDate},
          ${data.recordedBy || "user-bendahara"}, 'user-ketua', 'APPROVED'
        )
      `;
		await neonSql`
        INSERT INTO ledger_entries (
          id, account_id, entry_date, direction, amount, source_type, source_id, description, created_by
        ) VALUES (
          ${"ledg-" + expenseId}, ${accountId}, ${data.expenseDate}, 'OUT',
          ${data.amount}, 'EXPENSE', ${expenseId}, ${data.title}, ${data.recordedBy || "user-bendahara"}
        )
      `;
		await neonSql`UPDATE accounts SET balance = balance - ${data.amount} WHERE id = ${accountId}`;
		await recordAuditLog({
			actorUserId: data.recordedBy || "user-bendahara",
			actorName: "Bendahara",
			action: "expense.create",
			entityType: "EXPENSE",
			entityId: expenseId,
			newValue: {
				title: data.title,
				amount: data.amount
			}
		});
		return expenseId;
	} catch (e) {
		console.warn("Neon record expense error:", e);
	}
	await db.insert(expenses).values({
		id: expenseId,
		communityId: "comm-01",
		categoryId: data.categoryId,
		accountId,
		title: data.title,
		description: data.description || null,
		amount: data.amount,
		expenseDate: data.expenseDate,
		recordedBy: data.recordedBy || "user-bendahara",
		approvedBy: "user-ketua",
		status: "APPROVED"
	});
	return expenseId;
}
//#endregion
export { recordExpense as a, getMainAccountBalance as i, getExpenses as n, getLedgerEntries as r, getAccounts as t };
