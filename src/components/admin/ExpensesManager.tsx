import React, { useState } from 'react';
import { FileMinus, Plus, ShieldCheck, Sparkles, Zap, Wrench, Wallet, Calendar, PlusCircle } from 'lucide-react';
import { formatRupiah } from '../../lib/format';

interface ExpenseItem {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  expenseDate: string;
  categoryName: string | null;
  status: string;
}

interface ExpensesManagerProps {
  initialExpenses: ExpenseItem[];
}

export const ExpensesManager: React.FC<ExpensesManagerProps> = ({ initialExpenses }) => {
  const [expenses, setExpenses] = useState<ExpenseItem[]>(initialExpenses);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState('Keamanan');

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newAmount) return;
    const numAmount = parseInt(newAmount.replace(/\D/g, ''), 10) || 0;
    try {
      await fetch('/api/expenses/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          amount: numAmount,
          categoryId: newCategory === 'Keamanan' ? 'cat-keamanan' : newCategory === 'Kebersihan' ? 'cat-kebersihan' : newCategory === 'Listrik Fasum' ? 'cat-listrik' : 'cat-pemeliharaan',
        })
      });
      const newExp: ExpenseItem = {
        id: `exp-${Date.now()}`,
        title: newTitle,
        description: 'Dicatat oleh Bendahara',
        amount: numAmount,
        expenseDate: new Date().toISOString().substring(0, 10),
        categoryName: newCategory,
        status: 'APPROVED',
      };
      setExpenses([newExp, ...expenses]);
      setNewTitle('');
      setNewAmount('');
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Pengeluaran & Kas Operasional</h1>
          <p className="text-sm text-ink-muted mt-1">Catat dan pantau pengeluaran dana operasional komplek.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-surface text-sm font-semibold rounded-xl shadow-xs transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Catat Pengeluaran Baru
        </button>
      </div>

      {/* Summary Card */}
      <div className="p-6 bg-surface rounded-2xl border border-border shadow-card flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-ink-muted">Total Pengeluaran Bulan Ini</span>
          <p className="text-2xl sm:text-3xl font-bold text-ink mt-1 tabular-nums">{formatRupiah(totalExpense)}</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-ink-muted">Status Buku Kas</span>
          <span className="block mt-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200">
            Arus Kas Seimbang
          </span>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border bg-canvas/40 text-ink-muted font-semibold">
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Uraian Pengeluaran</th>
                <th className="py-3 px-4 text-right">Nominal</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-canvas/60 text-ink transition-colors">
                  <td className="py-3 px-4 font-mono text-ink-muted">{exp.expenseDate}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-canvas border border-border font-semibold text-[11px]">
                      {exp.categoryName}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-ink">{exp.title}</td>
                  <td className="py-3 px-4 text-right font-bold text-red-600 tabular-nums">
                    - {formatRupiah(exp.amount)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-[10px]">
                      {exp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Catat Pengeluaran */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-2xl max-w-md w-full p-6 border border-border shadow-modal space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-sm text-ink">Catat Pengeluaran Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-ink block mb-1">Kategori</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full p-2.5 bg-surface border border-border rounded-xl text-ink font-medium"
                >
                  <option value="Keamanan">Keamanan</option>
                  <option value="Kebersihan">Kebersihan</option>
                  <option value="Listrik Fasum">Listrik Fasum</option>
                  <option value="Pemeliharaan">Pemeliharaan</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-ink block mb-1">Uraian / Judul Pengeluaran</label>
                <input
                  type="text"
                  placeholder="Contoh: Penggantian 5 unit lampu jalan LED"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <div>
                <label className="font-semibold text-ink block mb-1">Jumlah (Rp)</label>
                <input
                  type="text"
                  placeholder="Contoh: 1500000"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink font-bold tabular-nums"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 rounded-xl border border-border text-ink font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-surface font-semibold shadow-xs"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
