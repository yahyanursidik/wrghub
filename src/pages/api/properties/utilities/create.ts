import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordAuditLog } from '../../../../services/audit.service';

const utilitySchema = z.object({
  propertyId: z.string().default('prop-a-17'),
  houseCode: z.string().default('A-17'),
  areaLabel: z.string().optional(),
  ownerName: z.string().optional(),
  plnCapacity: z.string().default('3.500 VA'),
  plnCustomerId: z.string().optional(),
  pamMeterNo: z.string().default('PAM-88301'),
  pamReadingLastMonth: z.number().default(120),
  pamReadingThisMonth: z.number().default(138),
  monthlyIplFee: z.number().default(750000),
  wasteSchedule: z.string().default('SENIN_RABU_JUMAT'),
  hasBiopori: z.boolean().default(true),
  hasSolarPanel: z.boolean().default(false),
  paymentStatus: z.enum(['LUNAS', 'MENUNGGU_BAYAR', 'MENUNGGAK']).default('LUNAS'),
  notes: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = utilitySchema.parse(body);

    const house = validated.houseCode.toUpperCase();
    const newUtility = {
      id: `UTIL-${house}`,
      propertyId: validated.propertyId,
      houseCode: house,
      areaLabel: validated.areaLabel || (house.startsWith('KAV') ? 'Kavling' : house.startsWith('SW') ? 'Jl. Sariwangi Indah' : `Blok ${house.split('-')[0]}`),
      ownerName: validated.ownerName || 'Warga Terdaftar',
      plnCapacity: validated.plnCapacity,
      plnCustomerId: validated.plnCustomerId || `PLN-5388${Math.floor(100000 + Math.random() * 900000)}`,
      pamMeterNo: validated.pamMeterNo,
      pamReadingLastMonth: validated.pamReadingLastMonth,
      pamReadingThisMonth: validated.pamReadingThisMonth,
      pamUsage: Math.max(0, validated.pamReadingThisMonth - validated.pamReadingLastMonth),
      monthlyIplFee: validated.monthlyIplFee,
      wasteSchedule: validated.wasteSchedule,
      hasBiopori: validated.hasBiopori,
      hasSolarPanel: validated.hasSolarPanel,
      paymentStatus: validated.paymentStatus,
      notes: validated.notes || null,
      updatedAt: new Date().toISOString(),
    };

    if (process.env.DATABASE_URL) {
      await recordAuditLog({
        actorName: 'Pengurus Komplek',
        action: 'property.update_utility',
        entityType: 'PROPERTY_UTILITY',
        entityId: newUtility.id,
        newValue: {
          house: newUtility.houseCode,
          pln: validated.plnCapacity,
          pam: validated.pamMeterNo,
          usage: newUtility.pamUsage,
          status: validated.paymentStatus,
          ipl: validated.monthlyIplFee
        },
      });
    }

    return new Response(
      JSON.stringify({
        data: newUtility,
        meta: {},
        error: null,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        data: null,
        error: { code: 'UTILITY_UPDATE_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
