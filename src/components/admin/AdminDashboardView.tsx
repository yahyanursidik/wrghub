import React, { useState } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { formatRupiah } from '../../lib/format';

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

  // Budget Table data matching Image 2
  const budgetData = [
    {
      keterangan: 'Pemasukan (Iuran)',
      anggaran: 90000000,
      realisasi: 64500000,
      selisih: -25500000,
      isPositive: false,
    },
    {
      keterangan: 'Pengeluaran Operasional',
      anggaran: 45000000,
      realisasi: 28350000,
      selisih: 16650000,
      isPositive: true,
    },
    {
      keterangan: 'Pengeluaran Pemeliharaan',
      anggaran: 20000000,
      realisasi: 12600000,
      selisih: 7400000,
      isPositive: true,
    },
    {
      keterangan: 'Saldo Akhir',
      anggaran: 25000000,
      realisasi: 23550000,
      selisih: -1450000,
      isPositive: false,
      isTotal: true,
    }
  ];

  // Live activity timeline matching Image 2
  const activities = [
    {
      id: 'act-1',
      icon: CreditCard,
      iconBg: 'bg-emerald-50 text-emerald-700',
      title: 'Pembayaran iuran dari Rumah B-12',
      detail: 'Rp750.000 melalui Transfer Bank',
      time: 'Hari ini, 09:15',
    },
    {
      id: 'act-2',
      icon: MessageCircle,
      iconBg: 'bg-emerald-50 text-emerald-700',
      title: 'Aduan baru: Lampu jalan mati di Blok C',
      detail: 'Dilaporkan oleh Budi Santoso (C-07)',
      time: 'Kemarin, 21:08',
    },
    {
      id: 'act-3',
      icon: Wrench,
      iconBg: 'bg-emerald-50 text-emerald-700',
      title: 'Pengeluaran dicatat: Perbaikan pompa air',
      detail: 'Rp2.350.000 oleh Petugas Sarana',
      time: 'Kemarin, 16:40',
    },
    {
      id: 'act-4',
      icon: Megaphone,
      iconBg: 'bg-emerald-50 text-emerald-700',
      title: 'Pengumuman baru dipublikasikan',
      detail: 'Rapat warga bulanan – 25 Agustus 2026',
      time: 'Kemarin, 10:22',
    },
    {
      id: 'act-5',
      icon: ShieldCheck,
      iconBg: 'bg-emerald-50 text-emerald-700',
      title: '3 pembayaran iuran diverifikasi',
      detail: 'Total Rp2.250.000',
      time: '19 Agu 2026, 17:30',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
            Dashboard Ketua Komplek
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            Ringkasan informasi dan aktivitas penting Komplek Taman Sejahtera.
          </p>
        </div>

        <div className="relative inline-block">
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-canvas border border-border rounded-xl text-sm font-medium text-ink shadow-xs transition-colors"
          >
            <Calendar className="w-4 h-4 text-ink-muted" />
            <span>{selectedMonth}</span>
            <ChevronDown className="w-4 h-4 text-ink-muted" />
          </button>
        </div>
      </div>

      {/* 7 Top KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3.5">
        {/* 1. Total Rumah */}
        <div className="bg-surface rounded-2xl p-4 border border-border shadow-card flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2.5">
            <Home className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-ink-muted">Total Rumah</span>
          <span className="text-2xl font-bold text-ink mt-1 tabular-nums">{stats.totalProperties}</span>
          <span className="text-[11px] text-ink-muted mt-0.5">Unit</span>
        </div>

        {/* 2. Rumah Dihuni */}
        <div className="bg-surface rounded-2xl p-4 border border-border shadow-card flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2.5">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-ink-muted">Rumah Dihuni</span>
          <span className="text-2xl font-bold text-ink mt-1 tabular-nums">{stats.occupiedProperties}</span>
          <span className="text-[11px] text-ink-muted mt-0.5">{stats.occupiedPercentage}% dari total</span>
        </div>

        {/* 3. Rumah Kosong */}
        <div className="bg-surface rounded-2xl p-4 border border-border shadow-card flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2.5">
            <Home className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-ink-muted">Rumah Kosong</span>
          <span className="text-2xl font-bold text-ink mt-1 tabular-nums">{stats.vacantProperties}</span>
          <span className="text-[11px] text-ink-muted mt-0.5">{stats.vacantPercentage}% dari total</span>
        </div>

        {/* 4. Iuran Bulan Ini (Progress ring / badge) */}
        <div className="bg-surface rounded-2xl p-4 border border-border shadow-card flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-full border-2 border-emerald-600 flex items-center justify-center text-emerald-700 font-bold text-xs mb-2.5">
            {stats.paidPercentage}%
          </div>
          <span className="text-xs font-medium text-ink-muted">Iuran Bulan Ini</span>
          <span className="text-sm font-bold text-ink mt-1 tabular-nums">{stats.paidCount} / {stats.totalProperties} rumah</span>
          <span className="text-[11px] text-emerald-700 font-medium mt-0.5">Sudah Lunas</span>
        </div>

        {/* 5. Saldo Kas */}
        <div className="bg-surface rounded-2xl p-4 border border-border shadow-card flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2.5">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-ink-muted">Saldo Kas</span>
          <span className="text-base font-bold text-ink mt-1 tabular-nums truncate w-full">{formatRupiah(stats.cashBalance)}</span>
          <span className="text-[11px] text-ink-muted mt-0.5">Per 20 Agu 2026</span>
        </div>

        {/* 6. Pembayaran Menunggu Verifikasi */}
        <div className="bg-surface rounded-2xl p-4 border border-border shadow-card flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2.5">
            <Hourglass className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-ink-muted">Pembayaran Menunggu Verifikasi</span>
          <span className="text-2xl font-bold text-ink mt-1 tabular-nums">{stats.pendingPaymentsCount}</span>
          <span className="text-[11px] text-amber-700 font-medium mt-0.5">Transaksi</span>
        </div>

        {/* 7. Aduan Terbuka */}
        <div className="bg-surface rounded-2xl p-4 border border-border shadow-card flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-2.5">
            <Headphones className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-ink-muted">Aduan Terbuka</span>
          <span className="text-2xl font-bold text-ink mt-1 tabular-nums">{stats.openComplaintsCount}</span>
          <span className="text-[11px] text-red-700 font-medium mt-0.5">Aduan</span>
        </div>
      </div>

      {/* Middle Row (2 Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Membutuhkan Perhatian */}
        <div className="bg-surface rounded-2xl p-6 border border-border shadow-card space-y-4">
          <h3 className="text-base font-bold text-ink">Membutuhkan Perhatian</h3>

          <div className="space-y-2.5">
            {/* Item 1: 9 rumah belum iuran */}
            <a
              href="/admin/billing"
              className="flex items-center justify-between p-3.5 rounded-xl bg-canvas hover:bg-red-50/40 border border-border transition-colors group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                  <Home className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">9 rumah belum iuran</p>
                  <p className="text-xs text-ink-muted">Batas akhir 5 Agustus 2026</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-ink-muted group-hover:text-ink transition-colors" />
            </a>

            {/* Item 2: 3 pembayaran menunggu verifikasi */}
            <a
              href="/admin/payments"
              className="flex items-center justify-between p-3.5 rounded-xl bg-canvas hover:bg-amber-50/40 border border-border transition-colors group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Hourglass className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">3 pembayaran menunggu verifikasi</p>
                  <p className="text-xs text-ink-muted">Perlu dicek dan diverifikasi</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-ink-muted group-hover:text-ink transition-colors" />
            </a>

            {/* Item 3: 4 aduan belum selesai */}
            <a
              href="/admin/complaints"
              className="flex items-center justify-between p-3.5 rounded-xl bg-canvas hover:bg-orange-50/40 border border-border transition-colors group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">4 aduan belum selesai</p>
                  <p className="text-xs text-ink-muted">Perlu ditindaklanjuti</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-ink-muted group-hover:text-ink transition-colors" />
            </a>

            {/* Item 4: 2 fasilitas perlu perbaikan */}
            <a
              href="/admin/facilities"
              className="flex items-center justify-between p-3.5 rounded-xl bg-canvas hover:bg-sky-50/40 border border-border transition-colors group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">2 fasilitas perlu perbaikan</p>
                  <p className="text-xs text-ink-muted">Maintenance tertunda</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-ink-muted group-hover:text-ink transition-colors" />
            </a>
          </div>
        </div>

        {/* Card 2: Progress Iuran Bulanan */}
        <div className="bg-surface rounded-2xl p-6 border border-border shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-ink">Progress Iuran Bulanan</h3>
              <span className="text-xs font-semibold text-ink-muted">Agustus 2026</span>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              {/* Progress Detail */}
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-primary-600 tracking-tight">{stats.paidPercentage}%</span>
                    <span className="text-base font-bold text-ink">rumah sudah lunas</span>
                  </div>
                  <p className="text-xs text-ink-muted mt-0.5">{stats.paidCount} dari {stats.totalProperties} rumah</p>
                </div>

                <div className="space-y-2">
                  <div className="bg-canvas rounded-full h-3 overflow-hidden border border-border/60">
                    <div
                      className="bg-primary-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${stats.paidPercentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-primary-500" />
                      <span className="text-ink-muted">Lunas:</span>
                      <strong className="text-ink font-semibold">{stats.paidCount} rumah</strong>
                      <span className="text-ink-muted">({formatRupiah(stats.paidAmount)})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-border-dark" />
                      <span className="text-ink-muted">Belum Lunas:</span>
                      <strong className="text-ink font-semibold">{stats.unpaidCount} rumah</strong>
                      <span className="text-ink-muted">({formatRupiah(stats.unpaidAmount)})</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rate Callout Card */}
              <div className="w-full sm:w-48 bg-primary-50/60 border border-primary-200/80 rounded-2xl p-4 flex flex-col justify-between shrink-0 text-center space-y-3">
                <div className="w-10 h-10 rounded-xl bg-surface border border-primary-200 flex items-center justify-center text-primary-600 mx-auto shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-primary-800">Nominal Iuran / Bulan</p>
                  <p className="text-base font-bold text-primary-900 mt-0.5 tabular-nums">{formatRupiah(stats.monthlyRate)}</p>
                  <p className="text-[10px] text-primary-700/80">Per rumah</p>
                </div>
                <a
                  href="/admin/billing"
                  className="py-1.5 px-3 bg-surface hover:bg-primary-100/80 border border-primary-300 text-primary-700 rounded-xl text-xs font-semibold transition-colors block"
                >
                  Lihat Detail Iuran
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row (2 Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Ringkasan Keuangan – Agustus 2026 */}
        <div className="bg-surface rounded-2xl p-6 border border-border shadow-card flex flex-col justify-between space-y-5">
          <div>
            <h3 className="text-base font-bold text-ink">Ringkasan Keuangan – Agustus 2026</h3>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border text-ink-muted font-semibold">
                    <th className="pb-2">Keterangan</th>
                    <th className="pb-2 text-right">Anggaran</th>
                    <th className="pb-2 text-right">Realisasi</th>
                    <th className="pb-2 text-right">Selisih</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {budgetData.map((row) => (
                    <tr
                      key={row.keterangan}
                      className={row.isTotal ? 'bg-primary-50/80 font-bold text-primary-950' : 'text-ink'}
                    >
                      <td className="py-2.5 pr-2 font-medium">{row.keterangan}</td>
                      <td className="py-2.5 px-2 text-right tabular-nums text-ink-muted">{formatRupiah(row.anggaran)}</td>
                      <td className="py-2.5 px-2 text-right tabular-nums font-semibold">{formatRupiah(row.realisasi)}</td>
                      <td className={`py-2.5 pl-2 text-right tabular-nums font-semibold ${row.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                        {row.selisih > 0 ? `+${formatRupiah(row.selisih)}` : `-${formatRupiah(Math.abs(row.selisih))}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <a
              href="/admin/budget"
              className="inline-flex items-center gap-2 px-4 py-2 bg-surface hover:bg-canvas border border-border rounded-xl text-xs font-semibold text-primary-700 transition-colors shadow-xs"
            >
              <BarChart2 className="w-4 h-4" />
              <span>Lihat Laporan Keuangan</span>
            </a>
          </div>
        </div>

        {/* Right: Aktivitas Terbaru */}
        <div className="bg-surface rounded-2xl p-6 border border-border shadow-card flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-bold text-ink">Aktivitas Terbaru</h3>

            <div className="mt-4 space-y-3.5">
              {activities.map((act) => {
                const Icon = act.icon;
                return (
                  <div key={act.id} className="flex items-start justify-between gap-3 text-xs">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-xl ${act.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-ink text-xs">{act.title}</p>
                        <p className="text-ink-muted text-[11px] mt-0.5">{act.detail}</p>
                      </div>
                    </div>
                    <span className="text-[11px] text-ink-muted shrink-0 tabular-nums whitespace-nowrap">{act.time}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-border/60 text-center">
            <a
              href="/admin/notifications"
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline"
            >
              Lihat Semua Aktivitas
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-muted">
        <span>© 2026 WargaHub. All rights reserved.</span>
        <span className="font-medium text-ink">Komplek Taman Sejahtera</span>
      </div>
    </div>
  );
};
