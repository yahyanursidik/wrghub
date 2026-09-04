import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordAuditLog } from '../../../../services/audit.service';

const createTaskSchema = z.object({
  taskName: z.string().min(2),
  category: z.enum(['SAMPAH_WARGA', 'SAPU_JALAN', 'GOT_DRAINASE', 'FASUM_TAMAN', 'TPS_PENGOLAHAN']).default('SAMPAH_WARGA'),
  location: z.string().min(2),
  assignedTo: z.string().min(2),
  notes: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = createTaskSchema.parse(body);

    const newTask = {
      id: `TSK-${Date.now().toString().slice(-4)}`,
      taskName: validated.taskName,
      category: validated.category,
      location: validated.location,
      assignedTo: validated.assignedTo,
      isCompleted: false,
      notes: validated.notes || null,
      createdAt: new Date().toISOString(),
    };

    if (process.env.DATABASE_URL) {
      await recordAuditLog({
        actorName: 'Pengurus Komplek',
        action: 'cleaning.create_task',
        entityType: 'CLEANING_TASK',
        entityId: newTask.id,
        newValue: {
          taskName: validated.taskName,
          category: validated.category,
          location: validated.location,
          assignedTo: validated.assignedTo,
        },
      });
    }

    return new Response(
      JSON.stringify({
        data: newTask,
        meta: {},
        error: null,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        data: null,
        error: { code: 'TASK_CREATION_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
