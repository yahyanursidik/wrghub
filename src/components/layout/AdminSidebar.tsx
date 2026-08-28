import React from 'react';
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
  ExternalLink
} from 'lucide-react';

interface AdminSidebarProps {
  currentPath?: string;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ currentPath = '/admin' }) => {
  const isPathActive = (path: string) => {
    if (path === '/admin' && (currentPath === '/admin' || currentPath === '/admin/')) return true;
    if (path !== '/admin' && currentPath.startsWith(path)) return true;
    return false;
  };

  const navGroups = [
    {
      label: 'WARGA',
      items: [
        { name: 'Rumah', href: '/admin/properties', icon: Home },
        { name: 'Penghuni', href: '/admin/properties?tab=occupants', icon: Users },
        { name: 'Pemilik', href: '/admin/properties?tab=owners', icon: UserCheck },
        { name: 'Kendaraan', href: '/admin/properties?tab=vehicles', icon: Car },
      ]
    },
    {
      label: 'KEUANGAN',
      items: [
        { name: 'Iuran', href: '/admin/billing', icon: Receipt },
        { name: 'Pembayaran', href: '/admin/payments', icon: CreditCard, badge: 3 },
        { name: 'Pengeluaran', href: '/admin/expenses', icon: FileMinus },
        { name: 'Kas', href: '/admin/ledger', icon: Wallet },
        { name: 'Anggaran', href: '/admin/budget', icon: Clock },
        { name: 'Analitik & Tren', href: '/admin/analytics', icon: Clock },
        { name: 'Laporan', href: '/transparency', icon: FileText },
      ]
    },
    {
      label: 'OPERASIONAL',
      items: [
        { name: 'Pos Satpam', href: '/admin/security-gate', icon: ShieldCheck },
        { name: 'Aduan', href: '/admin/complaints', icon: MessageCircle, badge: 4 },
        { name: 'Sarana', href: '/admin/facilities', icon: Building2 },
        { name: 'Maintenance', href: '/admin/facilities?tab=maintenance', icon: Wrench, badge: 2 },
        { name: 'Petugas', href: '/admin/facilities?tab=staff', icon: ShieldCheck },
      ]
    },
    {
      label: 'KOMUNIKASI',
      items: [
        { name: 'Pengumuman', href: '/admin/announcements', icon: Megaphone },
        { name: 'E-Voting & Polling', href: '/admin/voting', icon: Calendar },
        { name: 'Bot WhatsApp', href: '/admin/whatsapp-bot', icon: MessageCircle },
        { name: 'Agenda', href: '/admin/announcements?tab=agenda', icon: Calendar },
        { name: 'Notifikasi', href: '/admin/notifications', icon: Bell },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-surface border-r border-border min-h-screen flex flex-col shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-border">
        <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center text-primary-500 shadow-sm">
          <Sprout className="w-5 h-5 text-primary-600" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-xl tracking-tight text-ink flex items-center gap-1">
            Warga<span className="text-primary-600 font-extrabold">Hub</span>
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {/* Ringkasan */}
        <div>
          <a
            href="/admin"
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              isPathActive('/admin')
                ? 'bg-primary-50 text-primary-700 font-semibold shadow-xs'
                : 'text-ink-muted hover:text-ink hover:bg-canvas'
            }`}
          >
            <LayoutDashboard className={`w-4 h-4 ${isPathActive('/admin') ? 'text-primary-600' : 'text-ink-muted'}`} />
            <span>Ringkasan</span>
          </a>
        </div>

        {/* Groups */}
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-1">
            <h3 className="px-3 text-[11px] font-semibold text-ink-muted/70 tracking-wider uppercase">
              {group.label}
            </h3>
            <div className="space-y-0.5 pt-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isPathActive(item.href);
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? 'bg-primary-50 text-primary-700 font-semibold'
                        : 'text-ink-muted hover:text-ink hover:bg-canvas'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${active ? 'text-primary-600' : 'text-ink-muted'}`} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge ? (
                      <span className="px-1.5 py-0.5 text-[11px] font-semibold rounded-full bg-amber-100 text-amber-800">
                        {item.badge}
                      </span>
                    ) : null}
                  </a>
                );
              })}
            </div>
          </div>
        ))}

        {/* Bottom items */}
        <div className="pt-2 border-t border-border/60 space-y-0.5">
          <a
            href="/admin/documents"
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              isPathActive('/admin/documents')
                ? 'bg-primary-50 text-primary-700 font-semibold'
                : 'text-ink-muted hover:text-ink hover:bg-canvas'
            }`}
          >
            <FolderOpen className="w-4 h-4 text-ink-muted" />
            <span>Dokumen</span>
          </a>

          <a
            href="/admin/audit"
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              isPathActive('/admin/audit')
                ? 'bg-primary-50 text-primary-700 font-semibold'
                : 'text-ink-muted hover:text-ink hover:bg-canvas'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-ink-muted" />
            <span>Jejak Audit</span>
          </a>

          <a
            href="/admin/backup"
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              isPathActive('/admin/backup')
                ? 'bg-primary-50 text-primary-700 font-semibold'
                : 'text-ink-muted hover:text-ink hover:bg-canvas'
            }`}
          >
            <FolderOpen className="w-4 h-4 text-ink-muted" />
            <span>Pencadangan & Backup</span>
          </a>

          <a
            href="/admin/settings"
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              isPathActive('/admin/settings')
                ? 'bg-primary-50 text-primary-700 font-semibold'
                : 'text-ink-muted hover:text-ink hover:bg-canvas'
            }`}
          >
            <Settings className="w-4 h-4 text-ink-muted" />
            <span>Pengaturan</span>
          </a>
        </div>
      </div>

      {/* Quick View Switches in Footer */}
      <div className="p-3 border-t border-border bg-canvas/40 space-y-1.5">
        <a
          href="/"
          className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium text-primary-700 bg-primary-50/80 hover:bg-primary-100 rounded-lg transition-colors"
        >
          <span className="flex items-center gap-2">
            <Smartphone className="w-3.5 h-3.5" />
            Portal Warga (Mobile)
          </span>
          <ExternalLink className="w-3 h-3 opacity-60" />
        </a>
        <a
          href="/transparency"
          className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium text-ink-muted hover:text-ink hover:bg-surface rounded-lg transition-colors border border-border"
        >
          <span className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-primary-600" />
            Transparansi Publik
          </span>
          <ExternalLink className="w-3 h-3 opacity-60" />
        </a>
      </div>
    </aside>
  );
};
