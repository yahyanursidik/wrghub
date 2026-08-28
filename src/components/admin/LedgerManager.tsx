import React, { useState } from 'react';
import { Download, Search, Filter, Wallet, ArrowDownRight, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { formatRupiah } from '../../lib/format';

interface AccountItem {
  id: string;
  name: string;
  code: string;
  type: string;
  bankName?: string | null;
  accountNumber?: string | null;
  balance: number;
}

interface LedgerEntryItem {
  id: string;
  accountId: string | null;
  entryDate: string;
  direction: string;
  amount: number;
  sourceType: string;
  sourceId?: string | null;
  description: string;
  createdBy?: string | null;
}

interface LedgerManagerProps {
  accounts: AccountItem[];
  entries: LedgerEntryItem[];
}

export const LedgerManager: React.FC<LedgerManagerProps> = ({ accounts, entries }) => {
  const [accountFilter, setAccountFilter] = useState<string>('ALL');
  const [directionFilter, setDirectionFilter] = useState<'ALL' | 'IN' | 'OUT'>('ALL');
  const [search, setSearch] = useState('');

  const filteredEntries = entries.filter((e) => {
    const matchesAccount = accountFilter === 'ALL' || e.accountId === accountFilter;
    const matchesDirection = directionFilter === 'ALL' || e.direction === directionFilter;
    const matchesSearch = e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.sourceType.toLowerCase().includes(search.toLowerCase());
    return matchesAccount && matchesDirection && matchesSearch;
  });

  const totalIn = filteredEntries.filter(e => e.direction === 'IN').reduce((sum, e) => sum + e.amount, 0);
  const totalOut = filteredEntries.filter(e => e.direction === 'OUT').reduce((sum, e) => sum + e.amount, 0);

  const exportCSV = () => {
    const headers = ['Tanggal', 'Akun', 'Tipe', 'Uraian', 'Pemasukan (Debit)', 'Pengeluaran (Kredit)'];
    const rows = filteredEntries.map(e => [
      e.entryDate,
      e.accountId || 'Kas Utama',
      e.sourceType,
      `"${e.description.replace(/"/g, '""')}"`,
      e.direction === 'IN' ? e.amount : '',
      e.direction === 'OUT' ? e.amount : '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `jurnal-kas-wargahub-${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Buku Kas & Jurnal Transaksi</h1>
          <p className="text-sm text-ink-muted mt-1">Histori arus kas masuk dan keluar komplek yang tercatat sistematis.</p>
        </div>

        <button
          type="button"
          onClick={exportCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface hover:bg-canvas border border-border text-ink text-xs font-semibold rounded-xl shadow-xs transition-colors"
        >
          <Download className="w-4 h-4 text-ink-muted" />
          Ekspor Jurnal Kas (CSV)
        </button>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {accounts.map((acc) => (
          <div key={acc.id} className="p-5 bg-surface rounded-2xl border border-border shadow-card flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-ink-muted">{acc.name}</span>
              <p className="text-xl font-bold text-ink mt-1 tabular-nums">{formatRupiah(acc.balance)}</p>
              <span className="text-[11px] font-mono text-ink-muted">{acc.bankName} - {acc.accountNumber}</span>
            </div>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200">
              Aktif
            </span>
          </div>
        ))}
      </div>

      {/* Ledger Table */}
      <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
        <div className="p-4 border-b border-border bg-canvas/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setDirectionFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                directionFilter === 'ALL' ? 'bg-primary-600 text-surface' : 'bg-surface text-ink-muted hover:text-ink border border-border'
              }`}
            >
              Semua Arus
            </button>
            <button
              onClick={() => setDirectionFilter('IN')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                directionFilter === 'IN' ? 'bg-emerald-600 text-surface' : 'bg-surface text-emerald-700 hover:bg-emerald-50 border border-border'
              }`}
            >
              Pemasukan (+{formatRupiah(totalIn)})
            </button>
            <button
              onClick={() => setDirectionFilter('OUT')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                directionFilter === 'OUT' ? 'bg-red-600 text-surface' : 'bg-surface text-red-700 hover:bg-red-50 border border-border'
              }`}
            >
              Pengeluaran (-{formatRupiah(totalOut)})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari transaksi / sumber..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-surface border border-border rounded-xl text-xs text-ink"
            />
          </div>
        </div>

        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-xs text-left">
            <thead className="sticky top-0 bg-canvas border-b border-border text-ink-muted font-semibold">
              <tr>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Tipe</th>
                <th className="py-3 px-4">Uraian / Deskripsi</th>
                <th className="py-3 px-4 text-right">Debit (Masuk)</th>
                <th className="py-3 px-4 text-right">Kredit (Keluar)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-canvas/50 text-ink">
                  <td className="py-3 px-4 font-mono text-ink-muted">{entry.entryDate}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-canvas border border-border font-semibold text-[10px]">
                      {entry.sourceType}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-ink">{entry.description}</td>
                  <td className="py-3 px-4 text-right font-bold tabular-nums text-emerald-600">
                    {entry.direction === 'IN' ? `+ ${formatRupiah(entry.amount)}` : '-'}
                  </td>
                  <td className="py-3 px-4 text-right font-bold tabular-nums text-red-600">
                    {entry.direction === 'OUT' ? `- ${formatRupiah(entry.amount)}` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
