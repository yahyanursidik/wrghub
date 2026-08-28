import React from 'react';
import { X, ShieldCheck, Sparkles, Zap, Wrench, CheckCircle2, FileText } from 'lucide-react';
import { formatRupiah } from '../../lib/format';

interface ExpenseItemDetail {
  id: string;
  date: string;
  title: string;
  recipient: string;
  amount: number;
  invoiceRef: string;
}

interface ExpenseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryName: string;
  percentage: number;
  totalAmount: number;
}

export const ExpenseDetailModal: React.FC<ExpenseDetailModalProps> = ({
  isOpen,
  onClose,
  categoryName,
  percentage,
  totalAmount,
}) => {
  if (!isOpen) return null;

  const getDetails = (cat: string): ExpenseItemDetail[] => {
    switch (cat.toLowerCase()) {
      case 'keamanan':
        return [
          { id: '1', date: '25 Agu 2026', title: 'Honorarium Petugas Satpam Regu A (2 Personil)', recipient: 'Joko S. & Bambang', amount: 8800000, invoiceRef: 'SLP-SEC-0801' },
          { id: '2', date: '25 Agu 2026', title: 'Honorarium Petugas Satpam Regu B (2 Personil)', recipient: 'Agus W. & Rahmat', amount: 8800000, invoiceRef: 'SLP-SEC-0802' },
        ];
      case 'kebersihan':
        return [
          { id: '3', date: '24 Agu 2026', title: 'Honorarium 2 Petugas Pengangkut Sampah Komplek', recipient: 'Pak Ujang & Tim', amount: 6500000, invoiceRef: 'NOT-KBR-0824' },
          { id: '4', date: '20 Agu 2026', title: 'Retribusi Pembuangan Sampah TPA & Pembelian Sapu/Plastik', recipient: 'Dinas LH / Toko Material', amount: 3287500, invoiceRef: 'KWT-TPA-8812' },
        ];
      case 'listrik':
        return [
          { id: '5', date: '18 Agu 2026', title: 'Tagihan Rekening PLN Penerangan Jalan Umum (PJU 4 Blok)', recipient: 'PT PLN (Persero)', amount: 5210000, invoiceRef: 'PLN-PJU-202608' },
          { id: '6', date: '18 Agu 2026', title: 'Tagihan Listrik Pompa Air Bersih Fasum & Balai Warga', recipient: 'PT PLN (Persero)', amount: 2620000, invoiceRef: 'PLN-PMP-202608' },
        ];
      case 'pemeliharaan':
      default:
        return [
          { id: '7', date: '22 Agu 2026', title: 'Penggantian 6 Titik Lampu LED PJU Jalan Blok C', recipient: 'Toko Listrik Terang Jaya', amount: 2450000, invoiceRef: 'NT-LT-4491' },
          { id: '8', date: '15 Agu 2026', title: 'Perbaikan Engsel & Remote Gerbang Otomatis Timur', recipient: 'Bengkel Las & Elektro Maju', amount: 1482500, invoiceRef: 'NT-LAS-1204' },
        ];
    }
  };

  const items = getDetails(categoryName);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-surface rounded-3xl max-w-lg w-full p-6 border border-border shadow-modal relative max-h-[90vh] overflow-y-auto space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-md">
              Rincian Pengeluaran Riil ({percentage}%)
            </span>
            <h3 className="text-lg font-bold text-ink mt-1">Pos Anggaran: {categoryName}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-ink-muted hover:text-ink hover:bg-canvas rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3.5 bg-canvas rounded-2xl border border-border flex items-center justify-between">
          <span className="text-xs font-semibold text-ink-muted">Total Realisasi Dana:</span>
          <span className="text-base font-bold text-ink tabular-nums">{formatRupiah(totalAmount)}</span>
        </div>

        <div className="space-y-2.5">
          <span className="text-xs font-bold text-ink block">Daftar Kuitansi & Nota Pembayaran:</span>
          {items.map((item) => (
            <div key={item.id} className="p-3.5 bg-surface rounded-2xl border border-border space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-ink-muted">{item.date} • {item.invoiceRef}</span>
                <span className="text-xs font-bold text-ink tabular-nums">{formatRupiah(item.amount)}</span>
              </div>
              <h4 className="text-xs font-bold text-ink">{item.title}</h4>
              <p className="text-[11px] text-ink-muted flex items-center gap-1">
                <span>Penerima:</span>
                <strong className="text-ink">{item.recipient}</strong>
              </p>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-ink-muted">
          <span className="flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5" /> Telah diverifikasi oleh Bendahara & Ketua RT
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-surface font-semibold rounded-xl text-xs"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
