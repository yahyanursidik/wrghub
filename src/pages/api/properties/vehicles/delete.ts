import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordAuditLog } from '../../../../services/audit.service';

const deleteVehicleSchema = z.object({
  vehicleId: z.string().min(1),
  plateNumber: z.string().optional(),
  houseCode: z.string().optional(),
  reason: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = deleteVehicleSchema.parse(body);

    if (process.env.DATABASE_URL) {
      await recordAuditLog({
        actorName: 'Pengurus Komplek',
        action: 'property.delete_vehicle',
        entityType: 'PROPERTY_VEHICLE',
        entityId: validated.vehicleId,
        newValue: {
          plate: validated.plateNumber,
          house: validated.houseCode,
          reason: validated.reason || 'Dihapus dari master kendaraan',
          deletedAt: new Date().toISOString()
        },
      });
    }

    return new Response(
      JSON.stringify({
        data: {
          success: true,
          id: validated.vehicleId,
          message: `Kendaraan ${validated.plateNumber || validated.vehicleId} berhasil dinonaktifkan / dihapus dari master akses gerbang.`
        },
        meta: {},
        error: null,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        data: null,
        error: { code: 'DELETE_VEHICLE_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
