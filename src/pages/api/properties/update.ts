import type { APIRoute } from 'astro';
import { z } from 'zod';
import { recordAuditLog } from '../../../services/audit.service';

import { neonSql } from '../../../db/neon';
import { db, schema } from '../../../db';
import { eq } from 'drizzle-orm';

const propUpdateSchema = z.object({
  id: z.string().optional(),
  code: z.string().optional(),
  propertyCode: z.string().optional(),
  number: z.string().optional(),
  address: z.string().optional(),
  occupancyStatus: z.string().optional(),
  ownerName: z.string().optional(),
  occupantName: z.string().optional(),
  headName: z.string().optional(),
  notes: z.string().optional(),
  buildingType: z.string().optional(),
  landArea: z.number().optional(),
  buildingArea: z.number().optional(),
  plnCapacity: z.string().optional(),
  pamMeterNo: z.string().optional(),
  monthlyRate: z.number().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = propUpdateSchema.parse(body);

    const code = validated.code || validated.propertyCode || 'A-17';
    const id = validated.id || `prop-${code.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

    const updated = {
      propertyCode: code,
      code,
      buildingType: validated.buildingType || 'Tipe 72/120',
      landArea: validated.landArea || 120,
      buildingArea: validated.buildingArea || 72,
      plnCapacity: validated.plnCapacity || '3.500 VA',
      pamMeterNo: validated.pamMeterNo || 'PAM-88301',
      occupancyStatus: validated.occupancyStatus || 'DIHUNI_PEMILIK',
      ownerName: validated.ownerName,
      occupantName: validated.occupantName || validated.headName,
      updatedAt: new Date().toISOString(),
    };

    if (process.env.DATABASE_URL) {
      const occName = validated.occupantName || validated.headName;
      const resolvedNotes = validated.notes || (
        validated.ownerName
          ? `No. Kavling: ${code} | Pemilik: ${validated.ownerName} | Kepala Keluarga: ${occName || validated.ownerName} | Status: ${validated.occupancyStatus === 'OWNER_OCCUPIED' ? 'Pemilik' : validated.occupancyStatus === 'RENTED' ? 'Disewakan' : 'Kosong'}`
          : null
      );

      if (validated.address || validated.occupancyStatus || validated.notes) {
        await neonSql`
          UPDATE properties 
          SET 
            address = COALESCE(${validated.address || null}, address),
            occupancy_status = COALESCE(${validated.occupancyStatus || null}, occupancy_status),
            notes = COALESCE(${resolvedNotes}, notes),
            updated_at = NOW()
          WHERE id = ${id} OR LOWER(code) = LOWER(${code});
        `;
      }

      if (validated.ownerName && validated.occupancyStatus !== 'VACANT') {
        const pId = `person-${id}`;
        await neonSql`
          INSERT INTO persons (id, name, phone, email, is_active)
          VALUES (${pId}, ${validated.ownerName}, '0812-0000-0000', ${code.toLowerCase() + '@wargahub.id'}, true)
          ON CONFLICT (id) DO UPDATE SET name = ${validated.ownerName};
        `;
        await neonSql`
          INSERT INTO property_ownerships (id, property_id, person_id, is_active, started_at)
          VALUES (${'own-' + id}, ${id}, ${pId}, true, '2026-01-01')
          ON CONFLICT (id) DO NOTHING;
        `;
      }

      if (occName && validated.occupancyStatus !== 'VACANT') {
        const occPersonId = `person-occ-${id}`;
        const hhId = `hh-${id}`;
        await neonSql`
          INSERT INTO persons (id, name, phone, email, is_active)
          VALUES (${occPersonId}, ${occName}, '0812-0000-0000', ${code.toLowerCase() + '-occ@wargahub.id'}, true)
          ON CONFLICT (id) DO UPDATE SET name = ${occName};
        `;
        await neonSql`
          INSERT INTO households (id, name, updated_at)
          VALUES (${hhId}, ${'Keluarga ' + occName}, NOW())
          ON CONFLICT (id) DO UPDATE SET name = ${'Keluarga ' + occName}, updated_at = NOW();
        `;
        await neonSql`
          INSERT INTO occupancies (id, property_id, household_id, type, is_active, started_at)
          VALUES (${'occ-' + id}, ${id}, ${hhId}, ${validated.occupancyStatus === 'RENTED' ? 'TENANT' : 'OWNER'}, true, '2026-01-01')
          ON CONFLICT (id) DO UPDATE SET
            type = ${validated.occupancyStatus === 'RENTED' ? 'TENANT' : 'OWNER'};
        `;
        await neonSql`
          INSERT INTO household_members (id, household_id, person_id, relationship, is_active)
          VALUES (${'hm-' + id}, ${hhId}, ${occPersonId}, 'HEAD', true)
          ON CONFLICT (id) DO UPDATE SET person_id = ${occPersonId};
        `;
      }

      await recordAuditLog({
        actorName: `Admin Komplek`,
        action: 'property.update',
        entityType: 'PROPERTY',
        entityId: id,
        newValue: updated,
      });
    }

    try {
      await db.update(schema.properties).set({
        address: validated.address || undefined,
        occupancyStatus: validated.occupancyStatus || undefined,
        notes: (validated.notes || (validated.ownerName ? `No. Kavling: ${code} | Pemilik: ${validated.ownerName} | Status: ${validated.occupancyStatus}` : undefined)),
        number: validated.number || undefined,
        updatedAt: new Date().toISOString(),
      }).where(eq(schema.properties.id, id));
    } catch (sqliteErr) {
      console.warn('SQLite property update fallback error:', sqliteErr);
    }

    return new Response(
      JSON.stringify({
        data: updated,
        meta: {},
        error: null,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        data: null,
        error: { code: 'PROPERTY_UPDATE_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
