import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordAuditLog } from '../../../services/audit.service';

const deleteLedgerSchema = z.object({
  id: z.string().optional(),
  ledgerId: z.string().optional(),
  description: z.string().optional(),
  amount: z.number().optional(),
  reason: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = deleteLedgerSchema.parse(body);
    const targetId = validated.ledgerId || validated.id || '';

    if (!targetId) {
      throw new Error('ID entri jurnal wajib disertakan.');
    }

    if (process.env.DATABASE_URL) {
      await recordAuditLog({
        actorName: 'Bendahara Komplek',
        action: 'finance.delete_ledger',
        entityType: 'LEDGER_ENTRY',
        entityId: targetId,
        newValue: {
          ledgerId: targetId,
          description: validated.description,
          amount: validated.amount,
          reason: validated.reason || 'Dibatalkan / Dihapus dari jurnal kas',
          deletedAt: new Date().toISOString(),
        },
      });
    }

    return new Response(
      JSON.stringify({
        data: {
          success: true,
          id: validated.ledgerId,
          message: `Entri jurnal ${validated.ledgerId} berhasil dibatalkan / dihapus.`
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
        error: { code: 'LEDGER_DELETE_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
