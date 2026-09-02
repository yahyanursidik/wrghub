import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordAuditLog } from '../../../../services/audit.service';

const updateLoanSchema = z.object({
  loanId: z.string().min(1),
  staffName: z.string().optional(),
  staffRole: z.string().optional(),
  totalLoanAmount: z.number().optional(),
  monthlyDeduction: z.number().optional(),
  tenorMonths: z.number().optional(),
  purpose: z.string().optional(),
  status: z.enum(['ACTIVE_INSTALLMENT', 'PAID_OFF', 'PENDING_APPROVAL', 'OVERDUE']).optional(),
  notes: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = updateLoanSchema.parse(body);

    if (process.env.DATABASE_URL) {
      await recordAuditLog({
        actorName: 'Bendahara Komplek',
        action: 'staff.update_loan',
        entityType: 'STAFF_LOAN',
        entityId: validated.loanId,
        newValue: {
          ...validated,
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
        error: { code: 'LOAN_UPDATE_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
