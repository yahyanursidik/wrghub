import React from 'react';
import { Building2, Home, Receipt, Wallet, FileCheck2, LogIn } from 'lucide-react';

interface Props { currentPath: string }

export function PublicNavigation({ currentPath }: Props) {
  const path = currentPath.replace(/\/$/, '') || '/';
  const links = [
    { href: '/', label: 'Portal warga', mobile: 'Beranda', icon: Home, active: path === '/' || path === '/warga' || path === '/portal' },
    { href: '/rekap-iuran', label: 'Rekap iuran', mobile: 'Iuran', icon: Receipt, active: ['/rekap-iuran', '/rekapitulasi', '/iuran'].includes(path) },
    { href: '/transparency', label: 'Laporan kas', mobile: 'Kas', icon: Wallet, active: path.startsWith('/transparency') || path === '/transparancy' },
    { href: '/kuitansi', label: 'Cek kuitansi', mobile: 'Kuitansi', icon: FileCheck2, active: path === '/kuitansi' },
  ];
  return <>
    <header className="sticky top-0 z-30 bg-surface border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between gap-4">
        <a href="/" className="flex items-center gap-3 shrink-0" aria-label="WargaHub beranda"><span className="brand-mark"><Building2 size={22} strokeWidth={1.8} /></span><span><strong className="text-lg tracking-tight block">WargaHub</strong><span className="text-xs text-ink-muted block">Informasi terbuka untuk warga</span></span></a>
        <nav aria-label="Menu publik" className="hidden lg:flex items-center gap-1">{links.map(link => <a key={link.href} href={link.href} className="public-navigation-link" aria-current={link.active ? 'page' : undefined}>{link.label}</a>)}</nav>
        <a href="/login?portal=admin" className="flex items-center gap-2 rounded-xl border border-border px-3 sm:px-4 py-3 text-sm font-semibold hover:bg-canvas"><LogIn size={17} /><span className="hidden sm:inline">Masuk pengurus</span><span className="sm:hidden">Masuk</span></a>
      </div>
    </header>
    <nav aria-label="Menu publik seluler" className="bottom-navigation lg:hidden">
      <div className="max-w-2xl mx-auto grid grid-cols-5 gap-1 px-2 py-2">{links.map(link => <a key={link.href} href={link.href} aria-current={link.active ? 'page' : undefined}><link.icon size={21} strokeWidth={1.8} /><span className="text-[11px]">{link.mobile}</span></a>)}<a href="/login?portal=admin"><LogIn size={21} strokeWidth={1.8} /><span className="text-[11px]">Pengurus</span></a></div>
    </nav>
  </>;
}
