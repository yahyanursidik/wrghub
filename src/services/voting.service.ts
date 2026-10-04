import { neonSql } from '../db/neon';
import { db, schema } from '../db';
import { eq, inArray, desc, asc } from 'drizzle-orm';
import { createHash, randomBytes } from 'node:crypto';
import { recordAuditLog } from './audit.service';

// ================= VOTING & MUSYAWARAH DIGITAL =================
// Sumber kebenaran: tabel voting_polls / voting_options / voting_votes.
// Asas: 1 Unit Rumah = 1 Suara Sah per polling (unique poll_id + property_code).

export const POLL_CATEGORIES = ['KEAMANAN', 'INFRASTRUKTUR', 'FASUM', 'KEUANGAN', 'LINGKUNGAN', 'LAINNYA'] as const;
export type PollCategory = (typeof POLL_CATEGORIES)[number];

export const DEFAULT_POLL_OPTIONS = [
  { number: '01', label: 'Setuju Disetujui', color: 'bg-emerald-500' },
  { number: '02', label: 'Tidak Setuju', color: 'bg-rose-500' },
  { number: '03', label: 'Abstain', color: 'bg-slate-400' },
];

export interface VotingOptionRow {
  id: string;
  pollId: string;
  number: string;
  label: string;
  subtitle: string | null;
  vision: string | null;
  photoUrl: string | null;
  color: string;
  sortOrder: number;
  votes: number;
  percentage: number;
}

export interface VotingPollRow {
  id: string;
  title: string;
  description: string | null;
  category: string;
  budgetEstimate: number;
  status: 'ACTIVE' | 'CLOSED';
  endsAt: string | null;
  createdAt: string;
  totalVotes: number;
  options: VotingOptionRow[];
}

export interface VoterRollRow {
  propertyCode: string;
  block: string;
  residentName: string;
  phone: string;
  hasVotedElection: boolean;
  votedAt: string | null;
  voteReceiptHash: string | null;
  choiceOptionId: string | null;
}

export interface VotingDashboardData {
  election: {
    id: string;
    title: string;
    description: string | null;
    status: 'ACTIVE' | 'CLOSED';
    endsAt: string | null;
    totalEligible: number;
    totalVoted: number;
    turnout: number;
    candidates: VotingOptionRow[];
  } | null;
  polls: VotingPollRow[];
  voters: VoterRollRow[];
}

// Skema dibuat idempoten sekali per proses server agar endpoint tidak
// gagal bila tabel belum ada (mis. database baru).
let schemaReady: Promise<void> | null = null;
export function ensureVotingSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      if (!process.env.DATABASE_URL) return;
      const stmts = [
        `CREATE TABLE IF NOT EXISTS voting_polls (
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
        )`,
        `CREATE TABLE IF NOT EXISTS voting_options (
          id TEXT PRIMARY KEY,
          poll_id TEXT NOT NULL REFERENCES voting_polls(id) ON DELETE CASCADE,
          option_number TEXT NOT NULL DEFAULT '01',
          label TEXT NOT NULL,
          subtitle TEXT,
          vision TEXT,
          photo_url TEXT,
          color TEXT,
          sort_order INTEGER NOT NULL DEFAULT 0
        )`,
        `CREATE TABLE IF NOT EXISTS voting_votes (
          id TEXT PRIMARY KEY,
          poll_id TEXT NOT NULL REFERENCES voting_polls(id) ON DELETE CASCADE,
          option_id TEXT NOT NULL REFERENCES voting_options(id) ON DELETE CASCADE,
          property_code TEXT NOT NULL,
          voter_name TEXT,
          receipt_hash TEXT,
          voted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          UNIQUE (poll_id, property_code)
        )`,
        `CREATE INDEX IF NOT EXISTS idx_voting_votes_poll ON voting_votes(poll_id)`,
      ];
      for (const stmt of stmts) {
        await neonSql.unsafe(stmt);
      }
    })().catch((e) => {
      schemaReady = null;
      throw e;
    });
  }
  return schemaReady;
}

function extractFromNotes(notes: string | null | undefined, field: 'Pemilik' | 'Kepala Keluarga'): string | null {
  if (!notes) return null;
  const match = notes.match(new RegExp(`${field}:\\s*([^|]+)`));
  return match ? match[1].trim() : null;
}

function buildReceiptHash(pollId: string, propertyCode: string, optionId: string): string {
  const nonce = randomBytes(16).toString('hex');
  return createHash('sha256').update(`${pollId}|${propertyCode}|${optionId}|${Date.now()}|${nonce}`).digest('hex');
}

// ================= READ =================

async function fetchPollsWithResultsNeon(): Promise<VotingPollRow[]> {
  const [pollRows, optionRows, countRows] = await Promise.all([
    neonSql`SELECT * FROM voting_polls ORDER BY created_at DESC`,
    neonSql`SELECT * FROM voting_options ORDER BY poll_id ASC, sort_order ASC`,
    neonSql`SELECT poll_id, option_id, COUNT(*)::int as count FROM voting_votes GROUP BY poll_id, option_id`,
  ]);

  const countMap = new Map<string, number>();
  const pollTotals = new Map<string, number>();
  for (const c of countRows) {
    countMap.set(`${c.poll_id}::${c.option_id}`, Number(c.count));
    pollTotals.set(c.poll_id, (pollTotals.get(c.poll_id) || 0) + Number(c.count));
  }

  return pollRows.map((p: any) => {
    const options = optionRows
      .filter((o: any) => o.poll_id === p.id)
      .map((o: any) => {
        const votes = countMap.get(`${p.id}::${o.id}`) || 0;
        const total = pollTotals.get(p.id) || 0;
        return {
          id: o.id,
          pollId: o.poll_id,
          number: o.option_number,
          label: o.label,
          subtitle: o.subtitle,
          vision: o.vision,
          photoUrl: o.photo_url,
          color: o.color || 'bg-slate-400',
          sortOrder: o.sort_order,
          votes,
          percentage: total > 0 ? Number(((votes / total) * 100).toFixed(1)) : 0,
        };
      });
    return {
      id: p.id,
      title: p.title,
      description: p.description,
      category: p.category,
      budgetEstimate: Number(p.budget_estimate) || 0,
      status: p.status as 'ACTIVE' | 'CLOSED',
      endsAt: p.ends_at,
      createdAt: p.created_at instanceof Date ? p.created_at.toISOString() : String(p.created_at),
      totalVotes: pollTotals.get(p.id) || 0,
      options,
    };
  });
}

async function fetchPollsWithResultsSqlite(): Promise<VotingPollRow[]> {
  const pollRows = await db.select().from(schema.votingPolls).orderBy(desc(schema.votingPolls.createdAt));
  const optionRows = await db.select().from(schema.votingOptions).orderBy(asc(schema.votingOptions.sortOrder));
  const voteRows = await db.select().from(schema.votingVotes);

  const countMap = new Map<string, number>();
  const pollTotals = new Map<string, number>();
  for (const v of voteRows) {
    countMap.set(`${v.pollId}::${v.optionId}`, (countMap.get(`${v.pollId}::${v.optionId}`) || 0) + 1);
    pollTotals.set(v.pollId, (pollTotals.get(v.pollId) || 0) + 1);
  }

  return pollRows.map((p) => {
    const options = optionRows
      .filter((o) => o.pollId === p.id)
      .map((o) => {
        const votes = countMap.get(`${p.id}::${o.id}`) || 0;
        const total = pollTotals.get(p.id) || 0;
        return {
          id: o.id,
          pollId: o.pollId,
          number: o.optionNumber,
          label: o.label,
          subtitle: o.subtitle,
          vision: o.vision,
          photoUrl: o.photoUrl,
          color: o.color || 'bg-slate-400',
          sortOrder: o.sortOrder,
          votes,
          percentage: total > 0 ? Number(((votes / total) * 100).toFixed(1)) : 0,
        };
      });
    return {
      id: p.id,
      title: p.title,
      description: p.description,
      category: p.category,
      budgetEstimate: Number(p.budgetEstimate) || 0,
      status: p.status as 'ACTIVE' | 'CLOSED',
      endsAt: p.endsAt,
      createdAt: p.createdAt || '',
      totalVotes: pollTotals.get(p.id) || 0,
      options,
    };
  });
}

export async function getPollsWithResults(): Promise<VotingPollRow[]> {
  await ensureVotingSchema();
  if (process.env.DATABASE_URL) {
    try {
      return await fetchPollsWithResultsNeon();
    } catch (e) {
      console.warn('Neon voting polls error:', e);
    }
  }
  try {
    return await fetchPollsWithResultsSqlite();
  } catch (e) {
    console.warn('SQLite voting polls error:', e);
    return [];
  }
}

async function fetchVoterRollNeon(electionPollId: string | null): Promise<VoterRollRow[]> {
  const [propRows, voteRows] = await Promise.all([
    neonSql`
      SELECT p.code, p.notes,
        b.name as block_name, b.code as block_code,
        (SELECT per.name || '|' || COALESCE(per.phone, '')
         FROM property_ownerships po
         JOIN persons per ON po.person_id = per.id
         WHERE po.property_id = p.id AND po.is_active = true
         ORDER BY (per.phone ~ '^08[0-9]+$') DESC, po.created_at ASC
         LIMIT 1) as owner_info
      FROM properties p
      LEFT JOIN blocks b ON p.block_id = b.id
      WHERE p.is_active = true
      ORDER BY p.code ASC
    `,
    electionPollId
      ? neonSql`SELECT property_code, option_id, voter_name, receipt_hash, voted_at FROM voting_votes WHERE poll_id = ${electionPollId}`
      : Promise.resolve([] as any[]),
  ]);

  const voteMap = new Map<string, any>();
  for (const v of voteRows) voteMap.set(v.property_code, v);

  return propRows.map((p: any) => {
    const ownerFromNotes = extractFromNotes(p.notes, 'Pemilik');
    const infoParts = String(p.owner_info || '').split('|');
    const ownerName = infoParts[0] || ownerFromNotes || 'Warga';
    const ownerPhoneRaw = infoParts[1] && infoParts[1] !== 'null' ? infoParts[1] : '';
    const ownerPhone = /^08[0-9]+$/.test(ownerPhoneRaw) ? ownerPhoneRaw : '-';
    const vote = voteMap.get(p.code);
    let votedAt: string | null = null;
    if (vote?.voted_at) {
      try {
        const d = new Date(vote.voted_at);
        votedAt = `${d.toISOString().slice(0, 10)}, ${d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`;
      } catch {
        votedAt = String(vote.voted_at);
      }
    }
    return {
      propertyCode: p.code,
      block: p.block_name || (p.block_code ? `Blok ${p.block_code}` : 'Komplek'),
      residentName: ownerName,
      phone: ownerPhone,
      hasVotedElection: Boolean(vote),
      votedAt,
      voteReceiptHash: vote?.receipt_hash ? `SHA256-${String(vote.receipt_hash).slice(0, 12).toUpperCase()}` : null,
      choiceOptionId: vote?.option_id || null,
    };
  });
}

async function fetchVoterRollSqlite(electionPollId: string | null): Promise<VoterRollRow[]> {
  const props = await db.select().from(schema.properties).where(eq(schema.properties.isActive, true));
  const votes = electionPollId
    ? await db.select().from(schema.votingVotes).where(eq(schema.votingVotes.pollId, electionPollId))
    : [];
  const voteMap = new Map(votes.map((v) => [v.propertyCode, v]));

  return props.map((p) => {
    const ownerFromNotes = extractFromNotes(p.notes as any, 'Pemilik');
    const vote = voteMap.get(p.code);
    return {
      propertyCode: p.code,
      block: 'Komplek',
      residentName: ownerFromNotes || 'Warga',
      phone: '-',
      hasVotedElection: Boolean(vote),
      votedAt: vote?.votedAt || null,
      voteReceiptHash: vote?.receiptHash ? `SHA256-${vote.receiptHash.slice(0, 12).toUpperCase()}` : null,
      choiceOptionId: vote?.optionId || null,
    };
  });
}

export async function getVoterRoll(electionPollId: string | null): Promise<VoterRollRow[]> {
  await ensureVotingSchema();
  if (process.env.DATABASE_URL) {
    try {
      return await fetchVoterRollNeon(electionPollId);
    } catch (e) {
      console.warn('Neon voter roll error:', e);
    }
  }
  try {
    return await fetchVoterRollSqlite(electionPollId);
  } catch (e) {
    console.warn('SQLite voter roll error:', e);
    return [];
  }
}

export async function getVotedPollIdsByProperty(propertyCode: string): Promise<string[]> {
  await ensureVotingSchema();
  if (process.env.DATABASE_URL) {
    try {
      const rows = await neonSql`SELECT poll_id FROM voting_votes WHERE property_code = ${propertyCode}`;
      return rows.map((r: any) => r.poll_id);
    } catch (e) {
      console.warn('Neon voted poll ids error:', e);
      return [];
    }
  }
  try {
    const rows = await db.select().from(schema.votingVotes).where(eq(schema.votingVotes.propertyCode, propertyCode));
    return rows.map((v) => v.pollId);
  } catch {
    return [];
  }
}

export async function getVotingDashboard(): Promise<VotingDashboardData> {
  const polls = await getPollsWithResults();
  const electionPoll = [...polls]
    .filter((p) => p.category === 'ELECTION')
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0] || null;

  const voters = await getVoterRoll(electionPoll?.id || null);
  const totalEligible = voters.length;

  return {
    election: electionPoll
      ? {
          id: electionPoll.id,
          title: electionPoll.title,
          description: electionPoll.description,
          status: electionPoll.status,
          endsAt: electionPoll.endsAt,
          totalEligible,
          totalVoted: electionPoll.totalVotes,
          turnout: totalEligible > 0 ? Number(((electionPoll.totalVotes / totalEligible) * 100).toFixed(1)) : 0,
          candidates: electionPoll.options,
        }
      : null,
    polls: polls.filter((p) => p.category !== 'ELECTION'),
    voters,
  };
}

// ================= WRITE =================

export async function createPoll(data: {
  title: string;
  category: PollCategory;
  budgetEstimate: number;
  description: string;
  endsAt?: string;
  createdBy?: string;
}): Promise<VotingPollRow> {
  await ensureVotingSchema();
  const pollId = `poll-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

  if (process.env.DATABASE_URL) {
    await neonSql`
      INSERT INTO voting_polls (id, community_id, title, description, category, budget_estimate, status, ends_at, created_by)
      VALUES (${pollId}, 'comm-01', ${data.title}, ${data.description}, ${data.category}, ${data.budgetEstimate}, 'ACTIVE', ${data.endsAt || null}, ${data.createdBy || 'user-admin'})
    `;
    for (const [i, opt] of DEFAULT_POLL_OPTIONS.entries()) {
      await neonSql`
        INSERT INTO voting_options (id, poll_id, option_number, label, color, sort_order)
        VALUES (${'poll-' + pollId + '-opt' + (i + 1)}, ${pollId}, ${opt.number}, ${opt.label}, ${opt.color}, ${i + 1})
      `;
    }
  } else {
    await db.insert(schema.votingPolls).values({
      id: pollId,
      communityId: 'comm-01',
      title: data.title,
      description: data.description,
      category: data.category,
      budgetEstimate: data.budgetEstimate,
      status: 'ACTIVE',
      endsAt: data.endsAt || null,
      createdBy: data.createdBy || 'user-admin',
    });
    for (const [i, opt] of DEFAULT_POLL_OPTIONS.entries()) {
      await db.insert(schema.votingOptions).values({
        id: `poll-${pollId}-opt${i + 1}`,
        pollId,
        optionNumber: opt.number,
        label: opt.label,
        color: opt.color,
        sortOrder: i + 1,
      });
    }
  }

  await recordAuditLog({
    actorName: 'Panitia Musyawarah / Pengurus',
    action: 'voting.create_poll',
    entityType: 'COMMUNITY_POLL',
    entityId: pollId,
    newValue: { title: data.title, category: data.category, budget: data.budgetEstimate },
  }).catch(() => {});

  const created = await getPollsWithResults();
  const found = created.find((p) => p.id === pollId);
  if (!found) throw new Error('Polling gagal dimuat setelah dibuat.');
  return found;
}

export async function updatePoll(
  id: string,
  data: { status?: 'ACTIVE' | 'CLOSED'; title?: string; description?: string; budgetEstimate?: number; endsAt?: string }
): Promise<void> {
  await ensureVotingSchema();

  if (process.env.DATABASE_URL) {
    const sets: string[] = ['updated_at = NOW()'];
    const vals: any[] = [];
    if (data.status) { sets.push(`status = $${vals.length + 1}`); vals.push(data.status); }
    if (data.title !== undefined) { sets.push(`title = $${vals.length + 1}`); vals.push(data.title); }
    if (data.description !== undefined) { sets.push(`description = $${vals.length + 1}`); vals.push(data.description); }
    if (data.budgetEstimate !== undefined) { sets.push(`budget_estimate = $${vals.length + 1}`); vals.push(data.budgetEstimate); }
    if (data.endsAt !== undefined) { sets.push(`ends_at = $${vals.length + 1}`); vals.push(data.endsAt); }
    vals.push(id);
    await neonSql.unsafe(`UPDATE voting_polls SET ${sets.join(', ')} WHERE id = $${vals.length}`, vals);
  } else {
    const payload: any = { updatedAt: new Date().toISOString() };
    if (data.status) payload.status = data.status;
    if (data.title !== undefined) payload.title = data.title;
    if (data.description !== undefined) payload.description = data.description;
    if (data.budgetEstimate !== undefined) payload.budgetEstimate = data.budgetEstimate;
    if (data.endsAt !== undefined) payload.endsAt = data.endsAt;
    await db.update(schema.votingPolls).set(payload).where(eq(schema.votingPolls.id, id));
  }

  await recordAuditLog({
    actorName: 'Panitia Musyawarah / Pengurus',
    action: 'voting.update_poll',
    entityType: 'COMMUNITY_POLL',
    entityId: id,
    newValue: { ...data, updatedAt: new Date().toISOString() },
  }).catch(() => {});
}

export async function deletePolls(ids: string[]): Promise<number> {
  await ensureVotingSchema();
  if (ids.length === 0) return 0;

  let deleted = 0;
  if (process.env.DATABASE_URL) {
    const rows = await neonSql`DELETE FROM voting_polls WHERE id = ANY(${ids}) RETURNING id`;
    deleted = rows.length;
  } else {
    const rows = await db.delete(schema.votingPolls).where(inArray(schema.votingPolls.id, ids)).returning({ id: schema.votingPolls.id });
    deleted = rows.length;
  }

  await recordAuditLog({
    actorName: 'Panitia Musyawarah / Pengurus',
    action: 'voting.delete_poll',
    entityType: 'COMMUNITY_POLL',
    entityId: ids[0],
    newValue: { pollIds: ids, deletedCount: deleted, deletedAt: new Date().toISOString() },
  }).catch(() => {});

  return deleted;
}

export class VoteAlreadyCastError extends Error {
  constructor(public propertyCode: string) {
    super(`Rumah ${propertyCode} sudah menggunakan hak suaranya pada pemilihan ini.`);
    this.name = 'VoteAlreadyCastError';
  }
}

export async function castVote(data: {
  pollId: string;
  optionId: string;
  propertyCode: string;
  voterName?: string;
}): Promise<{ voteId: string; receiptHash: string; receiptCode: string; tally: { optionId: string; votes: number; percentage: number }[]; totalVoted: number }> {
  await ensureVotingSchema();

  const polls = await getPollsWithResults();
  const poll = polls.find((p) => p.id === data.pollId);
  if (!poll) throw new Error('Pemilihan / polling tidak ditemukan.');
  if (poll.status !== 'ACTIVE') throw new Error('Pemilihan / polling ini sudah ditutup.');
  const option = poll.options.find((o) => o.id === data.optionId);
  if (!option) throw new Error('Pilihan tidak valid untuk pemilihan ini.');

  // Pemilih harus rumah aktif terdaftar (DPT) — suara dari unit tak dikenal ditolak.
  if (process.env.DATABASE_URL) {
    const prop = await neonSql`SELECT id FROM properties WHERE code = ${data.propertyCode} AND is_active = true LIMIT 1`;
    if (prop.length === 0) throw new Error(`Rumah ${data.propertyCode} tidak terdaftar dalam DPT.`);
  }

  const voteId = `VOTE-${Date.now()}-${data.propertyCode.replace(/[^A-Za-z0-9]/g, '')}`;
  const fullHash = buildReceiptHash(data.pollId, data.propertyCode, data.optionId);

  if (process.env.DATABASE_URL) {
    const inserted = await neonSql`
      INSERT INTO voting_votes (id, poll_id, option_id, property_code, voter_name, receipt_hash)
      VALUES (${voteId}, ${data.pollId}, ${data.optionId}, ${data.propertyCode}, ${data.voterName || null}, ${fullHash})
      ON CONFLICT (poll_id, property_code) DO NOTHING
      RETURNING id
    `;
    if (inserted.length === 0) {
      throw new VoteAlreadyCastError(data.propertyCode);
    }
  } else {
    const existing = await db
      .select()
      .from(schema.votingVotes)
      .where(eq(schema.votingVotes.propertyCode, data.propertyCode));
    if (existing.some((v) => v.pollId === data.pollId)) {
      throw new VoteAlreadyCastError(data.propertyCode);
    }
    await db.insert(schema.votingVotes).values({
      id: voteId,
      pollId: data.pollId,
      optionId: data.optionId,
      propertyCode: data.propertyCode,
      voterName: data.voterName || null,
      receiptHash: fullHash,
      votedAt: new Date().toISOString(),
    });
  }

  await recordAuditLog({
    actorName: data.voterName || 'Warga',
    action: 'voting.cast_vote',
    entityType: poll.category === 'ELECTION' ? 'RW_ELECTION_VOTE' : 'COMMUNITY_POLL_VOTE',
    entityId: voteId,
    newValue: { targetId: data.pollId, choiceId: data.optionId, house: data.propertyCode },
  }).catch(() => {});

  const fresh = (await getPollsWithResults()).find((p) => p.id === data.pollId)!;
  const totalVoted = fresh.totalVotes;

  return {
    voteId,
    receiptHash: fullHash,
    receiptCode: `SHA256-${fullHash.slice(0, 12).toUpperCase()}`,
    tally: fresh.options.map((o) => ({ optionId: o.id, votes: o.votes, percentage: o.percentage })),
    totalVoted,
  };
}
