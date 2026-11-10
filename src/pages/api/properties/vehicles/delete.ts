import type { APIRoute } from 'astro';
import { z } from 'zod';
import { deactivateRegisteredVehicles } from '../../../../services/vehicle.service';
import { recordAuditLog } from '../../../../services/audit.service';
import type { UserSession } from '../../../../types/auth';

const id = z.string().min(1).max(180);
const input = z.object({ id: id.optional(), vehicleId: id.optional(), ids: z.array(id).min(1).max(100).optional(), reason: z.string().trim().max(500).optional() });

export const POST: APIRoute = async ({ request, session }) => {
  const actor = await session?.get('wargahub_user') as UserSession | undefined;
  if (!actor) return Response.json({ error: { message: 'Silakan masuk kembali.' } }, { status: 401 });
  const body = input.safeParse(await request.json().catch(() => null));
  if (!body.success) return Response.json({ error: { message: 'Data kendaraan tidak valid.' } }, { status: 400 });
  const { id, vehicleId, ids, reason } = body.data;
  const selected = [...new Set(ids ?? [vehicleId || id].filter((value): value is string => Boolean(value)))];
  if (!selected.length) return Response.json({ error: { message: 'Pilih kendaraan yang akan dinonaktifkan.' } }, { status: 400 });
  try {
    const updated = await deactivateRegisteredVehicles(selected);
    if (!updated.length) return Response.json({ error: { message: 'Kendaraan aktif tidak ditemukan.' } }, { status: 404 });
    await recordAuditLog({ actorUserId: actor.id, actorName: actor.fullName, action: 'vehicle.deactivate', entityType: 'PROPERTY_VEHICLE',
      entityId: updated[0], newValue: { ids: updated, reason } });
    return Response.json({ data: { ids: updated, deletedCount: updated.length }, error: null });
  } catch (error) {
    console.error('Gagal menonaktifkan kendaraan:', error);
    return Response.json({ error: { message: 'Status belum bisa dipastikan. Muat ulang daftar kendaraan.' } }, { status: 503 });
  }
};
