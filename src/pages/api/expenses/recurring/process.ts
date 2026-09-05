import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordExpense, getMainAccountBalance } from '../../../../services/finance.service';
import { recordAuditLog } from '../../../../services/audit.service';

const recurringItemSchema = z.object({
  id: z.string(),
  title: z.string().min(2),
  amount: z.number().positive(),
  categoryId: z.string().default('cat-operasional'),
  categoryName: z.string().optional(),
  accountId: z.string().default('acc-main'),
  description: z.string().optional(),
  executionDay: z.number().min(1).max(31).default(1),
  vendor: z.string().optional(),
});

const processRecurringSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  items: z.array(recurringItemSchema).min(1),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = processRecurringSchema.parse(body);

    const processedItems = [];
    let totalDeducted = 0;

    for (const item of validated.items) {
      // Ensure valid day for the given month
      const safeDay = Math.min(Math.max(item.executionDay, 1), 28);
      const expenseDate = `${validated.month}-${String(safeDay).padStart(2, '0')}`;
      
      const fullTitle = item.title.includes(validated.month) 
        ? item.title 
        : `${item.title} (Bulan ${validated.month})`;

      const expenseId = await recordExpense({
        categoryId: item.categoryId || 'cat-operasional',
        accountId: item.accountId || 'acc-main',
        title: fullTitle,
        description: item.description || `Auto-Debit Pengeluaran Rutin Periode ${validated.month}${item.vendor ? ` - Vendor: ${item.vendor}` : ''}`,
        amount: item.amount,
        expenseDate,
        recordedBy: 'Auto-Debit Rutin',
      });

      processedItems.push({
        id: item.id,
        expenseId,
        title: fullTitle,
        amount: item.amount,
        expenseDate,
      });

      totalDeducted += item.amount;
    }

    if (process.env.DATABASE_URL) {
      await recordAuditLog({
        actorName: 'Sistem Auto-Debit',
        action: 'finance.process_recurring_expenses',
        entityType: 'EXPENSE',
        entityId: `recurring-${validated.month}`,
        newValue: {
          month: validated.month,
          totalItems: processedItems.length,
          totalDeducted,
        },
      });
    }

    const currentBalance = await getMainAccountBalance();

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          month: validated.month,
          processedCount: processedItems.length,
          totalDeducted,
          newBalance: currentBalance,
          items: processedItems,
        },
        message: `Berhasil memproses ${processedItems.length} pos pengeluaran rutin bulan ${validated.month}. Total Rp ${totalDeducted.toLocaleString('id-ID')} telah dibukukan dan memotong saldo kas.`,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Process recurring error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof z.ZodError ? error.issues : (error?.message || 'Gagal memproses pengeluaran rutin'),
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
