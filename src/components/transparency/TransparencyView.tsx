import React, { useState, useEffect, useMemo } from 'react';
import {
  Home,
  CheckCircle2,
  Hourglass,
  ArrowDownCircle,
  ArrowUpCircle,
  Wallet,
  ShieldCheck,
  Sparkles,
  Zap,
  Wrench,
  Info,
  Calendar,
  Clock,
  QrCode,
  FileText,
  ChevronDown,
  Share2,
  Copy,
  Check,
  Send,
  ExternalLink,
  Search,
  Filter,
  ArrowRight,
  Building2,
  Download,
  AlertCircle,
  CreditCard,
  UploadCloud,
  MessageSquare,
  Lock,
  Layers,
  ChevronRight,
  TrendingUp,
  FileCheck
} from 'lucide-react';
import { formatRupiah } from '../../lib/format';
import type { PublicTransparencyData } from '../../services/transparency.service';
import { ExpenseDetailModal } from '../shared/ExpenseDetailModal';

export type TransparencySubTab = 
  | 'cashflow_summary' 
  | 'public_ledger' 
  | 'dues_breakdown' 
  | 'citizen_confirm' 
  | 'audit_faq';

interface TransparencyViewProps {
  initialData: PublicTransparencyData;
  initialTab?: TransparencySubTab;
}

interface LedgerEntry {
  id: string;
  date: string;
  voucherRef: string;
  category: string;
  description: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  balance: number;
  reconciled: boolean;
  notes?: string;
}

export const TransparencyView: React.FC<TransparencyViewProps> = ({
  initialData,
  initialTab = 'cashflow_summary'
}) => {
  // Navigation State with URL synchronization
  const [activeTab, setActiveTab] = useState<TransparencySubTab>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab') as TransparencySubTab;
      if (['cashflow_summary', 'public_ledger', 'dues_breakdown', 'citizen_confirm', 'audit_faq'].includes(tabParam)) {
        return tabParam;
      }
    }
    return initialTab;
  });

  const handleTabChange = (tab: TransparencySubTab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.replaceState({}, '', url.toString());
    }
  };

  const [data, setData] = useState<PublicTransparencyData>(initialData);
  const [selectedMonth, setSelectedMonth] = useState(initialData.periodName || 'Agustus 2026');
  const [periodDropdown, setPeriodDropdown] = useState(false);
  const [selectedExpenseCategory, setSelectedExpenseCategory] = useState<any>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);

  // Digital Clock
  const [currentTime, setCurrentTime] = useState('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZoneName: 'short'
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Ledger Filter State
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [ledgerCategoryFilter, setLedgerCategoryFilter] = useState<string>('ALL');

  // Confirmation Form State
  const [confirmUnit, setConfirmUnit] = useState('');
  const [confirmName, setConfirmName] = useState('');
  const [confirmPeriod, setConfirmPeriod] = useState('Agustus 2026');
  const [confirmAmount, setConfirmAmount] = useState('250000');
  const [confirmMethod, setConfirmMethod] = useState<'BCA_TRF' | 'QRIS' | 'CASH'>('BCA_TRF');
  const [confirmSenderRef, setConfirmSenderRef] = useState('');
  const [confirmNotes, setConfirmNotes] = useState('');
  const [confirmFileUploaded, setConfirmFileUploaded] = useState(false);
  const [confirmSubmitting, setConfirmSubmitting] = useState(false);
  const [confirmSuccessModal, setConfirmSuccessModal] = useState(false);
  const [confirmError, setConfirmError] = useState('');

  // Share Link Handler
  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyAccount = (text: string) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    }
  };

  const periodsList = [
    { name: 'Agustus 2026', year: 2026, month: 8 },
    { name: 'Juli 2026', year: 2026, month: 7 },
    { name: 'Juni 2026', year: 2026, month: 6 },
    { name: 'Mei 2026', year: 2026, month: 5 },
  ];

  const getCategoryIcon = (name: string) => {
    if (name.includes('Keamanan')) return <ShieldCheck className="w-4 h-4 text-emerald-700" />;
    if (name.includes('Kebersihan')) return <Sparkles className="w-4 h-4 text-emerald-700" />;
    if (name.includes('Listrik')) return <Zap className="w-4 h-4 text-amber-600" />;
    return <Wrench className="w-4 h-4 text-sky-600" />;
  };

  // Realistic Public Ledger Mutasi Kas
  const sampleLedgerEntries: LedgerEntry[] = useMemo(() => [], []);

  // Filtered Ledger
  const filteredLedger = useMemo(() => {
    return sampleLedgerEntries.filter(entry => {
      const matchSearch =
        entry.description.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
        entry.voucherRef.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
        entry.category.toLowerCase().includes(ledgerSearch.toLowerCase());

      const matchType =
        ledgerTypeFilter === 'ALL' || entry.type === ledgerTypeFilter;

      const matchCategory =
        ledgerCategoryFilter === 'ALL' || entry.category === ledgerCategoryFilter;

      return matchSearch && matchType && matchCategory;
    });
  }, [sampleLedgerEntries, ledgerSearch, ledgerTypeFilter, ledgerCategoryFilter]);

  // Handle Form Submission
  const handleConfirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmUnit.trim() || !confirmName.trim() || !confirmAmount.trim()) {
      setConfirmError('Nomor Unit Rumah, Nama Warga, dan Nominal wajib diisi.');
      return;
    }
    setConfirmSubmitting(true);
    setConfirmError('');

    setTimeout(() => {
      setConfirmSubmitting(false);
      setConfirmSuccessModal(true);
    }, 700);
  };

  return (
    <div className="space-y-6 pb-16 font-sans">
      
      {/* ========================================================================= */}
      {/* 1. TOP ANNOUNCEMENT & AUDIT SYSTEM STRIP                                  */}
      {/* ========================================================================= */}
      <div className="bg-primary-950 text-white text-[11px] py-2 px-4 -mx-4 sm:-mx-6 lg:-mx-8 rounded-b-2xl border-b border-primary-900/80 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5 max-w-7xl mx-auto w-full justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold tracking-tight">LAPORAN KAS RESMI WARGA (TRANSPARANSI KEUANGAN PUBLIK)</span>
            <span className="hidden sm:inline opacity-40">•</span>
            <span className="hidden sm:inline text-primary-200">Terbuka & Akuntabel untuk Seluruh Warga</span>
          </div>
          <div className="flex items-center gap-4 text-primary-200 font-mono text-[10px]">
            <span className="hidden md:inline">🕒 {currentTime || 'WIB'}</span>
            <span className="px-2 py-0.5 rounded bg-primary-900 text-emerald-300 font-bold border border-primary-800">
              Audit Kas: Lolos WTP
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. HEADER: TITLE, ACTIONS & PERIOD SELECTOR                               */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-mono font-bold uppercase tracking-wider border border-emerald-200">
              Periode Pembukuan: {selectedMonth}
            </span>
            <span className="text-[11px] text-ink-muted">
              Diperbarui: {data.lastUpdatedAt}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-ink mt-1">
            Laporan Transparansi Keuangan
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1 max-w-2xl leading-relaxed">
            Pembukuan arus kas, mutasi pengeluaran riil, dan tingkat partisipasi iuran komplek yang terbuka untuk warga.
          </p>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          {/* Share Button */}
          <button
            type="button"
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-surface hover:bg-canvas active:scale-[0.98] border border-border rounded-2xl text-xs font-bold text-ink shadow-2xs transition-all"
          >
            <Share2 className="w-3.5 h-3.5 text-primary-700" />
            <span>Bagikan</span>
          </button>

          {/* Period Selector Dropdown */}
          <div className="relative inline-block">
            <button
              type="button"
              onClick={() => setPeriodDropdown(!periodDropdown)}
              className="flex items-center gap-2 px-4 py-2.5 bg-surface hover:bg-canvas active:scale-[0.98] border border-border rounded-2xl text-xs font-bold text-ink shadow-2xs transition-all"
            >
              <Calendar className="w-4 h-4 text-ink-muted" />
              <span>{selectedMonth}</span>
              <ChevronDown className="w-3.5 h-3.5 text-ink-muted" />
            </button>

            {periodDropdown && (
              <div className="absolute right-0 mt-2 w-52 bg-surface rounded-2xl shadow-modal border border-border py-1.5 z-40 animate-in fade-in">
                {periodsList.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => {
                      setSelectedMonth(p.name);
                      setPeriodDropdown(false);
                      if (p.month !== 8) {
                        window.location.href = `/transparency/${p.year}/${p.month.toString().padStart(2, '0')}`;
                      }
                    }}
                    className={`w-full text-left px-4 py-2.5 text-xs font-bold flex items-center justify-between ${
                      selectedMonth === p.name ? 'bg-primary-50 text-primary-700 font-black' : 'text-ink hover:bg-canvas'
                    }`}
                  >
                    <span>{p.name}</span>
                    {selectedMonth === p.name && <Check className="w-3.5 h-3.5 text-primary-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. 5 SUBTABS NAVIGATION PILL BAR                                          */}
      {/* ========================================================================= */}
      <div className="bg-surface p-1.5 rounded-2xl border border-border shadow-2xs flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => handleTabChange('cashflow_summary')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'cashflow_summary'
              ? 'bg-primary-600 text-white shadow-xs'
              : 'text-ink-muted hover:text-ink hover:bg-canvas'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Ringkasan Arus Kas</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('public_ledger')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'public_ledger'
              ? 'bg-primary-600 text-white shadow-xs'
              : 'text-ink-muted hover:text-ink hover:bg-canvas'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Buku Mutasi Kas</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('dues_breakdown')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'dues_breakdown'
              ? 'bg-primary-600 text-white shadow-xs'
              : 'text-ink-muted hover:text-ink hover:bg-canvas'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Rekap per Wilayah</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('citizen_confirm')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'citizen_confirm'
              ? 'bg-primary-600 text-white shadow-xs'
              : 'text-ink-muted hover:text-ink hover:bg-canvas'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>Konfirmasi Bayar</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('audit_faq')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'audit_faq'
              ? 'bg-primary-600 text-white shadow-xs'
              : 'text-ink-muted hover:text-ink hover:bg-canvas'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Akuntabilitas & Kas</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUBTAB 1: CASHFLOW SUMMARY & PARTICIPATION (DEFAULT VIEW)                 */}
      {/* ========================================================================= */}
      {activeTab === 'cashflow_summary' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Top Banner: Participation Rate */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left 2 Cols: Progress */}
            <div className="lg:col-span-2 bg-surface rounded-3xl p-6 sm:p-7 border border-border shadow-card flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-ink tracking-tight tabular-nums">
                    {data.paidProperties} dari {data.totalProperties} unit rumah
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-primary-600 tracking-tight">
                    telah membayar
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-ink-muted mt-1.5">
                  Tingkat partisipasi iuran pemeliharaan lingkungan (*IPL*) pada periode {data.periodName}.
                </p>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-canvas rounded-full h-3.5 overflow-hidden border border-border/60">
                    <div
                      className="bg-primary-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${data.paidPercentage}%` }}
                    />
                  </div>
                  <span className="text-base font-black text-ink tabular-nums">
                    {data.paidPercentage.toFixed(1).replace('.', ',')}%
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-6 text-xs text-ink-muted pt-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary-600" />
                    <span>Lunas: <strong className="text-ink font-bold">{data.paidProperties} rumah</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>Belum Terkonfirmasi: <strong className="text-ink font-bold">{data.unpaidProperties} rumah</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Transparency Trust Card */}
            <div className="bg-primary-50/80 border border-primary-200 rounded-3xl p-6 flex flex-col justify-between shadow-card">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-surface border border-primary-200 flex items-center justify-center text-primary-700 shrink-0 shadow-2xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-primary-950">
                    Keterbukaan untuk Keharmonisan Warga
                  </h3>
                  <p className="text-xs text-primary-800/90 mt-1 leading-relaxed">
                    Setiap rupiah iuran warga dicatat digital dan diaudit berkala demi fasilitas komplek yang aman, bersih, dan terpelihara.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-primary-200/80 flex items-center justify-between text-xs text-primary-900 font-bold">
                <span>Rekening Resmi Paguyuban:</span>
                <span className="font-mono">BCA 8830-1928-33</span>
              </div>
            </div>
          </div>

          {/* 6 KPI Cards Row */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {/* Card 1: Total Rumah */}
            <div className="bg-surface rounded-2xl p-4.5 border border-border shadow-card flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center mb-2.5">
                <Home className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-ink-muted">Total Rumah</span>
              <span className="text-2xl font-black text-ink mt-0.5 tabular-nums">{data.totalProperties}</span>
              <span className="text-[10px] text-ink-muted font-medium mt-0.5">Unit Terdata</span>
            </div>

            {/* Card 2: Lunas */}
            <div className="bg-surface rounded-2xl p-4.5 border border-border shadow-card flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-ink-muted">Lunas</span>
              <span className="text-2xl font-black text-emerald-700 mt-0.5 tabular-nums">{data.paidProperties}</span>
              <span className="text-[10px] text-emerald-800 font-bold mt-0.5">{data.paidPercentage.toFixed(1).replace('.', ',')}% Tercapai</span>
            </div>

            {/* Card 3: Belum */}
            <div className="bg-surface rounded-2xl p-4.5 border border-border shadow-card flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-2.5">
                <Hourglass className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-ink-muted">Tertunda</span>
              <span className="text-2xl font-black text-amber-700 mt-0.5 tabular-nums">{data.unpaidProperties}</span>
              <span className="text-[10px] text-amber-800 font-bold mt-0.5">{data.unpaidPercentage.toFixed(1).replace('.', ',')}% Belum Bayar</span>
            </div>

            {/* Card 4: Pemasukan */}
            <div className="bg-surface rounded-2xl p-4.5 border border-border shadow-card flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2.5">
                <ArrowDownCircle className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-ink-muted">Pemasukan Riil</span>
              <span className="text-base font-black text-ink mt-0.5 tabular-nums truncate w-full">{formatRupiah(data.income)}</span>
              <span className="text-[10px] text-emerald-700 font-bold mt-0.5">Total Diterima</span>
            </div>

            {/* Card 5: Pengeluaran */}
            <div className="bg-surface rounded-2xl p-4.5 border border-border shadow-card flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center mb-2.5">
                <ArrowUpCircle className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-ink-muted">Pengeluaran Riil</span>
              <span className="text-base font-black text-ink mt-0.5 tabular-nums truncate w-full">{formatRupiah(data.expense)}</span>
              <span className="text-[10px] text-rose-700 font-bold mt-0.5">Biaya Terbayar</span>
            </div>

            {/* Card 6: Saldo Akhir */}
            <div className="bg-surface rounded-2xl p-4.5 border border-border shadow-card flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-2.5">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-ink-muted">Saldo Kas Akhir</span>
              <span className="text-base font-black text-primary-700 mt-0.5 tabular-nums truncate w-full">{formatRupiah(data.closingBalance)}</span>
              <span className="text-[10px] text-indigo-800 font-bold mt-0.5">Kas Siap Pakai</span>
            </div>
          </div>

          {/* 3 Bottom Columns Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* Column 1: Rumah Belum Iuran */}
            <div className="bg-surface rounded-3xl p-6 border border-border shadow-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-base font-black text-ink">Daftar Unit Belum Iuran</h3>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                    {data.unpaidHouses.length} Unit
                  </span>
                </div>
                <p className="text-xs text-ink-muted">
                  Unit yang belum melakukan konfirmasi pembayaran periode {data.periodName}.
                </p>

                {data.unpaidHouses.length === 0 ? (
                  <div className="mt-4 p-5 text-center bg-canvas rounded-2xl border border-dashed border-border space-y-1.5">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                    <p className="text-xs font-bold text-ink">Semua Unit Lunas / Belum Ada Tunggakan</p>
                    <p className="text-[11px] text-ink-muted leading-relaxed">
                      Tidak ada catatan unit rumah yang menunggak untuk periode {data.periodName}.
                    </p>
                  </div>
                ) : (
                  <div className="mt-5 grid grid-cols-3 gap-2">
                    {data.unpaidHouses.slice(0, 9).map((house) => (
                      <div
                        key={house}
                        className="flex items-center gap-2 p-2.5 rounded-xl bg-canvas border border-border text-xs font-bold text-ink hover:border-amber-400 transition-colors"
                      >
                        <Home className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>{house}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-900 leading-relaxed">
                  Sudah transfer? Silakan gunakan subtab <button onClick={() => handleTabChange('citizen_confirm')} className="font-bold underline">Konfirmasi Bayar</button> agar status unit langsung lunas.
                </p>
              </div>
            </div>

            {/* Column 2: Penggunaan Dana */}
            <div className="bg-surface rounded-3xl p-6 border border-border shadow-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-base font-black text-ink">Alokasi Pengeluaran Riil</h3>
                  {data.expenseBreakdown.length > 0 && <span className="text-[11px] font-bold text-primary-700">Klik untuk Nota</span>}
                </div>
                <p className="text-xs text-ink-muted">
                  Rincian alokasi belanja kas operasional pada {data.periodName}.
                </p>

                {data.expenseBreakdown.length === 0 ? (
                  <div className="mt-4 p-5 text-center bg-canvas rounded-2xl border border-dashed border-border space-y-1.5">
                    <Wallet className="w-8 h-8 text-ink-muted/40 mx-auto" />
                    <p className="text-xs font-bold text-ink">Belum Ada Pengeluaran Kas</p>
                    <p className="text-[11px] text-ink-muted leading-relaxed">
                      Belum ada pos pengeluaran operasional yang dibukukan untuk periode {data.periodName}.
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {data.expenseBreakdown.map((item) => (
                      <div
                        key={item.name}
                        onClick={() => setSelectedExpenseCategory(item)}
                        className="p-2.5 rounded-2xl bg-canvas hover:bg-primary-50/70 border border-border hover:border-primary-300 transition-all cursor-pointer group active:scale-[0.98]"
                        title="Klik untuk melihat bukti nota dan kuitansi belanja"
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-ink">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-surface border border-border flex items-center justify-center">
                              {getCategoryIcon(item.name)}
                            </div>
                            <span className="group-hover:text-primary-700">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-2 tabular-nums">
                            <span className="text-ink-muted font-normal">{item.percentage}%</span>
                            <span className="text-ink font-black">{formatRupiah(item.amount)}</span>
                          </div>
                        </div>
                        <div className="mt-2 bg-border/40 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-primary-600 h-full rounded-full"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {data.expenseBreakdown.length > 0 && (
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => setSelectedExpenseCategory(data.expenseBreakdown[0])}
                    className="w-full py-2.5 px-4 rounded-xl border border-primary-600 text-primary-700 hover:bg-primary-50 font-bold text-xs transition-all text-center flex items-center justify-center gap-1.5 shadow-2xs active:scale-[0.98]"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Lihat Detail Nota & Bukti Belanja</span>
                  </button>
                </div>
              )}
            </div>

            {/* Column 3: Ringkasan Neraca & Mobile QR */}
            <div className="bg-surface rounded-3xl p-6 border border-border shadow-card flex flex-col justify-between space-y-5">
              <div>
                <h3 className="text-base font-black text-ink">Ringkasan Neraca Kas</h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  Rekonsiliasi saldo berjalan kas operasional {data.periodName}.
                </p>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1.5 border-b border-border/70">
                    <span className="text-ink-muted">Saldo Awal Bulan</span>
                    <span className="font-bold text-ink tabular-nums">{formatRupiah(data.openingBalance)}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-border/70">
                    <span className="text-ink-muted">Total Pemasukan Iuran</span>
                    <span className="font-bold text-emerald-700 tabular-nums">+ {formatRupiah(data.income)}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-border/70">
                    <span className="text-ink-muted">Total Pengeluaran Kas</span>
                    <span className="font-bold text-rose-700 tabular-nums">- {formatRupiah(data.expense)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-primary-50 border border-primary-200 mt-2">
                    <span className="font-black text-primary-950">Saldo Akhir Berjalan</span>
                    <span className="font-black text-primary-900 text-sm tabular-nums">{formatRupiah(data.closingBalance)}</span>
                  </div>
                </div>
              </div>

              {/* QR Code section */}
              <div className="p-3.5 rounded-2xl bg-canvas border border-border flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-ink">Akses Laporan di Ponsel</h4>
                  <p className="text-[11px] text-ink-muted leading-tight">
                    Pindai QR ini untuk membuka laporan transparansi di smartphone warga.
                  </p>
                </div>
                {data.qrCodeDataUrl ? (
                  <img
                    src={data.qrCodeDataUrl}
                    alt="QR Code Laporan Transparansi"
                    className="w-16 h-16 rounded-xl border border-border p-1 bg-white shrink-0 shadow-2xs"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-surface border border-border flex items-center justify-center shrink-0">
                    <QrCode className="w-8 h-8 text-ink-muted" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 2: PUBLIC LEDGER & MUTATION TABLE                                  */}
      {/* ========================================================================= */}
      {activeTab === 'public_ledger' && (
        <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-6 animate-in fade-in">
          <div className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary-800 bg-primary-50 px-2 py-0.5 rounded-md border border-primary-200">
                Buku Mutasi Kas Digital
              </span>
              <h2 className="text-xl font-black text-ink mt-1">
                Catatan Transaksi Masuk & Keluar Lengkap
              </h2>
              <p className="text-xs text-ink-muted mt-0.5">
                Setiap mutasi kas dilengkapi nomor voucher referensi dan status rekonsiliasi rekening resmi.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-canvas px-3 py-1.5 rounded-xl border border-border text-ink">
                {filteredLedger.length} Transaksi Terdata
              </span>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Cari uraian transaksi, no voucher (cth: BCA-TRF, VCH-SEC)..."
                value={ledgerSearch}
                onChange={(e) => setLedgerSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-canvas border border-border rounded-xl text-xs font-medium text-ink focus:outline-hidden focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setLedgerTypeFilter('ALL')}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  ledgerTypeFilter === 'ALL'
                    ? 'bg-primary-600 text-white shadow-xs'
                    : 'bg-canvas text-ink-muted hover:text-ink border border-border'
                }`}
              >
                Semua Arus
              </button>
              <button
                type="button"
                onClick={() => setLedgerTypeFilter('INCOME')}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  ledgerTypeFilter === 'INCOME'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-canvas text-ink-muted hover:text-ink border border-border'
                }`}
              >
                + Masuk (CR)
              </button>
              <button
                type="button"
                onClick={() => setLedgerTypeFilter('EXPENSE')}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  ledgerTypeFilter === 'EXPENSE'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-canvas text-ink-muted hover:text-ink border border-border'
                }`}
              >
                - Keluar (DB)
              </button>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="border border-border rounded-2xl overflow-hidden overflow-x-auto text-xs shadow-2xs">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-canvas text-ink-muted font-bold text-[11px]">
                  <th className="py-3.5 px-4">Tanggal & Ref</th>
                  <th className="py-3.5 px-4">Uraian Transaksi</th>
                  <th className="py-3.5 px-4">Kategori Pos</th>
                  <th className="py-3.5 px-4 text-right">Nominal (Rp)</th>
                  <th className="py-3.5 px-4 text-right">Saldo Kas</th>
                  <th className="py-3.5 px-4 text-center">Status Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredLedger.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-14 text-center text-ink-muted">
                      <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                        <FileText className="w-8 h-8 text-ink-muted/40 mx-auto" />
                        <span className="font-bold text-ink text-sm">Belum Ada Transaksi Kas Tercatat</span>
                        <span className="text-[11px] text-ink-muted">
                          Buku mutasi kas publik akan otomatis memuat transaksi masuk dan keluar setelah dibukukan oleh bendahara paguyuban.
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLedger.map((row) => (
                    <tr key={row.id} className="hover:bg-canvas/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-ink block">{row.date}</span>
                        <span className="text-[10px] font-mono text-primary-700 bg-primary-50 px-1.5 py-0.2 rounded border border-primary-200 inline-block mt-0.5">
                          {row.voucherRef}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-sm">
                        <span className="font-bold text-ink block leading-tight">{row.description}</span>
                        {row.notes && <span className="text-[10px] text-ink-muted mt-0.5 block">{row.notes}</span>}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-canvas border border-border text-ink-muted">
                          {row.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right tabular-nums font-black">
                        <span className={row.type === 'INCOME' ? 'text-emerald-700' : 'text-rose-700'}>
                          {row.type === 'INCOME' ? '+' : '-'} {formatRupiah(row.amount)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right tabular-nums font-bold text-ink">
                        {formatRupiah(row.balance)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <Check className="w-3 h-3 text-emerald-600" />
                          Terverifikasi
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Ledger Summary Stats */}
          <div className="p-4 bg-canvas rounded-2xl border border-border grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-ink-muted block">Total Mutasi Kredit (+):</span>
              <span className="text-sm font-black text-emerald-700 tabular-nums">
                + {formatRupiah(filteredLedger.filter((e) => e.type === 'INCOME').reduce((sum, e) => sum + e.amount, 0))}
              </span>
            </div>
            <div>
              <span className="text-ink-muted block">Total Mutasi Debit (-):</span>
              <span className="text-sm font-black text-rose-700 tabular-nums">
                - {formatRupiah(filteredLedger.filter((e) => e.type === 'EXPENSE').reduce((sum, e) => sum + e.amount, 0))}
              </span>
            </div>
            <div>
              <span className="text-ink-muted block">Saldo Kas Terkonfirmasi:</span>
              <span className="text-sm font-black text-primary-800 tabular-nums">
                {formatRupiah(data.closingBalance)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 3: DUES BREAKDOWN BY REGION & BLOCKS                               */}
      {/* ========================================================================= */}
      {activeTab === 'dues_breakdown' && (
        <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-6 animate-in fade-in">
          <div className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary-800 bg-primary-50 px-2 py-0.5 rounded-md border border-primary-200">
                Agregat Wilayah Lingkungan
              </span>
              <h2 className="text-xl font-black text-ink mt-1">
                Kinerja Pembayaran Iuran per Blok Hunian
              </h2>
              <p className="text-xs text-ink-muted mt-0.5">
                Pantau tingkat kesadaran iuran warga berdasarkan blok dan kawasan komplek.
              </p>
            </div>
            <a
              href="/rekap-iuran"
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span>Daftar Unit Rumah Lengkap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {data.paidProperties === 0 && data.income === 0 ? (
            <div className="py-14 px-4 text-center bg-canvas rounded-2xl border border-dashed border-border space-y-2">
              <Building2 className="w-10 h-10 text-ink-muted/40 mx-auto" />
              <p className="text-sm font-bold text-ink">Belum Ada Rekapitulasi Iuran Masuk Riil</p>
              <p className="text-xs text-ink-muted max-w-md mx-auto">
                Agregat pembayaran per blok hunian akan otomatis terisi dan diperbarui begitu warga membayar iuran IPL dan diverifikasi bendahara.
              </p>
              <div className="pt-2">
                <a
                  href="/rekap-iuran"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  <span>Buka Daftar Unit Rumah</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { block: 'Kavling Komplek', total: data.totalProperties, paid: data.paidProperties, unpaid: data.unpaidProperties, pct: data.paidPercentage, collected: data.income },
              ].map((b) => (
                <div key={b.block} className="p-5 rounded-2xl bg-canvas border border-border space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-ink">{b.block}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      b.pct === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-primary-50 text-primary-800'
                    }`}>
                      {b.pct}% Lunas
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-black text-ink tabular-nums">
                      {b.paid} <span className="text-xs font-normal text-ink-muted">/ {b.total} rumah</span>
                    </span>
                    <span className="text-xs font-bold text-primary-700 tabular-nums">
                      {formatRupiah(b.collected)}
                    </span>
                  </div>

                  <div className="bg-border/50 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary-600 h-full rounded-full transition-all"
                      style={{ width: `${b.pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-ink-muted pt-1 border-t border-border/60">
                    <span>Unit tertunda: <strong className="text-ink">{b.unpaid} rumah</strong></span>
                    <a href="/rekap-iuran" className="font-bold text-primary-700 hover:underline">
                      Periksa Unit →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 4: CITIZEN SELF-PAYMENT CONFIRMATION FORM                          */}
      {/* ========================================================================= */}
      {activeTab === 'citizen_confirm' && (
        <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-6 animate-in fade-in">
          <div className="border-b border-border pb-4 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Layanan Konfirmasi Mandiri Warga
              </span>
              <h2 className="text-xl font-black text-ink mt-1">
                Formulir Konfirmasi Pembayaran Iuran
              </h2>
              <p className="text-xs text-ink-muted mt-0.5">
                Kirim data transfer Bank BCA atau QRIS Anda agar bendahara segera memverifikasi kuitansi lunas.
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>

          {confirmError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{confirmError}</span>
            </div>
          )}

          <form onSubmit={handleConfirmSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Unit Code */}
              <div>
                <label className="block font-bold text-ink mb-1.5">Nomor Unit Rumah / Blok:</label>
                <input
                  type="text"
                  placeholder="Contoh: A-17, B-04, C-11"
                  value={confirmUnit}
                  onChange={(e) => setConfirmUnit(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-canvas border border-border rounded-xl text-xs font-bold text-ink focus:ring-2 focus:ring-primary-500 focus:outline-hidden"
                />
              </div>

              {/* Citizen Name */}
              <div>
                <label className="block font-bold text-ink mb-1.5">Nama Lengkap Pembayar:</label>
                <input
                  type="text"
                  placeholder="Nama pemilik / penghuni yang mentransfer"
                  value={confirmName}
                  onChange={(e) => setConfirmName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-canvas border border-border rounded-xl text-xs font-bold text-ink focus:ring-2 focus:ring-primary-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Period */}
              <div>
                <label className="block font-bold text-ink mb-1.5">Periode Tagihan Iuran:</label>
                <select
                  value={confirmPeriod}
                  onChange={(e) => setConfirmPeriod(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
                >
                  <option value="Agustus 2026">Agustus 2026 (Bulan Ini)</option>
                  <option value="Juli 2026">Juli 2026</option>
                  <option value="Juni 2026">Juni 2026</option>
                  <option value="September 2026 (Di Muka)">September 2026 (Di Muka)</option>
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block font-bold text-ink mb-1.5">Nominal Transfer (Rp):</label>
                <input
                  type="number"
                  placeholder="750000"
                  value={confirmAmount}
                  onChange={(e) => setConfirmAmount(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-canvas border border-border rounded-xl text-xs font-bold text-ink font-mono"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block font-bold text-ink mb-1.5">Metode / Saluran Pembayaran:</label>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setConfirmMethod('BCA_TRF')}
                  className={`py-2.5 px-3 rounded-xl border text-center font-bold transition-all ${
                    confirmMethod === 'BCA_TRF'
                      ? 'bg-primary-50 border-primary-500 text-primary-900 shadow-2xs'
                      : 'bg-canvas border-border text-ink-muted hover:text-ink'
                  }`}
                >
                  🏦 Transfer Bank BCA
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmMethod('QRIS')}
                  className={`py-2.5 px-3 rounded-xl border text-center font-bold transition-all ${
                    confirmMethod === 'QRIS'
                      ? 'bg-primary-50 border-primary-500 text-primary-900 shadow-2xs'
                      : 'bg-canvas border-border text-ink-muted hover:text-ink'
                  }`}
                >
                  📱 QRIS Paguyuban
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmMethod('CASH')}
                  className={`py-2.5 px-3 rounded-xl border text-center font-bold transition-all ${
                    confirmMethod === 'CASH'
                      ? 'bg-primary-50 border-primary-500 text-primary-900 shadow-2xs'
                      : 'bg-canvas border-border text-ink-muted hover:text-ink'
                  }`}
                >
                  💵 Tunai ke Bendahara
                </button>
              </div>
            </div>

            {/* Sender Reference */}
            <div>
              <label className="block font-bold text-ink mb-1.5">Nomor Referensi / 4 Digit Akhir Rekening Pengirim:</label>
              <input
                type="text"
                placeholder="Contoh: BCA Ref #99214 atau rek atas nama Siti Rahmawati"
                value={confirmSenderRef}
                onChange={(e) => setConfirmSenderRef(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              />
            </div>

            {/* Simulated File Upload Dropzone */}
            <div>
              <label className="block font-bold text-ink mb-1.5">Unggah Bukti Struk Transfer (Foto / Tangkapan Layar):</label>
              <div
                onClick={() => setConfirmFileUploaded(!confirmFileUploaded)}
                className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                  confirmFileUploaded
                    ? 'border-emerald-500 bg-emerald-50/50'
                    : 'border-border hover:border-primary-400 bg-canvas'
                }`}
              >
                <UploadCloud className={`w-8 h-8 mx-auto mb-2 ${confirmFileUploaded ? 'text-emerald-600' : 'text-ink-muted'}`} />
                {confirmFileUploaded ? (
                  <p className="text-xs font-bold text-emerald-800">
                    ✓ Berkas Bukti Transfer Terlampir: <span className="font-mono">struk-transfer-bca.jpg</span>
                  </p>
                ) : (
                  <p className="text-xs text-ink-muted">
                    Klik di sini untuk mengunggah foto struk transfer / screenshot m-Banking
                  </p>
                )}
                <span className="text-[10px] text-ink-muted block mt-1">Format didukung: JPG, PNG, PDF (Maks. 5 MB)</span>
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block font-bold text-ink mb-1.5">Catatan Tambahan (Opsional):</label>
              <textarea
                rows={2}
                placeholder="Misal: Termasuk pelunasan denda sampah bulan lalu..."
                value={confirmNotes}
                onChange={(e) => setConfirmNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-canvas border border-border rounded-xl text-xs font-medium text-ink"
              />
            </div>

            <button
              type="submit"
              disabled={confirmSubmitting}
              className="w-full py-3.5 px-4 bg-primary-600 hover:bg-primary-700 active:scale-[0.98] disabled:opacity-50 text-white font-bold rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 text-sm"
            >
              {confirmSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Kirim Konfirmasi Pembayaran ke Bendahara</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 5: AUDIT STANDARDS & OFFICIAL ACCOUNTS                             */}
      {/* ========================================================================= */}
      {activeTab === 'audit_faq' && (
        <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-6 animate-in fade-in">
          <div className="border-b border-border pb-4 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary-800 bg-primary-50 px-2 py-0.5 rounded-md border border-primary-200">
                Tata Kelola & Akuntabilitas Finansial
              </span>
              <h2 className="text-xl font-black text-ink mt-1">
                SOP Pengelolaan Rekening & Audit Kas Paguyuban
              </h2>
              <p className="text-xs text-ink-muted mt-0.5">
                Prinsip kepengurusan kas yang bersih, transparan, dan dapat diverifikasi independen.
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-canvas border border-border flex items-center justify-center text-primary-700 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>

          {/* Official Bank Account Box */}
          <div className="p-5 rounded-3xl bg-primary-50/80 border border-primary-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-primary-900">
                Rekening Resmi Operasional Paguyuban:
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
                Single Official Account
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-surface border border-primary-200/80">
              <div className="space-y-1">
                <span className="text-[11px] text-ink-muted">Bank Central Asia (BCA) KCP Setiabudi</span>
                <p className="text-2xl font-black font-mono text-ink tracking-tight">8830-1928-33</p>
                <p className="text-xs font-bold text-primary-900">a.n PENGURUS KOMPLEK WARGAHUB</p>
              </div>

              <button
                type="button"
                onClick={() => handleCopyAccount('8830192833')}
                className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
              >
                {copiedAccount ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedAccount ? 'Tersalin!' : 'Salin No. Rekening'}</span>
              </button>
            </div>
            <p className="text-[11px] text-primary-900/80 leading-relaxed">
              ⚠️ <strong>Peringatan Penting:</strong> Pengurus komplek tidak pernah menerima pembayaran iuran melalui rekening pribadi individu selain rekening paguyuban di atas.
            </p>
          </div>

          {/* Audit Principles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-canvas border border-border space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-primary-100 text-primary-800 font-black flex items-center justify-center text-xs">1</span>
                <h4 className="font-bold text-ink">Rekonsiliasi Bank Bulanan</h4>
              </div>
              <p className="text-ink-muted leading-relaxed">
                Setiap akhir bulan, seluruh mutasi rekening koran BCA disandingkan 1-per-1 dengan kuitansi bukti pengeluaran riil satpam, truk sampah, dan PLN.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-canvas border border-border space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-primary-100 text-primary-800 font-black flex items-center justify-center text-xs">2</span>
                <h4 className="font-bold text-ink">Batasan Kas Kecil (Petty Cash)</h4>
              </div>
              <p className="text-ink-muted leading-relaxed">
                Uang tunai di pos jaga dibatasi maksimal Rp 2.000.000 untuk keperluan operasional darurat (solar genset, baut palang gerbang) dengan pembukuan struk.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-canvas border border-border space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-primary-100 text-primary-800 font-black flex items-center justify-center text-xs">3</span>
                <h4 className="font-bold text-ink">Audit Independen Triwulan</h4>
              </div>
              <p className="text-ink-muted leading-relaxed">
                Tiap 3 bulan, tim penilai independen dari perwakilan warga non-pengurus melakukan inspeksi fisik terhadap saldo bank dan bukti nota.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-canvas border border-border space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-primary-100 text-primary-800 font-black flex items-center justify-center text-xs">4</span>
                <h4 className="font-bold text-ink">Hak Akses & Transparansi Dokumen</h4>
              </div>
              <p className="text-ink-muted leading-relaxed">
                Seluruh warga berhak meminta salinan bukti pengeluaran dan kwitansi belanja dengan menghubungi bendahara atau sekretaris RT.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. EXPENSE DETAIL MODAL (RAW INVOICES / RECEIPTS VIEWER)                   */}
      {/* ========================================================================= */}
      {selectedExpenseCategory && (
        <ExpenseDetailModal
          isOpen={!!selectedExpenseCategory}
          onClose={() => setSelectedExpenseCategory(null)}
          categoryName={selectedExpenseCategory.name}
          percentage={selectedExpenseCategory.percentage}
          totalAmount={selectedExpenseCategory.amount}
        />
      )}

      {/* ========================================================================= */}
      {/* 5. SHARE MODAL                                                            */}
      {/* ========================================================================= */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-border shadow-modal space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-black text-ink">Bagikan Laporan Kas Warga</h3>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="p-1 rounded-lg text-ink-muted hover:text-ink hover:bg-canvas"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-ink-muted">
              Sebarkan tautan transparansi kas komplek ini ke grup WhatsApp RT/RW atau warga:
            </p>

            <div className="p-3 bg-canvas rounded-xl border border-border flex items-center justify-between gap-2">
              <span className="text-xs font-mono text-ink truncate">
                {typeof window !== 'undefined' ? window.location.href : 'https://wargahub.id/transparency'}
              </span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-lg shrink-0 transition-colors"
              >
                {copied ? 'Tersalin!' : 'Salin'}
              </button>
            </div>

            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                `Halo Bapak/Ibu Warga Komplek, berikut laporan transparansi keuangan paguyuban periode ${data.periodName}: https://wargahub.id/transparency`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Kirim ke WhatsApp Grup Warga</span>
            </a>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. CONFIRMATION SUCCESS MODAL                                             */}
      {/* ========================================================================= */}
      {confirmSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-border shadow-modal space-y-4 text-center">
            <div className="w-14 h-14 rounded-3xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-black text-ink">Konfirmasi Pembayaran Terkirim!</h3>
              <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                Data pembayaran untuk unit <strong>{confirmUnit}</strong> sebesar <strong>Rp {Number(confirmAmount).toLocaleString('id-ID')}</strong> telah masuk ke antrean verifikasi kasir/bendahara.
              </p>
            </div>

            <div className="p-3.5 bg-canvas rounded-2xl border border-border text-left text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-ink-muted">Pembayar:</span>
                <span className="font-bold text-ink">{confirmName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Periode:</span>
                <span className="font-bold text-ink">{confirmPeriod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Metode:</span>
                <span className="font-bold text-primary-700">
                  {confirmMethod === 'BCA_TRF' ? 'Transfer Bank BCA' : confirmMethod === 'QRIS' ? 'QRIS Paguyuban' : 'Tunai'}
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <a
                href={`https://api.whatsapp.com/send?phone=6281234567802&text=${encodeURIComponent(
                  `Halo Bendahara Komplek, saya telah mengirim konfirmasi transfer iuran via portal WargaHub:\n- Unit: ${confirmUnit}\n- Nama: ${confirmName}\n- Periode: ${confirmPeriod}\n- Nominal: Rp ${Number(confirmAmount).toLocaleString('id-ID')}\nMohon diverifikasi.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Kirim Bukti ke WhatsApp Bendahara</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  setConfirmSuccessModal(false);
                  setConfirmUnit('');
                  setConfirmName('');
                  setConfirmSenderRef('');
                  setConfirmFileUploaded(false);
                }}
                className="w-full py-2.5 bg-canvas hover:bg-surface border border-border text-ink font-bold text-xs rounded-xl transition-colors"
              >
                Tutup Jendela
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
