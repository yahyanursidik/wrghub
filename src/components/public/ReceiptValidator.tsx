import React, { useState, useEffect, useMemo } from 'react';
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
  CreditCard,
  AlertCircle,
  Clock,
  Download,
  Filter,
  Layers,
  FileCheck,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Lock,
  MessageSquare,
  FileText,
  Scan
} from 'lucide-react';
import { formatRupiah } from '../../lib/format';

export type ReceiptSubTab = 'verify_receipt' | 'receipts_history' | 'request_receipt' | 'security_guarantee';

interface ReceiptComponent {
  name: string;
  amount: number;
}

export interface OfficialReceipt {
  id: string;
  receiptNumber: string;
  propertyCode: string;
  blockName: string;
  residentName: string;
  phoneMasked: string;
  period: string;
  amount: number;
  paidAt: string;
  verifiedAt: string;
  paymentMethod: string;
  refNumber: string;
  verifiedBy: string;
  status: 'VERIFIED' | 'PENDING';
  components: ReceiptComponent[];
}

interface ReceiptValidatorProps {
  initialTab?: ReceiptSubTab;
  initialQuery?: string;
}

export const ReceiptValidator: React.FC<ReceiptValidatorProps> = ({
  initialTab = 'verify_receipt',
  initialQuery = ''
}) => {
  // Navigation State with URL synchronization
  const [activeTab, setActiveTab] = useState<ReceiptSubTab>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab') as ReceiptSubTab;
      if (['verify_receipt', 'receipts_history', 'request_receipt', 'security_guarantee'].includes(tabParam)) {
        return tabParam;
      }
    }
    return initialTab;
  });

  const handleTabChange = (tab: ReceiptSubTab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.replaceState({}, '', url.toString());
    }
  };

  // Pre-configured Official Receipts Database
  const officialReceipts: OfficialReceipt[] = useMemo(() => [], []);

  // Search & Validation State
  const [searchQuery, setSearchQuery] = useState(initialQuery || '');
  const [searched, setSearched] = useState(Boolean(initialQuery));
  const [activeReceipt, setActiveReceipt] = useState<OfficialReceipt | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);

  // Directory Filter State
  const [historySearch, setHistorySearch] = useState('');
  const [historyBlockFilter, setHistoryBlockFilter] = useState('ALL');

  // Request Receipt Form State
  const [reqUnit, setReqUnit] = useState('');
  const [reqName, setReqName] = useState('');
  const [reqPeriod, setReqPeriod] = useState('Agustus 2026');
  const [reqPurpose, setReqPurpose] = useState('Reimburse Kantor / Perusahaan');
  const [reqPhone, setReqPhone] = useState('');
  const [reqEmail, setReqEmail] = useState('');
  const [reqNotes, setReqNotes] = useState('');
  const [reqSubmitting, setReqSubmitting] = useState(false);
  const [reqSuccessModal, setReqSuccessModal] = useState(false);
  const [reqError, setReqError] = useState('');

  // Handle Search Submission
  const handlePerformSearch = (customQuery?: string) => {
    const q = (customQuery !== undefined ? customQuery : searchQuery).trim().toUpperCase();
    if (!q) return;

    setSearched(true);
    // Find match in official database
    const found = officialReceipts.find(r => 
      r.propertyCode.toUpperCase() === q ||
      r.receiptNumber.toUpperCase().includes(q) ||
      r.residentName.toUpperCase().includes(q) ||
      r.refNumber.toUpperCase().includes(q)
    );

    setActiveReceipt(found || null);
  };

  // Auto-search if initialQuery provided
  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
      handlePerformSearch(initialQuery);
    }
  }, [initialQuery]);

  // Copy Verification Link
  const handleCopyVerificationLink = () => {
    if (typeof window !== 'undefined' && activeReceipt) {
      const url = `${window.location.origin}/kuitansi?q=${activeReceipt.receiptNumber}`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Filtered History
  const filteredHistory = useMemo(() => {
    return officialReceipts.filter(r => {
      const matchSearch =
        r.receiptNumber.toLowerCase().includes(historySearch.toLowerCase()) ||
        r.propertyCode.toLowerCase().includes(historySearch.toLowerCase()) ||
        r.residentName.toLowerCase().includes(historySearch.toLowerCase());

      const matchBlock =
        historyBlockFilter === 'ALL' || r.propertyCode.startsWith(historyBlockFilter);

      return matchSearch && matchBlock;
    });
  }, [officialReceipts, historySearch, historyBlockFilter]);

  // Handle Request Duplicate Receipt
  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqUnit.trim() || !reqName.trim() || !reqPhone.trim()) {
      setReqError('Nomor Unit Rumah, Nama Pemohon, dan No. WhatsApp wajib diisi.');
      return;
    }
    setReqSubmitting(true);
    setReqError('');

    setTimeout(() => {
      setReqSubmitting(false);
      setReqSuccessModal(true);
    }, 600);
  };

  return (
    <div className="space-y-6 pb-16 font-sans">
      
      {/* ========================================================================= */}
      {/* 1. TOP STRIP & OFFICIAL VERIFIER STATUS                                   */}
      {/* ========================================================================= */}
      <div className="bg-primary-950 text-white text-[11px] py-2 px-4 -mx-4 sm:-mx-6 lg:-mx-8 rounded-b-2xl border-b border-primary-900/80 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5 max-w-7xl mx-auto w-full justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold tracking-tight">VALIDATOR RESMI KUITANSI DIGITAL (PAGUYUBAN WARGA RW 05)</span>
            <span className="hidden sm:inline opacity-40">•</span>
            <span className="hidden sm:inline text-primary-200">Enkripsi Integritas Dokumen SHA-256</span>
          </div>
          <div className="flex items-center gap-3 text-primary-200 font-mono text-[10px]">
            <span className="px-2 py-0.5 rounded bg-primary-900 text-emerald-300 font-bold border border-primary-800">
              Sertifikat Digital Aktif
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. HEADER TITLE & VALIDATOR OVERVIEW                                      */}
      {/* ========================================================================= */}
      <div className="pt-1">
        <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-mono font-bold uppercase tracking-wider border border-emerald-200">
          Portal Pelayanan Keabsahan Bukti Bayar
        </span>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-ink mt-1">
          Verifikasi Kuitansi Pembayaran Digital
        </h1>
        <p className="text-xs sm:text-sm text-ink-muted mt-1 max-w-2xl leading-relaxed">
          Pemeriksaan tanda terima iuran resmi, unduh salinan format PDF berstempel digital, dan cek arsip kuitansi paguyuban.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* 3. 4 SUBTABS NAVIGATION PILL BAR                                          */}
      {/* ========================================================================= */}
      <div className="bg-surface p-1.5 rounded-2xl border border-border shadow-2xs flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => handleTabChange('verify_receipt')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'verify_receipt'
              ? 'bg-primary-600 text-white shadow-xs'
              : 'text-ink-muted hover:text-ink hover:bg-canvas'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Validasi Kuitansi</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('receipts_history')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'receipts_history'
              ? 'bg-primary-600 text-white shadow-xs'
              : 'text-ink-muted hover:text-ink hover:bg-canvas'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Direktori Terbitan</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('request_receipt')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'request_receipt'
              ? 'bg-primary-600 text-white shadow-xs'
              : 'text-ink-muted hover:text-ink hover:bg-canvas'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Permohonan Salinan</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('security_guarantee')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'security_guarantee'
              ? 'bg-primary-600 text-white shadow-xs'
              : 'text-ink-muted hover:text-ink hover:bg-canvas'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Jaminan Keabsahan</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUBTAB 1: VERIFY RECEIPT (MAIN INSPECTOR)                                  */}
      {/* ========================================================================= */}
      {activeTab === 'verify_receipt' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Search Box & QR Scanner Bar */}
          <div className="bg-surface rounded-3xl p-6 sm:p-7 border border-border shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-ink">Cari Dokumen Kuitansi</h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  Masukkan nomor unit rumah (misal: A-17) atau nomor seri kuitansi resmi (misal: KWT-2026-08-A17).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setScannerActive(!scannerActive)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto ${
                  scannerActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-canvas hover:bg-primary-50 text-ink-muted hover:text-ink border border-border'
                }`}
              >
                <Scan className="w-4 h-4" />
                <span>{scannerActive ? 'Matikan Simulator Scanner' : 'Simulasi Kamera Scan QR'}</span>
              </button>
            </div>

            {/* Scanner Animation Simulator */}
            {scannerActive && (
              <div className="p-6 bg-primary-950 text-white rounded-2xl border border-primary-800 text-center relative overflow-hidden animate-in fade-in">
                <div className="w-36 h-36 border-2 border-dashed border-emerald-400 rounded-2xl mx-auto flex flex-col items-center justify-center relative shadow-inner">
                  <div className="w-full h-0.5 bg-emerald-400 absolute top-1/2 -translate-y-1/2 animate-pulse shadow-sm shadow-emerald-400" />
                  <QrCode className="w-16 h-16 text-emerald-400/80" />
                </div>
                <p className="text-xs font-mono text-emerald-300 mt-3">
                  Kamera aktif mendeteksi barcode kuitansi fisik...
                </p>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setScannerActive(false)}
                    className="px-3 py-1.5 bg-canvas/20 hover:bg-canvas/30 text-white font-bold text-xs rounded-xl transition-colors"
                  >
                    Tutup Scanner
                  </button>
                </div>
              </div>
            )}

            {/* Search Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handlePerformSearch();
              }}
              className="flex flex-col sm:flex-row gap-2.5"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Ketik Nomor Unit (A-17, B-04) atau No Seri Kuitansi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-canvas border border-border rounded-xl text-xs font-bold text-ink focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Periksa Keabsahan</span>
              </button>
            </form>
          </div>

          {/* Validated Receipt Digital Certificate Sheet */}
          {searched && activeReceipt && (
            <div className="bg-surface rounded-3xl p-6 sm:p-10 border border-border shadow-card space-y-7 animate-in fade-in">
              
              {/* Receipt Kop Surat Header */}
              <div className="border-b-2 border-border pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                    <Receipt className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider text-primary-800 bg-primary-50 px-2 py-0.5 rounded border border-primary-200">
                      Tanda Terima Resmi Paguyuban Warga
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-ink mt-1">
                      KUITANSI DIGITAL PEMBAYARAN IURAN
                    </h2>
                    <p className="text-xs text-ink-muted font-medium">
                      Komplek Taman Sejahtera • RW 05 / RT 01-04 • Bandung
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-start sm:items-end gap-1.5 self-start sm:self-auto">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-black shadow-2xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>LUNAS & TERVERIFIKASI</span>
                  </div>
                  <span className="text-[11px] font-mono text-ink-muted">
                    No. Seri: <strong className="text-ink">{activeReceipt.receiptNumber}</strong>
                  </span>
                </div>
              </div>

              {/* Resident & Transaction Metadata Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-canvas rounded-2xl border border-border space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-ink-muted block border-b border-border/60 pb-1">
                    Identitas Pembayar:
                  </span>
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Nomor Unit Rumah:</span>
                    <span className="font-mono font-black text-primary-700 text-sm">{activeReceipt.propertyCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Wilayah / Cluster:</span>
                    <span className="font-bold text-ink">{activeReceipt.blockName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Nama Warga / Pemilik:</span>
                    <span className="font-bold text-ink">{activeReceipt.residentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-muted">No. WhatsApp:</span>
                    <span className="font-mono text-ink-muted">{activeReceipt.phoneMasked}</span>
                  </div>
                </div>

                <div className="p-4 bg-canvas rounded-2xl border border-border space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-ink-muted block border-b border-border/60 pb-1">
                    Detail Pembayaran & Validasi:
                  </span>
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Periode Tagihan:</span>
                    <span className="font-bold text-primary-700">{activeReceipt.period}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Waktu Transaksi:</span>
                    <span className="font-mono text-ink">{activeReceipt.paidAt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Metode Setoran:</span>
                    <span className="font-semibold text-ink">{activeReceipt.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Ref. Sistem:</span>
                    <span className="font-mono text-ink">{activeReceipt.refNumber}</span>
                  </div>
                </div>
              </div>

              {/* Breakdown Table */}
              <div className="border border-border rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-canvas border-b border-border text-ink-muted font-bold text-[11px]">
                      <th className="py-3 px-4">No</th>
                      <th className="py-3 px-4">Komponen Layanan Lingkungan</th>
                      <th className="py-3 px-4 text-right">Jumlah Biaya</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {activeReceipt.components.map((c, idx) => (
                      <tr key={idx} className="hover:bg-canvas/40 transition-colors">
                        <td className="py-3 px-4 font-mono text-ink-muted">{idx + 1}</td>
                        <td className="py-3 px-4 font-medium text-ink">{c.name}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-ink">
                          {formatRupiah(c.amount)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-primary-50/60 font-black">
                      <td colSpan={2} className="py-3.5 px-4 text-primary-950 text-right uppercase tracking-wider">
                        Total Iuran Disetor (Lunas):
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-sm text-primary-950">
                        {formatRupiah(activeReceipt.amount)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Digital Stamp & Signatures */}
              <div className="p-5 rounded-2xl bg-canvas border border-border flex flex-col sm:flex-row items-center justify-between gap-6">
                {/* Digital Stamp Graphic */}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full border-4 border-double border-emerald-600 flex flex-col items-center justify-center text-emerald-800 text-center p-1 font-bold rotate-[-6deg] select-none shadow-xs">
                    <span className="text-[7px] uppercase tracking-wider font-black">PAGUYUBAN WARGA</span>
                    <span className="text-xs font-black tracking-tight my-0.5">LUNAS</span>
                    <span className="text-[7px] font-mono font-bold">RW 05 SEJAHTERA</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-ink">Disahkan secara Elektronik</p>
                    <p className="text-[11px] text-ink-muted">Petugas Verifikator:</p>
                    <p className="text-xs font-bold text-primary-800">{activeReceipt.verifiedBy}</p>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold block mt-0.5">
                      ✓ Validated on {activeReceipt.verifiedAt}
                    </span>
                  </div>
                </div>

                {/* QR Code Seal */}
                <div className="flex items-center gap-3 self-center sm:self-auto bg-surface p-2.5 rounded-2xl border border-border shadow-2xs">
                  <div className="w-14 h-14 bg-canvas rounded-xl flex items-center justify-center p-1 border border-border">
                    <QrCode className="w-full h-full text-ink" />
                  </div>
                  <div className="text-[11px] space-y-0.5">
                    <span className="font-bold text-ink block">Segel Keaslian Dokumen</span>
                    <span className="text-ink-muted block text-[10px]">Pindai untuk memeriksa legalitas</span>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 min-w-[160px] py-3 bg-primary-600 hover:bg-primary-700 active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center justify-center gap-2 transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Dokumen (PDF)</span>
                </button>

                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `🧾 *Kuitansi Pembayaran Digital Resmi WargaHub*\n\nNomor: ${activeReceipt.receiptNumber}\nUnit: ${activeReceipt.propertyCode} (${activeReceipt.residentName})\nPeriode: ${activeReceipt.period}\nTotal: ${formatRupiah(activeReceipt.amount)}\nStatus: LUNAS & TERVERIFIKASI RESMI\n\nPeriksa dokumen asli di:\nhttp://localhost:4321/kuitansi?q=${activeReceipt.receiptNumber}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[160px] py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center justify-center gap-2 transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Bagikan ke WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopyVerificationLink}
                  className="px-4 py-3 bg-canvas hover:bg-surface border border-border active:scale-[0.98] text-ink font-bold text-xs rounded-xl inline-flex items-center gap-1.5 transition-all shadow-2xs"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-ink-muted" />}
                  <span>{copiedLink ? 'Tautan Disalin!' : 'Salin Tautan'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Initial State / Guidance Card when not searched yet */}
          {!searched && !activeReceipt && (
            <div className="bg-surface rounded-3xl p-8 sm:p-10 border border-border shadow-card text-center space-y-4 animate-in fade-in">
              <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 mx-auto flex items-center justify-center border border-primary-200">
                <Receipt className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-ink">Periksa Keaslian Dokumen Kuitansi</h3>
                <p className="text-xs text-ink-muted max-w-md mx-auto leading-relaxed">
                  Masukkan nomor unit rumah atau nomor seri kuitansi resmi paguyuban pada kolom pencarian di atas untuk memverifikasi keabsahan tanda terima digital.
                </p>
              </div>
              <div className="pt-2 flex flex-wrap justify-center gap-2 text-xs text-ink-muted">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-canvas border border-border">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Terintegrasi Sistem Kas Paguyuban
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-canvas border border-border">
                  <Check className="w-3.5 h-3.5 text-primary-600" />
                  Anti Pemalsuan & Valid Real-Time
                </span>
              </div>
            </div>
          )}

          {/* Not Found State */}
          {searched && !activeReceipt && (
            <div className="bg-surface rounded-3xl p-8 sm:p-10 border border-border shadow-card text-center space-y-4 animate-in fade-in">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center border border-amber-200">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-ink">Dokumen Kuitansi Tidak Ditemukan</h3>
                <p className="text-xs text-ink-muted max-w-md mx-auto leading-relaxed">
                  Tidak ada kuitansi pembayaran resmi yang terdaftar dengan kata kunci &quot;<strong className="text-ink">{searchQuery}</strong>&quot;.
                </p>
              </div>
              <div className="pt-2 flex flex-wrap justify-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearched(false);
                  }}
                  className="px-3.5 py-2 bg-primary-50 text-primary-700 font-bold rounded-xl border border-primary-200 hover:bg-primary-100 transition-colors"
                >
                  Reset Pencarian
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('request_receipt')}
                  className="px-3.5 py-2 bg-canvas text-ink font-bold rounded-xl border border-border hover:bg-surface transition-colors"
                >
                  Ajukan Permohonan Kuitansi Baru →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 2: RECEIPTS HISTORY & DIRECTORY                                     */}
      {/* ========================================================================= */}
      {activeTab === 'receipts_history' && (
        <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-6 animate-in fade-in">
          <div className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary-800 bg-primary-50 px-2 py-0.5 rounded-md border border-primary-200">
                Arsip Terbitan Digital
              </span>
              <h2 className="text-xl font-black text-ink mt-1">
                Direktori Kuitansi Resmi Terverifikasi
              </h2>
              <p className="text-xs text-ink-muted mt-0.5">
                Daftar kuitansi sah yang telah diterbitkan bendahara untuk periode Agustus 2026.
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-canvas px-3 py-1.5 rounded-xl border border-border text-ink self-start sm:self-auto">
              {filteredHistory.length} Kuitansi Sah
            </span>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Cari nomor kuitansi, nama warga, atau no rumah..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-canvas border border-border rounded-xl text-xs font-medium text-ink focus:outline-hidden focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {['ALL', 'A', 'B', 'C', 'D', 'KAV'].map((blk) => (
                <button
                  key={blk}
                  type="button"
                  onClick={() => setHistoryBlockFilter(blk)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                    historyBlockFilter === blk
                      ? 'bg-primary-600 text-white shadow-xs'
                      : 'bg-canvas text-ink-muted hover:text-ink border border-border'
                  }`}
                >
                  {blk === 'ALL' ? 'Semua Blok' : `Blok ${blk}`}
                </button>
              ))}
            </div>
          </div>

          {/* History Table */}
          <div className="border border-border rounded-2xl overflow-hidden overflow-x-auto text-xs shadow-2xs">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-canvas text-ink-muted font-bold text-[11px]">
                  <th className="py-3.5 px-4">No. Kuitansi</th>
                  <th className="py-3.5 px-4">Unit & Warga</th>
                  <th className="py-3.5 px-4">Periode</th>
                  <th className="py-3.5 px-4">Metode Bayar</th>
                  <th className="py-3.5 px-4 text-right">Nominal</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 px-4 text-center text-ink-muted">
                      <div className="w-12 h-12 rounded-2xl bg-canvas border border-border flex items-center justify-center mx-auto mb-3 text-ink-muted">
                        <Receipt className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-ink text-sm">Belum Ada Kuitansi Resmi Diterbitkan</p>
                      <p className="text-xs text-ink-muted mt-1 max-w-sm mx-auto">
                        Kuitansi resmi akan tercatat di arsip ini secara otomatis setelah pembayaran iuran warga diverifikasi oleh bendahara.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((rec) => (
                    <tr key={rec.id} className="hover:bg-canvas/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-primary-700">
                        {rec.receiptNumber}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-ink block">{rec.residentName}</span>
                        <span className="text-[10px] text-ink-muted font-mono">{rec.propertyCode} • {rec.blockName.split(' ')[0]} {rec.blockName.split(' ')[1]}</span>
                      </td>

                      <td className="py-3.5 px-4 text-ink font-semibold">
                        {rec.period}
                      </td>

                      <td className="py-3.5 px-4 text-ink-muted">
                        {rec.paymentMethod}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-black text-ink">
                        {formatRupiah(rec.amount)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <Check className="w-3 h-3 text-emerald-600" />
                          Terbit
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveReceipt(rec);
                            setSearchQuery(rec.propertyCode);
                            handleTabChange('verify_receipt');
                          }}
                          className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 active:scale-[0.98] text-white font-bold rounded-lg text-[11px] shadow-2xs transition-colors"
                        >
                          Buka Kuitansi →
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 3: REQUEST RECEIPT DUPLICATE FORM                                  */}
      {/* ========================================================================= */}
      {activeTab === 'request_receipt' && (
        <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-6 animate-in fade-in">
          <div className="border-b border-border pb-4 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Layanan Salinan & Dokumen Reimburse
              </span>
              <h2 className="text-xl font-black text-ink mt-1">
                Permohonan Salinan Kuitansi Resmi
              </h2>
              <p className="text-xs text-ink-muted mt-0.5">
                Bagi warga yang memerlukan salinan kuitansi stempel basah atau berkas digital untuk reimburse kantor.
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
              <FileCheck className="w-6 h-6" />
            </div>
          </div>

          {reqError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{reqError}</span>
            </div>
          )}

          <form onSubmit={handleRequestSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-ink mb-1.5">Nomor Unit Rumah (Blok & Nomor):</label>
                <input
                  type="text"
                  placeholder="Contoh: A-17, B-04, C-11"
                  value={reqUnit}
                  onChange={(e) => setReqUnit(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-canvas border border-border rounded-xl text-xs font-bold text-ink focus:ring-2 focus:ring-primary-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-ink mb-1.5">Nama Kepala Keluarga / Pemohon:</label>
                <input
                  type="text"
                  placeholder="Nama sesuai data kependudukan komplek"
                  value={reqName}
                  onChange={(e) => setReqName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-canvas border border-border rounded-xl text-xs font-bold text-ink focus:ring-2 focus:ring-primary-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-ink mb-1.5">Periode Tagihan yang Diminta:</label>
                <select
                  value={reqPeriod}
                  onChange={(e) => setReqPeriod(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
                >
                  <option value="Agustus 2026">Agustus 2026 (Bulan Berjalan)</option>
                  <option value="Juli 2026">Juli 2026</option>
                  <option value="Juni 2026">Juni 2026</option>
                  <option value="Semua Riwayat (6 Bulan Terakhir)">Semua Riwayat (6 Bulan Terakhir)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-ink mb-1.5">Keperluan Permohonan Salinan:</label>
                <select
                  value={reqPurpose}
                  onChange={(e) => setReqPurpose(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
                >
                  <option value="Reimburse Kantor / Perusahaan">Reimburse Kantor / Fasilitas Tempat Kerja</option>
                  <option value="Kelengkapan Berkas KPR / Notaris">Kelengkapan Berkas KPR / Balik Nama Notaris</option>
                  <option value="Arsip Keuangan Keluarga">Arsip Pribadi & Rekonsiliasi Iuran Keluarga</option>
                  <option value="Kuitansi Asli Hilang / Rusak">Kuitansi Fisik Rusak atau Hilang</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-ink mb-1.5">Nomor WhatsApp Pengiriman Dokumen:</label>
                <input
                  type="text"
                  placeholder="Contoh: 081234567890"
                  value={reqPhone}
                  onChange={(e) => setReqPhone(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-canvas border border-border rounded-xl text-xs font-bold text-ink font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-ink mb-1.5">Alamat Email (Opsional untuk PDF):</label>
                <input
                  type="email"
                  placeholder="nama@email.com"
                  value={reqEmail}
                  onChange={(e) => setReqEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-canvas border border-border rounded-xl text-xs font-medium text-ink"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-ink mb-1.5">Catatan Tambahan / Format Stempel Khusus:</label>
              <textarea
                rows={2}
                placeholder="Contoh: Mohon cantumkan nama instansi PT Maju Mundur pada kuitansi..."
                value={reqNotes}
                onChange={(e) => setReqNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-canvas border border-border rounded-xl text-xs font-medium text-ink"
              />
            </div>

            <button
              type="submit"
              disabled={reqSubmitting}
              className="w-full py-3.5 px-4 bg-primary-600 hover:bg-primary-700 active:scale-[0.98] disabled:opacity-50 text-white font-bold rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 text-sm"
            >
              {reqSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Kirim Permohonan Salinan ke Bendahara</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 4: SECURITY GUARANTEE & DIGITAL SEAL POLICIES                       */}
      {/* ========================================================================= */}
      {activeTab === 'security_guarantee' && (
        <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-6 animate-in fade-in">
          <div className="border-b border-border pb-4 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary-800 bg-primary-50 px-2 py-0.5 rounded-md border border-primary-200">
                Standar Keamanan Dokumen Digital
              </span>
              <h2 className="text-xl font-black text-ink mt-1">
                4 Pilar Integritas Kuitansi WargaHub
              </h2>
              <p className="text-xs text-ink-muted mt-0.5">
                Bagaimana sistem melindungi warga dari kuitansi palsu atau duplikasi iuran tidak sah.
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-canvas border border-border flex items-center justify-center text-primary-700 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-5 rounded-2xl bg-canvas border border-border space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center font-bold">
                  <Lock className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-ink">1. Nomor Seri Kriptografis Unik</h4>
              </div>
              <p className="text-ink-muted leading-relaxed">
                Setiap lembar kuitansi memiliki ID serial unik berformat <code className="font-mono text-primary-700">KWT-YYYY-MM-[UNIT]</code> yang terindeks langsung di database PostgreSQL dan tidak dapat diduplikasi.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-canvas border border-border space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <QrCode className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-ink">2. Validasi Dua Arah QR Code</h4>
              </div>
              <p className="text-ink-muted leading-relaxed">
                QR code yang tercetak pada kuitansi fisik maupun PDF dapat dipindai oleh siapa saja untuk langsung menampilkan status keabsahan di situs resmi WargaHub.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-canvas border border-border space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-ink">3. Audit Trail & Stempel Waktu ISO</h4>
              </div>
              <p className="text-ink-muted leading-relaxed">
                Waktu verifikasi kuitansi dicatat hingga presisi detik dan nama petugas verifikator (bendahara RW) tercatat permanen di riwayat sistem audit.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-canvas border border-border space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  <FileCheck className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-ink">4. Otoritas Tunggal Penerbitan</h4>
              </div>
              <p className="text-ink-muted leading-relaxed">
                Hanya bendahara kas paguyuban dan ketua RW terautentikasi yang memiliki hak penerbitan status lunas setelah mencocokkan mutasi bank rekening BCA.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. REQUEST DUPLICATE SUCCESS MODAL                                        */}
      {/* ========================================================================= */}
      {reqSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-border shadow-modal space-y-4 text-center">
            <div className="w-14 h-14 rounded-3xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-black text-ink">Permohonan Kuitansi Terkirim!</h3>
              <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                Permohonan salinan kuitansi untuk unit <strong>{reqUnit}</strong> ({reqName}) periode <strong>{reqPeriod}</strong> telah diteruskan ke bendahara komplek.
              </p>
            </div>

            <div className="p-3.5 bg-canvas rounded-2xl border border-border text-left text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-ink-muted">Keperluan:</span>
                <span className="font-bold text-ink">{reqPurpose}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Tujuan WhatsApp:</span>
                <span className="font-mono font-bold text-primary-700">{reqPhone}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <a
                href={`https://api.whatsapp.com/send?phone=6281234567802&text=${encodeURIComponent(
                  `Halo Bendahara Komplek, saya mengajukan permohonan salinan kuitansi resmi via WargaHub:\n- Unit: ${reqUnit}\n- Nama: ${reqName}\n- Periode: ${reqPeriod}\n- Keperluan: ${reqPurpose}\nMohon dikirimkan filenya ke nomor ini. Terima kasih.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Hubungi Bendahara via WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  setReqSuccessModal(false);
                  setReqUnit('');
                  setReqName('');
                  setReqPhone('');
                  setReqEmail('');
                  setReqNotes('');
                }}
                className="w-full py-2.5 bg-canvas hover:bg-surface border border-border text-ink font-bold text-xs rounded-xl transition-colors"
              >
                Tutup Jendela
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
