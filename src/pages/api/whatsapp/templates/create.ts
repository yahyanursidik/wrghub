import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordAuditLog } from '../../../../services/audit.service';

const templateSchema = z.object({
  title: z.string().min(2),
  category: z.enum(['KEUANGAN', 'KEAMANAN', 'LINGKUNGAN', 'MUSYAWARAH', 'SOSIAL', 'LAINNYA']).default('KEUANGAN'),
  description: z.string().optional(),
  templateText: z.string().min(5),
  tags: z.array(z.string()).optional(),
  targetType: z.enum(['WARGA_INDIVIDU', 'GRUP_WARGA', 'PENGURUS', 'SATPAM']).default('WARGA_INDIVIDU'),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = templateSchema.parse(body);

    const newTemplate = {
      id: `WATPL-${Date.now()}`,
      title: validated.title,
      category: validated.category,
      description: validated.description || '',
      templateText: validated.templateText,
      tags: validated.tags || ['WhatsApp', validated.category],
      targetType: validated.targetType,
      isCustom: true,
      createdAt: new Date().toISOString(),
    };

    if (process.env.DATABASE_URL) {
      await recordAuditLog({
        actorName: 'Pengurus Komplek',
        action: 'whatsapp.create_template',
        entityType: 'WHATSAPP_TEMPLATE',
        entityId: newTemplate.id,
        newValue: {
          title: validated.title,
          category: validated.category,
          targetType: validated.targetType,
        },
      });
    }

    return new Response(
      JSON.stringify({
        data: newTemplate,
        meta: {},
        error: null,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        data: null,
        error: { code: 'TEMPLATE_CREATION_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
