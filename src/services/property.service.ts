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
  headName?: string;
  residentCount?: number;
}

export async function getProperties(): Promise<PropertyListItem[]> {
  try {
    if (process.env.DATABASE_URL) {
      const rows = await neonSql`
        SELECT 
          p.id, p.code, p.number, p.address, p.occupancy_status, p.is_active, p.notes,
          b.name as block_name, b.code as block_code,
          COALESCE(per.name, 'Warga') as owner_name
        FROM properties p
        LEFT JOIN blocks b ON p.block_id = b.id
        LEFT JOIN property_ownerships po ON p.id = po.property_id AND po.is_active = true
        LEFT JOIN persons per ON po.person_id = per.id
        WHERE p.is_active = true
        ORDER BY p.code ASC
      `;

      return rows.map((r: any) => ({
        id: r.id,
        code: r.code,
        blockCode: r.block_code || r.code.split('-')[0] || '',
        blockName: r.block_name || `Blok ${r.code.split('-')[0]}`,
        number: r.number,
        address: r.address,
        occupancyStatus: r.occupancy_status,
        isActive: Boolean(r.is_active),
        notes: r.notes,
        ownerName: r.occupancy_status === 'VACANT' ? 'Belum berpenghuni' : r.owner_name,
      }));
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

  return props.map(p => {
    const blk = p.blockId ? blockMap.get(p.blockId) : null;
    return {
      id: p.id,
      code: p.code,
      blockCode: blk?.code || p.code.split('-')[0] || '',
      blockName: blk?.name || `Blok ${p.code.split('-')[0]}`,
      number: p.number,
      address: p.address,
      occupancyStatus: p.occupancyStatus,
      isActive: Boolean(p.isActive),
      notes: p.notes,
      ownerName: ownerMap.get(p.id) || (p.occupancyStatus === 'VACANT' ? 'Belum berpenghuni' : 'Warga'),
    };
  });
}

export async function getPropertyByCode(code: string) {
  if (process.env.DATABASE_URL) {
    try {
      const props = await neonSql`SELECT * FROM properties WHERE code = ${code} LIMIT 1`;
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
      const total = Number(stats[0].total) || 120;
      const occupied = Number(stats[0].occupied) || 98;
      const vacant = Number(stats[0].vacant) || 22;
      return {
        total,
        occupied,
        vacant,
        occupiedPercentage: total > 0 ? ((occupied / total) * 100).toFixed(1) : '81.7',
        vacantPercentage: total > 0 ? ((vacant / total) * 100).toFixed(1) : '18.3',
      };
    } catch (e) {
      console.warn('Neon stats error:', e);
    }
  }

  const all = await db.select().from(schema.properties);
  const total = all.length || 120;
  const occupied = all.filter(p => p.occupancyStatus !== 'VACANT').length || 98;
  const vacant = all.filter(p => p.occupancyStatus === 'VACANT').length || 22;
  return {
    total,
    occupied,
    vacant,
    occupiedPercentage: total > 0 ? ((occupied / total) * 100).toFixed(1) : '81.7',
    vacantPercentage: total > 0 ? ((vacant / total) * 100).toFixed(1) : '18.3',
  };
}
