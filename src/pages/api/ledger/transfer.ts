import type { APIRoute } from 'astro';
import { z } from 'zod';
import { transferBetweenAccounts } from '../../../services/manual-ledger.service';
import { recordAuditLog } from '../../../services/audit.service';
import { authorizeApi, financeEditors } from '../../../lib/api-authorization';

const inputSchema = z.object({ fromAccountId: z.string().min(1), toAccountId: z.string().min(1), amount: z.number().positive(), description: z.string().min(3), entryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) });
export const POST: APIRoute = async (context) => {
  const authorization = await authorizeApi(context, financeEditors);
  if (authorization.response) return authorization.response;
  const { request } = context;
  try {
    const input = inputSchema.parse(await request.json());
    const data = await transferBetweenAccounts(input);
    await recordAuditLog({ actorName: 'Bendahara', action: 'finance.transfer', entityType: 'INTERNAL_TRANSFER', entityId: data.transferId, newValue: input });
    return Response.json({ data, error: null }, { status: 201 });
  } catch (error) {
    return Response.json({ error: { message: error instanceof Error ? error.message : 'Mutasi belum dibukukan.' } }, { status: 400 });
  }
};
