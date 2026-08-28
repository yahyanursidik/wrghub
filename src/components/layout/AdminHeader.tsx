import React, { useState } from 'react';
import { Search, Bell, ChevronDown, Check, UserCircle2 } from 'lucide-react';
import { DEMO_USERS, type UserSession } from '../../types/auth';

interface AdminHeaderProps {
  currentUser?: UserSession;
  searchPlaceholder?: string;
  onSearchClick?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  currentUser = DEMO_USERS.ketua,
  searchPlaceholder = 'Cari rumah, warga, invoice...',
  onSearchClick,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeUser, setActiveUser] = useState<UserSession>(currentUser);

  return (
    <header className="h-16 px-8 bg-surface border-b border-border flex items-center justify-between sticky top-0 z-30">
      {/* Global Search Bar */}
      <div className="w-96 max-w-md">
        <button
          onClick={onSearchClick}
          type="button"
          className="w-full flex items-center gap-2.5 px-3.5 py-2 bg-canvas/70 hover:bg-canvas border border-border rounded-xl text-sm text-ink-muted transition-colors text-left group"
        >
          <Search className="w-4 h-4 text-ink-muted group-hover:text-primary-600 transition-colors" />
          <span className="flex-1 truncate">{searchPlaceholder}</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold text-ink-muted bg-surface border border-border rounded">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button
          type="button"
          className="relative p-2 text-ink-muted hover:text-ink hover:bg-canvas rounded-xl transition-colors"
          title="Notifikasi"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-green ring-2 ring-surface" />
        </button>

        <div className="h-6 w-px bg-border" />

        {/* User Profile / Switcher Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 p-1.5 pl-2 hover:bg-canvas rounded-xl transition-colors"
          >
            <img
              src={activeUser.avatarUrl}
              alt={activeUser.fullName}
              className="w-9 h-9 rounded-full object-cover border border-border shadow-xs"
            />
            <div className="text-left hidden sm:block">
              <div className="text-sm font-semibold text-ink leading-tight flex items-center gap-1">
                {activeUser.fullName}
              </div>
              <div className="text-xs text-ink-muted">
                {activeUser.role === 'CHAIRMAN' ? 'Ketua Komplek' : activeUser.role === 'TREASURER' ? 'Bendahara' : 'Penghuni A-17'}
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-ink-muted ml-1" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-surface rounded-2xl shadow-modal border border-border py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b border-border">
                <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Ganti Peran (Demo Switcher)</p>
              </div>

              <div className="py-1">
                {Object.entries(DEMO_USERS).map(([key, user]) => {
                  const isSelected = activeUser.username === user.username;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setActiveUser(user);
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                        isSelected ? 'bg-primary-50 text-primary-700 font-medium' : 'text-ink hover:bg-canvas'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img src={user.avatarUrl} alt={user.fullName} className="w-7 h-7 rounded-full object-cover" />
                        <div className="text-left">
                          <p className="font-semibold text-xs text-ink">{user.fullName}</p>
                          <p className="text-[11px] text-ink-muted">
                            {user.role === 'CHAIRMAN' ? 'Ketua Komplek' : user.role === 'TREASURER' ? 'Bendahara' : `Warga (${user.propertyCode})`}
                          </p>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-primary-600" />}
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-border mt-1 pt-1 space-y-0.5">
                <a
                  href="/"
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-primary-700 hover:bg-primary-50 transition-colors"
                >
                  <UserCircle2 className="w-4 h-4" />
                  Buka Tampilan Portal Warga
                </a>
                <a
                  href="/login"
                  onClick={async (e) => {
                    e.preventDefault();
                    await fetch('/api/auth/logout', { method: 'POST' });
                    window.location.href = '/login';
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <span className="w-4 h-4 flex items-center justify-center font-bold">↳</span>
                  Keluar (Logout Akun)
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
