import type { APIRoute } from 'astro';
import { vehicleInput } from '../../../lib/vehicle-input';
import { saveRegisteredVehicle } from '../../../services/vehicle.service';
import { recordAuditLog } from '../../../services/audit.service';
import type { UserSession } from '../../../types/auth';

const input = vehicleInput;
export const POST: APIRoute = async ({ request, session }) => {
  const actor = await session?.get('wargahub_user') as UserSession | undefined;
  if (!actor) return Response.json({ error: { message: 'Silakan masuk kembali.' } }, { status: 401 });
  const body = input.safeParse(await request.json().catch(() => null));
  if (!body.success) return Response.json({ error: { message: body.error.issues[0]?.message } }, { status: 400 });
  try {
    const vehicle = await saveRegisteredVehicle(body.data);
    await recordAuditLog({ actorUserId: actor.id, actorName: actor.fullName, action: 'vehicle.register',
      entityType: 'PROPERTY_VEHICLE', entityId: vehicle.id, newValue: { plateNumber: vehicle.plateNumber, propertyId: vehicle.propertyId } });
    return Response.json({ data: vehicle, error: null }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    const status = message === 'Plat nomor sudah terdaftar.' ? 409 : message.endsWith('tidak ditemukan.') ? 404 : 503;
    if (status === 503) console.error('Gagal menyimpan kendaraan:', error);
    return Response.json({ error: { message: status === 503 ? 'Penyimpanan belum bisa dipastikan. Muat ulang daftar kendaraan.' : message } }, { status });
  }
};
