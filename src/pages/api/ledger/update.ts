import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordAuditLog } from '../../../services/audit.service';

const updateLedgerSchema = z.object({
  ledgerId: z.string().min(1),
  description: z.string().optional(),
  amount: z.number().optional(),
  direction: z.enum(['IN', 'OUT']).optional(),
  entryDate: z.string().optional(),
  accountId: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = updateLedgerSchema.parse(body);

    if (process.env.DATABASE_URL) {
      await recordAuditLog({
        actorName: 'Bendahara Komplek',
        action: 'finance.update_ledger',
        entityType: 'LEDGER_ENTRY',
        entityId: validated.ledgerId,
        newValue: {
          ledgerId: validated.ledgerId,
          description: validated.description,
          amount: validated.amount,
          direction: validated.direction,
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
        error: { code: 'LEDGER_UPDATE_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
