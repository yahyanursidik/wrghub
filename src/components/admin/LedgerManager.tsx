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
  Send,
  Scale,
  FileSpreadsheet,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  CheckCheck,
  Building2,
  RotateCcw,
  ArrowRightLeft,
  PieChart,
  Calendar,
  Info
} from 'lucide-react';
import { formatRupiah } from '../../lib/format';

export type LedgerSubTab =
  | 'ledger_list'
  | 'accounts_manage'
  | 'bank_reconciliation'
  | 'financial_reports'
  | 'public_transparency';

export interface AccountItem {
  id: string;
  name: string;
  code: string;
  type: string;
  bankName?: string | null;
  accountNumber?: string | null;
  balance: number;
}

export interface LedgerEntryItem {
  id: string;
  accountId: string | null;
  entryDate: string;
  direction: string; // 'IN' | 'OUT'
  amount: number;
  sourceType: string;
  sourceId?: string | null;
  description: string;
  createdBy?: string | null;
  runningBalance?: number;
}

export interface LedgerManagerProps {
  accounts: AccountItem[];
  entries: LedgerEntryItem[];
  initialTab?: LedgerSubTab;
}

export const LedgerManager: React.FC<LedgerManagerProps> = ({
  accounts: initialAccounts,
  entries: initialEntries,
  initialTab = 'ledger_list',
}) => {
  const [accounts, setAccounts] = useState<AccountItem[]>(initialAccounts);
  const [entries, setEntries] = useState<LedgerEntryItem[]>(initialEntries);

  // Subtab State with URL synchronization
  const [activeSubTab, setActiveSubTab] = useState<LedgerSubTab>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as LedgerSubTab;
      if (
        tabParam &&
        ['ledger_list', 'accounts_manage', 'bank_reconciliation', 'financial_reports', 'public_transparency'].includes(
          tabParam
        )
      ) {
        return tabParam;
      }
    }
    return initialTab;
  });

  const handleTabChange = (tab: LedgerSubTab) => {
    setActiveSubTab(tab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.replaceState({}, '', url.toString());
    }
  };

  // State Filters
  const [accountFilter, setAccountFilter] = useState<string>('ALL');
  const [directionFilter, setDirectionFilter] = useState<'ALL' | 'IN' | 'OUT'>('ALL');
  const [sourceTypeFilter, setSourceTypeFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'description' | 'amount' | 'direction' | 'balance'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals & Drawers
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<LedgerEntryItem | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<LedgerEntryItem | null>(null);
  const [deleteReason, setDeleteReason] = useState('Koreksi Input Jurnal / Duplikat');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Transfer State
  const [transferFrom, setTransferFrom] = useState('acc-main');
  const [transferTo, setTransferTo] = useState('acc-cash');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferNotes, setTransferNotes] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  // Bank Reconciliation State
  const mainBankAcc = accounts.find((a) => a.id === 'acc-main' || a.code === 'BCA_MAIN' || a.code === 'BCA-UTAMA') || accounts[0];
  const [bankStatementBalance, setBankStatementBalance] = useState<number>(mainBankAcc ? mainBankAcc.balance : 0);
  const [reconciliationMonth, setReconciliationMonth] = useState('Agustus 2026');
  const [reconChecks, setReconChecks] = useState<{ [key: string]: boolean }>({
    checkQris: false,
    checkInterest: false,
    checkAdminFee: false,
    checkCashWithdrawal: false,
    checkDisbursement: false,
  });

  // Form State
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [formAccountId, setFormAccountId] = useState('acc-main');
  const [formDirection, setFormDirection] = useState<'IN' | 'OUT'>('IN');
  const [formAmount, setFormAmount] = useState('');
  const [formSourceType, setFormSourceType] = useState('MANUAL_JOURNAL');
  const [formDescription, setFormDescription] = useState('');
  const [formEntryDate, setFormEntryDate] = useState(new Date().toISOString().slice(0, 10));
  const [formReferenceNo, setFormReferenceNo] = useState('');
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
    setFormAmount('');
    setFormSourceType('MANUAL_JOURNAL');
    setFormDescription('');
    setFormEntryDate(new Date().toISOString().slice(0, 10));
    setFormReferenceNo(`REF-${Date.now().toString().slice(-4)}`);
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
    setFormReferenceNo(entry.sourceId || '');
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
                    sourceId: formReferenceNo || ent.sourceId,
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
            referenceNo: formReferenceNo,
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
            sourceId: formReferenceNo || `JRN-${Date.now().toString().slice(-4)}`,
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

  // Handle Internal Cash Transfer
  const handleExecuteTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (transferFrom === transferTo) {
      showToast('Rekening asal dan tujuan tidak boleh sama!');
      return;
    }
    const num = parseInt(transferAmount.replace(/\D/g, ''), 10) || 0;
    if (num <= 0) return;
    setIsTransferring(true);

    try {
      const outRes = await fetch('/api/ledger/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: transferFrom,
          direction: 'OUT',
          amount: num,
          sourceType: 'MUTASI_KAS_INTERNAL',
          description: `Transfer keluar ke ${transferTo === 'acc-cash' ? 'Kas Tunai Bendahara' : 'Rekening BCA Utama'}: ${transferNotes}`,
          entryDate: new Date().toISOString().slice(0, 10),
        }),
      });

      const inRes = await fetch('/api/ledger/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: transferTo,
          direction: 'IN',
          amount: num,
          sourceType: 'MUTASI_KAS_INTERNAL',
          description: `Transfer masuk dari ${transferFrom === 'acc-cash' ? 'Kas Tunai Bendahara' : 'Rekening BCA Utama'}: ${transferNotes}`,
          entryDate: new Date().toISOString().slice(0, 10),
        }),
      });

      if (outRes.ok && inRes.ok) {
        const outEntry: LedgerEntryItem = {
          id: `led-${Date.now()}-out`,
          accountId: transferFrom,
          entryDate: new Date().toISOString().slice(0, 10),
          direction: 'OUT',
          amount: num,
          sourceType: 'MUTASI_KAS_INTERNAL',
          sourceId: `TRF-${Date.now().toString().slice(-4)}A`,
          description: `Transfer keluar: ${transferNotes}`,
          createdBy: 'Bendahara Komplek',
        };
        const inEntry: LedgerEntryItem = {
          id: `led-${Date.now()}-in`,
          accountId: transferTo,
          entryDate: new Date().toISOString().slice(0, 10),
          direction: 'IN',
          amount: num,
          sourceType: 'MUTASI_KAS_INTERNAL',
          sourceId: `TRF-${Date.now().toString().slice(-4)}B`,
          description: `Transfer masuk: ${transferNotes}`,
          createdBy: 'Bendahara Komplek',
        };

        setAccounts(
          accounts.map((acc) => {
            if (acc.id === transferFrom) return { ...acc, balance: acc.balance - num };
            if (acc.id === transferTo) return { ...acc, balance: acc.balance + num };
            return acc;
          })
        );

        setEntries([inEntry, outEntry, ...entries]);
        showToast(`Mutasi transfer kas sebesar ${formatRupiah(num)} berhasil dibukukan.`);
        setShowTransferModal(false);
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal memproses mutasi kas internal.');
    } finally {
      setIsTransferring(false);
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

  // Cumulative running balance computation (chronological order)
  const entriesWithRunningBalance = useMemo(() => {
    const chrono = [...entries].sort((a, b) => a.entryDate.localeCompare(b.entryDate));
    let running = 0;
    const balanceMap = new Map<string, number>();
    chrono.forEach((e) => {
      if (e.direction === 'IN') {
        running += e.amount;
      } else {
        running -= e.amount;
      }
      balanceMap.set(e.id, running);
    });

    return entries.map((e) => ({
      ...e,
      runningBalance: balanceMap.get(e.id) ?? 0,
    }));
  }, [entries]);

  // Filter & Sort
  const filteredAndSortedEntries = useMemo(() => {
    const list = entriesWithRunningBalance.filter((e) => {
      const matchesAccount = accountFilter === 'ALL' || e.accountId === accountFilter;
      const matchesDirection = directionFilter === 'ALL' || e.direction === directionFilter;
      const matchesSource = sourceTypeFilter === 'ALL' || e.sourceType === sourceTypeFilter;
      const matchesSearch =
        e.description.toLowerCase().includes(search.toLowerCase()) ||
        e.sourceType.toLowerCase().includes(search.toLowerCase()) ||
        (e.sourceId && e.sourceId.toLowerCase().includes(search.toLowerCase())) ||
        e.id.toLowerCase().includes(search.toLowerCase());
      return matchesAccount && matchesDirection && matchesSource && matchesSearch;
    });

    list.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') comparison = a.entryDate.localeCompare(b.entryDate);
      else if (sortBy === 'description') comparison = a.description.localeCompare(b.description);
      else if (sortBy === 'amount') comparison = a.amount - b.amount;
      else if (sortBy === 'direction') comparison = a.direction.localeCompare(b.direction);
      else if (sortBy === 'balance') comparison = (a.runningBalance ?? 0) - (b.runningBalance ?? 0);
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return list;
  }, [entriesWithRunningBalance, accountFilter, directionFilter, sourceTypeFilter, search, sortBy, sortOrder]);

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

  // Download Reconciliation Statement .txt
  const handleDownloadReconStatement = () => {
    const bcaAcc = accounts.find((a) => a.id === 'acc-main') || accounts[0];
    const systemBcaBalance = bcaAcc ? bcaAcc.balance : 0;
    const diff = bankStatementBalance - systemBcaBalance;
    const isBalanced = diff === 0;

    const content = `BERITA ACARA REKONSILIASI BANK BCA & BUKU KAS - WARGAHUB\n=======================================================\nPeriode: ${reconciliationMonth}\nTanggal Cetak: ${new Date().toLocaleString(
      'id-ID'
    )}\n\nDATA SALDO KAS & BANK:\n-------------------------------------------------------\n1. Saldo Rekening Koran BCA (Fisik)   : ${formatRupiah(
      bankStatementBalance
    )}\n2. Saldo Pembukuan Jurnal Sistem      : ${formatRupiah(
      systemBcaBalance
    )}\n3. Selisih Rekonsiliasi (Variance)     : ${formatRupiah(
      diff
    )}\nSTATUS REKONSILIASI: ${
      isBalanced ? '✓ TEREKONSILIASI PENUH & SEIMBANG' : '⚠️ TERDAPAT SELISIH / ANOMALI'
    }\n\nHASIL VERIFIKASI PEMERIKSAAN:\n-------------------------------------------------------\n- Penerimaan Setoran QRIS & Virtual Account : Sesuai Rekening Koran\n- Biaya Administrasi & Bunga Tabungan Bank   : Sesuai Buku Kas\n- Penarikan Kas Tunai Operasional Paguyuban  : Terverifikasi BKK\n- Transaksi Tertunda / Outstanding Check      : Tidak Ada\n\nMengetahui,\nKetua RW 05                      Bendahara Paguyuban`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BERITA_ACARA_REKONSILIASI_BCA_${reconciliationMonth.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Berita acara rekonsiliasi kas bank berhasil diunduh.');
  };

  // Download Financial Statement Report .txt
  const handleDownloadFinancialStatement = () => {
    const content = `LAPORAN ARUS KAS & LABA RUGI PAGUYUBAN - WARGAHUB\n=================================================\nPeriode: ${new Date().toLocaleString(
      'id-ID',
      { month: 'long', year: 'numeric' }
    )}\nTanggal Dokumen: ${new Date().toLocaleString(
      'id-ID'
    )}\n\n1. PENERIMAAN KAS (ARUS MASUK / OPERATING INFLOW):\n   - Setoran Iuran Warga Komplek    : ${formatRupiah(
      totalIn
    )}\n   TOTAL PENERIMAAN KAS             : ${formatRupiah(
      totalIn
    )}\n\n2. PENGELUARAN KAS (ARUS KELUAR / OPERATING OUTFLOW):\n   - Gaji Satpam & Tim Kebersihan   : ${formatRupiah(
      Math.round(totalOut * 0.55)
    )}\n   - Listrik PJU & Sarana Pompa Air : ${formatRupiah(
      Math.round(totalOut * 0.2)
    )}\n   - Operasional & Pemeliharaan     : ${formatRupiah(
      Math.round(totalOut * 0.25)
    )}\n   TOTAL PENGELUARAN KAS            : ${formatRupiah(
      totalOut
    )}\n\n3. HASIL OPERASIONAL (NET SURPLUS / DEFISIT):\n   SURPLUS BERSIH BULAN BERJALAN    : ${formatRupiah(
      totalIn - totalOut
    )}\n\n4. POSISI SALDO AKHIR KAS & BANK:\n   - Rekening Bank BCA Utama        : ${formatRupiah(
      accounts.find((a) => a.id === 'acc-main')?.balance || 0
    )}\n   - Kas Tunai Bendahara            : ${formatRupiah(
      accounts.find((a) => a.id === 'acc-cash')?.balance || 0
    )}\n   TOTAL LIKUIDITAS PAGUYUBAN       : ${formatRupiah(
      totalBalance
    )}\n\nDisahkan oleh Bendahara & Pengurus Komplek`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LAPORAN_KEUANGAN_${new Date().toISOString().slice(0, 7)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Laporan keuangan kas berhasil diunduh.');
  };

  // Export CSV
  const exportCSV = () => {
    const headers = [
      'ID Jurnal',
      'Tanggal',
      'No. Referensi',
      'Akun Kas / Bank',
      'Tipe Sumber',
      'Uraian Transaksi',
      'Pemasukan (Debit)',
      'Pengeluaran (Kredit)',
      'Saldo Berjalan',
    ];
    const rows = filteredAndSortedEntries.map((e) => [
      e.id,
      e.entryDate,
      `"${e.sourceId || ''}"`,
      e.accountId === 'acc-cash' ? 'Kas Tunai Bendahara' : 'Rekening BCA Utama',
      e.sourceType,
      `"${e.description.replace(/"/g, '""')}"`,
      e.direction === 'IN' ? e.amount : '',
      e.direction === 'OUT' ? e.amount : '',
      e.runningBalance ?? '',
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
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-xl font-bold text-xs animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-ink flex items-center gap-2">
              <Wallet className="w-6 h-6 text-primary-600" />
              <span>Buku Kas & Jurnal Transaksi (General Ledger)</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-mono font-black border border-emerald-200">
              Saldo: {formatRupiah(totalBalance)}
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Rekam mutasi kas debit/kredit secara akurat, terbitkan voucher jurnal kas, rekonsiliasi rekening koran BCA,
            dan pantau likuiditas kas komplek secara real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadFinancialStatement}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-surface hover:bg-canvas border border-border text-ink text-xs font-bold rounded-xl shadow-xs active:scale-[0.98] transition-all"
          >
            <Download className="w-4 h-4 text-ink-muted" />
            <span>Unduh Laporan (.txt)</span>
          </button>
          <button
            type="button"
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-surface hover:bg-canvas border border-border text-ink text-xs font-bold rounded-xl shadow-xs active:scale-[0.98] transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-ink-muted" />
            <span>Ekspor CSV</span>
          </button>
          <button
            type="button"
            onClick={() => setShowTransferModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 text-xs font-bold rounded-xl shadow-xs active:scale-[0.98] transition-all"
          >
            <ArrowRightLeft className="w-4 h-4 text-indigo-700" />
            <span>Transfer Kas</span>
          </button>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs active:scale-[0.98] transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Catat Mutasi Jurnal</span>
          </button>
        </div>
      </div>

      {/* 5 Sub-Tabs Navigation Segmented Pill Grid */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold border-b border-border/80">
        <button
          type="button"
          onClick={() => handleTabChange('ledger_list')}
          className={`px-4 py-2.5 rounded-xl transition-all inline-flex items-center gap-2 whitespace-nowrap active:scale-[0.98] ${
            activeSubTab === 'ledger_list'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-surface text-ink-muted hover:text-ink hover:bg-canvas border border-border/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Buku Jurnal Kas</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              activeSubTab === 'ledger_list' ? 'bg-white/20 text-white' : 'bg-canvas text-ink'
            }`}
          >
            {entries.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('accounts_manage')}
          className={`px-4 py-2.5 rounded-xl transition-all inline-flex items-center gap-2 whitespace-nowrap active:scale-[0.98] ${
            activeSubTab === 'accounts_manage'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-surface text-ink-muted hover:text-ink hover:bg-canvas border border-border/60'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Rekening Bank & Kas Tunai</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              activeSubTab === 'accounts_manage' ? 'bg-white/20 text-white' : 'bg-canvas text-ink'
            }`}
          >
            {accounts.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('bank_reconciliation')}
          className={`px-4 py-2.5 rounded-xl transition-all inline-flex items-center gap-2 whitespace-nowrap active:scale-[0.98] ${
            activeSubTab === 'bank_reconciliation'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-surface text-ink-muted hover:text-ink hover:bg-canvas border border-border/60'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Rekonsiliasi Bank BCA</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('financial_reports')}
          className={`px-4 py-2.5 rounded-xl transition-all inline-flex items-center gap-2 whitespace-nowrap active:scale-[0.98] ${
            activeSubTab === 'financial_reports'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-surface text-ink-muted hover:text-ink hover:bg-canvas border border-border/60'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Laporan Arus Kas</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('public_transparency')}
          className={`px-4 py-2.5 rounded-xl transition-all inline-flex items-center gap-2 whitespace-nowrap active:scale-[0.98] ${
            activeSubTab === 'public_transparency'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-surface text-ink-muted hover:text-ink hover:bg-canvas border border-border/60'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Transparansi Publik</span>
        </button>
      </div>

      {/* ================= SUBTAB 1: BUKU JURNAL KAS ================= */}
      {activeSubTab === 'ledger_list' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[10px] font-mono uppercase font-bold text-ink-muted tracking-wider block">
                Total Saldo Kas & Bank
              </span>
              <p className="text-2xl font-black text-ink mt-0.5 tabular-nums font-mono">
                {formatRupiah(totalBalance)}
              </p>
              <span className="text-[10px] text-emerald-600 font-bold font-mono mt-0.5 block">
                {accounts.length} REKENING TERVERIFIKASI
              </span>
            </div>

            <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[10px] font-mono uppercase font-bold text-ink-muted tracking-wider block">
                Penerimaan Kas (+Debit)
              </span>
              <p className="text-2xl font-black text-emerald-700 mt-0.5 tabular-nums font-mono">
                +{formatRupiah(totalIn)}
              </p>
              <span className="text-[10px] text-emerald-600 font-bold font-mono mt-0.5 block">
                IURAN WARGA & DONASI
              </span>
            </div>

            <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[10px] font-mono uppercase font-bold text-ink-muted tracking-wider block">
                Pengeluaran Kas (-Kredit)
              </span>
              <p className="text-2xl font-black text-rose-700 mt-0.5 tabular-nums font-mono">
                -{formatRupiah(totalOut)}
              </p>
              <span className="text-[10px] text-rose-600 font-bold font-mono mt-0.5 block">
                OPERASIONAL & PEMELIHARAAN
              </span>
            </div>

            <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[10px] font-mono uppercase font-bold text-ink-muted tracking-wider block">
                Surplus Kas Bersih
              </span>
              <p className="text-2xl font-black text-primary-700 mt-0.5 tabular-nums font-mono">
                +{formatRupiah(totalIn - totalOut)}
              </p>
              <span className="text-[10px] text-primary-600 font-bold font-mono mt-0.5 block">
                NET OPERATING SURPLUS
              </span>
            </div>
          </div>

          {/* Filter Bar & Direction Toggle */}
          <div className="bg-surface p-4 rounded-2xl border border-border shadow-card flex flex-col sm:flex-row gap-3 items-center justify-between text-xs">
            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  setDirectionFilter('ALL');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all active:scale-[0.98] ${
                  directionFilter === 'ALL'
                    ? 'bg-slate-900 text-white shadow-2xs'
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
                className={`px-3 py-1.5 rounded-xl font-bold transition-all active:scale-[0.98] ${
                  directionFilter === 'IN'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-canvas text-emerald-800 hover:bg-emerald-50 border border-border'
                }`}
              >
                + Masuk (Debit)
              </button>
              <button
                type="button"
                onClick={() => {
                  setDirectionFilter('OUT');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all active:scale-[0.98] ${
                  directionFilter === 'OUT'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'bg-canvas text-rose-800 hover:bg-rose-50 border border-border'
                }`}
              >
                - Keluar (Kredit)
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
              <div className="relative w-full sm:w-56">
                <Search className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari uraian, no. ref, jurnal..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-2 bg-canvas border border-border rounded-xl text-xs text-ink"
                />
              </div>

              <select
                value={accountFilter}
                onChange={(e) => {
                  setAccountFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="ALL">Semua Rekening</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>

              <select
                value={sourceTypeFilter}
                onChange={(e) => {
                  setSourceTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="ALL">Semua Kategori</option>
                <option value="IURAN_WARGA">Iuran Warga</option>
                <option value="PENGELUARAN_OPS">Pengeluaran Operasional</option>
                <option value="SANTUNAN_SOSIAL">Santunan Sosial & THR</option>
                <option value="PROYEK_FASUM">Proyek Perbaikan Fasum</option>
                <option value="KASBON_PETUGAS">Kasbon & Gaji di Awal</option>
                <option value="MUTASI_KAS_INTERNAL">Mutasi Transfer Kas</option>
                <option value="MANUAL_JOURNAL">Jurnal Manual Lainnya</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="date">Urut Tanggal</option>
                <option value="description">Urut Uraian</option>
                <option value="amount">Urut Nominal</option>
                <option value="balance">Urut Saldo</option>
                <option value="direction">Urut Arah Kas</option>
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
                    <th className="py-3.5 px-4 text-right">Saldo Berjalan</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {paginatedEntries.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-ink-muted">
                        <div className="flex flex-col items-center justify-center gap-2.5 max-w-sm mx-auto">
                          <Wallet className="w-10 h-10 text-ink-muted/40 mx-auto" />
                          <p className="font-bold text-sm text-ink">Belum Ada Transaksi Buku Kas Riil</p>
                          <p className="text-xs text-ink-muted leading-relaxed">
                            Buku mutasi kas digital dalam kondisi bersih. Setiap mutasi debit/kredit yang Anda catat akan otomatis terdata di sini secara transparan.
                          </p>
                          <button
                            type="button"
                            onClick={handleOpenCreateModal}
                            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs active:scale-[0.98] transition-all"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>Catat Mutasi Jurnal Pertama</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedEntries.map((e) => (
                      <tr key={e.id} className="hover:bg-canvas/50 text-ink transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-ink block">{e.entryDate}</span>
                          <span className="text-[10px] text-primary-700 font-mono font-bold">
                            {e.sourceId || e.id}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-canvas border border-border font-bold text-[10px] text-ink block w-fit">
                            {accounts.find((a) => a.id === e.accountId)?.name || (e.accountId === 'acc-cash' ? 'Kas Tunai Bendahara' : 'Rekening Bank BCA')}
                          </span>
                          <span className="text-[10px] text-ink-muted uppercase tracking-wider font-mono">
                            {e.sourceType.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-ink max-w-xs">
                          <p className="truncate font-semibold" title={e.description}>
                            {e.description}
                          </p>
                          {e.createdBy && (
                            <span className="text-[10px] text-ink-muted">Oleh: {e.createdBy}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-emerald-700 font-mono">
                          {e.direction === 'IN' ? `+ ${formatRupiah(e.amount)}` : '-'}
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-rose-700 font-mono">
                          {e.direction === 'OUT' ? `- ${formatRupiah(e.amount)}` : '-'}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-ink font-mono">
                          {e.runningBalance !== undefined ? formatRupiah(e.runningBalance) : '-'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setSelectedVoucher(e)}
                              className="px-2.5 py-1 bg-primary-50 hover:bg-primary-100 text-primary-800 rounded-lg font-bold text-[11px] inline-flex items-center gap-1 active:scale-[0.98] transition-all"
                              title="Lihat Voucher Jurnal"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                              <span>Voucher</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const accountName = accounts.find((a) => a.id === e.accountId)?.name || (e.accountId === 'acc-cash' ? 'Kas Tunai Bendahara' : 'Rekening Bank BCA');
                                const content = `BUKTI MUTASI JURNAL KAS RESMI - WARGAHUB\n=========================================\nNo. Referensi: ${
                                  e.sourceId || e.id
                                }\nTanggal: ${e.entryDate}\nAkun: ${accountName}\nJenis Mutasi: ${
                                  e.direction === 'IN' ? 'PENERIMAAN KAS (+DEBIT)' : 'PENGELUARAN KAS (-KREDIT)'
                                }\nNominal: ${formatRupiah(
                                  e.amount
                                )}\nUraian Transaksi: ${e.description}\nKategori Sumber: ${
                                  e.sourceType
                                }\n\nDicetak pada: ${new Date().toLocaleString(
                                  'id-ID'
                                )}\nBendahara Paguyuban Komplek`;
                                const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `VOUCHER_${e.sourceId || e.id}.txt`;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                                showToast('Slip bukti transaksi berhasil diunduh.');
                              }}
                              className="p-1 text-ink-muted hover:text-ink hover:bg-canvas rounded-lg active:scale-[0.98] transition-all"
                              title="Cetak Slip (.txt)"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(e)}
                              className="p-1 text-amber-700 hover:bg-amber-50 rounded-lg active:scale-[0.98] transition-all"
                              title="Edit Jurnal"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setEntryToDelete(e)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded-lg active:scale-[0.98] transition-all"
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

            {/* Pagination Controls */}
            <div className="p-4 border-t border-border bg-canvas/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="text-ink-muted">
                  Menampilkan <strong className="text-ink">{totalFiltered === 0 ? 0 : startIndex + 1}</strong> -{' '}
                  <strong className="text-ink">{endIndex}</strong> dari{' '}
                  <strong className="text-ink">{totalFiltered}</strong> entri jurnal
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-ink-muted">Baris:</span>
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
                  onClick={() => setCurrentPage(safeCurrentPage - 1)}
                  disabled={safeCurrentPage === 1}
                  className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40 active:scale-[0.98] transition-all"
                  title="Halaman Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1 px-2">
                  <span className="px-3 py-1 font-mono font-bold text-ink bg-surface border border-border rounded-lg">
                    {safeCurrentPage} / {totalPages}
                  </span>
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

      {/* ================= SUBTAB 2: REKENING BANK & KAS TUNAI ================= */}
      {activeSubTab === 'accounts_manage' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div>
              <h3 className="font-black text-base text-ink flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary-600" />
                <span>Daftar Akun Kas & Rekening Bank Paguyuban</span>
              </h3>
              <p className="text-xs text-ink-muted mt-0.5">
                Kelola kas tunai fisik di pos satpam/bendahara serta rekening giro bank BCA operasional warga.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowTransferModal(true)}
              className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-xs inline-flex items-center gap-1.5 active:scale-[0.98] transition-all"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>+ Transfer Antar Rekening Kas</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="p-5 bg-surface rounded-3xl border border-border shadow-card space-y-4 text-xs"
              >
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary-50 text-primary-700 flex items-center justify-center font-bold shadow-2xs">
                      {acc.type === 'BANK' ? <Building2 className="w-5 h-5" /> : <Wallet className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-black text-ink text-sm">{acc.name}</h4>
                      <p className="text-[11px] text-ink-muted font-mono">{acc.code}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200">
                    Aktif Terverifikasi
                  </span>
                </div>

                <div className="p-4 bg-canvas rounded-2xl border border-border space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[11px] font-bold text-ink-muted">Saldo Tersedia:</span>
                    <span className="text-2xl font-black text-ink font-mono tabular-nums">
                      {formatRupiah(acc.balance)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-border/80 flex justify-between text-[11px]">
                    <span className="text-ink-muted">No. Rekening / Simpanan:</span>
                    <span className="font-mono font-bold text-ink">
                      {acc.accountNumber || 'Brankas Tunai Pos / Bendahara'}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-ink-muted">Nama Bank / Institusi:</span>
                    <span className="font-bold text-ink">{acc.bankName || 'Kas Tunai Paguyuban'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAccountFilter(acc.id);
                      handleTabChange('ledger_list');
                    }}
                    className="flex-1 py-2 bg-surface hover:bg-canvas border border-border text-ink font-bold rounded-xl active:scale-[0.98] transition-all inline-flex items-center justify-center gap-1.5"
                  >
                    <Layers className="w-3.5 h-3.5 text-primary-600" />
                    <span>Lihat Mutasi Jurnal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTransferFrom(acc.id);
                      setShowTransferModal(true);
                    }}
                    className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 font-bold rounded-xl active:scale-[0.98] transition-all inline-flex items-center gap-1.5"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>Transfer</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= SUBTAB 3: REKONSILIASI BANK BCA ================= */}
      {activeSubTab === 'bank_reconciliation' && (
        <div className="space-y-6 animate-in fade-in duration-150 max-w-4xl">
          <div className="p-6 bg-surface rounded-3xl border border-border shadow-card space-y-5 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <h3 className="font-black text-base text-ink flex items-center gap-2">
                  <Scale className="w-5 h-5 text-emerald-600" />
                  <span>Rekonsiliasi Bank & Pencocokan Rekening Koran BCA</span>
                </h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  Bandingkan saldo pembukuan sistem WargaHub dengan saldo rekening koran fisik Bank Central Asia (BCA).
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadReconStatement}
                className="px-3.5 py-2.5 bg-surface hover:bg-canvas border border-border text-ink font-bold text-xs rounded-xl inline-flex items-center gap-1.5 shadow-xs active:scale-[0.98] transition-all"
              >
                <Download className="w-4 h-4 text-ink-muted" />
                <span>Unduh Berita Acara (.txt)</span>
              </button>
            </div>

            {/* Reconciliation Comparison Table */}
            {(() => {
              const bcaAcc = accounts.find((a) => a.id === 'acc-main') || accounts[0];
              const systemBalance = bcaAcc ? bcaAcc.balance : 0;
              const difference = bankStatementBalance - systemBalance;
              const isBalanced = difference === 0;

              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 bg-canvas rounded-2xl border border-border space-y-1">
                      <span className="text-[10px] font-mono uppercase font-bold text-ink-muted block">
                        Saldo Rekening Koran Fisik BCA
                      </span>
                      <p className="text-xl font-black font-mono text-ink tabular-nums">
                        {formatRupiah(bankStatementBalance)}
                      </p>
                      <span className="text-[10px] text-ink-muted block">Sesuai e-Statement BCA</span>
                    </div>

                    <div className="p-4 bg-canvas rounded-2xl border border-border space-y-1">
                      <span className="text-[10px] font-mono uppercase font-bold text-ink-muted block">
                        Saldo Pembukuan Buku Kas Sistem
                      </span>
                      <p className="text-xl font-black font-mono text-primary-700 tabular-nums">
                        {formatRupiah(systemBalance)}
                      </p>
                      <span className="text-[10px] text-primary-600 block font-medium">Buku Kas Jurnal Aktif</span>
                    </div>

                    <div
                      className={`p-4 rounded-2xl border space-y-1 ${
                        isBalanced
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                          : 'bg-rose-50/70 border-rose-200 text-rose-950'
                      }`}
                    >
                      <span className="text-[10px] font-mono uppercase font-bold block">
                        Selisih Rekonsiliasi (Variance)
                      </span>
                      <p className="text-xl font-black font-mono tabular-nums">
                        {formatRupiah(Math.abs(difference))}
                      </p>
                      <span className="text-[10px] font-bold block">
                        {isBalanced ? '✓ TEREKONSILIASI & SEIMBANG' : '⚠️ TERDAPAT SELISIH'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-canvas rounded-2xl border border-border space-y-3">
                    <h4 className="font-bold text-ink text-xs">Penyesuaian Saldo Rekening Koran</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-ink block mb-1 text-[11px]">
                          Periode Bulan Rekonsiliasi
                        </label>
                        <select
                          value={reconciliationMonth}
                          onChange={(e) => setReconciliationMonth(e.target.value)}
                          className="w-full p-2 bg-surface border border-border rounded-xl font-bold text-ink"
                        >
                          <option value="Agustus 2026">Agustus 2026</option>
                          <option value="September 2026">September 2026</option>
                          <option value="Oktober 2026">Oktober 2026</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-ink block mb-1 text-[11px]">
                          Input Saldo Rekening Koran BCA (Rp)
                        </label>
                        <input
                          type="number"
                          value={bankStatementBalance}
                          onChange={(e) => setBankStatementBalance(Number(e.target.value))}
                          className="w-full p-2 bg-surface border border-border rounded-xl font-mono font-bold text-ink"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <h4 className="font-bold text-ink text-xs">Checklist Verifikasi Audit Bulanan:</h4>
                    <div className="space-y-2">
                      {[
                        { key: 'checkQris', label: 'Seluruh setoran QRIS warga telah masuk mutasi bank' },
                        { key: 'checkInterest', label: 'Bunga tabungan dan PPh jasa giro telah dibukukan' },
                        { key: 'checkAdminFee', label: 'Biaya administrasi bank bulanan telah dicatat sebagai kredit' },
                        { key: 'checkCashWithdrawal', label: 'Penarikan tunai operasional sesuai dengan bukti BKK fisik' },
                        { key: 'checkDisbursement', label: 'Tidak ada cek gantung atau transfer pending antardaerah' },
                      ].map((item) => (
                        <label
                          key={item.key}
                          className="flex items-center gap-2.5 p-3 bg-surface hover:bg-canvas rounded-xl border border-border cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={reconChecks[item.key] ?? false}
                            onChange={(e) =>
                              setReconChecks({ ...reconChecks, [item.key]: e.target.checked })
                            }
                            className="w-4 h-4 text-emerald-600 rounded"
                          />
                          <span className="font-medium text-ink text-xs">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        showToast('Rekonsiliasi bank berhasil disahkan dan dicatat ke Jejak Audit.');
                      }}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs inline-flex items-center gap-2 active:scale-[0.98] transition-all"
                    >
                      <Check className="w-4 h-4" />
                      <span>Sahkan Rekonsiliasi Periode Ini</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ================= SUBTAB 4: LAPORAN ARUS KAS ================= */}
      {activeSubTab === 'financial_reports' && (
        <div className="space-y-6 animate-in fade-in duration-150 max-w-4xl">
          <div className="p-6 bg-surface rounded-3xl border border-border shadow-card space-y-5 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <h3 className="font-black text-base text-ink flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-indigo-600" />
                  <span>Laporan Laba Rugi & Arus Kas Paguyuban (Cash Flow Statement)</span>
                </h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  Ringkasan analitik penerimaan operasional, alokasi beban pengeluaran rutin, dan posisi surplus kas.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadFinancialStatement}
                  className="px-3.5 py-2 bg-surface hover:bg-canvas border border-border text-ink font-bold rounded-xl inline-flex items-center gap-1.5 shadow-xs active:scale-[0.98] transition-all"
                >
                  <Download className="w-3.5 h-3.5 text-ink-muted" />
                  <span>Unduh Ringkasan (.txt)</span>
                </button>
              </div>
            </div>

            {/* Income & Expense Breakdown */}
            {entries.length === 0 ? (
              <div className="p-8 text-center bg-canvas rounded-2xl border border-border space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-surface border border-border flex items-center justify-center mx-auto text-ink-muted">
                  <PieChart className="w-6 h-6" />
                </div>
                <p className="font-bold text-ink text-sm">Belum Ada Transaksi Arus Kas Periode Ini</p>
                <p className="text-xs text-ink-muted max-w-sm mx-auto">
                  Laporan arus kas dan surplus/defisit operasional akan dikalkulasikan secara otomatis setelah transaksi penerimaan atau pengeluaran dicatat pada buku jurnal.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-canvas rounded-2xl border border-border space-y-2">
                  <div className="flex justify-between items-center text-sm font-bold text-ink">
                    <span className="flex items-center gap-1.5 text-emerald-800">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      <span>Penerimaan Operasional Kas (Inflow)</span>
                    </span>
                    <span className="font-mono font-black text-emerald-700">+{formatRupiah(totalIn)}</span>
                  </div>
                  <div className="pl-6 space-y-1.5 text-[11px] text-ink-muted">
                    <div className="flex justify-between">
                      <span>- Setoran Iuran Rutin Kas Warga (IPL)</span>
                      <span className="font-mono text-ink font-bold">
                        {formatRupiah(entries.filter((e) => e.direction === 'IN' && e.sourceType === 'IURAN_WARGA').reduce((s, e) => s + e.amount, 0))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>- Dana Donasi, Sponsor & Bantuan Sosial</span>
                      <span className="font-mono text-ink font-bold">
                        {formatRupiah(entries.filter((e) => e.direction === 'IN' && e.sourceType !== 'IURAN_WARGA').reduce((s, e) => s + e.amount, 0))}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-canvas rounded-2xl border border-border space-y-2">
                  <div className="flex justify-between items-center text-sm font-bold text-ink">
                    <span className="flex items-center gap-1.5 text-rose-800">
                      <TrendingDown className="w-4 h-4 text-rose-600" />
                      <span>Pengeluaran Beban Operasional Kas (Outflow)</span>
                    </span>
                    <span className="font-mono font-black text-rose-700">-{formatRupiah(totalOut)}</span>
                  </div>
                  <div className="pl-6 space-y-1.5 text-[11px] text-ink-muted">
                    <div className="flex justify-between">
                      <span>- Gaji & Honor Satpam, Kebersihan, Teknisi</span>
                      <span className="font-mono text-ink font-bold">
                        {formatRupiah(entries.filter((e) => e.direction === 'OUT' && e.sourceType === 'PENGELUARAN_OPS').reduce((s, e) => s + e.amount, 0))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>- Proyek Perawatan Sarana & Fasum</span>
                      <span className="font-mono text-ink font-bold">
                        {formatRupiah(entries.filter((e) => e.direction === 'OUT' && e.sourceType === 'PROYEK_FASUM').reduce((s, e) => s + e.amount, 0))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>- Pengeluaran Kas Operasional Lainnya</span>
                      <span className="font-mono text-ink font-bold">
                        {formatRupiah(entries.filter((e) => e.direction === 'OUT' && e.sourceType !== 'PENGELUARAN_OPS' && e.sourceType !== 'PROYEK_FASUM').reduce((s, e) => s + e.amount, 0))}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-primary-50/60 rounded-2xl border border-primary-200 flex justify-between items-center text-sm">
                  <span className="font-black text-primary-950">Surplus / Defisit Operasional Bersih</span>
                  <span className="font-mono font-black text-lg text-primary-700">
                    +{formatRupiah(totalIn - totalOut)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= SUBTAB 5: TRANSPARANSI PUBLIK ================= */}
      {activeSubTab === 'public_transparency' && (
        <div className="space-y-6 animate-in fade-in duration-150 max-w-4xl">
          <div className="p-6 bg-surface rounded-3xl border border-border shadow-card space-y-5 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <h3 className="font-black text-base text-ink flex items-center gap-2">
                  <Eye className="w-5 h-5 text-emerald-600" />
                  <span>Rekapitulasi Iuran & Transparansi Keuangan Terbuka</span>
                </h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  Laporan ringkas yang disinkronisasikan ke portal publik warga di{' '}
                  <a
                    href={publicTransparencyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 font-bold underline"
                  >
                    /transparency
                  </a>
                  .
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyPublicLink}
                  className="px-3.5 py-2 bg-surface hover:bg-canvas border border-border text-ink font-bold rounded-xl inline-flex items-center gap-1.5 shadow-xs active:scale-[0.98] transition-all"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-ink-muted" />}
                  <span>Salin Link</span>
                </button>
                <a
                  href={publicTransparencyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs inline-flex items-center gap-1.5 active:scale-[0.98] transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Buka Portal</span>
                </a>
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

              <div className="p-4 bg-rose-50/70 rounded-2xl border border-rose-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-rose-950 text-sm">PIUTANG IURAN BERJALAN</span>
                  <span className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-mono font-black">
                    BELUM LUNAS
                  </span>
                </div>
                <p className="font-mono font-black text-rose-800 text-xl tabular-nums">Rp 0</p>
                <p className="text-[11px] text-rose-700">Total akumulasi tagihan iuran unit yang belum dibayarkan oleh warga.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE / EDIT JURNAL ================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-border shadow-modal space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-sm text-ink flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-primary-600" />
                <span>{editingEntryId ? 'Edit Jurnal Transaksi' : 'Catat Mutasi Jurnal Kas'}</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-ink-muted hover:text-ink">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEntry} className="space-y-3">
              <div>
                <label className="font-bold text-ink block mb-1">Uraian Transaksi *</label>
                <input
                  type="text"
                  placeholder="Contoh: Penerimaan sumbangan warga / Pembelian semen"
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
                  <label className="font-bold text-ink block mb-1">Akun Kas / Bank *</label>
                  <select
                    value={formAccountId}
                    onChange={(e) => setFormAccountId(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Kategori Sumber</label>
                  <select
                    value={formSourceType}
                    onChange={(e) => setFormSourceType(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="IURAN_WARGA">Iuran Warga</option>
                    <option value="PENGELUARAN_OPS">Pengeluaran Operasional</option>
                    <option value="SANTUNAN_SOSIAL">Santunan Sosial</option>
                    <option value="PROYEK_FASUM">Proyek Fasum</option>
                    <option value="KASBON_PETUGAS">Kasbon Petugas</option>
                    <option value="MUTASI_KAS_INTERNAL">Mutasi Kas Internal</option>
                    <option value="MANUAL_JOURNAL">Jurnal Manual</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
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
                <div>
                  <label className="font-bold text-ink block mb-1">No. Referensi Bukti</label>
                  <input
                    type="text"
                    placeholder="Contoh: REF-1092"
                    value={formReferenceNo}
                    onChange={(e) => setFormReferenceNo(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink"
                  />
                </div>
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
                  disabled={savingEntry}
                  className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-xs disabled:opacity-50 active:scale-[0.98] transition-all"
                >
                  {savingEntry ? 'Menyimpan...' : 'Simpan Jurnal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: TRANSFER DANA ANTAR KAS ================= */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-border shadow-modal space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-sm text-ink flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-indigo-600" />
                <span>Transfer Dana Antar Rekening Kas</span>
              </h3>
              <button onClick={() => setShowTransferModal(false)} className="text-ink-muted hover:text-ink">
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteTransfer} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-ink block mb-1">Rekening Asal *</label>
                  <select
                    value={transferFrom}
                    onChange={(e) => setTransferFrom(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({formatRupiah(a.balance)})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Rekening Tujuan *</label>
                  <select
                    value={transferTo}
                    onChange={(e) => setTransferTo(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({formatRupiah(a.balance)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Nominal Transfer (Rp) *</label>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono font-bold text-ink"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Keterangan / Keperluan Transfer *</label>
                <input
                  type="text"
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas active:scale-[0.98] transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isTransferring}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isTransferring ? 'Memproses...' : 'Proses Transfer Kas'}
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
                <h3 className="font-black text-sm text-ink">
                  {selectedVoucher.direction === 'IN'
                    ? 'Bukti Kas Masuk (BKM Resmi)'
                    : 'Bukti Kas Keluar (BKK Resmi)'}
                </h3>
                <p className="text-[11px] text-ink-muted">
                  No. Ref: {selectedVoucher.sourceId || selectedVoucher.id}
                </p>
              </div>
              <button onClick={() => setSelectedVoucher(null)} className="text-ink-muted hover:text-ink">
                ✕
              </button>
            </div>

            <div className="p-4 bg-canvas rounded-2xl border border-border space-y-2.5">
              <div className="flex justify-between">
                <span className="text-ink-muted">Uraian Transaksi:</span>
                <span className="font-black text-ink">{selectedVoucher.description}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Akun Pembukuan:</span>
                <span className="font-bold text-ink">
                  {selectedVoucher.accountId === 'acc-cash'
                    ? 'Kas Tunai Bendahara'
                    : 'Rekening Bank BCA Utama'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Arah Transaksi:</span>
                <span
                  className={`font-black ${
                    selectedVoucher.direction === 'IN' ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {selectedVoucher.direction === 'IN'
                    ? '+ PENERIMAAN KAS (DEBIT)'
                    : '- PENGELUARAN KAS (KREDIT)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Tanggal Jurnal:</span>
                <span className="font-mono text-ink">{selectedVoucher.entryDate}</span>
              </div>
              <div className="pt-2 border-t border-border flex justify-between items-center">
                <span className="font-bold text-ink">Nominal Mutasi:</span>
                <span
                  className={`font-black text-base font-mono ${
                    selectedVoucher.direction === 'IN' ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {selectedVoucher.direction === 'IN' ? '+' : '-'} {formatRupiah(selectedVoucher.amount)}
                </span>
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
                Mutasi kas sebesar <strong>{formatRupiah(entryToDelete.amount)}</strong> akan dibatalkan/dihapus
                dari buku kas. Tindakan ini tercatat di Jejak Audit.
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
                className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas active:scale-[0.98] transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs active:scale-[0.98] transition-all"
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
