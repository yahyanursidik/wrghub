import React, { useState } from 'react';
import { CreditCard, CheckCircle2, XCircle, Hourglass, Search, Filter, Check, Eye, X, Upload } from 'lucide-react';
import { formatRupiah } from '../../lib/format';
import type { PaymentListItem } from '../../services/payment.service';

interface PaymentsManagerProps {
  initialPayments: PaymentListItem[];
}

export const PaymentsManager: React.FC<PaymentsManagerProps> = ({ initialPayments }) => {
  const [payments, setPayments] = useState<PaymentListItem[]>(initialPayments);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'VERIFIED' | 'REJECTED'>('PENDING');
  const [search, setSearch] = useState('');
  const [viewingProof, setViewingProof] = useState<PaymentListItem | null>(null);

  const filtered = payments.filter((p) => {
    const matchStatus = p.status === activeTab;
    const matchSearch = p.propertyCode.toLowerCase().includes(search.toLowerCase()) || (p.reference && p.reference.toLowerCase().includes(search.toLowerCase()));
    return matchStatus && matchSearch;
  });

  const pendingCount = payments.filter(p => p.status === 'PENDING').length;
  const verifiedCount = payments.filter(p => p.status === 'VERIFIED').length;
  const rejectedCount = payments.filter(p => p.status === 'REJECTED').length;

  const handleVerify = async (paymentId: string) => {
    try {
      await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, verifierUserId: 'user-bendahara', verifierName: 'Hendra Wijaya' })
      });
      setPayments(prev => prev.map(p => {
        if (p.id === paymentId) {
          return { ...p, status: 'VERIFIED', verifiedAt: new Date().toISOString() };
        }
        return p;
      }));
      setViewingProof(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (paymentId: string) => {
    try {
      await fetch('/api/payments/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, reason: 'Bukti transfer tidak sesuai nominal' })
      });
      setPayments(prev => prev.map(p => {
        if (p.id === paymentId) {
          return { ...p, status: 'REJECTED', rejectionReason: 'Bukti transfer tidak sesuai nominal' };
        }
        return p;
      }));
      setViewingProof(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Pembayaran & Verifikasi Iuran</h1>
          <p className="text-sm text-ink-muted mt-1">Kelola dan verifikasi konfirmasi pembayaran iuran warga.</p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab('PENDING')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
            activeTab === 'PENDING'
              ? 'bg-amber-50 text-amber-800 border border-amber-200 shadow-xs'
              : 'text-ink-muted hover:text-ink hover:bg-canvas'
          }`}
        >
          <Hourglass className="w-4 h-4" />
          Menunggu Verifikasi ({pendingCount})
        </button>

        <button
          onClick={() => setActiveTab('VERIFIED')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
            activeTab === 'VERIFIED'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs'
              : 'text-ink-muted hover:text-ink hover:bg-canvas'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Terverifikasi ({verifiedCount})
        </button>

        <button
          onClick={() => setActiveTab('REJECTED')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
            activeTab === 'REJECTED'
              ? 'bg-red-50 text-red-800 border border-red-200 shadow-xs'
              : 'text-ink-muted hover:text-ink hover:bg-canvas'
          }`}
        >
          <XCircle className="w-4 h-4" />
          Ditolak ({rejectedCount})
        </button>
      </div>

      {/* Search Bar */}
      <div className="w-full sm:w-80 relative">
        <Search className="w-4 h-4 text-ink-muted absolute left-3 top-3" />
        <input
          type="text"
          placeholder="Cari rumah (cth: B-14) atau nomor ref..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-xl text-sm text-ink placeholder:text-ink-muted focus:outline-hidden"
        />
      </div>

      {/* Payments Table */}
      <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border bg-canvas/40 text-ink-muted font-semibold">
                <th className="py-3 px-4">Rumah / Unit</th>
                <th className="py-3 px-4">Jumlah</th>
                <th className="py-3 px-4">Metode</th>
                <th className="py-3 px-4">Referensi Transfer</th>
                <th className="py-3 px-4">Waktu Pembayaran</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.map((pay) => (
                <tr key={pay.id} className="hover:bg-canvas/60 text-ink transition-colors">
                  <td className="py-3 px-4 font-bold text-sm text-primary-700">Rumah {pay.propertyCode}</td>
                  <td className="py-3 px-4 font-bold text-ink tabular-nums">{formatRupiah(pay.amount)}</td>
                  <td className="py-3 px-4 font-medium text-ink-muted">{pay.method}</td>
                  <td className="py-3 px-4 font-mono text-ink-muted">{pay.reference || '-'}</td>
                  <td className="py-3 px-4 text-ink-muted tabular-nums">{pay.paidAt}</td>
                  <td className="py-3 px-4 text-right space-x-1.5">
                    <button
                      onClick={() => setViewingProof(pay)}
                      className="px-2.5 py-1 bg-surface hover:bg-canvas border border-border rounded-lg text-xs font-semibold text-ink inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Bukti
                    </button>
                    {pay.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleVerify(pay.id)}
                          className="px-2.5 py-1 bg-primary-600 hover:bg-primary-700 text-surface rounded-lg text-xs font-semibold inline-flex items-center gap-1 shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Verifikasi
                        </button>
                        <button
                          onClick={() => handleReject(pay.id)}
                          className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                        >
                          Tolak
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-ink-muted">
                    Tidak ada pembayaran dalam kategori ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Proof Modal */}
      {viewingProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-2xl max-w-sm w-full p-6 border border-border shadow-modal space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-sm text-ink">Bukti Pembayaran Rumah {viewingProof.propertyCode}</h3>
              <button onClick={() => setViewingProof(null)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            <div className="p-4 bg-canvas rounded-2xl border border-border text-center space-y-3">
              <div className="w-16 h-16 bg-primary-100 text-primary-700 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                <CreditCard className="w-8 h-8" />
              </div>
              <div>
                <p className="text-xs text-ink-muted">Nominal Transfer</p>
                <p className="text-xl font-bold text-ink tabular-nums">{formatRupiah(viewingProof.amount)}</p>
                <p className="text-xs font-mono text-ink-muted mt-1">{viewingProof.reference}</p>
                <p className="text-[11px] text-ink-muted">{viewingProof.paidAt}</p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setViewingProof(null)}
                className="flex-1 py-2 border border-border text-ink font-semibold rounded-xl text-xs"
              >
                Tutup
              </button>
              {viewingProof.status === 'PENDING' && (
                <button
                  onClick={() => handleVerify(viewingProof.id)}
                  className="flex-1 py-2 bg-primary-600 hover:bg-primary-700 text-surface font-semibold rounded-xl text-xs shadow-xs flex items-center justify-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  Verifikasi Sekarang
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
