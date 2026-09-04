import { neonSql } from '../src/db/neon';
import { client as sqliteClient } from '../src/db/index';
import 'dotenv/config';

async function main() {
  console.log('====================================================');
  console.log('  WARGAHUB — PEMBERSIHAN DATA EXPENSES & LEDGER     ');
  console.log('====================================================\n');

  console.log('1. Membersihkan data di Neon PostgreSQL...');
  try {
    // 1. Delete expenses
    const delExp = await neonSql`DELETE FROM expenses RETURNING id`;
    console.log(`   ✓ Dihapus ${delExp.length} record expenses`);

    // 2. Delete ledger entries
    const delLedg = await neonSql`DELETE FROM ledger_entries RETURNING id`;
    console.log(`   ✓ Dihapus ${delLedg.length} record ledger_entries`);

    // 3. Reset monthly snapshots
    await neonSql`
      UPDATE monthly_snapshots
      SET expense = 0,
          income = 0,
          closing_balance = opening_balance,
          breakdown_json = '[]',
          unpaid_properties_list_json = '[]'
    `;
    console.log('   ✓ Snapshot bulanan monthly_snapshots berhasil direset.');

    // 4. Reset petty cash account balance
    await neonSql`UPDATE accounts SET balance = 0 WHERE id = 'acc-petty' OR code = 'PETTY_CASH'`;
    console.log('   ✓ Saldo akun kas operasional / petty cash diset ke 0.');

    // Verify Neon
    const expCount = await neonSql`SELECT count(*) FROM expenses`;
    const ledCount = await neonSql`SELECT count(*) FROM ledger_entries`;
    const accList = await neonSql`SELECT name, code, balance FROM accounts`;
    console.log(`\n   Neon Expenses sisa      : ${expCount[0].count}`);
    console.log(`   Neon Ledger Entries sisa: ${ledCount[0].count}`);
    console.log('   Neon Accounts:');
    for (const a of accList) {
      console.log(`     - ${a.name} (${a.code}): Rp ${Number(a.balance).toLocaleString('id-ID')}`);
    }
  } catch (err) {
    console.error('   ! Error membersihkan Neon:', err);
  }

  console.log('\n2. Membersihkan data di basis data lokal SQLite (data/wargahub.db)...');
  try {
    await sqliteClient.execute('DELETE FROM expenses');
    await sqliteClient.execute('DELETE FROM ledger_entries');
    await sqliteClient.execute("UPDATE monthly_snapshots SET expense = 0, income = 0, closing_balance = opening_balance, breakdown_json = '[]', unpaid_properties_list_json = '[]'");
    await sqliteClient.execute("UPDATE accounts SET balance = 0 WHERE id = 'acc-petty' OR code = 'PETTY_CASH'");
    console.log('   ✓ SQLite tabel expenses & ledger_entries berhasil dikosongkan.');

    const sqExp = await sqliteClient.execute('SELECT count(*) as total FROM expenses');
    const sqLed = await sqliteClient.execute('SELECT count(*) as total FROM ledger_entries');
    console.log(`   SQLite Expenses sisa      : ${sqExp.rows[0]?.total ?? 0}`);
    console.log(`   SQLite Ledger Entries sisa: ${sqLed.rows[0]?.total ?? 0}`);
  } catch (sqErr: any) {
    console.warn('   ! Catatan pembersihan SQLite:', sqErr.message);
  }

  console.log('\n====================================================');
  console.log('  HASIL: DATA EXPENSES & LEDGER BERHASIL DIKOSONGKAN');
  console.log('====================================================\n');

  await neonSql.end();
  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
