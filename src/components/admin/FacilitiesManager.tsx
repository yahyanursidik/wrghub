import React, { useState } from 'react';
import { Building2, Wrench, ShieldCheck, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { formatRupiah } from '../../lib/format';

interface FacilityItem {
  id: string;
  name: string;
  code: string;
  category: string;
  location: string;
  condition: string;
  notes: string | null;
}

interface MaintenanceItem {
  id: string;
  title: string;
  description: string;
  facilityName: string | null;
  facilityLocation: string | null;
  costEstimate: number;
  actualCost: number;
  status: string;
  scheduledDate: string | null;
  performedBy: string | null;
}

interface FacilitiesManagerProps {
  facilities: FacilityItem[];
  maintenanceRequests: MaintenanceItem[];
  initialTab?: string;
}

export const FacilitiesManager: React.FC<FacilitiesManagerProps> = ({ facilities, maintenanceRequests, initialTab = 'facilities' }) => {
  const [activeTab, setActiveTab] = useState<'facilities' | 'maintenance'>(initialTab === 'maintenance' ? 'maintenance' : 'facilities');
  const [requests, setRequests] = useState<MaintenanceItem[]>(maintenanceRequests);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleUpdateStatus = async (id: string, newStatus: 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED') => {
    setUpdatingId(id);
    try {
      const res = await fetch('/api/facilities/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: id, status: newStatus })
      });
      if (res.ok) {
        setRequests(requests.map(r => r.id === id ? { ...r, status: newStatus } : r));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const getConditionBadge = (cond: string) => {
    switch (cond) {
      case 'GOOD':
        return <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">Kondisi Baik</span>;
      case 'NEEDS_REPAIR':
        return <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200">Perlu Perbaikan</span>;
      case 'UNDER_MAINTENANCE':
        return <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">Dalam Perawatan</span>;
      case 'DAMAGED':
        return <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-700 text-xs font-semibold border border-red-200">Rusak</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md bg-canvas text-ink-muted text-xs font-semibold">{cond}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Sarana & Pemeliharaan Fasilitas</h1>
        <p className="text-sm text-ink-muted mt-1">Inventaris aset sarana umum dan pemeliharaan berkala komplek.</p>
      </div>

      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab('facilities')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
            activeTab === 'facilities' ? 'bg-primary-50 text-primary-700 border border-primary-200' : 'text-ink-muted hover:text-ink'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Inventaris Fasilitas ({facilities.length})
        </button>
        <button
          onClick={() => setActiveTab('maintenance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
            activeTab === 'maintenance' ? 'bg-primary-50 text-primary-700 border border-primary-200' : 'text-ink-muted hover:text-ink'
          }`}
        >
          <Wrench className="w-4 h-4" />
          Jadwal Pemeliharaan & Booking ({requests.length})
        </button>
      </div>

      {activeTab === 'facilities' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {facilities.map((f) => (
            <div key={f.id} className="p-5 bg-surface rounded-2xl border border-border shadow-card space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] font-mono font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded">
                    {f.code}
                  </span>
                  <h3 className="text-base font-bold text-ink mt-1">{f.name}</h3>
                  <p className="text-xs text-ink-muted">{f.location}</p>
                </div>
                {getConditionBadge(f.condition)}
              </div>
              {f.notes && (
                <p className="text-xs text-ink-muted p-2.5 bg-canvas rounded-xl border border-border/60">
                  {f.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((m) => (
            <div key={m.id} className="p-5 bg-surface rounded-2xl border border-border shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                    m.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                    m.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                    'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    {m.status}
                  </span>
                  <span className="text-xs font-bold text-ink">{m.title}</span>
                </div>
                <p className="text-xs text-ink-muted leading-relaxed">{m.description}</p>
                <p className="text-[11px] text-primary-700 font-semibold">Pelaksana: {m.performedBy || 'Petugas Sarana & Pengurus'}</p>
              </div>

              <div className="flex flex-col sm:items-end gap-2 shrink-0">
                <div className="text-right">
                  <span className="text-[10px] text-ink-muted block">Estimasi Biaya</span>
                  <span className="text-xs font-bold text-ink tabular-nums">{formatRupiah(m.actualCost || m.costEstimate)}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {m.status === 'SUBMITTED' && (
                    <button
                      type="button"
                      disabled={updatingId === m.id}
                      onClick={() => handleUpdateStatus(m.id, 'IN_PROGRESS')}
                      className="px-2.5 py-1 bg-primary-600 hover:bg-primary-700 text-surface text-[11px] font-semibold rounded-lg shadow-xs"
                    >
                      Setujui (Proses)
                    </button>
                  )}
                  {m.status === 'IN_PROGRESS' && (
                    <button
                      type="button"
                      disabled={updatingId === m.id}
                      onClick={() => handleUpdateStatus(m.id, 'RESOLVED')}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-surface text-[11px] font-semibold rounded-lg shadow-xs"
                    >
                      Tandai Selesai
                    </button>
                  )}
                  {m.status !== 'RESOLVED' && (
                    <button
                      type="button"
                      disabled={updatingId === m.id}
                      onClick={() => handleUpdateStatus(m.id, 'REJECTED')}
                      className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-semibold rounded-lg border border-red-200"
                    >
                      Tolak
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
