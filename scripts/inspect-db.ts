import postgres from 'postgres';
import 'dotenv/config';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_O4jVKCzUWex8@ep-damp-queen-azh98l8v-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = postgres(DATABASE_URL);

async function main() {
  try {
    console.log('--- ACCOUNTS ---');
    const accounts = await sql`SELECT id, code, name, balance FROM accounts`;
    console.log(JSON.stringify(accounts, null, 2));

    console.log('--- EXPENSE CATEGORIES ---');
    const cats = await sql`SELECT id, code, name FROM expense_categories`;
    console.log(JSON.stringify(cats, null, 2));

    console.log('--- USERS WITH NAME ---');
    const users = await sql`SELECT id, username, full_name, role FROM users WHERE role IN ('CHAIRMAN', 'SUPER_ADMIN', 'TREASURER')`;
    console.log(JSON.stringify(users, null, 2));

    console.log('--- SETTINGS ---');
    const settings = await sql`SELECT key, value FROM settings`;
    console.log(JSON.stringify(settings, null, 2));

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await sql.end();
  }
}

main();
