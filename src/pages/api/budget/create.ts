import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordAuditLog } from '../../../services/audit.service';

const createBudgetSchema = z.object({
  category: z.string().min(3),
  period: z.string().default('Agustus 2026'),
  budgetAmount: z.number().positive(),
  actualAmount: z.number().default(0),
  pic: z.string().default('Seksi Sarana / Bendahara'),
  notes: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = createBudgetSchema.parse(body);

    const percentage = validated.budgetAmount > 0 ? (validated.actualAmount / validated.budgetAmount) * 100 : 0;
    const variance = validated.budgetAmount - validated.actualAmount;
    const status = percentage > 100 ? 'EXCEEDED' : percentage >= 85 ? 'WARNING' : 'SAFE';

    const newBudgetItem = {
      id: `BUD-${Date.now()}`,
      category: validated.category,
      period: validated.period,
      budgetAmount: validated.budgetAmount,
      actualAmount: validated.actualAmount,
      percentage: Number(percentage.toFixed(1)),
      variance,
      status,
      pic: validated.pic,
      notes: validated.notes || null,
      authCode: `APPR-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
    };

    if (process.env.DATABASE_URL) {
      await recordAuditLog({
        actorName: 'Ketua Komplek & Bendahara',
        action: 'budget.create_allocation',
        entityType: 'BUDGET_ALLOCATION',
        entityId: newBudgetItem.id,
        newValue: {
          category: validated.category,
          budgetAmount: validated.budgetAmount,
          period: validated.period,
          pic: validated.pic,
        },
      });
    }

    return new Response(
      JSON.stringify({
        data: newBudgetItem,
        meta: {},
        error: null,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        data: null,
        error: { code: 'BUDGET_CREATION_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
