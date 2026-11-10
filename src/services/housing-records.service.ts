import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { writeTransaction, type Query } from '../db/operational-query';
import { isResidentRole } from '../lib/access-policy';
import { definedProfile, profileFields, readPropertyProfile } from '../lib/property-profile';
import type { UserSession } from '../types/auth';
import { getProperties } from './property.service';
import { archiveInput, idField, operationalAudit, OperationalError, requiredIds, textField } from './operational-mutation';

const statuses=['OWNER_OCCUPIED','RENTED','BORROWED','VACANT','RENOVATION','FOR_SALE','OTHER'] as const;
const houseCode=textField(30).min(1);
const fields=profileFields.extend({
  number:textField(20).min(1).optional(),address:textField(600).min(2).optional(),blockName:textField(100).optional(),
  occupancyStatus:z.enum(statuses).optional(),ownerName:textField(150).optional(),occupantName:textField(150).optional(),
  headName:textField(150).optional(),notes:textField(2000).optional(),
});
export const newProperty=fields.extend({code:houseCode,address:textField(600).min(2),occupancyStatus:z.enum(statuses).default('OWNER_OCCUPIED')});
export const patchProperty=fields.extend({id:idField.optional(),propertyId:idField.optional(),code:houseCode.optional(),propertyCode:houseCode.optional()});
export const propertyArchive=archiveInput.extend({propertyId:idField.optional(),code:houseCode.optional(),propertyCode:houseCode.optional()});
type PropertyRow={id:string;code:string;community_id:string;block_id:string|null;occupancy_status:string;profile_json:string;address:string;number:string;notes:string|null};
const today=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
function tenancy(status:string) { return status==='RENTED'?'TENANT':status==='BORROWED'?'GUEST':'OWNER'; }
async function block(run:Query,communityId:string,name:string|undefined) {
  if(!name) return null;
  const [existing]=await run<{id:string}>('SELECT id FROM blocks WHERE community_id=? AND (lower(name)=lower(?) OR lower(code)=lower(?)) ORDER BY id LIMIT 1',[communityId,name,name]);
  if(existing) return existing.id;
  throw new OperationalError('Pilih blok yang sudah terdaftar atau kosongkan blok.',400);
}
async function updateOwner(run:Query,propertyId:string,name:string) {
  const [previous]=await run<{name:string}>('SELECT p.name FROM property_ownerships o JOIN persons p ON p.id=o.person_id WHERE o.property_id=? AND o.is_active=true AND o.ended_at IS NULL ORDER BY o.started_at DESC,o.id LIMIT 1',[propertyId]);
  if(previous?.name===name) return;
  const person='person-'+randomUUID();
  await run('INSERT INTO persons (id,name,is_active) VALUES (?,?,true)',[person,name]);
  await run('UPDATE property_ownerships SET is_active=false,ended_at=? WHERE property_id=? AND is_active=true AND ended_at IS NULL',[today(),propertyId]);
  await run('INSERT INTO property_ownerships (id,property_id,person_id,is_active,started_at) VALUES (?,?,?,true,?)',['own-'+randomUUID(),propertyId,person,today()]);
}
async function syncHead(run:Query,propertyId:string,name:string|undefined,status:string) {
  const [head]=await run<{person_id:string;name:string}>(`SELECT m.person_id,p.name FROM occupancies o JOIN household_members m ON m.household_id=o.household_id
    JOIN persons p ON p.id=m.person_id WHERE o.property_id=? AND o.is_active=true AND o.ended_at IS NULL
    AND m.is_active=true AND m.ended_at IS NULL AND m.relationship IN ('HEAD','KEPALA_KELUARGA') ORDER BY m.id LIMIT 1`,[propertyId]);
  if(status==='VACANT') {
    const members=await run(`SELECT m.id FROM occupancies o JOIN household_members m ON m.household_id=o.household_id
      WHERE o.property_id=? AND o.is_active=true AND o.ended_at IS NULL AND m.is_active=true AND m.ended_at IS NULL LIMIT 1`,[propertyId]);
    if(members.length) throw new OperationalError('Arsipkan atau pindahkan penghuni aktif sebelum menandai rumah kosong.');
    await run('UPDATE occupancies SET is_active=false,ended_at=? WHERE property_id=? AND is_active=true AND ended_at IS NULL',[today(),propertyId]);
    return;
  }
  await run('UPDATE occupancies SET type=? WHERE property_id=? AND is_active=true AND ended_at IS NULL',[tenancy(status),propertyId]);
  if(!name) return;
  if(head) {
    if(head.name!==name) await run('UPDATE persons SET name=?,updated_at=? WHERE id=?',[name,new Date().toISOString(),head.person_id]);
    return;
  }
  let [occupancy]=await run<{household_id:string}>('SELECT household_id FROM occupancies WHERE property_id=? AND is_active=true AND ended_at IS NULL AND household_id IS NOT NULL ORDER BY started_at DESC,id LIMIT 1',[propertyId]);
  if(!occupancy) {
    occupancy={household_id:'hh-'+randomUUID()};
    await run('INSERT INTO households (id,name) VALUES (?,?)',[occupancy.household_id,'Keluarga '+name]);
    await run('INSERT INTO occupancies (id,property_id,household_id,type,is_active,started_at) VALUES (?,?,?,?,true,?)',
      ['occ-'+randomUUID(),propertyId,occupancy.household_id,tenancy(status),today()]);
  }
  const person='person-'+randomUUID();
  await run('INSERT INTO persons (id,name,is_active) VALUES (?,?,true)',[person,name]);
  await run("INSERT INTO household_members (id,household_id,person_id,relationship,is_active,started_at) VALUES (?,?,?,'HEAD',true,?)",
    ['hm-'+randomUUID(),occupancy.household_id,person,today()]);
}
export async function createProperty(data:z.output<typeof newProperty>,actor:UserSession) {
  const id=await writeTransaction(async(run,lock)=>{
    const community='comm-01';
    if (!(await run('SELECT id FROM communities WHERE id=?'+lock,[community])).length) throw new OperationalError('Profil lingkungan belum tersedia.');
    if ((await run('SELECT id FROM properties WHERE lower(code)=lower(?) LIMIT 1',[data.code])).length) throw new OperationalError('Kode rumah sudah digunakan, termasuk pada riwayat arsip.');
    const id='prop-'+randomUUID();
    const blockId=await block(run,community,data.blockName);
    await run(`INSERT INTO properties (id,community_id,block_id,code,number,address,occupancy_status,is_active,notes,profile_json)
      VALUES (?,?,?,?,?,?,?,true,?,?)`,[id,community,blockId,data.code.toUpperCase(),data.number||data.code,data.address,data.occupancyStatus,data.notes||null,JSON.stringify(definedProfile(data))]);
    if(data.ownerName) await updateOwner(run,id,data.ownerName);
    await syncHead(run,id,data.occupantName || data.headName,data.occupancyStatus);
    await operationalAudit(run,actor,'property.create','PROPERTY',id,{code:data.code,occupancyStatus:data.occupancyStatus});
    return id;
  });
  return (await getProperties(id))[0];
}
export async function updateProperty(data:z.output<typeof patchProperty>,actor:UserSession) {
  const resident=isResidentRole(actor.role);
  if(actor.role==='RESIDENT') throw new OperationalError('Spesifikasi rumah hanya dapat diubah pemilik atau kepala keluarga.',403);
  if(resident && ['number','blockName','occupancyStatus','ownerName','occupantName','headName','notes'].some(key=>key in data))
    throw new OperationalError('Perubahan kepemilikan dan status hunian dilakukan pengurus.',403);
  const targetId=data.id || data.propertyId;
  const code=data.code || data.propertyCode;
  if(!targetId && !code) throw new OperationalError('Pilih rumah yang terdaftar.',400);
  const id=await writeTransaction(async(run,lock)=>{
    const [current]=await run<PropertyRow>('SELECT * FROM properties WHERE '+(targetId?'id=?':'lower(code)=lower(?)')+' AND is_active=true'+lock,[targetId||code!]);
    if(!current) throw new OperationalError('Rumah tidak ditemukan.',404);
    if([data.id,data.propertyId].some(value=>value!==undefined && value!==current.id) ||
      [data.code,data.propertyCode].some(value=>value!==undefined && value.toLowerCase()!==current.code.toLowerCase()))
      throw new OperationalError('ID dan kode rumah tidak cocok.',400);
    if(resident && current.id!==actor.propertyId) throw new OperationalError('Akun tidak terhubung dengan rumah ini.',403);
    const status=data.occupancyStatus || current.occupancy_status;
    const blockId=data.blockName===undefined ? current.block_id : await block(run,current.community_id,data.blockName);
    const profile={...readPropertyProfile(current.profile_json),...definedProfile(data)};
    await run('UPDATE properties SET number=?,address=?,block_id=?,occupancy_status=?,notes=?,profile_json=?,updated_at=? WHERE id=?',
      [data.number ?? current.number,data.address ?? current.address,blockId,status,data.notes ?? current.notes,JSON.stringify(profile),new Date().toISOString(),current.id]);
    if(!resident && data.ownerName) await updateOwner(run,current.id,data.ownerName);
    if(!resident && (data.occupancyStatus || data.occupantName || data.headName)) await syncHead(run,current.id,data.occupantName || data.headName,status);
    await operationalAudit(run,actor,'property.update','PROPERTY',current.id,{fields:Object.keys(data).filter(key=>!['id','code','propertyId','propertyCode'].includes(key))});
    return current.id;
  });
  return (await getProperties(id))[0];
}
export async function archiveProperties(data:z.output<typeof propertyArchive>,actor:UserSession) {
  return writeTransaction(async(run,lock)=>{
    const ids=requiredIds({...data,id:data.id||data.propertyId}).sort();
    for(const id of ids) {
      const [house]=await run<{code:string}>('SELECT code FROM properties WHERE id=? AND is_active=true'+lock,[id]);
      if(!house) throw new OperationalError('Rumah aktif tidak ditemukan.',404);
      if([data.code,data.propertyCode].some(value=>value!==undefined && value.toLowerCase()!==house.code.toLowerCase())) throw new OperationalError('ID dan kode rumah tidak cocok.',400);
      const links=await run(`SELECT 1 FROM user_property_access a JOIN users u ON u.id=a.user_id WHERE a.property_id=? AND a.ended_at IS NULL AND u.is_active=true
        UNION ALL SELECT 1 FROM occupancies o JOIN household_members m ON o.household_id=m.household_id WHERE o.property_id=? AND o.is_active=true AND o.ended_at IS NULL AND m.is_active=true AND m.ended_at IS NULL
        UNION ALL SELECT 1 FROM vehicles WHERE property_id=? AND is_active=true
        UNION ALL SELECT 1 FROM renovation_permits WHERE property_id=? AND archived_at IS NULL AND status IN ('PENDING_REVIEW','APPROVED')
        UNION ALL SELECT 1 FROM invoices WHERE property_id=? AND status IN ('UNPAID','PARTIAL','PARTIALLY_PAID','OVERDUE','PENDING_VERIFICATION') LIMIT 1`,[id,id,id,id,id]);
      if(links.length) throw new OperationalError('Rumah '+house.code+' masih terhubung ke akun, penghuni, kendaraan, izin aktif, atau tagihan terbuka.');
      if(process.env.DATABASE_URL && (await run('SELECT id FROM users WHERE property_id=? AND is_active=true LIMIT 1',[id])).length)
        throw new OperationalError('Rumah '+house.code+' masih memiliki akun aktif.');
      await run('UPDATE properties SET is_active=false,updated_at=? WHERE id=?',[new Date().toISOString(),id]);
      await operationalAudit(run,actor,'property.archive','PROPERTY',id,{reason:data.reason||null});
    }
    return {ids,deletedCount:ids.length};
  });
}
