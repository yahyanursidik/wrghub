import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordAuditLog } from '../../../../services/audit.service';

const socialAidSchema = z.object({
  recipientName: z.string().min(2),
  recipientRole: z.enum(['SATPAM', 'PETUGAS_KEBERSIHAN', 'PETUGAS_TAMAN', 'WARGA_MEMBUTUHKAN']).default('SATPAM'),
  aidType: z.enum(['SANTUNAN_KESEHATAN', 'SANTUNAN_DUKA_CITA', 'SANTUNAN_MUSIBAH_BENCANA', 'BINGKISAN_THR', 'BEASISWA_ANAK']).default('SANTUNAN_KESEHATAN'),
  amount: z.number().positive(),
  aidDate: z.string().default(() => new Date().toISOString().slice(0, 10)),
  description: z.string().min(3),
  hospitalOrDetails: z.string().optional(),
  proofUrl: z.string().optional(),
  approvedBy: z.string().default('Ketua RW & Paguyuban Warga'),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = socialAidSchema.parse(body);

    const newAid = {
      id: `AID-${Date.now()}`,
      recipientName: validated.recipientName,
      recipientRole: validated.recipientRole,
      aidType: validated.aidType,
      amount: validated.amount,
      aidDate: validated.aidDate,
      description: validated.description,
      hospitalOrDetails: validated.hospitalOrDetails || null,
      proofUrl: validated.proofUrl || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80',
      approvedBy: validated.approvedBy,
      voucherNo: `BSOS-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
    };

    if (process.env.DATABASE_URL) {
      await recordAuditLog({
        actorName: 'Bendahara Komplek',
        action: 'social.grant_aid',
        entityType: 'SOCIAL_AID',
        entityId: newAid.id,
        newValue: {
          recipient: validated.recipientName,
          type: validated.aidType,
          amount: validated.amount,
          description: validated.description,
        },
      });
    }

    return new Response(
      JSON.stringify({
        data: newAid,
        meta: {},
        error: null,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        data: null,
        error: { code: 'SOCIAL_AID_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
