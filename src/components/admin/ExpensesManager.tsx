import React, { useState, useMemo } from 'react';
import {
  FileMinus,
  Plus,
  ShieldCheck,
  Sparkles,
  Zap,
  Wrench,
  Wallet,
  Calendar,
  PlusCircle,
  Search,
  Filter,
  Check,
  Eye,
  X,
  Upload,
  Download,
  Share2,
  Copy,
  ExternalLink,
  Edit3,
  Trash2,
  Printer,
  Building,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  DollarSign,
  AlertTriangle,
  Receipt,
  CheckCircle2,
  Clock,
  TrendingDown,
  FileText,
  PieChart,
  ShoppingBag,
  Send,
  HeartHandshake,
  Paintbrush,
  Users,
  Activity,
  Heart,
  CreditCard,
  Layers,
  Banknote,
  Repeat
} from 'lucide-react';
import { formatRupiah } from '../../lib/format';
import { StaffLoansManager } from './StaffLoansManager';
import { RecurringExpensesManager } from './RecurringExpensesManager';

interface ExpenseItem {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  expenseDate: string;
  categoryName: string | null;
  vendor?: string;
  voucherNo?: string;
  proofUrl?: string;
  status: string; // 'APPROVED' | 'PENDING' | 'REJECTED'
}

interface StaffLoanItem {
  id: string;
  staffName: string;
  staffRole: string;
  staffPhone: string;
  totalLoanAmount: number;
  remainingBalance: number;
  paidAmount: number;
  monthlyDeduction: number;
  tenorMonths: number;
  loanDate: string;
  purpose: string;
  approvedBy: string;
  status: 'ACTIVE_INSTALLMENT' | 'OVERDUE' | 'PAID_OFF';
}

interface SocialAidItem {
  id: string;
  recipientName: string;
  recipientRole: string;
  aidType: string;
  amount: number;
  aidDate: string;
  description: string;
  hospitalOrDetails?: string;
  voucherNo: string;
}

interface MaintenanceProjectItem {
  id: string;
  projectName: string;
  projectType: string;
  budgetAmount: number;
  actualSpent: number;
  vendorOrContractor: string;
  startDate: string;
  targetCompletionDate: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
  description: string;
  location: string;
}

interface ExpensesManagerProps {
  initialExpenses: ExpenseItem[];
  initialAccounts?: any[];
  initialBalance?: number;
}

export const ExpensesManager: React.FC<ExpensesManagerProps> = ({ 
  initialExpenses,
  initialAccounts = [],
  initialBalance = 28065000,
}) => {
  const [expenses, setExpenses] = useState<ExpenseItem[]>(initialExpenses);
  const [currentBalance, setCurrentBalance] = useState<number>(initialBalance);
  const [activeSubTab, setActiveSubTab] = useState<
    'expenses_list' | 'recurring_expenses' | 'staff_loans' | 'social_aid' | 'fasum_projects' | 'public_transparency'
  >('expenses_list');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'amount' | 'category'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals & Drawers
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingProof, setViewingProof] = useState<ExpenseItem | null>(null);
  const [selectedVoucher, setSelectedVoucher] = useState<ExpenseItem | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<ExpenseItem | null>(null);
  const [deleteReason, setDeleteReason] = useState('Koreksi Input / Pembelian Dibatalkan');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // ================= 1. KASBON & PINJAMAN PETUGAS STATE =================
  const [staffLoans, setStaffLoans] = useState<StaffLoanItem[]>([]);

  const [showLoanModal, setShowLoanModal] = useState(false);
  const [loanStaffName, setLoanStaffName] = useState('');
  const [loanStaffRole, setLoanStaffRole] = useState<'SATPAM' | 'PETUGAS_KEBERSIHAN' | 'PETUGAS_TAMAN' | 'TEKNISI'>('SATPAM');
  const [loanAmount, setLoanAmount] = useState(500000);
  const [loanMonthlyDeduction, setLoanMonthlyDeduction] = useState(250000);
  const [loanTenor, setLoanTenor] = useState(2);
  const [loanPurpose, setLoanPurpose] = useState('');
  const [selectedLoanForInstallment, setSelectedLoanForInstallment] = useState<StaffLoanItem | null>(null);
  const [installmentAmountInput, setInstallmentAmountInput] = useState(250000);

  // ================= 2. DANA SOSIAL & KESEHATAN SATPAM STATE =================
  const [socialAids, setSocialAids] = useState<SocialAidItem[]>([]);

  const [showSocialModal, setShowSocialModal] = useState(false);
  const [socRecipient, setSocRecipient] = useState('');
  const [socType, setSocType] = useState<'SANTUNAN_KESEHATAN' | 'SANTUNAN_DUKA_CITA' | 'SANTUNAN_MUSIBAH_BENCANA' | 'BINGKISAN_THR' | 'BEASISWA_ANAK'>('SANTUNAN_KESEHATAN');
  const [socAmount, setSocAmount] = useState(500000);
  const [socDesc, setSocDesc] = useState('');
  const [socDetails, setSocDetails] = useState('');

  // ================= 3. DANA PEMELIHARAAN FASUM (CAT & PERALATAN) STATE =================
  const [maintenanceProjects, setMaintenanceProjects] = useState<MaintenanceProjectItem[]>([]);

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [prjName, setPrjName] = useState('');
  const [prjType, setPrjType] = useState<'PENGECATAN_KOMPLEK' | 'PERBAIKAN_PERALATAN' | 'LAMPU_PJU' | 'BARRIER_GATE_RFID' | 'CCTV_KEAMANAN' | 'TAMAN_RESAPAN'>('PENGECATAN_KOMPLEK');
  const [prjBudget, setPrjBudget] = useState(1000000);
  const [prjVendor, setPrjVendor] = useState('');
  const [prjLocation, setPrjLocation] = useState('');
  const [prjDesc, setPrjDesc] = useState('');

  // Form State for General Expense
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Keamanan');
  const [formAmount, setFormAmount] = useState('');
  const [formVendor, setFormVendor] = useState('');
  const [formExpenseDate, setFormExpenseDate] = useState(new Date().toISOString().substring(0, 10));
  const [formDescription, setFormDescription] = useState('');
  const [savingExpense, setSavingExpense] = useState(false);

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Metrics Calculation
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalActiveLoans = staffLoans.filter((l) => l.status === 'ACTIVE_INSTALLMENT').reduce((sum, l) => sum + l.remainingBalance, 0);
  const totalSocialGranted = socialAids.reduce((sum, s) => sum + s.amount, 0);
  const totalProjectsBudget = maintenanceProjects.reduce((sum, p) => sum + p.actualSpent, 0);

  // Export Expenses CSV
  const handleExportExpensesCSV = () => {
    const headers = ['ID Pengeluaran', 'No. Voucher', 'Tanggal', 'Kategori', 'Uraian Pengeluaran', 'Vendor', 'Nominal (Rp)', 'Status'];
    const rows = expenses.map((e) => [
      e.id,
      `"${e.voucherNo || `BKK-${e.id.slice(-4)}`}"`,
      `"${e.expenseDate}"`,
      `"${e.categoryName || 'Operasional'}"`,
      `"${e.title.replace(/"/g, '""')}"`,
      `"${(e.vendor || '-').replace(/"/g, '""')}"`,
      e.amount,
      `"${e.status}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `REKAPITULASI_PENGELUARAN_KAS_WARGA_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Daftar pengeluaran kas berhasil diekspor ke CSV.');
  };

  const handleOpenAddExpense = () => {
    setEditingExpenseId(null);
    setFormTitle('');
    setFormCategory('Keamanan');
    setFormAmount('');
    setFormVendor('');
    setFormExpenseDate(new Date().toISOString().substring(0, 10));
    setFormDescription('');
    setShowAddModal(true);
  };

  const handleOpenEditExpense = (exp: ExpenseItem) => {
    setEditingExpenseId(exp.id);
    setFormTitle(exp.title);
    setFormCategory(exp.categoryName || 'Operasional');
    setFormAmount(String(exp.amount));
    setFormVendor(exp.vendor || '');
    setFormExpenseDate(exp.expenseDate);
    setFormDescription(exp.description || '');
    setShowAddModal(true);
  };

  const handleSaveGeneralExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingExpense(true);
    try {
      if (editingExpenseId) {
        const res = await fetch('/api/expenses/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingExpenseId,
            title: formTitle,
            categoryName: formCategory,
            amount: Number(formAmount),
            vendor: formVendor,
            expenseDate: formExpenseDate,
            description: formDescription,
          }),
        });
        if (res.ok) {
          setExpenses(
            expenses.map((exp) =>
              exp.id === editingExpenseId
                ? {
                    ...exp,
                    title: formTitle,
                    categoryName: formCategory,
                    amount: Number(formAmount),
                    vendor: formVendor,
                    expenseDate: formExpenseDate,
                    description: formDescription,
                  }
                : exp
            )
          );
          showToast(`Pengeluaran "${formTitle}" berhasil diperbarui.`);
          setShowAddModal(false);
        }
      } else {
        const res = await fetch('/api/expenses/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formTitle,
            categoryName: formCategory,
            amount: Number(formAmount),
            vendor: formVendor,
            expenseDate: formExpenseDate,
            description: formDescription,
          }),
        });
        if (res.ok) {
          const newExp: ExpenseItem = {
            id: `exp-${Date.now()}`,
            title: formTitle,
            description: formDescription,
            amount: Number(formAmount),
            expenseDate: formExpenseDate,
            categoryName: formCategory,
            vendor: formVendor,
            voucherNo: `BKK-${Date.now().toString().slice(-4)}`,
            status: 'APPROVED',
          };
          setExpenses([newExp, ...expenses]);
          setCurrentBalance((prev) => prev - Number(formAmount));
          showToast(`Pengeluaran baru "${formTitle}" berhasil dicatat.`);
          setShowAddModal(false);
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan pengeluaran.');
    } finally {
      setSavingExpense(false);
    }
  };

  const handleConfirmDeleteExpense = async () => {
    if (!expenseToDelete) return;
    try {
      const res = await fetch('/api/expenses/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: expenseToDelete.id,
          expenseId: expenseToDelete.id,
          title: expenseToDelete.title,
          amount: expenseToDelete.amount,
          reason: deleteReason,
        }),
      });
      if (res.ok) {
        setExpenses(expenses.filter((e) => e.id !== expenseToDelete.id));
        setCurrentBalance((prev) => prev + expenseToDelete.amount);
        showToast(`Pengeluaran "${expenseToDelete.title}" berhasil dihapus.`);
        setExpenseToDelete(null);
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menghapus pengeluaran.');
    }
  };

  // Handle Save Staff Loan
  const handleSaveLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/expenses/loans/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffName: loanStaffName,
          staffRole: loanStaffRole,
          totalLoanAmount: Number(loanAmount),
          monthlyDeduction: Number(loanMonthlyDeduction),
          tenorMonths: Number(loanTenor),
          purpose: loanPurpose,
        }),
      });

      if (res.ok) {
        const newLoan: StaffLoanItem = {
          id: `LOAN-${Date.now().toString().slice(-3)}`,
          staffName: loanStaffName,
          staffRole: loanStaffRole === 'SATPAM' ? 'Petugas Keamanan' : 'Petugas Kebersihan',
          staffPhone: '0812-9988-7766',
          totalLoanAmount: Number(loanAmount),
          remainingBalance: Number(loanAmount),
          paidAmount: 0,
          monthlyDeduction: Number(loanMonthlyDeduction),
          tenorMonths: Number(loanTenor),
          loanDate: new Date().toISOString().slice(0, 10),
          purpose: loanPurpose,
          approvedBy: 'Ketua RW 05 & Bendahara',
          status: 'ACTIVE_INSTALLMENT',
        };
        setStaffLoans([newLoan, ...staffLoans]);
        showToast(`Kasbon sebesar ${formatRupiah(loanAmount)} untuk ${loanStaffName} berhasil disetujui & dicatat.`);
        setShowLoanModal(false);
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal mencatat kasbon.');
    }
  };

  // Handle Pay Installment
  const handlePayInstallment = async () => {
    if (!selectedLoanForInstallment) return;
    try {
      const res = await fetch('/api/expenses/loans/installment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loanId: selectedLoanForInstallment.id,
          staffName: selectedLoanForInstallment.staffName,
          installmentAmount: Number(installmentAmountInput),
          paymentMethod: 'POTONG_GAJI',
        }),
      });

      if (res.ok) {
        setStaffLoans(
          staffLoans.map((l) => {
            if (l.id === selectedLoanForInstallment.id) {
              const newPaid = l.paidAmount + Number(installmentAmountInput);
              const newRemaining = Math.max(0, l.totalLoanAmount - newPaid);
              return {
                ...l,
                paidAmount: newPaid,
                remainingBalance: newRemaining,
                status: newRemaining === 0 ? 'PAID_OFF' : 'ACTIVE_INSTALLMENT',
              };
            }
            return l;
          })
        );
        showToast(`Pembayaran cicilan potong gaji ${selectedLoanForInstallment.staffName} sebesar ${formatRupiah(installmentAmountInput)} berhasil.`);
        setSelectedLoanForInstallment(null);
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal memproses cicilan.');
    }
  };

  // Handle Save Social Aid
  const handleSaveSocialAid = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/expenses/social/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientName: socRecipient,
          recipientRole: 'SATPAM',
          aidType: socType,
          amount: Number(socAmount),
          description: socDesc,
          hospitalOrDetails: socDetails,
        }),
      });

      if (res.ok) {
        const newAid: SocialAidItem = {
          id: `AID-${Date.now().toString().slice(-3)}`,
          recipientName: socRecipient,
          recipientRole: 'SATPAM',
          aidType: socType,
          amount: Number(socAmount),
          aidDate: new Date().toISOString().slice(0, 10),
          description: socDesc,
          hospitalOrDetails: socDetails,
          voucherNo: `BSOS-${Date.now().toString().slice(-4)}`,
        };
        setSocialAids([newAid, ...socialAids]);
        showToast(`Dana santunan sebesar ${formatRupiah(socAmount)} berhasil dicairkan.`);
        setShowSocialModal(false);
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal mencatat dana sosial.');
    }
  };

  // Handle Save Maintenance Project
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/expenses/projects/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: prjName,
          projectType: prjType,
          budgetAmount: Number(prjBudget),
          vendorOrContractor: prjVendor,
          location: prjLocation,
          description: prjDesc,
        }),
      });

      if (res.ok) {
        const newPrj: MaintenanceProjectItem = {
          id: `PRJ-${Date.now().toString().slice(-3)}`,
          projectName: prjName,
          projectType: prjType,
          budgetAmount: Number(prjBudget),
          actualSpent: Number(prjBudget),
          vendorOrContractor: prjVendor,
          startDate: new Date().toISOString().slice(0, 10),
          targetCompletionDate: '2026-09-30',
          status: 'IN_PROGRESS',
          description: prjDesc,
          location: prjLocation,
        };
        setMaintenanceProjects([newPrj, ...maintenanceProjects]);
        showToast(`Proyek pemeliharaan "${prjName}" berhasil dicatat.`);
        setShowProjectModal(false);
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal mencatat proyek pemeliharaan.');
    }
  };

  // Filter & Sort General Expenses
  const filteredAndSortedExpenses = useMemo(() => {
    const list = expenses.filter((e) => {
      const matchCat = selectedCategory === 'ALL' || (e.categoryName && e.categoryName.toLowerCase().includes(selectedCategory.toLowerCase()));
      const matchSearch =
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.vendor && e.vendor.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (e.description && e.description.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchCat && matchSearch;
    });

    list.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') comparison = a.expenseDate.localeCompare(b.expenseDate);
      else if (sortBy === 'title') comparison = a.title.localeCompare(b.title);
      else if (sortBy === 'amount') comparison = a.amount - b.amount;
      else if (sortBy === 'category') comparison = (a.categoryName || '').localeCompare(b.categoryName || '');
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return list;
  }, [expenses, selectedCategory, searchTerm, sortBy, sortOrder]);

  const totalFiltered = filteredAndSortedExpenses.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalFiltered);
  const paginatedExpenses = filteredAndSortedExpenses.slice(startIndex, endIndex);

  // Copy Public Link
  const publicTransparencyUrl = 'http://localhost:4321/transparency';
  const handleCopyPublicLink = () => {
    navigator.clipboard.writeText(publicTransparencyUrl);
    setCopiedLink(true);
    showToast('Tautan publik transparansi keuangan berhasil disalin!');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-700 text-white rounded-2xl shadow-xl font-bold text-xs animate-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black tracking-tight text-ink flex items-center gap-2">
              <TrendingDown className="w-6 h-6 text-rose-600" />
              Pengeluaran, Kasbon & Pemeliharaan Fasum
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-xs font-black border border-rose-200 tabular-nums">
              Kas BCA: {formatRupiah(currentBalance)}
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Pusat pengelolaan belanja operasional, <strong>Kasbon & Pinjaman Petugas Satpam/Kebersihan</strong>, <strong>Dana Santunan Sosial & Kesehatan</strong>, serta <strong>Proyek Cat Komplek & Perbaikan Peralatan</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportExpensesCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-surface hover:bg-canvas border border-border text-ink text-xs font-bold rounded-xl shadow-xs active:scale-[0.98] transition-all"
          >
            <Download className="w-4 h-4 text-rose-600" />
            <span>Ekspor Mutasi (CSV)</span>
          </button>
          <button
            type="button"
            onClick={handleOpenAddExpense}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs active:scale-[0.98] transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Catat Pengeluaran Baru</span>
          </button>
          {activeSubTab === 'staff_loans' && (
            <button
              type="button"
              onClick={() => setShowLoanModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs active:scale-[0.98] transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tambah Kasbon</span>
            </button>
          )}
          {activeSubTab === 'social_aid' && (
            <button
              type="button"
              onClick={() => setShowSocialModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs active:scale-[0.98] transition-all"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Cairkan Santunan</span>
            </button>
          )}
          {activeSubTab === 'fasum_projects' && (
            <button
              type="button"
              onClick={() => setShowProjectModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs active:scale-[0.98] transition-all"
            >
              <Paintbrush className="w-4 h-4" />
              <span>Catat Proyek Cat & Alat</span>
            </button>
          )}
        </div>
      </div>

      {/* Public Transparency Share Callout Banner */}
      <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-emerald-950 text-sm">Tautan Publik Laporan Transparansi Kas & Iuran Warga</h4>
            <p className="text-emerald-800 text-[11px] mt-0.5">
              Warga dapat melihat laporan kas masuk-keluar, nota belanja, serta daftar unit yang sudah lunas secara terbuka di portal transparansi.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleCopyPublicLink}
            className="px-3.5 py-2 bg-white hover:bg-emerald-100 text-emerald-900 font-bold rounded-xl border border-emerald-300 shadow-2xs inline-flex items-center gap-1.5 active:scale-[0.98] transition-all"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-emerald-700" />}
            <span>Salin Link Publik</span>
          </button>
          <a
            href={publicTransparencyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-2xs inline-flex items-center gap-1.5 active:scale-[0.98] transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Buka Transparansi</span>
          </a>
        </div>
      </div>

      {/* 6 Sub-Tabs Navigation Bar */}
      <div className="flex items-center gap-1.5 p-1.5 bg-surface rounded-2xl border border-border shadow-2xs overflow-x-auto no-scrollbar">
        {[
          { id: 'expenses_list', label: 'Buku Pengeluaran & Nota Belanja', icon: FileText, count: `${expenses.length} Pos` },
          { id: 'recurring_expenses', label: '⚙️ Setting Pengeluaran Rutin (Auto-Debit)', icon: Repeat },
          { id: 'staff_loans', label: 'Kasbon & Pinjaman Petugas (Satpam)', icon: Banknote, count: `${staffLoans.length} Petugas` },
          { id: 'social_aid', label: 'Dana Santunan & Kesehatan Petugas', icon: HeartHandshake, count: `${socialAids.length} Agenda` },
          { id: 'fasum_projects', label: 'Dana Cat Komplek & Perbaikan Alat', icon: Paintbrush, count: `${maintenanceProjects.length} Proyek` },
          { id: 'public_transparency', label: 'Rekapitulasi Iuran Warga (Lunas vs Belum)', icon: Eye },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap active:scale-[0.98] ${
                isActive
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-ink-muted hover:text-ink hover:bg-canvas'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-rose-400' : 'text-ink-muted'}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-canvas text-ink-muted border border-border/60'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ================= SUBTAB 1: BUKU PENGELUARAN & NOTA BELANJA ================= */}
      {activeSubTab === 'expenses_list' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[10px] font-mono uppercase font-bold text-ink-muted tracking-wider">Total Pengeluaran Rutin</span>
              <p className="text-2xl font-black font-mono text-rose-700 mt-0.5 tabular-nums">{formatRupiah(totalExpense)}</p>
              <span className="text-[10px] text-rose-600 font-bold font-mono mt-0.5 block">{expenses.length} POS PEMBELANJAAN</span>
            </div>

            <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[10px] font-mono uppercase font-bold text-ink-muted tracking-wider">Piutang Kasbon Petugas</span>
              <p className="text-2xl font-black font-mono text-indigo-700 mt-0.5 tabular-nums">{formatRupiah(totalActiveLoans)}</p>
              <span className="text-[10px] text-indigo-600 font-bold font-mono mt-0.5 block">DICICIL POTONG GAJI</span>
            </div>

            <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[10px] font-mono uppercase font-bold text-ink-muted tracking-wider">Realisasi Dana Santunan</span>
              <p className="text-2xl font-black font-mono text-emerald-700 mt-0.5 tabular-nums">{formatRupiah(totalSocialGranted)}</p>
              <span className="text-[10px] text-emerald-600 font-bold font-mono mt-0.5 block">KESEHATAN & MUSIBAH</span>
            </div>

            <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[10px] font-mono uppercase font-bold text-ink-muted tracking-wider">Proyek Cat & Alat Fasum</span>
              <p className="text-2xl font-black font-mono text-amber-700 mt-0.5 tabular-nums">{formatRupiah(totalProjectsBudget)}</p>
              <span className="text-[10px] text-amber-600 font-bold font-mono mt-0.5 block">TEMBOK, GATE & PJU</span>
            </div>
          </div>

          {/* Search, Filter & Sort Bar */}
          <div className="bg-surface p-4 rounded-2xl border border-border shadow-card flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="w-full sm:w-72 relative">
              <Search className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari uraian, vendor, voucher..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 bg-canvas border border-border rounded-xl text-xs text-ink placeholder:text-ink-muted focus:outline-hidden"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="ALL">Semua Kategori</option>
                <option value="Keamanan">Keamanan & Pos Satpam</option>
                <option value="Kebersihan">Kebersihan & Sampah</option>
                <option value="Operasional">Operasional Paguyuban</option>
                <option value="Listrik">Listrik & Utilitas</option>
                <option value="Pemeliharaan">Pemeliharaan Fasum</option>
                <option value="Sosial">Santunan Sosial</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="date">Urut Tanggal</option>
                <option value="title">Urut Uraian</option>
                <option value="amount">Urut Nominal</option>
                <option value="category">Urut Kategori</option>
              </select>

              <button
                type="button"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 bg-canvas border border-border rounded-xl text-ink-muted hover:text-ink active:scale-[0.98] transition-all"
                title={`Urutan: ${sortOrder === 'asc' ? 'Menaik' : 'Menurun'}`}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Table List of Expenses */}
          <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-canvas border-b border-border text-ink-muted font-bold">
                  <tr>
                    <th className="py-3.5 px-4">Tanggal & No. Voucher</th>
                    <th className="py-3.5 px-4">Kategori Pos</th>
                    <th className="py-3.5 px-4">Uraian Pengeluaran & Vendor</th>
                    <th className="py-3.5 px-4 text-right">Nominal Realisasi</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Aksi & Dokumen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {paginatedExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-ink-muted font-medium">
                        Tidak ada catatan pengeluaran kas yang sesuai dengan filter.
                      </td>
                    </tr>
                  ) : (
                    paginatedExpenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-canvas/60 text-ink transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-ink font-bold block">{exp.expenseDate}</span>
                          <span className="text-[10px] text-ink-muted font-mono bg-canvas px-1.5 py-0.5 rounded border border-border/80 inline-block mt-0.5">
                            {exp.voucherNo || `BKK-${exp.id.slice(-4)}`}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-lg bg-canvas border border-border font-bold text-[11px] text-ink">
                            {exp.categoryName || 'Operasional'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-black text-ink block text-xs">{exp.title}</span>
                          <span className="text-[10px] text-primary-700 font-semibold">{exp.vendor || 'Pengadaan Mandiri'}</span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-black text-rose-700 text-sm tabular-nums">
                          - {formatRupiah(exp.amount)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-mono font-black text-[10px] border border-emerald-300 shadow-2xs">
                            ✓ {exp.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setSelectedVoucher(exp)}
                              className="px-2.5 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-800 rounded-lg font-bold inline-flex items-center gap-1 text-[11px] active:scale-[0.98] transition-all shadow-2xs"
                              title="Lihat / Cetak Voucher Kas Keluar (BKK)"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                              <span>Voucher BKK</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditExpense(exp)}
                              className="p-1.5 text-amber-700 hover:bg-amber-50 rounded-lg font-bold active:scale-[0.98] transition-all"
                              title="Edit Pengeluaran"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setExpenseToDelete(exp)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg font-bold active:scale-[0.98] transition-all"
                              title="Hapus Pengeluaran"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION CONTROLS */}
            <div className="p-4 border-t border-border bg-canvas/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="text-ink-muted">
                  Menampilkan <strong className="text-ink">{totalFiltered === 0 ? 0 : startIndex + 1}</strong> - <strong className="text-ink">{endIndex}</strong> dari <strong className="text-ink">{totalFiltered}</strong> pengeluaran
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-ink-muted">Tampilkan:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2 py-1 bg-surface border border-border rounded-lg font-bold text-ink"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  disabled={safeCurrentPage === 1}
                  className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40 active:scale-[0.98] transition-all"
                  title="Halaman Pertama"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(Math.max(1, safeCurrentPage - 1))}
                  disabled={safeCurrentPage === 1}
                  className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40 active:scale-[0.98] transition-all"
                  title="Halaman Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 font-mono font-bold text-ink bg-surface border border-border rounded-lg">
                  {safeCurrentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage(Math.min(totalPages, safeCurrentPage + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40 active:scale-[0.98] transition-all"
                  title="Halaman Berikutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={safeCurrentPage === totalPages}
                  className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40 active:scale-[0.98] transition-all"
                  title="Halaman Terakhir"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUBTAB: SETTING PENGELUARAN RUTIN & AUTO-DEBIT ================= */}
      {activeSubTab === 'recurring_expenses' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <RecurringExpensesManager
            accounts={initialAccounts}
            currentBalance={currentBalance}
            existingExpenseTitles={expenses.map((e) => e.title)}
            onExpensesProcessed={(newItems, newBal) => {
              setExpenses((prev) => [...newItems, ...prev]);
              setCurrentBalance(newBal);
            }}
          />
        </div>
      )}

      {/* ================= SUBTAB 2: KASBON & PINJAMAN PETUGAS SATPAM ================= */}
      {activeSubTab === 'staff_loans' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <StaffLoansManager />
        </div>
      )}

      {/* ================= SUBTAB 3: DANA SANTUNAN & KESEHATAN ================= */}
      {activeSubTab === 'social_aid' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="p-5 bg-surface rounded-3xl border border-border shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <h3 className="font-black text-base text-ink flex items-center gap-2">
                  <HeartHandshake className="w-5 h-5 text-emerald-600" />
                  Dana Kesehatan, Santunan Musibah & Tali Asih Petugas
                </h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  Alokasi kas sosial paguyuban untuk bantuan biaya berobat, rawat inap, santunan duka cita keluarga satpam, dan THR.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowSocialModal(true)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                Cairkan Santunan Baru
              </button>
            </div>

            {socialAids.length === 0 ? (
              <div className="py-12 px-4 text-center bg-canvas rounded-2xl border border-dashed border-border space-y-2">
                <HeartHandshake className="w-10 h-10 text-ink-muted/40 mx-auto" />
                <p className="text-sm font-bold text-ink">Belum Ada Catatan Dana Santunan Riil</p>
                <p className="text-xs text-ink-muted max-w-md mx-auto">
                  Catatan bantuan santunan kesehatan, musibah, atau tali asih petugas akan tampil di sini saat bendahara mencairkan dana.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {socialAids.map((aid) => (
                  <div key={aid.id} className="p-4 bg-canvas rounded-2xl border border-border space-y-2.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded text-[10px] font-black">
                        {aid.aidType.replace(/_/g, ' ')}
                      </span>
                      <span className="font-mono text-xs text-ink-muted">{aid.aidDate}</span>
                    </div>

                    <div>
                      <h4 className="font-black text-ink text-sm">{aid.recipientName}</h4>
                      <p className="text-xs text-ink-muted mt-0.5">{aid.description}</p>
                      {aid.hospitalOrDetails && (
                        <span className="text-[10px] text-emerald-700 font-semibold block mt-1">
                          📍 {aid.hospitalOrDetails}
                        </span>
                      )}
                    </div>

                    <div className="p-2.5 bg-surface rounded-xl border border-border flex justify-between items-center text-xs">
                      <span className="text-ink-muted font-medium">Nominal Santunan:</span>
                      <span className="font-black text-emerald-700 font-mono text-sm">{formatRupiah(aid.amount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= SUBTAB 4: DANA CAT KOMPLEK & PERALATAN FASUM ================= */}
      {activeSubTab === 'fasum_projects' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="p-5 bg-surface rounded-3xl border border-border shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <h3 className="font-black text-base text-ink flex items-center gap-2">
                  <Paintbrush className="w-5 h-5 text-amber-600" />
                  Dana Umum Cat Komplek & Perbaikan Peralatan Lingkungan
                </h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  Proyek pengecatan tembok komplek, servis mesin potong rumput, motor barrier gate RFID, dan pengadaan lampu PJU.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowProjectModal(true)}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                Catat Proyek / Pengadaan
              </button>
            </div>

            {maintenanceProjects.length === 0 ? (
              <div className="py-12 px-4 text-center bg-canvas rounded-2xl border border-dashed border-border space-y-2">
                <Paintbrush className="w-10 h-10 text-ink-muted/40 mx-auto" />
                <p className="text-sm font-bold text-ink">Belum Ada Proyek Pemeliharaan Fasum</p>
                <p className="text-xs text-ink-muted max-w-md mx-auto">
                  Catatan proyek pengecatan lingkungan, servis peralatan fasum, dan pengadaan lampu akan tampil di sini saat didaftarkan.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {maintenanceProjects.map((prj) => (
                  <div key={prj.id} className="p-4 bg-canvas rounded-2xl border border-border space-y-2.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded text-[10px] font-black">
                        {prj.projectType.replace(/_/g, ' ')}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        prj.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {prj.status === 'COMPLETED' ? '✓ SELESAI' : 'SEDANG BERJALAN'}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-black text-ink text-sm">{prj.projectName}</h4>
                      <p className="text-xs text-ink-muted mt-1 leading-relaxed">{prj.description}</p>
                      <p className="text-[11px] text-primary-700 font-semibold mt-1">
                        Pelaksana: {prj.vendorOrContractor} • Lokasi: {prj.location}
                      </p>
                    </div>

                    <div className="p-2.5 bg-surface rounded-xl border border-border flex justify-between items-center text-xs">
                      <span className="text-ink-muted font-medium">Realisasi Anggaran:</span>
                      <span className="font-black text-rose-700 font-mono text-sm">{formatRupiah(prj.actualSpent)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= SUBTAB 5: REKAPITULASI IURAN TRANSPARANSI ================= */}
      {activeSubTab === 'public_transparency' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="p-5 bg-surface rounded-3xl border border-border shadow-card space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <h3 className="font-black text-base text-ink flex items-center gap-2">
                  <Eye className="w-5 h-5 text-emerald-600" />
                  <span>Rekapitulasi Iuran Transparansi Warga Terbuka (Agustus 2026)</span>
                </h3>
                <p className="text-ink-muted mt-0.5">
                  Laporan ringkas status setoran kas warga komplek yang disinkronisasi ke portal publik transparansi.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const content = `LAPORAN PENGELUARAN DAN TRANSPARANSI KAS - AGUSTUS 2026\n================================================\nTotal Pengeluaran Rutin: ${formatRupiah(totalExpense)}\nTotal Piutang Kasbon Petugas: ${formatRupiah(totalActiveLoans)}\nTotal Realisasi Dana Santunan: ${formatRupiah(totalSocialGranted)}\nTotal Proyek Fasum: ${formatRupiah(totalProjectsBudget)}\n\nDicetak pada: ${new Date().toLocaleString('id-ID')}`;
                    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `REKAP_PENGELUARAN_KAS_${new Date().toISOString().slice(0, 10)}.txt`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    showToast('Laporan transparansi kas berhasil diunduh.');
                  }}
                  className="px-3.5 py-2 bg-surface hover:bg-canvas border border-border text-ink rounded-xl font-bold text-xs inline-flex items-center gap-1.5 shadow-xs active:scale-[0.98] transition-all"
                >
                  <Download className="w-3.5 h-3.5 text-primary-600" />
                  <span>Unduh Rekap (.txt)</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyPublicLink}
                  className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl font-bold text-xs border border-emerald-300 inline-flex items-center gap-1.5 shadow-xs active:scale-[0.98] transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Tautan Publik</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-emerald-950 text-sm">SETORAN IURAN TERVERIFIKASI</span>
                  <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-mono font-black">
                    TERKUMPUL
                  </span>
                </div>
                <p className="font-mono font-black text-emerald-800 text-xl tabular-nums">Rp 0</p>
                <p className="text-[11px] text-emerald-700">Total penerimaan iuran yang telah diverifikasi dan masuk rekening kas resmi.</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-slate-900 text-sm">TAGIHAN BELUM TERBIT / TERTUNDA</span>
                  <span className="px-2 py-0.5 bg-slate-200 text-slate-800 rounded text-[10px] font-mono font-black">
                    STATUS RIIL
                  </span>
                </div>
                <p className="font-mono font-black text-slate-800 text-xl tabular-nums">Rp 0</p>
                <p className="text-[11px] text-slate-600">Belum ada tagihan tertunggak yang tercatat untuk periode ini.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CATAT / EDIT PENGELUARAN KAS BARU ================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-border shadow-modal space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-sm text-ink">
                {editingExpenseId ? 'Edit Catatan Pengeluaran Kas' : 'Catat Pengeluaran Kas Baru'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            <form onSubmit={handleSaveGeneralExpense} className="space-y-3">
              <div>
                <label className="font-bold text-ink block mb-1">Uraian Pengeluaran *</label>
                <input
                  type="text"
                  placeholder="Contoh: Honor 6 Petugas Satpam Agustus"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                  className="w-full p-2 bg-canvas border border-border rounded-xl font-bold text-ink"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-ink block mb-1">Kategori Pos</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full p-2 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="Keamanan">Keamanan</option>
                    <option value="Kebersihan">Kebersihan</option>
                    <option value="Operasional">Operasional</option>
                    <option value="Listrik & Utilitas">Listrik & Utilitas</option>
                    <option value="Pemeliharaan">Pemeliharaan Fasum</option>
                    <option value="Sosial">Santunan Sosial</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Nominal (Rp) *</label>
                  <input
                    type="number"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    required
                    className="w-full p-2 bg-canvas border border-border rounded-xl font-mono font-bold text-ink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-ink block mb-1">Penerima Dana / Vendor</label>
                  <input
                    type="text"
                    placeholder="PT Guard / Toko Bangunan"
                    value={formVendor}
                    onChange={(e) => setFormVendor(e.target.value)}
                    className="w-full p-2 bg-canvas border border-border rounded-xl text-ink"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Tanggal Pengeluaran *</label>
                  <input
                    type="date"
                    value={formExpenseDate}
                    onChange={(e) => setFormExpenseDate(e.target.value)}
                    required
                    className="w-full p-2 bg-canvas border border-border rounded-xl text-ink"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Catatan Tambahan</label>
                <input
                  type="text"
                  placeholder="Keterangan transaksi atau no nota toko"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full p-2 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas active:scale-[0.98] transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingExpense}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-xs active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {savingExpense ? 'Menyimpan...' : 'Simpan Pengeluaran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: KONFIRMASI HAPUS PENGELUARAN ================= */}
      {expenseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-red-200 shadow-modal space-y-4 text-xs">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-black text-base text-ink">Hapus Pengeluaran "{expenseToDelete.title}"?</h3>
              <p className="text-ink-muted">
                Catatan kas keluar sebesar <strong>{formatRupiah(expenseToDelete.amount)}</strong> akan dihapus permanen dari buku kas paguyuban.
              </p>
            </div>

            <div>
              <label className="font-bold text-ink block mb-1">Alasan Pembatalan / Penghapusan:</label>
              <select
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="w-full p-2 bg-canvas border border-border rounded-xl text-ink font-semibold"
              >
                <option value="Koreksi Input / Pembelian Dibatalkan">Koreksi Input / Pembelian Dibatalkan</option>
                <option value="Duplikasi Catatan Kas Keluar">Duplikasi Catatan Kas Keluar</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setExpenseToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas active:scale-[0.98] transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteExpense}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs active:scale-[0.98] transition-all"
              >
                Ya, Hapus Pengeluaran
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: TAMBAH KASBON PETUGAS ================= */}
      {showLoanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-border shadow-modal space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-sm text-ink">Catat Kasbon / Pinjaman Petugas</h3>
              <button onClick={() => setShowLoanModal(false)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            <form onSubmit={handleSaveLoan} className="space-y-3">
              <div>
                <label className="font-bold text-ink block mb-1">Nama Petugas *</label>
                <input
                  type="text"
                  placeholder="Pak Joko Sutrisno"
                  value={loanStaffName}
                  onChange={(e) => setLoanStaffName(e.target.value)}
                  required
                  className="w-full p-2 bg-canvas border border-border rounded-xl font-bold text-ink"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-ink block mb-1">Jabatan / Peran</label>
                  <select
                    value={loanStaffRole}
                    onChange={(e) => setLoanStaffRole(e.target.value as any)}
                    className="w-full p-2 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="SATPAM">Petugas Satpam</option>
                    <option value="PETUGAS_KEBERSIHAN">Petugas Kebersihan</option>
                    <option value="PETUGAS_TAMAN">Petugas Taman</option>
                    <option value="TEKNISI">Teknisi Sarana</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Nominal Pinjaman (Rp) *</label>
                  <input
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    required
                    className="w-full p-2 bg-canvas border border-border rounded-xl font-mono font-bold text-ink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-ink block mb-1">Cicilan / Bulan (Rp) *</label>
                  <input
                    type="number"
                    value={loanMonthlyDeduction}
                    onChange={(e) => setLoanMonthlyDeduction(Number(e.target.value))}
                    required
                    className="w-full p-2 bg-canvas border border-border rounded-xl font-mono font-bold text-ink"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Tenor (Bulan)</label>
                  <input
                    type="number"
                    value={loanTenor}
                    onChange={(e) => setLoanTenor(Number(e.target.value))}
                    required
                    className="w-full p-2 bg-canvas border border-border rounded-xl font-bold text-ink"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Keperluan / Alasan Pinjaman *</label>
                <input
                  type="text"
                  placeholder="Contoh: Biaya berobat anak / Masuk sekolah"
                  value={loanPurpose}
                  onChange={(e) => setLoanPurpose(e.target.value)}
                  required
                  className="w-full p-2 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowLoanModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas active:scale-[0.98] transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs active:scale-[0.98] transition-all"
                >
                  Setujui Kasbon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: BAYAR CICILAN KASBON ================= */}
      {selectedLoanForInstallment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-border shadow-modal space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-sm text-ink">
                Bayar Cicilan Kasbon: {selectedLoanForInstallment.staffName}
              </h3>
              <button onClick={() => setSelectedLoanForInstallment(null)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            <div className="p-3 bg-canvas rounded-2xl border border-border space-y-1">
              <div className="flex justify-between">
                <span className="text-ink-muted">Sisa Hutang:</span>
                <span className="font-bold text-rose-700">{formatRupiah(selectedLoanForInstallment.remainingBalance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Skema Potong Gaji:</span>
                <span className="font-bold text-ink">{formatRupiah(selectedLoanForInstallment.monthlyDeduction)} / bulan</span>
              </div>
            </div>

            <div>
              <label className="font-bold text-ink block mb-1">Nominal Cicilan yang Dibayar (Rp):</label>
              <input
                type="number"
                value={installmentAmountInput}
                onChange={(e) => setInstallmentAmountInput(Number(e.target.value))}
                className="w-full p-2 bg-canvas border border-border rounded-xl font-mono font-bold text-ink"
              />
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedLoanForInstallment(null)}
                className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas active:scale-[0.98] transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handlePayInstallment}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs active:scale-[0.98] transition-all"
              >
                Konfirmasi Potong Gaji
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CAIRKAN DANA SOSIAL ================= */}
      {showSocialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-border shadow-modal space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-sm text-ink">Pencairan Dana Santunan & Kesehatan</h3>
              <button onClick={() => setShowSocialModal(false)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            <form onSubmit={handleSaveSocialAid} className="space-y-3">
              <div>
                <label className="font-bold text-ink block mb-1">Nama Penerima / Petugas *</label>
                <input
                  type="text"
                  placeholder="Pa Adri Harry (Petugas Satpam)"
                  value={socRecipient}
                  onChange={(e) => setSocRecipient(e.target.value)}
                  required
                  className="w-full p-2 bg-canvas border border-border rounded-xl font-bold text-ink"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-ink block mb-1">Jenis Bantuan</label>
                  <select
                    value={socType}
                    onChange={(e) => setSocType(e.target.value as any)}
                    className="w-full p-2 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="SANTUNAN_KESEHATAN">Santunan Kesehatan / RS</option>
                    <option value="SANTUNAN_DUKA_CITA">Santunan Duka Cita</option>
                    <option value="SANTUNAN_MUSIBAH_BENCANA">Santunan Musibah</option>
                    <option value="BINGKISAN_THR">Bingkisan Hari Raya (THR)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Nominal Santunan (Rp) *</label>
                  <input
                    type="number"
                    value={socAmount}
                    onChange={(e) => setSocAmount(Number(e.target.value))}
                    required
                    className="w-full p-2 bg-canvas border border-border rounded-xl font-mono font-bold text-ink"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Keterangan / Uraian *</label>
                <input
                  type="text"
                  placeholder="Bantuan pengobatan dan rawat jalan"
                  value={socDesc}
                  onChange={(e) => setSocDesc(e.target.value)}
                  required
                  className="w-full p-2 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Detail RS / Dokumen</label>
                <input
                  type="text"
                  placeholder="RSUD Al-Ihsan / Kwitansi Dokter"
                  value={socDetails}
                  onChange={(e) => setSocDetails(e.target.value)}
                  className="w-full p-2 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowSocialModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas active:scale-[0.98] transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs active:scale-[0.98] transition-all"
                >
                  Cairkan Dana Santunan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: TAMBAH PROYEK CAT & FASUM ================= */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-border shadow-modal space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-sm text-ink">Catat Proyek Cat Komplek & Perbaikan Alat</h3>
              <button onClick={() => setShowProjectModal(false)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-3">
              <div>
                <label className="font-bold text-ink block mb-1">Nama Proyek / Pengadaan *</label>
                <input
                  type="text"
                  placeholder="Pengecatan Gapura Utama & Pagar Pembatas"
                  value={prjName}
                  onChange={(e) => setPrjName(e.target.value)}
                  required
                  className="w-full p-2 bg-canvas border border-border rounded-xl font-bold text-ink"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-ink block mb-1">Jenis Proyek</label>
                  <select
                    value={prjType}
                    onChange={(e) => setPrjType(e.target.value as any)}
                    className="w-full p-2 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="PENGECATAN_KOMPLEK">Pengecatan Tembok/Pagar</option>
                    <option value="PERBAIKAN_PERALATAN">Servis Mesin Rumput/Genset</option>
                    <option value="BARRIER_GATE_RFID">Palang Barrier Gate</option>
                    <option value="LAMPU_PJU">Lampu PJU Tenaga Surya</option>
                    <option value="CCTV_KEAMANAN">Kamera CCTV Keamanan</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Alokasi Biaya (Rp) *</label>
                  <input
                    type="number"
                    value={prjBudget}
                    onChange={(e) => setPrjBudget(Number(e.target.value))}
                    required
                    className="w-full p-2 bg-canvas border border-border rounded-xl font-mono font-bold text-ink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-ink block mb-1">Vendor / Mandor</label>
                  <input
                    type="text"
                    value={prjVendor}
                    onChange={(e) => setPrjVendor(e.target.value)}
                    className="w-full p-2 bg-canvas border border-border rounded-xl text-ink"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Lokasi Fasum</label>
                  <input
                    type="text"
                    value={prjLocation}
                    onChange={(e) => setPrjLocation(e.target.value)}
                    className="w-full p-2 bg-canvas border border-border rounded-xl text-ink"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Deskripsi Pekerjaan *</label>
                <input
                  type="text"
                  placeholder="Pengecatan ulang tembok keliling dan perbaikan sarana"
                  value={prjDesc}
                  onChange={(e) => setPrjDesc(e.target.value)}
                  required
                  className="w-full p-2 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas active:scale-[0.98] transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-xs active:scale-[0.98] transition-all"
                >
                  Simpan Proyek Fasum
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: VOUCHER BUKTI KAS KELUAR (BKK) ================= */}
      {selectedVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-border shadow-modal space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-black text-sm text-ink">Bukti Kas Keluar (BKK Resmi)</h3>
                <p className="text-[11px] text-ink-muted">Nomor: {selectedVoucher.voucherNo || `BKK-202608-${selectedVoucher.id.slice(-4)}`}</p>
              </div>
              <button onClick={() => setSelectedVoucher(null)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            <div className="p-4 bg-canvas rounded-2xl border border-border space-y-2.5">
              <div className="flex justify-between">
                <span className="text-ink-muted">Uraian Pembayaran:</span>
                <span className="font-black text-ink">{selectedVoucher.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Kategori Anggaran:</span>
                <span className="font-bold text-ink">{selectedVoucher.categoryName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Penerima Dana / Vendor:</span>
                <span className="font-bold text-primary-700">{selectedVoucher.vendor || 'Pengadaan Mandiri'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Tanggal Pencairan:</span>
                <span className="font-mono text-ink">{selectedVoucher.expenseDate}</span>
              </div>
              <div className="pt-2 border-t border-border flex justify-between items-center">
                <span className="font-bold text-ink">Jumlah Dibayarkan:</span>
                <span className="font-black text-base text-rose-700 font-mono">{formatRupiah(selectedVoucher.amount)}</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-emerald-950 text-[11px]">Telah Diverifikasi & Disetujui</p>
                <p className="text-emerald-800 text-[10px]">Oleh: Hendra Wijaya (Bendahara) & Ketua RW 05</p>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-xs inline-flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak PDF</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedVoucher(null)}
                className="flex-1 py-2.5 border border-border text-ink font-bold rounded-xl hover:bg-canvas active:scale-[0.98] transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
