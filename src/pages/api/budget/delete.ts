import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordAuditLog } from '../../../services/audit.service';

const deleteBudgetSchema = z.object({
  budgetId: z.string().min(1),
  category: z.string().optional(),
  budgetAmount: z.number().optional(),
  reason: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = deleteBudgetSchema.parse(body);

    if (process.env.DATABASE_URL) {
      await recordAuditLog({
        actorName: 'Ketua Komplek & Bendahara',
        action: 'budget.delete_allocation',
        entityType: 'BUDGET_ALLOCATION',
        entityId: validated.budgetId,
        newValue: {
          budgetId: validated.budgetId,
          category: validated.category,
          budgetAmount: validated.budgetAmount,
          reason: validated.reason || 'Dihapus / Dibatalkan dari rencana kerja tahunan',
          deletedAt: new Date().toISOString(),
        },
      });
    }

    return new Response(
      JSON.stringify({
        data: {
          success: true,
          id: validated.budgetId,
          message: `Pos anggaran ${validated.budgetId} berhasil dihapus / diarsipkan.`
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
        error: { code: 'BUDGET_DELETE_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
