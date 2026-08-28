import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordAuditLog } from '../../../services/audit.service';

const updateExpenseSchema = z.object({
  expenseId: z.string().min(1),
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

    if (process.env.DATABASE_URL) {
      await recordAuditLog({
        actorName: 'Bendahara Komplek',
        action: 'finance.update_expense',
        entityType: 'EXPENSE',
        entityId: validated.expenseId,
        newValue: {
          expenseId: validated.expenseId,
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
