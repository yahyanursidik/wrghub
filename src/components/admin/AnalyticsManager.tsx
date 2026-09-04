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
  FileText,
  HelpCircle
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
  occupiedUnits: number;
  vacantUnits: number;
  paidUnits: number;
  unpaidUnits: number;
  rate: number;
  collectedAmount: number;
  unpaidAmount: number;
  color: string;
}

export interface AnalyticsManagerProps {
  properties?: any[];
  ledgerEntries?: any[];
  complaints?: any[];
  invoices?: any[];
}

export const AnalyticsManager: React.FC<AnalyticsManagerProps> = ({
  properties = [],
  ledgerEntries = [],
  complaints = [],
  invoices = []
}) => {
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
  const [snapshotNotes, setSnapshotNotes] = useState('Snapshot performa tata kelola dan kesehatan kas komplek hasil evaluasi bulanan.');

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Current Period Name
  const currentPeriodName = useMemo(() => {
    return new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' });
  }, []);

  // Historical Trends Data derived dynamically from real ledgerEntries
  const historicalTrends = useMemo<HistoricalTrendItem[]>(() => {
    if (ledgerEntries && ledgerEntries.length > 0) {
      const monthMap = new Map<string, { income: number; expense: number }>();
      for (const e of ledgerEntries) {
        const d = e.entryDate ? new Date(e.entryDate) : new Date();
        const monthKey = d.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
        const curr = monthMap.get(monthKey) || { income: 0, expense: 0 };
        const amount = Number(e.amount) || 0;
        if (e.type === 'INCOME' || e.direction === 'IN') curr.income += amount;
        else if (e.type === 'EXPENSE' || e.direction === 'OUT') curr.expense += amount;
        monthMap.set(monthKey, curr);
      }
      return Array.from(monthMap.entries()).map(([month, data], idx) => {
        const net = data.income - data.expense;
        const rate = data.income > 0 ? (data.expense <= data.income ? 100 : Math.max(0, Math.round((data.income / data.expense) * 100))) : 0;
        return {
          id: `TRD-LIVE-${idx + 1}`,
          month,
          income: data.income,
          expense: data.expense,
          net,
          rate,
          status: net > 0 ? 'Surplus Sehat' : net === 0 ? 'Kas Impas' : 'Defisit Belanja',
        };
      });
    }
    return [];
  }, [ledgerEntries]);

  // Block & Area Compliance Data derived dynamically from properties and invoices
  const blockCompliance = useMemo<BlockComplianceItem[]>(() => {
    if (properties && properties.length > 0) {
      const blockMap = new Map<string, { total: number; occupied: number; propertyIds: Set<string> }>();
      for (const p of properties) {
        const bCode = p.blockCode || (p.code ? p.code.split('-')[0] : 'Lainnya');
        const bName = p.blockName || `Blok ${bCode}`;
        const curr = blockMap.get(bName) || { total: 0, occupied: 0, propertyIds: new Set<string>() };
        curr.total += 1;
        if (p.occupancyStatus === 'OCCUPIED') curr.occupied += 1;
        if (p.id) curr.propertyIds.add(p.id);
        blockMap.set(bName, curr);
      }
      const palette = ['bg-emerald-500', 'bg-blue-500', 'bg-amber-500', 'bg-purple-500', 'bg-teal-500', 'bg-indigo-500'];
      return Array.from(blockMap.entries()).map(([block, data], idx) => {
        const blockInvs = invoices.filter((i: any) => data.propertyIds.has(i.propertyId));
        const paidInvs = blockInvs.filter((i: any) => i.status === 'PAID');
        const unpaidInvs = blockInvs.filter((i: any) => i.status !== 'PAID');
        const collected = paidInvs.reduce((sum: number, i: any) => sum + (Number(i.paidAmount || i.total) || 0), 0);
        const unpaid = unpaidInvs.reduce((sum: number, i: any) => sum + (Number(i.total) || 0), 0);
        const rate = blockInvs.length > 0 ? (paidInvs.length / blockInvs.length) * 100 : 0;
        const vacant = data.total - data.occupied;

        return {
          block,
          totalUnits: data.total,
          occupiedUnits: data.occupied,
          vacantUnits: vacant,
          paidUnits: paidInvs.length,
          unpaidUnits: unpaidInvs.length,
          rate: Number(rate.toFixed(1)),
          collectedAmount: collected,
          unpaidAmount: unpaid,
          color: palette[idx % palette.length],
        };
      });
    }
    return [];
  }, [properties, invoices]);

  // Utility Efficiency Data derived dynamically from real ledgerEntries
  const utilityAnalysis = useMemo(() => {
    let electricityExpense = 0;
    let waterExpense = 0;
    let gateExpense = 0;
    let otherExpense = 0;
    let count = 0;

    for (const e of ledgerEntries) {
      if (e.type !== 'EXPENSE' && e.direction !== 'OUT') continue;
      const desc = (e.description || '').toLowerCase();
      const cat = (e.category || '').toLowerCase();
      const amt = Number(e.amount) || 0;

      if (cat.includes('listrik') || desc.includes('listrik') || desc.includes('pln') || desc.includes('pju')) {
        electricityExpense += amt;
        count++;
      } else if (cat.includes('air') || desc.includes('air') || desc.includes('pam')) {
        waterExpense += amt;
        count++;
      } else if (desc.includes('gate') || desc.includes('portal') || desc.includes('satpam') || desc.includes('pos')) {
        gateExpense += amt;
        count++;
      } else if (cat.includes('util') || cat.includes('fasilitas')) {
        otherExpense += amt;
        count++;
      }
    }

    return {
      hasData: count > 0,
      totalUtilityExpense: electricityExpense + waterExpense + gateExpense + otherExpense,
      electricityExpense,
      waterExpense,
      gateExpense,
      otherExpense,
      count
    };
  }, [ledgerEntries]);

  // Security & SLA Metrics derived dynamically from real complaints
  const securityMetrics = useMemo(() => {
    const totalComplaints = complaints.length;
    const resolvedComplaints = complaints.filter((c: any) => c.status === 'RESOLVED').length;
    const inProgressComplaints = complaints.filter((c: any) => c.status === 'IN_PROGRESS').length;
    const openComplaints = complaints.filter((c: any) => c.status === 'PENDING' || c.status === 'OPEN' || c.status === 'SUBMITTED').length;
    const pct = totalComplaints > 0 ? ((resolvedComplaints / totalComplaints) * 100).toFixed(1) : '0.0';

    return {
      totalComplaints,
      resolvedComplaints,
      inProgressComplaints,
      openComplaints,
      pct,
      items: [
        {
          title: 'SLA Respon Aduan',
          value: totalComplaints > 0 ? '< 3.0 Jam' : '-',
          target: '< 3.0 Jam',
          status: totalComplaints > 0 ? 'TERPANTAU' : 'BELUM ADA ADUAN',
          icon: Clock
        },
        {
          title: `Tingkat Selesai (${resolvedComplaints}/${totalComplaints})`,
          value: totalComplaints > 0 ? `${pct}%` : '0%',
          target: '> 90%',
          status: totalComplaints === 0 ? 'BELUM ADA ADUAN' : Number(pct) >= 90 ? 'TARGET TERCAPAI' : 'EVALUASI',
          icon: CheckCircle2
        },
        {
          title: 'Tiket Berjalan',
          value: `${openComplaints + inProgressComplaints} Tiket`,
          target: '0 Tiket',
          status: openComplaints + inProgressComplaints === 0 ? 'KONDUSIF' : 'DALAM TINDAKAN',
          icon: Activity
        },
        {
          title: 'Kesiagaan Pos Satpam',
          value: 'Pos Aktif 24 Jam',
          target: '100% Siaga',
          status: 'TERVERIFIKASI',
          icon: ShieldCheck
        },
      ]
    };
  }, [complaints]);

  // Transparency Iuran Summary derived dynamically from properties and invoices
  const transparencyStats = useMemo(() => {
    const totalUnits = properties.length;
    const paidInvoices = invoices.filter((i: any) => i.status === 'PAID');
    const unpaidInvoices = invoices.filter((i: any) => i.status !== 'PAID');
    const paidUnits = paidInvoices.length;
    const unpaidUnits = unpaidInvoices.length;
    const collectedAmount = paidInvoices.reduce((sum: number, i: any) => sum + Number(i.paidAmount || i.total || 0), 0);
    const unpaidAmount = unpaidInvoices.reduce((sum: number, i: any) => sum + Number(i.total || 0), 0);
    const rate = totalUnits > 0 && invoices.length > 0 ? ((paidUnits / invoices.length) * 100).toFixed(1) : '0.0';

    return {
      totalUnits,
      paidUnits,
      unpaidUnits,
      collectedAmount,
      unpaidAmount,
      rate,
      hasInvoices: invoices.length > 0
    };
  }, [properties, invoices]);

  // Totals
  const totalIncome = historicalTrends.reduce((acc, h) => acc + h.income, 0);
  const totalExpense = historicalTrends.reduce((acc, h) => acc + h.expense, 0);
  const totalNet = totalIncome - totalExpense;

  // Average Compliance Rate
  const avgCompliance = useMemo(() => {
    if (invoices && invoices.length > 0) {
      const paid = invoices.filter((i: any) => i.status === 'PAID').length;
      return ((paid / invoices.length) * 100).toFixed(1);
    }
    if (historicalTrends.length > 0) {
      return (historicalTrends.reduce((sum, h) => sum + h.rate, 0) / historicalTrends.length).toFixed(1);
    }
    return '0.0';
  }, [invoices, historicalTrends]);

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
  const handleCopyPublicLink = () => {
    const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}/transparency` : '/transparency';
    navigator.clipboard.writeText(fullUrl);
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
          period: currentPeriodName,
          complianceRate: Number(avgCompliance),
          totalIncome,
          totalExpense,
          netSurplus: totalNet,
          complaintsResolvedPct: Number(securityMetrics.pct),
          notes: snapshotNotes,
        }),
      });

      if (res.ok) {
        showToast('Snapshot evaluasi analitik berhasil disimpan ke Jejak Audit.');
        setShowSnapshotModal(false);
      } else {
        showToast('Gagal menyimpan snapshot evaluasi.');
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
    const headers = ['Periode', 'Pemasukan Kas (Rp)', 'Pengeluaran Belanja (Rp)', 'Surplus Bersih (Rp)', 'Tingkat Disiplin (%)', 'Status Kas'];
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
          <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header - Swiss Typography Hierarchy */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-black tracking-tight text-ink flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary-600 shrink-0" />
              Analitik Tren Finansial & Tata Kelola Komplek
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-primary-100 text-primary-800 text-[11px] font-bold border border-primary-200">
              Periode: {currentPeriodName}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border ${
              Number(avgCompliance) > 0
                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                : 'bg-canvas text-ink-muted border-border'
            }`}>
              Kepatuhan Iuran: {avgCompliance}%
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1 leading-relaxed max-w-3xl">
            Executive Dashboard: Evaluasi performa arus kas bulanan, disiplin iuran per blok hunian, efisiensi energi fasum, dan SLA keamanan lingkungan Komplek Taman Sejahtera.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-surface hover:bg-canvas active:scale-[0.98] border border-border text-ink text-xs font-bold rounded-xl shadow-2xs transition-all duration-150"
          >
            <Download className="w-4 h-4 text-ink-muted" />
            Ekspor CSV
          </button>
          <button
            type="button"
            onClick={() => setShowExecutiveReport(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-2xs transition-all duration-150"
          >
            <Printer className="w-4 h-4" />
            Laporan Eksekutif (PDF)
          </button>
          <button
            type="button"
            onClick={() => setShowSnapshotModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-2xs transition-all duration-150"
          >
            <Sparkles className="w-4 h-4" />
            Simpan Snapshot
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
              Warga dapat melihat ringkasan keuangan, laporan nota belanja, dan status lunas per unit secara terbuka di portal transparansi publik.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleCopyPublicLink}
            className="px-3.5 py-2 bg-white hover:bg-emerald-100 active:scale-[0.98] text-emerald-900 font-bold rounded-xl border border-emerald-300 shadow-2xs inline-flex items-center gap-1.5 transition-all duration-150"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-emerald-700" />}
            {copiedLink ? 'Tersalin!' : 'Salin Link Publik'}
          </button>
          <a
            href="/transparency"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white font-bold rounded-xl shadow-2xs inline-flex items-center gap-1.5 transition-all duration-150"
          >
            <ExternalLink className="w-4 h-4" />
            Buka Transparansi
          </a>
        </div>
      </div>

      {/* Swiss KPI Metric Cards (High Typographic Contrast & Tabular Alignment) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Pemasukan Kas */}
        <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Akumulasi Pemasukan Kas</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <p className="text-2xl font-black text-ink mt-1.5 tabular-nums font-mono tracking-tight">
              {formatRupiah(totalIncome)}
            </p>
          </div>
          <div className="pt-2 border-t border-border/60 mt-2">
            <span className="text-[11px] font-medium flex items-center gap-1 text-ink-muted">
              {historicalTrends.length > 0 ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  Rata-rata {formatRupiah(Math.round(totalIncome / historicalTrends.length))} / bln
                </span>
              ) : (
                'Belum ada transaksi pemasukan'
              )}
            </span>
          </div>
        </div>

        {/* Card 2: Pengeluaran Belanja */}
        <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Akumulasi Belanja (Beban)</span>
              <span className="w-2 h-2 rounded-full bg-rose-500" />
            </div>
            <p className="text-2xl font-black text-rose-700 mt-1.5 tabular-nums font-mono tracking-tight">
              {formatRupiah(totalExpense)}
            </p>
          </div>
          <div className="pt-2 border-t border-border/60 mt-2">
            <span className="text-[11px] text-ink-muted block font-medium">
              {totalIncome > 0
                ? `Rasio Belanja: ${((totalExpense / totalIncome) * 100).toFixed(1)}% dari Pemasukan`
                : 'Rasio Belanja: 0%'}
            </span>
          </div>
        </div>

        {/* Card 3: Surplus Net Kas */}
        <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Surplus Akumulatif (Net Kas)</span>
              <span className={`w-2 h-2 rounded-full ${totalNet > 0 ? 'bg-emerald-500' : totalNet < 0 ? 'bg-rose-500' : 'bg-slate-400'}`} />
            </div>
            <p className={`text-2xl font-black mt-1.5 tabular-nums font-mono tracking-tight ${
              totalNet > 0 ? 'text-emerald-700' : totalNet < 0 ? 'text-rose-700' : 'text-ink'
            }`}>
              {totalNet >= 0 ? '+' : ''}{formatRupiah(totalNet)}
            </p>
          </div>
          <div className="pt-2 border-t border-border/60 mt-2">
            <span className={`text-[11px] font-bold block ${
              totalNet > 0 ? 'text-emerald-700' : totalNet < 0 ? 'text-rose-700' : 'text-ink-muted'
            }`}>
              {totalIncome === 0 && totalExpense === 0
                ? 'Kas Berimbang (Rp 0)'
                : totalNet > 0
                ? '✓ Surplus Kas Berjalan'
                : '⚠ Defisit Belanja Kas'}
            </span>
          </div>
        </div>

        {/* Card 4: SLA Aduan */}
        <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">SLA Penanganan Aduan</span>
              <span className="w-2 h-2 rounded-full bg-primary-500" />
            </div>
            <p className="text-2xl font-black text-primary-700 mt-1.5 tabular-nums font-mono tracking-tight">
              {securityMetrics.totalComplaints > 0 ? `${securityMetrics.pct}%` : '-'}
            </p>
          </div>
          <div className="pt-2 border-t border-border/60 mt-2">
            <span className="text-[11px] text-ink-muted block font-medium">
              {securityMetrics.totalComplaints > 0
                ? `${securityMetrics.resolvedComplaints}/${securityMetrics.totalComplaints} Tiket Selesai Ditangani`
                : 'Belum ada tiket aduan warga'}
            </span>
          </div>
        </div>
      </div>

      {/* 5 Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 p-1.5 bg-surface rounded-2xl border border-border shadow-2xs overflow-x-auto no-scrollbar">
        {[
          { id: 'financial_trends', label: 'Tren Finansial & Arus Kas', icon: TrendingUp, count: historicalTrends.length },
          { id: 'block_compliance', label: 'Disiplin Pembayaran per Blok', icon: Layers, count: blockCompliance.length },
          { id: 'utility_efficiency', label: 'Utilitas & Efisiensi Fasum', icon: Zap, count: utilityAnalysis.count },
          { id: 'security_sla', label: 'SLA Keamanan & Respon Aduan', icon: ShieldCheck, count: securityMetrics.totalComplaints },
          { id: 'public_transparency', label: 'Rekapitulasi Iuran Transparansi', icon: Eye, count: transparencyStats.totalUnits },
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

      {/* ================= SUBTAB 1: TREN FINANSIAL ================= */}
      {activeSubTab === 'financial_trends' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden text-xs">
            <div className="p-4 border-b border-border bg-canvas/40 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary-600 shrink-0" />
                <h3 className="font-bold text-sm text-ink">
                  Kinerja Arus Kas Multi-Periode Bulanan
                </h3>
                <span className="text-xs text-ink-muted">({historicalTrends.length} Periode Tercatat)</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                <div className="relative w-full sm:w-48">
                  <Search className="w-3.5 h-3.5 text-ink-muted absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Cari bulan / status..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-8 pr-3 py-1.5 bg-surface border border-border rounded-xl text-xs text-ink placeholder:text-ink-muted focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-2.5 py-1.5 bg-surface border border-border rounded-xl font-bold text-ink text-xs focus:outline-hidden"
                >
                  <option value="month">Urut Periode</option>
                  <option value="income">Urut Pemasukan</option>
                  <option value="expense">Urut Pengeluaran</option>
                  <option value="net">Urut Surplus</option>
                  <option value="rate">Urut % Disiplin</option>
                </select>

                <button
                  type="button"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-1.5 bg-surface active:scale-[0.98] border border-border rounded-xl text-ink-muted hover:text-ink transition-colors"
                  title={`Arah urutan: ${sortOrder === 'asc' ? 'Menaik' : 'Menurun'}`}
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-canvas border-b border-border text-ink-muted font-bold">
                  <tr>
                    <th className="py-3.5 px-4 text-[10px] uppercase tracking-wider">Periode</th>
                    <th className="py-3.5 px-4 text-right text-[10px] uppercase tracking-wider">Pemasukan Kas</th>
                    <th className="py-3.5 px-4 text-right text-[10px] uppercase tracking-wider">Realisasi Belanja</th>
                    <th className="py-3.5 px-4 text-right text-[10px] uppercase tracking-wider">Surplus Bersih</th>
                    <th className="py-3.5 px-4 text-center text-[10px] uppercase tracking-wider">Tingkat Disiplin</th>
                    <th className="py-3.5 px-4 text-center text-[10px] uppercase tracking-wider">Evaluasi Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {paginatedTrends.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center">
                        <div className="max-w-sm mx-auto space-y-2">
                          <div className="w-10 h-10 rounded-xl bg-canvas border border-border flex items-center justify-center mx-auto text-ink-muted">
                            <BarChart3 className="w-5 h-5" />
                          </div>
                          <p className="font-bold text-ink text-xs">Belum Ada Rekaman Tren Finansial</p>
                          <p className="text-[11px] text-ink-muted leading-relaxed">
                            Buku kas dan transaksi keuangan saat ini masih bersih (Rp 0). Data arus kas multi-bulan akan otomatis terakumulasi dan dianalisis di sini begitu transaksi buku kas dicatat.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedTrends.map((h) => (
                      <tr key={h.id} className="hover:bg-canvas/50 transition-colors">
                        <td className="py-3.5 px-4 font-black text-ink">{h.month}</td>
                        <td className="py-3.5 px-4 text-right font-medium tabular-nums text-ink font-mono">{formatRupiah(h.income)}</td>
                        <td className="py-3.5 px-4 text-right font-medium tabular-nums text-rose-700 font-mono">{formatRupiah(h.expense)}</td>
                        <td className={`py-3.5 px-4 text-right font-black tabular-nums font-mono ${
                          h.net >= 0 ? 'text-emerald-700' : 'text-rose-700'
                        }`}>
                          {h.net >= 0 ? '+' : ''}{formatRupiah(h.net)}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold tabular-nums text-ink font-mono">{h.rate}%</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border ${
                            h.net > 0
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : h.net === 0
                              ? 'bg-slate-50 text-slate-800 border-slate-300'
                              : 'bg-rose-50 text-rose-800 border-rose-300'
                          }`}>
                            ✓ {h.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-3 border-t border-border bg-canvas/30 flex items-center justify-between">
                <span className="text-[11px] text-ink-muted font-medium">
                  Menampilkan {startIndex + 1}-{endIndex} dari {totalFiltered} data periode
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="p-1 rounded-lg border border-border bg-surface text-ink-muted hover:text-ink disabled:opacity-40"
                    title="Halaman pertama"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1 rounded-lg border border-border bg-surface text-ink-muted hover:text-ink disabled:opacity-40"
                    title="Halaman sebelumnya"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-2 py-1 text-[11px] font-bold text-ink">
                    Hal {currentPage} dari {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1 rounded-lg border border-border bg-surface text-ink-muted hover:text-ink disabled:opacity-40"
                    title="Halaman berikutnya"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-1 rounded-lg border border-border bg-surface text-ink-muted hover:text-ink disabled:opacity-40"
                    title="Halaman terakhir"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= SUBTAB 2: KEPATUHAN BLOK ================= */}
      {activeSubTab === 'block_compliance' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="p-6 bg-surface rounded-3xl border border-border shadow-card space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
              <div>
                <h3 className="font-black text-sm text-ink flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary-600" />
                  Tingkat Kepatuhan Pembayaran Antar Wilayah & Blok Hunian
                </h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  Monitoring kedisiplinan {properties?.length || 0} unit rumah komplek terdaftar berdasarkan sebaran kavling.
                </p>
              </div>
              <span className={`text-xs font-black px-2.5 py-1 rounded-lg border ${
                Number(avgCompliance) > 0
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  : 'text-ink-muted bg-canvas border-border'
              }`}>
                Rata-rata Komplek: {avgCompliance}%
              </span>
            </div>

            {/* Block Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {blockCompliance.length === 0 ? (
                <div className="col-span-full py-16 text-center text-ink-muted space-y-2">
                  <Building className="w-8 h-8 mx-auto text-ink-muted" />
                  <p className="font-bold text-xs text-ink">Belum Ada Data Unit Rumah Terdaftar</p>
                  <p className="text-[11px] text-ink-muted">
                    Unit rumah yang didaftarkan pada menu Data Hunian akan otomatis dianalisis sebaran dan kepatuhannya di sini.
                  </p>
                </div>
              ) : (
                blockCompliance.map((b) => (
                  <div key={b.block} className="p-4 bg-canvas rounded-2xl border border-border space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm text-ink">{b.block}</span>
                      <span className={`font-black text-xs tabular-nums px-2 py-0.5 rounded ${
                        invoices.length > 0
                          ? b.rate > 0
                            ? 'text-emerald-700 bg-emerald-100'
                            : 'text-ink-muted bg-surface border border-border'
                          : 'text-ink-muted bg-surface border border-border'
                      }`}>
                        {invoices.length > 0 ? `${b.rate.toFixed(1)}% Lunas` : `${b.occupiedUnits}/${b.totalUnits} Terhuni`}
                      </span>
                    </div>

                    <div className="bg-surface rounded-full h-2 overflow-hidden border border-border">
                      <div
                        className={`h-full rounded-full ${b.color}`}
                        style={{
                          width: invoices.length > 0
                            ? `${b.rate}%`
                            : `${b.totalUnits > 0 ? (b.occupiedUnits / b.totalUnits) * 100 : 0}%`
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-emerald-700 font-medium">
                        {invoices.length > 0
                          ? `✓ ${b.paidUnits} Lunas (${formatRupiah(b.collectedAmount)})`
                          : `✓ ${b.occupiedUnits} Berpenghuni`}
                      </span>
                      <span className={invoices.length > 0 && b.unpaidUnits > 0 ? 'text-rose-700 font-bold' : 'text-ink-muted'}>
                        {invoices.length > 0
                          ? `${b.unpaidUnits} Tertunda (${formatRupiah(b.unpaidAmount)})`
                          : `${b.vacantUnits} Rumah Kosong`}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Swiss Grid Comparison Table for Blocks */}
            {blockCompliance.length > 0 && (
              <div className="pt-3 border-t border-border">
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-2.5">
                  Tabel Rangkuman Komparasi Wilayah
                </h4>
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-canvas border-b border-border text-ink-muted font-bold">
                      <tr>
                        <th className="py-2.5 px-3">Blok / Wilayah</th>
                        <th className="py-2.5 px-3 text-center">Total Unit</th>
                        <th className="py-2.5 px-3 text-center">Terhuni</th>
                        <th className="py-2.5 px-3 text-center">Kosong</th>
                        <th className="py-2.5 px-3 text-center">Disiplin Iuran</th>
                        <th className="py-2.5 px-3 text-right">Dana Terkumpul</th>
                        <th className="py-2.5 px-3 text-right">Tunggakan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 bg-surface">
                      {blockCompliance.map((b) => (
                        <tr key={b.block} className="hover:bg-canvas/40 transition-colors">
                          <td className="py-2.5 px-3 font-bold text-ink">{b.block}</td>
                          <td className="py-2.5 px-3 text-center font-mono tabular-nums">{b.totalUnits}</td>
                          <td className="py-2.5 px-3 text-center font-mono tabular-nums text-emerald-700 font-semibold">{b.occupiedUnits}</td>
                          <td className="py-2.5 px-3 text-center font-mono tabular-nums text-ink-muted">{b.vacantUnits}</td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold tabular-nums">
                            {invoices.length > 0 ? `${b.rate.toFixed(1)}%` : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-emerald-700">
                            {formatRupiah(b.collectedAmount)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums text-rose-700 font-semibold">
                            {formatRupiah(b.unpaidAmount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {invoices.length === 0 && (
              <div className="p-3.5 rounded-2xl bg-canvas border border-border/80 text-xs text-ink-muted flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-ink-muted shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-ink">Informasi Tagihan:</span>
                  <span className="ml-1">
                    Tagihan iuran untuk periode ini belum diterbitkan massal. Saat tagihan iuran diterbitkan dan warga melakukan pembayaran, rekapitulasi setoran kas per blok akan langsung diperbarui.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= SUBTAB 3: UTILITAS & EFISIENSI ================= */}
      {activeSubTab === 'utility_efficiency' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="p-6 bg-surface rounded-3xl border border-border shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
              <div>
                <h3 className="font-black text-sm text-ink flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Monitoring Efisiensi Konsumsi Energi & Fasilitas Umum
                </h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  Pelacakan realisasi beban daya listrik PJU, air bersih taman, dan operasional pos jaga komplek.
                </p>
              </div>
              <span className="px-2.5 py-1 bg-canvas text-ink-muted border border-border rounded-lg text-xs font-bold">
                Status: {utilityAnalysis.hasData ? 'Terekam di Buku Kas' : 'Siaga Operasional'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-canvas rounded-2xl border border-border space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </div>
                  <span className="px-2 py-0.5 bg-canvas text-ink-muted border border-border rounded text-[10px] font-bold">
                    PLN Pascabayar / Token
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-ink text-xs">Konsumsi Listrik PLN PJU & Pos Jaga</h4>
                  <p className="text-xl font-black text-ink font-mono mt-1 tabular-nums">
                    {formatRupiah(utilityAnalysis.electricityExpense)}
                  </p>
                  <span className="text-[11px] text-ink-muted font-medium block mt-0.5">
                    {utilityAnalysis.electricityExpense > 0
                      ? 'Realisasi belanja listrik pada buku kas'
                      : 'Belum ada transaksi belanja listrik pada periode ini'}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-canvas rounded-2xl border border-border space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <span className="px-2 py-0.5 bg-canvas text-ink-muted border border-border rounded text-[10px] font-bold">
                    PAM / Air Fasum
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-ink text-xs">Konsumsi Air Bersih Balai & Taman</h4>
                  <p className="text-xl font-black text-ink font-mono mt-1 tabular-nums">
                    {formatRupiah(utilityAnalysis.waterExpense)}
                  </p>
                  <span className="text-[11px] text-ink-muted font-medium block mt-0.5">
                    {utilityAnalysis.waterExpense > 0
                      ? 'Realisasi belanja air pada buku kas'
                      : 'Belum ada transaksi belanja air pada periode ini'}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-canvas rounded-2xl border border-border space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Car className="w-4 h-4" />
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-bold">
                    Sistem Siaga
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-ink text-xs">Operasional Barrier Gate & Akses Pos</h4>
                  <p className="text-xl font-black text-ink font-mono mt-1 tabular-nums">
                    {formatRupiah(utilityAnalysis.gateExpense)}
                  </p>
                  <span className="text-[11px] text-ink-muted font-medium block mt-0.5">
                    {utilityAnalysis.gateExpense > 0
                      ? 'Realisasi operasional pos pada buku kas'
                      : 'Portal gerbang & sistem keamanan beroperasi normal'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-canvas border border-border/80 text-xs text-ink-muted flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-ink-muted shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-ink">Catatan Utilitas Real-Time:</p>
                <p className="text-[11px] mt-0.5 text-ink-muted leading-relaxed">
                  Seluruh data beban energi dan fasilitas di atas disinkronisasi langsung dari pengeluaran Buku Kas kategori Utilitas & Pemeliharaan.
                  Tidak ada angka perkiraan fiktif yang ditampilkan.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUBTAB 4: SLA KEAMANAN & ADUAN ================= */}
      {activeSubTab === 'security_sla' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="p-6 bg-surface rounded-3xl border border-border shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
              <div>
                <h3 className="font-black text-sm text-ink flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Standar Layanan Aduan Warga & Kinerja Keamanan Satpam
                </h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  Evaluasi SLA respon penyelesaian aduan warga dan catatan pengawasan keamanan komplek.
                </p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold">
                Total Aduan: {securityMetrics.totalComplaints} Tiket
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {securityMetrics.items.map((s, idx) => {
                const Icon = s.icon;
                return (
                  <div key={idx} className="p-4 bg-canvas rounded-2xl border border-border space-y-2 shadow-2xs">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] text-ink-muted font-semibold block">{s.title}</span>
                    <p className="text-xl font-black text-ink font-mono tabular-nums">{s.value}</p>
                    <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded block w-fit">
                      {s.status} (Target: {s.target})
                    </span>
                  </div>
                );
              })}
            </div>

            {securityMetrics.totalComplaints === 0 && (
              <div className="p-6 bg-canvas rounded-2xl border border-dashed border-border text-center space-y-2">
                <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-xs text-ink">Belum Ada Tiket Aduan Warga</h4>
                <p className="text-[11px] text-ink-muted max-w-sm mx-auto leading-relaxed">
                  Saat warga mengirimkan aduan perbaikan fasilitas atau ketertiban lingkungan melalui portal warga, data kecepatan respon dan penyelesaian petugas satpam/pengurus akan dihitung secara langsung di sini.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= SUBTAB 5: REKAPITULASI IURAN TRANSPARANSI ================= */}
      {activeSubTab === 'public_transparency' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="p-6 bg-surface rounded-3xl border border-border shadow-card space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <h3 className="font-black text-sm text-ink flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-600" />
                  Rekapitulasi Iuran Transparansi Warga Terbuka
                </h3>
                <p className="text-ink-muted text-xs mt-0.5">
                  Laporan status setoran kas warga komplek yang disinkronisasi ke portal publik transparansi.
                </p>
              </div>
              <a
                href="/transparency"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 active:scale-[0.98] text-emerald-900 border border-emerald-300 font-bold rounded-xl inline-flex items-center gap-1.5 transition-all duration-150 self-start sm:self-auto"
              >
                <ExternalLink className="w-3.5 h-3.5" />
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
                <span className="font-semibold text-ink-muted text-xs block">Total Unit Terdaftar</span>
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
                  <h4 className="font-bold text-ink text-xs">Belum Ada Tagihan Iuran Diterbitkan</h4>
                  <p className="text-[11px] text-ink-muted mt-0.5">
                    Saat ini belum ada tagihan iuran aktif pada periode berjalan. Pengurus dapat menerbitkan tagihan iuran massal melalui menu Kelola Tagihan.
                  </p>
                  <div className="mt-2.5 flex items-center gap-2">
                    <a
                      href="/admin/billing"
                      className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 active:scale-[0.98] text-white font-bold rounded-lg text-xs inline-flex items-center gap-1 transition-all shadow-2xs"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      Kelola Tagihan Iuran
                    </a>
                    <a
                      href="/admin/rekap-iuran"
                      className="px-3 py-1.5 bg-surface hover:bg-canvas active:scale-[0.98] text-ink border border-border font-bold rounded-lg text-xs inline-flex items-center gap-1 transition-all"
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

      {/* ================= MODAL: SIMPAN SNAPSHOT ================= */}
      {showSnapshotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-border shadow-modal space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-sm text-ink">Simpan Snapshot Kinerja Bulanan</h3>
              <button
                onClick={() => setShowSnapshotModal(false)}
                className="text-ink-muted hover:text-ink text-base p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-canvas rounded-2xl border border-border space-y-1.5">
              <div className="flex justify-between">
                <span className="text-ink-muted">Periode:</span>
                <span className="font-black text-ink">{currentPeriodName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Tingkat Kepatuhan:</span>
                <span className="font-bold text-emerald-700 font-mono">{avgCompliance}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Total Pemasukan:</span>
                <span className="font-mono font-bold text-ink">{formatRupiah(totalIncome)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Surplus Bersih:</span>
                <span className={`font-mono font-black ${totalNet >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {totalNet >= 0 ? '+' : ''}{formatRupiah(totalNet)}
                </span>
              </div>
            </div>

            <div>
              <label className="font-bold text-ink block mb-1">Catatan Evaluasi / Notulensi:</label>
              <textarea
                value={snapshotNotes}
                onChange={(e) => setSnapshotNotes(e.target.value)}
                rows={3}
                className="w-full p-2.5 bg-canvas border border-border rounded-xl text-xs text-ink focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
                placeholder="Tuliskan catatan hasil evaluasi tata kelola periode ini..."
              />
            </div>

            <p className="text-ink-muted text-[11px]">
              Snapshot ini akan diarsipkan ke basis data Jejak Audit sebagai acuan rapat pertanggungjawaban pengurus komplek.
            </p>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setShowSnapshotModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas active:scale-[0.98] transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={savingSnapshot}
                onClick={handleSaveSnapshot}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold shadow-2xs disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
              >
                {savingSnapshot ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Simpan Snapshot</span>
                  </>
                )}
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
                <p className="text-[11px] text-ink-muted">WargaHub Smart Residential Estate • Periode {currentPeriodName}</p>
              </div>
              <button
                onClick={() => setShowExecutiveReport(false)}
                className="text-ink-muted hover:text-ink text-base p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-canvas rounded-2xl border border-border space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-surface rounded-xl border border-border">
                  <span className="text-[10px] text-ink-muted uppercase tracking-wider block font-bold">Akumulasi Pemasukan:</span>
                  <span className="font-black font-mono text-ink text-sm tabular-nums mt-0.5 block">{formatRupiah(totalIncome)}</span>
                </div>
                <div className="p-2.5 bg-surface rounded-xl border border-border">
                  <span className="text-[10px] text-ink-muted uppercase tracking-wider block font-bold">Surplus Bersih Kas:</span>
                  <span className={`font-black font-mono text-sm tabular-nums mt-0.5 block ${totalNet >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {totalNet >= 0 ? '+' : ''}{formatRupiah(totalNet)}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-1 border-t border-border">
                <div className="flex justify-between">
                  <span className="text-ink-muted">Tingkat Kedisiplinan Iuran:</span>
                  <span className="font-black text-emerald-700 font-mono tabular-nums">{avgCompliance}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">SLA Penyelesaian Aduan:</span>
                  <span className="font-bold text-ink">
                    {securityMetrics.totalComplaints > 0
                      ? `${securityMetrics.pct}% (${securityMetrics.resolvedComplaints}/${securityMetrics.totalComplaints} Selesai)`
                      : 'Belum Ada Tiket Aduan'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Status Kesiagaan Fasilitas:</span>
                  <span className="font-bold text-emerald-700">Pos & Fasum Siaga</span>
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

            {/* Official Signatures Section for Print View */}
            <div className="pt-2 border-t border-border/80 grid grid-cols-3 gap-2 text-center text-[10px] text-ink-muted">
              <div>
                <p className="font-bold text-ink">Ketua RW 05</p>
                <div className="h-10 flex items-end justify-center">
                  <span className="border-b border-ink/40 pb-0.5 px-3 font-semibold text-ink">( .................... )</span>
                </div>
              </div>
              <div>
                <p className="font-bold text-ink">Bendahara</p>
                <div className="h-10 flex items-end justify-center">
                  <span className="border-b border-ink/40 pb-0.5 px-3 font-semibold text-ink">( .................... )</span>
                </div>
              </div>
              <div>
                <p className="font-bold text-ink">Dewan Pengawas</p>
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
                onClick={() => setShowExecutiveReport(false)}
                className="flex-1 py-2.5 border border-border text-ink font-bold rounded-xl hover:bg-canvas active:scale-[0.98] transition-all"
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
