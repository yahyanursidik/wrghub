import React, { useState, useMemo, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Hourglass,
  Search,
  Filter,
  Check,
  Eye,
  X,
  Upload,
  PlusCircle,
  Download,
  Share2,
  Copy,
  ExternalLink,
  Edit3,
  Trash2,
  Printer,
  Calendar,
  Building,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  DollarSign,
  AlertTriangle,
  Receipt,
  Sparkles,
  Send,
  Clock,
  QrCode,
  Image as ImageIcon,
  MessageCircle,
  RefreshCw,
  Sliders,
  Wallet,
  FileCheck,
  CheckSquare,
  Square
} from 'lucide-react';
import { formatRupiah } from '../../lib/format';
import { ReceiptModal } from '../shared/ReceiptModal';
import type { PaymentListItem } from '../../services/payment.service';

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  balance: number;
  isPrimary: boolean;
  accountType: 'BANK_OPERASIONAL' | 'QRIS_DINAMIS' | 'KAS_TUNAI';
  qrisNmid?: string;
  qrisFee?: string;
  notes?: string;
}

export interface BankStatementFeed {
  id: string;
  date: string;
  description: string;
  type: 'CR' | 'DB';
  amount: number;
  matchedPaymentId?: string;
  matchedHouse?: string;
  isReconciled: boolean;
}

interface PaymentsManagerProps {
  initialPayments: PaymentListItem[];
}

export const PaymentsManager: React.FC<PaymentsManagerProps> = ({ initialPayments }) => {
  // Helper storage persistence
  const getPersisted = <T,>(key: string, fallback: T): T => {
    if (typeof window === 'undefined') return fallback;
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : fallback;
    } catch {
      return fallback;
    }
  };

  const savePersisted = (key: string, value: any) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Failed to persist storage:', e);
    }
  };

  const addDeletedIds = (key: string, ids: string[]) => {
    if (typeof window === 'undefined') return;
    try {
      const existing = localStorage.getItem(key);
      const list: string[] = existing ? JSON.parse(existing) : [];
      const updated = Array.from(new Set([...list, ...ids]));
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save deleted IDs:', e);
    }
  };

  // 1. PAYMENTS STATE (with persistent deleted filter)
  const [payments, setPayments] = useState<PaymentListItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('wargahub_payments');
        const deletedPaymentsStr = localStorage.getItem('wargahub_deleted_payments');
        const deletedResidentsStr = localStorage.getItem('wargahub_deleted_residents');
        const deletedPropsStr = localStorage.getItem('wargahub_deleted_properties');

        const deletedPayments: string[] = deletedPaymentsStr ? JSON.parse(deletedPaymentsStr) : [];
        const deletedResidents: string[] = deletedResidentsStr ? JSON.parse(deletedResidentsStr) : [];
        const deletedProps: string[] = deletedPropsStr ? JSON.parse(deletedPropsStr) : [];

        const allDeleted = new Set([...deletedPayments, ...deletedResidents, ...deletedProps]);

        const sourceList = saved !== null ? JSON.parse(saved) : initialPayments;
        if (Array.isArray(sourceList)) {
          return sourceList.filter((p: any) => !allDeleted.has(p.id) && !allDeleted.has(p.propertyCode));
        }
      } catch (e) {
        console.warn(e);
      }
    }
    return initialPayments;
  });

  // 2. BANK ACCOUNTS & REKENING KAS STATE
  const initialBankAccounts: BankAccount[] = [
    {
      id: 'acc-bca-01',
      bankName: 'Bank Central Asia (BCA)',
      accountNumber: '8830-1928-33',
      accountHolder: 'PENGURUS KOMPLEK WARGAHUB',
      balance: 128450000,
      isPrimary: true,
      accountType: 'BANK_OPERASIONAL',
      notes: 'Rekening penerimaan utama iuran IPL, sampah & keamanan.',
    },
    {
      id: 'acc-qris-01',
      bankName: 'Gateway QRIS Dinamis Paguyuban',
      accountNumber: 'NMID: ID102008891230',
      accountHolder: 'WARGAHUB KOMPLEK QRIS',
      balance: 14250000,
      isPrimary: false,
      accountType: 'QRIS_DINAMIS',
      qrisNmid: 'ID102008891230',
      qrisFee: '0% (Non-Profit Komunitas)',
      notes: 'Real-time settlement H+0 otomatis masuk kas.',
    },
    {
      id: 'acc-cash-01',
      bankName: 'Kas Tunai Bendahara (Petty Cash)',
      accountNumber: 'BRK-KAS-01',
      accountHolder: 'Hendra Wijaya (Bendahara)',
      balance: 8750000,
      isPrimary: false,
      accountType: 'KAS_TUNAI',
      notes: 'Penyimpanan uang tunai untuk operasional darurat dan iuran cash.',
    }
  ];

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() =>
    getPersisted('wargahub_bank_accounts', initialBankAccounts)
  );

  // Bank Statement Feed (Auto-Recon Feed)
  const initialStatements: BankStatementFeed[] = [
    { id: 'stmt-1', date: '28 Agu 2026, 14:15 WIB', description: 'TRF BPK BUDI SANTOSO IPL A17', type: 'CR', amount: 750000, matchedHouse: 'A-17', isReconciled: true },
    { id: 'stmt-2', date: '28 Agu 2026, 15:30 WIB', description: 'QRIS SETTLEMENT ID102008891230', type: 'CR', amount: 750000, matchedHouse: 'B-04', isReconciled: true },
    { id: 'stmt-3', date: '28 Agu 2026, 16:45 WIB', description: 'TRF IBU RATNA IPL AGUSTUS C08', type: 'CR', amount: 750000, matchedHouse: 'C-08', isReconciled: true },
    { id: 'stmt-4', date: '29 Agu 2026, 09:10 WIB', description: 'BIAYA ADM REK KORAN BULANAN BCA', type: 'DB', amount: 25000, isReconciled: true },
    { id: 'stmt-5', date: '29 Agu 2026, 11:20 WIB', description: 'TRF HENDRA GUNAWAN IPL A01', type: 'CR', amount: 750000, matchedHouse: 'A-01', isReconciled: true },
  ];

  const [statementFeeds, setStatementFeeds] = useState<BankStatementFeed[]>(() =>
    getPersisted('wargahub_statement_feeds', initialStatements)
  );

  // Navigation & SubTabs
  const [activeSubTab, setActiveSubTab] = useState<'verification' | 'manual_entry' | 'public_transparency' | 'bank_recon'>('verification');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('ALL');
  const [areaFilter, setAreaFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'code' | 'amount' | 'status' | 'method'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Multi-Selection State for Bulk Actions
  const [selectedPaymentIds, setSelectedPaymentIds] = useState<string[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals & Drawers
  const [viewingProof, setViewingProof] = useState<PaymentListItem | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [showManualModal, setShowManualModal] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<PaymentListItem | null>(null);
  const [deleteReason, setDeleteReason] = useState('Koreksi Input / Pembayaran Ganda');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Bank Account Edit Modal
  const [showBankEditModal, setShowBankEditModal] = useState(false);
  const [editingBankId, setEditingBankId] = useState<string>('acc-bca-01');
  const [bBankName, setBBankName] = useState('Bank Central Asia (BCA)');
  const [bAccountNumber, setBAccountNumber] = useState('8830-1928-33');
  const [bAccountHolder, setBAccountHolder] = useState('PENGURUS KOMPLEK WARGAHUB');
  const [bBalance, setBBalance] = useState(128450000);
  const [bQrisNmid, setBQrisNmid] = useState('ID102008891230');
  const [bNotes, setBNotes] = useState('');

  // Manual Payment Form State
  const [formHouseCode, setFormHouseCode] = useState('A-17');
  const [formOwnerName, setFormOwnerName] = useState('Budi Santoso');
  const [formPeriod, setFormPeriod] = useState('Agustus 2026');
  const [formAmount, setFormAmount] = useState(750000);
  const [formMethod, setFormMethod] = useState<'BCA_TRANSFER' | 'QRIS' | 'CASH' | 'MANDIRI_TRANSFER' | 'BRI_TRANSFER'>('BCA_TRANSFER');
  const [formRef, setFormRef] = useState('');
  const [formPaidDate, setFormPaidDate] = useState('2026-08-28');
  const [formStatus, setFormStatus] = useState<'VERIFIED' | 'PENDING'>('VERIFIED');
  const [formNotes, setFormNotes] = useState('');
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [savingPayment, setSavingPayment] = useState(false);

  // Rejection Form State
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('Nominal bukti transfer tidak sesuai tagihan (Rp 750.000)');

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Update payments helper with persistence
  const updatePaymentsState = (newList: PaymentListItem[]) => {
    setPayments(newList);
    savePersisted('wargahub_payments', newList);
  };

  // Counts
  const pendingCount = payments.filter((p) => p.status === 'PENDING').length;
  const verifiedCount = payments.filter((p) => p.status === 'VERIFIED').length;
  const rejectedCount = payments.filter((p) => p.status === 'REJECTED').length;
  const totalVerifiedAmount = payments.filter((p) => p.status === 'VERIFIED').reduce((sum, p) => sum + p.amount, 0);

  // Total Kas Bank Live
  const primaryAccount = bankAccounts.find(a => a.isPrimary) || bankAccounts[0];
  const totalAllKas = bankAccounts.reduce((acc, a) => acc + (a.balance || 0), 0);

  // ================= VERIFY & REJECT =================
  const handleVerify = async (paymentId: string) => {
    try {
      await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, verifierUserId: 'user-bendahara', verifierName: 'Hendra Wijaya' }),
      });
      const updated = payments.map((p) => {
        if (p.id === paymentId) {
          return { ...p, status: 'VERIFIED' as const, verifiedAt: new Date().toISOString() };
        }
        return p;
      });
      updatePaymentsState(updated);
      setViewingProof(null);
      showToast('Pembayaran berhasil diverifikasi & kuitansi resmi diterbitkan!');
    } catch (err) {
      console.error(err);
      showToast('Gagal memverifikasi pembayaran.');
    }
  };

  const handleReject = async (paymentId: string) => {
    try {
      await fetch('/api/payments/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, reason: rejectionReasonInput }),
      });
      const updated = payments.map((p) => {
        if (p.id === paymentId) {
          return { ...p, status: 'REJECTED' as const, rejectionReason: rejectionReasonInput };
        }
        return p;
      });
      updatePaymentsState(updated);
      setRejectingId(null);
      setViewingProof(null);
      showToast('Pembayaran ditandai ditolak.');
    } catch (err) {
      console.error(err);
      showToast('Gagal menolak pembayaran.');
    }
  };

  // Bulk Verification
  const handleBulkVerify = async () => {
    if (selectedPaymentIds.length === 0) return;
    setBulkProcessing(true);
    try {
      for (const id of selectedPaymentIds) {
        await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId: id, verifierUserId: 'user-bendahara', verifierName: 'Hendra Wijaya' }),
        }).catch(() => {});
      }
      const updated = payments.map((p) => {
        if (selectedPaymentIds.includes(p.id)) {
          return { ...p, status: 'VERIFIED' as const, verifiedAt: new Date().toISOString() };
        }
        return p;
      });
      updatePaymentsState(updated);
      showToast(`${selectedPaymentIds.length} pembayaran berhasil diverifikasi massal!`);
      setSelectedPaymentIds([]);
    } catch (err) {
      console.error(err);
      showToast('Terjadi kesalahan verifikasi massal.');
    } finally {
      setBulkProcessing(false);
    }
  };

  // ================= OPEN MODALS =================
  const handleOpenEditPayment = (pay: PaymentListItem) => {
    setEditingPaymentId(pay.id);
    setFormHouseCode(pay.propertyCode);
    setFormOwnerName(`Warga Rumah ${pay.propertyCode}`);
    setFormPeriod('Agustus 2026');
    setFormAmount(pay.amount);
    setFormMethod(pay.method as any);
    setFormRef(pay.reference || '');
    setFormPaidDate(pay.paidAt ? pay.paidAt.slice(0, 10) : '2026-08-28');
    setFormStatus(pay.status as any);
    setFormNotes(pay.notes || '');
    setShowManualModal(true);
  };

  const handleOpenCreatePayment = (prefillHouse?: string) => {
    setEditingPaymentId(null);
    setFormHouseCode(prefillHouse || 'A-17');
    setFormOwnerName(prefillHouse ? `Warga Rumah ${prefillHouse}` : 'Budi Santoso');
    setFormPeriod('Agustus 2026');
    setFormAmount(750000);
    setFormMethod('BCA_TRANSFER');
    setFormRef(`TRX-${(prefillHouse || 'A17').replace(/[^A-Z0-9]/g, '')}-${Date.now().toString().slice(-4)}`);
    setFormPaidDate(new Date().toISOString().slice(0, 10));
    setFormStatus('VERIFIED');
    setFormNotes('Setoran iuran IPL');
    setShowManualModal(true);
  };

  // Open Edit Bank Account Modal
  const handleOpenEditBank = (acc: BankAccount) => {
    setEditingBankId(acc.id);
    setBBankName(acc.bankName);
    setBAccountNumber(acc.accountNumber);
    setBAccountHolder(acc.accountHolder);
    setBBalance(acc.balance);
    setBQrisNmid(acc.qrisNmid || 'ID102008891230');
    setBNotes(acc.notes || '');
    setShowBankEditModal(true);
  };

  const handleSaveBankAccounts = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = bankAccounts.map(a => {
      if (a.id === editingBankId) {
        return {
          ...a,
          bankName: bBankName,
          accountNumber: bAccountNumber,
          accountHolder: bAccountHolder,
          balance: Number(bBalance),
          qrisNmid: bQrisNmid,
          notes: bNotes,
        };
      }
      return a;
    });

    setBankAccounts(updated);
    savePersisted('wargahub_bank_accounts', updated);

    // Sync settings to backend API
    await fetch('/api/settings/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        communityName: 'Komplek Taman Sejahtera',
        rtRw: 'RT 04 / RW 09',
        address: 'Jl. Graha Raya No. 88',
        monthlyRate: 750000,
        bankName: bBankName,
        bankAccount: bAccountNumber,
        accountHolder: bAccountHolder,
        securityPhone: '0812-3456-7801',
        rwHeadPhone: '0812-9988-7766',
      })
    }).catch(() => {});

    setShowBankEditModal(false);
    showToast('Informasi rekening bank kas paguyuban berhasil diperbarui!');
  };

  // Save Payment (Create or Edit)
  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPayment(true);
    try {
      if (editingPaymentId) {
        const res = await fetch('/api/payments/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentId: editingPaymentId,
            amount: Number(formAmount),
            method: formMethod,
            reference: formRef,
            status: formStatus,
            paidAt: formPaidDate,
            notes: formNotes,
          }),
        });

        if (res.ok) {
          const updated = payments.map((p) =>
            p.id === editingPaymentId
              ? {
                  ...p,
                  propertyCode: formHouseCode.toUpperCase(),
                  amount: Number(formAmount),
                  method: formMethod,
                  reference: formRef,
                  status: formStatus,
                  paidAt: formPaidDate,
                  notes: formNotes,
                }
              : p
          );
          updatePaymentsState(updated);
          showToast(`Data pembayaran Rumah ${formHouseCode} berhasil diperbarui.`);
          setShowManualModal(false);
        }
      } else {
        const res = await fetch('/api/payments/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            propertyCode: formHouseCode.toUpperCase(),
            ownerName: formOwnerName,
            periodName: formPeriod,
            amount: Number(formAmount),
            method: formMethod,
            reference: formRef,
            paidAt: formPaidDate,
            status: formStatus,
            notes: formNotes,
          }),
        });

        if (res.ok) {
          const newPay: PaymentListItem = {
            id: `pay-${Date.now()}`,
            invoiceId: `inv-${Date.now()}`,
            propertyCode: formHouseCode.toUpperCase(),
            amount: Number(formAmount),
            method: formMethod,
            reference: formRef,
            proofUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
            proofFileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
            status: formStatus,
            paidAt: formPaidDate,
            notes: formNotes || null,
            verifiedAt: formStatus === 'VERIFIED' ? new Date().toISOString() : null,
          };
          const updated = [newPay, ...payments];
          updatePaymentsState(updated);
          showToast(`Pembayaran manual Rumah ${formHouseCode} berhasil dicatat.`);
          setShowManualModal(false);
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan data pembayaran.');
    } finally {
      setSavingPayment(false);
    }
  };

  // Confirm Single Delete Payment (Permanent localStorage & API)
  const handleConfirmDeletePayment = async () => {
    if (!paymentToDelete) return;
    try {
      const res = await fetch('/api/payments/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: paymentToDelete.id,
          propertyCode: paymentToDelete.propertyCode,
          amount: paymentToDelete.amount,
          reason: deleteReason,
        }),
      });

      if (res.ok) {
        const nextList = payments.filter((p) => p.id !== paymentToDelete.id);
        updatePaymentsState(nextList);
        addDeletedIds('wargahub_deleted_payments', [paymentToDelete.id, paymentToDelete.propertyCode]);
        showToast(`Catatan pembayaran ${paymentToDelete.propertyCode} berhasil dihapus.`);
        setPaymentToDelete(null);
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menghapus pembayaran.');
    }
  };

  // Confirm Bulk Delete Payments
  const handleConfirmBulkDelete = async () => {
    if (selectedPaymentIds.length === 0) return;
    setBulkProcessing(true);
    try {
      const selectedProps = payments.filter(p => selectedPaymentIds.includes(p.id)).map(p => p.propertyCode);
      const res = await fetch('/api/payments/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: selectedPaymentIds,
          reason: `Penghapusan massal ${selectedPaymentIds.length} transaksi pembayaran`,
        }),
      });

      if (res.ok) {
        const nextList = payments.filter((p) => !selectedPaymentIds.includes(p.id));
        updatePaymentsState(nextList);
        addDeletedIds('wargahub_deleted_payments', [...selectedPaymentIds, ...selectedProps]);
        showToast(`${selectedPaymentIds.length} data pembayaran berhasil dihapus secara massal.`);
        setSelectedPaymentIds([]);
        setShowBulkDeleteModal(false);
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menghapus pembayaran massal.');
    } finally {
      setBulkProcessing(false);
    }
  };

  // Toggle Selection
  const handleToggleSelectAll = () => {
    if (paginatedPayments.length > 0 && paginatedPayments.every(p => selectedPaymentIds.includes(p.id))) {
      setSelectedPaymentIds(prev => prev.filter(id => !paginatedPayments.some(p => p.id === id)));
    } else {
      const pageIds = paginatedPayments.map(p => p.id);
      setSelectedPaymentIds(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedPaymentIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Filtered & Sorted Payments
  const filteredAndSorted = useMemo(() => {
    const list = payments.filter((p) => {
      const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
      const matchSearch =
        p.propertyCode.toLowerCase().includes(search.toLowerCase()) ||
        (p.reference && p.reference.toLowerCase().includes(search.toLowerCase()));

      let matchArea = true;
      if (areaFilter !== 'ALL') {
        if (areaFilter === 'KAV') matchArea = p.propertyCode.toLowerCase().startsWith('kav');
        else if (areaFilter === 'SARIWANGI_1') matchArea = p.propertyCode.toLowerCase().startsWith('sw1');
        else if (areaFilter === 'SARIWANGI_2') matchArea = p.propertyCode.toLowerCase().startsWith('sw2');
        else matchArea = p.propertyCode.startsWith(areaFilter);
      }

      return matchStatus && matchSearch && matchArea;
    });

    list.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') comparison = (a.paidAt || '').localeCompare(b.paidAt || '');
      else if (sortBy === 'code') comparison = a.propertyCode.localeCompare(b.propertyCode, undefined, { numeric: true });
      else if (sortBy === 'amount') comparison = a.amount - b.amount;
      else if (sortBy === 'status') comparison = a.status.localeCompare(b.status);
      else if (sortBy === 'method') comparison = a.method.localeCompare(b.method);
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return list;
  }, [payments, statusFilter, areaFilter, search, sortBy, sortOrder]);

  // Pagination
  const totalFiltered = filteredAndSorted.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalFiltered);
  const paginatedPayments = filteredAndSorted.slice(startIndex, endIndex);

  // Copy Public Link
  const publicTransparencyUrl = typeof window !== 'undefined' ? `${window.location.origin}/transparency` : 'http://localhost:4321/transparency';
  const handleCopyPublicLink = () => {
    navigator.clipboard.writeText(publicTransparencyUrl);
    setCopiedLink(true);
    showToast('Tautan publik transparansi iuran berhasil disalin!');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Export CSV
  const handleExportPaymentsCSV = () => {
    const headers = ['ID Pembayaran', 'Kode Unit', 'Nominal (Rp)', 'Metode Pembayaran', 'Referensi Bank', 'Waktu Bayar', 'Status Verifikasi'];
    const rows = payments.map((p) => [
      p.id,
      `"${p.propertyCode}"`,
      p.amount,
      `"${p.method}"`,
      `"${p.reference || '-'}"`,
      `"${p.paidAt}"`,
      `"${p.status}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `REKAPITULASI_MUTASI_PEMBAYARAN_WARGA_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Daftar mutasi pembayaran berhasil diekspor ke CSV.');
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-xl font-bold text-xs animate-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black tracking-tight text-ink flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-emerald-600" />
              Pembayaran & Verifikasi Iuran
            </h1>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-black border border-amber-300 animate-pulse">
                {pendingCount} Menunggu Verifikasi
              </span>
            )}
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Verifikasi setoran bukti transfer BCA/QRIS warga, penerbitan kuitansi ber-QR code resmi, rekonsiliasi kas, dan rekapitulasi iuran terbuka.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportPaymentsCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-surface hover:bg-canvas border border-border text-ink text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-ink-muted" />
            Ekspor Mutasi (CSV)
          </button>
          <button
            type="button"
            onClick={() => handleOpenCreatePayment()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Catat Pembayaran Manual
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
            className="px-3.5 py-2 bg-white hover:bg-emerald-100 text-emerald-900 font-bold rounded-xl border border-emerald-300 shadow-2xs inline-flex items-center gap-1.5 transition-colors"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-emerald-700" />}
            Salin Link Publik
          </button>
          <a
            href={publicTransparencyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-2xs inline-flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Buka Halaman Publik
          </a>
        </div>
      </div>

      {/* 4 Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 p-1.5 bg-surface rounded-2xl border border-border shadow-xs overflow-x-auto no-scrollbar">
        {[
          { id: 'verification', label: 'Verifikasi Pembayaran Masuk', icon: Hourglass, count: pendingCount },
          { id: 'public_transparency', label: 'Rekapitulasi Transparansi Warga (Lunas vs Belum)', icon: Eye, count: verifiedCount },
          { id: 'bank_recon', label: 'Rekonsiliasi Bank & Pengaturan Rekening Kas', icon: Building },
          { id: 'manual_entry', label: 'Catat Setoran Manual / Tunai', icon: PlusCircle },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-ink-muted hover:text-ink hover:bg-canvas'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                  isActive ? 'bg-white/20 text-white' : 'bg-canvas text-ink-muted border border-border'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ================= SUBTAB 1: VERIFIKASI PEMBAYARAN MASUK ================= */}
      {activeSubTab === 'verification' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[11px] font-semibold text-ink-muted">Setoran Terverifikasi</span>
              <p className="text-xl font-black text-emerald-700 mt-1 tabular-nums">{formatRupiah(totalVerifiedAmount)}</p>
              <span className="text-[10px] text-emerald-700 font-bold mt-0.5 block">{verifiedCount} Transaksi Lunas</span>
            </div>

            <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[11px] font-semibold text-ink-muted">Menunggu Verifikasi</span>
              <p className="text-xl font-black text-amber-700 mt-1 tabular-nums">{pendingCount} Bukti</p>
              <span className="text-[10px] text-amber-700 font-bold mt-0.5 block">Perlu dicek bendahara</span>
            </div>

            <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[11px] font-semibold text-ink-muted">Bukti Ditolak</span>
              <p className="text-xl font-black text-rose-700 mt-1 tabular-nums">{rejectedCount} Transaksi</p>
              <span className="text-[10px] text-rose-700 font-bold mt-0.5 block">Tidak sesuai nominal</span>
            </div>

            <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-ink-muted">Saldo Kas Paguyuban</span>
                <button
                  type="button"
                  onClick={() => handleOpenEditBank(primaryAccount)}
                  className="text-[10px] text-primary-600 font-bold hover:underline"
                >
                  Edit Rekening
                </button>
              </div>
              <p className="text-xl font-black text-primary-700 mt-1 tabular-nums">{formatRupiah(totalAllKas)}</p>
              <span className="text-[10px] text-emerald-600 font-bold mt-0.5 block truncate">{primaryAccount.bankName} {primaryAccount.accountNumber}</span>
            </div>
          </div>

          {/* Floating Bulk Action Bar */}
          {selectedPaymentIds.length > 0 && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in shadow-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                  {selectedPaymentIds.length}
                </span>
                <div>
                  <p className="font-bold text-xs text-emerald-950">
                    {selectedPaymentIds.length} Transaksi Pembayaran Terpilih
                  </p>
                  <p className="text-[11px] text-emerald-700">
                    Pilih aksi massal untuk transaksi yang telah diceklis.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPaymentIds([])}
                  className="px-3.5 py-2 rounded-xl border border-emerald-200 bg-surface text-ink text-xs font-bold hover:bg-canvas"
                >
                  Batalkan Pilihan
                </button>
                <button
                  type="button"
                  disabled={bulkProcessing}
                  onClick={handleBulkVerify}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Verifikasi Massal ({selectedPaymentIds.length})</span>
                </button>
                <button
                  type="button"
                  disabled={bulkProcessing}
                  onClick={() => setShowBulkDeleteModal(true)}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Massal</span>
                </button>
              </div>
            </div>
          )}

          {/* Filters, Wilayah & Search Bar */}
          <div className="bg-surface p-4 rounded-2xl border border-border shadow-card flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="w-full sm:w-72 relative">
              <Search className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari kode rumah (cth: A-17, SW1), no ref..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
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
                <option value="SARIWANGI_1">Jl. Sariwangi 1</option>
                <option value="SARIWANGI_2">Jl. Sariwangi 2</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="ALL">Semua Status ({payments.length})</option>
                <option value="PENDING">Menunggu Verifikasi ({pendingCount})</option>
                <option value="VERIFIED">Terverifikasi Lunas ({verifiedCount})</option>
                <option value="REJECTED">Ditolak ({rejectedCount})</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="date">Urut Waktu Bayar</option>
                <option value="code">Urut Kode Rumah</option>
                <option value="amount">Urut Nominal</option>
                <option value="status">Urut Status</option>
                <option value="method">Urut Metode</option>
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

          {/* Payments Table with Pagination & Action Suite */}
          <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-canvas border-b border-border text-ink-muted font-bold">
                  <tr>
                    <th className="py-3.5 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={paginatedPayments.length > 0 && paginatedPayments.every(p => selectedPaymentIds.includes(p.id))}
                        onChange={handleToggleSelectAll}
                        className="rounded border-border text-emerald-600"
                      />
                    </th>
                    <th className="py-3.5 px-4">Rumah / Unit</th>
                    <th className="py-3.5 px-4">Jumlah Pembayaran</th>
                    <th className="py-3.5 px-4">Metode & No. Referensi</th>
                    <th className="py-3.5 px-4">Waktu Transaksi</th>
                    <th className="py-3.5 px-4 text-center">Status Verifikasi</th>
                    <th className="py-3.5 px-4 text-right">Aksi & Kuitansi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {paginatedPayments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-ink-muted font-medium">
                        Tidak ada transaksi pembayaran yang cocok dengan filter.
                      </td>
                    </tr>
                  ) : (
                    paginatedPayments.map((pay) => {
                      const isVerified = pay.status === 'VERIFIED';
                      const isPending = pay.status === 'PENDING';
                      const isSelected = selectedPaymentIds.includes(pay.id);
                      return (
                        <tr key={pay.id} className={`hover:bg-canvas/50 text-ink transition-colors ${isSelected ? 'bg-emerald-50/40' : ''}`}>
                          <td className="py-3.5 px-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectOne(pay.id)}
                              className="rounded border-border text-emerald-600"
                            />
                          </td>
                          <td className="py-3.5 px-4 font-black text-primary-700 text-sm">
                            Rumah {pay.propertyCode}
                          </td>
                          <td className="py-3.5 px-4 font-black tabular-nums text-ink text-sm">
                            {formatRupiah(pay.amount)}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-ink block">{pay.method.replace('_', ' ')}</span>
                            <span className="font-mono text-[10px] text-ink-muted">{pay.reference || '-'}</span>
                          </td>
                          <td className="py-3.5 px-4 text-ink-muted font-mono">
                            {pay.paidAt}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {isVerified && (
                              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-black text-[10px] border border-emerald-300">
                                ✓ TERVERIFIKASI
                              </span>
                            )}
                            {isPending && (
                              <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 font-black text-[10px] border border-amber-300 animate-pulse">
                                ⏳ MENUNGGU
                              </span>
                            )}
                            {pay.status === 'REJECTED' && (
                              <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 font-black text-[10px] border border-rose-300">
                                ✕ DITOLAK
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1">
                              {/* Bukti Transfer */}
                              <button
                                type="button"
                                onClick={() => setViewingProof(pay)}
                                className="px-2.5 py-1 bg-surface hover:bg-canvas border border-border text-ink rounded-lg font-bold inline-flex items-center gap-1 text-[11px] shadow-2xs"
                                title="Lihat Bukti Transfer"
                              >
                                <Eye className="w-3.5 h-3.5 text-primary-600" />
                                {isPending ? 'Verifikasi' : 'Bukti'}
                              </button>

                              {/* Kuitansi Resmi */}
                              {isVerified && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedReceipt({
                                      invoiceNumber: `INV-202608-${pay.propertyCode.replace(/[^A-Z0-9]/g, '')}`,
                                      periodName: 'Agustus 2026',
                                      propertyCode: pay.propertyCode,
                                      residentName: `Warga Rumah ${pay.propertyCode}`,
                                      amount: pay.amount,
                                      paidAt: pay.paidAt || '28 Agustus 2026',
                                      paymentMethod: pay.method,
                                      referenceNumber: pay.reference || `TRX-${pay.propertyCode}`,
                                    })
                                  }
                                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-bold inline-flex items-center gap-1 text-[11px]"
                                  title="Lihat / Cetak Kuitansi Resmi"
                                >
                                  <Printer className="w-3.5 h-3.5" /> Kuitansi
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleOpenEditPayment(pay)}
                                className="p-1.5 text-amber-700 hover:bg-amber-50 rounded-lg font-bold"
                                title="Edit Pembayaran"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setPaymentToDelete(pay)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg font-bold"
                                title="Hapus Catatan Pembayaran"
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
                  Menampilkan <strong className="text-ink">{totalFiltered === 0 ? 0 : startIndex + 1}</strong> - <strong className="text-ink">{endIndex}</strong> dari <strong className="text-ink">{totalFiltered}</strong> transaksi
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
                            ? 'bg-emerald-600 text-white shadow-xs'
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

      {/* ================= SUBTAB 2: REKAPITULASI TRANSPARANSI WARGA ================= */}
      {activeSubTab === 'public_transparency' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="p-5 bg-surface rounded-3xl border border-border shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <h3 className="font-black text-base text-ink flex items-center gap-2">
                  <Eye className="w-5 h-5 text-emerald-600" />
                  Status Rekapitulasi Iuran Warga Terbuka (Agustus 2026)
                </h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  Menampilkan unit rumah yang telah diverifikasi lunas dan unit yang masih belum bayar pada periode aktif.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const content = `LAPORAN TRANSPARANSI IURAN WARGA - AGUSTUS 2026\n================================================\nTotal Terverifikasi Lunas: ${verifiedCount} Unit (${formatRupiah(totalVerifiedAmount)})\n\nDaftar Unit Lunas:\n${payments.filter(p => p.status === 'VERIFIED').map(p => `- Rumah ${p.propertyCode}: ${formatRupiah(p.amount)} (${p.paidAt})`).join('\n')}\n\nDaftar Unit Belum Lunas:\n${payments.filter(p => p.status !== 'VERIFIED').map(p => `- Rumah ${p.propertyCode}: ${formatRupiah(p.amount)} [${p.status}]`).join('\n')}\n\nDicetak pada: ${new Date().toLocaleString('id-ID')}`;
                    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `REKAP_TRANSPARANSI_IURAN_${new Date().toISOString().slice(0, 10)}.txt`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    showToast('Laporan transparansi berhasil diunduh.');
                  }}
                  className="px-3.5 py-2 bg-surface hover:bg-canvas border border-border text-ink rounded-xl font-bold text-xs inline-flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-primary-600" />
                  Unduh Laporan (.txt)
                </button>
                <button
                  type="button"
                  onClick={handleCopyPublicLink}
                  className="px-3.5 py-2 bg-emerald-50 text-emerald-800 rounded-xl font-bold text-xs border border-emerald-300 inline-flex items-center gap-1.5 shadow-xs"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Salin Tautan Publik
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* LUNAS SECTION */}
              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-emerald-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Unit Sudah Lunas ({verifiedCount} Unit)
                  </h4>
                  <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-black">
                    TERVERIFIKASI
                  </span>
                </div>
                <div className="max-h-96 overflow-y-auto space-y-1.5 pr-1">
                  {payments.filter((p) => p.status === 'VERIFIED').map((p) => (
                    <div key={p.id} className="p-3 bg-white rounded-xl border border-emerald-200 flex items-center justify-between shadow-2xs">
                      <div>
                        <span className="font-black text-ink text-sm">Rumah {p.propertyCode}</span>
                        <span className="text-[10px] text-ink-muted block">{p.method.replace('_', ' ')} • {p.reference || 'BCA Auto'}</span>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <div>
                          <span className="font-black text-emerald-700 block">{formatRupiah(p.amount)}</span>
                          <span className="text-[9px] font-mono text-emerald-600">Lunas {p.paidAt}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedReceipt({
                              invoiceNumber: `INV-202608-${p.propertyCode.replace(/[^A-Z0-9]/g, '')}`,
                              periodName: 'Agustus 2026',
                              propertyCode: p.propertyCode,
                              residentName: `Warga Rumah ${p.propertyCode}`,
                              amount: p.amount,
                              paidAt: p.paidAt || '28 Agustus 2026',
                              paymentMethod: p.method,
                              referenceNumber: p.reference || `TRX-${p.propertyCode}`,
                            })
                          }
                          className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg"
                          title="Cetak Kuitansi"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* BELUM LUNAS SECTION WITH WHATSAPP REMINDER */}
              <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-rose-950 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-rose-600" />
                    Unit Menunggu Verifikasi / Belum Bayar
                  </h4>
                  <span className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-black">
                    DALAM PROSES
                  </span>
                </div>
                <div className="max-h-96 overflow-y-auto space-y-1.5 pr-1">
                  {payments.filter((p) => p.status !== 'VERIFIED').map((p) => (
                    <div key={p.id} className="p-3 bg-white rounded-xl border border-rose-200 flex items-center justify-between shadow-2xs">
                      <div>
                        <span className="font-black text-ink text-sm">Rumah {p.propertyCode}</span>
                        <span className="text-[10px] text-ink-muted block">Status: <strong>{p.status}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-rose-700 tabular-nums">{formatRupiah(p.amount)}</span>
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(`Yth. Bpk/Ibu Warga Rumah ${p.propertyCode}, menginfokan bahwa tagihan iuran IPL komplek periode Agustus 2026 sebesar ${formatRupiah(p.amount)} siap dibayarkan ke Rekening Kas BCA 8830-1928-33 a.n PENGURUS KOMPLEK. Terima kasih!`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg flex items-center gap-1 text-[10px] font-bold"
                          title="Kirim Pengingat WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>WA</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => handleOpenCreatePayment(p.propertyCode)}
                          className="px-2 py-1 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-[10px]"
                        >
                          Bayar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUBTAB 3: REKONSILIASI BANK BCA & PENGATURAN REKENING KAS ================= */}
      {activeSubTab === 'bank_recon' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Header Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-ink flex items-center gap-2">
                <Building className="w-5 h-5 text-primary-600" />
                Rekening Kas & Integrasi Rekonsiliasi Bank BCA / QRIS
              </h3>
              <p className="text-xs text-ink-muted mt-0.5">
                Kelola data rekening bank kas paguyuban, saldo awal kas, gateway QRIS dinamis, dan pencocokan mutasi otomatis.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleOpenEditBank(primaryAccount)}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Data Rekening Bank & QRIS</span>
            </button>
          </div>

          {/* 3 Bank / Cash Account Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {bankAccounts.map((acc) => (
              <div key={acc.id} className="p-5 bg-surface rounded-2xl border border-border shadow-card space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center font-black">
                    {acc.accountType === 'BANK_OPERASIONAL' ? <Building className="w-4 h-4" /> : acc.accountType === 'QRIS_DINAMIS' ? <QrCode className="w-4 h-4" /> : <Wallet className="w-4 h-4" />}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${acc.isPrimary ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                    {acc.isPrimary ? 'REKENING UTAMA' : 'KAS OPERASIONAL'}
                  </span>
                </div>

                <div>
                  <h4 className="font-black text-sm text-ink">{acc.bankName}</h4>
                  <p className="font-mono font-bold text-primary-700 text-xs mt-0.5">{acc.accountNumber}</p>
                  <p className="text-[11px] text-ink-muted mt-0.5">a.n {acc.accountHolder}</p>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-ink-muted block">Saldo Kas Terkini:</span>
                    <span className="font-black text-emerald-700 text-sm font-mono">{formatRupiah(acc.balance)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenEditBank(acc)}
                    className="p-1.5 bg-canvas hover:bg-surface border border-border text-ink rounded-lg font-bold"
                    title="Ubah Data Rekening"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-primary-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Live Bank Feed Auto-Matching Table */}
          <div className="p-5 bg-surface rounded-2xl border border-border shadow-card space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-ink flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  Riwayat Feed Mutasi Bank & Auto-Reconciliation
                </h4>
                <p className="text-ink-muted text-[11px] mt-0.5">
                  Sistem otomatis mencocokkan mutasi rekening koran dengan tagihan rumah warga berdasarkan nominal dan berita transfer.
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 rounded-xl">
                Tingkat Kecocokan: 100% (Auto-Matched)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border bg-canvas text-ink-muted font-bold">
                    <th className="py-3 px-4">Waktu Mutasi</th>
                    <th className="py-3 px-4">Keterangan Transaksi</th>
                    <th className="py-3 px-4">Tipe</th>
                    <th className="py-3 px-4">Nominal</th>
                    <th className="py-3 px-4">Unit Terhubung</th>
                    <th className="py-3 px-4 text-center">Status Rekon</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {statementFeeds.map(feed => (
                    <tr key={feed.id} className="hover:bg-canvas/50">
                      <td className="py-3 px-4 font-mono text-ink-muted">{feed.date}</td>
                      <td className="py-3 px-4 font-bold text-ink">{feed.description}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded font-black font-mono text-[10px] ${feed.type === 'CR' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          {feed.type === 'CR' ? '+ KREDIT (MASUK)' : '- DEBIT (KELUAR)'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-black font-mono text-ink">{formatRupiah(feed.amount)}</td>
                      <td className="py-3 px-4 font-bold text-primary-700">{feed.matchedHouse ? `Rumah ${feed.matchedHouse}` : '-'}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-bold text-[10px]">
                          ✓ MATCHED
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUBTAB 4: CATAT MANUAL PEMBAYARAN ================= */}
      {activeSubTab === 'manual_entry' && (
        <div className="space-y-4 max-w-2xl animate-in fade-in duration-150">
          <div className="p-6 bg-surface rounded-3xl border border-border shadow-card space-y-4 text-xs">
            <h3 className="font-black text-base text-ink flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-emerald-600" />
              Catat Penerimaan Setoran Iuran Manual / Tunai
            </h3>
            <p className="text-ink-muted">
              Gunakan formulir ini untuk mencatat pembayaran tunai yang diterima langsung oleh bendahara atau transfer manual yang belum masuk sistem.
            </p>

            <form onSubmit={handleSavePayment} className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">Kode Unit Rumah *</label>
                  <input
                    type="text"
                    placeholder="Contoh: A-17 / B-04 / KAV-02"
                    value={formHouseCode}
                    onChange={(e) => setFormHouseCode(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Nama Pembayar</label>
                  <input
                    type="text"
                    placeholder="Budi Santoso"
                    value={formOwnerName}
                    onChange={(e) => setFormOwnerName(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">Nominal Iuran (Rp) *</label>
                  <input
                    type="number"
                    value={formAmount}
                    onChange={(e) => setFormAmount(Number(e.target.value))}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold font-mono text-ink"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Metode Pembayaran</label>
                  <select
                    value={formMethod}
                    onChange={(e) => setFormMethod(e.target.value as any)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="BCA_TRANSFER">Transfer Bank BCA</option>
                    <option value="CASH">Tunai / Cash (Diterima Bendahara)</option>
                    <option value="QRIS">QRIS Dinamis</option>
                    <option value="MANDIRI_TRANSFER">Transfer Bank Mandiri</option>
                    <option value="BRI_TRANSFER">Transfer Bank BRI</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">No. Referensi Bank / Nota</label>
                  <input
                    type="text"
                    placeholder="TRX-A17-8891"
                    value={formRef}
                    onChange={(e) => setFormRef(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Tanggal Pembayaran *</label>
                  <input
                    type="date"
                    value={formPaidDate}
                    onChange={(e) => setFormPaidDate(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-medium text-ink"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Catatan Tambahan</label>
                <input
                  type="text"
                  placeholder="Contoh: Iuran IPL + sumbangan kebersihan fasum"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <button
                type="submit"
                disabled={savingPayment}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                {savingPayment ? 'Menyimpan...' : 'Simpan Pembayaran & Terbitkan Kuitansi'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT DATA REKENING BANK KAS PAGUYUBAN ================= */}
      {showBankEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-border shadow-modal space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-base text-ink flex items-center gap-2">
                <Building className="w-5 h-5 text-primary-600" />
                <span>Edit Informasi Rekening Kas Paguyuban</span>
              </h3>
              <button onClick={() => setShowBankEditModal(false)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            <form onSubmit={handleSaveBankAccounts} className="space-y-3">
              <div>
                <label className="font-bold text-ink block mb-1">Pilih Rekening Kas untuk Diedit *</label>
                <select
                  value={editingBankId}
                  onChange={(e) => {
                    const acc = bankAccounts.find(a => a.id === e.target.value);
                    if (acc) {
                      setEditingBankId(acc.id);
                      setBBankName(acc.bankName);
                      setBAccountNumber(acc.accountNumber);
                      setBAccountHolder(acc.accountHolder);
                      setBBalance(acc.balance);
                      setBQrisNmid(acc.qrisNmid || 'ID102008891230');
                      setBNotes(acc.notes || '');
                    }
                  }}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                >
                  {bankAccounts.map(a => (
                    <option key={a.id} value={a.id}>{a.bankName} ({a.accountNumber})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Nama Bank / Gateway *</label>
                <input
                  type="text"
                  placeholder="Contoh: Bank Central Asia (BCA)"
                  value={bBankName}
                  onChange={(e) => setBBankName(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">Nomor Rekening / No Kas *</label>
                  <input
                    type="text"
                    placeholder="8830-1928-33"
                    value={bAccountNumber}
                    onChange={(e) => setBAccountNumber(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono font-bold text-ink"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Saldo Kas Terkini (Rp) *</label>
                  <input
                    type="number"
                    value={bBalance}
                    onChange={(e) => setBBalance(Number(e.target.value))}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono font-bold text-ink"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Atas Nama Rekening (Pemilik / Paguyuban) *</label>
                <input
                  type="text"
                  placeholder="PENGURUS KOMPLEK WARGAHUB"
                  value={bAccountHolder}
                  onChange={(e) => setBAccountHolder(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                />
              </div>

              {editingBankId === 'acc-qris-01' && (
                <div>
                  <label className="font-bold text-ink block mb-1">NMID QRIS Standar Bank Indonesia</label>
                  <input
                    type="text"
                    value={bQrisNmid}
                    onChange={(e) => setBQrisNmid(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink"
                  />
                </div>
              )}

              <div>
                <label className="font-bold text-ink block mb-1">Catatan Keterangan</label>
                <input
                  type="text"
                  placeholder="Contoh: Rekening operasional utama iuran IPL"
                  value={bNotes}
                  onChange={(e) => setBNotes(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowBankEditModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-xs"
                >
                  Simpan Perubahan Rekening
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: LIHAT / VERIFIKASI BUKTI TRANSFER ================= */}
      {viewingProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-lg w-full p-6 border border-border shadow-modal space-y-4 max-h-[92vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-black text-sm text-ink">
                  Verifikasi Pembayaran: Rumah {viewingProof.propertyCode}
                </h3>
                <p className="text-[11px] text-ink-muted">Periksa nominal dan keabsahan bukti transfer bank</p>
              </div>
              <button onClick={() => setViewingProof(null)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            {/* Bukti Transfer Image Mockup */}
            <div className="bg-canvas p-3 rounded-2xl border border-border space-y-2">
              <span className="font-bold text-ink block text-[11px]">Bukti Unggahan Warga:</span>
              <div className="w-full h-56 rounded-xl bg-slate-100 overflow-hidden relative border border-border flex items-center justify-center">
                <img
                  src={viewingProof.proofUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80'}
                  alt="Bukti Transfer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="space-y-2 bg-canvas/60 p-3 rounded-2xl border border-border">
              <div className="flex justify-between">
                <span className="text-ink-muted">Nominal Ditransfer:</span>
                <span className="font-black text-emerald-700 font-mono text-sm">{formatRupiah(viewingProof.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Metode Pembayaran:</span>
                <span className="font-bold text-ink">{viewingProof.method.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">No. Referensi:</span>
                <span className="font-mono text-ink font-bold">{viewingProof.reference || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Waktu Pembayaran:</span>
                <span className="font-mono text-ink">{viewingProof.paidAt}</span>
              </div>
            </div>

            {/* Tombol Aksi Verifikasi / Tolak */}
            {viewingProof.status === 'PENDING' ? (
              <div className="pt-2 space-y-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRejectingId(viewingProof.id)}
                    className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl"
                  >
                    Tolak Pembayaran
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVerify(viewingProof.id)}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                  >
                    ✓ Verifikasi & Terbitkan Kuitansi
                  </button>
                </div>

                {rejectingId === viewingProof.id && (
                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 space-y-2 animate-in fade-in">
                    <label className="font-bold text-rose-900 block text-[11px]">Alasan Penolakan Bukti:</label>
                    <input
                      type="text"
                      value={rejectionReasonInput}
                      onChange={(e) => setRejectionReasonInput(e.target.value)}
                      className="w-full p-2 bg-white border border-rose-300 rounded-lg text-ink font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => handleReject(viewingProof.id)}
                      className="w-full py-1.5 bg-rose-600 text-white font-bold rounded-lg text-xs"
                    >
                      Kirim Notifikasi Penolakan ke Warga
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setViewingProof(null)}
                  className="px-4 py-2 bg-surface border border-border text-ink font-bold rounded-xl"
                >
                  Tutup
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT / CREATE MANUAL PAYMENT ================= */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-border shadow-modal space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-sm text-ink">
                {editingPaymentId ? 'Edit Data Pembayaran' : 'Catat Pembayaran Manual'}
              </h3>
              <button onClick={() => setShowManualModal(false)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            <form onSubmit={handleSavePayment} className="space-y-3">
              <div>
                <label className="font-bold text-ink block mb-1">Kode Unit Rumah *</label>
                <input
                  type="text"
                  value={formHouseCode}
                  onChange={(e) => setFormHouseCode(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">Nominal (Rp) *</label>
                  <input
                    type="number"
                    value={formAmount}
                    onChange={(e) => setFormAmount(Number(e.target.value))}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono font-bold text-ink"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Metode</label>
                  <select
                    value={formMethod}
                    onChange={(e) => setFormMethod(e.target.value as any)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="BCA_TRANSFER">Transfer Bank BCA</option>
                    <option value="CASH">Tunai / Cash</option>
                    <option value="QRIS">QRIS Dinamis</option>
                    <option value="MANDIRI_TRANSFER">Transfer Mandiri</option>
                    <option value="BRI_TRANSFER">Transfer BRI</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">No. Referensi Transfer</label>
                <input
                  type="text"
                  value={formRef}
                  onChange={(e) => setFormRef(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Tanggal Pembayaran *</label>
                <input
                  type="date"
                  value={formPaidDate}
                  onChange={(e) => setFormPaidDate(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Status Pembayaran</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                >
                  <option value="VERIFIED">Terverifikasi (Lunas)</option>
                  <option value="PENDING">Menunggu Verifikasi</option>
                  <option value="REJECTED">Ditolak</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingPayment}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs disabled:opacity-50"
                >
                  {savingPayment ? 'Menyimpan...' : 'Simpan Pembayaran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: KONFIRMASI HAPUS SINGLE PEMBAYARAN ================= */}
      {paymentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-red-200 shadow-modal space-y-4 text-xs">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-black text-base text-ink">Hapus Data Pembayaran {paymentToDelete.propertyCode}?</h3>
              <p className="text-ink-muted">
                Mutasi setoran sebesar <strong>{formatRupiah(paymentToDelete.amount)}</strong> akan dihapus permanen dari buku kas. Tindakan ini tercatat di Jejak Audit.
              </p>
            </div>

            <div>
              <label className="font-bold text-ink block mb-1">Alasan Penghapusan:</label>
              <select
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="w-full p-2 bg-canvas border border-border rounded-xl text-ink font-semibold"
              >
                <option value="Koreksi Input / Pembayaran Ganda">Koreksi Input / Pembayaran Ganda</option>
                <option value="Bukti Transfer Palsu / Dibatalkan Bank">Bukti Transfer Palsu / Dibatalkan Bank</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setPaymentToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeletePayment}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs"
              >
                Ya, Hapus Pembayaran
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: KONFIRMASI HAPUS MASSAL PEMBAYARAN ================= */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-red-200 shadow-modal space-y-4 text-xs">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-black text-base text-ink">Hapus {selectedPaymentIds.length} Data Pembayaran Terpilih?</h3>
              <p className="text-ink-muted">
                Sebanyak <strong>{selectedPaymentIds.length} transaksi pembayaran</strong> yang telah diceklis akan dihapus secara permanen.
              </p>
            </div>

            <div className="max-h-32 overflow-y-auto p-3 bg-canvas rounded-2xl border border-border space-y-1">
              {payments.filter(p => selectedPaymentIds.includes(p.id)).map(p => (
                <div key={p.id} className="flex justify-between items-center text-ink py-0.5">
                  <span className="font-bold">Rumah {p.propertyCode}</span>
                  <span className="font-mono text-ink-muted">{formatRupiah(p.amount)}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                disabled={bulkProcessing}
                onClick={() => setShowBulkDeleteModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={bulkProcessing}
                onClick={handleConfirmBulkDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{bulkProcessing ? 'Menghapus...' : `Ya, Hapus (${selectedPaymentIds.length})`}</span>
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
