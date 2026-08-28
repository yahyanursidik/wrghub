import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordAuditLog } from '../../../services/audit.service';

const analyticsSnapshotSchema = z.object({
  period: z.string().default('Agustus 2026'),
  complianceRate: z.number().min(0).max(100).default(94.2),
  totalIncome: z.number().positive(),
  totalExpense: z.number().positive(),
  netSurplus: z.number(),
  complaintsResolvedPct: z.number().min(0).max(100).default(96.5),
  notes: z.string().optional(),
  recordedBy: z.string().default('Ketua Komplek & Pengurus'),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = analyticsSnapshotSchema.parse(body);

    const snapshot = {
      id: `SNAP-${Date.now()}`,
      period: validated.period,
      complianceRate: validated.complianceRate,
      totalIncome: validated.totalIncome,
      totalExpense: validated.totalExpense,
      netSurplus: validated.netSurplus,
      complaintsResolvedPct: validated.complaintsResolvedPct,
      notes: validated.notes || 'Evaluasi kinerja tata kelola bulanan',
      recordedBy: validated.recordedBy,
      createdAt: new Date().toISOString(),
    };

    if (process.env.DATABASE_URL) {
      await recordAuditLog({
        actorName: 'Ketua Komplek & Pengurus',
        action: 'analytics.create_snapshot',
        entityType: 'ANALYTICS_SNAPSHOT',
        entityId: snapshot.id,
        newValue: {
          period: validated.period,
          complianceRate: validated.complianceRate,
          netSurplus: validated.netSurplus,
        },
      });
    }

    return new Response(
      JSON.stringify({
        data: snapshot,
        meta: {},
        error: null,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        data: null,
        error: { code: 'ANALYTICS_SNAPSHOT_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
