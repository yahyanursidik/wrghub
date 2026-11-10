import { randomUUID } from 'node:crypto';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { neonSql } from '../db/neon';
import { db, schema } from '../db';
import { hasWorkspace } from '../lib/dashboard-workspace';
import { isResidentRole } from '../lib/access-policy';
import type { UserSession } from '../types/auth';
import type { PropertyListItem } from './property.service';
import { recordAuditLog } from './audit.service';

export interface AnnouncementItem {
  id: string; title: string; content: string; category: string; audience: string;
  scheduledAt: string | null; location: string | null;
  isPinned: boolean | null; isPublished: boolean | null; createdAt: string | null;
}

type Fields = Pick<AnnouncementItem, 'title' | 'content' | 'category' | 'audience' | 'scheduledAt' | 'location'> & { isPinned: boolean };
const a = schema.announcements;

export async function getAnnouncements(): Promise<AnnouncementItem[]> {
  if (process.env.DATABASE_URL) {
    const rows = await neonSql<AnnouncementItem[]>`SELECT id, title, content, category, audience, scheduled_at AS "scheduledAt",
      location, is_pinned AS "isPinned", is_published AS "isPublished", created_at AS "createdAt"
      FROM announcements WHERE is_published = true ORDER BY is_pinned DESC, created_at DESC`;
    return rows.map(row => ({ ...row, scheduledAt: row.scheduledAt ? new Date(row.scheduledAt).toISOString() : null,
      createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : null }));
  }
  return db.select({ id: a.id, title: a.title, content: a.content, category: a.category, audience: a.audience,
    scheduledAt: a.scheduledAt, location: a.location, isPinned: a.isPinned, isPublished: a.isPublished, createdAt: a.createdAt })
    .from(a).where(eq(a.isPublished, true)).orderBy(desc(a.isPinned), desc(a.createdAt));
}

export function filterAnnouncementsForUser(items: AnnouncementItem[], user: UserSession, property: PropertyListItem | null) {
  const block = property?.blockCode?.toUpperCase();
  return items.filter(item => {
    if (!item.isPublished) return false;
    switch (item.audience) {
      case 'ALL': return true;
      case 'COMMITTEE': return hasWorkspace(user.role);
      case 'RESIDENT': return isResidentRole(user.role) && Boolean(property);
      case 'BLOK_A_B': return block === 'A' || block === 'B';
      case 'BLOK_C_D': return block === 'C' || block === 'D';
      case 'KAVLING': return Boolean(property && /^KAV/i.test(property.code));
      case 'OWNER':
      case 'PEMILIK_SAJA': return Boolean(property && (user.role === 'HOUSE_OWNER' || (user.role === 'HOUSEHOLD_HEAD' && property.occupancyStatus === 'OWNER_OCCUPIED')));
      case 'PENYEWA_SAJA': return Boolean(property && isResidentRole(user.role) && user.role !== 'HOUSE_OWNER' && property.occupancyStatus === 'RENTED');
      default: return false;
    }
  });
}

export async function createAnnouncement(data: Fields, actor: UserSession) {
  const id = `ann-${randomUUID()}`;
  if (process.env.DATABASE_URL) {
    await neonSql`INSERT INTO announcements (id, community_id, title, content, category, audience, scheduled_at, location, is_pinned, is_published, created_by)
      VALUES (${id}, 'comm-01', ${data.title}, ${data.content}, ${data.category}, ${data.audience}, ${data.scheduledAt}, ${data.location}, ${data.isPinned}, true, ${actor.id})`;
  } else await db.insert(a).values({ id, communityId: 'comm-01', ...data, isPublished: true, createdBy: actor.id });
  await recordAuditLog({ actorUserId: actor.id, actorName: actor.fullName, action: 'announcement.create', entityType: 'ANNOUNCEMENT',
    entityId: id, newValue: { title: data.title, audience: data.audience } });
  return id;
}

export async function updateAnnouncement(id: string, fields: Partial<Fields>, actor: UserSession) {
  const now = new Date().toISOString();
  const rows = process.env.DATABASE_URL
    ? await neonSql`UPDATE announcements SET title = coalesce(${fields.title ?? null}, title), content = coalesce(${fields.content ?? null}, content),
        category = coalesce(${fields.category ?? null}, category), audience = coalesce(${fields.audience ?? null}, audience),
        scheduled_at = CASE WHEN ${fields.scheduledAt !== undefined} THEN ${fields.scheduledAt ?? null} ELSE scheduled_at END,
        location = CASE WHEN ${fields.location !== undefined} THEN ${fields.location ?? null} ELSE location END,
        is_pinned = coalesce(${fields.isPinned ?? null}, is_pinned), updated_at = ${now}
        WHERE id = ${id} AND is_published = true RETURNING id`
    : await db.update(a).set({ ...fields, updatedAt: now }).where(and(eq(a.id, id), eq(a.isPublished, true))).returning({ id: a.id });
  if (!rows.length) return false;
  await recordAuditLog({ actorUserId: actor.id, actorName: actor.fullName, action: 'announcement.update', entityType: 'ANNOUNCEMENT',
    entityId: id, newValue: fields });
  return true;
}

export async function archiveAnnouncements(ids: string[], actor: UserSession) {
  const now = new Date().toISOString();
  const rows = process.env.DATABASE_URL
    ? await neonSql`UPDATE announcements SET is_published = false, updated_at = ${now} WHERE is_published = true AND id IN ${neonSql(ids)} RETURNING id`
    : await db.update(a).set({ isPublished: false, updatedAt: now }).where(and(eq(a.isPublished, true), inArray(a.id, ids))).returning({ id: a.id });
  const archivedIds = rows.map(row => String(row.id));
  if (archivedIds.length) await recordAuditLog({ actorUserId: actor.id, actorName: actor.fullName, action: 'announcement.archive',
    entityType: 'ANNOUNCEMENT', entityId: archivedIds[0], newValue: { ids: archivedIds } });
  return archivedIds;
}
