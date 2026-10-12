import React, { useState, useEffect } from 'react';
import {
  Home,
  Receipt,
  Megaphone,
  User,
  ChevronRight,
  CheckCircle2,
  Headphones,
  Calendar,
  Download,
  Car,
  Bike,
  Users,
  ShieldCheck,
  ArrowLeft,
  Upload,
  Check,
  FileText,
  Clock,
  Sparkles,
  PhoneCall,
  ExternalLink,
  MessageCircle,
  Plus,
  MessageSquarePlus,
  X,
  Send,
  Printer,
  Building2,
  QrCode,
  Hammer,
  Zap,
  Droplets,
  Trash2,
  Edit3,
  BadgeCheck,
  FileCheck,
  Trophy,
  CreditCard,
  Vote,
  Wrench,
  AlertCircle,
  Copy,
  MapPin,
  CheckCheck,
} from 'lucide-react';
import { formatRupiah, formatRupiahShort } from '../../lib/format';
import type { UserSession } from '../../types/auth';
import { ReceiptModal } from '../shared/ReceiptModal';
import { WargaAIChatWidget } from '../shared/WargaAIChatWidget';
import { VotingSectionModal } from './VotingSectionModal';
import { ErrorBoundary } from '../shared/ErrorBoundary';
import { useResidentNavigation } from '../../lib/resident-navigation';
import { ResidentNavigation } from '../layout/ResidentNavigation';
import { apiFetch } from '../../lib/api-fetch';
import { RequestErrorNotice } from '../shared/RequestErrorNotice';
import type { ResidentOverview, ResidentInvoice } from '../../services/resident-overview.service';

/**
 * TASTE-SKILL V2 DESIGN STANDARD
 * Reading this as: Resident Portal & Public Mobile for Warga Komplek & Pengurus RT/RW,
 * with a clean, warm, high-trust, and accessible residential vernacular language,
 * leaning toward tactile utilities + Swiss typographic grid + responsive micro-interactions
 * (VARIANCE: 6, MOTION: 4, DENSITY: 4).
 */

interface ResidentPortalViewProps {
  initialUser?: UserSession;
  initialAnnouncements?: any[];
  initialOverview?: ResidentOverview;
}

const ResidentPortalInner: React.FC<ResidentPortalViewProps> = ({
  initialUser,
  initialAnnouncements = [],
  initialOverview,
}) => {
  const { activeTab, setActiveTab, rumahSubTab, setRumahSubTab, infoSubTab, setInfoSubTab } = useResidentNavigation();
  const [selectedMonth, setSelectedMonth] = useState('Sep');

  // Modals state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [showVotingModal, setShowVotingModal] = useState(false);
  const [copiedAcc, setCopiedAcc] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [overview, setOverview] = useState<ResidentOverview | undefined>(initialOverview);
  const [overviewError, setOverviewError] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);

  // Current resident user session
  const [currentUser, setCurrentUser] = useState<UserSession | null>(initialUser || null);

  useEffect(() => {
    if (!currentUser && typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('wargahub_user');
      if (!savedUser) {
        window.location.href = '/login?portal=resident';
      }
    }
  }, [currentUser]);

  const isAdminUser = ['SUPER_ADMIN', 'CHAIRMAN', 'SECRETARY', 'TREASURER', 'RESIDENT_ADMIN', 'SECURITY', 'MAINTENANCE'].includes(currentUser?.role || '');

  const getInitials = (name?: string) => {
    if (!name || typeof name !== 'string') return 'BS';
    const clean = name.replace(/^(Bpk\.|Ibu|Dr\.|Ir\.|H\.|Hj\.)\s*/gi, '').trim();
    if (!clean) return 'BS';
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'BS';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + (parts[parts.length - 1][0] || '')).toUpperCase();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) return 'Selamat Pagi';
    if (hour >= 11 && hour < 15) return 'Selamat Siang';
    if (hour >= 15 && hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const getFormattedDate = () => {
    return new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Master Settings Dynamic State
  const [residentTitle, setResidentTitle] = useState('Portal Warga Komplek');
  const [residentSubtitle, setResidentSubtitle] = useState('Layanan Iuran, Keamanan, Fasilitas & Aduan Warga 24 Jam');
  const [communityName, setCommunityName] = useState('Komplek Grand Sariwangi');
  const [monthlyFeeRate, setMonthlyFeeRate] = useState(250000);
  const [tariffComponents, setTariffComponents] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('wargahub_tariff_components');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return [
      { id: 'tf-rt', name: '1. Iuran RT (Pengangkutan Sampah, Kebersihan & Fasum RT)', fee: 250000, desc: 'Armada pengangkutan sampah dinas LH, kebersihan saluran air, fasum dan operasional RT' },
      { id: 'tf-rw', name: '2. Iuran RW (Retribusi Paguyuban & Wilayah RW)', fee: 100000, desc: 'Retribusi paguyuban komplek, koordinasi keamanan wilayah RW dan administrasi' },
    ];
  });
  const [bankKasName, setBankKasName] = useState('Bank Mandiri');
  const [bankKasAcc, setBankKasAcc] = useState('1300024446419');
  const [bankKasHolder, setBankKasHolder] = useState('Paguyuban Grand Sariwangi');
  const [qrisNmid, setQrisNmid] = useState('ID102008891230');
  const [activeGuardName, setActiveGuardName] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('wargahub_set_active_guard_name');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return 'Pa Adri Harry';
  });
  const [securityPhone, setSecurityPhone] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('wargahub_set_secphone');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed !== '0812-3456-7801') return parsed;
        }
      } catch (e) {}
    }
    return '0812-2008-2240';
  });
  const [rwHeadName, setRwHeadName] = useState('Yahya Nursidik');
  const [rwHeadPhone, setRwHeadPhone] = useState('0812-3456-7890');
  const [kepalaKomplekName, setKepalaKomplekName] = useState(() => {
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
  const [wasteOrgDays, setWasteOrgDays] = useState('Senin, Rabu, Jumat');
  const [wasteInorgDays, setWasteInorgDays] = useState('Rabu & Sabtu');
  const [wasteHours, setWasteHours] = useState('06:30 - 10:30 WIB');

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('wargahub_user');
      if (!initialUser && savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && typeof parsed === 'object') setCurrentUser(parsed);
      }
      const savedResTitle = localStorage.getItem('wargahub_set_res_title');
      const savedResSub = localStorage.getItem('wargahub_set_res_subtitle');
      const savedComm = localStorage.getItem('wargahub_set_comm_name');
      const savedFee = localStorage.getItem('wargahub_set_fee');
      const savedBank = localStorage.getItem('wargahub_set_bankname');
      const savedAcc = localStorage.getItem('wargahub_set_bankacc');
      const savedHolder = localStorage.getItem('wargahub_set_accholder');
      const savedQris = localStorage.getItem('wargahub_set_qris');
      const savedSecPhone = localStorage.getItem('wargahub_set_secphone');
      const savedActiveGuard = localStorage.getItem('wargahub_set_active_guard_name');
      const savedRwName = localStorage.getItem('wargahub_set_rwheadname');
      const savedKepala = localStorage.getItem('wargahub_set_kepala_komplek');
      const savedRwPhone = localStorage.getItem('wargahub_set_rwheadphone');
      const savedWasteOrg = localStorage.getItem('wargahub_set_waste_org');
      const savedWasteInorg = localStorage.getItem('wargahub_set_waste_inorg');
      const savedWasteHours = localStorage.getItem('wargahub_set_collection_hours');

      if (savedResTitle) setResidentTitle(JSON.parse(savedResTitle));
      if (savedResSub) setResidentSubtitle(JSON.parse(savedResSub));
      if (savedComm) {
        const parsedC = JSON.parse(savedComm);
        if (parsedC && typeof parsedC === 'string' && !parsedC.toLowerCase().includes('taman sejahtera')) {
          setCommunityName(parsedC);
        } else {
          setCommunityName('Komplek Grand Sariwangi');
        }
      }
      const savedAccounts = localStorage.getItem('wargahub_bank_accounts');
      if (savedAccounts) {
        try {
          const list = JSON.parse(savedAccounts);
          const pri = list.find((a: any) => a.isPrimary) || list[0];
          if (pri && pri.accountNumber && pri.accountNumber !== 'BCA_MAIN') {
            if (pri.bankName) setBankKasName(pri.bankName);
            if (pri.accountNumber) setBankKasAcc(pri.accountNumber);
            if (pri.accountHolder) setBankKasHolder(pri.accountHolder);
            if (pri.qrisNmid) setQrisNmid(pri.qrisNmid);
          }
        } catch (e) {}
      } else {
        if (savedBank) setBankKasName(JSON.parse(savedBank));
        if (savedAcc) setBankKasAcc(JSON.parse(savedAcc));
        if (savedHolder) setBankKasHolder(JSON.parse(savedHolder));
        if (savedQris) setQrisNmid(JSON.parse(savedQris));
      }
      if (savedSecPhone) {
        const parsedP = JSON.parse(savedSecPhone);
        if (parsedP && parsedP !== '0812-3456-7801') setSecurityPhone(parsedP);
      }
      if (savedActiveGuard) setActiveGuardName(JSON.parse(savedActiveGuard));
      if (savedRwName) setRwHeadName(JSON.parse(savedRwName));
      if (savedKepala) setKepalaKomplekName(JSON.parse(savedKepala));
      if (savedRwPhone) setRwHeadPhone(JSON.parse(savedRwPhone));
      if (savedWasteOrg) setWasteOrgDays(JSON.parse(savedWasteOrg));
      if (savedWasteInorg) setWasteInorgDays(JSON.parse(savedWasteInorg));
      if (savedWasteHours) setWasteHours(JSON.parse(savedWasteHours));
    } catch (e) {}

    const handleUserChanged = (e: any) => {
      if (e.detail) setCurrentUser(e.detail);
    };
    window.addEventListener('wargahub_user_changed', handleUserChanged);

    const handleTariffsChanged = (e: any) => {
      if (e.detail) {
        const comps = e.detail.components || (Array.isArray(e.detail) ? e.detail : null);
        if (comps && Array.isArray(comps)) {
          setTariffComponents(comps);
        }
        const total = e.detail.total || (comps ? comps.reduce((s: number, i: any) => s + (Number(i.fee) || 0), 0) : null);
        if (typeof total === 'number' && !isNaN(total)) {
          setMonthlyFeeRate(total);
        }
        if (e.detail.kepalaKomplekName) {
          setKepalaKomplekName(e.detail.kepalaKomplekName);
        }
      }
    };
    window.addEventListener('wargahub_tariffs_updated', handleTariffsChanged);

    const handleCommitteeUpdated = (e: any) => {
      if (e.detail?.kepalaKomplekName) {
        setKepalaKomplekName(e.detail.kepalaKomplekName);
      }
      if (e.detail?.rwHeadName) {
        setRwHeadName(e.detail.rwHeadName);
      }
    };
    window.addEventListener('wargahub_committee_updated', handleCommitteeUpdated);

    const handleSecurityUpdated = (e: any) => {
      if (e.detail) {
        if (e.detail.phone) setSecurityPhone(e.detail.phone);
        if (e.detail.guardName) setActiveGuardName(e.detail.guardName);
      }
    };
    const handleBankAccountsUpdated = (e: any) => {
      if (e.detail) {
        if (e.detail.bankName) setBankKasName(e.detail.bankName);
        if (e.detail.accountNumber) setBankKasAcc(e.detail.accountNumber);
        if (e.detail.accountHolder) setBankKasHolder(e.detail.accountHolder);
        if (e.detail.qrisNmid) setQrisNmid(e.detail.qrisNmid);
      }
    };
    window.addEventListener('wargahub_bank_accounts_updated', handleBankAccountsUpdated);

    return () => {
      window.removeEventListener('wargahub_user_changed', handleUserChanged);
      window.removeEventListener('wargahub_tariffs_updated', handleTariffsChanged);
      window.removeEventListener('wargahub_committee_updated', handleCommitteeUpdated);
      window.removeEventListener('wargahub_security_updated', handleSecurityUpdated);
      window.removeEventListener('wargahub_bank_accounts_updated', handleBankAccountsUpdated);
    };
  }, []);

  const userKey = currentUser?.propertyCode || currentUser?.username || 'resident';

  // Property Specs State
  const [buildingType, setBuildingType] = useState('Tipe 72/120');
  const [landArea, setLandArea] = useState(120);
  const [buildingArea, setBuildingArea] = useState(72);
  const [plnCapacity, setPlnCapacity] = useState('3.500 VA');
  const [pamMeterNo, setPamMeterNo] = useState('PAM-88301');
  const [occupancyStatus, setOccupancyStatus] = useState('Dihuni Pemilik');
  const [showEditSpecsModal, setShowEditSpecsModal] = useState(false);

  // Occupants State
  const [occupants, setOccupants] = useState<any[]>(initialOverview?.occupants || []);
  const [showAddOccupantModal, setShowAddOccupantModal] = useState(false);
  const [newOccName, setNewOccName] = useState('');
  const [newOccRelation, setNewOccRelation] = useState('ANAK');
  const [newOccIdCard, setNewOccIdCard] = useState('');
  const [newOccPhone, setNewOccPhone] = useState('');
  const [newOccEmergency, setNewOccEmergency] = useState(false);

  // Permits (SIK Renovasi) State
  const [permits, setPermits] = useState<any[]>(initialOverview?.permits || []);
  const [showAddPermitModal, setShowAddPermitModal] = useState(false);
  const [permitWorkType, setPermitWorkType] = useState('Pengecatan & Kanopi');
  const [permitContractor, setPermitContractor] = useState('');
  const [permitWorkers, setPermitWorkers] = useState(2);
  const [permitStart, setPermitStart] = useState('2026-09-05');
  const [permitEnd, setPermitEnd] = useState('2026-09-15');
  const [permitDesc, setPermitDesc] = useState('');
  const [permitSuccess, setPermitSuccess] = useState(false);

  // Complaints State
  const [complaints, setComplaints] = useState<any[]>(initialOverview?.complaints || []);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [compTitle, setCompTitle] = useState('');
  const [compDesc, setCompDesc] = useState('');
  const [compCategory, setCompCategory] = useState('FASILITAS');
  const [compLocation, setCompLocation] = useState('');
  const [compSuccess, setCompSuccess] = useState(false);

  // Vehicle State (RFID Gate)
  const [vehicles, setVehicles] = useState<any[]>(initialOverview?.vehicles || []);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [vehPlate, setVehPlate] = useState('');
  const [vehType, setVehType] = useState('Mobil');
  const [vehBrand, setVehBrand] = useState('');
  const [vehModel, setVehModel] = useState('');
  const [vehColor, setVehColor] = useState('');

  // Facility Booking State
  const [showFacilityModal, setShowFacilityModal] = useState(false);
  const [facId, setFacId] = useState(initialOverview?.facilities[0]?.id || '');
  const [facName, setFacName] = useState(initialOverview?.facilities[0]?.name || '');
  const [facDate, setFacDate] = useState('');
  const [facStart, setFacStart] = useState('09:00');
  const [facEnd, setFacEnd] = useState('13:00');
  const [facPurpose, setFacPurpose] = useState('');
  const [facPhone, setFacPhone] = useState('');
  const [facSuccess, setFacSuccess] = useState(false);

  // 12 Months Billing Record
  const monthsBilling = overview?.invoices || [];
  const currentSelectedMonthData: ResidentInvoice = monthsBilling.find(invoice => invoice.code === selectedMonth) || monthsBilling[0] || {
    id: '', code: '', shortLabel: '-', name: 'Belum ada tagihan', status: 'upcoming', paidAt: null, inv: '-', billingPeriodId: '', amount: 0, remaining: 0, dueDate: '-', method: '-', reference: '-',
  };
  const propertyId = overview?.property?.id || currentUser?.propertyId;
  const requirePropertyId = () => { if (!propertyId) throw new Error('Akun belum terhubung ke rumah. Hubungi pengurus.'); return propertyId; };

  const applyOverview = (data: ResidentOverview) => {
    setOverview(data); setOccupants(data.occupants); setVehicles(data.vehicles);
    setPermits(data.permits); setComplaints(data.complaints);
    if (data.property) setOccupancyStatus(data.property.occupancyStatus === 'RENTED' ? 'Disewakan' : data.property.occupancyStatus === 'VACANT' ? 'Kosong' : 'Dihuni pemilik');
  };
  const refreshOverview = async () => {
    try {
      const response = await fetch('/api/resident/overview');
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message || 'Data belum bisa dimuat.');
      applyOverview(payload.data); setOverviewError('');
    } catch (error) { setOverviewError(error instanceof Error ? error.message : 'Tidak bisa memuat data rumah.'); }
  };
  useEffect(() => { if (currentUser && !initialOverview) void refreshOverview(); }, [currentUser?.id]);
  useEffect(() => {
    if (overview?.profile) {
      setCommunityName(overview.profile.communityName); setMonthlyFeeRate(overview.profile.monthlyRate);
      setBankKasName(overview.profile.bankName); setBankKasAcc(overview.profile.bankAccount); setBankKasHolder(overview.profile.accountHolder);
      setSecurityPhone(overview.profile.securityPhone); setRwHeadPhone(overview.profile.rwHeadPhone);
    }
    if (overview?.facilities.length && !overview.facilities.some(facility => facility.id === facId)) {
      setFacId(overview.facilities[0].id); setFacName(overview.facilities[0].name);
    }
  }, [overview]);
  const showActualReceipt = (invoice = currentSelectedMonthData) => {
    if (!invoice.id || invoice.status !== 'paid') return;
    setSelectedReceipt({ invoiceNumber: invoice.inv, periodName: invoice.name, propertyCode: overview?.property?.code || currentUser?.propertyCode || '-', residentName: currentUser?.fullName || '-', amount: invoice.amount, paidAt: invoice.paidAt || '-', paymentMethod: invoice.method, referenceNumber: invoice.reference, kepalaKomplekName, isInvoice: false });
  };

  // Component breakdown calculation
  const feeSecurity = Math.round(monthlyFeeRate * 0.46);
  const feeSanitation = Math.round(monthlyFeeRate * 0.27);
  const feeMaintenance = Math.round(monthlyFeeRate * 0.17);
  const feeSocial = monthlyFeeRate - feeSecurity - feeSanitation - feeMaintenance;

  // Handlers
  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentSubmitting) return;
    setPaymentSubmitting(true);
    try {
      if (!propertyId || !currentSelectedMonthData.billingPeriodId || !currentSelectedMonthData.id) throw new Error('Pilih tagihan yang tercatat untuk rumah Anda.');
      if (!paymentReference.trim()) throw new Error('Masukkan nomor referensi transfer.');
      await apiFetch('/api/payments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          billingPeriodId: currentSelectedMonthData.billingPeriodId,
          invoiceId: currentSelectedMonthData.id,
          amount: currentSelectedMonthData.remaining,
          method: 'TRANSFER',
          reference: paymentReference.trim(),
          notes: `Konfirmasi pembayaran via Portal Warga Mobile (${currentSelectedMonthData.name})`,
        }),
      });
      setPaymentSuccess(true);
      setTimeout(() => {
        setPaymentSuccess(false);
        setShowPaymentModal(false);
      }, 1500);
    } catch (err) {
      window.dispatchEvent(new CustomEvent('wargahub:request-error', { detail: err instanceof Error ? err.message : 'Pembayaran belum diajukan.' }));
    } finally { setPaymentSubmitting(false); }
  };

  const handleBookFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facPurpose) return;
    try {
      await apiFetch('/api/facilities/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityId: facId,
          facilityName: facName,
          propertyId: requirePropertyId(),
          residentName: currentUser?.fullName || currentUser?.name || 'Warga',
          date: facDate,
          startTime: facStart,
          endTime: facEnd,
          purpose: facPurpose,
          contactPhone: facPhone,
        }),
      });
      setFacSuccess(true);
      setTimeout(() => {
        setFacSuccess(false);
        setShowFacilityModal(false);
        setFacPurpose('');
      }, 1500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compTitle || !compDesc) return;
    const newComp = {
      id: `COMP-${Date.now().toString().slice(-4)}`,
      title: compTitle,
      description: compDesc,
      category: compCategory,
      location: compLocation || `Depan Rumah ${currentUser?.propertyCode || 'A-17'}`,
      status: 'MENUNGGU_VERIFIKASI',
      createdAt: 'Baru saja',
    };
    try {
      const response = await apiFetch('/api/complaints/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: requirePropertyId(),
          title: compTitle,
          description: compDesc,
          category: compCategory,
          location: compLocation || `Depan Rumah ${currentUser?.propertyCode || 'A-17'}`,
          priority: 'MEDIUM',
        }),
      });
      const payload = await response.json();
      const updated = [{ ...newComp, id: payload.data.id }, ...complaints];
      setComplaints(updated);
      try { localStorage.setItem(`wargahub_complaints_${userKey}`, JSON.stringify(updated)); } catch {}
      setCompSuccess(true);
      setTimeout(() => {
        setCompSuccess(false);
        setShowComplaintModal(false);
        setCompTitle('');
        setCompDesc('');
        setCompLocation('');
      }, 1500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehPlate || !vehBrand || !vehModel) return;
    const newVeh = {
      id: `veh-${Date.now()}`,
      plateNumber: vehPlate.toUpperCase().trim(),
      type: vehType,
      brand: vehBrand,
      model: vehModel,
      color: vehColor || 'Hitam',
      year: new Date().getFullYear().toString(),
      rfidStatus: 'AKTIF',
    };
    try {
      const response = await apiFetch('/api/vehicles/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: requirePropertyId(),
          plateNumber: vehPlate.toUpperCase().trim(),
          type: vehType,
          brand: vehBrand,
          model: vehModel,
          color: vehColor || 'Hitam',
        }),
      });
      const payload = await response.json();
      const updated = [...vehicles, { ...newVeh, id: payload.data.id }];
      setVehicles(updated);
      try { localStorage.setItem(`wargahub_vehicles_${userKey}`, JSON.stringify(updated)); } catch {}
      setShowVehicleModal(false);
      setVehPlate('');
      setVehBrand('');
      setVehModel('');
      setVehColor('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddOccupant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOccName) return;
    const relText =
      newOccRelation === 'KEPALA_KELUARGA'
        ? 'Kepala Keluarga'
        : newOccRelation === 'ISTRI'
        ? 'Istri'
        : newOccRelation === 'ANAK'
        ? 'Anak'
        : newOccRelation === 'ORANG_TUA'
        ? 'Orang Tua'
        : newOccRelation === 'ART_SUPIR'
        ? 'ART / Supir'
        : 'Anggota Keluarga';

    const newOcc = {
      id: `occ-${Date.now()}`,
      fullName: newOccName,
      relation: relText,
      idCardNumber: newOccIdCard || '-',
      phone: newOccPhone || '-',
      isEmergencyContact: newOccEmergency,
      birthDate: '-',
    };
    try {
      const response = await apiFetch('/api/properties/occupants/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: requirePropertyId(),
          fullName: newOccName,
          relation: newOccRelation,
          idCardNumber: newOccIdCard,
          phone: newOccPhone,
          isEmergencyContact: newOccEmergency,
        }),
      });
      const payload = await response.json();
      const updated = [...occupants, { ...newOcc, id: payload.data.id }];
      setOccupants(updated);
      try { localStorage.setItem(`wargahub_occupants_${userKey}`, JSON.stringify(updated)); } catch {}
      setShowAddOccupantModal(false);
      setNewOccName('');
      setNewOccIdCard('');
      setNewOccPhone('');
      setNewOccEmergency(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteOccupant = (id: string) => {
    const updated = occupants.filter((o) => o.id !== id);
    setOccupants(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`wargahub_occupants_${userKey}`, JSON.stringify(updated));
      } catch (e) {}
    }
  };

  const handleAddPermit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!permitContractor || !permitDesc) return;
    const newPermit = {
      id: `SIK-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      workType: permitWorkType,
      contractorName: permitContractor,
      workersCount: Number(permitWorkers),
      startDate: permitStart,
      endDate: permitEnd,
      status: 'PENDING_REVIEW',
      description: permitDesc,
    };
    try {
      const response = await apiFetch('/api/properties/permits/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyCode: currentUser?.propertyCode || 'A-17',
          workType: permitWorkType,
          contractorName: permitContractor,
          workersCount: Number(permitWorkers),
          startDate: permitStart,
          endDate: permitEnd,
          description: permitDesc,
          status: 'PENDING_REVIEW',
        }),
      });
      const payload = await response.json();
      const updated = [{ ...newPermit, id: payload.data.id }, ...permits];
      setPermits(updated);
      try { localStorage.setItem(`wargahub_permits_${userKey}`, JSON.stringify(updated)); } catch {}
      setPermitSuccess(true);
      setTimeout(() => {
        setPermitSuccess(false);
        setShowAddPermitModal(false);
        setPermitContractor('');
        setPermitDesc('');
      }, 1500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateSpecs = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/api/properties/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyCode: currentUser?.propertyCode || 'A-17',
          buildingType,
          landArea: Number(landArea),
          buildingArea: Number(buildingArea),
          plnCapacity,
          pamMeterNo,
          occupancyStatus,
        }),
      });
      setShowEditSpecsModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="resident-app min-h-[100dvh] bg-canvas flex flex-col items-center justify-start antialiased selection:bg-primary-100 selection:text-primary-900">
      <RequestErrorNotice />
      <a href="#main-content" className="skip-link">Lewati menu, ke konten</a>
      {/* Top Application Bar - Clean Architectural Header */}
      <header className="w-full bg-surface border-b border-border sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary-50 border border-primary-200 flex items-center justify-center text-primary-700 shadow-2xs">
              <Building2 className="w-4 h-4 text-primary-700 stroke-[2.2]" />
            </div>
            <div className="leading-tight">
              <span className="font-extrabold text-base tracking-tight text-ink flex items-center gap-1.5">
                Warga<span className="text-primary-600">Hub</span>
              </span>
              <p className="text-[10px] text-ink-muted hidden sm:block">
                {communityName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/rekap-iuran"
              className="text-xs font-semibold text-ink-muted hover:text-ink px-2.5 py-1.5 rounded-lg hover:bg-canvas transition-all hidden sm:inline-flex items-center gap-1 active:scale-[0.98]"
            >
              Rekap Iuran
            </a>
            <a
              href="/transparency"
              className="text-xs font-semibold text-ink-muted hover:text-ink px-2.5 py-1.5 rounded-lg hover:bg-canvas transition-all hidden sm:inline-flex items-center gap-1 active:scale-[0.98]"
            >
              Transparansi Kas
            </a>
            {isAdminUser && (
              <a
                href="/admin"
                className="text-xs font-bold text-primary-800 hover:text-primary-900 px-3 py-1.5 rounded-xl bg-primary-50 hover:bg-primary-100 transition-all flex items-center gap-1 border border-primary-200 active:scale-[0.98]"
              >
                 Pengurus
                <ExternalLink className="w-3 h-3 text-primary-700" />
              </a>
            )}
            <button
              type="button"
              onClick={() => setActiveTab('akun')}
               className="w-11 h-11 rounded-xl bg-primary-50 text-primary-700 font-bold text-xs flex items-center justify-center shrink-0 hover:bg-primary-100 transition-all ml-1 uppercase"
              title="Profil Pengguna"
            >
              {getInitials(currentUser?.fullName || currentUser?.name)}
            </button>
          </div>
        </div>
        <ResidentNavigation activeTab={activeTab} onNavigate={setActiveTab} />
      </header>

      {/* Main Application Container */}
      <main id="main-content" tabIndex={-1} aria-label={`Portal warga: ${activeTab}`} className="w-full max-w-3xl mx-auto bg-surface sm:border-x border-border min-h-[calc(100dvh-4rem)] flex flex-col justify-between">
        {overviewError && <div role="status" className="m-4 p-4 rounded-xl bg-canvas border border-border text-sm text-ink-muted">{overviewError} <button onClick={refreshOverview} className="text-primary-700 font-semibold underline">Coba lagi</button></div>}
        <div className="flex-1">
          {/* ========================================================================= */}
          {/* TAB 1: BERANDA                                                            */}
          {/* ========================================================================= */}
          {activeTab === 'beranda' && (
            <div className="p-4 sm:p-6 space-y-5 animate-in fade-in duration-150">
              {/* Header Greeting & Date */}
              <div className="resident-greeting flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-primary-700 font-bold text-[11px] mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{communityName}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-ink">
                    {getGreeting()}, {currentUser?.fullName?.split(' ')[0] || currentUser?.name?.split(' ')[0] || 'Warga'}
                  </h2>
                  <p className="text-xs text-ink-muted mt-0.5">
                    {getFormattedDate()}
                  </p>
                </div>
                <span className="px-2 py-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-lg border border-emerald-200 shrink-0 flex items-center gap-1">
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Portal warga
                </span>
              </div>

              {/* Unit Residence Tactile Card (Anti-Slop: No generic dark purple gradient) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-ink text-surface border border-ink/80 shadow-xs relative overflow-hidden space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 bg-surface/15 text-surface font-mono text-[10px] font-bold rounded-md uppercase tracking-wider">
                    {(currentUser?.propertyCode || 'A-17').toUpperCase().startsWith('KAV')
                      ? 'Area Kavling'
                      : (currentUser?.propertyCode || 'A-17').toUpperCase().startsWith('SW')
                      ? 'Jl. Sariwangi'
                      : `Blok ${(currentUser?.propertyCode || 'A-17').split('-')[0] || 'A'}`} • RT 02 / RW 05
                  </span>
                  <span className="text-[10px] text-surface/70 font-medium">Status: {occupancyStatus}</span>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-[11px] text-surface/70 block uppercase tracking-wide">Unit Hunian Saya</span>
                    <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                      Rumah {currentUser?.propertyCode || 'A-17'}
                    </h3>
                    <p className="text-xs text-surface/80 mt-0.5">
                      {buildingType} • {occupants.length} Penghuni • {vehicles.length} Kendaraan RFID
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('rumah')}
                    className="px-3 py-1.5 bg-surface text-ink hover:bg-surface/90 font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 active:scale-[0.98] transition-all shrink-0"
                  >
                    <span>Detail Rumah</span>
                    <ChevronRight className="w-3.5 h-3.5 text-ink-muted" />
                  </button>
                </div>
              </div>

              {/* Status Iuran Terkini - Struk Style Invoice Card */}
              <section className="p-5 rounded-2xl border border-border space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-semibold">Iuran rumah Anda</h3><span className="text-xs text-ink-muted">{currentSelectedMonthData.id ? currentSelectedMonthData.status === 'paid' ? 'Lunas' : 'Belum lunas' : 'Belum ada tagihan'}</span></div>
                <div className="resident-invoice-actions flex items-center justify-between gap-4"><div><p className="text-sm text-ink-muted">{currentSelectedMonthData.name}</p><p className="text-2xl font-semibold tabular-nums mt-1">{formatRupiah(currentSelectedMonthData.amount)}</p></div><button onClick={() => setActiveTab('iuran')} className="px-4 py-3 bg-primary-600 text-white rounded-xl text-sm font-semibold">Lihat iuran</button></div>
                {currentSelectedMonthData.status === 'paid' && <button onClick={() => showActualReceipt()} className="inline-flex items-center gap-2 py-2 text-sm font-semibold text-primary-700"><Printer size={17} />Lihat kuitansi</button>}
              </section>

              {/* 6 Quick Action Pads - Anti Slop Tactile Buttons */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-ink">Apa yang Anda butuhkan?</h3>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {[
                    { label: 'Bayar iuran', detail: 'Tagihan dan pembayaran', icon: CreditCard, action: () => setActiveTab('iuran') },
                    { label: 'Laporkan aduan', detail: 'Sampaikan kendala lingkungan', icon: MessageSquarePlus, action: () => setShowComplaintModal(true) },
                    { label: 'Pas tamu', detail: 'Akses tamu dengan QR', icon: QrCode, action: () => { setActiveTab('rumah'); setRumahSubTab('pass'); } },
                    { label: 'Pesan fasilitas', detail: 'Balai dan lapangan', icon: Building2, action: () => { setActiveTab('info'); setInfoSubTab('facilities'); } },
                    { label: 'Jadwal sampah', detail: 'Waktu pengangkutan', icon: Trash2, action: () => { setActiveTab('info'); setInfoSubTab('sanitation'); } },
                    { label: 'Musyawarah', detail: 'Berikan suara Anda', icon: Vote, action: () => setShowVotingModal(true) },
                  ].map(item => <button key={item.label} type="button" onClick={item.action} className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-canvas hover:bg-primary-50 text-left">
                    <item.icon size={21} strokeWidth={1.8} className="text-primary-700 shrink-0" />
                    <span><span className="block text-sm font-semibold text-ink">{item.label}</span><span className="hidden sm:block text-xs text-ink-muted mt-1">{item.detail}</span></span>
                  </button>)}
                </div>
              </div>

              {/* Status Operasional Komplek Hari Ini */}
              <div className="p-4 rounded-2xl bg-canvas border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-ink flex items-center gap-1.5 uppercase tracking-wide">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Status Operasional Komplek Hari Ini
                  </h4>
                  <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                    Normal 24 Jam
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {/* Satpam */}
                  <div className="p-3 bg-surface rounded-xl border border-border/80 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] text-ink-muted font-bold block">Pos Satpam Utama</span>
                        <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-200">
                          Piket 24 Jam
                        </span>
                      </div>
                      <p className="font-bold text-ink">
                        Petugas: <span className="text-purple-700 font-extrabold">{activeGuardName || 'Pa Adri Harry'}</span>
                      </p>
                      <span className="text-[10px] text-ink-muted font-mono">{securityPhone}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <a
                        href={`https://wa.me/62${securityPhone.replace(/^0/, '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Halo ${activeGuardName || 'Pak Satpam'}, saya warga komplek ingin menghubungi pos satpam...`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200 transition-all active:scale-95"
                        title="Chat WhatsApp Satpam Bertugas"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={`tel:${securityPhone.replace(/[^0-9]/g, '')}`}
                        className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl border border-blue-200 transition-all active:scale-95"
                        title="Telepon Pos Satpam"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Kebersihan */}
                  <div className="p-3 bg-surface rounded-xl border border-border/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-ink-muted font-bold block">Armada Viar Tossa TPS3R</span>
                      <p className="font-bold text-ink">Jadwal: {wasteOrgDays}</p>
                      <span className="text-[10px] text-teal-700 font-bold">{wasteHours}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('info');
                        setInfoSubTab('sanitation');
                      }}
                      className="p-2 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-xl border border-teal-200 transition-all active:scale-95"
                      title="Lihat Rute Sampah"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Pengumuman & Agenda Terkini */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-ink uppercase tracking-wide">Pengumuman & Agenda Terkini</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('info');
                      setInfoSubTab('announcements');
                    }}
                    className="text-[11px] font-bold text-primary-700 hover:underline flex items-center gap-0.5"
                  >
                    Lihat Semua
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-2">
                  {initialAnnouncements && initialAnnouncements.length > 0 ? (
                    initialAnnouncements.slice(0, 2).map((ann: any) => (
                      <div
                        key={ann.id}
                        className="p-3.5 rounded-2xl bg-surface border border-border shadow-2xs flex items-center justify-between gap-3 hover:border-primary-200 transition-all cursor-pointer"
                        onClick={() => {
                          setActiveTab('info');
                          setInfoSubTab('announcements');
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-700 border border-primary-200 flex items-center justify-center shrink-0 mt-0.5">
                            <Megaphone className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="px-1.5 py-0.5 bg-primary-100 text-primary-800 text-[9px] font-bold rounded uppercase">
                              {ann.category || 'KEGIATAN'}
                            </span>
                            <p className="text-xs font-bold text-ink mt-0.5 leading-tight">{ann.title}</p>
                            <p className="text-[10px] text-ink-muted mt-0.5 line-clamp-1">{ann.content}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-ink-muted shrink-0" />
                      </div>
                    ))
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-surface border border-border shadow-2xs flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-700 border border-primary-200 flex items-center justify-center shrink-0">
                          <Megaphone className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-ink">Kerja Bakti Lingkungan & Taman Warga</p>
                          <p className="text-[10px] text-ink-muted mt-0.5">Minggu Pagi • Lapangan Blok A</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-ink-muted shrink-0" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: IURAN & KEUANGAN RUMAH (DUES & BILLING)                            */}
          {/* ========================================================================= */}
          {activeTab === 'iuran' && (
            <div className="p-4 sm:p-6 space-y-5 flex-1 animate-in fade-in duration-150">
              {/* Header Navigation */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('beranda')}
                    className="p-1.5 -ml-1 text-ink hover:bg-canvas rounded-full active:scale-95 transition-all"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h2 className="font-extrabold text-lg text-ink">Iuran & Keuangan Rumah</h2>
                    <p className="text-[11px] text-ink-muted">Rekapitulasi iuran bulanan dan kuitansi pembayaran resmi</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => showActualReceipt()}
                    disabled={currentSelectedMonthData.status !== 'paid'}
                    className="px-3 py-1.5 bg-surface hover:bg-canvas border border-border text-ink text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs active:scale-[0.98] transition-all"
                    title="Buka Dokumen Kuitansi Resmi"
                  >
                    <Printer className="w-3.5 h-3.5 text-primary-600" />
                    <span>Kuitansi</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedReceipt({
                        invoiceNumber: currentSelectedMonthData.inv,
                        periodName: currentSelectedMonthData.name,
                        propertyCode: currentUser?.propertyCode || 'A-17',
                        residentName: currentUser?.fullName || currentUser?.name || 'Warga Komplek',
                        amount: currentSelectedMonthData.amount,
                        paidAt: currentSelectedMonthData.paidAt || '-',
                        paymentMethod: currentSelectedMonthData.method,
                        referenceNumber: currentSelectedMonthData.reference,
                        kepalaKomplekName: kepalaKomplekName,
                        isInvoice: true,
                      })
                    }
                    className="px-2.5 py-1.5 bg-surface hover:bg-canvas border border-border text-ink-muted hover:text-ink text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs active:scale-[0.98] transition-all"
                    title="Buka Dokumen Surat Tagihan / Invoice IPL Resmi"
                    disabled={!currentSelectedMonthData.id}
                  >
                    <FileText className="w-3.5 h-3.5 text-ink-muted" />
                    <span>Invoice</span>
                  </button>
                </div>
              </div>

              {/* 12 Months Interactive Matrix Bar */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-ink">Tagihan yang tercatat</h3>
                  <div className="flex items-center gap-3 text-[10px] text-ink-muted">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> Lunas
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500" /> Berjalan
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-border-dark" /> Mendatang
                    </span>
                  </div>
                </div>

                {!monthsBilling.length && <p className="text-sm text-ink-muted py-3">Belum ada tagihan untuk rumah Anda.</p>}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {monthsBilling.map((m) => {
                    const isCurrent = m.code === selectedMonth;
                    const isPaid = m.status === 'paid';
                    const isPending = m.status === 'pending';
                    return (
                      <button
                        key={m.code}
                        type="button"
                        onClick={() => setSelectedMonth(m.code)}
                        className={`p-2.5 rounded-xl text-center flex flex-col items-center justify-between border transition-all active:scale-95 ${
                          isCurrent
                            ? 'bg-surface border-primary-600 ring-2 ring-primary-600/20 shadow-xs'
                            : 'bg-canvas border-border/80 hover:bg-surface'
                        }`}
                      >
                        <span className={`text-[11px] font-bold ${isCurrent ? 'text-primary-700' : 'text-ink'}`}>
                            {m.shortLabel}
                        </span>
                        {isPaid ? (
                          <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mt-1">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        ) : isPending ? (
                          <div className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mt-1">
                            <Clock className="w-2.5 h-2.5" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-border/80 mt-1" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rincian Komponen IPL Struk Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border shadow-card space-y-4">
                <div className="flex items-center justify-between border-b border-dashed border-border pb-3">
                  <div>
                    <span className="text-[10px] text-ink-muted font-mono uppercase tracking-wider block">
                      NO. INVOICE: {currentSelectedMonthData.inv}
                    </span>
                    <h3 className="text-base font-bold text-ink">Tagihan Iuran {currentSelectedMonthData.name}</h3>
                    <p className="text-xs text-ink-muted">Jatuh tempo: {currentSelectedMonthData.dueDate}</p>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
                      currentSelectedMonthData.status === 'paid'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : currentSelectedMonthData.status === 'pending'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-canvas text-ink-muted border-border'
                    }`}
                  >
                    {currentSelectedMonthData.status === 'paid'
                      ? 'Lunas'
                      : currentSelectedMonthData.status === 'pending'
                      ? 'Menunggu Pembayaran'
                      : 'Akan Datang'}
                  </span>
                </div>

                {/* Breakdown Items */}
                <div className="space-y-2 text-xs">
                  <span className="text-[10px] uppercase font-bold text-ink-muted tracking-wide block">
                      Tarif lingkungan sebagai referensi
                  </span>
                  <div className="space-y-1.5">
                    {tariffComponents && tariffComponents.length > 0 ? (
                      tariffComponents.map((it: any, idx: number) => (
                        <div key={it.id || idx} className="flex justify-between items-center text-ink-muted">
                          <span className="truncate pr-2">{it.name}</span>
                          <span className="font-mono text-ink font-semibold tabular-nums shrink-0">{formatRupiah(Number(it.fee) || 0)}</span>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex justify-between items-center text-ink-muted">
                          <span>1. Jasa Keamanan 24 Jam & Pos Satpam</span>
                          <span className="font-mono text-ink font-semibold tabular-nums">{formatRupiah(feeSecurity)}</span>
                        </div>
                        <div className="flex justify-between items-center text-ink-muted">
                          <span>2. Kebersihan Lingkungan & TPS3R Viar Tossa</span>
                          <span className="font-mono text-ink font-semibold tabular-nums">{formatRupiah(feeSanitation)}</span>
                        </div>
                        <div className="flex justify-between items-center text-ink-muted">
                          <span>3. Pemeliharaan Fasum, Taman & PJU Listrik</span>
                          <span className="font-mono text-ink font-semibold tabular-nums">{formatRupiah(feeMaintenance)}</span>
                        </div>
                        <div className="flex justify-between items-center text-ink-muted">
                          <span>4. Dana Kas Sosial & Musyawarah Paguyuban</span>
                          <span className="font-mono text-ink font-semibold tabular-nums">{formatRupiah(feeSocial)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Total Billing */}
                <div className="pt-3 border-t border-dashed border-border flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-ink-muted">Total Tagihan Bulanan:</span>
                    <p className="text-xl font-semibold text-primary-800 tabular-nums">{formatRupiah(currentSelectedMonthData.amount)}</p>
                  </div>

                  {currentSelectedMonthData.status === 'paid' ? (
                    <div className="text-right">
                      <span className="text-[10px] text-emerald-700 font-bold block">Lunas Terverifikasi</span>
                      <span className="text-[10px] text-ink-muted">{currentSelectedMonthData.paidAt}</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowPaymentModal(true)}
                      disabled={!currentSelectedMonthData.id || currentSelectedMonthData.remaining <= 0}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-surface font-bold text-xs rounded-xl shadow-xs active:scale-[0.98] transition-all flex items-center gap-1.5"
                    >
                      <Upload className="w-4 h-4" />
                        Konfirmasi transfer
                    </button>
                  )}
                </div>

                {/* Official Bank Account Card (Anti-Slop: clean, structured, high-contrast) */}
                <div className="p-4 rounded-xl bg-canvas border border-border text-ink space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-primary-800 font-bold uppercase tracking-wider">
                      Rekening Resmi Kas Paguyuban
                    </span>
                    <span className="px-2 py-0.5 bg-primary-100 text-primary-900 rounded text-[10px] font-mono font-bold">
                      QRIS Ready
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-ink-muted">{bankKasName}</p>
                      <p className="text-lg font-black font-mono tracking-wider text-primary-800">{bankKasAcc}</p>
                      <p className="text-[10px] text-ink-muted">a.n {bankKasHolder}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(bankKasAcc.replace(/[^0-9]/g, ''));
                        setCopiedAcc(true);
                        setTimeout(() => setCopiedAcc(false), 2000);
                      }}
                      className="px-3 py-1.5 bg-surface hover:bg-canvas border border-border rounded-xl text-xs font-bold text-ink transition-all flex items-center gap-1.5 active:scale-[0.98] shadow-2xs"
                    >
                      {copiedAcc ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-ink-muted" />
                          <span>Salin No. Rek</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(true)}
                    disabled={!currentSelectedMonthData.id || currentSelectedMonthData.remaining <= 0}
                    className="flex-1 py-3 px-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-surface font-semibold text-sm rounded-xl flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Konfirmasi transfer
                  </button>
                </div>
              </div>

              {/* Riwayat Pembayaran Sebelumnya */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-ink uppercase tracking-wide">Riwayat Kuitansi Pembayaran</h3>
                  <span className="text-[11px] text-ink-muted">Tercatat di Buku Kas RT</span>
                </div>

                <div className="space-y-2">
                  {monthsBilling.filter(invoice => invoice.status === 'paid').map((invoice, idx) => {
                    const row = { month: invoice.name, date: invoice.paidAt || '-', amount: invoice.amount, method: invoice.method };
                    return (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-surface border border-border shadow-2xs flex items-center justify-between hover:border-primary-200 transition-all"
                    >
                      <div>
                        <p className="text-xs font-bold text-ink">{row.month}</p>
                        <p className="text-[10px] text-ink-muted">
                          {row.date} • {row.method}
                        </p>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <span className="text-xs font-bold text-ink tabular-nums">{formatRupiah(row.amount)}</span>
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded border border-emerald-200">
                          Lunas
                        </span>
                      </div>
                    </div>
                  ); })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: INFO & LAYANAN WARGA (AGENDA, FASUM, SAMPAH, ADUAN)                 */}
          {/* ========================================================================= */}
          {activeTab === 'info' && (
            <div className="p-4 sm:p-6 space-y-5 flex-1 animate-in fade-in duration-150">
              {/* Header Navigation */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('beranda')}
                    className="p-1.5 -ml-1 text-ink hover:bg-canvas rounded-full active:scale-95 transition-all"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h2 className="font-extrabold text-lg text-ink">Layanan & Agenda Warga</h2>
                    <p className="text-[11px] text-ink-muted">Pengumuman resmi, katalog fasilitas, armada kebersihan & aduan</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowFacilityModal(true)}
                    className="px-2.5 py-1.5 bg-surface hover:bg-canvas border border-border text-ink text-xs font-bold rounded-xl flex items-center gap-1 shadow-2xs active:scale-[0.98] transition-all"
                  >
                    <Building2 className="w-3.5 h-3.5 text-primary-700" />
                    <span>Pesan Sarana</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowComplaintModal(true)}
                    className="px-2.5 py-1.5 bg-primary-600 hover:bg-primary-700 text-surface text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs active:scale-[0.98] transition-all"
                  >
                    <MessageSquarePlus className="w-3.5 h-3.5" />
                    <span>Aduan</span>
                  </button>
                </div>
              </div>

              {/* Sub-Navigation Pills (4 Sub-Menus) */}
              <div className="flex items-center gap-1.5 p-1 bg-canvas rounded-2xl border border-border overflow-x-auto no-scrollbar">
                {[
                  { id: 'announcements', label: 'Pengumuman', icon: Megaphone },
                  { id: 'facilities', label: 'Sarana Fasum', icon: Building2 },
                  { id: 'sanitation', label: 'Kebersihan', icon: Trash2 },
                  { id: 'complaints', label: 'Aduan & SOS', icon: Headphones },
                ].map((st) => {
                  const Icon = st.icon;
                  const isActive = infoSubTab === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setInfoSubTab(st.id as any)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
                        isActive
                          ? 'bg-surface text-primary-800 shadow-xs border border-border'
                          : 'text-ink-muted hover:text-ink hover:bg-surface/50'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {st.label}
                    </button>
                  );
                })}
              </div>

              {/* SUBTAB 1: PENGUMUMAN & AGENDA */}
              {infoSubTab === 'announcements' && (
                <div className="space-y-4 animate-in fade-in duration-100">
                  {initialAnnouncements && initialAnnouncements.length > 0 ? (
                    initialAnnouncements.map((ann: any) => (
                      <div key={ann.id} className="p-4 sm:p-5 rounded-2xl bg-surface border border-border shadow-xs space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 bg-primary-50 text-primary-800 text-[10px] font-bold rounded-md border border-primary-200 uppercase">
                            {ann.category || 'KEGIATAN'}
                          </span>
                          <span className="text-[10px] text-ink-muted font-mono">{ann.createdAt || 'Terbaru'}</span>
                        </div>
                        <h4 className="text-sm font-bold text-ink">{ann.title}</h4>
                        <p className="text-xs text-ink-muted leading-relaxed">{ann.content}</p>
                        {ann.location && (
                          <div className="pt-2 border-t border-border/80 flex items-center justify-between text-xs text-primary-800 font-semibold">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-primary-600" />
                              {ann.scheduledAt || 'Sesuai Jadwal'}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-primary-600" />
                              {ann.location}
                            </span>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-ink-muted bg-surface rounded-2xl border border-border space-y-1">
                      <Megaphone className="w-7 h-7 text-ink-muted mx-auto" />
                      <p className="text-xs font-bold text-ink">Belum ada pengumuman terbaru</p>
                      <p className="text-[11px]">Siaran informasi resmi dari pengurus komplek akan tampil di sini.</p>
                    </div>
                  )}

                  {/* E-Voting Musyawarah Banner Card (Anti-Slop civic card) */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-primary-300 shadow-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-md bg-primary-100 text-primary-900 text-[10px] font-bold uppercase tracking-wider">
                        Musyawarah Digital
                      </span>
                      <span className="text-[10px] text-primary-800 font-bold">1 Rumah = 1 Suara</span>
                    </div>
                    <h4 className="font-bold text-sm text-ink">Pemilihan Ketua RW 05 / RT 02 (Periode 2026-2029)</h4>
                    <p className="text-xs text-ink-muted leading-relaxed">
                      Bilik suara digital resmi telah dibuka. Salurkan aspirasi dan gunakan hak suara keluarga Anda untuk
                      kemajuan lingkungan komplek.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowVotingModal(true)}
                      className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-surface font-bold text-xs rounded-xl shadow-xs transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      <Vote className="w-4 h-4" />
                      <span>Buka Bilik Suara & Berikan Pilihan</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* SUBTAB 2: KATALOG SARANA & FASUM */}
              {infoSubTab === 'facilities' && (
                <div className="space-y-3 animate-in fade-in duration-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-ink uppercase tracking-wide">Katalog Fasilitas Bersama</h4>
                      <p className="text-[10px] text-ink-muted">Peminjaman sarana untuk kebutuhan kegiatan warga</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowFacilityModal(true)}
                      className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-surface rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all active:scale-[0.98]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ajukan Sewa</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {(overview?.facilities || []).map((fac) => {
                      const Icon = Building2;
                      return (
                        <div
                          key={fac.id}
                          className="p-3.5 rounded-2xl bg-surface border border-border shadow-2xs flex items-center justify-between hover:border-primary-200 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center font-bold">
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-ink">{fac.name}</p>
                              <p className="text-[10px] text-ink-muted">
                                {fac.location}
                              </p>
                              <span className="inline-block mt-0.5 px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[9px] font-bold rounded border border-emerald-200">
                                {fac.condition === 'GOOD' ? 'Kondisi baik' : 'Perlu perhatian'}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setFacId(fac.id);
                              setFacName(fac.name);
                              setShowFacilityModal(true);
                            }}
                            className="px-3 py-1.5 bg-canvas hover:bg-surface border border-border rounded-xl text-xs font-bold text-ink hover:text-primary-700 transition-all active:scale-[0.98] shadow-2xs"
                          >
                            Pesan
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SUBTAB 3: JADWAL KEBERSIHAN & SAMPAH */}
              {infoSubTab === 'sanitation' && (
                <div className="space-y-3 animate-in fade-in duration-100">
                  <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-ink flex items-center gap-1.5 uppercase tracking-wide">
                        <Trash2 className="w-4 h-4 text-teal-600" />
                        Jadwal & Rute Armada Kebersihan Viar Tossa
                      </h4>
                      <span className="px-2.5 py-0.5 bg-teal-50 text-teal-800 text-[10px] font-bold rounded-full border border-teal-200">
                        TPS3R Aktif
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs pt-1">
                      <div className="p-3 bg-canvas rounded-xl border border-border/80 space-y-1">
                        <span className="text-[10px] text-ink-muted font-bold block">Sampah Organik / Dapur</span>
                        <p className="font-bold text-ink">{wasteOrgDays}</p>
                        <p className="text-[10px] text-teal-700 font-bold">{wasteHours}</p>
                      </div>

                      <div className="p-3 bg-canvas rounded-xl border border-border/80 space-y-1">
                        <span className="text-[10px] text-ink-muted font-bold block">Sampah Anorganik (Kardus/Plastik)</span>
                        <p className="font-bold text-ink">{wasteInorgDays}</p>
                        <p className="text-[10px] text-teal-700 font-bold">{wasteHours}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-canvas border border-border space-y-2 text-xs">
                    <h4 className="font-bold text-ink">Permintaan Angkut Khusus (Puing / Dahan Pohon)</h4>
                    <p className="text-ink-muted text-[11px]">
                      Untuk volume sampah besar dari pemangkasan pohon atau sisa renovasi, hubungi Koordinator Kebersihan
                      komplek terlebih dahulu.
                    </p>
                    <a
                      href={`https://wa.me/6281277778888?text=Halo%20Koordinator%20Kebersihan,%20saya%20warga%20${currentUser?.propertyCode || 'A-17'}%20ingin%20request%20angkut%20sampah%20khusus`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-surface rounded-xl font-bold shadow-xs text-xs mt-1 active:scale-[0.98] transition-all"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Chat WhatsApp Koordinator Kebersihan</span>
                    </a>
                  </div>
                </div>
              )}

              {/* SUBTAB 4: ADUAN & SOS */}
              {infoSubTab === 'complaints' && (
                <div className="space-y-3 animate-in fade-in duration-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-ink uppercase tracking-wide">Layanan Aduan & Keluhan Warga</h4>
                      <p className="text-[10px] text-ink-muted">Sampaikan aduan fasilitas, kebersihan, atau ketertiban</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowComplaintModal(true)}
                      className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-surface rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all active:scale-[0.98]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Buat Aduan</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {complaints.length === 0 ? (
                      <div className="p-6 text-center text-ink-muted bg-surface rounded-2xl border border-border space-y-1">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto opacity-80" />
                        <p className="text-xs font-bold text-ink">Tidak ada laporan aduan aktif</p>
                        <p className="text-[11px]">Lingkungan dan fasilitas komplek berjalan normal tanpa keluhan.</p>
                      </div>
                    ) : (
                      complaints.map((comp: any) => (
                        <div
                          key={comp.id}
                          className="p-3.5 rounded-2xl bg-surface border border-border shadow-2xs flex items-start justify-between gap-3"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                              <Headphones className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-ink">{comp.title}</p>
                              <p className="text-[10px] text-ink-muted mt-0.5">
                                Kategori: {comp.category} • Lokasi: {comp.location}
                              </p>
                              <p className="text-[11px] text-ink-muted mt-1">{comp.description}</p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="px-2 py-0.5 bg-amber-50 text-amber-800 text-[9px] font-bold rounded border border-amber-200">
                                  {comp.status === 'MENUNGGU_VERIFIKASI'
                                    ? 'Menunggu Disposisi'
                                    : comp.status === 'SEDANG_DITANGANI'
                                    ? 'Sedang Ditangani Teknisi'
                                    : 'Selesai'}
                                </span>
                                <span className="text-[10px] text-ink-muted">{comp.createdAt}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Emergency Satpam Hotline Banner */}
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-rose-900 flex items-center gap-1.5">
                        <PhoneCall className="w-4 h-4 text-rose-700" />
                        Panggilan Darurat Satpam 24 Jam (Hotline SOS)
                      </h4>
                      <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-300">
                        Siaga Tanggap Cepat
                      </span>
                    </div>
                    <p className="text-rose-800 text-[11px] leading-relaxed">
                      Jika terjadi keadaan darurat keamanan, kebakaran, atau medis di lingkungan komplek, segera hubungi
                      Pos Satpam Gerbang 1. Petugas yang bertugas saat ini:{' '}
                      <strong className="underline decoration-rose-400 font-extrabold text-rose-950">
                        {activeGuardName || 'Pa Adri Harry'}
                      </strong>.
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <a
                        href={`tel:${securityPhone.replace(/[^0-9]/g, '')}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-surface rounded-xl font-bold shadow-xs text-xs active:scale-[0.98] transition-all"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Telepon {activeGuardName || 'Satpam'} ({securityPhone})</span>
                      </a>
                      <a
                        href={`https://wa.me/62${securityPhone.replace(/^0/, '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`[DARURAT / SOS WARGA] Halo ${activeGuardName || 'Pak Satpam'}, mohon bantuan darurat di rumah saya.`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-surface rounded-xl font-bold shadow-xs text-xs active:scale-[0.98] transition-all"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp Darurat</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: MANAJEMEN RUMAH (SPECS, OCCUPANTS, VEHICLES, PERMITS, PASS)       */}
          {/* ========================================================================= */}
          {activeTab === 'rumah' && (
            <div className="p-4 sm:p-6 space-y-5 flex-1 animate-in fade-in duration-150">
              {/* Header Navigation */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('beranda')}
                    className="p-1.5 -ml-1 text-ink hover:bg-canvas rounded-full active:scale-95 transition-all"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h2 className="font-extrabold text-lg text-ink">Manajemen Rumah</h2>
                    <p className="text-[11px] text-ink-muted">Data teknis hunian, penghuni, kendaraan & izin renovasi</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200 flex items-center gap-1">
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Terverifikasi RT
                </span>
              </div>

              {/* Main Unit Card (Anti-Slop: Structured Architectural Surface) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-ink text-surface border border-ink/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 bg-surface/15 text-surface font-mono text-[10px] font-bold rounded-md uppercase tracking-wider">
                    {(currentUser?.propertyCode || 'A-17').toUpperCase().startsWith('KAV')
                      ? 'Area Kavling'
                      : (currentUser?.propertyCode || 'A-17').toUpperCase().startsWith('SW')
                      ? 'Jl. Sariwangi Indah'
                      : `Blok ${(currentUser?.propertyCode || 'A-17').split('-')[0] || 'A'}`} • RT 02 / RW 05
                  </span>
                  <span className="text-[10px] text-surface/70">{communityName}</span>
                </div>

                <div>
                  <span className="text-xs text-surface/70 block uppercase tracking-wide">Nomor Unit Hunian Resmi</span>
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                    Rumah {currentUser?.propertyCode || 'A-17'}
                  </h3>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-surface/15 text-xs">
                  <div>
                    <span className="text-[10px] text-surface/70">Tipe:</span>
                    <p className="font-bold">{buildingType}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-surface/70">Penghuni:</span>
                    <p className="font-bold">{occupants.length} Jiwa</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-surface/70">Kendaraan:</span>
                    <p className="font-bold">{vehicles.length} Unit</p>
                  </div>
                </div>
              </div>

              {/* 5-SubTab Navigation Bar */}
              <div className="flex items-center gap-1.5 p-1 bg-canvas rounded-2xl border border-border overflow-x-auto no-scrollbar">
                {[
                  { id: 'specs', label: 'Spesifikasi', icon: Home },
                  { id: 'occupants', label: 'Penghuni', icon: Users },
                  { id: 'vehicles', label: 'Kendaraan', icon: Car },
                  { id: 'permits', label: 'Izin Renovasi', icon: Hammer },
                  { id: 'pass', label: 'Pas Digital', icon: QrCode },
                ].map((st) => {
                  const Icon = st.icon;
                  const isActive = rumahSubTab === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setRumahSubTab(st.id as any)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
                        isActive
                          ? 'bg-surface text-primary-800 shadow-xs border border-border'
                          : 'text-ink-muted hover:text-ink hover:bg-surface/50'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {st.label}
                    </button>
                  );
                })}
              </div>

              {/* SUBTAB 1: SPESIFIKASI & INFO HUNIAN */}
              {rumahSubTab === 'specs' && (
                <div className="space-y-4 animate-in fade-in duration-100">
                  <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-ink flex items-center gap-1.5 uppercase tracking-wide">
                        <Home className="w-4 h-4 text-primary-600" />
                        Data Teknis & Utilitas Rumah
                      </h4>
                      <button
                        type="button"
                        onClick={() => setShowEditSpecsModal(true)}
                        className="text-xs font-bold text-primary-700 hover:text-primary-800 flex items-center gap-1 active:scale-95 transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit Data
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs">
                      <div className="p-3 rounded-xl bg-canvas border border-border/80 space-y-1">
                        <span className="text-[10px] text-ink-muted flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-primary-600" /> Luas Tanah & Bangunan
                        </span>
                        <p className="font-bold text-ink">{landArea} m² / {buildingArea} m²</p>
                      </div>

                      <div className="p-3 rounded-xl bg-canvas border border-border/80 space-y-1">
                        <span className="text-[10px] text-ink-muted flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-amber-600" /> Daya Listrik PLN
                        </span>
                        <p className="font-bold text-ink">{plnCapacity}</p>
                      </div>

                      <div className="p-3 rounded-xl bg-canvas border border-border/80 space-y-1">
                        <span className="text-[10px] text-ink-muted flex items-center gap-1">
                          <Droplets className="w-3.5 h-3.5 text-sky-600" /> No. Meter Air PAM
                        </span>
                        <p className="font-bold text-ink font-mono">{pamMeterNo}</p>
                      </div>

                      <div className="p-3 rounded-xl bg-canvas border border-border/80 space-y-1">
                        <span className="text-[10px] text-ink-muted flex items-center gap-1">
                          <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" /> Status Kepemilikan
                        </span>
                        <p className="font-bold text-emerald-700">{occupancyStatus}</p>
                      </div>
                    </div>
                  </div>

                  {/* Penanggung Jawab Unit */}
                  <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs space-y-2">
                    <h4 className="text-xs font-bold text-ink uppercase tracking-wide">Kepala Rumah Tangga</h4>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-canvas border border-border/80">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-800 font-extrabold flex items-center justify-center text-sm uppercase border border-primary-200">
                          {getInitials(currentUser?.fullName || currentUser?.name)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-ink">{currentUser?.fullName || currentUser?.name || 'Kepala Keluarga'}</p>
                          <p className="text-[10px] text-ink-muted font-mono">
                            NIK: 3171091203850001 • Kontak: {currentUser?.email || '0812-3456-7890'}
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 bg-primary-50 text-primary-700 text-[10px] font-bold rounded border border-primary-200">
                        Penanggung Jawab
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB 2: ANGGOTA KELUARGA & PENGHUNI */}
              {rumahSubTab === 'occupants' && (
                <div className="space-y-4 animate-in fade-in duration-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-ink uppercase tracking-wide">
                        Daftar Penghuni & Keluarga ({occupants.length} Jiwa)
                      </h4>
                      <p className="text-[10px] text-ink-muted">Terdata resmi di buku warga RT 02 / RW 05</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddOccupantModal(true)}
                      className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-surface font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 active:scale-[0.98] transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Anggota</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {occupants.map((occ) => (
                      <div
                        key={occ.id}
                        className="p-3.5 rounded-2xl bg-surface border border-border shadow-2xs flex items-center justify-between hover:border-primary-200 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary-50 text-primary-800 font-bold text-xs flex items-center justify-center border border-primary-200 uppercase">
                            {getInitials(occ.fullName)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold text-ink">{occ.fullName}</p>
                              {occ.isEmergencyContact && (
                                <span className="px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 text-[9px] font-bold border border-rose-200">
                                  Kontak Darurat
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-ink-muted">
                              {occ.relation} • {occ.phone}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-ink-muted hidden sm:inline">{occ.idCardNumber}</span>
                          {occ.relation !== 'Kepala Keluarga' && (
                            <button
                              type="button"
                              onClick={() => handleDeleteOccupant(occ.id)}
                              className="p-1.5 text-ink-muted hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all active:scale-95"
                              title="Hapus Anggota"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUBTAB 3: KENDARAAN & RFID ACCESS */}
              {rumahSubTab === 'vehicles' && (
                <div className="space-y-4 animate-in fade-in duration-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-ink uppercase tracking-wide">
                        Kendaraan Terdaftar ({vehicles.length} Unit)
                      </h4>
                      <p className="text-[10px] text-ink-muted">Akses palang barrier gate RFID pos satpam otomatis</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowVehicleModal(true)}
                      className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-surface font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 active:scale-[0.98] transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Kendaraan</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {vehicles.map((v) => (
                      <div
                        key={v.id}
                        className="p-3.5 rounded-2xl bg-surface border border-border shadow-2xs flex items-center justify-between hover:border-primary-200 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary-50 border border-primary-200 flex items-center justify-center text-primary-700">
                            {v.type === 'Mobil' ? <Car className="w-5 h-5" /> : <Bike className="w-5 h-5" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-mono text-sm font-black text-ink tracking-wide">{v.plateNumber}</p>
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[9px] font-bold rounded border border-emerald-200">
                                RFID AKTIF
                              </span>
                            </div>
                            <p className="text-[11px] text-ink-muted">
                              {v.type} • {v.brand} {v.model} • Warna {v.color}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-amber-700" />
                      Ketentuan Parkir & Stiker Barrier Gate RFID
                    </p>
                    <p className="text-[11px] text-amber-800">
                      Maksimal 2 mobil dan 3 motor terdaftar per unit hunian. Kendaraan terverifikasi akan otomatis membuka
                      palang pintu gerbang utama tanpa perlu tapping manual.
                    </p>
                  </div>
                </div>
              )}

              {/* SUBTAB 4: IZIN RENOVASI & TUKANG */}
              {rumahSubTab === 'permits' && (
                <div className="space-y-4 animate-in fade-in duration-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-ink uppercase tracking-wide">Surat Izin Kerja (SIK) & Tukang</h4>
                      <p className="text-[10px] text-ink-muted">Wajib diajukan sebelum memulai renovasi atau mendatangkan pekerja</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddPermitModal(true)}
                      className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-surface font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 active:scale-[0.98] transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ajukan Izin</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {permits.map((p) => (
                      <div key={p.id} className="p-4 rounded-2xl bg-surface border border-border shadow-2xs space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-primary-800 bg-primary-50 px-2 py-0.5 rounded border border-primary-200">
                            {p.id}
                          </span>
                          <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded border border-emerald-200">
                            {p.status || 'DISETUJUI'}
                          </span>
                        </div>
                        <div>
                          <h5 className="text-sm font-bold text-ink">{p.workType}</h5>
                          <p className="text-xs text-ink-muted mt-0.5 leading-relaxed">{p.description}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border text-[11px]">
                          <div>
                            <span className="text-ink-muted">Mandor Pelaksana:</span>
                            <p className="font-semibold text-ink">{p.contractorName}</p>
                          </div>
                          <div>
                            <span className="text-ink-muted">Masa Pengerjaan:</span>
                            <p className="font-semibold text-ink">
                              {p.startDate} s/d {p.endDate} ({p.workersCount} Tukang)
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3.5 rounded-2xl bg-canvas border border-border text-xs text-ink-muted space-y-1">
                    <p className="font-bold flex items-center gap-1.5 text-ink">
                      <Hammer className="w-4 h-4 text-primary-700" />
                      Aturan Jam Kerja Renovasi Bising Lingkungan
                    </p>
                    <p className="text-[11px] leading-relaxed">
                      Senin – Sabtu: 08:00 – 17:00 WIB. Hari Minggu dan Libur Nasional dilarang melakukan aktivitas konstruksi
                      yang menimbulkan kebisingan demi kenyamanan tetangga.
                    </p>
                  </div>
                </div>
              )}

              {/* SUBTAB 5: DIGITAL HOUSE PASS QR */}
              {rumahSubTab === 'pass' && (
                <div className="space-y-4 animate-in fade-in duration-100">
                  <div className="p-6 rounded-3xl bg-surface border border-border shadow-card text-center space-y-4">
                    <div className="inline-block p-4 rounded-2xl bg-canvas border border-border shadow-inner text-primary-800">
                      <QrCode className="w-36 h-36 mx-auto" />
                    </div>
                    <div>
                      <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-md border border-emerald-200">
                        STATUS: TERVERIFIKASI AKTIF
                      </span>
                      <h3 className="text-2xl font-black text-ink mt-2">Rumah {currentUser?.propertyCode || 'A-17'}</h3>
                      <p className="text-xs text-ink-muted">{communityName} • RT 01 / RW 08</p>
                      <p className="text-[11px] font-mono text-ink-muted mt-1">ID PAS: PROP-A17-2026-TRX88</p>
                    </div>

                    <div className="flex gap-2 justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(`WARGAHUB-PASS: Rumah ${currentUser?.propertyCode || 'A-17'} - ${communityName} RT 01/RW 08`);
                          setCopiedPass(true);
                          setTimeout(() => setCopiedPass(false), 2000);
                        }}
                        className="px-4 py-2 bg-canvas hover:bg-surface border border-border rounded-xl text-xs font-bold text-ink transition-all active:scale-95 shadow-2xs flex items-center gap-1.5"
                      >
                        {copiedPass ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-ink-muted" />
                            <span>Salin Teks Pas</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-3 rounded-xl bg-canvas border border-border text-xs text-left space-y-1.5">
                      <p className="font-bold text-ink">Kegunaan Pas Digital Tamu:</p>
                      <p className="text-[11px] text-ink-muted">1. Tunjukkan ke satpam pos gerbang saat verifikasi tamu keluarga atau kurir logistik.</p>
                      <p className="text-[11px] text-ink-muted">2. Konfirmasi pengambilan paket kiriman pos satpam.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: AKUN & DIREKTORI PENGURUS                                          */}
          {/* ========================================================================= */}
          {activeTab === 'akun' && (
            <div className="p-4 sm:p-6 space-y-5 flex-1 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-extrabold text-lg text-ink">Profil & Layanan Pengurus</h2>
                  <p className="text-[11px] text-ink-muted">Pengaturan akun, susunan kontak pengurus RT/RW & dokumen</p>
                </div>
                <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 font-bold px-2 py-0.5 rounded-full">
                  Akun Warga Terdaftar
                </span>
              </div>

              {/* User Profile Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border shadow-xs flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary-600 text-surface font-black text-xl flex items-center justify-center border border-primary-400 uppercase tracking-wider shrink-0 shadow-2xs">
                  {getInitials(currentUser?.fullName || currentUser?.name)}
                </div>
                <div>
                  <h3 className="font-bold text-base text-ink">{currentUser?.fullName || currentUser?.name || 'Warga Komplek'}</h3>
                  <p className="text-xs text-ink-muted">{currentUser?.email || 'warga@wargahub.id'}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="px-2 py-0.5 bg-primary-50 text-primary-800 text-[10px] font-bold rounded border border-primary-200">
                      Rumah {currentUser?.propertyCode || 'A-17'}
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded border border-emerald-200">
                      Kepala Keluarga
                    </span>
                  </div>
                </div>
              </div>

              {/* Susunan Pengurus & Kontak Penting */}
              <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-border/80 pb-2">
                  <h4 className="text-xs font-bold text-ink flex items-center gap-1.5 uppercase tracking-wide">
                    <PhoneCall className="w-4 h-4 text-emerald-600" />
                    Susunan Pengurus & Kontak Penting
                  </h4>
                  <span className="text-[10px] text-ink-muted">{communityName}</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-canvas rounded-xl flex items-center justify-between border border-border/70">
                    <div>
                      <span className="text-[10px] text-ink-muted font-bold block">Ketua RW 05 / RT 02</span>
                      <p className="font-bold text-ink">{rwHeadName}</p>
                      <span className="text-[10px] text-ink-muted font-mono">{rwHeadPhone}</span>
                    </div>
                    <a
                      href={`https://wa.me/${rwHeadPhone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-surface rounded-xl font-bold text-[10px] shadow-2xs active:scale-95 transition-all"
                    >
                      WhatsApp
                    </a>
                  </div>

                  <div className="p-3 bg-canvas rounded-xl flex items-center justify-between border border-border/70">
                    <div>
                      <span className="text-[10px] text-ink-muted font-bold block">Pos Satpam 24 Jam (Gerbang 1)</span>
                      <p className="font-bold text-ink">Regu Jaga Satpam Utama</p>
                      <span className="text-[10px] text-ink-muted font-mono">{securityPhone}</span>
                    </div>
                    <a
                      href={`tel:${securityPhone.replace(/[^0-9]/g, '')}`}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-surface rounded-xl font-bold text-[10px] shadow-2xs active:scale-95 transition-all"
                    >
                      Telepon
                    </a>
                  </div>

                  <div className="p-3 bg-canvas rounded-xl flex items-center justify-between border border-border/70">
                    <div>
                      <span className="text-[10px] text-ink-muted font-bold block">Koordinator Kebersihan & Viar Tossa</span>
                      <p className="font-bold text-ink">Bpk. Sugeng (Tim TPS3R)</p>
                      <span className="text-[10px] text-teal-700 font-bold">{wasteOrgDays}</span>
                    </div>
                    <a
                      href="https://wa.me/6281277778888"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-surface rounded-xl font-bold text-[10px] shadow-2xs active:scale-95 transition-all"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>

              {/* Dokumen Resmi Lingkungan */}
              <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-border/80 pb-2">
                  <h4 className="text-xs font-bold text-ink flex items-center gap-1.5 uppercase tracking-wide">
                    <FileText className="w-4 h-4 text-primary-600" />
                    Arsip & Dokumen Resmi Lingkungan
                  </h4>
                  <span className="text-[10px] text-primary-800 font-bold">3 Dokumen</span>
                </div>

                <div className="space-y-2">
                  {[
                    { title: 'Tata Tertib Komplek & Parkir Warga 2026', size: '1.2 MB', cat: 'TATA TERTIB' },
                    { title: 'Surat Edaran Jadwal Ronda & Iuran IPL', size: '450 KB', cat: 'SURAT EDARAN' },
                    { title: 'Laporan Keuangan Kas Semester 1 2026', size: '3.4 MB', cat: 'LAPORAN' },
                  ].map((doc, idx) => (
                    <div key={idx} className="p-3 bg-canvas rounded-xl flex items-center justify-between gap-2 border border-border/70">
                      <div>
                        <p className="text-xs font-bold text-ink">{doc.title}</p>
                        <span className="text-[10px] text-ink-muted">
                          {doc.cat} • {doc.size}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const content = `DOKUMEN RESMI WARGAHUB\n=======================\nJudul: ${doc.title}\nKategori: ${doc.cat}\nUkuran: ${doc.size}\n\nDokumen resmi terverifikasi untuk warga ${communityName}.`;
                          const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${doc.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.txt`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        }}
                        className="p-2 bg-surface hover:bg-primary-50 text-primary-700 rounded-xl border border-border active:scale-95 transition-all shadow-2xs"
                        title="Unduh Dokumen"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tautan Cepat & Logout */}
              <div className="space-y-2">
                {isAdminUser && (
                  <a
                    href="/admin"
                    className="w-full py-2.5 px-4 bg-primary-50 hover:bg-primary-100 border border-primary-200 text-primary-900 font-bold text-xs rounded-xl flex items-center justify-between transition-all active:scale-[0.98]"
                  >
                    <span>Buka Dashboard Pengurus Komplek</span>
                    <ChevronRight className="w-4 h-4 text-primary-700" />
                  </a>
                )}
                <a
                  href="/rekap-iuran"
                  className="w-full py-2.5 px-4 bg-surface hover:bg-canvas border border-border text-ink font-bold text-xs rounded-xl flex items-center justify-between transition-all active:scale-[0.98]"
                >
                  <span>Rekapitulasi Iuran Warga (Bulan Aktif)</span>
                  <ChevronRight className="w-4 h-4 text-ink-muted" />
                </a>
                <a
                  href="/transparency"
                  className="w-full py-2.5 px-4 bg-surface hover:bg-canvas border border-border text-ink font-bold text-xs rounded-xl flex items-center justify-between transition-all active:scale-[0.98]"
                >
                  <span>Laporan Transparansi Kas Paguyuban</span>
                  <ChevronRight className="w-4 h-4 text-ink-muted" />
                </a>
                <button
                  type="button"
                  onClick={async () => {
                    await apiFetch('/api/auth/logout', { method: 'POST' });
                    localStorage.removeItem('wargahub_user');
                    window.location.href = '/';
                  }}
                  className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs rounded-xl flex items-center justify-between transition-all active:scale-[0.98] mt-2"
                >
                  <span>Keluar dari Akun (Logout)</span>
                  <ChevronRight className="w-4 h-4 text-rose-600" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* BOTTOM APPLICATION NAVIGATION BAR (Ergonomic, Tactile Touch)              */}
          {/* ========================================================================= */}
           <ResidentNavigation activeTab={activeTab} onNavigate={setActiveTab} mobile />
        </div>
      </main>

      {/* ========================================================================= */}
      {/* ALL MODAL DIALOGS (Zero Truncation, Tactile Feedback)                     */}
      {/* ========================================================================= */}

      {/* 1. Payment Confirmation Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-surface rounded-3xl max-w-sm w-full p-6 border border-border shadow-modal space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-sm text-ink">Konfirmasi Pembayaran Iuran</h3>
                <p className="text-xs text-ink-muted">Masukkan referensi transfer untuk verifikasi bendahara.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="p-1 hover:bg-canvas rounded-full text-ink-muted hover:text-ink active:scale-95 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {paymentSuccess ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <p className="font-semibold text-sm text-ink">Konfirmasi pembayaran terkirim</p>
                <p className="text-xs text-ink-muted">Bendahara paguyuban akan memverifikasi transaksi Anda.</p>
              </div>
            ) : (
              <form onSubmit={handleConfirmPayment} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-ink block mb-1">Rumah / Unit Hunian</label>
                  <input
                    type="text"
                    disabled
                    value={`Rumah ${currentUser?.propertyCode || 'A-17'} (${currentUser?.fullName || 'Warga'})`}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Jumlah Pembayaran</label>
                  <input
                    type="text"
                    disabled
                    value={formatRupiah(currentSelectedMonthData.remaining)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink tabular-nums"
                  />
                </div>
                <div>
                  <p className="font-semibold text-ink">Transfer ke rekening komunitas</p>
                  <p className="text-sm text-ink-muted mt-2">{bankKasName} · {bankKasAcc}<br />a.n. {bankKasHolder}</p>
                </div>
                <div>
                  <label htmlFor="payment-reference" className="font-semibold text-ink block mb-2">Nomor referensi transfer</label>
                  <input id="payment-reference" required value={paymentReference} onChange={event => setPaymentReference(event.target.value)} placeholder="Nomor transaksi dari aplikasi bank" className="w-full border border-border rounded-xl p-3 text-sm" />
                  <p className="text-xs text-ink-muted mt-2">Simpan bukti transfer asli. Bendahara dapat memintanya saat verifikasi.</p>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas active:scale-95 transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={paymentSubmitting}
                    className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-surface font-bold shadow-xs active:scale-[0.98] transition-all"
                  >
                    {paymentSubmitting ? 'Mengirim…' : 'Kirim konfirmasi'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 2. Complaint Modal */}
      {showComplaintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-surface rounded-3xl max-w-sm w-full p-6 border border-border shadow-modal space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-sm text-ink">Laporkan Aduan / Masalah Warga</h3>
                <p className="text-[11px] text-ink-muted">Sampaikan kendala fasilitas atau ketertiban</p>
              </div>
              <button
                type="button"
                onClick={() => setShowComplaintModal(false)}
                className="p-1 hover:bg-canvas rounded-full text-ink-muted hover:text-ink active:scale-95 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {compSuccess ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <p className="font-bold text-sm text-ink">Laporan Berhasil Diajukan!</p>
                <p className="text-xs text-ink-muted">Petugas dan pengurus komplek akan segera menindaklanjuti.</p>
              </div>
            ) : (
              <form onSubmit={handleCreateComplaint} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-ink block mb-1">Kategori Masalah</label>
                  <select
                    value={compCategory}
                    onChange={(e) => setCompCategory(e.target.value)}
                    className="w-full p-2.5 bg-surface border border-border rounded-xl font-semibold text-ink"
                  >
                    <option value="FASILITAS">Fasilitas Umum & Lampu PJU</option>
                    <option value="KEBERSIHAN">Kebersihan & Viar Tossa</option>
                    <option value="KETERTIBAN">Ketertiban Lingkungan & Hewan Peliharaan</option>
                    <option value="KEAMANAN">Keamanan & Parkir Sembarangan</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-ink block mb-1">Judul Ringkas Aduan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Lampu jalan di depan rumah mati"
                    value={compTitle}
                    onChange={(e) => setCompTitle(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-ink block mb-1">Lokasi Kejadian</label>
                  <input
                    type="text"
                    placeholder={`Contoh: Depan Rumah ${currentUser?.propertyCode || 'A-17'}`}
                    value={compLocation}
                    onChange={(e) => setCompLocation(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-ink block mb-1">Deskripsi Detail</label>
                  <textarea
                    rows={3}
                    placeholder="Jelaskan kondisi atau kendala yang dialami secara singkat..."
                    value={compDesc}
                    onChange={(e) => setCompDesc(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink font-medium"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowComplaintModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas active:scale-95 transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-surface font-bold shadow-xs active:scale-[0.98] transition-all"
                  >
                    Kirim Aduan
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 3. Vehicle Registration Modal */}
      {showVehicleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-surface rounded-3xl max-w-sm w-full p-6 border border-border shadow-modal space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-sm text-ink">Daftarkan Kendaraan Baru</h3>
                <p className="text-[11px] text-ink-muted">Akses barrier gate RFID pos satpam otomatis</p>
              </div>
              <button
                type="button"
                onClick={() => setShowVehicleModal(false)}
                className="p-1 hover:bg-canvas rounded-full text-ink-muted hover:text-ink active:scale-95 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateVehicle} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-ink block mb-1">Jenis Kendaraan</label>
                  <select
                    value={vehType}
                    onChange={(e) => setVehType(e.target.value)}
                    className="w-full p-2.5 bg-surface border border-border rounded-xl font-semibold text-ink"
                  >
                    <option value="Mobil">Mobil</option>
                    <option value="Motor">Motor</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Nomor Polisi (Plat)</label>
                  <input
                    type="text"
                    placeholder="B 1234 XYZ"
                    value={vehPlate}
                    onChange={(e) => setVehPlate(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono uppercase font-bold text-ink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-ink block mb-1">Merk Pabrikan</label>
                  <input
                    type="text"
                    placeholder="Toyota / Honda"
                    value={vehBrand}
                    onChange={(e) => setVehBrand(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Model / Varian</label>
                  <input
                    type="text"
                    placeholder="Innova / PCX"
                    value={vehModel}
                    onChange={(e) => setVehModel(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Warna Kendaraan</label>
                <input
                  type="text"
                  placeholder="Hitam Metalik / Putih"
                  value={vehColor}
                  onChange={(e) => setVehColor(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink font-medium"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowVehicleModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas active:scale-95 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-surface font-bold shadow-xs active:scale-[0.98] transition-all"
                >
                  Simpan Kendaraan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Facility Booking Modal */}
      {showFacilityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-surface rounded-3xl max-w-sm w-full p-6 border border-border shadow-modal space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-sm text-ink">Pesan / Sewa Fasilitas Warga</h3>
                <p className="text-[11px] text-ink-muted">Balai pertemuan, lapangan & sarana bersama</p>
              </div>
              <button
                type="button"
                onClick={() => setShowFacilityModal(false)}
                className="p-1 hover:bg-canvas rounded-full text-ink-muted hover:text-ink active:scale-95 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {facSuccess ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <p className="font-bold text-sm text-ink">Permohonan Terkirim!</p>
                <p className="text-xs text-ink-muted">Pengurus fasum akan segera memverifikasi ketersediaan jadwal sarana.</p>
              </div>
            ) : (
              <form onSubmit={handleBookFacility} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-ink block mb-1">Pilih Sarana / Fasilitas</label>
                  <select
                    value={facId}
                    onChange={(e) => {
                      setFacId(e.target.value);
                      setFacName(e.target.options[e.target.selectedIndex].text);
                    }}
                    className="w-full p-2.5 bg-surface border border-border rounded-xl font-semibold text-ink"
                  >
                    <option value="" disabled>Pilih fasilitas</option>
                    {(overview?.facilities || []).map(facility => <option key={facility.id} value={facility.id}>{facility.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-ink block mb-1">Tanggal Pemakaian</label>
                  <input
                    type="date"
                    value={facDate}
                    onChange={(e) => setFacDate(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-ink block mb-1">Jam Mulai</label>
                    <input
                      type="time"
                      value={facStart}
                      onChange={(e) => setFacStart(e.target.value)}
                      required
                      className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink font-medium"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-ink block mb-1">Jam Selesai</label>
                    <input
                      type="time"
                      value={facEnd}
                      onChange={(e) => setFacEnd(e.target.value)}
                      required
                      className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-ink block mb-1">Keperluan / Acara</label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Arisan keluarga warga RT 02 / Latihan bulutangkis..."
                    value={facPurpose}
                    onChange={(e) => setFacPurpose(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-ink block mb-1">No. WhatsApp Pemohon</label>
                  <input
                    type="tel"
                    value={facPhone}
                    onChange={(e) => setFacPhone(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowFacilityModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas active:scale-95 transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-surface font-bold shadow-xs active:scale-[0.98] transition-all"
                  >
                    Ajukan Sewa
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 5. Add Occupant Modal */}
      {showAddOccupantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-surface rounded-3xl max-w-sm w-full p-6 border border-border shadow-modal space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-sm text-ink">Tambah Anggota Keluarga / Penghuni</h3>
                <p className="text-[11px] text-ink-muted">Daftarkan ke database RT 02 / RW 05</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddOccupantModal(false)}
                className="p-1 hover:bg-canvas rounded-full text-ink-muted hover:text-ink active:scale-95 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddOccupant} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-ink block mb-1">Nama Lengkap Sesuai KTP</label>
                <input
                  type="text"
                  placeholder="Contoh: Rian Santoso"
                  value={newOccName}
                  onChange={(e) => setNewOccName(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-ink block mb-1">Hubungan Keluarga</label>
                  <select
                    value={newOccRelation}
                    onChange={(e) => setNewOccRelation(e.target.value)}
                    className="w-full p-2.5 bg-surface border border-border rounded-xl text-ink font-semibold"
                  >
                    <option value="ANAK">Anak</option>
                    <option value="ISTRI">Istri</option>
                    <option value="ORANG_TUA">Orang Tua / Mertua</option>
                    <option value="ART_SUPIR">ART / Supir</option>
                    <option value="FAMILY">Keluarga Lain</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Nomor WhatsApp / HP</label>
                  <input
                    type="text"
                    placeholder="0812-xxxx-xxxx"
                    value={newOccPhone}
                    onChange={(e) => setNewOccPhone(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Nomor Induk Kependudukan (NIK)</label>
                <input
                  type="text"
                  placeholder="16 Digit NIK KTP"
                  value={newOccIdCard}
                  onChange={(e) => setNewOccIdCard(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="occEmergency"
                  checked={newOccEmergency}
                  onChange={(e) => setNewOccEmergency(e.target.checked)}
                  className="rounded border-border text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="occEmergency" className="text-xs text-ink font-semibold cursor-pointer">
                  Jadikan Kontak Darurat Sekunder Rumah
                </label>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddOccupantModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas active:scale-95 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-surface font-bold shadow-xs active:scale-[0.98] transition-all"
                >
                  Simpan Penghuni
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Add Permit (SIK Renovasi) Modal */}
      {showAddPermitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-surface rounded-3xl max-w-sm w-full p-6 border border-border shadow-modal space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-sm text-ink">Pengajuan Izin Renovasi / Pekerja (SIK)</h3>
                <p className="text-[11px] text-ink-muted">Pemberitahuan kepada satpam dan pengurus RT</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddPermitModal(false)}
                className="p-1 hover:bg-canvas rounded-full text-ink-muted hover:text-ink active:scale-95 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {permitSuccess ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <p className="font-bold text-sm text-ink">Izin Berhasil Diterbitkan!</p>
                <p className="text-xs text-ink-muted">Petugas Pos Satpam Utama telah menerima notifikasi pekerja resmi.</p>
              </div>
            ) : (
              <form onSubmit={handleAddPermit} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-ink block mb-1">Jenis Pekerjaan</label>
                  <select
                    value={permitWorkType}
                    onChange={(e) => setPermitWorkType(e.target.value)}
                    className="w-full p-2.5 bg-surface border border-border rounded-xl text-ink font-semibold"
                  >
                    <option value="Pengecatan & Kanopi">Pengecatan & Kanopi Depan</option>
                    <option value="Renovasi Interior">Renovasi Interior & Plafon</option>
                    <option value="Perbaikan Atap / Genteng">Perbaikan Atap & Talang Air</option>
                    <option value="Instalasi Listrik / AC">Instalasi Listrik & Pipa AC</option>
                    <option value="Pekerjaan Taman">Pekerjaan Taman & Paving</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-ink block mb-1">Nama Mandor / Penanggung Jawab</label>
                  <input
                    type="text"
                    placeholder="Contoh: Bpk. Sugeng (CV Berkah Abadi)"
                    value={permitContractor}
                    onChange={(e) => setPermitContractor(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink font-medium"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="font-bold text-ink block mb-1">Jml Tukang</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={permitWorkers}
                      onChange={(e) => setPermitWorkers(Number(e.target.value))}
                      className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-ink block mb-1">Mulai</label>
                    <input
                      type="date"
                      value={permitStart}
                      onChange={(e) => setPermitStart(e.target.value)}
                      className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-ink block mb-1">Selesai</label>
                    <input
                      type="date"
                      value={permitEnd}
                      onChange={(e) => setPermitEnd(e.target.value)}
                      className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink text-[11px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-ink block mb-1">Deskripsi Ringkas Pekerjaan</label>
                  <textarea
                    rows={2}
                    placeholder="Rincian bagian yang direnovasi..."
                    value={permitDesc}
                    onChange={(e) => setPermitDesc(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink font-medium"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddPermitModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas active:scale-95 transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-surface font-bold shadow-xs active:scale-[0.98] transition-all"
                  >
                    Terbitkan Izin SIK
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 7. Edit Property Specs Modal */}
      {showEditSpecsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-surface rounded-3xl max-w-sm w-full p-6 border border-border shadow-modal space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-sm text-ink">Perbarui Data Teknis Rumah</h3>
                <p className="text-[11px] text-ink-muted">Kapasitas listrik, meter PAM dan tipe hunian</p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditSpecsModal(false)}
                className="p-1 hover:bg-canvas rounded-full text-ink-muted hover:text-ink active:scale-95 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateSpecs} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-ink block mb-1">Tipe Bangunan</label>
                  <input
                    type="text"
                    value={buildingType}
                    onChange={(e) => setBuildingType(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Status Hunian</label>
                  <select
                    value={occupancyStatus}
                    onChange={(e) => setOccupancyStatus(e.target.value)}
                    className="w-full p-2.5 bg-surface border border-border rounded-xl text-ink font-semibold"
                  >
                    <option value="Dihuni Pemilik">Dihuni Pemilik</option>
                    <option value="Disewa / Kontrak">Disewa / Kontrak</option>
                    <option value="Kosong / Renovasi">Kosong / Renovasi</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-ink block mb-1">Luas Tanah (m²)</label>
                  <input
                    type="number"
                    value={landArea}
                    onChange={(e) => setLandArea(Number(e.target.value))}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Luas Bangunan (m²)</label>
                  <input
                    type="number"
                    value={buildingArea}
                    onChange={(e) => setBuildingArea(Number(e.target.value))}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-ink block mb-1">Daya Listrik PLN</label>
                  <select
                    value={plnCapacity}
                    onChange={(e) => setPlnCapacity(e.target.value)}
                    className="w-full p-2.5 bg-surface border border-border rounded-xl text-ink font-semibold"
                  >
                    <option value="1.300 VA">1.300 VA</option>
                    <option value="2.200 VA">2.200 VA</option>
                    <option value="3.500 VA">3.500 VA</option>
                    <option value="4.400 VA">4.400 VA</option>
                    <option value="5.500 VA">5.500 VA</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">No. Meteran PAM</label>
                  <input
                    type="text"
                    value={pamMeterNo}
                    onChange={(e) => setPamMeterNo(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditSpecsModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas active:scale-95 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-surface font-bold shadow-xs active:scale-[0.98] transition-all"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Digital Official Receipt Modal */}
      {selectedReceipt && (
        <ReceiptModal
          isOpen={Boolean(selectedReceipt)}
          onClose={() => setSelectedReceipt(null)}
          data={selectedReceipt}
        />
      )}

      {/* Digital E-Voting Civic Modal */}
      <VotingSectionModal
        isOpen={showVotingModal}
        onClose={() => setShowVotingModal(false)}
        propertyCode={currentUser?.propertyCode || 'A-17'}
        residentName={currentUser?.fullName || currentUser?.name || 'Warga'}
      />

      {/* Floating Warga AI Assistant Widget */}
      <WargaAIChatWidget currentPropertyCode={currentUser?.propertyCode || 'A-17'} />

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-border bg-surface/50 text-center text-xs text-ink-muted">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>WargaHub • Portal Mandiri Warga</span>
          <span>
            Dikembangkan oleh{' '}
            <a
              href="https://yahyanursidik.my.id/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-primary-700 hover:text-primary-800 hover:underline"
            >
              Yahya Nursidik
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
};

export const ResidentPortalView: React.FC<ResidentPortalViewProps> = (props) => {
  return (
    <ErrorBoundary fallbackTitle="Kendala Memuat Portal Warga">
      <ResidentPortalInner {...props} />
    </ErrorBoundary>
  );
};
