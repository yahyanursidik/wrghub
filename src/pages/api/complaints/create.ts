import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordAuditLog } from '../../../services/audit.service';
import { createComplaint } from '../../../services/complaint.service';
import { getProperties } from '../../../services/property.service';
import type { UserSession } from '../../../types/auth';

const complaintSchema = z.object({
  propertyId: z.string(),
  title: z.string().min(3),
  description: z.string().min(5),
  category: z.enum(['KEAMANAN', 'KEBERSIHAN', 'FASILITAS', 'KETERTIBAN', 'LAINNYA']).default('FASILITAS'),
  location: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
});

export const POST: APIRoute = async ({ request, session }) => {
  try {
    const body = await request.json();
    const validated = complaintSchema.parse(body);
    if (!(await getProperties()).some(property => property.id === validated.propertyId)) return Response.json({ error: { message: 'Rumah tidak ditemukan.' } }, { status: 404 });
    const id = await createComplaint(validated);
    const actor = await session?.get('wargahub_user') as UserSession;

    await recordAuditLog({
      actorUserId: actor.id,
      actorName: actor.fullName,
      action: 'complaint.create',
      entityType: 'COMPLAINT',
      entityId: id,
      newValue: { title: validated.title, category: validated.category, location: validated.location },
    });

    return Response.json({ data: { id, message: 'Aduan berhasil dicatat dan tersedia untuk ditindaklanjuti pengurus.' }, meta: {}, error: null }, { status: 201 });
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
