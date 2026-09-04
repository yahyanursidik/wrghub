import React, { useState, useMemo, useEffect } from 'react';
import {
  PlusCircle,
  Send,
  CheckCircle2,
  AlertTriangle,
  Search,
  Printer,
  Calendar,
  FileText,
  Check,
  Download,
  Share2,
  Copy,
  ExternalLink,
  Edit3,
  Trash2,
  Building,
  ShieldCheck,
  CreditCard,
  Layers,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Filter,
  Eye,
  X,
  Clock,
  Sparkles,
  QrCode,
  DollarSign,
  TrendingUp,
  Receipt,
  Users,
  CheckSquare,
  Settings
} from 'lucide-react';
import { formatRupiah } from '../../lib/format';
import { ReceiptModal } from '../shared/ReceiptModal';

interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  propertyId: string;
  propertyCode: string;
  areaLabel?: string;
  ownerName?: string;
  billingPeriodId?: string;
  billingPeriodName?: string;
  securityFee?: number;
  cleaningFee?: number;
  sinkingFund?: number;
  additionalFee?: number;
  status: string; // 'PAID' | 'UNPAID' | 'PENDING_VERIFICATION' | 'VOID'
  total: number;
  paidAmount: number;
  dueDate: string;
  issuedAt: string;
  paidAt: string | null;
  notes?: string;
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

export interface TariffComponent {
  id: string;
  name: string;
  fee: number;
  desc: string;
}

const DEFAULT_TARIFF_COMPONENTS: TariffComponent[] = [
  { id: 'tf-1', name: '1. Iuran Pengamanan Pos Satpam 24 Jam', fee: 150000, desc: 'Operasional pos satpam, barrier gate RFID, HT, dan pemantauan keamanan' },
  { id: 'tf-2', name: '2. Iuran Pengangkutan Sampah & Kebersihan', fee: 50000, desc: 'Armada pengangkutan sampah dinas LH dan pemotongan rumput berkala' },
  { id: 'tf-3', name: '3. Dana Kas Operasional & Perawatan Komplek', fee: 50000, desc: 'Penerangan jalan PJU, genset darurat, dan sarana balai warga' },
];

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
  const [activeSubTab, setActiveSubTab] = useState<'invoices' | 'batch' | 'tariffs' | 'public_ledger'>('invoices');
  const [invoices, setInvoices] = useState<InvoiceItem[]>(initialInvoices || []);
  const [progress, setProgress] = useState<BillingProgress>(initialProgress);

  useEffect(() => {
    setInvoices(initialInvoices || []);
  }, [initialInvoices]);

  useEffect(() => {
    setProgress(initialProgress);
  }, [initialProgress]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'UNPAID' | 'PENDING'>('ALL');
  const [areaFilter, setAreaFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'code' | 'invoice' | 'total' | 'status' | 'due' | 'paidAt'>('code');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Tariff Structure State (Editable & Persisted)
  const [tariffComponents, setTariffComponents] = useState<TariffComponent[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('wargahub_tariff_components');
        if (saved) {
          const parsed = JSON.parse(saved);
          const total = parsed.reduce((a: number, b: any) => a + (Number(b.fee) || 0), 0);
          if (total === 750000) {
            localStorage.setItem('wargahub_tariff_components', JSON.stringify(DEFAULT_TARIFF_COMPONENTS));
            return DEFAULT_TARIFF_COMPONENTS;
          }
          return parsed;
        }
      } catch (e) {}
    }
    return DEFAULT_TARIFF_COMPONENTS;
  });

  const [tariffNote, setTariffNote] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('wargahub_tariff_note') || 'Tarif iuran standar disepakati bersama dalam Musyawarah Warga RT 05 / RW 05';
    }
    return 'Tarif iuran standar disepakati bersama dalam Musyawarah Warga RT 05 / RW 05';
  });

  const [showTariffModal, setShowTariffModal] = useState(false);
  const [editableTariffs, setEditableTariffs] = useState<TariffComponent[]>(DEFAULT_TARIFF_COMPONENTS);
  const [editableTariffNote, setEditableTariffNote] = useState(tariffNote);

  const totalTariff = useMemo(() => {
    return tariffComponents.reduce((acc, item) => acc + (Number(item.fee) || 0), 0);
  }, [tariffComponents]);

  // Modal & Toast State
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPublicModal, setShowPublicModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateMsg, setGenerateMsg] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState<InvoiceItem | null>(null);
  const [deleteReason, setDeleteReason] = useState('Kesalahan Input / Keringanan Pengurus');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Generate batch form state
  const [genYear, setGenYear] = useState(2026);
  const [genMonth, setGenMonth] = useState(9);
  const [genDueDate, setGenDueDate] = useState('2026-09-10');
  const [genFee, setGenFee] = useState(250000);

  // Single Invoice Form State
  const [formHouseCode, setFormHouseCode] = useState('A-17');
  const [formAreaLabel, setFormAreaLabel] = useState('Blok A');
  const [formOwnerName, setFormOwnerName] = useState('Budi Santoso');
  const [formPeriodName, setFormPeriodName] = useState(initialPeriodName);
  const [formSecurityFee, setFormSecurityFee] = useState(150000);
  const [formCleaningFee, setFormCleaningFee] = useState(50000);
  const [formSinkingFund, setFormSinkingFund] = useState(50000);
  const [formAdditionalFee, setFormAdditionalFee] = useState(0);
  const [formDueDate, setFormDueDate] = useState('2026-08-10');
  const [formStatus, setFormStatus] = useState<'PAID' | 'UNPAID' | 'PENDING_VERIFICATION'>('UNPAID');
  const [formNotes, setFormNotes] = useState('');
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [savingInvoice, setSavingInvoice] = useState(false);

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Generate Batch
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
        showToast(`Tagihan massal periode ${periodName} berhasil dibuat.`);
        setTimeout(() => {
          setShowGenerateModal(false);
          setGenerateMsg('');
        }, 1500);
      } else {
        setGenerateMsg(data.error?.message || 'Gagal membuat tagihan.');
      }
    } catch (err: any) {
      setGenerateMsg('Gagal terhubung ke server.');
    } finally {
      setGenerating(false);
    }
  };

  // Open Add Single Invoice Modal
  const handleOpenAddInvoice = () => {
    setEditingInvoiceId(null);
    setFormHouseCode('A-17');
    setFormAreaLabel('Blok A');
    setFormOwnerName('Budi Santoso');
    setFormPeriodName(initialPeriodName);
    setFormSecurityFee(450000);
    setFormCleaningFee(150000);
    setFormSinkingFund(150000);
    setFormAdditionalFee(0);
    setFormDueDate('2026-08-10');
    setFormStatus('UNPAID');
    setFormNotes('');
    setShowCreateModal(true);
  };

  // Open Edit Single Invoice Modal
  const handleOpenEditInvoice = (inv: InvoiceItem) => {
    setEditingInvoiceId(inv.id);
    setFormHouseCode(inv.propertyCode);
    setFormAreaLabel(inv.areaLabel || (inv.propertyCode.startsWith('KAV') ? 'Kavling' : inv.propertyCode.startsWith('SW') ? 'Jl. Sariwangi' : 'Blok A'));
    setFormOwnerName(inv.ownerName || `Warga Rumah ${inv.propertyCode}`);
    setFormPeriodName(inv.billingPeriodName || initialPeriodName);
    setFormSecurityFee(inv.securityFee || 450000);
    setFormCleaningFee(inv.cleaningFee || 150000);
    setFormSinkingFund(inv.sinkingFund || 150000);
    setFormAdditionalFee(inv.additionalFee || 0);
    setFormDueDate(inv.dueDate || '2026-08-10');
    setFormStatus(inv.status as any);
    setFormNotes(inv.notes || '');
    setShowCreateModal(true);
  };

  // Save Single Invoice (Create or Update)
  const handleSaveInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingInvoice(true);
    try {
      const calculatedTotal = Number(formSecurityFee) + Number(formCleaningFee) + Number(formSinkingFund) + Number(formAdditionalFee);
      const payload = {
        propertyCode: formHouseCode.toUpperCase(),
        houseCode: formHouseCode.toUpperCase(),
        areaLabel: formAreaLabel,
        ownerName: formOwnerName,
        periodName: formPeriodName,
        securityFee: Number(formSecurityFee),
        cleaningFee: Number(formCleaningFee),
        sinkingFund: Number(formSinkingFund),
        additionalFee: Number(formAdditionalFee),
        total: calculatedTotal,
        dueDate: formDueDate,
        status: formStatus,
        notes: formNotes || undefined,
      };

      if (editingInvoiceId) {
        const res = await fetch('/api/billing/invoices/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            invoiceId: editingInvoiceId,
            propertyCode: formHouseCode.toUpperCase(),
            status: formStatus,
            total: calculatedTotal,
            dueDate: formDueDate,
            paidAt: formStatus === 'PAID' ? new Date().toISOString().slice(0, 10) : null,
            notes: formNotes,
          })
        });

        if (res.ok) {
          setInvoices(invoices.map(inv => inv.id === editingInvoiceId ? {
            ...inv,
            ...payload,
            paidAmount: formStatus === 'PAID' ? calculatedTotal : 0,
            paidAt: formStatus === 'PAID' ? (inv.paidAt || '2026-08-28') : null,
          } : inv));
          showToast(`Invoice ${formHouseCode} berhasil diperbarui.`);
          setShowCreateModal(false);
        }
      } else {
        const res = await fetch('/api/billing/invoices/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const cleanHouse = formHouseCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
          const newInv: InvoiceItem = {
            id: `inv-${Date.now()}`,
            invoiceNumber: `INV-202608-${cleanHouse}`,
            propertyId: `prop-${formHouseCode.toLowerCase()}`,
            propertyCode: formHouseCode.toUpperCase(),
            areaLabel: formAreaLabel,
            ownerName: formOwnerName,
            billingPeriodName: formPeriodName,
            securityFee: Number(formSecurityFee),
            cleaningFee: Number(formCleaningFee),
            sinkingFund: Number(formSinkingFund),
            additionalFee: Number(formAdditionalFee),
            total: calculatedTotal,
            paidAmount: formStatus === 'PAID' ? calculatedTotal : 0,
            dueDate: formDueDate,
            issuedAt: new Date().toISOString(),
            paidAt: formStatus === 'PAID' ? new Date().toISOString().slice(0, 10) : null,
            status: formStatus,
            notes: formNotes,
          };
          setInvoices([newInv, ...invoices]);
          showToast(`Tagihan baru untuk ${formHouseCode} berhasil dibuat.`);
          setShowCreateModal(false);
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan invoice tagihan.');
    } finally {
      setSavingInvoice(false);
    }
  };

  // Toggle Quick 1-Click Payment Status
  const handleTogglePaymentStatus = async (inv: InvoiceItem) => {
    const newStatus = inv.status === 'PAID' ? 'UNPAID' : 'PAID';
    const newPaidAt = newStatus === 'PAID' ? new Date().toISOString().slice(0, 10) : null;
    try {
      await fetch('/api/billing/invoices/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: inv.id,
          invoiceNumber: inv.invoiceNumber,
          propertyCode: inv.propertyCode,
          status: newStatus,
          paidAmount: newStatus === 'PAID' ? inv.total : 0,
          paidAt: newPaidAt,
        })
      });

      setInvoices(invoices.map(item => item.id === inv.id ? {
        ...item,
        status: newStatus,
        paidAmount: newStatus === 'PAID' ? item.total : 0,
        paidAt: newPaidAt,
      } : item));

      showToast(`Status tagihan ${inv.propertyCode} diubah menjadi: ${newStatus === 'PAID' ? 'LUNAS' : 'BELUM BAYAR'}`);
    } catch (err) {
      console.error(err);
      showToast('Gagal mengubah status pembayaran.');
    }
  };

  // Confirm Delete / Void Invoice
  const handleConfirmDeleteInvoice = async () => {
    if (!invoiceToDelete) return;
    try {
      const res = await fetch('/api/billing/invoices/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: invoiceToDelete.id,
          invoiceNumber: invoiceToDelete.invoiceNumber,
          propertyCode: invoiceToDelete.propertyCode,
          reason: deleteReason,
        })
      });

      if (res.ok) {
        setInvoices(invoices.filter(inv => inv.id !== invoiceToDelete.id));
        showToast(`Invoice ${invoiceToDelete.invoiceNumber} berhasil dibatalkan/dihapus.`);
        setInvoiceToDelete(null);
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menghapus invoice.');
    }
  };

  // Filtered & Sorted Invoices
  const filteredAndSortedInvoices = useMemo(() => {
    const list = invoices.filter(inv => {
      const matchSearch = inv.propertyCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (inv.ownerName && inv.ownerName.toLowerCase().includes(searchTerm.toLowerCase()));
      
      let matchStatus = true;
      if (statusFilter === 'PAID') matchStatus = inv.status === 'PAID';
      else if (statusFilter === 'UNPAID') matchStatus = inv.status === 'UNPAID';
      else if (statusFilter === 'PENDING') matchStatus = inv.status === 'PENDING_VERIFICATION';

      let matchArea = true;
      if (areaFilter !== 'ALL') {
        if (areaFilter === 'KAV') matchArea = inv.propertyCode.toLowerCase().startsWith('kav');
        else if (areaFilter === 'SARIWANGI_1') matchArea = inv.propertyCode.toLowerCase().startsWith('sw1');
        else if (areaFilter === 'SARIWANGI_2') matchArea = inv.propertyCode.toLowerCase().startsWith('sw2');
        else matchArea = inv.propertyCode.startsWith(areaFilter);
      }

      return matchSearch && matchStatus && matchArea;
    });

    list.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'code') comparison = a.propertyCode.localeCompare(b.propertyCode, undefined, { numeric: true });
      else if (sortBy === 'invoice') comparison = a.invoiceNumber.localeCompare(b.invoiceNumber);
      else if (sortBy === 'total') comparison = a.total - b.total;
      else if (sortBy === 'status') comparison = a.status.localeCompare(b.status);
      else if (sortBy === 'due') comparison = a.dueDate.localeCompare(b.dueDate);
      else if (sortBy === 'paidAt') comparison = (a.paidAt || '').localeCompare(b.paidAt || '');
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return list;
  }, [invoices, searchTerm, statusFilter, areaFilter, sortBy, sortOrder]);

  // Pagination
  const totalInvoices = filteredAndSortedInvoices.length;
  const totalPages = Math.max(1, Math.ceil(totalInvoices / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalInvoices);
  const paginatedInvoices = filteredAndSortedInvoices.slice(startIndex, endIndex);

  // Paid vs Unpaid for Public Transparency
  const paidInvoicesList = useMemo(() => invoices.filter(inv => inv.status === 'PAID'), [invoices]);
  const unpaidInvoicesList = useMemo(() => invoices.filter(inv => inv.status === 'UNPAID' || inv.status === 'PENDING_VERIFICATION'), [invoices]);

  // Realtime Live Totals derived directly from active invoices state
  const liveTotalAmount = useMemo(() => {
    return invoices.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
  }, [invoices]);

  const livePaidAmount = useMemo(() => {
    return paidInvoicesList.reduce((sum, inv) => sum + (Number(inv.paidAmount ?? inv.total) || 0), 0);
  }, [paidInvoicesList]);

  const liveUnpaidAmount = useMemo(() => {
    return unpaidInvoicesList.reduce((sum, inv) => sum + (Number(inv.total) - Number(inv.paidAmount || 0)), 0);
  }, [unpaidInvoicesList]);

  const liveRatePerHouse = useMemo(() => {
    if (invoices.length === 0) return 0;
    return Math.round(liveTotalAmount / invoices.length);
  }, [invoices.length, liveTotalAmount]);

  const liveEfficiency = useMemo(() => {
    if (invoices.length === 0) return 0;
    return Math.round((paidInvoicesList.length / invoices.length) * 100);
  }, [invoices.length, paidInvoicesList.length]);

  // Copy Public Link
  const publicTransparencyUrl = 'http://localhost:4321/transparency';
  const handleCopyPublicLink = () => {
    navigator.clipboard.writeText(publicTransparencyUrl);
    setCopiedLink(true);
    showToast('Tautan publik transparansi iuran berhasil disalin!');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // WhatsApp Reminder Link Generator
  const getWaReminderUrl = (inv: InvoiceItem) => {
    const text = encodeURIComponent(
      `Halo Bapak/Ibu Warga ${inv.propertyCode} 🌿\n\nKami mengingatkan tagihan *Iuran Pengelolaan Lingkungan (IPL) ${initialPeriodName}*:\n\n🏡 *Unit:* ${inv.propertyCode}\n💵 *Nominal:* Rp ${inv.total?.toLocaleString('id-ID')}\n🗓️ *Jatuh Tempo:* ${inv.dueDate}\n🏦 *Rekening BCA:* 8830-1928-33 a.n PENGURUS KOMPLEK TAMAN SEJAHTERA\n\n📲 *Konfirmasi & Cek Transparansi:*\n${publicTransparencyUrl}\n\nTerima kasih atas partisipasinya menjaga kenyamanan lingkungan kita bersama. 🙏`
    );
    return `https://api.whatsapp.com/send?text=${text}`;
  };

  // Export CSV
  const handleExportBillingCSV = () => {
    const headers = ['No Invoice', 'Kode Unit', 'Periode', 'IPL Keamanan', 'Kebersihan', 'Kas Komplek', 'Biaya Lain', 'Total Tagihan (Rp)', 'Status', 'Jatuh Tempo', 'Waktu Lunas'];
    const rows = invoices.map(inv => [
      inv.invoiceNumber,
      inv.propertyCode,
      `"${inv.billingPeriodName || initialPeriodName}"`,
      inv.securityFee || 450000,
      inv.cleaningFee || 150000,
      inv.sinkingFund || 150000,
      inv.additionalFee || 0,
      inv.total,
      inv.status,
      inv.dueDate,
      inv.paidAt || '-',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `REKAPITULASI_TAGIHAN_IURAN_${initialPeriodName.replace(/ /g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Rekapitulasi tagihan iuran berhasil diekspor ke CSV.');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-700 text-white rounded-2xl shadow-xl font-bold text-xs animate-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Public Transparency Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black tracking-tight text-ink flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-primary-600" />
              Pengelolaan Iuran Warga & Tagihan (Billing)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-primary-100 text-primary-800 text-xs font-black border border-primary-200">
              Periode: {initialPeriodName}
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Manajemen tagihan iuran IPL, kuitansi digital ber-QR code, pembuatan tagihan massal, dan transparansi publik status pembayaran warga.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportBillingCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-surface hover:bg-canvas border border-border text-ink text-xs font-bold rounded-xl shadow-xs active:scale-[0.98] transition-all"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Ekspor Tagihan (CSV)</span>
          </button>
          <button
            type="button"
            onClick={handleOpenAddInvoice}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-surface hover:bg-canvas border border-border text-ink text-xs font-bold rounded-xl shadow-xs active:scale-[0.98] transition-all"
          >
            <PlusCircle className="w-4 h-4 text-primary-600" />
            <span>Tambah Tagihan Satuan</span>
          </button>
          <button
            type="button"
            onClick={() => setShowGenerateModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs active:scale-[0.98] transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Tagihan Massal</span>
          </button>
        </div>
      </div>

      {/* Public Transparency Share Callout Banner */}
      <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-emerald-950 text-sm">Tautan Publik Rekapitulasi Iuran Warga (Bulan Aktif)</h4>
            <p className="text-emerald-800 text-[11px] mt-0.5">
              Bagikan tautan ini ke grup WhatsApp warga agar warga dapat melihat secara mandiri daftar rumah yang sudah lunas dan yang belum bayar secara terbuka.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleCopyPublicLink}
            className="px-3.5 py-2 bg-white hover:bg-emerald-100 text-emerald-900 font-bold rounded-xl border border-emerald-300 shadow-2xs inline-flex items-center gap-1.5 active:scale-[0.98] transition-all"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-emerald-700" />}
            <span>Salin Link Publik</span>
          </button>
          <a
            href={publicTransparencyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-2xs inline-flex items-center gap-1.5 active:scale-[0.98] transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Buka Halaman Publik</span>
          </a>
        </div>
      </div>

      {/* 4-SubTab Navigation Bar */}
      <div className="flex items-center gap-1.5 p-1.5 bg-surface rounded-2xl border border-border shadow-2xs overflow-x-auto no-scrollbar">
        {[
          { id: 'invoices', label: 'Daftar Tagihan & Invoice Bulanan', icon: Receipt, count: `${invoices.length} Inv` },
          { id: 'public_ledger', label: 'Rekapitulasi Iuran Publik (Lunas vs Belum)', icon: Eye, count: `${paidInvoicesList.length}/${invoices.length}` },
          { id: 'tariffs', label: 'Struktur Tarif Iuran Komplek', icon: DollarSign },
          { id: 'batch', label: 'Generator Tagihan Massal', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap active:scale-[0.98] ${
                isActive
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-ink-muted hover:text-ink hover:bg-canvas'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-primary-400' : 'text-ink-muted'}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-canvas text-ink-muted border border-border/60'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ================= SUBTAB 1: DAFTAR TAGIHAN & INVOICES ================= */}
      {activeSubTab === 'invoices' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Progress Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[10px] font-mono uppercase font-bold text-ink-muted tracking-wider">Total Tagihan Periode Ini</span>
              <p className="text-2xl font-black font-mono text-ink mt-0.5 tabular-nums">{formatRupiah(liveTotalAmount)}</p>
              <span className="text-[10px] text-ink-muted font-medium mt-0.5 block">
                {invoices.length} Rumah {liveRatePerHouse > 0 ? `@ ${formatRupiah(liveRatePerHouse)}` : '@ Rp0'}
              </span>
            </div>

            <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[10px] font-mono uppercase font-bold text-ink-muted tracking-wider">Telah Terkumpul (Lunas)</span>
              <p className="text-2xl font-black font-mono text-emerald-700 mt-0.5 tabular-nums">{formatRupiah(livePaidAmount)}</p>
              <span className="text-[10px] text-emerald-600 font-bold font-mono mt-0.5 block">
                {paidInvoicesList.length} Unit ({liveEfficiency}%) LUNAS
              </span>
            </div>

            <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[10px] font-mono uppercase font-bold text-ink-muted tracking-wider">Tunggakan / Belum Lunas</span>
              <p className="text-2xl font-black font-mono text-rose-700 mt-0.5 tabular-nums">{formatRupiah(liveUnpaidAmount)}</p>
              <span className="text-[10px] text-rose-600 font-bold font-mono mt-0.5 block">
                {unpaidInvoicesList.length} Unit Tertunda
              </span>
            </div>

            <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[10px] font-mono uppercase font-bold text-ink-muted tracking-wider">Efisiensi Kolektibilitas</span>
              <p className="text-2xl font-black font-mono text-primary-700 mt-0.5 tabular-nums">
                {liveEfficiency}%
              </p>
              <span className="text-[10px] text-emerald-600 font-bold font-mono mt-0.5 block">BANK BCA AUTO-RECONCILED</span>
            </div>
          </div>

          {/* Filters, Wilayah & Search Bar */}
          <div className="bg-surface p-4 rounded-2xl border border-border shadow-card flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="w-full sm:w-72 relative">
              <Search className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari unit (cth: A-17, Kav 5, Sariwangi), invoice..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 bg-canvas border border-border rounded-xl text-xs text-ink placeholder:text-ink-muted focus:outline-hidden"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <select
                value={areaFilter}
                onChange={(e) => {
                  setAreaFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="ALL">Semua Wilayah</option>
                <option value="A">Blok A</option>
                <option value="B">Blok B</option>
                <option value="C">Blok C</option>
                <option value="D">Blok D</option>
                <option value="KAV">Area Kavling</option>
                <option value="SARIWANGI_1">Jl. Sariwangi Indah 1</option>
                <option value="SARIWANGI_2">Jl. Sariwangi Indah 2</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="ALL">Semua Status Bayar</option>
                <option value="PAID">Lunas (Paid)</option>
                <option value="UNPAID">Belum Bayar (Unpaid)</option>
                <option value="PENDING">Menunggu Verifikasi</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="code">Urut Kode Rumah</option>
                <option value="invoice">Urut No Invoice</option>
                <option value="total">Urut Nominal</option>
                <option value="status">Urut Status</option>
                <option value="due">Urut Jatuh Tempo</option>
                <option value="paidAt">Urut Waktu Pelunasan</option>
              </select>

              <button
                type="button"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 bg-canvas border border-border rounded-xl text-ink-muted hover:text-ink"
                title={`Urutan: ${sortOrder === 'asc' ? 'Menaik' : 'Menurun'}`}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Invoices List Table with Pagination & Full Actions */}
          <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-canvas border-b border-border text-ink-muted font-bold">
                  <tr>
                    <th className="py-3.5 px-4">No. Invoice & Periode</th>
                    <th className="py-3.5 px-4">Kode Unit / Wilayah</th>
                    <th className="py-3.5 px-4 text-right">Rincian & Total Tagihan</th>
                    <th className="py-3.5 px-4 text-center">Status Pembayaran</th>
                    <th className="py-3.5 px-4 text-center">Jatuh Tempo</th>
                    <th className="py-3.5 px-4 text-right">Aksi & Kuitansi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {paginatedInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-ink-muted">
                        <div className="max-w-sm mx-auto flex flex-col items-center justify-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
                            <FileText className="w-5 h-5" />
                          </div>
                          <p className="font-bold text-ink text-sm">
                            {invoices.length === 0 ? 'Belum Ada Tagihan Invoice' : 'Tidak ada invoice yang cocok dengan filter'}
                          </p>
                          <p className="text-xs text-ink-muted">
                            {invoices.length === 0
                              ? 'Data tagihan iuran masih kosong. Klik tombol "Buat Invoice" atau "Generate Tagihan Periode" di atas untuk menerbitkan tagihan resmi.'
                              : 'Coba ubah kata kunci pencarian atau filter status untuk melihat tagihan lain.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedInvoices.map((inv) => {
                      const isPaid = inv.status === 'PAID';
                      return (
                        <tr key={inv.id} className="hover:bg-canvas/60 text-ink transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-950 text-white font-mono font-black text-xs tracking-wider border border-slate-700 shadow-2xs mb-0.5">
                              {inv.invoiceNumber}
                            </span>
                            <span className="text-[10px] text-ink-muted font-medium block">{inv.billingPeriodName || initialPeriodName}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-black text-sm text-primary-700 block">Unit {inv.propertyCode}</span>
                            <span className="text-[10px] text-ink-muted font-medium">{inv.areaLabel || 'Taman Sejahtera'}</span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <p className="font-mono font-black tabular-nums text-sm text-ink">{formatRupiah(inv.total)}</p>
                            <span className="text-[10px] text-ink-muted">IPL Keamanan + Sampah + Kas</span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleTogglePaymentStatus(inv)}
                              className={`px-3 py-1 rounded-lg text-[10px] font-mono font-black border transition-all cursor-pointer shadow-2xs active:scale-[0.95] ${
                                isPaid
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                  : 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
                              }`}
                              title="Klik untuk mengubah status lunas/belum lunas secara cepat"
                            >
                              {isPaid ? '✓ LUNAS' : '⏳ BELUM BAYAR'}
                            </button>
                            {inv.paidAt && (
                              <span className="text-[9px] text-ink-muted font-mono block mt-0.5">{inv.paidAt}</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono text-ink-muted font-bold">
                            {inv.dueDate}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1">
                              {isPaid ? (
                                <button
                                  type="button"
                                  onClick={() => setSelectedReceipt({
                                    invoiceNumber: inv.invoiceNumber,
                                    periodName: inv.billingPeriodName || initialPeriodName,
                                    propertyCode: inv.propertyCode,
                                    residentName: inv.ownerName || `Warga Rumah ${inv.propertyCode}`,
                                    amount: inv.total,
                                    paidAt: inv.paidAt || '15 Agustus 2026',
                                    paymentMethod: 'Transfer Bank BCA (Otomatis)',
                                    referenceNumber: `TRX-${inv.propertyCode}-BCA`,
                                  })}
                                  className="px-2.5 py-1.5 text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg font-bold inline-flex items-center gap-1 text-[11px] active:scale-[0.98] transition-all"
                                  title="Lihat / Cetak Kuitansi Resmi"
                                >
                                  <Printer className="w-3.5 h-3.5" /> Kuitansi
                                </button>
                              ) : (
                                <a
                                  href={getWaReminderUrl(inv)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1.5 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg font-bold inline-flex items-center gap-1 text-[11px] active:scale-[0.98] transition-all"
                                  title="Kirim Pesan WhatsApp Pengingat"
                                >
                                  <Send className="w-3.5 h-3.5" /> Ingatkan WA
                                </a>
                              )}

                              <button
                                type="button"
                                onClick={() => handleOpenEditInvoice(inv)}
                                className="p-1.5 text-amber-700 hover:bg-amber-50 rounded-lg active:scale-[0.98] transition-all"
                                title="Edit Tagihan"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setInvoiceToDelete(inv)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg active:scale-[0.98] transition-all"
                                title="Hapus / Batalkan Invoice"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION CONTROLS */}
            <div className="p-4 border-t border-border bg-canvas/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="text-ink-muted">
                  Menampilkan <strong className="text-ink">{totalInvoices === 0 ? 0 : startIndex + 1}</strong> - <strong className="text-ink">{endIndex}</strong> dari <strong className="text-ink">{totalInvoices}</strong> tagihan
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-ink-muted">Tampilkan:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2 py-1 bg-surface border border-border rounded-lg font-bold text-ink"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  disabled={safeCurrentPage === 1}
                  className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40"
                  title="Halaman Pertama"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(safeCurrentPage - 1)}
                  disabled={safeCurrentPage === 1}
                  className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40"
                  title="Halaman Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1 px-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = safeCurrentPage - 2 + i;
                    if (pageNum < 1) pageNum = i + 1;
                    if (pageNum > totalPages) return null;

                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                          safeCurrentPage === pageNum
                            ? 'bg-primary-600 text-white shadow-xs'
                            : 'bg-surface border border-border text-ink hover:bg-canvas'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage(safeCurrentPage + 1)}
                  disabled={safeCurrentPage === totalPages}
                  className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40"
                  title="Halaman Berikutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={safeCurrentPage === totalPages}
                  className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40"
                  title="Halaman Terakhir"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUBTAB 2: REKAPITULASI IURAN PUBLIK (LUNAS VS BELUM) ================= */}
      {activeSubTab === 'public_ledger' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="p-5 bg-surface rounded-3xl border border-border shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <h3 className="font-black text-base text-ink flex items-center gap-2">
                  <Eye className="w-5 h-5 text-emerald-600" />
                  Rekapitulasi Iuran Transparansi Warga ({initialPeriodName})
                </h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  Tampilan status pembayaran terbuka yang disinkronisasi ke portal warga [transparency](http://localhost:4321/transparency).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyPublicLink}
                  className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl font-bold text-xs border border-emerald-300 inline-flex items-center gap-1.5 active:scale-[0.98] transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Tautan Rekapitulasi</span>
                </button>
              </div>
            </div>

            {/* 2-Column Split: Paid vs Unpaid Houses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Kolom 1: Sudah Lunas (86 Unit) */}
              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-emerald-900 text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Daftar Unit Sudah Lunas ({paidInvoicesList.length} Unit)
                  </h4>
                  <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-mono font-black">
                    TERVERIFIKASI
                  </span>
                </div>

                <div className="max-h-96 overflow-y-auto space-y-1.5 pr-1 text-xs">
                  {paidInvoicesList.map(inv => (
                    <div key={inv.id} className="p-3 bg-white rounded-xl border border-emerald-200/80 flex items-center justify-between shadow-2xs">
                      <div>
                        <span className="font-mono font-black text-ink block">Unit {inv.propertyCode}</span>
                        <span className="text-[10px] text-ink-muted block">{inv.ownerName || 'Warga Terdaftar'}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-700 font-mono font-black text-xs block">{formatRupiah(inv.total)}</span>
                        <span className="text-[9px] font-mono text-emerald-600">Lunas {inv.paidAt || '15-08-2026'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Kolom 2: Belum Lunas / Menunggak (34 Unit) */}
              <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-rose-900 text-xs flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-rose-600" />
                    Daftar Unit Belum Lunas ({unpaidInvoicesList.length} Unit)
                  </h4>
                  <span className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-mono font-black">
                    MENUNGGU BAYAR
                  </span>
                </div>

                <div className="max-h-96 overflow-y-auto space-y-1.5 pr-1 text-xs">
                  {unpaidInvoicesList.map(inv => (
                    <div key={inv.id} className="p-3 bg-white rounded-xl border border-rose-200/80 flex items-center justify-between shadow-2xs">
                      <div>
                        <span className="font-mono font-black text-ink block">Unit {inv.propertyCode}</span>
                        <span className="text-[10px] text-ink-muted font-mono block">Jatuh Tempo: {inv.dueDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-rose-700 font-mono font-black text-xs">{formatRupiah(inv.total)}</span>
                        <a
                          href={getWaReminderUrl(inv)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] inline-flex items-center gap-1 shadow-2xs active:scale-[0.95] transition-all"
                        >
                          <Send className="w-3 h-3" /> WA
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUBTAB 3: STRUKTUR TARIF IURAN ================= */}
      {activeSubTab === 'tariffs' && (
        <div className="space-y-4 max-w-3xl animate-in fade-in duration-150">
          {/* Quick Settings Location Banner */}
          <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-sky-100 rounded-xl text-sky-700 shrink-0 mt-0.5">
                <Settings className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-extrabold text-sky-950 text-xs">
                  Pusat Pengaturan Tarif & Rekening Bank Komplek
                </h4>
                <p className="text-[11px] text-sky-800 leading-relaxed">
                  Pengaturan tarif iuran, rincian biaya sampah & keamanan, jatuh tempo, serta rekening bank resmi dikelola pada halaman <strong>Pengaturan Komplek</strong>.
                </p>
              </div>
            </div>
            <a
              href="/admin/settings?tab=financial"
              className="px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5 shrink-0 shadow-2xs active:scale-[0.98] transition-all"
            >
              <span>Pengaturan Komplek</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="p-5 bg-surface rounded-3xl border border-border shadow-card space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/60">
              <h3 className="font-black text-base text-ink flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary-600" />
                Matriks Struktur Komponen Iuran Pengelolaan Lingkungan (IPL)
              </h3>
              <button
                type="button"
                onClick={() => {
                  setEditableTariffs([...tariffComponents]);
                  setEditableTariffNote(tariffNote);
                  setShowTariffModal(true);
                }}
                className="px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 font-bold rounded-xl text-xs inline-flex items-center gap-1.5 self-start sm:self-auto active:scale-[0.98] transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Struktur Tarif</span>
              </button>
            </div>

            <p className="text-ink-muted">
              {tariffNote} sebesar <strong>{formatRupiah(totalTariff)} / unit rumah per bulan</strong>.
            </p>

            <div className="space-y-2.5">
              {tariffComponents.map((item, idx) => (
                <div key={item.id || idx} className="p-3.5 bg-canvas rounded-2xl border border-border flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-ink text-xs">{item.name}</h4>
                    <p className="text-[11px] text-ink-muted mt-0.5">{item.desc}</p>
                  </div>
                  <span className="font-mono font-black text-primary-700 text-sm shrink-0">{formatRupiah(item.fee)}</span>
                </div>
              ))}

              <div className="p-4 bg-primary-50 rounded-2xl border border-primary-200 flex items-center justify-between">
                <div>
                  <h4 className="font-black text-primary-900 text-xs">Total Iuran Standar Per Unit</h4>
                  <p className="text-[11px] text-primary-800">Diterbitkan otomatis setiap tanggal 1 awal bulan</p>
                </div>
                <span className="font-mono font-black text-primary-900 text-base">{formatRupiah(totalTariff)} / bln</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUBTAB 4: GENERATOR TAGIHAN MASAL ================= */}
      {activeSubTab === 'batch' && (
        <div className="space-y-4 max-w-xl animate-in fade-in duration-150">
          <div className="p-6 bg-surface rounded-3xl border border-border shadow-card space-y-4 text-xs">
            <h3 className="font-black text-base text-ink flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-600" />
              Generate Tagihan Masal Periode Baru
            </h3>
            <p className="text-ink-muted">
              Fitur ini akan secara otomatis menerbitkan invoice tagihan ke seluruh 120 unit rumah terdaftar di Blok A, B, C, D, Kavling, dan Jalan Sariwangi.
            </p>

            <form onSubmit={handleGenerateBatch} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-ink block mb-1">Bulan Tagihan</label>
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
                <label className="font-bold text-ink block mb-1">Tarif Iuran per Unit (Rp)</label>
                <input
                  type="number"
                  value={genFee}
                  onChange={(e) => setGenFee(parseInt(e.target.value, 10))}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink tabular-nums"
                />
              </div>

              <button
                type="submit"
                disabled={generating}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {generating ? 'Menerbitkan 120 Tagihan...' : 'Terbitkan Tagihan Masal Sekarang'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: TAMBAH / EDIT SINGLE INVOICE ================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-lg w-full p-6 border border-border shadow-modal space-y-4 max-h-[92vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-primary-600" />
                <h3 className="font-black text-sm text-ink">
                  {editingInvoiceId ? `Edit Invoice Tagihan` : `Tambah Tagihan Iuran Satuan`}
                </h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            <form onSubmit={handleSaveInvoice} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-ink block mb-1">Nomor / Kode Unit *</label>
                  <input
                    type="text"
                    placeholder="A-17 / KAV-12 / SW1-05"
                    value={formHouseCode}
                    onChange={(e) => setFormHouseCode(e.target.value)}
                    required
                    className="w-full p-2 bg-canvas border border-border rounded-xl font-bold text-ink"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Nama Pemilik / Penghuni</label>
                  <input
                    type="text"
                    placeholder="Budi Santoso"
                    value={formOwnerName}
                    onChange={(e) => setFormOwnerName(e.target.value)}
                    className="w-full p-2 bg-canvas border border-border rounded-xl font-bold text-ink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-ink block mb-1">Periode Tagihan *</label>
                  <input
                    type="text"
                    placeholder="Agustus 2026"
                    value={formPeriodName}
                    onChange={(e) => setFormPeriodName(e.target.value)}
                    required
                    className="w-full p-2 bg-canvas border border-border rounded-xl text-ink font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Tanggal Jatuh Tempo *</label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    required
                    className="w-full p-2 bg-canvas border border-border rounded-xl text-ink"
                  />
                </div>
              </div>

              <div className="p-3 bg-canvas rounded-2xl border border-border space-y-2">
                <span className="font-bold text-ink block text-[11px]">Rincian Komponen Iuran:</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-ink-muted block text-[10px]">IPL Keamanan (Rp)</label>
                    <input
                      type="number"
                      value={formSecurityFee}
                      onChange={(e) => setFormSecurityFee(Number(e.target.value))}
                      className="w-full p-1.5 bg-surface border border-border rounded-lg font-mono text-ink font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-ink-muted block text-[10px]">Kebersihan Sampah (Rp)</label>
                    <input
                      type="number"
                      value={formCleaningFee}
                      onChange={(e) => setFormCleaningFee(Number(e.target.value))}
                      className="w-full p-1.5 bg-surface border border-border rounded-lg font-mono text-ink font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-ink-muted block text-[10px]">Kas Komplek (Rp)</label>
                    <input
                      type="number"
                      value={formSinkingFund}
                      onChange={(e) => setFormSinkingFund(Number(e.target.value))}
                      className="w-full p-1.5 bg-surface border border-border rounded-lg font-mono text-ink font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-ink-muted block text-[10px]">Biaya Tambahan (Rp)</label>
                    <input
                      type="number"
                      value={formAdditionalFee}
                      onChange={(e) => setFormAdditionalFee(Number(e.target.value))}
                      className="w-full p-1.5 bg-surface border border-border rounded-lg font-mono text-ink font-bold"
                    />
                  </div>
                </div>
                <div className="pt-2 border-t border-border flex justify-between font-black text-ink">
                  <span>Total Tagihan:</span>
                  <span className="font-mono text-primary-700">
                    {formatRupiah(Number(formSecurityFee) + Number(formCleaningFee) + Number(formSinkingFund) + Number(formAdditionalFee))}
                  </span>
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Status Pembayaran</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full p-2 bg-canvas border border-border rounded-xl font-bold text-ink"
                >
                  <option value="UNPAID">Belum Bayar (Unpaid)</option>
                  <option value="PAID">Lunas (Paid)</option>
                  <option value="PENDING_VERIFICATION">Menunggu Verifikasi</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas active:scale-[0.98] transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingInvoice}
                  className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-xs disabled:opacity-50 active:scale-[0.98] transition-all"
                >
                  {savingInvoice ? 'Menyimpan...' : editingInvoiceId ? 'Perbarui Tagihan' : 'Terbitkan Tagihan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: KONFIRMASI HAPUS / BATALKAN INVOICE ================= */}
      {invoiceToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-red-200 shadow-modal space-y-4 text-xs">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-black text-base text-ink">Batalkan Invoice {invoiceToDelete.invoiceNumber}?</h3>
              <p className="text-ink-muted">
                Tagihan untuk <strong>Unit {invoiceToDelete.propertyCode}</strong> sebesar <strong>{formatRupiah(invoiceToDelete.total)}</strong> akan dibatalkan/dihapus dari buku kas. Tindakan ini tercatat di Jejak Audit.
              </p>
            </div>

            <div>
              <label className="font-bold text-ink block mb-1">Alasan Pembatalan:</label>
              <select
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="w-full p-2 bg-canvas border border-border rounded-xl text-ink font-semibold"
              >
                <option value="Kesalahan Input / Keringanan Pengurus">Kesalahan Input / Keringanan Pengurus</option>
                <option value="Tagihan Duplikat">Tagihan Duplikat</option>
                <option value="Rumah Kosong / Nonaktif">Rumah Kosong / Nonaktif</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setInvoiceToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas active:scale-[0.98] transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteInvoice}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs active:scale-[0.98] transition-all"
              >
                Ya, Batalkan Tagihan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT STRUKTUR TARIF IPL ================= */}
      {showTariffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-lg w-full p-6 border border-border shadow-modal space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary-100 text-primary-700 rounded-xl">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-ink">Edit Struktur Komponen Tarif IPL</h3>
                  <p className="text-[11px] text-ink-muted">Sesuaikan rincian pos iuran dan nominal iuran bulanan warga</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTariffModal(false)}
                className="p-1.5 hover:bg-canvas rounded-xl text-ink-muted hover:text-ink transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-bold text-ink block mb-1">Dasar Kesepakatan / Catatan Musyawarah:</label>
                <input
                  type="text"
                  value={editableTariffNote}
                  onChange={(e) => setEditableTariffNote(e.target.value)}
                  placeholder="Contoh: Tarif iuran standar disepakati bersama dalam Musyawarah Warga RT 05 / RW 05"
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-xs text-ink font-semibold"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-ink block">Komponen Pos Iuran:</label>
                  <button
                    type="button"
                    onClick={() => {
                      const newId = `tf-${Date.now()}`;
                      setEditableTariffs([
                        ...editableTariffs,
                        { id: newId, name: `${editableTariffs.length + 1}. Komponen Baru`, fee: 50000, desc: 'Deskripsi peruntukan iuran' },
                      ]);
                    }}
                    className="px-2 py-1 bg-primary-50 hover:bg-primary-100 text-primary-700 font-bold rounded-lg text-[10px] inline-flex items-center gap-1 active:scale-[0.95] transition-all"
                  >
                    <PlusCircle className="w-3 h-3" /> Tambah Pos
                  </button>
                </div>

                <div className="space-y-2.5">
                  {editableTariffs.map((item, idx) => (
                    <div key={item.id} className="p-3 bg-canvas rounded-2xl border border-border space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => {
                            const updated = [...editableTariffs];
                            updated[idx].name = e.target.value;
                            setEditableTariffs(updated);
                          }}
                          placeholder="Nama Komponen Pos"
                          className="flex-1 p-1.5 bg-surface border border-border rounded-lg text-xs font-bold text-ink"
                        />
                        {editableTariffs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditableTariffs(editableTariffs.filter((_, i) => i !== idx));
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus Pos Ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        value={item.desc}
                        onChange={(e) => {
                          const updated = [...editableTariffs];
                          updated[idx].desc = e.target.value;
                          setEditableTariffs(updated);
                        }}
                        placeholder="Keterangan alokasi/peruntukan biaya"
                        className="w-full p-1.5 bg-surface border border-border rounded-lg text-[11px] text-ink-muted"
                      />

                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/60">
                        <span className="text-[11px] font-bold text-ink-muted">Nominal (Rp):</span>
                        <input
                          type="number"
                          value={item.fee}
                          onChange={(e) => {
                            const updated = [...editableTariffs];
                            updated[idx].fee = Number(e.target.value) || 0;
                            setEditableTariffs(updated);
                          }}
                          className="w-32 p-1.5 bg-surface border border-border rounded-lg text-right font-mono font-bold text-primary-700 text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Summary Preview */}
              <div className="p-3.5 bg-primary-50 rounded-2xl border border-primary-200 flex items-center justify-between">
                <div>
                  <h4 className="font-black text-primary-900 text-xs">Total Iuran Baru Per Unit</h4>
                  <p className="text-[10px] text-primary-700">Dihitung otomatis dari akumulasi pos di atas</p>
                </div>
                <span className="font-mono font-black text-primary-900 text-sm">
                  {formatRupiah(editableTariffs.reduce((sum, item) => sum + (Number(item.fee) || 0), 0))} / bln
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowTariffModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas active:scale-[0.98] transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const newTotal = editableTariffs.reduce((sum, item) => sum + (Number(item.fee) || 0), 0);
                  setTariffComponents(editableTariffs);
                  setTariffNote(editableTariffNote);
                  setGenFee(newTotal);
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('wargahub_tariff_components', JSON.stringify(editableTariffs));
                    localStorage.setItem('wargahub_tariff_note', editableTariffNote);
                    localStorage.setItem('wargahub_set_fee', String(newTotal));
                  }
                  setShowTariffModal(false);
                  showToast('Struktur tarif IPL dan nominal iuran berhasil diperbarui!');
                }}
                className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-xs active:scale-[0.98] transition-all"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Digital Receipt Modal Component */}
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
