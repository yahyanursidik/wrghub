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
  const [budgetSearch, setBudgetSearch] = useState('');

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
  const [dashHeading, setDashHeading] = useState('Dashboard Eksekutif Komplek');
  const [dashSubheading, setDashSubheading] = useState('Pusat Kendali Operasional, Keuangan Kas & Layanan Warga Komplek.');
  const [communityName, setCommunityName] = useState('Komplek Perumahan Taman Sejahtera');

  // Security gate live state (for Security dashboard widget)
  const [gate1Open, setGate1Open] = useState(false);
  const [gate2Open, setGate2Open] = useState(false);
  const [sirenActive, setSirenActive] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

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
      status: 'On Track',
    },
    {
      keterangan: 'Pengeluaran Gaji & Operasional Satpam/Kebersihan',
      anggaran: 45000000,
      realisasi: 28350000,
      selisih: 16650000,
      isPositive: true,
      pct: 63.0,
      status: 'Hemat 37%',
    },
    {
      keterangan: 'Pemeliharaan Fasum, PJU & Pompa Air',
      anggaran: 20000000,
      realisasi: 12600000,
      selisih: 7400000,
      isPositive: true,
      pct: 63.0,
      status: 'Terkendali',
    },
    {
      keterangan: 'Kas Cadangan & Pembangunan Fasilitas',
      anggaran: 25000000,
      realisasi: 23550000,
      selisih: -1450000,
      isPositive: false,
      pct: 94.2,
      status: 'Hampir Penuh',
    },
    {
      keterangan: 'TOTAL ANGGARAN & REALISASI KAS',
      anggaran: 90000000,
      realisasi: 64500000,
      selisih: -25500000,
      isPositive: false,
      pct: 71.7,
      isTotal: true,
      status: 'Audit Sesuai',
    },
  ];

  const filteredBudgetData = budgetData.filter(b => 
    b.keterangan.toLowerCase().includes(budgetSearch.toLowerCase())
  );

  // Block compliance data
  const blockStats = [
    { block: 'Blok A (Boulevard Utama)', total: 32, paid: 31, pct: 96.8, color: 'bg-emerald-500', note: '1 unit proses verifikasi' },
    { block: 'Blok B (Taman Barat)', total: 30, paid: 28, pct: 93.3, color: 'bg-emerald-500', note: '2 unit jatuh tempo 25 Agt' },
    { block: 'Blok C (Taman Timur)', total: 31, paid: 30, pct: 96.7, color: 'bg-emerald-500', note: '1 unit kosong' },
    { block: 'Blok D (Taman Selatan)', total: 30, paid: 28, pct: 93.3, color: 'bg-emerald-500', note: '2 unit konfirmasi transfer' },
  ];

  // Activities list
  const allActivities = [
    {
      id: 'act-1',
      type: 'finance',
      icon: CreditCard,
      iconBg: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      category: 'finance',
      title: 'Pembayaran IPL Rumah A-17 Terverifikasi',
      detail: 'Bpk. Budi Santoso membayar Rp 750.000 via Transfer BCA',
      time: '12 menit lalu',
      link: '/admin/payments',
    },
    {
      id: 'act-2',
      type: 'security',
      icon: ShieldCheck,
      iconBg: 'bg-blue-50 text-blue-700 border border-blue-200',
      category: 'security',
      title: 'Tamu Masuk: Kurir Ekspedisi J&T',
      detail: 'Tujuan Rumah B-07 (Telah diverifikasi Satpam Pos 1)',
      time: '28 menit lalu',
      link: '/admin/security-gate',
    },
    {
      id: 'act-3',
      type: 'complaint',
      icon: Headphones,
      iconBg: 'bg-amber-50 text-amber-700 border border-amber-200',
      category: 'complaint',
      title: 'Aduan Warga: PJU Blok C Mati',
      detail: 'Dilaporkan oleh warga C-12, teknisi ditugaskan untuk survei',
      time: '1 jam lalu',
      link: '/admin/complaints',
    },
    {
      id: 'act-4',
      type: 'facility',
      icon: Truck,
      iconBg: 'bg-teal-50 text-teal-700 border border-teal-200',
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
    const item = pendingList.find(p => p.id === id);
    setPendingList(prev => prev.filter(p => p.id !== id));
    showToast(`✓ Pembayaran ${item?.house} (${item?.name}) senilai ${formatRupiah(item?.amount || 0)} berhasil disetujui.`);
  };

  // Switch gate relay
  const triggerGate = (gate: 1 | 2) => {
    if (gate === 1) {
      setGate1Open(true);
      showToast('⚡ Palang Gerbang 1 (Pintu Masuk) DIBUKA (Relay 8 Detik)');
      setTimeout(() => setGate1Open(false), 8000);
    } else {
      setGate2Open(true);
      showToast('⚡ Palang Gerbang 2 (Pintu Keluar) DIBUKA (Relay 8 Detik)');
      setTimeout(() => setGate2Open(false), 8000);
    }
  };

  return (
    <div className="space-y-6 pb-12 text-xs">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-950 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="font-bold text-xs">{toastMessage}</span>
        </div>
      )}

      {/* ================= TOP SEGMENTED ROLE CONTROLLER ================= */}
      <div className="bg-surface rounded-3xl p-4 sm:p-5 border border-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-black border border-emerald-200 flex items-center gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              SISTEM ONLINE
            </span>
            <span className="text-[11px] text-ink-muted font-medium font-mono">
              RT 02 / RW 05 • {communityName}
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-ink tracking-tight flex items-center gap-2">
            <span>Pusat Kendali Peran:</span>
            <span className="text-primary-700 font-extrabold">
              {activeRoleView === 'CHAIRMAN' || activeRoleView === 'SUPER_ADMIN'
                ? 'Ketua Paguyuban'
                : activeRoleView === 'TREASURER'
                ? 'Bendahara Keuangan'
                : activeRoleView === 'SECRETARY'
                ? 'Sekretaris Paguyuban'
                : activeRoleView === 'SECURITY'
                ? 'Satpam Pos Gerbang'
                : activeRoleView === 'MAINTENANCE'
                ? 'Tim Kebersihan & Teknisi'
                : 'Warga Komplek'}
            </span>
          </h2>
        </div>

        {/* Role Selector Segmented Controller */}
        <div className="flex items-center gap-1 p-1 bg-canvas border border-border/80 rounded-2xl overflow-x-auto no-scrollbar text-[11px]">
          {[
            { role: 'CHAIRMAN' as UserRole, label: 'Ketua', count: null },
            { role: 'TREASURER' as UserRole, label: 'Bendahara', count: pendingList.length > 0 ? pendingList.length : null },
            { role: 'SECRETARY' as UserRole, label: 'Sekretaris', count: null },
            { role: 'SECURITY' as UserRole, label: 'Satpam', count: '6 Tamu' },
            { role: 'MAINTENANCE' as UserRole, label: 'Kebersihan', count: null },
            { role: 'HOUSEHOLD_HEAD' as UserRole, label: 'Warga', count: null },
          ].map((tab) => {
            const isActive = activeRoleView === tab.role;
            return (
              <button
                key={tab.role}
                type="button"
                onClick={() => setActiveRoleView(tab.role)}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap active:scale-[0.98] flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-ink-muted hover:text-ink hover:bg-surface'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count && (
                  <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-mono font-bold ${
                    isActive ? 'bg-amber-400 text-slate-950' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. DASHBOARD KETUA KOMPLEK / SUPER ADMIN (SWISS BENTO GRID)              */}
      {/* ========================================================================= */}
      {(activeRoleView === 'CHAIRMAN' || activeRoleView === 'SUPER_ADMIN' || activeRoleView === 'RESIDENT_ADMIN') && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Executive Header Banner (Dark Architectural Aesthetic) */}
          <div className="bg-slate-950 text-white border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-card relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-white/10 text-emerald-300 font-mono text-[10px] font-bold tracking-wider uppercase border border-white/10">
                  EXECUTIVE DASHBOARD
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  TAHUN ANGGARAN 2026
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {dashHeading}
              </h1>
              <p className="text-xs text-slate-300/90 leading-relaxed">
                {dashSubheading}
              </p>
            </div>

            <div className="relative z-10 flex flex-wrap items-center gap-2.5">
              <a
                href="/admin/billing"
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white rounded-xl font-bold shadow-xs transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Terbitkan Tagihan IPL</span>
              </a>
              <a
                href="/admin/announcements"
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-slate-200 border border-slate-700 rounded-xl font-bold transition-all"
              >
                <Megaphone className="w-4 h-4 text-primary-400" />
                <span>Siaran Edaran Warga</span>
              </a>
            </div>
          </div>

          {/* SWISS BENTO GRID: Core Financial & Operational Anchors */}
          <div className="grid grid-cols-12 gap-4">
            {/* 1. Primary Anchor: Kas Operasional BCA */}
            <div className="col-span-12 lg:col-span-5 bg-surface rounded-3xl p-6 border border-border shadow-xs flex flex-col justify-between group hover:border-border transition-colors">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-ink-muted block">
                        Saldo Kas Perbendaharaan
                      </span>
                      <h4 className="font-bold text-ink text-sm">Rekening Operasional Bank BCA</h4>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-bold">
                    TERVERIFIKASI
                  </span>
                </div>

                <div className="pt-2">
                  <span className="text-[11px] text-ink-muted">Total Likuiditas Kas Aktif:</span>
                  <p className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-ink tabular-nums mt-0.5">
                    {formatRupiah(stats.cashBalance)}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-canvas border border-border/70 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-ink-muted text-[10px] uppercase font-bold block">Pemasukan Bulan Ini:</span>
                    <span className="font-mono font-bold text-emerald-700 tabular-nums">+{formatRupiah(stats.paidAmount)}</span>
                  </div>
                  <div>
                    <span className="text-ink-muted text-[10px] uppercase font-bold block">Tunggakan Tertunda:</span>
                    <span className="font-mono font-bold text-rose-600 tabular-nums">{formatRupiah(stats.unpaidAmount)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-border flex items-center justify-between">
                <a href="/admin/ledger" className="font-bold text-primary-700 hover:text-primary-800 flex items-center gap-1 group-hover:underline">
                  <span>Buka Buku Kas & Rekonsiliasi</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </a>
                <span className="text-[10px] font-mono text-ink-muted">Bank ID: 731-0988-221</span>
              </div>
            </div>

            {/* 2. Secondary Anchor: Kepatuhan IPL & Kolektibilitas */}
            <div className="col-span-12 sm:col-span-6 lg:col-span-4 bg-surface rounded-3xl p-6 border border-border shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-2xl bg-primary-50 text-primary-700 border border-primary-200 flex items-center justify-center font-bold">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-ink-muted block">
                        Kepatuhan Warga
                      </span>
                      <h4 className="font-bold text-ink text-sm">Kolektibilitas Iuran IPL</h4>
                    </div>
                  </div>
                  <span className="font-mono font-black text-base text-primary-700">
                    {stats.paidPercentage}%
                  </span>
                </div>

                <div>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-2xl font-black font-mono text-ink tabular-nums">
                      {stats.paidCount} / {stats.totalProperties}
                    </span>
                    <span className="text-ink-muted font-bold text-[11px]">Unit Lunas</span>
                  </div>
                  
                  {/* Visual Segmented Progress Bar */}
                  <div className="w-full bg-canvas h-3 rounded-full overflow-hidden border border-border/70 p-0.5">
                    <div
                      className="bg-primary-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${stats.paidPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5 pt-1 text-[11px]">
                  <div className="flex justify-between text-ink-muted">
                    <span>Target Tagihan Bulanan:</span>
                    <span className="font-mono font-bold text-ink">{formatRupiah(stats.totalProperties * stats.monthlyRate)}</span>
                  </div>
                  <div className="flex justify-between text-ink-muted">
                    <span>Sisa Tunggakan:</span>
                    <span className="font-mono font-bold text-rose-600">{stats.unpaidCount} Rumah</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <a href="/admin/billing" className="font-bold text-primary-700 hover:text-primary-800 flex items-center gap-1">
                  <span>Kelola Penagihan IPL</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
                <span className="text-[10px] text-ink-muted">Bulan Berjalan</span>
              </div>
            </div>

            {/* 3. Third Anchor: Demografi Hunian Komplek */}
            <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-surface rounded-3xl p-6 border border-border shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center font-bold">
                      <Home className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-ink-muted block">
                        Inventaris Hunian
                      </span>
                      <h4 className="font-bold text-ink text-sm">Okupansi Rumah</h4>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 text-[10px] font-mono font-bold">
                    {stats.occupiedPercentage}%
                  </span>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="p-2.5 bg-canvas rounded-xl border border-border/70 flex items-center justify-between">
                    <span className="text-ink font-bold">Rumah Dihuni:</span>
                    <span className="font-mono font-black text-emerald-700 text-sm">{stats.occupiedProperties} Unit</span>
                  </div>
                  <div className="p-2.5 bg-canvas rounded-xl border border-border/70 flex items-center justify-between">
                    <span className="text-ink font-bold">Rumah Kosong / Renov:</span>
                    <span className="font-mono font-black text-ink-muted text-sm">{stats.vacantProperties} Unit</span>
                  </div>
                </div>

                <p className="text-[11px] text-ink-muted">
                  Estimasi populasi warga aktif tercatat: <strong className="text-ink font-mono font-bold">342 Jiwa</strong> (117 Kepala Keluarga).
                </p>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <a href="/admin/properties" className="font-bold text-primary-700 hover:text-primary-800 flex items-center gap-1">
                  <span>Data Blok Rumah</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
                <span className="text-[10px] font-mono text-ink-muted">4 Blok Aktif</span>
              </div>
            </div>
          </div>

          {/* OPERATIONAL STATUS TILES (Tactile 4-Column Strip) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tile 1: Antrean Verifikasi */}
            <a href="/admin/payments" className="p-4 bg-surface rounded-2xl border border-border hover:border-amber-400 hover:shadow-xs transition-all flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold">
                  <Hourglass className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-ink-muted block">Antrean Verifikasi</span>
                  <p className="text-lg font-black font-mono text-ink tabular-nums">{pendingList.length} Pembayaran</p>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-700 group-hover:translate-x-0.5 transition-transform">Review →</span>
            </a>

            {/* Tile 2: Tiket Aduan Warga */}
            <a href="/admin/complaints" className="p-4 bg-surface rounded-2xl border border-border hover:border-rose-400 hover:shadow-xs transition-all flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center font-bold">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-ink-muted block">Aduan Lingkungan</span>
                  <p className="text-lg font-black font-mono text-ink tabular-nums">{stats.openComplaintsCount} Tiket Aktif</p>
                </div>
              </div>
              <span className="text-xs font-bold text-rose-700 group-hover:translate-x-0.5 transition-transform">Pantau →</span>
            </a>

            {/* Tile 3: Keamanan Pos Gerbang */}
            <a href="/admin/security-gate" className="p-4 bg-surface rounded-2xl border border-border hover:border-purple-400 hover:shadow-xs transition-all flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-ink-muted block">Pos Satpam 24 Jam</span>
                  <p className="text-lg font-black font-mono text-ink tabular-nums">4 Regu Aktif</p>
                </div>
              </div>
              <span className="text-xs font-bold text-purple-700 group-hover:translate-x-0.5 transition-transform">Gerbang →</span>
            </a>

            {/* Tile 4: Armada Kebersihan */}
            <a href="/admin/cleaning-staff" className="p-4 bg-surface rounded-2xl border border-border hover:border-teal-400 hover:shadow-xs transition-all flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center font-bold">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-ink-muted block">Armada Viar Tossa</span>
                  <p className="text-lg font-black font-mono text-ink tabular-nums">Rute Pagi Beres</p>
                </div>
              </div>
              <span className="text-xs font-bold text-teal-700 group-hover:translate-x-0.5 transition-transform">Jadwal →</span>
            </a>
          </div>

          {/* REALISASI APB & BLOK MATRIX (2-Column Dense Grid) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: APB Ledger Realization Table */}
            <div className="lg:col-span-7 bg-surface rounded-3xl p-6 border border-border shadow-card space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
                <div>
                  <h3 className="text-sm font-black text-ink">Realisasi Anggaran Pendapatan & Belanja (APB)</h3>
                  <p className="text-ink-muted text-[11px]">Rencana pagu vs pengeluaran riil per {selectedMonth}</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Cari pos anggaran..."
                    value={budgetSearch}
                    onChange={(e) => setBudgetSearch(e.target.value)}
                    className="px-2.5 py-1.5 bg-canvas border border-border rounded-xl text-[11px] font-medium text-ink w-36 sm:w-44 focus:outline-none focus:border-primary-500"
                  />
                  <a href="/admin/budget" className="px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-bold text-[11px] active:scale-[0.98] transition-all">
                    Detail APB
                  </a>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-ink-muted font-mono uppercase text-[10px]">
                      <th className="pb-2.5 font-bold">Pos Anggaran</th>
                      <th className="pb-2.5 text-right font-bold">Target Pagu</th>
                      <th className="pb-2.5 text-right font-bold">Realisasi Riil</th>
                      <th className="pb-2.5 text-right font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredBudgetData.map((row) => (
                      <tr key={row.keterangan} className={row.isTotal ? 'bg-canvas font-black' : 'text-ink'}>
                        <td className="py-3 pr-2">
                          <p className="font-bold text-xs">{row.keterangan}</p>
                          <div className="w-32 bg-canvas h-1.5 rounded-full overflow-hidden border border-border/50 mt-1">
                            <div className={`h-full rounded-full ${row.pct > 80 ? 'bg-primary-600' : 'bg-emerald-500'}`} style={{ width: `${Math.min(row.pct, 100)}%` }} />
                          </div>
                        </td>
                        <td className="py-3 px-2 text-right tabular-nums font-mono text-ink-muted">{formatRupiah(row.anggaran)}</td>
                        <td className="py-3 px-2 text-right tabular-nums font-mono font-bold text-ink">{formatRupiah(row.realisasi)}</td>
                        <td className="py-3 pl-2 text-right">
                          <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                            row.isPositive ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-800 border border-slate-200'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: Block Compliance Matrix */}
            <div className="lg:col-span-5 bg-surface rounded-3xl p-6 border border-border shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h3 className="text-sm font-black text-ink">Kepatuhan Iuran per Blok</h3>
                  <p className="text-ink-muted text-[11px]">Rekap pembayaran warga tingkat RT</p>
                </div>
                <span className="font-mono text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {stats.paidPercentage}% LUNAS
                </span>
              </div>

              <div className="space-y-3">
                {blockStats.map((b) => (
                  <div key={b.block} className="p-3.5 bg-canvas rounded-2xl border border-border/70 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-black text-ink block">{b.block}</span>
                        <span className="text-[10px] text-ink-muted">{b.note}</span>
                      </div>
                      <span className="font-mono font-black text-primary-700">
                        {b.paid}/{b.total} Unit ({b.pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-surface h-2 rounded-full overflow-hidden border border-border/60">
                      <div className={`h-full rounded-full ${b.color}`} style={{ width: `${b.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-primary-50/60 border border-primary-100 flex items-center justify-between text-xs">
                <span className="text-primary-900 font-bold">Kirim pengingat WhatsApp tagihan:</span>
                <a href="/admin/announcements" className="px-2.5 py-1 bg-primary-600 hover:bg-primary-700 active:scale-[0.98] text-white rounded-lg font-bold text-[11px] transition-colors">
                  Kirim Pesan
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. DASHBOARD BENDAHARA KEAUANGAN (CASHFLOW & VERIFICATION)               */}
      {/* ========================================================================= */}
      {activeRoleView === 'TREASURER' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-slate-950 text-white border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-card relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-white/10 text-blue-300 font-mono text-[10px] font-bold tracking-wider uppercase border border-white/10">
                  TREASURY LEDGER
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  BENDAHARA KEUANGAN
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Manajemen Kas & Rekonsiliasi Iuran Warga
              </h1>
              <p className="text-xs text-slate-300/90 leading-relaxed">
                Verifikasi bukti pembayaran warga secara real-time, pencatatan kas keluar operasional, dan laporan transparansi publik.
              </p>
            </div>

            <div className="relative z-10 flex flex-wrap items-center gap-2.5">
              <a
                href="/admin/payments"
                className="flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-slate-950 rounded-xl font-bold shadow-xs transition-all"
              >
                <Hourglass className="w-4 h-4" />
                <span>Antrean Verifikasi ({pendingList.length})</span>
              </a>
              <a
                href="/admin/expenses"
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-slate-200 border border-slate-700 rounded-xl font-bold transition-all"
              >
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Catat Kas Keluar</span>
              </a>
            </div>
          </div>

          {/* 4 Financial KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-surface rounded-3xl p-5 border border-border shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-ink-muted tracking-wider">Perlu Verifikasi</span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black font-mono text-amber-700 tabular-nums">{pendingList.length} Transaksi</p>
                <p className="text-[11px] text-ink-muted mt-0.5">Bukti transfer masuk menunggu review</p>
              </div>
            </div>

            <div className="bg-surface rounded-3xl p-5 border border-border shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-ink-muted tracking-wider">Iuran Masuk Bulan Ini</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black font-mono text-emerald-700 tabular-nums">{formatRupiah(stats.paidAmount)}</p>
                <p className="text-[11px] text-emerald-600 font-bold mt-0.5">86 dari 120 unit lunas ({stats.paidPercentage}%)</p>
              </div>
            </div>

            <div className="bg-surface rounded-3xl p-5 border border-border shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-ink-muted tracking-wider">Tunggakan Tertunda</span>
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center font-bold">
                  <AlertCircle className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black font-mono text-rose-700 tabular-nums">{formatRupiah(stats.unpaidAmount)}</p>
                <p className="text-[11px] text-rose-600 font-bold mt-0.5">{stats.unpaidCount} unit belum menyelesaikan tagihan</p>
              </div>
            </div>

            <div className="bg-surface rounded-3xl p-5 border border-border shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-ink-muted tracking-wider">Saldo Kas Bank BCA</span>
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black font-mono text-ink tabular-nums">{formatRupiah(stats.cashBalance)}</p>
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
                  Buka Menu Verifikasi →
                </a>
              </div>

              {pendingList.length === 0 ? (
                <div className="p-8 text-center text-ink-muted space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="text-sm font-bold text-ink">Semua pembayaran telah diverifikasi!</p>
                  <p className="text-xs">Tidak ada antrean tertunda saat ini.</p>
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  {pendingList.map((item) => (
                    <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-900 border border-amber-200 flex items-center justify-center font-black font-mono text-xs shrink-0">
                          {item.house}
                        </div>
                        <div>
                          <p className="font-bold text-ink text-xs">{item.name}</p>
                          <p className="text-[11px] text-ink-muted">{item.note} • {item.method}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-black font-mono text-ink text-xs tabular-nums">{formatRupiah(item.amount)}</span>
                        <button
                          type="button"
                          onClick={() => handleApprovePayment(item.id)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-xl text-[11px] font-bold shadow-2xs transition-all"
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
                <a href="/admin/billing" className="p-3 bg-canvas hover:bg-surface rounded-2xl border border-border flex items-center gap-3 font-bold text-ink hover:text-primary-700 transition-colors active:scale-[0.98]">
                  <Receipt className="w-4 h-4 text-emerald-600" />
                  <span>Terbitkan Invoice Massal IPL</span>
                </a>
                <a href="/admin/expenses" className="p-3 bg-canvas hover:bg-surface rounded-2xl border border-border flex items-center gap-3 font-bold text-ink hover:text-primary-700 transition-colors active:scale-[0.98]">
                  <DollarSign className="w-4 h-4 text-rose-600" />
                  <span>Input Kuitansi Pengeluaran</span>
                </a>
                <a href="/admin/staff-loans" className="p-3 bg-canvas hover:bg-surface rounded-2xl border border-border flex items-center gap-3 font-bold text-ink hover:text-primary-700 transition-colors active:scale-[0.98]">
                  <Banknote className="w-4 h-4 text-amber-600" />
                  <span>Kelola Kasbon Staf</span>
                </a>
                <a href="/admin/ledger" className="p-3 bg-canvas hover:bg-surface rounded-2xl border border-border flex items-center gap-3 font-bold text-ink hover:text-primary-700 transition-colors active:scale-[0.98]">
                  <Wallet className="w-4 h-4 text-blue-600" />
                  <span>Buku Kas & Jurnal Keuangan</span>
                </a>
                <a href="/transparency" target="_blank" className="p-3 bg-canvas hover:bg-surface rounded-2xl border border-border flex items-center gap-3 font-bold text-ink hover:text-primary-700 transition-colors active:scale-[0.98]">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <span>Preview Transparansi Warga</span>
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
          <div className="bg-slate-950 text-white border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-card relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-white/10 text-purple-300 font-mono text-[10px] font-bold tracking-wider uppercase border border-white/10">
                  SECRETARIAT DESK
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  SEKRETARIS PAGUYUBAN
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Tata Kelola Kependudukan & Dokumen Warga
              </h1>
              <p className="text-xs text-slate-300/90 leading-relaxed">
                Kelola data kepala keluarga, buat siaran edaran pengumuman ke WhatsApp warga, pantau e-voting musyawarah, dan kearsipan surat.
              </p>
            </div>

            <div className="relative z-10 flex flex-wrap items-center gap-2.5">
              <a
                href="/admin/announcements"
                className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 active:scale-[0.98] text-white rounded-xl font-bold shadow-xs transition-all"
              >
                <Megaphone className="w-4 h-4" />
                <span>Buat Pengumuman Baru</span>
              </a>
              <a
                href="/admin/voting"
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-slate-200 border border-slate-700 rounded-xl font-bold transition-all"
              >
                <Vote className="w-4 h-4 text-violet-400" />
                <span>E-Voting Musyawarah</span>
              </a>
            </div>
          </div>

          {/* 4 Administration KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-surface rounded-3xl p-5 border border-border shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-ink-muted tracking-wider">Total Rumah & KK</span>
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center font-bold">
                  <Home className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black font-mono text-ink">{stats.totalProperties} Unit</p>
                <p className="text-[11px] text-indigo-700 font-bold mt-0.5">{stats.occupiedProperties} Dihuni • {stats.vacantProperties} Kosong</p>
              </div>
            </div>

            <div className="bg-surface rounded-3xl p-5 border border-border shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-ink-muted tracking-wider">Total Jiwa Warga</span>
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center font-bold">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black font-mono text-purple-700">342 Jiwa</p>
                <p className="text-[11px] text-ink-muted mt-0.5">245 Dewasa • 97 Anak-anak</p>
              </div>
            </div>

            <div className="bg-surface rounded-3xl p-5 border border-border shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-ink-muted tracking-wider">E-Voting Musyawarah</span>
                <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-700 border border-violet-200 flex items-center justify-center font-bold">
                  <Vote className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black font-mono text-violet-700">1 Pemilihan Aktif</p>
                <p className="text-[11px] text-emerald-700 font-bold mt-0.5">82 Suara Masuk (68%)</p>
              </div>
            </div>

            <div className="bg-surface rounded-3xl p-5 border border-border shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-ink-muted tracking-wider">Dokumen & Arsip</span>
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black font-mono text-ink">18 Dokumen</p>
                <p className="text-[11px] text-blue-700 font-bold mt-0.5">SK, Tata Tertib & Notula</p>
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
          <div className="bg-slate-950 text-white border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-card relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-white/10 text-amber-300 font-mono text-[10px] font-bold tracking-wider uppercase border border-white/10">
                  SECURITY COMMAND
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  POS GERBANG 24 JAM
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Kontrol Gerbang Palang & Buku Tamu Komplek
              </h1>
              <p className="text-xs text-slate-300/90 leading-relaxed">
                Kendali barrier gate utama, pemantauan tamu masuk komplek secara real-time, penerimaan laporan SOS darurat, dan koordinasi keamanan 24 jam.
              </p>
            </div>

            <div className="relative z-10 flex flex-wrap items-center gap-2.5">
              <a
                href="/admin/security-gate"
                className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 rounded-xl font-bold shadow-xs transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Buka Pos Scanner QR</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  setSirenActive(!sirenActive);
                  showToast(!sirenActive ? '🚨 SIRENE DARURAT DIAKTIFKAN!' : 'Sirene Darurat Dimatikan');
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all shadow-xs active:scale-[0.98] ${
                  sirenActive ? 'bg-red-600 text-white animate-bounce' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                <Volume2 className="w-4 h-4" />
                <span>{sirenActive ? '🚨 SIRENE AKTIF' : 'Tes Sirene'}</span>
              </button>
            </div>
          </div>

          {/* Quick Remote Gate Control & Visitor Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-surface rounded-3xl p-6 border border-border shadow-card space-y-4">
              <h3 className="text-sm font-black text-ink border-b border-border pb-3 flex items-center justify-between">
                <span>⚡ Kontrol Remote Palang Gerbang</span>
                <span className="text-[10px] font-mono text-emerald-600 font-bold">Relay 8 Detik</span>
              </h3>

              <div className="space-y-3">
                {/* Gate 1 */}
                <div className="p-4 bg-canvas rounded-2xl border border-border flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-ink text-xs">Gerbang 1 (Masuk Boulevard)</h4>
                    <p className="text-[11px] text-ink-muted mt-0.5">
                      Status: <span className={gate1Open ? 'text-emerald-700 font-bold font-mono' : 'text-slate-700 font-bold font-mono'}>
                        {gate1Open ? '🟢 TERBUKA' : '🔴 TERTUTUP'}
                      </span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => triggerGate(1)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-xl font-bold text-xs shadow-2xs transition-all"
                  >
                    Buka Palang
                  </button>
                </div>

                {/* Gate 2 */}
                <div className="p-4 bg-canvas rounded-2xl border border-border flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-ink text-xs">Gerbang 2 (Keluar / Timur)</h4>
                    <p className="text-[11px] text-ink-muted mt-0.5">
                      Status: <span className={gate2Open ? 'text-emerald-700 font-bold font-mono' : 'text-slate-700 font-bold font-mono'}>
                        {gate2Open ? '🟢 TERBUKA' : '🔴 TERTUTUP'}
                      </span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => triggerGate(2)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-xl font-bold text-xs shadow-2xs transition-all"
                  >
                    Buka Palang
                  </button>
                </div>
              </div>

              {/* Emergency Dialers */}
              <div className="pt-2 border-t border-border">
                <span className="font-bold text-xs text-ink block mb-2">Panggilan Cepat Darurat Pos Satpam:</span>
                <div className="grid grid-cols-2 gap-2">
                  <a href="tel:110" className="p-2.5 bg-canvas hover:bg-surface rounded-xl border border-border text-center font-bold text-xs text-blue-800 active:scale-[0.98] transition-all">
                    📞 Polsek: 110
                  </a>
                  <a href="tel:113" className="p-2.5 bg-canvas hover:bg-surface rounded-xl border border-border text-center font-bold text-xs text-red-800 active:scale-[0.98] transition-all">
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
                      <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center font-bold text-xs">
                        <Car className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-ink text-xs">{guest.name}</p>
                        <p className="text-[11px] text-ink-muted">Tujuan Rumah {guest.unit} • Plat: {guest.plate} ({guest.category})</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-md ${
                      guest.status === 'Di Dalam' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
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
          <div className="bg-slate-950 text-white border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-card relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-white/10 text-teal-300 font-mono text-[10px] font-bold tracking-wider uppercase border border-white/10">
                  FACILITIES & SANITATION
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  KOORDINATOR KEBERSIHAN
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Operasional Armada Sampah & Pemeliharaan Fasum
              </h1>
              <p className="text-xs text-slate-300/90 leading-relaxed">
                Pemantauan rute pengangkutan sampah harian door-to-door, kapasitas TPS3R komplek, pemeliharaan pompa air booster, dan tiket perbaikan fasilitas.
              </p>
            </div>

            <div className="relative z-10 flex flex-wrap items-center gap-2.5">
              <a
                href="/admin/cleaning-staff"
                className="flex items-center gap-2 px-4 py-2.5 bg-teal-500 hover:bg-teal-400 active:scale-[0.98] text-slate-950 rounded-xl font-bold shadow-xs transition-all"
              >
                <Truck className="w-4 h-4" />
                <span>Jadwal Armada Viar Tossa</span>
              </a>
              <a
                href="/admin/facilities?tab=maintenance"
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-slate-200 border border-slate-700 rounded-xl font-bold transition-all"
              >
                <Wrench className="w-4 h-4 text-teal-400" />
                <span>Tiket Maintenance</span>
              </a>
            </div>
          </div>

          {/* 4 Maintenance KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-surface rounded-3xl p-5 border border-border shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-ink-muted tracking-wider">Armada Viar Tossa</span>
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center font-bold">
                  <Truck className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black font-mono text-teal-700">2 Unit Siap</p>
                <p className="text-[11px] text-emerald-700 font-bold mt-0.5">Rute Pagi Blok A & B Beres</p>
              </div>
            </div>

            <div className="bg-surface rounded-3xl p-5 border border-border shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-ink-muted tracking-wider">Kapasitas TPS3R</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold">
                  <RefreshCw className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black font-mono text-emerald-700">45% (Normal)</p>
                <p className="text-[11px] text-ink-muted mt-0.5">Jadwal Angkut Truk DLH: Besok</p>
              </div>
            </div>

            <div className="bg-surface rounded-3xl p-5 border border-border shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-ink-muted tracking-wider">Tiket Servis Fasum</span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold">
                  <Wrench className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black font-mono text-amber-700">{stats.needingRepairCount} Tiket Perlu Servis</p>
                <p className="text-[11px] text-amber-800 font-bold mt-0.5">Pompa Booster & PJU Blok C</p>
              </div>
            </div>

            <div className="bg-surface rounded-3xl p-5 border border-border shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-ink-muted tracking-wider">Fasilitas Siap Pakai</span>
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black font-mono text-ink">8 dari 9 Fasilitas</p>
                <p className="text-[11px] text-emerald-700 font-bold mt-0.5">Balai Warga, Lapangan, Taman Aktif</p>
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
          <div className="bg-slate-950 text-white border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-card relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-white/10 text-indigo-300 font-mono text-[10px] font-bold tracking-wider uppercase border border-white/10">
                  CITIZEN PORTAL
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  WARGA MANDIRI
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Selamat Datang di Portal Layanan Warga
              </h1>
              <p className="text-xs text-slate-300/90 leading-relaxed">
                Akses mandiri untuk memantau iuran bulanan rumah Anda, mengunduh kuitansi digital, membuat QR pas tamu untuk barrier gate, dan menyampaikan aduan lingkungan.
              </p>
            </div>

            <a
              href="/warga"
              className="relative z-10 flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-black rounded-2xl shadow-md transition-all text-sm shrink-0"
            >
              <Home className="w-5 h-5" />
              <span>Buka Portal Mandiri Warga</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-surface rounded-3xl border border-border shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center font-bold">
                <Receipt className="w-5 h-5" />
              </div>
              <h3 className="font-black text-sm text-ink">Iuran & Pembayaran IPL</h3>
              <p className="text-ink-muted text-xs">Cek riwayat tagihan dan upload bukti transfer BCA langsung dari ponsel Anda.</p>
              <a href="/warga" className="font-bold text-primary-700 hover:underline block pt-2 text-xs">Buka Tagihan →</a>
            </div>

            <div className="p-5 bg-surface rounded-3xl border border-border shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-800 border border-purple-200 flex items-center justify-center font-bold">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="font-black text-sm text-ink">Pas Tamu & Barrier Gate</h3>
              <p className="text-ink-muted text-xs">Generate QR Pass tamu untuk keluarga, kurir, atau delivery agar mudah masuk gerbang.</p>
              <a href="/warga" className="font-bold text-primary-700 hover:underline block pt-2 text-xs">Buat Pas Tamu →</a>
            </div>

            <div className="p-5 bg-surface rounded-3xl border border-border shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-800 border border-rose-200 flex items-center justify-center font-bold">
                <Headphones className="w-5 h-5" />
              </div>
              <h3 className="font-black text-sm text-ink">Aduan & Layanan Fasum</h3>
              <p className="text-ink-muted text-xs">Laporkan kendala fasilitas umum atau booking Balai Warga & Lapangan olahraga.</p>
              <a href="/warga" className="font-bold text-primary-700 hover:underline block pt-2 text-xs">Sampaikan Aduan →</a>
            </div>
          </div>
        </div>
      )}

      {/* ================= 7. QUICK ACCESS DIRECTORY ================= */}
      <div className="bg-surface rounded-3xl p-6 border border-border shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary-600" />
            <h3 className="text-sm font-black text-ink">Akses Cepat Seluruh Modul WargaHub</h3>
          </div>
          <span className="text-ink-muted text-[11px] font-mono">12 MODUL TERSEDIA</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { title: 'Data Rumah', url: '/admin/properties', icon: Home, color: 'text-blue-700 bg-blue-50 border border-blue-200' },
            { title: 'Penghuni & KK', url: '/admin/properties?tab=occupants', icon: Users, color: 'text-indigo-700 bg-indigo-50 border border-indigo-200' },
            { title: 'Billing & Iuran', url: '/admin/billing', icon: CreditCard, color: 'text-emerald-700 bg-emerald-50 border border-emerald-200' },
            { title: 'Kas & Ledger', url: '/admin/ledger', icon: Wallet, color: 'text-teal-700 bg-teal-50 border border-teal-200' },
            { title: 'Kasbon Staf', url: '/admin/staff-loans', icon: DollarSign, color: 'text-amber-700 bg-amber-50 border border-amber-200' },
            { title: 'Pos Satpam', url: '/admin/security-gate', icon: ShieldCheck, color: 'text-purple-700 bg-purple-50 border border-purple-200' },
            { title: 'Tim Kebersihan', url: '/admin/cleaning-staff', icon: Truck, color: 'text-emerald-700 bg-emerald-50 border border-emerald-200' },
            { title: 'Sarana Fasum', url: '/admin/facilities', icon: Building2, color: 'text-sky-700 bg-sky-50 border border-sky-200' },
            { title: 'Aduan Warga', url: '/admin/complaints', icon: Headphones, color: 'text-rose-700 bg-rose-50 border border-rose-200' },
            { title: 'E-Voting & Poll', url: '/admin/voting', icon: Vote, color: 'text-violet-700 bg-violet-50 border border-violet-200' },
            { title: 'Siaran Broadcast', url: '/admin/announcements', icon: Megaphone, color: 'text-amber-700 bg-amber-50 border border-amber-200' },
            { title: 'Master Settings', url: '/admin/settings', icon: Sparkles, color: 'text-primary-700 bg-primary-50 border border-primary-200' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.title}
                href={item.url}
                className="p-3.5 bg-canvas hover:bg-surface rounded-2xl border border-border/80 hover:border-primary-400 hover:shadow-xs transition-all flex flex-col items-center text-center gap-2 group active:scale-[0.98]"
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
        <span>© 2026 WargaHub Enterprise. Standar Desain Anti-Slop Swiss Grid.</span>
        <div className="flex items-center gap-3 font-bold text-ink">
          <span>{communityName}</span>
          <span>•</span>
          <span className="text-emerald-700 font-mono">Sistem Terintegrasi Online</span>
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
