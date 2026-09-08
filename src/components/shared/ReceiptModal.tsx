import React, { useState } from 'react';
import { X, Printer, Download, CheckCircle2, ShieldCheck, QrCode, AlertCircle, FileText, Wallet } from 'lucide-react';
import { formatRupiah } from '../../lib/format';

export interface ReceiptItemBreakdown {
  name: string;
  amount: number;
  desc?: string;
}

export interface ReceiptModalData {
  receiptNumber?: string;
  invoiceNumber: string;
  periodName: string;
  propertyCode: string;
  residentName: string;
  amount: number;
  paidAt?: string | null;
  dueDate?: string | null;
  status?: string; // 'PAID' | 'UNPAID' | 'OVERDUE' | etc.
  paymentMethod?: string;
  referenceNumber?: string;
  isInvoice?: boolean;
  items?: ReceiptItemBreakdown[];
  kepalaKomplekName?: string;
  treasurerName?: string;
  notes?: string;
}

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ReceiptModalData;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, data }) => {
  if (!isOpen) return null;

  const isInitiallyPaid = data.status === 'PAID' || Boolean(data.paidAt && !data.isInvoice);
  const [activeDocMode, setActiveDocMode] = useState<'AUTO' | 'INVOICE' | 'RECEIPT'>(
    data.isInvoice ? 'INVOICE' : isInitiallyPaid ? 'RECEIPT' : 'INVOICE'
  );

  const isReceipt = activeDocMode === 'RECEIPT' || (activeDocMode === 'AUTO' && isInitiallyPaid);

  const handlePrint = () => {
    window.print();
  };

  const receiptNo = data.receiptNumber || `KW-${(data.periodName || '2026').replace(/\s+/g, '')}-${data.propertyCode.replace(/[^a-zA-Z0-9]/g, '')}`;

  const commName = typeof window !== 'undefined' ? (() => {
    try {
      const saved = localStorage.getItem('wargahub_set_comm_name');
      if (saved) {
        const p = JSON.parse(saved);
        if (p && typeof p === 'string' && !p.toLowerCase().includes('taman sejahtera')) return p.toUpperCase();
      }
    } catch (e) {}
    return 'KOMPLEK GRAND SARIWANGI';
  })() : 'KOMPLEK GRAND SARIWANGI';

  const commRtRw = typeof window !== 'undefined' ? (() => {
    try {
      const saved = localStorage.getItem('wargahub_set_rtrw');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return 'RT 01 / RW 08';
  })() : 'RT 01 / RW 08';

  const kepalaKomplek = typeof window !== 'undefined' ? (() => {
    if (data.kepalaKomplekName && !data.kepalaKomplekName.toLowerCase().includes('bambang sutrisno')) {
      return data.kepalaKomplekName;
    }
    try {
      const savedK = localStorage.getItem('wargahub_set_kepala_komplek');
      if (savedK) {
        const parsed = JSON.parse(savedK);
        if (parsed && typeof parsed === 'string' && !parsed.toLowerCase().includes('bambang sutrisno')) return parsed;
      }
      const savedRw = localStorage.getItem('wargahub_set_rwheadname');
      if (savedRw) {
        const parsed = JSON.parse(savedRw);
        if (parsed && typeof parsed === 'string' && !parsed.toLowerCase().includes('bambang sutrisno')) return parsed;
      }
    } catch (e) {}
    return 'Yahya Nursidik';
  })() : (data.kepalaKomplekName && !data.kepalaKomplekName.toLowerCase().includes('bambang sutrisno') ? data.kepalaKomplekName : 'Yahya Nursidik');

  const kasManager = typeof window !== 'undefined' ? (() => {
    if (data.treasurerName && !data.treasurerName.toLowerCase().includes('siti rahmawati') && !data.treasurerName.toLowerCase().includes('hendra wijaya')) {
      return data.treasurerName;
    }
    try {
      const savedT = localStorage.getItem('wargahub_set_treasname');
      if (savedT) {
        const parsed = JSON.parse(savedT);
        if (parsed && typeof parsed === 'string' && !parsed.toLowerCase().includes('siti rahmawati') && !parsed.toLowerCase().includes('hendra wijaya')) {
          return parsed;
        }
      }
      localStorage.setItem('wargahub_set_treasname', JSON.stringify('Yahya Nursidik'));
    } catch (e) {}
    return 'Yahya Nursidik';
  })() : (data.treasurerName || 'Yahya Nursidik');

  const [sigLayoutMode, setSigLayoutMode] = useState<'KEPALA_ONLY' | 'DUAL'>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('wargahub_receipt_sig_mode');
        if (saved === 'KEPALA_ONLY' || saved === 'DUAL') return saved;
      } catch (e) {}
    }
    return 'DUAL';
  });

  const isReceivedByKepala = Boolean(
    (data.paymentMethod && data.paymentMethod.toLowerCase().includes('kepala komplek')) ||
    (data.notes && data.notes.toLowerCase().includes('kepala komplek'))
  );

  // Auto-resolve breakdown items (Khusus Grand Sariwangi RT Rp 250.000 & RW Rp 100.000)
  const resolvedItems = React.useMemo<ReceiptItemBreakdown[]>(() => {
    if (data.items && data.items.length > 0) return data.items;

    const total = Number(data.amount) || 0;
    if (total === 350000) {
      return [
        {
          name: 'Iuran RT (Sampah, Kebersihan Lingkungan & Fasum RT)',
          amount: 250000,
          desc: 'Pengangkutan sampah dinas LH, kebersihan saluran air, pemotongan rumput & operasional RT'
        },
        {
          name: 'Iuran RW (Retribusi Paguyuban & Wilayah RW)',
          amount: 100000,
          desc: 'Retribusi paguyuban komplek, koordinasi keamanan wilayah RW & administrasi'
        }
      ];
    }

    if (total === 250000) {
      return [
        {
          name: 'Iuran RT (Pengangkutan Sampah, Fasum & Operasional RT)',
          amount: 250000,
          desc: 'Pengangkutan armada sampah dinas LH, kebersihan saluran, dan tata kelola lingkungan RT'
        }
      ];
    }

    // Default proportion if custom amount
    return [
      {
        name: 'Iuran Pengelolaan Lingkungan (IPL) - Porsi RT',
        amount: Math.max(0, total - 100000),
        desc: 'Pengangkutan sampah dan operasional lingkungan di RT'
      },
      {
        name: 'Iuran Paguyuban - Porsi RW',
        amount: Math.min(100000, total),
        desc: 'Retribusi dan koordinasi wilayah paguyuban RW'
      }
    ];
  }, [data.items, data.amount]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-surface rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-border shadow-modal relative max-h-[90vh] overflow-y-auto print:p-0 print:border-none print:shadow-none">
        {/* Close Button (Hidden in Print) */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-ink-muted hover:text-ink hover:bg-canvas rounded-full print:hidden transition-colors"
          title="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* View Mode Switcher (Invoice vs Kuitansi) - Hidden in Print */}
        <div className="mb-4 print:hidden flex items-center justify-center gap-2 p-1 bg-canvas rounded-xl border border-border w-fit mx-auto">
          <button
            type="button"
            onClick={() => setActiveDocMode('INVOICE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              !isReceipt
                ? 'bg-primary-600 text-white shadow-2xs'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Surat Tagihan (Invoice)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveDocMode('RECEIPT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              isReceipt
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Kuitansi Lunas</span>
          </button>
        </div>

        {/* Receipt / Invoice Header */}
        <div className="border-b border-border pb-4 text-center space-y-1">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary-100 text-primary-800 mb-1">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-black tracking-tight text-ink">{commName}</h2>
          <p className="text-[11px] text-ink-muted font-medium">
            {commRtRw} • Sariwangi, Parongpong, Bandung Barat 40559
          </p>
          <div className="pt-2 flex items-center justify-center gap-2">
            {isReceipt ? (
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Kuitansi Resmi Pembayaran IPL
              </span>
            ) : (
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800 bg-amber-50 px-3.5 py-1 rounded-full border border-amber-200 inline-flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-600" /> Surat Tagihan / Invoice IPL Resmi
              </span>
            )}
          </div>
        </div>

        {/* Metadata Section */}
        <div className="py-4 border-b border-dashed border-border text-xs space-y-2">
          {isReceipt && (
            <div className="flex justify-between items-center">
              <span className="text-ink-muted">No. Kuitansi:</span>
              <span className="font-mono font-bold text-ink">{receiptNo}</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-ink-muted">No. Invoice:</span>
            <span className="font-mono font-bold text-ink">{data.invoiceNumber}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-ink-muted">Periode Iuran:</span>
            <span className="font-bold text-ink">{data.periodName}</span>
          </div>
          {isReceipt ? (
            <>
              <div className="flex justify-between items-center">
                <span className="text-ink-muted">Waktu Pembayaran:</span>
                <span className="font-semibold text-emerald-700">{data.paidAt || 'Telah Terverifikasi'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-ink-muted">Metode / Ref:</span>
                <span className="font-medium text-ink">{data.paymentMethod || 'Transfer Bank Syariah'} • {data.referenceNumber || 'TRX-VERIFIED'}</span>
              </div>
              {data.notes && (
                <div className="flex justify-between items-start gap-2 pt-0.5">
                  <span className="text-ink-muted shrink-0">Keterangan:</span>
                  <span className="font-semibold text-ink text-right text-[11px]">{data.notes}</span>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <span className="text-ink-muted">Jatuh Tempo:</span>
                <span className="font-semibold text-amber-700">{data.dueDate || '10 ' + data.periodName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-ink-muted">Status Pembayaran:</span>
                <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[10px]">
                  MENUNGGU PEMBAYARAN
                </span>
              </div>
            </>
          )}
        </div>

        {/* Recipient & House Info */}
        <div className="py-3 border-b border-border space-y-1 text-xs">
          <span className="text-ink-muted block text-[11px]">
            {isReceipt ? 'Telah Diterima Dari:' : 'Ditujukan Kepada Warga:'}
          </span>
          <p className="text-sm font-black text-ink">
            {data.residentName} <span className="text-primary-700 font-bold">({data.propertyCode.startsWith('Unit') ? data.propertyCode : `Unit ${data.propertyCode}`})</span>
          </p>
          <p className="text-[11px] text-ink-muted">Komplek Grand Sariwangi</p>
        </div>

        {/* Breakdown Items Section (Khusus Grand Sariwangi: RT 250rb & RW 100rb) */}
        <div className="py-4 border-b border-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-ink uppercase tracking-wide">
              Rincian Alokasi Iuran (Khusus Grand Sariwangi):
            </span>
            <span className="text-[10px] text-ink-muted font-medium">Tarif Resmi Klaster</span>
          </div>

          <div className="space-y-2">
            {resolvedItems.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 bg-canvas/70 rounded-xl border border-border flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <p className="font-bold text-ink">{item.name}</p>
                  {item.desc && <p className="text-[10px] text-ink-muted leading-relaxed">{item.desc}</p>}
                </div>
                <span className="font-mono font-black text-ink shrink-0 text-xs tabular-nums">
                  {formatRupiah(item.amount)}
                </span>
              </div>
            ))}
          </div>

          {/* Special Grand Sariwangi Note if RT-only (Rp 250.000) */}
          {Number(data.amount) === 250000 && (
            <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
              💡 <strong>Catatan Grand Sariwangi:</strong> Iuran ini dialokasikan penuh ke kas <strong>RT Rp 250.000</strong> (mencakup armada pengangkutan sampah dinas, kebersihan saluran air, dan fasum). Iuran RW Rp 100.000 dapat dibayarkan terpisah atau digabungkan.
            </div>
          )}

          {/* Payment Account Instructions (Shown in Invoice Mode) */}
          {!isReceipt && (
            <div className="p-3 bg-primary-50/70 rounded-2xl border border-primary-200 space-y-1.5 text-xs text-primary-950">
              <div className="flex items-center gap-1.5 font-bold text-primary-900 text-[11px]">
                <Wallet className="w-3.5 h-3.5 text-primary-700" />
                <span>Saluran Pembayaran Resmi Kas Paguyuban:</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                <div className="p-2 bg-white rounded-lg border border-primary-100">
                  <span className="text-[9px] text-ink-muted block uppercase font-sans font-bold">Bank Kas</span>
                  <strong>Jago Syariah / BSI</strong>
                </div>
                <div className="p-2 bg-white rounded-lg border border-primary-100">
                  <span className="text-[9px] text-ink-muted block uppercase font-sans font-bold">Nomor Rekening</span>
                  <strong className="text-primary-800 select-all">505621101851</strong>
                </div>
              </div>
              <p className="text-[10px] text-primary-800 italic">
                Atas Nama: <strong>Yahya Nursidik</strong> (Bendahara / Pengurus Komplek Grand Sariwangi)
              </p>
            </div>
          )}

          {/* Total Box */}
          <div className="p-3 bg-canvas rounded-2xl flex items-center justify-between border border-border">
            <span className="font-black text-ink text-xs">
              {isReceipt ? 'Total Nominal Diterima Lunas:' : 'Total Tagihan Yang Harus Dibayar:'}
            </span>
            <span className="text-lg font-black text-primary-800 tabular-nums font-mono">
              {formatRupiah(data.amount)}
            </span>
          </div>
        </div>

        {/* Dual Signatures & Verification (Kepala Komplek & Bendahara) */}
        <div className="pt-4 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-12 h-12 bg-canvas border border-border rounded-xl flex items-center justify-center p-1 shrink-0">
                <QrCode className="w-9 h-9 text-primary-800" />
              </div>
              <div className="text-[10px] text-ink-muted leading-tight">
                {isReceipt ? (
                  <span className="font-black text-emerald-700 block text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> LUNAS / TERVERIFIKASI
                  </span>
                ) : (
                  <span className="font-black text-amber-700 block text-xs flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> RESMI TERBIT DARI WARGAHUB
                  </span>
                )}
                <span>Dokumen elektronik sah Komplek Grand Sariwangi.</span>
              </div>
            </div>

            <div className="text-right text-[10px] text-ink-muted font-mono">
              <span>Dicetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>

          {/* Format Pengesahan Toggle (Khusus Grand Sariwangi - Fleksibel) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 bg-canvas/70 rounded-xl border border-border text-[11px] print:hidden">
            <span className="font-bold text-ink flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-primary-600 shrink-0" />
              <span>Format Pengesahan Kuitansi:</span>
            </span>
            <div className="inline-flex items-center gap-1 bg-surface p-1 rounded-lg border border-border">
              <button
                type="button"
                onClick={() => {
                  setSigLayoutMode('KEPALA_ONLY');
                  try { localStorage.setItem('wargahub_receipt_sig_mode', 'KEPALA_ONLY'); } catch (e) {}
                }}
                className={`px-2.5 py-1 rounded-md font-bold text-[10px] transition-all ${
                  sigLayoutMode === 'KEPALA_ONLY'
                    ? 'bg-primary-700 text-white shadow-2xs'
                    : 'text-ink-muted hover:text-ink'
                }`}
                title="Format Tunggal: Khusus Kepala Komplek Grand Sariwangi"
              >
                👤 Khusus Kepala Komplek
              </button>
              <button
                type="button"
                onClick={() => {
                  setSigLayoutMode('DUAL');
                  try { localStorage.setItem('wargahub_receipt_sig_mode', 'DUAL'); } catch (e) {}
                }}
                className={`px-2.5 py-1 rounded-md font-bold text-[10px] transition-all ${
                  sigLayoutMode === 'DUAL'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-ink-muted hover:text-ink'
                }`}
                title="Format Ganda: Kepala Komplek + Yahya Nursidik"
              >
                👥 Kepala Komplek + Yahya Nursidik
              </button>
            </div>
          </div>

          {/* SIGNATURE SECTION: FLEKSIBEL KHUSUS GRAND SARIWANGI */}
          {sigLayoutMode === 'KEPALA_ONLY' ? (
            <div className="pt-2 border-t border-border">
              <div className="max-w-sm mx-auto text-center p-3.5 rounded-2xl border border-emerald-300 bg-emerald-50/60 shadow-2xs space-y-1">
                <p className="text-[10px] uppercase font-bold text-emerald-900">
                  {isReceivedByKepala ? 'Diterima Tunai Langsung & Disahkan Oleh,' : 'Mengetahui & Mengesahkan Resmi,'}
                </p>
                <p className="font-black text-ink text-xs mt-0.5">Kepala Komplek Grand Sariwangi</p>
                <div className="h-10 flex items-center justify-center">
                  <span className="text-[9px] font-mono italic text-emerald-800 font-bold opacity-85">
                    {isReceivedByKepala ? '[Tanda Tangan & Cap Sah Paguyuban]' : '[Tanda Tangan Digital Sah]'}
                  </span>
                </div>
                <p className="font-black text-ink text-xs underline decoration-primary-500 decoration-1 underline-offset-2">
                  {kepalaKomplek}
                </p>
                <span className="text-[10px] text-emerald-800 font-bold block mt-0.5">
                  {isReceivedByKepala ? 'Penerima Uang Iuran Tunai / Ketua Paguyuban' : 'Ketua Paguyuban Warga Komplek Grand Sariwangi'}
                </span>
                <p className="text-[9px] text-ink-muted italic pt-1">
                  (Pengesahan tunggal resmi pimpinan paguyuban Komplek Grand Sariwangi)
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border text-xs">
              {/* Left: Kepala Komplek */}
              <div className={`text-center p-2.5 rounded-xl border transition-all ${
                isReceivedByKepala
                  ? 'bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-300/50'
                  : 'bg-canvas/40 border-border/60'
              }`}>
                <p className={`text-[10px] uppercase font-bold ${isReceivedByKepala ? 'text-emerald-900' : 'text-ink-muted'}`}>
                  {isReceivedByKepala ? 'Diterima Tunai Langsung Oleh,' : 'Mengetahui & Mengesahkan,'}
                </p>
                <p className="font-extrabold text-ink text-[11px] mt-0.5">Kepala Komplek Grand Sariwangi</p>
                <div className="h-10 flex items-center justify-center">
                  <span className={`text-[9px] font-mono italic opacity-85 ${isReceivedByKepala ? 'text-emerald-800 font-bold' : 'text-primary-700'}`}>
                    {isReceivedByKepala ? '[Tanda Tangan & Cap Sah]' : '[Tanda Tangan Digital]'}
                  </span>
                </div>
                <p className="font-black text-ink text-xs underline decoration-primary-500 decoration-1 underline-offset-2">
                  {kepalaKomplek}
                </p>
                <span className={`text-[9px] block mt-0.5 ${isReceivedByKepala ? 'text-emerald-800 font-bold' : 'text-ink-muted'}`}>
                  {isReceivedByKepala ? 'Penerima Uang Iuran Tunai' : 'Ketua Paguyuban Warga'}
                </span>
              </div>

              {/* Right: Pengelola Kas / Administrasi Komplek (Yahya Nursidik) */}
              <div className="text-center p-2.5 rounded-xl bg-canvas/40 border border-border/60">
                <p className="text-[10px] text-ink-muted uppercase font-bold">
                  {isReceivedByKepala
                    ? 'Pencatatan & Pembukuan Kas,'
                    : (isReceipt ? 'Diterima & Diverifikasi Oleh,' : 'Petugas Administrasi Kas,')}
                </p>
                <p className="font-extrabold text-ink text-[11px] mt-0.5">Pengelola Kas / Admin Komplek</p>
                <div className="h-10 flex items-center justify-center">
                  <span className="text-[9px] text-emerald-700 font-mono italic opacity-75">[Tanda Tangan Digital]</span>
                </div>
                <p className="font-black text-ink text-xs underline decoration-emerald-500 decoration-1 underline-offset-2">
                  {kasManager}
                </p>
                <span className="text-[9px] text-ink-muted block mt-0.5">Pengelola Rekening Kas Paguyuban</span>
              </div>
            </div>
          )}
        </div>

        {/* Actions (Hidden in Print) */}
        <div className="mt-6 pt-4 border-t border-border flex items-center justify-between gap-3 print:hidden">
          <span className="text-[11px] text-ink-muted font-mono">
            {data.invoiceNumber}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border hover:bg-canvas text-ink text-xs font-bold rounded-xl active:scale-[0.98] transition-all"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs active:scale-[0.98] transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Unduh PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

