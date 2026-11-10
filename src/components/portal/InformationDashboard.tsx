import { useState } from 'react';
import { ArrowUpRight, LogOut, Megaphone } from 'lucide-react';
import { hasWorkspace } from '../../lib/dashboard-workspace';
import { roleLabels } from '../../lib/navigation';
import type { AnnouncementItem } from '../../services/announcement.service';
import type { UserRole } from '../../types/auth';

export function InformationDashboard({ name, role, news }: { name: string; role: UserRole; news: AnnouncementItem[] | null }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  async function logout() {
    if (busy) return;
    setBusy(true);
    setError(false);
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (!response.ok) throw new Error();
      try { localStorage.removeItem('wargahub_user'); } catch {}
      window.location.assign('/');
    } catch {
      setError(true);
      setBusy(false);
    }
  }
  return <div className="workspace mx-auto max-w-3xl" data-resident-workspace={role}>
    <header className="workspace-heading">
      <div><p className="workspace-kicker"><Megaphone size={16} aria-hidden="true" />{roleLabels[role]}</p><h1>Informasi lingkungan</h1><p>{name}</p></div>
      {hasWorkspace(role) && <a className="workspace-button" href="/admin">Buka ruang kerja <ArrowUpRight size={16} aria-hidden="true" /></a>}
    </header>
    <section className="workspace-panel" aria-labelledby="information-announcements">
      <h2 id="information-announcements">Pengumuman</h2>
      {news?.length ? <ul className="divide-y divide-border">{news.map(item => <li key={item.id} className="py-3">
        <h3 className="break-words text-sm font-semibold">{item.title}</h3>
        <p className="mt-1 whitespace-pre-line break-words text-sm text-ink-muted">{item.content}</p>
      </li>)}</ul> : <p className="text-sm text-ink-muted">{news === null ? 'Pengumuman belum bisa dimuat.' : 'Belum ada pengumuman untuk akun ini.'}</p>}
    </section>
    <nav className="workspace-shortcuts" aria-label="Informasi publik">
      <a href="/transparency">Transparansi kas <ArrowUpRight size={15} aria-hidden="true" /></a>
      <a href="/rekap-iuran">Rekap iuran <ArrowUpRight size={15} aria-hidden="true" /></a>
    </nav>
    <button type="button" className="workspace-text-link justify-self-start" disabled={busy} onClick={() => void logout()}>
      <LogOut size={17} aria-hidden="true" />{busy ? 'Sedang keluar…' : 'Keluar akun'}
    </button>
    {error && <p role="alert" className="text-sm text-rose-800">Belum bisa keluar. Coba lagi.</p>}
  </div>;
}
