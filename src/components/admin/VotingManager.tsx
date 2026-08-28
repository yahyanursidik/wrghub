import React, { useState } from 'react';
import { Vote, Users, CheckCircle2, Award, PieChart, ShieldCheck, Clock, Sparkles, BarChart3, ArrowRight } from 'lucide-react';
import { formatRupiah } from '../../lib/format';

export const VotingManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'election' | 'polls'>('election');

  const electionData = {
    title: 'Pemilihan Ketua RW 05 / RT 02 Periode 2026 - 2029',
    description: 'Musyawarah pemilihan ketua komplek baru untuk masa bakti 3 tahun ke depan.',
    period: '20 - 31 Agustus 2026',
    status: 'SEDANG BERLANGSUNG',
    totalEligible: 120,
    totalVoted: 98,
    turnout: 81.7,
    candidates: [
      {
        number: '01',
        name: 'Bpk. Ir. H. Bambang Sutrisno',
        tagline: 'Mewujudkan Komplek Aman, Asri, dan Transparan Berbasis Digital.',
        votes: 56,
        percentage: 57.1,
        color: 'bg-emerald-600',
        textColor: 'text-emerald-800',
        bgColor: 'bg-emerald-50 border-emerald-200',
      },
      {
        number: '02',
        name: 'Ibu Dr. Ratna Kusuma Wardani',
        tagline: 'Guyub Rukun, Peduli Lansia, dan Pengelolaan Sampah Mandiri Ramah Lingkungan.',
        votes: 42,
        percentage: 42.9,
        color: 'bg-blue-600',
        textColor: 'text-blue-800',
        bgColor: 'bg-blue-50 border-blue-200',
      },
    ],
  };

  const pollsData = [
    {
      id: 'poll-1',
      title: 'Pemasangan 16 Titik Kamera CCTV HD di Seluruh Gang Blok A - D',
      category: 'KEAMANAN',
      budget: 18500000,
      totalVotes: 104,
      options: [
        { label: 'Setuju Disetujui', count: 91, percentage: 87.5, color: 'bg-emerald-500' },
        { label: 'Tidak Setuju', count: 10, percentage: 9.6, color: 'bg-rose-500' },
        { label: 'Abstain', count: 3, percentage: 2.9, color: 'bg-slate-400' },
      ],
    },
    {
      id: 'poll-2',
      title: 'Pengaspalan Ulang (Hotmix) Jalan Utama Boulevard Masuk Komplek',
      category: 'INFRASTRUKTUR',
      budget: 45000000,
      totalVotes: 98,
      options: [
        { label: 'Setuju Disetujui', count: 86, percentage: 87.8, color: 'bg-emerald-500' },
        { label: 'Tidak Setuju', count: 8, percentage: 8.2, color: 'bg-rose-500' },
        { label: 'Abstain', count: 4, percentage: 4.0, color: 'bg-slate-400' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink flex items-center gap-2">
            <Vote className="w-6 h-6 text-primary-600" />
            E-Voting & Musyawarah Warga Digital
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            Monitoring perolehan suara pemilihan Ketua RT/RW dan polling persetujuan proyek fasilitas komplek secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-semibold">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          Sistem Pemilu Warga: AKTIF & TERENKRIPSI
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('election')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'election' ? 'bg-primary-50 text-primary-700 border border-primary-200' : 'text-ink-muted hover:text-ink'
          }`}
        >
          <Award className="w-4 h-4" />
          Pemilihan Ketua RT/RW 2026-2029
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('polls')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'polls' ? 'bg-primary-50 text-primary-700 border border-primary-200' : 'text-ink-muted hover:text-ink'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Polling Proyek & Anggaran Fasilitas ({pollsData.length})
        </button>
      </div>

      {/* TAB 1: ELECTION QUICK COUNT */}
      {activeTab === 'election' && (
        <div className="space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-surface rounded-2xl border border-border shadow-card">
              <span className="text-xs font-semibold text-ink-muted">Tingkat Partisipasi Warga</span>
              <p className="text-2xl font-bold text-ink mt-1 tabular-nums">{electionData.turnout}%</p>
              <span className="text-xs text-emerald-700 font-semibold block mt-1">
                {electionData.totalVoted} dari {electionData.totalEligible} Rumah Telah Memilih
              </span>
            </div>

            <div className="p-5 bg-surface rounded-2xl border border-border shadow-card">
              <span className="text-xs font-semibold text-ink-muted">Metode Pemungutan Suara</span>
              <p className="text-xl font-bold text-primary-700 mt-1">1 Rumah = 1 Suara</p>
              <span className="text-xs text-ink-muted block mt-1">Verifikasi NIK & Nomor Rumah</span>
            </div>

            <div className="p-5 bg-surface rounded-2xl border border-border shadow-card">
              <span className="text-xs font-semibold text-ink-muted">Status Periode Pemilu</span>
              <p className="text-base font-bold text-emerald-600 mt-1">Berakhir 31 Agustus 2026</p>
              <span className="text-xs text-ink-muted block mt-1">Penutupan pukul 23:59 WIB</span>
            </div>
          </div>

          {/* Candidates Live Tally Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {electionData.candidates.map((c) => (
              <div key={c.number} className={`p-6 rounded-3xl border shadow-card space-y-4 ${c.bgColor}`}>
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-surface font-extrabold text-sm text-ink rounded-xl border border-border">
                    KANDIDAT #{c.number}
                  </span>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-ink tabular-nums">{c.percentage}%</span>
                    <span className="text-xs text-ink-muted block font-medium">{c.votes} Suara</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-lg text-ink">{c.name}</h3>
                  <p className="text-xs text-ink-muted leading-relaxed font-medium italic">"{c.tagline}"</p>
                </div>

                <div className="bg-surface rounded-full h-3 overflow-hidden border border-border/80 p-0.5">
                  <div className={`h-full rounded-full ${c.color}`} style={{ width: `${c.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: PROJECT BUDGET POLLS */}
      {activeTab === 'polls' && (
        <div className="space-y-6">
          {pollsData.map((p) => (
            <div key={p.id} className="p-6 bg-surface rounded-3xl border border-border shadow-card space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-md bg-primary-50 text-primary-700 text-[10px] font-bold">
                      {p.category}
                    </span>
                    <span className="text-xs text-ink-muted font-medium">Estimasi Pagu: {formatRupiah(p.budget)}</span>
                  </div>
                  <h3 className="font-bold text-base text-ink">{p.title}</h3>
                </div>

                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200 shrink-0">
                  {p.totalVotes} Rumah Telah Memberikan Suara
                </span>
              </div>

              <div className="space-y-3">
                {p.options.map((opt) => (
                  <div key={opt.label} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-ink">{opt.label}</span>
                      <span className="tabular-nums text-ink">{opt.percentage}% ({opt.count} Suara)</span>
                    </div>
                    <div className="bg-canvas rounded-full h-2.5 overflow-hidden border border-border/60">
                      <div className={`h-full rounded-full ${opt.color}`} style={{ width: `${opt.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
