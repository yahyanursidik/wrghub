import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  Check,
  UserCircle2,
  LogOut,
  Settings,
  ShieldCheck,
  Building,
  CreditCard,
  MessageCircle,
  Wrench,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Users,
  Sparkles,
  AlertCircle,
  FolderOpen,
  Home,
  Receipt,
  FileMinus,
  Wallet,
  Clock,
  Car,
  Hammer,
  Gauge,
  KeyRound,
  Banknote,
  Truck,
  Vote,
  Megaphone,
  Calendar,
  X,
  ArrowRight,
  PlusCircle,
  QrCode,
  Smartphone
} from 'lucide-react';
import type { UserSession } from '../../types/auth';

const DEFAULT_HEADER_USER: UserSession = {
  id: 'usr-admin',
  username: 'admin',
  fullName: 'Pengurus Komplek',
  email: 'admin@wargahub.id',
  role: 'CHAIRMAN',
  avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
};

interface AdminHeaderProps {
  currentUser?: UserSession;
  searchPlaceholder?: string;
  onSearchClick?: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  detail: string;
  time: string;
  category: 'finance' | 'complaint' | 'security' | 'facility';
  unread: boolean;
  link: string;
  icon: any;
  iconColor: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  currentUser,
  searchPlaceholder = 'Cari rumah, warga, invoice, pembayaran...',
  onSearchClick,
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'finance' | 'complaint' | 'security'>('all');

  // Command Palette & Global Search Modal State
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState<'ALL' | 'NAV' | 'HOUSE' | 'ACTION'>('ALL');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global Keyboard Shortcut: Cmd/Ctrl + K or Slash to toggle search modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      } else if (e.key === 'Escape' && searchModalOpen) {
        setSearchModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchModalOpen]);

  useEffect(() => {
    if (searchModalOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [searchModalOpen]);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Active user session state
  const [activeUser, setActiveUser] = useState<UserSession>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('wargahub_user');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object') return parsed;
        }
      } catch (e) {}
    }
    return currentUser || DEFAULT_HEADER_USER;
  });

  // Notifications state (clean live / empty state)
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mark single notification as read
  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getInitials = (name?: string) => {
    if (!name || typeof name !== 'string') return 'BS';
    const clean = name.replace(/^(Bpk\.|Ibu|Dr\.|Ir\.|H\.|Hj\.)\s*/gi, '').trim();
    if (!clean) return 'BS';
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'BS';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + (parts[parts.length - 1][0] || '')).toUpperCase();
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeCategory === 'all') return true;
    return n.category === activeCategory;
  });

  // Indexed searchable items for Command Palette
  const commandItems = useMemo(() => [
    // 1. Navigation items
    { id: 'nav-dashboard', title: 'Ringkasan Dashboard Backoffice', subtitle: 'Pusat kontrol dan ringkasan eksekutif komplek', category: 'NAV', url: '/admin', icon: Home, keywords: ['beranda', 'home', 'dashboard', 'admin'] },
    { id: 'nav-props', title: 'Data Rumah & Kavling', subtitle: 'Manajemen master kavling A s/d M, luas & spesifikasi fisik', category: 'NAV', url: '/admin/properties', icon: Home, keywords: ['rumah', 'kavling', 'blok', 'unit'] },
    { id: 'nav-occupants', title: 'Data Penghuni', subtitle: 'Daftar kepala keluarga, penyewa, kontak & jumlah jiwa', category: 'NAV', url: '/admin/properties?tab=occupants', icon: Users, keywords: ['penghuni', 'warga', 'keluarga', 'kontrak'] },
    { id: 'nav-owners', title: 'Data Pemilik Rumah', subtitle: 'Informasi legal kepemilikan unit dan sertifikat', category: 'NAV', url: '/admin/properties?tab=owners', icon: UserCircle2, keywords: ['pemilik', 'owner', 'legal'] },
    { id: 'nav-vehicles', title: 'Data Kendaraan & RFID', subtitle: 'Plat nomor mobil/motor warga dan kartu akses gerbang', category: 'NAV', url: '/admin/properties?tab=vehicles', icon: Car, keywords: ['kendaraan', 'mobil', 'motor', 'plat', 'rfid'] },
    { id: 'nav-permits', title: 'Izin Renovasi & Pekerja', subtitle: 'Surat izin perbaikan bangunan dan daftar tukang', category: 'NAV', url: '/admin/properties?tab=permits', icon: Hammer, keywords: ['renovasi', 'izin', 'pekerja', 'tukang'] },
    { id: 'nav-analytics-prop', title: 'Utilitas & Okupansi', subtitle: 'Pencatatan meteran air, token listrik & analitik hunian', category: 'NAV', url: '/admin/properties?tab=analytics', icon: Gauge, keywords: ['utilitas', 'meteran', 'pam', 'pln', 'air'] },
    { id: 'nav-billing', title: 'Iuran Warga (IPL)', subtitle: 'Tagihan bulanan, status lunas/tertunda & reminder WA', category: 'NAV', url: '/admin/billing', icon: Receipt, keywords: ['iuran', 'ipl', 'tagihan', 'invoice'] },
    { id: 'nav-payments', title: 'Pembayaran & Verifikasi', subtitle: 'Bukti transfer warga, validasi kas & cetak kuitansi', category: 'NAV', url: '/admin/payments', icon: CreditCard, keywords: ['pembayaran', 'transfer', 'bayar', 'kuitansi', 'validasi'] },
    { id: 'nav-expenses', title: 'Pengeluaran Kas Operasional', subtitle: 'Catatan belanja, voucher kas keluar & bukti nota', category: 'NAV', url: '/admin/expenses', icon: FileMinus, keywords: ['pengeluaran', 'biaya', 'belanja', 'nota'] },
    { id: 'nav-staff-loans', title: 'Buku Kasbon & Gaji Awal', subtitle: 'Pinjaman dinas satpam & cicilan potong honor bulanan', category: 'NAV', url: '/admin/staff-loans', icon: Banknote, keywords: ['kasbon', 'pinjaman', 'gaji', 'satpam'] },
    { id: 'nav-ledger', title: 'Kas & Buku Besar', subtitle: 'Mutasi arus kas, saldo rekening bank & rekonsiliasi', category: 'NAV', url: '/admin/ledger', icon: Wallet, keywords: ['buku besar', 'ledger', 'kas', 'saldo', 'bank'] },
    { id: 'nav-budget', title: 'Anggaran APB & Sinking Fund', subtitle: 'Realisasi anggaran tahunan dan dana cadangan darurat', category: 'NAV', url: '/admin/budget', icon: Clock, keywords: ['apb', 'anggaran', 'budget', 'sinking fund', 'cadangan'] },
    { id: 'nav-analytics', title: 'Analitik & Tren Finansial', subtitle: 'Kepatuhan pembayaran per blok & visualisasi metrik', category: 'NAV', url: '/admin/analytics', icon: Clock, keywords: ['analitik', 'grafik', 'tren', 'kepatuhan'] },
    { id: 'nav-security', title: 'Pos Satpam & Gerbang Digital', subtitle: 'Buku tamu, verifikasi QR pass, jadwal ronda & inventaris', category: 'NAV', url: '/admin/security-gate', icon: ShieldCheck, keywords: ['satpam', 'pos', 'gerbang', 'patroli', 'ronda', 'tamu', 'pass'] },
    { id: 'nav-cleaning', title: 'Tim Kebersihan & Armada TPS', subtitle: 'Jadwal angkut sampah dinas LH, rute & armada kebersihan', category: 'NAV', url: '/admin/cleaning-staff', icon: Truck, keywords: ['kebersihan', 'sampah', 'tps', 'taman', 'got'] },
    { id: 'nav-complaints', title: 'Aduan & Keluhan Warga', subtitle: 'Pelaporan fasilitas rusak, kebisingan & tindak lanjut', category: 'NAV', url: '/admin/complaints', icon: MessageCircle, keywords: ['aduan', 'keluhan', 'laporan', 'rusak'] },
    { id: 'nav-facilities', title: 'Sarana & Fasilitas Fasum', subtitle: 'Balai warga, lapangan olahraga, kolam renang & booking', category: 'NAV', url: '/admin/facilities', icon: Building, keywords: ['fasum', 'balai', 'lapangan', 'booking', 'fasilitas'] },
    { id: 'nav-announcements', title: 'Pengumuman Resmi', subtitle: 'Broadcast informasi penting, himbauan & siaran massal', category: 'NAV', url: '/admin/announcements', icon: Megaphone, keywords: ['pengumuman', 'broadcast', 'surat', 'info'] },
    { id: 'nav-voting', title: 'E-Voting & Polling Musyawarah', subtitle: 'Pemilihan ketua RT/komplek & jajak pendapat warga', category: 'NAV', url: '/admin/voting', icon: Vote, keywords: ['voting', 'polling', 'pemilihan', 'suara'] },
    { id: 'nav-whatsapp', title: 'Bot & Template WhatsApp', subtitle: 'Simulator pesan otomatis, cek tagihan & template broadcast', category: 'NAV', url: '/admin/whatsapp-bot', icon: MessageCircle, keywords: ['whatsapp', 'bot', 'wa', 'template', 'pesan'] },
    { id: 'nav-passwords', title: 'Manajemen Akun & Password', subtitle: 'Daftar kredensial warga, reset PIN & proteksi akun', category: 'NAV', url: '/admin/settings?tab=passwords', icon: KeyRound, keywords: ['password', 'akun', 'pin', 'kredensial', 'reset'] },
    { id: 'nav-documents', title: 'Arsip Dokumen Legal', subtitle: 'AD/ART, tata tertib, SK kepengurusan & formulir PDF', category: 'NAV', url: '/admin/documents', icon: FolderOpen, keywords: ['dokumen', 'arsip', 'sk', 'tatib', 'ad/art'] },
    { id: 'nav-audit', title: 'Jejak Audit & Keamanan', subtitle: 'Log riwayat seluruh aksi admin dan rekonsiliasi data', category: 'NAV', url: '/admin/audit', icon: ShieldCheck, keywords: ['audit', 'log', 'riwayat', 'keamanan'] },
    { id: 'nav-backup', title: 'Backup & Pencadangan Data', subtitle: 'Ekspor database JSON/CSV & restorasi cadangan sistem', category: 'NAV', url: '/admin/backup', icon: FolderOpen, keywords: ['backup', 'cadangan', 'ekspor', 'restore'] },
    { id: 'nav-settings', title: 'Pengaturan Sistem & Komunitas', subtitle: 'Profil paguyuban, rekening resmi & tarif IPL', category: 'NAV', url: '/admin/settings', icon: Settings, keywords: ['pengaturan', 'settings', 'profil', 'rekening', 'tarif'] },

    // 2. Kavling Warga
    { id: 'house-kav-a', title: 'Kav A - Pak Verial', subtitle: 'Unit Terisi • Lunas Penuh 9 Bulan', category: 'HOUSE', url: '/admin/properties', icon: Home, badge: 'Lunas', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300', keywords: ['kav a', 'verial'] },
    { id: 'house-kav-b', title: 'Kav B - Mahasiswa Polban', subtitle: 'Unit Sewa/Kontrak • Lunas September 2026', category: 'HOUSE', url: '/admin/properties', icon: Home, badge: 'Lunas', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300', keywords: ['kav b', 'polban', 'kontrak', 'sewa'] },
    { id: 'house-kav-c', title: 'Kav C - Bu Rina', subtitle: 'Unit Terisi • Lunas September 2026', category: 'HOUSE', url: '/admin/properties', icon: Home, badge: 'Lunas', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300', keywords: ['kav c', 'rina'] },
    { id: 'house-kav-d', title: 'Kav D - Pak Rieva', subtitle: 'Unit Terisi • Lunas September 2026', category: 'HOUSE', url: '/admin/properties', icon: Home, badge: 'Lunas', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300', keywords: ['kav d', 'rieva'] },
    { id: 'house-kav-e', title: 'Kav E - Pak Budi', subtitle: 'Unit Terisi • Lunas Penuh (Tertib Iuran)', category: 'HOUSE', url: '/admin/properties', icon: Home, badge: 'Lunas', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300', keywords: ['kav e', 'budi', 'endang'] },
    { id: 'house-kav-f', title: 'Kav F - Pa Anggia', subtitle: 'Unit Terisi • Lunas September 2026', category: 'HOUSE', url: '/admin/properties', icon: Home, badge: 'Lunas', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300', keywords: ['kav f', 'anggia'] },
    { id: 'house-kav-g', title: 'Kav G - Pak Misael', subtitle: 'Unit Terisi • Lunas September 2026', category: 'HOUSE', url: '/admin/properties', icon: Home, badge: 'Lunas', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300', keywords: ['kav g', 'misael'] },
    { id: 'house-kav-h', title: 'Kav H - Pak Fahmi Rizal', subtitle: 'Unit Terisi • Lunas September 2026', category: 'HOUSE', url: '/admin/properties', icon: Home, badge: 'Lunas', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300', keywords: ['kav h', 'fahmi', 'rizal'] },
    { id: 'house-kav-i', title: 'Kav I - Pak Yahya', subtitle: 'Unit Terisi • Lunas September 2026', category: 'HOUSE', url: '/admin/properties', icon: Home, badge: 'Lunas', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300', keywords: ['kav i', 'yahya'] },
    { id: 'house-kav-j', title: 'Kav J - Bu Sofia P (Kosong)', subtitle: 'Unit Kosong • Menunggak 4 Bulan', category: 'HOUSE', url: '/admin/properties', icon: Home, badge: 'Tertunda', badgeColor: 'bg-rose-100 text-rose-800 border-rose-300', keywords: ['kav j', 'sofia', 'kosong'] },
    { id: 'house-kav-k', title: 'Kav K - Pak Eky', subtitle: 'Unit Terisi • Lunas September 2026', category: 'HOUSE', url: '/admin/properties', icon: Home, badge: 'Lunas', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300', keywords: ['kav k', 'eky'] },
    { id: 'house-kav-l', title: 'Kav L - Pak Haji Ano', subtitle: 'Unit Terisi • Lunas September 2026', category: 'HOUSE', url: '/admin/properties', icon: Home, badge: 'Lunas', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300', keywords: ['kav l', 'ano', 'haji'] },
    { id: 'house-kav-m', title: 'Kav M - Pak Dedi N / Pak Jaya', subtitle: 'Unit Terisi • Lunas September 2026', category: 'HOUSE', url: '/admin/properties', icon: Home, badge: 'Lunas', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300', keywords: ['kav m', 'dedi', 'jaya'] },

    // 3. Quick Actions
    { id: 'act-new-payment', title: 'Catat Pembayaran Iuran Baru', subtitle: 'Input setoran transfer warga atau pembayaran tunai', category: 'ACTION', url: '/admin/payments', icon: PlusCircle, badge: 'Aksi', badgeColor: 'bg-blue-100 text-blue-800 border-blue-300', keywords: ['catat', 'bayar', 'setor', 'input bayar'] },
    { id: 'act-new-expense', title: 'Buat Pengeluaran Kas Baru', subtitle: 'Catat pengeluaran operasional atau pembelian material', category: 'ACTION', url: '/admin/expenses', icon: PlusCircle, badge: 'Aksi', badgeColor: 'bg-blue-100 text-blue-800 border-blue-300', keywords: ['pengeluaran', 'belanja', 'input pengeluaran'] },
    { id: 'act-verify-pass', title: 'Scan & Verifikasi Pas Tamu Gerbang', subtitle: 'Validasi QR tamu atau kuitansi warga di Pos Satpam', category: 'ACTION', url: '/admin/security-gate', icon: QrCode, badge: 'Satpam', badgeColor: 'bg-purple-100 text-purple-800 border-purple-300', keywords: ['scan', 'verifikasi', 'qr', 'pass', 'tamu'] },
    { id: 'act-public-transparency', title: 'Buka Portal Transparansi Publik', subtitle: 'Laporan real-time kas & iuran yang dapat diakses publik', category: 'ACTION', url: '/transparency', icon: ExternalLink, badge: 'Publik', badgeColor: 'bg-teal-100 text-teal-800 border-teal-300', keywords: ['transparansi', 'publik', 'kas'] },
    { id: 'act-resident-mobile', title: 'Buka Portal Warga Mandiri (Mobile)', subtitle: 'Pratinjau antarmuka warga smartphone 24 jam', category: 'ACTION', url: '/warga', icon: Smartphone, badge: 'Warga', badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300', keywords: ['portal warga', 'mobile', 'warga'] },
  ], []);

  const filteredCommandItems = useMemo(() => {
    return commandItems.filter((item) => {
      if (searchCategory !== 'ALL' && item.category !== searchCategory) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSubtitle = item.subtitle.toLowerCase().includes(q);
      const matchKeywords = item.keywords?.some((k) => k.toLowerCase().includes(q));
      return matchTitle || matchSubtitle || matchKeywords;
    });
  }, [commandItems, searchQuery, searchCategory]);

  return (
    <header className="h-16 px-6 sm:px-8 bg-surface border-b border-border flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Global Search Bar */}
      <div className="w-80 sm:w-96 max-w-md">
        <button
          onClick={onSearchClick || (() => setSearchModalOpen(true))}
          type="button"
          className="w-full flex items-center gap-2.5 px-3.5 py-2 bg-canvas/70 hover:bg-canvas border border-border rounded-xl text-xs sm:text-sm text-ink-muted transition-colors text-left group shadow-2xs"
        >
          <Search className="w-4 h-4 text-ink-muted group-hover:text-primary-600 transition-colors" />
          <span className="flex-1 truncate">{searchPlaceholder}</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold text-ink-muted bg-surface border border-border rounded">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* ================= NOTIFICATION BELL & POPOVER ================= */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => {
              setNotificationOpen(!notificationOpen);
              setProfileDropdownOpen(false);
            }}
            className={`relative p-2 rounded-xl transition-all ${
              notificationOpen
                ? 'bg-primary-50 text-primary-700 shadow-xs'
                : 'text-ink-muted hover:text-ink hover:bg-canvas'
            }`}
            title="Pemberitahuan & Notifikasi"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-600 text-white text-[10px] font-black ring-2 ring-surface animate-in zoom-in-50">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown Panel */}
          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface rounded-3xl shadow-modal border border-border overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
              {/* Header */}
              <div className="p-4 border-b border-border flex items-center justify-between bg-canvas/40">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm text-ink flex items-center gap-1.5">
                    <span>Notifikasi Sistem</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                        {unreadCount} Baru
                      </span>
                    )}
                  </h4>
                </div>

                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      className="text-[11px] font-bold text-primary-700 hover:text-primary-800 hover:underline px-2 py-1"
                    >
                      Tandai Dibaca
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      type="button"
                      onClick={clearAllNotifications}
                      className="p-1 text-ink-muted hover:text-red-600 rounded-lg transition-colors"
                      title="Bersihkan Semua Notifikasi"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border/80 bg-canvas/20 overflow-x-auto no-scrollbar text-[11px]">
                {[
                  { id: 'all', label: 'Semua' },
                  { id: 'finance', label: '💰 Keuangan' },
                  { id: 'complaint', label: '🚨 Aduan' },
                  { id: 'security', label: '🛡️ Keamanan' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCategory(tab.id as any)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all whitespace-nowrap ${
                      activeCategory === tab.id
                        ? 'bg-primary-600 text-white shadow-2xs'
                        : 'text-ink-muted hover:text-ink hover:bg-canvas'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Notification List */}
              <div className="max-h-80 overflow-y-auto modern-scrollbar divide-y divide-border/60">
                {filteredNotifications.length === 0 ? (
                  <div className="p-8 text-center text-ink-muted space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto opacity-70" />
                    <p className="text-xs font-bold text-ink">Tidak ada notifikasi baru</p>
                    <p className="text-[11px]">Semua aktivitas dan tagihan komplek berjalan lancar.</p>
                  </div>
                ) : (
                  filteredNotifications.map((item) => {
                    const Icon = item.icon;
                    return (
                      <a
                        key={item.id}
                        href={item.link}
                        onClick={() => {
                          markAsRead(item.id);
                          setNotificationOpen(false);
                        }}
                        className={`p-3.5 flex items-start gap-3 hover:bg-canvas transition-colors group relative ${
                          item.unread ? 'bg-primary-50/30' : ''
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.iconColor}`}>
                          <Icon className="w-4 h-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h5 className="font-bold text-xs text-ink group-hover:text-primary-700 transition-colors truncate">
                              {item.title}
                            </h5>
                            {item.unread && (
                              <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-ink-muted mt-0.5 line-clamp-2 leading-relaxed">
                            {item.detail}
                          </p>
                          <span className="text-[10px] text-ink-muted/80 mt-1 block">
                            {item.time}
                          </span>
                        </div>
                      </a>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="p-2.5 border-t border-border bg-canvas/40 text-center">
                <a
                  href="/admin/audit"
                  onClick={() => setNotificationOpen(false)}
                  className="text-xs font-bold text-primary-700 hover:text-primary-800 flex items-center justify-center gap-1.5 py-1"
                >
                  <span>Lihat Seluruh Jejak Audit & Log</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-border" />

        {/* ================= USER PROFILE (INITIALS AVATAR) ================= */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => {
              setProfileDropdownOpen(!profileDropdownOpen);
              setNotificationOpen(false);
            }}
            className={`flex items-center gap-2.5 p-1.5 pl-2 rounded-2xl transition-all ${
              profileDropdownOpen ? 'bg-canvas shadow-xs' : 'hover:bg-canvas'
            }`}
          >
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-primary-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs ring-2 ring-primary-100 uppercase tracking-wider">
                {getInitials(activeUser.fullName)}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-surface" />
            </div>

            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-ink leading-tight flex items-center gap-1">
                {activeUser.fullName}
              </div>
              <div className="text-[11px] text-ink-muted font-medium">
                {activeUser.role === 'CHAIRMAN'
                  ? 'Ketua Komplek'
                  : activeUser.role === 'TREASURER'
                  ? 'Bendahara Paguyuban'
                  : activeUser.role === 'SECRETARY'
                  ? 'Sekretaris Paguyuban'
                  : activeUser.role === 'SECURITY'
                  ? 'Petugas Satpam Pos'
                  : activeUser.role === 'MAINTENANCE'
                  ? 'Kebersihan & Teknisi'
                  : activeUser.role === 'HOUSEHOLD_HEAD' || activeUser.role === 'RESIDENT'
                  ? 'Warga Komplek'
                  : 'Pengurus Komplek'}
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-ink-muted ml-0.5" />
          </button>

          {/* Clean User Profile Dropdown */}
          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-surface rounded-3xl shadow-modal border border-border py-2 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
              {/* Profile Card Header */}
              <div className="p-4 border-b border-border bg-canvas/40 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 text-white font-black text-sm flex items-center justify-center shadow-sm ring-2 ring-primary-100 uppercase tracking-wider shrink-0">
                    {getInitials(activeUser.fullName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-black text-sm text-ink truncate">{activeUser.fullName}</h4>
                    <span className="inline-block px-2 py-0.5 bg-primary-100 text-primary-900 font-bold text-[10px] rounded-full mt-0.5">
                      {activeUser.role === 'CHAIRMAN'
                        ? 'Ketua Paguyuban'
                        : activeUser.role === 'TREASURER'
                        ? 'Bendahara Paguyuban'
                        : activeUser.role === 'SECRETARY'
                        ? 'Sekretaris Paguyuban'
                        : activeUser.role === 'SECURITY'
                        ? 'Petugas Satpam Pos'
                        : activeUser.role === 'MAINTENANCE'
                        ? 'Kebersihan & Teknisi'
                        : 'Warga Komplek'}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-ink-muted space-y-0.5 pt-1">
                  <p className="truncate">📧 {activeUser.email || `${activeUser.username}@wargahub.id`}</p>
                  <p className="text-emerald-700 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Sesi Login Terverifikasi Aktif</span>
                  </p>
                </div>
              </div>

              {/* Action Menu Links */}
              <div className="py-1.5 space-y-0.5 px-1.5">
                {activeUser.role === 'CHAIRMAN' && (
                  <a
                    href="/admin/settings"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-bold text-ink hover:bg-canvas hover:text-primary-700 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-ink-muted" />
                    <span>Pengaturan Profil & Sistem</span>
                  </a>
                )}

                <a
                  href="/warga"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-bold text-primary-700 bg-primary-50/70 hover:bg-primary-100 transition-colors"
                >
                  <UserCircle2 className="w-4 h-4 text-primary-600" />
                  <span>Buka Tampilan Portal Warga</span>
                </a>

                {['CHAIRMAN', 'SECRETARY', 'TREASURER'].includes(activeUser.role) && (
                  <a
                    href="/admin/audit"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-bold text-ink hover:bg-canvas hover:text-primary-700 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-ink-muted" />
                    <span>Jejak Audit & Keamanan</span>
                  </a>
                )}

                <a
                  href="/transparency"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-bold text-ink hover:bg-canvas hover:text-primary-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-ink-muted" />
                  <span>Laporan Transparansi Publik</span>
                </a>
              </div>

              {/* Logout Bar */}
              <div className="border-t border-border mt-1 pt-1.5 px-1.5">
                <button
                  type="button"
                  onClick={async () => {
                    setProfileDropdownOpen(false);
                    try {
                      await fetch('/api/auth/logout', { method: 'POST' });
                    } catch (e) {}
                    if (typeof window !== 'undefined') {
                      localStorage.removeItem('wargahub_user');
                      window.location.href = '/login';
                    }
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-bold text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Keluar (Logout Akun)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= GLOBAL SEARCH & COMMAND PALETTE (CMD+K) MODAL ================= */}
      {searchModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setSearchModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-surface rounded-3xl shadow-modal border border-border overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150 text-ink"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Bar */}
            <div className="p-4 border-b border-border bg-canvas/40 flex items-center gap-3">
              <Search className="w-5 h-5 text-primary-600 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ketik untuk mencari menu, rumah, warga, atau aksi..."
                className="w-full bg-transparent text-sm sm:text-base font-semibold text-ink placeholder:text-ink-muted focus:outline-hidden"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 rounded-lg text-ink-muted hover:text-ink hover:bg-canvas text-xs"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <div className="flex items-center gap-1.5 shrink-0">
                <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold text-ink-muted bg-surface border border-border rounded-md shadow-2xs">
                  ESC untuk tutup
                </kbd>
                <button
                  type="button"
                  onClick={() => setSearchModalOpen(false)}
                  className="p-1.5 rounded-xl text-ink-muted hover:text-ink hover:bg-canvas transition-colors sm:hidden"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 px-4 py-2 border-b border-border bg-canvas/20 text-xs overflow-x-auto no-scrollbar">
              {[
                { id: 'ALL', label: 'Semua Hasil' },
                { id: 'NAV', label: '📌 Menu Navigasi' },
                { id: 'HOUSE', label: '🏡 Kavling & Warga' },
                { id: 'ACTION', label: '⚡ Aksi Cepat' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setSearchCategory(pill.id as any)}
                  className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-colors ${
                    searchCategory === pill.id
                      ? 'bg-primary-600 text-white shadow-2xs'
                      : 'text-ink-muted hover:text-ink hover:bg-canvas border border-transparent'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto modern-scrollbar divide-y divide-border/60 p-2">
              {filteredCommandItems.length === 0 ? (
                <div className="py-12 text-center text-ink-muted space-y-2">
                  <Search className="w-8 h-8 text-ink-muted/40 mx-auto" />
                  <p className="font-bold text-sm text-ink">Tidak ada hasil ditemukan</p>
                  <p className="text-xs max-w-sm mx-auto">
                    Tidak ditemukan kecocokan untuk "{searchQuery}". Coba gunakan kata kunci lain seperti "iuran", "satpam", "kav e", atau "aduan".
                  </p>
                </div>
              ) : (
                filteredCommandItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.id}
                      href={item.url}
                      onClick={() => setSearchModalOpen(false)}
                      className="p-3 flex items-center justify-between gap-3 rounded-2xl hover:bg-canvas transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-primary-200">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-ink group-hover:text-primary-700 transition-colors truncate">
                              {item.title}
                            </span>
                            {item.badge && (
                              <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-md uppercase border ${item.badgeColor || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-ink-muted truncate mt-0.5">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-mono text-ink-muted/70 hidden sm:inline-block">
                          {item.url}
                        </span>
                        <ArrowRight className="w-4 h-4 text-ink-muted group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </a>
                  );
                })
              )}
            </div>

            {/* Footer Shortcut Bar */}
            <div className="p-3 border-t border-border bg-canvas/40 flex items-center justify-between text-[11px] text-ink-muted">
              <span className="flex items-center gap-1.5">
                <span>Ditemukan <strong className="text-ink">{filteredCommandItems.length}</strong> entri</span>
              </span>
              <div className="flex items-center gap-3">
                <span>Tekan <kbd className="px-1.5 py-0.5 bg-surface border border-border rounded text-[10px] font-bold text-ink">ESC</kbd> untuk menutup</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
