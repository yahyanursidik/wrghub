import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordAuditLog } from '../../../../services/audit.service';

const deleteLoanSchema = z.object({
  id: z.string().optional(),
  loanId: z.string().optional(),
  ids: z.array(z.string()).optional(),
  staffName: z.string().optional(),
  reason: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = deleteLoanSchema.parse(body);
    const targetIds = validated.ids && validated.ids.length > 0 
      ? validated.ids 
      : [validated.loanId || validated.id || ''].filter(Boolean);

    if (targetIds.length === 0) {
      throw new Error('ID pinjaman/kasbon wajib disertakan.');
    }

    if (process.env.DATABASE_URL) {
      await recordAuditLog({
        actorName: 'Bendahara Komplek',
        action: 'staff.delete_loan',
        entityType: 'STAFF_LOAN',
        entityId: targetIds[0] || 'bulk',
        newValue: {
          loanIds: targetIds,
          staffName: validated.staffName,
          reason: validated.reason || 'Dihapus dari buku kasbon petugas',
          deletedAt: new Date().toISOString(),
        },
      });
    }

    return new Response(
      JSON.stringify({
        data: {
          success: true,
          ids: targetIds,
          message: `Sebanyak ${targetIds.length} data kasbon berhasil dihapus.`
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
        error: { code: 'LOAN_DELETE_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
