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
  feeAmount: z.number().positive().default(250000),
  createdBy: z.string().default('user-ketua'),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { year, month, name, dueDate, feeAmount, createdBy } = batchSchema.parse(body);

    const monthStr = month.toString().padStart(2, '0');
    const periodId = `period-${year}-${monthStr}`;
    const periodCode = `${year}${monthStr}`;
    const issuedDate = `${year}-${monthStr}-01`;

    if (process.env.DATABASE_URL) {
      // 1. Create or ensure billing period in Neon PostgreSQL
      await neonSql`
        INSERT INTO billing_periods (id, community_id, year, month, name, due_date, status)
        VALUES (${periodId}, 'comm-01', ${year}, ${month}, ${name}, ${dueDate}, 'OPEN')
        ON CONFLICT (id) DO UPDATE SET name = ${name}, due_date = ${dueDate};
      `;

      // 2. Fetch all active properties (excluding inactive test properties)
      const properties = await neonSql`
        SELECT id, code, address FROM properties 
        WHERE is_active = true AND code NOT ILIKE '%dummy%' AND code != 'A-99'
        ORDER BY code ASC
      `;

      let newlyGenerated = 0;
      let alreadyExisting = 0;
      let alreadyPaid = 0;

      // 3. Generate invoices for all properties with strict duplicate checks
      for (const prop of properties) {
        const codeSlug = prop.code.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        const codeClean = prop.code.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
        const invId = `inv-${year}-${monthStr}-${codeSlug}`;
        const invNumber = `INV-${periodCode}-${codeClean}`;

        // Check if an invoice already exists for this property in this billing period
        const existing = await neonSql`
          SELECT id, status, paid_amount FROM invoices 
          WHERE property_id = ${prop.id} AND billing_period_id = ${periodId}
          LIMIT 1
        `;

        if (existing.length > 0) {
          alreadyExisting++;
          if (existing[0].status === 'PAID') {
            alreadyPaid++;
          }
          // Do NOT overwrite or duplicate existing invoice (especially not paid ones!)
          continue;
        }

        // Insert new invoice safely
        await neonSql`
          INSERT INTO invoices (
            id, property_id, billing_period_id, invoice_number, status, subtotal, total, paid_amount, due_date, issued_at
          ) VALUES (
            ${invId}, ${prop.id}, ${periodId}, ${invNumber}, 'UNPAID', ${feeAmount}, ${feeAmount}, 0, ${dueDate}, ${issuedDate}
          )
          ON CONFLICT (id) DO NOTHING;
        `;
        await neonSql`
          INSERT INTO invoice_items (id, invoice_id, fee_type_id, description, amount)
          VALUES (${'item-' + invId}, ${invId}, 'fee-ipl', ${'Iuran IPL ' + name}, ${feeAmount})
          ON CONFLICT (id) DO NOTHING;
        `;
        newlyGenerated++;
      }

      await recordAuditLog({
        actorUserId: createdBy,
        actorName: 'Ketua / Pengurus Komplek',
        action: 'billing.generate_batch',
        entityType: 'BILLING_PERIOD',
        entityId: periodId,
        newValue: { 
          periodName: name, 
          totalProperties: properties.length, 
          newlyGenerated, 
          alreadyExisting, 
          alreadyPaid, 
          feeAmount 
        },
      });

      const message = newlyGenerated > 0
        ? `Berhasil menerbitkan ${newlyGenerated} tagihan baru periode ${name}.${alreadyPaid > 0 ? ` (${alreadyPaid} kavling sudah lunas sebelumnya)` : ''}`
        : `Seluruh ${properties.length} unit kavling sudah memiliki tagihan periode ${name}.${alreadyPaid > 0 ? ` (${alreadyPaid} kavling sudah tercatat lunas)` : ''}`;

      return new Response(
        JSON.stringify({
          data: {
            periodId,
            totalProperties: properties.length,
            newlyGenerated,
            alreadyExisting,
            alreadyPaid,
            message,
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
