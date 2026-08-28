import React, { useState, useEffect } from 'react';
import { Search, Home, CreditCard, PlusCircle, MessageCircle, Megaphone, FileText, X, ArrowRight } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickActions = [
    { title: 'Lihat Dashboard Ketua', href: '/admin', icon: Home, category: 'Navigasi' },
    { title: 'Verifikasi Pembayaran Iuran', href: '/admin/payments', icon: CreditCard, category: 'Aksi Cepat' },
    { title: 'Catat Pengeluaran Baru', href: '/admin/expenses', icon: PlusCircle, category: 'Aksi Cepat' },
    { title: 'Lihat Daftar Rumah (120 Unit)', href: '/admin/properties', icon: Home, category: 'Data Warga' },
    { title: 'Buat Pengumuman Warga', href: '/admin/announcements', icon: Megaphone, category: 'Komunikasi' },
    { title: 'Laporan Transparansi Publik', href: '/transparency', icon: FileText, category: 'Laporan' },
    { title: 'Tampilan Portal Warga Mobile', href: '/', icon: ArrowRight, category: 'Warga' },
  ];

  const filtered = quickActions.filter(a => a.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-ink/40 backdrop-blur-xs animate-in fade-in duration-100">
      <div className="w-full max-w-xl bg-surface rounded-2xl shadow-modal border border-border overflow-hidden">
        {/* Input */}
        <div className="px-4 py-3 border-b border-border flex items-center gap-3">
          <Search className="w-5 h-5 text-ink-muted" />
          <input
            type="text"
            placeholder="Ketik nama menu, aksi, atau cari rumah (cth: A-17, iuran, kas)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-muted focus:outline-hidden"
          />
          <button onClick={onClose} className="p-1 text-ink-muted hover:text-ink rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-border/40">
          <div className="space-y-1 py-1">
            {filtered.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.title}
                  href={item.href}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-canvas text-sm text-ink group transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-ink">{item.title}</span>
                  </div>
                  <span className="text-xs text-ink-muted bg-canvas group-hover:bg-surface px-2 py-0.5 rounded-md border border-border">
                    {item.category}
                  </span>
                </a>
              );
            })}

            {filtered.length === 0 && (
              <div className="py-8 text-center text-sm text-ink-muted">
                Tidak ada hasil yang cocok dengan &quot;{query}&quot;
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-canvas/60 border-t border-border flex items-center justify-between text-xs text-ink-muted">
          <span>Tekan <kbd className="px-1.5 py-0.5 bg-surface border border-border rounded font-mono">ESC</kbd> untuk menutup</span>
          <span>WargaHub Navigation</span>
        </div>
      </div>
    </div>
  );
};
