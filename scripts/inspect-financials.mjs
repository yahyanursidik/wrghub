import postgres from 'postgres';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_O4jVKCzUWex8@ep-damp-queen-azh98l8v-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
const sql = postgres(connectionString);

async function main() {
  try {
    const accounts = await sql`SELECT id, code, name, balance FROM accounts`;
    console.log('=== ACCOUNTS ===');
    console.log(accounts);

    const periods = await sql`SELECT id, name, month, year, status FROM billing_periods ORDER BY year, month`;
    console.log('=== BILLING PERIODS ===');
    console.log(periods);

    const invSummary = await sql`
      SELECT billing_period_id, status, count(*), sum(total) as total, sum(paid_amount) as paid
      FROM invoices
      GROUP BY billing_period_id, status
      ORDER BY billing_period_id
    `;
    console.log('=== INVOICES SUMMARY ===');
    console.log(invSummary);

    const payCount = await sql`SELECT count(*) FROM payments`;
    console.log('=== PAYMENTS COUNT ===', payCount[0].count);

    const ledgerSummary = await sql`
      SELECT direction, count(*), sum(amount) as total
      FROM ledger_entries
      GROUP BY direction
    `;
    console.log('=== LEDGER SUMMARY ===');
    console.log(ledgerSummary);

    const properties = await sql`SELECT id, code, number, occupancy_status FROM properties ORDER BY code`;
    console.log('=== PROPERTIES ===');
    console.log(properties.map(p => ({ id: p.id, code: p.code, number: p.number })));
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await sql.end();
  }
}

main();
