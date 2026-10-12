import React, { useState } from 'react';
import { FileText, Search, Plus, ArrowUpRight, X } from 'lucide-react';
import type { DocumentRecord } from '../../services/document.service';
import { ModalDialog } from '../shared/ModalDialog';
import { apiFetch } from '../../lib/api-fetch';

const categories = { TATA_TERTIB: 'Tata tertib', LAPORAN_KEUANGAN: 'Laporan keuangan', SURAT_EDARAN: 'Surat edaran', SK_PENGURUS: 'SK pengurus', FORMULIR: 'Formulir' };
export const DocumentsManager: React.FC<{ initialDocuments?: DocumentRecord[]; loadFailed?: boolean }> = ({ initialDocuments = [], loadFailed = false }) => {
  const [documents, setDocuments] = useState(initialDocuments);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('ALL');
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileCategory, setFileCategory] = useState('SURAT_EDARAN');
  const [visibility, setVisibility] = useState('RESIDENT');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const filtered = documents.filter(document => (category === 'ALL' || document.category === category) && document.title.toLowerCase().includes(query.toLowerCase()));
  const safeUrl = (url: string) => /^https:\/\//i.test(url) || /^\/documents\/[\w.-]+$/i.test(url);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true); setError('');
    try {
      if (!/^https:\/\//i.test(fileUrl)) throw new Error('Gunakan tautan dokumen HTTPS yang bisa diakses.');
      const response = await apiFetch('/api/documents/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: title.trim(), category: fileCategory, visibility, fileUrl: fileUrl.trim() }) });
      const payload = await response.json();
      setDocuments(previous => [{ id: payload.data.id, title: title.trim(), category: fileCategory, visibility, fileUrl: fileUrl.trim(), fileSize: null, date: new Date().toLocaleDateString('id-ID') }, ...previous]);
      setOpen(false); setTitle(''); setFileUrl('');
    } catch (error) { setError(error instanceof Error ? error.message : 'Dokumen belum tersimpan.'); }
    finally { setSaving(false); }
  };

  return <section className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-2xl font-semibold tracking-tight">Dokumen</h1><p className="text-sm text-ink-muted mt-2">Arsip tautan dokumen komunitas. Simpan berkas di penyimpanan Anda, lalu tambahkan tautannya.</p></div><button onClick={() => { setError(''); setOpen(true); }} className="inline-flex gap-2 items-center bg-primary-600 text-white px-4 py-3 rounded-xl font-semibold text-sm"><Plus size={18} />Tambah dokumen</button></div>
    {loadFailed && <p role="alert" className="rounded-xl bg-red-50 text-red-800 p-4 text-sm">Arsip belum bisa dimuat. Muat ulang halaman untuk mencoba lagi.</p>}
    <div className="flex flex-col sm:flex-row gap-3"><div className="relative flex-1"><Search size={18} className="absolute top-3.5 left-3 text-ink-muted" /><input aria-label="Cari dokumen" value={query} onChange={event => setQuery(event.target.value)} placeholder="Cari judul dokumen…" className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-3 text-sm" /></div><select aria-label="Kategori dokumen" value={category} onChange={event => setCategory(event.target.value)} className="border border-border bg-surface rounded-xl px-3 py-3 text-sm"><option value="ALL">Semua kategori</option>{Object.entries(categories).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
    <div className="bg-surface border border-border rounded-2xl divide-y divide-border">
      {filtered.map(document => <article key={document.id} className="flex items-start sm:items-center justify-between gap-4 p-5"><div className="flex items-start gap-3 min-w-0"><FileText size={22} className="text-primary-700 shrink-0 mt-1" /><div><h2 className="text-sm font-semibold">{document.title}</h2><p className="text-xs text-ink-muted mt-2">{categories[document.category as keyof typeof categories] || document.category} · {document.date}</p></div></div>{safeUrl(document.fileUrl) ? <a href={document.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex gap-2 items-center text-primary-700 text-sm font-semibold py-2 shrink-0">Buka<ArrowUpRight size={17} /><span className="sr-only"> {document.title}, tab baru</span></a> : <span className="text-xs text-ink-muted">Tautan tidak valid</span>}</article>)}
      {!filtered.length && <div className="p-10 text-center"><FileText size={30} className="mx-auto text-ink-muted mb-3" /><h2 className="text-sm font-semibold">{query ? 'Dokumen tidak ditemukan' : 'Belum ada dokumen'}</h2><p className="text-sm text-ink-muted mt-2">{query ? 'Coba judul atau kategori lain.' : 'Tambahkan tautan dokumen yang sudah tersedia.'}</p></div>}
    </div>
    <ModalDialog open={open} onClose={() => { if (!saving) setOpen(false); }} label="Tambah dokumen" className="w-[min(30rem,calc(100vw-2rem))]">
      <div className="p-6"><div className="flex items-center justify-between mb-5"><h2 className="text-lg font-semibold">Tambah dokumen</h2><button aria-label="Tutup formulir" disabled={saving} onClick={() => setOpen(false)} className="icon-button"><X size={20} /></button></div>
        <form onSubmit={save} className="space-y-4">
          {error && <p role="alert" className="text-sm text-red-800 bg-red-50 rounded-xl p-3">{error}</p>}
          <label className="block text-sm font-medium">Judul<input required minLength={3} value={title} onChange={event => setTitle(event.target.value)} className="block w-full border border-border rounded-xl px-3 py-3 mt-2" /></label>
          <label className="block text-sm font-medium">Tautan dokumen<input required type="url" placeholder="https://…" value={fileUrl} onChange={event => setFileUrl(event.target.value)} className="block w-full border border-border rounded-xl px-3 py-3 mt-2" /></label>
          <p className="text-xs text-ink-muted">Pastikan pengaturan berbagi berkas sesuai dengan penerima. Menambahkan tautan tidak mengubah izin berkas di penyimpanan asal.</p>
          <label className="block text-sm font-medium">Kategori<select value={fileCategory} onChange={event => setFileCategory(event.target.value)} className="block w-full border border-border rounded-xl px-3 py-3 mt-2">{Object.entries(categories).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label className="block text-sm font-medium">Label penerima<select value={visibility} onChange={event => setVisibility(event.target.value)} className="block w-full border border-border rounded-xl px-3 py-3 mt-2"><option value="RESIDENT">Warga</option><option value="PUBLIC">Publik</option><option value="ADMIN">Pengurus</option></select></label>
          <button disabled={saving} className="w-full py-3 bg-primary-600 text-white font-semibold text-sm rounded-xl disabled:opacity-60">{saving ? 'Menyimpan…' : 'Simpan dokumen'}</button>
        </form>
      </div>
    </ModalDialog>
  </section>;
};
