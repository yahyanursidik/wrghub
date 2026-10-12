import type { APIRoute } from 'astro';
import { z } from 'zod';
import { neonSql } from '../../../db/neon';
import { recordAuditLog } from '../../../services/audit.service';
import { db, schema } from '../../../db';

const bookingSchema = z.object({
  facilityId: z.string().min(1),
  facilityName: z.string(),
  propertyId: z.string().optional(),
  residentName: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  purpose: z.string().min(3),
  contactPhone: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = bookingSchema.parse(body);
    if (validated.endTime <= validated.startTime) throw new Error('Waktu selesai harus setelah waktu mulai.');
    const id = `maint-${Date.now()}`;

    if (process.env.DATABASE_URL) {
      // Find facility ID in Neon
      let targetFacId = '';
      try {
        const facs = await neonSql`
          SELECT id FROM facilities WHERE id = ${validated.facilityId} LIMIT 1
        `;
        if (facs.length) {
          targetFacId = facs[0].id;
        }
      } catch (e) {
        throw new Error('Fasilitas belum bisa diperiksa. Coba lagi.');
      }
      if (!targetFacId) throw new Error('Fasilitas tidak ditemukan. Pilih fasilitas yang tercatat.');

      await neonSql`
        INSERT INTO maintenance_requests (
          id, facility_id, title, description, cost_estimate, actual_cost, status, scheduled_date, performed_by, created_at
        ) VALUES (
          ${id}, ${targetFacId},
          ${'Reservasi: ' + validated.facilityName + ' (' + validated.date + ')'},
          ${'Waktu: ' + validated.startTime + ' - ' + validated.endTime + ' WIB | Keperluan: ' + validated.purpose + ' | Kontak: ' + (validated.contactPhone || '-')},
          0, 0, 'PLANNED', ${validated.date}, ${validated.residentName}, NOW()
        );
      `;

      await recordAuditLog({
        actorName: validated.residentName,
        action: 'facility.book',
        entityType: 'FACILITY_BOOKING',
        entityId: id,
        newValue: { facility: validated.facilityName, date: validated.date, time: `${validated.startTime}-${validated.endTime}` },
      });

      return new Response(
        JSON.stringify({
          data: { id, message: `Pemesanan fasilitas ${validated.facilityName} berhasil diajukan dan menunggu persetujuan pengurus.` },
          meta: {},
          error: null,
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const facilities = await db.select().from(schema.facilities);
    if (!facilities.some(facility => facility.id === validated.facilityId)) throw new Error('Fasilitas tidak ditemukan.');
    await db.insert(schema.maintenanceRequests).values({ id, facilityId: validated.facilityId, title: `Reservasi: ${validated.facilityName} (${validated.date})`, description: `Waktu: ${validated.startTime} - ${validated.endTime} WIB | Keperluan: ${validated.purpose} | Kontak: ${validated.contactPhone || '-'}`, costEstimate: 0, actualCost: 0, status: 'PLANNED', scheduledDate: validated.date, performedBy: validated.residentName });
    return Response.json({ data: { id, message: 'Pemesanan diajukan untuk ditinjau pengurus.' }, error: null }, { status: 201 });
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        data: null,
        error: { code: 'BOOKING_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
