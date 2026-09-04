import postgres from 'postgres';
import { client as sqliteClient } from '../src/db/index';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_O4jVKCzUWex8@ep-damp-queen-azh98l8v-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

async function cleanDemoData() {
  console.log('====================================================');
  console.log('  WARGAHUB — PEMBERSIHAN DATA DEMO (CLEAN RESET)     ');
  console.log('====================================================\n');

  // 1. NEON POSTGRESQL CLEANUP
  console.log('1. Menghubungkan ke Neon PostgreSQL...');
  const sql = postgres(connectionString, { ssl: 'require', max: 5 });

  console.log('2. Menghapus referensi foreign key pada users...');
  await sql`UPDATE users SET person_id = NULL, property_id = NULL, property_code = NULL;`;

  console.log('3. Menghapus data transaksi, iuran, unit properti, dan warga demo...');

  // Child / dependent tables first
  await sql`DELETE FROM payment_allocations;`;
  await sql`DELETE FROM payments;`;
  await sql`DELETE FROM invoice_items;`;
  await sql`DELETE FROM invoices;`;
  await sql`DELETE FROM ledger_entries;`;
  await sql`DELETE FROM expenses;`;
  await sql`DELETE FROM budget_items;`;
  await sql`DELETE FROM budgets;`;
  await sql`DELETE FROM monthly_snapshots;`;
  await sql`DELETE FROM complaints;`;
  await sql`DELETE FROM announcements;`;
  await sql`DELETE FROM maintenance_requests;`;
  await sql`DELETE FROM facilities;`;
  await sql`DELETE FROM documents;`;
  await sql`DELETE FROM audit_logs;`;
  await sql`DELETE FROM user_property_access;`;
  await sql`DELETE FROM vehicles;`;
  await sql`DELETE FROM occupancies;`;
  await sql`DELETE FROM property_ownerships;`;
  await sql`DELETE FROM household_members;`;
  await sql`DELETE FROM households;`;
  await sql`DELETE FROM properties;`;
  await sql`DELETE FROM blocks;`;
  await sql`DELETE FROM persons;`;
  await sql`DELETE FROM billing_periods;`;

  console.log('   ✓ Seluruh transaksi, invoice, unit rumah, kependudukan, dan kendaraan demo berhasil dihapus.');

  // Reset Accounts balance to 0
  console.log('4. Mereset saldo akun kas dan bank ke Rp 0...');
  await sql`UPDATE accounts SET balance = 0;`;
  console.log('   ✓ Saldo rekening bank & kas tunai direset ke Rp 0.');

  // Clean and ensure core Admin Users
  console.log('5. Memperbarui akun Administrator & Pengurus inti...');
  await sql`
    DELETE FROM users 
    WHERE id NOT IN ('user-admin', 'user-ketua', 'user-bendahara', 'user-satpam');
  `;

  // Upsert user-admin
  await sql`
    INSERT INTO users (id, username, email, full_name, role, avatar_url, property_id, property_code, password_hash, is_active)
    VALUES (
      'user-admin', 'admin', 'admin@wargahub.id', 'Super Administrator', 'SUPER_ADMIN',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      NULL, NULL, 'admin123', true
    )
    ON CONFLICT (id) DO UPDATE SET
      username = 'admin',
      email = 'admin@wargahub.id',
      full_name = 'Super Administrator',
      role = 'SUPER_ADMIN',
      person_id = NULL,
      property_id = NULL,
      property_code = NULL,
      password_hash = 'admin123',
      is_active = true;
  `;

  // Upsert user-ketua
  await sql`
    INSERT INTO users (id, username, email, full_name, role, avatar_url, property_id, property_code, password_hash, is_active)
    VALUES (
      'user-ketua', 'ketua', 'ketua@wargahub.id', 'Ketua Pengurus Komplek', 'CHAIRMAN',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      NULL, NULL, 'admin123', true
    )
    ON CONFLICT (id) DO UPDATE SET
      username = 'ketua',
      email = 'ketua@wargahub.id',
      full_name = 'Ketua Pengurus Komplek',
      role = 'CHAIRMAN',
      person_id = NULL,
      property_id = NULL,
      property_code = NULL,
      password_hash = 'admin123',
      is_active = true;
  `;

  // Upsert user-bendahara
  await sql`
    INSERT INTO users (id, username, email, full_name, role, avatar_url, property_id, property_code, password_hash, is_active)
    VALUES (
      'user-bendahara', 'bendahara', 'bendahara@wargahub.id', 'Bendahara Komplek', 'TREASURER',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      NULL, NULL, 'bendahara123', true
    )
    ON CONFLICT (id) DO UPDATE SET
      username = 'bendahara',
      email = 'bendahara@wargahub.id',
      full_name = 'Bendahara Komplek',
      role = 'TREASURER',
      person_id = NULL,
      property_id = NULL,
      property_code = NULL,
      password_hash = 'bendahara123',
      is_active = true;
  `;

  // Upsert user-satpam
  await sql`
    INSERT INTO users (id, username, email, full_name, role, avatar_url, property_id, property_code, password_hash, is_active)
    VALUES (
      'user-satpam', 'satpam', 'satpam@wargahub.id', 'Komandan Keamanan Pos Satpam', 'SECURITY',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      NULL, NULL, 'satpam123', true
    )
    ON CONFLICT (id) DO UPDATE SET
      username = 'satpam',
      email = 'satpam@wargahub.id',
      full_name = 'Komandan Keamanan Pos Satpam',
      role = 'SECURITY',
      person_id = NULL,
      property_id = NULL,
      property_code = NULL,
      password_hash = 'satpam123',
      is_active = true;
  `;

  console.log('   ✓ Akun admin, ketua, bendahara, dan satpam dipelihara dengan PIN/password aktif.');

  // 5. Ensure Foundational Master Records (Community, Standard Blocks & Public Facilities)
  console.log('5. Menyiapkan master blok wilayah dan fasilitas umum standar...');
  const communityId = 'comm-01';
  await sql`
    INSERT INTO communities (id, name, code, address, city, postal_code, settings_json)
    VALUES (${communityId}, 'Komplek Perumahan WargaHub', 'WARGAHUB-01', 'Jl. Warga Asri No. 1', 'Jakarta', '12000', ${JSON.stringify({ transparency_mode: 'HOUSE_NUMBER', monthly_fee: 750000 })})
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
  `;

  const standardBlocks = [
    { id: 'blk-a', name: 'Blok A', code: 'A' },
    { id: 'blk-b', name: 'Blok B', code: 'B' },
    { id: 'blk-c', name: 'Blok C', code: 'C' },
    { id: 'blk-d', name: 'Blok D', code: 'D' },
    { id: 'block-a', name: 'Blok A', code: 'A' },
    { id: 'block-b', name: 'Blok B', code: 'B' },
    { id: 'block-c', name: 'Blok C', code: 'C' },
    { id: 'block-d', name: 'Blok D', code: 'D' },
  ];
  for (const b of standardBlocks) {
    await sql`
      INSERT INTO blocks (id, community_id, name, code)
      VALUES (${b.id}, ${communityId}, ${b.name}, ${b.code})
      ON CONFLICT (id) DO NOTHING;
    `;
  }

  const standardFacilities = [
    { id: 'fac-1', name: 'Balai Pertemuan Warga', code: 'FAC-BALAI', category: 'GEDUNG', location: 'Pusat Komplek' },
    { id: 'fac-2', name: 'Lapangan Olahraga & Futsal', code: 'FAC-LAPANGAN', category: 'OLAHRAGA', location: 'Blok C' },
    { id: 'fac-3', name: 'Taman Warga & Gazebo', code: 'FAC-TAMAN', category: 'TAMAN', location: 'Blok A' },
  ];
  for (const f of standardFacilities) {
    await sql`
      INSERT INTO facilities (id, community_id, name, code, category, location, condition)
      VALUES (${f.id}, ${communityId}, ${f.name}, ${f.code}, ${f.category}, ${f.location}, 'GOOD')
      ON CONFLICT (id) DO NOTHING;
    `;
  }

  console.log('   ✓ Master blok wilayah (A, B, C, D) dan fasilitas umum standar siap digunakan.');

  // 6. LOCAL SQLITE CLEANUP (FALLBACK DB)
  console.log('6. Membersihkan basis data lokal SQLite (data/wargahub.db)...');
  try {
    await sqliteClient.execute('UPDATE users SET person_id = NULL;');
    await sqliteClient.execute('DELETE FROM payment_allocations;');
    await sqliteClient.execute('DELETE FROM payments;');
    await sqliteClient.execute('DELETE FROM invoice_items;');
    await sqliteClient.execute('DELETE FROM invoices;');
    await sqliteClient.execute('DELETE FROM ledger_entries;');
    await sqliteClient.execute('DELETE FROM expenses;');
    await sqliteClient.execute('DELETE FROM budget_items;');
    await sqliteClient.execute('DELETE FROM budgets;');
    await sqliteClient.execute('DELETE FROM monthly_snapshots;');
    await sqliteClient.execute('DELETE FROM complaints;');
    await sqliteClient.execute('DELETE FROM announcements;');
    await sqliteClient.execute('DELETE FROM maintenance_requests;');
    await sqliteClient.execute('DELETE FROM facilities;');
    await sqliteClient.execute('DELETE FROM documents;');
    await sqliteClient.execute('DELETE FROM audit_logs;');
    await sqliteClient.execute('DELETE FROM user_property_access;');
    await sqliteClient.execute('DELETE FROM vehicles;');
    await sqliteClient.execute('DELETE FROM occupancies;');
    await sqliteClient.execute('DELETE FROM property_ownerships;');
    await sqliteClient.execute('DELETE FROM household_members;');
    await sqliteClient.execute('DELETE FROM households;');
    await sqliteClient.execute('DELETE FROM properties;');
    await sqliteClient.execute('DELETE FROM blocks;');
    await sqliteClient.execute('DELETE FROM persons;');
    await sqliteClient.execute('DELETE FROM billing_periods;');
    await sqliteClient.execute('UPDATE accounts SET balance = 0;');

    for (const b of standardBlocks) {
      await sqliteClient.execute({
        sql: 'INSERT INTO blocks (id, community_id, name, code) VALUES (?, ?, ?, ?);',
        args: [b.id, communityId, b.name, b.code]
      });
    }
    console.log('   ✓ Basis data lokal SQLite berhasil dibersihkan.');
  } catch (err: any) {
    console.warn('   ! SQLite cleanup note:', err.message);
  }

  // Verification Counts
  const propCount = await sql`SELECT count(*) as total FROM properties`;
  const invCount = await sql`SELECT count(*) as total FROM invoices`;
  const paymentCount = await sql`SELECT count(*) as total FROM payments`;
  const ledgerCount = await sql`SELECT count(*) as total FROM ledger_entries`;
  const userCount = await sql`SELECT count(*) as total FROM users WHERE is_active = true`;
  const accountsData = await sql`SELECT name, code, balance FROM accounts`;

  console.log('\n====================================================');
  console.log('  HASIL PEMBERSIHAN DATA:                           ');
  console.log('====================================================');
  console.log(`  - Total Unit Properti     : ${propCount[0].total} unit (Siap input data riil)`);
  console.log(`  - Total Invoices / Iuran  : ${invCount[0].total} records (Bersih)`);
  console.log(`  - Total Pembayaran Masuk  : ${paymentCount[0].total} records (Bersih)`);
  console.log(`  - Total Entri Buku Kas    : ${ledgerCount[0].total} records (Bersih)`);
  console.log(`  - Total User Aktif        : ${userCount[0].total} akun pengurus`);
  console.log('  - Akun Kas & Bank :');
  for (const acc of accountsData) {
    console.log(`    * ${acc.name} (${acc.code}): Rp ${Number(acc.balance).toLocaleString('id-ID')}`);
  }
  console.log('====================================================\n');
  console.log('✓ SISTEM WARGAHUB TELAH BERSIH DARI DATA DEMO DAN SIAP DIGUNAKAN UNTUK DATA RIIL!');

  await sql.end();
}

cleanDemoData().catch(err => {
  console.error('Pembersihan gagal:', err);
  process.exit(1);
});
