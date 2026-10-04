import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

const DDL = `
CREATE TABLE IF NOT EXISTS voting_polls (
  id TEXT PRIMARY KEY,
  community_id TEXT NOT NULL DEFAULT 'comm-01',
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'INFRASTRUKTUR',
  budget_estimate NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  ends_at TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS voting_options (
  id TEXT PRIMARY KEY,
  poll_id TEXT NOT NULL REFERENCES voting_polls(id) ON DELETE CASCADE,
  option_number TEXT NOT NULL DEFAULT '01',
  label TEXT NOT NULL,
  subtitle TEXT,
  vision TEXT,
  photo_url TEXT,
  color TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS voting_votes (
  id TEXT PRIMARY KEY,
  poll_id TEXT NOT NULL REFERENCES voting_polls(id) ON DELETE CASCADE,
  option_id TEXT NOT NULL REFERENCES voting_options(id) ON DELETE CASCADE,
  property_code TEXT NOT NULL,
  voter_name TEXT,
  receipt_hash TEXT,
  voted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (poll_id, property_code)
);

CREATE INDEX IF NOT EXISTS idx_voting_votes_poll ON voting_votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_voting_polls_status ON voting_polls(status);
`;

const DEFAULT_ELECTION = {
  id: 'elect-rw05-2026',
  title: 'Pemilihan Ketua RW 05 / RT 02 Paguyuban WargaHub Periode 2026 - 2029',
  description:
    'Musyawarah pemilihan ketua komplek baru untuk masa bakti 3 tahun ke depan secara digital, transparan, dan terverifikasi per unit rumah.',
  endsAt: '2026-12-31',
};

const DEFAULT_CANDIDATES = [
  {
    id: 'elect-rw05-2026-opt1',
    number: '01',
    label: 'Yahya Nursidik',
    subtitle: 'Mewujudkan Komplek Aman, Asri, dan Transparan Berbasis Digital.',
    vision:
      'Meningkatkan transparansi buku kas publik secara realtime, modernisasi portal satpam dengan RFID scan otomatis, serta revitalisasi taman bermain anak fasum.',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    color: 'bg-emerald-600',
  },
  {
    id: 'elect-rw05-2026-opt2',
    number: '02',
    label: 'Ibu Dr. Ratna Kusuma Wardani',
    subtitle: 'Guyub Rukun, Peduli Lansia, dan Pengelolaan Sampah Mandiri Ramah Lingkungan.',
    vision:
      'Optimalisasi pengelolaan TPS3R dan pemilahan daur ulang organik, program posyandu lansia & balita terpadu, serta pemasangan 16 titik CCTV di seluruh gang blok.',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    color: 'bg-blue-600',
  },
];

async function main() {
  for (const stmt of DDL.split(';').map((s) => s.trim()).filter(Boolean)) {
    await sql.query(stmt);
  }
  console.log('✓ Tables ensured: voting_polls, voting_options, voting_votes');

  const existing = await sql`SELECT id FROM voting_polls WHERE category = 'ELECTION' LIMIT 1`;
  if (existing.length === 0) {
    await sql`
      INSERT INTO voting_polls (id, community_id, title, description, category, budget_estimate, status, ends_at, created_by)
      VALUES (${DEFAULT_ELECTION.id}, 'comm-01', ${DEFAULT_ELECTION.title}, ${DEFAULT_ELECTION.description}, 'ELECTION', 0, 'ACTIVE', ${DEFAULT_ELECTION.endsAt}, 'user-admin')
      ON CONFLICT (id) DO NOTHING
    `;
    for (const [i, c] of DEFAULT_CANDIDATES.entries()) {
      await sql`
        INSERT INTO voting_options (id, poll_id, option_number, label, subtitle, vision, photo_url, color, sort_order)
        VALUES (${c.id}, ${DEFAULT_ELECTION.id}, ${c.number}, ${c.label}, ${c.subtitle}, ${c.vision}, ${c.photoUrl}, ${c.color}, ${i + 1})
        ON CONFLICT (id) DO NOTHING
      `;
    }
    console.log('✓ Seeded default election:', DEFAULT_ELECTION.id, 'with 2 candidates');
  } else {
    console.log('• Election already exists:', existing[0].id);
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('FAILED:', e.message);
    process.exit(1);
  });
