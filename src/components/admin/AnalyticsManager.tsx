import React, { useState } from 'react';
import { TrendingUp, BarChart3, PieChart, Users, CheckCircle2, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';
import { formatRupiah } from '../../lib/format';

export const AnalyticsManager: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('6_MONTHS');

  const historicalTrends = [
    { month: 'Maret 2026', income: 84000000, expense: 38200000, net: 45800000, rate: '93.3%' },
    { month: 'April 2026', income: 86250000, expense: 39100000, net: 47150000, rate: '95.8%' },
    { month: 'Mei 2026', income: 87750000, expense: 41200000, net: 46550000, rate: '97.5%' },
    { month: 'Juni 2026', income: 85500000, expense: 38900000, net: 46600000, rate: '95.0%' },
    { month: 'Juli 2026', income: 88500000, expense: 40100000, net: 48400000, rate: '98.3%' },
    { month: 'Agustus 2026', income: 90000000, expense: 39150000, net: 50850000, rate: '94.2%' },
  ];

  const blockCompliance = [
    { block: 'Blok A', totalUnits: 30, paidUnits: 29, unpaidUnits: 1, rate: 96.7, color: 'bg-emerald-500' },
    { block: 'Blok B', totalUnits: 30, paidUnits: 27, unpaidUnits: 3, rate: 90.0, color: 'bg-blue-500' },
    { block: 'Blok C', totalUnits: 30, paidUnits: 28, unpaidUnits: 2, rate: 93.3, color: 'bg-amber-500' },
    { block: 'Blok D', totalUnits: 30, paidUnits: 29, unpaidUnits: 1, rate: 96.7, color: 'bg-purple-500' },
  ];

  const totalIncome = historicalTrends.reduce((acc, h) => acc + h.income, 0);
  const totalExpense = historicalTrends.reduce((acc, h) => acc + h.expense, 0);
  const totalNet = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary-600" />
            Analisis Tren Finansial & Kepatuhan Blok
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            Evaluasi performa arus kas, pertumbuhan saldo, dan perbandingan disiplin pembayaran antar blok hunian.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-muted font-medium">Rentang Data:</span>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="p-2 bg-surface border border-border rounded-xl text-xs font-bold text-ink"
          >
            <option value="6_MONTHS">6 Bulan Terakhir (Mar - Agu 2026)</option>
            <option value="YEAR_TO_DATE">Tahun Berjalan 2026 (YTD)</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-surface rounded-2xl border border-border shadow-card">
          <span className="text-xs font-semibold text-ink-muted">Total Akumulasi Pemasukan (6 Bln)</span>
          <p className="text-2xl font-bold text-ink mt-1 tabular-nums">{formatRupiah(totalIncome)}</p>
          <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> Rata-rata Rp87.0M / bulan
          </span>
        </div>

        <div className="p-5 bg-surface rounded-2xl border border-border shadow-card">
          <span className="text-xs font-semibold text-ink-muted">Total Akumulasi Belanja (6 Bln)</span>
          <p className="text-2xl font-bold text-primary-700 mt-1 tabular-nums">{formatRupiah(totalExpense)}</p>
          <span className="text-xs text-ink-muted block mt-1">Rasio Belanja: 45.4% dari Penerimaan</span>
        </div>

        <div className="p-5 bg-surface rounded-2xl border border-border shadow-card">
          <span className="text-xs font-semibold text-ink-muted">Surplus Akumulatif (Kas Bertumbuh)</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1 tabular-nums">{formatRupiah(totalNet)}</p>
          <span className="text-xs text-emerald-700 font-semibold block mt-1">Keuangan Komplek Sangat Sehat</span>
        </div>
      </div>

      {/* Block Compliance Breakdown */}
      <div className="p-6 bg-surface rounded-2xl border border-border shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="font-bold text-sm text-ink flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary-600" />
              Perbandingan Tingkat Kepatuhan Pembayaran Antar Blok
            </h3>
            <p className="text-xs text-ink-muted mt-0.5">Monitoring kedisiplinan 120 rumah di 4 wilayah blok hunian.</p>
          </div>
          <span className="text-xs font-bold text-primary-700">Rata-rata Komplek: 94.2%</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {blockCompliance.map((b) => (
            <div key={b.block} className="p-4 bg-canvas rounded-2xl border border-border/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-ink">{b.block}</span>
                <span className="font-bold text-xs tabular-nums text-emerald-700">{b.rate.toFixed(1)}%</span>
              </div>

              <div className="bg-surface rounded-full h-2.5 overflow-hidden border border-border/60">
                <div className={`h-full rounded-full ${b.color}`} style={{ width: `${b.rate}%` }} />
              </div>

              <div className="flex items-center justify-between text-[11px] text-ink-muted">
                <span>{b.paidUnits} Lunas</span>
                <span className="text-amber-700 font-semibold">{b.unpaidUnits} Tertunda</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Multi-Month Historical Table */}
      <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden text-xs">
        <div className="p-4 border-b border-border bg-canvas/30">
          <h3 className="font-bold text-sm text-ink">Tabel Kinerja Finansial Multi-Periode Bulanan</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-canvas border-b border-border text-ink-muted font-semibold">
              <tr>
                <th className="py-3 px-4">Periode</th>
                <th className="py-3 px-4 text-right">Pemasukan</th>
                <th className="py-3 px-4 text-right">Pengeluaran</th>
                <th className="py-3 px-4 text-right">Surplus Bersih</th>
                <th className="py-3 px-4 text-center">Tingkat Disiplin</th>
                <th className="py-3 px-4">Status Kas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {historicalTrends.map((h) => (
                <tr key={h.month} className="hover:bg-canvas/50">
                  <td className="py-3 px-4 font-bold text-ink">{h.month}</td>
                  <td className="py-3 px-4 text-right font-medium tabular-nums text-ink">{formatRupiah(h.income)}</td>
                  <td className="py-3 px-4 text-right font-medium tabular-nums text-primary-700">{formatRupiah(h.expense)}</td>
                  <td className="py-3 px-4 text-right font-bold tabular-nums text-emerald-600">+{formatRupiah(h.net)}</td>
                  <td className="py-3 px-4 text-center font-bold tabular-nums text-ink">{h.rate}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                      Surplus Stabil
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
