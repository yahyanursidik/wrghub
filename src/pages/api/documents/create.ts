import type { APIRoute } from 'astro';
import { z } from 'zod';
import { neonSql } from '../../../db/neon';
import { recordAuditLog } from '../../../services/audit.service';

const documentSchema = z.object({
  title: z.string().min(3),
  category: z.enum(['TATA_TERTIB', 'LAPORAN_KEUANGAN', 'SURAT_EDARAN', 'SK_PENGURUS', 'FORMULIR']),
  fileUrl: z.string().default('/documents/sample.pdf'),
  fileSize: z.string().default('1.2 MB'),
  visibility: z.enum(['PUBLIC', 'RESIDENT', 'COMMITTEE', 'ADMIN']).default('RESIDENT'),
  uploadedBy: z.string().default('user-ketua'),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = documentSchema.parse(body);
    const id = `doc-${Date.now()}`;

    if (process.env.DATABASE_URL) {
      await neonSql`
        INSERT INTO documents (
          id, community_id, title, category, file_url, file_size, visibility, uploaded_by, created_at
        ) VALUES (
          ${id}, 'comm-01', ${validated.title}, ${validated.category},
          ${validated.fileUrl}, ${validated.fileSize}, ${validated.visibility},
          ${validated.uploadedBy}, NOW()
        );
      `;

      await recordAuditLog({
        actorName: 'Ketua / Pengurus Komplek',
        action: 'document.upload',
        entityType: 'DOCUMENT',
        entityId: id,
        newValue: { title: validated.title, category: validated.category, visibility: validated.visibility },
      });

      return new Response(
        JSON.stringify({
          data: { id, message: `Dokumen "${validated.title}" berhasil dipublikasikan ke sistem.` },
          meta: {},
          error: null,
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ data: { message: 'Dokumen tersimpan.' } }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        data: null,
        error: { code: 'DOCUMENT_UPLOAD_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
