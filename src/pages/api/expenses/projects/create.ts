import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordAuditLog } from '../../../../services/audit.service';

const maintenanceProjectSchema = z.object({
  projectName: z.string().min(3),
  projectType: z.enum(['PENGECATAN_KOMPLEK', 'PERBAIKAN_PERALATAN', 'LAMPU_PJU', 'BARRIER_GATE_RFID', 'CCTV_KEAMANAN', 'TAMAN_RESAPAN']).default('PENGECATAN_KOMPLEK'),
  budgetAmount: z.number().positive(),
  actualSpent: z.number().default(0),
  vendorOrContractor: z.string().min(2),
  startDate: z.string().default(() => new Date().toISOString().slice(0, 10)),
  targetCompletionDate: z.string().optional(),
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED']).default('IN_PROGRESS'),
  description: z.string().min(3),
  location: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = maintenanceProjectSchema.parse(body);

    const newProject = {
      id: `PRJ-${Date.now()}`,
      projectName: validated.projectName,
      projectType: validated.projectType,
      budgetAmount: validated.budgetAmount,
      actualSpent: validated.actualSpent || validated.budgetAmount,
      vendorOrContractor: validated.vendorOrContractor,
      startDate: validated.startDate,
      targetCompletionDate: validated.targetCompletionDate || '30 September 2026',
      status: validated.status,
      description: validated.description,
      location: validated.location || 'Seluruh Area Komplek',
      createdAt: new Date().toISOString(),
    };

    if (process.env.DATABASE_URL) {
      await recordAuditLog({
        actorName: 'Pengurus Komplek',
        action: 'projects.create_maintenance',
        entityType: 'MAINTENANCE_PROJECT',
        entityId: newProject.id,
        newValue: {
          name: validated.projectName,
          type: validated.projectType,
          budget: validated.budgetAmount,
          vendor: validated.vendorOrContractor,
        },
      });
    }

    return new Response(
      JSON.stringify({
        data: newProject,
        meta: {},
        error: null,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        data: null,
        error: { code: 'PROJECT_CREATION_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
