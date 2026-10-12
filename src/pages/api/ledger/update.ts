import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordAuditLog } from '../../../services/audit.service';
import { updateManualLedgerEntry } from '../../../services/manual-ledger.service';
import { authorizeApi, financeEditors } from '../../../lib/api-authorization';

const updateLedgerSchema = z.object({
  ledgerId: z.string().min(1),
  description: z.string().optional(),
  amount: z.number().optional(),
  direction: z.enum(['IN', 'OUT']).optional(),
  entryDate: z.string().optional(),
  accountId: z.string().optional(),
});

export const POST: APIRoute = async (context) => {
  const authorization = await authorizeApi(context, financeEditors);
  if (authorization.response) return authorization.response;
  const { request } = context;
  try {
    const body = await request.json();
    const validated = updateLedgerSchema.parse(body);
    await updateManualLedgerEntry(validated.ledgerId, validated);

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
