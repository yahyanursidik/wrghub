import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  Check,
  ShieldAlert,
  Building,
  CreditCard,
  PhoneCall,
  Users,
  Bell,
  Sparkles,
  QrCode,
  Shield,
  Layers,
  FileText,
  Clock,
  ArrowRight,
  ExternalLink,
  PlusCircle,
  Car,
  Receipt,
  Wallet,
  Wrench,
  Megaphone,
  Vote,
  FolderOpen,
  HelpCircle,
  Truck,
  DollarSign,
  Palette,
  Eye,
  Type,
  Layout,
  Smartphone,
  Sliders,
  CheckCircle2,
  Lock,
  Globe,
  MessageCircle
} from 'lucide-react';
import { formatRupiah } from '../../lib/format';

export const SettingsManager: React.FC = () => {
  // Persistence helpers
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

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Navigation Subtabs
  const [activeTab, setActiveTab] = useState<
    'branding' | 'profile' | 'finances' | 'security' | 'sanitation' | 'notifications' | 'committee' | 'inputs_directory'
  >('branding');

  // Preview Mode for Branding
  const [brandingPreviewScreen, setBrandingPreviewScreen] = useState<'login' | 'admin_dash' | 'resident_dash'>('login');

  // ================= 1. BRANDING, TITLES & SUBTITLES =================
  const [systemTitle, setSystemTitle] = useState(() => getPersisted('wargahub_set_sys_title', 'WargaHub'));
  const [systemSubtitle, setSystemSubtitle] = useState(() => getPersisted('wargahub_set_sys_sub', 'Sistem Tata Kelola & Transparansi Komplek Terpadu'));
  const [loginTitle, setLoginTitle] = useState(() => getPersisted('wargahub_set_login_title', 'WargaHub'));
  const [loginSubtitle, setLoginSubtitle] = useState(() => getPersisted('wargahub_set_login_subtitle', 'Sistem Tata Kelola & Transparansi Komplek Taman Sejahtera'));
  const [adminDashTitle, setAdminDashTitle] = useState(() => getPersisted('wargahub_set_dash_heading', 'Dashboard Ketua Komplek'));
  const [adminDashSubtitle, setAdminDashSubtitle] = useState(() => getPersisted('wargahub_set_dash_subheading', 'Ringkasan informasi, kas keuangan & aktivitas penting Komplek Taman Sejahtera.'));
  const [residentPortalTitle, setResidentPortalTitle] = useState(() => getPersisted('wargahub_set_res_title', 'Portal Warga Komplek'));
  const [residentPortalSubtitle, setResidentPortalSubtitle] = useState(() => getPersisted('wargahub_set_res_subtitle', 'Layanan Iuran, Keamanan, Fasilitas & Aduan Warga 24 Jam'));
  const [footerBadgeText, setFooterBadgeText] = useState(() => getPersisted('wargahub_set_footer_badge', 'Guyub Rukun, Aman, Asri & Transparan Berbasis Digital'));

  // ================= 2. PROFIL LINGKUNGAN =================
  const [communityName, setCommunityName] = useState(() => getPersisted('wargahub_set_comm_name', 'Komplek Perumahan Taman Sejahtera / WargaHub'));
  const [rtRw, setRtRw] = useState(() => getPersisted('wargahub_set_rtrw', 'RT 02 / RW 05'));
  const [address, setAddress] = useState(() => getPersisted('wargahub_set_address', 'Jl. Taman Sejahtera Utama No. 1, Sariwangi, Bandung Barat'));
  const [subdistrict, setSubdistrict] = useState(() => getPersisted('wargahub_set_subdistrict', 'Kel. Sariwangi, Kec. Parongpong'));
  const [cityPostal, setCityPostal] = useState(() => getPersisted('wargahub_set_citypostal', 'Kab. Bandung Barat, Jawa Barat 40559'));
  const [skNumber, setSkNumber] = useState(() => getPersisted('wargahub_set_sk_number', 'SK-LUR/SRW/012/VIII/2026'));
  const [motto, setMotto] = useState(() => getPersisted('wargahub_set_motto', 'Guyub Rukun, Aman, Asri, dan Transparan Berbasis Digital'));

  // ================= 3. KEUANGAN, TARIF & REKENING BANK =================
  const [monthlyFee, setMonthlyFee] = useState(() => getPersisted('wargahub_set_fee', '750000'));
  const [trashFee, setTrashFee] = useState(() => getPersisted('wargahub_set_trash_fee', '75000'));
  const [securityFee, setSecurityFee] = useState(() => getPersisted('wargahub_set_security_fee', '150000'));
  const [facilityReserveFee, setFacilityReserveFee] = useState(() => getPersisted('wargahub_set_reserve_fee', '525000'));
  const [dueDay, setDueDay] = useState(() => getPersisted('wargahub_set_dueday', '10'));
  const [gracePeriodDays, setGracePeriodDays] = useState(() => getPersisted('wargahub_set_grace_days', '5'));
  const [latePenaltyType, setLatePenaltyType] = useState(() => getPersisted('wargahub_set_penalty_type', 'NONE'));
  const [bankName, setBankName] = useState(() => getPersisted('wargahub_set_bankname', 'BCA (Bank Central Asia)'));
  const [bankAccount, setBankAccount] = useState(() => getPersisted('wargahub_set_bankacc', '8830-1928-33'));
  const [accountHolder, setAccountHolder] = useState(() => getPersisted('wargahub_set_accholder', 'PENGURUS KOMPLEK WARGAHUB'));
  const [qrisNmid, setQrisNmid] = useState(() => getPersisted('wargahub_set_qris', 'ID1020088921829'));

  // ================= 4. KEAMANAN & POS SATPAM =================
  const [securityPhone, setSecurityPhone] = useState(() => getPersisted('wargahub_set_secphone', '0812-3456-7801'));
  const [securityPhone2, setSecurityPhone2] = useState(() => getPersisted('wargahub_set_secphone2', '0812-3456-7802'));
  const [gateClosingTime, setGateClosingTime] = useState(() => getPersisted('wargahub_set_gateclose', '23:00'));
  const [guestPassExpiryHours, setGuestPassExpiryHours] = useState(() => getPersisted('wargahub_set_guesthours', '24'));
  const [maxGuestCars, setMaxGuestCars] = useState(() => getPersisted('wargahub_set_max_guest_cars', '3'));
  const [patrolFrequency, setPatrolFrequency] = useState(() => getPersisted('wargahub_set_patrolfreq', 'Setiap 2 Jam (22:00 - 05:00 WIB)'));

  // ================= 5. KEBERSIHAN & SAMPAH =================
  const [organicWasteDays, setOrganicWasteDays] = useState(() => getPersisted('wargahub_set_waste_org', 'Senin, Rabu, Jumat'));
  const [inorganicWasteDays, setInorganicWasteDays] = useState(() => getPersisted('wargahub_set_waste_inorg', 'Rabu & Sabtu'));
  const [collectionHours, setCollectionHours] = useState(() => getPersisted('wargahub_set_collection_hours', '06:30 - 10:30 WIB'));
  const [tpsLocation, setTpsLocation] = useState(() => getPersisted('wargahub_set_tps_loc', 'Area Belakang TPS3R Fasum Blok D'));

  // ================= 6. NOTIFIKASI & WHATSAPP =================
  const [waSenderName, setWaSenderName] = useState(() => getPersisted('wargahub_set_wasender', 'WargaHub Official Broadcast'));
  const [adminWaPhone, setAdminWaPhone] = useState(() => getPersisted('wargahub_set_admin_wa', '0812-3456-7890'));
  const [autoReminderDays, setAutoReminderDays] = useState(() => getPersisted('wargahub_set_reminderdays', 'H-5, H-3 & H-0 Jatuh Tempo'));

  // ================= 7. PENGURUS INTI =================
  const [rwHeadName, setRwHeadName] = useState(() => getPersisted('wargahub_set_rwheadname', 'Bpk. Ir. H. Bambang Sutrisno'));
  const [rwHeadPhone, setRwHeadPhone] = useState(() => getPersisted('wargahub_set_rwheadphone', '0812-3456-7890'));
  const [secretaryName, setSecretaryName] = useState(() => getPersisted('wargahub_set_secname', 'Bpk. Hendra Wijaya, S.T.'));
  const [treasurerName, setTreasurerName] = useState(() => getPersisted('wargahub_set_treasname', 'Ibu Dra. Siti Rahmawati, Ak.'));
  const [securityCoordName, setSecurityCoordName] = useState(() => getPersisted('wargahub_set_seccoord', 'Bambang Sudiro (Danru Satpam)'));
  const [cleaningCoordName, setCleaningCoordName] = useState(() => getPersisted('wargahub_set_clncoord', 'Rudi Hartono (Koordinator Kebersihan)'));

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Save Settings Handler
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 1. API Call to update database
      await fetch('/api/settings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          communityName,
          rtRw,
          address,
          monthlyRate: Number(monthlyFee),
          bankName,
          bankAccount,
          accountHolder,
          securityPhone,
          rwHeadPhone,
        }),
      }).catch(() => {});

      // 2. Persist Branding, Titles & Subtitles
      savePersisted('wargahub_set_sys_title', systemTitle);
      savePersisted('wargahub_set_sys_sub', systemSubtitle);
      savePersisted('wargahub_set_login_title', loginTitle);
      savePersisted('wargahub_set_login_subtitle', loginSubtitle);
      savePersisted('wargahub_set_dash_heading', adminDashTitle);
      savePersisted('wargahub_set_dash_subheading', adminDashSubtitle);
      savePersisted('wargahub_set_res_title', residentPortalTitle);
      savePersisted('wargahub_set_res_subtitle', residentPortalSubtitle);
      savePersisted('wargahub_set_footer_badge', footerBadgeText);

      // 3. Persist Profile
      savePersisted('wargahub_set_comm_name', communityName);
      savePersisted('wargahub_set_rtrw', rtRw);
      savePersisted('wargahub_set_address', address);
      savePersisted('wargahub_set_subdistrict', subdistrict);
      savePersisted('wargahub_set_citypostal', cityPostal);
      savePersisted('wargahub_set_sk_number', skNumber);
      savePersisted('wargahub_set_motto', motto);

      // 4. Persist Finances
      savePersisted('wargahub_set_fee', monthlyFee);
      savePersisted('wargahub_set_trash_fee', trashFee);
      savePersisted('wargahub_set_security_fee', securityFee);
      savePersisted('wargahub_set_reserve_fee', facilityReserveFee);
      savePersisted('wargahub_set_dueday', dueDay);
      savePersisted('wargahub_set_grace_days', gracePeriodDays);
      savePersisted('wargahub_set_penalty_type', latePenaltyType);
      savePersisted('wargahub_set_bankname', bankName);
      savePersisted('wargahub_set_bankacc', bankAccount);
      savePersisted('wargahub_set_accholder', accountHolder);
      savePersisted('wargahub_set_qris', qrisNmid);

      // 5. Persist Security
      savePersisted('wargahub_set_secphone', securityPhone);
      savePersisted('wargahub_set_secphone2', securityPhone2);
      savePersisted('wargahub_set_gateclose', gateClosingTime);
      savePersisted('wargahub_set_guesthours', guestPassExpiryHours);
      savePersisted('wargahub_set_max_guest_cars', maxGuestCars);
      savePersisted('wargahub_set_patrolfreq', patrolFrequency);

      // 6. Persist Sanitation
      savePersisted('wargahub_set_waste_org', organicWasteDays);
      savePersisted('wargahub_set_waste_inorg', inorganicWasteDays);
      savePersisted('wargahub_set_collection_hours', collectionHours);
      savePersisted('wargahub_set_tps_loc', tpsLocation);

      // 7. Persist Notifications & WhatsApp
      savePersisted('wargahub_set_wasender', waSenderName);
      savePersisted('wargahub_set_admin_wa', adminWaPhone);
      savePersisted('wargahub_set_reminderdays', autoReminderDays);

      // 8. Persist Committee
      savePersisted('wargahub_set_rwheadname', rwHeadName);
      savePersisted('wargahub_set_rwheadphone', rwHeadPhone);
      savePersisted('wargahub_set_secname', secretaryName);
      savePersisted('wargahub_set_treasname', treasurerName);
      savePersisted('wargahub_set_seccoord', securityCoordName);
      savePersisted('wargahub_set_clncoord', cleaningCoordName);

      // 9. Sync Bank Account list for payment portals
      savePersisted('wargahub_bank_accounts', [
        {
          id: 'acc-bca',
          bankName: bankName,
          accountNumber: bankAccount,
          accountHolder: accountHolder,
          isPrimary: true,
          qrisNmid: qrisNmid
        }
      ]);

      setSaved(true);
      showToast('Seluruh pengaturan, judul & sub-judul sistem berhasil disimpan dan seketika aktif!');
      setTimeout(() => setSaved(false), 4000);
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan pengaturan.');
    } finally {
      setSaving(false);
    }
  };

  // Quick Input Directory Mapping
  const inputModulesDirectory = [
    {
      category: 'DATA WARGA & PROPERTI',
      color: 'border-blue-200 bg-blue-50/40 text-blue-900',
      items: [
        { title: 'Input Rumah & Spesifikasi Teknis', url: '/admin/properties', desc: 'Tambah/edit data 123 rumah, luas tanah/bangunan, status hunian, daya PLN.', icon: Building },
        { title: 'Input Anggota Keluarga & Penghuni', url: '/admin/properties?tab=occupants', desc: 'Tambah/edit/hapus data KK, NIK, hubungan keluarga, status tinggal.', icon: Users },
        { title: 'Input Kendaraan & Kartu Akses RFID', url: '/admin/properties?tab=vehicles', desc: 'Daftarkan mobil, motor, plat nomor, nomor seri RFID pass gerbang.', icon: Car },
        { title: 'Input Izin Renovasi & Utilitas', url: '/admin/properties?tab=permits', desc: 'Catat izin renovasi bangunan, uang jaminan, serta meteran air/listrik.', icon: Wrench },
      ]
    },
    {
      category: 'KEUANGAN, IURAN & KASBON',
      color: 'border-emerald-200 bg-emerald-50/40 text-emerald-900',
      items: [
        { title: 'Terbitkan Tagihan Iuran Bulanan (Billing)', url: '/admin/billing', desc: 'Generate invoice iuran bulanan per unit atau massal seluruh 123 rumah.', icon: Receipt },
        { title: 'Input Pembayaran & Verifikasi Transfer/QRIS', url: '/admin/payments', desc: 'Verifikasi setoran iuran warga, catat pembayaran tunai/manual & cetak kuitansi.', icon: CreditCard },
        { title: 'Input Pengeluaran Operasional Kas', url: '/admin/expenses', desc: 'Catat voucher belanja, kuitansi keluar kas, dan upload bukti transfer belanja.', icon: DollarSign },
        { title: 'Input Kasbon & Gaji Awal Staf', url: '/admin/staff-loans', desc: 'Kelola kasbon satpam/kebersihan, jadwal cicilan potong gaji, dan cetak slip kasbon.', icon: DollarSign },
        { title: 'Input Jurnal Buku Kas Umum (Ledger)', url: '/admin/ledger', desc: 'Catat debit/kredit manual kas paguyuban dan rekonsiliasi saldo bank.', icon: Wallet },
      ]
    },
    {
      category: 'OPERASIONAL KEAMANAN & KEBERSIHAN',
      color: 'border-amber-200 bg-amber-50/40 text-amber-900',
      items: [
        { title: 'Input Data Satpam, Roster & Patroli', url: '/admin/security-gate', desc: 'Kelola tim jaga pos, jadwal shift, absensi, checkpoint QR patroli & log tamu.', icon: Shield },
        { title: 'Input Staf Kebersihan, Rute Tossa & Checklist', url: '/admin/cleaning-staff', desc: 'Kelola petugas sampah, jadwal rute blok, armada Tossa, dan checklist harian.', icon: Truck },
        { title: 'Input Sarana, Fasilitas & Booking Fasum', url: '/admin/facilities', desc: 'Input aset balai warga/lapangan, catat izin peminjaman acara, jadwal servis.', icon: Building },
        { title: 'Input & Disposisi Aduan Masuk Warga', url: '/admin/complaints', desc: 'Tindak lanjuti komplain sampah, selokan got mampet, kebisingan, dsb.', icon: MessageCircle },
      ]
    },
    {
      category: 'KOMUNIKASI, VOTING & ARSIP DOKUMEN',
      color: 'border-purple-200 bg-purple-50/40 text-purple-900',
      items: [
        { title: 'Input Pengumuman & Broadcast WhatsApp', url: '/admin/announcements', desc: 'Buat pengumuman baru, sematkan di portal warga, kirim siaran massal WA.', icon: Megaphone },
        { title: 'Input Polling Musyawarah & E-Voting', url: '/admin/voting', desc: 'Buat polling persetujuan proyek fasilitas, pantau quick count pemilihan RT/RW.', icon: Vote },
        { title: 'Upload Arsip Dokumen & Peraturan', url: '/admin/documents', desc: 'Unggah file PDF SK pengurus, notulen rapat warga, tata tertib lingkungan.', icon: FolderOpen },
      ]
    }
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 p-4 bg-slate-900 text-white rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-ink flex items-center gap-2">
              <Settings className="w-6 h-6 text-primary-600" />
              Pusat Pengaturan, Branding & Direktori Sistem
            </h1>
            <span className="px-2.5 py-0.5 bg-primary-100 text-primary-900 font-black text-xs rounded-full border border-primary-300">
              Master Configuration
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Konfigurasi kustomisasi judul & sub-judul sistem, identitas perumahan, tarif iuran bulanan, rekening bank BCA kas, keamanan satpam, dan panduan form input.
          </p>
        </div>

        {saved && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-300 shadow-xs animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Tersimpan & Sinkron</span>
          </div>
        )}
      </div>

      {/* 4 Summary Metric KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
          <span className="text-[11px] text-ink-muted font-bold block">Status Sistem</span>
          <p className="text-lg font-black text-emerald-700 mt-1 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>100% Aktif & Siap</span>
          </p>
          <span className="text-[10px] text-emerald-600 font-bold">Terhubung Database Neon DB</span>
        </div>

        <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
          <span className="text-[11px] text-ink-muted font-bold block">Rekening Kas Utama</span>
          <p className="text-base font-black text-primary-700 mt-1 truncate">
            {bankName.split(' ')[0]} {bankAccount}
          </p>
          <span className="text-[10px] text-ink-muted font-bold truncate block">{accountHolder}</span>
        </div>

        <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
          <span className="text-[11px] text-ink-muted font-bold block">Iuran Default Bulanan</span>
          <p className="text-xl font-black text-ink mt-1 font-mono">
            {formatRupiah(Number(monthlyFee))}
          </p>
          <span className="text-[10px] text-primary-600 font-bold">Jatuh Tempo: Tgl {dueDay}</span>
        </div>

        <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
          <span className="text-[11px] text-ink-muted font-bold block">Hotline Satpam 24 Jam</span>
          <p className="text-sm font-black text-purple-700 mt-1 font-mono">
            {securityPhone}
          </p>
          <span className="text-[10px] text-purple-600 font-bold">Pos Utama & Gerbang Portal</span>
        </div>
      </div>

      {/* 8 Subtabs Navigation Bar */}
      <div className="flex items-center gap-2 p-1.5 bg-surface rounded-2xl border border-border shadow-xs overflow-x-auto no-scrollbar text-xs">
        {[
          { id: 'branding', label: '🎨 Judul, Sub-Judul & Branding', icon: Palette, highlight: true },
          { id: 'profile', label: '🏛️ Identitas & Wilayah', icon: Building },
          { id: 'finances', label: '💳 Tarif Iuran & Bank Kas', icon: CreditCard },
          { id: 'security', label: '🛡️ Keamanan & Satpam', icon: Shield },
          { id: 'sanitation', label: '🧹 Kebersihan & Sampah', icon: Truck },
          { id: 'notifications', label: '🔔 Bot WhatsApp & Broadcast', icon: Bell },
          { id: 'committee', label: '👥 Pengurus RT/RW', icon: Users },
          { id: 'inputs_directory', label: '📍 Peta Jalan Form Input Data', icon: Layers },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-primary-600 text-white shadow-xs'
                  : tab.highlight
                  ? 'bg-primary-50 text-primary-800 border border-primary-200 hover:bg-primary-100'
                  : 'text-ink-muted hover:text-ink hover:bg-canvas'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= TAB 1: BRANDING, JUDUL & SUB-JUDUL SISTEM ================= */}
      {activeTab === 'branding' && (
        <form onSubmit={handleSave} className="space-y-6 text-xs animate-in fade-in duration-150">
          <div className="p-6 bg-surface rounded-3xl border border-border shadow-card space-y-5">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Palette className="w-5 h-5 text-primary-600" />
              <div>
                <h3 className="font-black text-sm text-ink">Kustomisasi Judul & Sub-Judul Sistem</h3>
                <p className="text-ink-muted text-[11px]">
                  Ubah nama aplikasi, teks banner login, heading dashboard admin, dan portal warga sesuai identitas komplek Anda.
                </p>
              </div>
            </div>

            {/* Live Preview Box */}
            <div className="p-5 bg-canvas rounded-3xl border border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-primary-900 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-primary-600" />
                  <span>Simulasi Preview Langsung Tampilan Teks:</span>
                </span>

                <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-border">
                  <button
                    type="button"
                    onClick={() => setBrandingPreviewScreen('login')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold ${
                      brandingPreviewScreen === 'login' ? 'bg-primary-600 text-white' : 'text-ink-muted'
                    }`}
                  >
                    Layar Login
                  </button>
                  <button
                    type="button"
                    onClick={() => setBrandingPreviewScreen('admin_dash')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold ${
                      brandingPreviewScreen === 'admin_dash' ? 'bg-primary-600 text-white' : 'text-ink-muted'
                    }`}
                  >
                    Dashboard Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => setBrandingPreviewScreen('resident_dash')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold ${
                      brandingPreviewScreen === 'resident_dash' ? 'bg-primary-600 text-white' : 'text-ink-muted'
                    }`}
                  >
                    Portal Warga
                  </button>
                </div>
              </div>

              {/* Screen Preview Render */}
              <div className="p-6 bg-surface rounded-2xl border border-border shadow-inner text-center space-y-2">
                {brandingPreviewScreen === 'login' && (
                  <div className="max-w-md mx-auto space-y-2 py-4">
                    <div className="w-12 h-12 bg-primary-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
                      <Building className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-black text-ink">{loginTitle || 'WargaHub'}</h2>
                    <p className="text-xs text-ink-muted">{loginSubtitle || 'Sistem Tata Kelola & Transparansi Komplek'}</p>
                    <div className="p-3 bg-canvas rounded-xl border border-border/80 text-[10px] text-ink-muted mt-2">
                      [Form Input Username & Password Warga/Pengurus]
                    </div>
                  </div>
                )}

                {brandingPreviewScreen === 'admin_dash' && (
                  <div className="text-left space-y-1 py-2">
                    <span className="text-[10px] text-primary-700 font-bold uppercase tracking-wider">Halaman Admin</span>
                    <h2 className="text-2xl font-black text-ink">{adminDashTitle || 'Dashboard Ketua Komplek'}</h2>
                    <p className="text-xs text-ink-muted">{adminDashSubtitle || 'Ringkasan informasi dan aktivitas penting komplek.'}</p>
                  </div>
                )}

                {brandingPreviewScreen === 'resident_dash' && (
                  <div className="text-left space-y-1 py-2">
                    <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">Halaman Warga</span>
                    <h2 className="text-2xl font-black text-ink">{residentPortalTitle || 'Portal Warga Komplek'}</h2>
                    <p className="text-xs text-ink-muted">{residentPortalSubtitle || 'Layanan Iuran, Keamanan, Fasilitas & Aduan Warga 24 Jam'}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Inputs Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              {/* Login Title & Subtitle */}
              <div className="p-4 bg-canvas rounded-2xl border border-border space-y-3">
                <div className="flex items-center gap-2 border-b border-border pb-2">
                  <Smartphone className="w-4 h-4 text-primary-600" />
                  <strong className="text-xs text-ink">1. Teks Halaman Login Masuk</strong>
                </div>

                <div>
                  <label className="font-bold text-ink block mb-1">Judul Login (Title) *</label>
                  <input
                    type="text"
                    value={loginTitle}
                    onChange={(e) => setLoginTitle(e.target.value)}
                    required
                    placeholder="Contoh: WargaHub / Portal Komplek"
                    className="w-full p-2.5 bg-surface border border-border rounded-xl font-bold text-ink"
                  />
                </div>

                <div>
                  <label className="font-bold text-ink block mb-1">Sub-Judul Login (Subtitle) *</label>
                  <input
                    type="text"
                    value={loginSubtitle}
                    onChange={(e) => setLoginSubtitle(e.target.value)}
                    required
                    placeholder="Contoh: Sistem Tata Kelola & Transparansi Komplek Taman Sejahtera"
                    className="w-full p-2.5 bg-surface border border-border rounded-xl text-ink"
                  />
                </div>
              </div>

              {/* Admin Dashboard Title & Subtitle */}
              <div className="p-4 bg-canvas rounded-2xl border border-border space-y-3">
                <div className="flex items-center gap-2 border-b border-border pb-2">
                  <Layout className="w-4 h-4 text-emerald-600" />
                  <strong className="text-xs text-ink">2. Teks Heading Dashboard Admin</strong>
                </div>

                <div>
                  <label className="font-bold text-ink block mb-1">Judul Dashboard Admin (Heading) *</label>
                  <input
                    type="text"
                    value={adminDashTitle}
                    onChange={(e) => setAdminDashTitle(e.target.value)}
                    required
                    placeholder="Contoh: Dashboard Ketua Komplek"
                    className="w-full p-2.5 bg-surface border border-border rounded-xl font-bold text-ink"
                  />
                </div>

                <div>
                  <label className="font-bold text-ink block mb-1">Sub-Judul Dashboard Admin (Subheading) *</label>
                  <input
                    type="text"
                    value={adminDashSubtitle}
                    onChange={(e) => setAdminDashSubtitle(e.target.value)}
                    required
                    placeholder="Contoh: Ringkasan informasi dan aktivitas penting komplek."
                    className="w-full p-2.5 bg-surface border border-border rounded-xl text-ink"
                  />
                </div>
              </div>

              {/* Resident Portal Title & Subtitle */}
              <div className="p-4 bg-canvas rounded-2xl border border-border space-y-3">
                <div className="flex items-center gap-2 border-b border-border pb-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <strong className="text-xs text-ink">3. Teks Heading Portal Warga</strong>
                </div>

                <div>
                  <label className="font-bold text-ink block mb-1">Judul Portal Warga (Title) *</label>
                  <input
                    type="text"
                    value={residentPortalTitle}
                    onChange={(e) => setResidentPortalTitle(e.target.value)}
                    required
                    placeholder="Contoh: Portal Warga Komplek"
                    className="w-full p-2.5 bg-surface border border-border rounded-xl font-bold text-ink"
                  />
                </div>

                <div>
                  <label className="font-bold text-ink block mb-1">Sub-Judul Portal Warga (Subtitle) *</label>
                  <input
                    type="text"
                    value={residentPortalSubtitle}
                    onChange={(e) => setResidentPortalSubtitle(e.target.value)}
                    required
                    placeholder="Contoh: Layanan Iuran, Keamanan, Fasilitas & Aduan Warga 24 Jam"
                    className="w-full p-2.5 bg-surface border border-border rounded-xl text-ink"
                  />
                </div>
              </div>

              {/* Master System Name & Slogan */}
              <div className="p-4 bg-canvas rounded-2xl border border-border space-y-3">
                <div className="flex items-center gap-2 border-b border-border pb-2">
                  <Globe className="w-4 h-4 text-amber-600" />
                  <strong className="text-xs text-ink">4. Nama Master Sistem & Tagline</strong>
                </div>

                <div>
                  <label className="font-bold text-ink block mb-1">Nama Utama Aplikasi / Sistem</label>
                  <input
                    type="text"
                    value={systemTitle}
                    onChange={(e) => setSystemTitle(e.target.value)}
                    placeholder="WargaHub"
                    className="w-full p-2.5 bg-surface border border-border rounded-xl font-bold text-ink"
                  />
                </div>

                <div>
                  <label className="font-bold text-ink block mb-1">Tagline Slogan Footer</label>
                  <input
                    type="text"
                    value={footerBadgeText}
                    onChange={(e) => setFooterBadgeText(e.target.value)}
                    placeholder="Guyub Rukun, Aman, Asri & Transparan Berbasis Digital"
                    className="w-full p-2.5 bg-surface border border-border rounded-xl text-ink italic"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Action Bar */}
          <div className="p-4 bg-surface rounded-3xl border border-border shadow-card flex items-center justify-between">
            <div className="flex items-center gap-2 text-ink-muted text-xs">
              <Sparkles className="w-4 h-4 text-primary-600" />
              <span>Perubahan judul dan sub-judul akan seketika tampil di login, dashboard dan seluruh modul.</span>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Menyimpan Judul...' : 'Simpan Kustomisasi Judul'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ================= TAB 2: IDENTITAS & WILAYAH ================= */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSave} className="space-y-6 text-xs animate-in fade-in duration-150">
          <div className="p-6 bg-surface rounded-3xl border border-border shadow-card space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Building className="w-5 h-5 text-primary-600" />
              <div>
                <h3 className="font-black text-sm text-ink">Identitas & Wilayah Lingkungan Komplek</h3>
                <p className="text-ink-muted text-[11px]">Nama resmi dan alamat administratif perumahan yang tampil di kuitansi dan portal warga.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-ink block mb-1">Nama Komplek / Perumahan *</label>
                <input
                  type="text"
                  value={communityName}
                  onChange={(e) => setCommunityName(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                />
              </div>
              <div>
                <label className="font-bold text-ink block mb-1">Rukun Tetangga / RW *</label>
                <input
                  type="text"
                  value={rtRw}
                  onChange={(e) => setRtRw(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-ink block mb-1">Alamat Lengkap / Jalan Utama *</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-ink block mb-1">Kelurahan & Kecamatan</label>
                <input
                  type="text"
                  value={subdistrict}
                  onChange={(e) => setSubdistrict(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>
              <div>
                <label className="font-bold text-ink block mb-1">Kota & Kode Pos</label>
                <input
                  type="text"
                  value={cityPostal}
                  onChange={(e) => setCityPostal(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-ink block mb-1">Nomor SK Penetapan Kepengurusan</label>
                <input
                  type="text"
                  value={skNumber}
                  onChange={(e) => setSkNumber(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink"
                />
              </div>
              <div>
                <label className="font-bold text-ink block mb-1">Motto / Slogan Lingkungan</label>
                <input
                  type="text"
                  value={motto}
                  onChange={(e) => setMotto(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink italic"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-surface rounded-3xl border border-border shadow-card flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Menyimpan...' : 'Simpan Identitas'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ================= TAB 3: KEUANGAN, TARIF & REKENING BANK ================= */}
      {activeTab === 'finances' && (
        <form onSubmit={handleSave} className="space-y-6 text-xs animate-in fade-in duration-150">
          <div className="p-6 bg-surface rounded-3xl border border-border shadow-card space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="font-black text-sm text-ink">Tarif Iuran Bulanan, Rekening Kas & QRIS</h3>
                <p className="text-ink-muted text-[11px]">Konfigurasi nominal tagihan bulanan default dan rekening resmi penerima iuran warga.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="font-bold text-ink block mb-1">Total Iuran Bulanan (Rp) *</label>
                <input
                  type="number"
                  value={monthlyFee}
                  onChange={(e) => setMonthlyFee(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-black text-ink font-mono"
                />
                <span className="text-[10px] text-ink-muted mt-1 block">Default: Rp 750.000</span>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Retribusi Sampah (Rp)</label>
                <input
                  type="number"
                  value={trashFee}
                  onChange={(e) => setTrashFee(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Keamanan Satpam (Rp)</label>
                <input
                  type="number"
                  value={securityFee}
                  onChange={(e) => setSecurityFee(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Kas Cadangan Fasum (Rp)</label>
                <input
                  type="number"
                  value={facilityReserveFee}
                  onChange={(e) => setFacilityReserveFee(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-ink block mb-1">Tanggal Jatuh Tempo *</label>
                <input
                  type="number"
                  min="1"
                  max="28"
                  value={dueDay}
                  onChange={(e) => setDueDay(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink font-mono"
                />
                <span className="text-[10px] text-ink-muted mt-1 block">Tiap tgl {dueDay} per bulan</span>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Masa Tenggang (Hari)</label>
                <input
                  type="number"
                  value={gracePeriodDays}
                  onChange={(e) => setGracePeriodDays(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Kode QRIS NMID Nasional</label>
                <input
                  type="text"
                  value={qrisNmid}
                  onChange={(e) => setQrisNmid(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono font-bold text-ink"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-border">
              <div>
                <label className="font-bold text-ink block mb-1">Nama Bank Kas Paguyuban *</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Nomor Rekening Bank *</label>
                <input
                  type="text"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono font-black text-ink text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Nama Pemilik Rekening (Atas Nama) *</label>
                <input
                  type="text"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-surface rounded-3xl border border-border shadow-card flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Menyimpan...' : 'Simpan Keuangan & Bank'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ================= TAB 4: KEAMANAN & SATPAM ================= */}
      {activeTab === 'security' && (
        <form onSubmit={handleSave} className="space-y-6 text-xs animate-in fade-in duration-150">
          <div className="p-6 bg-surface rounded-3xl border border-border shadow-card space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Shield className="w-5 h-5 text-purple-600" />
              <div>
                <h3 className="font-black text-sm text-ink">Keamanan Lingkungan, Barrier Gate & Patroli</h3>
                <p className="text-ink-muted text-[11px]">Konfigurasi nomor kontak darurat satpam dan SOP gerbang utama.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-ink block mb-1">Hotline Pos Satpam Utama (24 Jam) *</label>
                <input
                  type="text"
                  value={securityPhone}
                  onChange={(e) => setSecurityPhone(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono font-bold text-ink"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Hotline Pos Gerbang 2 (Belakang)</label>
                <input
                  type="text"
                  value={securityPhone2}
                  onChange={(e) => setSecurityPhone2(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-ink block mb-1">Jam Malam Penutupan Portal</label>
                <input
                  type="text"
                  value={gateClosingTime}
                  onChange={(e) => setGateClosingTime(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Masa Berlaku QR Pass Tamu (Jam)</label>
                <input
                  type="number"
                  value={guestPassExpiryHours}
                  onChange={(e) => setGuestPassExpiryHours(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Frekuensi Patroli Malam</label>
                <input
                  type="text"
                  value={patrolFrequency}
                  onChange={(e) => setPatrolFrequency(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-surface rounded-3xl border border-border shadow-card flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Menyimpan...' : 'Simpan Keamanan'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ================= TAB 5: KEBERSIHAN & SAMPAH ================= */}
      {activeTab === 'sanitation' && (
        <form onSubmit={handleSave} className="space-y-6 text-xs animate-in fade-in duration-150">
          <div className="p-6 bg-surface rounded-3xl border border-border shadow-card space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Truck className="w-5 h-5 text-teal-600" />
              <div>
                <h3 className="font-black text-sm text-ink">Standar Operasional Pengangkutan Sampah Komplek</h3>
                <p className="text-ink-muted text-[11px]">Jadwal operasional motor Tossa door-to-door dan pengelolaan TPS3R.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-ink block mb-1">Hari Pengangkutan Sampah Organik/Basah</label>
                <input
                  type="text"
                  value={organicWasteDays}
                  onChange={(e) => setOrganicWasteDays(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Hari Pengangkutan Sampah Anorganik/Daur Ulang</label>
                <input
                  type="text"
                  value={inorganicWasteDays}
                  onChange={(e) => setInorganicWasteDays(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-ink block mb-1">Jam Operasional Pengambilan Sampah</label>
                <input
                  type="text"
                  value={collectionHours}
                  onChange={(e) => setCollectionHours(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Lokasi TPS Penampungan Sementara</label>
                <input
                  type="text"
                  value={tpsLocation}
                  onChange={(e) => setTpsLocation(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-surface rounded-3xl border border-border shadow-card flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Menyimpan...' : 'Simpan Kebersihan'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ================= TAB 6: NOTIFIKASI & WHATSAPP ================= */}
      {activeTab === 'notifications' && (
        <form onSubmit={handleSave} className="space-y-6 text-xs animate-in fade-in duration-150">
          <div className="p-6 bg-surface rounded-3xl border border-border shadow-card space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Bell className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="font-black text-sm text-ink">Pengaturan Notifikasi & Broadcast WhatsApp</h3>
                <p className="text-ink-muted text-[11px]">Konfigurasi bot pengirim pesan WhatsApp dan jadwal reminder otomatis.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-ink block mb-1">Nama Pengirim Broadcast WA</label>
                <input
                  type="text"
                  value={waSenderName}
                  onChange={(e) => setWaSenderName(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Nomor WhatsApp Admin Pengurus</label>
                <input
                  type="text"
                  value={adminWaPhone}
                  onChange={(e) => setAdminWaPhone(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-ink block mb-1">Jadwal Pengingat Tagihan Otomatis</label>
              <input
                type="text"
                value={autoReminderDays}
                onChange={(e) => setAutoReminderDays(e.target.value)}
                className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
              />
            </div>
          </div>

          <div className="p-4 bg-surface rounded-3xl border border-border shadow-card flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Menyimpan...' : 'Simpan Notifikasi'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ================= TAB 7: PENGURUS INTI ================= */}
      {activeTab === 'committee' && (
        <form onSubmit={handleSave} className="space-y-6 text-xs animate-in fade-in duration-150">
          <div className="p-6 bg-surface rounded-3xl border border-border shadow-card space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Users className="w-5 h-5 text-teal-600" />
              <div>
                <h3 className="font-black text-sm text-ink">Susunan & Kontak Pengurus Inti Paguyuban</h3>
                <p className="text-ink-muted text-[11px]">Nama dan nomor kontak pengurus yang tercantum di surat pengumuman resmi dan kuitansi.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-ink block mb-1">Nama Ketua Paguyuban / RW *</label>
                <input
                  type="text"
                  value={rwHeadName}
                  onChange={(e) => setRwHeadName(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">No. WhatsApp Ketua RW *</label>
                <input
                  type="text"
                  value={rwHeadPhone}
                  onChange={(e) => setRwHeadPhone(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-ink block mb-1">Nama Sekretaris Paguyuban</label>
                <input
                  type="text"
                  value={secretaryName}
                  onChange={(e) => setSecretaryName(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Nama Bendahara Paguyuban</label>
                <input
                  type="text"
                  value={treasurerName}
                  onChange={(e) => setTreasurerName(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-ink block mb-1">Danru Keamanan Satpam</label>
                <input
                  type="text"
                  value={securityCoordName}
                  onChange={(e) => setSecurityCoordName(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Koordinator Kebersihan Lingkungan</label>
                <input
                  type="text"
                  value={cleaningCoordName}
                  onChange={(e) => setCleaningCoordName(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-surface rounded-3xl border border-border shadow-card flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Menyimpan...' : 'Simpan Pengurus'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ================= TAB 8: PUSAT DIREKTORI INPUT DATA LENGKAP ================= */}
      {activeTab === 'inputs_directory' && (
        <div className="space-y-6 animate-in fade-in duration-150 text-xs">
          <div className="p-5 bg-primary-50/70 border border-primary-200 rounded-3xl space-y-1">
            <h3 className="font-black text-sm text-primary-950 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary-600" />
              Pusat Panduan & Akses Cepat Form Input Data WargaHub
            </h3>
            <p className="text-primary-800 leading-relaxed">
              Berikut adalah peta jalan lengkap letak form penambahan dan pengeditan data di seluruh modul WargaHub. Klik pada tombol kartu untuk langsung membuka form input:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {inputModulesDirectory.map((group) => (
              <div key={group.category} className={`p-5 rounded-3xl border shadow-card space-y-3 ${group.color}`}>
                <h4 className="font-black text-xs tracking-wider uppercase flex items-center justify-between border-b border-black/10 pb-2">
                  <span>{group.category}</span>
                  <span className="text-[10px] font-bold opacity-80">{group.items.length} Form Input</span>
                </h4>

                <div className="space-y-2.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <a
                        key={item.title}
                        href={item.url}
                        className="p-3 bg-surface rounded-2xl border border-border/80 hover:border-primary-400 hover:shadow-md transition-all flex items-start justify-between gap-3 group text-ink"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-xl bg-canvas border border-border flex items-center justify-center shrink-0 text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <strong className="block text-xs font-bold text-ink group-hover:text-primary-700 transition-colors">
                              {item.title}
                            </strong>
                            <p className="text-[11px] text-ink-muted mt-0.5 leading-relaxed">
                              {item.desc}
                            </p>
                          </div>
                        </div>

                        <ArrowRight className="w-4 h-4 text-ink-muted group-hover:text-primary-600 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                      </a>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
