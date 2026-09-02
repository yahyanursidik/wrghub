import React, { useState, useMemo, useEffect } from 'react';
import {
  Home,
  CheckCircle2,
  Hourglass,
  Search,
  Filter,
  Share2,
  Copy,
  Check,
  Download,
  Printer,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Building,
  ShieldCheck,
  Receipt,
  Calendar,
  Send,
  Eye,
  CreditCard,
  QrCode,
  DollarSign,
  TrendingUp,
  Clock,
  Sparkles,
  AlertTriangle,
  MessageCircle,
  HelpCircle,
  Wallet,
  PhoneCall,
  Info
} from 'lucide-react';
import { formatRupiah } from '../../lib/format';

export interface PropertyDuesItem {
  code: string;
  number: string;
  block: string;
  ownerName: string;
  phone?: string;
  monthlyRate: number;
  unpaidMonthsCount: number; // 0 = Lunas, 1 = 1 Bulan ini, 2 = 2 Bulan, dst
  unpaidPeriodNames?: string[];
  totalDueAmount: number;
  status: 'PAID' | 'UNPAID';
  paidAt?: string;
  paymentMethod?: string;
  receiptNumber?: string;
}

export interface BankAccountInfo {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  qrisNmid?: string;
}

export const PublicDuesLedger: React.FC = () => {
  const activePeriod = 'Agustus 2026';

  // State
  const [activeTab, setActiveTab] = useState<'UNPAID' | 'PAID' | 'ALL'>('UNPAID');
  const [blockFilter, setBlockFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'code' | 'owner' | 'dueAmount' | 'status'>('code');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modals & Feedback
  const [selectedReceipt, setSelectedReceipt] = useState<PropertyDuesItem | null>(null);
  const [showPaymentInfoModal, setShowPaymentInfoModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Bank Info from LocalStorage or Default
  const [bankInfo, setBankInfo] = useState<BankAccountInfo>({
    bankName: 'Bank Central Asia (BCA)',
    accountNumber: '8830-1928-33',
    accountHolder: 'PENGURUS KOMPLEK WARGAHUB',
    qrisNmid: 'ID102008891230',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('wargahub_bank_accounts');
        if (saved) {
          const accounts = JSON.parse(saved);
          if (Array.isArray(accounts) && accounts.length > 0) {
            const primary = accounts.find((a: any) => a.isPrimary) || accounts[0];
            setBankInfo({
              bankName: primary.bankName || 'Bank Central Asia (BCA)',
              accountNumber: primary.accountNumber || '8830-1928-33',
              accountHolder: primary.accountHolder || 'PENGURUS KOMPLEK WARGAHUB',
              qrisNmid: primary.qrisNmid || 'ID102008891230',
            });
          }
        }
      } catch (e) {
        console.warn(e);
      }
    }
  }, []);

  // Generate All 123 Complex Properties with Real-time Sync with LocalStorage Payments
  const propertiesData: PropertyDuesItem[] = useMemo(() => {
    let verifiedCodes = new Set<string>();
    let deletedCodes = new Set<string>();

    if (typeof window !== 'undefined') {
      try {
        const paymentsStr = localStorage.getItem('wargahub_payments');
        if (paymentsStr) {
          const payments = JSON.parse(paymentsStr);
          if (Array.isArray(payments)) {
            payments.forEach((p: any) => {
              if (p.status === 'VERIFIED') {
                verifiedCodes.add(p.propertyCode.toUpperCase());
              }
            });
          }
        }

        const delProps = localStorage.getItem('wargahub_deleted_properties');
        if (delProps) {
          const parsed = JSON.parse(delProps);
          if (Array.isArray(parsed)) {
            parsed.forEach((id: string) => deletedCodes.add(id.toUpperCase()));
          }
        }
      } catch (e) {
        console.warn(e);
      }
    }

    const list: PropertyDuesItem[] = [];

    // Blok A (30 Units)
    for (let i = 1; i <= 30; i++) {
      const code = `A-${i.toString().padStart(2, '0')}`;
      if (deletedCodes.has(code)) continue;

      const isDefaultUnpaid = i === 12 || i === 24 || i === 18;
      const isPaid = verifiedCodes.has(code) || (!isDefaultUnpaid && !verifiedCodes.has(code));

      // Overdue mock
      const isMultiMonthOverdue = i === 24;
      const unpaidMonths = isPaid ? 0 : isMultiMonthOverdue ? 2 : 1;
      const periodNames = isPaid ? [] : isMultiMonthOverdue ? ['Juli 2026', 'Agustus 2026'] : ['Agustus 2026'];

      list.push({
        code,
        number: `${i}`,
        block: 'Blok A',
        ownerName: i === 17 ? 'Budi Santoso' : i === 1 ? 'Hendra Gunawan' : `Warga Blok A No. ${i}`,
        monthlyRate: 750000,
        unpaidMonthsCount: unpaidMonths,
        unpaidPeriodNames: periodNames,
        totalDueAmount: unpaidMonths * 750000,
        status: isPaid ? 'PAID' : 'UNPAID',
        paidAt: isPaid ? `2026-08-${(10 + (i % 12)).toString().padStart(2, '0')}` : undefined,
        paymentMethod: isPaid ? (i % 3 === 0 ? 'TUNAI_BENDAHARA' : 'BCA_TRANSFER') : undefined,
        receiptNumber: isPaid ? `KWT-202608-A${i}` : undefined,
      });
    }

    // Blok B (30 Units)
    for (let i = 1; i <= 30; i++) {
      const code = `B-${i.toString().padStart(2, '0')}`;
      if (deletedCodes.has(code)) continue;

      const isDefaultUnpaid = i === 5 || i === 18 || i === 29;
      const isPaid = verifiedCodes.has(code) || (!isDefaultUnpaid && !verifiedCodes.has(code));
      const isMultiMonthOverdue = i === 5;
      const unpaidMonths = isPaid ? 0 : isMultiMonthOverdue ? 3 : 1;
      const periodNames = isPaid ? [] : isMultiMonthOverdue ? ['Juni 2026', 'Juli 2026', 'Agustus 2026'] : ['Agustus 2026'];

      list.push({
        code,
        number: `${i}`,
        block: 'Blok B',
        ownerName: `Warga Blok B No. ${i}`,
        monthlyRate: 750000,
        unpaidMonthsCount: unpaidMonths,
        unpaidPeriodNames: periodNames,
        totalDueAmount: unpaidMonths * 750000,
        status: isPaid ? 'PAID' : 'UNPAID',
        paidAt: isPaid ? `2026-08-${(12 + (i % 10)).toString().padStart(2, '0')}` : undefined,
        paymentMethod: isPaid ? 'BCA_TRANSFER' : undefined,
        receiptNumber: isPaid ? `KWT-202608-B${i}` : undefined,
      });
    }

    // Blok C (30 Units)
    for (let i = 1; i <= 30; i++) {
      const code = `C-${i.toString().padStart(2, '0')}`;
      if (deletedCodes.has(code)) continue;

      const isDefaultUnpaid = i === 7 || i === 22;
      const isPaid = verifiedCodes.has(code) || (!isDefaultUnpaid && !verifiedCodes.has(code));
      const unpaidMonths = isPaid ? 0 : 1;

      list.push({
        code,
        number: `${i}`,
        block: 'Blok C',
        ownerName: `Warga Blok C No. ${i}`,
        monthlyRate: 750000,
        unpaidMonthsCount: unpaidMonths,
        unpaidPeriodNames: isPaid ? [] : ['Agustus 2026'],
        totalDueAmount: unpaidMonths * 750000,
        status: isPaid ? 'PAID' : 'UNPAID',
        paidAt: isPaid ? `2026-08-${(14 + (i % 8)).toString().padStart(2, '0')}` : undefined,
        paymentMethod: isPaid ? 'QRIS_DINAMIS' : undefined,
        receiptNumber: isPaid ? `KWT-202608-C${i}` : undefined,
      });
    }

    // Blok D (30 Units)
    for (let i = 1; i <= 30; i++) {
      const code = `D-${i.toString().padStart(2, '0')}`;
      if (deletedCodes.has(code)) continue;

      const isDefaultUnpaid = i === 14;
      const isPaid = verifiedCodes.has(code) || (!isDefaultUnpaid && !verifiedCodes.has(code));
      const unpaidMonths = isPaid ? 0 : 1;

      list.push({
        code,
        number: `${i}`,
        block: 'Blok D',
        ownerName: `Warga Blok D No. ${i}`,
        monthlyRate: 750000,
        unpaidMonthsCount: unpaidMonths,
        unpaidPeriodNames: isPaid ? [] : ['Agustus 2026'],
        totalDueAmount: unpaidMonths * 750000,
        status: isPaid ? 'PAID' : 'UNPAID',
        paidAt: isPaid ? `2026-08-${(11 + (i % 11)).toString().padStart(2, '0')}` : undefined,
        paymentMethod: isPaid ? 'BCA_TRANSFER' : undefined,
        receiptNumber: isPaid ? `KWT-202608-D${i}` : undefined,
      });
    }

    // Kavling Mandiri (10 Units)
    for (let i = 1; i <= 10; i++) {
      const code = `KAV-${i.toString().padStart(2, '0')}`;
      if (deletedCodes.has(code)) continue;

      const isDefaultUnpaid = i === 4;
      const isPaid = verifiedCodes.has(code) || (!isDefaultUnpaid && !verifiedCodes.has(code));
      const unpaidMonths = isPaid ? 0 : 1;

      list.push({
        code,
        number: `${i}`,
        block: 'Kavling Mandiri',
        ownerName: `Pemilik Kavling ${i}`,
        monthlyRate: 750000,
        unpaidMonthsCount: unpaidMonths,
        unpaidPeriodNames: isPaid ? [] : ['Agustus 2026'],
        totalDueAmount: unpaidMonths * 750000,
        status: isPaid ? 'PAID' : 'UNPAID',
        paidAt: isPaid ? `2026-08-${(15 + i).toString().padStart(2, '0')}` : undefined,
        paymentMethod: isPaid ? 'BCA_TRANSFER' : undefined,
        receiptNumber: isPaid ? `KWT-202608-KAV${i}` : undefined,
      });
    }

    // Jl. Sariwangi Indah 1 & 2 (13 Units)
    for (let i = 1; i <= 13; i++) {
      const isSw1 = i <= 6;
      const code = isSw1 ? `SW1-${i.toString().padStart(2, '0')}` : `SW2-${(i - 6).toString().padStart(2, '0')}`;
      if (deletedCodes.has(code)) continue;

      const streetName = isSw1 ? 'Jl. Sariwangi Indah 1' : 'Jl. Sariwangi Indah 2';
      list.push({
        code,
        number: `${i}`,
        block: streetName,
        ownerName: `Warga ${streetName} No. ${i}`,
        monthlyRate: 750000,
        unpaidMonthsCount: 0,
        unpaidPeriodNames: [],
        totalDueAmount: 0,
        status: 'PAID',
        paidAt: `2026-08-${(10 + (i % 8)).toString().padStart(2, '0')}`,
        paymentMethod: 'BCA_TRANSFER',
        receiptNumber: `KWT-202608-SW${i}`,
      });
    }

    return list;
  }, []);

  // Metrics Calculation
  const totalUnits = propertiesData.length;
  const paidCount = propertiesData.filter((p) => p.status === 'PAID').length;
  const unpaidCount = propertiesData.filter((p) => p.status === 'UNPAID').length;
  const paidPercentage = totalUnits > 0 ? (paidCount / totalUnits) * 100 : 0;
  const totalCollected = paidCount * 750000;
  const totalUnpaidAmount = propertiesData.reduce((sum, p) => sum + (p.status === 'UNPAID' ? p.totalDueAmount : 0), 0);

  // Filter & Sort Properties
  const filteredProperties = useMemo(() => {
    let list = propertiesData.filter((p) => {
      const matchTab = activeTab === 'ALL' || (activeTab === 'PAID' ? p.status === 'PAID' : p.status === 'UNPAID');
      const matchBlock = blockFilter === 'ALL' || p.block === blockFilter;
      const matchSearch =
        p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.block.toLowerCase().includes(searchTerm.toLowerCase());

      return matchTab && matchBlock && matchSearch;
    });

    list.sort((a, b) => {
      let comp = 0;
      if (sortBy === 'code') comp = a.code.localeCompare(b.code, undefined, { numeric: true });
      else if (sortBy === 'owner') comp = a.ownerName.localeCompare(b.ownerName);
      else if (sortBy === 'dueAmount') comp = a.totalDueAmount - b.totalDueAmount;
      else if (sortBy === 'status') comp = a.status.localeCompare(b.status);
      return sortOrder === 'asc' ? comp : -comp;
    });

    return list;
  }, [propertiesData, activeTab, blockFilter, searchTerm, sortBy, sortOrder]);

  // Pagination
  const totalFiltered = filteredProperties.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalFiltered);
  const paginatedProperties = filteredProperties.slice(startIndex, endIndex);

  // Copy Link
  const handleCopyLink = () => {
    const url = typeof window !== 'undefined' ? window.location.href : 'http://localhost:4321/rekap-iuran';
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    showToast('Tautan publik status iuran warga berhasil disalin!');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Kode Rumah / Unit', 'Blok / Jalan', 'Nama Pemilik', 'Nominal Tagihan (Rp)', 'Status Iuran', 'Bulan Menunggak', 'Tanggal Bayar', 'Metode Bayar', 'No. Kuitansi'];
    const rows = filteredProperties.map((p) => [
      p.code,
      `"${p.block}"`,
      `"${p.ownerName}"`,
      p.status === 'PAID' ? p.monthlyRate : p.totalDueAmount,
      p.status === 'PAID' ? 'LUNAS' : 'BELUM LUNAS',
      p.unpaidMonthsCount > 0 ? `"${p.unpaidPeriodNames?.join(', ')}"` : '-',
      p.paidAt || '-',
      p.paymentMethod || '-',
      p.receiptNumber || '-',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `STATUS_IURAN_WARGA_${activePeriod.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Daftar status iuran warga berhasil diunduh (CSV).');
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-xl font-bold text-xs animate-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Focus Header */}
      <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-900 font-black rounded-xl text-xs border border-emerald-300">
                📢 STATUS IURAN RESMI
              </span>
              <span className="px-3 py-1 bg-primary-50 text-primary-800 font-bold rounded-xl text-xs border border-primary-200">
                Periode: {activePeriod}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-ink mt-2">
              Informasi Pembayaran & Tunggakan Iuran Warga
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted mt-1 leading-relaxed max-w-2xl">
              Halaman khusus untuk memantau status kelunasan dan tagihan iuran komplek per unit rumah. Warga dapat memeriksa status rumah masing-masing, mengunduh kuitansi digital, dan melihat info rekening transfer resmi.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPaymentInfoModal(true)}
              className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-2 transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              <span>Cara Bayar & Rekening Kas</span>
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3.5 py-2.5 bg-surface hover:bg-canvas text-ink font-bold text-xs rounded-xl border border-border shadow-xs inline-flex items-center gap-1.5 transition-colors"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-ink-muted" />}
              <span>{copiedLink ? 'Tersalin!' : 'Salin Tautan'}</span>
            </button>
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                `📢 Status Iuran Warga Komplek - Periode ${activePeriod}\n\n• Sudah Lunas: ${paidCount} dari ${totalUnits} Rumah (${paidPercentage.toFixed(1)}%)\n• Menunggu Bayar / Menunggak: ${unpaidCount} Rumah\n• Nominal Iuran: Rp 750.000 / bulan\n• Rekening Kas BCA: ${bankInfo.accountNumber} a.n ${bankInfo.accountHolder}\n\nPeriksa daftar status unit Anda secara mandiri di:\nhttp://localhost:4321/rekap-iuran`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-2 transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Bagikan ke Grup WA</span>
            </a>
          </div>
        </div>

        {/* Realtime Participation Progress Bar */}
        <div className="p-4 sm:p-5 bg-canvas rounded-2xl border border-border space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div>
              <span className="text-lg sm:text-xl font-black text-ink">
                {paidCount} dari {totalUnits} Rumah ({paidPercentage.toFixed(1)}%) Sudah Lunas
              </span>
              <p className="text-ink-muted text-xs mt-0.5">
                Terkumpul: <strong className="text-emerald-700 font-mono">{formatRupiah(totalCollected)}</strong> • Sisa Tagihan Berjalan: <strong className="text-rose-700 font-mono">{formatRupiah(totalUnpaidAmount)}</strong>
              </p>
            </div>
            <span className={`px-3 py-1 rounded-xl text-xs font-black self-start sm:self-center ${
              paidPercentage >= 80 ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-amber-100 text-amber-900 border border-amber-300'
            }`}>
              {paidPercentage >= 80 ? '✓ Partisipasi Warga Sangat Baik' : '⏳ Pengumpulan Iuran Sedang Berjalan'}
            </span>
          </div>

          <div className="w-full bg-surface rounded-full h-3 overflow-hidden border border-border">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${paidPercentage}%` }}
            />
          </div>
        </div>

        {/* 3 Main Focused Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Card 1: Belum Lunas */}
          <div
            onClick={() => {
              setActiveTab('UNPAID');
              setCurrentPage(1);
            }}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'UNPAID'
                ? 'bg-rose-50/80 border-rose-400 ring-2 ring-rose-300 shadow-xs'
                : 'bg-surface border-border hover:bg-canvas'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-950 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-rose-600" />
                Belum Bayar / Menunggak
              </span>
              <span className="px-2 py-0.5 bg-rose-200 text-rose-900 font-black rounded text-[10px]">
                {unpaidCount} Unit
              </span>
            </div>
            <p className="text-2xl font-black text-rose-700 font-mono mt-2">
              {formatRupiah(totalUnpaidAmount)}
            </p>
            <span className="text-[11px] text-rose-800 mt-0.5 block">Klik untuk melihat daftar unit belum bayar</span>
          </div>

          {/* Card 2: Sudah Lunas */}
          <div
            onClick={() => {
              setActiveTab('PAID');
              setCurrentPage(1);
            }}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'PAID'
                ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-300 shadow-xs'
                : 'bg-surface border-border hover:bg-canvas'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Sudah Lunas Terverifikasi
              </span>
              <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 font-black rounded text-[10px]">
                {paidCount} Unit
              </span>
            </div>
            <p className="text-2xl font-black text-emerald-700 font-mono mt-2">
              {formatRupiah(totalCollected)}
            </p>
            <span className="text-[11px] text-emerald-800 mt-0.5 block">Klik untuk melihat kuitansi lunas</span>
          </div>

          {/* Card 3: Rekening Kas Paguyuban */}
          <div
            onClick={() => setShowPaymentInfoModal(true)}
            className="p-4 bg-surface rounded-2xl border border-border hover:bg-canvas transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-ink flex items-center gap-1.5">
                <Building className="w-4 h-4 text-primary-600" />
                Rekening Kas Paguyuban
              </span>
              <span className="px-2 py-0.5 bg-primary-50 text-primary-800 font-bold rounded text-[10px]">
                Info Transfer
              </span>
            </div>
            <p className="text-base font-black text-primary-800 font-mono mt-2 truncate">
              {bankInfo.bankName} {bankInfo.accountNumber}
            </p>
            <span className="text-[11px] text-ink-muted mt-0.5 block">a.n {bankInfo.accountHolder}</span>
          </div>
        </div>
      </div>

      {/* Focus Tabs & Filter Toolbar */}
      <div className="bg-surface p-4 rounded-3xl border border-border shadow-card flex flex-col sm:flex-row gap-3 items-center justify-between text-xs">
        {/* 3 Focused Sub-Tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto p-1 bg-canvas rounded-2xl border border-border">
          <button
            type="button"
            onClick={() => {
              setActiveTab('UNPAID');
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black transition-all ${
              activeTab === 'UNPAID'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Belum Bayar ({unpaidCount})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('PAID');
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black transition-all ${
              activeTab === 'PAID'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Sudah Lunas ({paidCount})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('ALL');
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black transition-all ${
              activeTab === 'ALL'
                ? 'bg-primary-700 text-white shadow-xs'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <span>Semua Rumah ({totalUnits})</span>
          </button>
        </div>

        {/* Search & Area Filter */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="relative w-full sm:w-56">
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari no. rumah (A-17, B-04)..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 bg-canvas border border-border rounded-xl text-xs text-ink placeholder:text-ink-muted"
            />
          </div>

          <select
            value={blockFilter}
            onChange={(e) => {
              setBlockFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
          >
            <option value="ALL">Semua Blok / Wilayah</option>
            <option value="Blok A">Blok A</option>
            <option value="Blok B">Blok B</option>
            <option value="Blok C">Blok C</option>
            <option value="Blok D">Blok D</option>
            <option value="Kavling Mandiri">Kavling Mandiri</option>
            <option value="Jl. Sariwangi Indah 1">Jl. Sariwangi Indah 1</option>
            <option value="Jl. Sariwangi Indah 2">Jl. Sariwangi Indah 2</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
          >
            <option value="code">Urut Nomor Rumah</option>
            <option value="owner">Urut Nama Pemilik</option>
            <option value="dueAmount">Urut Nominal Tagihan</option>
            <option value="status">Urut Status</option>
          </select>

          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2 bg-canvas border border-border rounded-xl text-ink-muted hover:text-ink"
            title={`Urutan: ${sortOrder === 'asc' ? 'Menaik' : 'Menurun'}`}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="p-2 bg-canvas border border-border rounded-xl text-ink-muted hover:text-ink"
            title="Unduh Rekap CSV"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Status Table */}
      <div className="bg-surface rounded-3xl border border-border shadow-card overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-canvas border-b border-border text-ink-muted font-bold">
              <tr>
                <th className="py-4 px-4">Nomor Unit / Rumah</th>
                <th className="py-4 px-4">Wilayah / Blok</th>
                <th className="py-4 px-4">Nama Warga</th>
                <th className="py-4 px-4 text-center">Status Pembayaran ({activePeriod})</th>
                <th className="py-4 px-4 text-right">Nominal Tagihan</th>
                <th className="py-4 px-4 text-center">Keterangan / Waktu</th>
                <th className="py-4 px-4 text-right">Aksi & Kuitansi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {paginatedProperties.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-ink-muted font-medium">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                    Tidak ada unit rumah yang sesuai dengan kriteria filter saat ini.
                  </td>
                </tr>
              ) : (
                paginatedProperties.map((p) => {
                  const isPaid = p.status === 'PAID';
                  return (
                    <tr key={p.code} className={`hover:bg-canvas/50 transition-colors ${!isPaid ? 'bg-rose-50/20' : ''}`}>
                      <td className="py-3.5 px-4 font-black text-sm font-mono text-primary-800">
                        Rumah {p.code}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-ink-muted">
                        {p.block}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-ink">
                        {p.ownerName}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {isPaid ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-black border border-emerald-300 inline-flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>LUNAS</span>
                          </span>
                        ) : p.unpaidMonthsCount > 1 ? (
                          <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-900 text-[10px] font-black border border-rose-300 inline-flex items-center gap-1 animate-pulse">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            <span>MENUNGGAK ({p.unpaidMonthsCount} BULAN)</span>
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-[10px] font-black border border-amber-300 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-700" />
                            <span>BELUM BAYAR</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right font-black font-mono">
                        {isPaid ? (
                          <span className="text-emerald-700">{formatRupiah(p.monthlyRate)}</span>
                        ) : (
                          <span className="text-rose-700">{formatRupiah(p.totalDueAmount)}</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {isPaid ? (
                          <div>
                            <span className="font-mono text-ink font-bold block">{p.paidAt}</span>
                            <span className="text-[10px] text-ink-muted">{p.paymentMethod?.replace('_', ' ')}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-rose-700 font-semibold block">
                            Tagihan: {p.unpaidPeriodNames?.join(', ')}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {isPaid ? (
                          <button
                            type="button"
                            onClick={() => setSelectedReceipt(p)}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl font-bold inline-flex items-center gap-1.5 text-xs shadow-2xs transition-colors"
                          >
                            <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Kuitansi</span>
                          </button>
                        ) : (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setShowPaymentInfoModal(true)}
                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[10px] shadow-2xs"
                            >
                              Bayar
                            </button>
                            <a
                              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                                `Halo Bpk/Ibu Warga Rumah ${p.code} (${p.ownerName}), mengingatkan bahwa iuran komplek periode ${p.unpaidPeriodNames?.join(', ')} sebesar ${formatRupiah(p.totalDueAmount)} dapat disetor ke Rekening BCA: ${bankInfo.accountNumber} a.n ${bankInfo.accountHolder}. Terima kasih banyak atas partisipasinya demi keamanan dan kebersihan komplek kita bersama.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg inline-flex items-center gap-1 font-bold text-[10px]"
                              title="Kirim Pesan Pengingat WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span>WA</span>
                            </a>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION CONTROLS */}
        <div className="p-4 border-t border-border bg-canvas/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-ink-muted">
              Menampilkan <strong className="text-ink">{totalFiltered === 0 ? 0 : startIndex + 1}</strong> - <strong className="text-ink">{endIndex}</strong> dari <strong className="text-ink">{totalFiltered}</strong> rumah
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
                <option value={15}>15</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
                <option value={120}>120</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              disabled={safeCurrentPage === 1}
              className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40"
              title="Awal"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(safeCurrentPage - 1)}
              disabled={safeCurrentPage === 1}
              className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40"
              title="Sebelumnya"
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
              title="Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(totalPages)}
              disabled={safeCurrentPage === totalPages}
              className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40"
              title="Akhir"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ================= MODAL: CARA BAYAR & REKENING RESMI ================= */}
      {showPaymentInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-border shadow-modal space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-base text-ink flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <span>Petunjuk Pembayaran Iuran Paguyuban</span>
              </h3>
              <button onClick={() => setShowPaymentInfoModal(false)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-black text-xs text-emerald-950">Rekening Transfer Resmi BCA:</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(bankInfo.accountNumber);
                    showToast('Nomor rekening BCA berhasil disalin!');
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-800 rounded-lg font-bold text-[10px] border border-emerald-300 inline-flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" /> Salin No. Rekening
                </button>
              </div>

              <div>
                <p className="text-xl font-black font-mono text-emerald-800">{bankInfo.accountNumber}</p>
                <p className="text-xs font-bold text-emerald-950 mt-0.5">{bankInfo.bankName}</p>
                <p className="text-[11px] text-emerald-800">a.n <strong>{bankInfo.accountHolder}</strong></p>
              </div>

              <div className="pt-2 border-t border-emerald-200/80 text-[11px] text-emerald-900 leading-relaxed">
                <strong>Format Berita Transfer:</strong><br />
                Cantumkan nomor rumah saat transfer (Contoh: <code>IPL A17 AGUSTUS</code>).
              </div>
            </div>

            {/* QRIS Support */}
            <div className="p-4 bg-canvas rounded-2xl border border-border flex items-center justify-between gap-3">
              <div>
                <span className="font-bold text-ink block text-xs">Mendukung Pembayaran QRIS</span>
                <p className="text-[11px] text-ink-muted mt-0.5">Scan via GoPay, OVO, ShopeePay, BCA Mobile, Livin', dll.</p>
                <span className="text-[10px] font-mono text-primary-700 font-bold block mt-1">NMID: {bankInfo.qrisNmid || 'ID102008891230'}</span>
              </div>
              <div className="w-14 h-14 bg-white rounded-xl border border-border p-1 flex items-center justify-center shrink-0">
                <QrCode className="w-full h-full text-slate-800" />
              </div>
            </div>

            <div className="space-y-1 text-ink-muted text-[11px]">
              <p>• Setelah transfer, pembayaran akan diverifikasi bendahara dan otomatis berstatus <strong>LUNAS</strong> di halaman ini.</p>
              <p>• Kuitansi resmi ber-QR Code dapat langsung diunduh setelah terverifikasi.</p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowPaymentInfoModal(false)}
                className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-xs"
              >
                Saya Mengerti & Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: KUITANSI DIGITAL RESMI ================= */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-border shadow-modal space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-black text-sm text-ink">Kuitansi Pembayaran Iuran Warga</h3>
                <p className="text-[11px] text-ink-muted">No. Seri: {selectedReceipt.receiptNumber}</p>
              </div>
              <button onClick={() => setSelectedReceipt(null)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            <div className="p-4 bg-canvas rounded-2xl border border-border space-y-2">
              <div className="flex justify-between">
                <span className="text-ink-muted">Unit Rumah:</span>
                <span className="font-black text-ink font-mono">{selectedReceipt.code} ({selectedReceipt.block})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Nama Warga / Pemilik:</span>
                <span className="font-bold text-ink">{selectedReceipt.ownerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Periode Iuran:</span>
                <span className="font-bold text-primary-700">{activePeriod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Tanggal Setor:</span>
                <span className="font-mono text-ink">{selectedReceipt.paidAt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Metode Pembayaran:</span>
                <span className="font-semibold text-ink">{selectedReceipt.paymentMethod?.replace('_', ' ')}</span>
              </div>
              <div className="pt-2 border-t border-border flex justify-between items-center">
                <span className="font-bold text-ink">Jumlah Terbayar:</span>
                <span className="font-black text-base text-emerald-700 font-mono">{formatRupiah(selectedReceipt.monthlyRate)}</span>
              </div>
            </div>

            {/* QR Code & Verified Stamp */}
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="font-black text-emerald-950 text-xs">LUNAS & TERVERIFIKASI</span>
                </div>
                <p className="text-[10px] text-emerald-800">
                  {bankInfo.bankName}: {bankInfo.accountNumber}
                </p>
              </div>
              <div className="w-12 h-12 bg-white rounded-xl border border-emerald-300 p-1 flex items-center justify-center shrink-0">
                <QrCode className="w-full h-full text-emerald-800" />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-xs inline-flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Cetak Kuitansi (PDF)
              </button>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
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
