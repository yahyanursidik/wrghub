import type { APIRoute } from 'astro';
import { z } from 'zod';
import { deleteExpense, deleteExpenses } from '../../../services/finance.service';
import { recordAuditLog } from '../../../services/audit.service';

const deleteExpenseSchema = z.object({
  id: z.string().optional(),
  expenseId: z.string().optional(),
  ids: z.array(z.string()).optional(),
  title: z.string().optional(),
  amount: z.number().optional(),
  totalAmount: z.number().optional(),
  reason: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = deleteExpenseSchema.parse(body);

    // Bulk deletion
    if (validated.ids && Array.isArray(validated.ids) && validated.ids.length > 0) {
      const ids = validated.ids;
      const result = await deleteExpenses(ids);

      if (process.env.DATABASE_URL) {
        await recordAuditLog({
          actorName: 'Bendahara Komplek',
          action: 'finance.bulk_delete_expenses',
          entityType: 'EXPENSE',
          entityId: ids.slice(0, 5).join(',') + (ids.length > 5 ? `... (+${ids.length - 5})` : ''),
          newValue: {
            count: ids.length,
            ids,
            totalAmount: validated.totalAmount,
            reason: validated.reason || 'Penghapusan massal data pengeluaran',
            deletedAt: new Date().toISOString(),
          },
        });
      }

      return new Response(
        JSON.stringify({
          data: {
            success: true,
            count: result.count,
            ids,
            message: `Sebanyak ${result.count} data pengeluaran berhasil dihapus dan kas telah disesuaikan.`
          },
          meta: {},
          error: null,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Single deletion
    const targetId = validated.expenseId || validated.id || '';

    if (!targetId) {
      throw new Error('ID pengeluaran wajib disertakan.');
    }

    // Delete from Neon / SQLite database and reverse balance & ledger
    const deleteResult = await deleteExpense(targetId);

    if (process.env.DATABASE_URL) {
      await recordAuditLog({
        actorName: 'Bendahara Komplek',
        action: 'finance.delete_expense',
        entityType: 'EXPENSE',
        entityId: targetId,
        newValue: {
          expenseId: targetId,
          title: validated.title,
          amount: validated.amount,
          reason: validated.reason || 'Dibatalkan / Dihapus dari buku kas pengeluaran',
          deletedAt: new Date().toISOString(),
        },
      });
    }

    return new Response(
      JSON.stringify({
        data: {
          success: true,
          id: targetId,
          message: `Catatan pengeluaran ${targetId} berhasil dibatalkan / dihapus.`
        },
        meta: {},
        error: null,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        data: null,
        error: { code: 'EXPENSE_DELETE_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
