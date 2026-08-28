import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const activeElection = {
    id: 'elect-2026',
    title: 'Pemilihan Ketua RW 05 / RT 02 Periode 2026 - 2029',
    description: 'Musyawarah pemilihan ketua komplek baru untuk masa bakti 3 tahun ke depan.',
    startDate: '2026-08-20',
    endDate: '2026-08-31',
    status: 'ACTIVE',
    totalEligibleVoters: 120,
    totalVotesCast: 98,
    turnoutPercentage: 81.7,
    candidates: [
      {
        id: 'cand-1',
        candidateNumber: 1,
        name: 'Bpk. Ir. H. Bambang Sutrisno',
        title: 'Calon Nomor Urut 01',
        tagline: 'Mewujudkan Komplek Aman, Asri, dan Transparan Berbasis Digital.',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
        votesCount: 56,
        percentage: 57.1,
        vision: 'Meningkatkan transparansi keuangan kas, modernisasi pos satpam dengan barrier gate otomatis, dan revitalisasi taman anak.',
      },
      {
        id: 'cand-2',
        candidateNumber: 2,
        name: 'Ibu Dr. Ratna Kusuma Wardani',
        title: 'Calon Nomor Urut 02',
        tagline: 'Guyub Rukun, Peduli Lansia, dan Pengelolaan Sampah Mandiri Ramah Lingkungan.',
        photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
        votesCount: 42,
        percentage: 42.9,
        vision: 'Optimalisasi bank sampah warga, program posyandu lansia & balita terpadu, serta pemasangan CCTV di seluruh gang blok.',
      },
    ],
  };

  const activePolls = [
    {
      id: 'poll-1',
      title: 'Pemasangan 16 Titik Kamera CCTV HD di Seluruh Gang Blok A - D',
      category: 'KEAMANAN',
      budgetEstimate: 18500000,
      description: 'Pemasangan kamera CCTV resolusi 4K dengan night vision yang terhubung langsung ke monitor Pos Satpam Utama 24 jam.',
      status: 'ACTIVE',
      totalVotes: 104,
      options: [
        { label: 'Setuju Disetujui', count: 91, percentage: 87.5 },
        { label: 'Tidak Setuju', count: 10, percentage: 9.6 },
        { label: 'Abstain', count: 3, percentage: 2.9 },
      ],
    },
    {
      id: 'poll-2',
      title: 'Pengaspalan Ulang (Hotmix) Jalan Utama Boulevard Masuk Komplek',
      category: 'INFRASTRUKTUR',
      budgetEstimate: 45000000,
      description: 'Pengaspalan hotmix sepanjang 450 meter jalan boulevard utama yang mengalami penurunan akibat musim hujan.',
      status: 'ACTIVE',
      totalVotes: 98,
      options: [
        { label: 'Setuju Disetujui', count: 86, percentage: 87.8 },
        { label: 'Tidak Setuju', count: 8, percentage: 8.2 },
        { label: 'Abstain', count: 4, percentage: 4.0 },
      ],
    },
  ];

  return new Response(
    JSON.stringify({
      data: {
        election: activeElection,
        polls: activePolls,
      },
      meta: { timestamp: new Date().toISOString() },
      error: null,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
