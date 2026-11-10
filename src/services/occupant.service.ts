import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { query, writeTransaction, type Query } from '../db/operational-query';
import { isResidentRole } from '../lib/access-policy';
import type { ResidentItem } from '../types/property-submodules';
import type { UserSession } from '../types/auth';
import { archiveInput, idField, operationalAudit, OperationalError, requiredIds, textField } from './operational-mutation';

const relations = ['KEPALA_KELUARGA','ISTRI','ANAK','ORANG_TUA','FAMILI_LAIN','ART','PENYEWA'] as const;
const toDatabase = { KEPALA_KELUARGA:'HEAD', ISTRI:'SPOUSE', ANAK:'CHILD', ORANG_TUA:'PARENT', FAMILI_LAIN:'OTHER', ART:'DOMESTIC_HELPER', PENYEWA:'TENANT' } as const;
const fromDatabase: Record<string, ResidentItem['relation']> = Object.fromEntries(Object.entries(toDatabase).map(([k,v]) => [v,k])) as Record<string, ResidentItem['relation']>;
const profile = z.object({
  gender: z.enum(['LAKI_LAKI','PEREMPUAN','']).default(''), birthPlaceDate: textField(100).default(''),
  religion: textField(60).default(''), occupation: textField(100).default(''), idCard: textField(30).default(''),
  familyCard: textField(30).default(''), domicileStatus: z.enum(['KTP_SETEMPAT','KTP_LUAR_DAERAH','SURAT_DOMISILI','']).default(''),
  bloodType: z.enum(['A','B','AB','O','']).default(''), isEmergency: z.boolean().default(false), notes: textField(1000).default(''),
});
export const occupantInput = profile.extend({
  id: idField.optional(), propertyId: idField, fullName: textField().min(2),
  relation: z.enum([...relations,'ART_SUPIR']).transform(value => value === 'ART_SUPIR' ? 'ART' : value),
  phone: textField(50).default(''), email: textField(100).default(''), idCardNumber: textField(30).optional(), isEmergencyContact: z.boolean().optional(),
});
export const occupantArchive = archiveInput.extend({ propertyId: idField.optional(), occupantId: idField.optional() });
type Row = { id:string; property_id:string; code:string; area:string|null; name:string; relationship:string; phone:string|null; email:string|null; profile_json:string };
const lookup = `SELECT m.id, o.property_id, p.code, b.name AS area, person.name, m.relationship, person.phone, person.email, m.profile_json
  FROM household_members m JOIN occupancies o ON o.household_id = m.household_id AND o.is_active = true AND o.ended_at IS NULL
  JOIN properties p ON p.id = o.property_id AND p.is_active = true
  JOIN persons person ON person.id = m.person_id AND person.is_active = true LEFT JOIN blocks b ON b.id = p.block_id
  WHERE m.is_active = true AND m.ended_at IS NULL`;

function mapRow(row: Row): ResidentItem {
  let parsed: unknown;
  try { parsed = JSON.parse(row.profile_json); } catch { parsed = {}; }
  const result = profile.safeParse(parsed);
  return { ...profile.parse({}), ...(result.success ? result.data : {}),
    id:row.id, propertyId:row.property_id, houseCode:row.code, areaLabel:row.area || row.code,
    fullName:row.name, relation:fromDatabase[row.relationship] || (relations.includes(row.relationship as typeof relations[number]) ? row.relationship as ResidentItem['relation'] : 'FAMILI_LAIN'),
    phone:row.phone || '', email:row.email || '' };
}

export async function listOccupants(propertyId?: string): Promise<ResidentItem[]> {
  const rows = await query<Row>(lookup + (propertyId ? ' AND o.property_id = ?' : '') + ' ORDER BY p.code, person.name, m.id', propertyId ? [propertyId] : []);
  return rows.map(mapRow);
}

export async function saveOccupant(input: z.output<typeof occupantInput>, actor: UserSession) {
  if (isResidentRole(actor.role) && (actor.propertyId !== input.propertyId || input.id)) throw new OperationalError('Perubahan penghuni ini hanya dapat dilakukan pengurus.',403);
  return writeTransaction(async (run, lock) => {
    const [property] = await run<{id:string;code:string;occupancy_status:string}>('SELECT id,code,occupancy_status FROM properties WHERE id = ? AND is_active = true' + lock,[input.propertyId]);
    if (!property) throw new OperationalError('Rumah aktif tidak ditemukan.',404);
    let [occupancy] = await run<{household_id:string}>(`SELECT household_id FROM occupancies WHERE property_id = ? AND is_active = true AND ended_at IS NULL
      AND household_id IS NOT NULL ORDER BY started_at DESC,id LIMIT 1`,[property.id]);
    const now = new Date().toISOString();
    const today = now.slice(0,10);
    const existing = input.id ? (await run<{household_id:string;person_id:string}>(`SELECT m.household_id,m.person_id FROM household_members m
      JOIN occupancies o ON o.household_id=m.household_id WHERE m.id=? AND o.property_id=? AND m.is_active=true AND o.is_active=true
      AND m.ended_at IS NULL AND o.ended_at IS NULL`,[input.id,property.id]))[0] : undefined;
    if (input.id && !existing) throw new OperationalError('Penghuni aktif tidak ditemukan di rumah ini.',404);
    if (input.relation === 'KEPALA_KELUARGA') {
      const duplicate = await run(`SELECT m.id FROM household_members m JOIN occupancies o ON o.household_id=m.household_id
        WHERE o.property_id=? AND o.is_active=true AND o.ended_at IS NULL AND m.is_active=true AND m.ended_at IS NULL
        AND m.relationship IN ('HEAD','KEPALA_KELUARGA') AND m.id <> ?`,[property.id,input.id || '']);
      if (duplicate.length) throw new OperationalError('Rumah ini sudah memiliki kepala keluarga aktif.');
    }
    if (!occupancy) {
      occupancy = {household_id:`hh-${randomUUID()}`};
      await run('INSERT INTO households (id,name) VALUES (?,?)',[occupancy.household_id, 'Rumah ' + property.code]);
      await run('INSERT INTO occupancies (id,property_id,household_id,type,started_at,is_active) VALUES (?,?,?,?,?,true)',
        [`occ-${randomUUID()}`,property.id,occupancy.household_id,property.occupancy_status === 'RENTED' ? 'TENANT' : 'OWNER',today]);
    }
    const id = input.id || `hm-${randomUUID()}`;
    const personId = existing?.person_id || `person-${randomUUID()}`;
    const details = JSON.stringify(profile.parse({...input,idCard:input.idCardNumber ?? input.idCard,isEmergency:input.isEmergencyContact ?? input.isEmergency}));
    if (existing) {
      await run('UPDATE persons SET name=?,phone=?,email=?,updated_at=? WHERE id=?',[input.fullName,input.phone || null,input.email || null,now,personId]);
      await run('UPDATE household_members SET relationship=?,profile_json=? WHERE id=?',[toDatabase[input.relation],details,id]);
    } else {
      await run('INSERT INTO persons (id,name,phone,email,is_active) VALUES (?,?,?,?,true)',[personId,input.fullName,input.phone || null,input.email || null]);
      await run('INSERT INTO household_members (id,household_id,person_id,relationship,started_at,is_active,profile_json) VALUES (?,?,?,?,?,true,?)',
        [id,occupancy.household_id,personId,toDatabase[input.relation],today,details]);
    }
    await operationalAudit(run,actor,input.id ? 'occupant.update' : 'occupant.create','HOUSEHOLD_MEMBER',id,{propertyId:property.id,relationship:input.relation});
    const [row] = await run<Row>(lookup + ' AND o.property_id=? AND m.id=?',[property.id,id]);
    return mapRow(row);
  });
}

export async function archiveOccupants(input: z.output<typeof occupantArchive>, actor: UserSession) {
  const ids = requiredIds({...input, id:input.id || input.occupantId});
  const resident = isResidentRole(actor.role);
  if (resident && (!['HOUSE_OWNER','HOUSEHOLD_HEAD'].includes(actor.role) || input.propertyId !== actor.propertyId || ids.length !== 1))
    throw new OperationalError('Akun tidak dapat mengarsipkan penghuni ini.',403);
  return writeTransaction(async (run,lock) => {
    for (const id of ids) {
      const [record] = await run<{relationship:string}>(`SELECT relationship FROM household_members WHERE id=? AND is_active=true AND ended_at IS NULL
        ${resident ? 'AND EXISTS (SELECT 1 FROM occupancies WHERE household_id=household_members.household_id AND property_id=? AND is_active=true AND ended_at IS NULL)' : ''}` + lock,
        resident ? [id,actor.propertyId!] : [id]);
      if (!record) throw new OperationalError('Penghuni aktif tidak ditemukan.',404);
      if (resident && ['HEAD','KEPALA_KELUARGA'].includes(record.relationship)) throw new OperationalError('Hubungi pengurus untuk mengganti kepala keluarga.',403);
      await run('UPDATE household_members SET is_active=false,ended_at=? WHERE id=?',[new Date().toISOString().slice(0,10),id]);
      await operationalAudit(run,actor,'occupant.archive','HOUSEHOLD_MEMBER',id,{reason:input.reason || null});
    }
    return {ids};
  });
}
