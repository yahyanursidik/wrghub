import postgres from 'postgres';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_O4jVKCzUWex8@ep-damp-queen-azh98l8v-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
const sql = postgres(connectionString);

const RAW_DATA = [
  {
    code: 'Kav A',
    letter: 'a',
    ownerName: 'Pak Verial',
    ifthar: 70000,
    months: [
      { month: 1, amount: 250000, paidDate: '2026-01-08', isPaid: true },
      { month: 2, amount: 250000, paidDate: '2026-02-01', isPaid: true },
      { month: 3, amount: 365000, paidDate: '2026-03-03', isPaid: true },
      { month: 4, amount: 250000, paidDate: '2026-04-03', isPaid: true },
      { month: 5, amount: 250000, paidDate: '2026-05-10', isPaid: true },
      { month: 6, amount: 250000, paidDate: '2026-06-08', isPaid: true },
      { month: 7, amount: 250000, paidDate: '2026-07-04', isPaid: true },
      { month: 8, amount: 250000, paidDate: '2026-08-11', isPaid: true },
    ]
  },
  {
    code: 'Kav B',
    letter: 'b',
    ownerName: 'Mahasiswa Polban',
    ifthar: 100000,
    months: [
      { month: 1, amount: 250000, paidDate: '2026-01-02', isPaid: true },
      { month: 2, amount: 250000, paidDate: '2026-02-01', isPaid: true },
      { month: 3, amount: 365000, paidDate: '2026-03-07', isPaid: true },
      { month: 4, amount: 250000, paidDate: '2026-04-01', isPaid: true },
      { month: 5, amount: 250000, paidDate: '2026-05-09', isPaid: true },
      { month: 6, amount: 250000, paidDate: '2026-06-05', isPaid: true },
      { month: 7, amount: 250000, paidDate: '2026-07-19', isPaid: true },
      { month: 8, amount: 250000, paidDate: '2026-08-22', isPaid: true },
    ]
  },
  {
    code: 'Kav C',
    letter: 'c',
    ownerName: 'Bu Rina',
    ifthar: 700000,
    months: [
      { month: 1, amount: 250000, paidDate: '2026-01-09', isPaid: true },
      { month: 2, amount: 250000, paidDate: '2026-02-05', isPaid: true },
      { month: 3, amount: 365000, paidDate: '2026-03-09', isPaid: true },
      { month: 4, amount: 250000, paidDate: '2026-05-05', isPaid: true },
      { month: 5, amount: 250000, paidDate: '2026-05-05', isPaid: true },
      { month: 6, amount: 250000, paidDate: '2026-07-01', isPaid: true },
      { month: 7, amount: 250000, paidDate: '2026-07-01', isPaid: true },
      { month: 8, amount: 250000, paidDate: '2026-08-14', isPaid: true },
    ]
  },
  {
    code: 'Kav D',
    letter: 'd',
    ownerName: 'Pak Rieva',
    ifthar: 70000,
    months: [
      { month: 1, amount: 250000, paidDate: '2026-01-13', isPaid: true },
      { month: 2, amount: 250000, paidDate: '2026-02-02', isPaid: true },
      { month: 3, amount: 365000, paidDate: '2026-03-03', isPaid: true },
      { month: 4, amount: 250000, paidDate: '2026-04-20', isPaid: true },
      { month: 5, amount: 250000, paidDate: '2026-05-21', isPaid: true },
      { month: 6, amount: 250000, paidDate: '2026-06-14', isPaid: true },
      { month: 7, amount: 250000, paidDate: '2026-07-06', isPaid: true },
      { month: 8, amount: 250000, paidDate: '2026-07-31', isPaid: true },
    ]
  },
  {
    code: 'Kav E',
    letter: 'e',
    ownerName: 'Pak Budi',
    ifthar: 70000,
    months: [
      { month: 1, amount: 250000, paidDate: '2026-01-21', isPaid: true },
      { month: 2, amount: 250000, paidDate: '2026-02-17', isPaid: true },
      { month: 3, amount: 365000, paidDate: '2026-03-13', isPaid: true },
      { month: 4, amount: 250000, paidDate: '2026-04-17', isPaid: true },
      { month: 5, amount: 250000, paidDate: '2026-05-21', isPaid: true },
      { month: 6, amount: 250000, paidDate: '2026-07-04', isPaid: true },
      { month: 7, amount: 250000, paidDate: '2026-07-04', isPaid: true },
      { month: 8, amount: 250000, isPaid: false },
    ]
  },
  {
    code: 'Kav F',
    letter: 'f',
    ownerName: 'Pa Anggia',
    ifthar: 70000,
    months: [
      { month: 1, amount: 250000, paidDate: '2026-01-01', isPaid: true },
      { month: 2, amount: 250000, paidDate: '2026-01-31', isPaid: true },
      { month: 3, amount: 365000, paidDate: '2026-03-03', isPaid: true },
      { month: 4, amount: 250000, paidDate: '2026-04-01', isPaid: true },
      { month: 5, amount: 250000, paidDate: '2026-05-02', isPaid: true },
      { month: 6, amount: 250000, paidDate: '2026-05-29', isPaid: true },
      { month: 7, amount: 250000, paidDate: '2026-07-02', isPaid: true },
      { month: 8, amount: 250000, paidDate: '2026-07-31', isPaid: true },
    ]
  },
  {
    code: 'Kav G',
    letter: 'g',
    ownerName: 'Pak Misael',
    ifthar: 70000,
    months: [
      { month: 1, amount: 250000, paidDate: '2026-01-03', isPaid: true },
      { month: 2, amount: 250000, paidDate: '2026-02-03', isPaid: true },
      { month: 3, amount: 365000, paidDate: '2026-03-04', isPaid: true },
      { month: 4, amount: 250000, paidDate: '2026-04-06', isPaid: true },
      { month: 5, amount: 250000, paidDate: '2026-05-05', isPaid: true },
      { month: 6, amount: 250000, paidDate: '2026-06-02', isPaid: true },
      { month: 7, amount: 250000, paidDate: '2026-07-01', isPaid: true },
      { month: 8, amount: 250000, paidDate: '2026-07-31', isPaid: true },
    ]
  },
  {
    code: 'Kav H',
    letter: 'h',
    ownerName: 'Pak Fahmi Rizal',
    ifthar: 70000,
    months: [
      { month: 1, amount: 250000, paidDate: '2026-01-06', isPaid: true },
      { month: 2, amount: 250000, paidDate: '2026-02-08', isPaid: true },
      { month: 3, amount: 365000, paidDate: '2026-03-05', isPaid: true },
      { month: 4, amount: 250000, paidDate: '2026-04-05', isPaid: true },
      { month: 5, amount: 250000, paidDate: '2026-05-07', isPaid: true },
      { month: 6, amount: 250000, paidDate: '2026-06-08', isPaid: true },
      { month: 7, amount: 250000, paidDate: '2026-07-04', isPaid: true },
      { month: 8, amount: 250000, paidDate: '2026-08-08', isPaid: true },
    ]
  },
  {
    code: 'Kav I',
    letter: 'i',
    ownerName: 'Pak Yahya',
    ifthar: 70000,
    months: [
      { month: 1, amount: 250000, paidDate: '2026-01-01', isPaid: true },
      { month: 2, amount: 250000, paidDate: '2026-02-01', isPaid: true },
      { month: 3, amount: 365000, paidDate: '2026-03-01', isPaid: true },
      { month: 4, amount: 250000, paidDate: '2026-04-01', isPaid: true },
      { month: 5, amount: 250000, paidDate: '2026-05-01', isPaid: true },
      { month: 6, amount: 250000, paidDate: '2026-06-01', isPaid: true },
      { month: 7, amount: 250000, paidDate: '2026-07-01', isPaid: true },
      { month: 8, amount: 250000, paidDate: '2026-08-01', isPaid: true },
    ]
  },
  {
    code: 'Kav J',
    letter: 'j',
    ownerName: 'Bu Sofia P',
    ifthar: 70000,
    months: [
      { month: 1, amount: 250000, paidDate: '2026-03-01', isPaid: true },
      { month: 2, amount: 250000, paidDate: '2026-02-02', isPaid: true },
      { month: 3, amount: 365000, paidDate: '2026-03-09', isPaid: true },
      { month: 4, amount: 250000, paidDate: '2026-05-12', isPaid: true },
      { month: 5, amount: 250000, paidDate: '2026-05-12', isPaid: true },
      { month: 6, amount: 250000, isPaid: false },
      { month: 7, amount: 250000, isPaid: false },
      { month: 8, amount: 250000, isPaid: false },
    ]
  },
  {
    code: 'Kav K',
    letter: 'k',
    ownerName: 'Pak Eky',
    ifthar: 70000,
    months: [
      { month: 1, amount: 250000, paidDate: '2026-01-05', isPaid: true },
      { month: 2, amount: 250000, paidDate: '2026-02-05', isPaid: true },
      { month: 3, amount: 365000, paidDate: '2026-03-05', isPaid: true },
      { month: 4, amount: 250000, paidDate: '2026-04-02', isPaid: true },
      { month: 5, amount: 250000, paidDate: '2026-05-04', isPaid: true },
      { month: 6, amount: 250000, paidDate: '2026-07-04', isPaid: true },
      { month: 7, amount: 250000, paidDate: '2026-07-07', isPaid: true },
      { month: 8, amount: 250000, paidDate: '2026-08-06', isPaid: true },
    ]
  },
  {
    code: 'Kav L',
    letter: 'l',
    ownerName: 'Pak Haji Ano',
    ifthar: 70000,
    months: [
      { month: 1, amount: 250000, paidDate: '2026-01-02', isPaid: true },
      { month: 2, amount: 250000, paidDate: '2026-02-02', isPaid: true },
      { month: 3, amount: 365000, paidDate: '2026-03-03', isPaid: true },
      { month: 4, amount: 250000, paidDate: '2026-04-01', isPaid: true },
      { month: 5, amount: 250000, paidDate: '2026-05-03', isPaid: true },
      { month: 6, amount: 250000, paidDate: '2026-06-02', isPaid: true },
      { month: 7, amount: 250000, paidDate: '2026-07-02', isPaid: true },
      { month: 8, amount: 250000, paidDate: '2026-08-01', isPaid: true },
    ]
  },
  {
    code: 'Kav M',
    letter: 'm',
    ownerName: 'Pak Dedi N/Pak Jaya',
    ifthar: 70000,
    months: [
      { month: 1, amount: 250000, paidDate: '2026-01-20', isPaid: true },
      { month: 2, amount: 250000, paidDate: '2026-02-19', isPaid: true },
      { month: 3, amount: 365000, paidDate: '2026-04-14', isPaid: true },
      { month: 4, amount: 250000, paidDate: '2026-04-19', isPaid: true },
      { month: 5, amount: 250000, paidDate: '2026-05-20', isPaid: true },
      { month: 6, amount: 250000, paidDate: '2026-06-20', isPaid: true },
      { month: 7, amount: 250000, paidDate: '2026-07-20', isPaid: true },
      { month: 8, amount: 250000, paidDate: '2026-08-20', isPaid: true },
    ]
  }
];

const MONTH_NAMES = [
  '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

async function importFinancials() {
  console.log('====================================================');
  console.log('  WARGAHUB — IMPORT DATA PENERIMAAN KOMPLEK TAHUN 2026');
  console.log('====================================================\n');

  const communityId = 'comm-01';

  // 1. Ensure all 9 Billing Periods for 2026
  console.log('1. Menyiapkan 9 Periode Billing (Januari - September 2026)...');
  for (let m = 1; m <= 9; m++) {
    const monthStr = m.toString().padStart(2, '0');
    const periodId = `period-2026-${monthStr}`;
    const name = `${MONTH_NAMES[m]} 2026`;
    const dueDate = `2026-${monthStr}-10`;
    const status = m === 9 ? 'OPEN' : 'CLOSED';

    await sql`
      INSERT INTO billing_periods (id, community_id, year, month, name, due_date, status)
      VALUES (${periodId}, ${communityId}, 2026, ${m}, ${name}, ${dueDate}, ${status})
      ON CONFLICT (id) DO UPDATE SET status = ${status}, name = ${name}, due_date = ${dueDate};
    `;
    console.log(`   ✓ [${periodId}] ${name} (${status})`);
  }

  // 2. Clean previous 2026 test invoices & payments & ledger for fresh clean state
  console.log('\n2. Mengosongkan data transaksi lama untuk rekonstruksi data riil 2026...');
  await sql`DELETE FROM ledger_entries WHERE entry_date LIKE '2026-%'`;
  await sql`DELETE FROM payment_allocations`;
  await sql`DELETE FROM payments WHERE billing_period_id LIKE 'period-2026-%'`;
  await sql`DELETE FROM invoice_items`;
  await sql`DELETE FROM invoices WHERE billing_period_id LIKE 'period-2026-%'`;

  let totalIplPaid = 0;
  let totalIftharPaid = 0;
  let totalInvoicesCreated = 0;
  let totalPaymentsCreated = 0;
  let totalLedgerCreated = 0;

  // 3. Process Invoices and Payments for Months 1 to 8
  console.log('\n3. Menginput Tagihan & Pembayaran Iuran Warga (Januari - Agustus 2026)...');
  for (const unit of RAW_DATA) {
    const propId = `prop-kav-${unit.letter}`;

    for (const mData of unit.months) {
      const monthStr = mData.month.toString().padStart(2, '0');
      const periodId = `period-2026-${monthStr}`;
      const invId = `inv-2026-${monthStr}-kav-${unit.letter}`;
      const invNumber = `INV/2026/${monthStr}/KAV-${unit.letter.toUpperCase()}`;
      const dueDate = `2026-${monthStr}-10`;
      const issuedAt = `2026-${monthStr}-01 00:00:00`;
      const amount = mData.amount;
      const status = mData.isPaid ? 'PAID' : 'UNPAID';
      const paidAmount = mData.isPaid ? amount : 0;
      const paidAt = mData.isPaid && mData.paidDate ? `${mData.paidDate} 10:00:00` : null;
      const noteStr = `Iuran IPL ${MONTH_NAMES[mData.month]} 2026 - ${unit.code} (${unit.ownerName})`;

      // Insert Invoice
      await sql`
        INSERT INTO invoices (
          id, property_id, billing_period_id, invoice_number, status, subtotal, total, paid_amount, due_date, issued_at, paid_at, notes
        ) VALUES (
          ${invId}, ${propId}, ${periodId}, ${invNumber}, ${status}, ${amount}, ${amount}, ${paidAmount}, ${dueDate}, ${issuedAt}, ${paidAt}, ${noteStr}
        )
      `;
      totalInvoicesCreated++;

      // If Paid: Insert Payment and Ledger Entry
      if (mData.isPaid && paidAt && mData.paidDate) {
        totalIplPaid += amount;
        const payId = `pay-2026-${monthStr}-kav-${unit.letter}`;
        const refStr = `TRF-${mData.paidDate.replace(/-/g, '')}-KAV${unit.letter.toUpperCase()}`;

        await sql`
          INSERT INTO payments (
            id, property_id, billing_period_id, invoice_id, amount, method, reference, proof_file_url, status, notes, paid_at, verified_by, verified_at
          ) VALUES (
            ${payId}, ${propId}, ${periodId}, ${invId}, ${amount}, 'TRANSFER', ${refStr}, '/uploads/proof-sample.png', 'VERIFIED', ${noteStr}, ${paidAt}, 'user-bendahara', ${paidAt}
          )
        `;
        totalPaymentsCreated++;

        // Ledger Entry for IPL
        const ledgId = `ledg-pay-2026-${monthStr}-kav-${unit.letter}`;
        await sql`
          INSERT INTO ledger_entries (
            id, account_id, entry_date, direction, amount, source_type, source_id, description, created_by
          ) VALUES (
            ${ledgId}, 'acc-main', ${mData.paidDate}, 'IN', ${amount}, 'PAYMENT', ${payId}, ${noteStr}, 'user-bendahara'
          )
        `;
        totalLedgerCreated++;
      }
    }

    // 4. Record Sumbangan Khusus Ifthar Penjaga
    if (unit.ifthar > 0) {
      totalIftharPaid += unit.ifthar;
      const iftharId = `ifthar-2026-kav-${unit.letter}`;
      const iftharLedgId = `ledg-ifthar-2026-kav-${unit.letter}`;
      const iftharDate = '2026-03-15';
      const iftharDesc = `Sumbangan Khusus Ifthar Penjaga/Satpam Ramadhan 1447H - ${unit.code} (${unit.ownerName})`;

      await sql`
        INSERT INTO ledger_entries (
          id, account_id, entry_date, direction, amount, source_type, source_id, description, created_by
        ) VALUES (
          ${iftharLedgId}, 'acc-main', ${iftharDate}, 'IN', ${unit.ifthar}, 'PAYMENT', ${iftharId}, ${iftharDesc}, 'user-bendahara'
        )
      `;
      totalLedgerCreated++;
    }

    // 5. Generate September 2026 Open Invoice
    const sepInvId = `inv-2026-09-kav-${unit.letter}`;
    const sepInvNumber = `INV/2026/09/KAV-${unit.letter.toUpperCase()}`;
    await sql`
      INSERT INTO invoices (
        id, property_id, billing_period_id, invoice_number, status, subtotal, total, paid_amount, due_date, issued_at, notes
      ) VALUES (
        ${sepInvId}, ${propId}, 'period-2026-09', ${sepInvNumber}, 'UNPAID', 250000, 250000, 0, '2026-09-10', '2026-09-01 00:00:00', ${'Iuran IPL September 2026 - ' + unit.code}
      )
    `;
    totalInvoicesCreated++;

    console.log(`   ✓ ${unit.code} (${unit.ownerName}): 8 bulan diproses + Ifthar Rp ${unit.ifthar.toLocaleString('id-ID')}`);
  }

  // 6. Update Official Bank Account Balance
  const totalDanaKomplek = totalIplPaid + totalIftharPaid;
  console.log('\n4. Memperbarui Saldo Rekening Operasional BCA...');
  await sql`
    UPDATE accounts
    SET balance = ${totalDanaKomplek}
    WHERE id = 'acc-main'
  `;
  console.log(`   ✓ Saldo Kas Bank BCA (acc-main): Rp ${totalDanaKomplek.toLocaleString('id-ID')}`);

  // 7. Audit Log Record
  await sql`
    INSERT INTO audit_logs (
      id, actor_name, action, entity_type, entity_id, new_value, created_at
    ) VALUES (
      ${'audit-import-2026-' + Date.now()},
      'Bendahara Komplek',
      'finance.import_receipts_2026',
      'ACCOUNT',
      'acc-main',
      ${JSON.stringify({
        totalIpl: totalIplPaid,
        totalIfthar: totalIftharPaid,
        totalDana: totalDanaKomplek,
        invoicesCreated: totalInvoicesCreated,
        paymentsCreated: totalPaymentsCreated,
        ledgerCreated: totalLedgerCreated,
        period: 'Januari - Agustus 2026'
      })},
      ${new Date().toISOString()}
    )
  `;

  console.log('\n====================================================');
  console.log('  RINGKASAN HASIL IMPORT PENERIMAAN DANA KOMPLEK 2026:');
  console.log('====================================================');
  console.log(`  • Total Tagihan Dibuat (Jan - Sep 2026): ${totalInvoicesCreated} tagihan`);
  console.log(`  • Total Transaksi Pembayaran IPL:        ${totalPaymentsCreated} pembayaran terverifikasi`);
  console.log(`  • Total Entri Jurnal Buku Kas (Ledger):  ${totalLedgerCreated} catatan masuk`);
  console.log(`  • Total Penerimaan Iuran IPL:            Rp ${totalIplPaid.toLocaleString('id-ID')}`);
  console.log(`  • Total Sumbangan Khusus Ifthar:         Rp ${totalIftharPaid.toLocaleString('id-ID')}`);
  console.log(`  • GRAND TOTAL PENERIMAAN DANA KOMPLEK:   Rp ${totalDanaKomplek.toLocaleString('id-ID')}`);
  console.log('====================================================\n');

  await sql.end();
}

importFinancials().catch(console.error);
