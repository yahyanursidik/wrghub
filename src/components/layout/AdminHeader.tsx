import React, { useState, useEffect, useRef } from 'react';
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
  FolderOpen
} from 'lucide-react';
import { DEMO_USERS, type UserSession } from '../../types/auth';

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
  currentUser = DEMO_USERS.ketua,
  searchPlaceholder = 'Cari rumah, warga, invoice, pembayaran...',
  onSearchClick,
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'finance' | 'complaint' | 'security'>('all');

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
    return currentUser || DEMO_USERS.ketua;
  });

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'Pembayaran Iuran Masuk (B-12)',
      detail: 'Rp 750.000 via Transfer BCA a.n Hendra Wijaya terverifikasi.',
      time: '5 menit yang lalu',
      category: 'finance',
      unread: true,
      link: '/admin/payments',
      icon: CreditCard,
      iconColor: 'bg-emerald-100 text-emerald-700',
    },
    {
      id: 'notif-2',
      title: 'Aduan Warga Baru (Blok C-07)',
      detail: 'Lampu Penerangan Jalan (PJU) padam di pertigaan Blok C.',
      time: '25 menit yang lalu',
      category: 'complaint',
      unread: true,
      link: '/admin/complaints',
      icon: MessageCircle,
      iconColor: 'bg-amber-100 text-amber-700',
    },
    {
      id: 'notif-3',
      title: 'Kunjungan Tamu di Pos Gerbang 1',
      detail: 'Tamu Bpk. Ridwan (Tamu Unit A-04) telah discan & check-in.',
      time: '1 jam yang lalu',
      category: 'security',
      unread: true,
      link: '/admin/security-gate',
      icon: ShieldCheck,
      iconColor: 'bg-purple-100 text-purple-700',
    },
    {
      id: 'notif-4',
      title: 'Jadwal Servis Rutin Pompa Fasum',
      detail: 'Pemeliharaan pompa air utama Balai Warga dijadwalkan besok 09:00 WIB.',
      time: '3 jam yang lalu',
      category: 'facility',
      unread: false,
      link: '/admin/facilities?tab=maintenance',
      icon: Wrench,
      iconColor: 'bg-blue-100 text-blue-700',
    },
  ]);

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

  return (
    <header className="h-16 px-6 sm:px-8 bg-surface border-b border-border flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Global Search Bar */}
      <div className="w-80 sm:w-96 max-w-md">
        <button
          onClick={onSearchClick}
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

              {/* Role Switcher Section for Testing */}
              <div className="p-3 border-b border-border bg-canvas/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-ink flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Simulasi Ganti Peran (Role Switcher)
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { key: 'ketua', name: '👑 Ketua', user: DEMO_USERS.ketua, path: '/admin' },
                    { key: 'bendahara', name: '💰 Bendahara', user: DEMO_USERS.bendahara, path: '/admin/payments' },
                    { key: 'sekretaris', name: '📋 Sekretaris', user: DEMO_USERS.sekretaris, path: '/admin/announcements' },
                    { key: 'satpam', name: '🛡️ Satpam Pos', user: DEMO_USERS.satpam, path: '/admin/security-gate' },
                    { key: 'teknisi', name: '🧹 Kebersihan', user: DEMO_USERS.teknisi, path: '/admin/cleaning-staff' },
                    { key: 'warga', name: '🏠 Warga A-17', user: DEMO_USERS.warga, path: '/warga' },
                  ].map((roleBtn) => {
                    const isActive = activeUser?.username === roleBtn.user.username;
                    return (
                      <button
                        key={roleBtn.key}
                        type="button"
                        onClick={() => {
                          const newUser = roleBtn.user;
                          setActiveUser(newUser);
                          if (typeof window !== 'undefined') {
                            localStorage.setItem('wargahub_user', JSON.stringify(newUser));
                            window.dispatchEvent(new CustomEvent('wargahub_user_changed', { detail: newUser }));
                          }
                          setProfileDropdownOpen(false);
                          setTimeout(() => {
                            window.location.href = roleBtn.path;
                          }, 150);
                        }}
                        className={`px-2.5 py-1.5 rounded-xl font-bold text-[10px] text-left transition-all flex items-center justify-between ${
                          isActive
                            ? 'bg-primary-600 text-white shadow-2xs'
                            : 'bg-surface hover:bg-primary-50 text-ink border border-border'
                        }`}
                      >
                        <span className="truncate">{roleBtn.name}</span>
                        {isActive && <Check className="w-3 h-3 shrink-0" />}
                      </button>
                    );
                  })}
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
    </header>
  );
};
