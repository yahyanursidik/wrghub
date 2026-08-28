import postgres from 'postgres';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_O4jVKCzUWex8@ep-damp-queen-azh98l8v-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

async function updateAuthSchema() {
  const sql = postgres(connectionString, { ssl: 'require' });
  console.log('Updating users table in Neon PostgreSQL with password & property mapping...');

  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS property_id VARCHAR(64);`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS property_code VARCHAR(30);`;

  // Update existing users with passwords
  await sql`
    UPDATE users SET 
      password_hash = 'admin123',
      property_id = 'prop-a-17',
      property_code = 'A-17'
    WHERE id = 'user-ketua';
  `;

  await sql`
    UPDATE users SET 
      password_hash = 'bendahara123'
    WHERE id = 'user-bendahara';
  `;

  await sql`
    UPDATE users SET 
      password_hash = 'warga123',
      property_id = 'prop-a-17',
      property_code = 'A-17'
    WHERE id = 'user-warga-a17';
  `;

  // Add Warga B-07 (Belum Bayar) and Satpam
  await sql`
    INSERT INTO users (id, username, email, full_name, role, avatar_url, property_id, property_code, password_hash, is_active)
    VALUES (
      'user-warga-b07', 'warga_b07', 'agus.b07@wargahub.id', 'Agus Priyono', 'HOUSEHOLD_HEAD',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      'prop-b-07', 'B-07', 'warga123', true
    )
    ON CONFLICT (id) DO UPDATE SET 
      password_hash = 'warga123',
      property_id = 'prop-b-07',
      property_code = 'B-07';
  `;

  await sql`
    INSERT INTO users (id, username, email, full_name, role, avatar_url, password_hash, is_active)
    VALUES (
      'user-satpam', 'satpam', 'satpam@wargahub.id', 'Joko Santoso (Komandan Satpam)', 'SECURITY',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      'satpam123', true
    )
    ON CONFLICT (id) DO UPDATE SET password_hash = 'satpam123';
  `;

  console.log('Auth schema and demo accounts updated in Neon PostgreSQL successfully!');
  await sql.end();
}

updateAuthSchema().catch(console.error);
