import type { APIRoute } from 'astro';
import { z } from 'zod';
import {
  getRecurringExpensesConfig,
  saveRecurringExpensesConfig,
} from '../../../../services/finance.service';
import { recordAuditLog } from '../../../../services/audit.service';

export const GET: APIRoute = async () => {
  try {
    const config = await getRecurringExpensesConfig();
    return new Response(JSON.stringify({ success: true, data: config }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error?.message || 'Gagal memuat konfigurasi' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

const itemSchema = z.object({
  id: z.string(),
  title: z.string().min(2),
  amount: z.number().positive(),
  categoryId: z.string().default('cat-operasional'),
  categoryName: z.string().default('Operasional'),
  accountId: z.string().default('acc-main'),
  executionDay: z.number().min(1).max(31).default(1),
  vendor: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

const saveConfigSchema = z.object({
  items: z.array(itemSchema).min(1),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = saveConfigSchema.parse(body);

    const saved = await saveRecurringExpensesConfig(validated.items);

    if (process.env.DATABASE_URL) {
      await recordAuditLog({
        actorName: 'Bendahara / Pengurus Komplek',
        action: 'finance.update_recurring_config',
        entityType: 'RECURRING_EXPENSE',
        entityId: 'recurring-config',
        newValue: {
          totalItems: saved.length,
          totalMonthlyBudget: saved.filter((i) => i.isActive).reduce((a, b) => a + b.amount, 0),
        },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: saved,
        message: 'Pengaturan pos pengeluaran rutin bulanan berhasil disimpan ke database.',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof z.ZodError ? error.issues : (error?.message || 'Gagal menyimpan pengaturan'),
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
