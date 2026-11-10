import { billingMonthLabel, jakartaDate } from './billing-data';

export const EXPENSE_TABS = ['expenses_list', 'recurring_expenses', 'social_aid', 'fasum_projects'] as const;
export const LEDGER_TABS = ['ledger_list', 'accounts_manage', 'bank_reconciliation', 'financial_reports'] as const;
export type ExpenseTab = typeof EXPENSE_TABS[number];
export type LedgerSubTab = typeof LEDGER_TABS[number];

export const financeMonthPattern = /^\d{4}-(0[1-9]|1[0-2])$/;
export const currentFinanceMonth = () => jakartaDate().slice(0, 7);
const cashFormat = new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',minimumFractionDigits:0,maximumFractionDigits:2});
export const cashRupiah = (value: number) => cashFormat.format(value).replace(/\s+/g,'');
export function financeMonth(value: string) {
  return financeMonthPattern.test(value) ? billingMonthLabel(Number(value.slice(0, 4)), Number(value.slice(5))) : 'Semua bulan';
}

export function monthBounds(value: string): [string, string] {
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(5));
  return [`${value}-01`, `${month === 12 ? String(year + 1).padStart(4, '0') : value.slice(0, 4)}-${month === 12 ? '01' : String(month + 1).padStart(2, '0')}-01`];
}

export function scheduledExpenseDate(month: string, day: number) {
  const end = new Date(`${monthBounds(month)[1]}T00:00:00Z`);
  end.setUTCDate(0);
  return `${month}-${String(Math.min(end.getUTCDate(), Math.max(1, day))).padStart(2, '0')}`;
}

export const aidTypes = {
  SANTUNAN_KESEHATAN: 'Kesehatan', SANTUNAN_DUKA_CITA: 'Duka cita', SANTUNAN_MUSIBAH_BENCANA: 'Musibah',
  BINGKISAN_THR: 'Bingkisan THR', BEASISWA_ANAK: 'Beasiswa',
} as const;
export const projectTypes = {
  PENGECATAN_KOMPLEK: 'Pengecatan', PERBAIKAN_PERALATAN: 'Perbaikan', LAMPU_PJU: 'Lampu jalan',
  BARRIER_GATE_RFID: 'Gerbang & RFID', CCTV_KEAMANAN: 'CCTV', TAMAN_RESAPAN: 'Taman & resapan',
} as const;
export const projectStatuses = { PLANNED: 'Direncanakan', IN_PROGRESS: 'Berjalan', COMPLETED: 'Selesai' } as const;
export type AidType = keyof typeof aidTypes;
export type ProjectType = keyof typeof projectTypes;
export type ProjectStatus = keyof typeof projectStatuses;

export interface ExpenseCategory { id: string; name: string; code: string }
export interface ExpenseDetails {
  vendor?: string;
  memo?: string;
  recipientName?: string;
  aidType?: AidType;
  projectId?: string;
  recurringId?: string;
  recurringMonth?: string;
}
export interface ExpenseRow {
  id: string; title: string; description: string | null; amount: number; expenseDate: string;
  categoryId: string | null; categoryName: string | null; accountId: string | null; accountName: string | null;
  status: string; hasProof: boolean; journalCount: number; journalMatches: boolean; payrollLinked?: boolean; details: ExpenseDetails;
}
export interface FacilityProject {
  id: string; projectName: string; projectType: ProjectType; budgetAmount: number; actualSpent: number;
  vendorOrContractor: string; startDate: string; targetCompletionDate?: string; status: ProjectStatus; facilityId?: string;
}
export interface RecurringExpenseConfigItem {
  id: string; title: string; amount: number; categoryId: string; categoryName?: string; accountId: string; executionDay: number;
  frequency?: 'MONTHLY' | 'SPECIFIC_MONTH' | 'YEARLY'; executionMonth?: number; vendor?: string; description?: string; isActive: boolean;
}
export interface RecurringPreviewRow {
  id: string; itemId: string; title: string; amount: number; accountName: string; date: string;
  state: 'READY' | 'BOOKED' | 'NOT_DUE' | 'UNAVAILABLE'; expenseId?: string;
}

export const ledgerSources: Record<string, string> = {
  PAYMENT: 'Pembayaran iuran', PAYMENT_REVERSAL: 'Pembalikan iuran', EXPENSE: 'Pengeluaran', EXPENSE_REVERSAL: 'Pembatalan pengeluaran',
  INTERNAL_TRANSFER: 'Mutasi antar rekening', MUTASI_KAS_INTERNAL: 'Mutasi antar rekening', RESERVE_TRANSFER: 'Mutasi dana cadangan', OPENING_BALANCE: 'Saldo awal',
  MANUAL_JOURNAL: 'Jurnal manual', ADJUSTMENT: 'Penyesuaian', STAFF_LOAN_DISBURSEMENT: 'Pencairan kasbon', STAFF_LOAN_INSTALLMENT: 'Pelunasan kasbon',
  STAFF_LOAN_DISBURSEMENT_REVERSAL: 'Pembalikan pencairan kasbon', STAFF_LOAN_INSTALLMENT_REVERSAL: 'Pembalikan pelunasan kasbon',
};
export const isEditableJournal = (source: string) => ['MANUAL_JOURNAL', 'ADJUSTMENT', 'PENERIMAAN_KAS', 'PENGELUARAN_KAS', 'PEMASUKAN_LAIN', 'PENGELUARAN_LAIN'].includes(source);
export const isInternalTransfer = (source: string) => ['INTERNAL_TRANSFER', 'MUTASI_KAS_INTERNAL', 'RESERVE_TRANSFER'].includes(source);
export const proofMimes = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'application/pdf': 'pdf' } as const;
export const proofMaxBytes = 1_500_000;

export type LedgerScope = { type: 'payment' | 'expense' | 'transfer' | 'loan' | 'installment'; id: string };
export interface CashJournalRow {
  id: string; accountId: string | null; accountName: string | null; entryDate: string; direction: string; amount: number;
  sourceType: string; sourceId: string | null; description: string; runningBalance: number;
}
export interface CashPeriodSummary { opening: number; closing: number; income: number; outgoing: number; transfers: number; openingEntries: number; count: number }
export interface CashReconciliation {
  month: string; accountId: string; fingerprint: string; summary: CashPeriodSummary;
  saved: { fingerprint: string; statementBalance: number; bookBalance: number; note: string; at: string; by: string } | null;
  status: 'UNREVIEWED' | 'MATCHED' | 'DIFFERENT' | 'STALE';
}
