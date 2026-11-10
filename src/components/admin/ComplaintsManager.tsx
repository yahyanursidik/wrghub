import { useState, type FormEvent } from 'react';
import { ChevronRight, MessageSquare, X } from 'lucide-react';
import { apiFetch } from '../../lib/api-fetch';
import { complaintIsOpen, complaintStatusLabel, complaintTransitions, type ComplaintStatus } from '../../lib/complaint-status';
import { useUrlTab } from '../../lib/use-url-tab';
import type { ComplaintItem } from '../../services/complaint.service';
import { ModalDialog } from '../shared/ModalDialog';

const filters = ['ALL', 'OPEN', 'REPORTED', 'IN_PROGRESS', 'RESOLVED'] as const;
const filterLabels: Record<typeof filters[number], string> = {
  ALL: 'Semua', OPEN: 'Terbuka', REPORTED: 'Baru', IN_PROGRESS: 'Ditangani', RESOLVED: 'Selesai',
};
const actions: Partial<Record<ComplaintStatus, string>> = {
  ACKNOWLEDGED: 'Terima aduan', IN_PROGRESS: 'Mulai tangani', RESOLVED: 'Selesaikan', CLOSED: 'Tutup aduan',
};

export function ComplaintsManager({ initialComplaints, initialStatus = 'ALL' }: {
  initialComplaints: ComplaintItem[] | null;
  initialStatus?: typeof filters[number];
}) {
  const [complaints, setComplaints] = useState(initialComplaints ?? []);
  const [filter, setFilter] = useUrlTab(filters, initialStatus, 'status');
  const [selectedId, setSelectedId] = useState<string>();
  const selected = complaints.find(item => item.id === selectedId);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const visible = complaints.filter(item => filter === 'ALL' || (filter === 'OPEN' ? complaintIsOpen(item.status) : filter === 'RESOLVED' ? !complaintIsOpen(item.status) : item.status === filter));
  const select = (item: ComplaintItem) => { setSelectedId(item.id); setNotes(''); setError(''); };
  const save = async (event: FormEvent<HTMLFormElement>, status: ComplaintStatus) => {
    event.preventDefault();
    if (!selected || saving) return;
    if (status === 'RESOLVED' && !notes.trim()) { setError('Isi hasil penanganan.'); return; }
    setSaving(true);
    setError('');
    try {
      const response = await apiFetch('/api/complaints/update', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ complaintId: selected.id, status, notes }),
      });
      const { data } = await response.json();
      setComplaints(previous => previous.map(item => item.id === data.id ? { ...item, status: data.status, resolutionNotes: data.resolutionNotes } : item));
      setNotes('');
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Aduan belum tersimpan.'); }
    finally { setSaving(false); }
  };
  return <div className="workspace">
    <header className="workspace-heading"><div>
      <p className="workspace-kicker"><MessageSquare size={16} aria-hidden="true" /> Layanan warga</p>
      <h1>Aduan warga</h1>
    </div></header>
    <div className="flex flex-wrap gap-2" aria-label="Filter status aduan">
      {filters.map(key => <button type="button" key={key} aria-pressed={filter === key} onClick={() => setFilter(key)}
        className={`min-h-11 whitespace-nowrap rounded-xl border px-3 text-sm font-semibold ${filter === key ? 'border-primary-600 bg-primary-600 text-white' : 'border-border bg-surface text-ink hover:bg-primary-50'}`}>
        {filterLabels[key]}
      </button>)}
    </div>
    <section className="workspace-panel" aria-label="Daftar aduan">
      {initialComplaints === null ? <p role="alert">Aduan belum bisa dimuat. <a className="underline" href="/admin/complaints">Muat ulang</a></p>
      : !visible.length ? <p className="py-3 text-sm text-ink-muted">Tidak ada aduan pada filter ini.</p>
      : <ul className="divide-y divide-border">{visible.map(item => <li key={item.id}>
        <button type="button" onClick={() => select(item)} className="grid min-h-14 w-full grid-cols-[minmax(0,1fr)_auto_1rem] items-center gap-2 rounded-lg p-2 text-left hover:bg-canvas">
          <span className="min-w-0"><strong className="block break-words text-sm">{item.title}</strong><small className="text-ink-muted">{item.propertyCode || 'Area umum'} · {item.category}</small></span>
          <span className={`rounded-md px-2 py-1 text-xs font-semibold ${complaintIsOpen(item.status) ? 'bg-amber-50 text-amber-900' : 'bg-primary-50 text-primary-800'}`}>{complaintStatusLabel(item.status)}</span>
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </li>)}</ul>}
    </section>
    <ModalDialog open={Boolean(selected)} onClose={() => { if (!saving) setSelectedId(undefined); }} label="Detail aduan" className="max-w-md p-5">
      {selected && <form onSubmit={event => {
        const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
        const status = submitter?.value as ComplaintStatus | undefined;
        if (status) void save(event, status); else event.preventDefault();
      }} className="grid gap-4">
        <div className="flex items-start justify-between gap-2">
          <div><p className="workspace-kicker">{complaintStatusLabel(selected.status)}</p><h2 className="break-words text-lg font-bold">{selected.title}</h2></div>
          <button className="icon-button" type="button" disabled={saving} onClick={() => setSelectedId(undefined)} aria-label="Tutup detail"><X size={19} /></button>
        </div>
        <p className="text-sm">{selected.description}</p>
        <p className="text-sm text-ink-muted">{selected.propertyCode || 'Area umum'}{selected.location ? ` · ${selected.location}` : ''}</p>
        {selected.resolutionNotes && <p className="rounded-lg bg-primary-50 p-3 text-sm"><strong>Catatan pengurus</strong><br />{selected.resolutionNotes}</p>}
        {Boolean(complaintTransitions[selected.status as ComplaintStatus]?.length) && <>
          <label className="grid gap-1 text-sm font-medium">Catatan untuk warga
            <textarea value={notes} maxLength={2000} onChange={event => setNotes(event.target.value)} rows={3} className="rounded-lg border border-border bg-canvas p-2" />
          </label>
          {error && <p role="alert" className="text-sm text-rose-800">{error}</p>}
          <div className="flex flex-wrap gap-2">{complaintTransitions[selected.status as ComplaintStatus]?.map(status =>
            <button type="submit" key={status} value={status} disabled={saving} className="min-h-11 rounded-xl bg-primary-600 px-3 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-60">
              {saving ? 'Menyimpan…' : actions[status]}
            </button>
          )}</div>
        </>}
      </form>}
    </ModalDialog>
  </div>;
}
