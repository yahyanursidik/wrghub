import postgres from 'postgres';
import 'dotenv/config';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_O4jVKCzUWex8@ep-damp-queen-azh98l8v-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = postgres(DATABASE_URL);

async function main() {
  try {
    console.log('--- PROPERTIES ---');
    const props = await sql`SELECT id, code, number, owner_name, monthly_rate FROM properties ORDER BY code`;
    console.log(JSON.stringify(props, null, 2));

    console.log('--- BILLING PERIODS ---');
    const periods = await sql`SELECT id, name, month, year, status FROM billing_periods ORDER BY year, month`;
    console.log(JSON.stringify(periods, null, 2));

    console.log('--- ACCOUNTS ---');
    const accounts = await sql`SELECT id, code, name, balance FROM accounts`;
    console.log(JSON.stringify(accounts, null, 2));

    console.log('--- INVOICES COUNT ---');
    const invCount = await sql`SELECT count(*) FROM invoices`;
    console.log('Invoices count:', invCount[0].count);

    console.log('--- PAYMENTS COUNT ---');
    const payCount = await sql`SELECT count(*) FROM payments`;
    console.log('Payments count:', payCount[0].count);

    console.log('--- LEDGER ENTRIES COUNT ---');
    const ledgCount = await sql`SELECT count(*) FROM ledger_entries`;
    console.log('Ledger count:', ledgCount[0].count);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await sql.end();
  }
}

main();
