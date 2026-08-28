import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordAuditLog } from '../../../../services/audit.service';

const occupantSchema = z.object({
  propertyId: z.string().default('prop-a-17'),
  fullName: z.string().min(1),
  relation: z.string(), // KEPALA_KELUARGA | ISTRI | ANAK | ORANG_TUA | ART_SUPIR
  idCardNumber: z.string().optional(),
  phone: z.string().optional(),
  isEmergencyContact: z.boolean().default(false),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = occupantSchema.parse(body);

    const newOccupant = {
      id: `occ-${Date.now()}`,
      propertyId: validated.propertyId,
      fullName: validated.fullName,
      relation: validated.relation,
      idCardNumber: validated.idCardNumber || '3171xxxxxxxx0001',
      phone: validated.phone || '0812-xxxx-xxxx',
      isEmergencyContact: validated.isEmergencyContact,
      status: 'VERIFIED',
      createdAt: new Date().toISOString(),
    };

    if (process.env.DATABASE_URL) {
      await recordAuditLog({
        actorName: validated.fullName,
        action: 'property.add_occupant',
        entityType: 'PROPERTY_OCCUPANT',
        entityId: newOccupant.id,
        newValue: { name: validated.fullName, relation: validated.relation, property: validated.propertyId },
      });
    }

    return new Response(
      JSON.stringify({
        data: newOccupant,
        meta: {},
        error: null,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        data: null,
        error: { code: 'CREATE_OCCUPANT_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
