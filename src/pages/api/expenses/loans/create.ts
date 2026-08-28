import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordAuditLog } from '../../../../services/audit.service';

const createLoanSchema = z.object({
  staffName: z.string().min(2),
  staffRole: z.enum(['SATPAM', 'PETUGAS_KEBERSIHAN', 'PETUGAS_TAMAN', 'TEKNISI']).default('SATPAM'),
  staffPhone: z.string().optional(),
  totalLoanAmount: z.number().positive(),
  monthlyDeduction: z.number().positive(),
  loanDate: z.string().default(() => new Date().toISOString().slice(0, 10)),
  tenorMonths: z.number().min(1).default(3),
  purpose: z.string().min(3),
  approvedBy: z.string().default('Ketua RW & Bendahara'),
  notes: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = createLoanSchema.parse(body);

    const newLoan = {
      id: `LOAN-${Date.now()}`,
      staffName: validated.staffName,
      staffRole: validated.staffRole,
      staffPhone: validated.staffPhone || '0812-9988-7766',
      totalLoanAmount: validated.totalLoanAmount,
      remainingBalance: validated.totalLoanAmount,
      paidAmount: 0,
      monthlyDeduction: validated.monthlyDeduction,
      tenorMonths: validated.tenorMonths,
      loanDate: validated.loanDate,
      purpose: validated.purpose,
      approvedBy: validated.approvedBy,
      status: 'ACTIVE_INSTALLMENT', // 'ACTIVE_INSTALLMENT' | 'OVERDUE' | 'PAID_OFF'
      installments: [],
      notes: validated.notes || null,
      createdAt: new Date().toISOString(),
    };

    if (process.env.DATABASE_URL) {
      await recordAuditLog({
        actorName: 'Bendahara Komplek',
        action: 'staff.create_loan',
        entityType: 'STAFF_LOAN',
        entityId: newLoan.id,
        newValue: {
          staffName: validated.staffName,
          role: validated.staffRole,
          amount: validated.totalLoanAmount,
          purpose: validated.purpose,
          monthlyDeduction: validated.monthlyDeduction,
        },
      });
    }

    return new Response(
      JSON.stringify({
        data: newLoan,
        meta: {},
        error: null,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        data: null,
        error: { code: 'LOAN_CREATION_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
