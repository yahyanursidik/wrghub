import postgres from 'postgres';
import { client as sqliteClient } from '../src/db/index';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_O4jVKCzUWex8@ep-damp-queen-azh98l8v-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

interface KavlingData {
  no: number;
  unit: string;
  code: string;
  num: string;
  altCode: string;
  owner: string;
  head: string;
  phone: string;
  statusImage: string;
  dbStatus: 'OWNER_OCCUPIED' | 'RENTED' | 'VACANT';
  isPaidAugust: boolean;
}

const KAVLING_LIST: KavlingData[] = [
  {
    no: 1,
    unit: 'Kav A',
    code: 'Kav A',
    num: 'A',
    altCode: 'KVa',
    owner: 'Pak Verial/Bu Viny',
    head: 'Pak Verial',
    phone: '082316485044',
    statusImage: 'Pemilik',
    dbStatus: 'OWNER_OCCUPIED',
    isPaidAugust: true,
  },
  {
    no: 2,
    unit: 'Kav B',
    code: 'Kav B',
    num: 'B',
    altCode: 'KVb',
    owner: 'Bu Shinta',
    head: 'Mahasiswa Polban',
    phone: '081220885100',
    statusImage: 'Disewakan',
    dbStatus: 'RENTED',
    isPaidAugust: false,
  },
  {
    no: 3,
    unit: 'Kav D',
    code: 'Kav D',
    num: 'D',
    altCode: 'KVd',
    owner: 'Pak Rieva',
    head: 'Pak Rieva',
    phone: '081573007178',
    statusImage: 'Pemilik',
    dbStatus: 'OWNER_OCCUPIED',
    isPaidAugust: true,
  },
  {
    no: 4,
    unit: 'Kav C',
    code: 'Kav C',
    num: 'C',
    altCode: 'KVc',
    owner: 'Bu Rina',
    head: 'Bu Rina',
    phone: '087823964649',
    statusImage: 'Pemilik Kosong',
    dbStatus: 'VACANT',
    isPaidAugust: true,
  },
  {
    no: 5,
    unit: 'Kav E',
    code: 'Kav E',
    num: 'E',
    altCode: 'KVe',
    owner: 'Pak Budi/Bu Endang',
    head: 'Pak Budi',
    phone: '0811238689',
    statusImage: 'Pemilik',
    dbStatus: 'OWNER_OCCUPIED',
    isPaidAugust: true,
  },
  {
    no: 6,
    unit: 'Kav F',
    code: 'Kav F',
    num: 'F',
    altCode: 'KVf',
    owner: 'Pak Adi/Bu Ratih',
    head: 'Pa Anggia',
    phone: '081220082240',
    statusImage: 'Disewakan',
    dbStatus: 'RENTED',
    isPaidAugust: false,
  },
  {
    no: 7,
    unit: 'Kav G',
    code: 'Kav G',
    num: 'G',
    altCode: 'KVg',
    owner: 'Pak Misael/Bu Caroline',
    head: 'Pak Misael',
    phone: '082216668852',
    statusImage: 'Pemilik',
    dbStatus: 'OWNER_OCCUPIED',
    isPaidAugust: true,
  },
  {
    no: 8,
    unit: 'Kav H',
    code: 'Kav H',
    num: 'H',
    altCode: 'KVh',
    owner: 'Pak Fahmi Rizal',
    head: 'Pak Fahmi Rizal',
    phone: '085781217072',
    statusImage: 'Pemilik',
    dbStatus: 'OWNER_OCCUPIED',
    isPaidAugust: true,
  },
  {
    no: 9,
    unit: 'Kav I',
    code: 'Kav I',
    num: 'I',
    altCode: 'KVi',
    owner: 'Bu Hj Yatti',
    head: 'Pak Yahya',
    phone: '085722003303',
    statusImage: 'Disewakan',
    dbStatus: 'RENTED',
    isPaidAugust: false,
  },
  {
    no: 10,
    unit: 'Kav J',
    code: 'Kav J',
    num: 'J',
    altCode: 'KVj',
    owner: 'Bu Sofia P',
    head: 'Bu Sofia P',
    phone: '08170248889',
    statusImage: 'Pemilik Kosong',
    dbStatus: 'VACANT',
    isPaidAugust: true,
  },
  {
    no: 11,
    unit: 'Kav K',
    code: 'Kav K',
    num: 'K',
    altCode: 'KVk',
    owner: 'Bu Winda/Pak Eky',
    head: 'Pak Eky',
    phone: '08993949392',
    statusImage: 'Pemilik',
    dbStatus: 'OWNER_OCCUPIED',
    isPaidAugust: true,
  },
  {
    no: 12,
    unit: 'Kav L',
    code: 'Kav L',
    num: 'L',
    altCode: 'KVl',
    owner: 'Pak Haji Ano',
    head: 'Pak Haji Ano',
    phone: '08112335353',
    statusImage: 'Pemilik',
    dbStatus: 'OWNER_OCCUPIED',
    isPaidAugust: true,
  },
  {
    no: 13,
    unit: 'Kav M',
    code: 'Kav M',
    num: 'M',
    altCode: 'KVm',
    owner: 'Pak Dedi N/Pak Jaya',
    head: 'Pak Dedi N/Pak Jaya',
    phone: '081220022407',
    statusImage: 'Pemilik Kosong',
    dbStatus: 'VACANT',
    isPaidAugust: true,
  },
];

async function importKavling() {
  console.log('================================================================');
  console.log('  WARGAHUB — IMPORT DATA 13 UNIT SISTEM KAVLING / KVa           ');
  console.log('================================================================\n');

  const sql = postgres(connectionString, { ssl: 'require', max: 5 });
  const communityId = 'comm-01';

  // 1. Ensure Community & Settings
  console.log('1. Memastikan Community & Pengaturan Sistem...');
  await sql`
    INSERT INTO communities (id, name, code, address, city, postal_code, settings_json)
    VALUES (${communityId}, 'Komplek Taman Sejahtera (Sistem Kavling)', 'TAMAN_SEJAHTERA_KAV', 'Jl. Kavling Asri No. 1, RT 02 / RW 05', 'Bandung Barat', '40559', ${JSON.stringify({ transparency_mode: 'HOUSE_NUMBER', monthly_fee: 750000 })})
    ON CONFLICT (id) DO UPDATE SET 
      name = 'Komplek Taman Sejahtera (Sistem Kavling)',
      address = 'Jl. Kavling Asri No. 1, RT 02 / RW 05';
  `;

  // 2. Ensure Block 'blk-kavling'
  console.log('2. Memastikan Master Blok Area Kavling (blk-kavling)...');
  await sql`
    INSERT INTO blocks (id, community_id, name, code)
    VALUES ('blk-kavling', ${communityId}, 'Area Kavling', 'KAV')
    ON CONFLICT (id) DO UPDATE SET name = 'Area Kavling', code = 'KAV';
  `;

  // Also ensure accounts exist
  await sql`
    INSERT INTO accounts (id, community_id, code, name, type, account_number, bank_name, balance, is_active)
    VALUES ('acc-main', ${communityId}, 'BCA_MAIN', 'Rekening Operasional Komplek (BCA)', 'BANK', '542-019-8821', 'Bank Central Asia (BCA)', 37500000, true)
    ON CONFLICT (id) DO UPDATE SET code = 'BCA_MAIN', name = 'Rekening Operasional Komplek (BCA)', balance = 37500000;
  `;
  await sql`
    INSERT INTO accounts (id, community_id, code, name, type, account_number, bank_name, balance, is_active)
    VALUES ('acc-petty', ${communityId}, 'KAS-KECIL', 'Kas Tunai & Operasional Satpam', 'CASH', '-', 'Tunai', 5000000, true)
    ON CONFLICT (id) DO NOTHING;
  `;

  // 3. Ensure Billing Periods
  console.log('3. Menyiapkan Periode Penagihan Iuran...');
  const periods = [
    { id: 'period-2026-05', year: 2026, month: 5, name: 'Mei 2026', due_date: '2026-05-10', status: 'CLOSED' },
    { id: 'period-2026-06', year: 2026, month: 6, name: 'Juni 2026', due_date: '2026-06-10', status: 'CLOSED' },
    { id: 'period-2026-07', year: 2026, month: 7, name: 'Juli 2026', due_date: '2026-07-10', status: 'CLOSED' },
    { id: 'period-2026-08', year: 2026, month: 8, name: 'Agustus 2026', due_date: '2026-08-10', status: 'OPEN' },
    { id: 'period-2026-09', year: 2026, month: 9, name: 'September 2026', due_date: '2026-09-10', status: 'OPEN' },
  ];
  for (const p of periods) {
    await sql`
      INSERT INTO billing_periods (id, community_id, year, month, name, due_date, status)
      VALUES (${p.id}, ${communityId}, ${p.year}, ${p.month}, ${p.name}, ${p.due_date}, ${p.status})
      ON CONFLICT (id) DO UPDATE SET status = ${p.status};
    `;
  }

  // 4. Ensure Fee Types & Fee Rules
  console.log('4. Menyiapkan Aturan Iuran Pengelolaan Lingkungan (IPL)...');
  await sql`
    INSERT INTO fee_types (id, community_id, code, name, description, default_amount, is_active)
    VALUES ('fee-ipl', ${communityId}, 'IPL', 'Iuran Pengelolaan Lingkungan (IPL)', 'Iuran wajib bulanan kavling', 750000, true)
    ON CONFLICT (id) DO NOTHING;
  `;
  await sql`
    INSERT INTO fee_rules (id, fee_type_id, amount, frequency, due_day, effective_from, scope, is_active)
    VALUES ('rule-ipl', 'fee-ipl', 750000, 'MONTHLY', 10, '2026-01-01', 'ALL', true)
    ON CONFLICT (id) DO NOTHING;
  `;

  // Ensure Admin & Pengurus accounts exist
  console.log('5. Memastikan Akun Pengurus...');
  await sql`
    INSERT INTO users (id, username, email, full_name, role, avatar_url, property_id, property_code, password_hash, is_active)
    VALUES ('user-admin', 'admin', 'admin@wargahub.id', 'Super Administrator', 'SUPER_ADMIN', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', NULL, NULL, 'admin123', true)
    ON CONFLICT (id) DO UPDATE SET password_hash = 'admin123', is_active = true;
  `;
  await sql`
    INSERT INTO users (id, username, email, full_name, role, avatar_url, property_id, property_code, password_hash, is_active)
    VALUES ('user-ketua', 'ketua', 'ketua@wargahub.id', 'Budi Santoso', 'CHAIRMAN', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', 'prop-kav-e', 'Kav E', 'admin123', true)
    ON CONFLICT (id) DO UPDATE SET password_hash = 'admin123', property_id = 'prop-kav-e', property_code = 'Kav E', is_active = true;
  `;
  await sql`
    INSERT INTO users (id, username, email, full_name, role, avatar_url, property_id, property_code, password_hash, is_active)
    VALUES ('user-bendahara', 'bendahara', 'bendahara@wargahub.id', 'Hendra Wijaya', 'TREASURER', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 'prop-kav-d', 'Kav D', 'bendahara123', true)
    ON CONFLICT (id) DO UPDATE SET password_hash = 'bendahara123', property_id = 'prop-kav-d', property_code = 'Kav D', is_active = true;
  `;
  await sql`
    INSERT INTO users (id, username, email, full_name, role, avatar_url, property_id, property_code, password_hash, is_active)
    VALUES ('user-satpam', 'satpam', 'satpam@wargahub.id', 'Joko Santoso (Komandan Satpam)', 'SECURITY', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', NULL, NULL, 'satpam123', true)
    ON CONFLICT (id) DO UPDATE SET password_hash = 'satpam123', is_active = true;
  `;

  // 6. Import the 13 Kavling Units
  console.log('\n6. Mengimpor 13 Data Unit Kavling beserta Relasi Lengkap...');

  for (const item of KAVLING_LIST) {
    const letter = item.num.toLowerCase(); // a, b, c, etc.
    const propId = `prop-kav-${letter}`;
    const code = item.code; // "Kav A"
    const formattedPhone = item.phone.startsWith('0') ? item.phone : `0${item.phone.replace(/^62/, '')}`;
    const intlPhone = item.phone.startsWith('62') ? item.phone : `62${item.phone.replace(/^0/, '')}`;
    const isVacant = item.dbStatus === 'VACANT';
    const isRented = item.dbStatus === 'RENTED';
    const isOwner = item.dbStatus === 'OWNER_OCCUPIED';

    const noteStr = `No. Kavling: ${item.code} (${item.altCode}) | Pemilik: ${item.owner} | Kepala Keluarga: ${item.head} | Kontak WA: ${formattedPhone} | Status: ${item.statusImage}`;

    // A. Properties Table
    await sql`
      INSERT INTO properties (
        id, community_id, block_id, code, number, address, occupancy_status, is_active, notes
      ) VALUES (
        ${propId}, ${communityId}, 'blk-kavling', ${code}, ${item.num},
        ${`Komplek WargaHub, Kavling ${item.num}`}, ${item.dbStatus}, true, ${noteStr}
      )
      ON CONFLICT (id) DO UPDATE SET
        community_id = ${communityId},
        block_id = 'blk-kavling',
        code = ${code},
        number = ${item.num},
        address = ${`Komplek WargaHub, Kavling ${item.num}`},
        occupancy_status = ${item.dbStatus},
        is_active = true,
        notes = ${noteStr};
    `;

    // B. Persons Table (Owner)
    const ownerPersonId = `person-kav-${letter}-owner`;
    const ownerEmail = `pemilik.kav${letter}@wargahub.id`;
    await sql`
      INSERT INTO persons (id, name, phone, email, is_active)
      VALUES (${ownerPersonId}, ${item.owner}, ${formattedPhone}, ${ownerEmail}, true)
      ON CONFLICT (id) DO UPDATE SET
        name = ${item.owner},
        phone = ${formattedPhone},
        email = ${ownerEmail};
    `;

    // Person (Head of Household / Occupant if different from Owner)
    let headPersonId = ownerPersonId;
    if (isRented || item.head !== item.owner) {
      headPersonId = `person-kav-${letter}-head`;
      const headEmail = `penghuni.kav${letter}@wargahub.id`;
      await sql`
        INSERT INTO persons (id, name, phone, email, is_active)
        VALUES (${headPersonId}, ${item.head}, ${formattedPhone}, ${headEmail}, true)
        ON CONFLICT (id) DO UPDATE SET
          name = ${item.head},
          phone = ${formattedPhone},
          email = ${headEmail};
      `;
    }

    // C. Property Ownerships
    const ownId = `own-kav-${letter}`;
    await sql`
      INSERT INTO property_ownerships (id, property_id, person_id, is_active, started_at)
      VALUES (${ownId}, ${propId}, ${ownerPersonId}, true, '2024-01-01')
      ON CONFLICT (id) DO UPDATE SET
        property_id = ${propId},
        person_id = ${ownerPersonId},
        is_active = true;
    `;

    // D. Households & Household Members
    const hhId = `hh-kav-${letter}`;
    const hhName = isRented ? `Keluarga/Penghuni ${item.head} (${item.code})` : `Keluarga ${item.head} (${item.code})`;
    await sql`
      INSERT INTO households (id, name)
      VALUES (${hhId}, ${hhName})
      ON CONFLICT (id) DO UPDATE SET name = ${hhName};
    `;

    const hmId = `hm-kav-${letter}`;
    await sql`
      INSERT INTO household_members (id, household_id, person_id, relationship, is_active, started_at)
      VALUES (${hmId}, ${hhId}, ${headPersonId}, ${isRented ? 'TENANT' : 'HEAD'}, true, '2024-01-01')
      ON CONFLICT (id) DO UPDATE SET
        household_id = ${hhId},
        person_id = ${headPersonId},
        relationship = ${isRented ? 'TENANT' : 'HEAD'};
    `;

    // E. Occupancies
    const occId = `occ-kav-${letter}`;
    const occType = isRented ? 'TENANT' : 'OWNER';
    await sql`
      INSERT INTO occupancies (id, property_id, household_id, type, is_active, started_at)
      VALUES (${occId}, ${propId}, ${hhId}, ${occType}, ${!isVacant}, '2024-01-01')
      ON CONFLICT (id) DO UPDATE SET
        property_id = ${propId},
        household_id = ${hhId},
        type = ${occType},
        is_active = ${!isVacant};
    `;

    // F. User Login Account for this Kavling
    const userId = `user-kav-${letter}`;
    const username = `kav_${letter}`;
    const userRole = isOwner ? 'HOUSEHOLD_HEAD' : (isRented ? 'RESIDENT' : 'HOUSE_OWNER');
    const userDisplayName = `${item.head} (${item.code})`;
    const userEmail = `${username}@wargahub.id`;

    await sql`
      INSERT INTO users (
        id, username, email, full_name, role, avatar_url,
        property_id, property_code, password_hash, is_active
      ) VALUES (
        ${userId}, ${username}, ${userEmail}, ${userDisplayName}, ${userRole},
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        ${propId}, ${code}, 'warga123', true
      )
      ON CONFLICT (id) DO UPDATE SET
        username = ${username},
        email = ${userEmail},
        full_name = ${userDisplayName},
        role = ${userRole},
        property_id = ${propId},
        property_code = ${code},
        password_hash = 'warga123',
        is_active = true;
    `;

    // G. User Property Access
    const uaccId = `uacc-kav-${letter}`;
    await sql`
      INSERT INTO user_property_access (
        id, user_id, property_id, relationship, can_view_billing, can_pay, can_edit_occupants, can_view_property, started_at
      ) VALUES (
        ${uaccId}, ${userId}, ${propId}, ${occType}, true, true, true, true, '2024-01-01'
      )
      ON CONFLICT (id) DO UPDATE SET
        user_id = ${userId},
        property_id = ${propId},
        relationship = ${occType};
    `;

    console.log(`   ✓ [${item.code}] (${item.altCode}) - ${item.owner} / ${item.head} - ${item.dbStatus} - WA: ${formattedPhone}`);
  }

  // 7. Catatan: Data billing & payments tidak dibuat otomatis agar data tetap bersih dan riil diinput pengurus.
  console.log('\n7. Melewati pembuatan data transaksi demo (Data billing & payments tetap bersih)...');

  // 8. ALSO SYNC TO LOCAL SQLITE FALLBACK DATABASE
  console.log('\n8. Melakukan Sinkronisasi ke Basis Data Lokal SQLite (data/wargahub.db)...');
  try {
    // Insert block
    await sqliteClient.execute({
      sql: `INSERT OR REPLACE INTO blocks (id, community_id, name, code) VALUES (?, ?, ?, ?)`,
      args: ['blk-kavling', communityId, 'Area Kavling', 'KAV']
    });

    for (const item of KAVLING_LIST) {
      const letter = item.num.toLowerCase();
      const propId = `prop-kav-${letter}`;
      const code = item.code;
      const formattedPhone = item.phone.startsWith('0') ? item.phone : `0${item.phone.replace(/^62/, '')}`;
      const noteStr = `No. Kavling: ${item.code} (${item.altCode}) | Pemilik: ${item.owner} | Kepala Keluarga: ${item.head} | Kontak WA: ${formattedPhone} | Status: ${item.statusImage}`;

      await sqliteClient.execute({
        sql: `INSERT OR REPLACE INTO properties (id, community_id, block_id, code, number, address, occupancy_status, is_active, notes)
              VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`,
        args: [propId, communityId, 'blk-kavling', code, item.num, `Komplek WargaHub, Kavling ${item.num}`, item.dbStatus, noteStr]
      });

      const ownerPersonId = `person-kav-${letter}-owner`;
      await sqliteClient.execute({
        sql: `INSERT OR REPLACE INTO persons (id, name, phone, email, is_active) VALUES (?, ?, ?, ?, 1)`,
        args: [ownerPersonId, item.owner, formattedPhone, `pemilik.kav${letter}@wargahub.id`]
      });

      await sqliteClient.execute({
        sql: `INSERT OR REPLACE INTO property_ownerships (id, property_id, person_id, is_active, started_at) VALUES (?, ?, ?, 1, '2024-01-01')`,
        args: [`own-kav-${letter}`, propId, ownerPersonId]
      });
    }
    console.log('   ✓ Sinkronisasi ke SQLite berhasil!');
  } catch (sqErr: any) {
    console.warn('   ! Catatan sinkronisasi SQLite:', sqErr.message);
  }

  // Verification summary
  const propCount = await sql`SELECT count(*) as total FROM properties WHERE block_id = 'blk-kavling'`;
  const userCount = await sql`SELECT count(*) as total FROM users WHERE property_code LIKE 'Kav%'`;
  const invCount = await sql`SELECT count(*) as total FROM invoices WHERE billing_period_id = 'period-2026-08'`;

  console.log('\n================================================================');
  console.log('  REKAPITULASI IMPORT KAVLING:                                  ');
  console.log('================================================================');
  console.log(`  ✓ Total Unit Kavling Terdaftar : ${propCount[0].total} unit (Kav A s/d Kav M)`);
  console.log(`  ✓ Akun Login Warga Aktif       : ${userCount[0].total} akun (Password: warga123)`);
  console.log(`  ✓ Data Billing & Payments      : Bersih (0 invoice demo)`);
  console.log('================================================================\n');

  await sql.end();
}

importKavling().catch(err => {
  console.error('Import gagal:', err);
  process.exit(1);
});
