import { query } from '../db/operational-query';
import { readPropertyProfile, type PropertyProfile } from '../lib/property-profile';
import { neonSql } from '../db/neon';
import { db, schema } from '../db';
import { eq } from 'drizzle-orm';

export interface PropertyListItem extends PropertyProfile {
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
  legalOwner?: string;
  occupantName?: string;
  headName?: string;
  currentResident?: string;
  displayResident?: string;
  isRented?: boolean;
  statusLabel?: string;
  residentCount?: number;
}

function extractFromNotes(notes: string | null | undefined, field: 'Pemilik' | 'Kepala Keluarga'): string | null {
  if (!notes) return null;
  const match = notes.match(new RegExp(`${field}:\\s*([^|]+)`));
  return match ? match[1].trim() : null;
}

export async function getProperties(propertyId?:string):Promise<PropertyListItem[]> {
  const rows=await query<{id:string;code:string;number:string;address:string;occupancy_status:string;is_active:boolean|number;notes:string|null;
    profile_json:string;block_name:string|null;block_code:string|null;owner_name:string|null;occupant_name:string|null;resident_count:string|number}>(
    "SELECT p.id,p.code,p.number,p.address,p.occupancy_status,p.is_active,p.notes,p.profile_json,b.name AS block_name,b.code AS block_code,"+
    " (SELECT person.name FROM property_ownerships po JOIN persons person ON person.id=po.person_id WHERE po.property_id=p.id AND po.is_active=true AND po.ended_at IS NULL AND person.is_active=true ORDER BY po.started_at DESC,po.id LIMIT 1) AS owner_name,"+
    " (SELECT person.name FROM occupancies o JOIN household_members m ON m.household_id=o.household_id JOIN persons person ON person.id=m.person_id WHERE o.property_id=p.id AND o.is_active=true AND o.ended_at IS NULL AND m.is_active=true AND m.ended_at IS NULL AND person.is_active=true AND m.relationship IN ('HEAD','KEPALA_KELUARGA') ORDER BY o.started_at DESC,m.id LIMIT 1) AS occupant_name,"+
    " (SELECT count(DISTINCT m.id) FROM occupancies o JOIN household_members m ON m.household_id=o.household_id JOIN persons person ON person.id=m.person_id WHERE o.property_id=p.id AND o.is_active=true AND o.ended_at IS NULL AND m.is_active=true AND m.ended_at IS NULL AND person.is_active=true) AS resident_count"+
    ' FROM properties p LEFT JOIN blocks b ON b.id=p.block_id WHERE p.is_active=true'+(propertyId?' AND p.id=?':'')+' ORDER BY p.code,p.id',propertyId?[propertyId]:[]);
  return rows.map(row=>{
    const owner=row.owner_name || extractFromNotes(row.notes,'Pemilik') || undefined;
    const vacant=row.occupancy_status==='VACANT', rented=row.occupancy_status==='RENTED';
    const head=vacant ? undefined : row.occupant_name || extractFromNotes(row.notes,'Kepala Keluarga') || undefined;
    const blockCode=row.block_code || (row.code.startsWith('KAV')?'KAV':row.code.includes('-')?row.code.split('-')[0]:'');
    return {...readPropertyProfile(row.profile_json),id:row.id,code:row.code,number:row.number,address:row.address,
      occupancyStatus:row.occupancy_status,isActive:Boolean(row.is_active),notes:row.notes,blockCode,blockName:row.block_name || (blockCode?'Blok '+blockCode:'Tanpa blok'),
      ownerName:owner,legalOwner:owner,occupantName:head,headName:head,currentResident:head,displayResident:head,
      statusLabel:vacant?'Kosong':rented?'Penyewa / Kontrak':row.occupancy_status==='OWNER_OCCUPIED'?'Dihuni pemilik':undefined,isRented:rented,residentCount:Number(row.resident_count)};
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

