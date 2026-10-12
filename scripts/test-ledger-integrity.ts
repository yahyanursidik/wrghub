import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

// Mutations are restricted to this new temporary SQLite database.
process.env.DATABASE_URL = '';
process.env.WARGAHUB_DATA_DIR = await mkdtemp(path.join(tmpdir(), 'wargahub-ledger-test-'));
const { client } = await import('../src/db');
const { createManualLedgerEntry, updateManualLedgerEntry, transferBetweenAccounts, deleteManualLedgerEntry } = await import('../src/services/manual-ledger.service');
const { neonSql } = await import('../src/db/neon');
try {
  await client.executeMultiple(`
    CREATE TABLE accounts (id TEXT PRIMARY KEY, community_id TEXT, code TEXT, name TEXT, type TEXT DEFAULT 'BANK', account_number TEXT, bank_name TEXT, balance REAL DEFAULT 0, is_active INTEGER DEFAULT 1, created_at TEXT);
    CREATE TABLE ledger_entries (id TEXT PRIMARY KEY, account_id TEXT, entry_date TEXT, direction TEXT, amount REAL, source_type TEXT, source_id TEXT, description TEXT, created_by TEXT, created_at TEXT);
    INSERT INTO accounts (id,code,name,balance,is_active) VALUES ('source','SRC','Asal',1000000,1),('target','DST','Tujuan',200000,1);
  `);
  const balances = async () => (await client.execute('SELECT id,balance FROM accounts ORDER BY id')).rows.map(row => [row.id, row.balance]);
  const count = async () => Number((await client.execute('SELECT COUNT(*) AS count FROM ledger_entries')).rows[0].count);
  const entry = await createManualLedgerEntry({ accountId: 'source', amount: 50000, direction: 'IN', entryDate: '2026-10-12', sourceType: 'MANUAL_JOURNAL', description: 'Pemasukan pengujian' });
  assert.deepEqual(await balances(), [['source', 1050000], ['target', 200000]]);
  await updateManualLedgerEntry(entry.id, { amount: 80000, direction: 'OUT', accountId: 'target' });
  assert.deepEqual(await balances(), [['source', 1000000], ['target', 120000]]);
  await deleteManualLedgerEntry(entry.id);
  assert.deepEqual(await balances(), [['source', 1000000], ['target', 200000]]);
  await assert.rejects(deleteManualLedgerEntry(entry.id));
  const transfer = await transferBetweenAccounts({ fromAccountId: 'source', toAccountId: 'target', amount: 250000, description: 'Mutasi pengujian', entryDate: '2026-10-12' });
  assert.deepEqual(await balances(), [['source', 750000], ['target', 450000]]);
  assert.equal(await count(), 2);
  await assert.rejects(transferBetweenAccounts({ fromAccountId: 'source', toAccountId: 'target', amount: 900000, description: 'Saldo tidak cukup', entryDate: '2026-10-12' }));
  assert.deepEqual(await balances(), [['source', 750000], ['target', 450000]]);
  assert.equal(await count(), 2);
  await assert.rejects(transferBetweenAccounts({ fromAccountId: 'source', toAccountId: 'missing', amount: 100000, description: 'Rekening tidak ada', entryDate: '2026-10-12' }));
  assert.equal(await count(), 2);
  await assert.rejects(updateManualLedgerEntry(transfer.outEntry.id, { amount: 999999 }));
  await deleteManualLedgerEntry(transfer.outEntry.id);
  assert.deepEqual(await balances(), [['source', 1000000], ['target', 200000]]);
  assert.equal(await count(), 0);
  await assert.rejects(createManualLedgerEntry({ accountId: 'source', amount: -1, direction: 'IN', entryDate: '2026-10-12', sourceType: 'MANUAL_JOURNAL', description: 'Nominal tidak valid' }));
  await assert.rejects(createManualLedgerEntry({ accountId: 'source', amount: 10, direction: 'IN', entryDate: '2026-10-12', sourceType: 'PAYMENT', description: 'Gunakan modul pembayaran' }));
  console.log('PASS ledger persistence, update/reversal, atomic transfer, insufficient funds, missing accounts, linked-entry protection and paired deletion');
} finally {
  client.close();
  await neonSql.end();
}
