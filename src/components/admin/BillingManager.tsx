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
  Settings,
  Wallet,
  Table,
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import { formatRupiah } from '../../lib/format';
import { ReceiptModal } from '../shared/ReceiptModal';
import { WhatsAppDuesReportModal } from '../shared/WhatsAppDuesReportModal';

interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  propertyId: string;
  propertyCode: string;
  areaLabel?: string;
  ownerName?: string;
  residentName?: string;
  occupancyStatus?: string;
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
  paymentMethod?: string;
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

export const GRAND_SARIWANGI_TARIFF_COMPONENTS: TariffComponent[] = [
  { id: 'tf-rt', name: '1. Iuran RT (Pengangkutan Sampah, Kebersihan & Fasum RT)', fee: 250000, desc: 'Armada pengangkutan sampah dinas LH, kebersihan saluran air, fasum dan operasional RT' },
  { id: 'tf-rw', name: '2. Iuran RW (Retribusi Paguyuban & Wilayah RW)', fee: 100000, desc: 'Retribusi paguyuban komplek, koordinasi keamanan wilayah RW dan administrasi' },
];

const DEFAULT_TARIFF_COMPONENTS: TariffComponent[] = GRAND_SARIWANGI_TARIFF_COMPONENTS;

const CLUSTER_PROPERTIES_FALLBACK = [
  { code: 'Kav A', ownerName: 'Pak Verial', residentName: 'Pak Verial', area: 'Klaster 14 Kavling', statusLabel: 'Penghuni', isRented: false },
  { code: 'Kav B', ownerName: 'Mahasiswa Polban', residentName: 'Mahasiswa Polban', area: 'Klaster 14 Kavling', statusLabel: 'Penyewa / Kontrak', isRented: true },
  { code: 'Kav C', ownerName: 'Bu Rina (Kosong)', residentName: 'Bu Rina (Kosong)', area: 'Klaster 14 Kavling', statusLabel: 'Kosong', isRented: false },
  { code: 'Kav D', ownerName: 'Pak Rieva', residentName: 'Pak Rieva', area: 'Klaster 14 Kavling', statusLabel: 'Penghuni', isRented: false },
  { code: 'Kav E', ownerName: 'Pak Budi', residentName: 'Pak Budi', area: 'Klaster 14 Kavling', statusLabel: 'Penghuni', isRented: false },
  { code: 'Kav F', ownerName: 'Pa Anggia', residentName: 'Pa Anggia', area: 'Klaster 14 Kavling', statusLabel: 'Penyewa / Kontrak', isRented: true },
  { code: 'Kav G', ownerName: 'Pak Misael', residentName: 'Pak Misael', area: 'Klaster 14 Kavling', statusLabel: 'Penghuni', isRented: false },
  { code: 'Kav H', ownerName: 'Pak Fahmi Rizal', residentName: 'Pak Fahmi Rizal', area: 'Klaster 14 Kavling', statusLabel: 'Penghuni', isRented: false },
  { code: 'Kav I', ownerName: 'Pak Yahya', residentName: 'Pak Yahya', area: 'Klaster 14 Kavling', statusLabel: 'Penyewa / Kontrak', isRented: true },
  { code: 'Kav J', ownerName: 'Bu Sofia P (Kosong)', residentName: 'Bu Sofia P (Kosong)', area: 'Klaster 14 Kavling', statusLabel: 'Kosong', isRented: false },
  { code: 'Kav K', ownerName: 'Pak Eky', residentName: 'Pak Eky', area: 'Klaster 14 Kavling', statusLabel: 'Penghuni', isRented: false },
  { code: 'Kav L', ownerName: 'Pak Haji Ano', residentName: 'Pak Haji Ano', area: 'Klaster 14 Kavling', statusLabel: 'Penghuni', isRented: false },
  { code: 'Kav M', ownerName: 'Pak Dedi N / Pak Jaya (Kosong)', residentName: 'Pak Dedi N / Pak Jaya (Kosong)', area: 'Klaster 14 Kavling', statusLabel: 'Kosong', isRented: false },
];

interface BillingManagerProps {
  initialPeriodId?: string;
  initialPeriodName: string;
  initialInvoices: InvoiceItem[];
  allInvoices?: any[];
  initialProgress: BillingProgress;
  initialProperties?: any[];
  allPeriods?: any[];
  initialBalance?: number;
}

export const BillingManager: React.FC<BillingManagerProps> = ({
  initialPeriodId,
  initialPeriodName,
  initialInvoices,
  allInvoices = [],
  initialProgress,
  initialProperties = [],
  allPeriods = [],
  initialBalance = 2865000,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'invoices' | 'annual_matrix' | 'tariffs' | 'batch'>('invoices');
  const [invoices, setInvoices] = useState<InvoiceItem[]>(initialInvoices || []);
  const [progress, setProgress] = useState<BillingProgress>(initialProgress);
  const [currentBalance, setCurrentBalance] = useState<number>(initialBalance);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);
  const [matrixYear] = useState<number>(2026);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setInvoices(initialInvoices || []);
  }, [initialInvoices]);

  useEffect(() => {
    setProgress(initialProgress);
  }, [initialProgress]);

  useEffect(() => {
    if (typeof initialBalance === 'number') {
      setCurrentBalance(initialBalance);
    }
  }, [initialBalance]);

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
            ownerName: resident, // Selalu prioritaskan nama penghuni sekarang / penyewa
            legalOwner: p.legalOwner || p.ownerName,
            statusLabel,
            isRented,
            area: p.blockName || p.address || 'Grand Sariwangi',
          };
        });
      if (filtered.length > 0) return filtered;
    }
    return CLUSTER_PROPERTIES_FALLBACK;
  }, [initialProperties]);

  const availablePeriods = useMemo(() => {
    const list: string[] = ['Oktober 2026', 'September 2026', 'Agustus 2026', 'Juli 2026', 'Juni 2026', 'Mei 2026', 'April 2026', 'Maret 2026', 'Februari 2026', 'Januari 2026'];
    if (allPeriods && allPeriods.length > 0) {
      allPeriods.forEach((p: any) => {
        if (p.name && !list.includes(p.name)) {
          list.push(p.name);
        }
      });
    }
    if (initialPeriodName && !list.includes(initialPeriodName)) {
      list.unshift(initialPeriodName);
    }
    return list;
  }, [allPeriods, initialPeriodName]);

  // Computed property dues report items for WhatsApp modal
  const reportProperties = useMemo(() => {
    const list = clusterProperties.length > 0 ? clusterProperties : CLUSTER_PROPERTIES_FALLBACK;
    const invMap = new Map<string, InvoiceItem>();
    invoices.forEach((inv) => {
      invMap.set(inv.propertyCode.toLowerCase(), inv);
    });

    return list.map((p) => {
      const inv = invMap.get(p.code.toLowerCase());
      const isPaid = inv?.status === 'PAID';
      const resident = p.residentName || p.ownerName || inv?.residentName || 'Warga';

      let unpaidMonths = isPaid ? 0 : 1;
      let unpaidPeriods = isPaid ? [] : [initialPeriodName];

      if (allInvoices && allInvoices.length > 0) {
        const propAllInvs = allInvoices.filter(
          (ai: any) =>
            ai.propertyCode?.toLowerCase() === p.code.toLowerCase() &&
            ai.status !== 'PAID'
        );
        if (propAllInvs.length > 0) {
          unpaidMonths = propAllInvs.length;
          unpaidPeriods = propAllInvs.map((ai: any) => ai.billingPeriodName || ai.billingPeriodId);
        } else if (isPaid) {
          unpaidMonths = 0;
          unpaidPeriods = [];
        }
      }

      return {
        code: p.code,
        residentName: resident,
        isRented: p.isRented,
        status: isPaid ? 'PAID' : 'UNPAID',
        unpaidMonthsCount: unpaidMonths,
        unpaidPeriodNames: unpaidPeriods,
        monthlyRate: inv?.total || 250000,
        totalDueAmount: (inv?.total || 250000) * (unpaidMonths || 1),
      };
    });
  }, [clusterProperties, invoices, allInvoices, initialPeriodName]);

  const MONTHS_LIST = useMemo(
    () => [
      { num: 1, key: '01', short: 'Jan', name: 'Januari' },
      { num: 2, key: '02', short: 'Feb', name: 'Februari' },
      { num: 3, key: '03', short: 'Mar', name: 'Maret' },
      { num: 4, key: '04', short: 'Apr', name: 'April' },
      { num: 5, key: '05', short: 'Mei', name: 'Mei' },
      { num: 6, key: '06', short: 'Jun', name: 'Juni' },
      { num: 7, key: '07', short: 'Jul', name: 'Juli' },
      { num: 8, key: '08', short: 'Agu', name: 'Agustus' },
      { num: 9, key: '09', short: 'Sep', name: 'September' },
      { num: 10, key: '10', short: 'Okt', name: 'Oktober' },
      { num: 11, key: '11', short: 'Nov', name: 'November' },
      { num: 12, key: '12', short: 'Des', name: 'Desember' },
    ],
    []
  );

  const annualMatrixData = useMemo(() => {
    const list = clusterProperties.length > 0 ? clusterProperties : CLUSTER_PROPERTIES_FALLBACK;
    const allInvs = allInvoices && allInvoices.length > 0 ? allInvoices : invoices;

    return list.map((prop) => {
      const propCode = prop.code.toLowerCase();
      const resident = prop.residentName || prop.ownerName || 'Warga';

      let totalPaidCount = 0;
      let totalPaidAmount = 0;
      let totalUnpaidCount = 0;
      let totalUnpaidAmount = 0;
      const unpaidMonthsNames: string[] = [];

      const months = MONTHS_LIST.map((m) => {
        // Find matching invoice for this house & month
        const matchedInv = allInvs.find((inv: any) => {
          const invCode = (inv.propertyCode || inv.houseCode || '').toLowerCase();
          const matchHouse = invCode === propCode || invCode === propCode.replace(/\s+/g, '');
          if (!matchHouse) return false;

          const pName = (inv.billingPeriodName || inv.billingPeriodId || '').toLowerCase();
          return (
            pName.includes(m.name.toLowerCase()) ||
            pName.includes(m.short.toLowerCase()) ||
            pName.includes(`-${m.key}`) ||
            (inv.dueDate && inv.dueDate.includes(`-${m.key}-`))
          );
        });

        let status: 'PAID' | 'UNPAID' | 'PENDING' | 'FUTURE' = 'FUTURE';
        const amount = matchedInv ? Number(matchedInv.total) || 250000 : 250000;

        if (matchedInv) {
          if (matchedInv.status === 'PAID') {
            status = 'PAID';
            totalPaidCount += 1;
            totalPaidAmount += amount;
          } else if (matchedInv.status === 'PENDING_VERIFICATION') {
            status = 'PENDING';
            totalUnpaidCount += 1;
            totalUnpaidAmount += amount;
            unpaidMonthsNames.push(m.name);
          } else {
            status = 'UNPAID';
            totalUnpaidCount += 1;
            totalUnpaidAmount += amount;
            unpaidMonthsNames.push(m.name);
          }
        } else {
          // Active month boundary (October 2026 is month 10)
          const activeMonthNum = 10;
          if (m.num <= activeMonthNum) {
            const currInv = invoices.find(
              (ci) => ci.propertyCode.toLowerCase() === propCode && ci.status === 'PAID'
            );
            if (currInv && m.num === activeMonthNum) {
              status = 'PAID';
              totalPaidCount += 1;
              totalPaidAmount += amount;
            } else if (currInv && m.num < activeMonthNum && prop.code !== 'Kav B' && prop.code !== 'Kav F') {
              status = 'PAID';
              totalPaidCount += 1;
              totalPaidAmount += amount;
            } else {
              status = 'UNPAID';
              totalUnpaidCount += 1;
              totalUnpaidAmount += amount;
              unpaidMonthsNames.push(m.name);
            }
          } else {
            status = 'FUTURE';
          }
        }

        return {
          month: m,
          status,
          amount,
          invoice: matchedInv,
        };
      });

      return {
        propertyCode: prop.code,
        residentName: resident,
        statusLabel: prop.statusLabel,
        isRented: prop.isRented,
        months,
        totalPaidCount,
        totalPaidAmount,
        totalUnpaidCount,
        totalUnpaidAmount,
        unpaidMonthsNames,
      };
    });
  }, [clusterProperties, allInvoices, invoices, MONTHS_LIST]);

  const getAnnualWaReminderUrl = (row: any) => {
    let bankTitle = 'Bank Mandiri';
    let bankNumber = '1300024446419';
    let bankHolder = 'Paguyuban Grand Sariwangi';
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('wargahub_bank_accounts');
        if (saved) {
          const accs = JSON.parse(saved);
          if (Array.isArray(accs) && accs.length > 0) {
            const pri = accs.find((a: any) => a.isPrimary) || accs[0];
            if (pri && pri.accountNumber !== 'BCA_MAIN') {
              bankTitle = pri.bankName || bankTitle;
              bankNumber = pri.accountNumber || bankNumber;
              bankHolder = pri.accountHolder || bankHolder;
            }
          }
        }
      } catch (e) {}
    }

    const monthsStr = row.unpaidMonthsNames.join(', ');
    const msg =
      `*PEMBERITAHUAN TUNGGAKAN IURAN IPL TAHUN 2026*\n` +
      `Komplek Grand Sariwangi\n` +
      `=========================================\n` +
      `Yth. Bpk/Ibu Penghuni *${row.propertyCode}* (${row.residentName})\n\n` +
      `Berdasarkan pembukuan bendahara paguyuban, terdapat tunggakan iuran IPL sebanyak *${row.totalUnpaidCount} Bulan*:\n` +
      `Periode: *${monthsStr}*\n` +
      `Total Kewajiban: *${formatRupiah(row.totalUnpaidAmount)}*\n\n` +
      `Pembayaran dapat ditransfer ke rekening resmi:\n` +
      `🏛 *${bankTitle}*\n` +
      `💳 No. Rek: *${bankNumber}*\n` +
      `👤 A.n: *${bankHolder}*\n\n` +
      `Mohon konfirmasi setelah melakukan transfer dengan mengirimkan bukti setor. Terima kasih atas partisipasinya menjaga kenyamanan lingkungan komplek kita. 🙏\n\n` +
      `_Pengurus Paguyuban Grand Sariwangi_`;

    return `https://wa.me/?text=${encodeURIComponent(msg)}`;
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'UNPAID' | 'PENDING'>('ALL');
  const [areaFilter, setAreaFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'code' | 'invoice' | 'total' | 'status' | 'due' | 'paidAt'>('code');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [communityName, setCommunityName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('wargahub_set_comm_name');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'string' && !parsed.toLowerCase().includes('taman sejahtera')) {
            return parsed;
          }
        }
      } catch (e) {}
    }
    return 'Grand Sariwangi';
  });

  // Tariff Structure & Mode State (Editable & Persisted)
  const [tariffMode, setTariffMode] = useState<'FLAT' | 'DETAILED'>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('wargahub_set_tariff_mode');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return 'FLAT';
  });

  const [flatFee, setFlatFee] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('wargahub_set_flat_fee');
        if (saved) return Number(JSON.parse(saved)) || 250000;
      } catch (e) {}
    }
    return 250000;
  });

  const [flatFeeName, setFlatFeeName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('wargahub_set_flat_name');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return 'Iuran Pengelolaan Lingkungan (IPL) Bulanan Warga';
  });

  const [tariffComponents, setTariffComponents] = useState<TariffComponent[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('wargahub_tariff_components');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const total = parsed.reduce((a: number, b: any) => a + (Number(b.fee) || 0), 0);
            if (total === 750000) return DEFAULT_TARIFF_COMPONENTS;
            return parsed;
          }
        }
      } catch (e) {}
    }
    return DEFAULT_TARIFF_COMPONENTS;
  });

  const [tariffNote, setTariffNote] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('wargahub_tariff_note') || 'Tarif iuran standar disepakati bersama dalam Musyawarah Warga RT 01 / RW 08 (Komplek Grand Sariwangi)';
    }
    return 'Tarif iuran standar disepakati bersama dalam Musyawarah Warga RT 01 / RW 08 (Komplek Grand Sariwangi)';
  });

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

  const [showTariffModal, setShowTariffModal] = useState(false);
  const [editableTariffMode, setEditableTariffMode] = useState<'FLAT' | 'DETAILED'>('FLAT');
  const [editableFlatFee, setEditableFlatFee] = useState(250000);
  const [editableFlatFeeName, setEditableFlatFeeName] = useState('Iuran Pengelolaan Lingkungan (IPL) Bulanan Warga');
  const [editableTariffs, setEditableTariffs] = useState<TariffComponent[]>(DEFAULT_TARIFF_COMPONENTS);
  const [editableTariffNote, setEditableTariffNote] = useState(tariffNote);

  const totalTariff = useMemo(() => {
    if (tariffMode === 'FLAT') return flatFee;
    return tariffComponents.reduce((acc, item) => acc + (Number(item.fee) || 0), 0);
  }, [tariffMode, flatFee, tariffComponents]);

  // Reactive listener to keep Billing in sync if tariffs are changed in Settings
  useEffect(() => {
    const handleTariffsUpdated = (e: any) => {
      if (e.detail) {
        if (e.detail.mode) {
          setTariffMode(e.detail.mode);
        }
        if (e.detail.mode === 'FLAT' && typeof e.detail.total === 'number') {
          setFlatFee(e.detail.total);
          setGenFee(e.detail.total);
        }
        const comps = e.detail.components || (Array.isArray(e.detail) ? e.detail : null);
        if (comps && Array.isArray(comps)) {
          setTariffComponents(comps);
          const newTotal = e.detail.total ?? comps.reduce((sum: number, it: any) => sum + (Number(it.fee) || 0), 0);
          setGenFee(newTotal);
          if (comps.length === 1) {
            setFlatFee(comps[0].fee);
            if (comps[0].name) setFlatFeeName(comps[0].name);
          }
        }
        if (e.detail.note) {
          setTariffNote(e.detail.note);
        }
        if (e.detail.kepalaKomplekName) {
          setKepalaKomplekName(e.detail.kepalaKomplekName);
        }
      }
    };
    const handleCommitteeUpdated = (e: any) => {
      if (e.detail?.kepalaKomplekName) {
        setKepalaKomplekName(e.detail.kepalaKomplekName);
      }
    };

    window.addEventListener('wargahub_tariffs_updated', handleTariffsUpdated);
    window.addEventListener('wargahub_committee_updated', handleCommitteeUpdated);
    return () => {
      window.removeEventListener('wargahub_tariffs_updated', handleTariffsUpdated);
      window.removeEventListener('wargahub_committee_updated', handleCommitteeUpdated);
    };
  }, []);

  // Modal & Toast State
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPublicModal, setShowPublicModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateMsg, setGenerateMsg] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  const handleOpenInvoiceDoc = (inv: InvoiceItem, isInvoiceDoc = false) => {
    const isReceivedByKepala =
      inv.paymentMethod === 'CASH_KEPALA_KOMPLEK' ||
      Boolean(inv.notes && inv.notes.toLowerCase().includes('kepala komplek'));

    const resolvedMethod = isReceivedByKepala
      ? `Tunai (Diterima oleh Kepala Komplek - ${kepalaKomplekName})`
      : inv.paymentMethod === 'CASH'
      ? 'Tunai (Diterima Pengurus/RT)'
      : inv.paymentMethod === 'QRIS'
      ? 'QRIS Komplek'
      : inv.paymentMethod === 'EWALLET'
      ? 'Dompet Digital / E-Wallet'
      : (inv.paymentMethod || (inv.status === 'PAID' ? 'Transfer Bank / E-Wallet (Otomatis)' : 'Transfer Bank (Jago Syariah / BSI)'));

    const matchedProp = clusterProperties.find(p => p.code.toLowerCase() === inv.propertyCode.toLowerCase());
    const resolvedResident = inv.residentName || (inv.ownerName && !inv.ownerName.startsWith('Warga Rumah') ? inv.ownerName : null) || matchedProp?.residentName || matchedProp?.ownerName || `Warga Rumah ${inv.propertyCode}`;

    setSelectedReceipt({
      invoiceNumber: inv.invoiceNumber,
      periodName: inv.billingPeriodName || initialPeriodName,
      propertyCode: inv.propertyCode,
      residentName: resolvedResident,
      amount: inv.total,
      paidAt: inv.paidAt || (inv.status === 'PAID' ? '15 Agustus 2026' : null),
      dueDate: inv.dueDate,
      status: inv.status,
      isInvoice: isInvoiceDoc,
      paymentMethod: resolvedMethod,
      referenceNumber: `TRX-${inv.propertyCode}-AUTO`,
      kepalaKomplekName: kepalaKomplekName,
      treasurerName: 'Yahya Nursidik',
      notes: inv.notes,
      items: tariffMode === 'DETAILED' ? tariffComponents : (inv.total === 350000 ? [
        { name: 'Iuran RT (Sampah, Kebersihan Lingkungan & Fasum RT)', amount: 250000, desc: 'Pengangkutan armada sampah LH, saluran air & fasum RT' },
        { name: 'Iuran RW (Retribusi Paguyuban & Wilayah RW)', amount: 100000, desc: 'Retribusi paguyuban komplek & koordinasi wilayah RW' },
      ] : (inv.total === 250000 ? [
        { name: 'Iuran RT (Pengangkutan Sampah, Fasum & Operasional RT)', amount: 250000, desc: 'Pengangkutan armada sampah dinas LH, saluran air & operasional RT' }
      ] : undefined)),
    });
  };
  const [invoiceToDelete, setInvoiceToDelete] = useState<InvoiceItem | null>(null);
  const [deleteReason, setDeleteReason] = useState('Kesalahan Input / Keringanan Pengurus');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Generate batch form state
  const [genYear, setGenYear] = useState<number>(() => {
    const m = initialPeriodName.match(/\b(20\d{2})\b/);
    return m ? Number(m[1]) : 2026;
  });
  const [genMonth, setGenMonth] = useState<number>(() => {
    const pLower = initialPeriodName.toLowerCase();
    for (const [mName, mNum] of Object.entries(MONTH_MAP)) {
      if (pLower.includes(mName)) return mNum;
    }
    return 10;
  });
  const [genDueDate, setGenDueDate] = useState<string>(() => {
    const pLower = initialPeriodName.toLowerCase();
    for (const [mName, mNum] of Object.entries(MONTH_MAP)) {
      if (pLower.includes(mName)) return `2026-${mNum.toString().padStart(2, '0')}-10`;
    }
    return '2026-10-10';
  });
  const [genFee, setGenFee] = useState(250000);

  // Form State for Single Direct Iuran / Invoice Modal
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [savingInvoice, setSavingInvoice] = useState(false);
  const [formPropertyMode, setFormPropertyMode] = useState<'SELECT' | 'CUSTOM'>('SELECT');
  const [formSelectedProp, setFormSelectedProp] = useState<string>('Kav A');
  const [formHouseCode, setFormHouseCode] = useState<string>('Kav A');
  const [formAreaLabel, setFormAreaLabel] = useState<string>('Grand Sariwangi');
  const [formOwnerName, setFormOwnerName] = useState<string>('Pak Verial');
  const [formPeriodMode, setFormPeriodMode] = useState<'SELECT' | 'CUSTOM'>('SELECT');
  const [formPeriodName, setFormPeriodName] = useState<string>(initialPeriodName || 'Oktober 2026');
  const [formTotalAmount, setFormTotalAmount] = useState<number>(250000);
  const [formSecurityFee, setFormSecurityFee] = useState<number>(150000);
  const [formCleaningFee, setFormCleaningFee] = useState<number>(50000);
  const [formSinkingFund, setFormSinkingFund] = useState<number>(50000);
  const [formAdditionalFee, setFormAdditionalFee] = useState<number>(0);
  const [formDueDate, setFormDueDate] = useState<string>(() => {
    const pLower = initialPeriodName.toLowerCase();
    for (const [mName, mNum] of Object.entries(MONTH_MAP)) {
      if (pLower.includes(mName)) return `2026-${mNum.toString().padStart(2, '0')}-10`;
    }
    return '2026-10-10';
  });
  const [formStatus, setFormStatus] = useState<'PAID' | 'UNPAID' | 'PENDING_VERIFICATION' | 'VOID'>('UNPAID');
  const [formPaymentMethod, setFormPaymentMethod] = useState<string>('CASH_KEPALA_KOMPLEK');
  const [formPaidAt, setFormPaidAt] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [formNotes, setFormNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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
        showToast(data.data?.message || `Tagihan massal periode ${periodName} berhasil dibuat.`);
        setTimeout(() => {
          setShowGenerateModal(false);
          setGenerateMsg('');
          const targetPeriodId = data.data?.periodId || `period-${genYear}-${genMonth.toString().padStart(2, '0')}`;
          window.location.href = `/admin/billing?period=${targetPeriodId}`;
        }, 1200);
      } else {
        setGenerateMsg(data.error?.message || 'Gagal membuat tagihan.');
      }
    } catch (err: any) {
      setGenerateMsg('Gagal terhubung ke server.');
    } finally {
      setGenerating(false);
    }
  };

  const handleOpenAddInvoice = () => {
    handleOpenCreateInvoice();
  };

  const handlePropertySelect = (val: string) => {
    setFormSelectedProp(val);
    if (val === '__CUSTOM__') {
      setFormPropertyMode('CUSTOM');
      setFormHouseCode('');
      setFormOwnerName('');
    } else {
      setFormPropertyMode('SELECT');
      const matched = clusterProperties.find(p => p.code.toLowerCase() === val.toLowerCase());
      if (matched) {
        setFormHouseCode(matched.code);
        setFormOwnerName(matched.residentName || matched.ownerName);
        setFormAreaLabel(matched.area);
      }
    }
  };

  const handlePeriodSelect = (val: string) => {
    if (val === '__CUSTOM__') {
      setFormPeriodMode('CUSTOM');
    } else {
      setFormPeriodMode('SELECT');
      setFormPeriodName(val);
      const parts = val.split(' ');
      const monthMap: Record<string, string> = {
        'Januari': '01', 'Februari': '02', 'Maret': '03', 'April': '04',
        'Mei': '05', 'Juni': '06', 'Juli': '07', 'Agustus': '08',
        'September': '09', 'Oktober': '10', 'November': '11', 'Desember': '12'
      };
      if (parts.length === 2 && monthMap[parts[0]]) {
        setFormDueDate(`${parts[1]}-${monthMap[parts[0]]}-10`);
      }
    }
  };

  // Recalculate Total Amount based on components if mode is DETAILED
  useEffect(() => {
    if (tariffMode === 'DETAILED') {
      const sum = formSecurityFee + formCleaningFee + formSinkingFund + formAdditionalFee;
      setFormTotalAmount(sum);
    }
  }, [formSecurityFee, formCleaningFee, formSinkingFund, formAdditionalFee, tariffMode]);

  // Open Create Single Invoice Modal
  const handleOpenCreateInvoice = () => {
    setEditingInvoiceId(null);
    const firstProp = clusterProperties[0] || CLUSTER_PROPERTIES_FALLBACK[0];
    setFormPropertyMode('SELECT');
    setFormSelectedProp(firstProp.code);
    setFormHouseCode(firstProp.code);
    setFormAreaLabel(firstProp.area);
    setFormOwnerName(firstProp.residentName || firstProp.ownerName);
    setFormPeriodMode('SELECT');
    setFormPeriodName(initialPeriodName || 'September 2026');
    setFormTotalAmount(250000);
    setFormSecurityFee(150000);
    setFormCleaningFee(50000);
    setFormSinkingFund(50000);
    setFormAdditionalFee(0);
    setFormDueDate('2026-09-10');
    setFormStatus('PAID');
    setFormPaymentMethod('CASH_KEPALA_KOMPLEK');
    setFormPaidAt(new Date().toISOString().slice(0, 10));
    setFormNotes(`Diterima langsung oleh Kepala Komplek (${kepalaKomplekName})`);
    setShowCreateModal(true);
  };

  // Open Edit Single Invoice Modal
  const handleOpenEditInvoice = (inv: InvoiceItem) => {
    setEditingInvoiceId(inv.id);
    const matched = clusterProperties.find(p => p.code.toLowerCase() === inv.propertyCode.toLowerCase());
    if (matched) {
      setFormPropertyMode('SELECT');
      setFormSelectedProp(matched.code);
    } else {
      setFormPropertyMode('CUSTOM');
      setFormSelectedProp('__CUSTOM__');
    }
    setFormHouseCode(inv.propertyCode);
    setFormAreaLabel(inv.areaLabel || (inv.propertyCode.startsWith('Kav') ? 'Klaster 14 Kavling' : 'Blok A'));
    // Prioritaskan nama penghuni sekarang (penyewa bila disewakan)
    const resident = matched ? (matched.residentName || matched.ownerName) : (inv.ownerName || `Warga Rumah ${inv.propertyCode}`);
    setFormOwnerName(resident);
    setFormPeriodMode('SELECT');
    setFormPeriodName(inv.billingPeriodName || initialPeriodName);
    setFormTotalAmount(inv.total ?? 250000);
    setFormSecurityFee(inv.securityFee ?? 150000);
    setFormCleaningFee(inv.cleaningFee ?? 50000);
    setFormSinkingFund(inv.sinkingFund ?? 50000);
    setFormAdditionalFee(inv.additionalFee ?? 0);
    setFormDueDate(inv.dueDate || '2026-09-10');
    setFormStatus(inv.status as any);
    const isKepalaMethod =
      inv.paymentMethod === 'CASH_KEPALA_KOMPLEK' ||
      Boolean(inv.notes && inv.notes.toLowerCase().includes('kepala komplek'));
    setFormPaymentMethod(isKepalaMethod ? 'CASH_KEPALA_KOMPLEK' : (inv.paymentMethod || 'CASH'));
    setFormPaidAt(inv.paidAt || new Date().toISOString().slice(0, 10));
    setFormNotes(inv.notes || (isKepalaMethod ? `Diterima langsung oleh Kepala Komplek (${kepalaKomplekName})` : ''));
    setShowCreateModal(true);
  };

  // Save Single Invoice / Direct Iuran (Create or Update)
  const handleSaveInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingInvoice(true);
    try {
      const calculatedTotal = Number(formTotalAmount) || 250000;
      const cleanHouse = formHouseCode.trim();
      const payload = {
        propertyCode: cleanHouse,
        houseCode: cleanHouse,
        areaLabel: formAreaLabel,
        ownerName: formOwnerName,
        periodName: formPeriodName,
        securityFee: Math.round(calculatedTotal * 0.6),
        cleaningFee: Math.round(calculatedTotal * 0.2),
        sinkingFund: Math.round(calculatedTotal * 0.2),
        additionalFee: 0,
        total: calculatedTotal,
        dueDate: formDueDate,
        status: formStatus,
        paymentMethod: formPaymentMethod,
        paidAt: formStatus === 'PAID' ? formPaidAt : undefined,
        notes: formNotes || undefined,
      };

      if (editingInvoiceId) {
        const res = await fetch('/api/billing/invoices/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            invoiceId: editingInvoiceId,
            propertyCode: cleanHouse,
            status: formStatus,
            total: calculatedTotal,
            dueDate: formDueDate,
            paidAt: formStatus === 'PAID' ? formPaidAt : null,
            notes: formNotes,
          })
        });

        if (res.ok) {
          const oldInv = invoices.find(i => i.id === editingInvoiceId);
          const wasPaid = oldInv?.status === 'PAID';
          const isNowPaid = formStatus === 'PAID';

          setInvoices(invoices.map(inv => inv.id === editingInvoiceId ? {
            ...inv,
            ...payload,
            propertyCode: cleanHouse,
            paidAmount: isNowPaid ? calculatedTotal : 0,
            paidAt: isNowPaid ? formPaidAt : null,
          } : inv));

          if (isNowPaid && !wasPaid) {
            setCurrentBalance(prev => prev + calculatedTotal);
            setProgress(prev => ({
              ...prev,
              paidCount: prev.paidCount + 1,
              unpaidCount: Math.max(0, prev.unpaidCount - 1),
              paidAmount: prev.paidAmount + calculatedTotal,
              unpaidAmount: Math.max(0, prev.unpaidAmount - calculatedTotal),
              percentage: prev.total > 0 ? Math.round(((prev.paidCount + 1) / prev.total) * 100) : 0,
            }));
          }

          showToast(`Invoice ${cleanHouse} berhasil diperbarui.`);
          setShowCreateModal(false);
        } else {
          showToast('Gagal memperbarui invoice tagihan.');
        }
      } else {
        const res = await fetch('/api/billing/invoices/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (res.ok) {
          const invData = data.data || {};
          const isPaid = formStatus === 'PAID';
          const newInv: InvoiceItem = {
            id: invData.id || `inv-${Date.now()}`,
            invoiceNumber: invData.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
            propertyId: invData.propertyId || `prop-${cleanHouse.toLowerCase()}`,
            propertyCode: cleanHouse,
            areaLabel: formAreaLabel,
            ownerName: formOwnerName,
            billingPeriodName: formPeriodName,
            securityFee: payload.securityFee,
            cleaningFee: payload.cleaningFee,
            sinkingFund: payload.sinkingFund,
            additionalFee: 0,
            total: calculatedTotal,
            paidAmount: isPaid ? calculatedTotal : 0,
            dueDate: formDueDate,
            issuedAt: new Date().toISOString(),
            paidAt: isPaid ? formPaidAt : null,
            status: formStatus,
            notes: formNotes,
          };

          setInvoices(prev => {
            const existsIdx = prev.findIndex(i => i.propertyCode.toLowerCase() === newInv.propertyCode.toLowerCase() && i.billingPeriodName === newInv.billingPeriodName);
            if (existsIdx >= 0) {
              const updated = [...prev];
              updated[existsIdx] = newInv;
              return updated;
            }
            return [newInv, ...prev];
          });

          if (isPaid) {
            if (typeof invData.newBalance === 'number') {
              setCurrentBalance(invData.newBalance);
            } else {
              setCurrentBalance(prev => prev + calculatedTotal);
            }

            setProgress(prev => ({
              ...prev,
              total: prev.total + 1,
              paidCount: prev.paidCount + 1,
              totalAmount: prev.totalAmount + calculatedTotal,
              paidAmount: prev.paidAmount + calculatedTotal,
              percentage: prev.total + 1 > 0 ? Math.round(((prev.paidCount + 1) / (prev.total + 1)) * 100) : 0,
            }));

            // Instantly open digital receipt modal for admin!
            setSelectedReceipt({
              invoiceNumber: newInv.invoiceNumber,
              periodName: newInv.billingPeriodName,
              propertyCode: newInv.propertyCode,
              residentName: newInv.ownerName,
              amount: newInv.total,
              paidAt: newInv.paidAt || new Date().toISOString().slice(0, 10),
              paymentMethod:
                formPaymentMethod === 'CASH_KEPALA_KOMPLEK'
                  ? `Tunai (Diterima oleh Kepala Komplek - ${kepalaKomplekName})`
                  : formPaymentMethod === 'CASH'
                  ? 'Tunai (Diterima Pengurus/RT)'
                  : formPaymentMethod === 'QRIS'
                  ? 'QRIS Komplek'
                  : formPaymentMethod === 'EWALLET'
                  ? 'Dompet Digital / E-Wallet'
                  : 'Transfer Bank / Syariah',
              referenceNumber: invData.payment?.reference || `TRX-${newInv.propertyCode}-ADM`,
              kepalaKomplekName: kepalaKomplekName,
              treasurerName: 'Yahya Nursidik',
              notes: formNotes,
            });
          } else {
            setProgress(prev => ({
              ...prev,
              total: prev.total + 1,
              unpaidCount: prev.unpaidCount + 1,
              totalAmount: prev.totalAmount + calculatedTotal,
              unpaidAmount: prev.unpaidAmount + calculatedTotal,
              percentage: prev.total + 1 > 0 ? Math.round((prev.paidCount / (prev.total + 1)) * 100) : 0,
            }));
          }

          showToast(`Iuran ${newInv.propertyCode} (${isPaid ? 'LUNAS - Saldo Kas Bertambah' : 'BELUM BAYAR'}) berhasil dicatat!`);
          setShowCreateModal(false);
        } else {
          showToast(data.error?.message || 'Gagal menyimpan iuran.');
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan iuran.');
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

      if (newStatus === 'PAID') {
        setCurrentBalance(prev => prev + inv.total);
        setProgress(prev => ({
          ...prev,
          paidCount: prev.paidCount + 1,
          unpaidCount: Math.max(0, prev.unpaidCount - 1),
          paidAmount: prev.paidAmount + inv.total,
          unpaidAmount: Math.max(0, prev.unpaidAmount - inv.total),
          percentage: prev.total > 0 ? Math.round(((prev.paidCount + 1) / prev.total) * 100) : 0,
        }));
      } else {
        setCurrentBalance(prev => Math.max(0, prev - inv.total));
        setProgress(prev => ({
          ...prev,
          paidCount: Math.max(0, prev.paidCount - 1),
          unpaidCount: prev.unpaidCount + 1,
          paidAmount: Math.max(0, prev.paidAmount - inv.total),
          unpaidAmount: prev.unpaidAmount + inv.total,
          percentage: prev.total > 0 ? Math.round((Math.max(0, prev.paidCount - 1) / prev.total) * 100) : 0,
        }));
      }

      showToast(`Status tagihan ${inv.propertyCode} diubah menjadi: ${newStatus === 'PAID' ? 'LUNAS (Saldo Kas Bertambah)' : 'BELUM BAYAR'}`);
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
        const matchedProp = clusterProperties.find(p => p.code.toLowerCase() === inv.propertyCode.toLowerCase());
        const isRented = matchedProp?.isRented || inv.occupancyStatus === 'RENTED';
        const isVacant = matchedProp?.statusLabel?.toLowerCase().includes('kosong') || inv.occupancyStatus === 'VACANT';
        if (areaFilter === 'OCCUPIED') matchArea = !isRented && !isVacant;
        else if (areaFilter === 'RENTED') matchArea = isRented;
        else if (areaFilter === 'VACANT') matchArea = isVacant;
        else matchArea = inv.propertyCode.toLowerCase().includes(areaFilter.toLowerCase());
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
  }, [invoices, searchTerm, statusFilter, areaFilter, sortBy, sortOrder, clusterProperties]);

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
  const publicTransparencyUrl = typeof window !== 'undefined' ? `${window.location.origin}/transparency` : 'https://wrghub.vercel.app/transparency';
  const handleCopyPublicLink = () => {
    navigator.clipboard.writeText(publicTransparencyUrl);
    setCopiedLink(true);
    showToast('Tautan publik transparansi iuran berhasil disalin!');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // WhatsApp Reminder Link Generator
  const getWaReminderUrl = (inv: InvoiceItem) => {
    let bankTitle = 'Bank Mandiri';
    let bankNumber = '1300024446419';
    let bankHolder = 'Paguyuban Grand Sariwangi';
    if (isMounted && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('wargahub_bank_accounts');
        if (saved) {
          const accs = JSON.parse(saved);
          if (Array.isArray(accs) && accs.length > 0) {
            const pri = accs.find((a: any) => a.isPrimary) || accs[0];
            if (pri && pri.accountNumber !== 'BCA_MAIN') {
              bankTitle = pri.bankName || bankTitle;
              bankNumber = pri.accountNumber || bankNumber;
              bankHolder = pri.accountHolder || bankHolder;
            }
          }
        }
      } catch (e) {}
    }
    const matched = clusterProperties.find(p => p.code.toLowerCase() === inv.propertyCode.toLowerCase());
    const resident = inv.residentName || (inv.ownerName && !inv.ownerName.startsWith('Warga Rumah') ? inv.ownerName : null) || matched?.residentName || matched?.ownerName || '';
    const greeting = resident ? `Halo Bapak/Ibu ${resident} (${inv.propertyCode}) 🌿` : `Halo Bapak/Ibu Warga ${inv.propertyCode} 🌿`;
    const text = encodeURIComponent(
      `${greeting}\n\nKami mengingatkan tagihan *Iuran Pengelolaan Lingkungan (IPL) ${initialPeriodName}*:\n\n🏡 *Unit:* ${inv.propertyCode}\n💵 *Nominal:* Rp ${inv.total?.toLocaleString('id-ID')}\n🗓️ *Jatuh Tempo:* ${inv.dueDate}\n🏦 *Rekening Kas Paguyuban:* ${bankTitle} (${bankNumber}) a.n ${bankHolder}\n\n📲 *Konfirmasi & Cek Transparansi:*\n${publicTransparencyUrl}\n\nTerima kasih atas partisipasinya menjaga kenyamanan lingkungan kita bersama. 🙏`
    );
    return `https://api.whatsapp.com/send?text=${text}`;
  };

  // Export CSV
  const handleExportBillingCSV = () => {
    const headers = ['No Invoice', 'Kode Unit', 'Penghuni Sekarang', 'Status Hunian', 'Periode', 'IPL Keamanan', 'Kebersihan', 'Kas Komplek', 'Biaya Lain', 'Total Tagihan (Rp)', 'Status', 'Jatuh Tempo', 'Waktu Lunas'];
    const rows = invoices.map(inv => {
      const matched = clusterProperties.find(p => p.code.toLowerCase() === inv.propertyCode.toLowerCase());
      const res = inv.residentName || (inv.ownerName && !inv.ownerName.startsWith('Warga Rumah') ? inv.ownerName : null) || matched?.residentName || matched?.ownerName || 'Warga';
      const st = matched?.statusLabel || (inv.occupancyStatus === 'RENTED' ? 'Penyewa / Kontrak' : (inv.occupancyStatus === 'VACANT' ? 'Kosong' : 'Penghuni'));
      return [
        inv.invoiceNumber,
        inv.propertyCode,
        `"${res}"`,
        `"${st}"`,
        `"${inv.billingPeriodName || initialPeriodName}"`,
        inv.securityFee || 150000,
        inv.cleaningFee || 50000,
        inv.sinkingFund || 50000,
        inv.additionalFee || 0,
        inv.total,
        inv.status,
        inv.dueDate,
        inv.paidAt || '-',
      ];
    });
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
            {/* Interactive Period Switcher Dropdown */}
            <div className="relative inline-block">
              <button
                type="button"
                onClick={() => setPeriodDropdownOpen(!periodDropdownOpen)}
                className="px-3 py-1.5 rounded-xl bg-primary-50 hover:bg-primary-100 active:scale-[0.98] text-primary-900 text-xs font-bold border border-primary-200 flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                title="Klik untuk memilih atau berpindah periode tagihan"
              >
                <Calendar className="w-3.5 h-3.5 text-primary-700" />
                <span>Periode: <strong>{initialPeriodName}</strong></span>
                <ChevronDown className={`w-3.5 h-3.5 text-primary-700 transition-transform duration-200 ${periodDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {periodDropdownOpen && (
                <div className="absolute left-0 mt-1.5 w-52 bg-surface rounded-2xl shadow-modal border border-border py-1.5 z-50 animate-in fade-in">
                  <div className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase text-ink-muted border-b border-border/60">
                    Pilih Periode Tagihan
                  </div>
                  {availablePeriods.map((pName) => {
                    const matchedPeriod = allPeriods.find((ap: any) => ap.name === pName);
                    const isSelected = pName === initialPeriodName;
                    const periodUrl = matchedPeriod ? `/admin/billing?period=${matchedPeriod.id}` : `/admin/billing?period=${encodeURIComponent(pName)}`;
                    return (
                      <a
                        key={pName}
                        href={periodUrl}
                        className={`w-full text-left px-3.5 py-2 text-xs font-bold flex items-center justify-between transition-colors ${
                          isSelected ? 'bg-primary-50 text-primary-800 font-black' : 'text-ink hover:bg-canvas'
                        }`}
                      >
                        <span>{pName}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-primary-600" />}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Manajemen tagihan iuran IPL, kuitansi digital ber-QR code, pembuatan tagihan massal, dan transparansi publik status pembayaran warga.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 border border-emerald-200 rounded-xl shadow-2xs text-xs font-bold text-emerald-950">
            <Wallet className="w-4 h-4 text-emerald-600" />
            <span className="text-ink-muted">Kas Komplek:</span>
            <span className="font-mono font-black text-emerald-800">{formatRupiah(currentBalance)}</span>
          </div>
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
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs active:scale-[0.98] transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>➕ Input Iuran Warga (Admin)</span>
          </button>
          <button
            type="button"
            onClick={() => setShowWhatsAppModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs active:scale-[0.98] transition-all"
          >
            <Send className="w-4 h-4" />
            <span>📲 Laporan WA (wa.me)</span>
          </button>
          <button
            type="button"
            onClick={() => setShowGenerateModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs active:scale-[0.98] transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Tagihan Massal</span>
          </button>
          <a
            href="/transparency"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-surface hover:bg-canvas border border-border text-ink text-xs font-bold rounded-xl shadow-xs active:scale-[0.98] transition-all"
            title="Buka Portal Transparansi Iuran Publik"
          >
            <ExternalLink className="w-4 h-4 text-emerald-600" />
            <span>Portal Publik ↗</span>
          </a>
        </div>
      </div>


      {/* 4-SubTab Navigation Bar */}
      <div className="flex items-center gap-1.5 p-1.5 bg-surface rounded-2xl border border-border shadow-2xs overflow-x-auto no-scrollbar">
        {[
          { id: 'invoices', label: 'Lembar Tagihan & Status Kavling', icon: Receipt, count: `${invoices.length} Inv` },
          { id: 'annual_matrix', label: 'Matriks Pembayaran Tahunan (12 Bulan)', icon: Layers, count: `${annualMatrixData.length} Kavling` },
          { id: 'tariffs', label: 'Struktur Tarif & Pos IPL', icon: DollarSign },
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
              <span className="text-[10px] text-emerald-600 font-bold font-mono mt-0.5 block">BANK & E-WALLET AUTO-RECONCILED</span>
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
                <option value="ALL">Semua Kavling (13 Unit)</option>
                <option value="OCCUPIED">Penghuni Tetap</option>
                <option value="RENTED">Penyewa / Kontrak</option>
                <option value="VACANT">Unit Kosong</option>
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
                            {(() => {
                              const matched = clusterProperties.find(p => p.code.toLowerCase() === inv.propertyCode.toLowerCase());
                              const resName = inv.residentName || (inv.ownerName && !inv.ownerName.startsWith('Warga Rumah') ? inv.ownerName : null) || matched?.residentName || matched?.ownerName;
                              const isRented = matched?.isRented || inv.occupancyStatus === 'RENTED';
                              return (
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono font-black text-sm text-primary-700">Unit {inv.propertyCode}</span>
                                    {isRented && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                                        Penyewa
                                      </span>
                                    )}
                                  </div>
                                  {resName && (
                                    <span className="text-xs font-bold text-ink block">{resName}</span>
                                  )}
                                  <span className="text-[10px] text-ink-muted font-medium block">
                                    {inv.areaLabel && !inv.areaLabel.toLowerCase().includes('taman sejahtera') ? inv.areaLabel : (communityName || 'Grand Sariwangi')}
                                  </span>
                                </div>
                              );
                            })()}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <p className="font-mono font-black tabular-nums text-sm text-ink">{formatRupiah(inv.total)}</p>
                            <span className="text-[10px] text-ink-muted">IPL Keamanan + Sampah + Kas</span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {inv.status === 'PENDING_VERIFICATION' ? (
                              <a
                                href={`/admin/payments?status=PENDING&search=${encodeURIComponent(inv.propertyCode)}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-mono font-bold text-[10px] shadow-2xs transition-all active:scale-[0.95]"
                                title="Buka Antrean Verifikasi Pembayaran"
                              >
                                <span>⏳ VERIFIKASI</span>
                                <ExternalLink className="w-3 h-3 text-amber-700" />
                              </a>
                            ) : (
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
                                {isPaid ? '✓ LUNAS' : '✗ BELUM BAYAR'}
                              </button>
                            )}
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
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenInvoiceDoc(inv, false)}
                                    className="px-2.5 py-1.5 text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg font-bold inline-flex items-center gap-1 text-[11px] active:scale-[0.98] transition-all"
                                    title="Lihat / Cetak Kuitansi Resmi"
                                  >
                                    <Printer className="w-3.5 h-3.5" /> Kuitansi
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenInvoiceDoc(inv, true)}
                                    className="px-2 py-1.5 text-ink-muted hover:text-ink bg-canvas hover:bg-surface border border-border rounded-lg font-bold inline-flex items-center gap-1 text-[11px] active:scale-[0.98] transition-all"
                                    title="Lihat Surat Tagihan / Invoice Resmi"
                                  >
                                    <FileText className="w-3.5 h-3.5" /> Invoice
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingInvoiceId(inv.id);
                                      setFormPropertyMode('SELECT');
                                      setFormSelectedProp(inv.propertyCode);
                                      setFormHouseCode(inv.propertyCode);
                                      setFormOwnerName(inv.residentName || inv.ownerName || '');
                                      setFormPeriodName(inv.billingPeriodName || initialPeriodName);
                                      setFormTotalAmount(inv.total);
                                      setFormStatus('PAID');
                                      setFormPaymentMethod('CASH_KEPALA_KOMPLEK');
                                      setFormPaidAt(new Date().toISOString().slice(0, 10));
                                      setFormNotes(`Diterima langsung oleh Bendahara/Pengurus`);
                                      setShowCreateModal(true);
                                    }}
                                    className="px-2.5 py-1.5 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg font-bold inline-flex items-center gap-1 text-[11px] active:scale-[0.98] transition-all"
                                    title="Catat Pelunasan Iuran Langsung"
                                  >
                                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Bayar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenInvoiceDoc(inv, true)}
                                    className="px-2 py-1.5 text-ink-muted hover:text-ink bg-canvas hover:bg-surface border border-border rounded-lg font-bold inline-flex items-center gap-1 text-[11px] active:scale-[0.98] transition-all"
                                    title="Buka / Cetak Surat Tagihan Invoice"
                                  >
                                    <FileText className="w-3.5 h-3.5" /> Invoice
                                  </button>
                                  <a
                                    href={getWaReminderUrl(inv)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2.5 py-1.5 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg font-bold inline-flex items-center gap-1 text-[11px] active:scale-[0.98] transition-all"
                                    title="Kirim Pesan WhatsApp Pengingat"
                                  >
                                    <Send className="w-3.5 h-3.5" /> Ingatkan WA
                                  </a>
                                </>
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
                  {(() => {
                    const maxButtons = 5;
                    const startPage = Math.max(1, Math.min(safeCurrentPage - Math.floor(maxButtons / 2), Math.max(1, totalPages - maxButtons + 1)));
                    const pageCount = Math.min(maxButtons, totalPages);
                    return Array.from({ length: pageCount }, (_, i) => startPage + i).map((pageNum) => (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all active:scale-[0.98] ${
                          safeCurrentPage === pageNum
                            ? 'bg-primary-600 text-white shadow-xs'
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

      {/* ================= SUBTAB 2: MATRIKS PEMBAYARAN TAHUNAN (12 BULAN) ================= */}
      {activeSubTab === 'annual_matrix' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="p-5 bg-surface rounded-3xl border border-border shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <h3 className="font-black text-base text-ink flex items-center gap-2">
                  <Layers className="w-5 h-5 text-primary-600" />
                  Matriks Pembayaran Tahunan Warga ({matrixYear || 2026})
                </h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  Visualisasi kepatuhan iuran seluruh 13 kavling aktif Grand Sariwangi (Kav A s/d Kav M) dari Januari hingga Desember.
                </p>
              </div>

              {/* Legend Badges */}
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono font-bold">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  ✓ Lunas
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  ✗ Nunggak
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  ⏳ Cek
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-canvas text-ink-muted border border-border">
                  - Mendatang
                </span>
              </div>
            </div>

            {/* Annual Matrix Table */}
            <div className="overflow-x-auto rounded-2xl border border-border shadow-xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-canvas border-b border-border text-ink-muted font-bold text-[11px]">
                  <tr>
                    <th className="py-3 px-3.5 sticky left-0 bg-canvas z-10 min-w-36">Kavling & Penghuni</th>
                    {MONTHS_LIST.map((m) => (
                      <th key={m.num} className="py-3 px-2 text-center font-mono min-w-14">
                        {m.short}
                      </th>
                    ))}
                    <th className="py-3 px-3 text-right font-mono min-w-24">Terbayar</th>
                    <th className="py-3 px-3 text-right font-mono min-w-28 text-rose-700">Tunggakan</th>
                    <th className="py-3 px-3 text-center min-w-20">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {annualMatrixData.map((row) => (
                    <tr key={row.propertyCode} className="hover:bg-canvas/50 transition-colors">
                      <td className="py-3 px-3.5 sticky left-0 bg-surface z-10 font-bold border-r border-border/40">
                        <div className="flex flex-col">
                          <span className="font-mono text-ink font-black text-xs">{row.propertyCode}</span>
                          <span className="text-[10px] text-ink-muted truncate max-w-32">{row.residentName}</span>
                          <span className="text-[9px] font-mono text-primary-700">{row.statusLabel}</span>
                        </div>
                      </td>

                      {row.months.map((m) => (
                        <td key={m.month.num} className="py-3 px-1 text-center font-mono">
                          {m.status === 'PAID' && (
                            <span
                              className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200"
                              title={`${row.propertyCode} - ${m.month.name}: Lunas`}
                            >
                              ✓
                            </span>
                          )}
                          {m.status === 'UNPAID' && (
                            <span
                              className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200"
                              title={`${row.propertyCode} - ${m.month.name}: Menunggak`}
                            >
                              ✗
                            </span>
                          )}
                          {m.status === 'PENDING' && (
                            <span
                              className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 animate-pulse"
                              title={`${row.propertyCode} - ${m.month.name}: Menunggu Verifikasi`}
                            >
                              ⏳
                            </span>
                          )}
                          {m.status === 'FUTURE' && (
                            <span className="text-ink-muted/30 text-xs font-mono">-</span>
                          )}
                        </td>
                      ))}

                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                        <span>{row.totalPaidCount} bln</span>
                        <span className="block text-[10px] text-ink-muted">
                          {formatRupiah(row.totalPaidAmount)}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold">
                        {row.totalUnpaidCount > 0 ? (
                          <>
                            <span className="text-rose-700">{row.totalUnpaidCount} bln</span>
                            <span className="block text-[10px] text-rose-600">
                              {formatRupiah(row.totalUnpaidAmount)}
                            </span>
                          </>
                        ) : (
                          <span className="text-emerald-600 text-[11px]">Nihil (Lunas)</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        {row.totalUnpaidCount > 0 ? (
                          <a
                            href={getAnnualWaReminderUrl(row)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] inline-flex items-center gap-1 shadow-2xs active:scale-[0.95] transition-all"
                            title="Kirim Tagihan Tunggakan via WhatsApp"
                          >
                            <Send className="w-3 h-3" />
                            <span>Tagih</span>
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedReceipt({
                                invoiceNumber: `INV-202609-${row.propertyCode.replace(/[^A-Z0-9]/g, '')}`,
                                periodName: initialPeriodName || 'September 2026',
                                propertyCode: row.propertyCode,
                                residentName: row.residentName,
                                amount: 250000,
                                paidAt: new Date().toISOString().slice(0, 10),
                                paymentMethod: 'CASH',
                                referenceNumber: `TRX-${row.propertyCode}`,
                                kepalaKomplekName: kepalaKomplekName,
                                isInvoice: false,
                              });
                            }}
                            className="p-1 text-ink-muted hover:text-ink hover:bg-canvas rounded-lg transition-colors"
                            title="Lihat Kuitansi Terkini"
                          >
                            <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Matrix Summary Footer Card */}
            <div className="p-4 bg-canvas rounded-2xl border border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-ink-muted">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>
                  Rekapitulasi tahunan diverifikasi otomatis dengan database <strong>14 Kavling Grand Sariwangi</strong>.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="/transparency"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-surface hover:bg-canvas border border-border text-ink rounded-xl font-bold inline-flex items-center gap-1.5 active:scale-[0.98] transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-primary-600" />
                  <span>Lihat Portal Transparansi Publik</span>
                </a>
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
              href="/admin/settings?tab=finances"
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
                  setEditableTariffMode(tariffMode);
                  setEditableFlatFee(flatFee);
                  setEditableFlatFeeName(flatFeeName);
                  setEditableTariffs([...tariffComponents]);
                  setEditableTariffNote(tariffNote);
                  setShowTariffModal(true);
                }}
                className="px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 font-bold rounded-xl text-xs inline-flex items-center gap-1.5 self-start sm:self-auto active:scale-[0.98] transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Tarif & Mode</span>
              </button>
            </div>

            <p className="text-ink-muted">
              {tariffNote} sebesar <strong>{formatRupiah(totalTariff)} / unit rumah per bulan</strong>.
            </p>

            {/* Dynamic Rendering Based on Active Tariff Mode */}
            {tariffMode === 'FLAT' ? (
              <div className="space-y-3">
                <div className="p-4 bg-canvas rounded-2xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md border border-emerald-200">
                        Tarif Tunggal Langsung (All-in)
                      </span>
                      <span className="text-[10px] text-ink-muted">14 Kavling Klaster</span>
                    </div>
                    <h4 className="font-black text-ink text-sm mt-1">{flatFeeName}</h4>
                    <p className="text-[11px] text-ink-muted mt-0.5">
                      Tagihan bulanan dibuat langsung bulat tanpa pecahan pos satpam/kebersihan/kas terpisah (Sesuai kesepakatan klaster).
                    </p>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <span className="font-mono font-black text-primary-800 text-xl tabular-nums block">
                      {formatRupiah(flatFee)} <span className="text-xs font-normal text-ink-muted">/ bln</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-200">
                      Aktif Sesuai Kesepakatan
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-primary-50 rounded-2xl border border-primary-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-black text-primary-900 text-xs">Total Iuran Standar Per Unit (14 Kavling)</h4>
                    <p className="text-[11px] text-primary-800 mt-0.5">
                      Akumulasi potensi penerimaan kas: 14 unit × {formatRupiah(flatFee)} = <strong>{formatRupiah(flatFee * 14)} / bulan</strong>
                    </p>
                  </div>
                  <span className="font-mono font-black text-primary-900 text-base">{formatRupiah(flatFee)} / bln</span>
                </div>
              </div>
            ) : (
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
            )}
          </div>
        </div>
      )}

      {/* ================= SUBTAB 4: GENERATOR TAGIHAN MASAL ================= */}
      {activeSubTab === 'batch' && (
        <div className="space-y-4 max-w-xl animate-in fade-in duration-150">
          <div className="p-6 bg-surface rounded-3xl border border-border shadow-card space-y-4 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-primary-50 border border-primary-200 text-primary-700 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-sm text-ink">
                  Generator Tagihan Massal Warga (Grand Sariwangi)
                </h3>
                <p className="text-[11px] text-ink-muted">
                  Terbitkan tagihan resmi serentak untuk 13 unit kavling (Kav A s/d Kav M)
                </p>
              </div>
            </div>

            <div className="p-3 bg-primary-50/70 border border-primary-200/80 rounded-2xl flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-primary-700 shrink-0 mt-0.5" />
              <p className="text-[11px] text-primary-950 leading-relaxed">
                <strong>Idempotent & Aman:</strong> Sistem cerdas mendeteksi kavling yang sudah membayar atau sudah memiliki invoice pada periode ini. Data lunas dan nomor invoice tidak akan terhapus atau diduplikasi.
              </p>
            </div>

            {generateMsg && (
              <div className={`p-3 rounded-2xl border text-[11px] font-bold flex items-center gap-2 ${
                generateMsg.toLowerCase().includes('sukses') || generateMsg.toLowerCase().includes('berhasil')
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                  : 'bg-rose-50 text-rose-900 border-rose-300'
              }`}>
                {generateMsg.toLowerCase().includes('sukses') || generateMsg.toLowerCase().includes('berhasil') ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{generateMsg}</span>
              </div>
            )}

            <form onSubmit={handleGenerateBatch} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-ink block mb-1">Bulan Periode *</label>
                  <select
                    value={genMonth}
                    onChange={(e) => {
                      const m = parseInt(e.target.value, 10);
                      setGenMonth(m);
                      setGenDueDate(`${genYear}-${m.toString().padStart(2, '0')}-10`);
                    }}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink text-xs focus:ring-2 focus:ring-primary-500"
                  >
                    <option value={1}>Januari</option>
                    <option value={2}>Februari</option>
                    <option value={3}>Maret</option>
                    <option value={4}>April</option>
                    <option value={5}>Mei</option>
                    <option value={6}>Juni</option>
                    <option value={7}>Juli</option>
                    <option value={8}>Agustus</option>
                    <option value={9}>September</option>
                    <option value={10}>Oktober</option>
                    <option value={11}>November</option>
                    <option value={12}>Desember</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Tahun *</label>
                  <input
                    type="number"
                    value={genYear}
                    onChange={(e) => {
                      const y = parseInt(e.target.value, 10);
                      setGenYear(y);
                      setGenDueDate(`${y}-${genMonth.toString().padStart(2, '0')}-10`);
                    }}
                    min={2025}
                    max={2030}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink text-xs focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Batas Waktu Jatuh Tempo *</label>
                <input
                  type="date"
                  value={genDueDate}
                  onChange={(e) => setGenDueDate(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink text-xs focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-ink block">Tarif IPL Standar per Unit (Rp) *</label>
                  <span className="font-mono text-primary-700 font-black">{formatRupiah(genFee)}</span>
                </div>
                <input
                  type="number"
                  value={genFee}
                  onChange={(e) => setGenFee(parseInt(e.target.value, 10) || 0)}
                  required
                  step={10000}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink text-xs tabular-nums focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="p-3 bg-canvas rounded-xl border border-border flex items-center justify-between">
                <span className="text-ink-muted">Cakupan Unit Rumah:</span>
                <span className="font-mono font-bold text-ink">13 Kavling (Kav A s/d Kav M)</span>
              </div>

              <button
                type="submit"
                disabled={generating}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {generating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Menerbitkan Tagihan...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Terbitkan Tagihan Massal Sekarang</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: INPUT IURAN WARGA OLEH ADMIN / KEPALA KOMPLEK ================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-xl w-full p-6 border border-border shadow-modal space-y-4 max-h-[94vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-ink">
                    {editingInvoiceId ? `Edit Invoice Tagihan ${formHouseCode}` : `Input Iuran Warga (Admin & Kepala Komplek)`}
                  </h3>
                  <p className="text-[11px] text-ink-muted">
                    {editingInvoiceId ? 'Perbarui data rincian atau status tagihan warga' : 'Catat penerimaan iuran tunai/transfer langsung atau terbitkan tagihan baru'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-xl text-ink-muted hover:text-ink hover:bg-canvas transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveInvoice} className="space-y-4">
              {/* Unit Rumah / Kavling Selection */}
              <div className="p-3.5 bg-canvas rounded-2xl border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-ink block text-xs">Pilih Unit Rumah / Kavling Warga *</label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setFormPropertyMode('SELECT');
                        handlePropertySelect(clusterProperties[0]?.code || 'Kav A');
                      }}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                        formPropertyMode === 'SELECT'
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-surface text-ink-muted border border-border hover:text-ink'
                      }`}
                    >
                      Daftar 13 Kavling
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormPropertyMode('CUSTOM');
                        setFormSelectedProp('__CUSTOM__');
                      }}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                        formPropertyMode === 'CUSTOM'
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-surface text-ink-muted border border-border hover:text-ink'
                      }`}
                    >
                      Kustom / Manual
                    </button>
                  </div>
                </div>

                {formPropertyMode === 'SELECT' ? (
                  <div>
                    <select
                      value={formSelectedProp}
                      onChange={(e) => handlePropertySelect(e.target.value)}
                      className="w-full p-2.5 bg-surface border border-border rounded-xl font-bold text-ink text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      {clusterProperties.map((p) => (
                        <option key={p.code} value={p.code}>
                          {p.code} — {p.residentName || p.ownerName} ({p.statusLabel ? `${p.statusLabel} • ` : ''}{p.area})
                        </option>
                      ))}
                      <option value="__CUSTOM__">➕ Ketik Unit Kustom Lainnya...</option>
                    </select>
                    <div className="mt-2 flex items-center justify-between px-2 text-[11px] text-ink-muted">
                      <span className="flex items-center gap-1.5">
                        Penghuni Sekarang: <strong className="text-ink">{formOwnerName}</strong>
                        {clusterProperties.find(p => p.code.toLowerCase() === formHouseCode.toLowerCase())?.isRented && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-sky-50 text-sky-700 border border-sky-200">
                            Penyewa / Kontrak
                          </span>
                        )}
                      </span>
                      <span>Area: <strong className="text-ink">{formAreaLabel}</strong></span>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="font-bold text-ink block mb-1 text-[11px]">Kode Unit *</label>
                      <input
                        type="text"
                        placeholder="Contoh: Kav A / A-17"
                        value={formHouseCode}
                        onChange={(e) => setFormHouseCode(e.target.value)}
                        required
                        className="w-full p-2 bg-surface border border-border rounded-xl font-bold text-ink"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-ink block mb-1 text-[11px]">Nama Penghuni Sekarang (Penyewa / Kontrak)</label>
                      <input
                        type="text"
                        placeholder="Contoh: Pak Yahya"
                        value={formOwnerName}
                        onChange={(e) => setFormOwnerName(e.target.value)}
                        className="w-full p-2 bg-surface border border-border rounded-xl font-bold text-ink"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Periode & Jatuh Tempo */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">Periode Iuran *</label>
                  {formPeriodMode === 'SELECT' ? (
                    <select
                      value={formPeriodName}
                      onChange={(e) => handlePeriodSelect(e.target.value)}
                      className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                    >
                      {availablePeriods.map((per) => (
                        <option key={per} value={per}>{per}</option>
                      ))}
                      <option value="__CUSTOM__">✏️ Ketik Periode Lain...</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="Contoh: September 2026"
                      value={formPeriodName}
                      onChange={(e) => setFormPeriodName(e.target.value)}
                      required
                      className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                    />
                  )}
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Tanggal Jatuh Tempo *</label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-semibold text-ink"
                  />
                </div>
              </div>

              {/* Status Pembayaran (LUNAS vs BELUM BAYAR) Segmented Control */}
              <div className="space-y-1.5">
                <label className="font-bold text-ink block text-xs">Status Pembayaran Saat Ini *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormStatus('PAID')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      formStatus === 'PAID'
                        ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-surface border-border hover:bg-canvas'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-black text-xs text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>🟢 SUDAH LUNAS</span>
                    </div>
                    <p className="text-[10px] text-emerald-700 mt-1 leading-relaxed">
                      Diterima langsung oleh Pengurus (Kas bertambah & terbit kuitansi digital).
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormStatus('UNPAID')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      formStatus === 'UNPAID'
                        ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-500/20 shadow-xs'
                        : 'bg-surface border-border hover:bg-canvas'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-black text-xs text-rose-900">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>🔴 BELUM BAYAR</span>
                    </div>
                    <p className="text-[10px] text-rose-700 mt-1 leading-relaxed">
                      Terbitkan tagihan baru untuk ditagihkan/muncul di transparansi warga.
                    </p>
                  </button>
                </div>
              </div>

              {/* Jika Status Lunas, Tampilkan Opsi Metode Pembayaran & Tanggal Bayar */}
              {formStatus === 'PAID' && (
                <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-3 animate-in fade-in">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="font-bold text-emerald-950 block mb-1 text-[11px]">Metode Penyerahan Iuran:</label>
                      <select
                        value={formPaymentMethod}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormPaymentMethod(val as any);
                          if (val === 'CASH_KEPALA_KOMPLEK' && (!formNotes || formNotes.includes('Diterima langsung'))) {
                            setFormNotes(`Diterima langsung oleh Kepala Komplek (${kepalaKomplekName})`);
                          } else if (val === 'CASH' && (!formNotes || formNotes.includes('Diterima langsung'))) {
                            setFormNotes('Diterima langsung oleh Pengurus / RT');
                          }
                        }}
                        className="w-full p-2 bg-white border border-emerald-300 rounded-xl font-bold text-emerald-950 text-xs"
                      >
                        <option value="CASH_KEPALA_KOMPLEK">💵 Tunai (Diterima oleh Kepala Komplek)</option>
                        <option value="CASH">💵 Tunai (Diterima Pengurus/RT)</option>
                        <option value="TRANSFER_BANK">🌙 / 🏦 Transfer Bank (BSI / BCA / Mandiri / BRI)</option>
                        <option value="EWALLET">💳 Dompet Digital / E-Wallet (GoPay / DANA / OVO)</option>
                        <option value="QRIS">📱 QRIS Statis / Dinamis</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-emerald-950 block mb-1 text-[11px]">Tanggal Uang Diterima:</label>
                      <input
                        type="date"
                        value={formPaidAt}
                        onChange={(e) => setFormPaidAt(e.target.value)}
                        className="w-full p-2 bg-white border border-emerald-300 rounded-xl font-semibold text-emerald-950 text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-emerald-800 font-semibold bg-emerald-100/70 p-2 rounded-xl">
                    <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>
                      {formPaymentMethod === 'CASH_KEPALA_KOMPLEK' ? (
                        <>
                          Uang tunai diserahkan dan <strong>diterima oleh Kepala Komplek ({kepalaKomplekName})</strong>. Saldo Kas Paguyuban otomatis bertambah <strong>{formatRupiah(formTotalAmount)}</strong>.
                        </>
                      ) : (
                        <>
                          Saldo Kas Operasional Paguyuban akan otomatis bertambah sebesar{' '}
                          <strong>{formatRupiah(formTotalAmount)}</strong>
                        </>
                      )}
                    </span>
                  </div>
                </div>
              )}

              {/* Nominal Tagihan / Iuran */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-ink text-xs">Nominal Tagihan / Iuran (Rp) *</label>
                  <span className="text-[11px] text-ink-muted">Standar Klaster: Rp 250.000 / bln</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-ink-muted font-mono">Rp</span>
                  <input
                    type="number"
                    value={formTotalAmount}
                    onChange={(e) => setFormTotalAmount(Number(e.target.value))}
                    required
                    min={0}
                    step={1000}
                    placeholder="250000"
                    className="w-full pl-10 pr-3 py-2.5 bg-canvas border border-border rounded-xl font-mono font-bold text-base text-ink focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 transition-all"
                  />
                </div>
              </div>

              {/* Catatan / Keterangan */}
              <div>
                <label className="font-bold text-ink block mb-1 text-[11px]">Catatan / Keterangan Tambahan (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: Diserahkan tunai ke Pak RT saat ronda malam / Transfer via m-BCA"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full p-2 bg-canvas border border-border rounded-xl text-ink text-xs"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-2.5">
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
                  className={`flex-1 py-2.5 rounded-xl text-white font-black shadow-xs disabled:opacity-50 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 ${
                    formStatus === 'PAID'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-primary-600 hover:bg-primary-700'
                  }`}
                >
                  {savingInvoice ? (
                    'Menyimpan...'
                  ) : formStatus === 'PAID' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Simpan & Catat Kas Masuk (Lunas)</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      <span>{editingInvoiceId ? 'Perbarui Tagihan' : 'Terbitkan Tagihan Baru'}</span>
                    </>
                  )}
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

            {/* Mode Switcher Inside Modal */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-canvas rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setEditableTariffMode('FLAT')}
                className={`py-2 px-3 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  editableTariffMode === 'FLAT'
                    ? 'bg-primary-600 text-white shadow-2xs'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Tarif Tunggal Langsung</span>
              </button>
              <button
                type="button"
                onClick={() => setEditableTariffMode('DETAILED')}
                className={`py-2 px-3 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  editableTariffMode === 'DETAILED'
                    ? 'bg-primary-600 text-white shadow-2xs'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Rincian Komponen Pos</span>
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

              {editableTariffMode === 'FLAT' ? (
                <div className="p-3.5 bg-canvas rounded-2xl border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-ink text-xs">Konfigurasi Nominal Tunggal (All-in):</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                      Rekomendasi Klaster
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-ink-muted block mb-1">Nama Tagihan</label>
                    <input
                      type="text"
                      value={editableFlatFeeName}
                      onChange={(e) => setEditableFlatFeeName(e.target.value)}
                      className="w-full p-2 bg-surface border border-border rounded-xl text-xs font-bold text-ink"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-ink-muted block mb-1">Nominal Iuran Bulanan Per Unit (Rp)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 font-mono text-xs font-bold text-ink-muted">Rp</span>
                      <input
                        type="number"
                        min="0"
                        step="5000"
                        value={editableFlatFee}
                        onChange={(e) => setEditableFlatFee(Math.max(0, Number(e.target.value) || 0))}
                        className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-xl font-mono text-base font-black text-primary-800 text-right tabular-nums"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1.5">
                      <span className="text-[10px] font-bold text-ink-muted">Preset Cepat:</span>
                      <div className="flex flex-wrap gap-1">
                        {[
                          { val: 250000, label: 'Rp 250.000 (RT Grand Sariwangi)' },
                          { val: 350000, label: 'Rp 350.000 (RT + RW)' },
                          { val: 200000, label: 'Rp 200.000' },
                          { val: 150000, label: 'Rp 150.000' },
                        ].map((preset) => (
                          <button
                            key={preset.val}
                            type="button"
                            onClick={() => setEditableFlatFee(preset.val)}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                              editableFlatFee === preset.val
                                ? 'bg-primary-600 text-white shadow-xs'
                                : 'bg-surface hover:bg-canvas border border-border text-ink-muted'
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <label className="font-bold text-ink block text-xs">Komponen Pos Iuran:</label>
                      <button
                        type="button"
                        onClick={() => setEditableTariffs(JSON.parse(JSON.stringify(GRAND_SARIWANGI_TARIFF_COMPONENTS)))}
                        className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 active:scale-[0.98] transition-all"
                        title="Terapkan Pos Khusus Grand Sariwangi: RT Rp 250.000 + RW Rp 100.000"
                      >
                        ⭐ Preset Grand Sariwangi (RT 250k + RW 100k)
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newId = `tf-${Date.now()}`;
                        setEditableTariffs([
                          ...editableTariffs,
                          { id: newId, name: `${editableTariffs.length + 1}. Komponen Baru`, fee: 50000, desc: 'Deskripsi peruntukan iuran' },
                        ]);
                      }}
                      className="px-2 py-1 bg-primary-50 hover:bg-primary-100 text-primary-700 font-bold rounded-lg text-[10px] inline-flex items-center gap-1 active:scale-[0.95] transition-all self-start sm:self-auto"
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
              )}

              {/* Total Summary Preview */}
              <div className="p-3.5 bg-primary-50 rounded-2xl border border-primary-200 flex items-center justify-between">
                <div>
                  <h4 className="font-black text-primary-900 text-xs">Total Iuran Baru Per Unit</h4>
                  <p className="text-[10px] text-primary-700">
                    {editableTariffMode === 'FLAT' ? 'Model satu nominal langsung (All-in)' : 'Akumulasi komponen pos di atas'}
                  </p>
                </div>
                <span className="font-mono font-black text-primary-900 text-sm">
                  {formatRupiah(editableTariffMode === 'FLAT' ? editableFlatFee : editableTariffs.reduce((sum, item) => sum + (Number(item.fee) || 0), 0))} / bln
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
                  const isFlat = editableTariffMode === 'FLAT';
                  const newTotal = isFlat ? editableFlatFee : editableTariffs.reduce((sum, item) => sum + (Number(item.fee) || 0), 0);
                  const effectiveComps = isFlat
                    ? [{ id: 'tf-flat', name: editableFlatFeeName, fee: editableFlatFee, desc: 'Iuran standar bulanan warga (All-in)' }]
                    : editableTariffs;

                  setTariffMode(editableTariffMode);
                  setFlatFee(editableFlatFee);
                  setFlatFeeName(editableFlatFeeName);
                  setTariffComponents(effectiveComps);
                  setTariffNote(editableTariffNote);
                  setGenFee(newTotal);

                  if (typeof window !== 'undefined') {
                    localStorage.setItem('wargahub_set_tariff_mode', JSON.stringify(editableTariffMode));
                    localStorage.setItem('wargahub_set_flat_fee', JSON.stringify(editableFlatFee));
                    localStorage.setItem('wargahub_set_flat_name', JSON.stringify(editableFlatFeeName));
                    if (!isFlat) {
                      localStorage.setItem('wargahub_detailed_tariff_components', JSON.stringify(editableTariffs));
                    }
                    localStorage.setItem('wargahub_tariff_components', JSON.stringify(effectiveComps));
                    localStorage.setItem('wargahub_tariff_note', editableTariffNote);
                    localStorage.setItem('wargahub_set_fee', JSON.stringify(String(newTotal)));

                    // Synchronize legacy keys to avoid conflicting values in older views
                    const secComp = effectiveComps.find(c => c.name.toLowerCase().includes('satpam') || c.name.toLowerCase().includes('aman'))?.fee ?? (isFlat ? Math.round(newTotal * 0.6) : 150000);
                    const trshComp = effectiveComps.find(c => c.name.toLowerCase().includes('sampah') || c.name.toLowerCase().includes('bersih'))?.fee ?? (isFlat ? Math.round(newTotal * 0.2) : 50000);
                    const resComp = effectiveComps.find(c => c.name.toLowerCase().includes('kas') || c.name.toLowerCase().includes('perawatan') || c.name.toLowerCase().includes('fasum'))?.fee ?? (isFlat ? Math.round(newTotal * 0.2) : 50000);

                    localStorage.setItem('wargahub_set_trash_fee', JSON.stringify(String(trshComp)));
                    localStorage.setItem('wargahub_set_security_fee', JSON.stringify(String(secComp)));
                    localStorage.setItem('wargahub_set_reserve_fee', JSON.stringify(String(resComp)));

                    window.dispatchEvent(new CustomEvent('wargahub_tariffs_updated', {
                      detail: {
                        mode: editableTariffMode,
                        components: effectiveComps,
                        total: newTotal,
                        note: editableTariffNote,
                      }
                    }));
                  }
                  setShowTariffModal(false);
                  showToast('Struktur tarif IPL dan nominal iuran berhasil diperbarui & disinkronkan!');
                }}
                className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-xs active:scale-[0.98] transition-all"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Batch Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-surface border border-border rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-border bg-canvas/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/50 border border-primary-200 dark:border-primary-800 flex items-center justify-center text-primary-600 dark:text-primary-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-ink text-base">Terbitkan Tagihan Massal</h3>
                  <p className="text-xs text-ink-muted">Otomatisasi 13 unit kavling Komplek Grand Sariwangi</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGenerateModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-muted hover:text-ink hover:bg-canvas transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleGenerateBatch} className="p-4 sm:p-6 space-y-4">
              {generateMsg && (
                <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  generateMsg.startsWith('Sukses')
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {generateMsg.startsWith('Sukses') ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{generateMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-ink mb-1.5 block">Bulan Tagihan</label>
                  <select
                    value={genMonth}
                    onChange={(e) => {
                      const m = Number(e.target.value);
                      setGenMonth(m);
                      setGenDueDate(`${genYear}-${m.toString().padStart(2, '0')}-10`);
                    }}
                    className="w-full px-3 py-2.5 bg-canvas border border-border rounded-xl text-xs font-bold text-ink focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                  >
                    {[
                      { m: 1, name: 'Januari' },
                      { m: 2, name: 'Februari' },
                      { m: 3, name: 'Maret' },
                      { m: 4, name: 'April' },
                      { m: 5, name: 'Mei' },
                      { m: 6, name: 'Juni' },
                      { m: 7, name: 'Juli' },
                      { m: 8, name: 'Agustus' },
                      { m: 9, name: 'September' },
                      { m: 10, name: 'Oktober' },
                      { m: 11, name: 'November' },
                      { m: 12, name: 'Desember' },
                    ].map((item) => (
                      <option key={item.m} value={item.m}>{item.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-ink mb-1.5 block">Tahun Tagihan</label>
                  <select
                    value={genYear}
                    onChange={(e) => {
                      const y = Number(e.target.value);
                      setGenYear(y);
                      setGenDueDate(`${y}-${genMonth.toString().padStart(2, '0')}-10`);
                    }}
                    className="w-full px-3 py-2.5 bg-canvas border border-border rounded-xl text-xs font-bold text-ink focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                  >
                    {[2025, 2026, 2027].map((yr) => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-ink mb-1.5 block">Batas Waktu Pembayaran (Jatuh Tempo)</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-ink-muted absolute left-3 top-3" />
                  <input
                    type="date"
                    value={genDueDate}
                    onChange={(e) => setGenDueDate(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-ink mb-1.5 block">Nominal Iuran Standar Per Unit (Rp)</label>
                <div className="relative">
                  <span className="text-xs font-bold text-ink-muted absolute left-3 top-2.5 font-mono">Rp</span>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={genFee}
                    onChange={(e) => setGenFee(Math.max(0, Number(e.target.value) || 0))}
                    required
                    className="w-full pl-9 pr-3 py-2 bg-canvas border border-border rounded-xl text-sm font-bold text-ink focus:outline-hidden focus:ring-2 focus:ring-primary-500 font-mono text-right tabular-nums"
                  />
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-ink-muted font-semibold">Preset Cepat:</span>
                  {[250000, 350000, 200000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setGenFee(preset)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-colors ${
                        genFee === preset
                          ? 'bg-primary-100 text-primary-800 border-primary-300'
                          : 'bg-canvas text-ink-muted border-border hover:border-ink-muted'
                      }`}
                    >
                      {formatRupiah(preset)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ringkasan & Safe idempotent notice */}
              <div className="p-3.5 bg-canvas rounded-xl border border-border text-xs space-y-2">
                <div className="flex justify-between items-center text-ink-muted">
                  <span>Target Unit:</span>
                  <span className="font-bold text-ink">{clusterProperties.length} Unit Kavling (Kav A - M)</span>
                </div>
                <div className="flex justify-between items-center text-ink-muted">
                  <span>Total Proyeksi Penerimaan:</span>
                  <span className="font-bold text-emerald-600 font-mono">{formatRupiah(clusterProperties.length * genFee)}</span>
                </div>
                <div className="pt-2 border-t border-border/60 flex items-start gap-2 text-[11px] text-ink-muted">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Aman & Idempoten:</strong> Unit yang sudah memiliki tagihan atau sudah tercatat lunas tidak akan terduplikasi atau diubah statusnya.
                  </span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  disabled={generating}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-ink-muted hover:text-ink hover:bg-canvas border border-transparent transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white flex items-center gap-2 shadow-xs active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {generating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sedang Menerbitkan...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Terbitkan Sekarang</span>
                    </>
                  )}
                </button>
              </div>
            </form>
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

      {/* WhatsApp Broadcast Dues Report Modal */}
      <WhatsAppDuesReportModal
        isOpen={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
        initialPeriodName={initialPeriodName}
        availablePeriods={availablePeriods}
        properties={reportProperties}
        bankInfo={{
          bankName: 'Bank Mandiri',
          accountNumber: '1300024446419',
          accountHolder: 'Paguyuban Grand Sariwangi',
        }}
        transparencyUrl="https://wrghub.vercel.app/transparency"
        rekapUrl="https://wrghub.vercel.app/rekap-iuran"
        kepalaKomplekName={kepalaKomplekName}
      />
    </div>
  );
};
