import type { APIRoute } from 'astro';
import { z } from 'zod';
import { neonSql } from '../../../db/neon';
import { recordAuditLog } from '../../../services/audit.service';

const bookingSchema = z.object({
  facilityId: z.string(),
  facilityName: z.string(),
  propertyId: z.string().optional(),
  residentName: z.string(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  purpose: z.string(),
  contactPhone: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = bookingSchema.parse(body);
    const id = `maint-${Date.now()}`;

    if (process.env.DATABASE_URL) {
      // Find facility ID in Neon
      let targetFacId = 'fac-3'; // Default to Balai Warga & Lapangan
      try {
        const facs = await neonSql`
          SELECT id FROM facilities WHERE id = ${validated.facilityId} OR LOWER(name) LIKE ${'%' + validated.facilityName.toLowerCase() + '%'} LIMIT 1
        `;
        if (facs.length) {
          targetFacId = facs[0].id;
        }
      } catch (e) {
        console.warn('Facility lookup error:', e);
      }

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

    return new Response(
      JSON.stringify({ data: { message: 'Booking berhasil diajukan.' } }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
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
