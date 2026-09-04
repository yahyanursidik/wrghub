import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordAuditLog } from '../../../../services/audit.service';

const createEquipmentSchema = z.object({
  name: z.string().min(2),
  category: z.enum(['ARMADA_MOTOR', 'GEROBAK', 'MESIN_RUMPUT', 'ALAT_MANUAL', 'SAFETY_APD']).default('ALAT_MANUAL'),
  unitCode: z.string().optional(),
  quantity: z.number().int().positive().default(1),
  condition: z.enum(['BAIK', 'PERLU_SERVIS', 'RUSAK']).default('BAIK'),
  picName: z.string().min(2).default('Petugas Kebersihan'),
  notes: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = createEquipmentSchema.parse(body);

    const newEquipment = {
      id: `EQ-${Date.now().toString().slice(-4)}`,
      name: validated.name,
      category: validated.category,
      unitCode: validated.unitCode || `AST-${Date.now().toString().slice(-3)}`,
      quantity: validated.quantity,
      condition: validated.condition,
      picName: validated.picName,
      notes: validated.notes || null,
      lastServiceDate: new Date().toISOString().slice(0, 10),
      nextServiceDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
    };

    if (process.env.DATABASE_URL) {
      await recordAuditLog({
        actorName: 'Pengurus Komplek',
        action: 'cleaning.create_equipment',
        entityType: 'CLEANING_EQUIPMENT',
        entityId: newEquipment.id,
        newValue: {
          name: validated.name,
          category: validated.category,
          unitCode: newEquipment.unitCode,
          quantity: validated.quantity,
          condition: validated.condition,
        },
      });
    }

    return new Response(
      JSON.stringify({
        data: newEquipment,
        meta: {},
        error: null,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        data: null,
        error: { code: 'EQUIPMENT_CREATION_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
