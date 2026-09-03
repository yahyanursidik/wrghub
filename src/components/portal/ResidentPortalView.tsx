import React, { useState } from 'react';
import {
  Home,
  Receipt,
  Megaphone,
  User,
  Bell,
  ChevronRight,
  CheckCircle2,
  Wallet,
  Hourglass,
  Headphones,
  Calendar,
  Download,
  Car,
  Bike,
  Users,
  ShieldCheck,
  Smartphone,
  Monitor,
  ArrowLeft,
  Upload,
  Check,
  FileText,
  Clock,
  Sparkles,
  Info,
  PhoneCall,
  ExternalLink,
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
} from 'lucide-react';
import { formatRupiah, formatRupiahShort } from '../../lib/format';
import { DEMO_USERS, type UserSession } from '../../types/auth';
import { ReceiptModal } from '../shared/ReceiptModal';
import { WargaAIChatWidget } from '../shared/WargaAIChatWidget';
import { VotingSectionModal } from './VotingSectionModal';
import { ErrorBoundary } from '../shared/ErrorBoundary';

interface ResidentPortalViewProps {
  initialUser?: UserSession;
}

const ResidentPortalInner: React.FC<ResidentPortalViewProps> = ({
  initialUser = DEMO_USERS.warga,
}) => {
  const [activeTab, setActiveTab] = useState<'beranda' | 'iuran' | 'info' | 'rumah' | 'akun'>('beranda');
  const [rumahSubTab, setRumahSubTab] = useState<'specs' | 'occupants' | 'vehicles' | 'permits' | 'pass'>('specs');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('Agu');
  const [currentUser, setCurrentUser] = useState<UserSession>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedUser = localStorage.getItem('wargahub_user');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          if (parsed && typeof parsed === 'object') return parsed;
        }
      } catch (e) {}
    }
    return initialUser || DEMO_USERS.warga;
  });
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [showVotingModal, setShowVotingModal] = useState(false);

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

  // Dynamic Settings from Master Settings
  const [residentTitle, setResidentTitle] = useState('Portal Warga Komplek');
  const [residentSubtitle, setResidentSubtitle] = useState('Layanan Iuran, Keamanan, Fasilitas & Aduan Warga 24 Jam');
  const [communityName, setCommunityName] = useState('Komplek Perumahan Taman Sejahtera');
  const [monthlyFeeRate, setMonthlyFeeRate] = useState(750000);
  const [bankKasName, setBankKasName] = useState('BCA (Bank Central Asia)');
  const [bankKasAcc, setBankKasAcc] = useState('8830-1928-33');
  const [bankKasHolder, setBankKasHolder] = useState('PENGURUS KOMPLEK WARGAHUB');
  const [qrisNmid, setQrisNmid] = useState('ID1020088921829');
  const [securityPhone, setSecurityPhone] = useState('0812-3456-7801');
  const [rwHeadName, setRwHeadName] = useState('Bpk. Ir. H. Bambang Sutrisno');
  const [rwHeadPhone, setRwHeadPhone] = useState('0812-3456-7890');
  const [wasteOrgDays, setWasteOrgDays] = useState('Senin, Rabu, Jumat');
  const [wasteInorgDays, setWasteInorgDays] = useState('Rabu & Sabtu');
  const [wasteHours, setWasteHours] = useState('06:30 - 10:30 WIB');
  const [copiedAcc, setCopiedAcc] = useState(false);

  // Info Tab Sub-Navigation
  const [infoSubTab, setInfoSubTab] = useState<'announcements' | 'facilities' | 'sanitation' | 'complaints'>('announcements');

  React.useEffect(() => {
    try {
      const savedUser = localStorage.getItem('wargahub_user');
      if (savedUser) {
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
      const savedRwName = localStorage.getItem('wargahub_set_rwheadname');
      const savedRwPhone = localStorage.getItem('wargahub_set_rwheadphone');
      const savedWasteOrg = localStorage.getItem('wargahub_set_waste_org');
      const savedWasteInorg = localStorage.getItem('wargahub_set_waste_inorg');
      const savedWasteHours = localStorage.getItem('wargahub_set_collection_hours');

      if (savedResTitle) setResidentTitle(JSON.parse(savedResTitle));
      if (savedResSub) setResidentSubtitle(JSON.parse(savedResSub));
      if (savedComm) setCommunityName(JSON.parse(savedComm));
      if (savedFee) setMonthlyFeeRate(Number(JSON.parse(savedFee)));
      if (savedBank) setBankKasName(JSON.parse(savedBank));
      if (savedAcc) setBankKasAcc(JSON.parse(savedAcc));
      if (savedHolder) setBankKasHolder(JSON.parse(savedHolder));
      if (savedQris) setQrisNmid(JSON.parse(savedQris));
      if (savedSecPhone) setSecurityPhone(JSON.parse(savedSecPhone));
      if (savedRwName) setRwHeadName(JSON.parse(savedRwName));
      if (savedRwPhone) setRwHeadPhone(JSON.parse(savedRwPhone));
      if (savedWasteOrg) setWasteOrgDays(JSON.parse(savedWasteOrg));
      if (savedWasteInorg) setWasteInorgDays(JSON.parse(savedWasteInorg));
      if (savedWasteHours) setWasteHours(JSON.parse(savedWasteHours));
    } catch (e) {}

    const handleUserChanged = (e: any) => {
      if (e.detail) setCurrentUser(e.detail);
    };
    window.addEventListener('wargahub_user_changed', handleUserChanged);
    return () => window.removeEventListener('wargahub_user_changed', handleUserChanged);
  }, []);

  // Property Specs State
  const [buildingType, setBuildingType] = useState('Tipe 72/120');
  const [landArea, setLandArea] = useState(120);
  const [buildingArea, setBuildingArea] = useState(72);
  const [plnCapacity, setPlnCapacity] = useState('3.500 VA');
  const [pamMeterNo, setPamMeterNo] = useState('PAM-88301');
  const [occupancyStatus, setOccupancyStatus] = useState('Dihuni Pemilik');
  const [showEditSpecsModal, setShowEditSpecsModal] = useState(false);

  // Occupants Management State
  const [occupants, setOccupants] = useState([
    { id: 'occ-1', fullName: 'Budi Santoso', relation: 'Kepala Keluarga', idCardNumber: '3171091203850001', phone: '0812-3456-7890', isEmergencyContact: true, birthDate: '12 Mar 1985' },
    { id: 'occ-2', fullName: 'Siti Lestari', relation: 'Istri', idCardNumber: '3171092507870002', phone: '0813-9876-5432', isEmergencyContact: true, birthDate: '25 Jul 1987' },
    { id: 'occ-3', fullName: 'Alya Santoso', relation: 'Anak', idCardNumber: '3171091405130003', phone: '-', isEmergencyContact: false, birthDate: '14 Mei 2013' },
    { id: 'occ-4', fullName: 'Daffa Santoso', relation: 'Anak', idCardNumber: '3171090309170004', phone: '-', isEmergencyContact: false, birthDate: '03 Sep 2017' },
  ]);
  const [showAddOccupantModal, setShowAddOccupantModal] = useState(false);
  const [newOccName, setNewOccName] = useState('');
  const [newOccRelation, setNewOccRelation] = useState('ANAK');
  const [newOccIdCard, setNewOccIdCard] = useState('');
  const [newOccPhone, setNewOccPhone] = useState('');
  const [newOccEmergency, setNewOccEmergency] = useState(false);

  // Permits (Izin Renovasi / Tukang) State
  const [permits, setPermits] = useState([
    { id: 'PERMIT-101', workType: 'Pengecatan & Kanopi', contractorName: 'Bpk. Sugeng (Mandor CV Berkah)', workersCount: 3, startDate: '2026-08-25', endDate: '2026-09-05', status: 'APPROVED', description: 'Pengecatan fasad luar dan perbaikan talang air kanopi garasi.' },
  ]);
  const [showAddPermitModal, setShowAddPermitModal] = useState(false);
  const [permitWorkType, setPermitWorkType] = useState('Pengecatan & Kanopi');
  const [permitContractor, setPermitContractor] = useState('');
  const [permitWorkers, setPermitWorkers] = useState(2);
  const [permitStart, setPermitStart] = useState('2026-09-01');
  const [permitEnd, setPermitEnd] = useState('2026-09-10');
  const [permitDesc, setPermitDesc] = useState('');
  const [permitSuccess, setPermitSuccess] = useState(false);

  // Complaint State
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [compTitle, setCompTitle] = useState('');
  const [compDesc, setCompDesc] = useState('');
  const [compCategory, setCompCategory] = useState('FASILITAS');
  const [compLocation, setCompLocation] = useState('');
  const [compSuccess, setCompSuccess] = useState(false);

  // Vehicle State
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [vehPlate, setVehPlate] = useState('');
  const [vehType, setVehType] = useState('Mobil');
  const [vehBrand, setVehBrand] = useState('');
  const [vehModel, setVehModel] = useState('');
  const [vehColor, setVehColor] = useState('');
  const [vehicles, setVehicles] = useState([
    { id: '1', plateNumber: 'B 1234 ABC', type: 'Mobil', brand: 'Toyota', model: 'Avanza Veloz', color: 'Hitam Metalik', year: '2022', rfidStatus: 'AKTIF' },
    { id: '2', plateNumber: 'B 5678 DEF', type: 'Motor', brand: 'Honda', model: 'Vario 160', color: 'Putih Mutiara', year: '2023', rfidStatus: 'AKTIF' },
  ]);

  // Facility Booking State
  const [showFacilityModal, setShowFacilityModal] = useState(false);
  const [facId, setFacId] = useState('fac-balai');
  const [facName, setFacName] = useState('Balai Warga Serbaguna');
  const [facDate, setFacDate] = useState('2026-08-30');
  const [facStart, setFacStart] = useState('09:00');
  const [facEnd, setFacEnd] = useState('12:00');
  const [facPurpose, setFacPurpose] = useState('');
  const [facPhone, setFacPhone] = useState('0812-3456-7890');
  const [facSuccess, setFacSuccess] = useState(false);

  const handleBookFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facPurpose) return;
    try {
      await fetch('/api/facilities/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityId: facId,
          facilityName: facName,
          propertyId: currentUser?.propertyId || 'prop-a-17',
          residentName: currentUser?.fullName || currentUser?.name || 'Warga',
          date: facDate,
          startTime: facStart,
          endTime: facEnd,
          purpose: facPurpose,
          contactPhone: facPhone,
        })
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

  const months = [
    { code: 'Jan', name: 'Januari', status: 'paid' },
    { code: 'Feb', name: 'Februari', status: 'paid' },
    { code: 'Mar', name: 'Maret', status: 'paid' },
    { code: 'Apr', name: 'April', status: 'paid' },
    { code: 'Mei', name: 'Mei', status: 'paid' },
    { code: 'Jun', name: 'Juni', status: 'paid' },
    { code: 'Jul', name: 'Juli', status: 'paid' },
    { code: 'Agu', name: 'Agustus', status: currentUser?.username === 'warga_b07' ? 'unpaid' : 'paid' },
    { code: 'Sep', name: 'September', status: 'pending' },
    { code: 'Okt', name: 'Oktober', status: 'pending' },
    { code: 'Nov', name: 'November', status: 'pending' },
    { code: 'Des', name: 'Desember', status: 'pending' },
  ];

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/payments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: currentUser?.propertyId || 'prop-a-17',
          billingPeriodId: 'period-2026-08',
          amount: 750000,
          method: 'TRANSFER',
          reference: `TRX-${Date.now().toString().slice(-6)}`,
          notes: 'Konfirmasi pembayaran via Portal Warga Mobile',
        })
      });
      setPaymentSuccess(true);
      setTimeout(() => {
        setPaymentSuccess(false);
        setShowPaymentModal(false);
      }, 1500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compTitle || !compDesc) return;
    try {
      await fetch('/api/complaints/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: currentUser?.propertyId || 'prop-a-17',
          title: compTitle,
          description: compDesc,
          category: compCategory,
          location: compLocation || 'Sekitar Rumah',
          priority: 'MEDIUM',
        })
      });
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
    try {
      await fetch('/api/vehicles/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: currentUser?.propertyId || 'prop-a-17',
          plateNumber: vehPlate,
          type: vehType,
          brand: vehBrand,
          model: vehModel,
          color: vehColor || 'Hitam',
        })
      });
      setVehicles([...vehicles, {
        id: `veh-${Date.now()}`,
        plateNumber: vehPlate.toUpperCase(),
        type: vehType,
        brand: vehBrand,
        model: vehModel,
        color: vehColor || 'Hitam',
        year: '2023',
        rfidStatus: 'AKTIF',
      }]);
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
    try {
      await fetch('/api/properties/occupants/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: currentUser?.propertyId || 'prop-a-17',
          fullName: newOccName,
          relation: newOccRelation,
          idCardNumber: newOccIdCard,
          phone: newOccPhone,
          isEmergencyContact: newOccEmergency,
        })
      });
      setOccupants([...occupants, {
        id: `occ-${Date.now()}`,
        fullName: newOccName,
        relation: newOccRelation === 'KEPALA_KELUARGA' ? 'Kepala Keluarga' : newOccRelation === 'ISTRI' ? 'Istri' : newOccRelation === 'ANAK' ? 'Anak' : newOccRelation === 'ART_SUPIR' ? 'ART / Supir' : 'Anggota Keluarga',
        idCardNumber: newOccIdCard || '3171xxxxxxxx0005',
        phone: newOccPhone || '-',
        isEmergencyContact: newOccEmergency,
        birthDate: '01 Jan 2000',
      }]);
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
    setOccupants(occupants.filter(o => o.id !== id));
  };

  const handleAddPermit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!permitContractor || !permitDesc) return;
    try {
      await fetch('/api/properties/permits/create', {
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
        })
      });
      setPermits([
        {
          id: `PERMIT-${Date.now().toString().slice(-4)}`,
          workType: permitWorkType,
          contractorName: permitContractor,
          workersCount: Number(permitWorkers),
          startDate: permitStart,
          endDate: permitEnd,
          status: 'APPROVED',
          description: permitDesc,
        },
        ...permits,
      ]);
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
      await fetch('/api/properties/update', {
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
        })
      });
      setShowEditSpecsModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-start antialiased">
      {/* Real Production Web Application Top Bar */}
      <header className="w-full bg-surface border-b border-border sticky top-0 z-30 shadow-xs backdrop-blur-md bg-surface/90">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 shadow-xs">
              <Sparkles className="w-4 h-4 text-primary-600" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-ink flex items-center gap-1.5">
                Warga<span className="text-primary-600">Hub</span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-md border border-emerald-200 uppercase">
                  Portal Warga
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/rekap-iuran"
              className="text-xs font-semibold text-ink-muted hover:text-ink px-2.5 py-1 rounded-lg hover:bg-canvas transition-colors hidden sm:inline-flex items-center gap-1"
            >
              Rekap Iuran
            </a>
            <a
              href="/transparency"
              className="text-xs font-semibold text-ink-muted hover:text-ink px-2.5 py-1 rounded-lg hover:bg-canvas transition-colors hidden sm:inline-flex items-center gap-1"
            >
              Transparansi Kas
            </a>
            {isAdminUser && (
              <a
                href="/admin"
                className="text-xs font-bold text-primary-700 hover:text-primary-800 px-3 py-1.5 rounded-xl bg-primary-50 hover:bg-primary-100 transition-colors flex items-center gap-1 border border-primary-200"
              >
                Admin Dashboard
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            <button
              onClick={() => setActiveTab('akun')}
              className="w-8 h-8 rounded-full overflow-hidden bg-primary-600 text-white font-extrabold text-xs flex items-center justify-center border border-primary-400 shrink-0 hover:ring-2 hover:ring-primary-500 transition-all ml-1 uppercase"
            >
              {getInitials(currentUser?.fullName || currentUser?.name)}
            </button>
          </div>
        </div>
      </header>

      {/* Main Production Application Body */}
      <main className="w-full max-w-2xl mx-auto bg-surface sm:border-x border-border shadow-xs pb-24 min-h-[calc(100vh-3.5rem)] flex flex-col justify-between">
        <div className="flex-1">
          {/* ================= TAB 1: BERANDA ================= */}
          {activeTab === 'beranda' && (
            <div className="p-5 sm:p-6 space-y-5 animate-in fade-in duration-150">
              {/* Greeting & Dynamic Title */}
              <div>
                <div className="flex items-center gap-1.5 text-primary-700 font-bold text-[11px] mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{communityName}</span>
                </div>
                <h2 className="text-2xl font-black tracking-tight text-ink">
                  Halo, {currentUser?.fullName || currentUser?.name || 'Warga'} 👋
                </h2>
                <p className="text-xs text-ink-muted mt-0.5">
                  {residentSubtitle}
                </p>
              </div>

              {/* Quick House Card */}
              <button
                onClick={() => setActiveTab('rumah')}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-primary-900 to-slate-900 text-white shadow-card hover:shadow-md transition-all text-left group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center text-primary-300 font-bold">
                    <Home className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-extrabold text-primary-300 tracking-wider">Unit Hunian Saya</span>
                    <p className="text-base font-black tracking-tight">Rumah {currentUser?.propertyCode || 'A-17'}</p>
                    <span className="text-[10px] text-white/70">{buildingType} • {occupants.length} Jiwa</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-primary-200 font-bold group-hover:translate-x-1 transition-transform">
                  <span>Detail Rumah</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>

              {/* Status Iuran Aktif Card */}
              <div className="p-4 rounded-2xl bg-surface border border-border shadow-card flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold border border-emerald-200">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-ink">Iuran Agustus 2026</p>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                        Lunas
                      </span>
                    </div>
                    <p className="text-xs font-black text-primary-700 mt-0.5 tabular-nums">
                      {formatRupiah(monthlyFeeRate)}
                    </p>
                    <p className="text-[10px] text-ink-muted mt-0.5">
                      Terverifikasi otomatis via Transfer Bank BCA
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedReceipt({
                    invoiceNumber: 'INV-202608-A17',
                    periodName: 'Agustus 2026',
                    propertyCode: currentUser?.propertyCode || 'A-17',
                    residentName: currentUser?.fullName || currentUser?.name || 'Warga',
                    amount: monthlyFeeRate,
                    paidAt: '20 Agustus 2026, 10:21 WIB',
                    paymentMethod: 'Transfer Bank BCA',
                    referenceNumber: 'TRX-BCA-A17',
                  })}
                  className="px-3 py-1.5 bg-canvas hover:bg-surface border border-border rounded-xl text-xs font-bold text-ink hover:text-primary-700 transition-colors shrink-0 shadow-2xs flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5 text-primary-600" />
                  <span>Kuitansi</span>
                </button>
              </div>

              {/* 6 Quick Service Shortcuts Grid */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-ink">Layanan Warga Cepat</h3>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('iuran')}
                    className="p-3 bg-canvas hover:bg-surface rounded-2xl border border-border/80 hover:border-primary-400 hover:shadow-xs transition-all flex flex-col items-center text-center gap-1.5"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-ink">Bayar Iuran</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('info');
                      setInfoSubTab('facilities');
                    }}
                    className="p-3 bg-canvas hover:bg-surface rounded-2xl border border-border/80 hover:border-primary-400 hover:shadow-xs transition-all flex flex-col items-center text-center gap-1.5"
                  >
                    <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-ink">Pesan Sarana</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('rumah');
                      setRumahSubTab('pass');
                    }}
                    className="p-3 bg-canvas hover:bg-surface rounded-2xl border border-border/80 hover:border-primary-400 hover:shadow-xs transition-all flex flex-col items-center text-center gap-1.5"
                  >
                    <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-ink">Pas Tamu QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('info');
                      setInfoSubTab('sanitation');
                    }}
                    className="p-3 bg-canvas hover:bg-surface rounded-2xl border border-border/80 hover:border-primary-400 hover:shadow-xs transition-all flex flex-col items-center text-center gap-1.5"
                  >
                    <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                      <Trash2 className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-ink">Jadwal Sampah</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowVotingModal(true)}
                    className="p-3 bg-canvas hover:bg-surface rounded-2xl border border-border/80 hover:border-primary-400 hover:shadow-xs transition-all flex flex-col items-center text-center gap-1.5"
                  >
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                      <Vote className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-ink">E-Voting Warga</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowComplaintModal(true)}
                    className="p-3 bg-canvas hover:bg-surface rounded-2xl border border-border/80 hover:border-primary-400 hover:shadow-xs transition-all flex flex-col items-center text-center gap-1.5"
                  >
                    <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
                      <Headphones className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-ink">Aduan Warga</span>
                  </button>
                </div>
              </div>

              {/* Status Operasional Komplek Hari Ini */}
              <div className="p-4 rounded-2xl bg-canvas border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-ink flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Status Operasional Komplek Hari Ini
                  </h4>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                    Normal 24 Jam
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {/* Satpam */}
                  <div className="p-2.5 bg-surface rounded-xl border border-border/70 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-ink-muted font-bold block">Pos Satpam Utama</span>
                      <p className="font-bold text-ink">Regu A Siaga</p>
                      <span className="text-[10px] text-ink-muted">{securityPhone}</span>
                    </div>
                    <a
                      href={`tel:${securityPhone.replace(/[^0-9]/g, '')}`}
                      className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200 transition-colors"
                      title="Hubungi Satpam"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Sampah */}
                  <div className="p-2.5 bg-surface rounded-xl border border-border/70 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-ink-muted font-bold block">Tim Kebersihan</span>
                      <p className="font-bold text-ink">Viar Tossa 01 & 02</p>
                      <span className="text-[10px] text-teal-700 font-bold">{wasteOrgDays} ({wasteHours})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('info');
                        setInfoSubTab('sanitation');
                      }}
                      className="p-2 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-xl border border-teal-200 transition-colors"
                      title="Detail Jadwal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Ringkasan Kas & Pengumuman */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-ink">Pengumuman & Agenda Terkini</h3>
                  <button onClick={() => setActiveTab('info')} className="text-[11px] font-semibold text-primary-600 hover:underline">
                    Lihat Semua
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="p-3 rounded-2xl bg-canvas border border-border flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center shrink-0">
                        <Megaphone className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-ink leading-tight">Kerja Bakti Lingkungan & Taman</p>
                        <p className="text-[10px] text-ink-muted mt-0.5">Minggu, 24 Agustus 2026 • 07:00 WIB</p>
                        <p className="text-[10px] text-primary-700 font-bold">Lapangan Blok A</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-ink-muted shrink-0" />
                  </div>

                  <div className="p-3 rounded-2xl bg-canvas border border-border flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <Wrench className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-ink leading-tight">Perbaikan Pompa Air & Tandon</p>
                        <p className="text-[10px] text-ink-muted mt-0.5">Rabu, 27 Agustus 2026 • 09:00 WIB</p>
                        <p className="text-[10px] text-amber-800 font-bold">Area Rumah Pompa Utama</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-ink-muted shrink-0" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: IURAN SAYA ================= */}
          {activeTab === 'iuran' && (
            <div className="p-5 space-y-5 flex-1 animate-in fade-in duration-150">
              {/* Header */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <button onClick={() => setActiveTab('beranda')} className="p-1 -ml-1 text-ink hover:bg-canvas rounded-full">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h2 className="font-bold text-base text-ink">Iuran & Keuangan Rumah</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedReceipt({
                    invoiceNumber: 'INV-202608-A17',
                    periodName: 'Agustus 2026',
                    propertyCode: currentUser?.propertyCode || 'A-17',
                    residentName: currentUser?.fullName || currentUser?.name || 'Warga',
                    amount: monthlyFeeRate,
                    paidAt: '20 Agustus 2026, 10:21 WIB',
                    paymentMethod: 'Transfer Bank BCA',
                    referenceNumber: 'TRX-BCA-A17',
                  })}
                  className="px-2.5 py-1 bg-surface hover:bg-canvas border border-border text-ink text-xs font-bold rounded-lg flex items-center gap-1 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5 text-primary-600" />
                  <span>Kuitansi</span>
                </button>
              </div>

              {/* Status Iuran 2026 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-ink">Status Iuran Tahun 2026</h3>
                  <div className="flex items-center gap-2.5 text-[10px] text-ink-muted">
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Lunas</span>
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-border-dark" /> Belum</span>
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Terlambat</span>
                  </div>
                </div>

                {/* 12 Months Grid Pills */}
                <div className="grid grid-cols-6 gap-2">
                  {months.map((m) => {
                    const isCurrent = m.code === selectedMonth;
                    const isPaid = m.status === 'paid';
                    return (
                      <button
                        key={m.code}
                        type="button"
                        onClick={() => setSelectedMonth(m.code)}
                        className={`p-2 rounded-xl text-center flex flex-col items-center justify-between border transition-all ${
                          isCurrent
                            ? 'bg-surface border-primary-500 ring-2 ring-primary-500/20 shadow-xs'
                            : 'bg-canvas border-border/70 hover:bg-surface'
                        }`}
                      >
                        <span className="text-[11px] font-semibold text-ink">{m.code}</span>
                        {isPaid ? (
                          <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mt-1">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-border/60 mt-1" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Main Card: Iuran Agustus 2026 */}
              <div className="p-4 rounded-2xl bg-surface border border-border shadow-card space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-ink">Iuran {selectedMonth === 'Agu' ? 'Agustus 2026' : `${selectedMonth} 2026`}</span>
                    <p className="text-[10px] text-ink-muted mt-0.5">Komponen: Sampah, Satpam, Pemeliharaan Fasum</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-xs border border-emerald-200">
                    Lunas
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div>
                    <span className="text-[11px] text-ink-muted">Nominal Tagihan</span>
                    <p className="text-lg font-black text-ink tabular-nums">{formatRupiah(monthlyFeeRate)}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-ink-muted">Jatuh Tempo</span>
                    <p className="text-xs font-semibold text-ink mt-0.5">10 Setiap Bulan</p>
                  </div>
                </div>

                {/* Bank Official Kas Paguyuban Card */}
                <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-900 to-primary-950 text-white space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-primary-200 font-bold uppercase tracking-wider">Rekening Kas Resmi Paguyuban</span>
                    <span className="px-2 py-0.5 bg-white/20 text-white rounded text-[10px] font-mono font-bold">QRIS Ready</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-300">{bankKasName}</p>
                      <p className="text-base font-black font-mono tracking-wider text-emerald-300">{bankKasAcc}</p>
                      <p className="text-[10px] text-slate-300">{bankKasHolder}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(bankKasAcc.replace(/[^0-9]/g, ''));
                        setCopiedAcc(true);
                        setTimeout(() => setCopiedAcc(false), 2000);
                      }}
                      className="px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-xl text-xs font-bold text-white transition-colors flex items-center gap-1.5"
                    >
                      {copiedAcc ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Tersalin!</span>
                        </>
                      ) : (
                        <span>Salin No. Rek</span>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(true)}
                    className="flex-1 py-2.5 px-4 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-surface font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Konfirmasi / Unggah Bukti
                  </button>
                </div>
              </div>

              {/* Riwayat Pembayaran */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-ink">Riwayat Pembayaran Sebelumnya</h3>
                  <span className="text-[11px] text-ink-muted">Tercatat di Buku Kas</span>
                </div>

                <div className="space-y-2">
                  {[
                    { month: 'Juli 2026', date: '18 Jul 2026, 09:14 WIB', amount: monthlyFeeRate },
                    { month: 'Juni 2026', date: '20 Jun 2026, 10:02 WIB', amount: monthlyFeeRate },
                    { month: 'Mei 2026', date: '20 Mei 2026, 09:47 WIB', amount: monthlyFeeRate },
                  ].map((row, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-canvas border border-border flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-ink">{row.month}</p>
                        <p className="text-[10px] text-ink-muted">{row.date}</p>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <span className="text-xs font-semibold text-ink tabular-nums">{formatRupiah(row.amount)}</span>
                        <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold rounded">Lunas</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 3: INFO & LAYANAN WARGA ================= */}
          {activeTab === 'info' && (
            <div className="p-5 space-y-5 flex-1 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <button onClick={() => setActiveTab('beranda')} className="p-1 -ml-1 text-ink hover:bg-canvas rounded-full">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h2 className="font-bold text-base text-ink">Layanan & Agenda Warga</h2>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setShowFacilityModal(true)}
                    className="px-2 py-1 bg-surface hover:bg-canvas border border-border text-ink text-[11px] font-bold rounded-lg flex items-center gap-1 shadow-xs"
                  >
                    <Building2 className="w-3.5 h-3.5 text-primary-700" />
                    Pesan Sarana
                  </button>
                  <button
                    onClick={() => setShowComplaintModal(true)}
                    className="px-2.5 py-1 bg-primary-600 hover:bg-primary-700 text-surface text-[11px] font-bold rounded-lg flex items-center gap-1 shadow-xs"
                  >
                    <MessageSquarePlus className="w-3.5 h-3.5" />
                    Aduan
                  </button>
                </div>
              </div>

              {/* Sub-Navigation Pills for Info Tab */}
              <div className="flex items-center gap-1.5 p-1 bg-canvas rounded-2xl border border-border overflow-x-auto no-scrollbar">
                {[
                  { id: 'announcements', label: 'Pengumuman', icon: Megaphone },
                  { id: 'facilities', label: 'Sarana & Fasum', icon: Building2 },
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
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                        isActive
                          ? 'bg-surface text-primary-700 shadow-xs border border-border'
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
                <div className="space-y-3 animate-in fade-in duration-100">
                  <div className="p-4 rounded-2xl bg-surface border border-border shadow-card space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-primary-100 text-primary-800 text-[10px] font-bold rounded-md">KEGIATAN</span>
                      <span className="text-[10px] text-ink-muted">20 Agustus 2026</span>
                    </div>
                    <h4 className="text-sm font-bold text-ink">Kerja Bakti Lingkungan & Taman</h4>
                    <p className="text-xs text-ink-muted leading-relaxed">
                      Mengundang seluruh warga untuk hadir dalam kegiatan kerja bakti pembersihan saluran air dan taman bersama. Diharapkan membawa peralatan masing-masing.
                    </p>
                    <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-primary-700 font-medium">
                      <span>Minggu, 24 Agu 2026 • 07:00 WIB</span>
                      <span>Lapangan Blok A</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-surface border border-border shadow-card space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-md">MAINTENANCE</span>
                      <span className="text-[10px] text-ink-muted">22 Agustus 2026</span>
                    </div>
                    <h4 className="text-sm font-bold text-ink">Perbaikan Pompa Air & Tandon Utama</h4>
                    <p className="text-xs text-ink-muted leading-relaxed">
                      Akan dilakukan perbaikan dan pengurasan tandon pompa air utama komplek. Pasokan air fasum akan dimatikan sementara.
                    </p>
                    <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-primary-700 font-medium">
                      <span>Rabu, 27 Agu 2026 • 09:00 WIB</span>
                      <span>Area Rumah Pompa</span>
                    </div>
                  </div>

                  {/* E-Voting Banner */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 text-surface shadow-card space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-white/20 text-[10px] font-bold uppercase tracking-wider">
                        Musyawarah Digital
                      </span>
                      <span className="text-[10px] text-emerald-200">1 Rumah = 1 Suara</span>
                    </div>
                    <h4 className="font-bold text-sm">Pemilihan Ketua RW 05 / RT 02 (2026-2029)</h4>
                    <p className="text-[11px] text-surface/80 leading-relaxed">
                      Bilik suara digital telah dibuka. Gunakan hak suara keluarga Anda untuk menentukan kemajuan komplek perumahan.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowVotingModal(true)}
                      className="w-full py-2 bg-surface text-primary-700 hover:bg-canvas font-bold text-xs rounded-xl shadow-xs transition-colors"
                    >
                      Buka Bilik Suara & Berikan Pilihan ➔
                    </button>
                  </div>
                </div>
              )}

              {/* SUBTAB 2: KATALOG SARANA & FASUM */}
              {infoSubTab === 'facilities' && (
                <div className="space-y-3 animate-in fade-in duration-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-ink">Katalog Sarana & Fasilitas Komplek</h4>
                      <p className="text-[10px] text-ink-muted">Peminjaman fasilitas untuk keperluan warga</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowFacilityModal(true)}
                      className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ajukan Sewa</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      { id: 'fac-balai', name: 'Balai Warga Serbaguna', capacity: '150 Orang', fee: 'Gratis untuk Acara Warga', icon: Building2, status: 'Tersedia' },
                      { id: 'fac-tennis', name: 'Lapangan Tenis & Badminton', capacity: '2 Lapangan', fee: 'Gratis (Wajib Booking)', icon: Trophy, status: 'Tersedia' },
                      { id: 'fac-pool', name: 'Kolam Renang Komplek', capacity: '30 Orang', fee: 'Khusus Penghuni', icon: Droplets, status: 'Operasional' },
                      { id: 'fac-mosque', name: 'Masjid Al-Ikhlas', capacity: '200 Jamaah', fee: 'Kegiatan Keagamaan', icon: Home, status: 'Buka' },
                    ].map((fac) => {
                      const Icon = fac.icon || Building2;
                      return (
                        <div key={fac.id} className="p-3.5 rounded-2xl bg-surface border border-border shadow-xs flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-ink">{fac.name}</p>
                              <p className="text-[10px] text-ink-muted">Kapasitas: {fac.capacity} • {fac.fee}</p>
                              <span className="inline-block mt-0.5 px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[9px] font-bold rounded">
                                {fac.status}
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
                            className="px-3 py-1.5 bg-canvas hover:bg-surface border border-border rounded-xl text-xs font-bold text-ink hover:text-primary-700 transition-colors"
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
                  <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-ink flex items-center gap-1.5">
                        <Trash2 className="w-4 h-4 text-teal-600" />
                        Jadwal & Rute Armada Kebersihan Viar Tossa
                      </h4>
                      <span className="px-2 py-0.5 bg-teal-100 text-teal-800 text-[10px] font-bold rounded-full">
                        TPS3R Aktif
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs pt-1">
                      <div className="p-3 bg-canvas rounded-xl border border-border/70 space-y-1">
                        <span className="text-[10px] text-ink-muted font-bold block">Sampah Organik / Basah (Dapur)</span>
                        <p className="font-bold text-ink">{wasteOrgDays}</p>
                        <p className="text-[10px] text-teal-700 font-bold">{wasteHours}</p>
                      </div>

                      <div className="p-3 bg-canvas rounded-xl border border-border/70 space-y-1">
                        <span className="text-[10px] text-ink-muted font-bold block">Sampah Anorganik (Kardus/Plastik)</span>
                        <p className="font-bold text-ink">{wasteInorgDays}</p>
                        <p className="text-[10px] text-teal-700 font-bold">{wasteHours}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-canvas border border-border space-y-2 text-xs">
                    <h4 className="font-bold text-ink">Permintaan Angkut Khusus (Puing / Dahan Pohon)</h4>
                    <p className="text-ink-muted text-[11px]">
                      Untuk sampah dalam volume besar (potongan pohon, sisa renovasi), hubungi Koordinator Kebersihan komplek.
                    </p>
                    <a
                      href={`https://wa.me/6281277778888?text=Halo%20Koordinator%20Kebersihan,%20saya%20warga%20${currentUser?.propertyCode || 'A-17'}%20ingin%20request%20angkut%20sampah%20khusus`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs text-xs mt-1"
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
                      <h4 className="text-xs font-bold text-ink">Layanan Aduan & Keluhan Warga</h4>
                      <p className="text-[10px] text-ink-muted">Sampaikan aduan fasilitas, kebersihan, atau keamanan</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowComplaintModal(true)}
                      className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Buat Aduan</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="p-3.5 rounded-2xl bg-surface border border-border shadow-xs flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                          <Headphones className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-ink">Lampu PJU Padam Depan Rumah C-07</p>
                          <p className="text-[10px] text-ink-muted">Kategori: Fasilitas • Dilaporkan Kemarin</p>
                          <span className="inline-block mt-1 px-2 py-0.5 bg-amber-50 text-amber-800 text-[9px] font-bold rounded">
                            Sedang Dikerjakan Teknisi
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Satpam Hotline */}
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2 text-xs">
                    <h4 className="font-bold text-rose-900 flex items-center gap-1.5">
                      <PhoneCall className="w-4 h-4 text-rose-700" />
                      Panggilan Darurat Satpam 24 Jam
                    </h4>
                    <p className="text-rose-800 text-[11px]">
                      Jika terjadi keadaan darurat keamanan atau medis di lingkungan komplek, segera hubungi Pos Satpam.
                    </p>
                    <a
                      href={`tel:${securityPhone.replace(/[^0-9]/g, '')}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-xs text-xs mt-1"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Telepon Pos Satpam ({securityPhone})</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 4: RUMAH & PENGELOLAAN PROPERTI ================= */}
          {activeTab === 'rumah' && (
            <div className="p-5 sm:p-6 space-y-5 flex-1 animate-in fade-in duration-150">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={() => setActiveTab('beranda')} className="p-1 -ml-1 text-ink hover:bg-canvas rounded-full">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h2 className="font-extrabold text-lg text-ink">Manajemen Rumah</h2>
                    <p className="text-[11px] text-ink-muted">Kelola data hunian, penghuni, kendaraan & izin renovasi</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200 flex items-center gap-1">
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Terverifikasi
                </span>
              </div>

              {/* Main Property Card Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-primary-900 to-slate-900 text-white shadow-md relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4">
                  <Building2 className="w-36 h-36" />
                </div>
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 bg-white/20 backdrop-blur-md rounded-md text-[10px] font-bold tracking-wide uppercase">
                      {(currentUser?.propertyCode || 'A-17').toUpperCase().startsWith('KAV')
                        ? 'Area Kavling'
                        : (currentUser?.propertyCode || 'A-17').toUpperCase().startsWith('SW')
                        ? 'Jl. Sariwangi Indah'
                        : `Blok ${(currentUser?.propertyCode || 'A-17').split('-')[0] || 'A'}`} • RT 02 / RW 05
                    </span>
                    <span className="text-[11px] text-primary-200 font-medium">Komplek Taman Sejahtera</span>
                  </div>
                  <div>
                    <span className="text-xs text-primary-200">Nomor Unit Hunian:</span>
                    <h3 className="text-2xl font-black tracking-tight">Rumah {currentUser?.propertyCode || 'A-17'}</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/15 text-xs">
                    <div>
                      <span className="text-[10px] text-primary-200">Tipe:</span>
                      <p className="font-bold">{buildingType}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-primary-200">Penghuni:</span>
                      <p className="font-bold">{occupants.length} Jiwa</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-primary-200">Kendaraan:</span>
                      <p className="font-bold">{vehicles.length} Unit</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5-SubTab Navigation Pill */}
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
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                        isActive
                          ? 'bg-surface text-primary-700 shadow-xs border border-border'
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
                  <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-ink flex items-center gap-1.5">
                        <Home className="w-4 h-4 text-primary-600" />
                        Data Teknis & Utilitas Rumah
                      </h4>
                      <button
                        type="button"
                        onClick={() => setShowEditSpecsModal(true)}
                        className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit Data
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                      <div className="p-3 rounded-xl bg-canvas border border-border/70 space-y-1">
                        <span className="text-[10px] text-ink-muted flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-primary-600" /> Luas Tanah & Bangunan
                        </span>
                        <p className="font-bold text-ink">{landArea} m² / {buildingArea} m²</p>
                      </div>

                      <div className="p-3 rounded-xl bg-canvas border border-border/70 space-y-1">
                        <span className="text-[10px] text-ink-muted flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-600" /> Daya Listrik PLN
                        </span>
                        <p className="font-bold text-ink">{plnCapacity}</p>
                      </div>

                      <div className="p-3 rounded-xl bg-canvas border border-border/70 space-y-1">
                        <span className="text-[10px] text-ink-muted flex items-center gap-1">
                          <Droplets className="w-3 h-3 text-sky-600" /> No. Meter Air PAM
                        </span>
                        <p className="font-bold text-ink font-mono">{pamMeterNo}</p>
                      </div>

                      <div className="p-3 rounded-xl bg-canvas border border-border/70 space-y-1">
                        <span className="text-[10px] text-ink-muted flex items-center gap-1">
                          <BadgeCheck className="w-3 h-3 text-emerald-600" /> Status Kepemilikan
                        </span>
                        <p className="font-bold text-emerald-700">{occupancyStatus}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs space-y-2">
                    <h4 className="text-xs font-bold text-ink">Kepala Rumah Tangga</h4>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-canvas border border-border/70">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-800 font-extrabold flex items-center justify-center text-sm uppercase">
                          {getInitials(currentUser?.fullName || currentUser?.name)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-ink">{currentUser?.fullName || currentUser?.name || 'Kepala Keluarga'}</p>
                          <p className="text-[10px] text-ink-muted font-mono">NIK: 3171091203850001 • HP: 0812-3456-7890</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 bg-primary-50 text-primary-700 text-[10px] font-bold rounded-md">
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
                      <h4 className="text-xs font-bold text-ink">Daftar Penghuni & Keluarga ({occupants.length} Jiwa)</h4>
                      <p className="text-[10px] text-ink-muted">Terdaftar di database RT 02 / RW 05</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddOccupantModal(true)}
                      className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Tambah Anggota
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {occupants.map((occ) => (
                      <div key={occ.id} className="p-3.5 rounded-2xl bg-surface border border-border shadow-xs flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary-50 text-primary-700 font-bold text-xs flex items-center justify-center border border-primary-200 uppercase">
                            {getInitials(occ.fullName)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold text-ink">{occ.fullName}</p>
                              {occ.isEmergencyContact && (
                                <span className="px-1.5 py-0.5 bg-rose-50 text-rose-700 text-[9px] font-bold rounded-md border border-rose-200">
                                  Kontak Darurat
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-ink-muted">{occ.relation} • {occ.phone}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-ink-muted hidden sm:inline">
                            {occ.idCardNumber}
                          </span>
                          {occ.relation !== 'Kepala Keluarga' && (
                            <button
                              type="button"
                              onClick={() => handleDeleteOccupant(occ.id)}
                              className="p-1.5 text-ink-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

              {/* SUBTAB 3: KENDARAAN & STIKER PAS GERBANG */}
              {rumahSubTab === 'vehicles' && (
                <div className="space-y-4 animate-in fade-in duration-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-ink">Kendaraan Terdaftar ({vehicles.length} Unit)</h4>
                      <p className="text-[10px] text-ink-muted">Akses palang otomatis RFID & CCTV Pos Satpam</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowVehicleModal(true)}
                      className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Tambah Kendaraan
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {vehicles.map((v) => (
                      <div key={v.id} className="p-3.5 rounded-2xl bg-surface border border-border shadow-xs flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary-50 border border-primary-200 flex items-center justify-center text-primary-600">
                            {v.type === 'Mobil' ? <Car className="w-5 h-5" /> : <Bike className="w-5 h-5" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-mono text-sm font-black text-ink">{v.plateNumber}</p>
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-md border border-emerald-200">
                                RFID AKTIF
                              </span>
                            </div>
                            <p className="text-[11px] text-ink-muted">{v.type} • {v.brand} {v.model} • {v.color}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-amber-700" />
                      Ketentuan Parkir & Stiker RFID
                    </p>
                    <p className="text-[11px] text-amber-800">
                      Maksimal 2 mobil dan 3 motor per hunian. Kendaraan terdaftar otomatis membuka barrier gate pos 1 tanpa perlu berhenti membuka kaca.
                    </p>
                  </div>
                </div>
              )}

              {/* SUBTAB 4: IZIN RENOVASI & TUKANG */}
              {rumahSubTab === 'permits' && (
                <div className="space-y-4 animate-in fade-in duration-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-ink">Izin Renovasi & Pekerja Bangunan</h4>
                      <p className="text-[10px] text-ink-muted">Wajib diajukan sebelum memulai aktivitas tukang</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddPermitModal(true)}
                      className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Ajukan Izin
                    </button>
                  </div>

                  <div className="space-y-3">
                    {permits.map((p) => (
                      <div key={p.id} className="p-4 rounded-2xl bg-surface border border-border shadow-xs space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md border border-primary-200">
                            {p.id}
                          </span>
                          <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-md border border-emerald-200">
                            DISETUJUI / AKTIF
                          </span>
                        </div>
                        <div>
                          <h5 className="text-sm font-bold text-ink">{p.workType}</h5>
                          <p className="text-xs text-ink-muted mt-0.5">{p.description}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border text-[11px]">
                          <div>
                            <span className="text-ink-muted">Mandor / Pelaksana:</span>
                            <p className="font-semibold text-ink">{p.contractorName}</p>
                          </div>
                          <div>
                            <span className="text-ink-muted">Masa Pengerjaan:</span>
                            <p className="font-semibold text-ink">{p.startDate} s/d {p.endDate} ({p.workersCount} Tukang)</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                    <p className="font-bold flex items-center gap-1.5 text-slate-900">
                      <Hammer className="w-4 h-4 text-slate-700" />
                      Aturan Jam Kerja Renovasi
                    </p>
                    <p className="text-[11px] text-slate-600">
                      Senin – Sabtu: 08:00 – 17:00 WIB. Hari Minggu dan Libur Nasional dilarang melakukan pekerjaan yang menimbulkan kebisingan.
                    </p>
                  </div>
                </div>
              )}

              {/* SUBTAB 5: DIGITAL HOUSE PASS QR */}
              {rumahSubTab === 'pass' && (
                <div className="space-y-4 animate-in fade-in duration-100">
                  <div className="p-6 rounded-3xl bg-surface border border-border shadow-card text-center space-y-4">
                    <div className="inline-block p-3 rounded-2xl bg-primary-50 border border-primary-200 text-primary-700">
                      <QrCode className="w-32 h-32 mx-auto" />
                    </div>
                    <div>
                      <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-md border border-emerald-200">
                        STATUS: TERVERIFIKASI
                      </span>
                      <h3 className="text-xl font-black text-ink mt-2">Rumah {currentUser?.propertyCode || 'A-17'}</h3>
                      <p className="text-xs text-ink-muted">Komplek Taman Sejahtera • RT 02 / RW 05</p>
                      <p className="text-[11px] font-mono text-ink-muted mt-1">ID: PROP-A17-2026-BCA88</p>
                    </div>

                    <div className="p-3 rounded-xl bg-canvas border border-border text-xs text-left space-y-1.5">
                      <p className="font-bold text-ink">Kegunaan Pas Digital:</p>
                      <p className="text-[11px] text-ink-muted">1. Tunjukkan ke satpam pos gerbang saat verifikasi tamu keluarga.</p>
                      <p className="text-[11px] text-ink-muted">2. Konfirmasi penerimaan paket kiriman logistik/kurir.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 5: AKUN ================= */}
          {activeTab === 'akun' && (
            <div className="p-5 space-y-5 flex-1 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pt-2">
                <h2 className="font-bold text-base text-ink">Profil & Layanan Pengurus</h2>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 font-bold px-2 py-0.5 rounded-full">
                  Akun Warga Terdaftar
                </span>
              </div>

              {/* User Profile Card */}
              <div className="p-4 rounded-2xl bg-surface border border-border shadow-card flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 text-white font-black text-lg flex items-center justify-center border-2 border-primary-200 uppercase tracking-wider shrink-0 shadow-sm">
                  {getInitials(currentUser?.fullName || currentUser?.name)}
                </div>
                <div>
                  <h3 className="font-bold text-base text-ink">{currentUser?.fullName || currentUser?.name || 'Warga Komplek'}</h3>
                  <p className="text-xs text-ink-muted">{currentUser?.email || 'warga@wargahub.id'}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="px-2 py-0.5 bg-primary-100 text-primary-800 text-[10px] font-bold rounded">
                      Rumah {currentUser?.propertyCode || 'A-17'}
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                      Kepala Keluarga
                    </span>
                  </div>
                </div>
              </div>

              {/* Susunan Pengurus & Kontak Hotline */}
              <div className="p-4 rounded-2xl bg-surface border border-border shadow-card space-y-3">
                <div className="flex items-center justify-between border-b border-border/80 pb-2">
                  <h4 className="text-xs font-bold text-ink flex items-center gap-1.5">
                    <PhoneCall className="w-4 h-4 text-emerald-600" />
                    Susunan Pengurus & Kontak Penting
                  </h4>
                  <span className="text-[10px] text-ink-muted">Komplek Taman Sejahtera</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-canvas rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-ink-muted font-bold block">Ketua RW 05 / RT 02</span>
                      <p className="font-bold text-ink">{rwHeadName}</p>
                      <span className="text-[10px] text-ink-muted">{rwHeadPhone}</span>
                    </div>
                    <a
                      href={`https://wa.me/${rwHeadPhone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px] transition-colors"
                    >
                      WhatsApp
                    </a>
                  </div>

                  <div className="p-2.5 bg-canvas rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-ink-muted font-bold block">Pos Satpam 24 Jam (Gerbang 1)</span>
                      <p className="font-bold text-ink">Regu Jaga Satpam Utama</p>
                      <span className="text-[10px] text-ink-muted">{securityPhone}</span>
                    </div>
                    <a
                      href={`tel:${securityPhone.replace(/[^0-9]/g, '')}`}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[10px] transition-colors"
                    >
                      Telepon
                    </a>
                  </div>

                  <div className="p-2.5 bg-canvas rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-ink-muted font-bold block">Koordinator Kebersihan & Viar Tossa</span>
                      <p className="font-bold text-ink">Bpk. Sugeng (Tim TPS3R)</p>
                      <span className="text-[10px] text-teal-700 font-bold">{wasteOrgDays}</span>
                    </div>
                    <a
                      href="https://wa.me/6281277778888"
                      target="_blank"
                      className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-[10px] transition-colors"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>

              {/* Dokumen Resmi Lingkungan */}
              <div className="p-4 rounded-2xl bg-surface border border-border shadow-card space-y-3">
                <div className="flex items-center justify-between border-b border-border/80 pb-2">
                  <h4 className="text-xs font-bold text-ink flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-primary-600" />
                    Arsip & Dokumen Resmi Lingkungan
                  </h4>
                  <span className="text-[10px] text-primary-700 font-bold">3 Dokumen</span>
                </div>

                <div className="space-y-2">
                  {[
                    { title: 'Tata Tertib Komplek & Parkir 2026', size: '1.2 MB', cat: 'TATA TERTIB' },
                    { title: 'Surat Edaran Jadwal Ronda & Iuran IPL', size: '450 KB', cat: 'SURAT EDARAN' },
                    { title: 'Laporan Keuangan Kas Semester 1 2026', size: '3.4 MB', cat: 'LAPORAN' },
                  ].map((doc, idx) => (
                    <div key={idx} className="p-2.5 bg-canvas rounded-xl flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-ink">{doc.title}</p>
                        <span className="text-[10px] text-ink-muted">{doc.cat} • {doc.size}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const content = `DOKUMEN RESMI WARGAHUB\n=======================\nJudul: ${doc.title}\nKategori: ${doc.cat}\nUkuran: ${doc.size}\n\nDokumen resmi terverifikasi untuk warga Komplek Taman Sejahtera.`;
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
                        className="p-1.5 bg-surface hover:bg-primary-50 text-primary-700 rounded-lg border border-border"
                        title="Unduh Berkas"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tautan Tambahan */}
              <div className="space-y-2">
                {isAdminUser && (
                  <a
                    href="/admin"
                    className="w-full py-2.5 px-4 bg-primary-50 hover:bg-primary-100 border border-primary-200 text-primary-800 font-bold text-xs rounded-xl flex items-center justify-between transition-colors"
                  >
                    <span>Buka Dashboard Pengurus Komplek</span>
                    <ChevronRight className="w-4 h-4 text-primary-600" />
                  </a>
                )}
                <a
                  href="/rekap-iuran"
                  className="w-full py-2.5 px-4 bg-surface hover:bg-canvas border border-border text-ink font-semibold text-xs rounded-xl flex items-center justify-between transition-colors"
                >
                  <span>Rekapitulasi Iuran Warga (Bulan Aktif)</span>
                  <ChevronRight className="w-4 h-4 text-ink-muted" />
                </a>
                <a
                  href="/transparency"
                  className="w-full py-2.5 px-4 bg-surface hover:bg-canvas border border-border text-ink font-semibold text-xs rounded-xl flex items-center justify-between transition-colors"
                >
                  <span>Buka Laporan Transparansi Kas Paguyuban</span>
                  <ChevronRight className="w-4 h-4 text-ink-muted" />
                </a>
                <button
                  type="button"
                  onClick={async () => {
                    await fetch('/api/auth/logout', { method: 'POST' });
                    window.location.href = '/';
                  }}
                  className="w-full py-2.5 px-4 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-semibold text-xs rounded-xl flex items-center justify-between transition-colors mt-2"
                >
                  <span>Keluar dari Akun (Logout)</span>
                  <ChevronRight className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          )}

          {/* ================= BOTTOM NAVIGATION BAR ================= */}
          <div className="fixed bottom-0 left-0 right-0 z-30 bg-surface/95 backdrop-blur-md border-t border-border shadow-lg">
            <div className="max-w-2xl mx-auto h-16 flex items-center justify-around px-2 select-none">
              <button
                onClick={() => setActiveTab('beranda')}
                className={`flex flex-col items-center gap-1 transition-colors ${
                  activeTab === 'beranda' ? 'text-primary-600 font-bold' : 'text-ink-muted hover:text-ink'
                }`}
              >
                <Home className="w-5 h-5" />
                <span className="text-[10px]">Beranda</span>
              </button>

              <button
                onClick={() => setActiveTab('iuran')}
                className={`flex flex-col items-center gap-1 transition-colors ${
                  activeTab === 'iuran' ? 'text-primary-600 font-bold' : 'text-ink-muted hover:text-ink'
                }`}
              >
                <Receipt className="w-5 h-5" />
                <span className="text-[10px]">Iuran</span>
              </button>

              <button
                onClick={() => setActiveTab('info')}
                className={`flex flex-col items-center gap-1 transition-colors ${
                  activeTab === 'info' ? 'text-primary-600 font-bold' : 'text-ink-muted hover:text-ink'
                }`}
              >
                <Megaphone className="w-5 h-5" />
                <span className="text-[10px]">Info</span>
              </button>

              <button
                onClick={() => setActiveTab('rumah')}
                className={`flex flex-col items-center gap-1 transition-colors ${
                  activeTab === 'rumah' ? 'text-primary-600 font-bold' : 'text-ink-muted hover:text-ink'
                }`}
              >
                <Home className="w-5 h-5" />
                <span className="text-[10px]">Rumah</span>
              </button>

              <button
                onClick={() => setActiveTab('akun')}
                className={`flex flex-col items-center gap-1 transition-colors ${
                  activeTab === 'akun' ? 'text-primary-600 font-bold' : 'text-ink-muted hover:text-ink'
                }`}
              >
                <User className="w-5 h-5" />
                <span className="text-[10px]">Akun</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Payment Confirmation Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-2xl max-w-sm w-full p-6 border border-border shadow-modal space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-sm text-ink">Konfirmasi Pembayaran Iuran</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            {paymentSuccess ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <p className="font-bold text-sm text-ink">Bukti Pembayaran Terkirim!</p>
                <p className="text-xs text-ink-muted">Bendahara akan segera memverifikasi transaksi Anda.</p>
              </div>
            ) : (
              <form onSubmit={handleConfirmPayment} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-semibold text-ink block mb-1">Rumah / Unit</label>
                  <input
                    type="text"
                    disabled
                    value={`Rumah ${currentUser?.propertyCode || 'A-17'}`}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  />
                </div>
                <div>
                  <label className="font-semibold text-ink block mb-1">Jumlah Pembayaran</label>
                  <input
                    type="text"
                    disabled
                    value="Rp 750.000"
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink tabular-nums"
                  />
                </div>
                <div>
                  <label className="font-semibold text-ink block mb-1">Metode Transfer</label>
                  <select className="w-full p-2.5 bg-surface border border-border rounded-xl text-ink font-medium">
                    <option>BCA Virtual Account / Transfer</option>
                    <option>Mandiri Transfer</option>
                    <option>QRIS WargaHub</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-ink block mb-1">Unggah Bukti Transfer</label>
                  <div className="p-4 border-2 border-dashed border-border hover:border-primary-500 rounded-xl text-center cursor-pointer bg-canvas/40">
                    <Upload className="w-5 h-5 text-ink-muted mx-auto mb-1" />
                    <span className="text-[11px] text-ink-muted">Klik untuk pilih gambar bukti transfer</span>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 py-2 rounded-xl border border-border text-ink font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-surface font-semibold shadow-xs"
                  >
                    Kirim Bukti
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Complaint Modal */}
      {showComplaintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-2xl max-w-sm w-full p-6 border border-border shadow-modal space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-sm text-ink">Laporkan Aduan / Masalah Warga</h3>
              <button onClick={() => setShowComplaintModal(false)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            {compSuccess ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <p className="font-bold text-sm text-ink">Laporan Berhasil Diajukan!</p>
                <p className="text-xs text-ink-muted">Pengurus komplek & satpam akan segera menindaklanjuti.</p>
              </div>
            ) : (
              <form onSubmit={handleCreateComplaint} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-ink block mb-1">Kategori Masalah</label>
                  <select
                    value={compCategory}
                    onChange={(e) => setCompCategory(e.target.value)}
                    className="w-full p-2.5 bg-surface border border-border rounded-xl font-medium text-ink"
                  >
                    <option value="FASILITAS">Fasilitas Umum & PJU</option>
                    <option value="KEBERSIHAN">Kebersihan & Sampah</option>
                    <option value="KETERTIBAN">Ketertiban & Kebisingan</option>
                    <option value="KEAMANAN">Keamanan & Parkir Liar</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-ink block mb-1">Judul Laporan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Lampu jalan di depan rumah mati"
                    value={compTitle}
                    onChange={(e) => setCompTitle(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                  />
                </div>

                <div>
                  <label className="font-semibold text-ink block mb-1">Lokasi Kejadian</label>
                  <input
                    type="text"
                    placeholder="Contoh: Depan Rumah A-17"
                    value={compLocation}
                    onChange={(e) => setCompLocation(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                  />
                </div>

                <div>
                  <label className="font-semibold text-ink block mb-1">Deskripsi Detail</label>
                  <textarea
                    rows={3}
                    placeholder="Jelaskan kendala yang dialami secara singkat..."
                    value={compDesc}
                    onChange={(e) => setCompDesc(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowComplaintModal(false)}
                    className="flex-1 py-2 rounded-xl border border-border text-ink font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-surface font-semibold shadow-xs"
                  >
                    Kirim Aduan
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Vehicle Registration Modal */}
      {showVehicleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-2xl max-w-sm w-full p-6 border border-border shadow-modal space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-sm text-ink">Daftarkan Kendaraan Baru</h3>
              <button onClick={() => setShowVehicleModal(false)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            <form onSubmit={handleCreateVehicle} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-ink block mb-1">Jenis</label>
                  <select
                    value={vehType}
                    onChange={(e) => setVehType(e.target.value)}
                    className="w-full p-2.5 bg-surface border border-border rounded-xl font-medium text-ink"
                  >
                    <option value="Mobil">Mobil</option>
                    <option value="Motor">Motor</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-ink block mb-1">Nomor Polisi (Plat)</label>
                  <input
                    type="text"
                    placeholder="B 1234 XYZ"
                    value={vehPlate}
                    onChange={(e) => setVehPlate(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono uppercase text-ink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-ink block mb-1">Merk</label>
                  <input
                    type="text"
                    placeholder="Toyota / Honda"
                    value={vehBrand}
                    onChange={(e) => setVehBrand(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                  />
                </div>
                <div>
                  <label className="font-semibold text-ink block mb-1">Model / Tipe</label>
                  <input
                    type="text"
                    placeholder="Innova / PCX"
                    value={vehModel}
                    onChange={(e) => setVehModel(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-ink block mb-1">Warna Kendaraan</label>
                <input
                  type="text"
                  placeholder="Hitam Metalik / Putih"
                  value={vehColor}
                  onChange={(e) => setVehColor(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowVehicleModal(false)}
                  className="flex-1 py-2 rounded-xl border border-border text-ink font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-surface font-semibold shadow-xs"
                >
                  Simpan Kendaraan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Facility Booking Modal */}
      {showFacilityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-2xl max-w-sm w-full p-6 border border-border shadow-modal space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-sm text-ink">Pesan / Sewa Fasilitas Warga</h3>
              <button onClick={() => setShowFacilityModal(false)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            {facSuccess ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <p className="font-bold text-sm text-ink">Permohonan Terkirim!</p>
                <p className="text-xs text-ink-muted">Pengurus komplek akan segera memverifikasi ketersediaan jadwal sarana.</p>
              </div>
            ) : (
              <form onSubmit={handleBookFacility} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-ink block mb-1">Pilih Sarana / Fasilitas</label>
                  <select
                    value={facId}
                    onChange={(e) => {
                      setFacId(e.target.value);
                      setFacName(e.target.options[e.target.selectedIndex].text);
                    }}
                    className="w-full p-2.5 bg-surface border border-border rounded-xl font-medium text-ink"
                  >
                    <option value="fac-balai">Balai Warga Serbaguna</option>
                    <option value="fac-lapangan">Lapangan Olahraga & Futsal</option>
                    <option value="fac-taman">Taman & Area Bermain Blok A</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-ink block mb-1">Tanggal Pemakaian</label>
                  <input
                    type="date"
                    value={facDate}
                    onChange={(e) => setFacDate(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-ink block mb-1">Jam Mulai</label>
                    <input
                      type="time"
                      value={facStart}
                      onChange={(e) => setFacStart(e.target.value)}
                      required
                      className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-ink block mb-1">Jam Selesai</label>
                    <input
                      type="time"
                      value={facEnd}
                      onChange={(e) => setFacEnd(e.target.value)}
                      required
                      className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-ink block mb-1">Keperluan / Nama Acara</label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Arisan warga RT 02 / Latihan bulutangkis keluarga..."
                    value={facPurpose}
                    onChange={(e) => setFacPurpose(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                  />
                </div>

                <div>
                  <label className="font-semibold text-ink block mb-1">No. WhatsApp Pemohon</label>
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
                    className="flex-1 py-2 rounded-xl border border-border text-ink font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-surface font-semibold shadow-xs"
                  >
                    Ajukan Sewa
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Add Occupant Modal */}
      {showAddOccupantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-2xl max-w-sm w-full p-6 border border-border shadow-modal space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-sm text-ink">Tambah Anggota Keluarga / Penghuni</h3>
              <button onClick={() => setShowAddOccupantModal(false)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            <form onSubmit={handleAddOccupant} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-ink block mb-1">Nama Lengkap Sesuai KTP</label>
                <input
                  type="text"
                  placeholder="Contoh: Rian Santoso"
                  value={newOccName}
                  onChange={(e) => setNewOccName(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-ink block mb-1">Hubungan Keluarga</label>
                  <select
                    value={newOccRelation}
                    onChange={(e) => setNewOccRelation(e.target.value)}
                    className="w-full p-2.5 bg-surface border border-border rounded-xl text-ink font-medium"
                  >
                    <option value="ANAK">Anak</option>
                    <option value="ISTRI">Istri</option>
                    <option value="ORANG_TUA">Orang Tua / Mertua</option>
                    <option value="ART_SUPIR">ART / Supir</option>
                    <option value="FAMILY">Keluarga Lain</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-ink block mb-1">Nomor WhatsApp / HP</label>
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
                <label className="font-semibold text-ink block mb-1">Nomor Induk Kependudukan (NIK)</label>
                <input
                  type="text"
                  placeholder="16 Digit NIK"
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
                <label htmlFor="occEmergency" className="text-xs text-ink font-medium cursor-pointer">
                  Jadikan Kontak Darurat Sekunder Rumah
                </label>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddOccupantModal(false)}
                  className="flex-1 py-2 rounded-xl border border-border text-ink font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-surface font-semibold shadow-xs"
                >
                  Simpan Penghuni
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Permit Modal */}
      {showAddPermitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-2xl max-w-sm w-full p-6 border border-border shadow-modal space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-sm text-ink">Pengajuan Izin Renovasi / Pekerja</h3>
              <button onClick={() => setShowAddPermitModal(false)} className="text-ink-muted hover:text-ink">✕</button>
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
                  <label className="font-semibold text-ink block mb-1">Jenis Pekerjaan</label>
                  <select
                    value={permitWorkType}
                    onChange={(e) => setPermitWorkType(e.target.value)}
                    className="w-full p-2.5 bg-surface border border-border rounded-xl text-ink font-medium"
                  >
                    <option value="Pengecatan & Kanopi">Pengecatan & Kanopi</option>
                    <option value="Renovasi Interior">Renovasi Interior / Plafon</option>
                    <option value="Perbaikan Atap / Genteng">Perbaikan Atap & Talang Air</option>
                    <option value="Instalasi Listrik / AC">Instalasi Listrik & Pipa AC</option>
                    <option value="Pekerjaan Taman">Pekerjaan Taman / Lansekap</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-ink block mb-1">Nama Mandor / Penanggung Jawab</label>
                  <input
                    type="text"
                    placeholder="Contoh: Bpk. Sugeng (CV Berkah)"
                    value={permitContractor}
                    onChange={(e) => setPermitContractor(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="font-semibold text-ink block mb-1">Jml Tukang</label>
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
                    <label className="font-semibold text-ink block mb-1">Mulai</label>
                    <input
                      type="date"
                      value={permitStart}
                      onChange={(e) => setPermitStart(e.target.value)}
                      className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-ink block mb-1">Selesai</label>
                    <input
                      type="date"
                      value={permitEnd}
                      onChange={(e) => setPermitEnd(e.target.value)}
                      className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink text-[11px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-ink block mb-1">Deskripsi Ringkas Pekerjaan</label>
                  <textarea
                    rows={2}
                    placeholder="Rincian bagian yang direnovasi..."
                    value={permitDesc}
                    onChange={(e) => setPermitDesc(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddPermitModal(false)}
                    className="flex-1 py-2 rounded-xl border border-border text-ink font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-surface font-semibold shadow-xs"
                  >
                    Terbitkan Izin
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Edit Property Specs Modal */}
      {showEditSpecsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-2xl max-w-sm w-full p-6 border border-border shadow-modal space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-sm text-ink">Perbarui Data Teknis Rumah</h3>
              <button onClick={() => setShowEditSpecsModal(false)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            <form onSubmit={handleUpdateSpecs} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-ink block mb-1">Tipe Bangunan</label>
                  <input
                    type="text"
                    value={buildingType}
                    onChange={(e) => setBuildingType(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink font-medium"
                  />
                </div>
                <div>
                  <label className="font-semibold text-ink block mb-1">Status Hunian</label>
                  <select
                    value={occupancyStatus}
                    onChange={(e) => setOccupancyStatus(e.target.value)}
                    className="w-full p-2.5 bg-surface border border-border rounded-xl text-ink font-medium"
                  >
                    <option value="Dihuni Pemilik">Dihuni Pemilik</option>
                    <option value="Disewa / Kontrak">Disewa / Kontrak</option>
                    <option value="Kosong / Renovasi">Kosong / Renovasi</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-ink block mb-1">Luas Tanah (m²)</label>
                  <input
                    type="number"
                    value={landArea}
                    onChange={(e) => setLandArea(Number(e.target.value))}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-ink block mb-1">Luas Bangunan (m²)</label>
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
                  <label className="font-semibold text-ink block mb-1">Daya Listrik PLN</label>
                  <select
                    value={plnCapacity}
                    onChange={(e) => setPlnCapacity(e.target.value)}
                    className="w-full p-2.5 bg-surface border border-border rounded-xl text-ink font-medium"
                  >
                    <option value="1.300 VA">1.300 VA</option>
                    <option value="2.200 VA">2.200 VA</option>
                    <option value="3.500 VA">3.500 VA</option>
                    <option value="4.400 VA">4.400 VA</option>
                    <option value="5.500 VA">5.500 VA</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-ink block mb-1">No. Meteran PAM</label>
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
                  className="flex-1 py-2 rounded-xl border border-border text-ink font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-surface font-semibold shadow-xs"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Digital Receipt Modal */}
      {selectedReceipt && (
        <ReceiptModal
          isOpen={Boolean(selectedReceipt)}
          onClose={() => setSelectedReceipt(null)}
          data={selectedReceipt}
        />
      )}

      {/* Digital E-Voting Modal */}
      <VotingSectionModal
        isOpen={showVotingModal}
        onClose={() => setShowVotingModal(false)}
        propertyCode={currentUser?.propertyCode || 'A-17'}
        residentName={currentUser?.fullName || currentUser?.name || 'Warga'}
      />

      {/* Floating Warga AI Assistant Widget */}
      <WargaAIChatWidget currentPropertyCode={currentUser?.propertyCode || 'A-17'} />
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
