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
  Banknote
} from 'lucide-react';
import { formatRupiah } from '../../lib/format';

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
}

export const ExpensesManager: React.FC<ExpensesManagerProps> = ({ initialExpenses }) => {
  const [expenses, setExpenses] = useState<ExpenseItem[]>(initialExpenses);
  const [activeSubTab, setActiveSubTab] = useState<'expenses_list' | 'staff_loans' | 'social_aid' | 'fasum_projects' | 'public_transparency'>('expenses_list');
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
  const [staffLoans, setStaffLoans] = useState<StaffLoanItem[]>([
    {
      id: 'LOAN-001',
      staffName: 'Pak Joko Sutrisno',
      staffRole: 'Komandan Regu Satpam',
      staffPhone: '0812-3344-5566',
      totalLoanAmount: 1500000,
      remainingBalance: 500000,
      paidAmount: 1000000,
      monthlyDeduction: 500000,
      tenorMonths: 3,
      loanDate: '2026-06-10',
      purpose: 'Biaya Masuk Sekolah Anak (SMP)',
      approvedBy: 'Ketua RW 05 & Bendahara',
      status: 'ACTIVE_INSTALLMENT',
    },
    {
      id: 'LOAN-002',
      staffName: 'Pak Slamet Riyadi',
      staffRole: 'Petugas Kebersihan & Sampah',
      staffPhone: '0813-7788-9900',
      totalLoanAmount: 1000000,
      remainingBalance: 1000000,
      paidAmount: 0,
      monthlyDeduction: 250000,
      tenorMonths: 4,
      loanDate: '2026-08-05',
      purpose: 'Perbaikan Motor Operasional Sampah',
      approvedBy: 'Bendahara Paguyuban',
      status: 'ACTIVE_INSTALLMENT',
    },
    {
      id: 'LOAN-003',
      staffName: 'Pak Dedi Supriyadi',
      staffRole: 'Petugas Keamanan (Satpam)',
      staffPhone: '0819-2233-4455',
      totalLoanAmount: 800000,
      remainingBalance: 0,
      paidAmount: 800000,
      monthlyDeduction: 400000,
      tenorMonths: 2,
      loanDate: '2026-05-15',
      purpose: 'Penggantian Kacamata & Cek Mata',
      approvedBy: 'Bendahara Paguyuban',
      status: 'PAID_OFF',
    },
  ]);

  const [showLoanModal, setShowLoanModal] = useState(false);
  const [loanStaffName, setLoanStaffName] = useState('Pak Joko Sutrisno');
  const [loanStaffRole, setLoanStaffRole] = useState<'SATPAM' | 'PETUGAS_KEBERSIHAN' | 'PETUGAS_TAMAN' | 'TEKNISI'>('SATPAM');
  const [loanAmount, setLoanAmount] = useState(1500000);
  const [loanMonthlyDeduction, setLoanMonthlyDeduction] = useState(500000);
  const [loanTenor, setLoanTenor] = useState(3);
  const [loanPurpose, setLoanPurpose] = useState('Keperluan Mendesak Keluarga');
  const [selectedLoanForInstallment, setSelectedLoanForInstallment] = useState<StaffLoanItem | null>(null);
  const [installmentAmountInput, setInstallmentAmountInput] = useState(500000);

  // ================= 2. DANA SOSIAL & KESEHATAN SATPAM STATE =================
  const [socialAids, setSocialAids] = useState<SocialAidItem[]>([
    {
      id: 'AID-001',
      recipientName: 'Pak Agus Suparman (Satpam)',
      recipientRole: 'SATPAM',
      aidType: 'SANTUNAN_KESEHATAN',
      amount: 1250000,
      aidDate: '2026-08-14',
      description: 'Bantuan Biaya Rawat Inap Istri di RSUD',
      hospitalOrDetails: 'RSUD Al-Ihsan Bandung • Kamar 304',
      voucherNo: 'BSOS-0814',
    },
    {
      id: 'AID-002',
      recipientName: 'Pak Yanto Hermawan (Satpam)',
      recipientRole: 'SATPAM',
      aidType: 'SANTUNAN_DUKA_CITA',
      amount: 1000000,
      aidDate: '2026-07-20',
      description: 'Tali Asih & Santunan Duka Cita Wafatnya Orang Tua',
      hospitalOrDetails: 'Rumah Duka Sumedang',
      voucherNo: 'BSOS-0720',
    },
    {
      id: 'AID-003',
      recipientName: 'Seluruh 6 Petugas Satpam & 2 Petugas Kebersihan',
      recipientRole: 'SATPAM',
      aidType: 'BINGKISAN_THR',
      amount: 4000000,
      aidDate: '2026-04-10',
      description: 'Bingkisan Sembako & Tunjangan Hari Raya Paguyuban Warga',
      voucherNo: 'BSOS-0410',
    },
  ]);

  const [showSocialModal, setShowSocialModal] = useState(false);
  const [socRecipient, setSocRecipient] = useState('Pak Agus Suparman (Satpam)');
  const [socType, setSocType] = useState<'SANTUNAN_KESEHATAN' | 'SANTUNAN_DUKA_CITA' | 'SANTUNAN_MUSIBAH_BENCANA' | 'BINGKISAN_THR' | 'BEASISWA_ANAK'>('SANTUNAN_KESEHATAN');
  const [socAmount, setSocAmount] = useState(1000000);
  const [socDesc, setSocDesc] = useState('Bantuan biaya pengobatan & santunan kesehatan keluarga satpam');
  const [socDetails, setSocDetails] = useState('Kwitansi RS & Resep Dokter');

  // ================= 3. DANA PEMELIHARAAN FASUM (CAT & PERALATAN) STATE =================
  const [maintenanceProjects, setMaintenanceProjects] = useState<MaintenanceProjectItem[]>([
    {
      id: 'PRJ-001',
      projectName: 'Pengecatan Ulang Gapura Utama & Tembok Keliling Komplek',
      projectType: 'PENGECATAN_KOMPLEK',
      budgetAmount: 6500000,
      actualSpent: 6500000,
      vendorOrContractor: 'Mandor Wawan & Tim Cat Dulux Weathershield',
      startDate: '2026-08-01',
      targetCompletionDate: '2026-08-20',
      status: 'COMPLETED',
      description: 'Pengecatan 400 meter tembok keliling komplek dan gapura pos satpam depan.',
      location: 'Gerbang Utama & Tembok Batas Luar',
    },
    {
      id: 'PRJ-002',
      projectName: 'Servis Besar & Penggantian Pisau Mesin Rumput Dorong',
      projectType: 'PERBAIKAN_PERALATAN',
      budgetAmount: 850000,
      actualSpent: 850000,
      vendorOrContractor: 'Bengkel Mesin Teknik Cimahi',
      startDate: '2026-08-10',
      targetCompletionDate: '2026-08-12',
      status: 'COMPLETED',
      description: 'Servis karburator, ganti oli mesin Honda 4-tak, dan 2 bilah pisau baja potong rumput.',
      location: 'Gudang Sarana Balai Warga',
    },
    {
      id: 'PRJ-003',
      projectName: 'Penggantian Motor Dinamo Barrier Gate RFID Palang 1',
      projectType: 'BARRIER_GATE_RFID',
      budgetAmount: 2400000,
      actualSpent: 1200000,
      vendorOrContractor: 'CV Prima Access Security Bandung',
      startDate: '2026-08-25',
      targetCompletionDate: '2026-09-05',
      status: 'IN_PROGRESS',
      description: 'Penggantian modul gear motorik palang masuk otomatis gerbang 1 (Garansi 1 Tahun).',
      location: 'Pos Satpam Gerbang 1',
    },
    {
      id: 'PRJ-004',
      projectName: 'Pengadaan Lampu LED PJU Solar Cell Tenaga Surya (4 Titik Gelap)',
      projectType: 'LAMPU_PJU',
      budgetAmount: 3200000,
      actualSpent: 3200000,
      vendorOrContractor: 'PT Solar Panel Jaya Abadi',
      startDate: '2026-07-15',
      targetCompletionDate: '2026-07-22',
      status: 'COMPLETED',
      description: 'Pemasangan tiang dan lampu PJU otomatis sensor gerak di area tikungan Blok D & Kavling.',
      location: 'Jl. Sariwangi Indah 2 & Area Kavling',
    },
  ]);

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [prjName, setPrjName] = useState('Pengecatan Pos Satpam & Pagar Pembatas');
  const [prjType, setPrjType] = useState<'PENGECATAN_KOMPLEK' | 'PERBAIKAN_PERALATAN' | 'LAMPU_PJU' | 'BARRIER_GATE_RFID' | 'CCTV_KEAMANAN' | 'TAMAN_RESAPAN'>('PENGECATAN_KOMPLEK');
  const [prjBudget, setPrjBudget] = useState(3500000);
  const [prjVendor, setPrjVendor] = useState('Mandor Wawan');
  const [prjLocation, setPrjLocation] = useState('Pos Satpam & Balai Warga');
  const [prjDesc, setPrjDesc] = useState('Pengecatan ulang dan perbaikan peralatan umum komplek');

  // Form State for General Expense
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Keamanan');
  const [formAmount, setFormAmount] = useState('750000');
  const [formVendor, setFormVendor] = useState('PT Guard Nusantara / Toko Material');
  const [formExpenseDate, setFormExpenseDate] = useState(new Date().toISOString().substring(0, 10));
  const [formDescription, setFormDescription] = useState('Pengeluaran operasional paguyuban');
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
            <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-xs font-black border border-rose-200">
              Kas BCA: Rp 128.450.000
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Pusat pengelolaan belanja operasional, <strong>Kasbon & Pinjaman Petugas Satpam/Kebersihan</strong>, <strong>Dana Santunan Sosial & Kesehatan</strong>, serta <strong>Proyek Cat Komplek & Perbaikan Peralatan</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeSubTab === 'staff_loans' && (
            <button
              type="button"
              onClick={() => setShowLoanModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Tambah Kasbon / Pinjaman
            </button>
          )}
          {activeSubTab === 'social_aid' && (
            <button
              type="button"
              onClick={() => setShowSocialModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <HeartHandshake className="w-4 h-4" />
              Cairkan Santunan Sosial
            </button>
          )}
          {activeSubTab === 'fasum_projects' && (
            <button
              type="button"
              onClick={() => setShowProjectModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <Paintbrush className="w-4 h-4" />
              Catat Proyek Cat & Alat
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
              Warga dapat melihat laporan kas masuk-keluar, nota belanja, serta daftar unit yang sudah lunas secara terbuka di [transparency](http://localhost:4321/transparency).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleCopyPublicLink}
            className="px-3.5 py-2 bg-white hover:bg-emerald-100 text-emerald-900 font-bold rounded-xl border border-emerald-300 shadow-2xs inline-flex items-center gap-1.5 transition-colors"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-emerald-700" />}
            Salin Link Publik
          </button>
          <a
            href={publicTransparencyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-2xs inline-flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Buka Transparansi
          </a>
        </div>
      </div>

      {/* 5 Sub-Tabs Navigation Bar */}
      <div className="flex items-center gap-2 p-1.5 bg-surface rounded-2xl border border-border shadow-xs overflow-x-auto no-scrollbar">
        {[
          { id: 'expenses_list', label: 'Buku Pengeluaran & Nota Belanja', icon: FileText, count: expenses.length },
          { id: 'staff_loans', label: 'Kasbon & Pinjaman Petugas (Satpam)', icon: Banknote, count: staffLoans.length },
          { id: 'social_aid', label: 'Dana Santunan & Kesehatan Petugas', icon: HeartHandshake, count: socialAids.length },
          { id: 'fasum_projects', label: 'Dana Cat Komplek & Perbaikan Alat', icon: Paintbrush, count: maintenanceProjects.length },
          { id: 'public_transparency', label: 'Rekapitulasi Iuran Warga (Lunas vs Belum)', icon: Eye },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-ink-muted hover:text-ink hover:bg-canvas'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                  isActive ? 'bg-white/20 text-white' : 'bg-canvas text-ink-muted border border-border'
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
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[11px] font-semibold text-ink-muted">Total Pengeluaran Rutin</span>
              <p className="text-xl font-black text-rose-700 mt-1 tabular-nums">{formatRupiah(totalExpense)}</p>
              <span className="text-[10px] text-ink-muted mt-0.5 block">{expenses.length} Pos Pembelanjaan</span>
            </div>

            <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[11px] font-semibold text-ink-muted">Piutang Kasbon Petugas</span>
              <p className="text-xl font-black text-indigo-700 mt-1 tabular-nums">{formatRupiah(totalActiveLoans)}</p>
              <span className="text-[10px] text-indigo-800 font-bold mt-0.5 block">Dicicil potong gaji bulanan</span>
            </div>

            <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[11px] font-semibold text-ink-muted">Realisasi Dana Santunan Sosial</span>
              <p className="text-xl font-black text-emerald-700 mt-1 tabular-nums">{formatRupiah(totalSocialGranted)}</p>
              <span className="text-[10px] text-emerald-700 font-bold mt-0.5 block">Kesehatan & Musibah</span>
            </div>

            <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[11px] font-semibold text-ink-muted">Proyek Cat & Peralatan Fasum</span>
              <p className="text-xl font-black text-amber-700 mt-1 tabular-nums">{formatRupiah(totalProjectsBudget)}</p>
              <span className="text-[10px] text-amber-800 font-bold mt-0.5 block">Tembok, Barrier Gate & PJU</span>
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
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {paginatedExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-canvas/50 text-ink transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-ink font-bold block">{exp.expenseDate}</span>
                        <span className="text-[10px] text-ink-muted font-mono">{exp.voucherNo || `BKK-${exp.id.slice(-4)}`}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-canvas border border-border font-bold text-[11px] text-ink">
                          {exp.categoryName || 'Operasional'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-black text-ink block text-xs">{exp.title}</span>
                        <span className="text-[10px] text-ink-muted">{exp.vendor || 'Pengadaan Mandiri'}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-rose-700 text-sm tabular-nums">
                        - {formatRupiah(exp.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-black text-[10px] border border-emerald-300">
                          ✓ {exp.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setSelectedVoucher(exp)}
                            className="px-2 py-1 bg-primary-50 hover:bg-primary-100 text-primary-800 rounded-lg font-bold inline-flex items-center gap-1 text-[11px]"
                          >
                            <Receipt className="w-3.5 h-3.5" /> Voucher BKK
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUBTAB 2: KASBON & PINJAMAN PETUGAS SATPAM ================= */}
      {activeSubTab === 'staff_loans' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="p-5 bg-surface rounded-3xl border border-border shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <h3 className="font-black text-base text-ink flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-indigo-600" />
                  Manajemen Kasbon & Pinjaman Petugas (Satpam & Kebersihan)
                </h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  Catat pinjaman darurat / gaji diambil lebih awal, dan kelola cicilan pengembalian potong gaji bulanan secara tertib.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowLoanModal(true)}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                Catat Pinjaman Baru
              </button>
            </div>

            {/* List of Staff Loans */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {staffLoans.map((loan) => {
                const isPaidOff = loan.status === 'PAID_OFF';
                return (
                  <div key={loan.id} className="p-4 bg-canvas rounded-2xl border border-border space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-ink-muted">{loan.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        isPaidOff ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {isPaidOff ? '✓ LUNAS' : 'SEDANG DICICIL'}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-black text-ink text-sm">{loan.staffName}</h4>
                      <p className="text-[11px] text-indigo-700 font-semibold">{loan.staffRole}</p>
                      <p className="text-[11px] text-ink-muted mt-1 italic">"{loan.purpose}"</p>
                    </div>

                    <div className="p-2.5 bg-surface rounded-xl border border-border space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-ink-muted">Total Pinjaman:</span>
                        <span className="font-bold text-ink font-mono">{formatRupiah(loan.totalLoanAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-muted">Sudah Dibayar:</span>
                        <span className="font-bold text-emerald-700 font-mono">{formatRupiah(loan.paidAmount)}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-border">
                        <span className="font-bold text-ink">Sisa Hutang:</span>
                        <span className="font-black text-rose-700 font-mono">{formatRupiah(loan.remainingBalance)}</span>
                      </div>
                    </div>

                    {!isPaidOff && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedLoanForInstallment(loan);
                          setInstallmentAmountInput(loan.monthlyDeduction);
                        }}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-xs"
                      >
                        Bayar Cicilan Potong Gaji ({formatRupiah(loan.monthlyDeduction)})
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
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
          </div>
        </div>
      )}

      {/* ================= SUBTAB 5: REKAPITULASI IURAN TRANSPARANSI ================= */}
      {activeSubTab === 'public_transparency' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="p-5 bg-surface rounded-3xl border border-border shadow-card space-y-4 text-xs">
            <h3 className="font-black text-base text-ink flex items-center gap-2">
              <Eye className="w-5 h-5 text-emerald-600" />
              Rekapitulasi Iuran Transparansi Warga Terbuka (Agustus 2026)
            </h3>
            <p className="text-ink-muted">
              Laporan ringkas status setoran warga komplek yang disinkronisasi ke portal [transparency](http://localhost:4321/transparency).
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                <span className="font-black text-emerald-950 block">86 Unit LUNAS</span>
                <span className="text-emerald-800 text-[11px]">Terkumpul: Rp 64.500.000 (72%)</span>
              </div>
              <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200">
                <span className="font-black text-rose-950 block">34 Unit BELUM BAYAR</span>
                <span className="text-rose-800 text-[11px]">Piutang: Rp 25.500.000</span>
              </div>
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
                  className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs"
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
                className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handlePayInstallment}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs"
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
                  placeholder="Pak Agus Suparman (Satpam)"
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
                  className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs"
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
                  className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-xs"
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
                className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-xs inline-flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Cetak PDF
              </button>
              <button
                type="button"
                onClick={() => setSelectedVoucher(null)}
                className="flex-1 py-2.5 border border-border text-ink font-bold rounded-xl hover:bg-canvas"
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
