import { initializeDatabase } from '../src/db/migrate';
import { createClient } from '@libsql/client';
import path from 'node:path';

async function main() {
  const dbPath = path.resolve(process.cwd(), 'data/wargahub.db');
  await initializeDatabase(dbPath);
  const client = createClient({
    url: `file:${dbPath.replace(/\\/g, '/')}`
  });

  console.log('Seeding WargaHub database (libsql)...');

  // Clean existing data
  await client.executeMultiple(`
    DELETE FROM audit_logs;
    DELETE FROM notifications;
    DELETE FROM complaint_updates;
    DELETE FROM complaints;
    DELETE FROM maintenance_requests;
    DELETE FROM facilities;
    DELETE FROM announcements;
    DELETE FROM documents;
    DELETE FROM decisions;
    DELETE FROM monthly_snapshots;
    DELETE FROM ledger_entries;
    DELETE FROM expenses;
    DELETE FROM budget_items;
    DELETE FROM budgets;
    DELETE FROM expense_categories;
    DELETE FROM payment_allocations;
    DELETE FROM payments;
    DELETE FROM invoice_items;
    DELETE FROM invoices;
    DELETE FROM billing_periods;
    DELETE FROM fee_rules;
    DELETE FROM fee_types;
    DELETE FROM user_property_access;
    DELETE FROM users;
    DELETE FROM vehicles;
    DELETE FROM occupancies;
    DELETE FROM property_ownerships;
    DELETE FROM household_members;
    DELETE FROM households;
    DELETE FROM persons;
    DELETE FROM properties;
    DELETE FROM blocks;
    DELETE FROM accounts;
    DELETE FROM settings;
    DELETE FROM communities;
  `);

  const communityId = 'comm-01';
  await client.execute({
    sql: `INSERT INTO communities (id, name, code, address, city, postal_code, settings_json) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      communityId,
      'Komplek Taman Sejahtera',
      'TAMAN_SEJAHTERA',
      'Jl. Melati Raya No. 1, RT 02 / RW 05',
      'Jakarta Selatan',
      '12340',
      JSON.stringify({ transparency_mode: 'HOUSE_NUMBER', monthly_fee: 750000 })
    ]
  });

  // Settings
  const settings = [
    ['set-1', communityId, 'community_name', 'Komplek Taman Sejahtera', 'Nama resmi komplek'],
    ['set-2', communityId, 'transparency_mode', 'HOUSE_NUMBER', 'Mode tampilan transparansi publik'],
    ['set-3', communityId, 'monthly_fee_amount', '750000', 'Nominal iuran bulanan per rumah'],
    ['set-4', communityId, 'due_day_of_month', '10', 'Tanggal jatuh tempo iuran'],
  ];
  for (const s of settings) {
    await client.execute({ sql: 'INSERT INTO settings (id, community_id, key, value, description) VALUES (?, ?, ?, ?, ?)', args: s });
  }

  // Accounts
  await client.execute({
    sql: 'INSERT INTO accounts (id, community_id, code, name, type, account_number, bank_name, balance, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    args: ['acc-main', communityId, 'BCA-UTAMA', 'Rekening Operasional Komplek', 'BANK', '542-019-8821', 'Bank Central Asia (BCA)', 128450000, 1]
  });
  await client.execute({
    sql: 'INSERT INTO accounts (id, community_id, code, name, type, account_number, bank_name, balance, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    args: ['acc-petty', communityId, 'KAS-KECIL', 'Kas Tunai / Petty Cash Satpam & Pengurus', 'CASH', '-', 'Tunai', 5000000, 1]
  });

  // Blocks
  const blocks = [
    { id: 'blk-a', name: 'Blok A', code: 'A' },
    { id: 'blk-b', name: 'Blok B', code: 'B' },
    { id: 'blk-c', name: 'Blok C', code: 'C' },
    { id: 'blk-d', name: 'Blok D', code: 'D' },
  ];
  for (const b of blocks) {
    await client.execute({ sql: 'INSERT INTO blocks (id, community_id, name, code) VALUES (?, ?, ?, ?)', args: [b.id, communityId, b.name, b.code] });
  }

  // Fee Types & Rules
  await client.execute({
    sql: 'INSERT INTO fee_types (id, community_id, code, name, description, default_amount, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
    args: ['fee-ipl', communityId, 'IPL', 'Iuran Pengelolaan Lingkungan (IPL)', 'Iuran wajib bulanan untuk keamanan, kebersihan, listrik fasum, dan pemeliharaan', 750000, 1]
  });
  await client.execute({
    sql: 'INSERT INTO fee_rules (id, fee_type_id, amount, frequency, due_day, effective_from, scope, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    args: ['rule-ipl', 'fee-ipl', 750000, 'MONTHLY', 10, '2026-01-01', 'ALL', 1]
  });

  // Billing Periods
  const periods = [
    { id: 'period-2026-05', year: 2026, month: 5, name: 'Mei 2026', due_date: '2026-05-10', status: 'CLOSED' },
    { id: 'period-2026-06', year: 2026, month: 6, name: 'Juni 2026', due_date: '2026-06-10', status: 'CLOSED' },
    { id: 'period-2026-07', year: 2026, month: 7, name: 'Juli 2026', due_date: '2026-07-10', status: 'CLOSED' },
    { id: 'period-2026-08', year: 2026, month: 8, name: 'Agustus 2026', due_date: '2026-08-10', status: 'OPEN' },
  ];
  for (const p of periods) {
    await client.execute({ sql: 'INSERT INTO billing_periods (id, community_id, year, month, name, due_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)', args: [p.id, communityId, p.year, p.month, p.name, p.due_date, p.status] });
  }

  // Persons & Households
  const personBudi = 'person-budi';
  await client.execute({ sql: 'INSERT INTO persons (id, name, phone, email, is_active) VALUES (?, ?, ?, ?, ?)', args: [personBudi, 'Budi Santoso', '0812-3456-7890', 'budi.santoso@wargahub.id', 1] });
  await client.execute({ sql: 'INSERT INTO persons (id, name, phone, email, is_active) VALUES (?, ?, ?, ?, ?)', args: ['person-siti', 'Siti Lestari', '0812-9876-5432', 'siti.lestari@gmail.com', 1] });
  await client.execute({ sql: 'INSERT INTO persons (id, name, phone, email, is_active) VALUES (?, ?, ?, ?, ?)', args: ['person-alya', 'Alya Santoso', '', '', 1] });
  await client.execute({ sql: 'INSERT INTO persons (id, name, phone, email, is_active) VALUES (?, ?, ?, ?, ?)', args: ['person-daffa', 'Daffa Santoso', '', '', 1] });

  const householdBudi = 'hh-a17';
  await client.execute({ sql: 'INSERT INTO households (id, name) VALUES (?, ?)', args: [householdBudi, 'Keluarga Budi Santoso'] });
  await client.execute({ sql: 'INSERT INTO household_members (id, household_id, person_id, relationship, birth_date, is_active, started_at) VALUES (?, ?, ?, ?, ?, ?, ?)', args: ['hm-budi', householdBudi, personBudi, 'HEAD', '1985-03-12', 1, '2020-01-01'] });
  await client.execute({ sql: 'INSERT INTO household_members (id, household_id, person_id, relationship, birth_date, is_active, started_at) VALUES (?, ?, ?, ?, ?, ?, ?)', args: ['hm-siti', householdBudi, 'person-siti', 'SPOUSE', '1987-07-25', 1, '2020-01-01'] });
  await client.execute({ sql: 'INSERT INTO household_members (id, household_id, person_id, relationship, birth_date, is_active, started_at) VALUES (?, ?, ?, ?, ?, ?, ?)', args: ['hm-alya', householdBudi, 'person-alya', 'CHILD', '2013-05-14', 1, '2020-01-01'] });
  await client.execute({ sql: 'INSERT INTO household_members (id, household_id, person_id, relationship, birth_date, is_active, started_at) VALUES (?, ?, ?, ?, ?, ?, ?)', args: ['hm-daffa', householdBudi, 'person-daffa', 'CHILD', '2017-09-03', 1, '2020-01-01'] });

  // Users
  await client.execute({ sql: 'INSERT INTO users (id, username, email, full_name, role, avatar_url, person_id, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', args: ['user-ketua', 'ketua', 'ketua@wargahub.id', 'Budi Santoso', 'CHAIRMAN', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', personBudi, 1] });
  await client.execute({ sql: 'INSERT INTO users (id, username, email, full_name, role, avatar_url, person_id, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', args: ['user-bendahara', 'bendahara', 'bendahara@wargahub.id', 'Hendra Wijaya', 'TREASURER', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', null, 1] });
  await client.execute({ sql: 'INSERT INTO users (id, username, email, full_name, role, avatar_url, person_id, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', args: ['user-warga-a17', 'warga_a17', 'budi.santoso@wargahub.id', 'Budi Santoso', 'HOUSEHOLD_HEAD', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', personBudi, 1] });

  // Generate 120 properties
  const blockPrefixes = ['A', 'B', 'C', 'D'];
  const unpaidMockupList = new Set([
    'A-03', 'A-11', 'A-19', 'A-24', 'A-28',
    'B-07', 'B-14', 'B-21', 'B-29',
    'C-02', 'C-11', 'C-18', 'C-25', 'C-30',
    'D-05', 'D-12', 'D-19', 'D-26', 'D-30',
    'A-08', 'A-15', 'B-03', 'B-18', 'C-08', 'C-22', 'D-02', 'D-16',
    'B-09', 'C-05', 'D-09', 'A-22', 'B-25', 'C-15', 'D-22'
  ]);

  let propIndex = 0;
  let occupiedCount = 0;
  let vacantCount = 0;

  for (const b of blockPrefixes) {
    const blockId = `blk-${b.toLowerCase()}`;
    for (let num = 1; num <= 30; num++) {
      propIndex++;
      const codeStr = `${b}-${num.toString().padStart(2, '0')}`;
      const propId = `prop-${codeStr.toLowerCase()}`;
      const isA17 = codeStr === 'A-17';
      const isVacant = !isA17 && (num === 4 || num === 9 || num === 16 || num === 23 || (b === 'D' && (num === 7 || num === 27)));
      const status = isVacant ? 'VACANT' : (num % 5 === 0 ? 'RENTED' : 'OWNER_OCCUPIED');

      if (isVacant) vacantCount++; else occupiedCount++;

      await client.execute({
        sql: 'INSERT INTO properties (id, community_id, block_id, code, number, address, occupancy_status, is_active, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        args: [propId, communityId, blockId, codeStr, num.toString(), `Jl. Melati Blok ${b} No. ${num}, Komplek Taman Sejahtera`, status, 1, isVacant ? 'Rumah kosong / pemilik di luar kota' : null]
      });

      if (isA17) {
        await client.execute({ sql: 'INSERT INTO property_ownerships (id, property_id, person_id, is_active, started_at) VALUES (?, ?, ?, ?, ?)', args: ['own-a17', propId, personBudi, 1, '2020-01-01'] });
        await client.execute({ sql: 'INSERT INTO occupancies (id, property_id, household_id, type, is_active, started_at) VALUES (?, ?, ?, ?, ?, ?)', args: ['occ-a17', propId, householdBudi, 'OWNER', 1, '2020-01-01'] });
        await client.execute({ sql: 'INSERT INTO vehicles (id, property_id, owner_person_id, plate_number, type, brand, model, color, year, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', args: ['veh-1', propId, personBudi, 'B 1234 ABC', 'Mobil', 'Toyota', 'Avanza', 'Hitam Metalik', '2018', 1] });
        await client.execute({ sql: 'INSERT INTO vehicles (id, property_id, owner_person_id, plate_number, type, brand, model, color, year, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', args: ['veh-2', propId, personBudi, 'B 5678 DEF', 'Motor', 'Honda', 'Vario 160', 'Putih Mutiara', '2022', 1] });
        await client.execute({ sql: 'INSERT INTO user_property_access (id, user_id, property_id, relationship, can_view_billing, can_pay, can_edit_occupants, can_view_property, started_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', args: ['uacc-budi', 'user-ketua', propId, 'OWNER', 1, 1, 1, 1, '2020-01-01'] });
        await client.execute({ sql: 'INSERT INTO user_property_access (id, user_id, property_id, relationship, can_view_billing, can_pay, can_edit_occupants, can_view_property, started_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', args: ['uacc-warga', 'user-warga-a17', propId, 'OWNER', 1, 1, 1, 1, '2020-01-01'] });
      } else if (!isVacant) {
        const pId = `person-${codeStr.toLowerCase()}`;
        const hhId = `hh-${codeStr.toLowerCase()}`;
        const sampleNames = ['Ahmad Fauzi', 'Rudi Hartono', 'Bambang Susilo', 'Dewi Sartika', 'Eko Prasetyo', 'Fajar Nugraha', 'Gita Gutawa', 'Haryanto', 'Iwan Fals', 'Joko Widodo', 'Kartika Putri', 'Lukman Hakim', 'Mega Utami', 'Nurul Hidayah', 'Oki Setiana', 'Putra Siregar', 'Qori Sandioriva', 'Rian D Masiv', 'Suryadi', 'Taufik Hidayat'];
        const personName = sampleNames[(num + b.charCodeAt(0)) % sampleNames.length] + ` (${codeStr})`;

        await client.execute({ sql: 'INSERT INTO persons (id, name, phone, email, is_active) VALUES (?, ?, ?, ?, ?)', args: [pId, personName, `0812-${Math.floor(1000 + Math.random()*9000)}-${Math.floor(1000 + Math.random()*9000)}`, `${codeStr.toLowerCase()}@wargahub.id`, 1] });
        await client.execute({ sql: 'INSERT INTO households (id, name) VALUES (?, ?)', args: [hhId, `Keluarga ${personName}`] });
        await client.execute({ sql: 'INSERT INTO household_members (id, household_id, person_id, relationship, birth_date, is_active, started_at) VALUES (?, ?, ?, ?, ?, ?, ?)', args: [`hm-${codeStr.toLowerCase()}`, hhId, pId, 'HEAD', '1988-01-01', 1, '2021-01-01'] });
        await client.execute({ sql: 'INSERT INTO property_ownerships (id, property_id, person_id, is_active, started_at) VALUES (?, ?, ?, ?, ?)', args: [`own-${codeStr.toLowerCase()}`, propId, pId, 1, '2021-01-01'] });
        await client.execute({ sql: 'INSERT INTO occupancies (id, property_id, household_id, type, is_active, started_at) VALUES (?, ?, ?, ?, ?, ?)', args: [`occ-${codeStr.toLowerCase()}`, propId, hhId, status === 'RENTED' ? 'TENANT' : 'OWNER', 1, '2021-01-01'] });

        if (num % 3 === 0) {
          await client.execute({ sql: 'INSERT INTO vehicles (id, property_id, owner_person_id, plate_number, type, brand, model, color, year, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', args: [`veh-${codeStr.toLowerCase()}`, propId, pId, `B ${1000 + num * 37} ${b}${b}`, 'Mobil', 'Honda', 'HR-V', 'Abu-abu', '2021', 1] });
        }
      }
    }
  }

  // Past periods for A-17
  const pastPeriods = ['period-2026-05', 'period-2026-06', 'period-2026-07'];
  const pastDates = [
    { issued: '2026-05-01', paid: '2026-05-20 09:47:00' },
    { issued: '2026-06-01', paid: '2026-06-20 10:02:00' },
    { issued: '2026-07-01', paid: '2026-07-18 09:14:00' },
  ];

  for (let idx = 0; idx < pastPeriods.length; idx++) {
    const pId = pastPeriods[idx];
    const invId = `inv-a17-${pId}`;
    await client.execute({
      sql: 'INSERT INTO invoices (id, property_id, billing_period_id, invoice_number, status, subtotal, total, paid_amount, due_date, issued_at, paid_at, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      args: [invId, 'prop-a-17', pId, `INV-20260${5 + idx}-A17`, 'PAID', 750000, 750000, 750000, `2026-0${5 + idx}-10`, pastDates[idx].issued, pastDates[idx].paid, 'Iuran bulanan']
    });
    await client.execute({
      sql: 'INSERT INTO invoice_items (id, invoice_id, fee_type_id, description, amount) VALUES (?, ?, ?, ?, ?)',
      args: [`item-${invId}`, invId, 'fee-ipl', 'Iuran Pengelolaan Lingkungan (IPL)', 750000]
    });
    const payId = `pay-a17-${pId}`;
    await client.execute({
      sql: 'INSERT INTO payments (id, property_id, billing_period_id, invoice_id, amount, method, reference, proof_file_url, status, notes, paid_at, submitted_by, verified_by, verified_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      args: [payId, 'prop-a-17', pId, invId, 750000, 'TRANSFER', `TRX-BCA-${pId}-A17`, '/uploads/proof-sample.png', 'VERIFIED', 'Transfer via BCA Mobile', pastDates[idx].paid, 'user-warga-a17', 'user-bendahara', pastDates[idx].paid]
    });
    await client.execute({
      sql: 'INSERT INTO payment_allocations (id, payment_id, invoice_id, amount) VALUES (?, ?, ?, ?)',
      args: [`alloc-${payId}`, payId, invId, 750000]
    });
    await client.execute({
      sql: 'INSERT INTO ledger_entries (id, account_id, entry_date, direction, amount, source_type, source_id, description, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      args: [`ledg-${payId}`, 'acc-main', pastDates[idx].issued.substring(0, 7) + '-20', 'IN', 750000, 'PAYMENT', payId, 'Iuran IPL Rumah A-17', 'user-bendahara']
    });
  }

  // August 2026 Invoices
  const augPeriod = 'period-2026-08';
  for (const b of blockPrefixes) {
    for (let num = 1; num <= 30; num++) {
      const codeStr = `${b}-${num.toString().padStart(2, '0')}`;
      const propId = `prop-${codeStr.toLowerCase()}`;
      const invId = `inv-${codeStr.toLowerCase()}-202608`;
      const isUnpaid = unpaidMockupList.has(codeStr);
      const isA17 = codeStr === 'A-17';

      if (isUnpaid) {
        await client.execute({
          sql: 'INSERT INTO invoices (id, property_id, billing_period_id, invoice_number, status, subtotal, total, paid_amount, due_date, issued_at, paid_at, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          args: [invId, propId, augPeriod, `INV-202608-${codeStr.replace('-', '')}`, 'UNPAID', 750000, 750000, 0, '2026-08-10', '2026-08-01', null, 'Belum lunas']
        });
        await client.execute({
          sql: 'INSERT INTO invoice_items (id, invoice_id, fee_type_id, description, amount) VALUES (?, ?, ?, ?, ?)',
          args: [`item-${invId}`, invId, 'fee-ipl', 'Iuran Pengelolaan Lingkungan (IPL)', 750000]
        });
      } else {
        const paidDate = isA17 ? '2026-08-20 10:21:00' : `2026-08-${(5 + (num % 15)).toString().padStart(2, '0')} 11:30:00`;
        await client.execute({
          sql: 'INSERT INTO invoices (id, property_id, billing_period_id, invoice_number, status, subtotal, total, paid_amount, due_date, issued_at, paid_at, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          args: [invId, propId, augPeriod, `INV-202608-${codeStr.replace('-', '')}`, 'PAID', 750000, 750000, 750000, '2026-08-10', '2026-08-01', paidDate, 'Lunas']
        });
        await client.execute({
          sql: 'INSERT INTO invoice_items (id, invoice_id, fee_type_id, description, amount) VALUES (?, ?, ?, ?, ?)',
          args: [`item-${invId}`, invId, 'fee-ipl', 'Iuran Pengelolaan Lingkungan (IPL)', 750000]
        });
        const payId = `pay-${codeStr.toLowerCase()}-202608`;
        await client.execute({
          sql: 'INSERT INTO payments (id, property_id, billing_period_id, invoice_id, amount, method, reference, proof_file_url, status, notes, paid_at, submitted_by, verified_by, verified_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          args: [payId, propId, augPeriod, invId, 750000, 'TRANSFER', `TRX-BCA-202608-${codeStr}`, '/uploads/proof-sample.png', 'VERIFIED', `Pembayaran iuran dari Rumah ${codeStr}`, paidDate, null, 'user-bendahara', paidDate]
        });
        await client.execute({
          sql: 'INSERT INTO payment_allocations (id, payment_id, invoice_id, amount) VALUES (?, ?, ?, ?)',
          args: [`alloc-${payId}`, payId, invId, 750000]
        });
        await client.execute({
          sql: 'INSERT INTO ledger_entries (id, account_id, entry_date, direction, amount, source_type, source_id, description, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          args: [`ledg-${payId}`, 'acc-main', '2026-08-15', 'IN', 750000, 'PAYMENT', payId, `Iuran IPL Rumah ${codeStr}`, 'user-bendahara']
        });
      }
    }
  }

  // Pending Payments
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
    await client.execute({
      sql: 'INSERT INTO payments (id, property_id, billing_period_id, invoice_id, amount, method, reference, proof_file_url, status, notes, paid_at, submitted_by, verified_by, verified_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      args: [payId, propId, augPeriod, invId, p.amount, 'TRANSFER', p.ref, '/uploads/proof-sample.png', 'PENDING', `Pembayaran iuran dari Rumah ${p.propCode} menunggu verifikasi`, p.date, null, null, null]
    });
  }

  // Expense Categories
  await client.execute({ sql: 'INSERT INTO expense_categories (id, community_id, name, code, budget_percentage, icon) VALUES (?, ?, ?, ?, ?, ?)', args: ['cat-keamanan', communityId, 'Keamanan', 'KEAMANAN', 45, 'ShieldCheck'] });
  await client.execute({ sql: 'INSERT INTO expense_categories (id, community_id, name, code, budget_percentage, icon) VALUES (?, ?, ?, ?, ?, ?)', args: ['cat-kebersihan', communityId, 'Kebersihan', 'KEBERSIHAN', 25, 'Sparkles'] });
  await client.execute({ sql: 'INSERT INTO expense_categories (id, community_id, name, code, budget_percentage, icon) VALUES (?, ?, ?, ?, ?, ?)', args: ['cat-listrik', communityId, 'Listrik Fasum', 'LISTRIK', 20, 'Zap'] });
  await client.execute({ sql: 'INSERT INTO expense_categories (id, community_id, name, code, budget_percentage, icon) VALUES (?, ?, ?, ?, ?, ?)', args: ['cat-pemeliharaan', communityId, 'Pemeliharaan', 'PEMELIHARAAN', 10, 'Wrench'] });

  // Expenses for August 2026
  await client.execute({
    sql: 'INSERT INTO expenses (id, community_id, category_id, account_id, title, description, amount, expense_date, recorded_by, approved_by, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    args: ['exp-1', communityId, 'cat-keamanan', 'acc-main', 'Gaji & Operasional Satpam (4 Personil)', 'Gaji 4 personil satpam 24 jam shift bergilir bulan Agustus 2026', 17600000, '2026-08-25', 'user-bendahara', 'user-ketua', 'APPROVED']
  });
  await client.execute({
    sql: 'INSERT INTO ledger_entries (id, account_id, entry_date, direction, amount, source_type, source_id, description, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    args: ['ledg-exp-1', 'acc-main', '2026-08-25', 'OUT', 17600000, 'EXPENSE', 'exp-1', 'Biaya Keamanan Satpam Agustus 2026', 'user-bendahara']
  });

  await client.execute({
    sql: 'INSERT INTO expenses (id, community_id, category_id, account_id, title, description, amount, expense_date, recorded_by, approved_by, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    args: ['exp-2', communityId, 'cat-kebersihan', 'acc-main', 'Petugas Kebersihan & Angkut Sampah', 'Honor 2 petugas kebersihan dan retribusi truk sampah keliling', 9787500, '2026-08-24', 'user-bendahara', 'user-ketua', 'APPROVED']
  });
  await client.execute({
    sql: 'INSERT INTO ledger_entries (id, account_id, entry_date, direction, amount, source_type, source_id, description, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    args: ['ledg-exp-2', 'acc-main', '2026-08-24', 'OUT', 9787500, 'EXPENSE', 'exp-2', 'Biaya Kebersihan & Sampah Agustus 2026', 'user-bendahara']
  });

  await client.execute({
    sql: 'INSERT INTO expenses (id, community_id, category_id, account_id, title, description, amount, expense_date, recorded_by, approved_by, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    args: ['exp-3', communityId, 'cat-listrik', 'acc-main', 'Tagihan Listrik PJU & Pompa Air Fasum', 'Pembayaran listrik PLN penerangan jalan umum dan gardu pompa', 7830000, '2026-08-18', 'user-bendahara', 'user-ketua', 'APPROVED']
  });
  await client.execute({
    sql: 'INSERT INTO ledger_entries (id, account_id, entry_date, direction, amount, source_type, source_id, description, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    args: ['ledg-exp-3', 'acc-main', '2026-08-18', 'OUT', 7830000, 'EXPENSE', 'exp-3', 'Tagihan Listrik PLN Fasum Agustus 2026', 'user-bendahara']
  });

  await client.execute({
    sql: 'INSERT INTO expenses (id, community_id, category_id, account_id, title, description, amount, expense_date, recorded_by, approved_by, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    args: ['exp-4', communityId, 'cat-pemeliharaan', 'acc-main', 'Perbaikan Lampu Jalan Blok C & Mesin Rumput', 'Penggantian 5 unit lampu LED PJU dan service mesin pemotong rumput', 3932500, '2026-08-22', 'user-bendahara', 'user-ketua', 'APPROVED']
  });
  await client.execute({
    sql: 'INSERT INTO ledger_entries (id, account_id, entry_date, direction, amount, source_type, source_id, description, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    args: ['ledg-exp-4', 'acc-main', '2026-08-22', 'OUT', 3932500, 'EXPENSE', 'exp-4', 'Pemeliharaan Sarana Agustus 2026', 'user-bendahara']
  });

  // Budgets
  await client.execute({
    sql: 'INSERT INTO budgets (id, community_id, year, name, total_amount) VALUES (?, ?, ?, ?, ?)',
    args: ['budg-2026', communityId, 2026, 'Anggaran Tahunan Komplek 2026', 1080000000]
  });
  await client.execute({
    sql: 'INSERT INTO budget_items (id, budget_id, category_id, name, monthly_budget) VALUES (?, ?, ?, ?, ?)',
    args: ['bitem-keamanan', 'budg-2026', 'cat-keamanan', 'Keamanan', 18000000]
  });
  await client.execute({
    sql: 'INSERT INTO budget_items (id, budget_id, category_id, name, monthly_budget) VALUES (?, ?, ?, ?, ?)',
    args: ['bitem-kebersihan', 'budg-2026', 'cat-kebersihan', 'Kebersihan', 10000000]
  });
  await client.execute({
    sql: 'INSERT INTO budget_items (id, budget_id, category_id, name, monthly_budget) VALUES (?, ?, ?, ?, ?)',
    args: ['bitem-listrik', 'budg-2026', 'cat-listrik', 'Listrik Fasum', 8000000]
  });
  await client.execute({
    sql: 'INSERT INTO budget_items (id, budget_id, category_id, name, monthly_budget) VALUES (?, ?, ?, ?, ?)',
    args: ['bitem-pemeliharaan', 'budg-2026', 'cat-pemeliharaan', 'Pemeliharaan Fasilitas', 20000000]
  });

  // Monthly Snapshots (matching Image 1)
  await client.execute({
    sql: `INSERT INTO monthly_snapshots (
      id, billing_period_id, total_properties, paid_properties, unpaid_properties,
      opening_balance, income, expense, closing_balance, breakdown_json, unpaid_properties_list_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      'snap-2026-08',
      augPeriod,
      68,
      59,
      9,
      18000000,
      64500000,
      39150000,
      25350000,
      JSON.stringify([
        { name: 'Keamanan', percentage: 45, amount: 17600000, icon: 'ShieldCheck' },
        { name: 'Kebersihan', percentage: 25, amount: 9787500, icon: 'Sparkles' },
        { name: 'Listrik', percentage: 20, amount: 7830000, icon: 'Zap' },
        { name: 'Pemeliharaan', percentage: 10, amount: 3932500, icon: 'Wrench' },
      ]),
      JSON.stringify(['A-03', 'A-11', 'B-07', 'C-02', 'C-11', 'D-05'])
    ]
  });

  // Announcements
  await client.execute({
    sql: 'INSERT INTO announcements (id, community_id, title, content, category, audience, scheduled_at, location, is_pinned, is_published, published_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    args: ['ann-1', communityId, 'Kerja Bakti Lingkungan', 'Mengundang seluruh warga Komplek Taman Sejahtera untuk hadir dalam kegiatan kerja bakti pembersihan saluran air dan taman bersama.', 'KEGIATAN', 'ALL', 'Minggu, 24 Agustus 2026 • 07:00 WIB', 'Lapangan Blok A', 1, 1, '2026-08-20 08:00:00', 'user-ketua']
  });
  await client.execute({
    sql: 'INSERT INTO announcements (id, community_id, title, content, category, audience, scheduled_at, location, is_pinned, is_published, published_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    args: ['ann-2', communityId, 'Perbaikan Pompa Air', 'Akan dilakukan perbaikan dan pengurasan tandon pompa air utama komplek.', 'MAINTENANCE', 'ALL', 'Rabu, 27 Agustus 2026 • 09:00 WIB', 'Area Rumah Pompa', 0, 1, '2026-08-22 14:00:00', 'user-ketua']
  });
  await client.execute({
    sql: 'INSERT INTO announcements (id, community_id, title, content, category, audience, scheduled_at, location, is_pinned, is_published, published_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    args: ['ann-3', communityId, 'Pembagian Tempat Sampah Baru', 'Setiap rumah tangga yang telah lunas iuran dapat mengambil 1 unit tempat sampah pilah baru.', 'INFO', 'ALL', 'Mulai 1 September 2026', 'Setiap RT / Pos Satpam', 0, 1, '2026-08-23 10:00:00', 'user-ketua']
  });
  await client.execute({
    sql: 'INSERT INTO announcements (id, community_id, title, content, category, audience, scheduled_at, location, is_pinned, is_published, published_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    args: ['ann-4', communityId, 'Rapat Warga Bulanan', 'Agenda evaluasi program kerja semester 2 dan pembahasan rencana perbaikan pos keamanan gerbang timur.', 'KEGIATAN', 'ALL', 'Selasa, 25 Agustus 2026 • 19:30 WIB', 'Balai Warga RW 05', 0, 1, '2026-08-24 10:22:00', 'user-ketua']
  });

  // Complaints
  await client.execute({
    sql: 'INSERT INTO complaints (id, property_id, submitted_by_person_id, title, description, category, location, status, priority, resolution_notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    args: ['comp-1', 'prop-c-07', personBudi, 'Lampu jalan mati di Blok C', 'Lampu PJU di depan rumah C-07 dan C-08 mati sejak kemarin malam, jalanan cukup gelap.', 'FASILITAS', 'Depan Blok C-07', 'REPORTED', 'HIGH', null]
  });
  await client.execute({
    sql: 'INSERT INTO complaints (id, property_id, submitted_by_person_id, title, description, category, location, status, priority, resolution_notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    args: ['comp-2', 'prop-b-12', null, 'Saluran air tersumbat di dekat taman Blok B', 'Air meluap ke badan jalan saat hujan deras.', 'KEBERSIHAN', 'Taman Blok B', 'ACKNOWLEDGED', 'MEDIUM', 'Sudah dijadwalkan dibersihkan oleh petugas']
  });
  await client.execute({
    sql: 'INSERT INTO complaints (id, property_id, submitted_by_person_id, title, description, category, location, status, priority, resolution_notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    args: ['comp-3', 'prop-a-05', null, 'Pintu gerbang otomatis timur sering macet', 'Sensor remote gerbang samping sering tidak merespons kartu akses.', 'FASILITAS', 'Gerbang Samping Timur', 'IN_PROGRESS', 'MEDIUM', 'Teknisi sedang melakukan pengecekan motor penggerak']
  });
  await client.execute({
    sql: 'INSERT INTO complaints (id, property_id, submitted_by_person_id, title, description, category, location, status, priority, resolution_notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    args: ['comp-4', 'prop-d-15', null, 'Pohon rindang menghalangi kabel listrik di Blok D', 'Dahan pohon mangga sudah menyentuh kabel tiang PLN.', 'KETERTIBAN', 'Jalan Blok D No. 15', 'REPORTED', 'HIGH', null]
  });

  // Facilities
  await client.execute({
    sql: 'INSERT INTO facilities (id, community_id, name, code, category, location, condition, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    args: ['fac-1', communityId, 'Pompa Air Utama', 'FAC-PUMP-01', 'UTILITAS', 'Rumah Pompa Blok A', 'NEEDS_REPAIR', 'Tekanan debit air menurun, perlu servis impeller']
  });
  await client.execute({
    sql: 'INSERT INTO facilities (id, community_id, name, code, category, location, condition, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    args: ['fac-2', communityId, 'Penerangan Jalan Umum (PJU) Blok C', 'FAC-PJU-03', 'FASILITAS_UMUM', 'Sepanjang Jalan Blok C', 'UNDER_MAINTENANCE', '5 titik lampu sedang dalam pergantian']
  });
  await client.execute({
    sql: 'INSERT INTO facilities (id, community_id, name, code, category, location, condition, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    args: ['fac-3', communityId, 'Balai Warga & Lapangan', 'FAC-HALL-01', 'FASILITAS_SOSIAL', 'Pusat Komplek', 'GOOD', 'Kondisi terawat baik']
  });
  await client.execute({
    sql: 'INSERT INTO facilities (id, community_id, name, code, category, location, condition, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    args: ['fac-4', communityId, 'Gerbang Utama & Pos Satpam', 'FAC-GATE-01', 'KEAMANAN', 'Pintu Masuk Utama', 'GOOD', 'CCTV dan portal berjalan normal']
  });

  // Maintenance Requests
  await client.execute({
    sql: 'INSERT INTO maintenance_requests (id, facility_id, title, description, cost_estimate, actual_cost, status, scheduled_date, performed_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    args: ['maint-1', 'fac-1', 'Overhaul Motor Pompa Air Utama', 'Penggantian seal dan bearing dinamo pompa air fasum', 2500000, 2350000, 'IN_PROGRESS', '2026-08-27', 'Bengkel Dinamo Sejahtera']
  });
  await client.execute({
    sql: 'INSERT INTO maintenance_requests (id, facility_id, title, description, cost_estimate, actual_cost, status, scheduled_date, performed_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    args: ['maint-2', 'fac-2', 'Penggantian Lampu LED PJU Blok C', 'Peremajaan lampu jalan hemat energi 50W', 1500000, 1500000, 'COMPLETED', '2026-08-22', 'Petugas Sarana Komplek']
  });

  // Documents
  await client.execute({
    sql: 'INSERT INTO documents (id, community_id, title, category, file_url, file_size, visibility, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    args: ['doc-1', communityId, 'Tata Tertib & Anggaran Dasar Warga 2026', 'TATA_TERTIB', '/documents/tata-tertib-2026.pdf', '1.2 MB', 'PUBLIC', 'user-ketua']
  });
  await client.execute({
    sql: 'INSERT INTO documents (id, community_id, title, category, file_url, file_size, visibility, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    args: ['doc-2', communityId, 'Laporan Keuangan Semester 1 2026 (Audited)', 'LAPORAN_KEUANGAN', '/documents/laporan-keuangan-sem1.pdf', '3.4 MB', 'RESIDENT', 'user-bendahara']
  });

  // Audit Logs
  await client.execute({
    sql: 'INSERT INTO audit_logs (id, actor_user_id, actor_name, action, entity_type, entity_id, old_value_json, new_value_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    args: ['aud-1', 'user-bendahara', 'Hendra Wijaya', 'payment.verify', 'PAYMENT', 'pay-b12-202608', JSON.stringify({ status: 'PENDING' }), JSON.stringify({ status: 'VERIFIED', amount: 750000 }), '2026-08-28 09:15:00']
  });
  await client.execute({
    sql: 'INSERT INTO audit_logs (id, actor_user_id, actor_name, action, entity_type, entity_id, old_value_json, new_value_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    args: ['aud-2', 'user-bendahara', 'Hendra Wijaya', 'expense.record', 'EXPENSE', 'exp-4', null, JSON.stringify({ title: 'Perbaikan Lampu Jalan Blok C', amount: 2350000 }), '2026-08-27 16:40:00']
  });

  console.log('Seed executed successfully with 120 properties, financial records, and snapshots!');
}

main().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
