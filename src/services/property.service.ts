import { neonSql } from '../db/neon';
import { db, schema } from '../db';
import { eq } from 'drizzle-orm';

export interface PropertyListItem {
  id: string;
  code: string;
  blockCode: string;
  blockName: string;
  number: string;
  address: string;
  occupancyStatus: string;
  isActive: boolean;
  notes: string | null;
  ownerName?: string;
  occupantName?: string;
  headName?: string;
  residentCount?: number;
}

function extractFromNotes(notes: string | null | undefined, field: 'Pemilik' | 'Kepala Keluarga'): string | null {
  if (!notes) return null;
  const match = notes.match(new RegExp(`${field}:\\s*([^|]+)`));
  return match ? match[1].trim() : null;
}

export async function getProperties(): Promise<PropertyListItem[]> {
  try {
    if (process.env.DATABASE_URL) {
      const rows = await neonSql`
        SELECT 
          p.id, p.code, p.number, p.address, p.occupancy_status, p.is_active, p.notes,
          b.name as block_name, b.code as block_code,
          (SELECT per.name FROM property_ownerships po 
           JOIN persons per ON po.person_id = per.id 
           WHERE po.property_id = p.id AND po.is_active = true 
           LIMIT 1) as owner_name,
          (SELECT per.name FROM occupancies occ 
           JOIN household_members hm ON occ.household_id = hm.household_id 
           JOIN persons per ON hm.person_id = per.id 
           WHERE occ.property_id = p.id AND occ.is_active = true 
           LIMIT 1) as occupant_name,
          (SELECT COUNT(*) FROM occupancies occ 
           JOIN household_members hm ON occ.household_id = hm.household_id 
           WHERE occ.property_id = p.id AND occ.is_active = true) as resident_count
        FROM properties p
        LEFT JOIN blocks b ON p.block_id = b.id
        WHERE p.is_active = true
        ORDER BY p.code ASC
      `;

      return rows.map((r: any) => {
        const ownerFromNotes = extractFromNotes(r.notes, 'Pemilik');
        const occupantFromNotes = extractFromNotes(r.notes, 'Kepala Keluarga');

        let resolvedOwner = r.owner_name || ownerFromNotes || 'Warga';
        if (resolvedOwner === 'Warga' && ownerFromNotes) {
          resolvedOwner = ownerFromNotes;
        }

        let resolvedOccupant: string | undefined = undefined;
        if (r.occupancy_status === 'VACANT') {
          resolvedOccupant = undefined;
        } else if (r.occupancy_status === 'RENTED') {
          resolvedOccupant = r.occupant_name || occupantFromNotes || 'Penyewa';
        } else {
          resolvedOccupant = r.occupant_name || occupantFromNotes || resolvedOwner;
        }

        const resCount = Number(r.resident_count || (r.occupancy_status === 'VACANT' ? 0 : 1));

        return {
          id: r.id,
          code: r.code,
          blockCode: r.block_code || (r.code.toUpperCase().startsWith('KAV') ? 'KAV' : r.code.split('-')[0]) || '',
          blockName: r.block_name || (r.code.toUpperCase().startsWith('KAV') ? 'Area Kavling' : `Blok ${r.code.split('-')[0]}`),
          number: r.number,
          address: r.address,
          occupancyStatus: r.occupancy_status,
          isActive: Boolean(r.is_active),
          notes: r.notes,
          ownerName: resolvedOwner,
          occupantName: resolvedOccupant,
          headName: resolvedOccupant,
          residentCount: resCount,
        };
      });
    }
  } catch (err) {
    console.warn('Falling back to local db:', err);
  }

  // Fallback to local Drizzle
  const props = await db.select().from(schema.properties).where(eq(schema.properties.isActive, true)).orderBy(schema.properties.code);
  const blocks = await db.select().from(schema.blocks);
  const blockMap = new Map(blocks.map(b => [b.id, b]));
  const persons = await db.select().from(schema.persons);
  const personMap = new Map(persons.map(p => [p.id, p]));
  const ownerships = await db.select().from(schema.propertyOwnerships).where(eq(schema.propertyOwnerships.isActive, true));
  const ownerMap = new Map(ownerships.map(o => [o.propertyId, personMap.get(o.personId ?? '')?.name]));

  const occupanciesList = await db.select().from(schema.occupancies).where(eq(schema.occupancies.isActive, true));
  const householdMemberList = await db.select().from(schema.householdMembers).where(eq(schema.householdMembers.isActive, true));
  const hhMemberMap = new Map(householdMemberList.map(hm => [hm.householdId, personMap.get(hm.personId ?? '')?.name]));
  const occMap = new Map(occupanciesList.map(o => [o.propertyId, hhMemberMap.get(o.householdId ?? '')]));

  return props.map(p => {
    const blk = p.blockId ? blockMap.get(p.blockId) : null;
    const ownerFromNotes = extractFromNotes(p.notes, 'Pemilik');
    const occupantFromNotes = extractFromNotes(p.notes, 'Kepala Keluarga');

    let resolvedOwner = ownerMap.get(p.id) || ownerFromNotes || (p.occupancyStatus === 'VACANT' ? 'Belum berpenghuni' : 'Warga');
    let resolvedOccupant: string | undefined = undefined;
    if (p.occupancyStatus === 'VACANT') {
      resolvedOccupant = undefined;
    } else if (p.occupancyStatus === 'RENTED') {
      resolvedOccupant = occMap.get(p.id) || occupantFromNotes || 'Penyewa';
    } else {
      resolvedOccupant = occMap.get(p.id) || occupantFromNotes || resolvedOwner;
    }

    return {
      id: p.id,
      code: p.code,
      blockCode: blk?.code || (p.code.toUpperCase().startsWith('KAV') ? 'KAV' : p.code.split('-')[0]) || '',
      blockName: blk?.name || (p.code.toUpperCase().startsWith('KAV') ? 'Area Kavling' : `Blok ${p.code.split('-')[0]}`),
      number: p.number,
      address: p.address,
      occupancyStatus: p.occupancyStatus,
      isActive: Boolean(p.isActive),
      notes: p.notes,
      ownerName: resolvedOwner,
      occupantName: resolvedOccupant,
      headName: resolvedOccupant,
      residentCount: p.occupancyStatus === 'VACANT' ? 0 : 1,
    };
  });
}

export async function getPropertyByCode(code: string) {
  if (process.env.DATABASE_URL) {
    try {
      const cleanCode = code.trim().toLowerCase();
      const normCode = cleanCode.replace(/[\s\-_]/g, '');
      const altKva = normCode.startsWith('kva') ? 'kava' + normCode.slice(3) : normCode;

      const props = await neonSql`
        SELECT * FROM properties 
        WHERE LOWER(code) = ${cleanCode} 
           OR id = ${code}
           OR REPLACE(REPLACE(LOWER(code), ' ', ''), '-', '') = ${normCode}
           OR REPLACE(REPLACE(LOWER(code), ' ', ''), '-', '') = ${altKva}
        LIMIT 1
      `;
      if (!props.length) return null;
      const prop = props[0];

      const owners = await neonSql`
        SELECT per.* FROM property_ownerships po 
        JOIN persons per ON po.person_id = per.id 
        WHERE po.property_id = ${prop.id} AND po.is_active = true 
        LIMIT 1
      `;
      const owner = owners[0] || null;

      const members = await neonSql`
        SELECT hm.*, per.name, per.phone, per.email 
        FROM occupancies occ
        JOIN household_members hm ON occ.household_id = hm.household_id
        JOIN persons per ON hm.person_id = per.id
        WHERE occ.property_id = ${prop.id} AND occ.is_active = true
      `;

      const vehicles = await neonSql`SELECT * FROM vehicles WHERE property_id = ${prop.id} AND is_active = true`;

      return {
        id: prop.id,
        code: prop.code,
        number: prop.number,
        address: prop.address,
        occupancyStatus: prop.occupancy_status,
        owner,
        members: members.map((m: any) => ({ ...m, person: { name: m.name, phone: m.phone, email: m.email } })),
        vehicles
      };
    } catch (e) {
      console.warn('Neon query error, using local fallback:', e);
    }
  }

  const result = await db.select().from(schema.properties).where(eq(schema.properties.code, code)).limit(1);
  if (!result.length) return null;
  const prop = result[0];
  const ownerships = await db.select().from(schema.propertyOwnerships).where(eq(schema.propertyOwnerships.propertyId, prop.id)).limit(1);
  let owner = null;
  if (ownerships.length && ownerships[0].personId) {
    const p = await db.select().from(schema.persons).where(eq(schema.persons.id, ownerships[0].personId)).limit(1);
    owner = p[0] || null;
  }
  const vehicles = await db.select().from(schema.vehicles).where(eq(schema.vehicles.propertyId, prop.id));

  return {
    ...prop,
    owner,
    members: [],
    vehicles
  };
}

export async function getPropertyStats() {
  if (process.env.DATABASE_URL) {
    try {
      const stats = await neonSql`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN occupancy_status != 'VACANT' THEN 1 END) as occupied,
          COUNT(CASE WHEN occupancy_status = 'VACANT' THEN 1 END) as vacant
        FROM properties
      `;
      const total = Number(stats[0]?.total ?? 0);
      const occupied = Number(stats[0]?.occupied ?? 0);
      const vacant = Number(stats[0]?.vacant ?? 0);
      return {
        total,
        occupied,
        vacant,
        occupiedPercentage: total > 0 ? ((occupied / total) * 100).toFixed(1) : '0.0',
        vacantPercentage: total > 0 ? ((vacant / total) * 100).toFixed(1) : '0.0',
      };
    } catch (e) {
      console.warn('Neon stats error:', e);
    }
  }

  const all = await db.select().from(schema.properties);
  const total = all.length;
  const occupied = all.filter(p => p.occupancyStatus !== 'VACANT').length;
  const vacant = all.filter(p => p.occupancyStatus === 'VACANT').length;
  return {
    total,
    occupied,
    vacant,
    occupiedPercentage: total > 0 ? ((occupied / total) * 100).toFixed(1) : '0.0',
    vacantPercentage: total > 0 ? ((vacant / total) * 100).toFixed(1) : '0.0',
  };
}

export async function getAllVehicles() {
  if (process.env.DATABASE_URL) {
    try {
      const rows = await neonSql`
        SELECT 
          v.id,
          v.plate_number as "plateNumber",
          v.type,
          v.brand,
          v.model,
          v.color,
          v.property_id as "propertyId",
          p.code as "propertyCode",
          per.name as "ownerName"
        FROM vehicles v
        LEFT JOIN properties p ON v.property_id = p.id
        LEFT JOIN persons per ON v.owner_person_id = per.id
        WHERE v.is_active = true
        ORDER BY v.created_at DESC
      `;
      return rows;
    } catch (e) {
      console.warn('Neon vehicles error:', e);
    }
  }

  return await db.select({
    id: schema.vehicles.id,
    plateNumber: schema.vehicles.plateNumber,
    type: schema.vehicles.type,
    brand: schema.vehicles.brand,
    model: schema.vehicles.model,
    color: schema.vehicles.color,
    propertyId: schema.vehicles.propertyId,
    propertyCode: schema.properties.code,
    ownerName: schema.persons.name,
  }).from(schema.vehicles)
    .leftJoin(schema.properties, eq(schema.vehicles.propertyId, schema.properties.id))
    .leftJoin(schema.persons, eq(schema.vehicles.ownerPersonId, schema.persons.id));
}

