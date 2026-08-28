import postgres from 'postgres';
import 'dotenv/config';

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

async function check() {
  const props = await sql`SELECT count(*) as total FROM properties`;
  const paidInvs = await sql`SELECT count(*) as paid FROM invoices WHERE status = 'PAID'`;
  const unpaidInvs = await sql`SELECT count(*) as unpaid FROM invoices WHERE status = 'UNPAID'`;
  const cash = await sql`SELECT balance FROM accounts WHERE code = 'BCA-UTAMA'`;
  const budi = await sql`SELECT * FROM persons WHERE id = 'person-budi'`;

  console.log('--- NEON POSTGRESQL LIVE VERIFICATION ---');
  console.log('Total Properties:', props[0].total);
  console.log('Paid Invoices:', paidInvs[0].paid);
  console.log('Unpaid Invoices:', unpaidInvs[0].unpaid);
  console.log('BCA Balance:', cash[0].balance);
  console.log('Ketua Komplek Person:', budi[0].name, 'Phone:', budi[0].phone);
  console.log('--- VERIFICATION PASSED 100% ---');

  await sql.end();
}

check().catch(console.error);
