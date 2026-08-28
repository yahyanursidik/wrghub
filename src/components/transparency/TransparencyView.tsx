import React, { useState } from 'react';
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
} from 'lucide-react';
import { formatRupiah } from '../../lib/format';
import type { PublicTransparencyData } from '../../services/transparency.service';
import { ExpenseDetailModal } from '../shared/ExpenseDetailModal';

interface TransparencyViewProps {
  initialData: PublicTransparencyData;
}

export const TransparencyView: React.FC<TransparencyViewProps> = ({ initialData }) => {
  const [data, setData] = useState<PublicTransparencyData>(initialData);
  const [selectedMonth, setSelectedMonth] = useState('Agustus 2026');
  const [periodDropdown, setPeriodDropdown] = useState(false);
  const [selectedExpenseCategory, setSelectedExpenseCategory] = useState<any>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const getCategoryIcon = (name: string) => {
    if (name.includes('Keamanan')) return <ShieldCheck className="w-5 h-5 text-emerald-700" />;
    if (name.includes('Kebersihan')) return <Sparkles className="w-5 h-5 text-emerald-700" />;
    if (name.includes('Listrik')) return <Zap className="w-5 h-5 text-amber-600" />;
    return <Wrench className="w-5 h-5 text-sky-600" />;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const periodsList = [
    { name: 'Agustus 2026', year: 2026, month: 8 },
    { name: 'Juli 2026', year: 2026, month: 7 },
    { name: 'Juni 2026', year: 2026, month: 6 },
    { name: 'Mei 2026', year: 2026, month: 5 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
            Laporan Transparansi Warga
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            Informasi keuangan komplek yang terbuka dan dapat diakses oleh seluruh warga.
          </p>
        </div>

        {/* Right Header Buttons */}
        <div className="flex items-center gap-2">
          {/* Share Button */}
          <button
            type="button"
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-surface hover:bg-canvas border border-border rounded-xl text-xs sm:text-sm font-semibold text-ink shadow-xs transition-colors"
          >
            <Share2 className="w-4 h-4 text-primary-700" />
            <span>Bagikan</span>
          </button>

          {/* Period Selector Dropdown */}
          <div className="relative inline-block">
            <button
              type="button"
              onClick={() => setPeriodDropdown(!periodDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-canvas border border-border rounded-xl text-xs sm:text-sm font-semibold text-ink shadow-xs transition-colors"
            >
              <Calendar className="w-4 h-4 text-ink-muted" />
              <span>{selectedMonth}</span>
              <ChevronDown className="w-4 h-4 text-ink-muted" />
            </button>

            {periodDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-surface rounded-2xl shadow-modal border border-border py-1.5 z-40 animate-in fade-in">
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
                    className={`w-full text-left px-4 py-2 text-xs font-semibold flex items-center justify-between ${
                      selectedMonth === p.name ? 'bg-primary-50 text-primary-700' : 'text-ink hover:bg-canvas'
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

      {/* Top Banner: Participation Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Progress */}
        <div className="lg:col-span-2 bg-surface rounded-2xl p-6 border border-border shadow-card flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-ink tracking-tight tabular-nums">
                {data.paidProperties} dari {data.totalProperties} rumah
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-primary-600 tracking-tight">
                telah membayar
              </span>
            </div>
            <p className="text-xs sm:text-sm text-ink-muted mt-1.5">
              Tingkat partisipasi iuran warga pada {data.periodName}
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-canvas rounded-full h-3.5 overflow-hidden border border-border/50">
                <div
                  className="bg-primary-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${data.paidPercentage}%` }}
                />
              </div>
              <span className="text-base font-bold text-ink tabular-nums">
                {data.paidPercentage.toFixed(1).replace('.', ',')}%
              </span>
            </div>

            <div className="flex items-center gap-6 text-xs text-ink-muted pt-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary-500" />
                <span>Lunas: <strong className="text-ink font-semibold">{data.paidProperties} rumah</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-border-dark" />
                <span>Belum: <strong className="text-ink font-semibold">{data.unpaidProperties} rumah</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Transparency Trust Card */}
        <div className="bg-primary-50/70 border border-primary-200/80 rounded-2xl p-6 flex items-start gap-4 shadow-card">
          <div className="w-12 h-12 rounded-xl bg-surface border border-primary-200 flex items-center justify-center text-primary-600 shrink-0 shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-primary-900">
              Transparansi untuk kita semua
            </h3>
            <p className="text-xs text-primary-800/80 mt-1 leading-relaxed">
              Setiap iuran yang Bapak/Ibu bayarkan dikelola dengan amanah dan digunakan untuk kebutuhan bersama.
            </p>
          </div>
        </div>
      </div>

      {/* 6 KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Card 1: Total Rumah */}
        <div className="bg-surface rounded-2xl p-4.5 border border-border shadow-card flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-3">
            <Home className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-ink-muted">Total Rumah</span>
          <span className="text-2xl font-bold text-ink mt-1 tabular-nums">{data.totalProperties}</span>
          <span className="text-[11px] text-ink-muted mt-0.5">Unit</span>
        </div>

        {/* Card 2: Lunas */}
        <div className="bg-surface rounded-2xl p-4.5 border border-border shadow-card flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-ink-muted">Lunas</span>
          <span className="text-2xl font-bold text-ink mt-1 tabular-nums">{data.paidProperties}</span>
          <span className="text-[11px] text-emerald-700 font-medium mt-0.5">Rumah • {data.paidPercentage.toFixed(1).replace('.', ',')}%</span>
        </div>

        {/* Card 3: Belum */}
        <div className="bg-surface rounded-2xl p-4.5 border border-border shadow-card flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <Hourglass className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-ink-muted">Belum</span>
          <span className="text-2xl font-bold text-ink mt-1 tabular-nums">{data.unpaidProperties}</span>
          <span className="text-[11px] text-amber-700 font-medium mt-0.5">Rumah • {data.unpaidPercentage.toFixed(1).replace('.', ',')}%</span>
        </div>

        {/* Card 4: Pemasukan */}
        <div className="bg-surface rounded-2xl p-4.5 border border-border shadow-card flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <ArrowDownCircle className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-ink-muted">Pemasukan</span>
          <span className="text-lg font-bold text-ink mt-1 tabular-nums truncate w-full">{formatRupiah(data.income)}</span>
          <span className="text-[11px] text-ink-muted mt-0.5">Total</span>
        </div>

        {/* Card 5: Pengeluaran */}
        <div className="bg-surface rounded-2xl p-4.5 border border-border shadow-card flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-3">
            <ArrowUpCircle className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-ink-muted">Pengeluaran</span>
          <span className="text-lg font-bold text-ink mt-1 tabular-nums truncate w-full">{formatRupiah(data.expense)}</span>
          <span className="text-[11px] text-ink-muted mt-0.5">Total</span>
        </div>

        {/* Card 6: Saldo Akhir */}
        <div className="bg-surface rounded-2xl p-4.5 border border-border shadow-card flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-ink-muted">Saldo Akhir</span>
          <span className="text-lg font-bold text-ink mt-1 tabular-nums truncate w-full">{formatRupiah(data.closingBalance)}</span>
          <span className="text-[11px] text-ink-muted mt-0.5">Saldo</span>
        </div>
      </div>

      {/* 3 Bottom Columns Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Column 1: Rumah Belum Iuran */}
        <div className="bg-surface rounded-2xl p-6 border border-border shadow-card flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-ink">Rumah Belum Iuran</h3>
            <p className="text-xs text-ink-muted mt-1">
              Daftar rumah yang belum melakukan pembayaran iuran pada periode ini.
            </p>

            <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {data.unpaidHouses.slice(0, 6).map((house) => (
                <div
                  key={house}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-canvas border border-border/80 text-sm font-semibold text-ink"
                >
                  <Home className="w-4 h-4 text-ink-muted" />
                  <span>{house}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 p-3.5 bg-primary-50/60 border border-primary-200/70 rounded-xl flex items-start gap-2.5">
            <Info className="w-4 h-4 text-primary-700 shrink-0 mt-0.5" />
            <p className="text-xs text-primary-800 leading-relaxed">
              Mohon partisipasi Bapak/Ibu untuk menjaga kelancaran kegiatan bersama.
            </p>
          </div>
        </div>

        {/* Column 2: Penggunaan Dana */}
        <div className="bg-surface rounded-2xl p-6 border border-border shadow-card flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-ink">Penggunaan Dana</h3>
            <p className="text-xs text-ink-muted mt-1">
              Rincian penggunaan dana pada {data.periodName}.
            </p>

            <div className="mt-5 space-y-4">
              {data.expenseBreakdown.map((item) => (
                <div
                  key={item.name}
                  onClick={() => setSelectedExpenseCategory(item)}
                  className="space-y-1.5 p-2 rounded-xl hover:bg-canvas/80 transition-colors cursor-pointer border border-transparent hover:border-border/60"
                  title="Klik untuk melihat rincian nota & kuitansi belanja"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-ink">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-canvas border border-border flex items-center justify-center">
                        {getCategoryIcon(item.name)}
                      </div>
                      <span className="hover:text-primary-700">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2 tabular-nums">
                      <span className="text-ink-muted">{item.percentage}%</span>
                      <span className="text-primary-800 font-bold">{formatRupiah(item.amount)}</span>
                    </div>
                  </div>
                  <div className="bg-canvas rounded-full h-2 overflow-hidden border border-border/40">
                    <div
                      className="bg-primary-500 h-full rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => setSelectedExpenseCategory(data.expenseBreakdown[0])}
              className="w-full py-2.5 px-4 rounded-xl border border-primary-500 text-primary-600 hover:bg-primary-50 font-semibold text-xs sm:text-sm transition-colors text-center"
            >
              Lihat Detail Pengeluaran Riil
            </button>
          </div>
        </div>

        {/* Column 3: Ringkasan Keuangan & QR Code */}
        <div className="bg-surface rounded-2xl p-6 border border-border shadow-card flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-base font-bold text-ink">Ringkasan Keuangan</h3>
            <p className="text-xs text-ink-muted mt-1">
              Ringkasan arus keuangan pada {data.periodName}.
            </p>

            <div className="mt-4 space-y-2.5 text-xs sm:text-sm">
              <div className="flex items-center justify-between py-1 border-b border-border/60">
                <span className="text-ink-muted">Saldo Awal</span>
                <span className="font-semibold text-ink tabular-nums">{formatRupiah(data.openingBalance)}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border/60">
                <span className="text-ink-muted">Pemasukan</span>
                <span className="font-semibold text-emerald-600 tabular-nums">+ {formatRupiah(data.income)}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border/60">
                <span className="text-ink-muted">Pengeluaran</span>
                <span className="font-semibold text-red-600 tabular-nums">- {formatRupiah(data.expense)}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-primary-50 border border-primary-200/80">
                <span className="font-bold text-primary-900">Saldo Akhir</span>
                <span className="font-bold text-primary-900 text-base tabular-nums">{formatRupiah(data.closingBalance)}</span>
              </div>
            </div>
          </div>

          {/* QR Code section matching mockup */}
          <div className="p-4 rounded-2xl bg-canvas border border-border flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-ink">Pindai untuk Lihat Laporan</h4>
              <p className="text-[11px] text-ink-muted leading-tight">
                Pindai QR code untuk melihat laporan transparansi ini di perangkat mobile.
              </p>
            </div>
            <div className="shrink-0 bg-surface p-1.5 rounded-xl border border-border shadow-xs">
              {data.qrCodeDataUrl ? (
                <img src={data.qrCodeDataUrl} alt="QR Code Laporan" className="w-16 h-16 rounded" />
              ) : (
                <QrCode className="w-16 h-16 text-ink p-1" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Meta */}
      <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-muted">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-ink-muted" />
          <span>Terakhir diperbarui: {data.lastUpdatedAt}</span>
        </div>
        <div>
          <span>© 2026 WargaHub. Semua informasi bersifat terbuka untuk seluruh warga.</span>
        </div>
        <div className="font-medium text-ink">
          {data.communityName}
        </div>
      </div>

      {/* Itemized Expense Detail Modal */}
      {selectedExpenseCategory && (
        <ExpenseDetailModal
          isOpen={Boolean(selectedExpenseCategory)}
          onClose={() => setSelectedExpenseCategory(null)}
          categoryName={selectedExpenseCategory.name}
          percentage={selectedExpenseCategory.percentage}
          totalAmount={selectedExpenseCategory.amount}
        />
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-sm w-full p-6 border border-border shadow-modal space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-sm text-ink">Bagikan Laporan Transparansi</h3>
              <button onClick={() => setShowShareModal(false)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            <p className="text-ink-muted">
              Bagikan ringkasan transparansi keuangan periode <strong>{selectedMonth}</strong> ke grup WhatsApp warga atau salin tautan publik.
            </p>

            <div className="space-y-2">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `📢 Laporan Transparansi Iuran & Kas WargaHub — ${selectedMonth}\n\n• Tingkat Partisipasi: ${data.paidProperties} dari ${data.totalProperties} Rumah (${data.paidPercentage.toFixed(1)}%)\n• Total Saldo Kas: Rp${data.closingBalance.toLocaleString('id-ID')}\n• Pemasukan: Rp${data.income.toLocaleString('id-ID')}\n• Pengeluaran: Rp${data.expense.toLocaleString('id-ID')}\n\nLihat laporan detail & kuitansi terbuka di:\nhttp://localhost:4321/transparency`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-surface font-semibold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Send className="w-4 h-4" />
                Kirim ke WhatsApp Grup Warga
              </a>

              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full py-2.5 px-4 bg-surface hover:bg-canvas border border-border text-ink font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-ink-muted" />}
                {copied ? 'Tautan Berhasil Disalin!' : 'Salin Tautan Publik'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
