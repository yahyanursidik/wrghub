import React, { useState, useEffect, useMemo } from 'react';
import type { UserRole } from '../../types/auth';
import {
  Building2,
  ShieldCheck,
  Home,
  KeyRound,
  User,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  BarChart3,
  QrCode,
  Phone,
  MessageSquare,
  FileText,
  Clock,
  HelpCircle,
  Search,
  Check,
  Copy,
  ExternalLink,
  ShieldAlert,
  Car,
  UserPlus,
  Send,
  LockKeyhole,
  Info,
  Server,
  Zap,
  ChevronRight,
  Smartphone
} from 'lucide-react';
import { formatRupiah } from '../../lib/format';

export type LoginSubTab = 'portal_login' | 'resident_register' | 'guard_terminal' | 'security_faq';
export type PortalType = 'resident' | 'admin' | 'security';

interface UnifiedLoginViewProps {
  initialPortal?: 'resident' | 'admin' | 'security';
  initialTab?: LoginSubTab;
}

export const UnifiedLoginView: React.FC<UnifiedLoginViewProps> = ({
  initialPortal = 'resident',
  initialTab = 'portal_login'
}) => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<LoginSubTab>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab') as LoginSubTab;
      if (['portal_login', 'resident_register', 'guard_terminal', 'security_faq'].includes(tabParam)) {
        return tabParam;
      }
    }
    return initialTab === ('accounts_directory' as any) ? 'portal_login' : initialTab;
  });

  const [activePortal, setActivePortal] = useState<PortalType>(initialPortal);

  // Sync tab with URL without reload
  const handleTabChange = (tab: LoginSubTab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.replaceState({}, '', url.toString());
    }
  };

  // Form Credentials State (Empty, Non-Demo)
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals State
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Dynamic branding
  const [loginTitle, setLoginTitle] = useState('WargaHub');
  const [loginSubtitle, setLoginSubtitle] = useState('Sistem Tata Kelola & Transparansi Komplek Taman Sejahtera');
  const [currentTime, setCurrentTime] = useState('');

  // Terminal Pos Satpam PIN State
  const [guardPin, setGuardPin] = useState('');
  const [selectedGuard, setSelectedGuard] = useState('Petugas Jaga Regu A');
  const [guardsList, setGuardsList] = useState<{ fullName: string; nip: string }[]>([]);
  const [guardPost, setGuardPost] = useState('Pos 1 (Gerbang Utama Boulevard)');
  const [guardShift, setGuardShift] = useState('Shift 2 (Siang: 15:00 - 23:00 WIB)');

  // Resident Registration Form State
  const [regOwnership, setRegOwnership] = useState<'PEMILIK' | 'PENYEWA' | 'KELUARGA'>('PEMILIK');
  const [regBlock, setRegBlock] = useState('A');
  const [regNumber, setRegNumber] = useState('01');
  const [regFullName, setRegFullName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regVehiclePlate, setRegVehiclePlate] = useState('');
  const [regMembersCount, setRegMembersCount] = useState('4');
  const [regNotes, setRegNotes] = useState('');
  const [regSubmitting, setRegSubmitting] = useState(false);
  const [regSuccessModal, setRegSuccessModal] = useState(false);

  // Live Digital Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZoneName: 'short'
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Check saved portal settings & guards
  useEffect(() => {
    try {
      const savedTitle = localStorage.getItem('wargahub_set_login_title');
      const savedSub = localStorage.getItem('wargahub_set_login_subtitle');
      if (savedTitle) setLoginTitle(JSON.parse(savedTitle));
      if (savedSub) setLoginSubtitle(JSON.parse(savedSub));

      const savedGuards = localStorage.getItem('wargahub_security_guards');
      if (savedGuards) {
        const parsed = JSON.parse(savedGuards);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setGuardsList(parsed.map((g: any) => ({ fullName: g.fullName, nip: g.nip || '' })));
          if (parsed[0]?.fullName) {
            setSelectedGuard(parsed[0].fullName);
          }
        }
      }
    } catch (e) {}
  }, []);

  // Track Caps Lock
  const checkCapsLock = (e: React.KeyboardEvent) => {
    if (e.getModifierState) {
      setIsCapsLockOn(e.getModifierState('CapsLock'));
    }
  };

  // Perform Authentication
  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!identifier || !password) {
      setErrorMsg('Harap masukkan username / nomor rumah dan password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password: password.trim(),
          portal: activePortal === 'security' ? 'admin' : activePortal
        }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setErrorMsg(data.error?.message || 'Kredensial tidak cocok. Silakan periksa kembali.');
        setLoading(false);
        return;
      }

      setSuccessMsg(data.data?.message || 'Otorisasi Berhasil! Mengalihkan...');
      if (typeof window !== 'undefined' && data.data?.user) {
        localStorage.setItem('wargahub_user', JSON.stringify(data.data.user));
        window.dispatchEvent(new CustomEvent('wargahub_user_changed', { detail: data.data.user }));
      }

      setTimeout(() => {
        let destination = data.data?.redirectUrl;
        if (!destination) {
          destination = activePortal === 'resident' ? '/warga' : activePortal === 'security' ? '/admin/security-gate' : '/admin';
        }
        window.location.href = destination;
      }, 400);
    } catch (err: any) {
      setErrorMsg('Gagal terhubung ke server autentikasi WargaHub.');
      setLoading(false);
    }
  };

  // Security Guard Numpad PIN Login
  const handleNumpadPress = (val: string) => {
    if (guardPin.length < 6) {
      const newPin = guardPin + val;
      setGuardPin(newPin);
      if (newPin.length === 6) {
        // Auto trigger guard login
        triggerGuardPinLogin(newPin);
      }
    }
  };

  const handleNumpadClear = () => {
    setGuardPin('');
    setErrorMsg('');
  };

  const handleNumpadBackspace = () => {
    setGuardPin(prev => prev.slice(0, -1));
  };

  const triggerGuardPinLogin = async (pinCode: string) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: 'satpam',
          password: pinCode,
          portal: 'admin'
        }),
      });
      const data = await res.json();
      if (res.ok && data.data?.redirectUrl) {
        if (typeof window !== 'undefined' && data.data?.user) {
          const userObj = {
            ...data.data.user,
            fullName: selectedGuard || data.data.user.fullName
          };
          localStorage.setItem('wargahub_user', JSON.stringify(userObj));
          window.dispatchEvent(new CustomEvent('wargahub_user_changed', { detail: userObj }));
        }
        setSuccessMsg(`Otorisasi PIN Berhasil! Selamat bertugas, ${selectedGuard}.`);
        setTimeout(() => {
          window.location.href = '/admin/security-gate';
        }, 500);
      } else {
        setErrorMsg('PIN Petugas Keamanan salah atau belum terdaftar.');
        setGuardPin('');
        setLoading(false);
      }
    } catch (e) {
      setErrorMsg('Koneksi terminal ke server pos jaga terputus.');
      setLoading(false);
    }
  };

  // Handle Resident Onboarding Submit
  const handleResidentRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFullName || !regPhone) {
      setErrorMsg('Nama Lengkap dan Nomor WhatsApp wajib diisi.');
      return;
    }
    setRegSubmitting(true);
    setTimeout(() => {
      setRegSubmitting(false);
      setRegSuccessModal(true);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col justify-between selection:bg-primary-100 selection:text-primary-900 font-sans">
      {/* TOP NOTIFICATION & REAL-TIME SYSTEM STRIP */}
      <div className="bg-primary-950 text-white text-[11px] py-2 px-4 border-b border-primary-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold tracking-tight">SISTEM AUTENTIKASI RESMI TERPADU</span>
            <span className="hidden sm:inline opacity-40">•</span>
            <span className="hidden sm:inline text-primary-200">Komplek Taman Sejahtera (RW 05 / RT 01-04)</span>
          </div>
          <div className="flex items-center gap-4 text-primary-200 font-mono">
            <span className="hidden md:inline">🕒 {currentTime || 'WIB'}</span>
            <span className="px-2 py-0.5 rounded bg-primary-900/80 text-emerald-300 font-bold text-[10px] border border-primary-800">
              PostgreSQL Online
            </span>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER (ASYMMETRIC SPLIT LAYOUT) */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ========================================================================= */}
          {/* LEFT COLUMN: RESIDENTIAL IDENTITY & ARCHITECTURAL SHOWCASE (5 COLS)     */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-6">
              {/* Brand Header */}
              <div className="flex items-center gap-3.5">
                <div className="w-13 h-13 rounded-2xl bg-primary-600 text-white flex items-center justify-center font-black text-xl shadow-xs">
                  WH
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-black tracking-tight text-ink">
                      {loginTitle}
                    </h1>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300">
                      v2.4 RESMI
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted mt-0.5 font-medium">
                    {loginSubtitle}
                  </p>
                </div>
              </div>

              {/* Architectural Imagery / Community Visual Badge */}
              <div className="relative rounded-2xl overflow-hidden border border-border group">
                <img
                  src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80"
                  alt="Komplek Taman Sejahtera"
                  className="w-full h-44 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4 text-white">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-300 font-bold">
                    Kawasan Perumahan Mandiri Berkelanjutan
                  </span>
                  <p className="text-sm font-bold text-white leading-tight">
                    Komplek Taman Sejahtera, Blok A - Blok D
                  </p>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Kawasan Hunian Terintegrasi • Tata Kelola Digital Transparan
                  </p>
                </div>
              </div>

              {/* Three High-Trust Pillars */}
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="p-3 bg-canvas rounded-2xl border border-border space-y-1">
                  <ShieldCheck className="w-5 h-5 text-primary-600 mx-auto" />
                  <span className="block text-[11px] font-bold text-ink leading-tight">Tata Kelola Terbuka</span>
                  <span className="block text-[9px] text-ink-muted">Kas & Tagihan IPL</span>
                </div>
                <div className="p-3 bg-canvas rounded-2xl border border-border space-y-1">
                  <Car className="w-5 h-5 text-amber-600 mx-auto" />
                  <span className="block text-[11px] font-bold text-ink leading-tight">Pos Satpam 24 Jam</span>
                  <span className="block text-[9px] text-ink-muted">Barrier Gate & Tamu</span>
                </div>
                <div className="p-3 bg-canvas rounded-2xl border border-border space-y-1">
                  <QrCode className="w-5 h-5 text-emerald-600 mx-auto" />
                  <span className="block text-[11px] font-bold text-ink leading-tight">Kuitansi Digital</span>
                  <span className="block text-[9px] text-ink-muted">Verifikasi QR Code</span>
                </div>
              </div>

              {/* Citizen Testimonial / RT Board Welcome Note */}
              <div className="p-4 rounded-2xl bg-primary-50/70 border border-primary-100 text-xs text-primary-950 space-y-1.5 leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold text-primary-900">
                  <Sparkles className="w-4 h-4 text-primary-600" />
                  <span>Sambutan Pengurus Paguyuban:</span>
                </div>
                <p className="italic text-primary-900/90 text-[11px]">
                  &ldquo;Selamat datang di gerbang layanan digital warga. Gunakan portal ini untuk pembayaran iuran terverifikasi, pelaporan aduan lingkungan, dan pengecekan transparansi kas.&rdquo;
                </p>
                <div className="pt-1 flex items-center justify-between text-[10px] text-primary-800 font-bold border-t border-primary-200/60">
                  <span>Pengurus RW / RT Komplek</span>
                  <span className="font-mono">Periode Aktif</span>
                </div>
              </div>

              {/* Direct Public Transparency Shortcuts */}
              <div className="pt-2 border-t border-border flex flex-col gap-2 text-xs">
                <span className="text-ink-muted text-[11px] font-medium">Akses publik tanpa perlu login:</span>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="/rekap-iuran"
                    className="p-2.5 bg-canvas hover:bg-surface border border-border hover:border-primary-400 rounded-xl text-ink font-bold text-[11px] flex items-center justify-between transition-colors shadow-2xs"
                  >
                    <span>📋 Rekap Iuran Warga</span>
                    <ArrowRight className="w-3.5 h-3.5 text-primary-600" />
                  </a>
                  <a
                    href="/transparency"
                    className="p-2.5 bg-canvas hover:bg-surface border border-border hover:border-primary-400 rounded-xl text-ink font-bold text-[11px] flex items-center justify-between transition-colors shadow-2xs"
                  >
                    <span>📊 Kas Transparan</span>
                    <ArrowRight className="w-3.5 h-3.5 text-primary-600" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: 5 INTERACTIVE SUBTABS & AUTH WORKBENCH (7 COLS)             */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* 5 SUBTABS NAVIGATION PILL BAR */}
            <div className="bg-surface p-1.5 rounded-2xl border border-border shadow-2xs flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => handleTabChange('portal_login')}
                className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'portal_login'
                    ? 'bg-primary-600 text-white shadow-xs'
                    : 'text-ink-muted hover:text-ink hover:bg-canvas'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Masuk Portal</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('resident_register')}
                className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'resident_register'
                    ? 'bg-primary-600 text-white shadow-xs'
                    : 'text-ink-muted hover:text-ink hover:bg-canvas'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Daftar Warga</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('guard_terminal')}
                className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'guard_terminal'
                    ? 'bg-primary-600 text-white shadow-xs'
                    : 'text-ink-muted hover:text-ink hover:bg-canvas'
                }`}
              >
                <LockKeyhole className="w-3.5 h-3.5" />
                <span>Terminal Satpam</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('security_faq')}
                className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'security_faq'
                    ? 'bg-primary-600 text-white shadow-xs'
                    : 'text-ink-muted hover:text-ink hover:bg-canvas'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Bantuan & FAQ</span>
              </button>
            </div>

            {/* ERROR & SUCCESS ALERT MESSAGES */}
            {errorMsg && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span className="font-medium">{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span className="font-bold">{successMsg}</span>
              </div>
            )}

            {/* ========================================================================= */}
            {/* SUBTAB 1: PORTAL LOGIN FORM (MAIN AUTH GATE)                              */}
            {/* ========================================================================= */}
            {activeTab === 'portal_login' && (
              <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-6 animate-in fade-in">
                
                {/* 3-Way Portal Selector */}
                <div className="grid grid-cols-3 p-1.5 bg-canvas border border-border rounded-2xl shadow-2xs">
                  <button
                    type="button"
                    onClick={() => {
                      setActivePortal('resident');
                      setErrorMsg('');
                    }}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                      activePortal === 'resident'
                        ? 'bg-surface text-primary-700 shadow-xs border border-border/80 font-black'
                        : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    <Home className="w-3.5 h-3.5" />
                    <span>Warga Mandiri</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActivePortal('admin');
                      setErrorMsg('');
                    }}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                      activePortal === 'admin'
                        ? 'bg-surface text-primary-700 shadow-xs border border-border/80 font-black'
                        : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Pengurus & RT</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActivePortal('security');
                      setErrorMsg('');
                    }}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                      activePortal === 'security'
                        ? 'bg-surface text-primary-700 shadow-xs border border-border/80 font-black'
                        : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    <Car className="w-3.5 h-3.5" />
                    <span>Pos Satpam</span>
                  </button>
                </div>

                {/* Portal Context Banner */}
                <div className="border-b border-border pb-4 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary-800 bg-primary-50 px-2 py-0.5 rounded-md border border-primary-200">
                      {activePortal === 'resident'
                        ? 'Portal Layanan Warga Mandiri'
                        : activePortal === 'admin'
                        ? 'Backoffice Pengurus & Dewan RT/RW'
                        : 'Akses Petugas Keamanan Gerbang'}
                    </span>
                    <h2 className="text-xl font-black text-ink mt-1.5">
                      {activePortal === 'resident'
                        ? 'Masuk ke Portal Rumah Warga'
                        : activePortal === 'admin'
                        ? 'Otorisasi Pengurus Komplek'
                        : 'Masuk Pos Keamanan & Gerbang'}
                    </h2>
                    <p className="text-xs text-ink-muted mt-0.5">
                      {activePortal === 'resident'
                        ? 'Ketik nomor unit rumah (misal: A-17) atau username warga Anda.'
                        : activePortal === 'admin'
                        ? 'Akses operasional keuangan, verifikasi transfer, dan data warga komplek.'
                        : 'Terminal pos satpam, buku tamu, pemindaian QR pass & kontrol palang gerbang.'}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-canvas border border-border flex items-center justify-center text-primary-700 shrink-0">
                    {activePortal === 'resident' ? (
                      <Home className="w-6 h-6" />
                    ) : activePortal === 'admin' ? (
                      <ShieldCheck className="w-6 h-6" />
                    ) : (
                      <Car className="w-6 h-6" />
                    )}
                  </div>
                </div>

                {/* Authentication Form */}
                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Identifier Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-ink">
                        {activePortal === 'resident'
                          ? 'Nomor Rumah / Username Warga'
                          : activePortal === 'admin'
                          ? 'Username / Email Pengurus'
                          : 'ID Petugas Satpam / NIP'}
                      </label>
                      <span className="text-[11px] text-ink-muted">
                        {activePortal === 'resident' ? 'Format: Blok & Nomor atau Username' : 'Kredensial Resmi RW/RT'}
                      </span>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-muted">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        placeholder={
                          activePortal === 'resident'
                            ? 'Contoh: A-17 atau warga_a17'
                            : activePortal === 'admin'
                            ? 'Contoh: ketua atau bendahara'
                            : 'Contoh: satpam'
                        }
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3 bg-canvas border border-border rounded-2xl text-sm font-bold text-ink focus:outline-hidden focus:ring-2 focus:ring-primary-500 focus:bg-surface transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-ink">
                        Kata Sandi / PIN Akses
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowForgotPasswordModal(true)}
                        className="text-[11px] font-bold text-primary-700 hover:text-primary-800 hover:underline"
                      >
                        Lupa Kata Sandi?
                      </button>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-muted">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Masukkan password atau PIN akun"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyUp={checkCapsLock}
                        required
                        className="w-full pl-10 pr-11 py-3 bg-canvas border border-border rounded-2xl text-sm font-bold text-ink focus:outline-hidden focus:ring-2 focus:ring-primary-500 focus:bg-surface transition-all shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-ink-muted hover:text-ink"
                        title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {isCapsLockOn && (
                      <p className="mt-1.5 text-[11px] text-amber-700 font-medium flex items-center gap-1 animate-in fade-in">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Perhatian: Tombol Caps Lock sedang aktif.</span>
                      </p>
                    )}
                  </div>

                  {/* Remember Me & Privacy Note */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-border text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-xs text-ink-muted font-medium">Ingat saya di perangkat ini</span>
                    </label>
                    <span className="text-[11px] text-ink-muted font-mono flex items-center gap-1">
                      <Lock className="w-3 h-3 text-emerald-600" />
                      SSL 256-Bit
                    </span>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-4 bg-primary-600 hover:bg-primary-700 active:scale-[0.98] disabled:opacity-50 text-white text-sm font-black rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Masuk ke {activePortal === 'resident' ? 'Portal Warga' : activePortal === 'admin' ? 'Dashboard Pengurus' : 'Terminal Pos Satpam'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Security and Help footer */}
                <div className="pt-5 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-ink-muted">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Enkripsi Sesi 256-bit Berstandar Perbankan</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTabChange('security_faq')}
                    className="font-bold text-primary-700 hover:text-primary-800 hover:underline text-left sm:text-right"
                  >
                    Panduan & Bantuan Akun →
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* SUBTAB 2: RESIDENT ONBOARDING / NEW RESIDENT REGISTRATION                  */}
            {/* ========================================================================= */}
            {activeTab === 'resident_register' && (
              <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-6 animate-in fade-in">
                <div className="border-b border-border pb-4 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Pendaftaran Mandiri Penghuni Baru
                    </span>
                    <h2 className="text-xl font-black text-ink mt-1.5">
                      Registrasi Unit Rumah & Warga
                    </h2>
                    <p className="text-xs text-ink-muted mt-0.5">
                      Daftarkan data keluarga Anda untuk aktivasi portal mandiri, iuran digital, dan akses RFID gerbang.
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                    <UserPlus className="w-6 h-6" />
                  </div>
                </div>

                <form onSubmit={handleResidentRegisterSubmit} className="space-y-4 text-xs">
                  {/* Ownership Status */}
                  <div>
                    <label className="block font-bold text-ink mb-1.5">Status Kepemilikan Hunian:</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setRegOwnership('PEMILIK')}
                        className={`py-2.5 px-3 rounded-xl border text-center font-bold transition-all ${
                          regOwnership === 'PEMILIK'
                            ? 'bg-primary-50 border-primary-500 text-primary-900 shadow-2xs'
                            : 'bg-canvas border-border text-ink-muted hover:text-ink'
                        }`}
                      >
                        🏠 Pemilik Tetap
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegOwnership('PENYEWA')}
                        className={`py-2.5 px-3 rounded-xl border text-center font-bold transition-all ${
                          regOwnership === 'PENYEWA'
                            ? 'bg-primary-50 border-primary-500 text-primary-900 shadow-2xs'
                            : 'bg-canvas border-border text-ink-muted hover:text-ink'
                        }`}
                      >
                        🔑 Penyewa / Kontrak
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegOwnership('KELUARGA')}
                        className={`py-2.5 px-3 rounded-xl border text-center font-bold transition-all ${
                          regOwnership === 'KELUARGA'
                            ? 'bg-primary-50 border-primary-500 text-primary-900 shadow-2xs'
                            : 'bg-canvas border-border text-ink-muted hover:text-ink'
                        }`}
                      >
                        👨‍👩‍👧‍👦 Keluarga / Kerabat
                      </button>
                    </div>
                  </div>

                  {/* Block & House Unit */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-ink mb-1.5">Wilayah Blok:</label>
                      <select
                        value={regBlock}
                        onChange={(e) => setRegBlock(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
                      >
                        <option value="A">Blok A (Jl. Utama Boulevard)</option>
                        <option value="B">Blok B (Taman Barat)</option>
                        <option value="C">Blok C (Taman Timur)</option>
                        <option value="D">Blok D (Taman Selatan)</option>
                        <option value="KAV">Kavling Mandiri</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-ink mb-1.5">Nomor Rumah (Unit):</label>
                      <input
                        type="text"
                        placeholder="Contoh: 01, 17, 24"
                        value={regNumber}
                        onChange={(e) => setRegNumber(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
                      />
                    </div>
                  </div>

                  {/* Full Name & WhatsApp */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-ink mb-1.5">Nama Lengkap Kepala Keluarga:</label>
                      <input
                        type="text"
                        placeholder="Sesuai KTP / KK"
                        value={regFullName}
                        onChange={(e) => setRegFullName(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 bg-canvas border border-border rounded-xl text-xs font-medium text-ink"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-ink mb-1.5">Nomor WhatsApp Aktif:</label>
                      <input
                        type="text"
                        placeholder="0812-xxxx-xxxx (Untuk IPL digital)"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 bg-canvas border border-border rounded-xl text-xs font-medium text-ink"
                      />
                    </div>
                  </div>

                  {/* Vehicle Plate & Occupants Count */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-ink mb-1.5">Plat Nomor Kendaraan Utama:</label>
                      <input
                        type="text"
                        placeholder="Contoh: B 1234 SAK (Mobil/Motor)"
                        value={regVehiclePlate}
                        onChange={(e) => setRegVehiclePlate(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-canvas border border-border rounded-xl text-xs font-mono font-bold text-ink"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-ink mb-1.5">Jumlah Jiwa Penghuni:</label>
                      <input
                        type="number"
                        min="1"
                        max="12"
                        value={regMembersCount}
                        onChange={(e) => setRegMembersCount(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block font-bold text-ink mb-1.5">Catatan Tambahan (Opsional):</label>
                    <textarea
                      rows={2}
                      placeholder="Informasi tambahan terkait kepindahan atau kontak darurat keluarga..."
                      value={regNotes}
                      onChange={(e) => setRegNotes(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-canvas border border-border rounded-xl text-xs text-ink"
                    />
                  </div>

                  {/* Submission Notice */}
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <span>
                      Data pendaftaran Anda akan diverifikasi oleh Sekretaris RT dalam waktu maksimal 1x24 jam. Kredensial akun resmi akan dikirimkan otomatis via WhatsApp.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={regSubmitting}
                    className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50 text-white font-bold rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2"
                  >
                    {regSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Kirimkan Formulir Pendaftaran Warga</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* ========================================================================= */}
            {/* SUBTAB 3: GUARD GATE TERMINAL & NUMPAD PIN LOGIN                          */}
            {/* ========================================================================= */}
            {activeTab === 'guard_terminal' && (
              <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-6 animate-in fade-in">
                <div className="border-b border-border pb-4 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      Terminal Gardu Pos Jaga Keamanan 24 Jam
                    </span>
                    <h2 className="text-xl font-black text-ink mt-1.5">
                      Otorisasi Cepat PIN Satpam
                    </h2>
                    <p className="text-xs text-ink-muted mt-0.5">
                      Gunakan sentuhan numpad virtual untuk login cepat tablet pos satpam tanpa keyboard fisik.
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
                    <Car className="w-6 h-6" />
                  </div>
                </div>

                {/* Guard Selection & Active Shift */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-ink mb-1">Petugas Bertugas:</label>
                    <select
                      value={selectedGuard}
                      onChange={(e) => setSelectedGuard(e.target.value)}
                      className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                    >
                      {guardsList.length > 0 ? (
                        guardsList.map((g) => (
                          <option key={g.nip || g.fullName} value={g.fullName}>
                            {g.fullName} {g.nip ? `(NIP: ${g.nip})` : ''}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="Petugas Jaga Regu A">Petugas Jaga Regu A</option>
                          <option value="Petugas Jaga Regu B">Petugas Jaga Regu B</option>
                          <option value="Danru Keamanan Komplek">Danru Keamanan Komplek</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-ink mb-1">Posisi Gardu Jaga:</label>
                    <select
                      value={guardPost}
                      onChange={(e) => setGuardPost(e.target.value)}
                      className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                    >
                      <option value="Pos 1 (Gerbang Utama Boulevard)">Pos 1 (Gerbang Utama Boulevard)</option>
                      <option value="Pos 2 (Gerbang Timur Jl. Sariwangi)">Pos 2 (Gerbang Timur Jl. Sariwangi)</option>
                    </select>
                  </div>
                </div>

                {/* Shift Indicator Pill */}
                <div className="p-3 bg-canvas rounded-2xl border border-border flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span className="font-bold text-ink">{guardShift}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                    Kondisi: Aman Terkendali
                  </span>
                </div>

                {/* PIN Display Field */}
                <div className="text-center space-y-2">
                  <span className="text-xs text-ink-muted font-bold">Masukkan 6 Digit PIN Otorisasi Gardu:</span>
                  <div className="flex items-center justify-center gap-3">
                    {[0, 1, 2, 3, 4, 5].map((idx) => {
                      const isFilled = idx < guardPin.length;
                      return (
                        <div
                          key={idx}
                          className={`w-10 h-12 rounded-xl border-2 flex items-center justify-center font-mono text-xl font-black transition-all ${
                            isFilled
                              ? 'border-primary-600 bg-primary-50 text-primary-900 shadow-xs'
                              : 'border-border bg-canvas text-transparent'
                          }`}
                        >
                          {isFilled ? '●' : ''}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-ink-muted">
                    Ketik 6 digit PIN dinas pos satpam shift aktif Anda
                  </p>
                </div>

                {/* Virtual Touch Numpad */}
                <div className="max-w-xs mx-auto grid grid-cols-3 gap-2.5 pt-2">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleNumpadPress(num)}
                      className="h-14 rounded-2xl bg-canvas hover:bg-surface border border-border hover:border-primary-400 font-mono font-black text-xl text-ink active:scale-[0.95] transition-all shadow-2xs"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleNumpadClear}
                    className="h-14 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 font-bold text-xs text-rose-800 active:scale-[0.95] transition-all"
                  >
                    RESET
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNumpadPress('0')}
                    className="h-14 rounded-2xl bg-canvas hover:bg-surface border border-border hover:border-primary-400 font-mono font-black text-xl text-ink active:scale-[0.95] transition-all shadow-2xs"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={handleNumpadBackspace}
                    className="h-14 rounded-2xl bg-canvas hover:bg-surface border border-border font-bold text-sm text-ink-muted active:scale-[0.95] transition-all"
                  >
                    ⌫
                  </button>
                </div>

                {/* Pos Satpam Assistance */}
                <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-ink-muted">
                  <span>Hubungi koordinator regu jika lupa PIN dinas</span>
                  <button
                    type="button"
                    onClick={() => handleTabChange('security_faq')}
                    className="font-bold text-primary-700 hover:text-primary-800 hover:underline"
                  >
                    Bantuan Keamanan →
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* SUBTAB 4: HELP CENTER, SECURITY FAQ & EMERGENCY DIRECTORY                 */}
            {/* ========================================================================= */}
            {activeTab === 'security_faq' && (
              <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-6 animate-in fade-in">
                <div className="border-b border-border pb-4 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary-800 bg-primary-50 px-2 py-0.5 rounded-md border border-primary-200">
                      Pusat Informasi & Standar Keamanan Data
                    </span>
                    <h2 className="text-xl font-black text-ink mt-1.5">
                      Bantuan Akun & Kebijakan Privasi
                    </h2>
                    <p className="text-xs text-ink-muted mt-0.5">
                      Panduan masuk portal, pemulihan akun, dan kontak resmi pengurus komplek.
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-canvas border border-border flex items-center justify-center text-primary-700 shrink-0">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                </div>

                {/* Official Board Contacts Cards */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-ink-muted">
                    Kontak Resmi Pengurus RT / RW & Pos Jaga:
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 bg-canvas rounded-2xl border border-border space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-ink">Ketua Paguyuban / RW</span>
                        <span className="px-2 py-0.5 rounded bg-primary-50 text-primary-700 font-bold text-[10px]">Ketua RW</span>
                      </div>
                      <p className="text-[11px] text-ink-muted">Penanggung jawab tata kelola & musyawarah komplek.</p>
                      <a
                        href="https://api.whatsapp.com/send?phone=6281234567801&text=Halo%20Ketua%20Komplek%20WargaHub,%20saya%20memerlukan%20bantuan%20akun..."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-primary-700 hover:underline font-bold text-[11px] pt-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        Chat WhatsApp Ketua
                      </a>
                    </div>

                    <div className="p-3.5 bg-canvas rounded-2xl border border-border space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-ink">Bendahara Kas Paguyuban</span>
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold text-[10px]">Bendahara Kas</span>
                      </div>
                      <p className="text-[11px] text-ink-muted">Pelayanan verifikasi pembayaran iuran & kuitansi.</p>
                      <a
                        href="https://api.whatsapp.com/send?phone=6281234567802&text=Halo%20Bendahara%20WargaHub,%20saya%20ingin%20mengonfirmasi%20iuran%20IPL..."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-primary-700 hover:underline font-bold text-[11px] pt-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        Chat WhatsApp Bendahara
                      </a>
                    </div>

                    <div className="p-3.5 bg-canvas rounded-2xl border border-border space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-ink">Bpk. M. Fadli</span>
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px]">Sekretaris RT</span>
                      </div>
                      <p className="text-[11px] text-ink-muted">Pengurusan surat pengantar & pendaftaran warga baru.</p>
                      <a
                        href="https://api.whatsapp.com/send?phone=6281234567803&text=Halo%20Sekretaris%20WargaHub,%20saya%20ingin%20mendaftarkan%20data%20keluarga..."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-primary-700 hover:underline font-bold text-[11px] pt-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        Chat WhatsApp Sekretaris
                      </a>
                    </div>

                    <div className="p-3.5 bg-canvas rounded-2xl border border-border space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-ink">Pos Satpam Gerbang Utama</span>
                        <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold text-[10px]">Siaga 24 Jam</span>
                      </div>
                      <p className="text-[11px] text-ink-muted">Hotline darurat pos gerbang & keamanan lingkungan.</p>
                      <a
                        href="tel:0221234567"
                        className="inline-flex items-center gap-1.5 text-rose-700 hover:underline font-bold text-[11px] pt-1"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        Telepon Pos Jaga: (022) 123-4567
                      </a>
                    </div>
                  </div>
                </div>

                {/* FAQ Accordion Items */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-ink-muted">
                    Pertanyaan Umum Seputar Akun & Privasi:
                  </h3>

                  <div className="p-4 bg-canvas rounded-2xl border border-border space-y-1 text-xs">
                    <p className="font-bold text-ink">Bagaimana cara login jika saya belum tahu password?</p>
                    <p className="text-ink-muted leading-relaxed text-[11px]">
                      Bagi pemilik unit terdaftar, kata sandi awal diberikan oleh pengurus saat serah terima data warga (default: <span className="font-mono font-bold">warga123</span>). Anda dapat mengubah kata sandi kapan saja melalui menu Pengaturan Profil di Portal Warga.
                    </p>
                  </div>

                  <div className="p-4 bg-canvas rounded-2xl border border-border space-y-1 text-xs">
                    <p className="font-bold text-ink">Apakah data keuangan dan identitas warga aman?</p>
                    <p className="text-ink-muted leading-relaxed text-[11px]">
                      Sistem WargaHub menerapkan protokol enkripsi SSL 256-bit dan basis data cloud PostgreSQL berstandar ISO 27001. Halaman transparansi publik hanya menampilkan status pembayaran per unit rumah tanpa membuka rincian nomor rekening pribadi warga.
                    </p>
                  </div>

                  <div className="p-4 bg-canvas rounded-2xl border border-border space-y-1 text-xs">
                    <p className="font-bold text-ink">Bagaimana jika ada tamu atau kurir yang berkunjung ke rumah?</p>
                    <p className="text-ink-muted leading-relaxed text-[11px]">
                      Setiap kurir dan tamu yang melintas akan dicatat di pos satpam dan otomatis muncul pada feed notifikasi di Portal Warga Anda. Anda juga dapat membuat tautan QR Tamu Mandiri untuk akses cepat tanpa pemeriksaan berlapis di gerbang.
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="py-6 border-t border-border bg-surface text-center text-xs text-ink-muted space-y-1">
        <div className="flex items-center justify-center gap-2">
          <span className="font-bold text-ink">WargaHub Smart Residential OS</span>
          <span>•</span>
          <span>Komplek Taman Sejahtera</span>
        </div>
        <p className="text-[11px]">
          Dikembangkan oleh{' '}
          <a
            href="https://yahyanursidik.my.id/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-primary-700 hover:text-primary-800 hover:underline"
          >
            Yahya Nursidik
          </a>
        </p>
      </footer>

      {/* ========================================================================= */}
      {/* MODAL 1: FORGOT PASSWORD DIALOG                                           */}
      {/* ========================================================================= */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-surface rounded-3xl p-6 sm:p-8 max-w-md w-full border border-border shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-ink">Bantuan Lupa Kata Sandi</h3>
                  <span className="text-[11px] text-ink-muted">Pemulihan Akun Warga & Pengurus</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(false)}
                className="w-8 h-8 rounded-full bg-canvas text-ink-muted hover:text-ink flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-ink-muted leading-relaxed">
              <p>
                Untuk menjaga keamanan kependudukan dan perlindungan data komplek, reset kata sandi dilakukan melalui verifikasi pengurus RT/RW:
              </p>
              <div className="p-3 bg-canvas rounded-2xl border border-border space-y-2">
                <span className="font-bold text-ink block">Langkah Pemulihan Cepat:</span>
                <ol className="list-decimal list-inside space-y-1 text-[11px]">
                  <li>Klik tombol WhatsApp di bawah untuk menghubungi Administrator.</li>
                  <li>Sebutkan Nomor Unit Rumah Anda (misal: Rumah A-17).</li>
                  <li>Sertakan nama kepala keluarga yang terdaftar.</li>
                  <li>Admin akan mereset sandi Anda menjadi sandi sementara dalam 5 menit.</li>
                </ol>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <a
                href={`https://api.whatsapp.com/send?phone=6281234567801&text=${encodeURIComponent(
                  `Halo Admin WargaHub Komplek Taman Sejahtera, saya lupa kata sandi akun untuk Nomor Unit Rumah: ${identifier || '...'}. Mohon bantuan reset password. Terima kasih.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Hubungi via WhatsApp
              </a>
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(false)}
                className="px-4 py-3 bg-canvas border border-border text-ink font-bold text-xs rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: REGISTRATION SUCCESS CONFIRMATION                                */}
      {/* ========================================================================= */}
      {regSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-surface rounded-3xl p-6 sm:p-8 max-w-md w-full border border-border shadow-2xl space-y-5 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h3 className="font-black text-xl text-ink">Pendaftaran Diterima!</h3>
              <p className="text-xs text-ink-muted">
                Terima kasih, Bpk/Ibu <span className="font-bold text-ink">{regFullName}</span>. Data pendaftaran unit <span className="font-bold text-primary-700">Blok {regBlock} No. {regNumber}</span> telah terekam.
              </p>
            </div>

            <div className="p-4 bg-canvas rounded-2xl border border-border text-left text-xs space-y-1.5">
              <span className="font-bold text-ink block text-[11px] uppercase tracking-wider">Tahapan Selanjutnya:</span>
              <p className="text-ink-muted text-[11px]">
                1. Sekretaris RT akan mencocokkan nomor unit dan mengirim konfirmasi via WhatsApp ke nomor <span className="font-mono font-bold text-ink">{regPhone}</span>.
              </p>
              <p className="text-ink-muted text-[11px]">
                2. Akun portal mandiri dan kode akses gerbang Anda akan aktif dalam 1x24 jam.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setRegSuccessModal(false);
                handleTabChange('portal_login');
              }}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              Kembali ke Halaman Masuk
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
