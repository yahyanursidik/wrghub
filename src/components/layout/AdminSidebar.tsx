import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Home,
  Users,
  UserCheck,
  Car,
  Receipt,
  CreditCard,
  FileMinus,
  Wallet,
  Clock,
  FileText,
  MessageCircle,
  Building2,
  Wrench,
  ShieldCheck,
  Megaphone,
  Calendar,
  Bell,
  FolderOpen,
  Settings,
  Sprout,
  Smartphone,
  ExternalLink,
  Banknote,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Vote,
  Shield,
  Truck,
  UserCircle2,
  Lock
} from 'lucide-react';
import { DEMO_USERS, type UserRole, type UserSession } from '../../types/auth';

interface AdminSidebarProps {
  currentPath?: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: number;
  roles?: UserRole[];
}

interface NavGroup {
  label: string;
  roles?: UserRole[];
  items: NavItem[];
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ currentPath = '/admin' }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [systemTitle, setSystemTitle] = useState('WargaHub');

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
    return DEMO_USERS.ketua;
  });

  useEffect(() => {
    try {
      const savedCollapsed = localStorage.getItem('wargahub_sidebar_collapsed');
      if (savedCollapsed !== null) {
        setIsCollapsed(savedCollapsed === 'true');
      }
      const savedTitle = localStorage.getItem('wargahub_set_sys_title');
      if (savedTitle) {
        setSystemTitle(JSON.parse(savedTitle));
      }
      const savedUser = localStorage.getItem('wargahub_user');
      if (savedUser) {
        setActiveUser(JSON.parse(savedUser));
      }
    } catch (e) {}

    // Listen for custom user change event
    const handleUserChanged = (e: any) => {
      if (e.detail) {
        setActiveUser(e.detail);
      } else {
        try {
          const saved = localStorage.getItem('wargahub_user');
          if (saved) setActiveUser(JSON.parse(saved));
        } catch (err) {}
      }
    };

    window.addEventListener('wargahub_user_changed', handleUserChanged);
    window.addEventListener('storage', handleUserChanged);
    return () => {
      window.removeEventListener('wargahub_user_changed', handleUserChanged);
      window.removeEventListener('storage', handleUserChanged);
    };
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('wargahub_sidebar_collapsed', String(next));
      } catch (e) {}
      return next;
    });
  };

  const isPathActive = (path: string) => {
    if (path === '/admin' && (currentPath === '/admin' || currentPath === '/admin/')) return true;
    if (path !== '/admin' && currentPath.startsWith(path)) return true;
    return false;
  };

  const userRole = activeUser?.role || 'CHAIRMAN';

  // Role title & theme styling
  const getRoleInfo = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
      case 'CHAIRMAN':
        return {
          title: 'Ketua Komplek',
          badge: 'Akses Penuh',
          badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        };
      case 'TREASURER':
        return {
          title: 'Bendahara Paguyuban',
          badge: 'Keuangan & Kas',
          badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
        };
      case 'SECRETARY':
        return {
          title: 'Sekretaris Paguyuban',
          badge: 'Administrasi & Warga',
          badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
        };
      case 'SECURITY':
        return {
          title: 'Petugas Satpam',
          badge: 'Pos Gerbang & Keamanan',
          badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
        };
      case 'MAINTENANCE':
        return {
          title: 'Kebersihan & Teknisi',
          badge: 'Armada & Fasilitas',
          badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
        };
      case 'HOUSEHOLD_HEAD':
      case 'HOUSE_OWNER':
      case 'RESIDENT':
        return {
          title: 'Warga Komplek',
          badge: 'Portal Warga Mandiri',
          badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        };
      default:
        return {
          title: 'Pengurus Komplek',
          badge: 'Terdaftar',
          badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
        };
    }
  };

  const roleInfo = getRoleInfo(userRole);

  // Define master navigation groups with RBAC role filter
  const masterNavGroups: NavGroup[] = [
    {
      label: 'WARGA',
      roles: ['SUPER_ADMIN', 'CHAIRMAN', 'SECRETARY', 'TREASURER', 'RESIDENT_ADMIN'],
      items: [
        { name: 'Rumah', href: '/admin/properties', icon: Home, roles: ['SUPER_ADMIN', 'CHAIRMAN', 'SECRETARY', 'TREASURER', 'RESIDENT_ADMIN'] },
        { name: 'Penghuni', href: '/admin/properties?tab=occupants', icon: Users, roles: ['SUPER_ADMIN', 'CHAIRMAN', 'SECRETARY', 'TREASURER', 'RESIDENT_ADMIN'] },
        { name: 'Pemilik', href: '/admin/properties?tab=owners', icon: UserCheck, roles: ['SUPER_ADMIN', 'CHAIRMAN', 'SECRETARY', 'RESIDENT_ADMIN'] },
        { name: 'Kendaraan', href: '/admin/properties?tab=vehicles', icon: Car, roles: ['SUPER_ADMIN', 'CHAIRMAN', 'SECRETARY', 'SECURITY', 'RESIDENT_ADMIN'] },
      ]
    },
    {
      label: 'KEUANGAN',
      roles: ['SUPER_ADMIN', 'CHAIRMAN', 'TREASURER', 'AUDITOR'],
      items: [
        { name: 'Iuran', href: '/admin/billing', icon: Receipt, roles: ['SUPER_ADMIN', 'CHAIRMAN', 'TREASURER', 'AUDITOR'] },
        { name: 'Pembayaran', href: '/admin/payments', icon: CreditCard, badge: 3, roles: ['SUPER_ADMIN', 'CHAIRMAN', 'TREASURER'] },
        { name: 'Pengeluaran', href: '/admin/expenses', icon: FileMinus, roles: ['SUPER_ADMIN', 'CHAIRMAN', 'TREASURER'] },
        { name: 'Kasbon & Gaji Awal', href: '/admin/staff-loans', icon: Banknote, roles: ['SUPER_ADMIN', 'CHAIRMAN', 'TREASURER'] },
        { name: 'Kas & Ledger', href: '/admin/ledger', icon: Wallet, roles: ['SUPER_ADMIN', 'CHAIRMAN', 'TREASURER', 'AUDITOR'] },
        { name: 'Anggaran APB', href: '/admin/budget', icon: Clock, roles: ['SUPER_ADMIN', 'CHAIRMAN', 'TREASURER', 'AUDITOR'] },
        { name: 'Analitik & Tren', href: '/admin/analytics', icon: Clock, roles: ['SUPER_ADMIN', 'CHAIRMAN', 'TREASURER', 'AUDITOR'] },
        { name: 'Transparansi', href: '/transparency', icon: FileText, roles: ['SUPER_ADMIN', 'CHAIRMAN', 'TREASURER', 'SECRETARY', 'AUDITOR', 'VIEWER'] },
      ]
    },
    {
      label: 'OPERASIONAL',
      roles: ['SUPER_ADMIN', 'CHAIRMAN', 'SECURITY', 'MAINTENANCE', 'SECRETARY', 'RESIDENT_ADMIN'],
      items: [
        { name: 'Pos Satpam', href: '/admin/security-gate', icon: ShieldCheck, roles: ['SUPER_ADMIN', 'CHAIRMAN', 'SECURITY'] },
        { name: 'Tim Kebersihan', href: '/admin/cleaning-staff', icon: Truck, roles: ['SUPER_ADMIN', 'CHAIRMAN', 'MAINTENANCE', 'SECURITY'] },
        { name: 'Aduan Warga', href: '/admin/complaints', icon: MessageCircle, badge: 4, roles: ['SUPER_ADMIN', 'CHAIRMAN', 'SECURITY', 'MAINTENANCE', 'SECRETARY'] },
        { name: 'Sarana Fasum', href: '/admin/facilities', icon: Building2, roles: ['SUPER_ADMIN', 'CHAIRMAN', 'MAINTENANCE', 'SECRETARY', 'SECURITY'] },
        { name: 'Maintenance', href: '/admin/facilities?tab=maintenance', icon: Wrench, badge: 2, roles: ['SUPER_ADMIN', 'CHAIRMAN', 'MAINTENANCE'] },
        { name: 'Petugas Jaga', href: '/admin/facilities?tab=staff', icon: ShieldCheck, roles: ['SUPER_ADMIN', 'CHAIRMAN', 'SECURITY'] },
      ]
    },
    {
      label: 'KOMUNIKASI',
      roles: ['SUPER_ADMIN', 'CHAIRMAN', 'SECRETARY', 'TREASURER', 'SECURITY', 'MAINTENANCE'],
      items: [
        { name: 'Pengumuman', href: '/admin/announcements', icon: Megaphone, roles: ['SUPER_ADMIN', 'CHAIRMAN', 'SECRETARY', 'SECURITY', 'MAINTENANCE'] },
        { name: 'E-Voting & Polling', href: '/admin/voting', icon: Vote, roles: ['SUPER_ADMIN', 'CHAIRMAN', 'SECRETARY'] },
        { name: 'Bot WhatsApp', href: '/admin/whatsapp-bot', icon: MessageCircle, roles: ['SUPER_ADMIN', 'CHAIRMAN', 'SECRETARY', 'TREASURER'] },
        { name: 'Agenda Kegiatan', href: '/admin/announcements?tab=agenda', icon: Calendar, roles: ['SUPER_ADMIN', 'CHAIRMAN', 'SECRETARY', 'SECURITY', 'MAINTENANCE'] },
        { name: 'Notifikasi', href: '/admin/notifications', icon: Bell, roles: ['SUPER_ADMIN', 'CHAIRMAN', 'SECRETARY', 'TREASURER', 'SECURITY'] },
      ]
    }
  ];

  // Master bottom items with RBAC
  const masterBottomItems = [
    { name: 'Dokumen', href: '/admin/documents', icon: FolderOpen, roles: ['SUPER_ADMIN', 'CHAIRMAN', 'SECRETARY', 'TREASURER', 'AUDITOR'] },
    { name: 'Jejak Audit', href: '/admin/audit', icon: ShieldCheck, roles: ['SUPER_ADMIN', 'CHAIRMAN', 'TREASURER', 'SECRETARY', 'AUDITOR'] },
    { name: 'Pencadangan & Backup', href: '/admin/backup', icon: FolderOpen, roles: ['SUPER_ADMIN', 'CHAIRMAN'] },
    { name: 'Pengaturan Sistem', href: '/admin/settings', icon: Settings, roles: ['SUPER_ADMIN', 'CHAIRMAN'] },
  ];

  // Filter groups and items strictly according to active user's role
  const filteredNavGroups = masterNavGroups
    .filter(g => !g.roles || g.roles.includes(userRole))
    .map(g => ({
      ...g,
      items: g.items.filter(item => !item.roles || item.roles.includes(userRole))
    }))
    .filter(g => g.items.length > 0);

  const filteredBottomItems = masterBottomItems.filter(item => !item.roles || item.roles.includes(userRole));

  const isResidentRole = ['HOUSEHOLD_HEAD', 'HOUSE_OWNER', 'RESIDENT'].includes(userRole);

  return (
    <aside
      className={`bg-surface border-r border-border h-screen sticky top-0 flex flex-col shrink-0 select-none z-30 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header & Toggle Button */}
      <div className={`h-16 flex items-center border-b border-border shrink-0 transition-all ${
        isCollapsed ? 'px-3 justify-center relative' : 'px-5 justify-between'
      }`}>
        {!isCollapsed ? (
          <>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 shadow-sm shrink-0">
                <Sprout className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-lg tracking-tight text-ink truncate flex items-center gap-1">
                  {systemTitle === 'WargaHub' ? (
                    <>Warga<span className="text-primary-600 font-black">Hub</span></>
                  ) : (
                    systemTitle
                  )}
                </span>
                <span className="text-[10px] text-ink-muted font-bold tracking-wider uppercase truncate">
                  {roleInfo.title}
                </span>
              </div>
            </div>

            {/* Collapse Trigger Button */}
            <button
              type="button"
              onClick={toggleCollapse}
              title="Ciutkan Sidebar Menu (Ctrl + B)"
              className="p-1.5 text-ink-muted hover:text-ink hover:bg-canvas rounded-xl transition-colors shrink-0"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center relative group">
            <button
              type="button"
              onClick={toggleCollapse}
              title="Perluas / Buka Sidebar Menu"
              className="w-10 h-10 rounded-xl bg-primary-50 hover:bg-primary-100 text-primary-700 flex items-center justify-center transition-all shadow-xs group-hover:scale-105"
            >
              <Sprout className="w-5 h-5 text-primary-600 group-hover:hidden" />
              <PanelLeftOpen className="w-5 h-5 text-primary-600 hidden group-hover:block" />
            </button>
          </div>
        )}
      </div>

      {/* Role Badge Indicator */}
      {!isCollapsed && (
        <div className="px-4 pt-3 pb-1">
          <div className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold flex items-center justify-between gap-1.5 ${roleInfo.badgeColor}`}>
            <span className="truncate">{roleInfo.title}</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-white/70 shadow-2xs uppercase">
              {roleInfo.badge}
            </span>
          </div>
        </div>
      )}

      {/* Navigation Links with Modern Scrollbar */}
      <div className={`flex-1 overflow-y-auto modern-scrollbar space-y-4 overscroll-contain overflow-x-hidden ${
        isCollapsed ? 'px-2 py-4' : 'px-4 py-2.5'
      }`}>
        {/* Ringkasan Dashboard (For Admin Roles) */}
        {!isResidentRole && (
          <div>
            <a
              href="/admin"
              title={isCollapsed ? 'Ringkasan Dashboard' : undefined}
              className={`flex items-center rounded-xl text-sm font-medium transition-all group relative ${
                isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2'
              } ${
                isPathActive('/admin')
                  ? 'bg-primary-50 text-primary-700 font-semibold shadow-xs'
                  : 'text-ink-muted hover:text-ink hover:bg-canvas'
              }`}
            >
              <LayoutDashboard className={`w-4 h-4 shrink-0 ${isPathActive('/admin') ? 'text-primary-600' : 'text-ink-muted group-hover:text-ink'}`} />
              {!isCollapsed && <span>Ringkasan</span>}

              {/* Tooltip on Collapsed */}
              {isCollapsed && (
                <span className="fixed left-20 ml-2 px-2.5 py-1 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                  Ringkasan Dashboard
                </span>
              )}
            </a>
          </div>
        )}

        {/* Resident Notice if logged in as resident in admin */}
        {isResidentRole && !isCollapsed && (
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl space-y-2 text-xs">
            <p className="font-bold text-indigo-950 flex items-center gap-1.5">
              <UserCircle2 className="w-4 h-4 text-indigo-600" />
              <span>Akun Warga Aktif</span>
            </p>
            <p className="text-indigo-800 text-[11px] leading-relaxed">
              Anda sedang login sebagai Warga. Akses mandiri tagihan, data rumah, dan pas tamu tersedia di Portal Warga.
            </p>
            <a
              href="/warga"
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-center block shadow-xs transition-colors"
            >
              Buka Portal Warga
            </a>
          </div>
        )}

        {/* Filtered RBAC Groups */}
        {filteredNavGroups.map((group) => (
          <div key={group.label} className="space-y-1">
            {!isCollapsed ? (
              <h3 className="px-3 text-[10px] font-bold text-ink-muted/70 tracking-wider uppercase">
                {group.label}
              </h3>
            ) : (
              <div className="h-px bg-border/60 my-2 mx-1" title={group.label} />
            )}

            <div className="space-y-0.5 pt-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isPathActive(item.href);
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    title={isCollapsed ? item.name : undefined}
                    className={`flex items-center rounded-xl text-sm font-medium transition-all group relative ${
                      isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'
                    } ${
                      active
                        ? 'bg-primary-50 text-primary-700 font-semibold'
                        : 'text-ink-muted hover:text-ink hover:bg-canvas'
                    }`}
                  >
                    <div className={`flex items-center ${isCollapsed ? 'justify-center relative' : 'gap-3'}`}>
                      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-primary-600' : 'text-ink-muted group-hover:text-ink'}`} />
                      {!isCollapsed && <span>{item.name}</span>}

                      {/* Small badge dot in collapsed mode */}
                      {isCollapsed && item.badge ? (
                        <span className="absolute -top-1.5 -right-2 px-1 py-0.2 text-[9px] font-black rounded-full bg-amber-500 text-white shadow-xs">
                          {item.badge}
                        </span>
                      ) : null}
                    </div>

                    {!isCollapsed && item.badge ? (
                      <span className="px-1.5 py-0.5 text-[11px] font-bold rounded-full bg-amber-100 text-amber-800">
                        {item.badge}
                      </span>
                    ) : null}

                    {/* Tooltip on Collapsed */}
                    {isCollapsed && (
                      <span className="fixed left-20 ml-2 px-2.5 py-1 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap flex items-center gap-1.5">
                        <span>{item.name}</span>
                        {item.badge && (
                          <span className="px-1 py-0.2 text-[9px] font-bold rounded bg-amber-500 text-white">
                            {item.badge}
                          </span>
                        )}
                      </span>
                    )}
                  </a>
                );
              })}
            </div>
          </div>
        ))}

        {/* Filtered Bottom items */}
        {filteredBottomItems.length > 0 && (
          <div className={`pt-2 border-t border-border/60 space-y-0.5 ${isCollapsed ? 'pt-1' : ''}`}>
            {filteredBottomItems.map((botItem) => {
              const Icon = botItem.icon;
              const active = isPathActive(botItem.href);
              return (
                <a
                  key={botItem.name}
                  href={botItem.href}
                  title={isCollapsed ? botItem.name : undefined}
                  className={`flex items-center rounded-xl text-sm font-medium transition-all group relative ${
                    isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2'
                  } ${
                    active
                      ? 'bg-primary-50 text-primary-700 font-semibold'
                      : 'text-ink-muted hover:text-ink hover:bg-canvas'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-primary-600' : 'text-ink-muted group-hover:text-ink'}`} />
                  {!isCollapsed && <span>{botItem.name}</span>}

                  {/* Tooltip on Collapsed */}
                  {isCollapsed && (
                    <span className="fixed left-20 ml-2 px-2.5 py-1 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                      {botItem.name}
                    </span>
                  )}
                </a>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick View Switches & Collapse Bar in Footer */}
      <div className={`border-t border-border bg-canvas/40 transition-all ${
        isCollapsed ? 'p-2 space-y-2' : 'p-3 space-y-1.5'
      }`}>
        {!isCollapsed ? (
          <>
            <a
              href="/warga"
              className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium text-primary-700 bg-primary-50/80 hover:bg-primary-100 rounded-xl transition-colors"
            >
              <span className="flex items-center gap-2">
                <Smartphone className="w-3.5 h-3.5 shrink-0" />
                <span>Portal Warga (Mobile)</span>
              </span>
              <ExternalLink className="w-3 h-3 opacity-60 shrink-0" />
            </a>
            <a
              href="/transparency"
              className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium text-ink-muted hover:text-ink hover:bg-surface rounded-xl transition-colors border border-border"
            >
              <span className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-primary-600 shrink-0" />
                <span>Transparansi Publik</span>
              </span>
              <ExternalLink className="w-3 h-3 opacity-60 shrink-0" />
            </a>

            <button
              type="button"
              onClick={toggleCollapse}
              className="flex items-center justify-center gap-1.5 w-full py-1.5 text-[11px] font-bold text-ink-muted hover:text-primary-700 hover:bg-primary-50/60 rounded-xl transition-colors mt-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Ciutkan Sidebar Menu</span>
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1.5">
            <a
              href="/warga"
              title="Buka Portal Warga"
              className="w-10 h-10 rounded-xl bg-primary-50 hover:bg-primary-100 text-primary-700 flex items-center justify-center transition-colors group relative"
            >
              <Smartphone className="w-4 h-4" />
              <span className="fixed left-20 ml-2 px-2.5 py-1 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                Portal Warga (Mobile)
              </span>
            </a>

            <a
              href="/transparency"
              title="Laporan Transparansi Publik"
              className="w-10 h-10 rounded-xl bg-surface hover:bg-canvas border border-border text-ink-muted hover:text-ink flex items-center justify-center transition-colors group relative"
            >
              <FileText className="w-4 h-4 text-primary-600" />
              <span className="fixed left-20 ml-2 px-2.5 py-1 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                Transparansi Publik
              </span>
            </a>

            <button
              type="button"
              onClick={toggleCollapse}
              title="Lebarkan / Buka Sidebar"
              className="w-10 h-10 rounded-xl hover:bg-canvas text-ink-muted hover:text-primary-700 flex items-center justify-center transition-colors group relative mt-1"
            >
              <ChevronRight className="w-4 h-4" />
              <span className="fixed left-20 ml-2 px-2.5 py-1 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                Lebarkan Menu Sidebar
              </span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
