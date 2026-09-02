import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordAuditLog } from '../../../../services/audit.service';

const inventorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  category: z.string().default('KOMUNIKASI'),
  quantity: z.number().default(1),
  condition: z.enum(['BAIK', 'PERLU_SERVIS', 'RUSAK', 'HILANG']).default('BAIK'),
  location: z.string().default('Pos Gerbang Utama'),
  lastChecked: z.string().optional(),
  personInCharge: z.string().optional(),
  notes: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = inventorySchema.parse(body);

    const itemId = validated.id || `EQ-${Date.now()}`;
    const newItem = {
      id: itemId,
      name: validated.name,
      category: validated.category,
      quantity: validated.quantity,
      condition: validated.condition,
      location: validated.location,
      lastChecked: validated.lastChecked || new Date().toISOString().split('T')[0],
      personInCharge: validated.personInCharge || 'Danru Satpam',
      notes: validated.notes || null,
      updatedAt: new Date().toISOString(),
    };

    if (process.env.DATABASE_URL) {
      await recordAuditLog({
        actorName: 'Pengurus Keamanan Komplek',
        action: validated.id ? 'security.update_inventory' : 'security.create_inventory',
        entityType: 'SECURITY_EQUIPMENT',
        entityId: newItem.id,
        newValue: {
          name: newItem.name,
          quantity: newItem.quantity,
          condition: newItem.condition,
          location: newItem.location,
        },
      });
    }

    return new Response(
      JSON.stringify({
        data: newItem,
        meta: {},
        error: null,
      }),
      { status: validated.id ? 200 : 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        data: null,
        error: { code: 'INVENTORY_SAVE_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
