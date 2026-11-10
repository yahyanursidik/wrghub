import { randomUUID } from 'node:crypto';
import { and, desc, eq, notInArray, sql } from 'drizzle-orm';
import { neonSql } from '../db/neon';
import { db, schema } from '../db';
import { complaintTransitions, type ComplaintStatus } from '../lib/complaint-status';
import type { UserSession } from '../types/auth';
import { recordAuditLog } from './audit.service';

export interface ComplaintItem {
  id: string; title: string; description: string; category: string; location: string | null;
  status: string; priority: string; createdAt: string | null; propertyCode: string | null;
  submitterName: string | null; resolutionNotes: string | null;
}

export async function getComplaints(propertyId?: string): Promise<ComplaintItem[]> {
  if (process.env.DATABASE_URL) {
    const id = propertyId ?? null;
    const rows = await neonSql`
      SELECT c.id, c.title, c.description, c.category, c.location, c.status, c.priority,
             c.resolution_notes AS "resolutionNotes", c.created_at AS "createdAt",
             p.code AS "propertyCode", person.name AS "submitterName"
      FROM complaints c
      LEFT JOIN properties p ON p.id = c.property_id
      LEFT JOIN persons person ON person.id = c.submitted_by_person_id
      WHERE (${id}::text IS NULL OR c.property_id = ${id})
      ORDER BY c.created_at DESC
    `;
    return rows.map(row => ({ ...row, createdAt: row.createdAt ? new Date(row.createdAt).toISOString().slice(0, 10) : null } as ComplaintItem));
  }
  return db.select({
    id: schema.complaints.id, title: schema.complaints.title, description: schema.complaints.description,
    category: schema.complaints.category, location: schema.complaints.location,
    status: schema.complaints.status, priority: schema.complaints.priority,
    propertyCode: schema.properties.code, submitterName: schema.persons.name, createdAt: schema.complaints.createdAt,
    resolutionNotes: schema.complaints.resolutionNotes,
  }).from(schema.complaints)
    .leftJoin(schema.properties, eq(schema.complaints.propertyId, schema.properties.id))
    .leftJoin(schema.persons, eq(schema.complaints.submittedByPersonId, schema.persons.id))
    .where(propertyId === undefined ? undefined : eq(schema.complaints.propertyId, propertyId))
    .orderBy(desc(schema.complaints.createdAt));
}

export async function getOpenComplaintsCount() {
  if (process.env.DATABASE_URL) {
    const [row] = await neonSql`SELECT COUNT(*) AS count FROM complaints WHERE status NOT IN ('RESOLVED', 'CLOSED')`;
    return Number(row?.count ?? 0);
  }
  const [row] = await db.select({ count: sql<number>`count(*)` }).from(schema.complaints)
    .where(notInArray(schema.complaints.status, ['RESOLVED', 'CLOSED']));
  return Number(row?.count ?? 0);
}

export async function createComplaint(data: {
  propertyId?: string; submittedByPersonId?: string; title: string; description: string;
  category?: string; location?: string; priority?: string;
}) {
  const id = `comp-${randomUUID()}`;
  if (process.env.DATABASE_URL) {
    await neonSql`
      INSERT INTO complaints (id, property_id, submitted_by_person_id, title, description, category, location, status, priority)
      VALUES (${id}, ${data.propertyId || null}, ${data.submittedByPersonId || null}, ${data.title},
        ${data.description}, ${data.category || 'FASILITAS'}, ${data.location || null}, 'REPORTED', ${data.priority || 'MEDIUM'})
    `;
  } else {
    await db.insert(schema.complaints).values({ id, ...data, status: 'REPORTED' });
  }
  return id;
}

export async function updateComplaintStatus(id: string, status: ComplaintStatus, notes: string | undefined, actor: UserSession) {
  const remote = Boolean(process.env.DATABASE_URL);
  const [existing] = remote
    ? await neonSql`SELECT status, resolution_notes AS "resolutionNotes", resolved_at AS "resolvedAt" FROM complaints WHERE id = ${id}`
    : await db.select({ status: schema.complaints.status, resolutionNotes: schema.complaints.resolutionNotes, resolvedAt: schema.complaints.resolvedAt })
        .from(schema.complaints).where(eq(schema.complaints.id, id));
  if (!existing) return { outcome: 'missing' as const };
  if (!complaintTransitions[existing.status as ComplaintStatus]?.includes(status)) return { outcome: 'conflict' as const };
  const now = new Date().toISOString();
  const resolvedAt = status === 'RESOLVED' ? now : (existing.resolvedAt ?? null);
  const resolutionNotes = notes?.trim() || existing.resolutionNotes || null;
  const updated = remote
    ? await neonSql`UPDATE complaints SET status = ${status}, resolution_notes = ${resolutionNotes}, resolved_at = ${resolvedAt}, updated_at = ${now}
        WHERE id = ${id} AND status = ${existing.status} RETURNING id`
    : await db.update(schema.complaints).set({ status, resolutionNotes, resolvedAt, updatedAt: now })
        .where(and(eq(schema.complaints.id, id), eq(schema.complaints.status, existing.status))).returning({ id: schema.complaints.id });
  if (!updated.length) return { outcome: 'conflict' as const };
  await recordAuditLog({ actorUserId: actor.id, actorName: actor.fullName, action: 'complaint.status_update',
    entityType: 'COMPLAINT', entityId: id, oldValue: { status: existing.status }, newValue: { status, resolutionNotes } });
  return { outcome: 'saved' as const, data: { id, status, resolutionNotes } };
}
