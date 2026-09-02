import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordAuditLog } from '../../../../services/audit.service';

const permitSchema = z.object({
  propertyCode: z.string().default('A-17'),
  houseCode: z.string().optional(),
  areaLabel: z.string().optional(),
  ownerName: z.string().optional(),
  workType: z.string(), // Pengecatan & Kanopi | Renovasi Interior | Perbaikan Atap | Pembangunan Tingkat | Pemasangan Solar Panel | Lainnya
  contractorName: z.string(),
  contractorPhone: z.string().optional(),
  workersCount: z.number().default(2),
  workersList: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  allowedHours: z.string().default('08:00 - 17:00 WIB (Senin - Sabtu)'),
  depositStatus: z.string().optional(),
  depositAmount: z.number().optional(),
  description: z.string(),
  status: z.enum(['APPROVED', 'PENDING_REVIEW', 'COMPLETED', 'SUSPENDED']).default('APPROVED'),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = permitSchema.parse(body);

    const house = (validated.houseCode || validated.propertyCode).toUpperCase();
    const newPermit = {
      id: `PERMIT-${Date.now()}`,
      houseCode: house,
      propertyCode: house,
      areaLabel: validated.areaLabel || (house.startsWith('KAV') ? 'Kavling' : house.startsWith('SW') ? 'Jl. Sariwangi Indah' : `Blok ${house.split('-')[0]}`),
      ownerName: validated.ownerName || 'Warga Terdaftar',
      workType: validated.workType,
      contractorName: validated.contractorName,
      contractorPhone: validated.contractorPhone || '0812-xxxx-xxxx',
      workersCount: validated.workersCount,
      workersList: validated.workersList || `${validated.contractorName} & ${validated.workersCount} Tukang`,
      startDate: validated.startDate,
      endDate: validated.endDate,
      allowedHours: validated.allowedHours,
      depositStatus: validated.depositStatus,
      depositAmount: validated.depositAmount,
      description: validated.description,
      status: validated.status,
      securityNotified: true,
      issuedAt: new Date().toISOString(),
    };

    if (process.env.DATABASE_URL) {
      await recordAuditLog({
        actorName: 'Pengurus Komplek',
        action: 'property.create_permit',
        entityType: 'RENOVATION_PERMIT',
        entityId: newPermit.id,
        newValue: {
          house: newPermit.houseCode,
          contractor: validated.contractorName,
          workType: validated.workType,
          workers: validated.workersCount,
          period: `${validated.startDate} s/d ${validated.endDate}`,
          status: validated.status
        },
      });
    }

    return new Response(
      JSON.stringify({
        data: newPermit,
        meta: {},
        error: null,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        data: null,
        error: { code: 'PERMIT_CREATION_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
