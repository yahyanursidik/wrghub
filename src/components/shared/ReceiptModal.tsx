import React from 'react';
import { X, Printer, Download, CheckCircle2, ShieldCheck, QrCode } from 'lucide-react';
import { formatRupiah } from '../../lib/format';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    receiptNumber?: string;
    invoiceNumber: string;
    periodName: string;
    propertyCode: string;
    residentName: string;
    amount: number;
    paidAt: string;
    paymentMethod: string;
    referenceNumber: string;
  };
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, data }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const receiptNo = data.receiptNumber || `KW-${data.periodName.replace(' ', '')}-${data.propertyCode.replace('-', '')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-surface rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-border shadow-modal relative max-h-[90vh] overflow-y-auto print:p-0 print:border-none print:shadow-none">
        {/* Close Button (Hidden in Print) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-ink-muted hover:text-ink hover:bg-canvas rounded-full print:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Receipt Header */}
        <div className="border-b border-border pb-4 text-center space-y-1">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary-100 text-primary-800 mb-1">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold tracking-tight text-ink">KOMPLEK TAMAN SEJAHTERA</h2>
          <p className="text-[11px] text-ink-muted">
            Rukun Tetangga 02 / Rukun Warga 05 • Kelurahan Melati, Jakarta Selatan 12340
          </p>
          <div className="pt-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-primary-700 bg-primary-50 px-3 py-1 rounded-full border border-primary-200">
              Kuitansi Resmi Pembayaran IPL
            </span>
          </div>
        </div>

        {/* Receipt Metadata */}
        <div className="py-4 border-b border-dashed border-border text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-ink-muted">No. Kuitansi:</span>
            <span className="font-mono font-bold text-ink">{receiptNo}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-muted">No. Invoice:</span>
            <span className="font-mono text-ink">{data.invoiceNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-muted">Waktu Pembayaran:</span>
            <span className="font-semibold text-ink">{data.paidAt}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-muted">Metode / Ref:</span>
            <span className="font-medium text-ink">{data.paymentMethod} • {data.referenceNumber}</span>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="py-4 border-b border-border space-y-3 text-xs">
          <div>
            <span className="text-ink-muted block text-[11px]">Telah Diterima Dari:</span>
            <p className="text-sm font-bold text-ink">{data.residentName} (Rumah {data.propertyCode})</p>
          </div>

          <div>
            <span className="text-ink-muted block text-[11px]">Untuk Pembayaran:</span>
            <p className="font-medium text-ink">
              Iuran Pengelolaan Lingkungan (IPL) Periode <strong>{data.periodName}</strong>
            </p>
            <p className="text-[10px] text-ink-muted">
              (Mencakup operasional keamanan 24 jam, kebersihan sampah, penerangan jalan fasum, dan perawatan sarana).
            </p>
          </div>

          <div className="p-3 bg-canvas rounded-xl flex items-center justify-between border border-border">
            <span className="font-bold text-ink">Total Nominal Dibayar:</span>
            <span className="text-base font-extrabold text-primary-700 tabular-nums">
              {formatRupiah(data.amount)}
            </span>
          </div>
        </div>

        {/* Stamp & Verification */}
        <div className="pt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-canvas border border-border rounded-xl flex items-center justify-center p-1">
              <QrCode className="w-10 h-10 text-primary-800" />
            </div>
            <div className="text-[10px] text-ink-muted">
              <span className="font-bold text-emerald-700 block text-xs flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> LUNAS / VERIFIED
              </span>
              <span>Kuitansi elektronik sah terbitan WargaHub.</span>
            </div>
          </div>

          <div className="text-right text-[11px]">
            <p className="text-ink-muted">Bendahara Komplek,</p>
            <p className="font-bold text-ink mt-6 underline">Hendra Wijaya</p>
          </div>
        </div>

        {/* Actions (Hidden in Print) */}
        <div className="mt-6 pt-4 border-t border-border flex items-center justify-end gap-3 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-border hover:bg-canvas text-ink text-xs font-semibold rounded-xl"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-surface text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            Cetak / Simpan PDF
          </button>
        </div>
      </div>
    </div>
  );
};
