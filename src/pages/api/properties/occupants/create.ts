import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordAuditLog } from '../../../../services/audit.service';
import { neonSql } from '../../../../db/neon';

const occupantSchema = z.object({
  propertyId: z.string().default('prop-a-17'),
  houseCode: z.string().optional(),
  areaLabel: z.string().optional(),
  fullName: z.string().min(1),
  relation: z.string(), // KEPALA_KELUARGA | ISTRI | ANAK | ORANG_TUA | FAMILI_LAIN | ART | PENYEWA
  idCard: z.string().optional(),
  idCardNumber: z.string().optional(),
  familyCard: z.string().optional(),
  familyCardNumber: z.string().optional(),
  gender: z.string().optional(),
  birthPlaceDate: z.string().optional(),
  religion: z.string().optional(),
  occupation: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  domicileStatus: z.string().optional(),
  bloodType: z.string().optional(),
  isEmergency: z.boolean().optional(),
  isEmergencyContact: z.boolean().optional(),
  notes: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = occupantSchema.parse(body);

    const nik = validated.idCard || validated.idCardNumber || '3171091203850001';
    const noKk = validated.familyCard || validated.familyCardNumber || '3171091203850000';
    const isEmerg = validated.isEmergency !== undefined ? validated.isEmergency : Boolean(validated.isEmergencyContact);

    const newOccupant = {
      id: `occ-${Date.now()}`,
      propertyId: validated.propertyId,
      houseCode: validated.houseCode || validated.propertyId.replace('prop-', '').toUpperCase(),
      areaLabel: validated.areaLabel || 'Blok A',
      fullName: validated.fullName,
      relation: validated.relation,
      idCard: nik,
      idCardNumber: nik,
      familyCard: noKk,
      familyCardNumber: noKk,
      gender: validated.gender || 'LAKI_LAKI',
      birthPlaceDate: validated.birthPlaceDate || 'Jakarta, 12-03-1985',
      religion: validated.religion || 'ISLAM',
      occupation: validated.occupation || 'Karyawan Swasta',
      phone: validated.phone || '0812-3456-7890',
      email: validated.email || `${validated.fullName.toLowerCase().replace(/[^a-z]/g, '')}@wargahub.id`,
      domicileStatus: validated.domicileStatus || 'KTP_SETEMPAT',
      bloodType: validated.bloodType || 'O',
      isEmergency: isEmerg,
      isEmergencyContact: isEmerg,
      status: 'VERIFIED',
      notes: validated.notes || null,
      createdAt: new Date().toISOString(),
    };

    if (process.env.DATABASE_URL) {
      await recordAuditLog({
        actorName: 'Pengurus Komplek',
        action: 'property.add_occupant',
        entityType: 'PROPERTY_OCCUPANT',
        entityId: newOccupant.id,
        newValue: {
          name: validated.fullName,
          relation: validated.relation,
          house: newOccupant.houseCode,
          nik: nik,
          phone: validated.phone
        },
      });
    }

    return new Response(
      JSON.stringify({
        data: newOccupant,
        meta: {},
        error: null,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        data: null,
        error: { code: 'CREATE_OCCUPANT_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
