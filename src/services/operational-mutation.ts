import { randomUUID } from 'node:crypto';
import type { APIContext } from 'astro';
import { z } from 'zod';
import type { Query } from '../db/operational-query';
import type { UserSession } from '../types/auth';

export class OperationalError extends Error {
  constructor(message: string, readonly status = 409) { super(message); }
}

export const idField = z.string().trim().min(1).max(64);
export const dateField = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
  const parsed = new Date(value + 'T00:00:00.000Z');
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}, 'Tanggal tidak valid.');
export const textField = (max = 255) => z.string().trim().max(max);
export const archiveInput = z.object({ id: idField.optional(), ids: z.array(idField).min(1).max(100).optional(), reason: textField(500).optional() });

export async function operationalAudit(run: Query, actor: UserSession, action: string, entityType: string, entityId: string, details: unknown) {
  await run(`INSERT INTO audit_logs (id, actor_user_id, actor_name, action, entity_type, entity_id, new_value_json)
    VALUES (?, ?, ?, ?, ?, ?, ?)`, [`aud-${randomUUID()}`, actor.id, actor.fullName, action, entityType, entityId, JSON.stringify(details)]);
}

export function mutation<S extends z.ZodTypeAny>(input: S, action: (data: z.output<S>, actor: UserSession) => Promise<unknown>, status = 200) {
  return async ({ request, session }: APIContext) => {
    const actor = await session?.get('wargahub_user') as UserSession | undefined;
    if (!actor) return Response.json({ error: { message: 'Silakan masuk kembali.' } }, { status: 401 });
    const parsed = input.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return Response.json({ error: { message: parsed.error.issues.map(issue => issue.path.join('.') + ': ' + issue.message).join('; ') } }, { status: 400 });
    try { return Response.json({ data: await action(parsed.data, actor), error: null }, { status }); }
    catch (error) {
      if (error instanceof OperationalError) return Response.json({ error: { message: error.message } }, { status: error.status });
      // Database exceptions can contain personal input. Keep raw parameters out of application logs.
      console.error('Operational mutation failed', error instanceof Error ? error.name : typeof error);
      return Response.json({ error: { message: 'Perubahan belum tersimpan. Coba lagi.' } }, { status: 503 });
    }
  };
}

export function requiredIds(input: { id?: string; ids?: string[] }) {
  const values = [...new Set(input.ids || (input.id ? [input.id] : []))];
  if (!values.length) throw new OperationalError('Pilih data yang akan diarsipkan.', 400);
  return values;
}
