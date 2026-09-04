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
  occupantName: z.string().optional(),
  headName: z.string().optional(),
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
    
    // Normalize block ID to valid database block reference
    const blkClean = (validated.blockId || validated.code).toLowerCase();
    let validBlockId = 'blk-a';
    if (blkClean.includes('b') || blkClean.includes('sariwangi-2')) validBlockId = 'blk-b';
    else if (blkClean.includes('c') || blkClean.includes('kav')) validBlockId = 'blk-c';
    else if (blkClean.includes('d')) validBlockId = 'blk-d';
    else validBlockId = 'blk-a';

    const occupantNameVal = validated.occupantName || validated.headName;
    const resolvedNotes = validated.notes || (
      validated.ownerName
        ? `No. Kavling: ${validated.code} | Pemilik: ${validated.ownerName} | Kepala Keluarga: ${occupantNameVal || validated.ownerName} | Status: ${validated.occupancyStatus === 'OWNER_OCCUPIED' ? 'Pemilik' : validated.occupancyStatus === 'RENTED' ? 'Disewakan' : 'Kosong'}`
        : null
    );

    if (process.env.DATABASE_URL) {
      await neonSql`
        INSERT INTO properties (
          id, community_id, block_id, code, number, address, occupancy_status, is_active, notes
        ) VALUES (
          ${id}, 'comm-01', ${validBlockId}, ${validated.code}, ${validated.number},
          ${validated.address}, ${validated.occupancyStatus === 'RENOVATION' ? 'OWNER_OCCUPIED' : validated.occupancyStatus}, true, ${resolvedNotes}
        )
        ON CONFLICT (id) DO UPDATE SET
          occupancy_status = ${validated.occupancyStatus === 'RENOVATION' ? 'OWNER_OCCUPIED' : validated.occupancyStatus},
          notes = ${resolvedNotes},
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

        if (occupantNameVal) {
          const occPersonId = `person-occ-${id}`;
          const hhId = `hh-${id}`;
          await neonSql`
            INSERT INTO persons (id, name, phone, email, is_active)
            VALUES (
              ${occPersonId},
              ${occupantNameVal},
              ${validated.ownerPhone || '0812-0000-0000'},
              ${validated.code.toLowerCase() + '-occ@wargahub.id'},
              true
            )
            ON CONFLICT (id) DO UPDATE SET
              name = ${occupantNameVal};
          `;
          await neonSql`
            INSERT INTO households (id, name, updated_at)
            VALUES (${hhId}, ${'Keluarga ' + occupantNameVal}, NOW())
            ON CONFLICT (id) DO UPDATE SET name = ${'Keluarga ' + occupantNameVal}, updated_at = NOW();
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
            ON CONFLICT (id) DO UPDATE SET
              person_id = ${occPersonId};
          `;
        }
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
