import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordAuditLog } from '../../../../services/audit.service';

const createStaffSchema = z.object({
  name: z.string().min(2),
  role: z.enum(['PENGANGKUT_SAMPAH', 'PENYAPU_JALAN', 'PETUGAS_TAMAN', 'PENGELOLA_TPS', 'KOORDINATOR_KEBERSIHAN']).default('PENGANGKUT_SAMPAH'),
  phone: z.string().min(5),
  zoneAssignment: z.string().min(2),
  salary: z.number().positive(),
  employmentStatus: z.enum(['TETAP', 'KONTRAK', 'HARIAN_LEPAS']).default('KONTRAK'),
  joinDate: z.string().default(() => new Date().toISOString().slice(0, 10)),
  notes: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = createStaffSchema.parse(body);

    const newStaff = {
      id: `CLN-${Date.now().toString().slice(-4)}`,
      name: validated.name,
      role: validated.role,
      phone: validated.phone,
      zoneAssignment: validated.zoneAssignment,
      salary: validated.salary,
      employmentStatus: validated.employmentStatus,
      status: 'ACTIVE',
      joinDate: validated.joinDate,
      notes: validated.notes || null,
      createdAt: new Date().toISOString(),
    };

    if (process.env.DATABASE_URL) {
      await recordAuditLog({
        actorName: 'Pengurus Komplek',
        action: 'cleaning.create_staff',
        entityType: 'CLEANING_STAFF',
        entityId: newStaff.id,
        newValue: {
          name: validated.name,
          role: validated.role,
          zone: validated.zoneAssignment,
          salary: validated.salary,
        },
      });
    }

    return new Response(
      JSON.stringify({
        data: newStaff,
        meta: {},
        error: null,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        data: null,
        error: { code: 'STAFF_CREATION_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
