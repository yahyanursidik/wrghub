import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordAuditLog } from '../../../../services/audit.service';

const patrolSchema = z.object({
  id: z.string().optional(),
  checkpointName: z.string(),
  checkpointCode: z.string().default('CP-01'),
  guardName: z.string(),
  guardId: z.string().optional(),
  condition: z.enum(['AMAN_KONDUSIF', 'LAMPU_PJU_MATI', 'PORTAL_TERBUKA', 'MENCURIGAKAN', 'HEWAN_LIAR', 'LAINNYA']).default('AMAN_KONDUSIF'),
  notes: z.string().optional(),
  photoUrl: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = patrolSchema.parse(body);

    const patrolId = validated.id || `PATROL-${Date.now()}`;
    const newPatrol = {
      id: patrolId,
      checkpointName: validated.checkpointName,
      checkpointCode: validated.checkpointCode,
      guardName: validated.guardName,
      guardId: validated.guardId || 'SEC-001',
      condition: validated.condition,
      notes: validated.notes || 'Situasi aman terkendali saat patroli rutin.',
      photoUrl: validated.photoUrl || null,
      recordedAt: new Date().toISOString(),
      displayTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      displayDate: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    };

    if (process.env.DATABASE_URL) {
      await recordAuditLog({
        actorName: validated.guardName || 'Petugas Patroli Satpam',
        action: 'security.record_patrol',
        entityType: 'PATROL_LOG',
        entityId: newPatrol.id,
        newValue: {
          checkpoint: newPatrol.checkpointName,
          condition: newPatrol.condition,
          time: newPatrol.recordedAt,
        },
      });
    }

    return new Response(
      JSON.stringify({
        data: newPatrol,
        meta: {},
        error: null,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        data: null,
        error: { code: 'PATROL_RECORD_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
