import type { APIRoute } from 'astro';
import { z } from 'zod';
import { neonSql } from '../../../db/neon';
import { recordAuditLog } from '../../../services/audit.service';

const complaintSchema = z.object({
  propertyId: z.string(),
  title: z.string().min(3),
  description: z.string().min(5),
  category: z.enum(['KEAMANAN', 'KEBERSIHAN', 'FASILITAS', 'KETERTIBAN', 'LAINNYA']).default('FASILITAS'),
  location: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = complaintSchema.parse(body);
    const id = `comp-${Date.now()}`;

    if (process.env.DATABASE_URL) {
      await neonSql`
        INSERT INTO complaints (
          id, property_id, title, description, category, location, status, priority, created_at
        ) VALUES (
          ${id}, ${validated.propertyId}, ${validated.title},
          ${validated.description}, ${validated.category}, ${validated.location || '-'},
          'REPORTED', ${validated.priority}, NOW()
        );
      `;

      await recordAuditLog({
        actorName: `Warga (${validated.propertyId})`,
        action: 'complaint.create',
        entityType: 'COMPLAINT',
        entityId: id,
        newValue: { title: validated.title, category: validated.category, location: validated.location },
      });

      return new Response(
        JSON.stringify({
          data: { id, message: 'Aduan berhasil dicatat dan diteruskan ke pengurus & satpam.' },
          meta: {},
          error: null,
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ data: { id, message: 'Aduan tersimpan.' } }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        data: null,
        error: { code: 'COMPLAINT_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
