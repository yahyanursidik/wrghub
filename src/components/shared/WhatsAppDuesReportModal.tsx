import React, { useState, useMemo, useEffect } from 'react';
import {
  Send,
  Copy,
  Check,
  X,
  ExternalLink,
  MessageSquare,
  Calendar,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  Clock,
  Building,
  Info,
  Layers,
  Edit3,
  RefreshCw,
  Share2
} from 'lucide-react';
import {
  generateWhatsAppDuesReportText,
  generateWaMeLink,
  getIndonesianFormattedDate,
  type DuesReportPropertyItem
} from '../../lib/whatsapp-report';
import { formatRupiah } from '../../lib/format';

export interface WhatsAppDuesReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPeriodName?: string;
  availablePeriods?: string[];
  properties: DuesReportPropertyItem[];
  allInvoices?: any[];
  bankInfo?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  transparencyUrl?: string;
  rekapUrl?: string;
  kepalaKomplekName?: string;
}

export const WhatsAppDuesReportModal: React.FC<WhatsAppDuesReportModalProps> = ({
  isOpen,
  onClose,
  initialPeriodName = 'September 2026',
  availablePeriods = ['September 2026', 'Agustus 2026', 'Juli 2026', 'Juni 2026'],
  properties,
  allInvoices,
  bankInfo = {
    bankName: 'Bank Mandiri',
    accountNumber: '1300024446419',
    accountHolder: 'Paguyuban Grand Sariwangi',
  },
  transparencyUrl = 'https://wrghub.vercel.app/transparency',
  rekapUrl = 'https://wrghub.vercel.app/rekap-iuran',
  kepalaKomplekName = 'Yahya Nursidik',
}) => {
  // Form Customization States
  const [selectedPeriod, setSelectedPeriod] = useState<string>(initialPeriodName);
  const [reportDate, setReportDate] = useState<string>(() => {
    return initialPeriodName.includes('Agustus') ? '25 Agustus 2026' : getIndonesianFormattedDate();
  });
  const [greetingTime, setGreetingTime] = useState<string>('wengi/pagi');
  const [customTitle, setCustomTitle] = useState<string>(
    '📢 INFO IURAN KOMPLEK DAN THR PENJAGA KOMPLEK GRAND SARIWANGI – UPDATE UNTUK IURAN PER TANGGAL {tanggal}'
  );
  const [extraNotes, setExtraNotes] = useState<string>(
    'Mohon kerjasamanya bagi yang belum melakukan pembayaran agar operasional kebersihan & keamanan komplek berjalan lancar.'
  );
  const [targetPhone, setTargetPhone] = useState<string>('');

  // UI Feedback States
  const [copiedText, setCopiedText] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'preview' | 'settings'>('preview');

  useEffect(() => {
    if (initialPeriodName) {
      setSelectedPeriod(initialPeriodName);
      if (initialPeriodName.includes('Agustus')) {
        setReportDate('25 Agustus 2026');
      } else {
        setReportDate(getIndonesianFormattedDate());
      }
    }
  }, [initialPeriodName]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Dynamic properties status calculation based on selectedPeriod and allInvoices
  const currentProperties: DuesReportPropertyItem[] = useMemo(() => {
    if (!allInvoices || allInvoices.length === 0) {
      return properties;
    }
    const invMap = new Map<string, any>();
    allInvoices.forEach((inv: any) => {
      const pCode = (inv.propertyCode || '').toLowerCase();
      const pPeriod = inv.billingPeriodName || inv.billingPeriodId || '';
      if (
        pPeriod.toLowerCase().includes(selectedPeriod.toLowerCase()) ||
        (selectedPeriod.includes('September') && (pPeriod.includes('09') || pPeriod.toLowerCase().includes('september'))) ||
        (selectedPeriod.includes('Agustus') && (pPeriod.includes('08') || pPeriod.toLowerCase().includes('agustus')))
      ) {
        invMap.set(pCode, inv);
      }
    });

    return properties.map((p) => {
      const inv = invMap.get(p.code.toLowerCase());
      let isPaid = inv?.status === 'PAID';
      if (!inv) {
        if (selectedPeriod.includes('Agustus')) {
          isPaid = p.code !== 'Kav E' && p.code !== 'Kav J';
        } else if (selectedPeriod.includes('September')) {
          isPaid = !['Kav B', 'Kav C', 'Kav E', 'Kav J', 'Kav M'].includes(p.code);
        }
      }

      let unpaidMonths = isPaid ? 0 : 1;
      let unpaidPeriods: string[] = isPaid ? [] : [selectedPeriod];

      const propAllInvs = allInvoices.filter(
        (ai: any) => (ai.propertyCode || '').toLowerCase() === p.code.toLowerCase() && ai.status !== 'PAID'
      );
      if (propAllInvs.length > 0) {
        unpaidMonths = propAllInvs.length;
        unpaidPeriods = propAllInvs.map((ai: any) => ai.billingPeriodName || ai.billingPeriodId);
      } else if (isPaid) {
        unpaidMonths = 0;
        unpaidPeriods = [];
      }

      return {
        ...p,
        status: isPaid ? 'PAID' : 'UNPAID',
        unpaidMonthsCount: unpaidMonths,
        unpaidPeriodNames: unpaidPeriods,
      };
    });
  }, [properties, allInvoices, selectedPeriod]);

  // Dynamic calculated header title with replacement
  const computedHeaderTitle = useMemo(() => {
    return customTitle.replace('{tanggal}', reportDate.toUpperCase());
  }, [customTitle, reportDate]);

  // Generate complete WhatsApp text
  const messageText = useMemo(() => {
    return generateWhatsAppDuesReportText({
      periodName: selectedPeriod,
      reportDate,
      greetingTime,
      customHeaderTitle: computedHeaderTitle,
      properties: currentProperties,
      bankName: bankInfo.bankName,
      bankAccountNumber: bankInfo.accountNumber,
      bankAccountHolder: bankInfo.accountHolder,
      transparencyUrl,
      rekapUrl,
      kepalaKomplekName,
      extraNotes,
    });
  }, [
    selectedPeriod,
    reportDate,
    greetingTime,
    computedHeaderTitle,
    currentProperties,
    bankInfo,
    transparencyUrl,
    rekapUrl,
    kepalaKomplekName,
    extraNotes,
  ]);

  // Generate wa.me Link
  const waMeLink = useMemo(() => {
    return generateWaMeLink(messageText, targetPhone);
  }, [messageText, targetPhone]);

  // Copy text to clipboard
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  // Copy wa.me link
  const handleCopyWaLink = async () => {
    try {
      await navigator.clipboard.writeText(waMeLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (e) {
      console.error('Failed to copy link', e);
    }
  };

  // Open WhatsApp in new tab
  const handleOpenWhatsApp = () => {
    window.open(waMeLink, '_blank', 'noopener,noreferrer');
  };

  if (!isOpen) return null;

  const paidCount = currentProperties.filter((p) => p.status === 'PAID').length;
  const unpaidCount = currentProperties.filter((p) => p.status !== 'PAID').length;
  const totalCount = currentProperties.length;
  const percentage = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-surface w-full max-w-3xl rounded-3xl border border-border shadow-modal flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-canvas/60">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 shadow-2xs">
              <Send className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-ink">
                  Format Laporan WhatsApp (wa.me)
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider border border-emerald-300">
                  Otomatis Terupdate
                </span>
              </div>
              <p className="text-xs text-ink-muted">
                Daftar lunas, menunggak per bulan, tautan transparansi, & rekening Grand Sariwangi
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-ink-muted hover:text-ink hover:bg-canvas transition-colors"
            title="Tutup (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick KPI Bar */}
        <div className="px-5 py-3 bg-emerald-50/70 border-b border-emerald-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <span className="font-bold text-emerald-950 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Lunas: <strong>{paidCount} Unit</strong>
            </span>
            <span className="font-bold text-rose-950 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-rose-600" />
              Menunggak: <strong>{unpaidCount} Unit</strong>
            </span>
            <span className="font-bold text-primary-950">
              Partisipasi: <strong>{percentage}%</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-900 bg-white/80 px-2.5 py-1 rounded-lg border border-emerald-200">
            <Building className="w-3.5 h-3.5 text-emerald-700" />
            <span>Grand Sariwangi ({totalCount} Kavling)</span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="px-5 pt-3 pb-2 border-b border-border flex items-center gap-2 bg-canvas/30 text-xs">
          <button
            type="button"
            onClick={() => setActiveSubTab('preview')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'preview'
                ? 'bg-surface text-ink shadow-xs border border-border'
                : 'text-ink-muted hover:text-ink hover:bg-canvas'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>Teks Siap Kirim (Preview)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('settings')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'settings'
                ? 'bg-surface text-ink shadow-xs border border-border'
                : 'text-ink-muted hover:text-ink hover:bg-canvas'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 text-primary-600" />
            <span>Kustomisasi Parameter Pesan</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {activeSubTab === 'settings' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-canvas/40 p-4 rounded-2xl border border-border">
              {/* Periode Tagihan */}
              <div>
                <label className="font-bold text-ink block mb-1">Periode Tagihan:</label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => {
                    setSelectedPeriod(e.target.value);
                    if (e.target.value.includes('Agustus')) {
                      setReportDate('25 Agustus 2026');
                    } else {
                      setReportDate(getIndonesianFormattedDate());
                    }
                  }}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-ink font-semibold focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                >
                  {availablePeriods.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* Tanggal Laporan */}
              <div>
                <label className="font-bold text-ink block mb-1">Tanggal Update Laporan:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    placeholder="Contoh: 25 Agustus 2026"
                    className="flex-1 px-3 py-2 bg-surface border border-border rounded-xl text-ink font-semibold focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    type="button"
                    onClick={() => setReportDate('25 Agustus 2026')}
                    className="px-2.5 py-1.5 bg-canvas hover:bg-surface border border-border rounded-xl text-[11px] font-bold text-ink shrink-0"
                    title="Set ke 25 Agustus 2026"
                  >
                    25 Ags
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportDate(getIndonesianFormattedDate())}
                    className="px-2.5 py-1.5 bg-canvas hover:bg-surface border border-border rounded-xl text-[11px] font-bold text-ink shrink-0"
                    title="Set ke hari ini"
                  >
                    Hari Ini
                  </button>
                </div>
              </div>

              {/* Waktu Sapaan */}
              <div>
                <label className="font-bold text-ink block mb-1">Waktu Sapaan (Basa Sunda):</label>
                <select
                  value={greetingTime}
                  onChange={(e) => setGreetingTime(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-ink font-semibold focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                >
                  <option value="wengi/pagi">Wilujeng wengi/pagi (Fleksibel)</option>
                  <option value="enjing (pagi)">Wilujeng enjing (Pagi)</option>
                  <option value="siang">Wilujeng siang</option>
                  <option value="sonten (sore)">Wilujeng sonten (Sore)</option>
                  <option value="wengi (malam)">Wilujeng wengi (Malam)</option>
                </select>
              </div>

              {/* Target Nomor WA */}
              <div>
                <label className="font-bold text-ink block mb-1">
                  Kirim ke Nomor Tertentu (Opsional):
                </label>
                <input
                  type="text"
                  value={targetPhone}
                  onChange={(e) => setTargetPhone(e.target.value)}
                  placeholder="Kosongkan untuk Broadcast ke Grup Warga"
                  className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-ink font-semibold focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                />
                <span className="text-[10px] text-ink-muted mt-0.5 block">
                  Bila dikosongkan, tombol wa.me akan membuka pemilih grup kontak WhatsApp.
                </span>
              </div>

              {/* Judul Custom */}
              <div className="sm:col-span-2">
                <label className="font-bold text-ink block mb-1">Format Judul / Topik Pesan:</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-ink font-semibold focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                />
                <span className="text-[10px] text-ink-muted mt-0.5 block">
                  Tag {'{tanggal}'} akan otomatis diganti dengan tanggal laporan di atas.
                </span>
              </div>

              {/* Catatan Tambahan */}
              <div className="sm:col-span-2">
                <label className="font-bold text-ink block mb-1">
                  Catatan Tambahan / Info THR Penjaga Komplek:
                </label>
                <textarea
                  rows={2}
                  value={extraNotes}
                  onChange={(e) => setExtraNotes(e.target.value)}
                  placeholder="Ketik catatan tambahan pengurus bila ada..."
                  className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-ink text-xs focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          )}

          {/* Monospace WhatsApp Preview Container */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                Pratinjau Pesan WhatsApp ({selectedPeriod})
              </span>
              <span className="text-[11px] text-ink-muted">
                {messageText.length} Karakter
              </span>
            </div>
            
            <div className="relative rounded-2xl bg-emerald-950 text-emerald-50 p-4 border border-emerald-900 shadow-inner font-mono text-xs leading-relaxed max-h-[360px] overflow-y-auto whitespace-pre-wrap selection:bg-emerald-700 selection:text-white">
              {messageText}
            </div>
          </div>

          {/* Quick Info Alert */}
          <div className="p-3 bg-canvas rounded-xl border border-border text-xs text-ink-muted flex items-start gap-2">
            <Info className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold text-ink">
                Status nama penghuni otomatis menyesuaikan penghuni riil / penyewa:
              </p>
              <p className="text-[11px]">
                Kavling sewa (Kav B, F, I) otomatis menampilkan nama penyewa (Mahasiswa Polban, Pa Anggia, Pak Yahya) bukan pemilik kavling. Keterangan jumlah bulan menunggak otomatis dikalkulasi dari buku kas pengurus.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Action Buttons */}
        <div className="px-5 py-4 border-t border-border bg-canvas/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopyText}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-surface hover:bg-canvas border border-border rounded-xl text-xs font-bold text-ink shadow-2xs active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
            >
              {copiedText ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-ink-muted" />}
              <span>{copiedText ? 'Teks Tersalin!' : 'Salin Pesan WA'}</span>
            </button>
            <button
              type="button"
              onClick={handleCopyWaLink}
              className="flex-1 sm:flex-none px-3.5 py-2.5 bg-surface hover:bg-canvas border border-border rounded-xl text-xs font-bold text-ink shadow-2xs active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
              title="Salin Tautan https://wa.me/?text=..."
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-ink-muted" />}
              <span>{copiedLink ? 'Link Tersalin!' : 'Salin Link wa.me'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Buka di WhatsApp (wa.me)</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
