import React, { useState } from 'react';
import { Database, Download, ArrowUpRight } from 'lucide-react';
import { apiFetch } from '../../lib/api-fetch';

export const BackupManager: React.FC = () => {
  const [downloading, setDownloading] = useState(false);
  const [lastExport, setLastExport] = useState<string | null>(null);
  const [error, setError] = useState('');
  const download = async () => {
    if (downloading) return;
    setDownloading(true); setError('');
    try {
      const response = await apiFetch('/api/backup/export');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = `wargahub-snapshot-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setLastExport(new Date().toLocaleString('id-ID'));
    } catch { setError('Ekspor belum berhasil. Coba lagi.'); }
    finally { setDownloading(false); }
  };

  return <section className="space-y-6 max-w-4xl">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-2xl font-semibold tracking-tight">Cadangan & ekspor data</h1><p className="text-sm text-ink-muted mt-2">Unduh snapshot operasional untuk pemeriksaan dan serah terima pengurus.</p></div><button disabled={downloading} onClick={download} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary-600 text-white text-sm font-semibold disabled:opacity-60"><Download size={18} />{downloading ? 'Menyiapkan…' : 'Unduh snapshot'}</button></div>
    {error && <p role="alert" className="text-red-800 bg-red-50 p-4 rounded-xl text-sm">{error}</p>}
    <div className="bg-surface border border-border rounded-2xl p-6 space-y-4"><div className="flex items-center gap-3"><Database size={23} className="text-primary-700" /><h2 className="font-semibold">Apa yang diekspor?</h2></div><p className="text-sm text-ink-muted leading-relaxed">Data rumah, tagihan, buku kas, aduan, fasilitas, pengumuman, aktivitas, dan pengaturan. Snapshot dibatasi hingga 500 baris per tabel operasional, 100 aktivitas, dan 50 pengaturan.</p><p className="text-sm font-medium text-ink">Ini bukan backup penuh database dan belum bisa dipulihkan otomatis. Berkas lampiran serta akun pengguna tidak termasuk.</p><p role="status" className="text-sm text-ink-muted">{lastExport ? `Ekspor terakhir pada sesi ini: ${lastExport}` : 'Belum ada ekspor pada sesi ini.'}</p></div>
    <div className="bg-surface border border-border rounded-2xl divide-y divide-border">{[
      { label: 'Periksa saldo dan rekonsiliasi kas', href: '/admin/ledger?tab=bank_reconciliation' },
      { label: 'Kelola akun warga', href: '/admin/passwords' },
      { label: 'Periksa laporan keuangan', href: '/admin/analytics' },
      { label: 'Buka arsip dokumen serah terima', href: '/admin/documents' },
    ].map(item => <a key={item.href} href={item.href} className="p-5 flex items-center justify-between gap-3 text-sm font-medium hover:bg-primary-50"><span>{item.label}</span><ArrowUpRight size={18} className="text-primary-700 shrink-0" /></a>)}</div>
  </section>;
};
