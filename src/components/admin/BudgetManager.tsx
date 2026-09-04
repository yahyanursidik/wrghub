import React, { useState, useMemo, useEffect } from 'react';
import {
  PieChart,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Share2,
  Copy,
  ExternalLink,
  PlusCircle,
  Edit3,
  Trash2,
  Printer,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Search,
  Filter,
  Download,
  Building,
  Check,
  Receipt,
  CreditCard,
  Layers,
  Banknote,
  Eye,
  ShieldCheck,
  Clock,
  Sparkles,
  TrendingDown,
  FileText,
  RefreshCw,
  Plus,
  AlertCircle
} from 'lucide-react';
import { formatRupiah } from '../../lib/format';

export interface BudgetItem {
  id: string;
  category: string;
  period: string;
  budgetAmount: number;
  actualAmount: number;
  percentage: number;
  variance: number;
  status: 'SAFE' | 'WARNING' | 'EXCEEDED';
  pic: string;
  notes?: string | null;
  authCode?: string;
}

export interface SinkingFundItem {
  id: string;
  fundName: string;
  targetAmount: number;
  currentBalance: number;
  purpose: string;
  planYear: string;
  status: 'ACCUMULATING' | 'READY_FOR_USE';
}

export interface BudgetManagerProps {
  initialProperties?: any[];
  initialInvoices?: any[];
  initialExpenses?: any[];
  initialBalance?: number;
}

const DEFAULT_BUDGET_ITEMS: BudgetItem[] = [
  {
    id: 'BUD-001',
    category: 'Operasional Keamanan & Ronda Warga (Satpam)',
    period: 'Agustus 2026',
    budgetAmount: 4500000,
    actualAmount: 0,
    percentage: 0,
    variance: 4500000,
    status: 'SAFE',
    pic: 'Seksi Keamanan & Ketertiban',
    notes: 'Alokasi honor satpam 24 jam & logistik ronda malam',
    authCode: 'APPR-202608-01',
  },
  {
    id: 'BUD-002',
    category: 'Kebersihan Lingkungan & Retribusi Sampah',
    period: 'Agustus 2026',
    budgetAmount: 2500000,
    actualAmount: 0,
    percentage: 0,
    variance: 2500000,
    status: 'SAFE',
    pic: 'Seksi Kebersihan & Lingkungan',
    notes: 'Honor petugas kebersihan & retribusi angkut sampah DLH',
    authCode: 'APPR-202608-02',
  },
  {
    id: 'BUD-003',
    category: 'Pemeliharaan Penerangan Jalan Umum (PJU & Listrik)',
    period: 'Agustus 2026',
    budgetAmount: 1500000,
    actualAmount: 0,
    percentage: 0,
    variance: 1500000,
    status: 'SAFE',
    pic: 'Seksi Sarana & Prasarana',
    notes: 'Beban tagihan listrik PJU, pos satpam & penggantian lampu LED',
    authCode: 'APPR-202608-03',
  },
  {
    id: 'BUD-004',
    category: 'Perawatan Taman, Drainase & Fogging',
    period: 'Agustus 2026',
    budgetAmount: 1200000,
    actualAmount: 0,
    percentage: 0,
    variance: 1200000,
    status: 'SAFE',
    pic: 'Seksi Lingkungan Hidup',
    notes: 'Perawatan rumput fasum, normalisasi selokan & pencegahan DBD',
    authCode: 'APPR-202608-04',
  },
  {
    id: 'BUD-005',
    category: 'Kas Operasional Sekretariat RT/RW & ATK',
    period: 'Agustus 2026',
    budgetAmount: 800000,
    actualAmount: 0,
    percentage: 0,
    variance: 800000,
    status: 'SAFE',
    pic: 'Sekretaris / Bendahara',
    notes: 'Kertas kuitansi, stempel, materai, dan administrasi kependudukan',
    authCode: 'APPR-202608-05',
  },
  {
    id: 'BUD-006',
    category: 'Santunan Sosial Warga & Hari Besar (PHBN)',
    period: 'Agustus 2026',
    budgetAmount: 1000000,
    actualAmount: 0,
    percentage: 0,
    variance: 1000000,
    status: 'SAFE',
    pic: 'Seksi Sosial & Kerohanian',
    notes: 'Bantuan duka cita, persalinan, dan peringatan kemerdekaan RI',
    authCode: 'APPR-202608-06',
  },
];

const DEFAULT_SINKING_FUNDS: SinkingFundItem[] = [
  {
    id: 'SNK-001',
    fundName: 'Cadangan Aspal & Hotmix Jalan Komplek',
    targetAmount: 25000000,
    currentBalance: 5000000,
    purpose: 'Pelapisan ulang hotmix jalan utama dan gang blok kavling',
    planYear: '2027',
    status: 'ACCUMULATING',
  },
  {
    id: 'SNK-002',
    fundName: 'Peremajaan Pompa Air Bersih & Drainase Fasum',
    targetAmount: 10000000,
    currentBalance: 3500000,
    purpose: 'Pengadaan pompa cadangan booster submersible & sumur resapan',
    planYear: '2026',
    status: 'ACCUMULATING',
  },
  {
    id: 'SNK-003',
    fundName: 'Renovasi Balai Warga RT/RW & Ruang Posyandu',
    targetAmount: 15000000,
    currentBalance: 4000000,
    purpose: 'Perbaikan atap balai pertemuan, kanopi posyandu, dan cat tembok',
    planYear: '2027',
    status: 'ACCUMULATING',
  },
  {
    id: 'SNK-004',
    fundName: 'Pengadaan Sistem Barrier Gate Otomatis & CCTV Cloud',
    targetAmount: 8000000,
    currentBalance: 2500000,
    purpose: 'Modernisasi palang pintu pos satpam RFID card & kamera NVR 24 jam',
    planYear: '2026',
    status: 'ACCUMULATING',
  },
];

export const BudgetManager: React.FC<BudgetManagerProps> = ({
  initialProperties = [],
  initialInvoices = [],
  initialExpenses = [],
  initialBalance = 0,
}) => {
  const [period, setPeriod] = useState('Agustus 2026');
  const [activeSubTab, setActiveSubTab] = useState<'budget_matrix' | 'sinking_fund' | 'public_transparency' | 'manual_form'>('budget_matrix');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'category' | 'budget' | 'actual' | 'percentage' | 'variance'>('percentage');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals & Feedback
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<BudgetItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<BudgetItem | null>(null);
  const [deleteReason, setDeleteReason] = useState('Revisi Rencana Anggaran Tahunan (RAB)');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Sinking Fund Modals
  const [showSinkingModal, setShowSinkingModal] = useState(false);
  const [editingSinkingId, setEditingSinkingId] = useState<string | null>(null);
  const [sinkingFormName, setSinkingFormName] = useState('');
  const [sinkingFormTarget, setSinkingFormTarget] = useState('10000000');
  const [sinkingFormBalance, setSinkingFormBalance] = useState('1000000');
  const [sinkingFormPurpose, setSinkingFormPurpose] = useState('');
  const [sinkingFormYear, setSinkingFormYear] = useState('2027');

  // Deposit Sinking Fund Dialog
  const [selectedSinkingForDeposit, setSelectedSinkingForDeposit] = useState<SinkingFundItem | null>(null);
  const [depositAmount, setDepositAmount] = useState('500000');

  // Form State for Budget Items
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [formCategory, setFormCategory] = useState('');
  const [formBudgetAmount, setFormBudgetAmount] = useState('5000000');
  const [formActualAmount, setFormActualAmount] = useState('0');
  const [formPic, setFormPic] = useState('Seksi Sarana & Prasarana');
  const [formNotes, setFormNotes] = useState('Alokasi pagu anggaran hasil musyawarah warga RT/RW');
  const [savingBudget, setSavingBudget] = useState(false);

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Budget Items from localStorage with realistic fallback
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('wargahub_budget_items');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return DEFAULT_BUDGET_ITEMS;
  });

  // Sinking Fund Items from localStorage with realistic fallback
  const [sinkingFunds, setSinkingFunds] = useState<SinkingFundItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('wargahub_sinking_funds');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return DEFAULT_SINKING_FUNDS;
  });

  // Persist Budget Items
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('wargahub_budget_items', JSON.stringify(budgetItems));
      } catch (e) {}
    }
  }, [budgetItems]);

  // Persist Sinking Funds
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('wargahub_sinking_funds', JSON.stringify(sinkingFunds));
      } catch (e) {}
    }
  }, [sinkingFunds]);

  // Totals
  const totalBudget = budgetItems.reduce((acc, i) => acc + i.budgetAmount, 0);
  const totalActual = budgetItems.reduce((acc, i) => acc + i.actualAmount, 0);
  const totalVariance = totalBudget - totalActual;
  const overallPercentage = totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0;
  const totalSinkingBalance = sinkingFunds.reduce((sum, s) => sum + s.currentBalance, 0);
  const totalSinkingTarget = sinkingFunds.reduce((sum, s) => sum + s.targetAmount, 0);

  // Sync with Real Expenses from Database
  const handleSyncWithExpenses = () => {
    if (!initialExpenses || initialExpenses.length === 0) {
      showToast('Buku kas dan pengeluaran saat ini masih Rp 0. Tidak ada beban riil untuk disinkronkan.');
      return;
    }

    let updatedCount = 0;
    const newItems = budgetItems.map((b) => {
      const catLower = b.category.toLowerCase();
      let matchedTotal = 0;

      for (const exp of initialExpenses) {
        const titleLower = (exp.title || '').toLowerCase();
        const descLower = (exp.description || '').toLowerCase();
        const expCatLower = (exp.categoryName || '').toLowerCase();
        const amt = Number(exp.amount) || 0;

        const isMatch =
          (catLower.includes('keamanan') && (titleLower.includes('satpam') || descLower.includes('satpam') || expCatLower.includes('keamanan'))) ||
          (catLower.includes('kebersihan') && (titleLower.includes('sampah') || descLower.includes('kebersihan') || expCatLower.includes('kebersihan'))) ||
          (catLower.includes('pju') && (titleLower.includes('listrik') || titleLower.includes('pln') || descLower.includes('pju'))) ||
          (catLower.includes('taman') && (titleLower.includes('taman') || descLower.includes('rumput') || descLower.includes('fogging'))) ||
          (catLower.includes('atk') && (titleLower.includes('atk') || descLower.includes('kertas') || descLower.includes('administrasi'))) ||
          (catLower.includes('sosial') && (titleLower.includes('sosial') || descLower.includes('santunan') || descLower.includes('bantuan')));

        if (isMatch) {
          matchedTotal += amt;
        }
      }

      if (matchedTotal !== b.actualAmount) {
        updatedCount++;
        const pct = b.budgetAmount > 0 ? (matchedTotal / b.budgetAmount) * 100 : 0;
        const statusVal: 'SAFE' | 'WARNING' | 'EXCEEDED' = pct > 100 ? 'EXCEEDED' : pct >= 85 ? 'WARNING' : 'SAFE';
        return {
          ...b,
          actualAmount: matchedTotal,
          percentage: Number(pct.toFixed(1)),
          variance: b.budgetAmount - matchedTotal,
          status: statusVal,
        };
      }
      return b;
    });

    setBudgetItems(newItems);
    showToast(`Sinkronisasi selesai! ${updatedCount} pos pagu disesuaikan dengan realisasi beban riil.`);
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingBudgetId(null);
    setFormCategory('');
    setFormBudgetAmount('5000000');
    setFormActualAmount('0');
    setFormPic('Seksi Sarana & Prasarana');
    setFormNotes('Alokasi pagu anggaran hasil musyawarah warga RT/RW');
    setShowAddModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (item: BudgetItem) => {
    setEditingBudgetId(item.id);
    setFormCategory(item.category);
    setFormBudgetAmount(item.budgetAmount.toString());
    setFormActualAmount(item.actualAmount.toString());
    setFormPic(item.pic);
    setFormNotes(item.notes || '');
    setShowAddModal(true);
  };

  // Save Budget (Create / Update)
  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCategory || !formBudgetAmount) return;
    setSavingBudget(true);
    const numBudget = parseInt(formBudgetAmount.replace(/\D/g, ''), 10) || 0;
    const numActual = parseInt(formActualAmount.replace(/\D/g, ''), 10) || 0;
    const pct = numBudget > 0 ? (numActual / numBudget) * 100 : 0;
    const varAmount = numBudget - numActual;
    const statusVal: 'SAFE' | 'WARNING' | 'EXCEEDED' = pct > 100 ? 'EXCEEDED' : pct >= 85 ? 'WARNING' : 'SAFE';

    try {
      if (editingBudgetId) {
        const res = await fetch('/api/budget/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            budgetId: editingBudgetId,
            category: formCategory,
            budgetAmount: numBudget,
            actualAmount: numActual,
            pic: formPic,
            notes: formNotes,
          }),
        });

        if (res.ok) {
          setBudgetItems(
            budgetItems.map((b) =>
              b.id === editingBudgetId
                ? {
                    ...b,
                    category: formCategory,
                    budgetAmount: numBudget,
                    actualAmount: numActual,
                    percentage: Number(pct.toFixed(1)),
                    variance: varAmount,
                    status: statusVal,
                    pic: formPic,
                    notes: formNotes,
                  }
                : b
            )
          );
          showToast(`Pos anggaran "${formCategory}" berhasil diperbarui.`);
          setShowAddModal(false);
        }
      } else {
        const res = await fetch('/api/budget/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category: formCategory,
            period,
            budgetAmount: numBudget,
            actualAmount: numActual,
            pic: formPic,
            notes: formNotes,
          }),
        });

        if (res.ok) {
          const newB: BudgetItem = {
            id: `BUD-${Date.now().toString().slice(-4)}`,
            category: formCategory,
            period,
            budgetAmount: numBudget,
            actualAmount: numActual,
            percentage: Number(pct.toFixed(1)),
            variance: varAmount,
            status: statusVal,
            pic: formPic,
            notes: formNotes,
            authCode: `APPR-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${Date.now().toString().slice(-3)}`,
          };
          setBudgetItems([newB, ...budgetItems]);
          showToast(`Pos anggaran "${formCategory}" sebesar ${formatRupiah(numBudget)} berhasil disahkan.`);
          setShowAddModal(false);
          setActiveSubTab('budget_matrix');
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan pos anggaran.');
    } finally {
      setSavingBudget(false);
    }
  };

  // Confirm Delete Budget
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      const res = await fetch('/api/budget/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budgetId: itemToDelete.id,
          category: itemToDelete.category,
          budgetAmount: itemToDelete.budgetAmount,
          reason: deleteReason,
        }),
      });

      if (res.ok) {
        setBudgetItems(budgetItems.filter((b) => b.id !== itemToDelete.id));
        showToast(`Pos anggaran "${itemToDelete.category}" berhasil dihapus.`);
        setItemToDelete(null);
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menghapus pos anggaran.');
    }
  };

  // Sinking Fund CRUD
  const handleOpenAddSinking = () => {
    setEditingSinkingId(null);
    setSinkingFormName('');
    setSinkingFormTarget('10000000');
    setSinkingFormBalance('0');
    setSinkingFormPurpose('');
    setSinkingFormYear('2027');
    setShowSinkingModal(true);
  };

  const handleOpenEditSinking = (item: SinkingFundItem) => {
    setEditingSinkingId(item.id);
    setSinkingFormName(item.fundName);
    setSinkingFormTarget(item.targetAmount.toString());
    setSinkingFormBalance(item.currentBalance.toString());
    setSinkingFormPurpose(item.purpose);
    setSinkingFormYear(item.planYear);
    setShowSinkingModal(true);
  };

  const handleSaveSinkingFund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sinkingFormName || !sinkingFormTarget) return;
    const target = parseInt(sinkingFormTarget.replace(/\D/g, ''), 10) || 0;
    const balance = parseInt(sinkingFormBalance.replace(/\D/g, ''), 10) || 0;

    if (editingSinkingId) {
      setSinkingFunds(
        sinkingFunds.map((s) =>
          s.id === editingSinkingId
            ? {
                ...s,
                fundName: sinkingFormName,
                targetAmount: target,
                currentBalance: balance,
                purpose: sinkingFormPurpose,
                planYear: sinkingFormYear,
                status: balance >= target ? 'READY_FOR_USE' : 'ACCUMULATING',
              }
            : s
        )
      );
      showToast(`Dana cadangan "${sinkingFormName}" berhasil diperbarui.`);
    } else {
      const newS: SinkingFundItem = {
        id: `SNK-${Date.now().toString().slice(-4)}`,
        fundName: sinkingFormName,
        targetAmount: target,
        currentBalance: balance,
        purpose: sinkingFormPurpose,
        planYear: sinkingFormYear,
        status: balance >= target ? 'READY_FOR_USE' : 'ACCUMULATING',
      };
      setSinkingFunds([...sinkingFunds, newS]);
      showToast(`Pos dana cadangan "${sinkingFormName}" berhasil ditambahkan.`);
    }
    setShowSinkingModal(false);
  };

  const handleDeleteSinking = (id: string, name: string) => {
    if (window.confirm(`Hapus pos dana cadangan "${name}"?`)) {
      setSinkingFunds(sinkingFunds.filter((s) => s.id !== id));
      showToast(`Pos dana cadangan "${name}" telah dihapus.`);
    }
  };

  const handleConfirmDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSinkingForDeposit) return;
    const addAmt = parseInt(depositAmount.replace(/\D/g, ''), 10) || 0;
    if (addAmt <= 0) return;

    setSinkingFunds(
      sinkingFunds.map((s) => {
        if (s.id === selectedSinkingForDeposit.id) {
          const newBal = s.currentBalance + addAmt;
          return {
            ...s,
            currentBalance: newBal,
            status: newBal >= s.targetAmount ? 'READY_FOR_USE' : 'ACCUMULATING',
          };
        }
        return s;
      })
    );

    showToast(`Berhasil menyetor ${formatRupiah(addAmt)} ke "${selectedSinkingForDeposit.fundName}".`);
    setSelectedSinkingForDeposit(null);
  };

  // Filter & Sort
  const filteredAndSortedItems = useMemo(() => {
    const list = budgetItems.filter((b) => {
      const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
      const matchesSearch =
        b.category.toLowerCase().includes(search.toLowerCase()) ||
        b.pic.toLowerCase().includes(search.toLowerCase()) ||
        (b.notes && b.notes.toLowerCase().includes(search.toLowerCase()));
      return matchesStatus && matchesSearch;
    });

    list.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'category') comparison = a.category.localeCompare(b.category);
      else if (sortBy === 'budget') comparison = a.budgetAmount - b.budgetAmount;
      else if (sortBy === 'actual') comparison = a.actualAmount - b.actualAmount;
      else if (sortBy === 'percentage') comparison = a.percentage - b.percentage;
      else if (sortBy === 'variance') comparison = a.variance - b.variance;
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return list;
  }, [budgetItems, statusFilter, search, sortBy, sortOrder]);

  // Pagination
  const totalFiltered = filteredAndSortedItems.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalFiltered);
  const paginatedItems = filteredAndSortedItems.slice(startIndex, endIndex);

  // Copy Public Link
  const handleCopyPublicLink = () => {
    const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}/transparency` : '/transparency';
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    showToast('Tautan publik transparansi keuangan berhasil disalin!');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Export CSV
  const exportCSV = () => {
    const headers = ['Kode Pos', 'Nama Pos Anggaran', 'Periode', 'Pagu Target (Rp)', 'Realisasi Aktual (Rp)', 'Serapan (%)', 'Sisa Selisih (Rp)', 'Status', 'Penanggung Jawab (PIC)', 'Catatan'];
    const rows = filteredAndSortedItems.map((b) => [
      b.id,
      `"${b.category.replace(/"/g, '""')}"`,
      b.period,
      b.budgetAmount,
      b.actualAmount,
      `${b.percentage}%`,
      b.variance,
      b.status,
      `"${b.pic}"`,
      `"${(b.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MATRIKS_ANGGARAN_PAGU_WARGAHUB_${period.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Matriks evaluasi pagu anggaran berhasil diekspor ke CSV.');
  };

  // Real Transparency Stats from Props (Zero Fake Data)
  const transparencyStats = useMemo(() => {
    const totalUnits = initialProperties.length;
    const paidInvoices = initialInvoices.filter((i: any) => i.status === 'PAID');
    const unpaidInvoices = initialInvoices.filter((i: any) => i.status !== 'PAID');
    const paidUnits = paidInvoices.length;
    const unpaidUnits = unpaidInvoices.length;
    const collectedAmount = paidInvoices.reduce((sum: number, i: any) => sum + Number(i.paidAmount || i.total || 0), 0);
    const unpaidAmount = unpaidInvoices.reduce((sum: number, i: any) => sum + Number(i.total || 0), 0);
    const rate = totalUnits > 0 && initialInvoices.length > 0 ? ((paidUnits / initialInvoices.length) * 100).toFixed(1) : '0.0';

    return {
      totalUnits,
      paidUnits,
      unpaidUnits,
      collectedAmount,
      unpaidAmount,
      rate,
      hasInvoices: initialInvoices.length > 0,
    };
  }, [initialProperties, initialInvoices]);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-700 text-white rounded-2xl shadow-xl font-bold text-xs animate-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header - Swiss Typographic Contrast */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-black tracking-tight text-ink flex items-center gap-2">
              <PieChart className="w-6 h-6 text-primary-600 shrink-0" />
              Anggaran & Realisasi Keuangan Paguyuban
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-primary-100 text-primary-800 text-[11px] font-bold border border-primary-200">
              Periode: {period}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black border border-emerald-200">
              {budgetItems.length} Pos Pagu Terdaftar
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1 leading-relaxed max-w-3xl">
            Monitoring penyerapan pagu operasional RT/RW, akumulasi <strong>Dana Cadangan Sinking Fund</strong>, evaluasi efisiensi kas, dan pencetakan surat pengesahan anggaran resmi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSyncWithExpenses}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-surface hover:bg-canvas active:scale-[0.98] border border-border text-ink text-xs font-bold rounded-xl shadow-2xs transition-all"
            title="Sinkronisasi otomatis dengan catatan beban di Buku Kas"
          >
            <RefreshCw className="w-4 h-4 text-primary-600" />
            Sinkron Beban
          </button>
          <button
            type="button"
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-surface hover:bg-canvas active:scale-[0.98] border border-border text-ink text-xs font-bold rounded-xl shadow-2xs transition-all"
          >
            <Download className="w-4 h-4 text-ink-muted" />
            Ekspor CSV
          </button>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-2xs transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Tetapkan Pagu Baru
          </button>
        </div>
      </div>

      {/* Public Transparency Share Callout Banner */}
      <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-2xs">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-emerald-950 text-sm">Tautan Publik Laporan Transparansi Kas & Iuran Warga</h4>
            <p className="text-emerald-800 text-[11px] mt-0.5">
              Bagikan tautan ini agar warga dapat memantau realisasi anggaran dan transparansi kas masuk-keluar secara terbuka.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleCopyPublicLink}
            className="px-3.5 py-2 bg-white hover:bg-emerald-100 active:scale-[0.98] text-emerald-900 font-bold rounded-xl border border-emerald-300 shadow-2xs inline-flex items-center gap-1.5 transition-all"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-emerald-700" />}
            {copiedLink ? 'Tersalin!' : 'Salin Link Publik'}
          </button>
          <a
            href="/transparency"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white font-bold rounded-xl shadow-2xs inline-flex items-center gap-1.5 transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            Buka Transparansi
          </a>
        </div>
      </div>

      {/* Swiss KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Pagu Disahkan */}
        <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Total Pagu Disahkan (RAB)</span>
              <span className="w-2 h-2 rounded-full bg-primary-500" />
            </div>
            <p className="text-2xl font-black text-ink mt-1.5 tabular-nums font-mono tracking-tight">
              {formatRupiah(totalBudget)}
            </p>
          </div>
          <div className="pt-2 border-t border-border/60 mt-2 flex items-center justify-between text-[11px]">
            <span className="text-ink-muted">{budgetItems.length} Pos Pengeluaran</span>
            <span className="font-semibold text-primary-700">Pagu Disetujui</span>
          </div>
        </div>

        {/* Card 2: Realisasi Belanja */}
        <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Total Realisasi Belanja</span>
              <span className={`w-2 h-2 rounded-full ${overallPercentage >= 100 ? 'bg-rose-500' : overallPercentage >= 85 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            </div>
            <p className="text-2xl font-black text-primary-700 mt-1.5 tabular-nums font-mono tracking-tight">
              {formatRupiah(totalActual)}
            </p>
          </div>
          <div className="pt-2 border-t border-border/60 mt-2 flex items-center justify-between text-[11px]">
            <span className="text-ink-muted">Serapan Pagu:</span>
            <span className={`font-bold tabular-nums ${overallPercentage >= 100 ? 'text-rose-700' : overallPercentage >= 85 ? 'text-amber-700' : 'text-emerald-700'}`}>
              {overallPercentage.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Card 3: Sisa Anggaran */}
        <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Sisa Anggaran (Efisiensi)</span>
              <span className={`w-2 h-2 rounded-full ${totalVariance >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            </div>
            <p className={`text-2xl font-black mt-1.5 tabular-nums font-mono tracking-tight ${totalVariance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {totalVariance >= 0 ? '+' : ''}{formatRupiah(totalVariance)}
            </p>
          </div>
          <div className="pt-2 border-t border-border/60 mt-2 flex items-center justify-between text-[11px]">
            <span className="text-ink-muted">Status:</span>
            <span className={`font-bold ${totalVariance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {totalVariance >= 0 ? '✓ Hemat Terjaga' : '⚠ Defisit Pagu'}
            </span>
          </div>
        </div>

        {/* Card 4: Sinking Fund */}
        <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Dana Cadangan (Sinking Fund)</span>
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
            </div>
            <p className="text-2xl font-black text-indigo-700 mt-1.5 tabular-nums font-mono tracking-tight">
              {formatRupiah(totalSinkingBalance)}
            </p>
          </div>
          <div className="pt-2 border-t border-border/60 mt-2 flex items-center justify-between text-[11px]">
            <span className="text-ink-muted">{sinkingFunds.length} Program Investasi</span>
            <span className="font-semibold text-indigo-700 font-mono tabular-nums">
              Target: {formatRupiah(totalSinkingTarget)}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Absorption Progress Bar */}
      <div className="p-3 bg-surface rounded-2xl border border-border shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="w-full sm:w-1/3">
          <div className="flex justify-between items-center mb-1 font-bold">
            <span className="text-ink-muted text-[11px]">Indikator Penyerapan Pagu Komprehensif:</span>
            <span className="font-mono tabular-nums text-ink">{overallPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-canvas rounded-full h-2.5 overflow-hidden border border-border">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overallPercentage >= 100 ? 'bg-rose-500' : overallPercentage >= 85 ? 'bg-amber-500' : 'bg-primary-600'
              }`}
              style={{ width: `${Math.min(overallPercentage, 100)}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-ink-muted">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary-600" />
            Aman (&lt;85%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Mendekati Pagu (85-100%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Melebihi Pagu (&gt;100%)
          </span>
        </div>
      </div>

      {/* 4 Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 p-1.5 bg-surface rounded-2xl border border-border shadow-2xs overflow-x-auto no-scrollbar">
        {[
          { id: 'budget_matrix', label: 'Matriks Pagu vs Realisasi Belanja', icon: PieChart, count: budgetItems.length },
          { id: 'sinking_fund', label: 'Dana Cadangan (Sinking Fund)', icon: Banknote, count: sinkingFunds.length },
          { id: 'public_transparency', label: 'Rekapitulasi Iuran Transparansi Warga', icon: Eye, count: transparencyStats.totalUnits },
          { id: 'manual_form', label: 'Penyusunan & Pengesahan Pagu (RAB)', icon: PlusCircle },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold active:scale-[0.98] transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-primary-600 text-white shadow-2xs'
                  : 'text-ink-muted hover:text-ink hover:bg-canvas'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                  isActive ? 'bg-white/20 text-white' : 'bg-canvas text-ink-muted border border-border'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ================= SUBTAB 1: MATRIKS PAGU ANGGARAN ================= */}
      {activeSubTab === 'budget_matrix' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Filters Bar */}
          <div className="bg-surface p-4 rounded-2xl border border-border shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('ALL');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold active:scale-[0.98] transition-all ${
                  statusFilter === 'ALL'
                    ? 'bg-primary-600 text-white shadow-2xs'
                    : 'bg-canvas text-ink-muted hover:text-ink border border-border'
                }`}
              >
                Semua Pos ({budgetItems.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('SAFE');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold active:scale-[0.98] transition-all ${
                  statusFilter === 'SAFE'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-canvas text-emerald-800 hover:bg-emerald-50 border border-border'
                }`}
              >
                ✓ Aman (&lt;85%)
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('WARNING');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold active:scale-[0.98] transition-all ${
                  statusFilter === 'WARNING'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-canvas text-amber-800 hover:bg-amber-50 border border-border'
                }`}
              >
                ⚠ Mendekati Pagu (85-100%)
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('EXCEEDED');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold active:scale-[0.98] transition-all ${
                  statusFilter === 'EXCEEDED'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'bg-canvas text-rose-800 hover:bg-rose-50 border border-border'
                }`}
              >
                ✕ Melebihi Pagu (&gt;100%)
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 text-ink-muted absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari pos anggaran / PIC..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-1.5 bg-canvas border border-border rounded-xl text-xs text-ink placeholder:text-ink-muted focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 bg-canvas border border-border rounded-xl text-xs font-bold text-ink focus:outline-hidden"
              >
                <option value="percentage">Urut % Serapan</option>
                <option value="budget">Urut Pagu Target</option>
                <option value="actual">Urut Realisasi</option>
                <option value="variance">Urut Sisa Selisih</option>
                <option value="category">Urut Kategori</option>
              </select>

              <button
                type="button"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 bg-canvas active:scale-[0.98] border border-border rounded-xl text-ink-muted hover:text-ink transition-colors"
                title={`Urutan: ${sortOrder === 'asc' ? 'Menaik' : 'Menurun'}`}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Budget Table */}
          <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-canvas border-b border-border text-ink-muted font-bold">
                  <tr>
                    <th className="py-3.5 px-4 text-[10px] uppercase tracking-wider">Pos Anggaran & PIC</th>
                    <th className="py-3.5 px-4 text-right text-[10px] uppercase tracking-wider">Pagu Disahkan</th>
                    <th className="py-3.5 px-4 text-right text-[10px] uppercase tracking-wider">Realisasi Aktual</th>
                    <th className="py-3.5 px-4 text-[10px] uppercase tracking-wider min-w-[150px]">Serapan Pagu</th>
                    <th className="py-3.5 px-4 text-right text-[10px] uppercase tracking-wider">Sisa Anggaran</th>
                    <th className="py-3.5 px-4 text-center text-[10px] uppercase tracking-wider">Status</th>
                    <th className="py-3.5 px-4 text-right text-[10px] uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {paginatedItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-ink-muted">
                        <div className="max-w-sm mx-auto space-y-2">
                          <PieChart className="w-8 h-8 text-ink-muted mx-auto" />
                          <p className="font-bold text-xs text-ink">Tidak Ada Pos Anggaran Ditemukan</p>
                          <p className="text-[11px] text-ink-muted">
                            Tidak ada pos anggaran yang cocok dengan filter atau kata kunci pencarian saat ini.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedItems.map((item) => (
                      <tr key={item.id} className="hover:bg-canvas/50 text-ink transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-black text-ink block text-xs">{item.category}</span>
                          <span className="text-[10px] text-ink-muted font-medium">PIC: {item.pic}</span>
                          {item.notes && (
                            <span className="text-[10px] text-ink-muted/80 block italic truncate max-w-xs">{item.notes}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-ink font-mono tabular-nums">
                          {formatRupiah(item.budgetAmount)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-primary-700 font-mono tabular-nums">
                          {formatRupiah(item.actualAmount)}
                        </td>
                        <td className="py-3.5 px-4 min-w-[150px]">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-canvas rounded-full h-2 overflow-hidden border border-border">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  item.percentage >= 100 ? 'bg-rose-500' : item.percentage >= 85 ? 'bg-amber-500' : 'bg-primary-600'
                                }`}
                                style={{ width: `${Math.min(item.percentage, 100)}%` }}
                              />
                            </div>
                            <span className={`font-mono font-bold text-[11px] tabular-nums ${
                              item.percentage >= 100 ? 'text-rose-700' : item.percentage >= 85 ? 'text-amber-700' : 'text-ink'
                            }`}>
                              {item.percentage.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className={`py-3.5 px-4 text-right font-bold font-mono tabular-nums ${
                          item.variance >= 0 ? 'text-emerald-700' : 'text-rose-700'
                        }`}>
                          {item.variance >= 0 ? '+' : ''}{formatRupiah(item.variance)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {item.percentage > 100 ? (
                            <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 text-[10px] font-black border border-rose-300">
                              ✕ Melebihi Pagu
                            </span>
                          ) : item.percentage >= 85 ? (
                            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-black border border-amber-300">
                              ⚠ Mendekati Pagu
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-black border border-emerald-300">
                              ✓ Hemat (Aman)
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setSelectedVoucher(item)}
                              className="px-2.5 py-1 bg-primary-50 hover:bg-primary-100 active:scale-[0.98] text-primary-800 rounded-lg font-bold text-[11px] inline-flex items-center gap-1 transition-all"
                              title="Lihat & Cetak Dokumen Pengesahan Pagu"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                              Pagu
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(item)}
                              className="p-1.5 text-amber-700 hover:bg-amber-50 active:scale-[0.98] rounded-lg transition-colors"
                              title="Edit Pos Pagu"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setItemToDelete(item)}
                              className="p-1.5 text-red-600 hover:bg-red-50 active:scale-[0.98] rounded-lg transition-colors"
                              title="Hapus Pos Pagu"
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
                  Menampilkan <strong className="text-ink">{totalFiltered === 0 ? 0 : startIndex + 1}</strong> - <strong className="text-ink">{endIndex}</strong> dari <strong className="text-ink">{totalFiltered}</strong> pos pagu
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-ink-muted">Tampilkan:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2 py-1 bg-surface border border-border rounded-lg font-bold text-ink focus:outline-hidden"
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
                  onClick={() => setCurrentPage(safeCurrentPage - 1)}
                  disabled={safeCurrentPage === 1}
                  className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40 active:scale-[0.98] transition-all"
                  title="Halaman Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1 px-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = safeCurrentPage - 2 + i;
                    if (pageNum < 1) pageNum = i + 1;
                    if (pageNum > totalPages) return null;

                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all active:scale-[0.98] ${
                          safeCurrentPage === pageNum
                            ? 'bg-primary-600 text-white shadow-2xs'
                            : 'bg-surface border border-border text-ink hover:bg-canvas'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage(safeCurrentPage + 1)}
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

      {/* ================= SUBTAB 2: SINKING FUND ================= */}
      {activeSubTab === 'sinking_fund' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="p-6 bg-surface rounded-3xl border border-border shadow-card space-y-5 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <h3 className="font-black text-base text-ink flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-indigo-600 shrink-0" />
                  Dana Cadangan Sinking Fund (Investasi & Pemeliharaan Jangka Panjang)
                </h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  Akumulasi tabungan kas paguyuban yang dialokasikan secara terpisah untuk perbaikan sarana vital komplek.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenAddSinking}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold rounded-xl shadow-2xs inline-flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Pos Cadangan
                </button>
              </div>
            </div>

            {/* Sinking Fund Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sinkingFunds.map((s) => {
                const pct = s.targetAmount > 0 ? Math.min(100, Math.round((s.currentBalance / s.targetAmount) * 100)) : 0;
                return (
                  <div key={s.id} className="p-4 bg-canvas rounded-2xl border border-border space-y-3 shadow-2xs">
                    <div className="flex justify-between items-center">
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-900 rounded-md text-[10px] font-black border border-indigo-200">
                        Target Realisasi: {s.planYear}
                      </span>
                      <span className="font-mono text-xs text-ink-muted font-bold">{s.id}</span>
                    </div>

                    <div>
                      <h4 className="font-black text-ink text-sm">{s.fundName}</h4>
                      <p className="text-xs text-ink-muted mt-1 leading-relaxed">{s.purpose}</p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-ink-muted">Terkumpul:</span>
                        <span className="text-indigo-700 font-mono tabular-nums">
                          {formatRupiah(s.currentBalance)} / {formatRupiah(s.targetAmount)} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-surface rounded-full h-2.5 overflow-hidden border border-border">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSinkingForDeposit(s);
                          setDepositAmount('500000');
                        }}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 active:scale-[0.98] text-indigo-900 font-bold rounded-lg text-xs inline-flex items-center gap-1 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Setor Dana
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditSinking(s)}
                          className="p-1.5 text-amber-700 hover:bg-amber-50 active:scale-[0.98] rounded-lg transition-colors"
                          title="Edit Pos Cadangan"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSinking(s.id, s.fundName)}
                          className="p-1.5 text-red-600 hover:bg-red-50 active:scale-[0.98] rounded-lg transition-colors"
                          title="Hapus Pos Cadangan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= SUBTAB 3: REKAPITULASI IURAN TRANSPARANSI ================= */}
      {activeSubTab === 'public_transparency' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="p-6 bg-surface rounded-3xl border border-border shadow-card space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <h3 className="font-black text-base text-ink flex items-center gap-2">
                  <Eye className="w-5 h-5 text-emerald-600 shrink-0" />
                  Rekapitulasi Iuran Transparansi Warga Terbuka (Data Riil)
                </h3>
                <p className="text-ink-muted mt-0.5">
                  Laporan status setoran kas warga komplek yang disinkronisasi ke portal publik transparansi tanpa data rekayasa.
                </p>
              </div>
              <a
                href="/transparency"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 active:scale-[0.98] text-emerald-900 border border-emerald-300 font-bold rounded-xl inline-flex items-center gap-1.5 transition-all self-start sm:self-auto shadow-2xs"
              >
                <ExternalLink className="w-4 h-4" />
                Buka Portal Transparansi
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200">
                <span className="font-semibold text-emerald-900 text-xs block">Unit LUNAS</span>
                <span className="text-xl font-black text-emerald-950 font-mono mt-1 block tabular-nums">
                  {transparencyStats.paidUnits} Unit
                </span>
                <span className="text-emerald-800 text-[11px] font-medium block mt-0.5 font-mono tabular-nums">
                  Terkumpul: {formatRupiah(transparencyStats.collectedAmount)}
                </span>
              </div>

              <div className="p-4 bg-rose-50/80 rounded-2xl border border-rose-200">
                <span className="font-semibold text-rose-900 text-xs block">Unit MENUNGGAK / BELUM BAYAR</span>
                <span className="text-xl font-black text-rose-950 font-mono mt-1 block tabular-nums">
                  {transparencyStats.unpaidUnits} Unit
                </span>
                <span className="text-rose-800 text-[11px] font-medium block mt-0.5 font-mono tabular-nums">
                  Piutang: {formatRupiah(transparencyStats.unpaidAmount)}
                </span>
              </div>

              <div className="p-4 bg-canvas rounded-2xl border border-border">
                <span className="font-semibold text-ink-muted text-xs block">Total Kavling Terdaftar</span>
                <span className="text-xl font-black text-ink font-mono mt-1 block tabular-nums">
                  {transparencyStats.totalUnits} Rumah
                </span>
                <span className="text-ink-muted text-[11px] font-medium block mt-0.5 font-mono tabular-nums">
                  Tingkat Kepatuhan: {transparencyStats.rate}%
                </span>
              </div>
            </div>

            {!transparencyStats.hasInvoices && (
              <div className="p-4 bg-canvas rounded-2xl border border-border flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-ink-muted shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-ink text-xs">Belum Ada Tagihan Iuran Diterbitkan Pada Periode Ini</h4>
                  <p className="text-[11px] text-ink-muted mt-0.5 leading-relaxed">
                    Kavling terdaftar sebanyak <strong>{transparencyStats.totalUnits} unit</strong>. Untuk memunculkan rekapitulasi setoran kas dan piutang iuran, silakan terbitkan tagihan bulanan melalui menu Kelola Tagihan Iuran.
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <a
                      href="/admin/billing"
                      className="px-3.5 py-2 bg-primary-600 hover:bg-primary-700 active:scale-[0.98] text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5 transition-all shadow-2xs"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      Kelola Tagihan Iuran
                    </a>
                    <a
                      href="/admin/rekap-iuran"
                      className="px-3.5 py-2 bg-surface hover:bg-canvas active:scale-[0.98] text-ink border border-border font-bold rounded-xl text-xs inline-flex items-center gap-1.5 transition-all"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Buka Rekap Iuran
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= SUBTAB 4: FORMULIR PENETAPAN PAGU ================= */}
      {activeSubTab === 'manual_form' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-in fade-in duration-150">
          <div className="lg:col-span-2 p-6 bg-surface rounded-3xl border border-border shadow-card space-y-4 text-xs">
            <h3 className="font-black text-base text-ink flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-primary-600" />
              Penyusunan & Pengesahan Pos Pagu Baru (RAB)
            </h3>
            <p className="text-ink-muted">
              Masukkan rincian pagu target biaya operasional paguyuban untuk periode <strong>{period}</strong>.
            </p>

            <form onSubmit={handleSaveBudget} className="space-y-4">
              <div>
                <label className="font-bold text-ink block mb-1">Nama Pos Anggaran *</label>
                <input
                  type="text"
                  placeholder="Contoh: Operasional Keamanan & Ronda Satpam"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[10px] text-ink-muted self-center">Template cepat:</span>
                  {[
                    'Keamanan & Ronda',
                    'Kebersihan Lingkungan',
                    'Listrik & PJU',
                    'Perawatan Fasum',
                    'Sekretariat & ATK',
                    'Sosial & PHBN',
                  ].map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setFormCategory(sug)}
                      className="px-2 py-0.5 bg-canvas hover:bg-surface border border-border rounded-md text-[10px] font-semibold text-ink-muted hover:text-ink active:scale-[0.98]"
                    >
                      + {sug}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-ink block mb-1">Pagu Target (Rp) *</label>
                  <input
                    type="number"
                    value={formBudgetAmount}
                    onChange={(e) => setFormBudgetAmount(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono font-bold text-ink focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
                  />
                  <span className="text-[11px] text-emerald-700 font-bold block mt-1 font-mono">
                    Format: {formatRupiah(parseInt(formBudgetAmount || '0', 10))}
                  </span>
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">PIC / Seksi Bertanggung Jawab</label>
                  <input
                    type="text"
                    value={formPic}
                    onChange={(e) => setFormPic(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Catatan & Dasar Penetapan Musyawarah Warga</label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
                  placeholder="Nomor berita acara musyawarah atau acuan belanja"
                />
              </div>

              <button
                type="submit"
                disabled={savingBudget}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 active:scale-[0.98] disabled:opacity-50 text-white font-bold rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2"
              >
                {savingBudget ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Menyahkan Pos Pagu...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Sahkan Pos Pagu Anggaran</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Projection Card */}
          <div className="p-6 bg-surface rounded-3xl border border-border shadow-card space-y-4 text-xs">
            <h4 className="font-black text-sm text-ink flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary-600" />
              Proyeksi Anggaran Paguyuban
            </h4>
            <div className="space-y-2.5 p-3 bg-canvas rounded-2xl border border-border">
              <div className="flex justify-between">
                <span className="text-ink-muted">Total Pagu Saat Ini:</span>
                <span className="font-mono font-bold text-ink">{formatRupiah(totalBudget)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Pagu Tambahan Baru:</span>
                <span className="font-mono font-bold text-primary-700">
                  +{formatRupiah(parseInt(formBudgetAmount || '0', 10))}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border font-bold">
                <span className="text-ink">Proyeksi Total Pagu:</span>
                <span className="font-mono text-emerald-700 font-black">
                  {formatRupiah(totalBudget + (parseInt(formBudgetAmount || '0', 10) || 0))}
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
              <p className="font-bold text-emerald-950 text-xs">Standar Tata Kelola Transparan</p>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Setiap pos anggaran yang disahkan akan otomatis diberi nomor kode otorisasi dan dapat dicetak dokumen pengesahannya untuk transparansi warga.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE / EDIT BUDGET ================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-border shadow-modal space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-sm text-ink">
                {editingBudgetId ? 'Edit Pos Pagu Anggaran' : 'Tetapkan Pos Pagu Anggaran Baru'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-ink-muted hover:text-ink text-base p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="space-y-3">
              <div>
                <label className="font-bold text-ink block mb-1">Nama Pos Anggaran *</label>
                <input
                  type="text"
                  placeholder="Nama pos anggaran"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-ink block mb-1">Pagu Target (Rp) *</label>
                  <input
                    type="number"
                    value={formBudgetAmount}
                    onChange={(e) => setFormBudgetAmount(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono font-bold text-ink focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
                  />
                  <span className="text-[10px] text-emerald-700 font-bold block mt-1 font-mono">
                    {formatRupiah(parseInt(formBudgetAmount || '0', 10))}
                  </span>
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Realisasi (Rp)</label>
                  <input
                    type="number"
                    value={formActualAmount}
                    onChange={(e) => setFormActualAmount(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono font-bold text-ink focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
                  />
                  <span className="text-[10px] text-primary-700 font-bold block mt-1 font-mono">
                    {formatRupiah(parseInt(formActualAmount || '0', 10))}
                  </span>
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">PIC / Penanggung Jawab</label>
                <input
                  type="text"
                  value={formPic}
                  onChange={(e) => setFormPic(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Catatan</label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
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
                  disabled={savingBudget}
                  className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 active:scale-[0.98] text-white font-bold shadow-2xs disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
                >
                  {savingBudget ? 'Menyimpan...' : 'Simpan Pagu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: DOKUMEN PENGESAHAN PAGU ================= */}
      {selectedVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-border shadow-modal space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-black text-sm text-ink">Dokumen Pengesahan Pagu Anggaran (Resmi)</h3>
                <p className="text-[11px] text-ink-muted">Kode Otorisasi: {selectedVoucher.authCode || selectedVoucher.id}</p>
              </div>
              <button
                onClick={() => setSelectedVoucher(null)}
                className="text-ink-muted hover:text-ink text-base p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-canvas rounded-2xl border border-border space-y-2.5">
              <div className="flex justify-between">
                <span className="text-ink-muted">Pos Anggaran:</span>
                <span className="font-black text-ink text-right">{selectedVoucher.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Periode Anggaran:</span>
                <span className="font-bold text-ink">{selectedVoucher.period}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Pagu Disetujui:</span>
                <span className="font-black text-ink font-mono tabular-nums">{formatRupiah(selectedVoucher.budgetAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Realisasi Belanja:</span>
                <span className="font-black text-primary-800 font-mono tabular-nums">
                  {formatRupiah(selectedVoucher.actualAmount)} ({selectedVoucher.percentage}%)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Sisa Alokasi:</span>
                <span className="font-black text-emerald-700 font-mono tabular-nums">
                  +{formatRupiah(selectedVoucher.variance)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="text-ink-muted">PIC Penanggung Jawab:</span>
                <span className="font-bold text-ink">{selectedVoucher.pic}</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-emerald-950 text-[11px]">Disahkan Berdasarkan Musyawarah Warga</p>
                <p className="text-emerald-800 text-[10px]">Ketua RW 05, Bendahara & Dewan Paguyuban</p>
              </div>
            </div>

            {/* Official Signatures Section */}
            <div className="pt-2 border-t border-border/80 grid grid-cols-2 gap-2 text-center text-[10px] text-ink-muted">
              <div>
                <p className="font-bold text-ink">Ketua RW 05</p>
                <div className="h-10 flex items-end justify-center">
                  <span className="border-b border-ink/40 pb-0.5 px-3 font-semibold text-ink">( .................... )</span>
                </div>
              </div>
              <div>
                <p className="font-bold text-ink">Bendahara Paguyuban</p>
                <div className="h-10 flex items-end justify-center">
                  <span className="border-b border-ink/40 pb-0.5 px-3 font-semibold text-ink">( .................... )</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 active:scale-[0.98] text-white font-bold rounded-xl shadow-2xs inline-flex items-center justify-center gap-1.5 transition-all"
              >
                <Printer className="w-4 h-4" /> Cetak PDF
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

      {/* ================= MODAL: KONFIRMASI HAPUS BUDGET ================= */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-red-200 shadow-modal space-y-4 text-xs">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-black text-base text-ink">Hapus Pagu "{itemToDelete.category}"?</h3>
              <p className="text-ink-muted leading-relaxed">
                Pagu anggaran sebesar <strong>{formatRupiah(itemToDelete.budgetAmount)}</strong> akan dihapus dari rencana anggaran. Tindakan ini dicatat ke Jejak Audit.
              </p>
            </div>

            <div>
              <label className="font-bold text-ink block mb-1">Alasan Pembatalan:</label>
              <select
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="w-full p-2 bg-canvas border border-border rounded-xl text-ink font-semibold focus:outline-hidden"
              >
                <option value="Revisi Rencana Anggaran Tahunan (RAB)">Revisi Rencana Anggaran Tahunan (RAB)</option>
                <option value="Pos Anggaran Tidak Diperlukan Lagi">Pos Anggaran Tidak Diperlukan Lagi</option>
                <option value="Penggabungan dengan Pos Anggaran Lain">Penggabungan dengan Pos Anggaran Lain</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas active:scale-[0.98] transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-bold shadow-2xs transition-all"
              >
                Ya, Hapus Pagu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: TAMBAH / EDIT SINKING FUND ================= */}
      {showSinkingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-border shadow-modal space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-sm text-ink">
                {editingSinkingId ? 'Edit Pos Dana Cadangan' : 'Tambah Pos Dana Cadangan (Sinking Fund)'}
              </h3>
              <button
                onClick={() => setShowSinkingModal(false)}
                className="text-ink-muted hover:text-ink text-base p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSinkingFund} className="space-y-3">
              <div>
                <label className="font-bold text-ink block mb-1">Nama Program Dana Cadangan *</label>
                <input
                  type="text"
                  placeholder="Contoh: Cadangan Aspal Jalan & Saluran"
                  value={sinkingFormName}
                  onChange={(e) => setSinkingFormName(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-ink block mb-1">Target Nominal (Rp) *</label>
                  <input
                    type="number"
                    value={sinkingFormTarget}
                    onChange={(e) => setSinkingFormTarget(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono font-bold text-ink focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
                  />
                  <span className="text-[10px] text-indigo-700 font-bold block mt-1 font-mono">
                    {formatRupiah(parseInt(sinkingFormTarget || '0', 10))}
                  </span>
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Saldo Terkumpul (Rp)</label>
                  <input
                    type="number"
                    value={sinkingFormBalance}
                    onChange={(e) => setSinkingFormBalance(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono font-bold text-ink focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
                  />
                  <span className="text-[10px] text-emerald-700 font-bold block mt-1 font-mono">
                    {formatRupiah(parseInt(sinkingFormBalance || '0', 10))}
                  </span>
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Target Tahun Realisasi</label>
                <input
                  type="text"
                  value={sinkingFormYear}
                  onChange={(e) => setSinkingFormYear(e.target.value)}
                  placeholder="Contoh: 2027"
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Tujuan & Rencana Penggunaan</label>
                <textarea
                  rows={2}
                  value={sinkingFormPurpose}
                  onChange={(e) => setSinkingFormPurpose(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
                  placeholder="Deskripsikan rencana pekerjaan fisik fasum..."
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowSinkingModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas active:scale-[0.98] transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold shadow-2xs transition-all"
                >
                  Simpan Pos Cadangan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: SETOR DANA CADANGAN ================= */}
      {selectedSinkingForDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-sm w-full p-6 border border-border shadow-modal space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-sm text-ink">Setor Kas ke Dana Cadangan</h3>
              <button
                onClick={() => setSelectedSinkingForDeposit(null)}
                className="text-ink-muted hover:text-ink text-base p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-canvas rounded-2xl border border-border space-y-1">
              <p className="font-bold text-ink text-xs">{selectedSinkingForDeposit.fundName}</p>
              <p className="text-[11px] text-ink-muted">
                Saldo Saat Ini: <strong className="font-mono text-indigo-700">{formatRupiah(selectedSinkingForDeposit.currentBalance)}</strong>
              </p>
              <p className="text-[11px] text-ink-muted">
                Target: <strong className="font-mono text-ink">{formatRupiah(selectedSinkingForDeposit.targetAmount)}</strong>
              </p>
            </div>

            <form onSubmit={handleConfirmDeposit} className="space-y-3">
              <div>
                <label className="font-bold text-ink block mb-1">Nominal Setoran Alokasi (Rp) *</label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono font-bold text-ink focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
                />
                <span className="text-[10px] text-emerald-700 font-bold block mt-1 font-mono">
                  {formatRupiah(parseInt(depositAmount || '0', 10))}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSinkingForDeposit(null)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas active:scale-[0.98] transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold shadow-2xs transition-all"
                >
                  Konfirmasi Setoran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
