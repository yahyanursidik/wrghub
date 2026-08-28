import type { APIRoute } from 'astro';
import { z } from 'zod';
import { neonSql } from '../../../db/neon';
import { db, schema } from '../../../db';
import { recordAuditLog } from '../../../services/audit.service';

const batchSchema = z.object({
  year: z.number().int().min(2025).max(2030),
  month: z.number().int().min(1).max(12),
  name: z.string(),
  dueDate: z.string(),
  feeAmount: z.number().positive().default(750000),
  createdBy: z.string().default('user-ketua'),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { year, month, name, dueDate, feeAmount, createdBy } = batchSchema.parse(body);

    const periodId = `period-${year}-${month.toString().padStart(2, '0')}`;
    const periodCode = `${year}${month.toString().padStart(2, '0')}`;

    if (process.env.DATABASE_URL) {
      // 1. Create or ensure billing period in Neon PostgreSQL
      await neonSql`
        INSERT INTO billing_periods (id, community_id, year, month, name, due_date, status)
        VALUES (${periodId}, 'comm-01', ${year}, ${month}, ${name}, ${dueDate}, 'OPEN')
        ON CONFLICT (id) DO UPDATE SET name = ${name}, due_date = ${dueDate};
      `;

      // 2. Fetch all properties
      const properties = await neonSql`SELECT id, code FROM properties WHERE is_active = true ORDER BY code ASC`;

      // 3. Generate invoices for all properties
      for (const prop of properties) {
        const invId = `inv-${prop.code.toLowerCase()}-${periodCode}`;
        const invNumber = `INV-${periodCode}-${prop.code.replace('-', '')}`;
        await neonSql`
          INSERT INTO invoices (
            id, property_id, billing_period_id, invoice_number, status, subtotal, total, paid_amount, due_date, issued_at
          ) VALUES (
            ${invId}, ${prop.id}, ${periodId}, ${invNumber}, 'UNPAID', ${feeAmount}, ${feeAmount}, 0, ${dueDate}, ${new Date().toISOString().substring(0, 10)}
          )
          ON CONFLICT (id) DO NOTHING;
        `;
        await neonSql`
          INSERT INTO invoice_items (id, invoice_id, fee_type_id, description, amount)
          VALUES (${'item-' + invId}, ${invId}, 'fee-ipl', ${'Iuran IPL ' + name}, ${feeAmount})
          ON CONFLICT (id) DO NOTHING;
        `;
      }

      await recordAuditLog({
        actorUserId: createdBy,
        actorName: 'Ketua / Pengurus Komplek',
        action: 'billing.generate_batch',
        entityType: 'BILLING_PERIOD',
        entityId: periodId,
        newValue: { periodName: name, totalInvoices: properties.length, feeAmount },
      });

      return new Response(
        JSON.stringify({
          data: {
            periodId,
            totalGenerated: properties.length,
            message: `Tagihan periode ${name} berhasil dibuat untuk ${properties.length} unit rumah.`,
          },
          meta: {},
          error: null,
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ data: { message: 'Tagihan batch dibuat.' } }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        data: null,
        error: { code: 'BATCH_GENERATION_FAILED', message: err.message || 'Gagal generate tagihan masal.' },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
