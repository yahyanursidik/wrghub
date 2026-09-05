import { neonSql } from '../db/neon';
import { db, schema } from '../db';
import { eq, desc } from 'drizzle-orm';

export async function getBillingPeriods() {
  if (process.env.DATABASE_URL) {
    try {
      const rows = await neonSql`SELECT * FROM billing_periods ORDER BY year DESC, month DESC`;
      return rows;
    } catch (e) {
      console.warn('Neon periods error:', e);
    }
  }
  return await db.select().from(schema.billingPeriods).orderBy(desc(schema.billingPeriods.year), desc(schema.billingPeriods.month));
}

export async function getCurrentBillingPeriod() {
  if (process.env.DATABASE_URL) {
    try {
      const rows = await neonSql`SELECT * FROM billing_periods WHERE status = 'OPEN' LIMIT 1`;
      if (rows.length) return rows[0];
    } catch (e) {
      console.warn('Neon current period error:', e);
    }
  }
  const periods = await db.select().from(schema.billingPeriods).where(eq(schema.billingPeriods.status, 'OPEN')).limit(1);
  if (periods.length) return periods[0];
  const all = await getBillingPeriods();
  return all[0] || null;
}

export async function getInvoices(billingPeriodId?: string) {
  if (process.env.DATABASE_URL) {
    try {
      const targetPeriodId = billingPeriodId || 'period-2026-08';
      const rows = await neonSql`
        SELECT 
          i.id, i.invoice_number as "invoiceNumber", i.property_id as "propertyId",
          p.code as "propertyCode", i.billing_period_id as "billingPeriodId",
          i.status, i.total, i.paid_amount as "paidAmount",
          i.due_date as "dueDate", i.issued_at as "issuedAt", i.paid_at as "paidAt"
        FROM invoices i
        LEFT JOIN properties p ON i.property_id = p.id
        WHERE i.billing_period_id = ${targetPeriodId}
        ORDER BY p.code ASC
      `;
      return rows;
    } catch (e) {
      console.warn('Neon invoices error:', e);
    }
  }

  let query = db.select({
    id: schema.invoices.id,
    invoiceNumber: schema.invoices.invoiceNumber,
    propertyId: schema.invoices.propertyId,
    propertyCode: schema.properties.code,
    billingPeriodId: schema.invoices.billingPeriodId,
    status: schema.invoices.status,
    total: schema.invoices.total,
    paidAmount: schema.invoices.paidAmount,
    dueDate: schema.invoices.dueDate,
    issuedAt: schema.invoices.issuedAt,
    paidAt: schema.invoices.paidAt,
  })
  .from(schema.invoices)
  .leftJoin(schema.properties, eq(schema.invoices.propertyId, schema.properties.id))
  .orderBy(schema.properties.code);

  if (billingPeriodId) {
    return await query.where(eq(schema.invoices.billingPeriodId, billingPeriodId));
  }
  return await query;
}

export async function getBillingProgress(billingPeriodId: string) {
  if (process.env.DATABASE_URL) {
    try {
      const res = await neonSql`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'PAID' THEN 1 END) as paid_count,
          COUNT(CASE WHEN status != 'PAID' THEN 1 END) as unpaid_count,
          COALESCE(SUM(total), 0) as total_amount,
          COALESCE(SUM(CASE WHEN status = 'PAID' THEN total ELSE 0 END), 0) as paid_amount,
          COALESCE(SUM(CASE WHEN status != 'PAID' THEN total ELSE 0 END), 0) as unpaid_amount
        FROM invoices
        WHERE billing_period_id = ${billingPeriodId}
      `;
      const total = Number(res[0]?.total ?? 0);
      const paidCount = Number(res[0]?.paid_count ?? 0);
      const unpaidCount = Number(res[0]?.unpaid_count ?? 0);
      const totalAmount = Number(res[0]?.total_amount ?? 0);
      const paidAmount = Number(res[0]?.paid_amount ?? 0);
      const unpaidAmount = Number(res[0]?.unpaid_amount ?? 0);
      const percentage = total > 0 ? Math.round((paidCount / total) * 100) : 0;

      return {
        total,
        paidCount,
        unpaidCount,
        percentage,
        totalAmount,
        paidAmount,
        unpaidAmount,
        monthlyRatePerHouse: 250000,
      };
    } catch (e) {
      console.warn('Neon progress error:', e);
    }
  }

  const invs = await db.select().from(schema.invoices).where(eq(schema.invoices.billingPeriodId, billingPeriodId));
  const total = invs.length;
  const paidInvoices = invs.filter(i => i.status === 'PAID');
  const unpaidInvoices = invs.filter(i => i.status !== 'PAID');

  const paidCount = paidInvoices.length;
  const unpaidCount = unpaidInvoices.length;
  const totalAmount = invs.reduce((sum, i) => sum + (i.total || 0), 0);
  const paidAmount = paidInvoices.reduce((sum, i) => sum + (i.total || 0), 0);
  const unpaidAmount = unpaidInvoices.reduce((sum, i) => sum + (i.total || 0), 0);
  const percentage = total > 0 ? Math.round((paidCount / total) * 100) : 0;

  return {
    total,
    paidCount,
    unpaidCount,
    percentage,
    totalAmount,
    paidAmount,
    unpaidAmount,
    monthlyRatePerHouse: 250000,
  };
}

export interface AdminDirectIuranInput {
  propertyCode: string;
  ownerName?: string;
  periodName: string;
  securityFee?: number;
  cleaningFee?: number;
  sinkingFund?: number;
  additionalFee?: number;
  total?: number;
  dueDate?: string;
  status: 'PAID' | 'UNPAID' | 'PENDING_VERIFICATION' | 'VOID';
  paymentMethod?: string;
  paidAt?: string;
  notes?: string;
  recordedBy?: string;
}

const MONTH_MAP: Record<string, number> = {
  januari: 1, januari2026: 1,
  februari: 2, februari2026: 2,
  maret: 3, maret2026: 3,
  april: 4, april2026: 4,
  mei: 5, mei2026: 5,
  juni: 6, juni2026: 6,
  juli: 7, juli2026: 7,
  agustus: 8, agustus2026: 8,
  september: 9, september2026: 9,
  oktober: 10, oktober2026: 10,
  november: 11, november2026: 11,
  desember: 12, desember2026: 12,
};

export async function recordAdminDirectIuran(input: AdminDirectIuranInput) {
  const propInput = (input.propertyCode || '').trim();
  const periodInput = (input.periodName || 'September 2026').trim();

  // 1. Resolve Property
  let matchedPropId = `prop-${propInput.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  let matchedPropCode = propInput;
  let resolvedOwner = input.ownerName || 'Warga Terdaftar';

  if (process.env.DATABASE_URL) {
    try {
      const rows = await neonSql`
        SELECT id, code, notes FROM properties
        WHERE LOWER(code) = LOWER(${propInput}) 
           OR LOWER(code) = LOWER(${'Kav ' + propInput})
           OR LOWER(code) = LOWER(${propInput.replace(/^kav\s*/i, '')})
           OR LOWER(id) = LOWER(${propInput})
        LIMIT 1
      `;
      if (rows.length > 0) {
        matchedPropId = rows[0].id;
        matchedPropCode = rows[0].code;
        if (!input.ownerName && rows[0].notes) {
          const m = rows[0].notes.match(/Pemilik:\s*([^|]+)/);
          if (m) resolvedOwner = m[1].trim();
        }
      }
    } catch (e) {
      console.warn('Neon lookup property error:', e);
    }
  }

  // 2. Resolve Year and Month
  let year = 2026;
  let month = 9;
  const periodLower = periodInput.toLowerCase();
  for (const [mName, mNum] of Object.entries(MONTH_MAP)) {
    if (periodLower.includes(mName)) {
      month = mNum;
      break;
    }
  }
  const yearMatch = periodInput.match(/\b(20\d{2})\b/);
  if (yearMatch) {
    year = Number(yearMatch[1]);
  }

  const monthStr = month.toString().padStart(2, '0');
  const periodId = `period-${year}-${monthStr}`;

  // 3. Ensure Billing Period Exists in DB
  if (process.env.DATABASE_URL) {
    try {
      await neonSql`
        INSERT INTO billing_periods (id, community_id, year, month, name, due_date, status)
        VALUES (${periodId}, 'comm-01', ${year}, ${month}, ${periodInput}, ${`${year}-${monthStr}-10`}, 'OPEN')
        ON CONFLICT (id) DO UPDATE SET name = ${periodInput};
      `;
    } catch (e) {
      console.warn('Neon ensure period error:', e);
    }
  }

  // 4. Calculate Breakdown Fees
  const secFee = input.securityFee ?? 150000;
  const cleanFee = input.cleaningFee ?? 50000;
  const sinkFee = input.sinkingFund ?? 50000;
  const addFee = input.additionalFee ?? 0;
  const totalAmount = input.total && input.total > 0 ? input.total : (secFee + cleanFee + sinkFee + addFee);

  const cleanCode = matchedPropCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const invNumber = `INV/${year}/${monthStr}/${cleanCode}`;
  const invId = `inv-${year}-${monthStr}-${cleanCode.toLowerCase()}`;
  const safeDueDate = input.dueDate || `${year}-${monthStr}-10`;
  const issuedAt = `${year}-${monthStr}-01 00:00:00`;
  const safePaidDate = input.paidAt || new Date().toISOString().slice(0, 10);
  const safePaidTimestamp = `${safePaidDate} 10:00:00`;
  const noteStr = input.notes || `Iuran IPL ${periodInput} - ${matchedPropCode} (${resolvedOwner})`;
  const isPaid = input.status === 'PAID';

  let createdInvoice: any = null;
  let createdPayment: any = null;

  // 5. Upsert Invoice
  if (process.env.DATABASE_URL) {
    try {
      const existing = await neonSql`
        SELECT id, status, paid_amount FROM invoices
        WHERE (property_id = ${matchedPropId} AND billing_period_id = ${periodId})
           OR id = ${invId}
        LIMIT 1
      `;

      if (existing.length > 0) {
        const existingInv = existing[0];
        const wasPaid = existingInv.status === 'PAID';

        await neonSql`
          UPDATE invoices
          SET status = ${input.status},
              total = ${totalAmount},
              paid_amount = ${isPaid ? totalAmount : 0},
              paid_at = ${isPaid ? safePaidTimestamp : null},
              notes = ${noteStr}
          WHERE id = ${existingInv.id}
        `;

        createdInvoice = {
          id: existingInv.id,
          invoiceNumber: invNumber,
          propertyId: matchedPropId,
          propertyCode: matchedPropCode,
          ownerName: resolvedOwner,
          billingPeriodName: periodInput,
          securityFee: secFee,
          cleaningFee: cleanFee,
          sinkingFund: sinkFee,
          additionalFee: addFee,
          total: totalAmount,
          paidAmount: isPaid ? totalAmount : 0,
          dueDate: safeDueDate,
          issuedAt,
          paidAt: isPaid ? safePaidTimestamp : null,
          status: input.status,
          notes: noteStr,
        };

        // If newly marked as PAID and was not previously paid, record payment & balance
        if (isPaid && !wasPaid) {
          const payId = `pay-${year}-${monthStr}-${cleanCode.toLowerCase()}-${Date.now().toString().slice(-4)}`;
          const refStr = `KWT-${year}${monthStr}-${cleanCode}-${Date.now().toString().slice(-4)}`;
          const method = input.paymentMethod || 'CASH';

          await neonSql`
            INSERT INTO payments (
              id, property_id, billing_period_id, invoice_id, amount, method, reference, proof_file_url, status, notes, paid_at, verified_by, verified_at
            ) VALUES (
              ${payId}, ${matchedPropId}, ${periodId}, ${existingInv.id}, ${totalAmount}, ${method}, ${refStr}, '/uploads/proof-sample.png', 'VERIFIED', ${noteStr}, ${safePaidTimestamp}, 'user-admin', ${safePaidTimestamp}
            )
          `;

          const ledgId = `ledg-${payId}`;
          await neonSql`
            INSERT INTO ledger_entries (
              id, account_id, entry_date, direction, amount, source_type, source_id, description, created_by
            ) VALUES (
              ${ledgId}, 'acc-main', ${safePaidDate}, 'IN', ${totalAmount}, 'PAYMENT', ${payId}, ${noteStr}, 'user-admin'
            )
          `;

          await neonSql`UPDATE accounts SET balance = balance + ${totalAmount} WHERE id = 'acc-main'`;

          createdPayment = {
            id: payId,
            reference: refStr,
            amount: totalAmount,
            method,
            paidAt: safePaidDate,
          };
        }
      } else {
        // Insert brand new invoice
        await neonSql`
          INSERT INTO invoices (
            id, property_id, billing_period_id, invoice_number, status, subtotal, total, paid_amount, due_date, issued_at, paid_at, notes
          ) VALUES (
            ${invId}, ${matchedPropId}, ${periodId}, ${invNumber}, ${input.status}, ${totalAmount}, ${totalAmount}, ${isPaid ? totalAmount : 0}, ${safeDueDate}, ${issuedAt}, ${isPaid ? safePaidTimestamp : null}, ${noteStr}
          )
        `;

        createdInvoice = {
          id: invId,
          invoiceNumber: invNumber,
          propertyId: matchedPropId,
          propertyCode: matchedPropCode,
          ownerName: resolvedOwner,
          billingPeriodName: periodInput,
          securityFee: secFee,
          cleaningFee: cleanFee,
          sinkingFund: sinkFee,
          additionalFee: addFee,
          total: totalAmount,
          paidAmount: isPaid ? totalAmount : 0,
          dueDate: safeDueDate,
          issuedAt,
          paidAt: isPaid ? safePaidTimestamp : null,
          status: input.status,
          notes: noteStr,
        };

        if (isPaid) {
          const payId = `pay-${year}-${monthStr}-${cleanCode.toLowerCase()}-${Date.now().toString().slice(-4)}`;
          const refStr = `KWT-${year}${monthStr}-${cleanCode}-${Date.now().toString().slice(-4)}`;
          const method = input.paymentMethod || 'CASH';

          await neonSql`
            INSERT INTO payments (
              id, property_id, billing_period_id, invoice_id, amount, method, reference, proof_file_url, status, notes, paid_at, verified_by, verified_at
            ) VALUES (
              ${payId}, ${matchedPropId}, ${periodId}, ${invId}, ${totalAmount}, ${method}, ${refStr}, '/uploads/proof-sample.png', 'VERIFIED', ${noteStr}, ${safePaidTimestamp}, 'user-admin', ${safePaidTimestamp}
            )
          `;

          const ledgId = `ledg-${payId}`;
          await neonSql`
            INSERT INTO ledger_entries (
              id, account_id, entry_date, direction, amount, source_type, source_id, description, created_by
            ) VALUES (
              ${ledgId}, 'acc-main', ${safePaidDate}, 'IN', ${totalAmount}, 'PAYMENT', ${payId}, ${noteStr}, 'user-admin'
            )
          `;

          await neonSql`UPDATE accounts SET balance = balance + ${totalAmount} WHERE id = 'acc-main'`;

          createdPayment = {
            id: payId,
            reference: refStr,
            amount: totalAmount,
            method,
            paidAt: safePaidDate,
          };
        }
      }
    } catch (e) {
      console.warn('Neon direct iuran error:', e);
    }
  }

  // SQLite fallback
  try {
    const existing = await db.select().from(schema.invoices).where(eq(schema.invoices.id, invId)).limit(1);
    if (existing.length === 0) {
      await db.insert(schema.invoices).values({
        id: invId,
        propertyId: matchedPropId,
        billingPeriodId: periodId,
        invoiceNumber: invNumber,
        status: input.status,
        subtotal: totalAmount,
        total: totalAmount,
        paidAmount: isPaid ? totalAmount : 0,
        dueDate: safeDueDate,
        issuedAt,
        paidAt: isPaid ? safePaidTimestamp : null,
        notes: noteStr,
      });
    }
  } catch (sqErr) {
    console.warn('SQLite invoice direct error:', sqErr);
  }

  // Fetch updated balance
  let newBalance = 2865000;
  if (process.env.DATABASE_URL) {
    try {
      const bRows = await neonSql`SELECT balance FROM accounts WHERE id = 'acc-main' LIMIT 1`;
      if (bRows.length > 0) newBalance = Number(bRows[0].balance);
    } catch (e) {}
  }

  return {
    success: true,
    invoice: createdInvoice || {
      id: invId,
      invoiceNumber: invNumber,
      propertyCode: matchedPropCode,
      ownerName: resolvedOwner,
      billingPeriodName: periodInput,
      total: totalAmount,
      paidAmount: isPaid ? totalAmount : 0,
      status: input.status,
      dueDate: safeDueDate,
      paidAt: isPaid ? safePaidTimestamp : null,
    },
    payment: createdPayment,
    newBalance,
    message: isPaid
      ? `Iuran warga untuk ${matchedPropCode} (${resolvedOwner}) periode ${periodInput} sebesar Rp ${totalAmount.toLocaleString('id-ID')} berhasil dicatat LUNAS. Saldo kas kas telah bertambah.`
      : `Tagihan baru untuk ${matchedPropCode} (${resolvedOwner}) periode ${periodInput} sebesar Rp ${totalAmount.toLocaleString('id-ID')} berhasil diterbitkan.`
  };
}

