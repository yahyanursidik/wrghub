import React, { useState, useMemo } from 'react';
import {
  Download,
  Search,
  Filter,
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
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
  Building,
  Check,
  Receipt,
  CreditCard,
  Layers,
  Banknote,
  Eye,
  AlertTriangle,
  Clock,
  Send
} from 'lucide-react';
import { formatRupiah } from '../../lib/format';

interface AccountItem {
  id: string;
  name: string;
  code: string;
  type: string;
  bankName?: string | null;
  accountNumber?: string | null;
  balance: number;
}

interface LedgerEntryItem {
  id: string;
  accountId: string | null;
  entryDate: string;
  direction: string; // 'IN' | 'OUT'
  amount: number;
  sourceType: string;
  sourceId?: string | null;
  description: string;
  createdBy?: string | null;
}

interface LedgerManagerProps {
  accounts: AccountItem[];
  entries: LedgerEntryItem[];
}

export const LedgerManager: React.FC<LedgerManagerProps> = ({ accounts: initialAccounts, entries: initialEntries }) => {
  const [accounts, setAccounts] = useState<AccountItem[]>(initialAccounts);
  const [entries, setEntries] = useState<LedgerEntryItem[]>(initialEntries);
  const [activeSubTab, setActiveSubTab] = useState<'ledger_list' | 'accounts_manage' | 'public_transparency' | 'manual_form'>('ledger_list');
  const [accountFilter, setAccountFilter] = useState<string>('ALL');
  const [directionFilter, setDirectionFilter] = useState<'ALL' | 'IN' | 'OUT'>('ALL');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'description' | 'amount' | 'direction'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals & Drawers
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<LedgerEntryItem | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<LedgerEntryItem | null>(null);
  const [deleteReason, setDeleteReason] = useState('Koreksi Input Jurnal / Duplikat');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Form State
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [formAccountId, setFormAccountId] = useState('acc-main');
  const [formDirection, setFormDirection] = useState<'IN' | 'OUT'>('IN');
  const [formAmount, setFormAmount] = useState('750000');
  const [formSourceType, setFormSourceType] = useState('IURAN_WARGA');
  const [formDescription, setFormDescription] = useState('Penerimaan setoran iuran kas warga');
  const [formEntryDate, setFormEntryDate] = useState(new Date().toISOString().slice(0, 10));
  const [savingEntry, setSavingEntry] = useState(false);

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Metrics
  const totalIn = entries.filter((e) => e.direction === 'IN').reduce((sum, e) => sum + e.amount, 0);
  const totalOut = entries.filter((e) => e.direction === 'OUT').reduce((sum, e) => sum + e.amount, 0);
  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingEntryId(null);
    setFormAccountId('acc-main');
    setFormDirection('IN');
    setFormAmount('750000');
    setFormSourceType('IURAN_WARGA');
    setFormDescription('Penerimaan setoran iuran kas warga');
    setFormEntryDate(new Date().toISOString().slice(0, 10));
    setShowAddModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (entry: LedgerEntryItem) => {
    setEditingEntryId(entry.id);
    setFormAccountId(entry.accountId || 'acc-main');
    setFormDirection((entry.direction as 'IN' | 'OUT') || 'IN');
    setFormAmount(entry.amount.toString());
    setFormSourceType(entry.sourceType || 'MANUAL_JOURNAL');
    setFormDescription(entry.description);
    setFormEntryDate(entry.entryDate);
    setShowAddModal(true);
  };

  // Handle Save Entry (Create / Update)
  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDescription || !formAmount) return;
    setSavingEntry(true);
    const numAmount = parseInt(formAmount.replace(/\D/g, ''), 10) || 0;

    try {
      if (editingEntryId) {
        const res = await fetch('/api/ledger/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ledgerId: editingEntryId,
            description: formDescription,
            amount: numAmount,
            direction: formDirection,
            entryDate: formEntryDate,
            accountId: formAccountId,
          }),
        });

        if (res.ok) {
          setEntries(
            entries.map((ent) =>
              ent.id === editingEntryId
                ? {
                    ...ent,
                    description: formDescription,
                    amount: numAmount,
                    direction: formDirection,
                    entryDate: formEntryDate,
                    accountId: formAccountId,
                  }
                : ent
            )
          );
          showToast(`Entri jurnal "${formDescription}" berhasil diperbarui.`);
          setShowAddModal(false);
        }
      } else {
        const res = await fetch('/api/ledger/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accountId: formAccountId,
            direction: formDirection,
            amount: numAmount,
            sourceType: formSourceType,
            description: formDescription,
            entryDate: formEntryDate,
          }),
        });

        if (res.ok) {
          const newEnt: LedgerEntryItem = {
            id: `led-${Date.now()}`,
            accountId: formAccountId,
            entryDate: formEntryDate,
            direction: formDirection,
            amount: numAmount,
            sourceType: formSourceType,
            sourceId: `JRN-${Date.now().toString().slice(-4)}`,
            description: formDescription,
            createdBy: 'Bendahara Komplek',
          };
          setEntries([newEnt, ...entries]);
          showToast(`Mutasi jurnal kas sebesar ${formatRupiah(numAmount)} berhasil dicatat.`);
          setShowAddModal(false);
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan entri jurnal kas.');
    } finally {
      setSavingEntry(false);
    }
  };

  // Confirm Delete Entry
  const handleConfirmDelete = async () => {
    if (!entryToDelete) return;
    try {
      const res = await fetch('/api/ledger/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ledgerId: entryToDelete.id,
          description: entryToDelete.description,
          amount: entryToDelete.amount,
          reason: deleteReason,
        }),
      });

      if (res.ok) {
        setEntries(entries.filter((e) => e.id !== entryToDelete.id));
        showToast(`Entri jurnal kas "${entryToDelete.description}" berhasil dihapus.`);
        setEntryToDelete(null);
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menghapus entri jurnal kas.');
    }
  };

  // Filter & Sort
  const filteredAndSortedEntries = useMemo(() => {
    const list = entries.filter((e) => {
      const matchesAccount = accountFilter === 'ALL' || e.accountId === accountFilter;
      const matchesDirection = directionFilter === 'ALL' || e.direction === directionFilter;
      const matchesSearch =
        e.description.toLowerCase().includes(search.toLowerCase()) ||
        e.sourceType.toLowerCase().includes(search.toLowerCase()) ||
        (e.sourceId && e.sourceId.toLowerCase().includes(search.toLowerCase()));
      return matchesAccount && matchesDirection && matchesSearch;
    });

    list.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') comparison = a.entryDate.localeCompare(b.entryDate);
      else if (sortBy === 'description') comparison = a.description.localeCompare(b.description);
      else if (sortBy === 'amount') comparison = a.amount - b.amount;
      else if (sortBy === 'direction') comparison = a.direction.localeCompare(b.direction);
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return list;
  }, [entries, accountFilter, directionFilter, search, sortBy, sortOrder]);

  // Pagination
  const totalFiltered = filteredAndSortedEntries.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalFiltered);
  const paginatedEntries = filteredAndSortedEntries.slice(startIndex, endIndex);

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
    const headers = ['ID Jurnal', 'Tanggal', 'Akun Kas / Bank', 'Tipe Sumber', 'Uraian Transaksi', 'Pemasukan (Debit)', 'Pengeluaran (Kredit)'];
    const rows = filteredAndSortedEntries.map((e) => [
      e.id,
      e.entryDate,
      e.accountId === 'acc-cash' ? 'Kas Tunai Bendahara' : 'Rekening BCA Utama',
      e.sourceType,
      `"${e.description.replace(/"/g, '""')}"`,
      e.direction === 'IN' ? e.amount : '',
      e.direction === 'OUT' ? e.amount : '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `JURNAL_BUKU_KAS_WARGAHUB_${new Date().toISOString().slice(0, 7)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Jurnal buku kas berhasil diekspor ke CSV.');
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
              <Wallet className="w-6 h-6 text-primary-600" />
              Buku Kas & Jurnal Transaksi (General Ledger)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black border border-emerald-200">
              Saldo: {formatRupiah(totalBalance)}
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Rekam mutasi kas debit/kredit secara akurat, terbitkan voucher jurnal kas, dan pantau saldo rekening bank BCA secara real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-surface hover:bg-canvas border border-border text-ink text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-ink-muted" />
            Ekspor Jurnal (CSV)
          </button>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Catat Mutasi Jurnal
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
              Warga dapat memeriksa saldo bank BCA, ringkasan kas masuk & keluar, serta status iuran unit lunas secara terbuka.
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
          { id: 'ledger_list', label: 'Buku Jurnal Kas & Mutasi Rekening', icon: Layers, count: entries.length },
          { id: 'accounts_manage', label: 'Rekening Bank & Kas Tunai', icon: CreditCard, count: accounts.length },
          { id: 'public_transparency', label: 'Rekapitulasi Iuran Warga (Lunas vs Belum)', icon: Eye },
          { id: 'manual_form', label: 'Formulir Catat Mutasi Jurnal', icon: PlusCircle },
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

      {/* ================= SUBTAB 1: BUKU JURNAL KAS ================= */}
      {activeSubTab === 'ledger_list' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[11px] font-semibold text-ink-muted">Total Saldo Kas & Bank</span>
              <p className="text-xl font-black text-ink mt-1 tabular-nums">{formatRupiah(totalBalance)}</p>
              <span className="text-[10px] text-emerald-600 font-bold mt-0.5 block">2 Rekening Aktif</span>
            </div>

            <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[11px] font-semibold text-ink-muted">Pemasukan Kas (+Debit)</span>
              <p className="text-xl font-black text-emerald-700 mt-1 tabular-nums">+{formatRupiah(totalIn)}</p>
              <span className="text-[10px] text-ink-muted mt-0.5 block">Iuran & Penerimaan</span>
            </div>

            <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[11px] font-semibold text-ink-muted">Pengeluaran Kas (-Kredit)</span>
              <p className="text-xl font-black text-rose-700 mt-1 tabular-nums">-{formatRupiah(totalOut)}</p>
              <span className="text-[10px] text-ink-muted mt-0.5 block">Operasional & Belanja</span>
            </div>

            <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[11px] font-semibold text-ink-muted">Surplus Kas Bulan Ini</span>
              <p className="text-xl font-black text-primary-700 mt-1 tabular-nums">+{formatRupiah(totalIn - totalOut)}</p>
              <span className="text-[10px] text-emerald-600 font-bold mt-0.5 block">Arus Kas Positif</span>
            </div>
          </div>

          {/* Filter Bar & Direction Toggle */}
          <div className="bg-surface p-4 rounded-2xl border border-border shadow-card flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setDirectionFilter('ALL');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  directionFilter === 'ALL'
                    ? 'bg-primary-600 text-white'
                    : 'bg-canvas text-ink-muted hover:text-ink border border-border'
                }`}
              >
                Semua Arus ({entries.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setDirectionFilter('IN');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  directionFilter === 'IN'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-canvas text-emerald-800 hover:bg-emerald-50 border border-border'
                }`}
              >
                + Pemasukan (Debit)
              </button>
              <button
                type="button"
                onClick={() => {
                  setDirectionFilter('OUT');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  directionFilter === 'OUT'
                    ? 'bg-rose-600 text-white'
                    : 'bg-canvas text-rose-800 hover:bg-rose-50 border border-border'
                }`}
              >
                - Pengeluaran (Kredit)
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
              <div className="relative w-full sm:w-56">
                <Search className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari uraian transaksi..."
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
                <option value="date">Urut Tanggal</option>
                <option value="description">Urut Uraian</option>
                <option value="amount">Urut Nominal</option>
                <option value="direction">Urut Arah Kas</option>
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

          {/* Ledger Table */}
          <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-canvas border-b border-border text-ink-muted font-bold">
                  <tr>
                    <th className="py-3.5 px-4">Tanggal & No. Jurnal</th>
                    <th className="py-3.5 px-4">Akun & Sumber</th>
                    <th className="py-3.5 px-4">Uraian Transaksi</th>
                    <th className="py-3.5 px-4 text-right">Debit (+Masuk)</th>
                    <th className="py-3.5 px-4 text-right">Kredit (-Keluar)</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {paginatedEntries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-ink-muted font-medium">
                        Tidak ada transaksi kas yang sesuai dengan filter.
                      </td>
                    </tr>
                  ) : (
                    paginatedEntries.map((e) => (
                      <tr key={e.id} className="hover:bg-canvas/50 text-ink transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-ink block">{e.entryDate}</span>
                          <span className="text-[10px] text-ink-muted font-mono">{e.sourceId || e.id}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-canvas border border-border font-bold text-[10px] text-ink block w-fit">
                            {e.accountId === 'acc-cash' ? 'Kas Tunai Bendahara' : 'BCA Utama (7720-192-881)'}
                          </span>
                          <span className="text-[10px] text-ink-muted">{e.sourceType}</span>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-ink max-w-xs">{e.description}</td>
                        <td className="py-3.5 px-4 text-right font-black text-emerald-700 font-mono">
                          {e.direction === 'IN' ? `+ ${formatRupiah(e.amount)}` : '-'}
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-rose-700 font-mono">
                          {e.direction === 'OUT' ? `- ${formatRupiah(e.amount)}` : '-'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setSelectedVoucher(e)}
                              className="px-2 py-1 bg-primary-50 hover:bg-primary-100 text-primary-800 rounded-lg font-bold text-[11px] inline-flex items-center gap-1"
                              title="Lihat Voucher Jurnal"
                            >
                              <Receipt className="w-3.5 h-3.5" /> Voucher
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(e)}
                              className="p-1 text-amber-700 hover:bg-amber-50 rounded-lg"
                              title="Edit Jurnal"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEntryToDelete(e)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded-lg"
                              title="Hapus Jurnal"
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
                  Menampilkan <strong className="text-ink">{totalFiltered === 0 ? 0 : startIndex + 1}</strong> - <strong className="text-ink">{endIndex}</strong> dari <strong className="text-ink">{totalFiltered}</strong> entri jurnal
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

      {/* ================= SUBTAB 2: REKENING BANK & KAS TUNAI ================= */}
      {activeSubTab === 'accounts_manage' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accounts.map((acc) => (
              <div key={acc.id} className="p-5 bg-surface rounded-3xl border border-border shadow-card space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center font-bold">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-ink text-sm">{acc.name}</h4>
                      <p className="text-[11px] text-ink-muted">{acc.bankName || 'Kas Tunai'}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200">
                    Aktif
                  </span>
                </div>

                <div className="p-4 bg-canvas rounded-2xl border border-border space-y-1">
                  <span className="text-[11px] font-semibold text-ink-muted">Saldo Tersedia:</span>
                  <p className="text-2xl font-black text-ink font-mono tabular-nums">{formatRupiah(acc.balance)}</p>
                  <p className="text-xs font-mono text-ink-muted mt-1">No. Rekening: {acc.accountNumber || 'Brankas Tunai Pos / Bendahara'}</p>
                </div>
              </div>
            ))}
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

      {/* ================= SUBTAB 4: FORMULIR CATAT MUTASI JURNAL ================= */}
      {activeSubTab === 'manual_form' && (
        <div className="space-y-4 max-w-xl animate-in fade-in duration-150">
          <div className="p-6 bg-surface rounded-3xl border border-border shadow-card space-y-4 text-xs">
            <h3 className="font-black text-base text-ink flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-primary-600" />
              Catat Mutasi Jurnal Kas Manual
            </h3>
            <p className="text-ink-muted">
              Isi data debit/kredit untuk mencatat transaksi penerimaan atau pengeluaran kas komplek.
            </p>

            <form onSubmit={handleSaveEntry} className="space-y-3">
              <div>
                <label className="font-bold text-ink block mb-1">Uraian Transaksi *</label>
                <input
                  type="text"
                  placeholder="Contoh: Penerimaan Sumbangan Warga untuk Pengecatan"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-ink block mb-1">Arah Arus Kas *</label>
                  <select
                    value={formDirection}
                    onChange={(e) => setFormDirection(e.target.value as any)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="IN">+ Masuk (Debit)</option>
                    <option value="OUT">- Keluar (Kredit)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Nominal (Rp) *</label>
                  <input
                    type="number"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono font-bold text-ink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-ink block mb-1">Rekening Akun</label>
                  <select
                    value={formAccountId}
                    onChange={(e) => setFormAccountId(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="acc-main">BCA Utama (7720-192-881)</option>
                    <option value="acc-cash">Kas Tunai Bendahara</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Tanggal Transaksi *</label>
                  <input
                    type="date"
                    value={formEntryDate}
                    onChange={(e) => setFormEntryDate(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingEntry}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                {savingEntry ? 'Menyimpan...' : 'Simpan Jurnal Transaksi'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE / EDIT JURNAL ================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-border shadow-modal space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-sm text-ink">
                {editingEntryId ? 'Edit Jurnal Transaksi' : 'Catat Mutasi Jurnal Kas'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            <form onSubmit={handleSaveEntry} className="space-y-3">
              <div>
                <label className="font-bold text-ink block mb-1">Uraian Transaksi *</label>
                <input
                  type="text"
                  placeholder="Uraian mutasi kas"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  required
                  className="w-full p-2 bg-canvas border border-border rounded-xl font-bold text-ink"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-ink block mb-1">Arah Arus *</label>
                  <select
                    value={formDirection}
                    onChange={(e) => setFormDirection(e.target.value as any)}
                    className="w-full p-2 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="IN">+ Masuk (Debit)</option>
                    <option value="OUT">- Keluar (Kredit)</option>
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
                  <label className="font-bold text-ink block mb-1">Akun Kas</label>
                  <select
                    value={formAccountId}
                    onChange={(e) => setFormAccountId(e.target.value)}
                    className="w-full p-2 bg-canvas border border-border rounded-xl text-ink"
                  >
                    <option value="acc-main">BCA Utama</option>
                    <option value="acc-cash">Kas Tunai Bendahara</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Tanggal *</label>
                  <input
                    type="date"
                    value={formEntryDate}
                    onChange={(e) => setFormEntryDate(e.target.value)}
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
                  disabled={savingEntry}
                  className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-xs disabled:opacity-50"
                >
                  {savingEntry ? 'Menyimpan...' : 'Simpan Jurnal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: VOUCHER JURNAL KAS ================= */}
      {selectedVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-border shadow-modal space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-black text-sm text-ink">Bukti Jurnal Kas & Bank (Resmi)</h3>
                <p className="text-[11px] text-ink-muted">No. Ref: {selectedVoucher.sourceId || selectedVoucher.id}</p>
              </div>
              <button onClick={() => setSelectedVoucher(null)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            <div className="p-4 bg-canvas rounded-2xl border border-border space-y-2.5">
              <div className="flex justify-between">
                <span className="text-ink-muted">Uraian Transaksi:</span>
                <span className="font-black text-ink">{selectedVoucher.description}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Akun Pembukuan:</span>
                <span className="font-bold text-ink">
                  {selectedVoucher.accountId === 'acc-cash' ? 'Kas Tunai Bendahara' : 'Rekening Bank BCA Utama'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Arah Transaksi:</span>
                <span className={`font-black ${selectedVoucher.direction === 'IN' ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {selectedVoucher.direction === 'IN' ? '+ PENERIMAAN KAS (DEBIT)' : '- PENGELUARAN KAS (KREDIT)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Tanggal Jurnal:</span>
                <span className="font-mono text-ink">{selectedVoucher.entryDate}</span>
              </div>
              <div className="pt-2 border-t border-border flex justify-between items-center">
                <span className="font-bold text-ink">Nominal Mutasi:</span>
                <span className={`font-black text-base font-mono ${selectedVoucher.direction === 'IN' ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {selectedVoucher.direction === 'IN' ? '+' : '-'} {formatRupiah(selectedVoucher.amount)}
                </span>
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

      {/* ================= MODAL: KONFIRMASI HAPUS JURNAL ================= */}
      {entryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-red-200 shadow-modal space-y-4 text-xs">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-black text-base text-ink">Hapus Jurnal "{entryToDelete.description}"?</h3>
              <p className="text-ink-muted">
                Mutasi kas sebesar <strong>{formatRupiah(entryToDelete.amount)}</strong> akan dibatalkan/dihapus dari buku kas. Tindakan ini tercatat di Jejak Audit.
              </p>
            </div>

            <div>
              <label className="font-bold text-ink block mb-1">Alasan Pembatalan:</label>
              <select
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="w-full p-2 bg-canvas border border-border rounded-xl text-ink font-semibold"
              >
                <option value="Koreksi Input Jurnal / Duplikat">Koreksi Input Jurnal / Duplikat</option>
                <option value="Transaksi Dibatalkan Bank">Transaksi Dibatalkan Bank</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setEntryToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs"
              >
                Ya, Hapus Jurnal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
