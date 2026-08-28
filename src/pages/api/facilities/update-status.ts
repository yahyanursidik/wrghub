import type { APIRoute } from 'astro';
import { z } from 'zod';
import { neonSql } from '../../../db/neon';
import { recordAuditLog } from '../../../services/audit.service';

const statusSchema = z.object({
  requestId: z.string(),
  status: z.string(),
  approvedBy: z.string().default('user-ketua'),
  notes: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = statusSchema.parse(body);

    if (process.env.DATABASE_URL) {
      await neonSql`
        UPDATE maintenance_requests
        SET status = ${validated.status},
            completed_date = ${validated.status === 'COMPLETED' ? new Date().toISOString().substring(0, 10) : null}
        WHERE id = ${validated.requestId};
      `;

      await recordAuditLog({
        actorName: 'Pengurus / Pengelola Sarana',
        action: 'facility.status_update',
        entityType: 'MAINTENANCE_REQUEST',
        entityId: validated.requestId,
        newValue: { status: validated.status, notes: validated.notes },
      });

      return new Response(
        JSON.stringify({
          data: { success: true, message: `Status permohonan sarana berhasil diubah menjadi ${validated.status}.` },
          meta: {},
          error: null,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ data: { success: true, message: 'Status diupdate.' } }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        data: null,
        error: { code: 'STATUS_UPDATE_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
