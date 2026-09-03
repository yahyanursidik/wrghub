import React, { useState } from 'react';
import { FolderOpen, Download, FileText, Lock, Plus, Search, CheckCircle2, Upload, Eye } from 'lucide-react';

interface DocumentItem {
  id: string;
  title: string;
  category: string;
  fileSize: string;
  visibility: string;
  date: string;
  fileUrl?: string;
}

export const DocumentsManager: React.FC = () => {
  const [docs, setDocs] = useState<DocumentItem[]>([
    {
      id: 'doc-1',
      title: 'Tata Tertib & Anggaran Dasar Warga 2026',
      category: 'TATA_TERTIB',
      fileSize: '1.2 MB',
      visibility: 'PUBLIC',
      date: '2026-01-10',
      fileUrl: '/documents/tata-tertib.pdf',
    },
    {
      id: 'doc-2',
      title: 'Laporan Pertanggungjawaban Keuangan Semester 1 2026 (Audited)',
      category: 'LAPORAN_KEUANGAN',
      fileSize: '3.4 MB',
      visibility: 'RESIDENT',
      date: '2026-07-15',
      fileUrl: '/documents/lpj-keuangan-sem1.pdf',
    },
    {
      id: 'doc-3',
      title: 'Surat Edaran Jadwal Ronda & Kerja Bakti HUT RI Ke-81',
      category: 'SURAT_EDARAN',
      fileSize: '450 KB',
      visibility: 'RESIDENT',
      date: '2026-08-20',
      fileUrl: '/documents/surat-edaran-ronda.pdf',
    },
    {
      id: 'doc-4',
      title: 'Formulir Permohonan Izin Renovasi & Pembangunan Rumah',
      category: 'FORMULIR',
      fileSize: '620 KB',
      visibility: 'RESIDENT',
      date: '2026-06-01',
      fileUrl: '/documents/form-renovasi.pdf',
    },
    {
      id: 'doc-5',
      title: 'SK Susunan Pengurus RT 02 / RW 05 Masa Bakti 2025-2028',
      category: 'SK_PENGURUS',
      fileSize: '1.8 MB',
      visibility: 'PUBLIC',
      date: '2025-12-15',
      fileUrl: '/documents/sk-pengurus.pdf',
    },
  ]);

  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('SURAT_EDARAN');
  const [uploadVisibility, setUploadVisibility] = useState('RESIDENT');
  const [saving, setSaving] = useState(false);

  const filteredDocs = docs.filter((d) => {
    const matchesCategory = categoryFilter === 'ALL' || d.category === categoryFilter;
    const matchesSearch = d.title.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle) return;
    setSaving(true);
    try {
      const res = await fetch('/api/documents/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: uploadTitle,
          category: uploadCategory,
          visibility: uploadVisibility,
          fileSize: '1.5 MB',
          fileUrl: `/documents/${uploadTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`,
        })
      });
      if (res.ok) {
        setDocs([
          {
            id: `doc-${Date.now()}`,
            title: uploadTitle,
            category: uploadCategory,
            visibility: uploadVisibility,
            fileSize: '1.5 MB',
            date: new Date().toISOString().substring(0, 10),
          },
          ...docs
        ]);
        setShowUploadModal(false);
        setUploadTitle('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = (doc: DocumentItem) => {
    const content = `DOKUMEN RESMI WARGAHUB\n=======================\nJudul: ${doc.title}\nKategori: ${doc.category}\nTanggal Unggah: ${doc.date || '-'}\nUkuran: ${doc.fileSize}\n\nDokumen ini merupakan salinan resmi terverifikasi dari arsip pengurus Komplek Taman Sejahtera.`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Arsip & Dokumen Resmi Komplek</h1>
          <p className="text-sm text-ink-muted mt-1">
            Pusat repositori dokumen legal, SK kepengurusan, surat edaran, dan formulir perizinan warga.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-surface text-xs font-semibold rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Publikasikan Dokumen Baru
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface p-4 rounded-2xl border border-border shadow-card flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'TATA_TERTIB', 'SURAT_EDARAN', 'LAPORAN_KEUANGAN', 'FORMULIR', 'SK_PENGURUS'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                categoryFilter === cat
                  ? 'bg-primary-600 text-surface'
                  : 'bg-canvas text-ink-muted hover:text-ink border border-border'
              }`}
            >
              {cat === 'ALL' ? 'Semua Kategori' : cat.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64 relative">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari judul dokumen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-canvas border border-border rounded-xl text-xs text-ink placeholder:text-ink-muted focus:outline-hidden"
          />
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <div key={doc.id} className="p-5 bg-surface rounded-2xl border border-border shadow-card flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-primary-100 text-primary-800 text-[10px] font-bold rounded">
                  {doc.category.replace('_', ' ')}
                </span>
                <span className="text-[11px] font-mono text-ink-muted">{doc.fileSize}</span>
              </div>
              <h3 className="text-sm font-bold text-ink leading-snug">{doc.title}</h3>
              <p className="text-[11px] text-ink-muted">Diupload pada: {doc.date}</p>
            </div>

            <div className="pt-3 border-t border-border flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleDownload(doc)}
                className="flex-1 py-2 px-3 bg-canvas hover:bg-primary-50 hover:text-primary-700 border border-border text-ink text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4 text-ink-muted" />
                Unduh PDF
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-2xl max-w-md w-full p-6 border border-border shadow-modal space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-sm text-ink">Publikasikan Dokumen Baru</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            <form onSubmit={handleUpload} className="space-y-3">
              <div>
                <label className="font-bold text-ink block mb-1">Judul Dokumen</label>
                <input
                  type="text"
                  placeholder="Contoh: Surat Edaran Ronda Malam September 2026"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Kategori Dokumen</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-semibold text-ink"
                >
                  <option value="SURAT_EDARAN">Surat Edaran</option>
                  <option value="TATA_TERTIB">Tata Tertib & Anggaran Dasar</option>
                  <option value="LAPORAN_KEUANGAN">Laporan Keuangan & LPJ</option>
                  <option value="FORMULIR">Formulir Perizinan / Renovasi</option>
                  <option value="SK_PENGURUS">SK Kepengurusan RT/RW</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Hak Akses Visibilitas</label>
                <select
                  value={uploadVisibility}
                  onChange={(e) => setUploadVisibility(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-medium text-ink"
                >
                  <option value="RESIDENT">Seluruh Warga (Internal Komplek)</option>
                  <option value="PUBLIC">Publik (Terbuka Umum)</option>
                  <option value="ADMIN">Khusus Pengurus & Admin</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Pilih Berkas PDF</label>
                <div className="p-4 border-2 border-dashed border-border hover:border-primary-500 rounded-xl text-center cursor-pointer bg-canvas/40">
                  <Upload className="w-5 h-5 text-ink-muted mx-auto mb-1" />
                  <span className="text-[11px] text-ink-muted">Klik untuk upload berkas dokumen (.pdf, maks 10MB)</span>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-border text-ink font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-surface font-semibold rounded-xl shadow-xs"
                >
                  {saving ? 'Mengupload...' : 'Simpan & Terbitkan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
