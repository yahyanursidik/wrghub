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
  ShieldCheck,
  Check,
  X,
  Zap,
  CreditCard,
  RefreshCw,
  Info,
  Sliders,
  CheckSquare,
  Square,
  ArrowRight,
  TrendingDown
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
    title: 'Honor Petugas Jaga & Keamanan 24 Jam (Pa Adri Harry)',
    amount: 1800000,
    categoryId: 'cat-keamanan',
    categoryName: 'Keamanan & Satpam',
    accountId: 'acc-main',
    accountName: 'BCA Utama - Operasional',
    executionDay: 25,
    vendor: 'Pa Adri Harry (Petugas Jaga)',
    description: 'Honor bulanan penjagaan gerbang utama & kontrol keamanan 14 kavling',
    isActive: true,
  },
  {
    id: 'rec-02',
    title: 'Iuran Retribusi Kebersihan & Pengangkutan Sampah',
    amount: 600000,
    categoryId: 'cat-kebersihan',
    categoryName: 'Kebersihan & Sanitasi',
    accountId: 'acc-main',
    accountName: 'BCA Utama - Operasional',
    executionDay: 5,
    vendor: 'Armada Sampah / Petugas Lingkungan',
    description: 'Biaya pengangkutan sampah rumah tangga komplek 3x seminggu',
    isActive: true,
  },
  {
    id: 'rec-03',
    title: 'Tagihan Listrik PLN (PJU Lingkungan & Pompa Air Fasum)',
    amount: 400000,
    categoryId: 'cat-listrik',
    categoryName: 'Listrik & Utilitas',
    accountId: 'acc-main',
    accountName: 'BCA Utama - Operasional',
    executionDay: 10,
    vendor: 'PT PLN (Persero)',
    description: 'Penerangan jalan umum 14 titik & pompa air otomatis fasum',
    isActive: true,
  },
  {
    id: 'rec-04',
    title: 'Pemeliharaan Taman, Potong Rumput & Drainase/Got',
    amount: 250000,
    categoryId: 'cat-pemeliharaan',
    categoryName: 'Pemeliharaan Lingkungan',
    accountId: 'acc-main',
    accountName: 'BCA Utama - Operasional',
    executionDay: 15,
    vendor: 'Pak Slamet / Tukang Taman',
    description: 'Perawatan taman fasum, pemotongan rumput jalan & pembersihan selokan',
    isActive: true,
  },
  {
    id: 'rec-05',
    title: 'Operasional Pos Satpam & Kuota Internet CCTV/Gate',
    amount: 100000,
    categoryId: 'cat-pemeliharaan',
    categoryName: 'Operasional Pos Satpam',
    accountId: 'acc-main',
    accountName: 'BCA Utama - Operasional',
    executionDay: 1,
    vendor: 'Telkomsel / Indihome Pos',
    description: 'Paket data CCTV online gerbang, buku mutasi & ATK pos',
    isActive: true,
  },
];

const LOCAL_STORAGE_KEY = 'wargahub_recurring_expenses_config_v2';

const ALL_2026_MONTHS = [
  { value: '2026-01', label: 'Januari 2026' },
  { value: '2026-02', label: 'Februari 2026' },
  { value: '2026-03', label: 'Maret 2026' },
  { value: '2026-04', label: 'April 2026' },
  { value: '2026-05', label: 'Mei 2026' },
  { value: '2026-06', label: 'Juni 2026' },
  { value: '2026-07', label: 'Juli 2026' },
  { value: '2026-08', label: 'Agustus 2026' },
  { value: '2026-09', label: 'September 2026 (Bulan Berjalan)' },
];

interface RecurringExpensesManagerProps {
  accounts?: any[];
  currentBalance: number;
  initialConfig?: any[];
  onExpensesProcessed: (newExpenses: any[], newBalance: number) => void;
  existingExpenseTitles?: string[];
}

export const RecurringExpensesManager: React.FC<RecurringExpensesManagerProps> = ({
  accounts = [],
  currentBalance,
  initialConfig,
  onExpensesProcessed,
  existingExpenseTitles = [],
}) => {
  // Master Recurring Items State
  const [recurringItems, setRecurringItems] = useState<RecurringExpenseItem[]>(() => {
    if (initialConfig && Array.isArray(initialConfig) && initialConfig.length > 0) {
      return initialConfig.map((it: any) => ({
        ...it,
        accountName: it.accountName || 'BCA Utama - Operasional',
      }));
    }
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.warn(e);
      }
    }
    return DEFAULT_RECURRING_EXPENSES;
  });

  // Current selected single month
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-09');

  // Modals state
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<RecurringExpenseItem | null>(null);

  // Multi-Month Auto-Generate Modal State
  const [showMultiMonthModal, setShowMultiMonthModal] = useState(false);
  const [selectedMonthsForGen, setSelectedMonthsForGen] = useState<string[]>(
    ALL_2026_MONTHS.map((m) => m.value)
  );
  const [isGenerating, setIsGenerating] = useState(false);

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

  // Persist to DB and localStorage
  const persistConfig = async (items: RecurringExpenseItem[]) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
      } catch (e) {}
    }
    try {
      await fetch('/api/expenses/recurring/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
    } catch (e) {
      console.warn('Failed to persist config to server', e);
    }
  };

  // Calculations
  const activeItems = useMemo(() => recurringItems.filter((i) => i.isActive), [recurringItems]);
  const monthlyRoutineTotal = useMemo(
    () => activeItems.reduce((acc, curr) => acc + curr.amount, 0),
    [activeItems]
  );

  // Check if item is already booked in a specific month
  const isItemBookedInMonth = (item: RecurringExpenseItem, month: string) => {
    const key = month;
    return existingExpenseTitles.some(
      (t) => t.toLowerCase().includes(item.title.toLowerCase()) && t.includes(key)
    );
  };

  // Monthly breakdown: which months have how many items booked
  const monthsStatus = useMemo(() => {
    return ALL_2026_MONTHS.map((m) => {
      const bookedCount = activeItems.filter((item) => isItemBookedInMonth(item, m.value)).length;
      const isComplete = bookedCount >= activeItems.length && activeItems.length > 0;
      return {
        ...m,
        bookedCount,
        totalItems: activeItems.length,
        isComplete,
      };
    });
  }, [activeItems, existingExpenseTitles]);

  // Count unbooked months
  const unbookedMonthsCount = useMemo(
    () => monthsStatus.filter((m) => !m.isComplete).length,
    [monthsStatus]
  );

  // Total amount to deduct in multi-month modal
  const multiMonthTotalDeduction = useMemo(() => {
    let sum = 0;
    for (const m of selectedMonthsForGen) {
      for (const item of activeItems) {
        if (!isItemBookedInMonth(item, m)) {
          sum += item.amount;
        }
      }
    }
    return sum;
  }, [selectedMonthsForGen, activeItems, existingExpenseTitles]);

  const balanceAfterMultiGen = currentBalance - multiMonthTotalDeduction;

  // Open Add Item Modal
  const handleOpenAdd = () => {
    setEditingItemId(null);
    setFormTitle('');
    setFormAmount(500000);
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

  // Save Item
  const handleSaveItem = async (e: React.FormEvent) => {
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

    let nextItems: RecurringExpenseItem[];
    if (editingItemId) {
      nextItems = recurringItems.map((item) =>
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
      nextItems = [...recurringItems, newItem];
      showToast(`Pos rutin baru "${formTitle}" berhasil ditambahkan.`);
    }
    setRecurringItems(nextItems);
    await persistConfig(nextItems);
    setShowItemModal(false);
  };

  // Toggle Active
  const handleToggleActive = async (id: string) => {
    const nextItems = recurringItems.map((item) => {
      if (item.id === id) {
        const nextState = !item.isActive;
        showToast(`Pos "${item.title}" sekarang ${nextState ? 'Aktif' : 'Dijeda'}.`);
        return { ...item, isActive: nextState };
      }
      return item;
    });
    setRecurringItems(nextItems);
    await persistConfig(nextItems);
  };

  // Delete Item
  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    const nextItems = recurringItems.filter((i) => i.id !== itemToDelete.id);
    setRecurringItems(nextItems);
    await persistConfig(nextItems);
    showToast(`Pos "${itemToDelete.title}" telah dihapus.`);
    setItemToDelete(null);
  };

  // Execute Multi-Month Auto-Generate
  const handleExecuteMultiMonth = async () => {
    if (selectedMonthsForGen.length === 0) {
      alert('Pilih setidaknya 1 bulan untuk dibukukan.');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/expenses/recurring/auto-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          months: selectedMonthsForGen,
        }),
      });

      const resJson = await response.json();

      if (response.ok && resJson.success) {
        const newBal = resJson.data.newBalance ?? balanceAfterMultiGen;
        const newExpenses = resJson.data.createdExpenses || [];

        onExpensesProcessed(newExpenses, newBal);

        showToast(
          resJson.message ||
            `Sukses! ${resJson.data.totalItemsCreated} pos pengeluaran rutin berhasil dibukukan.`
        );

        setShowMultiMonthModal(false);
      } else {
        alert(resJson.error || 'Gagal membukukan pengeluaran rutin otomatis.');
      }
    } catch (err) {
      console.error(err);
      alert('Gagal menghubungi server untuk memproses otomatisasi.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-700 text-white rounded-2xl shadow-xl font-bold text-xs animate-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Automation Card: Anti Repot Input Berulang */}
      <div className="p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-rose-950 text-white rounded-3xl border border-slate-700 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-black">
              <Zap className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>OTOMASI BULANAN (ANTI REPOT INPUT BERULANG)</span>
            </div>
            <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Setting Pengeluaran Rutin & Otomasi Pemotongan Saldo</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Anda <strong>cukup mengatur daftar pos rutin sekali saja</strong> di halaman ini (Honor Satpam, Iuran Sampah, Listrik PJU, dsb). 
              Sistem akan <strong>otomatis mencatatkan seluruh pos pengeluaran ini ke setiap bulan berjalan</strong> dan <strong>langsung memotong saldo kas</strong> resmi, sehingga Anda tidak perlu mengetik ulang form pengeluaran setiap bulannya!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowMultiMonthModal(true)}
              className="px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-2xl shadow-lg active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 text-yellow-300" />
              <span>⚡ Bukukan Otomatis Semua Bulan (Jan s/d Sep 2026)</span>
            </button>
          </div>
        </div>

        {/* 2026 Months Status Strip */}
        <div className="pt-2 border-t border-slate-700/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase font-bold text-slate-400">
              Status Pembukuan Pengeluaran Rutin per Bulan (Tahun 2026):
            </span>
            <span className="text-[11px] font-mono font-bold text-rose-300">
              {unbookedMonthsCount > 0
                ? `${unbookedMonthsCount} Bulan Belum Dibukukan`
                : '✓ Semua Bulan Sudah Lengkap Dibukukan'}
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-1.5">
            {monthsStatus.map((m) => (
              <div
                key={m.value}
                className={`p-2 rounded-xl text-center border transition-all ${
                  m.isComplete
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300'
                }`}
              >
                <span className="block text-[10px] font-mono font-bold uppercase truncate">
                  {m.label.split(' ')[0]}
                </span>
                <span
                  className={`inline-block mt-0.5 px-1.5 py-0.2 text-[9px] font-black rounded-md ${
                    m.isComplete
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {m.isComplete ? '✓ TERCATAT' : `${m.bookedCount}/${m.totalItems} POS`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Analytics KPI Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* KPI 1: Beban Rutin Per Bulan */}
        <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase font-bold text-ink-muted tracking-wider">
              Total Beban Rutin / Bulan
            </span>
            <span className="p-1 rounded-lg bg-rose-50 text-rose-600">
              <Repeat className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-2xl font-black font-mono text-rose-700 mt-1 tabular-nums">
            {formatRupiah(monthlyRoutineTotal)}
          </p>
          <span className="text-[10px] text-ink-muted font-bold font-mono mt-0.5 block">
            {activeItems.length} POS AKTIF (DARI {recurringItems.length} POS TERKONFIGURASI)
          </span>
        </div>

        {/* KPI 2: Saldo Kas Rekening BCA */}
        <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase font-bold text-ink-muted tracking-wider">
              Saldo Kas BCA Saat Ini
            </span>
            <span className="p-1 rounded-lg bg-blue-50 text-blue-600">
              <Wallet className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-2xl font-black font-mono text-blue-700 mt-1 tabular-nums">
            {formatRupiah(currentBalance)}
          </p>
          <span className="text-[10px] text-emerald-600 font-bold font-mono mt-0.5 block">
            ✓ REKENING UTAMA KAS OPERASIONAL
          </span>
        </div>

        {/* KPI 3: Proyeksi Ketahanan Kas */}
        <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase font-bold text-ink-muted tracking-wider">
              Ketahanan Kas (Runway)
            </span>
            <span className="p-1 rounded-lg bg-amber-50 text-amber-600">
              <ShieldCheck className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-2xl font-black font-mono text-amber-700 mt-1 tabular-nums">
            ~{monthlyRoutineTotal > 0 ? (currentBalance / monthlyRoutineTotal).toFixed(1) : '99'} Bulan
          </p>
          <span className="text-[10px] text-ink-muted font-bold font-mono mt-0.5 block">
            DAYA TAHAN OPERASIONAL TANPA IURAN BARU
          </span>
        </div>
      </div>

      {/* Master Recurring Table Card */}
      <div className="bg-surface rounded-3xl border border-border shadow-card overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-rose-600" />
            <div>
              <h3 className="font-black text-sm text-ink">
                Master Konfigurasi Pos Pengeluaran Rutin
              </h3>
              <p className="text-[11px] text-ink-muted mt-0.5">
                Atur nominal, jadwal eksekusi, dan rekening pembayar. Pos aktif akan otomatis dicatat setiap bulan.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs inline-flex items-center gap-1.5 shadow-xs active:scale-[0.98] transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Pos Rutin Baru</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-canvas/60 text-ink-muted font-mono uppercase text-[10px]">
                <th className="py-3 px-4 w-12 text-center">Tgl</th>
                <th className="py-3 px-4">Nama Pos Pengeluaran & Penerima</th>
                <th className="py-3 px-4">Kategori Pos</th>
                <th className="py-3 px-4">Rekening Sumber</th>
                <th className="py-3 px-4 text-right">Nominal / Bulan</th>
                <th className="py-3 px-4 text-center">Status Auto</th>
                <th className="py-3 px-4 text-center w-28">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recurringItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-ink-muted">
                    <Repeat className="w-8 h-8 mx-auto text-ink-muted/40 mb-2" />
                    <p className="font-bold">Belum ada pos pengeluaran rutin yang dikonfigurasi.</p>
                  </td>
                </tr>
              ) : (
                recurringItems.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-canvas/50 transition-colors ${
                      !item.isActive ? 'opacity-50 bg-slate-50/50' : ''
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

                    {/* Nama & Penerima */}
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
                        <span className="truncate max-w-[130px]">{item.accountName}</span>
                      </div>
                    </td>

                    {/* Nominal */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-mono font-black text-rose-700 text-xs tabular-nums block">
                        {formatRupiah(item.amount)}
                      </span>
                      <span className="text-[9px] font-mono text-ink-muted">/ BULAN</span>
                    </td>

                    {/* Status Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(item.id)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                          item.isActive ? 'bg-rose-600' : 'bg-slate-300'
                        }`}
                        title={item.isActive ? 'Klik untuk menjeda pos ini' : 'Klik untuk mengaktifkan pos ini'}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL 1: MULTI-MONTH AUTO-GENERATE ================= */}
      {showMultiMonthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-lg w-full p-6 border border-border shadow-modal space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-ink">
                    Bukukan Otomatis Pengeluaran Rutin (Semua Bulan)
                  </h3>
                  <span className="text-[11px] text-ink-muted">
                    Mencatat seluruh pos rutin ke Buku Pengeluaran & memotong saldo kas
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMultiMonthModal(false)}
                disabled={isGenerating}
                className="text-ink-muted hover:text-ink"
              >
                ✕
              </button>
            </div>

            {/* Simulation Card */}
            <div className="p-4 bg-canvas rounded-2xl border border-border space-y-3">
              <span className="text-[10px] font-mono uppercase font-bold text-ink-muted tracking-wider block">
                Simulasi Pemotongan Saldo Kas Kas
              </span>

              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between items-center text-ink-muted">
                  <span>Saldo Kas BCA Saat Ini:</span>
                  <span className="font-bold text-ink">{formatRupiah(currentBalance)}</span>
                </div>

                <div className="flex justify-between items-center text-rose-700 font-bold">
                  <span>Total Pengeluaran Rutin yang Akan Dibukukan:</span>
                  <span>- {formatRupiah(multiMonthTotalDeduction)}</span>
                </div>

                <div className="border-t border-border pt-1.5 flex justify-between items-center text-sm font-black">
                  <span className="text-ink">Sisa Saldo Kas Baru:</span>
                  <span
                    className={`tabular-nums ${
                      balanceAfterMultiGen >= 0 ? 'text-emerald-700' : 'text-red-700'
                    }`}
                  >
                    {formatRupiah(balanceAfterMultiGen)}
                  </span>
                </div>
              </div>
            </div>

            {/* Month Checklist */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-ink text-[11px]">
                  Pilih Bulan yang Ingin Dibukukan:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedMonthsForGen.length === ALL_2026_MONTHS.length) {
                      setSelectedMonthsForGen([]);
                    } else {
                      setSelectedMonthsForGen(ALL_2026_MONTHS.map((m) => m.value));
                    }
                  }}
                  className="text-[10px] text-rose-600 hover:underline font-bold"
                >
                  {selectedMonthsForGen.length === ALL_2026_MONTHS.length
                    ? 'Batal Pilih Semua'
                    : 'Pilih Semua Bulan'}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border border-border rounded-2xl bg-canvas/40">
                {ALL_2026_MONTHS.map((m) => {
                  const isChecked = selectedMonthsForGen.includes(m.value);
                  const statusObj = monthsStatus.find((x) => x.value === m.value);
                  return (
                    <label
                      key={m.value}
                      className={`p-2.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-surface border-rose-300 shadow-2xs'
                          : 'bg-canvas border-border opacity-70'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[11px] text-ink">{m.label.split(' ')[0]}</span>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setSelectedMonthsForGen((prev) =>
                              prev.includes(m.value)
                                ? prev.filter((x) => x !== m.value)
                                : [...prev, m.value]
                            );
                          }}
                          className="rounded border-border text-rose-600 focus:ring-rose-500 w-3.5 h-3.5"
                        />
                      </div>
                      <span
                        className={`text-[9px] font-mono mt-1 ${
                          statusObj?.isComplete ? 'text-emerald-600 font-bold' : 'text-amber-600'
                        }`}
                      >
                        {statusObj?.isComplete ? '✓ Sudah Lengkap' : 'Siap Terbit'}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setShowMultiMonthModal(false)}
                disabled={isGenerating}
                className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas active:scale-[0.98] transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteMultiMonth}
                disabled={isGenerating || selectedMonthsForGen.length === 0}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black shadow-xs active:scale-[0.98] transition-all disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Membukukan Semua Bulan...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-yellow-300" />
                    <span>Konfirmasi & Bukukan Otomatis</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: TAMBAH / EDIT POS PENGELUARAN RUTIN ================= */}
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
                  placeholder="Contoh: Honor Petugas Jaga Gerbang"
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
