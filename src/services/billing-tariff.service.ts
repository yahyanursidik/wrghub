import { z } from 'zod';
import { query, writeTransaction, type Query } from '../db/operational-query';
import { BILLING_COMMUNITY_ID, type BillingTariff } from '../lib/billing-data';
import type { UserSession } from '../types/auth';
import { OperationalError, operationalAudit, textField } from './operational-mutation';

export const billingAmount = z.number().int().positive().max(1e9);
export const tariffInput = z.object({
  components: z.array(z.object({ name: textField(120).min(2), amount: billingAmount })).min(1).max(12),
  note: textField(500).default(''),
  dueDay: z.number().int().min(1).max(28).default(10),
}).refine(value => value.components.reduce((sum, part) => sum + part.amount, 0) <= 1e9, 'Total tarif melebihi batas.');

export function invoiceItemsForAmount(tariff: BillingTariff, total: number) {
  return tariff.total === total ? tariff.components : [{ name: 'Iuran lingkungan', amount: total }];
}

export async function lockBillingCommunity(run: Query, lock: string) {
  const [community] = await run('SELECT id FROM communities WHERE id=?' + lock, [BILLING_COMMUNITY_ID]);
  if (!community) throw new OperationalError('Profil lingkungan belum tersedia.');
}

function parseSetting(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  try { return JSON.parse(value); } catch { return undefined; }
}

export async function getBillingTariff(run: Query = query): Promise<BillingTariff> {
  const rows = await run<{key: string; value: unknown; updated_at: string | Date | null}>(
    "SELECT key,value,updated_at FROM settings WHERE key IN ('billing_tariff','community_profile')");
  const stored = rows.find(row => row.key === 'billing_tariff');
  if (stored) {
    const parsed = tariffInput.safeParse(parseSetting(stored.value));
    if (!parsed.success) throw new OperationalError('Konfigurasi tarif tersimpan tidak valid. Periksa pengaturan iuran.');
    return { ...parsed.data, total: parsed.data.components.reduce((sum, part) => sum + part.amount, 0),
      updatedAt: stored.updated_at instanceof Date ? stored.updated_at.toISOString() : stored.updated_at };
  }

  const profile = parseSetting(rows.find(row => row.key === 'community_profile')?.value) as {monthlyRate?: number} | undefined;
  const existing = billingAmount.safeParse(profile?.monthlyRate);
  const total = existing.success ? existing.data : 250000;
  return { components: [{ name: 'Iuran lingkungan', amount: total }], note: '', total, dueDay:10, updatedAt: null };
}

export async function saveBillingTariff(input: z.output<typeof tariffInput>, actor: UserSession) {
  return writeTransaction(async (run, lock) => {
    await lockBillingCommunity(run, lock);
    const now = new Date().toISOString();
    await run(`INSERT INTO settings (id,community_id,key,value,description,updated_at) VALUES (?,?,?,?,?,?)
      ON CONFLICT (key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at`,
      ['setting-billing-tariff',BILLING_COMMUNITY_ID,'billing_tariff',JSON.stringify(input),'Tarif iuran untuk tagihan baru',now]);
    await operationalAudit(run,actor,'billing.update_tariff','SETTING','billing_tariff',input);
    return getBillingTariff(run);
  });
}
