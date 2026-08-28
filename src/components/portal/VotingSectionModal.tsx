import React, { useState } from 'react';
import { Vote, X, CheckCircle2, Award, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';

interface VotingSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyCode: string;
  residentName: string;
}

export const VotingSectionModal: React.FC<VotingSectionModalProps> = ({
  isOpen,
  onClose,
  propertyCode,
  residentName,
}) => {
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const candidates = [
    {
      id: 'cand-1',
      number: '01',
      name: 'Bpk. Ir. H. Bambang Sutrisno',
      tagline: 'Mewujudkan Komplek Aman, Asri, dan Transparan Berbasis Digital.',
      vision: 'Pemasangan smart barrier gate gerbang pos satpam, transparansi kas real-time, dan revitalisasi taman bermain anak.',
      color: 'border-emerald-500 bg-emerald-50/50',
    },
    {
      id: 'cand-2',
      number: '02',
      name: 'Ibu Dr. Ratna Kusuma Wardani',
      tagline: 'Guyub Rukun, Peduli Lansia, dan Pengelolaan Sampah Mandiri Ramah Lingkungan.',
      vision: 'Bank sampah bernilai ekonomis, posyandu lansia terpadu, dan penambahan CCTV 4K di seluruh gang komplek.',
      color: 'border-blue-500 bg-blue-50/50',
    },
  ];

  const handleCastVote = async () => {
    if (!selectedCandidate) return;
    setLoading(true);
    try {
      const res = await fetch('/api/voting/cast-vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType: 'ELECTION',
          targetId: 'elect-2026',
          choiceId: selectedCandidate,
          propertyCode,
          voterName: residentName,
        }),
      });
      const json = await res.json();
      if (json.data) {
        setHasVoted(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-surface rounded-3xl border border-border shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-primary-600 text-surface flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-surface">
              <Vote className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">Bilik Suara Digital (E-Voting)</h3>
              <p className="text-[11px] text-surface/80">Pemilihan Ketua RW 05 / RT 02 (2026-2029)</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-xl transition-colors text-surface"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {hasVoted ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-base text-ink">Suara Anda Berhasil Dicatat!</h4>
              <p className="text-ink-muted leading-relaxed text-[11px] max-w-xs mx-auto">
                Terima kasih atas partisipasi aktif Bapak/Ibu dari <strong>Rumah {propertyCode}</strong> dalam musyawarah pemilihan ketua komplek.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-surface font-bold rounded-xl shadow-xs"
                >
                  Tutup Bilik Suara
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="p-3 bg-canvas rounded-2xl border border-border flex items-center justify-between">
                <div>
                  <span className="text-ink-muted block text-[10px]">Pemilih Terverifikasi</span>
                  <strong className="text-ink">{residentName} (Rumah {propertyCode})</strong>
                </div>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-md border border-emerald-200">
                  Hak Suara: 1 Suara
                </span>
              </div>

              <div className="space-y-3">
                <label className="font-bold text-ink block">Pilih Calon Ketua Komplek:</label>
                {candidates.map((cand) => (
                  <div
                    key={cand.id}
                    onClick={() => setSelectedCandidate(cand.id)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2 ${
                      selectedCandidate === cand.id ? cand.color : 'border-border bg-surface hover:bg-canvas'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs px-2.5 py-0.5 rounded-lg bg-surface border border-border text-ink">
                        NO. URUT {cand.number}
                      </span>
                      {selectedCandidate === cand.id && (
                        <CheckCircle2 className="w-5 h-5 text-primary-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-ink">{cand.name}</h4>
                      <p className="text-[11px] text-ink-muted italic font-medium mt-0.5">"{cand.tagline}"</p>
                    </div>
                    <p className="text-[11px] text-ink leading-relaxed pt-1 border-t border-border/50">
                      <strong>Program Kerja:</strong> {cand.vision}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleCastVote}
                  disabled={!selectedCandidate || loading}
                  className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-surface font-bold rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Vote className="w-4 h-4" />
                  {loading ? 'Menyimpan Suara...' : 'Kirim Pilihan Suara Saya'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
