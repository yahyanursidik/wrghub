import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordAuditLog } from '../../../services/audit.service';
import { createManualLedgerEntry } from '../../../services/manual-ledger.service';
import { authorizeApi, financeEditors } from '../../../lib/api-authorization';

const createLedgerSchema = z.object({
  accountId: z.string().default('acc-main'),
  accountName: z.string().optional(),
  entryDate: z.string().default(() => new Date().toISOString().slice(0, 10)),
  direction: z.enum(['IN', 'OUT']).default('IN'),
  amount: z.number().positive(),
  sourceType: z.string().default('MANUAL_JOURNAL'),
  description: z.string().min(3),
  referenceNo: z.string().optional(),
  createdBy: z.string().default('user-bendahara'),
});

export const POST: APIRoute = async (context) => {
  const authorization = await authorizeApi(context, financeEditors);
  if (authorization.response) return authorization.response;
  const { request } = context;
  try {
    const body = await request.json();
    const validated = createLedgerSchema.parse(body);

    const newEntry = await createManualLedgerEntry({ ...validated, createdBy: authorization.user!.id });

    if (process.env.DATABASE_URL) {
      await recordAuditLog({
        actorName: 'Bendahara Komplek',
        action: 'finance.record_ledger',
        entityType: 'LEDGER_ENTRY',
        entityId: newEntry.id,
        newValue: {
          direction: validated.direction,
          amount: validated.amount,
          description: validated.description,
          account: validated.accountName || validated.accountId,
          date: validated.entryDate,
        },
      });
    }

    return new Response(
      JSON.stringify({
        data: newEntry,
        meta: {},
        error: null,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        data: null,
        error: { code: 'LEDGER_CREATION_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
