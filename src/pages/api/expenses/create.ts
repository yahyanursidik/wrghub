import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordExpense } from '../../../services/finance.service';

const expenseSchema = z.object({
  categoryId: z.string().default('cat-pemeliharaan'),
  accountId: z.string().default('acc-main'),
  title: z.string().min(3),
  description: z.string().optional(),
  amount: z.number().positive(),
  expenseDate: z.string().default(() => new Date().toISOString().substring(0, 10)),
  recordedBy: z.string().default('user-bendahara'),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = expenseSchema.parse(body);
    const id = await recordExpense(validated);

    return new Response(
      JSON.stringify({
        data: { id, message: 'Pengeluaran berhasil dicatat dan arus kas diperbarui.' },
        meta: {},
        error: null,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        data: null,
        error: { code: 'EXPENSE_CREATION_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
