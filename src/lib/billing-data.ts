export const BILLING_MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'] as const;
export const BILLING_COMMUNITY_ID = 'comm-01';

const jakartaCalendar = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit',
});

export function jakartaDate(value: string | Date = new Date()) {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : jakartaCalendar.format(date);
}

export function billingMonthKey(year: number, month: number) {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function billingMonthLabel(year: number, month: number) {
  return `${BILLING_MONTHS[month - 1]} ${year}`;
}

export function defaultInvoiceDueDate(month: string, day: number) {
  return month ? `${month}-${String(day).padStart(2,'0')}` : '';
}

export function invoiceIsClosed(status: string) {
  return ['PAID', 'WAIVED', 'CANCELLED', 'VOID'].includes(status);
}

export function invoiceRemaining(invoice: { status: string; total: number; paidAmount: number }) {
  return invoiceIsClosed(invoice.status) ? 0 : Math.max(0, invoice.total - invoice.paidAmount);
}

export function invoiceCollected(invoice: { status: string; total: number; paidAmount: number }) {
  return invoice.status === 'PAID' ? invoice.total : Math.max(0, Math.min(invoice.total, invoice.paidAmount));
}

export function invoiceState(invoice: { status: string; dueDate: string; paidAmount: number; pendingPaymentId?: string | null }, today: string) {
  if (invoiceIsClosed(invoice.status)) return invoice.status;
  if (invoice.pendingPaymentId) return 'PENDING_VERIFICATION';
  if (invoice.dueDate && invoice.dueDate.slice(0, 10) < today) return 'OVERDUE';
  if (invoice.paidAmount > 0 || ['PARTIAL', 'PARTIALLY_PAID'].includes(invoice.status)) return 'PARTIAL';
  return 'UNPAID';
}

export interface TariffComponent {
  name: string;
  amount: number;
}

export interface BillingTariff {
  components: TariffComponent[];
  note: string;
  total: number;
  dueDay: number;
  updatedAt: string | null;
}

export function selectReceivingBank<T extends {type:string;code:string;accountNumber:string|null}>(accounts:T[]) {
  return accounts.find(account=>['BANK','SAVINGS'].includes(account.type) && account.accountNumber?.trim() &&
    !['BCA_MAIN','-'].includes(account.accountNumber.trim()));
}

export function financePath(path: '/admin/billing' | '/admin/payments' | '/admin/expenses' | '/admin/ledger' | '/admin/budget' | '/admin/analytics' | '/kuitansi' | '/rekap-iuran', params: Record<string, string | null | undefined> = {}) {
  const search = new URLSearchParams();
  for (const [key,value] of Object.entries(params)) if (value) search.set(key,value);
  return search.size ? `${path}?${search}` : path;
}

const dateLabel = new Intl.DateTimeFormat('id-ID', { timeZone:'Asia/Jakarta', day:'numeric', month:'short', year:'numeric' });
export function financeDate(value?: string | null) {
  const day = value ? jakartaDate(value) : '';
  const date = day ? new Date(`${day}T12:00:00+07:00`) : null;
  return date && Number.isFinite(date.getTime()) ? dateLabel.format(date) : '—';
}

export const PAYMENT_METHODS = {
  TRANSFER:'Transfer bank', CASH:'Tunai', CASH_KEPALA_KOMPLEK:'Tunai · pengurus', QRIS:'QRIS', EWALLET:'Dompet digital',
};

export function paymentMethodLabel(method: string) {
  return PAYMENT_METHODS[method as keyof typeof PAYMENT_METHODS] || method || '—';
}

export function proofLink(value?: string | null) {
  if (!value) return '';
  try {
    if (value.startsWith('/uploads/')) {
      const local = new URL(value,'https://proof.local');
      const path = decodeURIComponent(local.pathname);
      return local.origin === 'https://proof.local' && path.startsWith('/uploads/') && !path.includes('\\') &&
        !path.split('/').includes('..') ? local.pathname+local.search+local.hash : '';
    }
    if (!value.startsWith('https://')) return '';
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : '';
  } catch { return ''; }
}

export function financeCsv(rows: (string | number)[][]) {
  return '\uFEFF' + rows.map(row => row.map(value => {
    const text = typeof value === 'string' && /^[\s\uFEFF]*[=+\-@]/.test(value) ? "'" + value : String(value);
    return `"${text.replaceAll('"', '""')}"`;
  }).join(',')).join('\r\n');
}

export function downloadFinanceCsv(filename: string, rows: (string | number)[][]) {
  const url = URL.createObjectURL(new Blob([financeCsv(rows)],{type:'text/csv;charset=utf-8'}));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
