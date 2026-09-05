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
      const rows = await neonSql`SELECT balance FROM accounts WHERE code = 'BCA-UTAMA' OR id = 'acc-main' OR type = 'BANK' LIMIT 1`;
      if (rows.length) return Number(rows[0].balance ?? 0);
    } catch (e) {
      console.warn('Neon balance error:', e);
    }
  }
  const accs = await db.select().from(schema.accounts).where(eq(schema.accounts.id, 'acc-main')).limit(1);
  return Number(accs[0]?.balance ?? 0);
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
      anggaran: 0,
      realisasi: 0,
      selisih: 0,
      isPositive: true,
    },
    {
      keterangan: 'Pengeluaran Operasional',
      anggaran: 0,
      realisasi: 0,
      selisih: 0,
      isPositive: true,
    },
    {
      keterangan: 'Pengeluaran Pemeliharaan',
      anggaran: 0,
      realisasi: 0,
      selisih: 0,
      isPositive: true,
    },
    {
      keterangan: 'Saldo Akhir',
      anggaran: 0,
      realisasi: 0,
      selisih: 0,
      isPositive: true,
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
  const expenseId = `exp-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  const accountId = data.accountId || 'acc-main';

  // Normalize categoryId against valid DB categories: cat-keamanan, cat-kebersihan, cat-listrik, cat-pemeliharaan
  let safeCategoryId = data.categoryId || 'cat-pemeliharaan';
  const catLower = safeCategoryId.toLowerCase();
  if (catLower === 'cat-satpam' || catLower.includes('keamanan') || catLower.includes('satpam')) {
    safeCategoryId = 'cat-keamanan';
  } else if (catLower === 'cat-utilitas' || catLower === 'cat-pju' || catLower.includes('listrik')) {
    safeCategoryId = 'cat-listrik';
  } else if (catLower.includes('kebersihan') || catLower.includes('sampah')) {
    safeCategoryId = 'cat-kebersihan';
  } else {
    safeCategoryId = 'cat-pemeliharaan';
  }

  // Normalize recordedBy to a valid user ID (user-bendahara, user-admin, etc.)
  const safeRecordedBy = (data.recordedBy && data.recordedBy.startsWith('user-')) ? data.recordedBy : 'user-bendahara';

  if (process.env.DATABASE_URL) {
    try {
      await neonSql`
        INSERT INTO expenses (
          id, community_id, category_id, account_id, title, description, amount, expense_date, recorded_by, approved_by, status
        ) VALUES (
          ${expenseId}, 'comm-01', ${safeCategoryId}, ${accountId}, ${data.title},
          ${data.description || null}, ${data.amount}, ${data.expenseDate},
          ${safeRecordedBy}, 'user-ketua', 'APPROVED'
        )
      `;

      await neonSql`
        INSERT INTO ledger_entries (
          id, account_id, entry_date, direction, amount, source_type, source_id, description, created_by
        ) VALUES (
          ${'ledg-' + expenseId}, ${accountId}, ${data.expenseDate}, 'OUT',
          ${data.amount}, 'EXPENSE', ${expenseId}, ${data.title}, ${safeRecordedBy}
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

  try {
    await db.insert(schema.expenses).values({
      id: expenseId,
      communityId: 'comm-01',
      categoryId: safeCategoryId,
      accountId,
      title: data.title,
      description: data.description || null,
      amount: data.amount,
      expenseDate: data.expenseDate,
      recordedBy: 'user-admin',
      approvedBy: 'user-admin',
      status: 'APPROVED',
    });
  } catch (sqErr) {
    console.warn('SQLite expense fallback error:', sqErr);
  }

  return expenseId;
}

export async function deleteExpense(expenseId: string) {
  if (process.env.DATABASE_URL) {
    try {
      const rows = await neonSql`SELECT id, account_id, amount, title FROM expenses WHERE id = ${expenseId} LIMIT 1`;
      if (rows.length) {
        const exp = rows[0];
        const amount = Number(exp.amount) || 0;
        const accountId = exp.account_id || 'acc-main';

        // 1. Delete matching ledger entry
        await neonSql`DELETE FROM ledger_entries WHERE source_id = ${expenseId} OR id = ${'ledg-' + expenseId}`;

        // 2. Refund / restore account balance
        if (amount > 0 && accountId) {
          await neonSql`UPDATE accounts SET balance = balance + ${amount} WHERE id = ${accountId}`;
        }

        // 3. Delete expense record
        await neonSql`DELETE FROM expenses WHERE id = ${expenseId}`;

        return { success: true, id: expenseId };
      }
    } catch (e) {
      console.warn('Neon delete expense error:', e);
    }
  }

  try {
    await db.delete(schema.ledgerEntries).where(eq(schema.ledgerEntries.sourceId, expenseId));
    await db.delete(schema.expenses).where(eq(schema.expenses.id, expenseId));
    return { success: true, id: expenseId };
  } catch (e) {
    console.warn('SQLite delete expense error:', e);
    return { success: false, error: e };
  }
}

export async function deleteLedgerEntry(ledgerId: string) {
  if (process.env.DATABASE_URL) {
    try {
      const rows = await neonSql`SELECT id, account_id, direction, amount FROM ledger_entries WHERE id = ${ledgerId} LIMIT 1`;
      if (rows.length) {
        const entry = rows[0];
        const amount = Number(entry.amount) || 0;
        const accountId = entry.account_id;

        // Reverse balance
        if (accountId && amount > 0) {
          if (entry.direction === 'OUT') {
            await neonSql`UPDATE accounts SET balance = balance + ${amount} WHERE id = ${accountId}`;
          } else if (entry.direction === 'IN') {
            await neonSql`UPDATE accounts SET balance = balance - ${amount} WHERE id = ${accountId}`;
          }
        }

        await neonSql`DELETE FROM ledger_entries WHERE id = ${ledgerId}`;
        return { success: true, id: ledgerId };
      }
    } catch (e) {
      console.warn('Neon delete ledger error:', e);
    }
  }

  try {
    await db.delete(schema.ledgerEntries).where(eq(schema.ledgerEntries.id, ledgerId));
    return { success: true, id: ledgerId };
  } catch (e) {
    console.warn('SQLite delete ledger error:', e);
    return { success: false, error: e };
  }
}

// ================= RECURRING EXPENSES AUTOMATION =================

export interface RecurringExpenseConfigItem {
  id: string;
  title: string;
  amount: number;
  categoryId: string;
  categoryName: string;
  accountId: string;
  executionDay: number;
  vendor?: string;
  description?: string;
  isActive: boolean;
}

export const DEFAULT_RECURRING_CONFIG: RecurringExpenseConfigItem[] = [
  {
    id: 'rec-01',
    title: 'Honor Petugas Jaga & Keamanan 24 Jam (Pa Adri Harry)',
    amount: 1800000,
    categoryId: 'cat-keamanan',
    categoryName: 'Keamanan & Satpam',
    accountId: 'acc-main',
    executionDay: 25,
    vendor: 'Pa Adri Harry (Petugas Jaga)',
    description: 'Honor bulanan penjagaan gerbang utama & kontrol keamanan 14 kavling',
    isActive: true,
  },
  {
    id: 'rec-02',
    title: 'Iuran Retribusi Kebersihan & Pengangkutan Sampah',
    amount: 600000,
    categoryId: 'cat-kebersihan',
    categoryName: 'Kebersihan & Sanitasi',
    accountId: 'acc-main',
    executionDay: 5,
    vendor: 'Armada Sampah / Petugas Lingkungan',
    description: 'Biaya pengangkutan sampah rumah tangga komplek 3x seminggu',
    isActive: true,
  },
  {
    id: 'rec-03',
    title: 'Tagihan Listrik PLN (PJU Lingkungan & Pompa Air Fasum)',
    amount: 400000,
    categoryId: 'cat-listrik',
    categoryName: 'Listrik & Utilitas',
    accountId: 'acc-main',
    executionDay: 10,
    vendor: 'PT PLN (Persero)',
    description: 'Penerangan jalan umum 14 titik & pompa air otomatis fasum',
    isActive: true,
  },
  {
    id: 'rec-04',
    title: 'Pemeliharaan Taman, Potong Rumput & Drainase/Got',
    amount: 250000,
    categoryId: 'cat-pemeliharaan',
    categoryName: 'Pemeliharaan Lingkungan',
    accountId: 'acc-main',
    executionDay: 15,
    vendor: 'Pak Slamet / Tukang Taman',
    description: 'Perawatan taman fasum, pemotongan rumput jalan & pembersihan selokan',
    isActive: true,
  },
  {
    id: 'rec-05',
    title: 'Operasional Pos Satpam & Kuota Internet CCTV/Gate',
    amount: 100000,
    categoryId: 'cat-pemeliharaan',
    categoryName: 'Operasional Pos Satpam',
    accountId: 'acc-main',
    executionDay: 1,
    vendor: 'Telkomsel / Indihome Pos',
    description: 'Paket data CCTV online gerbang, buku mutasi & ATK pos',
    isActive: true,
  },
];

export async function getRecurringExpensesConfig(): Promise<RecurringExpenseConfigItem[]> {
  if (process.env.DATABASE_URL) {
    try {
      const rows = await neonSql`SELECT value FROM settings WHERE key = 'recurring_expenses_config' LIMIT 1`;
      if (rows.length && rows[0].value) {
        const parsed = JSON.parse(rows[0].value);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Neon get recurring config error:', e);
    }
  }

  try {
    const dbRows = await db.select().from(schema.settings).where(eq(schema.settings.key, 'recurring_expenses_config')).limit(1);
    if (dbRows.length && dbRows[0].value) {
      const parsed = JSON.parse(dbRows[0].value);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}

  return DEFAULT_RECURRING_CONFIG;
}

export async function saveRecurringExpensesConfig(items: RecurringExpenseConfigItem[]) {
  const jsonStr = JSON.stringify(items);
  if (process.env.DATABASE_URL) {
    try {
      await neonSql`
        INSERT INTO settings (id, community_id, key, value, description, updated_at)
        VALUES ('set-recurring-expenses', 'comm-01', 'recurring_expenses_config', ${jsonStr}, 'Konfigurasi Pos Pengeluaran Rutin Bulanan', NOW())
        ON CONFLICT (id) DO UPDATE SET value = ${jsonStr}, updated_at = NOW();
      `;
    } catch (e) {
      console.warn('Neon save recurring config error:', e);
    }
  }

  try {
    const existing = await db.select().from(schema.settings).where(eq(schema.settings.key, 'recurring_expenses_config')).limit(1);
    if (existing.length) {
      await db.update(schema.settings).set({ value: jsonStr, updatedAt: new Date().toISOString() }).where(eq(schema.settings.key, 'recurring_expenses_config'));
    } else {
      await db.insert(schema.settings).values({
        id: 'set-recurring-expenses',
        communityId: 'comm-01',
        key: 'recurring_expenses_config',
        value: jsonStr,
        description: 'Konfigurasi Pos Pengeluaran Rutin Bulanan',
      });
    }
  } catch (e) {
    console.warn('SQLite save recurring config error:', e);
  }

  return items;
}

export async function generateMonthlyRecurringExpenses(targetMonths?: string[]) {
  const config = await getRecurringExpensesConfig();
  const activeItems = config.filter((i) => i.isActive);

  const months = targetMonths && targetMonths.length > 0
    ? targetMonths
    : ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09'];

  let totalItemsCreated = 0;
  let totalDeducted = 0;
  const createdExpenses: any[] = [];

  for (const month of months) {
    // Get existing expenses in that month
    let existingTitles: string[] = [];
    if (process.env.DATABASE_URL) {
      try {
        const rows = await neonSql`SELECT title FROM expenses WHERE expense_date LIKE ${month + '%'}`;
        existingTitles = rows.map((r: any) => String(r.title).toLowerCase());
      } catch (e) {}
    } else {
      try {
        const allExp = await db.select({ title: schema.expenses.title, date: schema.expenses.expenseDate }).from(schema.expenses);
        existingTitles = allExp.filter(e => e.date?.startsWith(month)).map(e => e.title.toLowerCase());
      } catch (e) {}
    }

    for (const item of activeItems) {
      // Check if already booked for this month
      const isAlreadyBooked = existingTitles.some(t => 
        t.includes(item.title.toLowerCase()) || 
        (t.includes(item.id.toLowerCase()) && t.includes(month))
      );

      if (!isAlreadyBooked) {
        const safeDay = Math.min(Math.max(item.executionDay, 1), 28);
        const expenseDate = `${month}-${String(safeDay).padStart(2, '0')}`;
        const title = `${item.title} (Bulan ${month})`;

        const expenseId = await recordExpense({
          categoryId: item.categoryId || 'cat-operasional',
          accountId: item.accountId || 'acc-main',
          title,
          description: item.description || `Auto-Debit Pengeluaran Rutin Periode ${month}`,
          amount: item.amount,
          expenseDate,
          recordedBy: 'user-bendahara',
        });

        totalItemsCreated++;
        totalDeducted += item.amount;
        createdExpenses.push({
          id: expenseId,
          title,
          amount: item.amount,
          expenseDate,
          categoryName: item.categoryName,
          vendor: item.vendor,
          status: 'APPROVED',
        });
      }
    }
  }

  const newBalance = await getMainAccountBalance();

  return {
    success: true,
    totalItemsCreated,
    totalDeducted,
    newBalance,
    monthsProcessed: months,
    createdExpenses,
  };
}

