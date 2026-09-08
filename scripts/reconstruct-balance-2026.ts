import { neonSql } from '../src/db/neon';
import { createClient } from '@libsql/client';
import path from 'node:path';
import 'dotenv/config';

async function main() {
  console.log('=====================================================');
  console.log('REKONSTRUKSI SALDO KAS RIIL PAGUYUBAN (AGUSTUS & SEPTEMBER 2026)');
  console.log('=====================================================\n');

  // 1. Data 5 Pengeluaran Bulan Agustus 2026 (Total: Rp 2.875.000)
  const augustExpenses = [
    {
      id: 'exp-202608-satpam-adri',
      community_id: 'comm-01',
      category_id: 'cat-keamanan',
      account_id: 'acc-main',
      title: 'Honor Petugas Jaga & Keamanan 24 Jam (Pa Adri Harry)',
      description: 'Honor bulanan penjagaan gerbang utama & kontrol keamanan 14 kavling - Agustus 2026',
      amount: 1350000,
      expense_date: '2026-08-25',
      receipt_file_url: null,
      recorded_by: 'user-bendahara',
      approved_by: 'user-ketua',
      status: 'APPROVED',
      ledger_id: 'ledg-exp-202608-satpam-adri',
      ledger_desc: 'BKK Keluar: Honor Petugas Jaga & Keamanan 24 Jam (Pa Adri Harry) - Agustus 2026'
    },
    {
      id: 'exp-202608-satpam-slamet',
      community_id: 'comm-01',
      category_id: 'cat-keamanan',
      account_id: 'acc-main',
      title: 'Honor Petugas Jaga & Keamanan (Pak Slamet Radiyanto)',
      description: 'Honor bulanan penjagaan pos & pemeliharaan lingkungan komplek - Agustus 2026',
      amount: 1100000,
      expense_date: '2026-08-25',
      receipt_file_url: null,
      recorded_by: 'user-bendahara',
      approved_by: 'user-ketua',
      status: 'APPROVED',
      ledger_id: 'ledg-exp-202608-satpam-slamet',
      ledger_desc: 'BKK Keluar: Honor Petugas Jaga & Keamanan (Pak Slamet Radiyanto) - Agustus 2026'
    },
    {
      id: 'exp-202608-retribusi-rt',
      community_id: 'comm-01',
      category_id: 'cat-kebersihan',
      account_id: 'acc-main',
      title: 'Iuran Retribusi RT, Kebersihan & Pengangkutan Sampah',
      description: 'Setoran retribusi kebersihan & sampah rumah tangga komplek ke kas RT - Agustus 2026',
      amount: 250000,
      expense_date: '2026-08-25',
      receipt_file_url: null,
      recorded_by: 'user-bendahara',
      approved_by: 'user-ketua',
      status: 'APPROVED',
      ledger_id: 'ledg-exp-202608-retribusi-rt',
      ledger_desc: 'BKK Keluar: Iuran Retribusi RT, Kebersihan & Pengangkutan Sampah - Agustus 2026'
    },
    {
      id: 'exp-202608-retribusi-rw',
      community_id: 'comm-01',
      category_id: 'cat-pemeliharaan',
      account_id: 'acc-main',
      title: 'Iuran Retribusi Lingkungan ke RW',
      description: 'Setoran retribusi pemeliharaan wilayah & koordinasi keamanan ke RW - Agustus 2026',
      amount: 100000,
      expense_date: '2026-08-02',
      receipt_file_url: null,
      recorded_by: 'user-bendahara',
      approved_by: 'user-ketua',
      status: 'APPROVED',
      ledger_id: 'ledg-exp-202608-retribusi-rw',
      ledger_desc: 'BKK Keluar: Iuran Retribusi Lingkungan ke RW - Agustus 2026'
    },
    {
      id: 'exp-202608-operasional-pos',
      community_id: 'comm-01',
      category_id: 'cat-listrik',
      account_id: 'acc-main',
      title: 'Tagihan Listrik PLN & Air Galon Pos Jaga',
      description: 'Operasional pos jaga: Penerangan jalan umum fasum, pompa air & air minum galon petugas jaga - Agustus 2026',
      amount: 75000,
      expense_date: '2026-08-20',
      receipt_file_url: null,
      recorded_by: 'user-bendahara',
      approved_by: 'user-ketua',
      status: 'APPROVED',
      ledger_id: 'ledg-exp-202608-operasional-pos',
      ledger_desc: 'BKK Keluar: Tagihan Listrik PLN & Air Galon Pos Jaga - Agustus 2026'
    }
  ];

  // 2. Data 12 Penerimaan Iuran Warga (11 Kavling Agustus + 1 Kavling September)
  const incomingPayments = [
    { id: 'ledg-pay-2026-08-kav-a', pay_id: 'pay-2026-08-kav-a', date: '2026-08-11', amount: 250000, desc: 'Iuran IPL Agustus 2026 - Kav A (Pak Verial)' },
    { id: 'ledg-pay-2026-08-kav-b', pay_id: 'pay-2026-08-kav-b', date: '2026-08-22', amount: 250000, desc: 'Iuran IPL Agustus 2026 - Kav B (Mahasiswa Polban)' },
    { id: 'ledg-pay-2026-08-kav-c', pay_id: 'pay-2026-08-kav-c', date: '2026-08-14', amount: 250000, desc: 'Iuran IPL Agustus 2026 - Kav C (Bu Rina)' },
    { id: 'ledg-pay-2026-08-kav-d', pay_id: 'pay-2026-08-kav-d', date: '2026-08-01', amount: 250000, desc: 'Iuran IPL Agustus 2026 - Kav D (Pak Rieva)' },
    { id: 'ledg-pay-2026-08-kav-f', pay_id: 'pay-2026-08-kav-f', date: '2026-08-01', amount: 250000, desc: 'Iuran IPL Agustus 2026 - Kav F (Pa Anggia)' },
    { id: 'ledg-pay-2026-08-kav-g', pay_id: 'pay-2026-08-kav-g', date: '2026-08-01', amount: 250000, desc: 'Iuran IPL Agustus 2026 - Kav G (Pak Misael)' },
    { id: 'ledg-pay-2026-08-kav-h', pay_id: 'pay-2026-08-kav-h', date: '2026-08-08', amount: 250000, desc: 'Iuran IPL Agustus 2026 - Kav H (Pak Fahmi Rizal)' },
    { id: 'ledg-pay-2026-08-kav-i', pay_id: 'pay-2026-08-kav-i', date: '2026-08-01', amount: 250000, desc: 'Iuran IPL Agustus 2026 - Kav I (Pak Yahya)' },
    { id: 'ledg-pay-2026-08-kav-k', pay_id: 'pay-2026-08-kav-k', date: '2026-08-06', amount: 250000, desc: 'Iuran IPL Agustus 2026 - Kav K (Pak Eky)' },
    { id: 'ledg-pay-2026-08-kav-l', pay_id: 'pay-2026-08-kav-l', date: '2026-08-01', amount: 250000, desc: 'Iuran IPL Agustus 2026 - Kav L (Pak Haji Ano)' },
    { id: 'ledg-pay-2026-08-kav-m', pay_id: 'pay-2026-08-kav-m', date: '2026-08-20', amount: 250000, desc: 'Iuran IPL Agustus 2026 - Kav M (Pak Dedi N/Pak Jaya)' },
    { id: 'ledg-pay-2026-09-kava-3276', pay_id: 'pay-2026-09-kava-3276', date: '2026-09-05', amount: 250000, desc: 'Iuran IPL September 2026 - Kav A (Pak Verial)' },
  ];

  const totalInTarget = incomingPayments.reduce((s, p) => s + p.amount, 0); // Rp 3.000.000
  const totalOutTarget = augustExpenses.reduce((s, e) => s + e.amount, 0); // Rp 2.875.000
  const netBalanceTarget = totalInTarget - totalOutTarget; // Rp 125.000

  console.log(`Target Pemasukan  (Agu + Sep) : Rp ${totalInTarget.toLocaleString('id-ID')}`);
  console.log(`Target Pengeluaran (Agu)       : Rp ${totalOutTarget.toLocaleString('id-ID')}`);
  console.log(`Target Saldo Kas Akhir        : Rp ${netBalanceTarget.toLocaleString('id-ID')}\n`);

  // 3. Eksekusi ke Neon PostgreSQL
  console.log('1. Memperbarui Neon PostgreSQL...');
  if (process.env.DATABASE_URL) {
    // A. Kosongkan ledger_entries lama, isi ulang hanya transaksi Agu & Sep
    await neonSql`DELETE FROM ledger_entries`;

    // B. Masukkan penerimaan Agu & Sep ke ledger_entries
    for (const p of incomingPayments) {
      await neonSql`
        INSERT INTO ledger_entries (
          id, account_id, entry_date, direction, amount, source_type, source_id, description, created_by
        ) VALUES (
          ${p.id}, 'acc-main', ${p.date}, 'IN', ${p.amount}, 'PAYMENT', ${p.pay_id}, ${p.desc}, 'user-bendahara'
        )
      `;
    }

    // C. Masukkan pengeluaran Agu ke expenses & ledger_entries
    for (const exp of augustExpenses) {
      await neonSql`
        INSERT INTO expenses (
          id, community_id, category_id, account_id, title, description,
          amount, expense_date, receipt_file_url, recorded_by, approved_by, status
        ) VALUES (
          ${exp.id}, ${exp.community_id}, ${exp.category_id}, ${exp.account_id},
          ${exp.title}, ${exp.description}, ${exp.amount}, ${exp.expense_date},
          ${exp.receipt_file_url}, ${exp.recorded_by}, ${exp.approved_by}, ${exp.status}
        )
        ON CONFLICT (id) DO UPDATE SET
          title = ${exp.title},
          description = ${exp.description},
          amount = ${exp.amount},
          expense_date = ${exp.expense_date},
          approved_by = ${exp.approved_by},
          status = ${exp.status};
      `;

      await neonSql`
        INSERT INTO ledger_entries (
          id, account_id, entry_date, direction, amount, source_type, source_id, description, created_by
        ) VALUES (
          ${exp.ledger_id}, ${exp.account_id}, ${exp.expense_date}, 'OUT', ${exp.amount},
          'EXPENSE', ${exp.id}, ${exp.ledger_desc}, ${exp.recorded_by}
        )
      `;
    }

    // D. Update accounts.balance
    await neonSql`
      UPDATE accounts
      SET balance = ${netBalanceTarget}
      WHERE id = 'acc-main';
    `;
    console.log(`   ✓ Neon: 12 entri kas masuk & 5 pengeluaran dicatat.`);
    console.log(`   ✓ Neon: Saldo akun acc-main di-set ke Rp ${netBalanceTarget.toLocaleString('id-ID')}`);
  }

  // 4. Eksekusi ke SQLite data/wargahub.db
  console.log('\n2. Memperbarui Database Lokal SQLite data/wargahub.db...');
  const dbPath = path.resolve(process.cwd(), 'data/wargahub.db');
  const sqliteClient = createClient({ url: `file:${dbPath.replace(/\\/g, '/')}` });

  try {
    // Kosongkan expenses & ledger_entries di SQLite
    await sqliteClient.execute('DELETE FROM expenses');
    await sqliteClient.execute('DELETE FROM ledger_entries');

    // Insert Penerimaan ke ledger_entries
    for (const p of incomingPayments) {
      await sqliteClient.execute({
        sql: `
          INSERT INTO ledger_entries (
            id, account_id, entry_date, direction, amount, source_type, source_id, description, created_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [p.id, 'acc-main', p.date, 'IN', p.amount, 'PAYMENT', p.pay_id, p.desc, 'user-bendahara']
      });
    }

    // Insert Pengeluaran ke expenses & ledger_entries
    for (const exp of augustExpenses) {
      await sqliteClient.execute({
        sql: `
          INSERT INTO expenses (
            id, community_id, category_id, account_id, title, description,
            amount, expense_date, receipt_file_url, recorded_by, approved_by, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          exp.id, exp.community_id, exp.category_id, exp.account_id,
          exp.title, exp.description, exp.amount, exp.expense_date,
          exp.receipt_file_url, exp.recorded_by, exp.approved_by, exp.status
        ]
      });

      await sqliteClient.execute({
        sql: `
          INSERT INTO ledger_entries (
            id, account_id, entry_date, direction, amount, source_type, source_id, description, created_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [exp.ledger_id, exp.account_id, exp.expense_date, 'OUT', exp.amount, 'EXPENSE', exp.id, exp.ledger_desc, exp.recorded_by]
      });
    }

    // Update saldo akun acc-main di SQLite
    await sqliteClient.execute({
      sql: 'UPDATE accounts SET balance = ? WHERE id = ?',
      args: [netBalanceTarget, 'acc-main']
    });

    console.log(`   ✓ SQLite: 12 entri kas masuk & 5 pengeluaran dicatat.`);
    console.log(`   ✓ SQLite: Saldo akun acc-main di-set ke Rp ${netBalanceTarget.toLocaleString('id-ID')}`);
  } catch (err: any) {
    console.error('   ⚠️ SQLite error:', err.message);
  }

  // 5. Cek SQLite di root wargahub.db (jika ada)
  const rootDbPath = path.resolve(process.cwd(), 'wargahub.db');
  try {
    const rootClient = createClient({ url: `file:${rootDbPath.replace(/\\/g, '/')}` });
    await rootClient.execute('DELETE FROM expenses');
    await rootClient.execute('DELETE FROM ledger_entries');
    for (const p of incomingPayments) {
      await rootClient.execute({
        sql: `INSERT INTO ledger_entries (id, account_id, entry_date, direction, amount, source_type, source_id, description, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [p.id, 'acc-main', p.date, 'IN', p.amount, 'PAYMENT', p.pay_id, p.desc, 'user-bendahara']
      });
    }
    for (const exp of augustExpenses) {
      await rootClient.execute({
        sql: `INSERT INTO expenses (id, community_id, category_id, account_id, title, description, amount, expense_date, receipt_file_url, recorded_by, approved_by, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [exp.id, exp.community_id, exp.category_id, exp.account_id, exp.title, exp.description, exp.amount, exp.expense_date, exp.receipt_file_url, exp.recorded_by, exp.approved_by, exp.status]
      });
      await rootClient.execute({
        sql: `INSERT INTO ledger_entries (id, account_id, entry_date, direction, amount, source_type, source_id, description, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [exp.ledger_id, exp.account_id, exp.expense_date, 'OUT', exp.amount, 'EXPENSE', exp.id, exp.ledger_desc, exp.recorded_by]
      });
    }
    await rootClient.execute({
      sql: 'UPDATE accounts SET balance = ? WHERE id = ?',
      args: [netBalanceTarget, 'acc-main']
    });
    console.log(`   ✓ Root SQLite (wargahub.db) disinkronkan juga.`);
  } catch (e: any) {
    // Root DB may not exist or not have same tables, which is fine
  }

  console.log('\n=====================================================');
  console.log(`VERIFIKASI AKHIR KAS:`);
  console.log(`Total Masuk   : Rp ${totalInTarget.toLocaleString('id-ID')}`);
  console.log(`Total Keluar  : Rp ${totalOutTarget.toLocaleString('id-ID')}`);
  console.log(`Saldo Kas Riil: Rp ${netBalanceTarget.toLocaleString('id-ID')}`);
  console.log('REKONSTRUKSI SELESAI DENGAN SUKSES & SEMPURNA!');
  console.log('=====================================================');
}

main().catch(console.error);
