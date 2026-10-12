import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, Home, Search, X } from 'lucide-react';
import { dashboardItem, navigationForRole, type NavigationItem } from '../../lib/navigation';
import type { UserRole } from '../../types/auth';
import type { PropertyListItem } from '../../services/property.service';
import { ModalDialog } from './ModalDialog';

interface Props { isOpen: boolean; onClose: () => void; role?: UserRole }

export const CommandPalette: React.FC<Props> = ({ isOpen, onClose, role = 'CHAIRMAN' }) => {
  const [query, setQuery] = useState('');
  const [properties, setProperties] = useState<PropertyListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState(0);
  const [retry, setRetry] = useState(0);
  const resultsRef = useRef<HTMLDivElement>(null);
  const groups = navigationForRole(role);
  const canSearchProperties = groups.some(group => group.items.some(item => item.href === '/admin/properties'));

  useEffect(() => {
    if (!isOpen) return;
    setQuery(''); setSelected(0);
    if (!canSearchProperties) return;
    const controller = new AbortController();
    setLoading(true); setError(false);
    fetch('/api/properties', { signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error('Request failed');
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('Invalid data');
        setProperties(data);
      })
      .catch(() => { if (!controller.signal.aborted) setError(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [isOpen, canSearchProperties, retry]);

  const results = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('id');
    const items: NavigationItem[] = [dashboardItem, ...groups.flatMap(group => group.items)];
    const menu = items.filter(item => `${item.label} ${item.description} ${item.keywords || ''}`.toLowerCase().includes(q));
    const houses: NavigationItem[] = q && canSearchProperties ? properties.filter(property =>
      `${property.code} ${property.ownerName || ''} ${property.occupantName || ''} ${property.address || ''}`.toLowerCase().includes(q)
    ).map(property => ({ label: property.code, description: property.currentResident || property.ownerName || property.address || 'Data rumah', href: `/admin/properties?q=${encodeURIComponent(property.code)}`, icon: Home })) : [];
    return [...menu, ...houses];
  }, [query, role, properties]);

  useEffect(() => { setSelected(0); }, [query, role]);
  useEffect(() => {
    resultsRef.current?.querySelectorAll('a')[selected]?.scrollIntoView({ block: 'nearest' });
  }, [selected]);

  return <ModalDialog open={isOpen} onClose={onClose} label="Cari menu dan warga" className="search-dialog">
    <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
      <Search size={21} className="text-primary-600 shrink-0" />
      <input autoFocus aria-label="Cari menu, rumah atau nama warga" placeholder={canSearchProperties ? 'Cari menu, rumah, atau nama warga…' : 'Cari menu…'}
        className="flex-1 min-w-0 bg-transparent text-base py-2 outline-none" value={query}
        onChange={event => setQuery(event.target.value)}
        onKeyDown={event => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            setSelected(previous => Math.max(0, Math.min(results.length - 1, previous + (event.key === 'ArrowDown' ? 1 : -1))));
          }
          if (event.key === 'Enter' && results[selected]) { event.preventDefault(); resultsRef.current?.querySelectorAll('a')[selected]?.click(); }
        }} />
      <button onClick={onClose} className="icon-button" aria-label="Tutup pencarian"><X size={20} /></button>
    </div>
    <div className="px-5 pt-4 pb-2 text-xs font-semibold text-ink-muted">{query ? 'Hasil pencarian' : 'Buka halaman'}</div>
    <div ref={resultsRef} className="p-2 max-h-[55dvh] overflow-y-auto modern-scrollbar">
      {results.map((item, index) => <a key={item.href} href={item.href} onClick={onClose}
        className={`search-result ${selected === index ? 'is-selected' : ''}`}>
        <span className="w-10 h-10 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center shrink-0"><item.icon size={19} /></span>
        <span className="min-w-0 flex-1"><span className="block font-semibold text-sm">{item.label}</span><span className="block text-xs text-ink-muted mt-1 truncate">{item.description}</span></span>
        <ArrowUpRight size={17} className="text-ink-muted" />
      </a>)}
      {results.length === 0 && <div className="px-5 py-10 text-center"><Search size={28} className="mx-auto mb-3 text-ink-muted" /><p className="font-semibold text-sm">Belum ada hasil</p><p className="text-sm text-ink-muted mt-2">Coba nama menu, nomor rumah, atau nama warga lain.</p></div>}
      {loading && <div role="status" aria-label="Memuat data warga" className="p-3 space-y-2"><div className="skeleton h-10" /><div className="skeleton h-10" /><span className="sr-only">Memuat data warga…</span></div>}
      {error && <div role="status" className="p-3 text-sm text-ink-muted">Data warga belum bisa dimuat. Menu tetap tersedia. <button onClick={() => setRetry(value => value + 1)} className="text-primary-700 font-semibold underline">Coba lagi</button></div>}
    </div>
    <div className="border-t border-border px-5 py-3 flex justify-between gap-3 text-xs text-ink-muted"><span>{results.length} hasil</span><span>↑ ↓ Pilih · Enter Buka · Esc Tutup</span></div>
  </ModalDialog>;
};
