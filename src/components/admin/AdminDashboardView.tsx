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
  BellRing
} from 'lucide-react';
import { formatRupiah, formatRupiahShort } from '../../lib/format';

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
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ stats }) => {
  const [selectedMonth, setSelectedMonth] = useState('Agustus 2026');
  const [activityFilter, setActivityFilter] = useState<'all' | 'finance' | 'complaint' | 'security' | 'facility'>('all');

  // Dynamic dashboard title & subtitle from settings
  const [dashHeading, setDashHeading] = useState('Dashboard Ketua Komplek');
  const [dashSubheading, setDashSubheading] = useState('Pusat Kendali Operasional, Keuangan Kas & Layanan Warga Komplek.');
  const [communityName, setCommunityName] = useState('Komplek Perumahan Taman Sejahtera');

  useEffect(() => {
    try {
      const savedHead = localStorage.getItem('wargahub_set_dash_heading');
      const savedSub = localStorage.getItem('wargahub_set_dash_subheading');
      const savedComm = localStorage.getItem('wargahub_set_comm_name');
      if (savedHead) setDashHeading(JSON.parse(savedHead));
      if (savedSub) setDashSubheading(JSON.parse(savedSub));
      if (savedComm) setCommunityName(JSON.parse(savedComm));
    } catch (e) {}
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

  // Comprehensive activities feed
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
    {
      id: 'act-6',
      icon: Megaphone,
      iconBg: 'bg-indigo-100 text-indigo-700',
      category: 'all',
      title: 'Siaran WhatsApp Terkirim: Rapat Warga Bulanan',
      detail: 'Broadcast notifikasi ke 98 kontak warga aktif komplek',
      time: 'Kemarin, 10:22 WIB',
      link: '/admin/announcements',
    },
  ];

  const filteredActivities = allActivities.filter((act) => {
    if (activityFilter === 'all') return true;
    return act.category === activityFilter;
  });

  return (
    <div className="space-y-6 pb-12 text-xs">
      {/* ================= 1. EXECUTIVE BANNER & ACTION TOOLBAR ================= */}
      <div className="bg-surface rounded-3xl p-6 border border-border shadow-card flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Sistem Operasional Aktif
            </span>
            <span className="text-[11px] text-ink-muted font-bold">
              • {communityName}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
            {dashHeading}
          </h1>

          <p className="text-xs text-ink-muted leading-relaxed">
            {dashSubheading}
          </p>
        </div>

        {/* Month Selector & Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="appearance-none pl-9 pr-8 py-2.5 bg-canvas hover:bg-canvas/80 border border-border rounded-xl text-xs font-bold text-ink cursor-pointer shadow-2xs focus:outline-hidden"
            >
              <option value="Agustus 2026">Agustus 2026 (Bulan Berjalan)</option>
              <option value="Juli 2026">Juli 2026</option>
              <option value="Juni 2026">Juni 2026</option>
              <option value="Mei 2026">Mei 2026</option>
              <option value="Tahun 2026 (YTD)">Rekap Tahun 2026 (YTD)</option>
            </select>
            <Calendar className="w-4 h-4 text-ink-muted absolute left-3 top-3 pointer-events-none" />
            <ChevronDown className="w-3.5 h-3.5 text-ink-muted absolute right-3 top-3.5 pointer-events-none" />
          </div>

          <a
            href="/admin/billing"
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Terbitkan Tagihan</span>
          </a>

          <a
            href="/admin/expenses"
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-canvas hover:bg-surface border border-border text-ink rounded-xl font-bold transition-colors shadow-2xs"
          >
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Catat Kas Keluar</span>
          </a>
        </div>
      </div>

      {/* ================= 2. EXECUTIVE 8 KPI METRIC CARDS ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* 1. Total Rumah */}
        <a
          href="/admin/properties"
          className="bg-surface hover:bg-canvas rounded-2xl p-4 border border-border hover:border-primary-300 shadow-card flex flex-col justify-between transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Home className="w-4 h-4" />
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-ink-muted group-hover:text-primary-600 transition-colors" />
          </div>
          <div className="mt-3">
            <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">Total Rumah</span>
            <p className="text-xl font-black text-ink mt-0.5 tabular-nums">{stats.totalProperties}</p>
            <span className="text-[10px] text-ink-muted">123 Kavling</span>
          </div>
        </a>

        {/* 2. Rumah Dihuni */}
        <a
          href="/admin/properties?tab=occupants"
          className="bg-surface hover:bg-canvas rounded-2xl p-4 border border-border hover:border-emerald-300 shadow-card flex flex-col justify-between transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-ink-muted group-hover:text-emerald-600 transition-colors" />
          </div>
          <div className="mt-3">
            <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">Dihuni</span>
            <p className="text-xl font-black text-emerald-700 mt-0.5 tabular-nums">{stats.occupiedProperties}</p>
            <span className="text-[10px] text-emerald-600 font-bold">{stats.occupiedPercentage}% Terisi</span>
          </div>
        </a>

        {/* 3. Rumah Kosong */}
        <a
          href="/admin/properties"
          className="bg-surface hover:bg-canvas rounded-2xl p-4 border border-border hover:border-slate-300 shadow-card flex flex-col justify-between transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              <Building className="w-4 h-4" />
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-ink-muted group-hover:text-ink transition-colors" />
          </div>
          <div className="mt-3">
            <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">Kosong</span>
            <p className="text-xl font-black text-ink mt-0.5 tabular-nums">{stats.vacantProperties}</p>
            <span className="text-[10px] text-ink-muted">{stats.vacantPercentage}% Unit</span>
          </div>
        </a>

        {/* 4. Iuran Bulan Ini */}
        <a
          href="/admin/billing"
          className="bg-surface hover:bg-canvas rounded-2xl p-4 border border-border hover:border-primary-300 shadow-card flex flex-col justify-between transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-full border-2 border-primary-600 text-primary-700 flex items-center justify-center font-black text-[10px]">
              {stats.paidPercentage}%
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-ink-muted group-hover:text-primary-600 transition-colors" />
          </div>
          <div className="mt-3">
            <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">Iuran Lunas</span>
            <p className="text-xl font-black text-primary-700 mt-0.5 tabular-nums">{stats.paidCount}</p>
            <span className="text-[10px] text-primary-800 font-bold">{stats.unpaidCount} Tertunggak</span>
          </div>
        </a>

        {/* 5. Saldo Kas Bank */}
        <a
          href="/admin/ledger"
          className="bg-surface hover:bg-canvas rounded-2xl p-4 border border-border hover:border-emerald-300 shadow-card flex flex-col justify-between transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Wallet className="w-4 h-4" />
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-ink-muted group-hover:text-emerald-600 transition-colors" />
          </div>
          <div className="mt-3">
            <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">Saldo Kas BCA</span>
            <p className="text-sm font-black text-ink mt-0.5 tabular-nums truncate">{formatRupiahShort(stats.cashBalance)}</p>
            <span className="text-[10px] text-emerald-700 font-bold">Terverifikasi</span>
          </div>
        </a>

        {/* 6. Menunggu Verifikasi */}
        <a
          href="/admin/payments"
          className="bg-surface hover:bg-canvas rounded-2xl p-4 border border-border hover:border-amber-300 shadow-card flex flex-col justify-between transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Hourglass className="w-4 h-4" />
            </div>
            {stats.pendingPaymentsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            )}
          </div>
          <div className="mt-3">
            <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">Verifikasi</span>
            <p className="text-xl font-black text-amber-700 mt-0.5 tabular-nums">{stats.pendingPaymentsCount}</p>
            <span className="text-[10px] text-amber-800 font-bold">Perlu Review</span>
          </div>
        </a>

        {/* 7. Aduan Terbuka */}
        <a
          href="/admin/complaints"
          className="bg-surface hover:bg-canvas rounded-2xl p-4 border border-border hover:border-rose-300 shadow-card flex flex-col justify-between transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
              <Headphones className="w-4 h-4" />
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-ink-muted group-hover:text-rose-600 transition-colors" />
          </div>
          <div className="mt-3">
            <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">Aduan Warga</span>
            <p className="text-xl font-black text-rose-700 mt-0.5 tabular-nums">{stats.openComplaintsCount}</p>
            <span className="text-[10px] text-rose-800 font-bold">Tiket Terbuka</span>
          </div>
        </a>

        {/* 8. Pos Satpam & Ronda */}
        <a
          href="/admin/security-gate"
          className="bg-surface hover:bg-canvas rounded-2xl p-4 border border-border hover:border-purple-300 shadow-card flex flex-col justify-between transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="mt-3">
            <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">Satpam Jaga</span>
            <p className="text-xl font-black text-purple-700 mt-0.5 tabular-nums">4 Regu</p>
            <span className="text-[10px] text-purple-800 font-bold">Pos 1 & 2 Aman</span>
          </div>
        </a>
      </div>

      {/* ================= 3. ACTION CENTER: PERHATIAN KHUSUS & PROGRES IURAN ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Action Center (Membutuhkan Tindakan Pengurus) */}
        <div className="lg:col-span-5 bg-surface rounded-3xl p-6 border border-border shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-black text-ink">Pusat Tindakan & Perhatian Pengurus</h3>
            </div>
            <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-bold text-[10px] rounded-full">
              4 Prioritas
            </span>
          </div>

          <div className="space-y-2.5">
            {/* Item 1: Tunggakan */}
            <div className="p-3.5 rounded-2xl bg-canvas border border-border/80 flex items-center justify-between gap-3 hover:border-rose-300 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  <Home className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-black text-ink">{stats.unpaidCount} Rumah Belum Membayar Iuran</p>
                  <p className="text-[11px] text-ink-muted mt-0.5">Jatuh tempo tanggal 10 • Total tagihan {formatRupiah(stats.unpaidAmount)}</p>
                </div>
              </div>
              <a
                href="/admin/billing"
                className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-bold shrink-0 transition-colors"
              >
                Kirim WA
              </a>
            </div>

            {/* Item 2: Verifikasi Pembayaran */}
            <div className="p-3.5 rounded-2xl bg-canvas border border-border/80 flex items-center justify-between gap-3 hover:border-amber-300 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-black text-ink">{stats.pendingPaymentsCount} Pembayaran Menunggu Konfirmasi</p>
                  <p className="text-[11px] text-ink-muted mt-0.5">Transfer BCA & QRIS warga memerlukan verifikasi bendahara</p>
                </div>
              </div>
              <a
                href="/admin/payments"
                className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[10px] font-bold shrink-0 transition-colors"
              >
                Verifikasi
              </a>
            </div>

            {/* Item 3: Aduan Warga */}
            <div className="p-3.5 rounded-2xl bg-canvas border border-border/80 flex items-center justify-between gap-3 hover:border-purple-300 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  <Headphones className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-black text-ink">{stats.openComplaintsCount} Tiket Aduan Warga Aktif</p>
                  <p className="text-[11px] text-ink-muted mt-0.5">PJU mati di Blok C & saluran drainase memerlukan petugas</p>
                </div>
              </div>
              <a
                href="/admin/complaints"
                className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-[10px] font-bold shrink-0 transition-colors"
              >
                Disposisi
              </a>
            </div>

            {/* Item 4: Maintenance Fasum */}
            <div className="p-3.5 rounded-2xl bg-canvas border border-border/80 flex items-center justify-between gap-3 hover:border-blue-300 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-black text-ink">{stats.needingRepairCount} Fasum Terjadwal Maintenance</p>
                  <p className="text-[11px] text-ink-muted mt-0.5">Servis pompa booster air dan jaring kawat lapangan badminton</p>
                </div>
              </div>
              <a
                href="/admin/facilities?tab=maintenance"
                className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-bold shrink-0 transition-colors"
              >
                Cek Jadwal
              </a>
            </div>
          </div>
        </div>

        {/* Right: Progress Iuran & Realisasi Kas Bulanan */}
        <div className="lg:col-span-7 bg-surface rounded-3xl p-6 border border-border shadow-card flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-sm font-black text-ink">Progress Penerimaan Iuran & Arus Kas</h3>
                <p className="text-ink-muted text-[11px]">Kolektibilitas tagihan warga per {selectedMonth}</p>
              </div>
              <span className="px-3 py-1 bg-primary-50 text-primary-800 font-bold text-xs rounded-xl border border-primary-200">
                {stats.paidPercentage}% Tercapai
              </span>
            </div>

            {/* Progress Bar & Summary Stats */}
            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-black text-primary-700 tabular-nums">
                    {formatRupiah(stats.paidAmount)}
                  </span>
                  <span className="text-ink-muted ml-2">dari target {formatRupiah(stats.paidAmount + stats.unpaidAmount)}</span>
                </div>
                <span className="text-xs font-bold text-ink">
                  {stats.paidCount} / {stats.totalProperties} Unit Lunas
                </span>
              </div>

              <div className="w-full bg-canvas h-4 rounded-full overflow-hidden border border-border/80 flex p-0.5">
                <div
                  className="bg-gradient-to-r from-primary-600 to-emerald-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${stats.paidPercentage}%` }}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3 bg-canvas rounded-2xl border border-border/80">
                  <span className="text-[10px] text-ink-muted font-bold block">Penerimaan Terverifikasi</span>
                  <p className="text-sm font-black text-emerald-700 mt-0.5 tabular-nums">{formatRupiah(stats.paidAmount)}</p>
                  <span className="text-[10px] text-emerald-600 font-bold">86 Rumah Lunas</span>
                </div>

                <div className="p-3 bg-canvas rounded-2xl border border-border/80">
                  <span className="text-[10px] text-ink-muted font-bold block">Sisa Tertunggak</span>
                  <p className="text-sm font-black text-rose-700 mt-0.5 tabular-nums">{formatRupiah(stats.unpaidAmount)}</p>
                  <span className="text-[10px] text-rose-600 font-bold">{stats.unpaidCount} Rumah Belum</span>
                </div>

                <div className="p-3 bg-canvas rounded-2xl border border-border/80 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-ink-muted font-bold block">Tarif Bulanan Default</span>
                  <p className="text-sm font-black text-primary-700 mt-0.5 tabular-nums">{formatRupiah(stats.monthlyRate)}</p>
                  <span className="text-[10px] text-ink-muted">Per Rumah / Bulan</span>
                </div>
              </div>
            </div>

            {/* Block Breakdown */}
            <div className="pt-2 space-y-2">
              <span className="font-bold text-xs text-ink block">Kepatuhan Iuran Berdasarkan Kluster / Blok:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {blockStats.map((b) => (
                  <div key={b.block} className="p-2.5 bg-canvas rounded-xl border border-border/70 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
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

          <div className="pt-3 border-t border-border flex items-center justify-between">
            <span className="text-ink-muted text-[11px]">Rekonsiliasi perbankan otomatis tersinkronisasi.</span>
            <a
              href="/rekap-iuran"
              target="_blank"
              className="flex items-center gap-1.5 text-xs font-bold text-primary-700 hover:text-primary-800 hover:underline"
            >
              <span>Buka Tautan Publik Rekap Iuran</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* ================= 4. REALISASI APB & LIVE ACTIVITY LOG ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Realisasi Anggaran APB Paguyuban */}
        <div className="lg:col-span-7 bg-surface rounded-3xl p-6 border border-border shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="text-sm font-black text-ink">Realisasi Anggaran Kas Paguyuban (APB)</h3>
              <p className="text-ink-muted text-[11px]">Perbandingan rencana anggaran vs pengeluaran riil per {selectedMonth}</p>
            </div>
            <a
              href="/admin/budget"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-canvas hover:bg-surface border border-border rounded-xl font-bold text-ink hover:text-primary-700 transition-colors shadow-2xs"
            >
              <BarChart2 className="w-3.5 h-3.5 text-primary-600" />
              <span>Kelola APB</span>
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-ink-muted font-bold uppercase text-[10px] tracking-wider">
                  <th className="pb-2">Keterangan Pos Anggaran</th>
                  <th className="pb-2 text-right">Pagu Target</th>
                  <th className="pb-2 text-right">Realisasi</th>
                  <th className="pb-2 text-right">Selisih Hemat/Defisit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {budgetData.map((row) => (
                  <tr
                    key={row.keterangan}
                    className={`hover:bg-canvas/50 transition-colors ${
                      row.isTotal ? 'bg-primary-50/70 font-black text-primary-950' : 'text-ink'
                    }`}
                  >
                    <td className="py-2.5 pr-2">
                      <strong className="block font-bold">{row.keterangan}</strong>
                      <span className="text-[10px] text-ink-muted font-normal">{row.pct}% dari alokasi</span>
                    </td>
                    <td className="py-2.5 px-2 text-right tabular-nums text-ink-muted font-semibold">{formatRupiah(row.anggaran)}</td>
                    <td className="py-2.5 px-2 text-right tabular-nums font-black text-ink">{formatRupiah(row.realisasi)}</td>
                    <td className={`py-2.5 pl-2 text-right tabular-nums font-black ${row.isPositive ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {row.selisih > 0 ? `+${formatRupiah(row.selisih)}` : `-${formatRupiah(Math.abs(row.selisih))}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3.5 bg-canvas rounded-2xl border border-border/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-ink">Efisiensi Belanja Operasional:</span>
            </div>
            <span className="font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              Hemat Rp 16.650.000 (+37% Cadangan Kas)
            </span>
          </div>
        </div>

        {/* Right: Live Operations Feed */}
        <div className="lg:col-span-5 bg-surface rounded-3xl p-6 border border-border shadow-card flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-sm font-black text-ink">Jejak Aktivitas & Operasional Terkini</h3>
                <p className="text-ink-muted text-[11px]">Log realtime transaksi, aduan dan keamanan</p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1 bg-canvas p-1 rounded-xl border border-border text-[10px]">
                <button
                  type="button"
                  onClick={() => setActivityFilter('all')}
                  className={`px-2 py-0.5 rounded-lg font-bold ${activityFilter === 'all' ? 'bg-primary-600 text-white' : 'text-ink-muted'}`}
                >
                  Semua
                </button>
                <button
                  type="button"
                  onClick={() => setActivityFilter('finance')}
                  className={`px-2 py-0.5 rounded-lg font-bold ${activityFilter === 'finance' ? 'bg-primary-600 text-white' : 'text-ink-muted'}`}
                >
                  Iuran
                </button>
                <button
                  type="button"
                  onClick={() => setActivityFilter('complaint')}
                  className={`px-2 py-0.5 rounded-lg font-bold ${activityFilter === 'complaint' ? 'bg-primary-600 text-white' : 'text-ink-muted'}`}
                >
                  Aduan
                </button>
              </div>
            </div>

            {/* List */}
            <div className="mt-3.5 space-y-3">
              {filteredActivities.map((act) => {
                const Icon = act.icon;
                return (
                  <a
                    key={act.id}
                    href={act.link}
                    className="flex items-start justify-between gap-3 p-2.5 rounded-2xl hover:bg-canvas border border-transparent hover:border-border/80 transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-xl ${act.iconBg} flex items-center justify-center shrink-0 mt-0.5 font-bold shadow-2xs`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-ink text-xs group-hover:text-primary-700 transition-colors">{act.title}</p>
                        <p className="text-ink-muted text-[11px] mt-0.5 line-clamp-1">{act.detail}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-ink-muted shrink-0 tabular-nums whitespace-nowrap mt-0.5">{act.time}</span>
                  </a>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-border text-center">
            <a
              href="/admin/audit"
              className="text-xs font-bold text-primary-700 hover:text-primary-800 hover:underline inline-flex items-center gap-1.5"
            >
              <span>Buka Seluruh Riwayat Jejak Audit Digital</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

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
