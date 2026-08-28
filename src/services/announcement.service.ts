import { neonSql } from '../db/neon';
import { db, schema } from '../db';
import { desc } from 'drizzle-orm';
import { recordAuditLog } from './audit.service';

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  category: string;
  audience: string;
  scheduledAt: string | null;
  location: string | null;
  isPinned: boolean | null;
  isPublished: boolean | null;
  createdAt: string | null;
}

export async function getAnnouncements(): Promise<AnnouncementItem[]> {
  if (process.env.DATABASE_URL) {
    try {
      const rows = await neonSql`
        SELECT 
          id, title, content, category, audience,
          scheduled_at as "scheduledAt", location,
          is_pinned as "isPinned", is_published as "isPublished",
          created_at as "createdAt"
        FROM announcements
        WHERE is_published = true
        ORDER BY is_pinned DESC, created_at DESC
      `;
      return rows.map((r: any) => ({
        ...r,
        createdAt: r.createdAt ? new Date(r.createdAt).toISOString().substring(0, 10) : '',
      }));
    } catch (e) {
      console.warn('Neon announcements error:', e);
    }
  }

  const result = await db.select().from(schema.announcements).orderBy(desc(schema.announcements.isPinned), desc(schema.announcements.createdAt));
  return result.map(r => ({
    ...r,
    createdAt: r.createdAt ? new Date(r.createdAt).toISOString().substring(0, 10) : '',
  }));
}

export async function createAnnouncement(data: {
  title: string;
  content: string;
  category?: string;
  audience?: string;
  scheduledAt?: string;
  location?: string;
  isPinned?: boolean;
  createdBy?: string;
}) {
  const id = `ann-${Date.now()}`;
  if (process.env.DATABASE_URL) {
    try {
      await neonSql`
        INSERT INTO announcements (
          id, community_id, title, content, category, audience, scheduled_at, location, is_pinned, is_published, created_by
        ) VALUES (
          ${id}, 'comm-01', ${data.title}, ${data.content}, ${data.category || 'INFO'},
          ${data.audience || 'ALL'}, ${data.scheduledAt || null}, ${data.location || null},
          ${data.isPinned || false}, true, ${data.createdBy || 'user-ketua'}
        )
      `;

      await recordAuditLog({
        actorUserId: data.createdBy || 'user-ketua',
        actorName: 'Ketua Komplek',
        action: 'announcement.create',
        entityType: 'ANNOUNCEMENT',
        entityId: id,
        newValue: { title: data.title },
      });

      return id;
    } catch (e) {
      console.warn('Neon create announcement error:', e);
    }
  }

  await db.insert(schema.announcements).values({
    id,
    communityId: 'comm-01',
    title: data.title,
    content: data.content,
    category: data.category || 'INFO',
    audience: data.audience || 'ALL',
    scheduledAt: data.scheduledAt || null,
    location: data.location || null,
    isPinned: data.isPinned || false,
    isPublished: true,
    createdBy: data.createdBy || 'user-ketua',
  });

  return id;
}
