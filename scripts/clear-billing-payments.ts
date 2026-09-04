import { neonSql } from '../src/db/neon';
import { client as sqliteClient } from '../src/db/index';
import 'dotenv/config';

async function main() {
  console.log('====================================================');
  console.log('  WARGAHUB — PEMBERSIHAN DATA BILLING & PAYMENTS    ');
  console.log('====================================================\n');

  console.log('1. Membersihkan data di Neon PostgreSQL...');
  try {
    // 1. Delete payment allocations
    const delAlloc = await neonSql`DELETE FROM payment_allocations RETURNING id`;
    console.log(`   ✓ Dihapus ${delAlloc.length} record payment_allocations`);

    // 2. Delete payments
    const delPay = await neonSql`DELETE FROM payments RETURNING id`;
    console.log(`   ✓ Dihapus ${delPay.length} record payments`);

    // 3. Delete invoice items
    const delItems = await neonSql`DELETE FROM invoice_items RETURNING id`;
    console.log(`   ✓ Dihapus ${delItems.length} record invoice_items`);

    // 4. Delete invoices
    const delInv = await neonSql`DELETE FROM invoices RETURNING id`;
    console.log(`   ✓ Dihapus ${delInv.length} record invoices`);

    // 5. Delete payment ledger entries (dummy income)
    const delLedg = await neonSql`DELETE FROM ledger_entries WHERE source_type = 'PAYMENT' OR source_id LIKE 'pay-%' RETURNING id`;
    console.log(`   ✓ Dihapus ${delLedg.length} record ledger_entries sumber pembayaran`);

    // 6. Reset monthly snapshot for August 2026
    await neonSql`
      UPDATE monthly_snapshots
      SET paid_properties = 0,
          unpaid_properties = 0,
          income = 0,
          closing_balance = opening_balance - expense,
          unpaid_properties_list_json = '[]'
      WHERE id = 'snap-2026-08'
    `;
    console.log('   ✓ Snapshot bulanan snap-2026-08 berhasil direset.');

    // Verify Neon
    const invCount = await neonSql`SELECT count(*) FROM invoices`;
    const payCount = await neonSql`SELECT count(*) FROM payments`;
    console.log(`\n   Neon Invoices sisa : ${invCount[0].count}`);
    console.log(`   Neon Payments sisa : ${payCount[0].count}`);
  } catch (err) {
    console.error('   ! Error membersihkan Neon:', err);
  }

  console.log('\n2. Membersihkan data di basis data lokal SQLite (data/wargahub.db)...');
  try {
    await sqliteClient.execute('DELETE FROM payment_allocations');
    await sqliteClient.execute('DELETE FROM payments');
    await sqliteClient.execute('DELETE FROM invoice_items');
    await sqliteClient.execute('DELETE FROM invoices');
    await sqliteClient.execute("DELETE FROM ledger_entries WHERE source_type = 'PAYMENT' OR source_id LIKE 'pay-%'");
    console.log('   ✓ SQLite tabel billing & payments berhasil dikosongkan.');

    const sqInv = await sqliteClient.execute('SELECT count(*) as total FROM invoices');
    const sqPay = await sqliteClient.execute('SELECT count(*) as total FROM payments');
    console.log(`   SQLite Invoices sisa : ${sqInv.rows[0]?.total ?? 0}`);
    console.log(`   SQLite Payments sisa : ${sqPay.rows[0]?.total ?? 0}`);
  } catch (sqErr: any) {
    console.warn('   ! Catatan pembersihan SQLite:', sqErr.message);
  }

  console.log('\n====================================================');
  console.log('  HASIL: DATA BILLING & PAYMENTS BERHASIL DIKOSONGKAN');
  console.log('====================================================\n');

  await neonSql.end();
  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
