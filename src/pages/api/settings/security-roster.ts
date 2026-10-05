import type { APIRoute } from 'astro';
import { z } from 'zod';
import { getSecurityShiftRoster, saveSecurityShiftRoster } from '../../../services/settings.service';
import { recordAuditLog } from '../../../services/audit.service';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const roster = await getSecurityShiftRoster();
    return new Response(
      JSON.stringify({ data: roster, meta: {}, error: null }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ data: null, error: { code: 'ROSTER_FETCH_FAILED', message: err?.message || 'Gagal memuat roster' } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

const timelineItemSchema = z.object({
  time: z.string().min(1),
  title: z.string().min(2),
  label: z.string().default(''),
  description: z.string().default(''),
});

const rosterSchema = z.object({
  shifts: z
    .array(
      z.object({
        id: z.string().min(1),
        name: z.string().min(2),
        time: z.string().min(3),
        staffName: z.string().min(2),
        role: z.string().default('Petugas Jaga'),
        phone: z.string().default(''),
        areas: z.array(z.string().min(1)).default([]),
        badgeNo: z.string().optional().default(''),
        post: z.string().optional().default(''),
        specialDuties: z.string().optional().default(''),
      })
    )
    .min(1),
  notes: z.string().default(''),
  rotationStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  handoverTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  timeline: z.array(timelineItemSchema).optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = rosterSchema.parse(body);

    // Timeline & parameter rotasi tidak wajib dikirim editor; pertahankan
    // nilai yang sudah tersimpan agar SOP piket tidak hilang saat menyimpan
    // perubahan petugas saja.
    const existing = await getSecurityShiftRoster();
    const merged = {
      shifts: validated.shifts,
      notes: validated.notes,
      rotationStartDate: validated.rotationStartDate || existing.rotationStartDate,
      handoverTime: validated.handoverTime || existing.handoverTime,
      timeline:
        validated.timeline && validated.timeline.length > 0
          ? validated.timeline
          : existing.timeline,
    };

    await saveSecurityShiftRoster(merged);

    await recordAuditLog({
      actorName: 'Pengurus / Bendahara Komplek',
      action: 'settings.update_security_roster',
      entityType: 'SECURITY_ROSTER',
      entityId: 'security_shift_roster',
      newValue: { shiftCount: validated.shifts.length },
    }).catch(() => {});

    return new Response(
      JSON.stringify({
        data: {
          success: true,
          message: 'Roster jadwal shift & penugasan area jaga berhasil disimpan dan langsung tampil di halaman publik Transparency.',
        },
        meta: {},
        error: null,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    const isZod = err instanceof z.ZodError;
    const message = isZod
      ? `Data roster tidak valid: ${err.issues.map((i) => `${i.path.join('.') || 'field'} — ${i.message}`).join('; ')}`
      : err?.message || 'Gagal menyimpan roster jadwal shift';
    return new Response(
      JSON.stringify({
        data: null,
        error: { code: 'ROSTER_SAVE_FAILED', message },
      }),
      { status: isZod ? 400 : 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
