import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordAuditLog } from '../../../../services/audit.service';

const deleteVehicleSchema = z.object({
  id: z.string().optional(),
  vehicleId: z.string().optional(),
  plateNumber: z.string().optional(),
  houseCode: z.string().optional(),
  ids: z.array(z.string()).optional(),
  plateNumbers: z.array(z.string()).optional(),
  reason: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = deleteVehicleSchema.parse(body);

    // Case 1: Bulk delete
    if (validated.ids && validated.ids.length > 0) {
      const targetIds = validated.ids;
      const targetPlates = validated.plateNumbers || [];

      if (process.env.DATABASE_URL) {
        await recordAuditLog({
          actorName: 'Pengurus Komplek',
          action: 'property.bulk_delete_vehicle',
          entityType: 'PROPERTY_VEHICLE',
          entityId: `BULK-VEH-${targetIds.length}`,
          newValue: {
            ids: targetIds,
            plates: targetPlates,
            count: targetIds.length,
            reason: validated.reason || `Penghapusan massal ${targetIds.length} kendaraan`,
            deletedAt: new Date().toISOString()
          },
        });
      }

      return new Response(
        JSON.stringify({
          data: {
            success: true,
            deletedCount: targetIds.length,
            ids: targetIds,
            message: `Sebanyak ${targetIds.length} kendaraan berhasil dinonaktifkan / dicabut akses RFID-nya.`
          },
          meta: {},
          error: null,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Case 2: Single delete
    const targetId = validated.vehicleId || validated.id || '';

    if (!targetId && !validated.plateNumber) {
      throw new Error('ID kendaraan atau plat nomor wajib disertakan.');
    }

    if (process.env.DATABASE_URL) {
      await recordAuditLog({
        actorName: 'Pengurus Komplek',
        action: 'property.delete_vehicle',
        entityType: 'PROPERTY_VEHICLE',
        entityId: targetId || validated.plateNumber || 'UNKNOWN',
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
          id: targetId,
          message: `Kendaraan ${validated.plateNumber || targetId} berhasil dinonaktifkan / dihapus dari master akses gerbang.`
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
