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
    const c = cat.toLowerCase();
    if (c.includes('gaji') || c.includes('satpam') || c.includes('keamanan') || c.includes('honor')) {
      return [
        { id: '1', date: '05 Sep 2026', title: 'Honor Petugas Jaga & Keamanan 24 Jam (Pa Adri Harry)', recipient: 'Pa Adri Harry', amount: 1350000, invoiceRef: 'SLP-SEC-0901' },
        { id: '2', date: '05 Sep 2026', title: 'Honor Petugas Jaga & Keamanan Shift (Pak Slamet Radiyanto)', recipient: 'Pak Slamet Radiyanto', amount: 1100000, invoiceRef: 'SLP-SEC-0902' },
      ];
    }
    if (c.includes('rt') || c.includes('sampah') || c.includes('kebersihan')) {
      return [
        { id: '3', date: '04 Sep 2026', title: 'Iuran Retribusi RT, Armada Kebersihan & Pengangkutan Sampah LH', recipient: 'Pengurus RT 01 / Armada LH', amount: 250000, invoiceRef: 'NOT-RT01-SMPH' },
      ];
    }
    if (c.includes('rw') || c.includes('paguyuban')) {
      return [
        { id: '4', date: '03 Sep 2026', title: 'Iuran Retribusi Paguyuban Komplek & Koordinasi Wilayah RW 08', recipient: 'Bendahara Paguyuban RW 08', amount: 100000, invoiceRef: 'KWT-RW08-PGYBN' },
      ];
    }
    if (c.includes('operasional') || c.includes('listrik') || c.includes('pju')) {
      return [
        { id: '5', date: '06 Sep 2026', title: 'Tagihan Rekening Listrik PLN PJU Lingkungan & Air Galon Pos Jaga', recipient: 'PT PLN (Persero) & Depo Air', amount: 75000, invoiceRef: 'PLN-PJU-0926' },
      ];
    }
    if (c.includes('kesehatan') || c.includes('bantuan')) {
      return [
        { id: '6', date: '06 Sep 2026', title: 'Dana Kesehatan / Bantuan Satpam (P3K & Pengobatan Ringan - Fluktuatif Ditalangi Saldo Berjalan)', recipient: 'Pa Adri Harry / Apotek Sehat', amount: 100000, invoiceRef: 'KWT-MED-SATPAM' },
      ];
    }
    if (c.includes('terduga') || c.includes('sumbangan') || c.includes('agustus') || c.includes('acara') || c.includes('kelurahan')) {
      return [
        { id: '7', date: '07 Sep 2026', title: 'Dana Tak Terduga: Partisipasi Acara Kelurahan / Musyawarah RW & Agustusan', recipient: 'Panitia Wilayah RW / Kelurahan', amount: 100000, invoiceRef: 'SBG-RW-KEGIATAN' },
      ];
    }
    return [
      { id: '8', date: '05 Sep 2026', title: `Realisasi Pos Anggaran ${cat}`, recipient: 'Pengurus Komplek Grand Sariwangi', amount: totalAmount, invoiceRef: 'VCR-OPS-0901' },
    ];
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
