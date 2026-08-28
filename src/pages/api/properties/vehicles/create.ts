import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordAuditLog } from '../../../../services/audit.service';

const vehicleSchema = z.object({
  propertyId: z.string().default('prop-a-17'),
  houseCode: z.string().optional(),
  ownerName: z.string().optional(),
  plateNumber: z.string().min(3),
  type: z.string().default('Mobil'), // Mobil, Motor, Sepeda Listrik, Truk/Pickup
  brand: z.string().min(1),
  model: z.string().min(1),
  color: z.string().default('Hitam'),
  year: z.number().optional(),
  rfidTag: z.string().optional(),
  gateAccess: z.string().default('SEMUA_GERBANG'),
  rfidStatus: z.enum(['AKTIF', 'DIBLOKIR', 'PENDING_VERIFIKASI']).default('AKTIF'),
  notes: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = vehicleSchema.parse(body);

    const newVehicle = {
      id: `veh-${Date.now()}`,
      propertyId: validated.propertyId,
      houseCode: validated.houseCode || validated.propertyId.replace('prop-', '').toUpperCase(),
      ownerName: validated.ownerName || 'Warga Terdaftar',
      plateNumber: validated.plateNumber.toUpperCase(),
      type: validated.type,
      brand: validated.brand,
      model: validated.model,
      color: validated.color,
      year: validated.year || new Date().getFullYear(),
      rfidTag: validated.rfidTag || `RFID-${Math.floor(1000000 + Math.random() * 9000000)}`,
      gateAccess: validated.gateAccess,
      rfidStatus: validated.rfidStatus,
      notes: validated.notes || null,
      createdAt: new Date().toISOString(),
    };

    if (process.env.DATABASE_URL) {
      await recordAuditLog({
        actorName: 'Pengurus Komplek',
        action: 'property.register_vehicle',
        entityType: 'PROPERTY_VEHICLE',
        entityId: newVehicle.id,
        newValue: {
          plate: newVehicle.plateNumber,
          house: newVehicle.houseCode,
          type: newVehicle.type,
          rfid: newVehicle.rfidTag,
          status: newVehicle.rfidStatus
        },
      });
    }

    return new Response(
      JSON.stringify({
        data: newVehicle,
        meta: {},
        error: null,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        data: null,
        error: { code: 'CREATE_VEHICLE_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
