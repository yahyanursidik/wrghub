import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { query, writeTransaction, type Query } from '../db/operational-query';
import type { UserSession } from '../types/auth';
import { archiveInput, idField, operationalAudit, OperationalError, requiredIds, textField } from './operational-mutation';

const conditions = ['GOOD','NEEDS_REPAIR','UNDER_MAINTENANCE','DAMAGED'] as const;
const fields = z.object({
  name:textField().min(2), code:textField(50).min(2).transform(value=>value.toUpperCase()), category:textField(50).min(2),
  location:textField().min(2), capacity:z.number().int().nonnegative().max(1e6).nullable().optional(),
  hourlyRate:z.number().int().nonnegative().max(1e9).nullable().optional(), operatingHours:textField(120).optional(),
  picName:textField(120).optional(), notes:textField(2000).nullable().optional(),
  condition:z.enum(conditions).default('GOOD'),
});
export const facilityCreate = fields;
export const facilityUpdate = fields.partial().extend({id:idField}).refine(value=>Object.keys(value).length > 1,'Tidak ada perubahan fasilitas.');
type Row = {id:string;name:string;code:string;category:string;location:string;capacity:number|null;hourly_rate:number|string|null;
  operating_hours:string|null;pic_name:string|null;condition:typeof conditions[number];notes:string|null};
const select = `SELECT id,name,code,category,location,capacity,hourly_rate,operating_hours,pic_name,condition,notes FROM facilities WHERE archived_at IS NULL`;
function map(row:Row) {
  return {id:row.id,name:row.name,code:row.code,category:row.category,location:row.location,
    capacity:row.capacity ?? undefined,hourlyRate:row.hourly_rate == null ? undefined : Number(row.hourly_rate),
    operatingHours:row.operating_hours ?? undefined,picName:row.pic_name || '',condition:row.condition,notes:row.notes};
}
export async function listCatalog() { return (await query<Row>(select + ' ORDER BY code,id')).map(map); }
export async function countCatalogRepairs() {
  const [row] = await query<{total:number|string}>(`SELECT count(*) AS total FROM facilities WHERE archived_at IS NULL AND condition <> 'GOOD'`);
  return Number(row.total);
}
async function one(run:Query,id:string) {
  const [row]=await run<Row>(select + ' AND id=?',[id]);
  if(!row) throw new OperationalError('Fasilitas aktif tidak ditemukan.',404);
  return map(row);
}
function authorize(actor:UserSession) {
  if (!['SUPER_ADMIN','CHAIRMAN','SECRETARY','MAINTENANCE'].includes(actor.role)) throw new OperationalError('Akun tidak dapat mengubah katalog.',403);
}
export async function saveFacility(input:z.output<typeof facilityCreate> | z.output<typeof facilityUpdate>,actor:UserSession) {
  authorize(actor);
  return writeTransaction(async(run,lock)=>{
    const id = 'id' in input ? input.id : `fac-${randomUUID()}`;
    const old = 'id' in input ? (await run<Row>(select + ' AND id=?' + lock,[id]))[0] : undefined;
    if ('id' in input && !old) throw new OperationalError('Fasilitas aktif tidak ditemukan.',404);
    const data = fields.parse({...old && map(old), ...input});
    const duplicate = await run('SELECT id FROM facilities WHERE code=? AND id<>?',[data.code,id]);
    if(duplicate.length) throw new OperationalError('Kode fasilitas sudah digunakan.');
    const values = [data.name,data.code,data.category,data.location,data.capacity ?? null,data.hourlyRate ?? null,data.operatingHours || null,data.picName || null,data.condition,data.notes || null];
    if (old) {
      await run('UPDATE facilities SET name=?,code=?,category=?,location=?,capacity=?,hourly_rate=?,operating_hours=?,pic_name=?,condition=?,notes=?,updated_at=? WHERE id=?',
        [...values,new Date().toISOString(),id]);
    } else {
      await run('INSERT INTO facilities (id,community_id,name,code,category,location,capacity,hourly_rate,operating_hours,pic_name,condition,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
        [id,'comm-01',...values]);
    }
    await operationalAudit(run,actor,old ? 'facility.update':'facility.create','FACILITY',id,{code:data.code,condition:data.condition});
    return one(run,id);
  });
}
export async function archiveFacilities(input:z.output<typeof archiveInput>,actor:UserSession) {
  authorize(actor);
  const ids=requiredIds(input).sort();
  return writeTransaction(async(run,lock)=>{
    const today = new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
    for(const id of ids) {
      if(!(await run(select + ' AND id=?' + lock,[id])).length) throw new OperationalError('Fasilitas aktif tidak ditemukan.',404);
      const active=await run(`SELECT id FROM maintenance_requests WHERE facility_id=? AND title LIKE 'Reservasi:%'
        AND status IN ('PLANNED','IN_PROGRESS') AND (scheduled_date IS NULL OR scheduled_date>=?) LIMIT 1`,[id,today]);
      if(active.length) throw new OperationalError('Selesaikan atau tolak reservasi aktif sebelum mengarsipkan fasilitas.');
      await run('UPDATE facilities SET archived_at=?,updated_at=? WHERE id=?',[new Date().toISOString(),new Date().toISOString(),id]);
      await operationalAudit(run,actor,'facility.archive','FACILITY',id,{reason:input.reason || null});
    }
    return {ids};
  });
}
