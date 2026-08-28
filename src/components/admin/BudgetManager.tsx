import React, { useState } from 'react';
import { PieChart, TrendingUp, AlertTriangle, CheckCircle2, DollarSign, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatRupiah } from '../../lib/format';

interface BudgetItem {
  category: string;
  budgetAmount: number;
  actualAmount: number;
  percentage: number;
  status: 'SAFE' | 'WARNING' | 'EXCEEDED';
  variance: number;
}

export const BudgetManager: React.FC = () => {
  const [period, setPeriod] = useState('Agustus 2026');

  const budgetItems: BudgetItem[] = [
    {
      category: 'Operasional Keamanan & Satpam',
      budgetAmount: 18000000,
      actualAmount: 17600000,
      percentage: 97.7,
      status: 'WARNING',
      variance: 400000,
    },
    {
      category: 'Kebersihan & Pengangkutan Sampah',
      budgetAmount: 10500000,
      actualAmount: 9787500,
      percentage: 93.2,
      status: 'WARNING',
      variance: 712500,
    },
    {
      category: 'Listrik & Penerangan Jalan (PJU)',
      budgetAmount: 8500000,
      actualAmount: 7830000,
      percentage: 92.1,
      status: 'WARNING',
      variance: 670000,
    },
    {
      category: 'Perawatan Sarana & Taman',
      budgetAmount: 5000000,
      actualAmount: 3932500,
      percentage: 78.6,
      status: 'SAFE',
      variance: 1067500,
    },
    {
      category: 'Kegiatan Warga & HUT RI',
      budgetAmount: 4000000,
      actualAmount: 0,
      percentage: 0,
      status: 'SAFE',
      variance: 4000000,
    },
  ];

  const totalBudget = budgetItems.reduce((acc, i) => acc + i.budgetAmount, 0);
  const totalActual = budgetItems.reduce((acc, i) => acc + i.actualAmount, 0);
  const totalVariance = totalBudget - totalActual;
  const overallPercentage = (totalActual / totalBudget) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Anggaran & Realisasi Keuangan</h1>
          <p className="text-sm text-ink-muted mt-1">
            Monitoring serapan dana iuran terhadap pagu anggaran periode <strong>{period}</strong>.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-surface rounded-2xl border border-border shadow-card">
          <span className="text-xs font-semibold text-ink-muted">Pagu Anggaran Bulanan</span>
          <p className="text-2xl font-bold text-ink mt-1 tabular-nums">{formatRupiah(totalBudget)}</p>
          <span className="text-xs text-ink-muted mt-1 block">5 Pos Anggaran Disetujui</span>
        </div>

        <div className="p-5 bg-surface rounded-2xl border border-border shadow-card">
          <span className="text-xs font-semibold text-ink-muted">Total Realisasi Belanja</span>
          <p className="text-2xl font-bold text-primary-700 mt-1 tabular-nums">{formatRupiah(totalActual)}</p>
          <span className="text-xs text-emerald-700 font-semibold mt-1 block">
            Serapan: {overallPercentage.toFixed(1)}% dari Pagu
          </span>
        </div>

        <div className="p-5 bg-surface rounded-2xl border border-border shadow-card">
          <span className="text-xs font-semibold text-ink-muted">Sisa Anggaran (Surplus)</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1 tabular-nums">{formatRupiah(totalVariance)}</p>
          <span className="text-xs text-emerald-700 font-semibold mt-1 block">Efisiensi Belanja Terjaga</span>
        </div>
      </div>

      {/* Budget Breakdown Table */}
      <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
        <div className="p-4 border-b border-border bg-canvas/30">
          <h3 className="font-bold text-sm text-ink">Evaluasi Realisasi per Pos Anggaran</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-canvas border-b border-border text-ink-muted font-semibold">
              <tr>
                <th className="py-3 px-4">Pos Anggaran</th>
                <th className="py-3 px-4 text-right">Pagu Target</th>
                <th className="py-3 px-4 text-right">Realisasi Aktual</th>
                <th className="py-3 px-4">Serapan</th>
                <th className="py-3 px-4 text-right">Sisa / Selisih</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {budgetItems.map((item) => (
                <tr key={item.category} className="hover:bg-canvas/50 text-ink">
                  <td className="py-3 px-4 font-bold text-ink">{item.category}</td>
                  <td className="py-3 px-4 text-right font-medium tabular-nums">{formatRupiah(item.budgetAmount)}</td>
                  <td className="py-3 px-4 text-right font-bold text-primary-800 tabular-nums">{formatRupiah(item.actualAmount)}</td>
                  <td className="py-3 px-4 min-w-[140px]">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-canvas rounded-full h-2 overflow-hidden border border-border/50">
                        <div
                          className={`h-full rounded-full ${
                            item.percentage > 90 ? 'bg-amber-500' : 'bg-primary-600'
                          }`}
                          style={{ width: `${Math.min(item.percentage, 100)}%` }}
                        />
                      </div>
                      <span className="font-bold tabular-nums text-[11px]">{item.percentage.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-emerald-700 tabular-nums">
                    + {formatRupiah(item.variance)}
                  </td>
                  <td className="py-3 px-4">
                    {item.percentage > 90 ? (
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                        Mendekati Pagu
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                        Aman (Hemat)
                      </span>
                    )}
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
