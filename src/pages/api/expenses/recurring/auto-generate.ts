import type { APIRoute } from 'astro';
import { z } from 'zod';
import { generateMonthlyRecurringExpenses } from '../../../../services/finance.service';
import { recordAuditLog } from '../../../../services/audit.service';

const autoGenSchema = z.object({
  months: z.array(z.string().regex(/^\d{4}-\d{2}$/)).optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    let targetMonths: string[] | undefined;
    try {
      const body = await request.json();
      const validated = autoGenSchema.parse(body);
      targetMonths = validated.months;
    } catch (e) {
      // If no body passed, defaults will be used
    }

    const result = await generateMonthlyRecurringExpenses(targetMonths);

    if (process.env.DATABASE_URL && result.totalItemsCreated > 0) {
      await recordAuditLog({
        actorName: 'Sistem Auto-Posting Rutin',
        action: 'finance.auto_generate_recurring_expenses',
        entityType: 'EXPENSE',
        entityId: `auto-gen-${Date.now()}`,
        newValue: {
          monthsProcessed: result.monthsProcessed,
          totalItemsCreated: result.totalItemsCreated,
          totalDeducted: result.totalDeducted,
        },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: result,
        message: result.totalItemsCreated > 0
          ? `Berhasil membukukan otomatis ${result.totalItemsCreated} pos pengeluaran rutin untuk ${result.monthsProcessed.length} bulan. Saldo kas telah terpotong sebesar Rp ${result.totalDeducted.toLocaleString('id-ID')}.`
          : `Semua pos pengeluaran rutin untuk ${result.monthsProcessed.length} bulan terpilih sudah tercatat sebelumnya. Tidak ada duplikasi pos.`,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Auto generate recurring error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message || 'Gagal memproses otomatisasi pengeluaran rutin',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
