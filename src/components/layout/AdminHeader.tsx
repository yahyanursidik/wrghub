import React, { useEffect, useRef, useState } from 'react';
import { Bell, ChevronDown, ChevronRight, LogOut, Menu, Search, Settings, UserRound, ArrowUpRight, X } from 'lucide-react';
import type { UserSession } from '../../types/auth';
import { pageContext, roleLabels, navigationForRole } from '../../lib/navigation';
import { CommandPalette } from '../shared/CommandPalette';

interface Props { currentUser?: UserSession; currentPath?: string; searchPlaceholder?: string; onSearchClick?: () => void }

export const AdminHeader: React.FC<Props> = ({ currentUser, currentPath = '/admin', searchPlaceholder = 'Cari menu atau warga', onSearchClick }) => {
  const [user, setUser] = useState(currentUser);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const context = pageContext(currentPath);
  const role = user?.role || 'CHAIRMAN';
  const fullName = user?.fullName || 'Pengurus komplek';
  const initials = fullName.split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase();
  const available = navigationForRole(role).flatMap(group => group.items);

  useEffect(() => {
    const sync = () => {
      try { const saved = localStorage.getItem('wargahub_user'); if (!currentUser && saved) setUser(JSON.parse(saved)); } catch {}
    };
    sync();
    window.addEventListener('wargahub_user_changed', sync);
    window.addEventListener('storage', sync);
    return () => { window.removeEventListener('wargahub_user_changed', sync); window.removeEventListener('storage', sync); };
  }, []);

  useEffect(() => {
    const keys = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setSearchOpen(previous => !previous); setProfileOpen(false); }
      if (event.key === 'Escape' && profileOpen) { setProfileOpen(false); profileButtonRef.current?.focus(); }
    };
    const outside = (event: PointerEvent) => { if (!profileRef.current?.contains(event.target as Node)) setProfileOpen(false); };
    window.addEventListener('keydown', keys);
    document.addEventListener('pointerdown', outside);
    return () => { window.removeEventListener('keydown', keys); document.removeEventListener('pointerdown', outside); };
  }, [profileOpen]);

  const logout = async () => {
    setLoggingOut(true); setLogoutError('');
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (!response.ok) throw new Error('Logout failed');
      localStorage.removeItem('wargahub_user');
      window.location.href = '/login?portal=admin';
    } catch { setLogoutError('Belum bisa keluar. Coba lagi.'); setLoggingOut(false); }
  };

  return <header className="admin-header">
    <div className="flex items-center gap-3 min-w-0">
      <button type="button" className="icon-button lg:hidden" aria-label="Buka menu navigasi" aria-haspopup="dialog"
        onClick={() => window.dispatchEvent(new CustomEvent('wargahub:open-navigation'))}><Menu size={22} /></button>
      <nav aria-label="Lokasi halaman" className="flex items-center gap-2 text-sm min-w-0">
        <a href="/admin" className="hidden sm:inline text-ink-muted hover:text-primary-700">Pengurus</a>
        <ChevronRight size={14} className="hidden sm:block text-ink-muted" />
        <span className="hidden xl:inline text-ink-muted">{context.group}</span>
        <ChevronRight size={14} className="hidden xl:block text-ink-muted" />
        <span aria-current="page" className="font-semibold truncate">{context.label}</span>
      </nav>
    </div>
    <div className="flex items-center gap-1 sm:gap-3 shrink-0">
      <button type="button" className="header-search" aria-label="Buka pencarian (Ctrl+K)" aria-haspopup="dialog" onClick={onSearchClick || (() => { setSearchOpen(true); setProfileOpen(false); })}>
        <Search size={18} /><span className="hidden md:inline">{searchPlaceholder}</span><kbd className="hidden lg:inline">Ctrl K</kbd>
      </button>
      {available.some(item => item.href === '/admin/notifications') && <a href="/admin/notifications" className="icon-button" aria-label="Buka notifikasi" title="Notifikasi"><Bell size={20} /></a>}
      <div ref={profileRef} className="relative" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setProfileOpen(false); }}>
        <button ref={profileButtonRef} type="button" className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-canvas" aria-label={`Menu akun ${fullName}`} aria-expanded={profileOpen} aria-controls="profile-menu"
          onClick={() => setProfileOpen(previous => !previous)}>
          <span className="avatar-initials">{initials}</span><ChevronDown size={15} className="hidden sm:block text-ink-muted" />
        </button>
        {profileOpen && <div id="profile-menu" className="profile-popover">
          <div className="p-4 border-b border-border"><div className="flex items-start justify-between gap-2"><strong className="text-sm">{fullName}</strong><button className="icon-button -mt-2 -mr-2" aria-label="Tutup menu akun" onClick={() => { setProfileOpen(false); profileButtonRef.current?.focus(); }}><X size={16} /></button></div><p className="text-xs text-ink-muted mt-1">{roleLabels[role]}</p></div>
          <div className="p-2 space-y-1">
            {available.some(item => item.href === '/admin/settings') && <a href="/admin/settings" className="sidebar-link"><Settings size={18} />Pengaturan</a>}
            <a href="/warga" className="sidebar-link"><UserRound size={18} />Portal warga<ArrowUpRight size={16} className="ml-auto" /></a>
            <a href="/transparency" className="sidebar-link"><ArrowUpRight size={18} />Laporan publik</a>
          </div>
          <div className="p-2 border-t border-border"><button disabled={loggingOut} onClick={logout} className="sidebar-link w-full text-red-700 hover:bg-red-50"><LogOut size={18} />{loggingOut ? 'Sedang keluar…' : 'Keluar akun'}</button>{logoutError && <p role="alert" className="text-xs text-red-700 px-3 pb-2">{logoutError}</p>}</div>
        </div>}
      </div>
    </div>
    <CommandPalette isOpen={searchOpen} onClose={() => setSearchOpen(false)} role={role} />
  </header>;
};
