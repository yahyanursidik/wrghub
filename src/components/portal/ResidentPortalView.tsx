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
} from 'lucide-react';
import { formatRupiah, formatRupiahShort } from '../../lib/format';
import { DEMO_USERS, type UserSession } from '../../types/auth';
import { ReceiptModal } from '../shared/ReceiptModal';
import { WargaAIChatWidget } from '../shared/WargaAIChatWidget';
import { VotingSectionModal } from './VotingSectionModal';

interface ResidentPortalViewProps {
  initialUser?: UserSession;
}

export const ResidentPortalView: React.FC<ResidentPortalViewProps> = ({
  initialUser = DEMO_USERS.warga,
}) => {
  const [activeTab, setActiveTab] = useState<'beranda' | 'iuran' | 'info' | 'rumah' | 'akun'>('beranda');
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('Agu');
  const [currentUser, setCurrentUser] = useState<UserSession>(initialUser);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [showVotingModal, setShowVotingModal] = useState(false);

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
    { id: '1', plateNumber: 'B 1234 ABC', type: 'Mobil', brand: 'Toyota', model: 'Avanza', color: 'Hitam Metalik', year: '2018' },
    { id: '2', plateNumber: 'B 5678 DEF', type: 'Motor', brand: 'Honda', model: 'Vario 160', color: 'Putih Mutiara', year: '2022' },
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
          propertyId: currentUser.propertyId || 'prop-a-17',
          residentName: currentUser.fullName,
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
    { code: 'Agu', name: 'Agustus', status: currentUser.username === 'warga_b07' ? 'unpaid' : 'paid' },
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
          propertyId: currentUser.propertyId || 'prop-a-17',
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
          propertyId: currentUser.propertyId || 'prop-a-17',
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
          propertyId: currentUser.propertyId || 'prop-a-17',
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

  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-start py-4 sm:py-8 px-2 sm:px-4">
      {/* Top Device Switcher Toolbar */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between bg-surface p-2 rounded-2xl border border-border shadow-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsPhoneFrame(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              isPhoneFrame ? 'bg-primary-50 text-primary-700' : 'text-ink-muted hover:text-ink'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Mode HP (Mockup)
          </button>
          <button
            onClick={() => setIsPhoneFrame(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              !isPhoneFrame ? 'bg-primary-50 text-primary-700' : 'text-ink-muted hover:text-ink'
            }`}
          >
            <Monitor className="w-4 h-4" />
            Layar Penuh
          </button>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/admin"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
          >
            Admin Dashboard
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Main Container / Phone Mockup Frame */}
      <div
        className={`w-full bg-surface transition-all duration-300 ${
          isPhoneFrame
            ? 'max-w-[390px] rounded-[44px] shadow-2xl border-[8px] border-ink/90 overflow-hidden ring-1 ring-border'
            : 'max-w-xl rounded-3xl shadow-card border border-border overflow-hidden'
        }`}
      >
        {/* Dynamic Island / Top Notch (when in phone frame) */}
        {isPhoneFrame && (
          <div className="h-7 bg-surface flex items-center justify-between px-7 pt-1 select-none">
            <span className="text-[11px] font-semibold text-ink">9:41</span>
            <div className="w-20 h-4 bg-ink rounded-full" />
            <div className="flex items-center gap-1 text-[11px] font-medium text-ink">
              <span>5G</span>
              <span className="w-4 h-2.5 rounded-xs border border-ink/80 flex items-center p-0.5"><span className="w-full h-full bg-ink rounded-2xs" /></span>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="min-h-[640px] flex flex-col justify-between">
          {/* ================= TAB 1: BERANDA ================= */}
          {activeTab === 'beranda' && (
            <div className="p-5 space-y-5 flex-1 animate-in fade-in duration-150">
              {/* Header */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600">
                    <Sparkles className="w-4 h-4 text-primary-600" />
                  </div>
                  <span className="font-bold text-lg text-ink tracking-tight">Warga<span className="text-primary-600">Hub</span></span>
                </div>
                <button className="relative p-2 text-ink hover:bg-canvas rounded-full">
                  <Bell className="w-5 h-5 text-ink" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-surface" />
                </button>
              </div>

              {/* Greeting */}
              <div>
                <h2 className="text-xl font-bold text-ink">
                  Halo, {currentUser.fullName} 👋
                </h2>
                <p className="text-xs text-ink-muted mt-0.5">
                  Selamat datang di Komplek Taman Sejahtera
                </p>
              </div>

              {/* Quick House Card */}
              <button
                onClick={() => setActiveTab('rumah')}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-canvas border border-border hover:bg-primary-50/40 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-surface border border-border flex items-center justify-center text-primary-600 shadow-xs">
                    <Home className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-ink-muted">Rumah Saya</span>
                    <p className="text-sm font-bold text-ink">Rumah {currentUser.propertyCode || 'A-17'}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-ink-muted" />
              </button>

              {/* Status Iuran Aktif Card */}
              <div className="p-4 rounded-2xl bg-surface border border-border shadow-card flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-ink-muted">Iuran Agustus 2026</p>
                      <p className="text-sm font-bold text-emerald-700">Lunas</p>
                    </div>
                    <span className="text-sm font-bold text-ink tabular-nums">Rp750.000</span>
                  </div>
                  <p className="text-[11px] text-ink-muted mt-1.5">
                    Dibayarkan pada 20 Agu 2026, 10:21 WIB
                  </p>
                </div>
              </div>

              {/* Ringkasan Komplek Mini Grid */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-ink">Ringkasan Komplek</h3>
                  <a href="/transparency" className="text-[11px] font-semibold text-primary-600 hover:underline">
                    Lihat Semua
                  </a>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {/* Saldo Kas */}
                  <div className="p-2.5 rounded-xl bg-canvas border border-border text-center flex flex-col items-center justify-between">
                    <span className="text-[10px] text-ink-muted">Saldo Kas</span>
                    <Wallet className="w-4 h-4 text-primary-600 my-1" />
                    <span className="text-[11px] font-bold text-ink tabular-nums">Rp128,45 jt</span>
                    <span className="text-[9px] text-ink-muted">Per 20 Agu</span>
                  </div>

                  {/* Iuran Lunas */}
                  <div className="p-2.5 rounded-xl bg-canvas border border-border text-center flex flex-col items-center justify-between">
                    <span className="text-[10px] text-ink-muted">Iuran Lunas</span>
                    <div className="w-5 h-5 rounded-full border-2 border-primary-500 text-[10px] font-bold text-primary-600 flex items-center justify-center my-0.5">
                      72%
                    </div>
                    <span className="text-[10px] font-bold text-ink">86/120</span>
                    <span className="text-[9px] text-ink-muted">rumah</span>
                  </div>

                  {/* Transaksi */}
                  <div className="p-2.5 rounded-xl bg-canvas border border-border text-center flex flex-col items-center justify-between">
                    <span className="text-[10px] text-ink-muted">Transaksi</span>
                    <Hourglass className="w-4 h-4 text-amber-600 my-1" />
                    <span className="text-[11px] font-bold text-ink">3</span>
                    <span className="text-[9px] text-amber-700 font-medium">Agu 2026</span>
                  </div>

                  {/* Aduan */}
                  <div className="p-2.5 rounded-xl bg-canvas border border-border text-center flex flex-col items-center justify-between">
                    <span className="text-[10px] text-ink-muted">Aduan</span>
                    <Headphones className="w-4 h-4 text-red-500 my-1" />
                    <span className="text-[11px] font-bold text-ink">4</span>
                    <span className="text-[9px] text-red-700 font-medium">Menunggu</span>
                  </div>
                </div>
              </div>

              {/* Pengumuman Terbaru */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-ink">Pengumuman Terbaru</h3>
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
                        <p className="text-xs font-bold text-ink leading-tight">Kerja Bakti Lingkungan</p>
                        <p className="text-[10px] text-ink-muted mt-0.5">Minggu, 24 Agustus 2026 • 07:00 WIB</p>
                        <p className="text-[10px] text-primary-700">Lapangan Blok A</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-ink-muted shrink-0" />
                  </div>

                  <div className="p-3 rounded-2xl bg-canvas border border-border flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-ink leading-tight">Perbaikan Pompa Air</p>
                        <p className="text-[10px] text-ink-muted mt-0.5">Rabu, 27 Agustus 2026 • 09:00 WIB</p>
                        <p className="text-[10px] text-primary-700">Area Rumah Pompa</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-ink-muted shrink-0" />
                  </div>

                  <div className="p-3 rounded-2xl bg-canvas border border-border flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center shrink-0">
                        <Info className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-ink leading-tight">Pembagian Tempat Sampah Baru</p>
                        <p className="text-[10px] text-ink-muted mt-0.5">Mulai 1 September 2026</p>
                        <p className="text-[10px] text-primary-700">Setiap RT</p>
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
                  <h2 className="font-bold text-base text-ink">Iuran Saya</h2>
                </div>
                <button className="p-2 text-ink hover:bg-canvas rounded-full">
                  <Bell className="w-5 h-5" />
                </button>
              </div>

              {/* Status Iuran 2026 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-ink">Status Iuran 2026</h3>
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
                  <span className="text-sm font-bold text-ink">Iuran Agustus 2026</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-xs border border-emerald-200">
                    Lunas
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div>
                    <span className="text-[11px] text-ink-muted">Nominal</span>
                    <p className="text-base font-bold text-ink tabular-nums">Rp750.000</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-ink-muted">Jatuh Tempo</span>
                    <p className="text-xs font-semibold text-ink mt-0.5">10 Agu 2026</p>
                  </div>
                </div>

                <p className="text-[11px] text-ink-muted">
                  Dibayarkan pada 20 Agu 2026, 10:21 WIB
                </p>

                <button
                  type="button"
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-surface font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Konfirmasi Pembayaran
                </button>
              </div>

              {/* Riwayat Pembayaran */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-ink">Riwayat Pembayaran</h3>
                  <button className="text-[11px] font-semibold text-primary-600 hover:underline">
                    Lihat Semua
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="p-3 rounded-2xl bg-canvas border border-border flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-ink">Juli 2026</p>
                      <p className="text-[10px] text-ink-muted">18 Jul 2026, 09:14 WIB</p>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <span className="text-xs font-semibold text-ink tabular-nums">Rp750.000</span>
                      <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold rounded">Lunas</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-canvas border border-border flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-ink">Juni 2026</p>
                      <p className="text-[10px] text-ink-muted">20 Jun 2026, 10:02 WIB</p>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <span className="text-xs font-semibold text-ink tabular-nums">Rp750.000</span>
                      <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold rounded">Lunas</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-canvas border border-border flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-ink">Mei 2026</p>
                      <p className="text-[10px] text-ink-muted">20 Mei 2026, 09:47 WIB</p>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <span className="text-xs font-semibold text-ink tabular-nums">Rp750.000</span>
                      <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold rounded">Lunas</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedReceipt({
                    invoiceNumber: 'INV-202608-A17',
                    periodName: 'Agustus 2026',
                    propertyCode: currentUser.propertyCode || 'A-17',
                    residentName: currentUser.fullName,
                    amount: 750000,
                    paidAt: '20 Agustus 2026, 10:21 WIB',
                    paymentMethod: 'Transfer Bank BCA',
                    referenceNumber: 'TRX-BCA-A17',
                  })}
                  className="w-full py-2.5 border border-border hover:bg-canvas text-ink text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors mt-2"
                >
                  <Printer className="w-4 h-4 text-primary-600" />
                  Lihat / Cetak Kuitansi Resmi
                </button>
              </div>
            </div>
          )}

          {/* ================= TAB 3: INFO & PENGUMUMAN ================= */}
          {activeTab === 'info' && (
            <div className="p-5 space-y-5 flex-1 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <button onClick={() => setActiveTab('beranda')} className="p-1 -ml-1 text-ink hover:bg-canvas rounded-full">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h2 className="font-bold text-base text-ink">Info & Agenda Warga</h2>
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

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-surface border border-border shadow-card space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-primary-100 text-primary-800 text-[10px] font-bold rounded-md">KEGIATAN</span>
                    <span className="text-[10px] text-ink-muted">20 Agustus 2026</span>
                  </div>
                  <h4 className="text-sm font-bold text-ink">Kerja Bakti Lingkungan</h4>
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
                  <h4 className="text-sm font-bold text-ink">Perbaikan Pompa Air</h4>
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

                {/* Dokumen Resmi Komplek */}
                <div className="p-4 rounded-2xl bg-surface border border-border shadow-card space-y-3">
                  <h4 className="text-xs font-bold text-ink flex items-center justify-between">
                    <span>Arsip & Dokumen Resmi</span>
                    <span className="text-[10px] text-primary-600 font-normal">3 Berkas Tersedia</span>
                  </h4>
                  <div className="space-y-2">
                    {[
                      { title: 'Tata Tertib Warga 2026', size: '1.2 MB', cat: 'TATA TERTIB' },
                      { title: 'Surat Edaran Kerja Bakti & Ronda', size: '450 KB', cat: 'SURAT EDARAN' },
                      { title: 'Laporan Keuangan Semester 1 2026', size: '3.4 MB', cat: 'LAPORAN' },
                    ].map((doc, idx) => (
                      <div key={idx} className="p-2.5 bg-canvas rounded-xl flex items-center justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold text-ink">{doc.title}</p>
                          <span className="text-[10px] text-ink-muted">{doc.cat} • {doc.size}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => alert(`Mengunduh berkas resmi: ${doc.title}`)}
                          className="p-1.5 bg-surface hover:bg-primary-50 text-primary-700 rounded-lg border border-border"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 space-y-3">
                  <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 text-emerald-700" />
                    Kontak Darurat & Keamanan
                  </h4>
                  <div className="space-y-1.5 text-xs text-emerald-800">
                    <p className="flex justify-between"><span>Pos Satpam Utama (24 Jam):</span> <strong className="font-mono">0812-1111-2222</strong></p>
                    <p className="flex justify-between"><span>Ketua RW 05:</span> <strong className="font-mono">0812-3456-7890</strong></p>
                    <p className="flex justify-between"><span>Petugas Sarana:</span> <strong className="font-mono">0813-8888-9999</strong></p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 4: RUMAH & PENGHUNI ================= */}
          {activeTab === 'rumah' && (
            <div className="p-5 space-y-4 flex-1 animate-in fade-in duration-150">
              {/* Header */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <button onClick={() => setActiveTab('beranda')} className="p-1 -ml-1 text-ink hover:bg-canvas rounded-full">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h2 className="font-bold text-base text-ink">Rumah & Penghuni</h2>
                </div>
                <button className="p-2 text-ink hover:bg-canvas rounded-full">
                  <Bell className="w-5 h-5" />
                </button>
              </div>

              {/* Main Unit Card */}
              <div className="p-4 rounded-2xl bg-surface border border-border shadow-card flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600">
                    <Home className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-muted">Unit Terdaftar</span>
                    <h3 className="text-base font-bold text-ink">Rumah {currentUser.propertyCode || 'A-17'}</h3>
                    <p className="text-[11px] text-ink-muted">Blok {currentUser.propertyCode?.split('-')[0] || 'A'} • RT 02 / RW 05</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200">
                  Dihuni
                </span>
              </div>

              {/* Kepala Keluarga */}
              <div className="p-3.5 rounded-2xl bg-surface border border-border shadow-card flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-ink-muted">Kepala Rumah Tangga</span>
                  <p className="text-sm font-bold text-ink">{currentUser.fullName}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-ink-muted" />
              </div>

              {/* Informasi Hunian */}
              <div className="p-3.5 rounded-2xl bg-surface border border-border shadow-card space-y-2">
                <span className="text-xs font-bold text-ink">Informasi Hunian</span>
                <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                  <div>
                    <span className="text-[10px] text-ink-muted">Jumlah Penghuni</span>
                    <p className="font-semibold text-ink flex items-center gap-1.5 mt-0.5">
                      <Users className="w-3.5 h-3.5 text-primary-600" />
                      4 orang
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-muted">Sejak Dihuni</span>
                    <p className="font-semibold text-ink flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-primary-600" />
                      Januari 2020
                    </p>
                  </div>
                </div>
              </div>

              {/* Daftar Penghuni */}
              <div className="p-3.5 rounded-2xl bg-surface border border-border shadow-card space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink">Daftar Penghuni</span>
                  <button className="text-[11px] font-semibold text-primary-600 hover:underline">
                    Kelola
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-canvas border border-border/60 text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-full bg-primary-100 text-primary-800 font-bold text-[10px] flex items-center justify-center">BS</span>
                      <div>
                        <p className="font-bold text-ink">Budi Santoso</p>
                        <p className="text-[10px] text-ink-muted">Kepala Keluarga</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-ink-muted">Lahir: 12 Mar 1985</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-canvas border border-border/60 text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center">SL</span>
                      <div>
                        <p className="font-bold text-ink">Siti Lestari</p>
                        <p className="text-[10px] text-ink-muted">Istri</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-ink-muted">Lahir: 25 Jul 1987</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-canvas border border-border/60 text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] flex items-center justify-center">AS</span>
                      <div>
                        <p className="font-bold text-ink">Alya Santoso</p>
                        <p className="text-[10px] text-ink-muted">Anak</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-ink-muted">Lahir: 14 Mei 2013</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-canvas border border-border/60 text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-full bg-sky-100 text-sky-800 font-bold text-[10px] flex items-center justify-center">DS</span>
                      <div>
                        <p className="font-bold text-ink">Daffa Santoso</p>
                        <p className="text-[10px] text-ink-muted">Anak</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-ink-muted">Lahir: 03 Sep 2017</span>
                  </div>
                </div>
              </div>

              {/* Kendaraan */}
              <div className="p-3.5 rounded-2xl bg-surface border border-border shadow-card space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink">Kendaraan Terdaftar</span>
                  <button
                    type="button"
                    onClick={() => setShowVehicleModal(true)}
                    className="text-[11px] font-bold text-primary-600 hover:underline flex items-center gap-0.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah
                  </button>
                </div>

                <div className="space-y-2">
                  {vehicles.map((v) => (
                    <div key={v.id} className="p-2 rounded-xl bg-canvas border border-border/60 flex items-center gap-3 text-xs">
                      {v.type === 'Mobil' ? (
                        <Car className="w-4 h-4 text-primary-600 shrink-0" />
                      ) : (
                        <Bike className="w-4 h-4 text-primary-600 shrink-0" />
                      )}
                      <div>
                        <p className="font-bold text-ink font-mono">{v.plateNumber}</p>
                        <p className="text-[10px] text-ink-muted">{v.type} • {v.brand} {v.model} • {v.color}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 5: AKUN ================= */}
          {activeTab === 'akun' && (
            <div className="p-5 space-y-5 flex-1 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pt-2">
                <h2 className="font-bold text-base text-ink">Akun Saya</h2>
                <button className="p-2 text-ink hover:bg-canvas rounded-full">
                  <Bell className="w-5 h-5" />
                </button>
              </div>

              {/* User Profile Card */}
              <div className="p-4 rounded-2xl bg-surface border border-border shadow-card flex items-center gap-4">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.fullName}
                  className="w-14 h-14 rounded-full object-cover border-2 border-primary-200"
                />
                <div>
                  <h3 className="font-bold text-base text-ink">{currentUser.fullName}</h3>
                  <p className="text-xs text-ink-muted">{currentUser.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-primary-100 text-primary-800 text-[10px] font-bold rounded">
                    {currentUser.role}
                  </span>
                </div>
              </div>

              {/* Demo Switcher */}
              <div className="p-4 rounded-2xl bg-canvas border border-border space-y-3">
                <span className="text-xs font-bold text-ink">Simulasi Peran Pengguna</span>
                <div className="space-y-1.5">
                  {Object.entries(DEMO_USERS).map(([key, user]) => (
                    <button
                      key={key}
                      onClick={() => setCurrentUser(user)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-colors ${
                        currentUser.username === user.username
                          ? 'bg-primary-600 text-surface'
                          : 'bg-surface hover:bg-primary-50 text-ink border border-border'
                      }`}
                    >
                      <span>{user.fullName} ({user.role === 'CHAIRMAN' ? 'Ketua' : user.role === 'TREASURER' ? 'Bendahara' : `Warga ${user.propertyCode}`})</span>
                      {currentUser.username === user.username && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <a
                  href="/admin"
                  className="w-full py-2.5 px-4 bg-surface hover:bg-canvas border border-border text-ink font-semibold text-xs rounded-xl flex items-center justify-between transition-colors"
                >
                  <span>Buka Dashboard Pengurus Komplek</span>
                  <ChevronRight className="w-4 h-4 text-ink-muted" />
                </a>
                <a
                  href="/transparency"
                  className="w-full py-2.5 px-4 bg-surface hover:bg-canvas border border-border text-ink font-semibold text-xs rounded-xl flex items-center justify-between transition-colors"
                >
                  <span>Buka Laporan Transparansi Warga</span>
                  <ChevronRight className="w-4 h-4 text-ink-muted" />
                </a>
                <button
                  type="button"
                  onClick={async () => {
                    await fetch('/api/auth/logout', { method: 'POST' });
                    window.location.href = '/login';
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
          <div className="h-16 bg-surface border-t border-border flex items-center justify-around px-2 sticky bottom-0 select-none shadow-xs">
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
                    value={`Rumah ${currentUser.propertyCode || 'A-17'}`}
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
        propertyCode={currentUser.propertyCode || 'A-17'}
        residentName={currentUser.fullName}
      />

      {/* Floating Warga AI Assistant Widget */}
      <WargaAIChatWidget currentPropertyCode={currentUser.propertyCode || 'A-17'} />
    </div>
  );
};
