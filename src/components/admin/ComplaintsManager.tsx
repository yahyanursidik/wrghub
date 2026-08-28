import React, { useState } from 'react';
import { MessageCircle, CheckCircle, Clock, AlertTriangle, ChevronRight, Check, ShieldCheck, Wrench, Sparkles, Send } from 'lucide-react';

interface ComplaintItem {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string | null;
  status: string;
  priority: string;
  createdAt: string | null;
  propertyCode: string | null;
  submittedByName: string | null;
}

interface ComplaintsManagerProps {
  initialComplaints: ComplaintItem[];
}

export const ComplaintsManager: React.FC<ComplaintsManagerProps> = ({ initialComplaints }) => {
  const [complaints, setComplaints] = useState<ComplaintItem[]>(initialComplaints);
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintItem | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const handleUpdateStatus = async (id: string, newStatus: string, notes?: string) => {
    setUpdatingId(id);
    try {
      await fetch('/api/complaints/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          complaintId: id,
          status: newStatus,
          userId: 'user-ketua',
          message: notes || `Status diubah menjadi ${newStatus}`,
        })
      });
      setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
      if (selectedComplaint?.id === id) {
        setSelectedComplaint(prev => prev ? { ...prev, status: newStatus } : null);
      }
      setResolutionNotes('');
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'REPORTED':
        return <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-700 text-xs font-semibold border border-red-200">Dilaporkan</span>;
      case 'ACKNOWLEDGED':
        return <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200">Diterima Satpam</span>;
      case 'IN_PROGRESS':
        return <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">Sedang Ditangani</span>;
      case 'RESOLVED':
        return <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">Tuntas (Selesai)</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md bg-canvas text-ink-muted text-xs font-semibold">{status}</span>;
    }
  };

  const filteredComplaints = complaints.filter(c => {
    if (statusFilter === 'ALL') return true;
    return c.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Aduan & Tanggap Cepat Keamanan</h1>
          <p className="text-sm text-ink-muted mt-1">
            Alur disposisi satpam, teknisi perbaikan lingkungan, dan resolusi keluhan warga komplek.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { key: 'ALL', label: `Semua Aduan (${complaints.length})` },
          { key: 'REPORTED', label: 'Perlu Respon' },
          { key: 'IN_PROGRESS', label: 'Dalam Pengerjaan' },
          { key: 'RESOLVED', label: 'Tuntas' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
              statusFilter === tab.key
                ? 'bg-primary-600 text-surface'
                : 'bg-surface text-ink-muted hover:text-ink border border-border'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Complaints Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredComplaints.map((comp) => (
          <div
            key={comp.id}
            className="p-5 bg-surface rounded-2xl border border-border shadow-card space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded">
                    Rumah {comp.propertyCode || 'Warga'}
                  </span>
                  <h3 className="text-base font-bold text-ink mt-1.5">{comp.title}</h3>
                </div>
                {getStatusBadge(comp.status)}
              </div>

              <p className="text-xs text-ink-muted leading-relaxed">
                {comp.description}
              </p>

              <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-ink-muted">
                <span>Lokasi: <strong className="text-ink font-semibold">{comp.location || 'Area Komplek'}</strong></span>
                <span>Pelapor: <strong className="text-ink font-semibold">{comp.submittedByName || 'Warga'}</strong></span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {comp.status === 'REPORTED' && (
                  <button
                    type="button"
                    disabled={updatingId === comp.id}
                    onClick={() => handleUpdateStatus(comp.id, 'IN_PROGRESS', 'Diterima & ditugaskan ke Satpam / Teknisi')}
                    className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-surface text-xs font-semibold rounded-xl flex items-center gap-1 shadow-xs"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Tugaskan Petugas
                  </button>
                )}
                {comp.status === 'IN_PROGRESS' && (
                  <button
                    type="button"
                    onClick={() => setSelectedComplaint(comp)}
                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-surface text-xs font-semibold rounded-xl flex items-center gap-1 shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Selesaikan Aduan
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedComplaint(comp)}
                className="text-xs text-primary-700 font-semibold flex items-center gap-1 hover:underline ml-auto"
              >
                Detail & Catatan <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Detail & Resolusi Aduan */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-2xl max-w-md w-full p-6 border border-border shadow-modal space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-sm text-ink">Disposisi & Resolusi Aduan</h3>
              <button onClick={() => setSelectedComplaint(null)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-canvas rounded-xl space-y-1">
                <span className="text-ink-muted text-[11px]">Informasi Pelapor</span>
                <p className="font-bold text-ink text-sm">{selectedComplaint.submittedByName || 'Warga'} (Rumah {selectedComplaint.propertyCode})</p>
                <p className="text-[11px] text-ink-muted">Lokasi: {selectedComplaint.location}</p>
              </div>

              <div className="p-3 bg-canvas rounded-xl space-y-1">
                <span className="text-ink-muted text-[11px]">Uraian Masalah</span>
                <p className="font-medium text-ink leading-relaxed">{selectedComplaint.description}</p>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Catatan Solusi / Tindak Lanjut Petugas</label>
                <textarea
                  rows={3}
                  placeholder="Tuliskan tindakan yang telah dilakukan (contoh: Kabel telah dirapikan oleh petugas PLN)..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <div className="p-3 bg-canvas rounded-xl space-y-2">
                <span className="text-ink-muted font-semibold block text-[11px]">Pilih Tindakan Disposisi</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedComplaint.id, 'IN_PROGRESS', resolutionNotes)}
                    className="py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-800 font-semibold rounded-xl border border-blue-200 transition-colors"
                  >
                    Tugaskan / Proses
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedComplaint.id, 'RESOLVED', resolutionNotes || 'Masalah telah diselesaikan oleh petugas komplek.')}
                    className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-surface font-semibold rounded-xl shadow-xs transition-colors"
                  >
                    Tandai Selesai (Tuntas)
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                className="px-4 py-2 border border-border rounded-xl text-ink font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
