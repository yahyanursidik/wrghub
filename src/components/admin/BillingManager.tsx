import React, { useState } from 'react';
import { PlusCircle, Send, CheckCircle2, AlertTriangle, Search, Printer, Calendar, FileText, Check } from 'lucide-react';
import { formatRupiah } from '../../lib/format';
import { ReceiptModal } from '../shared/ReceiptModal';

interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  propertyId: string;
  propertyCode: string;
  billingPeriodId: string;
  status: string;
  total: number;
  paidAmount: number;
  dueDate: string;
  issuedAt: string;
  paidAt: string | null;
}

interface BillingProgress {
  total: number;
  paidCount: number;
  unpaidCount: number;
  percentage: number;
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
  monthlyRatePerHouse: number;
}

interface BillingManagerProps {
  initialPeriodName: string;
  initialInvoices: InvoiceItem[];
  initialProgress: BillingProgress;
}

export const BillingManager: React.FC<BillingManagerProps> = ({
  initialPeriodName,
  initialInvoices,
  initialProgress,
}) => {
  const [invoices, setInvoices] = useState<InvoiceItem[]>(initialInvoices);
  const [progress, setProgress] = useState<BillingProgress>(initialProgress);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'UNPAID'>('ALL');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateMsg, setGenerateMsg] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  // Generate form state
  const [genYear, setGenYear] = useState(2026);
  const [genMonth, setGenMonth] = useState(9);
  const [genDueDate, setGenDueDate] = useState('2026-09-10');
  const [genFee, setGenFee] = useState(750000);

  const handleGenerateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setGenerateMsg('');
    const monthNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const periodName = `${monthNames[genMonth]} ${genYear}`;

    try {
      const res = await fetch('/api/billing/generate-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: genYear,
          month: genMonth,
          name: periodName,
          dueDate: genDueDate,
          feeAmount: genFee,
        })
      });
      const data = await res.json();
      if (res.ok) {
        setGenerateMsg(`Sukses! ${data.data?.message}`);
        setTimeout(() => {
          setShowGenerateModal(false);
          setGenerateMsg('');
        }, 1800);
      } else {
        setGenerateMsg(data.error?.message || 'Gagal membuat tagihan.');
      }
    } catch (err: any) {
      setGenerateMsg('Gagal terhubung ke server.');
    } finally {
      setGenerating(false);
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.propertyCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getWaReminderUrl = (inv: InvoiceItem) => {
    const text = encodeURIComponent(
      `Yth. Warga Rumah ${inv.propertyCode},\n\nKami mengingatkan tagihan Iuran Pengelolaan Lingkungan (IPL) ${initialPeriodName} sebesar Rp${inv.total?.toLocaleString('id-ID')} dengan No. Invoice ${inv.invoiceNumber} jatuh tempo pada ${inv.dueDate}.\n\nPembayaran dapat ditransfer ke Rekening BCA 542-019-8821 a.n. Komplek Taman Sejahtera.\n\nTerima kasih atas partisipasi dan kerjasamanya.\n- Pengurus Komplek Taman Sejahtera`
    );
    return `https://api.whatsapp.com/send?text=${text}`;
  };

  return (
    <div className="space-y-6">
      {/* Header & Batch Generator Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Pengelolaan Iuran Warga (IPL)</h1>
          <p className="text-sm text-ink-muted mt-1">
            Periode aktif: <strong className="text-ink">{initialPeriodName}</strong> • {progress.total} Rumah Terdaftar
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowGenerateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-surface text-sm font-semibold rounded-xl shadow-xs transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Generate Tagihan Periode Baru
        </button>
      </div>

      {/* Progress Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-surface rounded-2xl border border-border shadow-card">
          <span className="text-xs font-semibold text-ink-muted">Total Tagihan Periode Ini</span>
          <p className="text-2xl font-bold text-ink mt-1 tabular-nums">{formatRupiah(progress.totalAmount)}</p>
          <span className="text-xs text-ink-muted mt-1 block">{progress.total} Rumah @ Rp750.000</span>
        </div>

        <div className="p-5 bg-surface rounded-2xl border border-border shadow-card">
          <span className="text-xs font-semibold text-ink-muted">Telah Terkumpul (Lunas)</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1 tabular-nums">{formatRupiah(progress.paidAmount)}</p>
          <span className="text-xs text-emerald-700 font-semibold mt-1 block">{progress.paidCount} Rumah ({progress.percentage}%)</span>
        </div>

        <div className="p-5 bg-surface rounded-2xl border border-border shadow-card">
          <span className="text-xs font-semibold text-ink-muted">Tunggakan / Belum Lunas</span>
          <p className="text-2xl font-bold text-red-600 mt-1 tabular-nums">{formatRupiah(progress.unpaidAmount)}</p>
          <span className="text-xs text-red-700 font-semibold mt-1 block">{progress.unpaidCount} Rumah</span>
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
        <div className="p-4 border-b border-border bg-canvas/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                statusFilter === 'ALL' ? 'bg-primary-600 text-surface' : 'bg-surface text-ink-muted hover:text-ink border border-border'
              }`}
            >
              Semua ({invoices.length})
            </button>
            <button
              onClick={() => setStatusFilter('PAID')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                statusFilter === 'PAID' ? 'bg-emerald-600 text-surface' : 'bg-surface text-emerald-700 hover:bg-emerald-50 border border-border'
              }`}
            >
              Lunas ({progress.paidCount})
            </button>
            <button
              onClick={() => setStatusFilter('UNPAID')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                statusFilter === 'UNPAID' ? 'bg-red-600 text-surface' : 'bg-surface text-red-700 hover:bg-red-50 border border-border'
              }`}
            >
              Belum Bayar ({progress.unpaidCount})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari kode rumah / no invoice..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-surface border border-border rounded-xl text-xs text-ink"
            />
          </div>
        </div>

        <div className="overflow-x-auto max-h-[550px]">
          <table className="w-full text-xs text-left">
            <thead className="sticky top-0 bg-canvas border-b border-border text-ink-muted font-semibold">
              <tr>
                <th className="py-3 px-4">Kode Rumah</th>
                <th className="py-3 px-4">No. Invoice</th>
                <th className="py-3 px-4 text-right">Tagihan</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Waktu Pelunasan</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-canvas/50 text-ink">
                  <td className="py-3 px-4 font-bold text-primary-700">{inv.propertyCode}</td>
                  <td className="py-3 px-4 font-mono text-ink-muted">{inv.invoiceNumber}</td>
                  <td className="py-3 px-4 text-right font-bold tabular-nums">{formatRupiah(inv.total)}</td>
                  <td className="py-3 px-4">
                    {inv.status === 'PAID' ? (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-[11px] border border-emerald-200">
                        Lunas
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-semibold text-[11px] border border-amber-200">
                        Belum Bayar
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right text-ink-muted tabular-nums">{inv.paidAt || '-'}</td>
                  <td className="py-3 px-4 text-right">
                    {inv.status === 'PAID' ? (
                      <button
                        type="button"
                        onClick={() => setSelectedReceipt({
                          invoiceNumber: inv.invoiceNumber,
                          periodName: initialPeriodName,
                          propertyCode: inv.propertyCode,
                          residentName: `Warga Rumah ${inv.propertyCode}`,
                          amount: inv.total,
                          paidAt: inv.paidAt || '15 Agustus 2026',
                          paymentMethod: 'Transfer Bank BCA',
                          referenceNumber: `TRX-${inv.propertyCode}`,
                        })}
                        className="p-1.5 text-primary-700 hover:bg-primary-50 rounded-lg font-medium inline-flex items-center gap-1 text-[11px]"
                        title="Lihat / Cetak Kuitansi Resmi"
                      >
                        <Printer className="w-3.5 h-3.5" /> Kuitansi
                      </button>
                    ) : (
                      <a
                        href={getWaReminderUrl(inv)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg font-semibold inline-flex items-center gap-1 text-[11px]"
                        title="Kirim Pesan WhatsApp Pengingat"
                      >
                        <Send className="w-3.5 h-3.5" /> Ingatkan WA
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Batch Period Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-2xl max-w-md w-full p-6 border border-border shadow-modal space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-sm text-ink">Generate Tagihan Periode Baru</h3>
              <button onClick={() => setShowGenerateModal(false)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            {generateMsg && (
              <div className="p-3 bg-primary-50 border border-primary-200 rounded-xl text-primary-900 font-medium">
                {generateMsg}
              </div>
            )}

            <form onSubmit={handleGenerateBatch} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-ink block mb-1">Bulan</label>
                  <select
                    value={genMonth}
                    onChange={(e) => setGenMonth(parseInt(e.target.value, 10))}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-semibold text-ink"
                  >
                    <option value={9}>September</option>
                    <option value={10}>Oktober</option>
                    <option value={11}>November</option>
                    <option value={12}>Desember</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Tahun</label>
                  <input
                    type="number"
                    value={genYear}
                    onChange={(e) => setGenYear(parseInt(e.target.value, 10))}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Tanggal Jatuh Tempo</label>
                <input
                  type="date"
                  value={genDueDate}
                  onChange={(e) => setGenDueDate(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-medium text-ink"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Tarif Iuran per Rumah</label>
                <input
                  type="number"
                  value={genFee}
                  onChange={(e) => setGenFee(parseInt(e.target.value, 10))}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink tabular-nums"
                />
                <p className="text-[11px] text-ink-muted mt-1">Akan membuat 120 invoice untuk seluruh unit terdaftar.</p>
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 border border-border text-ink font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-surface font-semibold rounded-xl shadow-xs"
                >
                  {generating ? 'Membuat 120 Tagihan...' : 'Proses Tagihan Masal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Digital Receipt Modal */}
      {selectedReceipt && (
        <ReceiptModal
          isOpen={Boolean(selectedReceipt)}
          onClose={() => setSelectedReceipt(null)}
          data={selectedReceipt}
        />
      )}
    </div>
  );
};
