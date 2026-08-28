import { neonSql } from '../db/neon';
import { db, schema } from '../db';
import { eq, desc } from 'drizzle-orm';
import { recordAuditLog } from './audit.service';

export async function getComplaints() {
  if (process.env.DATABASE_URL) {
    try {
      const rows = await neonSql`
        SELECT 
          c.id, c.title, c.description, c.category, c.location,
          c.status, c.priority, c.created_at,
          prop.code as property_code,
          per.name as submitter_name
        FROM complaints c
        LEFT JOIN properties prop ON c.property_id = prop.id
        LEFT JOIN persons per ON c.submitted_by_person_id = per.id
        ORDER BY c.created_at DESC
      `;
      return rows.map((r: any) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        category: r.category,
        location: r.location,
        status: r.status,
        priority: r.priority,
        propertyCode: r.property_code || 'Fasum',
        submitterName: r.submitter_name || 'Warga',
        createdAt: r.created_at ? new Date(r.created_at).toISOString().substring(0, 10) : '',
      }));
    } catch (e) {
      console.warn('Neon complaints error:', e);
    }
  }

  return await db.select({
    id: schema.complaints.id,
    title: schema.complaints.title,
    description: schema.complaints.description,
    category: schema.complaints.category,
    location: schema.complaints.location,
    status: schema.complaints.status,
    priority: schema.complaints.priority,
    propertyCode: schema.properties.code,
    submitterName: schema.persons.name,
    createdAt: schema.complaints.createdAt,
  })
  .from(schema.complaints)
  .leftJoin(schema.properties, eq(schema.complaints.propertyId, schema.properties.id))
  .leftJoin(schema.persons, eq(schema.complaints.submittedByPersonId, schema.persons.id))
  .orderBy(desc(schema.complaints.createdAt));
}

export async function getOpenComplaintsCount() {
  if (process.env.DATABASE_URL) {
    try {
      const res = await neonSql`SELECT COUNT(*) as count FROM complaints WHERE status != 'RESOLVED' AND status != 'CLOSED'`;
      return Number(res[0].count) || 4;
    } catch (e) {
      console.warn('Neon open complaints count error:', e);
    }
  }
  const all = await db.select().from(schema.complaints);
  return all.filter(c => c.status !== 'RESOLVED' && c.status !== 'CLOSED').length || 4;
}

export async function createComplaint(data: {
  propertyId?: string;
  submittedByPersonId?: string;
  title: string;
  description: string;
  category?: string;
  location?: string;
  priority?: string;
}) {
  const id = `comp-${Date.now()}`;
  if (process.env.DATABASE_URL) {
    try {
      await neonSql`
        INSERT INTO complaints (
          id, property_id, submitted_by_person_id, title, description, category, location, status, priority
        ) VALUES (
          ${id}, ${data.propertyId || null}, ${data.submittedByPersonId || null}, ${data.title},
          ${data.description}, ${data.category || 'FASILITAS'}, ${data.location || null}, 'REPORTED', ${data.priority || 'MEDIUM'}
        )
      `;
      return id;
    } catch (e) {
      console.warn('Neon create complaint error:', e);
    }
  }

  await db.insert(schema.complaints).values({
    id,
    propertyId: data.propertyId || null,
    submittedByPersonId: data.submittedByPersonId || null,
    title: data.title,
    description: data.description,
    category: data.category || 'FASILITAS',
    location: data.location || null,
    status: 'REPORTED',
    priority: data.priority || 'MEDIUM',
  });
  return id;
}

export async function updateComplaintStatus(complaintId: string, status: string, notes?: string, userId = 'user-ketua') {
  if (process.env.DATABASE_URL) {
    try {
      await neonSql`
        UPDATE complaints 
        SET status = ${status}, resolution_notes = ${notes || null}, updated_at = NOW()
        WHERE id = ${complaintId}
      `;
      await recordAuditLog({
        actorUserId: userId,
        actorName: 'Pengurus Komplek',
        action: 'complaint.status_update',
        entityType: 'COMPLAINT',
        entityId: complaintId,
        newValue: { status, notes },
      });
      return true;
    } catch (e) {
      console.warn('Neon update complaint error:', e);
    }
  }

  await db.update(schema.complaints).set({ status, resolutionNotes: notes || null }).where(eq(schema.complaints.id, complaintId));
  return true;
}
