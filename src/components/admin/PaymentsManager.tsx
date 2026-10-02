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
  Square,
  Plus,
  FileText
} from 'lucide-react';
import { formatRupiah } from '../../lib/format';
import { ReceiptModal } from '../shared/ReceiptModal';
import type { PaymentListItem } from '../../services/payment.service';

export const POPULAR_PAYMENT_SUGGESTIONS = [
  { name: 'Bank Syariah Indonesia (BSI)', category: 'Bank Syariah' },
  { name: 'Bank Muamalat', category: 'Bank Syariah' },
  { name: 'BCA Syariah', category: 'Bank Syariah' },
  { name: 'Bank Aladin Syariah', category: 'Bank Syariah' },
  { name: 'Bank Jago Syariah', category: 'Bank Syariah' },
  { name: 'GoPay', category: 'E-Wallet' },
  { name: 'DANA', category: 'E-Wallet' },
  { name: 'OVO', category: 'E-Wallet' },
  { name: 'ShopeePay', category: 'E-Wallet' },
  { name: 'LinkAja', category: 'E-Wallet' },
  { name: 'Bank Jago', category: 'Bank Digital' },
  { name: 'SeaBank', category: 'Bank Digital' },
  { name: 'Blu by BCA', category: 'Bank Digital' },
  { name: 'Bank Neo Commerce', category: 'Bank Digital' },
  { name: 'Allobank', category: 'Bank Digital' },
  { name: 'Jenius (BTPN)', category: 'Bank Digital' },
  { name: 'Bank Mandiri', category: 'Bank Konvensional' },
  { name: 'Transfer Bank BCA', category: 'Bank Konvensional' },
  { name: 'Bank BRI', category: 'Bank Konvensional' },
  { name: 'Bank BNI', category: 'Bank Konvensional' },
];

export function formatPaymentMethod(methodStr: string): string {
  if (!methodStr) return 'Transfer Bank / Syariah';
  const m = methodStr.trim();
  if (m === 'BCA_TRANSFER' || m === 'BCA') return 'Transfer Bank BCA';
  if (m === 'MANDIRI_TRANSFER') return 'Transfer Bank Mandiri';
  if (m === 'BRI_TRANSFER') return 'Transfer Bank BRI';
  if (m === 'BNI_TRANSFER') return 'Transfer Bank BNI';
  if (m === 'BSI_TRANSFER' || m === 'BSI') return 'Bank Syariah Indonesia (BSI)';
  if (m === 'MUAMALAT' || m === 'MUAMALAT_TRANSFER') return 'Bank Muamalat (Syariah)';
  if (m === 'CASH_KEPALA_KOMPLEK' || m.toLowerCase().includes('kepala komplek')) return 'Tunai (Diterima Kepala Komplek)';
  if (m === 'CASH') return 'Tunai / Cash';
  if (m === 'QRIS') return 'QRIS Dinamis';
  return m.replace(/_/g, ' ');
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  balance: number;
  isPrimary: boolean;
  accountType: 'BANK_OPERASIONAL' | 'BANK_SYARIAH' | 'E_WALLET' | 'QRIS_DINAMIS' | 'KAS_TUNAI';
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
  initialAccounts?: any[];
  initialProperties?: any[];
}

const CLUSTER_PROPERTIES_FALLBACK = [
  { code: 'Kav A', ownerName: 'Pak Verial', residentName: 'Pak Verial', statusLabel: 'Penghuni', isRented: false },
  { code: 'Kav B', ownerName: 'Mahasiswa Polban', residentName: 'Mahasiswa Polban', statusLabel: 'Penyewa / Kontrak', isRented: true },
  { code: 'Kav C', ownerName: 'Bu Rina (Kosong)', residentName: 'Bu Rina (Kosong)', statusLabel: 'Kosong', isRented: false },
  { code: 'Kav D', ownerName: 'Pak Rieva', residentName: 'Pak Rieva', statusLabel: 'Penghuni', isRented: false },
  { code: 'Kav E', ownerName: 'Pak Budi', residentName: 'Pak Budi', statusLabel: 'Penghuni', isRented: false },
  { code: 'Kav F', ownerName: 'Pa Anggia', residentName: 'Pa Anggia', statusLabel: 'Penyewa / Kontrak', isRented: true },
  { code: 'Kav G', ownerName: 'Pak Misael', residentName: 'Pak Misael', statusLabel: 'Penghuni', isRented: false },
  { code: 'Kav H', ownerName: 'Pak Fahmi Rizal', residentName: 'Pak Fahmi Rizal', statusLabel: 'Penghuni', isRented: false },
  { code: 'Kav I', ownerName: 'Pak Yahya', residentName: 'Pak Yahya', statusLabel: 'Penyewa / Kontrak', isRented: true },
  { code: 'Kav J', ownerName: 'Bu Sofia P (Kosong)', residentName: 'Bu Sofia P (Kosong)', statusLabel: 'Kosong', isRented: false },
  { code: 'Kav K', ownerName: 'Pak Eky', residentName: 'Pak Eky', statusLabel: 'Penghuni', isRented: false },
  { code: 'Kav L', ownerName: 'Pak Haji Ano', residentName: 'Pak Haji Ano', statusLabel: 'Penghuni', isRented: false },
  { code: 'Kav M', ownerName: 'Pak Dedi N / Pak Jaya (Kosong)', residentName: 'Pak Dedi N / Pak Jaya (Kosong)', statusLabel: 'Kosong', isRented: false },
];

export const PaymentsManager: React.FC<PaymentsManagerProps> = ({
  initialPayments,
  initialAccounts = [],
  initialProperties = [],
}) => {
  const clusterProperties = useMemo(() => {
    if (initialProperties && initialProperties.length > 0) {
      const filtered = initialProperties
        .filter((p: any) => p.code && !p.code.toLowerCase().includes('dummy') && p.code !== 'A-99')
        .map((p: any) => {
          const isRented = p.occupancyStatus === 'RENTED' || p.isRented;
          const isVacant = p.occupancyStatus === 'VACANT';
          const resident = isRented
            ? (p.occupantName || p.currentResident || 'Penyewa')
            : (isVacant ? `${p.ownerName || p.legalOwner || 'Warga'} (Kosong)` : (p.occupantName || p.currentResident || p.ownerName || `Warga ${p.code}`));
          const statusLabel = isRented ? 'Penyewa / Kontrak' : (isVacant ? 'Kosong' : 'Penghuni');
          return {
            code: p.code,
            residentName: resident,
            ownerName: resident,
            legalOwner: p.legalOwner || p.ownerName,
            statusLabel,
            isRented,
          };
        });
      if (filtered.length > 0) return filtered;
    }
    return CLUSTER_PROPERTIES_FALLBACK;
  }, [initialProperties]);

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

  // 1. PAYMENTS STATE
  const [payments, setPayments] = useState<PaymentListItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        if (!initialPayments || initialPayments.length === 0) {
          localStorage.removeItem('wargahub_payments_data');
          localStorage.removeItem('wargahub_payments');
          localStorage.removeItem('wargahub_deleted_payments');
          return [];
        }
        const saved = localStorage.getItem('wargahub_payments_data');
        const deletedStr = localStorage.getItem('wargahub_deleted_payments');
        const deletedIds: string[] = deletedStr ? JSON.parse(deletedStr) : [];
        const sourceList = saved !== null ? JSON.parse(saved) : initialPayments;
        if (Array.isArray(sourceList)) {
          return sourceList.filter((p: any) => !deletedIds.includes(p.id));
        }
      } catch (e) {
        console.warn(e);
      }
    }
    return initialPayments;
  });

  useEffect(() => {
    if (!initialPayments || initialPayments.length === 0) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('wargahub_payments_data');
        localStorage.removeItem('wargahub_payments');
        localStorage.removeItem('wargahub_deleted_payments');
      }
      setPayments([]);
    } else {
      setPayments(initialPayments);
    }
  }, [initialPayments]);

  // 2. BANK ACCOUNTS & REKENING KAS STATE (From Database or LocalStorage)
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => {
    const persisted = getPersisted<BankAccount[] | null>('wargahub_bank_accounts', null);
    if (persisted && Array.isArray(persisted) && persisted.length > 0) {
      return persisted;
    }
    if (initialAccounts && initialAccounts.length > 0) {
      return initialAccounts.map((acc: any) => ({
        id: acc.id,
        bankName: acc.bank_name || acc.bankName || acc.name || 'Bank Mandiri',
        accountNumber: acc.account_number || acc.accountNumber || (acc.code !== 'KAS-KECIL' ? acc.code : '-'),
        accountHolder: acc.account_holder || acc.accountHolder || 'Paguyuban Grand Sariwangi',
        balance: Number(acc.balance) || 0,
        isPrimary: Boolean(acc.code === 'BCA-UTAMA' || acc.id === 'acc-main' || acc.code === 'BCA_MAIN'),
        accountType: acc.type === 'BANK' ? 'BANK_OPERASIONAL' : (acc.type === 'QRIS' ? 'QRIS_DINAMIS' : 'KAS_TUNAI'),
        notes: acc.notes || '',
      }));
    }
    return [
      {
        id: 'acc-main',
        bankName: 'Bank Mandiri',
        accountNumber: '1300024446419',
        accountHolder: 'Paguyuban Grand Sariwangi',
        balance: 21850000,
        isPrimary: true,
        accountType: 'BANK_OPERASIONAL',
        notes: 'Rekening master utama penerimaan iuran IPL warga Komplek Grand Sariwangi.',
      },
      {
        id: 'acc-qris-01',
        bankName: 'QRIS Dinamis Paguyuban',
        accountNumber: 'NMID-ID102008891230',
        accountHolder: 'Paguyuban Grand Sariwangi',
        balance: 0,
        isPrimary: false,
        accountType: 'QRIS_DINAMIS',
        qrisNmid: 'ID102008891230',
        notes: 'Menerima pembayaran GoPay, OVO, DANA, BCA Mobile, Livin dll.',
      },
      {
        id: 'acc-petty-01',
        bankName: 'Kas Tunai Bendahara / Satpam',
        accountNumber: 'KAS-FISIK',
        accountHolder: 'BENDAHARA RT/RW',
        balance: 0,
        isPrimary: false,
        accountType: 'KAS_TUNAI',
        notes: 'Kas tunai darurat & uang operasional fisik.',
      }
    ];
  });

  // Reactive listener: when master bank account is edited in Settings or elsewhere
  useEffect(() => {
    const handleBankAccountsUpdated = (e: any) => {
      if (e.detail) {
        const { bankName, accountNumber, accountHolder, qrisNmid } = e.detail;
        setBankAccounts((prev) => {
          let matched = false;
          const next = prev.map((a) => {
            if (a.isPrimary || a.id === 'acc-main' || a.id === 'acc-bca' || a.accountType === 'BANK_OPERASIONAL') {
              matched = true;
              return {
                ...a,
                bankName: bankName || a.bankName,
                accountNumber: accountNumber || a.accountNumber,
                accountHolder: accountHolder || a.accountHolder,
                qrisNmid: qrisNmid || a.qrisNmid,
                isPrimary: true,
              };
            }
            return a;
          });
          if (!matched && next.length > 0) {
            next[0] = {
              ...next[0],
              bankName: bankName || next[0].bankName,
              accountNumber: accountNumber || next[0].accountNumber,
              accountHolder: accountHolder || next[0].accountHolder,
              isPrimary: true,
            };
          }
          return next;
        });
      }
    };
    window.addEventListener('wargahub_bank_accounts_updated', handleBankAccountsUpdated);
    return () => window.removeEventListener('wargahub_bank_accounts_updated', handleBankAccountsUpdated);
  }, []);

  // Bank Statement Feed (Auto-Recon Feed from storage or live)
  const [statementFeeds, setStatementFeeds] = useState<BankStatementFeed[]>(() =>
    getPersisted('wargahub_statement_feeds', [])
  );

  // Navigation & SubTabs
  const [activeSubTab, setActiveSubTab] = useState<'verification' | 'history' | 'manual_counter' | 'receiving_channels'>('verification');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('ALL');
  const [periodFilter, setPeriodFilter] = useState<string>('September 2026');
  const [areaFilter, setAreaFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'code' | 'amount' | 'status' | 'method'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // URL query params auto-sync (e.g. from Billing invoices)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const statusParam = params.get('status');
      const searchParam = params.get('search');
      const tabParam = params.get('tab');
      if (statusParam && ['ALL', 'PENDING', 'VERIFIED', 'REJECTED'].includes(statusParam)) {
        setStatusFilter(statusParam as any);
      }
      if (searchParam) {
        setSearch(searchParam);
      }
      if (tabParam && ['verification', 'history', 'manual_counter', 'receiving_channels'].includes(tabParam)) {
        setActiveSubTab(tabParam as any);
      }
    }
  }, []);

  // Multi-Selection State for Bulk Actions
  const [selectedPaymentIds, setSelectedPaymentIds] = useState<string[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Subtab 2: History (Riwayat Kuitansi) State
  const [receiptSearch, setReceiptSearch] = useState('');
  const [receiptMethodFilter, setReceiptMethodFilter] = useState('ALL');

  // Subtab 3: Manual Counter (POS Tunai Satpam) State
  const [counterHouseCode, setCounterHouseCode] = useState(initialProperties[0]?.code || 'Kav A');
  const [counterAmount, setCounterAmount] = useState(250000);
  const [counterPeriod, setCounterPeriod] = useState('September 2026');
  const [counterCollector, setCounterCollector] = useState('Pos Satpam (Petugas Jaga)');
  const [counterPayerName, setCounterPayerName] = useState('');
  const [counterRef, setCounterRef] = useState(`KAS-TUNAI-${Date.now().toString().slice(-6)}`);
  const [counterNotes, setCounterNotes] = useState('Penerimaan tunai iuran warga di pos satpam');
  const [counterProcessing, setCounterProcessing] = useState(false);

  // Subtab 4: Receiving Channels State
  const [copiedBankAcc, setCopiedBankAcc] = useState<string | null>(null);
  const [copiedBroadcast, setCopiedBroadcast] = useState(false);

  // Modals & Drawers
  const [viewingProof, setViewingProof] = useState<PaymentListItem | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [kepalaKomplekName, setKepalaKomplekName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
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
    }
    return 'Yahya Nursidik';
  });

  useEffect(() => {
    const handleCommitteeUpdated = (e: any) => {
      if (e.detail?.kepalaKomplekName) {
        setKepalaKomplekName(e.detail.kepalaKomplekName);
      }
    };
    window.addEventListener('wargahub_committee_updated', handleCommitteeUpdated);
    return () => window.removeEventListener('wargahub_committee_updated', handleCommitteeUpdated);
  }, []);

  const [showManualModal, setShowManualModal] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<PaymentListItem | null>(null);
  const [deleteReason, setDeleteReason] = useState('Koreksi Input / Pembayaran Ganda');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Bank Account Edit / Add Modal
  const [showBankEditModal, setShowBankEditModal] = useState(false);
  const [isAddingBank, setIsAddingBank] = useState(false);
  const [editingBankId, setEditingBankId] = useState<string>('');
  const [bBankName, setBBankName] = useState('');
  const [bAccountNumber, setBAccountNumber] = useState('');
  const [bAccountHolder, setBAccountHolder] = useState('');
  const [bBalance, setBBalance] = useState(0);
  const [bAccountType, setBAccountType] = useState<BankAccount['accountType']>('BANK_SYARIAH');
  const [bQrisNmid, setBQrisNmid] = useState('');
  const [bNotes, setBNotes] = useState('');

  // Manual Payment Form State
  const [formHouseCode, setFormHouseCode] = useState(initialProperties[0]?.code || '');
  const [formOwnerName, setFormOwnerName] = useState(initialProperties[0]?.ownerName || '');
  const [formPeriod, setFormPeriod] = useState(new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }));
  const [formAmount, setFormAmount] = useState(250000);
  const [formMethod, setFormMethod] = useState<string>('Bank Syariah Indonesia (BSI)');
  const [customPaymentMethods, setCustomPaymentMethods] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('wargahub_custom_payment_methods');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });
  const [showAddMethodSection, setShowAddMethodSection] = useState(false);
  const [customMethodInput, setCustomMethodInput] = useState('');

  const handleAddCustomMethod = (methodName: string) => {
    const trimmed = methodName.trim();
    if (!trimmed) return;
    if (!customPaymentMethods.includes(trimmed)) {
      const updated = [...customPaymentMethods, trimmed];
      setCustomPaymentMethods(updated);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('wargahub_custom_payment_methods', JSON.stringify(updated));
        } catch (e) {}
      }
    }
    setFormMethod(trimmed);
    showToast(`Metode pembayaran "${trimmed}" berhasil ditambahkan dan dipilih.`);
  };

  const [formRef, setFormRef] = useState('');
  const [formPaidDate, setFormPaidDate] = useState(new Date().toISOString().slice(0, 10));
  const [formStatus, setFormStatus] = useState<'VERIFIED' | 'PENDING'>('VERIFIED');
  const [formNotes, setFormNotes] = useState('');
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [savingPayment, setSavingPayment] = useState(false);

  // Rejection Form State
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('Nominal bukti transfer tidak sesuai tagihan');

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

  // Available Periods (Descending sort)
  const availablePeriods = useMemo(() => {
    const list: string[] = ['September 2026', 'Agustus 2026', 'Juli 2026', 'Juni 2026', 'Mei 2026'];
    payments.forEach(p => {
      if (p.periodName && !list.includes(p.periodName)) {
        list.push(p.periodName);
      }
    });
    return list;
  }, [payments]);

  // Counts filtered by period
  const periodPayments = useMemo(() => {
    if (periodFilter === 'ALL') return payments;
    return payments.filter(p => p.periodName === periodFilter);
  }, [payments, periodFilter]);

  const pendingCount = periodPayments.filter((p) => p.status === 'PENDING').length;
  const verifiedCount = periodPayments.filter((p) => p.status === 'VERIFIED').length;
  const rejectedCount = periodPayments.filter((p) => p.status === 'REJECTED').length;
  const totalVerifiedAmount = periodPayments.filter((p) => p.status === 'VERIFIED').reduce((sum, p) => sum + p.amount, 0);

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

  // Verified Receipts Computed List (for Subtab 2: History)
  const verifiedReceipts = useMemo(() => {
    return payments
      .filter((p) => p.status === 'VERIFIED')
      .filter((p) => {
        const query = receiptSearch.toLowerCase().trim();
        const matchedProp = clusterProperties.find((cp) => cp.code.toLowerCase() === p.propertyCode.toLowerCase());
        const resident = (matchedProp?.residentName || matchedProp?.ownerName || '').toLowerCase();
        const receiptNo = `KWT-${(p.periodName || '2026').replace(/\s+/g, '').slice(0, 7).toUpperCase()}-${p.propertyCode.replace(/[^A-Z0-9]/g, '')}-${p.id.slice(-4)}`.toLowerCase();

        const matchSearch =
          !query ||
          p.propertyCode.toLowerCase().includes(query) ||
          resident.includes(query) ||
          receiptNo.includes(query) ||
          (p.reference && p.reference.toLowerCase().includes(query));

        let matchMethod = true;
        if (receiptMethodFilter !== 'ALL') {
          if (receiptMethodFilter === 'SYARIAH') {
            matchMethod = ['BSI', 'Syariah', 'Muamalat', 'Aladin'].some((s) => p.method.includes(s));
          } else if (receiptMethodFilter === 'CASH') {
            matchMethod = p.method.toLowerCase().includes('tunai') || p.method.toLowerCase().includes('cash');
          } else if (receiptMethodFilter === 'QRIS') {
            matchMethod = p.method.toLowerCase().includes('qris');
          } else if (receiptMethodFilter === 'TRANSFER') {
            matchMethod = p.method.toLowerCase().includes('transfer') || p.method.toLowerCase().includes('bca') || p.method.toLowerCase().includes('mandiri');
          }
        }

        return matchSearch && matchMethod;
      })
      .sort((a, b) => (b.paidAt || '').localeCompare(a.paidAt || ''));
  }, [payments, receiptSearch, receiptMethodFilter, clusterProperties]);

  // WhatsApp Message Generator for Receipt & Confirmation
  const getPaymentWaUrl = (pay: PaymentListItem) => {
    const kav = pay.propertyCode;
    const matched = clusterProperties.find((p) => p.code.toLowerCase() === kav.toLowerCase());
    const name = matched ? (matched.residentName || matched.ownerName) : `Warga ${kav}`;
    const receiptNo = `KWT-${(pay.periodName || '2026').replace(/\s+/g, '').slice(0, 7).toUpperCase()}-${kav.replace(/[^A-Z0-9]/g, '')}-${pay.id.slice(-4)}`;

    if (pay.status === 'VERIFIED') {
      const text = `*KUITANSI PEMBAYARAN IURAN RESMI*\n` +
        `*Komplek Grand Sariwangi*\n` +
        `---------------------------------------\n` +
        `No. Kuitansi: ${receiptNo}\n` +
        `Kode Unit: Rumah ${kav}\n` +
        `Atas Nama: ${name}\n` +
        `Periode: ${pay.periodName || 'September 2026'}\n` +
        `Nominal: ${formatRupiah(pay.amount)}\n` +
        `Metode: ${formatPaymentMethod(pay.method)}\n` +
        `No. Referensi: ${pay.reference || '-'}\n` +
        `Waktu Lunas: ${pay.paidAt}\n` +
        `Status: *TERVERIFIKASI LUNAS ✓*\n` +
        `---------------------------------------\n` +
        `Terima kasih atas partisipasi Bpk/Ibu ${name} dalam menjaga kebersihan, ketertiban, dan operasional lingkungan kita.\n\n` +
        `Hormat kami,\n` +
        `Bendahara & Pengurus Komplek Grand Sariwangi`;
      return `https://wa.me/?text=${encodeURIComponent(text)}`;
    } else {
      const text = `Halo Bpk/Ibu ${name} (Rumah ${kav}), menginfokan bahwa bukti pembayaran iuran IPL sebesar ${formatRupiah(pay.amount)} telah kami terima dan sedang dalam antrean verifikasi bendahara. Terima kasih!`;
      return `https://wa.me/?text=${encodeURIComponent(text)}`;
    }
  };

  // WhatsApp Broadcast Text for Receiving Channels
  const broadcastWaText = `*INFORMASI REKENING RESMI IURAN IPL WARGA*\n` +
    `*Komplek Grand Sariwangi (RT 01 / RW 08)*\n` +
    `---------------------------------------\n` +
    `Bapak/Ibu warga Grand Sariwangi yang kami hormati,\n` +
    `Berikut saluran resmi pembayaran Iuran Pengelolaan Lingkungan (IPL) komplek:\n\n` +
    `1. *Transfer Bank Syariah (Utama)*:\n` +
    `   Bank: Bank Syariah Indonesia (BSI)\n` +
    `   No. Rekening: 7142-9988-11\n` +
    `   Atas Nama: PENGURUS KOMPLEK WARGAHUB\n` +
    `   Kode Bank: 451\n\n` +
    `2. *QRIS Dinamis Paguyuban*:\n` +
    `   Scan kode QRIS melalui portal warga https://wrghub.vercel.app/resident atau stiker di pos satpam.\n\n` +
    `3. *Setoran Tunai Fisik*:\n` +
    `   Dapat diserahkan langsung ke Petugas Pos Satpam 24 Jam atau ke rumah Bendahara Komplek (disertai kuitansi tunai resmi).\n\n` +
    `*Catatan*: Mohon sertakan kode kavling (contoh: "Kav A") pada berita transfer demi kelancaran pencatatan kas.\n\n` +
    `Terima kasih atas kerja sama dan kedisiplinan seluruh warga.\n` +
    `Pengurus RT/RW Komplek Grand Sariwangi`;

  // Quick POS Counter Submission
  const handleQuickCounterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCounterProcessing(true);
    try {
      const matched = clusterProperties.find((p) => p.code.toLowerCase() === counterHouseCode.toLowerCase());
      const resident = counterPayerName || (matched ? (matched.residentName || matched.ownerName) : `Warga ${counterHouseCode}`);
      const todayStr = new Date().toISOString().slice(0, 10);
      const generatedRef = counterRef || `KAS-TUNAI-${Date.now().toString().slice(-6)}`;

      await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyCode: counterHouseCode.toUpperCase(),
          ownerName: resident,
          periodName: counterPeriod,
          amount: Number(counterAmount),
          method: `Tunai (Diterima ${counterCollector})`,
          reference: generatedRef,
          paidAt: todayStr,
          status: 'VERIFIED',
          notes: `${counterNotes} (Petugas: ${counterCollector})`,
        }),
      }).catch(() => {});

      const newPay: PaymentListItem = {
        id: `pay-${Date.now()}`,
        invoiceId: `inv-${Date.now()}`,
        propertyCode: counterHouseCode.toUpperCase(),
        amount: Number(counterAmount),
        method: `Tunai (Diterima ${counterCollector})`,
        reference: generatedRef,
        proofUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
        proofFileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
        status: 'VERIFIED',
        paidAt: todayStr,
        notes: `${counterNotes} (Petugas: ${counterCollector})`,
        verifiedAt: new Date().toISOString(),
      };

      const updated = [newPay, ...payments];
      updatePaymentsState(updated);

      // Auto update cash in petty cash account
      const petty = bankAccounts.find((a) => a.accountType === 'KAS_TUNAI') || bankAccounts[0];
      if (petty) {
        const nextAccounts = bankAccounts.map((a) =>
          a.id === petty.id ? { ...a, balance: a.balance + Number(counterAmount) } : a
        );
        setBankAccounts(nextAccounts);
        savePersisted('wargahub_bank_accounts', nextAccounts);
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('wargahub_payment_verified', {
            detail: { propertyCode: counterHouseCode.toUpperCase(), amount: Number(counterAmount), periodName: counterPeriod },
          })
        );
      }

      showToast(`Setoran tunai ${counterHouseCode} sebesar ${formatRupiah(counterAmount)} berhasil dicatat & kuitansi terbit!`);

      // Open Receipt Modal right away for quick print or WhatsApp share
      setSelectedReceipt({
        invoiceNumber: `INV-${counterPeriod.replace(/\s+/g, '').toUpperCase()}-${counterHouseCode.replace(/[^A-Z0-9]/g, '')}`,
        periodName: counterPeriod,
        propertyCode: counterHouseCode,
        residentName: resident,
        amount: Number(counterAmount),
        paidAt: todayStr,
        paymentMethod: `Tunai (Diterima ${counterCollector})`,
        referenceNumber: generatedRef,
        kepalaKomplekName: kepalaKomplekName,
        isInvoice: false,
        items: Number(counterAmount) === 350000 ? [
          { name: 'Iuran RT (Sampah, Kebersihan Lingkungan & Fasum RT)', amount: 250000, desc: 'Pengangkutan armada sampah dinas LH, saluran air & fasum RT' },
          { name: 'Iuran RW (Retribusi Paguyuban & Wilayah RW)', amount: 100000, desc: 'Retribusi paguyuban komplek & koordinasi wilayah RW' },
        ] : (Number(counterAmount) === 250000 ? [
          { name: 'Iuran RT (Pengangkutan Sampah, Kebersihan & Fasum RT)', amount: 250000, desc: 'Pengangkutan armada sampah dinas LH, saluran air, fasum dan operasional RT' }
        ] : undefined),
      });

      setCounterRef(`KAS-TUNAI-${Date.now().toString().slice(-6)}`);
    } catch (err) {
      console.error(err);
      showToast('Gagal mencatat setoran tunai.');
    } finally {
      setCounterProcessing(false);
    }
  };

  // ================= OPEN MODALS =================
  const handleOpenEditPayment = (pay: PaymentListItem) => {
    setEditingPaymentId(pay.id);
    setFormHouseCode(pay.propertyCode);
    const matched = clusterProperties.find(p => p.code.toLowerCase() === pay.propertyCode.toLowerCase());
    setFormOwnerName(matched ? (matched.residentName || matched.ownerName) : `Warga Rumah ${pay.propertyCode}`);
    setFormPeriod('Agustus 2026');
    setFormAmount(pay.amount);
    setFormMethod(pay.method ? formatPaymentMethod(pay.method) : 'Transfer Bank BCA');
    setFormRef(pay.reference || '');
    setFormPaidDate(pay.paidAt ? pay.paidAt.slice(0, 10) : '2026-08-28');
    setFormStatus(pay.status as any);
    setFormNotes(pay.notes || '');
    setShowAddMethodSection(false);
    setShowManualModal(true);
  };

  const handleOpenCreatePayment = (prefillHouse?: string) => {
    setEditingPaymentId(null);
    const firstProp = clusterProperties[0] || CLUSTER_PROPERTIES_FALLBACK[0];
    const targetCode = prefillHouse || firstProp.code;
    const matched = clusterProperties.find(p => p.code.toLowerCase() === targetCode.toLowerCase());
    setFormHouseCode(targetCode);
    setFormOwnerName(matched ? (matched.residentName || matched.ownerName) : `Warga ${targetCode}`);
    setFormPeriod('September 2026');
    setFormAmount(250000);
    setFormMethod('Bank Syariah Indonesia (BSI)');
    setShowAddMethodSection(false);
    setFormRef(`TRX-${targetCode.replace(/[^A-Z0-9]/g, '')}-${Date.now().toString().slice(-4)}`);
    setFormPaidDate(new Date().toISOString().slice(0, 10));
    setFormStatus('VERIFIED');
    setFormNotes('Setoran iuran warga');
    setShowManualModal(true);
  };

  // Open Add Bank Account Modal
  const handleOpenAddBank = () => {
    setIsAddingBank(true);
    setEditingBankId('');
    setBBankName('Bank Syariah Indonesia (BSI)');
    setBAccountNumber('');
    setBAccountHolder('PENGURUS KOMPLEK WARGAHUB');
    setBBalance(0);
    setBAccountType('BANK_SYARIAH');
    setBQrisNmid('');
    setBNotes('Rekening penerimaan iuran kas warga');
    setShowBankEditModal(true);
  };

  // Open Edit Bank Account Modal
  const handleOpenEditBank = (acc: BankAccount) => {
    setIsAddingBank(false);
    setEditingBankId(acc.id);
    setBBankName(acc.bankName);
    setBAccountNumber(acc.accountNumber);
    setBAccountHolder(acc.accountHolder);
    setBBalance(acc.balance);
    setBAccountType(acc.accountType || 'BANK_OPERASIONAL');
    setBQrisNmid(acc.qrisNmid || 'ID102008891230');
    setBNotes(acc.notes || '');
    setShowBankEditModal(true);
  };

  const handleDeleteBank = (accId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus rekening kas ini dari daftar?')) {
      const updated = bankAccounts.filter(a => a.id !== accId);
      setBankAccounts(updated);
      savePersisted('wargahub_bank_accounts', updated);
      showToast('Rekening kas berhasil dihapus dari daftar.');
    }
  };

  const handleSaveBankAccounts = async (e: React.FormEvent) => {
    e.preventDefault();
    let updated: BankAccount[];
    if (isAddingBank) {
      const newAcc: BankAccount = {
        id: `acc-custom-${Date.now()}`,
        bankName: bBankName,
        accountNumber: bAccountNumber,
        accountHolder: bAccountHolder,
        balance: Number(bBalance),
        isPrimary: bankAccounts.length === 0,
        accountType: bAccountType,
        qrisNmid: bQrisNmid,
        notes: bNotes,
      };
      updated = [...bankAccounts, newAcc];
    } else {
      updated = bankAccounts.map(a => {
        if (a.id === editingBankId) {
          return {
            ...a,
            bankName: bBankName,
            accountNumber: bAccountNumber,
            accountHolder: bAccountHolder,
            balance: Number(bBalance),
            accountType: bAccountType,
            qrisNmid: bQrisNmid,
            notes: bNotes,
          };
        }
        return a;
      });
    }

    setBankAccounts(updated);
    savePersisted('wargahub_bank_accounts', updated);

    // If primary account was added/edited, sync settings keys and dispatch global event
    const primaryAcc = updated.find((a) => a.isPrimary) || updated[0];
    if (primaryAcc) {
      savePersisted('wargahub_set_bankname', primaryAcc.bankName);
      savePersisted('wargahub_set_bankacc', primaryAcc.accountNumber);
      savePersisted('wargahub_set_accholder', primaryAcc.accountHolder);
      if (primaryAcc.qrisNmid) savePersisted('wargahub_set_qris', primaryAcc.qrisNmid);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('wargahub_bank_accounts_updated', {
            detail: {
              bankName: primaryAcc.bankName,
              accountNumber: primaryAcc.accountNumber,
              accountHolder: primaryAcc.accountHolder,
              qrisNmid: primaryAcc.qrisNmid,
              isPrimary: true,
            },
          })
        );
      }
    }

    // Sync settings to backend API
    const localCommName = typeof window !== 'undefined' ? (localStorage.getItem('wargahub_set_comm_name') || 'Komplek Grand Sariwangi') : 'Komplek Grand Sariwangi';
    const localRtRw = typeof window !== 'undefined' ? (localStorage.getItem('wargahub_set_comm_rtrw') || 'RT 01 / RW 08') : 'RT 01 / RW 08';
    const localAddr = typeof window !== 'undefined' ? (localStorage.getItem('wargahub_set_comm_addr') || 'Grand Sariwangi, Sariwangi, Bandung Barat') : 'Grand Sariwangi, Sariwangi, Bandung Barat';
    const safeCommName = localCommName.toLowerCase().includes('taman sejahtera') ? 'Komplek Grand Sariwangi' : localCommName;
    const safeRtRw = localRtRw.toLowerCase().includes('02 / rw 05') || localRtRw.toLowerCase().includes('04 / rw 09') ? 'RT 01 / RW 08' : localRtRw;
    const safeAddr = localAddr.toLowerCase().includes('taman sejahtera') || localAddr.toLowerCase().includes('graha raya') ? 'Grand Sariwangi, Sariwangi, Bandung Barat' : localAddr;

    await fetch('/api/settings/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        communityName: safeCommName,
        rtRw: safeRtRw,
        address: safeAddr,
        monthlyRate: 250000,
        bankName: bBankName,
        bankAccount: bAccountNumber,
        accountHolder: bAccountHolder,
        securityPhone: '0812-2008-2240',
        rwHeadPhone: '0812-3456-7890',
        balance: Number(bBalance),
      })
    }).catch(() => {});

    setShowBankEditModal(false);
    showToast(isAddingBank ? 'Rekening / E-Wallet kas baru berhasil ditambahkan!' : 'Informasi rekening kas paguyuban berhasil diperbarui!');
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
      const matchPeriod = periodFilter === 'ALL' || p.periodName === periodFilter;
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

      return matchPeriod && matchStatus && matchSearch && matchArea;
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
  }, [payments, periodFilter, statusFilter, areaFilter, search, sortBy, sortOrder]);

  // Pagination
  const totalFiltered = filteredAndSorted.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalFiltered);
  const paginatedPayments = filteredAndSorted.slice(startIndex, endIndex);

  // Copy Public Link
  const publicTransparencyUrl = typeof window !== 'undefined' ? `${window.location.origin}/transparency` : 'https://wrghub.vercel.app/transparency';
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
              Verifikasi Pembayaran & Kasir Kas
            </h1>
            {pendingCount > 0 ? (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-black border border-amber-300 animate-pulse">
                {pendingCount} Perlu Ditinjau
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                Semua Bersih ✓
              </span>
            )}
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Verifikasi setoran bukti transfer Bank/Syariah/QRIS warga, penerbitan kuitansi ber-QR code resmi, loket kasir tunai pos satpam, dan kanal pembayaran resmi paguyuban.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/transparency"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-surface hover:bg-canvas border border-border text-ink text-xs font-bold rounded-xl shadow-2xs active:scale-[0.98] transition-all"
            title="Buka portal transparansi iuran publik"
          >
            <ExternalLink className="w-3.5 h-3.5 text-primary-600" />
            <span>Portal Publik ↗</span>
          </a>
          <button
            type="button"
            onClick={handleExportPaymentsCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-surface hover:bg-canvas border border-border text-ink text-xs font-bold rounded-xl shadow-2xs active:scale-[0.98] transition-all"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ekspor CSV</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('manual_counter')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs active:scale-[0.98] transition-all"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>+ Loket Kasir Tunai</span>
          </button>
        </div>
      </div>

      {/* 4 Clean Sub-Tabs Navigation */}
      <div className="flex items-center gap-1.5 p-1.5 bg-surface rounded-2xl border border-border shadow-2xs overflow-x-auto no-scrollbar">
        {[
          { id: 'verification', label: 'Antrean Verifikasi Bukti', icon: Hourglass, count: `${pendingCount} Menunggu` },
          { id: 'history', label: 'Riwayat Kuitansi Kas Resmi', icon: Receipt, count: `${verifiedReceipts.length} Kuitansi` },
          { id: 'manual_counter', label: 'Loket Kasir Tunai / Pos Satpam', icon: Wallet },
          { id: 'receiving_channels', label: 'Kanal Rekening Penerimaan', icon: Building },
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
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-ink-muted'}`} />
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

      {/* ================= SUBTAB 1: VERIFIKASI PEMBAYARAN MASUK ================= */}
      {activeSubTab === 'verification' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[10px] font-mono uppercase font-bold text-ink-muted tracking-wider">
                {periodFilter === 'ALL' ? 'Setoran Terverifikasi (Semua)' : `Setoran ${periodFilter}`}
              </span>
              <p className="text-2xl font-black font-mono text-emerald-700 mt-0.5 tabular-nums">{formatRupiah(totalVerifiedAmount)}</p>
              <span className="text-[10px] text-emerald-600 font-bold font-mono mt-0.5 block">
                {verifiedCount} TRANSAKSI LUNAS {periodFilter !== 'ALL' ? `(${periodFilter})` : '(AKUMULASI)'}
              </span>
            </div>

            <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[10px] font-mono uppercase font-bold text-ink-muted tracking-wider">Menunggu Verifikasi</span>
              <p className="text-2xl font-black font-mono text-amber-700 mt-0.5 tabular-nums">{pendingCount} Bukti</p>
              <span className="text-[10px] text-amber-600 font-bold font-mono mt-0.5 block">PERLU DICEK BENDAHARA</span>
            </div>

            <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[10px] font-mono uppercase font-bold text-ink-muted tracking-wider">Bukti Ditolak</span>
              <p className="text-2xl font-black font-mono text-rose-700 mt-0.5 tabular-nums">{rejectedCount} Transaksi</p>
              <span className="text-[10px] text-rose-600 font-bold font-mono mt-0.5 block">TIDAK SESUAI NOMINAL</span>
            </div>

            <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-ink-muted tracking-wider">Saldo Kas Paguyuban</span>
                <button
                  type="button"
                  onClick={() => handleOpenEditBank(primaryAccount)}
                  className="text-[10px] text-primary-600 font-bold hover:underline"
                >
                  Edit
                </button>
              </div>
              <p className="text-2xl font-black font-mono text-primary-700 mt-0.5 tabular-nums">{formatRupiah(totalAllKas)}</p>
              <span className="text-[10px] text-primary-600 font-bold font-mono mt-0.5 block truncate">{primaryAccount.bankName} {primaryAccount.accountNumber}</span>
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
                value={periodFilter}
                onChange={(e) => {
                  setPeriodFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="ALL">Semua Periode (Akumulasi)</option>
                {availablePeriods.map(pr => (
                  <option key={pr} value={pr}>{pr}</option>
                ))}
              </select>

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
                      <td colSpan={7} className="py-12 text-center text-ink-muted">
                        <div className="max-w-sm mx-auto flex flex-col items-center justify-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
                            <CreditCard className="w-5 h-5" />
                          </div>
                          <p className="font-bold text-ink text-sm">
                            {payments.length === 0 ? 'Belum Ada Transaksi Pembayaran' : 'Tidak ada transaksi yang cocok dengan filter'}
                          </p>
                          <p className="text-xs text-ink-muted">
                            {payments.length === 0
                              ? 'Data pembayaran masih kosong. Klik tombol "Catat Pembayaran Manual" di atas untuk merekam transaksi warga.'
                              : 'Coba ubah kata kunci pencarian atau filter status untuk menemukan transaksi.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedPayments.map((pay) => {
                      const isVerified = pay.status === 'VERIFIED';
                      const isPending = pay.status === 'PENDING';
                      const isSelected = selectedPaymentIds.includes(pay.id);
                      return (
                        <tr key={pay.id} className={`hover:bg-canvas/60 text-ink transition-colors ${isSelected ? 'bg-emerald-50/40' : ''}`}>
                          <td className="py-3.5 px-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectOne(pay.id)}
                              className="rounded border-border text-emerald-600 cursor-pointer"
                            />
                          </td>
                          <td className="py-3.5 px-4 font-mono font-black text-primary-700 text-sm">
                            Rumah {pay.propertyCode}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-black tabular-nums text-ink text-sm">
                            {formatRupiah(pay.amount)}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-black text-ink text-xs">{formatPaymentMethod(pay.method)}</span>
                              {['BSI', 'Syariah', 'Muamalat', 'Aladin'].some(s => pay.method.includes(s)) && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
                                  🌙 Syariah
                                </span>
                              )}
                              {['Jago', 'SeaBank', 'Blu', 'Neo', 'Allobank', 'Jenius'].some(b => pay.method.includes(b)) && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                  Digital
                                </span>
                              )}
                              {['GoPay', 'OVO', 'DANA', 'ShopeePay', 'LinkAja', 'AstraPay'].some(w => pay.method.includes(w)) && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                                  E-Wallet
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-[10px] text-ink-muted bg-canvas px-1.5 py-0.5 rounded border border-border/80 inline-block mt-0.5">
                              {pay.reference || '-'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-ink-muted font-mono font-medium">
                            {pay.paidAt}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {isVerified && (
                              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-mono font-black text-[10px] border border-emerald-300 shadow-2xs">
                                ✓ TERVERIFIKASI
                              </span>
                            )}
                            {isPending && (
                              <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 font-mono font-black text-[10px] border border-amber-300 animate-pulse">
                                ⏳ MENUNGGU
                              </span>
                            )}
                            {pay.status === 'REJECTED' && (
                              <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 font-mono font-black text-[10px] border border-rose-300">
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
                                className="px-2.5 py-1.5 bg-surface hover:bg-canvas border border-border text-ink rounded-lg font-bold inline-flex items-center gap-1 text-[11px] shadow-2xs active:scale-[0.98] transition-all"
                                title="Lihat Bukti Transfer"
                              >
                                <Eye className="w-3.5 h-3.5 text-primary-600" />
                                <span>{isPending ? 'Verifikasi' : 'Bukti'}</span>
                              </button>

                              {/* Kuitansi & Invoice Resmi */}
                              {isVerified && (
                                <>
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
                                        kepalaKomplekName: kepalaKomplekName,
                                        isInvoice: false,
                                        items: pay.amount === 350000 ? [
                                          { name: 'Iuran RT (Sampah, Kebersihan Lingkungan & Fasum RT)', amount: 250000, desc: 'Pengangkutan armada sampah dinas LH, saluran air & fasum RT' },
                                          { name: 'Iuran RW (Retribusi Paguyuban & Wilayah RW)', amount: 100000, desc: 'Retribusi paguyuban komplek & koordinasi wilayah RW' },
                                        ] : (pay.amount === 250000 ? [
                                          { name: 'Iuran RT (Pengangkutan Sampah, Kebersihan & Fasum RT)', amount: 250000, desc: 'Pengangkutan armada sampah dinas LH, saluran air, fasum dan operasional RT' }
                                        ] : undefined),
                                      })
                                    }
                                    className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-bold inline-flex items-center gap-1 text-[11px] active:scale-[0.98] transition-all"
                                    title="Lihat / Cetak Kuitansi Resmi"
                                  >
                                    <Printer className="w-3.5 h-3.5" /> Kuitansi
                                  </button>
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
                                        kepalaKomplekName: kepalaKomplekName,
                                        isInvoice: true,
                                        items: pay.amount === 350000 ? [
                                          { name: 'Iuran RT (Sampah, Kebersihan Lingkungan & Fasum RT)', amount: 250000, desc: 'Pengangkutan armada sampah dinas LH, saluran air & fasum RT' },
                                          { name: 'Iuran RW (Retribusi Paguyuban & Wilayah RW)', amount: 100000, desc: 'Retribusi paguyuban komplek & koordinasi wilayah RW' },
                                        ] : (pay.amount === 250000 ? [
                                          { name: 'Iuran RT (Pengangkutan Sampah, Kebersihan & Fasum RT)', amount: 250000, desc: 'Pengangkutan armada sampah dinas LH, saluran air, fasum dan operasional RT' }
                                        ] : undefined),
                                      })
                                    }
                                    className="px-2 py-1.5 bg-canvas hover:bg-surface border border-border text-ink-muted hover:text-ink rounded-lg font-bold inline-flex items-center gap-1 text-[11px] active:scale-[0.98] transition-all"
                                    title="Lihat Surat Tagihan / Invoice Resmi"
                                  >
                                    <FileText className="w-3.5 h-3.5" /> Invoice
                                  </button>
                                </>
                              )}

                              <a
                                href={getPaymentWaUrl(pay)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-bold inline-flex items-center gap-1 text-[11px] active:scale-[0.98] transition-all"
                                title="Kirim Notifikasi / Kuitansi WhatsApp ke Warga"
                              >
                                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                              </a>

                              <button
                                type="button"
                                onClick={() => handleOpenEditPayment(pay)}
                                className="p-1.5 text-amber-700 hover:bg-amber-50 rounded-lg font-bold active:scale-[0.98] transition-all"
                                title="Edit Pembayaran"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setPaymentToDelete(pay)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg font-bold active:scale-[0.98] transition-all"
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
                  {(() => {
                    const maxButtons = 5;
                    const startPage = Math.max(1, Math.min(safeCurrentPage - Math.floor(maxButtons / 2), Math.max(1, totalPages - maxButtons + 1)));
                    const pageCount = Math.min(maxButtons, totalPages);
                    return Array.from({ length: pageCount }, (_, i) => startPage + i).map((pageNum) => (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors active:scale-[0.98] ${
                          safeCurrentPage === pageNum
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-surface border border-border text-ink hover:bg-canvas'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ));
                  })()}
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

      {/* ================= SUBTAB 2: RIWAYAT KUITANSI KAS RESMI ================= */}
      {activeSubTab === 'history' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="p-5 bg-surface rounded-3xl border border-border shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <h3 className="font-black text-base text-ink flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-emerald-600" />
                  Riwayat Kuitansi Kas & Tanda Terima Resmi
                </h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  Arsip seluruh bukti kuitansi setoran iuran warga yang telah diverifikasi dan sah dibukukan ke dalam kas paguyuban.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const headers = ['No Kuitansi', 'Unit', 'Warga', 'Nominal', 'Metode', 'Referensi', 'Tanggal Terbit'];
                    const rows = verifiedReceipts.map((p) => {
                      const matched = clusterProperties.find((cp) => cp.code.toLowerCase() === p.propertyCode.toLowerCase());
                      const res = matched ? (matched.residentName || matched.ownerName) : `Warga ${p.propertyCode}`;
                      const receiptNo = `KWT-${(p.periodName || '2026').replace(/\s+/g, '').slice(0, 7).toUpperCase()}-${p.propertyCode.replace(/[^A-Z0-9]/g, '')}-${p.id.slice(-4)}`;
                      return [receiptNo, `"${p.propertyCode}"`, `"${res}"`, p.amount, `"${p.method}"`, `"${p.reference || '-'}"`, `"${p.paidAt}"`];
                    });
                    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement('a');
                    link.setAttribute('href', encodedUri);
                    link.setAttribute('download', `REKAP_KUITANSI_KAS_WARGA_${new Date().toISOString().slice(0, 10)}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    showToast('Data riwayat kuitansi berhasil diekspor ke CSV.');
                  }}
                  className="px-3.5 py-2 bg-surface hover:bg-canvas border border-border text-ink rounded-xl font-bold text-xs inline-flex items-center gap-1.5 shadow-2xs active:scale-[0.98] transition-all"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Unduh Rekap Kuitansi (CSV)</span>
                </button>
              </div>
            </div>

            {/* Metrics Snapshot */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-canvas/70 rounded-2xl border border-border">
                <span className="text-[10px] font-mono uppercase font-bold text-ink-muted">Total Kuitansi Sah</span>
                <p className="text-xl font-black font-mono text-ink mt-0.5">{verifiedReceipts.length} Kuitansi</p>
                <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">Tercatat di pembukuan</span>
              </div>
              <div className="p-3.5 bg-canvas/70 rounded-2xl border border-border">
                <span className="text-[10px] font-mono uppercase font-bold text-ink-muted">Total Dana Kas Diterima</span>
                <p className="text-xl font-black font-mono text-emerald-700 mt-0.5">{formatRupiah(totalVerifiedAmount)}</p>
                <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">Lunas terverifikasi</span>
              </div>
              <div className="p-3.5 bg-canvas/70 rounded-2xl border border-border">
                <span className="text-[10px] font-mono uppercase font-bold text-ink-muted">Rata-Rata Pembayaran</span>
                <p className="text-xl font-black font-mono text-ink mt-0.5">
                  {formatRupiah(verifiedReceipts.length > 0 ? Math.round(totalVerifiedAmount / verifiedReceipts.length) : 250000)}
                </p>
                <span className="text-[10px] text-ink-muted font-bold block mt-0.5">per transaksi terbit</span>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari nomor kuitansi, kode kavling, nama warga, atau no. referensi bank..."
                  value={receiptSearch}
                  onChange={(e) => setReceiptSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-canvas border border-border rounded-xl text-xs text-ink placeholder:text-ink-muted/70 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                />
              </div>

              <select
                value={receiptMethodFilter}
                onChange={(e) => setReceiptMethodFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink focus:outline-none"
              >
                <option value="ALL">Semua Saluran Pembayaran</option>
                <option value="SYARIAH">🌙 Bank Syariah (BSI)</option>
                <option value="QRIS">📱 QRIS Dinamis</option>
                <option value="CASH">💵 Kas Tunai Pos Satpam / Bendahara</option>
                <option value="TRANSFER">🏦 Transfer Bank</option>
              </select>
            </div>

            {/* Table of Official Receipts */}
            <div className="overflow-x-auto rounded-2xl border border-border shadow-2xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-canvas border-b border-border text-ink-muted font-bold text-[11px]">
                  <tr>
                    <th className="py-3 px-4 font-mono">No. Kuitansi Resmi</th>
                    <th className="py-3 px-4">Kavling & Warga</th>
                    <th className="py-3 px-4">Periode</th>
                    <th className="py-3 px-4 font-mono text-right">Nominal</th>
                    <th className="py-3 px-4">Saluran & Referensi</th>
                    <th className="py-3 px-4 font-mono">Waktu Lunas</th>
                    <th className="py-3 px-4 text-right">Aksi Kuitansi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {verifiedReceipts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-ink-muted">
                        <Receipt className="w-8 h-8 mx-auto text-ink-muted/40 mb-2" />
                        <p className="font-bold text-sm text-ink">Tidak ada kuitansi yang cocok dengan filter</p>
                        <p className="text-xs text-ink-muted mt-0.5">Coba ubah kata kunci pencarian atau bersihkan filter.</p>
                      </td>
                    </tr>
                  ) : (
                    verifiedReceipts.map((pay) => {
                      const matched = clusterProperties.find((cp) => cp.code.toLowerCase() === pay.propertyCode.toLowerCase());
                      const resident = matched ? (matched.residentName || matched.ownerName) : `Warga ${pay.propertyCode}`;
                      const receiptNo = `KWT-${(pay.periodName || '2026').replace(/\s+/g, '').slice(0, 7).toUpperCase()}-${pay.propertyCode.replace(/[^A-Z0-9]/g, '')}-${pay.id.slice(-4)}`;

                      return (
                        <tr key={pay.id} className="hover:bg-canvas/60 text-ink transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">
                            <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded-md">
                              {receiptNo}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-black text-ink block">Rumah {pay.propertyCode}</span>
                            <span className="text-[11px] text-ink-muted">{resident}</span>
                          </td>
                          <td className="py-3.5 px-4 font-medium text-ink">
                            {pay.periodName || 'September 2026'}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-black tabular-nums text-emerald-700 text-right text-sm">
                            {formatRupiah(pay.amount)}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-xs flex items-center gap-1">
                              <span>{formatPaymentMethod(pay.method)}</span>
                            </div>
                            <span className="font-mono text-[10px] text-ink-muted bg-canvas px-1.5 py-0.5 rounded border border-border inline-block mt-0.5">
                              Ref: {pay.reference || '-'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-ink-muted text-[11px]">
                            {pay.paidAt}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1 justify-end">
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedReceipt({
                                    invoiceNumber: `INV-${(pay.periodName || '2026').replace(/\s+/g, '').toUpperCase()}-${pay.propertyCode.replace(/[^A-Z0-9]/g, '')}`,
                                    periodName: pay.periodName || 'September 2026',
                                    propertyCode: pay.propertyCode,
                                    residentName: resident,
                                    amount: pay.amount,
                                    paidAt: pay.paidAt || '28 September 2026',
                                    paymentMethod: pay.method,
                                    referenceNumber: pay.reference || receiptNo,
                                    kepalaKomplekName: kepalaKomplekName,
                                    isInvoice: false,
                                    items: pay.amount === 350000 ? [
                                      { name: 'Iuran RT (Sampah, Kebersihan Lingkungan & Fasum RT)', amount: 250000, desc: 'Pengangkutan armada sampah dinas LH, saluran air & fasum RT' },
                                      { name: 'Iuran RW (Retribusi Paguyuban & Wilayah RW)', amount: 100000, desc: 'Retribusi paguyuban komplek & koordinasi wilayah RW' },
                                    ] : (pay.amount === 250000 ? [
                                      { name: 'Iuran RT (Pengangkutan Sampah, Kebersihan & Fasum RT)', amount: 250000, desc: 'Pengangkutan armada sampah dinas LH, saluran air, fasum dan operasional RT' }
                                    ] : undefined),
                                  })
                                }
                                className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-bold text-[11px] inline-flex items-center gap-1 active:scale-[0.98] transition-all"
                                title="Buka & Cetak Kuitansi Resmi"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>Cetak</span>
                              </button>

                              <a
                                href={getPaymentWaUrl(pay)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] inline-flex items-center gap-1 active:scale-[0.98] transition-all"
                                title="Kirim Ulang Kuitansi Resmi ke WhatsApp Warga"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>Kirim WA</span>
                              </a>

                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedReceipt({
                                    invoiceNumber: `INV-${(pay.periodName || '2026').replace(/\s+/g, '').toUpperCase()}-${pay.propertyCode.replace(/[^A-Z0-9]/g, '')}`,
                                    periodName: pay.periodName || 'September 2026',
                                    propertyCode: pay.propertyCode,
                                    residentName: resident,
                                    amount: pay.amount,
                                    paidAt: pay.paidAt || '28 September 2026',
                                    paymentMethod: pay.method,
                                    referenceNumber: pay.reference || receiptNo,
                                    kepalaKomplekName: kepalaKomplekName,
                                    isInvoice: true,
                                    items: pay.amount === 350000 ? [
                                      { name: 'Iuran RT (Sampah, Kebersihan Lingkungan & Fasum RT)', amount: 250000, desc: 'Pengangkutan armada sampah dinas LH, saluran air & fasum RT' },
                                      { name: 'Iuran RW (Retribusi Paguyuban & Wilayah RW)', amount: 100000, desc: 'Retribusi paguyuban komplek & koordinasi wilayah RW' },
                                    ] : (pay.amount === 250000 ? [
                                      { name: 'Iuran RT (Pengangkutan Sampah, Kebersihan & Fasum RT)', amount: 250000, desc: 'Pengangkutan armada sampah dinas LH, saluran air, fasum dan operasional RT' }
                                    ] : undefined),
                                  })
                                }
                                className="px-2 py-1.5 bg-canvas hover:bg-surface border border-border text-ink-muted hover:text-ink rounded-lg font-bold text-[11px] inline-flex items-center gap-1 active:scale-[0.98] transition-all"
                                title="Lihat Surat Tagihan / Invoice"
                              >
                                <FileText className="w-3.5 h-3.5" />
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
          </div>
        </div>
      )}

      {/* ================= SUBTAB 3: LOKET KASIR TUNAI / POS SATPAM ================= */}
      {activeSubTab === 'manual_counter' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="p-5 bg-surface rounded-3xl border border-border shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <h3 className="font-black text-base text-ink flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-emerald-600" />
                  Loket Kasir Penerimaan Tunai / Pos Satpam
                </h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  Pencatatan setoran uang tunai langsung dari warga di pos keamanan atau ke bendahara, otomatis melunasi tagihan dan menerbitkan kuitansi seketika.
                </p>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl font-mono font-bold text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Loket Siap Melayani
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* POS FORM */}
              <div className="lg:col-span-7 space-y-4">
                <form onSubmit={handleQuickCounterSubmit} className="space-y-4 text-xs">
                  {/* Step 1: Select Unit */}
                  <div className="p-4 bg-canvas/70 rounded-2xl border border-border space-y-2.5">
                    <label className="font-black text-ink block text-xs flex items-center justify-between">
                      <span>1. Pilih Unit Rumah / Kavling Warga:</span>
                      <span className="text-[10px] font-mono text-ink-muted">14 Kavling Grand Sariwangi</span>
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto pr-1">
                      {clusterProperties.map((p) => {
                        const isSelected = counterHouseCode.toLowerCase() === p.code.toLowerCase();
                        return (
                          <button
                            key={p.code}
                            type="button"
                            onClick={() => {
                              setCounterHouseCode(p.code);
                              setCounterPayerName(p.residentName || p.ownerName);
                            }}
                            className={`p-2 rounded-xl text-left border transition-all active:scale-[0.98] ${
                              isSelected
                                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs font-bold'
                                : 'bg-surface hover:bg-canvas border-border text-ink font-medium'
                            }`}
                          >
                            <span className="font-black font-mono block text-xs">{p.code}</span>
                            <span className="text-[10px] truncate block opacity-90">{p.residentName || p.ownerName}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 2: Quick Amount Presets */}
                  <div className="p-4 bg-canvas/70 rounded-2xl border border-border space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="font-black text-ink block text-xs">
                        2. Nominal Pembayaran Uang Tunai:
                      </label>
                      <span className="font-mono font-black text-sm text-emerald-700">
                        {formatRupiah(counterAmount)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { label: '1 Bulan (Iuran RT)', amount: 250000 },
                        { label: '1 Bulan (RT + RW)', amount: 350000 },
                        { label: '2 Bulan Pelunasan', amount: 500000 },
                        { label: 'Triwulan (3 Bulan)', amount: 750000 },
                        { label: 'Semester (6 Bulan)', amount: 1500000 },
                        { label: '1 Tahun Penuh', amount: 3000000 },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setCounterAmount(preset.amount)}
                          className={`p-2 rounded-xl border text-center transition-all active:scale-[0.98] ${
                            counterAmount === preset.amount
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs font-black'
                              : 'bg-surface hover:bg-canvas border-border text-ink font-bold'
                          }`}
                        >
                          <span className="block text-xs font-mono">{formatRupiah(preset.amount)}</span>
                          <span className="text-[9px] opacity-80 block">{preset.label}</span>
                        </button>
                      ))}
                    </div>

                    <div className="pt-1">
                      <span className="text-[10px] text-ink-muted font-bold block mb-1">Atau Ketik Nominal Kustom (Rp):</span>
                      <input
                        type="number"
                        value={counterAmount}
                        onChange={(e) => setCounterAmount(Number(e.target.value))}
                        required
                        className="w-full p-2.5 bg-surface border border-border rounded-xl font-mono font-bold text-ink text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Step 3: Receiver & Period */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-ink block mb-1">Periode Pembayaran:</label>
                      <select
                        value={counterPeriod}
                        onChange={(e) => setCounterPeriod(e.target.value)}
                        className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                      >
                        {availablePeriods.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-ink block mb-1">Petugas Penerima Uang Fisik:</label>
                      <select
                        value={counterCollector}
                        onChange={(e) => setCounterCollector(e.target.value)}
                        className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                      >
                        <option value="Pos Satpam (Petugas Jaga)">Pos Satpam (Petugas Jaga)</option>
                        <option value="Bendahara RT (Hendra Wijaya)">Bendahara RT (Hendra Wijaya)</option>
                        <option value="Kepala Komplek (Yahya Nursidik)">Kepala Komplek (Yahya Nursidik)</option>
                      </select>
                    </div>
                  </div>

                  {/* Extra Notes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-ink block mb-1">Nama Penyetor (Opsional):</label>
                      <input
                        type="text"
                        placeholder="Bpk/Ibu Warga"
                        value={counterPayerName}
                        onChange={(e) => setCounterPayerName(e.target.value)}
                        className="w-full p-2.5 bg-canvas border border-border rounded-xl font-medium text-ink"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-ink block mb-1">No. Bukti / Nota Tunai:</label>
                      <input
                        type="text"
                        value={counterRef}
                        onChange={(e) => setCounterRef(e.target.value)}
                        className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink text-xs"
                      />
                    </div>
                  </div>

                  {/* SUBMIT BUTTON */}
                  <button
                    type="submit"
                    disabled={counterProcessing}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-sm rounded-2xl shadow-xs transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    <span>{counterProcessing ? 'Membukukan Setoran...' : 'Terima Uang Tunai & Terbitkan Kuitansi Seketika'}</span>
                  </button>
                </form>
              </div>

              {/* LIVE TICKET / POS PREVIEW */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-5 bg-canvas rounded-2xl border border-border space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <span className="font-black text-ink text-sm flex items-center gap-1.5">
                      <Receipt className="w-4 h-4 text-primary-600" />
                      Ringkasan Nota Loket Fisik
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono font-bold text-[10px]">
                      KAS TUNAI
                    </span>
                  </div>

                  <div className="space-y-2.5 bg-surface p-4 rounded-xl border border-border/80">
                    <div className="flex justify-between items-center">
                      <span className="text-ink-muted">Kode Unit:</span>
                      <strong className="font-mono text-primary-700 text-sm">Rumah {counterHouseCode}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-ink-muted">Penghuni / Pemilik:</span>
                      <span className="font-bold text-ink">
                        {counterPayerName || clusterProperties.find((p) => p.code.toLowerCase() === counterHouseCode.toLowerCase())?.residentName || 'Warga'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-ink-muted">Periode Iuran:</span>
                      <span className="font-semibold text-ink">{counterPeriod}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-ink-muted">Petugas Penerima:</span>
                      <span className="font-semibold text-ink">{counterCollector}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-border pt-2">
                      <span className="font-bold text-ink">Nominal Diterima:</span>
                      <strong className="font-mono font-black text-emerald-700 text-base">
                        {formatRupiah(counterAmount)}
                      </strong>
                    </div>
                  </div>

                  {/* Guard Operational Instructions */}
                  <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200/80 text-[11px] text-amber-950 space-y-1.5">
                    <span className="font-bold flex items-center gap-1 text-amber-900">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                      SOP Penerimaan Tunai di Pos Satpam:
                    </span>
                    <ol className="list-decimal pl-4 space-y-0.5 text-amber-900/90 font-medium">
                      <li>Hitung fisik uang tunai di hadapan warga yang menyetor.</li>
                      <li>Pastikan nominal pembayaran telah sesuai.</li>
                      <li>Tekan tombol hijau untuk mencatat dan membuka kuitansi.</li>
                      <li>Cetak kuitansi atau kirim konfirmasi WA ke nomor warga.</li>
                      <li>Simpan uang tunai di kotak kas pos satpam untuk disetor ke bendahara.</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUBTAB 4: KANAL REKENING PENERIMAAN ================= */}
      {activeSubTab === 'receiving_channels' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="p-5 bg-surface rounded-3xl border border-border shadow-card space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <h3 className="font-black text-base text-ink flex items-center gap-2">
                  <Building className="w-5 h-5 text-primary-600" />
                  Kanal Pembayaran Resmi Warga Komplek
                </h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  Informasi rekening perbankan, gateway QRIS, dan petunjuk resmi yang dibagikan kepada warga komplek Grand Sariwangi.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenAddBank}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Tambah Kanal Rekening</span>
                </button>
              </div>
            </div>

            {/* Official Channels Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {bankAccounts.map((acc) => {
                const isCopied = copiedBankAcc === acc.id;
                return (
                  <div key={acc.id} className="p-5 bg-canvas/60 rounded-2xl border border-border shadow-2xs space-y-3 relative overflow-hidden flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center font-black">
                          {acc.accountType === 'BANK_SYARIAH' ? (
                            <span className="text-sm">🌙</span>
                          ) : acc.accountType === 'QRIS_DINAMIS' ? (
                            <QrCode className="w-4 h-4" />
                          ) : acc.accountType === 'KAS_TUNAI' ? (
                            <Wallet className="w-4 h-4 text-amber-600" />
                          ) : (
                            <Building className="w-4 h-4" />
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          {acc.accountType === 'BANK_SYARIAH' && (
                            <span className="px-2 py-0.5 rounded-full font-bold text-[9px] bg-teal-100 text-teal-800">
                              🌙 SYARIAH
                            </span>
                          )}
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${acc.isPrimary ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                            {acc.isPrimary ? 'REKENING UTAMA' : 'KAS OPERASIONAL'}
                          </span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-black text-sm text-ink">{acc.bankName}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono font-black text-primary-700 text-sm">{acc.accountNumber}</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(acc.accountNumber);
                              setCopiedBankAcc(acc.id);
                              showToast(`Nomor rekening ${acc.bankName} berhasil disalin!`);
                              setTimeout(() => setCopiedBankAcc(null), 2500);
                            }}
                            className="p-1 bg-surface hover:bg-canvas border border-border rounded-md text-ink active:scale-[0.95] transition-all"
                            title="Salin Nomor Rekening"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-ink-muted" />}
                          </button>
                        </div>
                        <p className="text-[11px] text-ink-muted mt-0.5">a.n <strong>{acc.accountHolder}</strong></p>
                        {acc.notes && <p className="text-[10px] text-ink-muted italic mt-1">{acc.notes}</p>}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-ink-muted block">Saldo Kas Terkini:</span>
                        <span className="font-black text-emerald-700 text-sm font-mono">{formatRupiah(acc.balance)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditBank(acc)}
                          className="px-2.5 py-1.5 bg-surface hover:bg-canvas border border-border text-ink rounded-lg font-bold inline-flex items-center gap-1 text-[11px]"
                        >
                          <Edit3 className="w-3 h-3 text-primary-600" />
                          <span>Edit</span>
                        </button>
                        {!acc.isPrimary && bankAccounts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteBank(acc.id)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-bold"
                            title="Hapus Rekening"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Ready-to-Send WhatsApp Broadcast Card */}
            <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 text-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/80 pb-2">
                <span className="font-black text-emerald-950 flex items-center gap-1.5 text-sm">
                  <Share2 className="w-4 h-4 text-emerald-600" />
                  Format Pesan Siaran WhatsApp (Broadcast ke Grup Warga)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(broadcastWaText);
                    setCopiedBroadcast(true);
                    showToast('Format pesan pengumuman rekening berhasil disalin!');
                    setTimeout(() => setCopiedBroadcast(false), 2500);
                  }}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs inline-flex items-center gap-1.5 shadow-2xs active:scale-[0.98] transition-all self-start sm:self-auto"
                >
                  {copiedBroadcast ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedBroadcast ? 'Tersalin ke Clipboard!' : 'Salin Format Siap Kirim'}</span>
                </button>
              </div>

              <div className="p-3 bg-white rounded-xl border border-emerald-200 text-emerald-950 font-mono text-[11px] whitespace-pre-line leading-relaxed overflow-x-auto">
                {broadcastWaText}
              </div>
            </div>
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
                <span>{isAddingBank ? 'Tambah Rekening Kas / E-Wallet Baru' : 'Edit Informasi Rekening Kas Paguyuban'}</span>
              </h3>
              <button onClick={() => setShowBankEditModal(false)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            <form onSubmit={handleSaveBankAccounts} className="space-y-3">
              {!isAddingBank ? (
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
                        setBAccountType(acc.accountType || 'BANK_OPERASIONAL');
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
              ) : (
                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Mendaftarkan rekening bank baru / dompet digital kas komunitas</span>
                </div>
              )}

              {/* Tipe Akun / Kategori */}
              <div>
                <label className="font-bold text-ink block mb-1">Jenis Akun Kas *</label>
                <select
                  value={bAccountType}
                  onChange={(e: any) => setBAccountType(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink text-xs"
                >
                  <option value="BANK_SYARIAH">🌙 Bank Syariah (BSI, Muamalat, BCA Syariah, dll)</option>
                  <option value="BANK_OPERASIONAL">🏦 Bank Konvensional / Giro (BCA, Mandiri, BRI, BNI)</option>
                  <option value="E_WALLET">💳 Dompet Digital / E-Wallet (GoPay, DANA, OVO, ShopeePay)</option>
                  <option value="QRIS_DINAMIS">📱 Gateway QRIS Dinamis</option>
                  <option value="KAS_TUNAI">💵 Kas Tunai Fisik (Petty Cash Pos Satpam)</option>
                </select>
              </div>

              {/* Quick Presets */}
              <div>
                <label className="text-[10px] text-ink-muted uppercase font-bold block mb-1">Pilihan Cepat Nama Bank / E-Wallet:</label>
                <div className="flex flex-wrap gap-1">
                  {[
                    { name: 'Bank Syariah Indonesia (BSI)', type: 'BANK_SYARIAH' as const },
                    { name: 'Bank Muamalat', type: 'BANK_SYARIAH' as const },
                    { name: 'BCA Syariah', type: 'BANK_SYARIAH' as const },
                    { name: 'GoPay Kas', type: 'E_WALLET' as const },
                    { name: 'DANA Bisnis', type: 'E_WALLET' as const },
                    { name: 'Bank Mandiri', type: 'BANK_OPERASIONAL' as const },
                    { name: 'Bank BCA', type: 'BANK_OPERASIONAL' as const },
                    { name: 'Bank BRI', type: 'BANK_OPERASIONAL' as const },
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setBBankName(preset.name);
                        setBAccountType(preset.type);
                      }}
                      className="px-2 py-0.5 rounded-lg bg-surface border border-border text-ink hover:border-primary-400 text-[10px] font-bold active:scale-[0.98]"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Nama Bank / E-Wallet / Kas *</label>
                <input
                  type="text"
                  placeholder="Contoh: Bank Syariah Indonesia (BSI) / GoPay Kas"
                  value={bBankName}
                  onChange={(e) => setBBankName(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">Nomor Rekening / No HP E-Wallet *</label>
                  <input
                    type="text"
                    placeholder="Contoh: 7142-9988-11 / 0812-xxxx"
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

              {(bAccountType === 'QRIS_DINAMIS' || editingBankId === 'acc-qris-01') && (
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
                  placeholder="Contoh: Rekening utama iuran IPL (Syariah) atau Dompet kas bendahara"
                  value={bNotes}
                  onChange={(e) => setBNotes(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowBankEditModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas active:scale-[0.98] transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-xs active:scale-[0.98] transition-all"
                >
                  {isAddingBank ? 'Simpan Rekening Baru' : 'Simpan Perubahan Rekening'}
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
                    className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl active:scale-[0.98] transition-all"
                  >
                    Tolak Pembayaran
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVerify(viewingProof.id)}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs active:scale-[0.98] transition-all"
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
                      className="w-full py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs active:scale-[0.98] transition-all"
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
                  className="px-4 py-2 bg-surface hover:bg-canvas border border-border text-ink font-bold rounded-xl active:scale-[0.98] transition-all"
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
                <label className="font-bold text-ink block mb-1">Pilih Unit Rumah / Kavling *</label>
                <select
                  value={formHouseCode}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormHouseCode(val);
                    const matched = clusterProperties.find(p => p.code.toLowerCase() === val.toLowerCase());
                    if (matched) {
                      setFormOwnerName(matched.residentName || matched.ownerName);
                    }
                  }}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {clusterProperties.map(p => (
                    <option key={p.code} value={p.code}>
                      {p.code} — {p.residentName || p.ownerName} ({p.statusLabel})
                    </option>
                  ))}
                  <option value="__CUSTOM__">➕ Ketik Unit Kustom Lainnya...</option>
                </select>
                {formHouseCode === '__CUSTOM__' && (
                  <input
                    type="text"
                    placeholder="Contoh: Kav A / Rumah 10"
                    onChange={(e) => setFormHouseCode(e.target.value)}
                    className="w-full mt-2 p-2 bg-surface border border-border rounded-xl font-bold text-ink text-xs"
                    required
                  />
                )}
                {formOwnerName && (
                  <span className="text-[10px] text-ink-muted mt-1 flex items-center gap-1.5">
                    Penghuni Sekarang: <strong className="text-ink">{formOwnerName}</strong>
                    {clusterProperties.find(p => p.code.toLowerCase() === formHouseCode.toLowerCase())?.isRented && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-sky-50 text-sky-700 border border-sky-200">
                        Penyewa / Kontrak
                      </span>
                    )}
                  </span>
                )}
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-ink block">Metode</label>
                    <button
                      type="button"
                      onClick={() => setShowAddMethodSection(!showAddMethodSection)}
                      className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-0.5 active:scale-[0.98] transition-all hover:underline"
                      title="Tambah Bank Digital / E-Wallet Baru"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ Tambah</span>
                    </button>
                  </div>
                  <select
                    value={formMethod}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '__ADD_NEW__') {
                        setShowAddMethodSection(true);
                      } else {
                        setFormMethod(val);
                        if ((val === 'CASH_KEPALA_KOMPLEK' || val.includes('Kepala Komplek')) && (!formNotes || formNotes.includes('Diterima'))) {
                          let kpName = 'Yahya Nursidik';
                          try {
                            const savedK = typeof window !== 'undefined' ? localStorage.getItem('wargahub_set_kepala_komplek') : null;
                            if (savedK) {
                              const parsed = JSON.parse(savedK);
                              if (parsed && typeof parsed === 'string' && !parsed.toLowerCase().includes('bambang sutrisno')) kpName = parsed;
                            }
                          } catch (err) {}
                          setFormNotes(`Diterima langsung oleh Kepala Komplek (${kpName})`);
                        }
                      }
                    }}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {customPaymentMethods.length > 0 && (
                      <optgroup label="⭐ Bank / E-Wallet Kustom Anda">
                        {customPaymentMethods.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    <optgroup label="🌙 Bank Syariah">
                      <option value="Bank Syariah Indonesia (BSI)">Bank Syariah Indonesia (BSI)</option>
                      <option value="Bank Muamalat (Syariah)">Bank Muamalat</option>
                      <option value="BCA Syariah">BCA Syariah</option>
                      <option value="Bank Aladin Syariah">Bank Aladin Syariah</option>
                      <option value="Bank Jago Syariah">Bank Jago Syariah</option>
                      <option value="Bank Mega Syariah">Bank Mega Syariah</option>
                    </optgroup>
                    <optgroup label="💳 Dompet Digital / E-Wallet">
                      <option value="GoPay">GoPay</option>
                      <option value="DANA">DANA</option>
                      <option value="OVO">OVO</option>
                      <option value="ShopeePay">ShopeePay</option>
                      <option value="LinkAja">LinkAja</option>
                      <option value="AstraPay">AstraPay</option>
                    </optgroup>
                    <optgroup label="📱 Bank Digital">
                      <option value="Bank Jago">Bank Jago</option>
                      <option value="SeaBank">SeaBank</option>
                      <option value="Blu by BCA Digital">Blu by BCA Digital</option>
                      <option value="Bank Neo Commerce">Bank Neo Commerce (BNC)</option>
                      <option value="Allobank">Allobank</option>
                      <option value="Jenius (BTPN)">Jenius (BTPN)</option>
                    </optgroup>
                    <optgroup label="🏦 Bank Konvensional">
                      <option value="Transfer Bank BCA">Transfer Bank BCA</option>
                      <option value="Transfer Bank Mandiri">Transfer Bank Mandiri</option>
                      <option value="Transfer Bank BRI">Transfer Bank BRI</option>
                      <option value="Transfer Bank BNI">Transfer Bank BNI</option>
                      <option value="Transfer Bank CIMB Niaga">Transfer Bank CIMB Niaga</option>
                      <option value="Transfer Bank Permata">Transfer Bank Permata</option>
                      <option value="Transfer Bank Danamon">Transfer Bank Danamon</option>
                    </optgroup>
                    <optgroup label="💵 Tunai & QRIS">
                      <option value="Tunai (Diterima oleh Kepala Komplek)">💵 Tunai (Diterima oleh Kepala Komplek)</option>
                      <option value="Tunai / Cash">Tunai / Cash</option>
                      <option value="QRIS Dinamis">QRIS Dinamis</option>
                    </optgroup>
                    {['BCA_TRANSFER', 'MANDIRI_TRANSFER', 'BRI_TRANSFER', 'CASH', 'CASH_KEPALA_KOMPLEK', 'QRIS'].includes(formMethod) && (
                      <optgroup label="Pilihan Tersimpan">
                        <option value={formMethod}>{formatPaymentMethod(formMethod)}</option>
                      </optgroup>
                    )}
                    <option value="__ADD_NEW__">➕ Tambah Bank / E-Wallet Baru...</option>
                  </select>
                </div>
              </div>

              {/* Box Tambah Metode Baru */}
              {showAddMethodSection && (
                <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-300 rounded-2xl space-y-2.5 animate-in fade-in slide-in-from-top-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-emerald-950 flex items-center gap-1.5 text-xs">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                      Tambah Bank Digital, E-Wallet, atau Bank Lainnya
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddMethodSection(false)}
                      className="text-emerald-700 hover:text-emerald-950 text-[11px] font-bold"
                    >
                      ✕ Batal
                    </button>
                  </div>

                  {/* Preset Quick Chips */}
                  <div>
                    <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block mb-1">
                      Pilihan Cepat (Klik untuk Langsung Tambah & Pilih):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {POPULAR_PAYMENT_SUGGESTIONS.map((sug) => (
                        <button
                          key={sug.name}
                          type="button"
                          onClick={() => {
                            handleAddCustomMethod(sug.name);
                            setShowAddMethodSection(false);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-900 font-bold text-[10px] hover:bg-emerald-100 active:scale-[0.98] transition-all shadow-2xs inline-flex items-center gap-1"
                        >
                          <span>+ {sug.name}</span>
                          <span className="text-[8px] px-1 py-0.2 bg-emerald-100 text-emerald-800 rounded font-normal">
                            {sug.category}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Name Input */}
                  <div>
                    <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block mb-1">
                      Atau Ketik Nama Bank / Dompet Digital Kustom:
                    </span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Contoh: SeaBank / Bank Jago / DANA / AstraPay"
                        value={customMethodInput}
                        onChange={(e) => setCustomMethodInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (customMethodInput.trim()) {
                              handleAddCustomMethod(customMethodInput.trim());
                              setCustomMethodInput('');
                              setShowAddMethodSection(false);
                            }
                          }
                        }}
                        className="flex-1 p-2 bg-white border border-emerald-300 rounded-xl font-bold text-ink text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (customMethodInput.trim()) {
                            handleAddCustomMethod(customMethodInput.trim());
                            setCustomMethodInput('');
                            setShowAddMethodSection(false);
                          }
                        }}
                        disabled={!customMethodInput.trim()}
                        className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs disabled:opacity-50 active:scale-[0.98] transition-all shadow-xs shrink-0"
                      >
                        Simpan & Pilih
                      </button>
                    </div>
                  </div>
                </div>
              )}

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
                  className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas active:scale-[0.98] transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingPayment}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs disabled:opacity-50 active:scale-[0.98] transition-all"
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
                className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas active:scale-[0.98] transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeletePayment}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs active:scale-[0.98] transition-all"
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
                className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas active:scale-[0.98] transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={bulkProcessing}
                onClick={handleConfirmBulkDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
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
