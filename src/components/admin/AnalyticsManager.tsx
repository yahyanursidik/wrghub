import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  BarChart3,
  PieChart,
  Users,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Share2,
  Copy,
  ExternalLink,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Search,
  Filter,
  Building,
  Check,
  Receipt,
  CreditCard,
  Banknote,
  Eye,
  ShieldCheck,
  Clock,
  Sparkles,
  Zap,
  Droplets,
  Car,
  AlertCircle,
  MessageSquare,
  Star,
  Activity,
  Calendar,
  FileText
} from 'lucide-react';
import { formatRupiah } from '../../lib/format';

interface HistoricalTrendItem {
  id: string;
  month: string;
  income: number;
  expense: number;
  net: number;
  rate: number;
  status: string;
}

interface BlockComplianceItem {
  block: string;
  totalUnits: number;
  paidUnits: number;
  unpaidUnits: number;
  rate: number;
  collectedAmount: number;
  unpaidAmount: number;
  color: string;
}

export const AnalyticsManager: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('6_MONTHS');
  const [activeSubTab, setActiveSubTab] = useState<'financial_trends' | 'block_compliance' | 'utility_efficiency' | 'security_sla' | 'public_transparency'>('financial_trends');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'month' | 'income' | 'expense' | 'net' | 'rate'>('month');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination State for Historical Data
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals & Feedback
  const [showSnapshotModal, setShowSnapshotModal] = useState(false);
  const [showExecutiveReport, setShowExecutiveReport] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [savingSnapshot, setSavingSnapshot] = useState(false);

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Historical Trends Data
  const [historicalTrends] = useState<HistoricalTrendItem[]>([
    { id: 'TRD-001', month: 'Maret 2026', income: 84000000, expense: 38200000, net: 45800000, rate: 93.3, status: 'Surplus Sehat' },
    { id: 'TRD-002', month: 'April 2026', income: 86250000, expense: 39100000, net: 47150000, rate: 95.8, status: 'Surplus Sehat' },
    { id: 'TRD-003', month: 'Mei 2026', income: 87750000, expense: 41200000, net: 46550000, rate: 97.5, status: 'Surplus Sehat' },
    { id: 'TRD-004', month: 'Juni 2026', income: 85500000, expense: 38900000, net: 46600000, rate: 95.0, status: 'Surplus Sehat' },
    { id: 'TRD-005', month: 'Juli 2026', income: 88500000, expense: 40100000, net: 48400000, rate: 98.3, status: 'Surplus Sangat Baik' },
    { id: 'TRD-006', month: 'Agustus 2026', income: 90000000, expense: 39150000, net: 50850000, rate: 94.2, status: 'Surplus Prima' },
  ]);

  // Block & Area Compliance Data (supporting Blok, Kavling, and Jalan)
  const [blockCompliance] = useState<BlockComplianceItem[]>([
    { block: 'Blok A (Jl. Utama)', totalUnits: 30, paidUnits: 29, unpaidUnits: 1, rate: 96.7, collectedAmount: 21750000, unpaidAmount: 750000, color: 'bg-emerald-500' },
    { block: 'Blok B (Taman Barat)', totalUnits: 30, paidUnits: 27, unpaidUnits: 3, rate: 90.0, collectedAmount: 20250000, unpaidAmount: 2250000, color: 'bg-blue-500' },
    { block: 'Blok C (Area Balai)', totalUnits: 30, paidUnits: 28, unpaidUnits: 2, rate: 93.3, collectedAmount: 21000000, unpaidAmount: 1500000, color: 'bg-amber-500' },
    { block: 'Blok D (Taman Timur)', totalUnits: 30, paidUnits: 29, unpaidUnits: 1, rate: 96.7, collectedAmount: 21750000, unpaidAmount: 750000, color: 'bg-purple-500' },
    { block: 'Kavling Mandiri (KAV 1-10)', totalUnits: 10, paidUnits: 9, unpaidUnits: 1, rate: 90.0, collectedAmount: 6750000, unpaidAmount: 750000, color: 'bg-teal-500' },
    { block: 'Jl. Sariwangi Indah 1 & 2', totalUnits: 13, paidUnits: 13, unpaidUnits: 0, rate: 100.0, collectedAmount: 9750000, unpaidAmount: 0, color: 'bg-indigo-500' },
  ]);

  // Utility Efficiency Data
  const utilityMetrics = [
    { title: 'Konsumsi Listrik PLN PJU & Pos Jaga', current: '2.840 kWh', prev: '3.120 kWh', change: '-8.9% (Hemat)', icon: Zap, status: 'Efisien' },
    { title: 'Konsumsi Air PAM Taman & Balai Warga', current: '142 m³', prev: '158 m³', change: '-10.1% (Hemat)', icon: Droplets, status: 'Efisien' },
    { title: 'Total Tap Kartu RFID Masuk Barrier Gate', current: '14.820 Tap', prev: '13.950 Tap', change: '+6.2% (Tinggi)', icon: Car, status: 'Tertib' },
  ];

  // Security & SLA Metrics
  const securityMetrics = [
    { title: 'SLA Kecepatan Respon Aduan Warga', value: '1.4 Jam', target: '< 3.0 Jam', status: 'SANGAT CEPAT', icon: Clock },
    { title: 'Tingkat Penyelesaian Aduan (28/29 Selesai)', value: '96.5%', target: '> 95.0%', status: 'TARGET TERCAPAI', icon: CheckCircle2 },
    { title: 'Indeks Kepuasan Pelayanan Satpam & Pengurus', value: '4.8 / 5.0 ★', target: '> 4.5 ★', status: 'SANGAT PUAS', icon: Star },
    { title: 'Buku Tamu Pos Satpam Terverifikasi QR Pass', value: '100.0%', target: '100%', status: 'AMAN TERPANTAU', icon: ShieldCheck },
  ];

  // Totals
  const totalIncome = historicalTrends.reduce((acc, h) => acc + h.income, 0);
  const totalExpense = historicalTrends.reduce((acc, h) => acc + h.expense, 0);
  const totalNet = totalIncome - totalExpense;
  const avgCompliance = (historicalTrends.reduce((sum, h) => sum + h.rate, 0) / historicalTrends.length).toFixed(1);

  // Filter & Sort Historical Trends
  const filteredAndSortedTrends = useMemo(() => {
    const list = historicalTrends.filter((h) => {
      const matchSearch = h.month.toLowerCase().includes(search.toLowerCase()) || h.status.toLowerCase().includes(search.toLowerCase());
      return matchSearch;
    });

    list.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'month') comparison = a.month.localeCompare(b.month);
      else if (sortBy === 'income') comparison = a.income - b.income;
      else if (sortBy === 'expense') comparison = a.expense - b.expense;
      else if (sortBy === 'net') comparison = a.net - b.net;
      else if (sortBy === 'rate') comparison = a.rate - b.rate;
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return list;
  }, [historicalTrends, search, sortBy, sortOrder]);

  // Pagination for Trends Table
  const totalFiltered = filteredAndSortedTrends.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalFiltered);
  const paginatedTrends = filteredAndSortedTrends.slice(startIndex, endIndex);

  // Copy Public Link
  const publicTransparencyUrl = 'http://localhost:4321/transparency';
  const handleCopyPublicLink = () => {
    navigator.clipboard.writeText(publicTransparencyUrl);
    setCopiedLink(true);
    showToast('Tautan publik transparansi keuangan berhasil disalin!');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Handle Save Snapshot
  const handleSaveSnapshot = async () => {
    setSavingSnapshot(true);
    try {
      const res = await fetch('/api/analytics/snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period: 'Agustus 2026',
          complianceRate: Number(avgCompliance),
          totalIncome,
          totalExpense,
          netSurplus: totalNet,
          complaintsResolvedPct: 96.5,
          notes: 'Snapshot performa tata kelola dan kesehatan kas komplek.',
        }),
      });

      if (res.ok) {
        showToast('Snapshot evaluasi analitik berhasil disimpan ke Jejak Audit.');
        setShowSnapshotModal(false);
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan snapshot.');
    } finally {
      setSavingSnapshot(false);
    }
  };

  // Export CSV
  const exportCSV = () => {
    const headers = ['Periode', 'Pemasukan Kas (Rp)', 'Pengeluaran Belanja (Rp)', 'Surplus Bersih (Rp)', 'Tingkat Kepatuhan (%)', 'Status Kas'];
    const rows = filteredAndSortedTrends.map((h) => [
      h.month,
      h.income,
      h.expense,
      h.net,
      `${h.rate}%`,
      `"${h.status}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LAPORAN_ANALITIK_TREN_WARGAHUB_${new Date().toISOString().slice(0, 7)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Laporan analitik tren finansial berhasil diekspor ke CSV.');
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
              <TrendingUp className="w-6 h-6 text-primary-600" />
              Analitik Tren Finansial & Tata Kelola Komplek
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black border border-emerald-200">
              Kepatuhan Rata-rata: {avgCompliance}%
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Executive Dashboard: Evaluasi performa arus kas multi-bulan, disiplin pembayaran per blok/kavling, efisiensi energi fasum, dan SLA keamanan lingkungan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-surface hover:bg-canvas border border-border text-ink text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-ink-muted" />
            Ekspor Analitik (CSV)
          </button>
          <button
            type="button"
            onClick={() => setShowExecutiveReport(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            Laporan Eksekutif (PDF)
          </button>
          <button
            type="button"
            onClick={() => setShowSnapshotModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Simpan Snapshot
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
              Warga dapat melihat ringkasan keuangan, laporan nota belanja, dan status lunas per unit secara terbuka di portal transparansi.
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
          <span className="text-[11px] font-semibold text-ink-muted">Akumulasi Pemasukan (6 Bln)</span>
          <p className="text-xl font-black text-ink mt-1 tabular-nums">{formatRupiah(totalIncome)}</p>
          <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
            <ArrowUpRight className="w-3.5 h-3.5" /> Rata-rata Rp 87.0 Jt / bln
          </span>
        </div>

        <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
          <span className="text-[11px] font-semibold text-ink-muted">Akumulasi Belanja (6 Bln)</span>
          <p className="text-xl font-black text-rose-700 mt-1 tabular-nums">{formatRupiah(totalExpense)}</p>
          <span className="text-[10px] text-ink-muted mt-0.5 block">Rasio Belanja: 45.3%</span>
        </div>

        <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
          <span className="text-[11px] font-semibold text-ink-muted">Surplus Akumulatif (Net Kas)</span>
          <p className="text-xl font-black text-emerald-700 mt-1 tabular-nums">+{formatRupiah(totalNet)}</p>
          <span className="text-[10px] text-emerald-600 font-bold mt-0.5 block">Keuangan Sangat Sehat</span>
        </div>

        <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
          <span className="text-[11px] font-semibold text-ink-muted">Kepuasan & SLA Aduan</span>
          <p className="text-xl font-black text-primary-700 mt-1 tabular-nums">4.8 / 5.0 ★</p>
          <span className="text-[10px] text-emerald-700 font-bold mt-0.5 block">Respon: 1.4 Jam Rata-rata</span>
        </div>
      </div>

      {/* 5 Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 p-1.5 bg-surface rounded-2xl border border-border shadow-xs overflow-x-auto no-scrollbar">
        {[
          { id: 'financial_trends', label: 'Tren Finansial & Arus Kas', icon: TrendingUp, count: historicalTrends.length },
          { id: 'block_compliance', label: 'Disiplin Pembayaran per Blok / Wilayah', icon: Layers, count: blockCompliance.length },
          { id: 'utility_efficiency', label: 'Utilitas & Efisiensi Energi Fasum', icon: Zap, count: utilityMetrics.length },
          { id: 'security_sla', label: 'SLA Keamanan & Respon Aduan', icon: ShieldCheck, count: securityMetrics.length },
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

      {/* ================= SUBTAB 1: TREN FINANSIAL ================= */}
      {activeSubTab === 'financial_trends' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden text-xs">
            <div className="p-4 border-b border-border bg-canvas/30 flex flex-col sm:flex-row items-center justify-between gap-3">
              <h3 className="font-bold text-sm text-ink flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary-600" />
                Kinerja Finansial Multi-Periode Bulanan
              </h3>

              <div className="flex items-center gap-2">
                <div className="relative w-48">
                  <Search className="w-3.5 h-3.5 text-ink-muted absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Cari bulan..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-surface border border-border rounded-xl text-xs text-ink"
                  />
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-2.5 py-1.5 bg-surface border border-border rounded-xl font-bold text-ink text-xs"
                >
                  <option value="month">Urut Bulan</option>
                  <option value="income">Urut Pemasukan</option>
                  <option value="expense">Urut Pengeluaran</option>
                  <option value="net">Urut Surplus</option>
                  <option value="rate">Urut % Disiplin</option>
                </select>

                <button
                  type="button"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-1.5 bg-surface border border-border rounded-xl text-ink-muted hover:text-ink"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-canvas border-b border-border text-ink-muted font-bold">
                  <tr>
                    <th className="py-3.5 px-4">Periode</th>
                    <th className="py-3.5 px-4 text-right">Pemasukan Kas</th>
                    <th className="py-3.5 px-4 text-right">Realisasi Belanja</th>
                    <th className="py-3.5 px-4 text-right">Surplus Bersih</th>
                    <th className="py-3.5 px-4 text-center">Tingkat Disiplin</th>
                    <th className="py-3.5 px-4 text-center">Evaluasi Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {paginatedTrends.map((h) => (
                    <tr key={h.id} className="hover:bg-canvas/50 transition-colors">
                      <td className="py-3.5 px-4 font-black text-ink">{h.month}</td>
                      <td className="py-3.5 px-4 text-right font-medium tabular-nums text-ink font-mono">{formatRupiah(h.income)}</td>
                      <td className="py-3.5 px-4 text-right font-medium tabular-nums text-rose-700 font-mono">{formatRupiah(h.expense)}</td>
                      <td className="py-3.5 px-4 text-right font-black tabular-nums text-emerald-600 font-mono">+{formatRupiah(h.net)}</td>
                      <td className="py-3.5 px-4 text-center font-bold tabular-nums text-ink font-mono">{h.rate}%</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[10px] font-black border border-emerald-300">
                          ✓ {h.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUBTAB 2: KEPATUHAN BLOK ================= */}
      {activeSubTab === 'block_compliance' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="p-6 bg-surface rounded-3xl border border-border shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-black text-sm text-ink flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary-600" />
                  Perbandingan Tingkat Kepatuhan Pembayaran Antar Wilayah & Blok Hunian
                </h3>
                <p className="text-xs text-ink-muted mt-0.5">Monitoring kedisiplinan 123 unit rumah (Blok A, B, C, D, Kavling Mandiri, dan Jl. Sariwangi Indah).</p>
              </div>
              <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                Rata-rata Komplek: {avgCompliance}%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {blockCompliance.map((b) => (
                <div key={b.block} className="p-4 bg-canvas rounded-2xl border border-border space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-ink">{b.block}</span>
                    <span className="font-black text-xs tabular-nums text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      {b.rate.toFixed(1)}%
                    </span>
                  </div>

                  <div className="bg-surface rounded-full h-2.5 overflow-hidden border border-border">
                    <div className={`h-full rounded-full ${b.color}`} style={{ width: `${b.rate}%` }} />
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-emerald-700">✓ {b.paidUnits} Lunas ({formatRupiah(b.collectedAmount)})</span>
                    <span className="text-rose-700 font-bold">{b.unpaidUnits} Tertunda</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= SUBTAB 3: UTILITAS & EFISIENSI ================= */}
      {activeSubTab === 'utility_efficiency' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="p-6 bg-surface rounded-3xl border border-border shadow-card space-y-4">
            <h3 className="font-black text-sm text-ink flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Monitoring Efisiensi Konsumsi Energi & Fasilitas Umum
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {utilityMetrics.map((u, idx) => {
                const Icon = u.icon;
                return (
                  <div key={idx} className="p-4 bg-canvas rounded-2xl border border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-black">
                        {u.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-ink text-xs">{u.title}</h4>
                      <p className="text-xl font-black text-ink font-mono mt-1">{u.current}</p>
                      <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">
                        {u.change} dibandingkan bulan sebelumnya ({u.prev})
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= SUBTAB 4: SLA KEAMANAN & ADUAN ================= */}
      {activeSubTab === 'security_sla' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="p-6 bg-surface rounded-3xl border border-border shadow-card space-y-4">
            <h3 className="font-black text-sm text-ink flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Standar Layanan Aduan Warga & Kinerja Keamanan Satpam
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {securityMetrics.map((s, idx) => {
                const Icon = s.icon;
                return (
                  <div key={idx} className="p-4 bg-canvas rounded-2xl border border-border space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] text-ink-muted font-semibold block">{s.title}</span>
                    <p className="text-xl font-black text-ink font-mono">{s.value}</p>
                    <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded block w-fit">
                      {s.status} (Target: {s.target})
                    </span>
                  </div>
                );
              })}
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

      {/* ================= MODAL: SIMPAN SNAPSHOT ================= */}
      {showSnapshotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-border shadow-modal space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-sm text-ink">Simpan Snapshot Kinerja Bulanan</h3>
              <button onClick={() => setShowSnapshotModal(false)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            <div className="p-3 bg-canvas rounded-2xl border border-border space-y-1.5">
              <div className="flex justify-between">
                <span className="text-ink-muted">Periode:</span>
                <span className="font-black text-ink">Agustus 2026</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Tingkat Kepatuhan:</span>
                <span className="font-bold text-emerald-700">{avgCompliance}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Total Pemasukan:</span>
                <span className="font-mono font-bold text-ink">{formatRupiah(totalIncome)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Surplus Bersih:</span>
                <span className="font-mono font-black text-emerald-700">+{formatRupiah(totalNet)}</span>
              </div>
            </div>

            <p className="text-ink-muted text-[11px]">
              Snapshot ini akan diarsipkan ke basis data Jejak Audit sebagai acuan rapat pertanggungjawaban pengurus komplek.
            </p>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setShowSnapshotModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={savingSnapshot}
                onClick={handleSaveSnapshot}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs disabled:opacity-50"
              >
                {savingSnapshot ? 'Menyimpan...' : 'Simpan Snapshot'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: LAPORAN EKSEKUTIF (PDF) ================= */}
      {showExecutiveReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-lg w-full p-6 border border-border shadow-modal space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-black text-sm text-ink">Laporan Ringkasan Eksekutif Tata Kelola Komplek</h3>
                <p className="text-[11px] text-ink-muted">WargaHub Smart Residential Estate • Periode 2026</p>
              </div>
              <button onClick={() => setShowExecutiveReport(false)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            <div className="p-4 bg-canvas rounded-2xl border border-border space-y-2.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-surface rounded-xl border border-border">
                  <span className="text-[10px] text-ink-muted block">Akumulasi Pemasukan:</span>
                  <span className="font-black font-mono text-ink text-sm">{formatRupiah(totalIncome)}</span>
                </div>
                <div className="p-2.5 bg-surface rounded-xl border border-border">
                  <span className="text-[10px] text-ink-muted block">Surplus Bersih Kas:</span>
                  <span className="font-black font-mono text-emerald-700 text-sm">+{formatRupiah(totalNet)}</span>
                </div>
              </div>

              <div className="space-y-1 pt-1 border-t border-border">
                <div className="flex justify-between">
                  <span className="text-ink-muted">Tingkat Kedisiplinan Warga:</span>
                  <span className="font-black text-emerald-700">{avgCompliance}% (Sangat Tertib)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">SLA Penyelesaian Aduan:</span>
                  <span className="font-bold text-ink">96.5% Selesai Tepat Waktu</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Skor Kepuasan Pelayanan:</span>
                  <span className="font-bold text-amber-700">4.8 / 5.0 Bintang ★</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-emerald-950 text-[11px]">Laporan Sah & Terverifikasi Digital</p>
                <p className="text-emerald-800 text-[10px]">Ketua RW 05, Bendahara & Dewan Pengawas Komplek</p>
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
                onClick={() => setShowExecutiveReport(false)}
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
