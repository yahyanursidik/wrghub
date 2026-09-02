import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordAuditLog } from '../../../../services/audit.service';

const guardSchema = z.object({
  id: z.string().optional(),
  nip: z.string().optional(),
  fullName: z.string().min(2),
  role: z.string().default('Anggota Jaga Pos'),
  team: z.string().default('Regu A - Garuda'),
  phone: z.string().min(6),
  emergencyContact: z.string().optional(),
  certification: z.string().default('GADA_PRATAMA'),
  regNumber: z.string().optional(),
  assignedPost: z.string().default('Pos Gerbang Utama (Main Gate)'),
  shift: z.string().default('SHIFT_PAGI'),
  salary: z.number().default(4200000),
  nightAllowance: z.number().default(350000),
  status: z.enum(['AKTIF_BERTUGAS', 'LEPAS_PIKET', 'CUTI', 'SAKIT', 'NONAKTIF']).default('AKTIF_BERTUGAS'),
  joinDate: z.string().optional(),
  notes: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = guardSchema.parse(body);

    const guardId = validated.id || `SEC-${Math.floor(100 + Math.random() * 900)}`;
    const newGuard = {
      id: guardId,
      nip: validated.nip || `SEC.2026.${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: validated.fullName,
      role: validated.role,
      team: validated.team,
      phone: validated.phone,
      emergencyContact: validated.emergencyContact || '-',
      certification: validated.certification,
      regNumber: validated.regNumber || `POL-REG-${Math.floor(100000 + Math.random() * 900000)}`,
      assignedPost: validated.assignedPost,
      shift: validated.shift,
      salary: validated.salary,
      nightAllowance: validated.nightAllowance,
      status: validated.status,
      joinDate: validated.joinDate || new Date().toISOString().split('T')[0],
      notes: validated.notes || null,
      updatedAt: new Date().toISOString(),
    };

    if (process.env.DATABASE_URL) {
      await recordAuditLog({
        actorName: 'Kepala Keamanan Komplek',
        action: validated.id ? 'security.update_guard' : 'security.create_guard',
        entityType: 'SECURITY_GUARD',
        entityId: newGuard.id,
        newValue: {
          nip: newGuard.nip,
          name: newGuard.fullName,
          role: newGuard.role,
          team: newGuard.team,
          post: newGuard.assignedPost,
          status: newGuard.status,
        },
      });
    }

    return new Response(
      JSON.stringify({
        data: newGuard,
        meta: {},
        error: null,
      }),
      { status: validated.id ? 200 : 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        data: null,
        error: { code: 'GUARD_SAVE_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
