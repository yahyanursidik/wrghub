import postgres from 'postgres';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_O4jVKCzUWex8@ep-damp-queen-azh98l8v-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

async function seedNeon() {
  console.log('Connecting and seeding Neon PostgreSQL database...');
  const sql = postgres(connectionString, { ssl: 'require', max: 5 });

  // Clean existing tables
  await sql`DELETE FROM audit_logs;`;
  await sql`DELETE FROM complaints;`;
  await sql`DELETE FROM maintenance_requests;`;
  await sql`DELETE FROM facilities;`;
  await sql`DELETE FROM announcements;`;
  await sql`DELETE FROM documents;`;
  await sql`DELETE FROM monthly_snapshots;`;
  await sql`DELETE FROM ledger_entries;`;
  await sql`DELETE FROM expenses;`;
  await sql`DELETE FROM budget_items;`;
  await sql`DELETE FROM budgets;`;
  await sql`DELETE FROM expense_categories;`;
  await sql`DELETE FROM payment_allocations;`;
  await sql`DELETE FROM payments;`;
  await sql`DELETE FROM invoice_items;`;
  await sql`DELETE FROM invoices;`;
  await sql`DELETE FROM billing_periods;`;
  await sql`DELETE FROM fee_rules;`;
  await sql`DELETE FROM fee_types;`;
  await sql`DELETE FROM user_property_access;`;
  await sql`DELETE FROM users;`;
  await sql`DELETE FROM vehicles;`;
  await sql`DELETE FROM occupancies;`;
  await sql`DELETE FROM property_ownerships;`;
  await sql`DELETE FROM household_members;`;
  await sql`DELETE FROM households;`;
  await sql`DELETE FROM persons;`;
  await sql`DELETE FROM properties;`;
  await sql`DELETE FROM blocks;`;
  await sql`DELETE FROM accounts;`;
  await sql`DELETE FROM settings;`;
  await sql`DELETE FROM communities;`;

  const communityId = 'comm-01';
  await sql`
    INSERT INTO communities (id, name, code, address, city, postal_code, settings_json)
    VALUES (${communityId}, 'Komplek Taman Sejahtera', 'TAMAN_SEJAHTERA', 'Jl. Melati Raya No. 1, RT 02 / RW 05', 'Jakarta Selatan', '12340', ${JSON.stringify({ transparency_mode: 'HOUSE_NUMBER', monthly_fee: 750000 })});
  `;

  // Settings
  await sql`INSERT INTO settings (id, community_id, key, value, description) VALUES ('set-1', ${communityId}, 'community_name', 'Komplek Taman Sejahtera', 'Nama resmi komplek');`;
  await sql`INSERT INTO settings (id, community_id, key, value, description) VALUES ('set-2', ${communityId}, 'transparency_mode', 'HOUSE_NUMBER', 'Mode transparansi publik');`;
  await sql`INSERT INTO settings (id, community_id, key, value, description) VALUES ('set-3', ${communityId}, 'monthly_fee_amount', '750000', 'Nominal iuran bulanan per rumah');`;
  await sql`INSERT INTO settings (id, community_id, key, value, description) VALUES ('set-4', ${communityId}, 'due_day_of_month', '10', 'Tanggal jatuh tempo iuran');`;

  // Accounts
  await sql`INSERT INTO accounts (id, community_id, code, name, type, account_number, bank_name, balance, is_active) VALUES ('acc-main', ${communityId}, 'BCA-UTAMA', 'Rekening Operasional Komplek', 'BANK', '542-019-8821', 'Bank Central Asia (BCA)', 128450000, true);`;
  await sql`INSERT INTO accounts (id, community_id, code, name, type, account_number, bank_name, balance, is_active) VALUES ('acc-petty', ${communityId}, 'KAS-KECIL', 'Kas Tunai / Petty Cash Satpam & Pengurus', 'CASH', '-', 'Tunai', 5000000, true);`;

  // Blocks
  const blocks = [
    { id: 'blk-a', name: 'Blok A', code: 'A' },
    { id: 'blk-b', name: 'Blok B', code: 'B' },
    { id: 'blk-c', name: 'Blok C', code: 'C' },
    { id: 'blk-d', name: 'Blok D', code: 'D' },
  ];
  for (const b of blocks) {
    await sql`INSERT INTO blocks (id, community_id, name, code) VALUES (${b.id}, ${communityId}, ${b.name}, ${b.code});`;
  }

  // Fee Types & Rules
  await sql`INSERT INTO fee_types (id, community_id, code, name, description, default_amount, is_active) VALUES ('fee-ipl', ${communityId}, 'IPL', 'Iuran Pengelolaan Lingkungan (IPL)', 'Iuran wajib bulanan', 750000, true);`;
  await sql`INSERT INTO fee_rules (id, fee_type_id, amount, frequency, due_day, effective_from, scope, is_active) VALUES ('rule-ipl', 'fee-ipl', 750000, 'MONTHLY', 10, '2026-01-01', 'ALL', true);`;

  // Periods
  const periods = [
    { id: 'period-2026-05', year: 2026, month: 5, name: 'Mei 2026', due_date: '2026-05-10', status: 'CLOSED' },
    { id: 'period-2026-06', year: 2026, month: 6, name: 'Juni 2026', due_date: '2026-06-10', status: 'CLOSED' },
    { id: 'period-2026-07', year: 2026, month: 7, name: 'Juli 2026', due_date: '2026-07-10', status: 'CLOSED' },
    { id: 'period-2026-08', year: 2026, month: 8, name: 'Agustus 2026', due_date: '2026-08-10', status: 'OPEN' },
  ];
  for (const p of periods) {
    await sql`INSERT INTO billing_periods (id, community_id, year, month, name, due_date, status) VALUES (${p.id}, ${communityId}, ${p.year}, ${p.month}, ${p.name}, ${p.due_date}, ${p.status});`;
  }

  // Persons & Household for A-17
  const personBudi = 'person-budi';
  await sql`INSERT INTO persons (id, name, phone, email, is_active) VALUES (${personBudi}, 'Budi Santoso', '0812-3456-7890', 'budi.santoso@wargahub.id', true);`;
  await sql`INSERT INTO persons (id, name, phone, email, is_active) VALUES ('person-siti', 'Siti Lestari', '0812-9876-5432', 'siti.lestari@gmail.com', true);`;
  await sql`INSERT INTO persons (id, name, phone, email, is_active) VALUES ('person-alya', 'Alya Santoso', '', '', true);`;
  await sql`INSERT INTO persons (id, name, phone, email, is_active) VALUES ('person-daffa', 'Daffa Santoso', '', '', true);`;

  const householdBudi = 'hh-a17';
  await sql`INSERT INTO households (id, name) VALUES (${householdBudi}, 'Keluarga Budi Santoso');`;
  await sql`INSERT INTO household_members (id, household_id, person_id, relationship, birth_date, is_active, started_at) VALUES ('hm-budi', ${householdBudi}, ${personBudi}, 'HEAD', '1985-03-12', true, '2020-01-01');`;
  await sql`INSERT INTO household_members (id, household_id, person_id, relationship, birth_date, is_active, started_at) VALUES ('hm-siti', ${householdBudi}, 'person-siti', 'SPOUSE', '1987-07-25', true, '2020-01-01');`;
  await sql`INSERT INTO household_members (id, household_id, person_id, relationship, birth_date, is_active, started_at) VALUES ('hm-alya', ${householdBudi}, 'person-alya', 'CHILD', '2013-05-14', true, '2020-01-01');`;
  await sql`INSERT INTO household_members (id, household_id, person_id, relationship, birth_date, is_active, started_at) VALUES ('hm-daffa', ${householdBudi}, 'person-daffa', 'CHILD', '2017-09-03', true, '2020-01-01');`;

  // Users
  await sql`INSERT INTO users (id, username, email, full_name, role, avatar_url, person_id, is_active) VALUES ('user-ketua', 'ketua', 'ketua@wargahub.id', 'Budi Santoso', 'CHAIRMAN', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', ${personBudi}, true);`;
  await sql`INSERT INTO users (id, username, email, full_name, role, avatar_url, person_id, is_active) VALUES ('user-bendahara', 'bendahara', 'bendahara@wargahub.id', 'Hendra Wijaya', 'TREASURER', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', null, true);`;
  await sql`INSERT INTO users (id, username, email, full_name, role, avatar_url, person_id, is_active) VALUES ('user-warga-a17', 'warga_a17', 'budi.santoso@wargahub.id', 'Budi Santoso', 'HOUSEHOLD_HEAD', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', ${personBudi}, true);`;

  // 120 Properties
  const blockPrefixes = ['A', 'B', 'C', 'D'];
  const unpaidMockupList = new Set([
    'A-03', 'A-11', 'A-19', 'A-24', 'A-28',
    'B-07', 'B-14', 'B-21', 'B-29',
    'C-02', 'C-11', 'C-18', 'C-25', 'C-30',
    'D-05', 'D-12', 'D-19', 'D-26', 'D-30',
    'A-08', 'A-15', 'B-03', 'B-18', 'C-08', 'C-22', 'D-02', 'D-16',
    'B-09', 'C-05', 'D-09', 'A-22', 'B-25', 'C-15', 'D-22'
  ]);

  for (const b of blockPrefixes) {
    const blockId = `blk-${b.toLowerCase()}`;
    for (let num = 1; num <= 30; num++) {
      const codeStr = `${b}-${num.toString().padStart(2, '0')}`;
      const propId = `prop-${codeStr.toLowerCase()}`;
      const isA17 = codeStr === 'A-17';
      const isVacant = !isA17 && (num === 4 || num === 9 || num === 16 || num === 23 || (b === 'D' && (num === 7 || num === 27)));
      const status = isVacant ? 'VACANT' : (num % 5 === 0 ? 'RENTED' : 'OWNER_OCCUPIED');

      await sql`
        INSERT INTO properties (id, community_id, block_id, code, number, address, occupancy_status, is_active, notes)
        VALUES (${propId}, ${communityId}, ${blockId}, ${codeStr}, ${num.toString()}, ${'Jl. Melati Blok ' + b + ' No. ' + num}, ${status}, true, ${isVacant ? 'Rumah kosong' : null});
      `;

      if (isA17) {
        await sql`INSERT INTO property_ownerships (id, property_id, person_id, is_active, started_at) VALUES ('own-a17', ${propId}, ${personBudi}, true, '2020-01-01');`;
        await sql`INSERT INTO occupancies (id, property_id, household_id, type, is_active, started_at) VALUES ('occ-a17', ${propId}, ${householdBudi}, 'OWNER', true, '2020-01-01');`;
        await sql`INSERT INTO vehicles (id, property_id, owner_person_id, plate_number, type, brand, model, color, year, is_active) VALUES ('veh-1', ${propId}, ${personBudi}, 'B 1234 ABC', 'Mobil', 'Toyota', 'Avanza', 'Hitam Metalik', '2018', true);`;
        await sql`INSERT INTO vehicles (id, property_id, owner_person_id, plate_number, type, brand, model, color, year, is_active) VALUES ('veh-2', ${propId}, ${personBudi}, 'B 5678 DEF', 'Motor', 'Honda', 'Vario 160', 'Putih Mutiara', '2022', true);`;
        await sql`INSERT INTO user_property_access (id, user_id, property_id, relationship, can_view_billing, can_pay, can_edit_occupants, can_view_property, started_at) VALUES ('uacc-budi', 'user-ketua', ${propId}, 'OWNER', true, true, true, true, '2020-01-01');`;
        await sql`INSERT INTO user_property_access (id, user_id, property_id, relationship, can_view_billing, can_pay, can_edit_occupants, can_view_property, started_at) VALUES ('uacc-warga', 'user-warga-a17', ${propId}, 'OWNER', true, true, true, true, '2020-01-01');`;
      } else if (!isVacant) {
        const pId = `person-${codeStr.toLowerCase()}`;
        const hhId = `hh-${codeStr.toLowerCase()}`;
        const personName = `Warga ${codeStr}`;
        await sql`INSERT INTO persons (id, name, phone, email, is_active) VALUES (${pId}, ${personName}, '0812-0000-0000', ${codeStr.toLowerCase() + '@wargahub.id'}, true);`;
        await sql`INSERT INTO households (id, name) VALUES (${hhId}, ${'Keluarga ' + personName});`;
        await sql`INSERT INTO household_members (id, household_id, person_id, relationship, birth_date, is_active, started_at) VALUES (${'hm-' + codeStr.toLowerCase()}, ${hhId}, ${pId}, 'HEAD', '1988-01-01', true, '2021-01-01');`;
        await sql`INSERT INTO property_ownerships (id, property_id, person_id, is_active, started_at) VALUES (${'own-' + codeStr.toLowerCase()}, ${propId}, ${pId}, true, '2021-01-01');`;
        await sql`INSERT INTO occupancies (id, property_id, household_id, type, is_active, started_at) VALUES (${'occ-' + codeStr.toLowerCase()}, ${propId}, ${hhId}, ${status === 'RENTED' ? 'TENANT' : 'OWNER'}, true, '2021-01-01');`;
      }
    }
  }

  // August 2026 Invoices (86 Paid, 34 Unpaid)
  const augPeriod = 'period-2026-08';
  for (const b of blockPrefixes) {
    for (let num = 1; num <= 30; num++) {
      const codeStr = `${b}-${num.toString().padStart(2, '0')}`;
      const propId = `prop-${codeStr.toLowerCase()}`;
      const invId = `inv-${codeStr.toLowerCase()}-202608`;
      const isUnpaid = unpaidMockupList.has(codeStr);
      const isA17 = codeStr === 'A-17';

      if (isUnpaid) {
        await sql`
          INSERT INTO invoices (id, property_id, billing_period_id, invoice_number, status, subtotal, total, paid_amount, due_date, issued_at, paid_at, notes)
          VALUES (${invId}, ${propId}, ${augPeriod}, ${'INV-202608-' + codeStr.replace('-', '')}, 'UNPAID', 750000, 750000, 0, '2026-08-10', '2026-08-01', null, 'Belum lunas');
        `;
        await sql`INSERT INTO invoice_items (id, invoice_id, fee_type_id, description, amount) VALUES (${'item-' + invId}, ${invId}, 'fee-ipl', 'Iuran IPL', 750000);`;
      } else {
        const paidDate = isA17 ? '2026-08-20 10:21:00' : `2026-08-15 11:30:00`;
        await sql`
          INSERT INTO invoices (id, property_id, billing_period_id, invoice_number, status, subtotal, total, paid_amount, due_date, issued_at, paid_at, notes)
          VALUES (${invId}, ${propId}, ${augPeriod}, ${'INV-202608-' + codeStr.replace('-', '')}, 'PAID', 750000, 750000, 750000, '2026-08-10', '2026-08-01', ${paidDate}, 'Lunas');
        `;
        await sql`INSERT INTO invoice_items (id, invoice_id, fee_type_id, description, amount) VALUES (${'item-' + invId}, ${invId}, 'fee-ipl', 'Iuran IPL', 750000);`;
        const payId = `pay-${codeStr.toLowerCase()}-202608`;
        await sql`
          INSERT INTO payments (id, property_id, billing_period_id, invoice_id, amount, method, reference, proof_file_url, status, notes, paid_at, submitted_by, verified_by, verified_at)
          VALUES (${payId}, ${propId}, ${augPeriod}, ${invId}, 750000, 'TRANSFER', ${'TRX-BCA-' + codeStr}, '/uploads/proof.png', 'VERIFIED', ${'Iuran Rumah ' + codeStr}, ${paidDate}, null, 'user-bendahara', ${paidDate});
        `;
        await sql`INSERT INTO payment_allocations (id, payment_id, invoice_id, amount) VALUES (${'alloc-' + payId}, ${payId}, ${invId}, 750000);`;
        await sql`
          INSERT INTO ledger_entries (id, account_id, entry_date, direction, amount, source_type, source_id, description, created_by)
          VALUES (${'ledg-' + payId}, 'acc-main', '2026-08-15', 'IN', 750000, 'PAYMENT', ${payId}, ${'Iuran IPL Rumah ' + codeStr}, 'user-bendahara');
        `;
      }
    }
  }

  // Pending Payments (3)
  const pendingPayments = [
    { propCode: 'B-14', amount: 750000, date: '2026-08-28 09:15:00', ref: 'TRX-BCA-889102' },
    { propCode: 'C-18', amount: 750000, date: '2026-08-28 10:45:00', ref: 'TRX-MANDIRI-441209' },
    { propCode: 'D-12', amount: 750000, date: '2026-08-28 11:20:00', ref: 'TRX-QRIS-992183' },
  ];
  for (let idx = 0; idx < pendingPayments.length; idx++) {
    const p = pendingPayments[idx];
    const payId = `pay-pending-${idx + 1}`;
    const propId = `prop-${p.propCode.toLowerCase()}`;
    const invId = `inv-${p.propCode.toLowerCase()}-202608`;
    await sql`
      INSERT INTO payments (id, property_id, billing_period_id, invoice_id, amount, method, reference, proof_file_url, status, notes, paid_at, submitted_by, verified_by, verified_at)
      VALUES (${payId}, ${propId}, ${augPeriod}, ${invId}, ${p.amount}, 'TRANSFER', ${p.ref}, '/uploads/proof.png', 'PENDING', 'Menunggu verifikasi', ${p.date}, null, null, null);
    `;
  }

  // Expense Categories & Expenses
  await sql`INSERT INTO expense_categories (id, community_id, name, code, budget_percentage, icon) VALUES ('cat-keamanan', ${communityId}, 'Keamanan', 'KEAMANAN', 45, 'ShieldCheck');`;
  await sql`INSERT INTO expense_categories (id, community_id, name, code, budget_percentage, icon) VALUES ('cat-kebersihan', ${communityId}, 'Kebersihan', 'KEBERSIHAN', 25, 'Sparkles');`;
  await sql`INSERT INTO expense_categories (id, community_id, name, code, budget_percentage, icon) VALUES ('cat-listrik', ${communityId}, 'Listrik Fasum', 'LISTRIK', 20, 'Zap');`;
  await sql`INSERT INTO expense_categories (id, community_id, name, code, budget_percentage, icon) VALUES ('cat-pemeliharaan', ${communityId}, 'Pemeliharaan', 'PEMELIHARAAN', 10, 'Wrench');`;

  await sql`INSERT INTO expenses (id, community_id, category_id, account_id, title, description, amount, expense_date, recorded_by, approved_by, status) VALUES ('exp-1', ${communityId}, 'cat-keamanan', 'acc-main', 'Gaji & Operasional Satpam (4 Personil)', 'Gaji 4 personil satpam 24 jam', 17600000, '2026-08-25', 'user-bendahara', 'user-ketua', 'APPROVED');`;
  await sql`INSERT INTO expenses (id, community_id, category_id, account_id, title, description, amount, expense_date, recorded_by, approved_by, status) VALUES ('exp-2', ${communityId}, 'cat-kebersihan', 'acc-main', 'Petugas Kebersihan & Angkut Sampah', 'Honor 2 petugas dan retribusi sampah', 9787500, '2026-08-24', 'user-bendahara', 'user-ketua', 'APPROVED');`;
  await sql`INSERT INTO expenses (id, community_id, category_id, account_id, title, description, amount, expense_date, recorded_by, approved_by, status) VALUES ('exp-3', ${communityId}, 'cat-listrik', 'acc-main', 'Tagihan Listrik PJU & Pompa Air Fasum', 'PLN penerangan jalan umum', 7830000, '2026-08-18', 'user-bendahara', 'user-ketua', 'APPROVED');`;
  await sql`INSERT INTO expenses (id, community_id, category_id, account_id, title, description, amount, expense_date, recorded_by, approved_by, status) VALUES ('exp-4', ${communityId}, 'cat-pemeliharaan', 'acc-main', 'Perbaikan Lampu Jalan Blok C', 'Penggantian lampu LED PJU', 3932500, '2026-08-22', 'user-bendahara', 'user-ketua', 'APPROVED');`;

  // Monthly Snapshots (Image 1)
  await sql`
    INSERT INTO monthly_snapshots (
      id, billing_period_id, total_properties, paid_properties, unpaid_properties,
      opening_balance, income, expense, closing_balance, breakdown_json, unpaid_properties_list_json
    ) VALUES (
      'snap-2026-08', ${augPeriod}, 68, 59, 9, 18000000, 64500000, 39150000, 25350000,
      ${JSON.stringify([
        { name: 'Keamanan', percentage: 45, amount: 17600000, icon: 'ShieldCheck' },
        { name: 'Kebersihan', percentage: 25, amount: 9787500, icon: 'Sparkles' },
        { name: 'Listrik', percentage: 20, amount: 7830000, icon: 'Zap' },
        { name: 'Pemeliharaan', percentage: 10, amount: 3932500, icon: 'Wrench' },
      ])},
      ${JSON.stringify(['A-03', 'A-11', 'B-07', 'C-02', 'C-11', 'D-05'])}
    );
  `;

  // Announcements & Complaints
  await sql`INSERT INTO announcements (id, community_id, title, content, category, audience, scheduled_at, location, is_pinned, is_published, created_by) VALUES ('ann-1', ${communityId}, 'Kerja Bakti Lingkungan', 'Mengundang seluruh warga untuk hadir dalam kegiatan kerja bakti.', 'KEGIATAN', 'ALL', 'Minggu, 24 Agustus 2026 • 07:00 WIB', 'Lapangan Blok A', true, true, 'user-ketua');`;
  await sql`INSERT INTO announcements (id, community_id, title, content, category, audience, scheduled_at, location, is_pinned, is_published, created_by) VALUES ('ann-2', ${communityId}, 'Perbaikan Pompa Air', 'Akan dilakukan perbaikan pompa air utama komplek.', 'MAINTENANCE', 'ALL', 'Rabu, 27 Agustus 2026 • 09:00 WIB', 'Area Rumah Pompa', false, true, 'user-ketua');`;
  await sql`INSERT INTO announcements (id, community_id, title, content, category, audience, scheduled_at, location, is_pinned, is_published, created_by) VALUES ('ann-3', ${communityId}, 'Pembagian Tempat Sampah Baru', 'Setiap rumah tangga dapat mengambil 1 unit tempat sampah baru.', 'INFO', 'ALL', 'Mulai 1 September 2026', 'Setiap RT', false, true, 'user-ketua');`;

  await sql`INSERT INTO complaints (id, property_id, submitted_by_person_id, title, description, category, location, status, priority) VALUES ('comp-1', 'prop-c-07', ${personBudi}, 'Lampu jalan mati di Blok C', 'Lampu PJU di depan C-07 mati.', 'FASILITAS', 'Depan Blok C-07', 'REPORTED', 'HIGH');`;
  await sql`INSERT INTO complaints (id, property_id, submitted_by_person_id, title, description, category, location, status, priority) VALUES ('comp-2', 'prop-b-12', null, 'Saluran air tersumbat di dekat taman Blok B', 'Air meluap ke badan jalan.', 'KEBERSIHAN', 'Taman Blok B', 'ACKNOWLEDGED', 'MEDIUM');`;
  await sql`INSERT INTO complaints (id, property_id, submitted_by_person_id, title, description, category, location, status, priority) VALUES ('comp-3', 'prop-a-05', null, 'Pintu gerbang otomatis timur sering macet', 'Sensor remote sering macet.', 'FASILITAS', 'Gerbang Samping Timur', 'IN_PROGRESS', 'MEDIUM');`;
  await sql`INSERT INTO complaints (id, property_id, submitted_by_person_id, title, description, category, location, status, priority) VALUES ('comp-4', 'prop-d-15', null, 'Pohon rindang menghalangi kabel listrik di Blok D', 'Dahan pohon menyentuh kabel tiang listrik.', 'KETERTIBAN', 'Jalan Blok D No. 15', 'REPORTED', 'HIGH');`;

  // Facilities
  await sql`INSERT INTO facilities (id, community_id, name, code, category, location, condition) VALUES ('fac-1', ${communityId}, 'Pompa Air Utama', 'FAC-PUMP-01', 'UTILITAS', 'Rumah Pompa Blok A', 'NEEDS_REPAIR');`;
  await sql`INSERT INTO facilities (id, community_id, name, code, category, location, condition) VALUES ('fac-2', ${communityId}, 'Penerangan Jalan Umum (PJU) Blok C', 'FAC-PJU-03', 'FASILITAS_UMUM', 'Sepanjang Jalan Blok C', 'UNDER_MAINTENANCE');`;
  await sql`INSERT INTO facilities (id, community_id, name, code, category, location, condition) VALUES ('fac-3', ${communityId}, 'Balai Warga & Lapangan', 'FAC-HALL-01', 'FASILITAS_SOSIAL', 'Pusat Komplek', 'GOOD');`;
  await sql`INSERT INTO facilities (id, community_id, name, code, category, location, condition) VALUES ('fac-4', ${communityId}, 'Gerbang Utama & Pos Satpam', 'FAC-GATE-01', 'KEAMANAN', 'Pintu Masuk Utama', 'GOOD');`;

  console.log('Neon PostgreSQL database seeded successfully with 120 properties and full dataset!');
  await sql.end();
}

seedNeon().catch(err => {
  console.error('Neon seed error:', err);
  process.exit(1);
});
