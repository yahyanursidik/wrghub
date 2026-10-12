import { db, schema } from '../db';
import { neonSql } from '../db/neon';
import { desc } from 'drizzle-orm';

export interface DocumentRecord {
  id: string; title: string; category: string; fileUrl: string;
  fileSize: string | null; visibility: string; date: string;
}

export async function getDocuments(): Promise<DocumentRecord[]> {
  if (process.env.DATABASE_URL) {
    const rows = await neonSql`SELECT id, title, category, file_url, file_size, visibility, created_at FROM documents ORDER BY created_at DESC`;
    return rows.map(row => ({ id: row.id, title: row.title, category: row.category, fileUrl: row.file_url, fileSize: row.file_size, visibility: row.visibility, date: new Date(row.created_at).toLocaleDateString('id-ID') }));
  }
  const rows = await db.select().from(schema.documents).orderBy(desc(schema.documents.createdAt));
  return rows.map(row => ({ ...row, date: row.createdAt ? new Date(row.createdAt).toLocaleDateString('id-ID') : '-' }));
}
