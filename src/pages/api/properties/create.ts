import type { APIRoute } from 'astro';
import { z } from 'zod';
import { neonSql } from '../../../db/neon';
import { recordAuditLog } from '../../../services/audit.service';

const propertySchema = z.object({
  code: z.string().min(2),
  number: z.string().min(1),
  blockId: z.string(),
  address: z.string(),
  occupancyStatus: z.enum(['OWNER_OCCUPIED', 'RENTED', 'VACANT', 'RENOVATION']),
  ownerName: z.string().optional(),
  ownerPhone: z.string().optional(),
  ownerNik: z.string().optional(),
  buildingType: z.string().optional(),
  landArea: z.number().optional(),
  buildingArea: z.number().optional(),
  plnCapacity: z.string().optional(),
  pamMeterNo: z.string().optional(),
  monthlyRate: z.number().optional(),
  handoverDate: z.string().optional(),
  notes: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = propertySchema.parse(body);
    const id = `prop-${validated.code.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    
    // Normalize block ID (e.g., 'block-a' -> 'blk-a', 'A' -> 'blk-a')
    const blockLetter = (validated.blockId.replace(/[^a-zA-Z]/g, '') || validated.code.split('-')[0] || 'a').slice(-1).toLowerCase();
    const validBlockId = `blk-${blockLetter}`;

    if (process.env.DATABASE_URL) {
      await neonSql`
        INSERT INTO properties (
          id, community_id, block_id, code, number, address, occupancy_status, is_active, notes
        ) VALUES (
          ${id}, 'comm-01', ${validBlockId}, ${validated.code}, ${validated.number},
          ${validated.address}, ${validated.occupancyStatus === 'RENOVATION' ? 'OWNER_OCCUPIED' : validated.occupancyStatus}, true, ${validated.notes || null}
        )
        ON CONFLICT (id) DO UPDATE SET
          occupancy_status = ${validated.occupancyStatus === 'RENOVATION' ? 'OWNER_OCCUPIED' : validated.occupancyStatus},
          notes = ${validated.notes || null},
          updated_at = NOW();
      `;

      if (validated.ownerName && validated.occupancyStatus !== 'VACANT') {
        const pId = `person-${id}`;
        await neonSql`
          INSERT INTO persons (id, name, phone, email, is_active)
          VALUES (
            ${pId},
            ${validated.ownerName},
            ${validated.ownerPhone || '0812-0000-0000'},
            ${validated.code.toLowerCase() + '@wargahub.id'},
            true
          )
          ON CONFLICT (id) DO UPDATE SET
            name = ${validated.ownerName},
            phone = ${validated.ownerPhone || '0812-0000-0000'};
        `;
        await neonSql`
          INSERT INTO property_ownerships (id, property_id, person_id, is_active, started_at)
          VALUES (${'own-' + id}, ${id}, ${pId}, true, '2026-01-01')
          ON CONFLICT (id) DO NOTHING;
        `;
      }

      await recordAuditLog({
        actorName: 'Pengurus Komplek',
        action: 'property.create_or_update',
        entityType: 'PROPERTY',
        entityId: id,
        newValue: {
          code: validated.code,
          owner: validated.ownerName,
          status: validated.occupancyStatus,
          pln: validated.plnCapacity,
          pam: validated.pamMeterNo,
          landArea: validated.landArea,
          buildingArea: validated.buildingArea
        },
      });

      return new Response(
        JSON.stringify({
          data: {
            id,
            code: validated.code,
            address: validated.address,
            ownerName: validated.ownerName,
            occupancyStatus: validated.occupancyStatus,
            message: `Data rumah ${validated.code} berhasil disimpan ke sistem.`
          },
          meta: {},
          error: null,
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        data: {
          id,
          code: validated.code,
          message: 'Properti disimpan (mock).'
        }
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        data: null,
        error: { code: 'PROPERTY_UPSERT_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
