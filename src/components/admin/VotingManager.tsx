import React, { useState, useMemo, useEffect } from 'react';
import {
  Vote,
  Users,
  CheckCircle2,
  Award,
  PieChart,
  ShieldCheck,
  Clock,
  Sparkles,
  BarChart3,
  ArrowRight,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Printer,
  Edit3,
  Trash2,
  Share2,
  Copy,
  Plus,
  Check,
  X,
  Phone,
  MessageCircle,
  Building,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FileText,
  AlertTriangle,
  RotateCcw,
  Send,
  HelpCircle
} from 'lucide-react';
import { formatRupiah } from '../../lib/format';

export interface CandidateItem {
  number: string;
  name: string;
  tagline: string;
  vision: string;
  photoUrl: string;
  votes: number;
  percentage: number;
  color: string;
  bgColor: string;
  borderColor: string;
}

export interface PollOption {
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export interface PollItem {
  id: string;
  title: string;
  category: 'KEAMANAN' | 'INFRASTRUKTUR' | 'FASUM' | 'KEUANGAN' | 'LINGKUNGAN';
  budget: number;
  description: string;
  status: 'ACTIVE' | 'CLOSED';
  totalVotes: number;
  endDate: string;
  options: PollOption[];
}

export interface VoterHouse {
  propertyCode: string;
  block: string;
  residentName: string;
  phone: string;
  hasVotedElection: boolean;
  votedAt?: string;
  voteReceiptHash?: string;
}

interface VotingManagerProps {
  initialTab?: string;
  initialProperties?: any[];
}

export const VotingManager: React.FC<VotingManagerProps> = ({ initialTab = 'election', initialProperties = [] }) => {
  // Persistence helpers
  const getPersisted = <T,>(key: string, fallback: T): T => {
    if (typeof window === 'undefined') return fallback;
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : fallback;
    } catch {
      return fallback;
    }
  };

  const savePersisted = (key: string, value: any) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Failed to persist storage:', e);
    }
  };

  const addDeletedIds = (key: string, ids: string[]) => {
    if (typeof window === 'undefined') return;
    try {
      const existing = localStorage.getItem(key);
      const list: string[] = existing ? JSON.parse(existing) : [];
      const updated = Array.from(new Set([...list, ...ids]));
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save deleted IDs:', e);
    }
  };

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Initial Election Data
  const defaultElection = {
    title: 'Pemilihan Ketua RW 05 / RT 02 Paguyuban WargaHub Periode 2026 - 2029',
    description: 'Musyawarah pemilihan ketua komplek baru untuk masa bakti 3 tahun ke depan secara digital, transparan, dan terverifikasi per unit rumah.',
    period: '2026 - 2029',
    status: 'ACTIVE',
    totalEligible: initialProperties?.length || 0,
    totalVoted: 0,
    turnout: 0,
    candidates: [
      {
        number: '01',
        name: 'Bpk. Ir. H. Bambang Sutrisno',
        tagline: 'Mewujudkan Komplek Aman, Asri, dan Transparan Berbasis Digital.',
        vision: 'Meningkatkan transparansi buku kas publik secara realtime, modernisasi portal satpam dengan RFID scan otomatis, serta revitalisasi taman bermain anak fasum.',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
        votes: 0,
        percentage: 0,
        color: 'bg-emerald-600',
        bgColor: 'bg-emerald-50/70',
        borderColor: 'border-emerald-300',
      },
      {
        number: '02',
        name: 'Ibu Dr. Ratna Kusuma Wardani',
        tagline: 'Guyub Rukun, Peduli Lansia, dan Pengelolaan Sampah Mandiri Ramah Lingkungan.',
        vision: 'Optimalisasi pengelolaan TPS3R dan pemilahan daur ulang organik, program posyandu lansia & balita terpadu, serta pemasangan 16 titik CCTV di seluruh gang blok.',
        photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
        votes: 0,
        percentage: 0,
        color: 'bg-blue-600',
        bgColor: 'bg-blue-50/70',
        borderColor: 'border-blue-300',
      },
    ],
  };

  const [election, setElection] = useState(() =>
    getPersisted('wargahub_election_data', defaultElection)
  );

  // 2. Initial Polls Data (5 Polls)
  const defaultPolls: PollItem[] = [
    {
      id: 'poll-1',
      title: 'Pemasangan 16 Titik Kamera CCTV HD 4K di Seluruh Gang Blok A - D',
      category: 'KEAMANAN',
      budget: 18500000,
      description: 'Pemasangan kamera CCTV resolusi 4K dengan infrared night vision yang terhubung langsung ke monitor Pos Satpam 1 selama 24 jam nonstop.',
      status: 'ACTIVE',
      totalVotes: 104,
      endDate: '2026-09-15',
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
      description: 'Pengaspalan hotmix sepanjang 450 meter jalan boulevard utama yang mengalami penurunan permukaan akibat musim hujan.',
      status: 'ACTIVE',
      totalVotes: 98,
      endDate: '2026-09-18',
      options: [
        { label: 'Setuju Disetujui', count: 86, percentage: 87.8, color: 'bg-emerald-500' },
        { label: 'Tidak Setuju', count: 8, percentage: 8.2, color: 'bg-rose-500' },
        { label: 'Abstain', count: 4, percentage: 4.0, color: 'bg-slate-400' },
      ],
    },
    {
      id: 'poll-3',
      title: 'Pembangunan Kanopi Rangka Baja Lapangan Badminton Indoor Balai Warga',
      category: 'FASUM',
      budget: 12000000,
      description: 'Pemasangan atap kanopi spandek peredam panas agar lapangan badminton dapat digunakan saat hujan dan terik siang hari.',
      status: 'ACTIVE',
      totalVotes: 88,
      endDate: '2026-09-22',
      options: [
        { label: 'Setuju Disetujui', count: 76, percentage: 86.4, color: 'bg-emerald-500' },
        { label: 'Tidak Setuju', count: 8, percentage: 9.1, color: 'bg-rose-500' },
        { label: 'Abstain', count: 4, percentage: 4.5, color: 'bg-slate-400' },
      ],
    },
    {
      id: 'poll-4',
      title: 'Pengadaan Mesin Komposter & Alat Pencacah Sampah Organik TPS3R',
      category: 'LINGKUNGAN',
      budget: 8500000,
      description: 'Pengolahan sisa makanan dan dedaunan taman menjadi pupuk kompos organik yang dapat dimanfaatkan warga dan dijual ke kas paguyuban.',
      status: 'ACTIVE',
      totalVotes: 92,
      endDate: '2026-09-25',
      options: [
        { label: 'Setuju Disetujui', count: 84, percentage: 91.3, color: 'bg-emerald-500' },
        { label: 'Tidak Setuju', count: 5, percentage: 5.4, color: 'bg-rose-500' },
        { label: 'Abstain', count: 3, percentage: 3.3, color: 'bg-slate-400' },
      ],
    },
    {
      id: 'poll-5',
      title: 'Pemasangan Portal Barrier Gate Otomatis RFID di Pos Gerbang 2 (Belakang)',
      category: 'KEAMANAN',
      budget: 14000000,
      description: 'Modernisasi akses gerbang pos belakang agar sinkron dengan database RFID warga dan mencegah kendaraan asing masuk tanpa izin.',
      status: 'CLOSED',
      totalVotes: 108,
      endDate: '2026-08-30',
      options: [
        { label: 'Setuju Disetujui', count: 98, percentage: 90.7, color: 'bg-emerald-500' },
        { label: 'Tidak Setuju', count: 7, percentage: 6.5, color: 'bg-rose-500' },
        { label: 'Abstain', count: 3, percentage: 2.8, color: 'bg-slate-400' },
      ],
    }
  ];

  const [polls, setPolls] = useState<PollItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('wargahub_polls_data');
        const deletedStr = localStorage.getItem('wargahub_deleted_polls');
        const deletedIds: string[] = deletedStr ? JSON.parse(deletedStr) : [];
        if (saved !== null) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.filter((p: any) => !deletedIds.includes(p.id));
          }
        }
      } catch (e) {
        console.warn(e);
      }
    }
    return [];
  });

  // 3. Build DPT Voters List from Registered Properties
  const buildVotersFromProperties = (propsList: any[] = []): VoterHouse[] => {
    return propsList.map((p) => ({
      propertyCode: p.code,
      block: p.blockName || (p.blockCode ? `Blok ${p.blockCode}` : 'Komplek'),
      residentName: p.ownerName ? `Bpk/Ibu ${p.ownerName}` : (p.headName ? `Bpk/Ibu ${p.headName}` : 'Penghuni'),
      phone: '-',
      hasVotedElection: false,
    }));
  };

  const [voters, setVoters] = useState<VoterHouse[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('wargahub_voters_dpt');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.warn(e);
      }
    }
    return buildVotersFromProperties(initialProperties);
  });

  const uniqueBlocks = useMemo(() => {
    return Array.from(new Set(voters.map(v => v.block).filter(Boolean)));
  }, [voters]);

  // Active Subtab matching query parameter
  const validTabs = ['election', 'polls', 'voters', 'regulations'];
  const [activeSubTab, setActiveSubTab] = useState<'election' | 'polls' | 'voters' | 'regulations'>(
    validTabs.includes(initialTab) ? (initialTab as any) : 'election'
  );

  // Filters & State for Polls Subtab
  const [pollSearchTerm, setPollSearchTerm] = useState('');
  const [pollCategoryFilter, setPollCategoryFilter] = useState<string>('ALL');
  const [pollStatusFilter, setPollStatusFilter] = useState<string>('ALL');
  const [pollPage, setPollPage] = useState(1);
  const [pollPageSize, setPollPageSize] = useState(3);

  // Multi-Selection State for Polls
  const [selectedPollIds, setSelectedPollIds] = useState<string[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  // Filters & State for Voters Subtab
  const [voterSearchTerm, setVoterSearchTerm] = useState('');
  const [voterBlockFilter, setVoterBlockFilter] = useState<string>('ALL');
  const [voterStatusFilter, setVoterStatusFilter] = useState<string>('ALL');
  const [voterPage, setVoterPage] = useState(1);
  const [voterPageSize, setVoterPageSize] = useState(10);

  // Modals State
  const [showAddPollModal, setShowAddPollModal] = useState(false);
  const [pollToDelete, setPollToDelete] = useState<PollItem | null>(null);
  const [manualVoteVoter, setManualVoteVoter] = useState<VoterHouse | null>(null);
  const [manualCandidateChoice, setManualCandidateChoice] = useState('01');
  const [isSaving, setIsSaving] = useState(false);

  // Form State for Add Poll
  const [formPollTitle, setFormPollTitle] = useState('');
  const [formPollCategory, setFormPollCategory] = useState<PollItem['category']>('INFRASTRUKTUR');
  const [formPollBudget, setFormPollBudget] = useState(15000000);
  const [formPollDesc, setFormPollDesc] = useState('');
  const [formPollEndDate, setFormPollEndDate] = useState(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));

  // Filtered & Paginated Polls
  const filteredPolls = useMemo(() => {
    return polls.filter(p => {
      const matchSearch =
        p.title.toLowerCase().includes(pollSearchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(pollSearchTerm.toLowerCase());
      const matchCategory = pollCategoryFilter === 'ALL' || p.category === pollCategoryFilter;
      const matchStatus = pollStatusFilter === 'ALL' || p.status === pollStatusFilter;
      return matchSearch && matchCategory && matchStatus;
    });
  }, [polls, pollSearchTerm, pollCategoryFilter, pollStatusFilter]);

  const totalPollPages = Math.max(1, Math.ceil(filteredPolls.length / pollPageSize));
  const paginatedPolls = useMemo(() => {
    const startIndex = (pollPage - 1) * pollPageSize;
    return filteredPolls.slice(startIndex, startIndex + pollPageSize);
  }, [filteredPolls, pollPage, pollPageSize]);

  // Filtered & Paginated Voters
  const filteredVoters = useMemo(() => {
    return voters.filter(v => {
      const matchSearch =
        v.propertyCode.toLowerCase().includes(voterSearchTerm.toLowerCase()) ||
        v.residentName.toLowerCase().includes(voterSearchTerm.toLowerCase()) ||
        v.phone.includes(voterSearchTerm);
      const matchBlock = voterBlockFilter === 'ALL' || v.block === voterBlockFilter;
      const matchStatus =
        voterStatusFilter === 'ALL' ||
        (voterStatusFilter === 'VOTED' && v.hasVotedElection) ||
        (voterStatusFilter === 'NOT_VOTED' && !v.hasVotedElection);
      return matchSearch && matchBlock && matchStatus;
    });
  }, [voters, voterSearchTerm, voterBlockFilter, voterStatusFilter]);

  const totalVoterPages = Math.max(1, Math.ceil(filteredVoters.length / voterPageSize));
  const paginatedVoters = useMemo(() => {
    const startIndex = (voterPage - 1) * voterPageSize;
    return filteredVoters.slice(startIndex, startIndex + voterPageSize);
  }, [filteredVoters, voterPage, voterPageSize]);

  // Reset pagination when filters change
  useEffect(() => {
    setPollPage(1);
  }, [pollSearchTerm, pollCategoryFilter, pollStatusFilter, pollPageSize]);

  useEffect(() => {
    setVoterPage(1);
  }, [voterSearchTerm, voterBlockFilter, voterStatusFilter, voterPageSize]);

  // Handlers for Add Poll
  const handleSavePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPollTitle || !formPollDesc) return;
    setIsSaving(true);
    try {
      await fetch('/api/voting/polls/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formPollTitle,
          category: formPollCategory,
          budgetEstimate: Number(formPollBudget),
          description: formPollDesc,
          endDate: formPollEndDate,
        }),
      }).catch(() => {});

      const newPoll: PollItem = {
        id: `poll-${Date.now().toString().slice(-4)}`,
        title: formPollTitle,
        category: formPollCategory,
        budget: Number(formPollBudget),
        description: formPollDesc,
        status: 'ACTIVE',
        totalVotes: 0,
        endDate: formPollEndDate,
        options: [
          { label: 'Setuju Disetujui', count: 0, percentage: 0, color: 'bg-emerald-500' },
          { label: 'Tidak Setuju', count: 0, percentage: 0, color: 'bg-rose-500' },
          { label: 'Abstain', count: 0, percentage: 0, color: 'bg-slate-400' },
        ],
      };

      const updated = [newPoll, ...polls];
      setPolls(updated);
      savePersisted('wargahub_polls_data', updated);
      showToast(`Polling baru "${formPollTitle}" berhasil dibuat.`);
      setShowAddPollModal(false);
    } catch (e) {
      console.error(e);
      showToast('Gagal membuat polling.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePollStatus = async (poll: PollItem) => {
    const nextStatus: 'ACTIVE' | 'CLOSED' = poll.status === 'ACTIVE' ? 'CLOSED' : 'ACTIVE';
    try {
      await fetch('/api/voting/polls/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: poll.id, status: nextStatus }),
      }).catch(() => {});

      const updated = polls.map(p => p.id === poll.id ? { ...p, status: nextStatus } : p);
      setPolls(updated);
      savePersisted('wargahub_polls_data', updated);
      showToast(nextStatus === 'CLOSED' ? `Polling "${poll.title}" telah ditutup.` : `Polling "${poll.title}" dibuka kembali.`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleConfirmDeletePoll = async () => {
    if (!pollToDelete) return;
    try {
      await fetch('/api/voting/polls/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: pollToDelete.id, title: pollToDelete.title }),
      }).catch(() => {});

      const updated = polls.filter(p => p.id !== pollToDelete.id);
      setPolls(updated);
      savePersisted('wargahub_polls_data', updated);
      addDeletedIds('wargahub_deleted_polls', [pollToDelete.id]);
      showToast(`Polling "${pollToDelete.title}" berhasil dihapus.`);
      setPollToDelete(null);
    } catch (e) {
      console.error(e);
      showToast('Gagal menghapus polling.');
    }
  };

  const handleConfirmBulkDeletePolls = async () => {
    if (selectedPollIds.length === 0) return;
    setBulkProcessing(true);
    try {
      await fetch('/api/voting/polls/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedPollIds }),
      }).catch(() => {});

      const updated = polls.filter(p => !selectedPollIds.includes(p.id));
      setPolls(updated);
      savePersisted('wargahub_polls_data', updated);
      addDeletedIds('wargahub_deleted_polls', selectedPollIds);
      showToast(`${selectedPollIds.length} polling berhasil dihapus.`);
      setSelectedPollIds([]);
      setShowBulkDeleteModal(false);
    } catch (e) {
      console.error(e);
      showToast('Gagal menghapus polling massal.');
    } finally {
      setBulkProcessing(false);
    }
  };

  // Helper Manual Vote Support (for elderly assisted voting)
  const handleSaveManualVote = async () => {
    if (!manualVoteVoter) return;
    try {
      await fetch('/api/voting/cast-vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType: 'ELECTION',
          targetId: 'elect-2026',
          choiceId: manualCandidateChoice,
          propertyCode: manualVoteVoter.propertyCode,
          voterName: manualVoteVoter.residentName,
        }),
      }).catch(() => {});

      // Update voter status
      const updatedVoters = voters.map(v => {
        if (v.propertyCode === manualVoteVoter.propertyCode) {
          return {
            ...v,
            hasVotedElection: true,
            votedAt: `${new Date().toISOString().slice(0, 10)}, ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`,
            voteReceiptHash: `SHA256-${manualVoteVoter.propertyCode}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
          };
        }
        return v;
      });
      setVoters(updatedVoters);
      savePersisted('wargahub_voters_dpt', updatedVoters);

      // Update election tally
      const updatedCandidates = election.candidates.map(c => {
        if (c.number === manualCandidateChoice) {
          return { ...c, votes: c.votes + 1 };
        }
        return c;
      });
      const newTotalVoted = election.totalVoted + 1;
      const finalCandidates = updatedCandidates.map(c => ({
        ...c,
        percentage: Number(((c.votes / newTotalVoted) * 100).toFixed(1))
      }));

      const newElection = {
        ...election,
        totalVoted: newTotalVoted,
        turnout: Number(((newTotalVoted / election.totalEligible) * 100).toFixed(1)),
        candidates: finalCandidates
      };
      setElection(newElection);
      savePersisted('wargahub_election_data', newElection);

      showToast(`Suara dari Rumah ${manualVoteVoter.propertyCode} berhasil dicatat sah.`);
      setManualVoteVoter(null);
    } catch (e) {
      console.error(e);
      showToast('Gagal mencatat suara.');
    }
  };

  // Export DPT to CSV
  const handleExportDPTCSV = () => {
    const headers = ['Nomor Rumah', 'Blok Komplek', 'Nama Kepala Keluarga', 'No. WhatsApp', 'Status Memilih', 'Waktu Vote', 'Kode Resi Hash'];
    const rows = voters.map(v => [
      v.propertyCode,
      `"${v.block}"`,
      `"${v.residentName}"`,
      `"${v.phone}"`,
      v.hasVotedElection ? 'SUDAH MEMILIH' : 'BELUM MEMILIH',
      `"${v.votedAt || '-'}"`,
      `"${v.voteReceiptHash || '-'}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DPT_WARGA_E_VOTING_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Data DPT pemilih berhasil diekspor ke CSV.');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 p-4 bg-slate-900 text-white rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-ink flex items-center gap-2">
              <Vote className="w-6 h-6 text-primary-600" />
              E-Voting & Musyawarah Warga Digital
            </h1>
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 font-black text-xs rounded-full border border-emerald-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sistem Pemilu: AKTIF & TERENKRIPSI</span>
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Monitoring perolehan suara pemilihan Ketua RT/RW dan polling persetujuan proyek fasilitas komplek secara real-time dengan prinsip 1 Rumah = 1 Suara Sah.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportDPTCSV}
            className="px-3.5 py-2 bg-surface hover:bg-canvas border border-border text-ink font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-ink-muted" />
            <span>Ekspor DPT (CSV)</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddPollModal(true)}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Buat Polling Proyek</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Metric KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
          <span className="text-[11px] text-ink-muted font-bold block">Tingkat Partisipasi Warga</span>
          <p className="text-2xl font-black text-emerald-700 mt-1 tabular-nums">
            {election.turnout}% <span className="text-xs font-normal text-ink-muted">({election.totalVoted}/{election.totalEligible})</span>
          </p>
          <div className="w-full bg-canvas h-1.5 rounded-full overflow-hidden mt-1">
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${election.turnout}%` }} />
          </div>
        </div>

        <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
          <span className="text-[11px] text-ink-muted font-bold block">Total Hak Pilih (DPT)</span>
          <p className="text-2xl font-black text-primary-700 mt-1 tabular-nums">
            {election.totalEligible} <span className="text-xs font-normal text-ink-muted">Rumah</span>
          </p>
          <span className="text-[10px] text-primary-600 font-bold">1 Rumah = 1 Suara Sah</span>
        </div>

        <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
          <span className="text-[11px] text-ink-muted font-bold block">Polling Proyek Berjalan</span>
          <p className="text-2xl font-black text-amber-700 mt-1 tabular-nums">
            {polls.filter(p => p.status === 'ACTIVE').length} <span className="text-xs font-normal text-ink-muted">Musyawarah</span>
          </p>
          <span className="text-[10px] text-amber-600 font-bold">CCTV, Aspal, Kanopi & Komposter</span>
        </div>

        <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
          <span className="text-[11px] text-ink-muted font-bold block">Periode Pemilu Digital</span>
          <p className="text-lg font-black text-purple-700 mt-1">
            Aktif s/d 15 Sep
          </p>
          <span className="text-[10px] text-purple-600 font-bold">Penutupan Pukul 23:59 WIB</span>
        </div>
      </div>

      {/* 4 Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 p-1.5 bg-surface rounded-2xl border border-border shadow-xs overflow-x-auto no-scrollbar">
        {[
          { id: 'election', label: 'Pemilihan Ketua RT/RW (Quick Count)', icon: Award, count: `${election.turnout}%` },
          { id: 'polls', label: 'Polling & Musyawarah Proyek', icon: BarChart3, count: polls.length },
          { id: 'voters', label: 'Daftar Partisipasi Pemilih per Rumah (DPT)', icon: Users, count: `${voters.filter(v => v.hasVotedElection).length}/${voters.length}` },
          { id: 'regulations', label: 'Tata Tertib & Berita Acara', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'text-ink-muted hover:text-ink hover:bg-canvas'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                  isActive ? 'bg-white/20 text-white' : 'bg-canvas text-ink-muted border border-border'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ================= SUBTAB 1: ELECTION QUICK COUNT ================= */}
      {activeSubTab === 'election' && (
        <div className="space-y-6 animate-in fade-in duration-150 text-xs">
          {/* Candidates Live Tally Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {election.candidates.map((c) => (
              <div
                key={c.number}
                className={`p-5 rounded-3xl border ${c.borderColor} ${c.bgColor} space-y-4 shadow-card transition-all`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={c.photoUrl}
                      alt={c.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-surface shadow-xs"
                    />
                    <div>
                      <span className={`px-2 py-0.5 rounded-full text-white font-black text-[10px] ${c.color}`}>
                        KANDIDAT #{c.number}
                      </span>
                      <h4 className="text-base font-black text-ink mt-1">{c.name}</h4>
                      <p className="text-[11px] text-ink-muted italic">&ldquo;{c.tagline}&rdquo;</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl font-black text-ink font-mono tabular-nums">{c.votes}</span>
                    <span className="text-xs text-ink-muted block font-bold">{c.percentage}% Suara</span>
                  </div>
                </div>

                <div className="p-3 bg-surface/90 backdrop-blur-xs rounded-2xl border border-border/80 text-[11px] text-ink leading-relaxed">
                  <span className="font-bold text-primary-800 block mb-0.5">Visi & Program Unggulan:</span>
                  {c.vision}
                </div>

                <div className="bg-surface rounded-full h-3.5 overflow-hidden border border-border/80 p-0.5">
                  <div className={`h-full rounded-full ${c.color} transition-all duration-500`} style={{ width: `${c.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Quick Count Breakdown per Block */}
          <div className="p-5 bg-surface rounded-3xl border border-border shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <h3 className="font-black text-base text-ink flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-primary-600" />
                  Rincian Perolehan Suara Terverifikasi per Kluster Blok
                </h3>
                <p className="text-ink-muted mt-0.5">
                  Distribusi pemilih yang telah mencoblos dari total {voters.length} unit rumah komplek.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `📊 *HASIL SEMENTARA E-VOTING KETUA RW 05 / RT 02 WARGAHUB*\n\n` +
                    `Total Partisipasi: ${election.totalVoted}/${election.totalEligible} Rumah (${election.turnout}%)\n\n` +
                    `• Kandidat #01 (${election.candidates[0].name}): ${election.candidates[0].votes} Suara (${election.candidates[0].percentage}%)\n` +
                    `• Kandidat #02 (${election.candidates[1].name}): ${election.candidates[1].votes} Suara (${election.candidates[1].percentage}%)\n\n` +
                    `Pantau perolehan suara realtime: http://localhost:4321/warga\n- Panitia Pemilu WargaHub`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl inline-flex items-center gap-1.5 shadow-xs"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Bagikan Hasil ke WhatsApp</span>
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              {uniqueBlocks.length > 0 ? (
                uniqueBlocks.map((blockName) => {
                  const blockVoters = voters.filter(v => v.block === blockName);
                  const votedCount = blockVoters.filter(v => v.hasVotedElection).length;
                  const pct = blockVoters.length > 0 ? Math.round((votedCount / blockVoters.length) * 100) : 0;
                  return (
                    <div key={blockName} className="p-3.5 bg-canvas rounded-2xl border border-border">
                      <span className="font-bold text-ink block text-xs truncate" title={blockName}>{blockName} ({blockVoters.length} Unit)</span>
                      <p className="text-base font-black text-emerald-700 mt-1">{votedCount} Suara ({pct}%)</p>
                      <span className="text-[10px] text-ink-muted">{blockVoters.length - votedCount} belum vote</span>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full py-6 text-center text-ink-muted text-xs">
                  Belum ada unit rumah tercatat dalam DPT.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= SUBTAB 2: POLLS DENGAN PAGINATION ================= */}
      {activeSubTab === 'polls' && (
        <div className="space-y-4 animate-in fade-in duration-150 text-xs">
          {/* Floating Bulk Action Bar for Polls */}
          {selectedPollIds.length > 0 && (
            <div className="p-3.5 bg-primary-50 border border-primary-300 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in shadow-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-primary-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                  {selectedPollIds.length}
                </span>
                <div>
                  <p className="font-bold text-xs text-primary-950">
                    {selectedPollIds.length} Polling Terpilih
                  </p>
                  <p className="text-[11px] text-primary-700">
                    Pilih aksi massal untuk polling yang telah diceklis.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPollIds([])}
                  className="px-3.5 py-2 rounded-xl border border-primary-200 bg-surface text-ink text-xs font-bold hover:bg-canvas"
                >
                  Batalkan Pilihan
                </button>
                <button
                  type="button"
                  disabled={bulkProcessing}
                  onClick={() => setShowBulkDeleteModal(true)}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Massal</span>
                </button>
              </div>
            </div>
          )}

          {/* Search & Filter Bar for Polls */}
          <div className="p-4 bg-surface rounded-2xl border border-border shadow-card flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari polling proyek fasilitas..."
                value={pollSearchTerm}
                onChange={(e) => setPollSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-canvas border border-border rounded-xl text-xs text-ink placeholder:text-ink-muted"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                value={pollCategoryFilter}
                onChange={(e) => setPollCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="ALL">Semua Kategori ({polls.length})</option>
                <option value="KEAMANAN">Keamanan</option>
                <option value="INFRASTRUKTUR">Infrastruktur</option>
                <option value="FASUM">Sarana & Fasum</option>
                <option value="LINGKUNGAN">Lingkungan & Sampah</option>
              </select>

              <select
                value={pollStatusFilter}
                onChange={(e) => setPollStatusFilter(e.target.value)}
                className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="ALL">Semua Status</option>
                <option value="ACTIVE">Aktif Berjalan</option>
                <option value="CLOSED">Selesai / Ditutup</option>
              </select>
            </div>
          </div>

          {/* Paginated Polls List */}
          <div className="space-y-4">
            {paginatedPolls.length === 0 ? (
              <div className="p-12 text-center text-ink-muted font-medium bg-surface rounded-3xl border border-border">
                <BarChart3 className="w-10 h-10 text-primary-400 mx-auto mb-2 opacity-60" />
                Tidak ada polling musyawarah yang cocok dengan filter pencarian.
              </div>
            ) : (
              paginatedPolls.map((p) => {
                const isSelected = selectedPollIds.includes(p.id);
                return (
                  <div
                    key={p.id}
                    className={`p-6 bg-surface rounded-3xl border transition-all shadow-card space-y-4 relative overflow-hidden ${
                      isSelected ? 'border-primary-500 ring-2 ring-primary-300' : 'border-border'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            setSelectedPollIds(prev =>
                              prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id]
                            );
                          }}
                          className="mt-1 rounded border-border text-primary-600"
                        />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 text-[10px] font-bold border border-primary-200">
                              {p.category}
                            </span>
                            <span className="text-xs text-ink-muted font-semibold">
                              Estimasi Pagu: <strong>{formatRupiah(p.budget)}</strong>
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {p.status === 'ACTIVE' ? 'AKTIF' : 'DITUTUP'}
                            </span>
                          </div>
                          <h3 className="font-black text-base text-ink">{p.title}</h3>
                          <p className="text-xs text-ink-muted mt-0.5 leading-relaxed">{p.description}</p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:items-end gap-1 shrink-0">
                        <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                          {p.totalVotes} Rumah Telah Memilih
                        </span>
                        <span className="text-[10px] text-ink-muted font-mono">Batas: {p.endDate}</span>
                      </div>
                    </div>

                    {/* Poll Bars */}
                    <div className="space-y-3">
                      {p.options.map((opt) => (
                        <div key={opt.label} className="space-y-1">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-ink">{opt.label}</span>
                            <span className="tabular-nums text-ink">{opt.percentage}% ({opt.count} Suara)</span>
                          </div>
                          <div className="bg-canvas rounded-full h-3 overflow-hidden border border-border/60 p-0.5">
                            <div className={`h-full rounded-full ${opt.color} transition-all duration-500`} style={{ width: `${opt.percentage}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-2 border-t border-border flex items-center justify-between">
                      <span className="text-[11px] text-ink-muted">
                        ID: <strong className="font-mono">{p.id}</strong>
                      </span>

                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleTogglePollStatus(p)}
                          className="px-2.5 py-1 rounded-xl border border-border text-ink font-bold text-[11px] hover:bg-canvas"
                        >
                          {p.status === 'ACTIVE' ? 'Tutup Polling' : 'Buka Kembali'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setPollToDelete(p)}
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded-xl font-bold"
                          title="Hapus Polling"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination Controls for Polls */}
          <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-ink-muted">
              <span>Menampilkan</span>
              <select
                value={pollPageSize}
                onChange={(e) => setPollPageSize(Number(e.target.value))}
                className="px-2 py-1 bg-canvas border border-border rounded-lg font-bold text-ink"
              >
                <option value={2}>2 Polling</option>
                <option value={3}>3 Polling</option>
                <option value={5}>5 Polling</option>
                <option value={10}>10 Polling</option>
              </select>
              <span>dari <strong>{filteredPolls.length}</strong> Total Polling</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={pollPage === 1}
                onClick={() => setPollPage(1)}
                className="p-2 rounded-xl border border-border bg-canvas hover:bg-surface text-ink font-bold disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                disabled={pollPage === 1}
                onClick={() => setPollPage(p => Math.max(1, p - 1))}
                className="p-2 rounded-xl border border-border bg-canvas hover:bg-surface text-ink font-bold disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <span className="px-3 font-bold text-ink">
                Halaman {pollPage} dari {totalPollPages}
              </span>

              <button
                type="button"
                disabled={pollPage === totalPollPages}
                onClick={() => setPollPage(p => Math.min(totalPollPages, p + 1))}
                className="p-2 rounded-xl border border-border bg-canvas hover:bg-surface text-ink font-bold disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                disabled={pollPage === totalPollPages}
                onClick={() => setPollPage(totalPollPages)}
                className="p-2 rounded-xl border border-border bg-canvas hover:bg-surface text-ink font-bold disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronsRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUBTAB 3: DPT PEMILIH DENGAN PAGINATION ================= */}
      {activeSubTab === 'voters' && (
        <div className="space-y-4 animate-in fade-in duration-150 text-xs">
          {/* Search & Filter Bar for Voters */}
          <div className="p-4 bg-surface rounded-2xl border border-border shadow-card flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari kode rumah (A-17, B-04), nama warga, HP..."
                value={voterSearchTerm}
                onChange={(e) => setVoterSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-canvas border border-border rounded-xl text-xs text-ink placeholder:text-ink-muted"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                value={voterBlockFilter}
                onChange={(e) => setVoterBlockFilter(e.target.value)}
                className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="ALL">Semua Blok ({voters.length} Unit)</option>
                {uniqueBlocks.map((blk) => (
                  <option key={blk} value={blk}>{blk} ({voters.filter(v => v.block === blk).length} Unit)</option>
                ))}
              </select>

              <select
                value={voterStatusFilter}
                onChange={(e) => setVoterStatusFilter(e.target.value)}
                className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="ALL">Semua Status Vote</option>
                <option value="VOTED">🟢 Sudah Memilih ({voters.filter(v => v.hasVotedElection).length})</option>
                <option value="NOT_VOTED">🔴 Belum Memilih ({voters.filter(v => !v.hasVotedElection).length})</option>
              </select>
            </div>
          </div>

          {/* Voters Table */}
          <div className="bg-surface rounded-3xl border border-border shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border bg-canvas text-ink-muted font-bold">
                    <th className="py-3.5 px-4">No. Rumah & Blok</th>
                    <th className="py-3.5 px-4">Nama Kepala Keluarga</th>
                    <th className="py-3.5 px-4">Kontak WhatsApp</th>
                    <th className="py-3.5 px-4 text-center">Status Partisipasi</th>
                    <th className="py-3.5 px-4">Waktu Vote / Resi Token</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {paginatedVoters.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-ink-muted">
                        <Users className="w-8 h-8 mx-auto mb-2 text-ink-muted/50" />
                        <p className="font-bold text-sm text-ink">Tidak ada data pemilih DPT</p>
                        <p className="text-[11px] mt-1">Belum ada unit rumah terdaftar atau tidak sesuai dengan filter pencarian.</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedVoters.map((v) => (
                    <tr key={v.propertyCode} className="hover:bg-canvas/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-black text-primary-700 block">{v.propertyCode}</span>
                        <span className="text-[10px] text-ink-muted">{v.block}</span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-ink">
                        {v.residentName}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-ink">
                        {v.phone}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {v.hasVotedElection ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                            ✓ SUDAH MEMILIH
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-900 font-bold text-[10px] border border-rose-200 animate-pulse">
                            BELUM MEMILIH
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {v.hasVotedElection ? (
                          <div>
                            <span className="text-[11px] text-ink block">{v.votedAt}</span>
                            <span className="font-mono text-[9px] text-primary-700 font-bold">{v.voteReceiptHash}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-ink-muted italic">Menunggu partisipasi warga</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {!v.hasVotedElection ? (
                          <div className="inline-flex items-center gap-1">
                            <a
                              href={`https://api.whatsapp.com/send?phone=${v.phone.replace(/[^0-9]/g, '')}&text=${encodeURIComponent(
                                `Halo ${v.residentName} (Rumah ${v.propertyCode}), kami dari Panitia Pemilu WargaHub mengingatkan untuk menggunakan hak suara Anda dalam Pemilihan Ketua RW 05 periode 2026-2029.\n\nSilakan akses portal E-Voting: http://localhost:4321/warga\nTerima kasih!`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-bold text-[10px] inline-flex items-center gap-1"
                            >
                              <Send className="w-3 h-3 text-emerald-600" />
                              <span>Ingatkan WA</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => setManualVoteVoter(v)}
                              className="px-2.5 py-1 bg-primary-50 hover:bg-primary-100 text-primary-800 rounded-lg font-bold text-[10px]"
                              title="Bantu input suara manual lansia"
                            >
                              Bantu Vote
                            </button>
                          </div>
                        ) : (
                          <span className="text-emerald-700 font-bold text-[10px]">Terverifikasi</span>
                        )}
                      </td>
                    </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ================= PAGINATION CONTROLS FOR VOTERS ================= */}
          <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-ink-muted">
              <span>Menampilkan</span>
              <select
                value={voterPageSize}
                onChange={(e) => setVoterPageSize(Number(e.target.value))}
                className="px-2 py-1 bg-canvas border border-border rounded-lg font-bold text-ink"
              >
                <option value={10}>10 Baris</option>
                <option value={25}>25 Baris</option>
                <option value={50}>50 Baris</option>
                <option value={100}>100 Baris</option>
              </select>
              <span>dari <strong>{filteredVoters.length}</strong> Rumah DPT</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={voterPage === 1}
                onClick={() => setVoterPage(1)}
                className="p-2 rounded-xl border border-border bg-canvas hover:bg-surface text-ink font-bold disabled:opacity-30 disabled:pointer-events-none"
                title="Halaman Pertama"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                disabled={voterPage === 1}
                onClick={() => setVoterPage(p => Math.max(1, p - 1))}
                className="p-2 rounded-xl border border-border bg-canvas hover:bg-surface text-ink font-bold disabled:opacity-30 disabled:pointer-events-none"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-1 px-2">
                {Array.from({ length: totalVoterPages }, (_, i) => i + 1)
                  .filter(page => page === 1 || page === totalVoterPages || Math.abs(page - voterPage) <= 1)
                  .map((page, idx, arr) => {
                    const prev = arr[idx - 1];
                    return (
                      <React.Fragment key={page}>
                        {prev && page - prev > 1 && <span className="text-ink-muted px-1">...</span>}
                        <button
                          type="button"
                          onClick={() => setVoterPage(page)}
                          className={`w-8 h-8 rounded-xl font-black text-xs transition-colors ${
                            voterPage === page
                              ? 'bg-primary-600 text-white shadow-xs'
                              : 'bg-canvas hover:bg-surface text-ink border border-border'
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>

              <button
                type="button"
                disabled={voterPage === totalVoterPages}
                onClick={() => setVoterPage(p => Math.min(totalVoterPages, p + 1))}
                className="p-2 rounded-xl border border-border bg-canvas hover:bg-surface text-ink font-bold disabled:opacity-30 disabled:pointer-events-none"
                title="Halaman Berikutnya"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                disabled={voterPage === totalVoterPages}
                onClick={() => setVoterPage(totalVoterPages)}
                className="p-2 rounded-xl border border-border bg-canvas hover:bg-surface text-ink font-bold disabled:opacity-30 disabled:pointer-events-none"
                title="Halaman Terakhir"
              >
                <ChevronsRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUBTAB 4: TATA TERTIB & BERITA ACARA ================= */}
      {activeSubTab === 'regulations' && (
        <div className="space-y-4 animate-in fade-in duration-150 text-xs">
          <div className="p-6 bg-surface rounded-3xl border border-border shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <h3 className="font-black text-base text-ink flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary-600" />
                  Berita Acara & Ketentuan Tata Tertib Musyawarah Digital
                </h3>
                <p className="text-ink-muted mt-0.5">
                  Regulasi pelaksanaan musyawarah, pemungutan suara digital, dan berita acara pleno pengurus.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const content = `BERITA ACARA REKAPITULASI HASIL E-VOTING WARGAHUB\n========================================================\nNomor Dokumen: BA-PLENO/RW05/IX/2026\nPerihal: Pemilihan Ketua RW 05 / RT 02 Periode 2026-2029\n\n1. Jumlah Daftar Pemilih Tetap (DPT): ${voters.length} Rumah\n2. Jumlah Suara Masuk: ${election.totalVoted} Rumah (${election.turnout}%)\n\nPEROLEHAN SUARA SAH KANDIDAT:\n• Kandidat #01 (${election.candidates[0].name}): ${election.candidates[0].votes} Suara (${election.candidates[0].percentage}%)\n• Kandidat #02 (${election.candidates[1].name}): ${election.candidates[1].votes} Suara (${election.candidates[1].percentage}%)\n\nDemikian Berita Acara ini dibuat dengan sebenarnya menggunakan sistem E-Voting WargaHub yang terenkripsi dan terverifikasi per unit rumah.\n\nDicetak pada: ${new Date().toLocaleString('id-ID')}`;
                  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `BERITA_ACARA_E_VOTING_RW05_${new Date().toISOString().slice(0, 10)}.txt`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  showToast('Berita acara rekapitulasi pemilu berhasil diunduh.');
                }}
                className="px-3.5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl inline-flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Berita Acara (.txt)</span>
              </button>
            </div>

            <div className="space-y-3 leading-relaxed text-ink">
              <div className="p-4 bg-canvas rounded-2xl border border-border space-y-2">
                <h4 className="font-bold text-sm text-primary-800">1. Asas Pemungutan Suara</h4>
                <p className="text-ink-muted">
                  Pemilihan dan musyawarah proyek dilaksanakan berdasarkan asas <strong>Langsung, Umum, Bebas, Rahasia, Jujur, dan Adil</strong> dengan mekanisme <strong>1 Unit Rumah = 1 Hak Suara Sah</strong>.
                </p>
              </div>

              <div className="p-4 bg-canvas rounded-2xl border border-border space-y-2">
                <h4 className="font-bold text-sm text-primary-800">2. Keamanan & Verifikasi Kriptografi</h4>
                <p className="text-ink-muted">
                  Setiap suara yang masuk langsung dikunci dengan token hash kriptografis SHA-256 yang tidak dapat dimanipulasi dan dapat diverifikasi mandiri oleh pemilik rumah melalui bukti resi digital.
                </p>
              </div>

              <div className="p-4 bg-canvas rounded-2xl border border-border space-y-2">
                <h4 className="font-bold text-sm text-primary-800">3. Bantuan Warga Lansia / Disabilitas</h4>
                <p className="text-ink-muted">
                  Warga lansia yang memerlukan bantuan teknologi dapat didampingi panitia pemilu atau petugas pos satpam untuk menginputkan pilihan secara langsung sesuai kehendak warga yang bersangkutan.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: TAMBAH POLLING PROYEK ================= */}
      {showAddPollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-lg w-full p-6 border border-border shadow-modal max-h-[90vh] overflow-y-auto space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-base text-ink flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary-600" />
                <span>Buat Polling & Musyawarah Proyek Baru</span>
              </h3>
              <button onClick={() => setShowAddPollModal(false)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            <form onSubmit={handleSavePoll} className="space-y-3">
              <div>
                <label className="font-bold text-ink block mb-1">Judul Usulan Proyek / Musyawarah *</label>
                <input
                  type="text"
                  placeholder="Contoh: Pengadaan Mesin Komposter Sampah TPS3R"
                  value={formPollTitle}
                  onChange={(e) => setFormPollTitle(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">Kategori Proyek</label>
                  <select
                    value={formPollCategory}
                    onChange={(e) => setFormPollCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="INFRASTRUKTUR">Infrastruktur & Jalan</option>
                    <option value="KEAMANAN">Keamanan & CCTV</option>
                    <option value="FASUM">Sarana & Fasilitas</option>
                    <option value="LINGKUNGAN">Lingkungan & Kebersihan</option>
                    <option value="KEUANGAN">Keuangan Kas</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Estimasi Pagu Anggaran (Rp)</label>
                  <input
                    type="number"
                    value={formPollBudget}
                    onChange={(e) => setFormPollBudget(Number(e.target.value))}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono font-bold text-ink"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Rincian Deskripsi Usulan Proyek *</label>
                <textarea
                  rows={3}
                  placeholder="Jelaskan tujuan proyek, rincian teknis, dan manfaat bagi seluruh warga komplek..."
                  value={formPollDesc}
                  onChange={(e) => setFormPollDesc(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink leading-relaxed"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Batas Waktu Polling</label>
                <input
                  type="date"
                  value={formPollEndDate}
                  onChange={(e) => setFormPollEndDate(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPollModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-xs disabled:opacity-50"
                >
                  {isSaving ? 'Menyimpan...' : 'Terbitkan Polling'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: MANUAL ASSISTED VOTE ================= */}
      {manualVoteVoter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-border shadow-modal space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-base text-ink flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-600" />
                <span>Bantu Catat Suara (Warga Lansia)</span>
              </h3>
              <button onClick={() => setManualVoteVoter(null)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            <div className="p-3 bg-canvas rounded-2xl border border-border space-y-1">
              <p className="font-bold text-ink">Pemilih: {manualVoteVoter.residentName}</p>
              <p className="text-primary-700 font-mono font-bold">Rumah {manualVoteVoter.propertyCode} ({manualVoteVoter.block})</p>
            </div>

            <div className="space-y-2">
              <label className="font-bold text-ink block">Pilih Kandidat Sesuai Mandat Warga:</label>
              {election.candidates.map((c) => (
                <div
                  key={c.number}
                  onClick={() => setManualCandidateChoice(c.number)}
                  className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-colors ${
                    manualCandidateChoice === c.number
                      ? 'bg-primary-50 border-primary-500 ring-2 ring-primary-300'
                      : 'bg-canvas border-border hover:bg-surface'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-xl bg-surface border border-border flex items-center justify-center font-black text-xs text-ink">
                      #{c.number}
                    </span>
                    <div>
                      <strong className="text-ink block">{c.name}</strong>
                    </div>
                  </div>
                  {manualCandidateChoice === c.number && <Check className="w-4 h-4 text-primary-600" />}
                </div>
              ))}
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setManualVoteVoter(null)}
                className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveManualVote}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs"
              >
                Konfirmasi Suara Sah
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: KONFIRMASI HAPUS POLLING ================= */}
      {pollToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-red-200 shadow-modal space-y-4 text-xs">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-black text-base text-ink">Hapus Polling Musyawarah?</h3>
              <p className="text-ink-muted">
                Polling <strong>"{pollToDelete.title}"</strong> beserta data suaranya akan dihapus permanen.
              </p>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setPollToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeletePoll}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs"
              >
                Ya, Hapus Polling
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: KONFIRMASI HAPUS MASSAL POLLING ================= */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-red-200 shadow-modal space-y-4 text-xs">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-black text-base text-ink">Hapus {selectedPollIds.length} Polling Terpilih?</h3>
              <p className="text-ink-muted">
                Sebanyak <strong>{selectedPollIds.length} polling musyawarah</strong> yang telah diceklis akan dihapus permanen.
              </p>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                disabled={bulkProcessing}
                onClick={() => setShowBulkDeleteModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={bulkProcessing}
                onClick={handleConfirmBulkDeletePolls}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{bulkProcessing ? 'Menghapus...' : `Ya, Hapus (${selectedPollIds.length})`}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
