import React, { useState, useMemo } from 'react';
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
  FileText
} from 'lucide-react';
import { formatRupiah } from '../../lib/format';

interface BudgetItem {
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

interface SinkingFundItem {
  id: string;
  fundName: string;
  targetAmount: number;
  currentBalance: number;
  purpose: string;
  planYear: string;
  status: 'ACCUMULATING' | 'READY_FOR_USE';
}

export const BudgetManager: React.FC = () => {
  const [period, setPeriod] = useState('Agustus 2026');
  const [activeSubTab, setActiveSubTab] = useState<'budget_matrix' | 'sinking_fund' | 'public_transparency' | 'manual_form'>('budget_matrix');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'category' | 'budget' | 'actual' | 'percentage'>('percentage');
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

  // Form State
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [formCategory, setFormCategory] = useState('');
  const [formBudgetAmount, setFormBudgetAmount] = useState('5000000');
  const [formActualAmount, setFormActualAmount] = useState('0');
  const [formPic, setFormPic] = useState('Seksi Sarana / Bendahara');
  const [formNotes, setFormNotes] = useState('Alokasi pagu anggaran hasil musyawarah warga');
  const [savingBudget, setSavingBudget] = useState(false);

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Initial Budget Items
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([
    {
      id: 'BUD-001',
      category: 'Operasional Keamanan & Satpam (6 Personil 24 Jam)',
      period: 'Agustus 2026',
      budgetAmount: 21000000,
      actualAmount: 21000000,
      percentage: 100.0,
      variance: 0,
      status: 'WARNING',
      pic: 'Komandan Regu Satpam & Sie Keamanan',
      notes: 'Gaji 6 personil satpam, pos jaga, HT, dan konsumsi ronda.',
      authCode: 'APPR-202608-01',
    },
    {
      id: 'BUD-002',
      category: 'Kebersihan Lingkungan & Retribusi Sampah DLH',
      period: 'Agustus 2026',
      budgetAmount: 11000000,
      actualAmount: 9780000,
      percentage: 88.9,
      variance: 1220000,
      status: 'WARNING',
      pic: 'Seksi Lingkungan Hidup',
      notes: 'Pengangkutan sampah rutin 3x seminggu & perawatan taman fasum.',
      authCode: 'APPR-202608-02',
    },
    {
      id: 'BUD-003',
      category: 'Listrik PJU & Pompa Air Bersih Fasum',
      period: 'Agustus 2026',
      budgetAmount: 8500000,
      actualAmount: 6450000,
      percentage: 75.8,
      variance: 2050000,
      status: 'SAFE',
      pic: 'Seksi Utilitas & Sarana',
      notes: 'Penerangan 42 tiang PJU, listrik balai warga, dan pompa taman.',
      authCode: 'APPR-202608-03',
    },
    {
      id: 'BUD-004',
      category: 'Pemeliharaan Sarana, Aspal & Fasilitas Olahraga',
      period: 'Agustus 2026',
      budgetAmount: 5000000,
      actualAmount: 3932500,
      percentage: 78.6,
      variance: 1067500,
      status: 'SAFE',
      pic: 'Seksi Pembangunan',
      notes: 'Perbaikan jaring lapangan badminton, cat pagar, dan pot bunga.',
      authCode: 'APPR-202608-04',
    },
    {
      id: 'BUD-005',
      category: 'Kegiatan Warga, Peringatan HUT RI & Hari Besar',
      period: 'Agustus 2026',
      budgetAmount: 4000000,
      actualAmount: 0,
      percentage: 0.0,
      variance: 4000000,
      status: 'SAFE',
      pic: 'Panitia HUT RI Paguyuban',
      notes: 'Lomba warga, panggung gembira, dan konsumsi malam tirakatan.',
      authCode: 'APPR-202608-05',
    },
    {
      id: 'BUD-006',
      category: 'Santunan Sosial & Bantuan Kesehatan Petugas',
      period: 'Agustus 2026',
      budgetAmount: 2500000,
      actualAmount: 1250000,
      percentage: 50.0,
      variance: 1250000,
      status: 'SAFE',
      pic: 'Seksi Sosial & Kerohanian',
      notes: 'Dana bantuan rawat inap keluarga satpam & musibah duka.',
      authCode: 'APPR-202608-06',
    },
  ]);

  // Sinking Fund Items
  const [sinkingFunds] = useState<SinkingFundItem[]>([
    {
      id: 'SINK-001',
      fundName: 'Dana Cadangan Pengaspalan Hotmix Jalan Utama',
      targetAmount: 80000000,
      currentBalance: 32500000,
      purpose: 'Pelapisan ulang aspal hotmix jalan utama blok A s/d D sepanjang 1.2 KM.',
      planYear: 'Tahun 2027',
      status: 'ACCUMULATING',
    },
    {
      id: 'SINK-002',
      fundName: 'Dana Renovasi & Perluasan Balai Musyawarah Warga',
      targetAmount: 40000000,
      currentBalance: 12500000,
      purpose: 'Pemasangan kanopi, penambahan ruang rapat, dan toilet umum balai.',
      planYear: 'Tahun 2026 / 2027',
      status: 'ACCUMULATING',
    },
  ]);

  // Totals
  const totalBudget = budgetItems.reduce((acc, i) => acc + i.budgetAmount, 0);
  const totalActual = budgetItems.reduce((acc, i) => acc + i.actualAmount, 0);
  const totalVariance = totalBudget - totalActual;
  const overallPercentage = totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0;
  const totalSinkingBalance = sinkingFunds.reduce((sum, s) => sum + s.currentBalance, 0);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingBudgetId(null);
    setFormCategory('');
    setFormBudgetAmount('5000000');
    setFormActualAmount('0');
    setFormPic('Seksi Sarana / Bendahara');
    setFormNotes('Alokasi pagu anggaran hasil musyawarah warga');
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
    const statusVal = pct > 100 ? 'EXCEEDED' : pct >= 85 ? 'WARNING' : 'SAFE';

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
            authCode: `APPR-202608-${Date.now().toString().slice(-2)}`,
          };
          setBudgetItems([...budgetItems, newB]);
          showToast(`Pos anggaran "${formCategory}" sebesar ${formatRupiah(numBudget)} berhasil disahkan.`);
          setShowAddModal(false);
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
  const publicTransparencyUrl = 'http://localhost:4321/transparency';
  const handleCopyPublicLink = () => {
    navigator.clipboard.writeText(publicTransparencyUrl);
    setCopiedLink(true);
    showToast('Tautan publik transparansi keuangan berhasil disalin!');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Export CSV
  const exportCSV = () => {
    const headers = ['Kode Pos', 'Nama Pos Anggaran', 'Periode', 'Pagu Target (Rp)', 'Realisasi Aktual (Rp)', 'Serapan (%)', 'Sisa Selisih (Rp)', 'Status', 'Penanggung Jawab (PIC)'];
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
              <PieChart className="w-6 h-6 text-primary-600" />
              Anggaran & Realisasi Keuangan Paguyuban
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-primary-100 text-primary-800 text-xs font-black border border-primary-200">
              Periode: {period}
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Monitoring serapan pagu belanja, alokasi <strong>Dana Cadangan Sinking Fund</strong>, evaluasi efisiensi kas, dan penerbitan surat pengesahan anggaran.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-surface hover:bg-canvas border border-border text-ink text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-ink-muted" />
            Ekspor RAB (CSV)
          </button>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Tetapkan Pos Pagu Baru
          </button>
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
              Bagikan tautan ini agar warga dapat memantau realisasi anggaran dan transparansi kas masuk-keluar secara terbuka.
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

      {/* 4 Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 p-1.5 bg-surface rounded-2xl border border-border shadow-xs overflow-x-auto no-scrollbar">
        {[
          { id: 'budget_matrix', label: 'Matriks Pagu vs Realisasi Belanja', icon: PieChart, count: budgetItems.length },
          { id: 'sinking_fund', label: 'Dana Cadangan (Sinking Fund)', icon: Banknote, count: sinkingFunds.length },
          { id: 'public_transparency', label: 'Rekapitulasi Iuran Warga (Lunas vs Belum)', icon: Eye },
          { id: 'manual_form', label: 'Formulir Penetapan Pos Pagu', icon: PlusCircle },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-primary-600 text-white shadow-xs'
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

      {/* ================= SUBTAB 1: MATRIKS PAGU ANGGARAN ================= */}
      {activeSubTab === 'budget_matrix' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[11px] font-semibold text-ink-muted">Total Pagu Disahkan</span>
              <p className="text-xl font-black text-ink mt-1 tabular-nums">{formatRupiah(totalBudget)}</p>
              <span className="text-[10px] text-ink-muted mt-0.5 block">{budgetItems.length} Pos Anggaran</span>
            </div>

            <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[11px] font-semibold text-ink-muted">Total Realisasi Belanja</span>
              <p className="text-xl font-black text-primary-700 mt-1 tabular-nums">{formatRupiah(totalActual)}</p>
              <span className="text-[10px] text-emerald-700 font-bold mt-0.5 block">
                Serapan: {overallPercentage.toFixed(1)}% dari Pagu
              </span>
            </div>

            <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[11px] font-semibold text-ink-muted">Sisa Anggaran (Efisiensi)</span>
              <p className="text-xl font-black text-emerald-700 mt-1 tabular-nums">+{formatRupiah(totalVariance)}</p>
              <span className="text-[10px] text-emerald-600 font-bold mt-0.5 block">Surplus Belanja Terjaga</span>
            </div>

            <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[11px] font-semibold text-ink-muted">Dana Cadangan Sinking Fund</span>
              <p className="text-xl font-black text-indigo-700 mt-1 tabular-nums">{formatRupiah(totalSinkingBalance)}</p>
              <span className="text-[10px] text-indigo-800 font-bold mt-0.5 block">Tabungan Aspal & Balai</span>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-surface p-4 rounded-2xl border border-border shadow-card flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('ALL');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  statusFilter === 'ALL'
                    ? 'bg-primary-600 text-white'
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
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  statusFilter === 'SAFE'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-canvas text-emerald-800 hover:bg-emerald-50 border border-border'
                }`}
              >
                Aman / Hemat (&lt;85%)
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('WARNING');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  statusFilter === 'WARNING'
                    ? 'bg-amber-600 text-white'
                    : 'bg-canvas text-amber-800 hover:bg-amber-50 border border-border'
                }`}
              >
                Mendekati Pagu (85-100%)
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
              <div className="relative w-full sm:w-56">
                <Search className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari pos anggaran..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-2 bg-canvas border border-border rounded-xl text-xs text-ink"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="percentage">Urut % Serapan</option>
                <option value="budget">Urut Pagu Target</option>
                <option value="actual">Urut Realisasi</option>
                <option value="category">Urut Kategori</option>
              </select>

              <button
                type="button"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 bg-canvas border border-border rounded-xl text-ink-muted hover:text-ink"
                title={`Urutan: ${sortOrder === 'asc' ? 'Menaik' : 'Menurun'}`}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Budget Table */}
          <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-canvas border-b border-border text-ink-muted font-bold">
                  <tr>
                    <th className="py-3.5 px-4">Pos Anggaran & PIC</th>
                    <th className="py-3.5 px-4 text-right">Pagu Target</th>
                    <th className="py-3.5 px-4 text-right">Realisasi Aktual</th>
                    <th className="py-3.5 px-4">Serapan Pagu</th>
                    <th className="py-3.5 px-4 text-right">Sisa Selisih</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {paginatedItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-ink-muted font-medium">
                        Tidak ada pos anggaran yang cocok dengan filter.
                      </td>
                    </tr>
                  ) : (
                    paginatedItems.map((item) => (
                      <tr key={item.id} className="hover:bg-canvas/50 text-ink transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-black text-ink block text-xs">{item.category}</span>
                          <span className="text-[10px] text-ink-muted">PIC: {item.pic}</span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-ink font-mono tabular-nums">
                          {formatRupiah(item.budgetAmount)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-primary-800 font-mono tabular-nums">
                          {formatRupiah(item.actualAmount)}
                        </td>
                        <td className="py-3.5 px-4 min-w-[140px]">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-canvas rounded-full h-2 overflow-hidden border border-border">
                              <div
                                className={`h-full rounded-full ${
                                  item.percentage >= 95 ? 'bg-amber-500' : 'bg-primary-600'
                                }`}
                                style={{ width: `${Math.min(item.percentage, 100)}%` }}
                              />
                            </div>
                            <span className="font-black font-mono text-[11px]">{item.percentage.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-emerald-700 font-mono tabular-nums">
                          + {formatRupiah(item.variance)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {item.percentage >= 85 ? (
                            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-black border border-amber-300">
                              Mendekati Pagu
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
                              className="px-2 py-1 bg-primary-50 hover:bg-primary-100 text-primary-800 rounded-lg font-bold text-[11px] inline-flex items-center gap-1"
                              title="Lihat Dokumen Pengesahan Pagu"
                            >
                              <Receipt className="w-3.5 h-3.5" /> Pagu
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(item)}
                              className="p-1 text-amber-700 hover:bg-amber-50 rounded-lg"
                              title="Edit Pos Pagu"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setItemToDelete(item)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded-lg"
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
                  Menampilkan <strong className="text-ink">{totalFiltered === 0 ? 0 : startIndex + 1}</strong> - <strong className="text-ink">{endIndex}</strong> dari <strong className="text-ink">{totalFiltered}</strong> pos pagu anggaran
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
                  className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40"
                  title="Halaman Pertama"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(safeCurrentPage - 1)}
                  disabled={safeCurrentPage === 1}
                  className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40"
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
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                          safeCurrentPage === pageNum
                            ? 'bg-primary-600 text-white shadow-xs'
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
                  className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40"
                  title="Halaman Berikutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={safeCurrentPage === totalPages}
                  className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40"
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
          <div className="p-5 bg-surface rounded-3xl border border-border shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-black text-base text-ink flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-indigo-600" />
                  Dana Cadangan Sinking Fund (Investasi & Renovasi Jangka Panjang)
                </h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  Akumulasi tabungan kas paguyuban yang dialokasikan khusus untuk perbaikan besar sarana komplek.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sinkingFunds.map((s) => {
                const pct = Math.round((s.currentBalance / s.targetAmount) * 100);
                return (
                  <div key={s.id} className="p-4 bg-canvas rounded-2xl border border-border space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-900 rounded text-[10px] font-black">
                        Target: {s.planYear}
                      </span>
                      <span className="font-mono text-xs text-ink font-bold">{s.id}</span>
                    </div>

                    <div>
                      <h4 className="font-black text-ink text-sm">{s.fundName}</h4>
                      <p className="text-xs text-ink-muted mt-1 leading-relaxed">{s.purpose}</p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-ink-muted">Terkumpul:</span>
                        <span className="text-indigo-700 font-mono">{formatRupiah(s.currentBalance)} / {formatRupiah(s.targetAmount)} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-border rounded-full h-2.5 overflow-hidden">
                        <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${pct}%` }} />
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
                <span className="font-black text-emerald-950 block text-sm">86 Unit LUNAS</span>
                <span className="text-emerald-800 text-[11px]">Terkumpul: Rp 64.500.000 (72%)</span>
              </div>
              <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200">
                <span className="font-black text-rose-950 block text-sm">34 Unit BELUM BAYAR</span>
                <span className="text-rose-800 text-[11px]">Piutang: Rp 25.500.000</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUBTAB 4: FORMULIR PENETAPAN PAGU ================= */}
      {activeSubTab === 'manual_form' && (
        <div className="space-y-4 max-w-xl animate-in fade-in duration-150">
          <div className="p-6 bg-surface rounded-3xl border border-border shadow-card space-y-4 text-xs">
            <h3 className="font-black text-base text-ink flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-primary-600" />
              Tetapkan Pos Pagu Anggaran Baru
            </h3>
            <p className="text-ink-muted">
              Masukkan pagu target biaya operasional paguyuban untuk periode <strong>{period}</strong>.
            </p>

            <form onSubmit={handleSaveBudget} className="space-y-3">
              <div>
                <label className="font-bold text-ink block mb-1">Nama Pos Anggaran *</label>
                <input
                  type="text"
                  placeholder="Contoh: Operasional Keamanan & Ronda Warga"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
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
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono font-bold text-ink"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">PIC / Seksi Bertanggung Jawab</label>
                  <input
                    type="text"
                    value={formPic}
                    onChange={(e) => setFormPic(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Catatan & Dasar Penetapan Musyawarah</label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <button
                type="submit"
                disabled={savingBudget}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                {savingBudget ? 'Menyimpan...' : 'Sahkan Pos Pagu Anggaran'}
              </button>
            </form>
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
              <button onClick={() => setShowAddModal(false)} className="text-ink-muted hover:text-ink">✕</button>
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
                  className="w-full p-2 bg-canvas border border-border rounded-xl font-bold text-ink"
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
                    className="w-full p-2 bg-canvas border border-border rounded-xl font-mono font-bold text-ink"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Realisasi (Rp)</label>
                  <input
                    type="number"
                    value={formActualAmount}
                    onChange={(e) => setFormActualAmount(e.target.value)}
                    className="w-full p-2 bg-canvas border border-border rounded-xl font-mono font-bold text-ink"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">PIC / Penanggung Jawab</label>
                <input
                  type="text"
                  value={formPic}
                  onChange={(e) => setFormPic(e.target.value)}
                  className="w-full p-2 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingBudget}
                  className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-xs disabled:opacity-50"
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
              <button onClick={() => setSelectedVoucher(null)} className="text-ink-muted hover:text-ink">✕</button>
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
                <span className="font-black text-ink font-mono">{formatRupiah(selectedVoucher.budgetAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Realisasi Belanja:</span>
                <span className="font-black text-primary-800 font-mono">{formatRupiah(selectedVoucher.actualAmount)} ({selectedVoucher.percentage}%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Sisa Alokasi:</span>
                <span className="font-black text-emerald-700 font-mono">+{formatRupiah(selectedVoucher.variance)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-border">
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

      {/* ================= MODAL: KONFIRMASI HAPUS BUDGET ================= */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-red-200 shadow-modal space-y-4 text-xs">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-black text-base text-ink">Hapus Pagu "{itemToDelete.category}"?</h3>
              <p className="text-ink-muted">
                Pagu anggaran sebesar <strong>{formatRupiah(itemToDelete.budgetAmount)}</strong> akan dihapus dari rencana anggaran. Tindakan ini dicatat di Jejak Audit.
              </p>
            </div>

            <div>
              <label className="font-bold text-ink block mb-1">Alasan Pembatalan:</label>
              <select
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="w-full p-2 bg-canvas border border-border rounded-xl text-ink font-semibold"
              >
                <option value="Revisi Rencana Anggaran Tahunan (RAB)">Revisi Rencana Anggaran Tahunan (RAB)</option>
                <option value="Pos Anggaran Tidak Diperlukan Lagi">Pos Anggaran Tidak Diperlukan Lagi</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs"
              >
                Ya, Hapus Pagu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
