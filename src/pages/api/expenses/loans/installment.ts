import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordAuditLog } from '../../../../services/audit.service';

const loanInstallmentSchema = z.object({
  loanId: z.string().min(1),
  staffName: z.string().optional(),
  installmentAmount: z.number().positive(),
  paymentMethod: z.enum(['POTONG_GAJI', 'TUNAI_CASH', 'TRANSFER_BCA']).default('POTONG_GAJI'),
  installmentDate: z.string().default(() => new Date().toISOString().slice(0, 10)),
  notes: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = loanInstallmentSchema.parse(body);

    if (process.env.DATABASE_URL) {
      await recordAuditLog({
        actorName: 'Bendahara Komplek',
        action: 'staff.pay_loan_installment',
        entityType: 'STAFF_LOAN',
        entityId: validated.loanId,
        newValue: {
          loanId: validated.loanId,
          staffName: validated.staffName,
          amountPaid: validated.installmentAmount,
          method: validated.paymentMethod,
          date: validated.installmentDate,
        },
      });
    }

    return new Response(
      JSON.stringify({
        data: {
          success: true,
          loanId: validated.loanId,
          amountPaid: validated.installmentAmount,
          method: validated.paymentMethod,
          paidAt: validated.installmentDate,
          message: `Cicilan kasbon sebesar Rp ${validated.installmentAmount.toLocaleString('id-ID')} berhasil dicatat.`
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
        error: { code: 'INSTALLMENT_RECORD_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
