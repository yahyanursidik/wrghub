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
  Send
} from 'lucide-react';
import { formatRupiah } from '../../lib/format';
import { ReceiptModal } from '../shared/ReceiptModal';

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

interface ExpensesManagerProps {
  initialExpenses: ExpenseItem[];
}

export const ExpensesManager: React.FC<ExpensesManagerProps> = ({ initialExpenses }) => {
  const [expenses, setExpenses] = useState<ExpenseItem[]>(initialExpenses);
  const [activeSubTab, setActiveSubTab] = useState<'expenses_list' | 'public_transparency' | 'budget_analysis' | 'manual_form'>('expenses_list');
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

  // Form State
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Keamanan');
  const [formAmount, setFormAmount] = useState('750000');
  const [formVendor, setFormVendor] = useState('PT Guard Nusantara / Toko Material');
  const [formExpenseDate, setFormExpenseDate] = useState(new Date().toISOString().substring(0, 10));
  const [formDescription, setFormDescription] = useState('Pengadaan sarana operasional komplek');
  const [savingExpense, setSavingExpense] = useState(false);

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Metrics
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalKeamanan = expenses.filter((e) => e.categoryName?.includes('Keamanan')).reduce((sum, e) => sum + e.amount, 0);
  const totalKebersihan = expenses.filter((e) => e.categoryName?.includes('Kebersihan')).reduce((sum, e) => sum + e.amount, 0);
  const totalListrikFasum = expenses.filter((e) => e.categoryName?.includes('Listrik') || e.categoryName?.includes('Fasum')).reduce((sum, e) => sum + e.amount, 0);
  const totalPemeliharaan = expenses.filter((e) => e.categoryName?.includes('Pemeliharaan') || e.categoryName?.includes('Renovasi')).reduce((sum, e) => sum + e.amount, 0);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingExpenseId(null);
    setFormTitle('');
    setFormCategory('Keamanan');
    setFormAmount('450000');
    setFormVendor('Pengadaan Mandiri / Toko Bangunan');
    setFormExpenseDate(new Date().toISOString().substring(0, 10));
    setFormDescription('Pengeluaran operasional paguyuban');
    setShowAddModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (exp: ExpenseItem) => {
    setEditingExpenseId(exp.id);
    setFormTitle(exp.title);
    setFormCategory(exp.categoryName || 'Keamanan');
    setFormAmount(exp.amount.toString());
    setFormVendor(exp.vendor || 'Pengadaan Mandiri');
    setFormExpenseDate(exp.expenseDate);
    setFormDescription(exp.description || '');
    setShowAddModal(true);
  };

  // Handle Save Expense (Create or Update)
  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formAmount) return;
    setSavingExpense(true);
    const numAmount = parseInt(formAmount.replace(/\D/g, ''), 10) || 0;

    try {
      if (editingExpenseId) {
        const res = await fetch('/api/expenses/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            expenseId: editingExpenseId,
            title: formTitle,
            categoryName: formCategory,
            amount: numAmount,
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
                    amount: numAmount,
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
            amount: numAmount,
            categoryId:
              formCategory === 'Keamanan'
                ? 'cat-keamanan'
                : formCategory === 'Kebersihan'
                ? 'cat-kebersihan'
                : formCategory === 'Listrik Fasum'
                ? 'cat-listrik'
                : 'cat-pemeliharaan',
            categoryName: formCategory,
            vendor: formVendor,
            expenseDate: formExpenseDate,
            description: formDescription,
          }),
        });

        if (res.ok) {
          const newExp: ExpenseItem = {
            id: `exp-${Date.now()}`,
            title: formTitle,
            description: formDescription || 'Dicatat oleh Bendahara',
            amount: numAmount,
            expenseDate: formExpenseDate,
            categoryName: formCategory,
            vendor: formVendor,
            voucherNo: `BKK-${Date.now().toString().slice(-4)}`,
            proofUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
            status: 'APPROVED',
          };
          setExpenses([newExp, ...expenses]);
          showToast(`Pengeluaran "${formTitle}" sebesar ${formatRupiah(numAmount)} berhasil dicatat.`);
          setShowAddModal(false);
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan catatan pengeluaran.');
    } finally {
      setSavingExpense(false);
    }
  };

  // Confirm Delete Expense
  const handleConfirmDeleteExpense = async () => {
    if (!expenseToDelete) return;
    try {
      const res = await fetch('/api/expenses/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expenseId: expenseToDelete.id,
          title: expenseToDelete.title,
          amount: expenseToDelete.amount,
          reason: deleteReason,
        }),
      });

      if (res.ok) {
        setExpenses(expenses.filter((e) => e.id !== expenseToDelete.id));
        showToast(`Catatan pengeluaran "${expenseToDelete.title}" berhasil dihapus.`);
        setExpenseToDelete(null);
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menghapus pengeluaran.');
    }
  };

  // Filter & Sort
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

  // Pagination
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

  // Export CSV
  const handleExportExpensesCSV = () => {
    const headers = ['ID Pengeluaran', 'Tanggal', 'Kategori', 'Uraian Belanja', 'Vendor / Toko', 'Nominal (Rp)', 'Status'];
    const rows = expenses.map((e) => [
      e.id,
      e.expenseDate,
      `"${e.categoryName || 'Operasional'}"`,
      `"${e.title.replace(/"/g, '""')}"`,
      `"${e.vendor || '-'}"`,
      e.amount,
      e.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LAPORAN_PENGELUARAN_KAS_WARGAHUB_${new Date().toISOString().slice(0, 7)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Laporan pengeluaran kas berhasil diekspor ke CSV.');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Alert */}
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
              Pengeluaran & Kas Operasional Komplek
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-xs font-black border border-rose-200">
              Total Realisasi: {formatRupiah(totalExpense)}
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Catat, verifikasi nota belanja, terbitkan voucher Bukti Kas Keluar (BKK), dan sajikan laporan transparansi kas warga secara terbuka.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportExpensesCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-surface hover:bg-canvas border border-border text-ink text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-ink-muted" />
            Ekspor Nota (CSV)
          </button>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Catat Pengeluaran Baru
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
              Bagikan tautan ini ke grup WhatsApp warga agar warga dapat memeriksa seluruh nota belanja, saldo bank BCA, dan status iuran lunas secara transparan.
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
            Buka Halaman Transparansi
          </a>
        </div>
      </div>

      {/* 4 Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 p-1.5 bg-surface rounded-2xl border border-border shadow-xs overflow-x-auto no-scrollbar">
        {[
          { id: 'expenses_list', label: 'Buku Pengeluaran & Nota Belanja', icon: FileText, count: expenses.length },
          { id: 'budget_analysis', label: 'Analisis Alokasi Anggaran', icon: PieChart },
          { id: 'public_transparency', label: 'Rekapitulasi Iuran Warga (Lunas vs Belum)', icon: Eye },
          { id: 'manual_form', label: 'Formulir Catat Pengeluaran', icon: PlusCircle },
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
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[11px] font-semibold text-ink-muted">Total Realisasi Pengeluaran</span>
              <p className="text-xl font-black text-rose-700 mt-1 tabular-nums">{formatRupiah(totalExpense)}</p>
              <span className="text-[10px] text-ink-muted mt-0.5 block">{expenses.length} Pos Transaksi</span>
            </div>

            <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[11px] font-semibold text-ink-muted">Pos Terbesar: Keamanan</span>
              <p className="text-xl font-black text-ink mt-1 tabular-nums">{formatRupiah(totalKeamanan)}</p>
              <span className="text-[10px] text-emerald-700 font-bold mt-0.5 block">Honor 6 Personil Satpam</span>
            </div>

            <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[11px] font-semibold text-ink-muted">Kebersihan & Listrik PJU</span>
              <p className="text-xl font-black text-ink mt-1 tabular-nums">{formatRupiah(totalKebersihan + totalListrikFasum)}</p>
              <span className="text-[10px] text-ink-muted mt-0.5 block">Sampah & Penerangan Jalan</span>
            </div>

            <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[11px] font-semibold text-ink-muted">Saldo Bank BCA Tersedia</span>
              <p className="text-xl font-black text-emerald-700 mt-1 tabular-nums">Rp 128.450.000</p>
              <span className="text-[10px] text-emerald-600 font-bold mt-0.5 block">Kas Paguyuban Sehat</span>
            </div>
          </div>

          {/* Filters, Kategori & Search Bar */}
          <div className="bg-surface p-4 rounded-2xl border border-border shadow-card flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="w-full sm:w-72 relative">
              <Search className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari uraian belanja, vendor, nota..."
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
                <option value="Keamanan">Keamanan (Satpam)</option>
                <option value="Kebersihan">Kebersihan & Sampah</option>
                <option value="Listrik">Listrik & PJU Fasum</option>
                <option value="Pemeliharaan">Pemeliharaan Sarana</option>
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
                className="p-2 bg-canvas border border-border rounded-xl text-ink-muted hover:text-ink"
                title={`Urutan: ${sortOrder === 'asc' ? 'Menaik' : 'Menurun'}`}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Expenses Table with Pagination */}
          <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-canvas border-b border-border text-ink-muted font-bold">
                  <tr>
                    <th className="py-3.5 px-4">Tanggal & No. Voucher</th>
                    <th className="py-3.5 px-4">Kategori Pos</th>
                    <th className="py-3.5 px-4">Uraian Pengeluaran & Vendor</th>
                    <th className="py-3.5 px-4 text-right">Nominal Realisasi</th>
                    <th className="py-3.5 px-4 text-center">Status Buku Kas</th>
                    <th className="py-3.5 px-4 text-right">Aksi & Kuitansi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {paginatedExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-ink-muted font-medium">
                        Tidak ada catatan pengeluaran yang cocok dengan filter.
                      </td>
                    </tr>
                  ) : (
                    paginatedExpenses.map((exp) => (
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
                          <span className="text-[10px] text-ink-muted">{exp.vendor || 'Pengadaan Kas Paguyuban'}</span>
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
                            {/* Kuitansi / Voucher BKK Button */}
                            <button
                              type="button"
                              onClick={() => setSelectedVoucher(exp)}
                              className="px-2 py-1 bg-primary-50 hover:bg-primary-100 text-primary-800 rounded-lg font-bold inline-flex items-center gap-1 text-[11px]"
                              title="Lihat Voucher Kas Keluar (BKK)"
                            >
                              <Receipt className="w-3.5 h-3.5" /> Voucher
                            </button>

                            {/* Bukti Nota */}
                            <button
                              type="button"
                              onClick={() => setViewingProof(exp)}
                              className="p-1 text-ink-muted hover:text-ink hover:bg-canvas rounded-lg"
                              title="Lihat Nota Belanja"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(exp)}
                              className="p-1 text-amber-700 hover:bg-amber-50 rounded-lg"
                              title="Edit Pengeluaran"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setExpenseToDelete(exp)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded-lg"
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
                  Menampilkan <strong className="text-ink">{totalFiltered === 0 ? 0 : startIndex + 1}</strong> - <strong className="text-ink">{endIndex}</strong> dari <strong className="text-ink">{totalFiltered}</strong> pos pengeluaran
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
                            ? 'bg-rose-600 text-white shadow-xs'
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

      {/* ================= SUBTAB 2: REKAPITULASI IURAN TRANSPARANSI WARGA ================= */}
      {activeSubTab === 'public_transparency' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="p-5 bg-surface rounded-3xl border border-border shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <h3 className="font-black text-base text-ink flex items-center gap-2">
                  <Eye className="w-5 h-5 text-emerald-600" />
                  Rekapitulasi Iuran Transparansi Warga Terbuka (Agustus 2026)
                </h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  Daftar warga yang sudah lunas dan yang belum bayar yang disinkronisasi ke portal publik [transparency](http://localhost:4321/transparency).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyPublicLink}
                  className="px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl font-bold text-xs border border-emerald-300 inline-flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Salin Tautan Rekapitulasi
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-emerald-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Unit Sudah Lunas (86 Unit)
                  </h4>
                  <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-black">
                    TERVERIFIKASI
                  </span>
                </div>
                <p className="text-emerald-800 text-[11px]">Total terkumpul: <strong>Rp 64.500.000</strong> (72% dari target)</p>
              </div>

              <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-rose-950 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-rose-600" />
                    Unit Belum Lunas (34 Unit)
                  </h4>
                  <span className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-black">
                    MENUNGGU BAYAR
                  </span>
                </div>
                <p className="text-rose-800 text-[11px]">Sisa piutang iuran: <strong>Rp 25.500.000</strong></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUBTAB 3: ANALISIS ALOKASI ANGGARAN ================= */}
      {activeSubTab === 'budget_analysis' && (
        <div className="space-y-4 max-w-3xl animate-in fade-in duration-150">
          <div className="p-5 bg-surface rounded-3xl border border-border shadow-card space-y-4 text-xs">
            <h3 className="font-black text-base text-ink flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary-600" />
              Komposisi Alokasi Anggaran Belanja Komplek
            </h3>
            <div className="space-y-2.5">
              {[
                { name: '1. Gaji & Operasional Satpam (Keamanan 24 Jam)', amount: totalKeamanan, pct: Math.round((totalKeamanan / Math.max(1, totalExpense)) * 100), color: 'bg-emerald-600' },
                { name: '2. Pengangkutan Sampah Terpadu Dinas LH', amount: totalKebersihan, pct: Math.round((totalKebersihan / Math.max(1, totalExpense)) * 100), color: 'bg-indigo-600' },
                { name: '3. Rekening Listrik PJU & Pompa Fasilitas', amount: totalListrikFasum, pct: Math.round((totalListrikFasum / Math.max(1, totalExpense)) * 100), color: 'bg-amber-600' },
                { name: '4. Perbaikan Jalan, Lampu & Fasilitas Umum', amount: totalPemeliharaan, pct: Math.round((totalPemeliharaan / Math.max(1, totalExpense)) * 100), color: 'bg-rose-600' },
              ].map((item, idx) => (
                <div key={idx} className="p-3.5 bg-canvas rounded-2xl border border-border space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-ink">{item.name}</span>
                    <span className="font-mono font-black text-ink">{formatRupiah(item.amount)} ({item.pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-border overflow-hidden">
                    <div className={`h-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= SUBTAB 4: FORMULIR CATAT PENGELUARAN ================= */}
      {activeSubTab === 'manual_form' && (
        <div className="space-y-4 max-w-xl animate-in fade-in duration-150">
          <div className="p-6 bg-surface rounded-3xl border border-border shadow-card space-y-4 text-xs">
            <h3 className="font-black text-base text-ink flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-rose-600" />
              Catat Nota Pengeluaran / Belanja Kas
            </h3>
            <p className="text-ink-muted">
              Isi data pembelanjaan untuk memperbarui buku kas pengeluaran komplek secara akurat dan transparan.
            </p>

            <form onSubmit={handleSaveExpense} className="space-y-3">
              <div>
                <label className="font-bold text-ink block mb-1">Uraian Pengeluaran / Judul Belanja *</label>
                <input
                  type="text"
                  placeholder="Contoh: Pembelian Lampu PJU LED 50W (10 Unit)"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-ink block mb-1">Kategori *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="Keamanan">Keamanan (Satpam)</option>
                    <option value="Kebersihan">Kebersihan & Sampah</option>
                    <option value="Listrik Fasum">Listrik Fasum / PJU</option>
                    <option value="Pemeliharaan">Pemeliharaan Sarana</option>
                    <option value="Operasional">Operasional & ATK</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Nominal Belanja (Rp) *</label>
                  <input
                    type="number"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold font-mono text-ink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-ink block mb-1">Nama Toko / Vendor</label>
                  <input
                    type="text"
                    placeholder="Toko Listrik Terang Abadi"
                    value={formVendor}
                    onChange={(e) => setFormVendor(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Tanggal Transaksi *</label>
                  <input
                    type="date"
                    value={formExpenseDate}
                    onChange={(e) => setFormExpenseDate(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingExpense}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                {savingExpense ? 'Menyimpan...' : 'Simpan & Terbitkan Voucher Kas'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE / EDIT EXPENSE ================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-border shadow-modal space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-sm text-ink">
                {editingExpenseId ? 'Edit Catatan Pengeluaran' : 'Catat Pengeluaran Baru'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-3">
              <div>
                <label className="font-bold text-ink block mb-1">Uraian / Judul Belanja *</label>
                <input
                  type="text"
                  placeholder="Contoh: Honor 6 Satpam Bulan Ini"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                  className="w-full p-2 bg-canvas border border-border rounded-xl font-bold text-ink"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-ink block mb-1">Kategori *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full p-2 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="Keamanan">Keamanan</option>
                    <option value="Kebersihan">Kebersihan</option>
                    <option value="Listrik Fasum">Listrik Fasum</option>
                    <option value="Pemeliharaan">Pemeliharaan</option>
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
                  <label className="font-bold text-ink block mb-1">Vendor / Toko</label>
                  <input
                    type="text"
                    value={formVendor}
                    onChange={(e) => setFormVendor(e.target.value)}
                    className="w-full p-2 bg-canvas border border-border rounded-xl text-ink"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Tanggal *</label>
                  <input
                    type="date"
                    value={formExpenseDate}
                    onChange={(e) => setFormExpenseDate(e.target.value)}
                    required
                    className="w-full p-2 bg-canvas border border-border rounded-xl text-ink"
                  />
                </div>
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
                  disabled={savingExpense}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-xs disabled:opacity-50"
                >
                  {savingExpense ? 'Menyimpan...' : 'Simpan Pengeluaran'}
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
                onClick={() => {
                  window.print();
                }}
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

      {/* ================= MODAL: LIHAT BUKTI NOTA / STRUK ================= */}
      {viewingProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-border shadow-modal space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-sm text-ink">Bukti Nota / Faktur Belanja</h3>
              <button onClick={() => setViewingProof(null)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            <div className="w-full h-56 rounded-2xl bg-slate-100 overflow-hidden border border-border">
              <img
                src={viewingProof.proofUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80'}
                alt="Nota Belanja"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-1">
              <p className="font-bold text-ink">{viewingProof.title}</p>
              <p className="text-[11px] text-ink-muted">Nominal: {formatRupiah(viewingProof.amount)} • {viewingProof.expenseDate}</p>
            </div>

            <button
              type="button"
              onClick={() => setViewingProof(null)}
              className="w-full py-2.5 bg-canvas border border-border text-ink font-bold rounded-xl"
            >
              Tutup
            </button>
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
                Catatan belanja sebesar <strong>{formatRupiah(expenseToDelete.amount)}</strong> akan dibatalkan/dihapus dari buku kas. Tindakan ini tercatat di Jejak Audit.
              </p>
            </div>

            <div>
              <label className="font-bold text-ink block mb-1">Alasan Pembatalan:</label>
              <select
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="w-full p-2 bg-canvas border border-border rounded-xl text-ink font-semibold"
              >
                <option value="Koreksi Input / Pembelian Dibatalkan">Koreksi Input / Pembelian Dibatalkan</option>
                <option value="Nota Duplikat">Nota Duplikat</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setExpenseToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteExpense}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs"
              >
                Ya, Hapus Pengeluaran
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
