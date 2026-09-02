import React, { useState, useEffect } from 'react';
import {
  Home,
  Users,
  Wallet,
  Hourglass,
  Headphones,
  ChevronRight,
  FileText,
  BarChart2,
  Calendar,
  ChevronDown,
  CheckCircle2,
  CreditCard,
  MessageCircle,
  Wrench,
  Megaphone,
  ShieldCheck,
  PlusCircle,
  ExternalLink,
  AlertCircle,
  Building,
  Car,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Sparkles,
  Shield,
  Truck,
  DollarSign,
  Send,
  UserCheck,
  Building2,
  Vote,
  Layers,
  PhoneCall,
  BellRing,
  Check,
  Lock,
  RefreshCw,
  AlertTriangle,
  Volume2,
  QrCode,
  Receipt,
  Inbox,
  Filter,
  CheckCircle,
  XCircle,
  Banknote,
  Eye,
  BookOpen,
  FileCheck,
  UserCircle2,
  ArrowRight
} from 'lucide-react';
import { DEMO_USERS, type UserRole, type UserSession } from '../../types/auth';
import { formatRupiah, formatRupiahShort } from '../../lib/format';
import { ErrorBoundary } from '../shared/ErrorBoundary';

interface AdminDashboardViewProps {
  stats: {
    totalProperties: number;
    occupiedProperties: number;
    vacantProperties: number;
    occupiedPercentage: string;
    vacantPercentage: string;
    paidCount: number;
    unpaidCount: number;
    paidPercentage: number;
    paidAmount: number;
    unpaidAmount: number;
    monthlyRate: number;
    cashBalance: number;
    pendingPaymentsCount: number;
    openComplaintsCount: number;
    needingRepairCount: number;
  };
  currentUser?: UserSession;
}

const AdminDashboardInner: React.FC<AdminDashboardViewProps> = ({ stats, currentUser }) => {
  const [selectedMonth, setSelectedMonth] = useState('Agustus 2026');
  const [activityFilter, setActivityFilter] = useState<'all' | 'finance' | 'complaint' | 'security' | 'facility'>('all');

  // Active user session state
  const [activeUser, setActiveUser] = useState<UserSession>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('wargahub_user');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object') return parsed;
        }
      } catch (e) {}
    }
    return currentUser || DEMO_USERS.ketua;
  });

  // Dynamic dashboard role filter (defaults to active user role)
  const [activeRoleView, setActiveRoleView] = useState<UserRole>(() => {
    return activeUser?.role || currentUser?.role || 'CHAIRMAN';
  });

  // Dynamic dashboard title & subtitle from settings
  const [dashHeading, setDashHeading] = useState('Dashboard Ketua Komplek');
  const [dashSubheading, setDashSubheading] = useState('Pusat Kendali Operasional, Keuangan Kas & Layanan Warga Komplek.');
  const [communityName, setCommunityName] = useState('Komplek Perumahan Taman Sejahtera');

  // Security gate live state (for Security dashboard widget)
  const [gate1Open, setGate1Open] = useState(false);
  const [gate2Open, setGate2Open] = useState(false);
  const [sirenActive, setSirenActive] = useState(false);

  // Treasurer quick verification state
  const [pendingList, setPendingList] = useState([
    { id: 'pay-01', house: 'B-12', name: 'Hendra Wijaya', amount: 750000, method: 'Transfer BCA', time: '10 mnt lalu', note: 'Iuran IPL Agt 2026' },
    { id: 'pay-02', house: 'A-04', name: 'Ridwan Fauzi', amount: 750000, method: 'QRIS Mandiri', time: '25 mnt lalu', note: 'Iuran + Fasum' },
    { id: 'pay-03', house: 'C-09', name: 'Dewi Lestari', amount: 1500000, method: 'Transfer BCA', time: '1 jam lalu', note: 'Iuran 2 Bulan (Agt-Sep)' },
  ]);

  useEffect(() => {
    try {
      const savedHead = localStorage.getItem('wargahub_set_dash_heading');
      const savedSub = localStorage.getItem('wargahub_set_dash_subheading');
      const savedComm = localStorage.getItem('wargahub_set_comm_name');
      const savedUser = localStorage.getItem('wargahub_user');
      if (savedHead) setDashHeading(JSON.parse(savedHead));
      if (savedSub) setDashSubheading(JSON.parse(savedSub));
      if (savedComm) setCommunityName(JSON.parse(savedComm));
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setActiveUser(parsed);
        setActiveRoleView(parsed.role || 'CHAIRMAN');
      }
    } catch (e) {}

    const handleUserChanged = (e: any) => {
      const newUser = e.detail;
      if (newUser) {
        setActiveUser(newUser);
        setActiveRoleView(newUser.role || 'CHAIRMAN');
      }
    };

    window.addEventListener('wargahub_user_changed', handleUserChanged);
    return () => window.removeEventListener('wargahub_user_changed', handleUserChanged);
  }, []);

  // Budget comparison table data
  const budgetData = [
    {
      keterangan: 'Pemasukan (Iuran Lingkungan & IPL)',
      anggaran: 90000000,
      realisasi: 64500000,
      selisih: -25500000,
      isPositive: false,
      pct: 71.7,
    },
    {
      keterangan: 'Pengeluaran Gaji & Operasional Satpam/Kebersihan',
      anggaran: 45000000,
      realisasi: 28350000,
      selisih: 16650000,
      isPositive: true,
      pct: 63.0,
    },
    {
      keterangan: 'Pemeliharaan Fasum, PJU & Pompa Air',
      anggaran: 20000000,
      realisasi: 12600000,
      selisih: 7400000,
      isPositive: true,
      pct: 63.0,
    },
    {
      keterangan: 'Kas Cadangan & Pembangunan Fasilitas',
      anggaran: 25000000,
      realisasi: 23550000,
      selisih: -1450000,
      isPositive: false,
      isTotal: true,
      pct: 94.2,
    }
  ];

  // Block Breakdown Data
  const blockStats = [
    { block: 'Blok A (Boulevard Utama)', total: 32, paid: 28, unpaid: 4, occupied: 30, pct: 87.5, color: 'bg-emerald-500' },
    { block: 'Blok B (Taman Barat)', total: 34, paid: 25, unpaid: 9, occupied: 29, pct: 73.5, color: 'bg-blue-500' },
    { block: 'Blok C (Taman Timur)', total: 30, paid: 20, unpaid: 10, occupied: 24, pct: 66.7, color: 'bg-amber-500' },
    { block: 'Blok D (Taman Selatan)', total: 27, paid: 13, unpaid: 14, occupied: 15, pct: 48.1, color: 'bg-rose-500' },
  ];

  // Activities feed
  const allActivities = [
    {
      id: 'act-1',
      icon: CreditCard,
      iconBg: 'bg-emerald-100 text-emerald-700',
      category: 'finance',
      title: 'Pembayaran Iuran Masuk (Rumah B-12)',
      detail: 'Rp 750.000 melalui Transfer Bank BCA (Otomatis Terverifikasi)',
      time: '10 menit yang lalu',
      link: '/admin/payments',
    },
    {
      id: 'act-2',
      icon: MessageCircle,
      iconBg: 'bg-amber-100 text-amber-700',
      category: 'complaint',
      title: 'Aduan Warga Baru: Lampu PJU Padam Blok C',
      detail: 'Dilaporkan oleh Bpk. Budi Santoso (C-07) • Status: Menunggu Disposisi',
      time: '35 menit yang lalu',
      link: '/admin/complaints',
    },
    {
      id: 'act-3',
      icon: ShieldCheck,
      iconBg: 'bg-purple-100 text-purple-700',
      category: 'security',
      title: 'Check-in Tamu Pos Satpam Gerbang 1',
      detail: 'Tamu Bpk. Ridwan (Tamu Rumah A-04) QR Pass valid 24 jam',
      time: '1 jam yang lalu',
      link: '/admin/security-gate',
    },
    {
      id: 'act-4',
      icon: Wrench,
      iconBg: 'bg-blue-100 text-blue-700',
      category: 'facility',
      title: 'Pengeluaran Tercatat: Servis Pompa Booster Air',
      detail: 'Rp 2.350.000 oleh Petugas Pemeliharaan (Kuitansi Terlampir)',
      time: '3 jam yang lalu',
      link: '/admin/expenses',
    },
    {
      id: 'act-5',
      icon: Truck,
      iconBg: 'bg-teal-100 text-teal-700',
      category: 'facility',
      title: 'Rute Sampah Pagi Selesai (Viar Tossa 01)',
      detail: 'Pengangkutan door-to-door Blok A & B telah dituntaskan',
      time: 'Pukul 09:30 WIB',
      link: '/admin/cleaning-staff',
    },
  ];

  const filteredActivities = allActivities.filter((act) => {
    if (activityFilter === 'all') return true;
    return act.category === activityFilter;
  });

  // Handle treasurer approval
  const handleApprovePayment = (id: string) => {
    setPendingList(prev => prev.filter(p => p.id !== id));
  };

  // Switch gate relay
  const triggerGate = (gate: 1 | 2) => {
    if (gate === 1) {
      setGate1Open(true);
      setTimeout(() => setGate1Open(false), 8000);
    } else {
      setGate2Open(true);
      setTimeout(() => setGate2Open(false), 8000);
    }
  };

  return (
    <div className="space-y-6 pb-12 text-xs">
      {/* ================= TOP ROLE SWITCHER TABS & SYSTEM STATUS ================= */}
      <div className="bg-surface rounded-3xl p-4 sm:p-5 border border-border shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Sistem Aktif
            </span>
            <span className="text-[11px] text-ink-muted font-bold">
              • {communityName}
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-ink mt-1 flex items-center gap-1.5">
            <span>Tampilan Dashboard Sesuai Peran:</span>
            <span className="text-primary-700 font-extrabold underline decoration-primary-300">
              {activeRoleView === 'CHAIRMAN' || activeRoleView === 'SUPER_ADMIN'
                ? '👑 Ketua Paguyuban'
                : activeRoleView === 'TREASURER'
                ? '💰 Bendahara Keuangan'
                : activeRoleView === 'SECRETARY'
                ? '📋 Sekretaris Paguyuban'
                : activeRoleView === 'SECURITY'
                ? '🛡️ Petugas Satpam Pos Gerbang'
                : activeRoleView === 'MAINTENANCE'
                ? '🧹 Tim Kebersihan & Teknisi'
                : '🏠 Warga Komplek'}
            </span>
          </h2>
        </div>

        {/* Role Filter Selector Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-canvas border border-border rounded-2xl overflow-x-auto no-scrollbar text-[11px]">
          {[
            { role: 'CHAIRMAN' as UserRole, label: '👑 Ketua', color: 'bg-emerald-600' },
            { role: 'TREASURER' as UserRole, label: '💰 Bendahara', color: 'bg-blue-600' },
            { role: 'SECRETARY' as UserRole, label: '📋 Sekretaris', color: 'bg-purple-600' },
            { role: 'SECURITY' as UserRole, label: '🛡️ Satpam', color: 'bg-amber-600' },
            { role: 'MAINTENANCE' as UserRole, label: '🧹 Kebersihan', color: 'bg-teal-600' },
            { role: 'HOUSEHOLD_HEAD' as UserRole, label: '🏠 Warga', color: 'bg-indigo-600' },
          ].map((tab) => (
            <button
              key={tab.role}
              type="button"
              onClick={() => setActiveRoleView(tab.role)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                activeRoleView === tab.role
                  ? `${tab.color} text-white shadow-2xs`
                  : 'text-ink-muted hover:text-ink hover:bg-surface'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. DASHBOARD KETUA KOMPLEK / SUPER ADMIN                                 */}
      {/* ========================================================================= */}
      {(activeRoleView === 'CHAIRMAN' || activeRoleView === 'SUPER_ADMIN' || activeRoleView === 'RESIDENT_ADMIN') && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Executive Header */}
          <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-card flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-200 font-bold text-[10px] tracking-wider uppercase border border-emerald-400/30 inline-block">
                Dashboard Eksekutif Ketua Paguyuban
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                {dashHeading}
              </h1>
              <p className="text-xs text-emerald-100/80 leading-relaxed">
                {dashSubheading}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href="/admin/billing"
                className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 rounded-xl font-black shadow-xs transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Terbitkan Tagihan IPL</span>
              </a>
              <a
                href="/admin/announcements"
                className="flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-bold transition-colors"
              >
                <Megaphone className="w-4 h-4" />
                <span>Buat Pengumuman</span>
              </a>
            </div>
          </div>

          {/* 8 KPI Executive Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            <a href="/admin/properties" className="bg-surface hover:bg-canvas rounded-2xl p-4 border border-border shadow-card flex flex-col justify-between group">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold"><Home className="w-4 h-4" /></div>
                <ArrowUpRight className="w-3.5 h-3.5 text-ink-muted group-hover:text-primary-600" />
              </div>
              <div className="mt-3">
                <span className="text-[10px] font-bold text-ink-muted uppercase">Total Rumah</span>
                <p className="text-xl font-black text-ink">{stats.totalProperties}</p>
                <span className="text-[10px] text-ink-muted">123 Kavling</span>
              </div>
            </a>

            <a href="/admin/properties?tab=occupants" className="bg-surface hover:bg-canvas rounded-2xl p-4 border border-border shadow-card flex flex-col justify-between group">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold"><Users className="w-4 h-4" /></div>
                <ArrowUpRight className="w-3.5 h-3.5 text-ink-muted group-hover:text-emerald-600" />
              </div>
              <div className="mt-3">
                <span className="text-[10px] font-bold text-ink-muted uppercase">Dihuni</span>
                <p className="text-xl font-black text-emerald-700">{stats.occupiedProperties}</p>
                <span className="text-[10px] text-emerald-600 font-bold">{stats.occupiedPercentage}% Terisi</span>
              </div>
            </a>

            <a href="/admin/properties" className="bg-surface hover:bg-canvas rounded-2xl p-4 border border-border shadow-card flex flex-col justify-between group">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold"><Building className="w-4 h-4" /></div>
                <ArrowUpRight className="w-3.5 h-3.5 text-ink-muted group-hover:text-ink" />
              </div>
              <div className="mt-3">
                <span className="text-[10px] font-bold text-ink-muted uppercase">Kosong</span>
                <p className="text-xl font-black text-ink">{stats.vacantProperties}</p>
                <span className="text-[10px] text-ink-muted">{stats.vacantPercentage}% Unit</span>
              </div>
            </a>

            <a href="/admin/billing" className="bg-surface hover:bg-canvas rounded-2xl p-4 border border-border shadow-card flex flex-col justify-between group">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-full border-2 border-primary-600 text-primary-700 flex items-center justify-center font-black text-[10px]">{stats.paidPercentage}%</div>
                <ArrowUpRight className="w-3.5 h-3.5 text-ink-muted group-hover:text-primary-600" />
              </div>
              <div className="mt-3">
                <span className="text-[10px] font-bold text-ink-muted uppercase">Iuran Lunas</span>
                <p className="text-xl font-black text-primary-700">{stats.paidCount}</p>
                <span className="text-[10px] text-primary-800 font-bold">{stats.unpaidCount} Tertunggak</span>
              </div>
            </a>

            <a href="/admin/ledger" className="bg-surface hover:bg-canvas rounded-2xl p-4 border border-border shadow-card flex flex-col justify-between group">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold"><Wallet className="w-4 h-4" /></div>
                <ArrowUpRight className="w-3.5 h-3.5 text-ink-muted group-hover:text-emerald-600" />
              </div>
              <div className="mt-3">
                <span className="text-[10px] font-bold text-ink-muted uppercase">Saldo Kas BCA</span>
                <p className="text-sm font-black text-ink truncate">{formatRupiahShort(stats.cashBalance)}</p>
                <span className="text-[10px] text-emerald-700 font-bold">Terverifikasi</span>
              </div>
            </a>

            <a href="/admin/payments" className="bg-surface hover:bg-canvas rounded-2xl p-4 border border-border shadow-card flex flex-col justify-between group">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold"><Hourglass className="w-4 h-4" /></div>
                {stats.pendingPaymentsCount > 0 && <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />}
              </div>
              <div className="mt-3">
                <span className="text-[10px] font-bold text-ink-muted uppercase">Verifikasi</span>
                <p className="text-xl font-black text-amber-700">{stats.pendingPaymentsCount}</p>
                <span className="text-[10px] text-amber-800 font-bold">Perlu Review</span>
              </div>
            </a>

            <a href="/admin/complaints" className="bg-surface hover:bg-canvas rounded-2xl p-4 border border-border shadow-card flex flex-col justify-between group">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold"><Headphones className="w-4 h-4" /></div>
                <ArrowUpRight className="w-3.5 h-3.5 text-ink-muted group-hover:text-rose-600" />
              </div>
              <div className="mt-3">
                <span className="text-[10px] font-bold text-ink-muted uppercase">Aduan Warga</span>
                <p className="text-xl font-black text-rose-700">{stats.openComplaintsCount}</p>
                <span className="text-[10px] text-rose-800 font-bold">Tiket Aktif</span>
              </div>
            </a>

            <a href="/admin/security-gate" className="bg-surface hover:bg-canvas rounded-2xl p-4 border border-border shadow-card flex flex-col justify-between group">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold"><ShieldCheck className="w-4 h-4" /></div>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <div className="mt-3">
                <span className="text-[10px] font-bold text-ink-muted uppercase">Pos Satpam</span>
                <p className="text-xl font-black text-purple-700">4 Regu</p>
                <span className="text-[10px] text-purple-800 font-bold">Pos 1 & 2 Aman</span>
              </div>
            </a>
          </div>

          {/* Realisasi APB & Block Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-surface rounded-3xl p-6 border border-border shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h3 className="text-sm font-black text-ink">Realisasi Anggaran Kas Paguyuban (APB)</h3>
                  <p className="text-ink-muted text-[11px]">Rencana pagu vs pengeluaran riil per {selectedMonth}</p>
                </div>
                <a href="/admin/budget" className="px-3 py-1.5 bg-canvas hover:bg-surface border border-border rounded-xl font-bold text-ink">
                  Kelola APB
                </a>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-ink-muted font-bold uppercase text-[10px]">
                      <th className="pb-2">Pos Anggaran</th>
                      <th className="pb-2 text-right">Target</th>
                      <th className="pb-2 text-right">Realisasi</th>
                      <th className="pb-2 text-right">Selisih</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {budgetData.map((row) => (
                      <tr key={row.keterangan} className={row.isTotal ? 'bg-primary-50/70 font-black' : 'text-ink'}>
                        <td className="py-2.5 pr-2 font-bold">{row.keterangan}</td>
                        <td className="py-2.5 px-2 text-right tabular-nums text-ink-muted">{formatRupiah(row.anggaran)}</td>
                        <td className="py-2.5 px-2 text-right tabular-nums font-black">{formatRupiah(row.realisasi)}</td>
                        <td className={`py-2.5 pl-2 text-right tabular-nums font-black ${row.isPositive ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {row.selisih > 0 ? `+${formatRupiah(row.selisih)}` : `-${formatRupiah(Math.abs(row.selisih))}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="lg:col-span-5 bg-surface rounded-3xl p-6 border border-border shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-sm font-black text-ink">Kepatuhan Iuran per Blok</h3>
                <span className="text-xs font-bold text-emerald-700">{stats.paidPercentage}% Lunas</span>
              </div>
              <div className="space-y-3">
                {blockStats.map((b) => (
                  <div key={b.block} className="p-3 bg-canvas rounded-2xl border border-border/70 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-ink">{b.block}</span>
                      <span className="font-black text-primary-700">{b.paid}/{b.total} Unit ({b.pct}%)</span>
                    </div>
                    <div className="w-full bg-surface h-2 rounded-full overflow-hidden border border-border/60">
                      <div className={`h-full rounded-full ${b.color}`} style={{ width: `${b.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. DASHBOARD BENDAHARA KEAUANGAN                                         */}
      {/* ========================================================================= */}
      {activeRoleView === 'TREASURER' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Banner Bendahara */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-card flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="px-3 py-1 rounded-full bg-blue-500/30 text-blue-200 font-bold text-[10px] tracking-wider uppercase border border-blue-400/30 inline-block">
                Pusat Kendali Keuangan & Kas Bendahara
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Manajemen Kas & Rekonsiliasi Iuran Warga
              </h1>
              <p className="text-xs text-blue-100/80 leading-relaxed">
                Verifikasi bukti pembayaran warga secara real-time, pencatatan kas keluar operasional, dan laporan transparansi publik.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href="/admin/payments"
                className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-amber-950 rounded-xl font-black shadow-xs transition-colors"
              >
                <Hourglass className="w-4 h-4" />
                <span>Verifikasi Pembayaran ({stats.pendingPaymentsCount})</span>
              </a>
              <a
                href="/admin/expenses"
                className="flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-bold transition-colors"
              >
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Catat Pengeluaran Kas</span>
              </a>
            </div>
          </div>

          {/* 4 Financial KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-surface rounded-3xl p-5 border border-border shadow-card space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">Perlu Verifikasi</span>
                <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-amber-700">{pendingList.length} Pembayaran</p>
                <p className="text-[11px] text-ink-muted mt-0.5">Bukti transfer transfer masuk menunggu review</p>
              </div>
            </div>

            <div className="bg-surface rounded-3xl p-5 border border-border shadow-card space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">Iuran Masuk Bulan Ini</span>
                <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-emerald-700">{formatRupiah(stats.paidAmount)}</p>
                <p className="text-[11px] text-emerald-600 font-bold mt-0.5">86 dari 120 unit telah lunas ({stats.paidPercentage}%)</p>
              </div>
            </div>

            <div className="bg-surface rounded-3xl p-5 border border-border shadow-card space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">Tunggakan Belum Bayar</span>
                <div className="w-9 h-9 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
                  <AlertCircle className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-rose-700">{formatRupiah(stats.unpaidAmount)}</p>
                <p className="text-[11px] text-rose-600 font-bold mt-0.5">{stats.unpaidCount} unit belum menyelesaikan tagihan</p>
              </div>
            </div>

            <div className="bg-surface rounded-3xl p-5 border border-border shadow-card space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">Saldo Kas Bank BCA</span>
                <div className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-ink">{formatRupiah(stats.cashBalance)}</p>
                <p className="text-[11px] text-emerald-700 font-bold mt-0.5">Rekonsiliasi digital aktif</p>
              </div>
            </div>
          </div>

          {/* Quick Payment Verification Table */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-surface rounded-3xl p-6 border border-border shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Hourglass className="w-4 h-4 text-amber-600" />
                  <h3 className="text-sm font-black text-ink">Antrean Verifikasi Bukti Bayar Warga</h3>
                </div>
                <a href="/admin/payments" className="text-xs font-bold text-primary-700 hover:underline">
                  Lihat Seluruhnya →
                </a>
              </div>

              {pendingList.length === 0 ? (
                <div className="p-8 text-center text-ink-muted space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="text-sm font-bold text-ink">Semua pembayaran telah diverifikasi!</p>
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  {pendingList.map((item) => (
                    <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center font-black text-xs shrink-0">
                          {item.house}
                        </div>
                        <div>
                          <p className="font-bold text-ink text-xs">{item.name}</p>
                          <p className="text-[11px] text-ink-muted">{item.note} • {item.method}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-black text-ink text-xs">{formatRupiah(item.amount)}</span>
                        <button
                          type="button"
                          onClick={() => handleApprovePayment(item.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold shadow-2xs transition-colors"
                        >
                          Setujui
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions Bendahara */}
            <div className="lg:col-span-4 bg-surface rounded-3xl p-6 border border-border shadow-card space-y-4">
              <h3 className="text-sm font-black text-ink border-b border-border pb-3">Aksi Cepat Finansial</h3>
              <div className="space-y-2">
                <a href="/admin/billing" className="p-3 bg-canvas hover:bg-primary-50 rounded-2xl border border-border flex items-center gap-3 font-bold text-ink hover:text-primary-700 transition-colors">
                  <Receipt className="w-4 h-4 text-emerald-600" />
                  <span>Terbitkan Invoice Massal IPL</span>
                </a>
                <a href="/admin/expenses" className="p-3 bg-canvas hover:bg-primary-50 rounded-2xl border border-border flex items-center gap-3 font-bold text-ink hover:text-primary-700 transition-colors">
                  <DollarSign className="w-4 h-4 text-rose-600" />
                  <span>Input Kuitansi Pengeluaran</span>
                </a>
                <a href="/admin/staff-loans" className="p-3 bg-canvas hover:bg-primary-50 rounded-2xl border border-border flex items-center gap-3 font-bold text-ink hover:text-primary-700 transition-colors">
                  <Banknote className="w-4 h-4 text-amber-600" />
                  <span>Kelola Kasbon & Gaji Awal Staf</span>
                </a>
                <a href="/admin/ledger" className="p-3 bg-canvas hover:bg-primary-50 rounded-2xl border border-border flex items-center gap-3 font-bold text-ink hover:text-primary-700 transition-colors">
                  <Wallet className="w-4 h-4 text-blue-600" />
                  <span>Buku Kas & Jurnal Keuangan</span>
                </a>
                <a href="/transparency" target="_blank" className="p-3 bg-canvas hover:bg-primary-50 rounded-2xl border border-border flex items-center gap-3 font-bold text-ink hover:text-primary-700 transition-colors">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <span>Preview Laporan Transparansi</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. DASHBOARD SEKRETARIS ADMINISTRASI                                     */}
      {/* ========================================================================= */}
      {activeRoleView === 'SECRETARY' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Banner Sekretaris */}
          <div className="bg-gradient-to-r from-purple-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-card flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="px-3 py-1 rounded-full bg-purple-500/30 text-purple-200 font-bold text-[10px] tracking-wider uppercase border border-purple-400/30 inline-block">
                Pusat Administrasi Warga & Sekretariat
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Tata Kelola Kependudukan, Dokumen & Musyawarah
              </h1>
              <p className="text-xs text-purple-100/80 leading-relaxed">
                Kelola data kepala keluarga, buat siaran edaran pengumuman ke WhatsApp warga, pantau e-voting musyawarah, dan kearsipan surat.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href="/admin/announcements"
                className="flex items-center gap-1.5 px-4 py-2.5 bg-purple-500 hover:bg-purple-400 text-purple-950 rounded-xl font-black shadow-xs transition-colors"
              >
                <Megaphone className="w-4 h-4" />
                <span>Buat Pengumuman Baru</span>
              </a>
              <a
                href="/admin/voting"
                className="flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-bold transition-colors"
              >
                <Vote className="w-4 h-4" />
                <span>Buka E-Voting Musyawarah</span>
              </a>
            </div>
          </div>

          {/* 4 Administration KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-surface rounded-3xl p-5 border border-border shadow-card space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">Total Rumah & KK</span>
                <div className="w-9 h-9 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
                  <Home className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-ink">{stats.totalProperties} Unit</p>
                <p className="text-[11px] text-indigo-700 font-bold mt-0.5">{stats.occupiedProperties} Rumah Dihuni • {stats.vacantProperties} Kosong</p>
              </div>
            </div>

            <div className="bg-surface rounded-3xl p-5 border border-border shadow-card space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">Total Jiwa Warga</span>
                <div className="w-9 h-9 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-purple-700">342 Jiwa</p>
                <p className="text-[11px] text-ink-muted mt-0.5">245 Dewasa • 97 Anak-anak</p>
              </div>
            </div>

            <div className="bg-surface rounded-3xl p-5 border border-border shadow-card space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">E-Voting Musyawarah</span>
                <div className="w-9 h-9 rounded-2xl bg-violet-100 text-violet-800 flex items-center justify-center font-bold">
                  <Vote className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-violet-700">1 Pemilihan Aktif</p>
                <p className="text-[11px] text-emerald-700 font-bold mt-0.5">82 Suara Warga Masuk (68%)</p>
              </div>
            </div>

            <div className="bg-surface rounded-3xl p-5 border border-border shadow-card space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">Dokumen & Arsip</span>
                <div className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-ink">18 Dokumen</p>
                <p className="text-[11px] text-blue-700 font-bold mt-0.5">SK Pengurus, Tata Tertib & Notula</p>
              </div>
            </div>
          </div>

          {/* Widgets Sekretaris */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Siaran Terkini */}
            <div className="lg:col-span-6 bg-surface rounded-3xl p-6 border border-border shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-purple-600" />
                  <h3 className="text-sm font-black text-ink">Siaran & Pengumuman Warga Aktif</h3>
                </div>
                <a href="/admin/announcements" className="text-xs font-bold text-primary-700 hover:underline">
                  Kelola →
                </a>
              </div>
              <div className="space-y-3">
                <div className="p-3.5 bg-canvas rounded-2xl border border-border space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-800 font-bold text-[10px] rounded-md">Agenda Warga</span>
                    <span className="text-[10px] text-ink-muted">Kemarin</span>
                  </div>
                  <h4 className="font-black text-xs text-ink">Rapat Musyawarah Bulanan & Laporan Kas</h4>
                  <p className="text-[11px] text-ink-muted">Disiarkan melalui WhatsApp ke 98 nomor kontak terdaftar.</p>
                </div>

                <div className="p-3.5 bg-canvas rounded-2xl border border-border space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-md">Kegiatan Sosial</span>
                    <span className="text-[10px] text-ink-muted">3 hari lalu</span>
                  </div>
                  <h4 className="font-black text-xs text-ink">Jadwal Kerja Bakti & Fogging Nyamuk DBD</h4>
                  <p className="text-[11px] text-ink-muted">Rute fogging Blok A sampai Blok D pada Minggu pagi 07:00 WIB.</p>
                </div>
              </div>
            </div>

            {/* Live E-Voting */}
            <div className="lg:col-span-6 bg-surface rounded-3xl p-6 border border-border shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Vote className="w-4 h-4 text-violet-600" />
                  <h3 className="text-sm font-black text-ink">Live Progress E-Voting Musyawarah</h3>
                </div>
                <a href="/admin/voting" className="text-xs font-bold text-primary-700 hover:underline">
                  Detail →
                </a>
              </div>
              <div className="p-4 bg-violet-50/60 rounded-2xl border border-violet-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-xs text-violet-950">Pemilihan Ketua RW 08 Periode 2026-2029</h4>
                  <span className="px-2 py-0.5 bg-violet-200 text-violet-900 font-bold text-[10px] rounded-md">Aktif</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between font-bold text-ink">
                      <span>Kandidat 01: Bpk. Budi Santoso</span>
                      <span className="text-violet-900">54 Suara (65.9%)</span>
                    </div>
                    <div className="w-full bg-surface h-2.5 rounded-full overflow-hidden border border-border mt-1">
                      <div className="bg-violet-600 h-full rounded-full" style={{ width: '65.9%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-bold text-ink">
                      <span>Kandidat 02: Bpk. Hendra Wijaya</span>
                      <span className="text-violet-900">28 Suara (34.1%)</span>
                    </div>
                    <div className="w-full bg-surface h-2.5 rounded-full overflow-hidden border border-border mt-1">
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: '34.1%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. DASHBOARD SATPAM / POS GERBANG                                         */}
      {/* ========================================================================= */}
      {activeRoleView === 'SECURITY' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Banner Satpam */}
          <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-900 text-white rounded-3xl p-6 sm:p-8 shadow-card flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="px-3 py-1 rounded-full bg-amber-500/30 text-amber-200 font-bold text-[10px] tracking-wider uppercase border border-amber-400/30 inline-block">
                Pusat Komando Keamanan & Pos Gerbang Satpam
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Kontrol Gerbang Palang, Buku Tamu & Patroli QR
              </h1>
              <p className="text-xs text-amber-100/80 leading-relaxed">
                Kendali barrier gate utama, pemantauan tamu masuk komplek secara real-time, penerimaan laporan SOS darurat, dan koordinasi keamanan 24 jam.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href="/admin/security-gate"
                className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-amber-950 rounded-xl font-black shadow-xs transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Buka Pos Gerbang Satpam Penuh</span>
              </a>
              <button
                type="button"
                onClick={() => setSirenActive(!sirenActive)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold transition-all shadow-xs ${
                  sirenActive ? 'bg-red-600 text-white animate-bounce' : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                }`}
              >
                <Volume2 className="w-4 h-4" />
                <span>{sirenActive ? '🚨 SIRENE DARURAT AKTIF' : 'Bunyikan Sirene'}</span>
              </button>
            </div>
          </div>

          {/* 4 Security KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-surface rounded-3xl p-5 border border-border shadow-card space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">Tamu di Dalam Komplek</span>
                <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Car className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-amber-700">6 Tamu Aktif</p>
                <p className="text-[11px] text-ink-muted mt-0.5">3 Mobil • 2 Motor • 1 Truk Paket</p>
              </div>
            </div>

            <div className="bg-surface rounded-3xl p-5 border border-border shadow-card space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">Status Barrier Gate</span>
                <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Shield className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-emerald-700">Gerbang 1 & 2 Normal</p>
                <p className="text-[11px] text-emerald-600 font-bold mt-0.5">RFID Reader & Kamera Online</p>
              </div>
            </div>

            <div className="bg-surface rounded-3xl p-5 border border-border shadow-card space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">Aduan Warga Darurat</span>
                <div className="w-9 h-9 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
                  <Headphones className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-rose-700">{stats.openComplaintsCount} Aduan Terbuka</p>
                <p className="text-[11px] text-rose-600 font-bold mt-0.5">PJU Mati Blok C & Parkir Sembarangan</p>
              </div>
            </div>

            <div className="bg-surface rounded-3xl p-5 border border-border shadow-card space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">Patroli QR Ronda</span>
                <div className="w-9 h-9 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                  <QrCode className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-purple-700">12 Checkpoint</p>
                <p className="text-[11px] text-emerald-700 font-bold mt-0.5">Patroli Malam Selesai 100%</p>
              </div>
            </div>
          </div>

          {/* Quick Remote Gate Control & Visitor Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-surface rounded-3xl p-6 border border-border shadow-card space-y-4">
              <h3 className="text-sm font-black text-ink border-b border-border pb-3 flex items-center justify-between">
                <span>⚡ Kontrol Remote Palang Gerbang</span>
                <span className="text-[10px] text-emerald-600 font-bold">Relay Otomatis 8 Detik</span>
              </h3>

              <div className="space-y-3">
                {/* Gate 1 */}
                <div className="p-4 bg-canvas rounded-2xl border border-border flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-ink text-xs">Gerbang 1 (Masuk Utama Boulevard)</h4>
                    <p className="text-[11px] text-ink-muted mt-0.5">
                      Status: <span className={gate1Open ? 'text-emerald-700 font-bold' : 'text-slate-700 font-bold'}>
                        {gate1Open ? '🟢 TERBUKA (8s Relay)' : '🔴 TERTUTUP'}
                      </span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => triggerGate(1)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-2xs transition-all"
                  >
                    Buka Palang
                  </button>
                </div>

                {/* Gate 2 */}
                <div className="p-4 bg-canvas rounded-2xl border border-border flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-ink text-xs">Gerbang 2 (Keluar / Timur)</h4>
                    <p className="text-[11px] text-ink-muted mt-0.5">
                      Status: <span className={gate2Open ? 'text-emerald-700 font-bold' : 'text-slate-700 font-bold'}>
                        {gate2Open ? '🟢 TERBUKA (8s Relay)' : '🔴 TERTUTUP'}
                      </span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => triggerGate(2)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-2xs transition-all"
                  >
                    Buka Palang
                  </button>
                </div>
              </div>

              {/* Emergency Dialers */}
              <div className="pt-2 border-t border-border">
                <span className="font-bold text-xs text-ink block mb-2">Panggilan Cepat Darurat Pos Satpam:</span>
                <div className="grid grid-cols-2 gap-2">
                  <a href="tel:110" className="p-2.5 bg-canvas hover:bg-primary-50 rounded-xl border border-border text-center font-bold text-xs text-blue-800">
                    📞 Polsek: 110
                  </a>
                  <a href="tel:113" className="p-2.5 bg-canvas hover:bg-primary-50 rounded-xl border border-border text-center font-bold text-xs text-red-800">
                    🚒 Damkar: 113
                  </a>
                </div>
              </div>
            </div>

            {/* Live Visitor Feed */}
            <div className="lg:col-span-7 bg-surface rounded-3xl p-6 border border-border shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-amber-600" />
                  <h3 className="text-sm font-black text-ink">Buku Tamu Digital Terkini di Komplek</h3>
                </div>
                <a href="/admin/security-gate" className="text-xs font-bold text-primary-700 hover:underline">
                  Lihat Seluruh Tamu →
                </a>
              </div>

              <div className="divide-y divide-border/60">
                {[
                  { name: 'Ridwan Fauzi (Tamu Keluarga)', unit: 'A-04', plate: 'B 1234 SAK', category: 'Keluarga', inTime: '08:30 WIB', status: 'Di Dalam' },
                  { name: 'Kurir J&T Express (Antar Paket)', unit: 'B-07, B-12', plate: 'B 4567 TUV', category: 'Kurir Paket', inTime: '09:15 WIB', status: 'Di Dalam' },
                  { name: 'GrabFood Delivery', unit: 'C-03', plate: 'B 8899 XYZ', category: 'Ojol Makanan', inTime: '09:40 WIB', status: 'Di Dalam' },
                  { name: 'Teknisi Servis AC Daikin', unit: 'A-17', plate: 'B 3344 KLM', category: 'Teknisi/Servis', inTime: '07:50 WIB', status: 'Sudah Keluar' },
                ].map((guest, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold text-xs">
                        <Car className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-ink text-xs">{guest.name}</p>
                        <p className="text-[11px] text-ink-muted">Tujuan Rumah {guest.unit} • Plat: {guest.plate} ({guest.category})</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                      guest.status === 'Di Dalam' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {guest.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. DASHBOARD TIM KEBERSIHAN & TEKNISI FASUM                              */}
      {/* ========================================================================= */}
      {activeRoleView === 'MAINTENANCE' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Banner Kebersihan & Teknisi */}
          <div className="bg-gradient-to-r from-teal-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-card flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="px-3 py-1 rounded-full bg-teal-500/30 text-teal-200 font-bold text-[10px] tracking-wider uppercase border border-teal-400/30 inline-block">
                Pusat Operasional Kebersihan & Teknisi Lingkungan
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Jadwal Armada Sampah Viar Tossa & Servis Fasum
              </h1>
              <p className="text-xs text-teal-100/80 leading-relaxed">
                Pemantauan rute pengangkutan sampah harian door-to-door, kapasitas TPS3R komplek, pemeliharaan pompa air booster, dan tiket perbaikan fasilitas.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href="/admin/cleaning-staff"
                className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-400 hover:bg-teal-300 text-teal-950 rounded-xl font-black shadow-xs transition-colors"
              >
                <Truck className="w-4 h-4" />
                <span>Jadwal Armada Sampah</span>
              </a>
              <a
                href="/admin/facilities?tab=maintenance"
                className="flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-bold transition-colors"
              >
                <Wrench className="w-4 h-4" />
                <span>Tiket Maintenance</span>
              </a>
            </div>
          </div>

          {/* 4 Maintenance KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-surface rounded-3xl p-5 border border-border shadow-card space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">Armada Viar Tossa</span>
                <div className="w-9 h-9 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                  <Truck className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-teal-700">2 Unit Siap Jalan</p>
                <p className="text-[11px] text-emerald-700 font-bold mt-0.5">Rute Pagi: Blok A & B Selesai</p>
              </div>
            </div>

            <div className="bg-surface rounded-3xl p-5 border border-border shadow-card space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">Kapasitas TPS3R</span>
                <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <RefreshCw className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-emerald-700">45% (Normal)</p>
                <p className="text-[11px] text-ink-muted mt-0.5">Jadwal Angkut Truk DLH: Besok 06:00 WIB</p>
              </div>
            </div>

            <div className="bg-surface rounded-3xl p-5 border border-border shadow-card space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">Tiket Servis Fasum</span>
                <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Wrench className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-amber-700">{stats.needingRepairCount} Fasum Perlu Servis</p>
                <p className="text-[11px] text-amber-800 font-bold mt-0.5">Pompa Air Booster & PJU Blok C</p>
              </div>
            </div>

            <div className="bg-surface rounded-3xl p-5 border border-border shadow-card space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">Fasilitas Siap Pakai</span>
                <div className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-ink">8 dari 9 Fasilitas</p>
                <p className="text-[11px] text-emerald-700 font-bold mt-0.5">Balai Warga, Lapangan, Taman Aktif</p>
              </div>
            </div>
          </div>

          {/* Maintenance Work Orders & Route Status */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-surface rounded-3xl p-6 border border-border shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-teal-600" />
                  <h3 className="text-sm font-black text-ink">Daftar Pekerjaan Maintenance & Perbaikan Fasum</h3>
                </div>
                <a href="/admin/facilities?tab=maintenance" className="text-xs font-bold text-primary-700 hover:underline">
                  Semua Tiket →
                </a>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-canvas rounded-2xl border border-border flex items-start justify-between gap-3">
                  <div>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold text-[10px] rounded-md">Prioritas Tinggi</span>
                    <h4 className="font-black text-xs text-ink mt-1">Perbaikan Lampu PJU Blok C Pertigaan</h4>
                    <p className="text-[11px] text-ink-muted mt-0.5">Dilaporkan warga: Lampu berkedip dan padam total saat malam.</p>
                  </div>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 shrink-0">
                    Menunggu Sparepart
                  </span>
                </div>

                <div className="p-3.5 bg-canvas rounded-2xl border border-border flex items-start justify-between gap-3">
                  <div>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold text-[10px] rounded-md">Rutin Berkala</span>
                    <h4 className="font-black text-xs text-ink mt-1">Penggantian Seal & Pelumasan Pompa Booster Air</h4>
                    <p className="text-[11px] text-ink-muted mt-0.5">Jadwal servis rutin bulanan instalasi air bersih Balai Warga.</p>
                  </div>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200 shrink-0">
                    Terjadwal Besok
                  </span>
                </div>
              </div>
            </div>

            {/* Jadwal Sampah Rute */}
            <div className="lg:col-span-5 bg-surface rounded-3xl p-6 border border-border shadow-card space-y-4">
              <h3 className="text-sm font-black text-ink border-b border-border pb-3">Rute Armada Viar Tossa Minggu Ini</h3>
              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-emerald-950">Senin & Kamis (07:00 - 11:00 WIB)</p>
                    <p className="text-[11px] text-emerald-800">Blok A (Boulevard) & Blok B (Taman Barat)</p>
                  </div>
                  <span className="text-[10px] font-black text-emerald-700 bg-white px-2 py-0.5 rounded shadow-2xs">Selesai</span>
                </div>

                <div className="p-3 bg-canvas rounded-2xl border border-border flex items-center justify-between">
                  <div>
                    <p className="font-bold text-ink">Selasa & Jumat (07:00 - 11:00 WIB)</p>
                    <p className="text-[11px] text-ink-muted">Blok C (Taman Timur) & Blok D (Taman Selatan)</p>
                  </div>
                  <span className="text-[10px] font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded">Besok</span>
                </div>

                <div className="p-3 bg-canvas rounded-2xl border border-border flex items-center justify-between">
                  <div>
                    <p className="font-bold text-ink">Rabu & Sabtu (08:00 - 12:00 WIB)</p>
                    <p className="text-[11px] text-ink-muted">Pembersihan Fasum, Taman Bermain & Angkut Sampah Ranting</p>
                  </div>
                  <span className="text-[10px] font-bold text-ink-muted">Terjadwal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. DASHBOARD WARGA KOMPLEK MANDIRI                                        */}
      {/* ========================================================================= */}
      {(activeRoleView === 'HOUSEHOLD_HEAD' || activeRoleView === 'HOUSE_OWNER' || activeRoleView === 'RESIDENT') && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-card flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 font-bold text-[10px] tracking-wider uppercase border border-indigo-400/30 inline-block">
                Portal Mandiri Warga Komplek
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Selamat Datang di Portal Layanan Warga
              </h1>
              <p className="text-xs text-indigo-100/80 leading-relaxed">
                Akses mandiri untuk memantau iuran bulanan rumah Anda, mengunduh kuitansi digital, membuat QR pas tamu untuk barrier gate, dan menyampaikan aduan lingkungan.
              </p>
            </div>

            <a
              href="/warga"
              className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-indigo-950 font-black rounded-2xl shadow-md transition-all text-sm shrink-0"
            >
              <Home className="w-5 h-5" />
              <span>Buka Portal Mandiri Warga</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-surface rounded-3xl border border-border shadow-card space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Receipt className="w-5 h-5" />
              </div>
              <h3 className="font-black text-sm text-ink">Iuran & Pembayaran IPL</h3>
              <p className="text-ink-muted text-xs">Cek riwayat tagihan dan upload bukti transfer BCA langsung dari ponsel Anda.</p>
              <a href="/warga" className="font-bold text-primary-700 hover:underline block pt-2 text-xs">Buka Tagihan →</a>
            </div>

            <div className="p-5 bg-surface rounded-3xl border border-border shadow-card space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="font-black text-sm text-ink">Pas Tamu & Barrier Gate</h3>
              <p className="text-ink-muted text-xs">Generate QR Pass tamu untuk keluarga, kurir, atau delivery agar mudah masuk gerbang.</p>
              <a href="/warga" className="font-bold text-primary-700 hover:underline block pt-2 text-xs">Buat Pas Tamu →</a>
            </div>

            <div className="p-5 bg-surface rounded-3xl border border-border shadow-card space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
                <Headphones className="w-5 h-5" />
              </div>
              <h3 className="font-black text-sm text-ink">Aduan & Layanan Fasum</h3>
              <p className="text-ink-muted text-xs">Laporkan kendala fasilitas umum atau booking Balai Warga & Lapangan olahraga.</p>
              <a href="/warga" className="font-bold text-primary-700 hover:underline block pt-2 text-xs">Sampaikan Aduan →</a>
            </div>
          </div>
        </div>
      )}

      {/* ================= 5. QUICK ACCESS SHORTCUTS DIRECTORY ================= */}
      <div className="bg-surface rounded-3xl p-6 border border-border shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary-600" />
            <h3 className="text-sm font-black text-ink">Akses Cepat Seluruh Modul WargaHub</h3>
          </div>
          <span className="text-ink-muted text-[11px]">1-Klik menuju fitur</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { title: 'Data Rumah', url: '/admin/properties', icon: Home, color: 'text-blue-600 bg-blue-50' },
            { title: 'Penghuni & KK', url: '/admin/properties?tab=occupants', icon: Users, color: 'text-indigo-600 bg-indigo-50' },
            { title: 'Billing & Iuran', url: '/admin/billing', icon: CreditCard, color: 'text-emerald-600 bg-emerald-50' },
            { title: 'Kas & Ledger', url: '/admin/ledger', icon: Wallet, color: 'text-teal-600 bg-teal-50' },
            { title: 'Kasbon Staf', url: '/admin/staff-loans', icon: DollarSign, color: 'text-amber-600 bg-amber-50' },
            { title: 'Pos Satpam', url: '/admin/security-gate', icon: ShieldCheck, color: 'text-purple-600 bg-purple-50' },
            { title: 'Tim Kebersihan', url: '/admin/cleaning-staff', icon: Truck, color: 'text-emerald-600 bg-emerald-50' },
            { title: 'Sarana Fasum', url: '/admin/facilities', icon: Building2, color: 'text-sky-600 bg-sky-50' },
            { title: 'Aduan Warga', url: '/admin/complaints', icon: Headphones, color: 'text-rose-600 bg-rose-50' },
            { title: 'E-Voting & Poll', url: '/admin/voting', icon: Vote, color: 'text-violet-600 bg-violet-50' },
            { title: 'Siaran Broadcast', url: '/admin/announcements', icon: Megaphone, color: 'text-amber-600 bg-amber-50' },
            { title: 'Master Settings', url: '/admin/settings', icon: Sparkles, color: 'text-primary-600 bg-primary-50' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.title}
                href={item.url}
                className="p-3 bg-canvas hover:bg-surface rounded-2xl border border-border/80 hover:border-primary-400 hover:shadow-xs transition-all flex flex-col items-center text-center gap-2 group"
              >
                <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center font-bold group-hover:scale-105 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="font-bold text-ink text-xs group-hover:text-primary-700 transition-colors">
                  {item.title}
                </span>
              </a>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-muted">
        <span>© 2026 WargaHub Enterprise. Seluruh hak cipta dilindungi.</span>
        <div className="flex items-center gap-3 font-bold text-ink">
          <span>{communityName}</span>
          <span>•</span>
          <span className="text-emerald-700">Sistem Terintegrasi Online</span>
        </div>
      </div>
    </div>
  );
};

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = (props) => {
  return (
    <ErrorBoundary fallbackTitle="Kendala Memuat Dashboard Admin">
      <AdminDashboardInner {...props} />
    </ErrorBoundary>
  );
};
