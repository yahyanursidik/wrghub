import React, { useState } from 'react';
import {
  Receipt,
  Search,
  CheckCircle2,
  Printer,
  Share2,
  Copy,
  Check,
  Send,
  ShieldCheck,
  QrCode,
  Home,
  Building,
  Calendar,
  CreditCard
} from 'lucide-react';
import { formatRupiah } from '../../lib/format';

export const ReceiptValidator: React.FC = () => {
  const [query, setQuery] = useState('A-17');
  const [searched, setSearched] = useState(true);
  const [copied, setCopied] = useState(false);

  const receiptData = {
    receiptNumber: 'KWT-202608-A17',
    houseCode: 'A-17',
    blockName: 'Blok A (Jl. Utama)',
    ownerName: 'Budi Santoso',
    period: 'Agustus 2026',
    amount: 750000,
    paidAt: '2026-08-15',
    verifiedAt: '2026-08-15 14:32 WIB',
    paymentMethod: 'Transfer Bank BCA',
    refNumber: 'TRX-BCA-8891024',
    verifiedBy: 'Hendra Wijaya (Bendahara Paguyuban)',
    status: 'VERIFIED',
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Search Header */}
      <div className="text-center space-y-2">
        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black border border-emerald-300">
          ✓ PORTAL VERIFIKASI RESMI
        </span>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-ink">
          Cek & Validasi Kuitansi Pembayaran Digital
        </h1>
        <p className="text-xs sm:text-sm text-ink-muted max-w-lg mx-auto">
          Masukkan nomor unit rumah atau nomor kuitansi untuk memverifikasi keabsahan pembayaran iuran paguyuban.
        </p>

        <div className="max-w-md mx-auto flex gap-2 pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Contoh: A-17 atau KWT-202608-A17"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-2xl text-xs font-bold text-ink shadow-xs"
            />
          </div>
          <button
            type="button"
            onClick={() => setSearched(true)}
            className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-2xl shadow-xs transition-colors"
          >
            Cari Kuitansi
          </button>
        </div>
      </div>

      {/* Validated Receipt Card */}
      {searched && (
        <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Receipt className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-ink">Kuitansi Resmi Pembayaran Iuran</h3>
                <span className="font-mono text-xs text-ink-muted">No: {receiptData.receiptNumber}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-black self-start sm:self-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              TERVERIFIKASI SAH
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-canvas rounded-2xl border border-border space-y-2">
              <div className="flex justify-between">
                <span className="text-ink-muted">Unit Rumah:</span>
                <span className="font-mono font-black text-ink">{receiptData.houseCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Wilayah:</span>
                <span className="font-bold text-ink">{receiptData.blockName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Nama Warga / Pemilik:</span>
                <span className="font-bold text-ink">{receiptData.ownerName}</span>
              </div>
            </div>

            <div className="p-4 bg-canvas rounded-2xl border border-border space-y-2">
              <div className="flex justify-between">
                <span className="text-ink-muted">Periode Iuran:</span>
                <span className="font-bold text-primary-700">{receiptData.period}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Waktu Verifikasi:</span>
                <span className="font-mono text-ink">{receiptData.verifiedAt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Metode Pembayaran:</span>
                <span className="font-semibold text-ink">{receiptData.paymentMethod}</span>
              </div>
            </div>
          </div>

          {/* Amount Callout */}
          <div className="p-5 bg-emerald-50/70 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs text-emerald-900 font-semibold block">Total Iuran Telah Disetor</span>
              <p className="text-2xl sm:text-3xl font-black text-emerald-800 font-mono mt-0.5">
                {formatRupiah(receiptData.amount)}
              </p>
              <span className="text-[11px] text-emerald-700 mt-0.5 block">
                Ref Transfer: {receiptData.refNumber} • Oleh: {receiptData.verifiedBy}
              </span>
            </div>

            <div className="w-16 h-16 bg-white rounded-2xl border border-emerald-300 p-1 flex items-center justify-center shrink-0 shadow-xs">
              <QrCode className="w-full h-full text-emerald-900" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center justify-center gap-2 transition-colors"
            >
              <Printer className="w-4 h-4" /> Cetak Kuitansi (PDF)
            </button>
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                `🧾 Kuitansi Pembayaran Digital Resmi WargaHub\n\nNo: ${receiptData.receiptNumber}\nUnit: ${receiptData.houseCode} (${receiptData.ownerName})\nPeriode: ${receiptData.period}\nNominal: ${formatRupiah(receiptData.amount)}\nStatus: LUNAS & TERVERIFIKASI\n\nLihat kuitansi asli ber-QR Code di:\nhttp://localhost:4321/kuitansi`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center justify-center gap-2 transition-colors"
            >
              <Send className="w-4 h-4" /> Kirim via WhatsApp
            </a>
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-4 py-3 bg-canvas border border-border text-ink font-bold text-xs rounded-xl inline-flex items-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              Salin Tautan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
