import { randomUUID } from 'node:crypto';
import { eq, sql as expression } from 'drizzle-orm';
import { db, schema } from '../db';
import { neonSql } from '../db/neon';

export interface ManualLedgerInput {
  accountId: string; entryDate: string; direction: 'IN' | 'OUT'; amount: number;
  sourceType: string; description: string; referenceNo?: string; createdBy?: string;
}
const signed = (direction: string, amount: number) => direction === 'IN' ? amount : -amount;
const editable = (entry: { sourceType: string }) => {
  if (['PAYMENT', 'EXPENSE', 'INTERNAL_TRANSFER', 'MUTASI_KAS_INTERNAL'].includes(entry.sourceType)) {
    throw new Error('Entri ini terhubung ke transaksi lain. Koreksi melalui menu pembayaran, pengeluaran, atau mutasi terkait.');
  }
};
const validateAmount = (amount: number) => { if (!Number.isFinite(amount) || amount <= 0) throw new Error('Nominal harus lebih dari nol.'); };

export async function createManualLedgerEntry(input: ManualLedgerInput) {
  validateAmount(input.amount);
  editable(input);
  const entry = { id: `led-${randomUUID()}`, accountId: input.accountId, entryDate: input.entryDate, direction: input.direction, amount: input.amount, sourceType: input.sourceType, sourceId: input.referenceNo || null, description: input.description, createdBy: input.createdBy || null, createdAt: new Date().toISOString() };
  const delta = signed(entry.direction, entry.amount);
  if (process.env.DATABASE_URL) {
    await neonSql.begin(async transaction => {
      const accounts = await transaction`SELECT id FROM accounts WHERE id = ${entry.accountId} AND is_active = true FOR UPDATE`;
      if (!accounts.length) throw new Error('Rekening tidak ditemukan atau tidak aktif.');
      await transaction`INSERT INTO ledger_entries (id, account_id, entry_date, direction, amount, source_type, source_id, description, created_by, created_at) VALUES (${entry.id}, ${entry.accountId}, ${entry.entryDate}, ${entry.direction}, ${entry.amount}, ${entry.sourceType}, ${entry.sourceId}, ${entry.description}, ${entry.createdBy}, ${entry.createdAt})`;
      await transaction`UPDATE accounts SET balance = balance + ${delta} WHERE id = ${entry.accountId}`;
    });
  } else {
    await db.transaction(async transaction => {
      const [account] = await transaction.select().from(schema.accounts).where(eq(schema.accounts.id, entry.accountId));
      if (!account?.isActive) throw new Error('Rekening tidak ditemukan atau tidak aktif.');
      await transaction.insert(schema.ledgerEntries).values(entry);
      await transaction.update(schema.accounts).set({ balance: expression`${schema.accounts.balance} + ${delta}` }).where(eq(schema.accounts.id, entry.accountId));
    });
  }
  return entry;
}

export async function updateManualLedgerEntry(id: string, patch: Partial<ManualLedgerInput>) {
  if (patch.amount !== undefined) validateAmount(patch.amount);
  if (process.env.DATABASE_URL) {
    return await neonSql.begin(async transaction => {
      const [row] = await transaction`SELECT * FROM ledger_entries WHERE id = ${id} FOR UPDATE`;
      if (!row) throw new Error('Entri tidak ditemukan.');
      editable({ sourceType: row.source_type });
      const next = { accountId: patch.accountId || row.account_id, amount: patch.amount ?? Number(row.amount), direction: patch.direction || row.direction, description: patch.description ?? row.description, entryDate: patch.entryDate || row.entry_date };
      const accounts = await transaction`SELECT id FROM accounts WHERE id IN (${row.account_id}, ${next.accountId}) AND is_active = true ORDER BY id FOR UPDATE`;
      if (!accounts.some(account => account.id === next.accountId)) throw new Error('Rekening tujuan tidak ditemukan.');
      await transaction`UPDATE accounts SET balance = balance - ${signed(row.direction, Number(row.amount))} WHERE id = ${row.account_id}`;
      await transaction`UPDATE accounts SET balance = balance + ${signed(next.direction, next.amount)} WHERE id = ${next.accountId}`;
      await transaction`UPDATE ledger_entries SET account_id = ${next.accountId}, amount = ${next.amount}, direction = ${next.direction}, description = ${next.description}, entry_date = ${next.entryDate} WHERE id = ${id}`;
      return { id, ...next };
    });
  }
  return await db.transaction(async transaction => {
    const [row] = await transaction.select().from(schema.ledgerEntries).where(eq(schema.ledgerEntries.id, id));
    if (!row) throw new Error('Entri tidak ditemukan.');
    editable(row);
    const next = { accountId: patch.accountId || row.accountId, amount: patch.amount ?? row.amount, direction: patch.direction || row.direction, description: patch.description ?? row.description, entryDate: patch.entryDate || row.entryDate };
    const [account] = await transaction.select().from(schema.accounts).where(eq(schema.accounts.id, next.accountId!));
    if (!account?.isActive) throw new Error('Rekening tujuan tidak ditemukan.');
    await transaction.update(schema.accounts).set({ balance: expression`${schema.accounts.balance} - ${signed(row.direction, row.amount)}` }).where(eq(schema.accounts.id, row.accountId!));
    await transaction.update(schema.accounts).set({ balance: expression`${schema.accounts.balance} + ${signed(next.direction, next.amount)}` }).where(eq(schema.accounts.id, next.accountId!));
    await transaction.update(schema.ledgerEntries).set(next).where(eq(schema.ledgerEntries.id, id));
    return { id, ...next };
  });
}

export async function transferBetweenAccounts(input: { fromAccountId: string; toAccountId: string; amount: number; description: string; entryDate: string }) {
  validateAmount(input.amount);
  if (input.fromAccountId === input.toAccountId) throw new Error('Rekening asal dan tujuan harus berbeda.');
  const transferId = `transfer-${randomUUID()}`;
  const createdAt = new Date().toISOString();
  const outEntry = { id: `led-${randomUUID()}`, accountId: input.fromAccountId, entryDate: input.entryDate, direction: 'OUT', amount: input.amount, sourceType: 'INTERNAL_TRANSFER', sourceId: transferId, description: input.description, createdBy: null, createdAt };
  const inEntry = { ...outEntry, id: `led-${randomUUID()}`, accountId: input.toAccountId, direction: 'IN' };
  if (process.env.DATABASE_URL) {
    await neonSql.begin(async transaction => {
      const accounts = await transaction`SELECT id, balance FROM accounts WHERE id IN (${input.fromAccountId}, ${input.toAccountId}) AND is_active = true ORDER BY id FOR UPDATE`;
      if (accounts.length !== 2) throw new Error('Rekening asal atau tujuan tidak ditemukan.');
      if (Number(accounts.find(account => account.id === input.fromAccountId)!.balance) < input.amount) throw new Error('Saldo rekening asal tidak cukup.');
      for (const entry of [outEntry, inEntry]) {
        await transaction`INSERT INTO ledger_entries (id, account_id, entry_date, direction, amount, source_type, source_id, description, created_at) VALUES (${entry.id}, ${entry.accountId}, ${entry.entryDate}, ${entry.direction}, ${entry.amount}, ${entry.sourceType}, ${entry.sourceId}, ${entry.description}, ${createdAt})`;
        await transaction`UPDATE accounts SET balance = balance + ${signed(entry.direction, entry.amount)} WHERE id = ${entry.accountId}`;
      }
    });
  } else {
    await db.transaction(async transaction => {
      const accounts = await transaction.select().from(schema.accounts);
      const from = accounts.find(account => account.id === input.fromAccountId && account.isActive);
      const to = accounts.find(account => account.id === input.toAccountId && account.isActive);
      if (!from || !to) throw new Error('Rekening asal atau tujuan tidak ditemukan.');
      if (from.balance < input.amount) throw new Error('Saldo rekening asal tidak cukup.');
      await transaction.insert(schema.ledgerEntries).values([outEntry, inEntry]);
      for (const entry of [outEntry, inEntry]) await transaction.update(schema.accounts).set({ balance: expression`${schema.accounts.balance} + ${signed(entry.direction, entry.amount)}` }).where(eq(schema.accounts.id, entry.accountId));
    });
  }
  return { transferId, outEntry, inEntry };
}

export async function deleteManualLedgerEntry(id: string) {
  if (process.env.DATABASE_URL) {
    return await neonSql.begin(async transaction => {
      const [row] = await transaction`SELECT * FROM ledger_entries WHERE id = ${id} FOR UPDATE`;
      if (!row) throw new Error('Entri tidak ditemukan atau sudah dihapus.');
      const rows = row.source_type === 'INTERNAL_TRANSFER' && row.source_id
        ? await transaction`SELECT * FROM ledger_entries WHERE source_type = 'INTERNAL_TRANSFER' AND source_id = ${row.source_id} ORDER BY id FOR UPDATE`
        : [row];
      if (row.source_type === 'INTERNAL_TRANSFER') {
        if (rows.length !== 2) throw new Error('Pasangan mutasi tidak lengkap. Periksa melalui rekonsiliasi.');
      } else editable({ sourceType: row.source_type });
      for (const entry of rows) {
        await transaction`UPDATE accounts SET balance = balance - ${signed(entry.direction, Number(entry.amount))} WHERE id = ${entry.account_id}`;
        await transaction`DELETE FROM ledger_entries WHERE id = ${entry.id}`;
      }
      return { success: true, id, ids: rows.map(entry => entry.id) };
    });
  }
  return await db.transaction(async transaction => {
    const [row] = await transaction.select().from(schema.ledgerEntries).where(eq(schema.ledgerEntries.id, id));
    if (!row) throw new Error('Entri tidak ditemukan atau sudah dihapus.');
    const rows = row.sourceType === 'INTERNAL_TRANSFER' && row.sourceId
      ? (await transaction.select().from(schema.ledgerEntries).where(eq(schema.ledgerEntries.sourceId, row.sourceId))).filter(entry => entry.sourceType === 'INTERNAL_TRANSFER')
      : [row];
    if (row.sourceType === 'INTERNAL_TRANSFER') {
      if (rows.length !== 2) throw new Error('Pasangan mutasi tidak lengkap. Periksa melalui rekonsiliasi.');
    } else editable(row);
    for (const entry of rows) {
      await transaction.update(schema.accounts).set({ balance: expression`${schema.accounts.balance} - ${signed(entry.direction, entry.amount)}` }).where(eq(schema.accounts.id, entry.accountId!));
      await transaction.delete(schema.ledgerEntries).where(eq(schema.ledgerEntries.id, entry.id));
    }
    return { success: true, id, ids: rows.map(entry => entry.id) };
  });
}
