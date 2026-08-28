import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordAuditLog } from '../../../services/audit.service';

const updateBudgetSchema = z.object({
  budgetId: z.string().min(1),
  category: z.string().optional(),
  budgetAmount: z.number().optional(),
  actualAmount: z.number().optional(),
  pic: z.string().optional(),
  notes: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = updateBudgetSchema.parse(body);

    if (process.env.DATABASE_URL) {
      await recordAuditLog({
        actorName: 'Ketua Komplek & Bendahara',
        action: 'budget.update_allocation',
        entityType: 'BUDGET_ALLOCATION',
        entityId: validated.budgetId,
        newValue: {
          budgetId: validated.budgetId,
          category: validated.category,
          budgetAmount: validated.budgetAmount,
          actualAmount: validated.actualAmount,
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
        error: { code: 'BUDGET_UPDATE_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
