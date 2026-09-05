import postgres from 'postgres';
import { createClient } from '@libsql/client';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_O4jVKCzUWex8@ep-damp-queen-azh98l8v-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
const sql = postgres(connectionString);
const sqliteClient = createClient({ url: 'file:data/wargahub.db' });

async function syncSqlite() {
  console.log('=== SYNCING 2026 FINANCIALS TO SQLITE (data/wargahub.db) ===');

  try {
    await sqliteClient.execute('PRAGMA foreign_keys = OFF');
    // 1. Billing Periods
    const periods = await sql`SELECT * FROM billing_periods WHERE year = 2026 ORDER BY month`;
    for (const p of periods) {
      await sqliteClient.execute({
        sql: `INSERT OR REPLACE INTO billing_periods (id, community_id, year, month, name, due_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [p.id, p.community_id, p.year, p.month, p.name, p.due_date, p.status]
      });
    }
    console.log(`Synced ${periods.length} billing periods to SQLite.`);

    // 2. Invoices
    const invoices = await sql`SELECT * FROM invoices WHERE billing_period_id LIKE 'period-2026-%'`;
    for (const inv of invoices) {
      await sqliteClient.execute({
        sql: `INSERT OR REPLACE INTO invoices (id, property_id, billing_period_id, invoice_number, status, subtotal, total, paid_amount, due_date, issued_at, paid_at, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [inv.id, inv.property_id, inv.billing_period_id, inv.invoice_number, inv.status, inv.subtotal, inv.total, inv.paid_amount, inv.due_date, inv.issued_at, inv.paid_at, inv.notes]
      });
    }
    console.log(`Synced ${invoices.length} invoices to SQLite.`);

    // 3. Payments
    const payments = await sql`SELECT * FROM payments WHERE billing_period_id LIKE 'period-2026-%'`;
    for (const pay of payments) {
      await sqliteClient.execute({
        sql: `INSERT OR REPLACE INTO payments (id, property_id, billing_period_id, invoice_id, amount, method, reference, proof_file_url, status, notes, paid_at, verified_by, verified_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [pay.id, pay.property_id, pay.billing_period_id, pay.invoice_id, pay.amount, pay.method, pay.reference, pay.proof_file_url, pay.status, pay.notes, pay.paid_at, pay.verified_by, pay.verified_at]
      });
    }
    console.log(`Synced ${payments.length} payments to SQLite.`);

    // 4. Ledger Entries
    const ledgers = await sql`SELECT * FROM ledger_entries WHERE entry_date LIKE '2026-%'`;
    for (const l of ledgers) {
      await sqliteClient.execute({
        sql: `INSERT OR REPLACE INTO ledger_entries (id, account_id, entry_date, direction, amount, source_type, source_id, description, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [l.id, l.account_id, l.entry_date, l.direction, l.amount, l.source_type, l.source_id, l.description, 'user-admin']
      });
    }
    console.log(`Synced ${ledgers.length} ledger entries to SQLite.`);

    // 5. Expense Categories
    const neonCats = await sql`SELECT * FROM expense_categories`;
    for (const c of neonCats) {
      await sqliteClient.execute({
        sql: `INSERT OR REPLACE INTO expense_categories (id, community_id, name, code, budget_percentage, icon) VALUES (?, ?, ?, ?, ?, ?)`,
        args: [c.id, c.community_id || 'comm-01', c.name, c.code, c.budget_percentage, c.icon]
      });
    }
    console.log(`Synced ${neonCats.length} expense categories to SQLite.`);

    // 6. Expenses
    const neonExpenses = await sql`SELECT * FROM expenses`;
    for (const exp of neonExpenses) {
      await sqliteClient.execute({
        sql: `INSERT OR REPLACE INTO expenses (id, community_id, category_id, account_id, title, description, amount, expense_date, recorded_by, approved_by, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [exp.id, exp.community_id, exp.category_id, exp.account_id, exp.title, exp.description, exp.amount, exp.expense_date, 'user-admin', 'user-admin', exp.status]
      });
    }
    console.log(`Synced ${neonExpenses.length} expenses to SQLite.`);

    // 7. Account Balance
    const neonAcc = await sql`SELECT balance FROM accounts WHERE id = 'acc-main' LIMIT 1`;
    const finalBal = Number(neonAcc[0]?.balance || 2865000);
    await sqliteClient.execute({
      sql: `UPDATE accounts SET balance = ? WHERE id = 'acc-main'`,
      args: [finalBal]
    });
    console.log(`Updated account balance in SQLite to Rp ${finalBal.toLocaleString('id-ID')}.`);

    console.log('=== SYNC TO SQLITE COMPLETE ===');
  } catch (err) {
    console.error('Sync error:', err);
  } finally {
    await sql.end();
  }
}

syncSqlite();
