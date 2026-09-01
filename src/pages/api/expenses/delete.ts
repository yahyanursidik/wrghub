import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordAuditLog } from '../../../services/audit.service';

const deleteExpenseSchema = z.object({
  id: z.string().optional(),
  expenseId: z.string().optional(),
  title: z.string().optional(),
  amount: z.number().optional(),
  reason: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = deleteExpenseSchema.parse(body);
    const targetId = validated.expenseId || validated.id || '';

    if (!targetId) {
      throw new Error('ID pengeluaran wajib disertakan.');
    }

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
          id: validated.expenseId,
          message: `Catatan pengeluaran ${validated.expenseId} berhasil dibatalkan / dihapus.`
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
