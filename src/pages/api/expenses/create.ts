import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordExpense } from '../../../services/finance.service';
import { recordAuditLog } from '../../../services/audit.service';

const expenseSchema = z.object({
  categoryId: z.string().default('cat-pemeliharaan'),
  categoryName: z.string().optional(),
  accountId: z.string().default('acc-main'),
  title: z.string().min(3),
  description: z.string().optional(),
  amount: z.number().positive(),
  vendor: z.string().optional(),
  proofUrl: z.string().optional(),
  paymentMethod: z.string().default('TRANSFER_BCA'),
  voucherNo: z.string().optional(),
  expenseDate: z.string().default(() => new Date().toISOString().substring(0, 10)),
  recordedBy: z.string().default('user-bendahara'),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = expenseSchema.parse(body);
    const id = await recordExpense(validated);

    if (process.env.DATABASE_URL) {
      await recordAuditLog({
        actorName: 'Bendahara Komplek',
        action: 'finance.record_expense',
        entityType: 'EXPENSE',
        entityId: id || `exp-${Date.now()}`,
        newValue: {
          title: validated.title,
          amount: validated.amount,
          category: validated.categoryName || validated.categoryId,
          vendor: validated.vendor || 'Pengadaan Mandiri',
          expenseDate: validated.expenseDate,
        },
      });
    }

    return new Response(
      JSON.stringify({
        data: {
          id: id || `exp-${Date.now()}`,
          title: validated.title,
          amount: validated.amount,
          categoryName: validated.categoryName || 'Pemeliharaan',
          vendor: validated.vendor || 'Pengadaan Mandiri',
          voucherNo: validated.voucherNo || `BKK-${Date.now().toString().slice(-4)}`,
          expenseDate: validated.expenseDate,
          status: 'APPROVED',
          message: 'Pengeluaran kas berhasil dicatat dan diverifikasi.'
        },
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
