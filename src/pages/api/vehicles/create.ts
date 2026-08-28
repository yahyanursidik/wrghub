import type { APIRoute } from 'astro';
import { z } from 'zod';
import { neonSql } from '../../../db/neon';
import { db, schema } from '../../../db';
import { recordAuditLog } from '../../../services/audit.service';

const vehicleSchema = z.object({
  propertyId: z.string(),
  plateNumber: z.string().min(3),
  type: z.string().default('Mobil'),
  brand: z.string().min(2),
  model: z.string().min(2),
  color: z.string().default('Hitam'),
  year: z.string().optional(),
  ownerPersonId: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = vehicleSchema.parse(body);
    const id = `veh-${Date.now()}`;

    if (process.env.DATABASE_URL) {
      await neonSql`
        INSERT INTO vehicles (
          id, property_id, owner_person_id, plate_number, type, brand, model, color, year, is_active
        ) VALUES (
          ${id}, ${validated.propertyId}, ${validated.ownerPersonId || 'person-budi'},
          ${validated.plateNumber.toUpperCase()}, ${validated.type}, ${validated.brand},
          ${validated.model}, ${validated.color}, ${validated.year || '2022'}, true
        );
      `;

      await recordAuditLog({
        actorName: 'Warga / Penghuni',
        action: 'vehicle.register',
        entityType: 'VEHICLE',
        entityId: id,
        newValue: { plateNumber: validated.plateNumber, brand: validated.brand, model: validated.model },
      });

      return new Response(
        JSON.stringify({
          data: { id, message: 'Kendaraan baru berhasil didaftarkan ke sistem komplek.' },
          meta: {},
          error: null,
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ data: { id, message: 'Kendaraan terdaftar.' } }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        data: null,
        error: { code: 'VEHICLE_REGISTRATION_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
