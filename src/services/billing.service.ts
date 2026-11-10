import { query } from '../db/operational-query';
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
      const isAll = billingPeriodId === 'ALL';
      const targetPeriodId = billingPeriodId || 'period-2026-08';
      const rows = isAll
        ? await neonSql`
          SELECT 
            i.id, i.invoice_number as "invoiceNumber", i.property_id as "propertyId",
            p.code as "propertyCode", COALESCE(b.name, 'Grand Sariwangi') as "areaLabel",
            i.billing_period_id as "billingPeriodId",
            bp.name as "billingPeriodName",
            i.status, i.total, i.paid_amount as "paidAmount",
            i.due_date as "dueDate", i.issued_at as "issuedAt", i.paid_at as "paidAt",
            COALESCE(
              (SELECT pm.method FROM payments pm WHERE pm.invoice_id = i.id OR (pm.property_id = i.property_id AND pm.billing_period_id = i.billing_period_id) LIMIT 1),
              'TRANSFER'
            ) as "paymentMethod",
            i.notes,
            p.occupancy_status as "occupancyStatus",
            p.notes as "propertyNotes",
            (SELECT per.name FROM property_ownerships po 
             JOIN persons per ON po.person_id = per.id 
             WHERE po.property_id = p.id AND po.is_active = true 
             LIMIT 1) as "rawOwnerName",
            (SELECT per.name FROM occupancies occ 
             JOIN household_members hm ON occ.household_id = hm.household_id 
             JOIN persons per ON hm.person_id = per.id 
             WHERE occ.property_id = p.id AND occ.is_active = true 
             LIMIT 1) as "rawOccupantName"
          FROM invoices i
          LEFT JOIN properties p ON i.property_id = p.id
          LEFT JOIN blocks b ON p.block_id = b.id
          LEFT JOIN billing_periods bp ON i.billing_period_id = bp.id
          ORDER BY p.code ASC, i.issued_at DESC
        `
        : await neonSql`
          SELECT 
            i.id, i.invoice_number as "invoiceNumber", i.property_id as "propertyId",
            p.code as "propertyCode", COALESCE(b.name, 'Grand Sariwangi') as "areaLabel",
            i.billing_period_id as "billingPeriodId",
            bp.name as "billingPeriodName",
            i.status, i.total, i.paid_amount as "paidAmount",
            i.due_date as "dueDate", i.issued_at as "issuedAt", i.paid_at as "paidAt",
            COALESCE(
              (SELECT pm.method FROM payments pm WHERE pm.invoice_id = i.id OR (pm.property_id = i.property_id AND pm.billing_period_id = i.billing_period_id) LIMIT 1),
              'TRANSFER'
            ) as "paymentMethod",
            i.notes,
            p.occupancy_status as "occupancyStatus",
            p.notes as "propertyNotes",
            (SELECT per.name FROM property_ownerships po 
             JOIN persons per ON po.person_id = per.id 
             WHERE po.property_id = p.id AND po.is_active = true 
             LIMIT 1) as "rawOwnerName",
            (SELECT per.name FROM occupancies occ 
             JOIN household_members hm ON occ.household_id = hm.household_id 
             JOIN persons per ON hm.person_id = per.id 
             WHERE occ.property_id = p.id AND occ.is_active = true 
             LIMIT 1) as "rawOccupantName"
          FROM invoices i
          LEFT JOIN properties p ON i.property_id = p.id
          LEFT JOIN blocks b ON p.block_id = b.id
          LEFT JOIN billing_periods bp ON i.billing_period_id = bp.id
          WHERE i.billing_period_id = ${targetPeriodId}
          ORDER BY p.code ASC
        `;

      return rows.map((r: any) => {
        const ownerFromNotes = r.propertyNotes ? (r.propertyNotes.match(/Pemilik:\s*([^|]+)/)?.[1]?.trim() || null) : null;
        const occupantFromNotes = r.propertyNotes ? (r.propertyNotes.match(/Kepala Keluarga:\s*([^|]+)/)?.[1]?.trim() || null) : null;
        const legalOwner = r.rawOwnerName || ownerFromNotes || 'Warga';

        let resident = legalOwner;
        if (r.occupancyStatus === 'RENTED') {
          resident = r.rawOccupantName || occupantFromNotes || 'Penyewa';
        } else if (r.occupancyStatus === 'VACANT') {
          resident = `${legalOwner} (Kosong)`;
        } else {
          resident = r.rawOccupantName || occupantFromNotes || legalOwner;
        }

        if ((!resident || resident === 'Warga' || resident === 'Penyewa') && r.notes) {
          const m = r.notes.match(/\(([^)]+)\)/);
          if (m && !m[1].toLowerCase().includes('bambang sutrisno') && !m[1].toLowerCase().includes('yahya nursidik') && !m[1].toLowerCase().includes('kepala komplek')) {
            resident = m[1].trim();
          }
        }

        return {
          id: r.id,
          invoiceNumber: r.invoiceNumber,
          propertyId: r.propertyId,
          propertyCode: r.propertyCode,
          areaLabel: r.areaLabel,
          billingPeriodId: r.billingPeriodId,
          billingPeriodName: r.billingPeriodName || r.billingPeriodId,
          status: r.status,
          total: Number(r.total),
          paidAmount: Number(r.paidAmount),
          dueDate: r.dueDate,
          issuedAt: r.issuedAt,
          paidAt: r.paidAt,
          paymentMethod: r.paymentMethod,
          notes: r.notes,
          ownerName: resident,
          residentName: resident,
          legalOwner,
          occupancyStatus: r.occupancyStatus,
          statusLabel: r.occupancyStatus === 'RENTED' ? 'Penyewa / Kontrak' : (r.occupancyStatus === 'VACANT' ? 'Kosong' : 'Penghuni'),
        };
      });
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

  if (billingPeriodId && billingPeriodId !== 'ALL') {
    return await query.where(eq(schema.invoices.billingPeriodId, billingPeriodId));
  }
  return await query;
}

export async function getAllInvoices() {
  return await getInvoices('ALL');
}

export async function getBillingProgress(billingPeriodId: string) {
  const [row] = await query<{total:number|string;paid_count:number|string;total_amount:number|string;paid_amount:number|string}>(
    "SELECT count(*) AS total, sum(CASE WHEN status='PAID' THEN 1 ELSE 0 END) AS paid_count, "+
    "sum(total) AS total_amount, sum(CASE WHEN status='PAID' THEN total ELSE paid_amount END) AS paid_amount "+
    "FROM invoices WHERE billing_period_id=? AND status NOT IN ('CANCELLED','VOID','WAIVED')", [billingPeriodId]);
  const total=Number(row.total || 0), paidCount=Number(row.paid_count || 0);
  const totalAmount=Number(row.total_amount || 0), paidAmount=Number(row.paid_amount || 0);
  return {total,paidCount,unpaidCount:total-paidCount,percentage:total ? Math.round(paidCount*100/total) : 0,
    totalAmount,paidAmount,unpaidAmount:Math.max(0,totalAmount-paidAmount),monthlyRatePerHouse:250000};
}
