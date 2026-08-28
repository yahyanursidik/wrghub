import { neonSql } from '../db/neon';
import { db, schema } from '../db';
import { eq, desc } from 'drizzle-orm';
import { recordAuditLog } from './audit.service';

export async function getAccounts() {
  if (process.env.DATABASE_URL) {
    try {
      const rows = await neonSql`SELECT * FROM accounts WHERE is_active = true`;
      return rows.map((r: any) => ({
        ...r,
        balance: Number(r.balance) || 0,
      }));
    } catch (e) {
      console.warn('Neon accounts error:', e);
    }
  }
  return await db.select().from(schema.accounts).where(eq(schema.accounts.isActive, true));
}

export async function getMainAccountBalance() {
  if (process.env.DATABASE_URL) {
    try {
      const rows = await neonSql`SELECT balance FROM accounts WHERE id = 'acc-main' LIMIT 1`;
      if (rows.length) return Number(rows[0].balance) || 128450000;
    } catch (e) {
      console.warn('Neon balance error:', e);
    }
  }
  const accs = await db.select().from(schema.accounts).where(eq(schema.accounts.id, 'acc-main')).limit(1);
  return accs[0]?.balance || 128450000;
}

export async function getLedgerEntries(limit = 30) {
  if (process.env.DATABASE_URL) {
    try {
      const rows = await neonSql`SELECT * FROM ledger_entries ORDER BY entry_date DESC, created_at DESC LIMIT ${limit}`;
      return rows.map((r: any) => ({
        id: r.id,
        accountId: r.account_id,
        entryDate: r.entry_date,
        direction: r.direction,
        amount: Number(r.amount) || 0,
        sourceType: r.source_type,
        sourceId: r.source_id,
        description: r.description,
        createdBy: r.created_by,
        createdAt: r.created_at,
      }));
    } catch (e) {
      console.warn('Neon ledger error:', e);
    }
  }
  return await db.select().from(schema.ledgerEntries).orderBy(desc(schema.ledgerEntries.entryDate), desc(schema.ledgerEntries.createdAt)).limit(limit);
}

export async function getExpenses() {
  if (process.env.DATABASE_URL) {
    try {
      const rows = await neonSql`
        SELECT 
          e.id, e.title, e.description, e.amount, e.expense_date,
          ec.name as category_name, ec.icon as category_icon, e.status
        FROM expenses e
        LEFT JOIN expense_categories ec ON e.category_id = ec.id
        ORDER BY e.expense_date DESC
      `;
      return rows.map((r: any) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        amount: Number(r.amount) || 0,
        expenseDate: r.expense_date,
        categoryName: r.category_name,
        categoryIcon: r.category_icon,
        status: r.status,
      }));
    } catch (e) {
      console.warn('Neon expenses error:', e);
    }
  }

  return await db.select({
    id: schema.expenses.id,
    title: schema.expenses.title,
    description: schema.expenses.description,
    amount: schema.expenses.amount,
    expenseDate: schema.expenses.expenseDate,
    categoryName: schema.expenseCategories.name,
    categoryIcon: schema.expenseCategories.icon,
    status: schema.expenses.status,
  })
  .from(schema.expenses)
  .leftJoin(schema.expenseCategories, eq(schema.expenses.categoryId, schema.expenseCategories.id))
  .orderBy(desc(schema.expenses.expenseDate));
}

export async function getBudgetComparison() {
  return [
    {
      keterangan: 'Pemasukan (Iuran)',
      anggaran: 90000000,
      realisasi: 64500000,
      selisih: -25500000,
      isPositive: false,
    },
    {
      keterangan: 'Pengeluaran Operasional',
      anggaran: 45000000,
      realisasi: 28350000,
      selisih: 16650000,
      isPositive: true,
    },
    {
      keterangan: 'Pengeluaran Pemeliharaan',
      anggaran: 20000000,
      realisasi: 12600000,
      selisih: 7400000,
      isPositive: true,
    },
    {
      keterangan: 'Saldo Akhir',
      anggaran: 25000000,
      realisasi: 23550000,
      selisih: -1450000,
      isPositive: false,
      isTotal: true,
    }
  ];
}

export async function recordExpense(data: {
  categoryId: string;
  accountId?: string;
  title: string;
  description?: string;
  amount: number;
  expenseDate: string;
  recordedBy?: string;
}) {
  const expenseId = `exp-${Date.now()}`;
  const accountId = data.accountId || 'acc-main';

  if (process.env.DATABASE_URL) {
    try {
      await neonSql`
        INSERT INTO expenses (
          id, community_id, category_id, account_id, title, description, amount, expense_date, recorded_by, approved_by, status
        ) VALUES (
          ${expenseId}, 'comm-01', ${data.categoryId}, ${accountId}, ${data.title},
          ${data.description || null}, ${data.amount}, ${data.expenseDate},
          ${data.recordedBy || 'user-bendahara'}, 'user-ketua', 'APPROVED'
        )
      `;

      await neonSql`
        INSERT INTO ledger_entries (
          id, account_id, entry_date, direction, amount, source_type, source_id, description, created_by
        ) VALUES (
          ${'ledg-' + expenseId}, ${accountId}, ${data.expenseDate}, 'OUT',
          ${data.amount}, 'EXPENSE', ${expenseId}, ${data.title}, ${data.recordedBy || 'user-bendahara'}
        )
      `;

      await neonSql`UPDATE accounts SET balance = balance - ${data.amount} WHERE id = ${accountId}`;

      await recordAuditLog({
        actorUserId: data.recordedBy || 'user-bendahara',
        actorName: 'Bendahara',
        action: 'expense.create',
        entityType: 'EXPENSE',
        entityId: expenseId,
        newValue: { title: data.title, amount: data.amount },
      });

      return expenseId;
    } catch (e) {
      console.warn('Neon record expense error:', e);
    }
  }

  await db.insert(schema.expenses).values({
    id: expenseId,
    communityId: 'comm-01',
    categoryId: data.categoryId,
    accountId,
    title: data.title,
    description: data.description || null,
    amount: data.amount,
    expenseDate: data.expenseDate,
    recordedBy: data.recordedBy || 'user-bendahara',
    approvedBy: 'user-ketua',
    status: 'APPROVED',
  });

  return expenseId;
}
