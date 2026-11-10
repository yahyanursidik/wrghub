import { query, type Query } from '../db/operational-query';
import { BILLING_COMMUNITY_ID, jakartaDate, type TariffComponent } from '../lib/billing-data';

export interface BillingPeriod {
  id: string;
  name: string;
  year: number;
  month: number;
  status: string;
  dueDate: string;
}

export interface BillingInvoice {
  id: string;
  invoiceNumber: string;
  propertyId: string;
  propertyCode: string;
  areaLabel: string;
  billingPeriodId: string;
  billingPeriodName: string;
  status: string;
  total: number;
  paidAmount: number;
  dueDate: string;
  issuedAt: string;
  paidAt: string | null;
  paymentMethod: string;
  notes: string | null;
  ownerName: string;
  residentName: string;
  legalOwner: string;
  occupancyStatus: string;
  statusLabel: string;
  items?: TariffComponent[];
  pendingPaymentId?: string | null;
}

export async function getBillingPeriods(): Promise<BillingPeriod[]> {
  const rows = await query<BillingPeriod & {due_date: string}>(
    'SELECT id,name,year,month,status,due_date FROM billing_periods ORDER BY year DESC,month DESC,id');
  return rows.map(({id,name,year,month,status,due_date}) => ({id,name,year,month,status,dueDate:due_date}));
}

export function selectBillingPeriod(periods: BillingPeriod[], period?: string | null, today = jakartaDate()) {
  const [year, month] = today.split('-').map(Number);
  return periods.find(item => period && (item.id === period || item.name === period))
    || periods.find(item => item.year === year && item.month === month)
    || periods.find(item => item.status === 'OPEN')
    || periods[0];
}

export async function getCurrentBillingPeriod() {
  return selectBillingPeriod(await getBillingPeriods()) || null;
}

export function getBillableProperties(run: Query = query) {
  return run<{id:string;code:string}>(`SELECT id,code FROM properties WHERE community_id=? AND is_active=true
    AND lower(code) NOT LIKE '%dummy%' AND code<>'A-99' ORDER BY code,id`,[BILLING_COMMUNITY_ID]);
}

type InvoiceRow = {
  id: string; invoice_number: string; property_id: string | null; property_code: string | null; area_label: string | null;
  billing_period_id: string | null; period_name: string | null; status: string; total: number | string; paid_amount: number | string;
  due_date: string; issued_at: string; paid_at: string | null; payment_method: string | null; notes: string | null;
  occupancy_status: string | null; property_notes: string | null; owner_name: string | null; occupant_name: string | null;
  pending_payment_id?: string | null;
  item_id?: string | null; item_name?: string; item_amount?: number | string;
};

export async function getInvoices(billingPeriodId?: string, options: {details?: boolean; propertyId?: string} = {}): Promise<BillingInvoice[]> {
  const target = billingPeriodId || (await getCurrentBillingPeriod())?.id;
  if (!target) return [];
  const conditions: string[] = [];
  const parameters: string[] = [];
  if (target !== 'ALL') { conditions.push('i.billing_period_id=?'); parameters.push(target); }
  if (options.propertyId) { conditions.push('i.property_id=?'); parameters.push(options.propertyId); }
  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  const paymentMatch = '(pm.invoice_id=i.id OR (pm.invoice_id IS NULL AND pm.property_id=i.property_id AND pm.billing_period_id=i.billing_period_id))';
  const rows = await query<InvoiceRow>(`SELECT i.id,i.invoice_number,i.property_id,p.code AS property_code,b.name AS area_label,
      i.billing_period_id,bp.name AS period_name,i.status,i.total,i.paid_amount,i.due_date,i.issued_at,i.paid_at,i.notes,
      p.occupancy_status,p.notes AS property_notes,
      (SELECT pm.method FROM payments pm WHERE pm.status='VERIFIED' AND ${paymentMatch} ORDER BY pm.paid_at DESC,pm.id LIMIT 1) AS payment_method,
      (SELECT person.name FROM property_ownerships po JOIN persons person ON person.id=po.person_id
        WHERE po.property_id=p.id AND po.is_active=true AND po.ended_at IS NULL AND person.is_active=true
        ORDER BY po.started_at DESC,po.id LIMIT 1) AS owner_name,
      (SELECT person.name FROM occupancies o JOIN household_members m ON m.household_id=o.household_id JOIN persons person ON person.id=m.person_id
        WHERE o.property_id=p.id AND o.is_active=true AND o.ended_at IS NULL AND m.is_active=true AND m.ended_at IS NULL
        AND person.is_active=true AND m.relationship IN ('HEAD','KEPALA_KELUARGA')
        ORDER BY o.started_at DESC,m.id LIMIT 1) AS occupant_name
      ${options.details ? `,(SELECT pm.id FROM payments pm WHERE pm.status='PENDING' AND ${paymentMatch} ORDER BY pm.created_at,pm.id LIMIT 1) AS pending_payment_id,
        item.id AS item_id,item.description AS item_name,item.amount AS item_amount` : ''}
      FROM invoices i LEFT JOIN properties p ON p.id=i.property_id LEFT JOIN blocks b ON b.id=p.block_id
      LEFT JOIN billing_periods bp ON bp.id=i.billing_period_id
      ${options.details ? 'LEFT JOIN invoice_items item ON item.invoice_id=i.id' : ''} ${where}
      ORDER BY p.code,i.issued_at DESC,i.id${options.details ? ',item.created_at,item.id' : ''}`, parameters);

  const byId = new Map<string,BillingInvoice>();
  for (const row of rows) {
    const part = row.item_id && row.item_name!==undefined ? {name:row.item_name,amount:Number(row.item_amount)} : undefined;
    const current = byId.get(row.id);
    if (current) {
      if (part) current.items?.push(part);
      continue;
    }
    const legalOwner = row.owner_name || row.property_notes?.match(/Pemilik:\s*([^|]+)/)?.[1]?.trim() || '';
    const occupancyStatus = row.occupancy_status || '';
    const occupant = row.occupant_name || row.property_notes?.match(/Kepala Keluarga:\s*([^|]+)/)?.[1]?.trim();
    const resident = occupancyStatus === 'VACANT' ? legalOwner
      : occupant || (occupancyStatus === 'RENTED' ? '' : legalOwner);
    byId.set(row.id,{
      id:row.id,invoiceNumber:row.invoice_number,propertyId:row.property_id || '',propertyCode:row.property_code || '—',
      areaLabel:row.area_label || '',billingPeriodId:row.billing_period_id || '',billingPeriodName:row.period_name || row.billing_period_id || '',
      status:row.status,total:Number(row.total),paidAmount:Number(row.paid_amount),dueDate:row.due_date,
      issuedAt:row.issued_at,paidAt:row.paid_at,paymentMethod:row.payment_method || '',notes:row.notes,
      ownerName:resident,residentName:resident,legalOwner,occupancyStatus,
      statusLabel:occupancyStatus === 'VACANT' ? 'Kosong' : occupancyStatus === 'RENTED' ? 'Penyewa' : 'Penghuni',
      ...(options.details ? {items:part ? [part] : [],pendingPaymentId:row.pending_payment_id} : {}),
    });
  }
  return [...byId.values()];
}

export function getAllInvoices() {
  return getInvoices('ALL');
}

export async function getBillingProgress(billingPeriodId: string) {
  const [row] = await query<{total:number|string;paid_count:number|string;total_amount:number|string;paid_amount:number|string}>(
    "SELECT count(*) AS total, sum(CASE WHEN status='PAID' THEN 1 ELSE 0 END) AS paid_count, "+
    "sum(total) AS total_amount, sum(CASE WHEN status='PAID' THEN total ELSE paid_amount END) AS paid_amount "+
    "FROM invoices WHERE billing_period_id=? AND status NOT IN ('CANCELLED','VOID','WAIVED')", [billingPeriodId]);
  const total = Number(row?.total || 0), paidCount = Number(row?.paid_count || 0);
  const totalAmount = Number(row?.total_amount || 0), paidAmount = Number(row?.paid_amount || 0);
  return {total,paidCount,unpaidCount:total-paidCount,percentage:total ? Math.round(paidCount*100/total) : 0,
    totalAmount,paidAmount,unpaidAmount:Math.max(0,totalAmount-paidAmount),monthlyRatePerHouse:total ? Math.round(totalAmount/total) : 0};
}
