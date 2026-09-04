import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordAuditLog } from '../../../../services/audit.service';

const createTicketSchema = z.object({
  reporterHouse: z.string().min(1),
  reporterName: z.string().min(2),
  category: z.enum(['SAMPAH_TERLEWAT', 'GOT_MAMPET', 'RUMPUT_LIAR', 'POHON_RANTING', 'BANGKAI_HEWAN']).default('SAMPAH_TERLEWAT'),
  description: z.string().min(3),
  assignedStaffName: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = createTicketSchema.parse(body);

    const newTicket = {
      id: `TCK-${Date.now().toString().slice(-4)}`,
      reporterHouse: validated.reporterHouse,
      reporterName: validated.reporterName,
      category: validated.category,
      description: validated.description,
      reportedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB, ' + new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
      assignedStaffName: validated.assignedStaffName || 'Pak Slamet Riyadi (Koordinator)',
      status: 'OPEN' as const,
      createdAt: new Date().toISOString(),
    };

    if (process.env.DATABASE_URL) {
      await recordAuditLog({
        actorName: 'Warga / Pelapor',
        action: 'cleaning.create_ticket',
        entityType: 'CLEANING_TICKET',
        entityId: newTicket.id,
        newValue: {
          reporterHouse: validated.reporterHouse,
          reporterName: validated.reporterName,
          category: validated.category,
          description: validated.description,
        },
      });
    }

    return new Response(
      JSON.stringify({
        data: newTicket,
        meta: {},
        error: null,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        data: null,
        error: { code: 'TICKET_CREATION_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
