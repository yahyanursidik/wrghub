import type { APIRoute } from 'astro';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { writeTransaction } from '../../../db/operational-query';
import { dateField, mutation, operationalAudit, OperationalError, textField } from '../../../services/operational-mutation';

const input = z.object({
  year: z.number().int().min(2025).max(2100),
  month: z.number().int().min(1).max(12),
  name: textField(100).min(2),
  dueDate: dateField,
  feeAmount: z.number().int().positive().max(1e9).default(250000),
});

export const POST: APIRoute = mutation(input, (data, actor) => writeTransaction(async (run, lock) => {
  const communityId = 'comm-01';
  if (!(await run('SELECT id FROM communities WHERE id=?' + lock, [communityId])).length) {
    throw new OperationalError('Profil lingkungan belum tersedia.');
  }
  const month = String(data.month).padStart(2, '0');
  const issuedDate = `${data.year}-${month}-01`;
  if (data.dueDate < issuedDate) throw new OperationalError('Jatuh tempo mendahului awal periode.', 400);
  const existingPeriods = await run<{id:string;name:string;due_date:string;status:string}>(
    'SELECT id,name,due_date,status FROM billing_periods WHERE community_id=? AND year=? AND month=? ORDER BY id LIMIT 2',
    [communityId,data.year,data.month]);
  if (existingPeriods.length > 1) throw new OperationalError('Periode ganda perlu direkonsiliasi sebelum penerbitan.');
  const period = existingPeriods[0];
  if (period && period.status !== 'OPEN') throw new OperationalError('Periode ini sudah ditutup.');
  const periodId = period?.id || `period-${data.year}-${month}`;
  const name = period?.name || data.name;
  const dueDate = period?.due_date || data.dueDate;
  if (!period) await run(`INSERT INTO billing_periods (id,community_id,year,month,name,due_date,status)
    VALUES (?,?,?,?,?,?,'OPEN')`, [periodId,communityId,data.year,data.month,name,dueDate]);
  const properties = await run<{id:string;code:string}>(`SELECT id,code FROM properties
    WHERE community_id=? AND is_active=true AND lower(code) NOT LIKE '%dummy%' AND code<>'A-99' ORDER BY code,id`, [communityId]);
  const feeType = (await run<{id:string}>('SELECT id FROM fee_types WHERE id=? AND community_id=?', ['fee-ipl',communityId]))[0]?.id || null;
  let newlyGenerated = 0, alreadyExisting = 0, alreadyPaid = 0;
  for (const property of properties) {
    const [existing] = await run<{status:string}>('SELECT status FROM invoices WHERE billing_period_id=? AND property_id=? ORDER BY id LIMIT 1', [periodId,property.id]);
    if (existing) {
      alreadyExisting++;
      if (existing.status === 'PAID') alreadyPaid++;
      continue;
    }
    const id = 'inv-' + randomUUID();
    const code = property.code.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const invoiceNumber = `INV-${data.year}${month}-${code}-${id.slice(4,12).toUpperCase()}`;
    await run(`INSERT INTO invoices (id,property_id,billing_period_id,invoice_number,status,subtotal,total,paid_amount,due_date,issued_at)
      VALUES (?,?,?,?,'UNPAID',?,?,0,?,?)`, [id,property.id,periodId,invoiceNumber,data.feeAmount,data.feeAmount,dueDate,issuedDate]);
    await run('INSERT INTO invoice_items (id,invoice_id,fee_type_id,description,amount) VALUES (?,?,?,?,?)',
      ['item-'+id,id,feeType,'Iuran IPL '+name,data.feeAmount]);
    newlyGenerated++;
  }
  const result = { periodId, totalProperties: properties.length, newlyGenerated, alreadyExisting, alreadyPaid };
  if (newlyGenerated) await operationalAudit(run,actor,'billing.generate_batch','BILLING_PERIOD',periodId,{...result,feeAmount:data.feeAmount});
  return { ...result, message: newlyGenerated ? `${newlyGenerated} tagihan diterbitkan untuk ${name}.` : `Tidak ada tagihan baru untuk ${name}.` };
}), 201);
