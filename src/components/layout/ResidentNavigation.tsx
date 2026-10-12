import React from 'react';
import { Home, Receipt, Megaphone, Building2, UserRound } from 'lucide-react';
import type { ResidentTab } from '../../lib/resident-navigation';

interface Props { activeTab: ResidentTab; onNavigate: (tab: ResidentTab) => void; mobile?: boolean }

export function ResidentNavigation({ activeTab, onNavigate, mobile = false }: Props) {
  const items = [
    { id: 'beranda', label: 'Beranda', icon: Home },
    { id: 'iuran', label: 'Iuran', icon: Receipt },
    { id: 'info', label: 'Info & layanan', short: 'Info', icon: Megaphone },
    { id: 'rumah', label: 'Rumah', icon: Building2 },
    { id: 'akun', label: 'Akun', icon: UserRound },
  ] as const;
  return <nav aria-label={mobile ? 'Menu warga seluler' : 'Menu warga'} className={mobile ? 'bottom-navigation md:hidden' : 'hidden md:block border-t border-border'}>
    <div className={mobile ? 'max-w-3xl mx-auto grid grid-cols-5 px-2 py-2 gap-1' : 'max-w-3xl mx-auto flex items-center gap-2 px-4 py-2'}>
      {items.map(item => <a key={item.id} href={`/warga?tab=${item.id}`} aria-current={activeTab === item.id ? 'page' : undefined}
        className={mobile ? '' : 'public-navigation-link flex-1 justify-center'}
        onClick={event => {
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
          event.preventDefault(); onNavigate(item.id);
        }}>
        <item.icon size={mobile ? 21 : 18} strokeWidth={1.8} />
        <span className={mobile ? 'text-[11px]' : ''}>{mobile && 'short' in item ? item.short : item.label}</span>
      </a>)}
    </div>
  </nav>;
}
