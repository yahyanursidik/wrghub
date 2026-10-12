import type { APIRoute } from 'astro';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db, schema } from '../../../db';
import { neonSql } from '../../../db/neon';
import { recordAuditLog } from '../../../services/audit.service';
import { authorizeApi, financeEditors } from '../../../lib/api-authorization';

const accountSchema = z.object({ id: z.string().optional(), name: z.string().min(2), code: z.string().min(2), type: z.enum(['BANK', 'CASH', 'SAVINGS', 'PETTY_CASH']), bankName: z.string().optional(), accountNumber: z.string().optional(), balance: z.number().nonnegative().default(0) });
export const POST: APIRoute = async (context) => {
  const authorization = await authorizeApi(context, financeEditors);
  if (authorization.response) return authorization.response;
  const { request } = context;
  try {
    const input = accountSchema.parse(await request.json());
    const id = input.id || `acc-${randomUUID()}`;
    let balance = input.balance;
    if (process.env.DATABASE_URL) {
      await neonSql.begin(async transaction => {
        if (input.id) {
          const rows = await transaction`UPDATE accounts SET name = ${input.name}, code = ${input.code}, type = ${input.type}, bank_name = ${input.bankName || null}, account_number = ${input.accountNumber || null} WHERE id = ${id} AND is_active = true RETURNING balance`;
          if (!rows.length) throw new Error('Rekening tidak ditemukan.');
          balance = Number(rows[0].balance);
        } else {
          await transaction`INSERT INTO accounts (id, community_id, name, code, type, bank_name, account_number, balance, is_active) VALUES (${id}, 'comm-01', ${input.name}, ${input.code}, ${input.type}, ${input.bankName || null}, ${input.accountNumber || null}, ${input.balance}, true)`;
          if (balance > 0) await transaction`INSERT INTO ledger_entries (id, account_id, entry_date, direction, amount, source_type, description) VALUES (${'led-' + randomUUID()}, ${id}, ${new Date().toISOString().slice(0, 10)}, 'IN', ${balance}, 'OPENING_BALANCE', ${'Saldo awal: ' + input.name})`;
        }
      });
    } else {
      await db.transaction(async transaction => {
        if (input.id) {
          const [account] = await transaction.select().from(schema.accounts).where(eq(schema.accounts.id, id));
          if (!account?.isActive) throw new Error('Rekening tidak ditemukan.');
          balance = account.balance;
          await transaction.update(schema.accounts).set({ name: input.name, code: input.code, type: input.type, bankName: input.bankName, accountNumber: input.accountNumber }).where(eq(schema.accounts.id, id));
        } else {
          await transaction.insert(schema.accounts).values({ ...input, id, communityId: 'comm-01' });
          if (balance > 0) await transaction.insert(schema.ledgerEntries).values({ id: 'led-' + randomUUID(), accountId: id, entryDate: new Date().toISOString().slice(0, 10), direction: 'IN', amount: balance, sourceType: 'OPENING_BALANCE', description: `Saldo awal: ${input.name}` });
        }
      });
    }
    await recordAuditLog({ actorName: 'Bendahara', action: input.id ? 'account.update' : 'account.create', entityType: 'ACCOUNT', entityId: id, newValue: { name: input.name, code: input.code } });
    return Response.json({ data: { ...input, id, balance }, error: null }, { status: input.id ? 200 : 201 });
  } catch (error) {
    return Response.json({ error: { message: error instanceof Error ? error.message : 'Rekening belum tersimpan.' } }, { status: 400 });
  }
};
