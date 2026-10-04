import React from 'react';
import { X, CheckCircle2, FileText, Info } from 'lucide-react';
import { formatRupiah } from '../../lib/format';

export interface RealExpenseItem {
  id: string;
  date: string;
  title: string;
  description: string;
  amount: number;
  categoryName: string;
}

interface ExpenseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryName: string;
  percentage: number;
  totalAmount: number;
  // Bukti pengeluaran riil dari database untuk kategori & periode terpilih
  realItems?: RealExpenseItem[];
  periodLabel?: string;
}

export const ExpenseDetailModal: React.FC<ExpenseDetailModalProps> = ({
  isOpen,
  onClose,
  categoryName,
  percentage,
  totalAmount,
  realItems = [],
  periodLabel,
}) => {
  if (!isOpen) return null;

  const items = realItems.filter((item) => item.categoryName === categoryName);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-surface rounded-3xl max-w-lg w-full p-6 border border-border shadow-modal relative max-h-[90vh] overflow-y-auto space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-md">
              Rincian Pengeluaran Riil ({percentage}%)
            </span>
            <h3 className="text-lg font-bold text-ink mt-1">Pos Anggaran: {categoryName}</h3>
            {periodLabel && (
              <p className="text-[11px] text-ink-muted mt-0.5">Periode pembukuan: {periodLabel}</p>
            )}
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
          {items.length === 0 ? (
            <div className="p-4 text-center bg-canvas rounded-2xl border border-dashed border-border space-y-2">
              <Info className="w-5 h-5 mx-auto text-ink-muted/60" />
              <p className="text-xs text-ink-muted font-bold">
                Belum ada nota tercatat di database untuk kategori ini{periodLabel ? ` pada periode ${periodLabel}` : ''}.
              </p>
              <p className="text-[11px] text-ink-muted/80">
                Nota akan muncul otomatis setelah pos pengeluaran dibukukan oleh Bendahara.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="p-3.5 bg-surface rounded-2xl border border-border space-y-1.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-ink-muted flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    {item.date} • {item.id}
                  </span>
                  <span className="text-xs font-bold text-ink tabular-nums">{formatRupiah(item.amount)}</span>
                </div>
                <h4 className="text-xs font-bold text-ink">{item.title}</h4>
                {item.description && (
                  <p className="text-[11px] text-ink-muted">{item.description}</p>
                )}
              </div>
            ))
          )}
        </div>

        <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-ink-muted">
          <span className="flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5" /> Tersambung langsung ke buku kas sistem ({items.length} nota terdata)
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
