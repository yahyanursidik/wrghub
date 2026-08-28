import React, { useState } from 'react';
import { ShieldCheck, Search, Filter, Clock, User, Download, Eye, X, CheckCircle2, AlertTriangle, FileCode } from 'lucide-react';
import type { AuditLogItem } from '../../services/audit.service';

interface AuditManagerProps {
  initialLogs: AuditLogItem[];
}

export const AuditManager: React.FC<AuditManagerProps> = ({ initialLogs }) => {
  const [logs, setLogs] = useState<AuditLogItem[]>(initialLogs);
  const [search, setSearch] = useState('');
  const [selectedAction, setSelectedAction] = useState('ALL');
  const [activeLog, setActiveLog] = useState<AuditLogItem | null>(null);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.actorName?.toLowerCase().includes(search.toLowerCase()) ||
      log.action?.toLowerCase().includes(search.toLowerCase()) ||
      log.entityType?.toLowerCase().includes(search.toLowerCase()) ||
      log.entityId?.toLowerCase().includes(search.toLowerCase());
    const matchesAction = selectedAction === 'ALL' || log.action.includes(selectedAction.toLowerCase());
    return matchesSearch && matchesAction;
  });

  const getActionBadge = (action: string) => {
    if (action.includes('verify') || action.includes('approve')) {
      return <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">VERIFIKASI</span>;
    }
    if (action.includes('submit') || action.includes('create') || action.includes('generate')) {
      return <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200">BUAT DATA</span>;
    }
    if (action.includes('reject') || action.includes('reverse')) {
      return <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-700 text-[11px] font-bold border border-red-200">PENOLAKAN</span>;
    }
    return <span className="px-2 py-0.5 rounded-md bg-canvas text-ink-muted text-[11px] font-semibold border border-border">{action}</span>;
  };

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `audit-trail-wargahub-${new Date().toISOString().substring(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Jejak Audit & Log Keamanan</h1>
          <p className="text-sm text-ink-muted mt-1">
            Rekam jejak seluruh perubahan data, verifikasi transaksi kas, dan aktivitas sistem.
          </p>
        </div>

        <button
          type="button"
          onClick={exportJSON}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface hover:bg-canvas border border-border text-ink text-xs font-semibold rounded-xl shadow-xs transition-colors"
        >
          <Download className="w-4 h-4 text-ink-muted" />
          Ekspor Log (JSON)
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface p-4 rounded-2xl border border-border shadow-card flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari aktivitas, pelaku, atau id entitas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-canvas border border-border rounded-xl text-xs text-ink placeholder:text-ink-muted focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-medium text-ink"
          >
            <option value="ALL">Semua Aksi</option>
            <option value="PAYMENT">Pembayaran & Verifikasi</option>
            <option value="BILLING">Tagihan & Billing</option>
            <option value="PROPERTY">Data Rumah & Warga</option>
            <option value="EXPENSE">Pencatatan Biaya</option>
            <option value="VEHICLE">Kendaraan</option>
            <option value="FACILITY">Fasilitas</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto max-h-[550px]">
          <table className="w-full text-xs text-left">
            <thead className="sticky top-0 bg-canvas border-b border-border text-ink-muted font-semibold">
              <tr>
                <th className="py-3 px-4">Waktu (WIB)</th>
                <th className="py-3 px-4">Pelaku (Actor)</th>
                <th className="py-3 px-4">Aksi</th>
                <th className="py-3 px-4">Entitas & ID</th>
                <th className="py-3 px-4 text-right">Detail Nilai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-canvas/50 text-ink">
                  <td className="py-3 px-4 font-mono text-ink-muted whitespace-nowrap">
                    {log.createdAt || 'Baru saja'}
                  </td>
                  <td className="py-3 px-4 font-semibold text-ink">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-primary-600 shrink-0" />
                      <span>{log.actorName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {getActionBadge(log.action)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-[11px] text-ink-muted block">{log.entityType}</span>
                    <span className="font-mono font-bold text-ink text-[11px]">{log.entityId}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => setActiveLog(log)}
                      className="p-1.5 text-primary-700 hover:bg-primary-50 rounded-lg font-medium inline-flex items-center gap-1 text-[11px]"
                    >
                      <Eye className="w-3.5 h-3.5" /> Lihat JSON
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* JSON Detail Modal */}
      {activeLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-2xl max-w-lg w-full p-6 border border-border shadow-modal space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-sm text-ink">Detail Audit Log</h3>
                <p className="text-[11px] font-mono text-ink-muted">{activeLog.id} • {activeLog.createdAt}</p>
              </div>
              <button onClick={() => setActiveLog(null)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2 p-3 bg-canvas rounded-xl border border-border">
                <div>
                  <span className="text-[10px] text-ink-muted block">Pelaku:</span>
                  <strong className="text-ink">{activeLog.actorName}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-ink-muted block">Aksi:</span>
                  <strong className="text-ink">{activeLog.action}</strong>
                </div>
              </div>

              <div>
                <span className="font-bold text-ink block mb-1">Perubahan Nilai Baru (New Value):</span>
                <pre className="p-3 bg-ink text-surface rounded-xl overflow-x-auto text-[11px] font-mono leading-relaxed max-h-48">
                  {activeLog.newValueJson ? JSON.stringify(JSON.parse(activeLog.newValueJson), null, 2) : 'Tidak ada payload'}
                </pre>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex justify-end">
              <button
                type="button"
                onClick={() => setActiveLog(null)}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-surface font-semibold rounded-xl"
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
