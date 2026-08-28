import React, { useState } from 'react';
import { Megaphone, PlusCircle, Calendar, MapPin, Pin } from 'lucide-react';

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  category: string;
  scheduledAt: string | null;
  location: string | null;
  isPinned: boolean | null;
  createdAt: string | null;
}

interface AnnouncementsManagerProps {
  initialAnnouncements: AnnouncementItem[];
}

export const AnnouncementsManager: React.FC<AnnouncementsManagerProps> = ({ initialAnnouncements }) => {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(initialAnnouncements);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('KEGIATAN');
  const [schedule, setSchedule] = useState('');
  const [location, setLocation] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    try {
      await fetch('/api/announcements/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          category,
          scheduledAt: schedule || undefined,
          location: location || undefined,
        })
      });
      const newAnn: AnnouncementItem = {
        id: `ann-${Date.now()}`,
        title,
        content,
        category,
        scheduledAt: schedule || null,
        location: location || null,
        isPinned: false,
        createdAt: new Date().toISOString(),
      };
      setAnnouncements([newAnn, ...announcements]);
      setTitle('');
      setContent('');
      setSchedule('');
      setLocation('');
      setShowModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Pengumuman & Agenda Warga</h1>
          <p className="text-sm text-ink-muted mt-1">Publikasikan informasi penting dan agenda kegiatan warga komplek.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-surface text-sm font-semibold rounded-xl shadow-xs transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Buat Pengumuman Baru
        </button>
      </div>

      <div className="space-y-4">
        {announcements.map((ann) => (
          <div key={ann.id} className="p-6 bg-surface rounded-2xl border border-border shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-primary-100 text-primary-800 text-[11px] font-bold rounded-md">
                  {ann.category}
                </span>
                {ann.isPinned && (
                  <span className="flex items-center gap-1 text-[11px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    <Pin className="w-3 h-3" /> Disematkan
                  </span>
                )}
              </div>
              <span className="text-xs text-ink-muted">{ann.createdAt?.substring(0, 10)}</span>
            </div>

            <h3 className="text-lg font-bold text-ink">{ann.title}</h3>
            <p className="text-sm text-ink-muted leading-relaxed">{ann.content}</p>

            <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap gap-4 font-semibold text-primary-700">
                {ann.scheduledAt && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {ann.scheduledAt}
                  </span>
                )}
                {ann.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {ann.location}
                  </span>
                )}
              </div>

              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `📢 *PENGUMUMAN KOMPLEK TAMAN SEJAHTERA*\n\n*${ann.title}*\n\n${ann.content}\n\n${ann.scheduledAt ? '🗓️ Waktu: ' + ann.scheduledAt + '\n' : ''}${ann.location ? '📍 Lokasi: ' + ann.location + '\n' : ''}\n- Pengurus Komplek Taman Sejahtera`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-surface font-semibold rounded-xl inline-flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <span>Broadcast ke WhatsApp</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-2xl max-w-lg w-full p-6 border border-border shadow-modal space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base text-ink">Buat Pengumuman Baru</h3>
              <button onClick={() => setShowModal(false)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-ink block mb-1">Kategori</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 bg-surface border border-border rounded-xl font-medium text-ink"
                >
                  <option value="KEGIATAN">Kegiatan & Kerja Bakti</option>
                  <option value="MAINTENANCE">Perbaikan & Maintenance</option>
                  <option value="INFO">Informasi Umum</option>
                  <option value="DARURAT">Darurat / Penting</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-ink block mb-1">Judul Pengumuman</label>
                <input
                  type="text"
                  placeholder="Contoh: Rapat Warga Bulanan"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <div>
                <label className="font-semibold text-ink block mb-1">Isi Pesan Pengumuman</label>
                <textarea
                  rows={4}
                  placeholder="Tuliskan detail pengumuman yang jelas untuk warga..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-ink block mb-1">Jadwal / Waktu (Opsional)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Minggu, 30 Agu • 08:00 WIB"
                    value={schedule}
                    onChange={(e) => setSchedule(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                  />
                </div>
                <div>
                  <label className="font-semibold text-ink block mb-1">Lokasi (Opsional)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Balai Warga"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-border text-ink font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-surface font-semibold rounded-xl shadow-xs"
                >
                  Publikasikan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
