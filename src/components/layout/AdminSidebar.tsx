import React, { useEffect, useState } from 'react';
import { Building2, ChevronDown, PanelLeftClose, PanelLeftOpen, X, Smartphone, ArrowUpRight, FileText } from 'lucide-react';
import type { UserSession } from '../../types/auth';
import { dashboardItem, isNavigationActive, navigationForRole, roleLabels, type NavigationItem } from '../../lib/navigation';
import { ModalDialog } from '../shared/ModalDialog';

interface Props { currentPath?: string; currentUser?: UserSession }

export const AdminSidebar: React.FC<Props> = ({ currentPath = '/admin', currentUser }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [systemTitle, setSystemTitle] = useState('WargaHub');
  const [user, setUser] = useState(currentUser);
  const [openGroups, setOpenGroups] = useState<string[]>([]);
  const role = user?.role || 'CHAIRMAN';
  const groups = navigationForRole(role);
  const resident = ['HOUSE_OWNER', 'HOUSEHOLD_HEAD', 'RESIDENT'].includes(role);

  useEffect(() => {
    const sync = () => {
      try {
        const storedUser = localStorage.getItem('wargahub_user');
        if (!currentUser && storedUser) setUser(JSON.parse(storedUser));
        const title = localStorage.getItem('wargahub_set_sys_title');
        if (title) setSystemTitle(JSON.parse(title));
      } catch { /* Use server-provided defaults when preferences are unavailable. */ }
    };
    sync();
    try { setCollapsed(localStorage.getItem('wargahub_sidebar_collapsed') === 'true'); } catch {}
    const open = () => setMobileOpen(true);
    window.addEventListener('wargahub_user_changed', sync);
    window.addEventListener('storage', sync);
    window.addEventListener('wargahub:open-navigation', open);
    setReady(true);
    return () => {
      window.removeEventListener('wargahub_user_changed', sync);
      window.removeEventListener('storage', sync);
      window.removeEventListener('wargahub:open-navigation', open);
    };
  }, []);

  useEffect(() => {
    const activeGroup = groups.find(group => group.items.some(item => isNavigationActive(item.href, currentPath)));
    setOpenGroups(activeGroup ? [activeGroup.label] : []);
    setMobileOpen(false);
  }, [currentPath, role]);

  const toggleCollapse = () => setCollapsed(previous => {
    try { localStorage.setItem('wargahub_sidebar_collapsed', String(!previous)); } catch {}
    return !previous;
  });

  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'b' && !['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement).tagName) && !(event.target as HTMLElement).isContentEditable) {
        event.preventDefault(); toggleCollapse();
      }
    };
    const resize = () => { if (window.innerWidth >= 1024) setMobileOpen(false); };
    window.addEventListener('keydown', shortcut);
    window.addEventListener('resize', resize);
    return () => { window.removeEventListener('keydown', shortcut); window.removeEventListener('resize', resize); };
  }, []);

  const contents = (compact: boolean, mobile = false) => {
    const link = (item: NavigationItem) => {
      const active = isNavigationActive(item.href, currentPath);
      return <a key={item.href} href={item.href} aria-current={active ? 'page' : undefined}
        aria-label={compact ? item.label : undefined} title={compact ? item.label : undefined}
        onClick={() => setMobileOpen(false)}
        className={`sidebar-link ${active ? 'is-active' : ''} ${compact ? 'is-compact' : ''}`}>
        <item.icon size={19} strokeWidth={1.8} aria-hidden="true" />
        {!compact && <span>{item.label}</span>}
      </a>;
    };
    return <>
      <div className={`sidebar-brand ${compact ? 'justify-center' : ''}`}>
        <a href={resident ? '/warga' : '/admin'} aria-label={systemTitle} className="flex items-center gap-3 min-w-0">
          <span className="brand-mark"><Building2 size={22} strokeWidth={1.8} /></span>
          {!compact && <span className="min-w-0"><strong className="block text-lg tracking-tight truncate">{systemTitle}</strong><span className="block text-xs text-ink-muted">Ruang pengurus</span></span>}
        </a>
        {mobile ? <button className="icon-button ml-auto" aria-label="Tutup menu" onClick={() => setMobileOpen(false)}><X size={20} /></button> : !compact && <button className="icon-button ml-auto" aria-label="Ciutkan menu" title="Ciutkan menu (Ctrl+B)" onClick={toggleCollapse}><PanelLeftClose size={18} /></button>}
      </div>
      {!compact && <div className="px-5 py-4 text-xs text-ink-muted border-b border-border"><span className="block font-semibold text-ink truncate mb-1">{user?.fullName || 'Pengurus komplek'}</span>{roleLabels[role]}</div>}
      <nav aria-label={mobile ? 'Menu pengurus seluler' : 'Menu pengurus'} className="flex-1 overflow-y-auto modern-scrollbar p-3 space-y-2">
        {!resident && link(dashboardItem)}
        {groups.map(group => {
          const expanded = openGroups.includes(group.label);
          const active = group.items.some(item => isNavigationActive(item.href, currentPath));
          return <div key={group.label} className="sidebar-group">
            {compact ? <div className="border-t border-border mx-2 my-3" /> : <button type="button"
              className={`sidebar-group-trigger ${active ? 'text-primary-700' : ''}`} aria-expanded={expanded}
              aria-controls={`${mobile ? 'mobile' : 'desktop'}-group-${group.label}`}
              onClick={() => setOpenGroups(previous => expanded ? previous.filter(label => label !== group.label) : [...previous, group.label])}>
              <span>{group.label}</span><ChevronDown size={16} className={expanded ? 'rotate-180' : ''} />
            </button>}
            {(compact || expanded) && <div id={`${mobile ? 'mobile' : 'desktop'}-group-${group.label}`} className="space-y-1 mt-1">{group.items.map(link)}</div>}
          </div>;
        })}
        {resident && <p className="p-3 text-sm text-ink-muted">Tagihan dan layanan rumah Anda tersedia di portal warga.</p>}
      </nav>
      <div className="p-3 border-t border-border space-y-1">
        <a href="/warga" className={`sidebar-link ${compact ? 'is-compact' : ''}`} aria-label="Portal warga" title="Portal warga"><Smartphone size={19} />{!compact && <><span className="flex-1">Portal warga</span><ArrowUpRight size={16} /></>}</a>
        <a href="/transparency" className={`sidebar-link ${compact ? 'is-compact' : ''}`} aria-label="Laporan publik" title="Laporan publik"><FileText size={19} />{!compact && <><span className="flex-1">Laporan publik</span><ArrowUpRight size={16} /></>}</a>
        {compact && <button onClick={toggleCollapse} className="sidebar-link is-compact w-full" aria-label="Perluas menu"><PanelLeftOpen size={19} /></button>}
      </div>
    </>;
  };

  return <>
    <aside data-ready={ready} className={`admin-sidebar ${collapsed ? 'is-collapsed' : ''}`}>{contents(collapsed)}</aside>
    <ModalDialog open={mobileOpen} onClose={() => setMobileOpen(false)} label="Navigasi pengurus" className="navigation-drawer">
      <div className="flex flex-col h-full">{contents(false, true)}</div>
    </ModalDialog>
  </>;
};
