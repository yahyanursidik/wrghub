import React, { useState, useEffect, useMemo } from 'react';
import {
  Repeat,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Settings,
  Calendar,
  Wallet,
  Play,
  Pause,
  Edit3,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  Zap,
  DollarSign,
  TrendingDown,
  Info,
  RefreshCw,
  Building,
  CreditCard,
  Layers,
  FileCheck
} from 'lucide-react';
import { formatRupiah } from '../../lib/format';

export interface RecurringExpenseItem {
  id: string;
  title: string;
  amount: number;
  categoryId: string;
  categoryName: string;
  accountId: string;
  accountName: string;
  executionDay: number; // 1 - 31 (tanggal eksekusi rutin per bulan)
  vendor: string;
  description: string;
  isActive: boolean;
  lastProcessedMonth?: string; // Format 'YYYY-MM' e.g. '2026-08'
}

const DEFAULT_RECURRING_EXPENSES: RecurringExpenseItem[] = [
  {
    id: 'rec-01',
    title: 'Honor Satpam Piket 24 Jam (Pa Adri Harry)',
    amount: 4500000,
    categoryId: 'cat-satpam',
    categoryName: 'Keamanan & Satpam',
    accountId: 'acc-main',
    accountName: 'BCA Utama - Operasional',
    executionDay: 25,
    vendor: 'Pa Adri Harry (Satpam Mandiri)',
    description: 'Honor bulanan penjagaan gerbang utama & patroli lingkungan 24 jam',
    isActive: true,
    lastProcessedMonth: '2026-08',
  },
  {
    id: 'rec-02',
    title: 'Iuran Retribusi Kebersihan & Pengangkutan Sampah',
    amount: 1200000,
    categoryId: 'cat-kebersihan',
    categoryName: 'Kebersihan & Sanitasi',
    accountId: 'acc-main',
    accountName: 'BCA Utama - Operasional',
    executionDay: 5,
    vendor: 'Dinas LH / Armada Sampah Swasta',
    description: 'Biaya pengangkutan sampah rumah tangga komplek 3x seminggu',
    isActive: true,
    lastProcessedMonth: '2026-08',
  },
  {
    id: 'rec-03',
    title: 'Tagihan Listrik PLN (PJU Lingkungan & Pompa Air Fasum)',
    amount: 850000,
    categoryId: 'cat-utilitas',
    categoryName: 'Listrik & Utilitas',
    accountId: 'acc-main',
    accountName: 'BCA Utama - Operasional',
    executionDay: 10,
    vendor: 'PT PLN (Persero)',
    description: 'Listrik penerangan jalan umum 14 titik dan pompa air booster fasum',
    isActive: true,
    lastProcessedMonth: '2026-08',
  },
  {
    id: 'rec-04',
    title: 'Pemeliharaan Taman, Potong Rumput & Drainase/Got',
    amount: 600000,
    categoryId: 'cat-pemeliharaan',
    categoryName: 'Pemeliharaan Lingkungan',
    accountId: 'acc-main',
    accountName: 'BCA Utama - Operasional',
    executionDay: 15,
    vendor: 'Pak Slamet (Tukang Kebun)',
    description: 'Perawatan rutin taman gerbang, pemotongan rumput fasum & kuras saluran',
    isActive: true,
    lastProcessedMonth: '2026-08',
  },
  {
    id: 'rec-05',
    title: 'Operasional Pos Satpam & Kuota Internet CCTV/Gate',
    amount: 250000,
    categoryId: 'cat-operasional',
    categoryName: 'Operasional Kantor Pos',
    accountId: 'acc-main',
    accountName: 'BCA Utama - Operasional',
    executionDay: 1,
    vendor: 'Telkomsel / Indihome Pos',
    description: 'Paket data sim card modem CCTV cloud gerbang, ATK pos, log book',
    isActive: true,
    lastProcessedMonth: '2026-08',
  },
];

const LOCAL_STORAGE_KEY = 'wargahub_recurring_expenses_config_v1';

interface RecurringExpensesManagerProps {
  accounts?: any[];
  currentBalance: number;
  onExpensesProcessed: (newExpenses: any[], newBalance: number) => void;
  existingExpenseTitles?: string[];
}

export const RecurringExpensesManager: React.FC<RecurringExpensesManagerProps> = ({
  accounts = [],
  currentBalance,
  onExpensesProcessed,
  existingExpenseTitles = [],
}) => {
  const [recurringItems, setRecurringItems] = useState<RecurringExpenseItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((it: any) => {
              if (it.title?.includes('Suparman') || it.vendor?.includes('Suparman')) {
                return {
                  ...it,
                  title: 'Honor Satpam Piket 24 Jam (Pa Adri Harry)',
                  vendor: 'Pa Adri Harry (Satpam Mandiri)',
                };
              }
              return it;
            });
          }
        }
      } catch (e) {
        console.warn('Failed to parse recurring expenses from localStorage', e);
      }
    }
    return DEFAULT_RECURRING_EXPENSES;
  });

  // Current selected month for execution (default to current month YYYY-MM)
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  });

  // Available month options (current year)
  const monthOptions = [
    { value: '2026-01', label: 'Januari 2026' },
    { value: '2026-02', label: 'Februari 2026' },
    { value: '2026-03', label: 'Maret 2026' },
    { value: '2026-04', label: 'April 2026' },
    { value: '2026-05', label: 'Mei 2026' },
    { value: '2026-06', label: 'Juni 2026' },
    { value: '2026-07', label: 'Juli 2026' },
    { value: '2026-08', label: 'Agustus 2026' },
    { value: '2026-09', label: 'September 2026 (Bulan Berjalan)' },
    { value: '2026-10', label: 'Oktober 2026' },
    { value: '2026-11', label: 'November 2026' },
    { value: '2026-12', label: 'Desember 2026' },
  ];

  // Modals state
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<RecurringExpenseItem | null>(null);

  // Process batch modal state
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processResult, setProcessResult] = useState<string | null>(null);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formAmount, setFormAmount] = useState<number | string>(1000000);
  const [formCategory, setFormCategory] = useState('Keamanan & Satpam');
  const [formExecutionDay, setFormExecutionDay] = useState<number>(25);
  const [formAccountId, setFormAccountId] = useState('acc-main');
  const [formVendor, setFormVendor] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  // Sync to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(recurringItems));
      } catch (e) {
        console.warn('Failed to save recurring expenses', e);
      }
    }
  }, [recurringItems]);

  // Calculations
  const activeItems = useMemo(() => recurringItems.filter((i) => i.isActive), [recurringItems]);
  const totalMonthlyRoutine = useMemo(
    () => activeItems.reduce((acc, curr) => acc + curr.amount, 0),
    [activeItems]
  );

  // Proyeksi ketahanan kas (berapa bulan bertahan jika tanpa iuran masuk)
  const cashRunwayMonths = useMemo(() => {
    if (totalMonthlyRoutine <= 0) return 99;
    return (currentBalance / totalMonthlyRoutine).toFixed(1);
  }, [currentBalance, totalMonthlyRoutine]);

  // Check which items are already processed for selectedMonth
  const isItemProcessed = (item: RecurringExpenseItem) => {
    if (item.lastProcessedMonth === selectedMonth) return true;
    // Check if title includes month or is already recorded
    const monthKey = selectedMonth;
    return existingExpenseTitles.some(
      (t) => t.toLowerCase().includes(item.title.toLowerCase()) && t.includes(monthKey)
    );
  };

  const pendingItemsForMonth = useMemo(() => {
    return recurringItems.filter((i) => i.isActive && !isItemProcessed(i));
  }, [recurringItems, selectedMonth, existingExpenseTitles]);

  const processedItemsForMonth = useMemo(() => {
    return recurringItems.filter((i) => isItemProcessed(i));
  }, [recurringItems, selectedMonth, existingExpenseTitles]);

  // Open Add Item Modal
  const handleOpenAdd = () => {
    setEditingItemId(null);
    setFormTitle('');
    setFormAmount(1000000);
    setFormCategory('Keamanan & Satpam');
    setFormExecutionDay(25);
    setFormAccountId('acc-main');
    setFormVendor('');
    setFormDescription('');
    setFormIsActive(true);
    setShowItemModal(true);
  };

  // Open Edit Item Modal
  const handleOpenEdit = (item: RecurringExpenseItem) => {
    setEditingItemId(item.id);
    setFormTitle(item.title);
    setFormAmount(item.amount);
    setFormCategory(item.categoryName);
    setFormExecutionDay(item.executionDay);
    setFormAccountId(item.accountId);
    setFormVendor(item.vendor);
    setFormDescription(item.description);
    setFormIsActive(item.isActive);
    setShowItemModal(true);
  };

  // Save Add / Edit
  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('Nama pos pengeluaran rutin wajib diisi.');
      return;
    }
    const numAmount = Number(formAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Nominal harus lebih dari 0.');
      return;
    }

    const accountObj = accounts.find((a) => a.id === formAccountId);
    const accountName = accountObj ? accountObj.name : 'BCA Utama - Operasional';

    if (editingItemId) {
      setRecurringItems((prev) =>
        prev.map((item) =>
          item.id === editingItemId
            ? {
                ...item,
                title: formTitle.trim(),
                amount: numAmount,
                categoryName: formCategory,
                executionDay: Number(formExecutionDay),
                accountId: formAccountId,
                accountName,
                vendor: formVendor.trim(),
                description: formDescription.trim(),
                isActive: formIsActive,
              }
            : item
        )
      );
      showToast(`Pos "${formTitle}" berhasil diperbarui.`);
    } else {
      const newItem: RecurringExpenseItem = {
        id: `rec-${Date.now()}`,
        title: formTitle.trim(),
        amount: numAmount,
        categoryId: `cat-${Date.now()}`,
        categoryName: formCategory,
        accountId: formAccountId,
        accountName,
        executionDay: Number(formExecutionDay),
        vendor: formVendor.trim(),
        description: formDescription.trim(),
        isActive: formIsActive,
      };
      setRecurringItems((prev) => [...prev, newItem]);
      showToast(`Pos rutin baru "${formTitle}" berhasil ditambahkan.`);
    }
    setShowItemModal(false);
  };

  // Toggle Pause / Active
  const handleToggleActive = (id: string) => {
    setRecurringItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextState = !item.isActive;
          showToast(`Pos "${item.title}" sekarang ${nextState ? 'Aktif' : 'Dijeda'}.`);
          return { ...item, isActive: nextState };
        }
        return item;
      })
    );
  };

  // Delete Item
  const handleDeleteItem = () => {
    if (!itemToDelete) return;
    setRecurringItems((prev) => prev.filter((i) => i.id !== itemToDelete.id));
    showToast(`Pos "${itemToDelete.title}" telah dihapus.`);
    setItemToDelete(null);
  };

  // Open Batch Process Modal
  const handleOpenBatchProcess = () => {
    if (pendingItemsForMonth.length === 0) {
      showToast('Semua pos rutin aktif sudah dibukukan untuk bulan ini!');
      return;
    }
    setSelectedItemIds(pendingItemsForMonth.map((i) => i.id));
    setProcessResult(null);
    setShowBatchModal(true);
  };

  // Quick Process Single Item
  const handleProcessSingleItem = (item: RecurringExpenseItem) => {
    setSelectedItemIds([item.id]);
    setProcessResult(null);
    setShowBatchModal(true);
  };

  // Toggle selection inside batch modal
  const handleToggleSelectItem = (id: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Total selected amount in batch modal
  const batchTotalAmount = useMemo(() => {
    return recurringItems
      .filter((i) => selectedItemIds.includes(i.id))
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [recurringItems, selectedItemIds]);

  // Balance after batch deduction
  const balanceAfterBatch = currentBalance - batchTotalAmount;

  // Execute Batch Processing
  const handleExecuteBatch = async () => {
    if (selectedItemIds.length === 0) {
      alert('Pilih setidaknya 1 pos pengeluaran untuk dibukukan.');
      return;
    }

    const itemsToProcess = recurringItems.filter((i) => selectedItemIds.includes(i.id));

    setIsProcessing(true);
    setProcessResult(null);

    try {
      const response = await fetch('/api/expenses/recurring/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: selectedMonth,
          items: itemsToProcess.map((item) => ({
            id: item.id,
            title: item.title,
            amount: item.amount,
            categoryId: item.categoryId || 'cat-operasional',
            categoryName: item.categoryName,
            accountId: item.accountId || 'acc-main',
            description: item.description,
            executionDay: item.executionDay,
            vendor: item.vendor,
          })),
        }),
      });

      const resJson = await response.json();

      if (response.ok && resJson.success) {
        // Mark items as processed in local state
        setRecurringItems((prev) =>
          prev.map((item) =>
            selectedItemIds.includes(item.id)
              ? { ...item, lastProcessedMonth: selectedMonth }
              : item
          )
        );

        // Notify parent to refresh expenses and balance
        const newBalance = resJson.data.newBalance ?? balanceAfterBatch;
        const newExpenseEntries = resJson.data.items.map((it: any) => ({
          id: it.expenseId,
          title: it.title,
          amount: it.amount,
          expenseDate: it.expenseDate,
          categoryName: itemsToProcess.find((x) => x.id === it.id)?.categoryName || 'Rutin Bulanan',
          vendor: itemsToProcess.find((x) => x.id === it.id)?.vendor,
          description: `Auto-Debit Rutin Periode ${selectedMonth}`,
          voucherNo: `BKK-REC-${selectedMonth.replace('-', '')}`,
          status: 'APPROVED',
        }));

        onExpensesProcessed(newExpenseEntries, newBalance);

        showToast(
          `Sukses! ${itemsToProcess.length} pos rutin bulan ${selectedMonth} telah dibukukan. Saldo kas berkurang ${formatRupiah(batchTotalAmount)}.`
        );

        setShowBatchModal(false);
      } else {
        alert(resJson.error || 'Terjadi kesalahan saat membukukan pengeluaran rutin.');
      }
    } catch (err: any) {
      console.error(err);
      alert('Gagal menghubungi server untuk memproses pengeluaran rutin.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-700 text-white rounded-2xl shadow-xl font-bold text-xs animate-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Analytics KPI Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: Beban Rutin Per Bulan */}
        <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase font-bold text-ink-muted tracking-wider">
              Total Beban Rutin Bulanan
            </span>
            <span className="p-1 rounded-lg bg-rose-50 text-rose-600">
              <Repeat className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-2xl font-black font-mono text-rose-700 mt-1 tabular-nums">
            {formatRupiah(totalMonthlyRoutine)}
          </p>
          <span className="text-[10px] text-ink-muted font-bold font-mono mt-0.5 block">
            {activeItems.length} POS AKTIF (DARI TOTAL {recurringItems.length} POS)
          </span>
        </div>

        {/* KPI 2: Saldo Kas Rekening BCA */}
        <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase font-bold text-ink-muted tracking-wider">
              Saldo Kas Tersedia (BCA)
            </span>
            <span className="p-1 rounded-lg bg-blue-50 text-blue-600">
              <Wallet className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-2xl font-black font-mono text-blue-700 mt-1 tabular-nums">
            {formatRupiah(currentBalance)}
          </p>
          <span className="text-[10px] text-emerald-600 font-bold font-mono mt-0.5 block">
            ✓ SUMBER DANA RESMI OPERASIONAL
          </span>
        </div>

        {/* KPI 3: Proyeksi Ketahanan Kas */}
        <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase font-bold text-ink-muted tracking-wider">
              Proyeksi Ketahanan Saldo
            </span>
            <span className="p-1 rounded-lg bg-amber-50 text-amber-600">
              <ShieldCheck className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-2xl font-black font-mono text-amber-700 mt-1 tabular-nums">
            ~{cashRunwayMonths} Bulan
          </p>
          <span className="text-[10px] text-ink-muted font-bold font-mono mt-0.5 block">
            KETAHANAN BEBAN TANPA IURAN BARU
          </span>
        </div>

        {/* KPI 4: Status Bulan Berjalan */}
        <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase font-bold text-ink-muted tracking-wider">
              Status Periode Terpilih
            </span>
            <span className="p-1 rounded-lg bg-emerald-50 text-emerald-600">
              <Calendar className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-mono text-emerald-700 tabular-nums">
              {processedItemsForMonth.length}
            </span>
            <span className="text-xs font-bold text-ink-muted">/ {recurringItems.length} Pos</span>
          </div>
          <span className="text-[10px] text-amber-600 font-bold font-mono mt-0.5 block">
            {pendingItemsForMonth.length} POS SIAP DIBUKUKAN
          </span>
        </div>
      </div>

      {/* Action Bar & Month Selector */}
      <div className="p-4 bg-surface rounded-3xl border border-border shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
          <div>
            <label className="text-[11px] font-bold text-ink-muted block mb-1">
              Periode Pembukuan Bulanan:
            </label>
            <div className="flex items-center gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3.5 py-2 bg-canvas border border-border rounded-xl text-xs font-black text-ink shadow-2xs focus:outline-hidden"
              >
                {monthOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <span
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black font-mono ${
                  pendingItemsForMonth.length === 0
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {pendingItemsForMonth.length === 0
                  ? '✓ SEMUA SUDAH DIBUKUKAN'
                  : `${pendingItemsForMonth.length} POS MENUNGGU`}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-3.5 py-2.5 bg-surface hover:bg-canvas border border-border text-ink rounded-xl font-bold text-xs inline-flex items-center gap-1.5 shadow-xs active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4 text-rose-600" />
            <span>Tambah Pos Rutin</span>
          </button>

          <button
            type="button"
            onClick={handleOpenBatchProcess}
            disabled={pendingItemsForMonth.length === 0}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-black text-xs inline-flex items-center gap-2 shadow-xs active:scale-[0.98] transition-all"
          >
            <Zap className="w-4 h-4 text-yellow-300" />
            <span>⚡ Eksekusi & Potong Saldo ({pendingItemsForMonth.length} Pos)</span>
          </button>
        </div>
      </div>

      {/* Recurring Expenses Table */}
      <div className="bg-surface rounded-3xl border border-border shadow-card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Repeat className="w-4 h-4 text-rose-600" />
            <h3 className="font-black text-sm text-ink">
              Daftar Pos Pengeluaran Rutin Komplek (Auto-Debit Saldo)
            </h3>
          </div>
          <span className="text-[11px] text-ink-muted">
            Diproses setiap bulan otomatis memotong saldo rekening kas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-canvas/60 text-ink-muted font-mono uppercase text-[10px]">
                <th className="py-3 px-4 w-12 text-center">Tgl</th>
                <th className="py-3 px-4">Nama Pos Pengeluaran & Vendor</th>
                <th className="py-3 px-4">Kategori Pos</th>
                <th className="py-3 px-4">Rekening Sumber</th>
                <th className="py-3 px-4 text-right">Nominal / Bulan</th>
                <th className="py-3 px-4 text-center">Status {selectedMonth}</th>
                <th className="py-3 px-4 text-center">Auto-Debit</th>
                <th className="py-3 px-4 text-center w-28">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recurringItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-ink-muted">
                    <Repeat className="w-8 h-8 mx-auto text-ink-muted/40 mb-2" />
                    <p className="font-bold">Belum ada pos pengeluaran rutin yang dikonfigurasi.</p>
                    <p className="text-[11px] mt-0.5">
                      Klik "Tambah Pos Rutin" untuk membuat jadwal pengeluaran bulanan.
                    </p>
                  </td>
                </tr>
              ) : (
                recurringItems.map((item) => {
                  const isProcessed = isItemProcessed(item);
                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-canvas/50 transition-colors ${
                        !item.isActive ? 'opacity-55 bg-slate-50/50' : ''
                      }`}
                    >
                      {/* Tanggal Eksekusi */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex flex-col items-center justify-center w-8 h-8 rounded-lg bg-surface border border-border shadow-2xs">
                          <span className="text-[8px] font-mono text-ink-muted leading-none">TGL</span>
                          <span className="font-mono font-black text-ink text-xs leading-none mt-0.5">
                            {item.executionDay}
                          </span>
                        </div>
                      </td>

                      {/* Nama & Vendor */}
                      <td className="py-3.5 px-4">
                        <div className="font-black text-ink text-xs flex items-center gap-1.5">
                          <span>{item.title}</span>
                          {!item.isActive && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-slate-200 text-slate-700 font-bold">
                              DIJEDA
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-ink-muted mt-0.5 flex items-center gap-2">
                          <span>🏢 {item.vendor || 'Pengadaan Mandiri'}</span>
                          {item.description && (
                            <span className="text-ink-muted/70 truncate max-w-xs">
                              • {item.description}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Kategori */}
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-canvas border border-border font-bold text-[10px] text-ink">
                          {item.categoryName}
                        </span>
                      </td>

                      {/* Rekening */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-ink-muted">
                        <div className="flex items-center gap-1">
                          <CreditCard className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="truncate max-w-[120px]">{item.accountName}</span>
                        </div>
                      </td>

                      {/* Nominal */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-mono font-black text-rose-700 text-xs tabular-nums block">
                          {formatRupiah(item.amount)}
                        </span>
                        <span className="text-[9px] font-mono text-ink-muted">/ BULAN</span>
                      </td>

                      {/* Status Bulan Berjalan */}
                      <td className="py-3.5 px-4 text-center">
                        {isProcessed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px] border border-emerald-200 shadow-2xs">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Sudah Dibukukan</span>
                          </span>
                        ) : !item.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px] border border-slate-200">
                            <Pause className="w-3 h-3" />
                            <span>Jeda (Nonaktif)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 font-black text-[10px] border border-amber-200 shadow-2xs">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Menunggu Eksekusi</span>
                          </span>
                        )}
                      </td>

                      {/* Toggle Saklar Auto-Debit */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(item.id)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                            item.isActive ? 'bg-rose-600' : 'bg-slate-300'
                          }`}
                          title={item.isActive ? 'Klik untuk jeda pengeluaran ini' : 'Klik untuk aktifkan'}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                              item.isActive ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </td>

                      {/* Tindakan */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {!isProcessed && item.isActive && (
                            <button
                              type="button"
                              onClick={() => handleProcessSingleItem(item)}
                              title="Eksekusi pos ini sekarang"
                              className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 active:scale-[0.98] transition-all border border-rose-200"
                            >
                              <Zap className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            title="Edit konfigurasi pos ini"
                            className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-canvas active:scale-[0.98] transition-all"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setItemToDelete(item)}
                            title="Hapus pos rutin ini"
                            className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 active:scale-[0.98] transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Card: Mekanisme Auto-Debit Kas */}
      <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200/80 flex items-start gap-3 text-xs">
        <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-blue-950">
            Cara Kerja Otomasi Pemotongan Saldo Kas Rutin
          </h4>
          <p className="text-blue-900 leading-relaxed text-[11px]">
            Setiap pos rutin yang dibukukan akan otomatis mencatatkan entri ke daftar <strong>Pengeluaran Kas</strong>,
            membuat jurnal buku besar keluar (<code>ledger_entries OUT</code>), dan <strong>langsung memotong saldo rekening kas utama (BCA Utama)</strong> secara atomik di database. Pos yang telah dibukukan tidak akan tertagih ganda pada periode bulan yang sama.
          </p>
        </div>
      </div>

      {/* ================= MODAL 1: TAMBAH / EDIT POS PENGELUARAN RUTIN ================= */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-border shadow-modal space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-sm text-ink flex items-center gap-2">
                <Repeat className="w-4 h-4 text-rose-600" />
                <span>{editingItemId ? 'Edit Pengeluaran Rutin' : 'Tambah Pos Pengeluaran Rutin'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowItemModal(false)}
                className="text-ink-muted hover:text-ink"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-3">
              <div>
                <label className="font-bold text-ink block mb-1">Nama Pos Pengeluaran *</label>
                <input
                  type="text"
                  placeholder="Contoh: Honor Satpam Piket 24 Jam"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-ink block mb-1">Kategori Pos</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="Keamanan & Satpam">Keamanan & Satpam</option>
                    <option value="Kebersihan & Sanitasi">Kebersihan & Sanitasi</option>
                    <option value="Listrik & Utilitas">Listrik & Utilitas</option>
                    <option value="Pemeliharaan Lingkungan">Pemeliharaan Lingkungan</option>
                    <option value="Operasional Kantor Pos">Operasional Kantor Pos</option>
                    <option value="Santunan Sosial">Santunan Sosial</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-ink block mb-1">Nominal per Bulan (Rp) *</label>
                  <input
                    type="number"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    required
                    min={1000}
                    step={1000}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono font-bold text-ink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-ink block mb-1">Tgl Eksekusi / Jatuh Tempo</label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-ink-muted">Tiap Tgl</span>
                    <input
                      type="number"
                      value={formExecutionDay}
                      onChange={(e) =>
                        setFormExecutionDay(Math.min(31, Math.max(1, Number(e.target.value))))
                      }
                      min={1}
                      max={31}
                      required
                      className="w-20 p-2.5 bg-canvas border border-border rounded-xl font-mono font-bold text-ink text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-ink block mb-1">Penerima Dana / Vendor</label>
                  <input
                    type="text"
                    placeholder="Contoh: Pa Adri Harry / PLN"
                    value={formVendor}
                    onChange={(e) => setFormVendor(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Rekening Sumber Pembayaran</label>
                <select
                  value={formAccountId}
                  onChange={(e) => setFormAccountId(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink font-bold"
                >
                  <option value="acc-main">BCA Utama - Operasional (acc-main)</option>
                  <option value="acc-petty">Kas Tunai / Petty Cash (acc-petty)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Keterangan / Rincian Pos</label>
                <input
                  type="text"
                  placeholder="Keterangan transaksi atau keperluan pos rutin ini"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <div className="pt-2 flex items-center justify-between p-3 bg-canvas rounded-2xl border border-border">
                <div>
                  <span className="font-bold text-ink block">Status Pos Rutin</span>
                  <span className="text-[11px] text-ink-muted">
                    Aktifkan untuk disertakan dalam auto-debit bulanan
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormIsActive(!formIsActive)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    formIsActive ? 'bg-rose-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      formIsActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas active:scale-[0.98] transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-xs active:scale-[0.98] transition-all"
                >
                  {editingItemId ? 'Simpan Perubahan' : 'Tambah Pos Rutin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: KONFIRMASI EKSEKUSI BATCH AUTO-DEBIT ================= */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-lg w-full p-6 border border-border shadow-modal space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-ink">
                    Bukukan & Potong Saldo Pengeluaran Rutin
                  </h3>
                  <span className="text-[11px] text-ink-muted">
                    Periode Bulan: <strong>{selectedMonth}</strong>
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBatchModal(false)}
                disabled={isProcessing}
                className="text-ink-muted hover:text-ink"
              >
                ✕
              </button>
            </div>

            {/* Simulation Card */}
            <div className="p-4 bg-canvas rounded-2xl border border-border space-y-3">
              <span className="text-[10px] font-mono uppercase font-bold text-ink-muted tracking-wider block">
                Simulasi Pemotongan Saldo Kas (BCA Utama)
              </span>

              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between items-center text-ink-muted">
                  <span>Saldo Kas Saat Ini:</span>
                  <span className="font-bold text-ink">{formatRupiah(currentBalance)}</span>
                </div>

                <div className="flex justify-between items-center text-rose-700 font-bold">
                  <span>Beban Rutin yang Dipotong ({selectedItemIds.length} pos):</span>
                  <span>- {formatRupiah(batchTotalAmount)}</span>
                </div>

                <div className="border-t border-border pt-1.5 flex justify-between items-center text-sm font-black">
                  <span className="text-ink">Sisa Saldo Kas Baru:</span>
                  <span
                    className={`tabular-nums ${
                      balanceAfterBatch >= 0 ? 'text-emerald-700' : 'text-red-700'
                    }`}
                  >
                    {formatRupiah(balanceAfterBatch)}
                  </span>
                </div>
              </div>

              {balanceAfterBatch < 0 && (
                <div className="p-2.5 bg-red-50 text-red-800 rounded-xl border border-red-200 flex items-center gap-2 text-[11px]">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>
                    Peringatan: Pemotongan ini menyebabkan saldo kas bernilai minus!
                  </span>
                </div>
              )}
            </div>

            {/* Checklist of Items to Process */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-ink text-[11px]">
                  Pilih Pos Rutin yang Akan Dibukukan:
                </span>
                <span className="text-[10px] font-mono text-ink-muted">
                  {selectedItemIds.length} dari {recurringItems.filter((i) => !isItemProcessed(i)).length} pos terpilih
                </span>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1.5 border border-border rounded-2xl p-2 bg-canvas/40">
                {recurringItems
                  .filter((i) => i.isActive && !isItemProcessed(i))
                  .map((item) => {
                    const isChecked = selectedItemIds.includes(item.id);
                    return (
                      <label
                        key={item.id}
                        className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors ${
                          isChecked ? 'bg-surface border border-rose-200 shadow-2xs' : 'hover:bg-surface/50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleSelectItem(item.id)}
                            className="rounded border-border text-rose-600 focus:ring-rose-500 w-4 h-4"
                          />
                          <div>
                            <span className="font-bold text-ink block">{item.title}</span>
                            <span className="text-[10px] text-ink-muted">
                              Tgl {item.executionDay} • {item.vendor || 'Pengadaan'}
                            </span>
                          </div>
                        </div>
                        <span className="font-mono font-black text-rose-700 text-xs tabular-nums">
                          {formatRupiah(item.amount)}
                        </span>
                      </label>
                    );
                  })}
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setShowBatchModal(false)}
                disabled={isProcessing}
                className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas active:scale-[0.98] transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteBatch}
                disabled={isProcessing || selectedItemIds.length === 0}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black shadow-xs active:scale-[0.98] transition-all disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Memproses & Memotong Saldo...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-yellow-300" />
                    <span>Konfirmasi & Bukukan ({formatRupiah(batchTotalAmount)})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: HAPUS POS RUTIN ================= */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-sm w-full p-6 border border-red-200 shadow-modal space-y-4 text-xs">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-black text-base text-ink">Hapus Pos Pengeluaran Rutin?</h3>
              <p className="text-ink-muted">
                Pos rutin <strong>"{itemToDelete.title}"</strong> ({formatRupiah(itemToDelete.amount)}/bln) akan dihapus dari daftar pengeluaran otomatis.
              </p>
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
                onClick={handleDeleteItem}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs active:scale-[0.98] transition-all"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
