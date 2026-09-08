import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordAuditLog } from '../../../services/audit.service';
import { updateExpense } from '../../../services/finance.service';

const updateExpenseSchema = z.object({
  id: z.string().optional(),
  expenseId: z.string().optional(),
  title: z.string().optional(),
  categoryName: z.string().optional(),
  amount: z.number().optional(),
  vendor: z.string().optional(),
  expenseDate: z.string().optional(),
  description: z.string().optional(),
  status: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = updateExpenseSchema.parse(body);
    const targetId = validated.id || validated.expenseId;
    if (!targetId) {
      throw new Error('ID pengeluaran kas (id / expenseId) wajib disertakan');
    }

    await updateExpense({
      id: targetId,
      title: validated.title,
      categoryName: validated.categoryName,
      amount: validated.amount,
      vendor: validated.vendor,
      expenseDate: validated.expenseDate,
      description: validated.description,
      status: validated.status,
    });

    if (process.env.DATABASE_URL) {
      await recordAuditLog({
        actorName: 'Bendahara Komplek',
        action: 'finance.update_expense',
        entityType: 'EXPENSE',
        entityId: targetId,
        newValue: {
          expenseId: targetId,
          title: validated.title,
          amount: validated.amount,
          category: validated.categoryName,
          updatedAt: new Date().toISOString(),
        },
      });
    }

    return new Response(
      JSON.stringify({
        data: {
          success: true,
          ...validated,
          id: targetId,
          updatedAt: new Date().toISOString(),
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
        error: { code: 'EXPENSE_UPDATE_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
