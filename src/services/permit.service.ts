import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { query, writeTransaction, type Query } from '../db/operational-query';
import { isResidentRole } from '../lib/access-policy';
import type { PermitItem } from '../types/property-submodules';
import type { UserSession } from '../types/auth';
import { archiveInput, dateField, idField, operationalAudit, OperationalError, requiredIds, textField } from './operational-mutation';

const statuses = ['PENDING_REVIEW','APPROVED','COMPLETED','SUSPENDED'] as const;
type Status = typeof statuses[number];
const fields = z.object({
  ownerName:textField().default(''), workType:textField(120).min(2), contractorName:textField().min(2), contractorPhone:textField(50).default(''),
  workersCount:z.number().int().min(1).max(500), workersList:textField(2000).default(''), startDate:dateField, endDate:dateField,
  allowedHours:textField(120).default(''), depositStatus:textField(60).default(''), depositAmount:z.number().int().nonnegative().max(1e9).default(0),
  description:textField(3000).min(3),
});
export const permitInput = fields.extend({id:idField.optional(),propertyId:idField,status:z.enum(statuses).default('PENDING_REVIEW')})
  .refine(value => value.endDate >= value.startDate,'Tanggal selesai mendahului tanggal mulai.');
export const permitStatus = z.object({id:idField,status:z.enum(statuses),expectedStatus:z.enum(statuses)});
type Row = {id:string;property_id:string;code:string;area:string|null;payload:string;status:Status;issued_at:string};
const lookup = `SELECT r.id,r.property_id,p.code,b.name AS area,r.payload,r.status,r.issued_at FROM renovation_permits r
 JOIN properties p ON p.id=r.property_id LEFT JOIN blocks b ON b.id=p.block_id WHERE r.archived_at IS NULL`;
function map(row:Row): PermitItem {
  return {...fields.parse(JSON.parse(row.payload)),id:row.id,propertyCode:row.code,houseCode:row.code,areaLabel:row.area || row.code,status:row.status,issuedAt:row.issued_at};
}
export async function listPermits(propertyId?:string):Promise<PermitItem[]> {
  return (await query<Row>(lookup + (propertyId ? ' AND r.property_id=?' : '') + ' ORDER BY r.issued_at DESC', propertyId ? [propertyId] : [])).map(map);
}
async function one(run:Query,id:string) {
  const [row] = await run<Row>(lookup + ' AND r.id=?',[id]);
  return map(row);
}
const transitions: Record<Status, readonly Status[]> = {PENDING_REVIEW:['APPROVED','SUSPENDED'],APPROVED:['COMPLETED','SUSPENDED'],COMPLETED:[],SUSPENDED:['APPROVED']};
function canTransition(from:Status,to:Status) { return from === to || transitions[from].includes(to); }

export async function savePermit(input:z.output<typeof permitInput>, actor:UserSession) {
  const resident = isResidentRole(actor.role);
  if (resident && (actor.propertyId !== input.propertyId || input.id || input.status !== 'PENDING_REVIEW')) throw new OperationalError('Warga hanya dapat mengajukan izin baru untuk rumah sendiri.',403);
  return writeTransaction(async(run,lock)=>{
    const [property] = await run('SELECT id FROM properties WHERE id=? AND is_active=true',[input.propertyId]);
    if (!property) throw new OperationalError('Rumah aktif tidak ditemukan.',404);
    const id = input.id || `permit-${randomUUID()}`;
    const data = fields.parse(input);
    if (resident) { data.ownerName = actor.fullName; data.allowedHours = ''; data.depositStatus = ''; data.depositAmount = 0; }
    if (input.id) {
      const [old] = await run<{status:Status;property_id:string}>('SELECT status,property_id FROM renovation_permits WHERE id=? AND archived_at IS NULL' + lock,[id]);
      if (!old || old.property_id !== input.propertyId) throw new OperationalError('Izin tidak ditemukan di rumah ini.',404);
      if (!canTransition(old.status,input.status)) throw new OperationalError('Perubahan status izin tidak diizinkan.');
      await run('UPDATE renovation_permits SET payload=?,status=? WHERE id=?',[JSON.stringify(data),input.status,id]);
    } else {
      if (input.status !== 'PENDING_REVIEW' && input.status !== 'APPROVED') throw new OperationalError('Status awal izin tidak valid.',400);
      await run('INSERT INTO renovation_permits (id,property_id,payload,status,issued_at) VALUES (?,?,?,?,?)',[id,input.propertyId,JSON.stringify(data),input.status,new Date().toISOString()]);
    }
    await operationalAudit(run,actor,input.id ? 'permit.update' : 'permit.create','RENOVATION_PERMIT',id,{propertyId:input.propertyId,status:input.status});
    return one(run,id);
  });
}

export async function changePermitStatus(input:z.output<typeof permitStatus>,actor:UserSession) {
  return writeTransaction(async(run,lock)=>{
    const [old] = await run<{status:Status}>('SELECT status FROM renovation_permits WHERE id=? AND archived_at IS NULL' + lock,[input.id]);
    if (!old) throw new OperationalError('Izin tidak ditemukan.',404);
    if (old.status !== input.expectedStatus || !canTransition(old.status,input.status)) throw new OperationalError('Status izin berubah. Muat ulang daftar.');
    await run('UPDATE renovation_permits SET status=? WHERE id=?',[input.status,input.id]);
    await operationalAudit(run,actor,'permit.status','RENOVATION_PERMIT',input.id,{status:input.status});
    return one(run,input.id);
  });
}

export async function archivePermits(input:z.output<typeof archiveInput>,actor:UserSession) {
  const ids = requiredIds(input);
  return writeTransaction(async run=>{
    for(const id of ids) {
      if (!(await run('UPDATE renovation_permits SET archived_at=? WHERE id=? AND archived_at IS NULL RETURNING id',[new Date().toISOString(),id])).length)
        throw new OperationalError('Izin aktif tidak ditemukan.',404);
      await operationalAudit(run,actor,'permit.archive','RENOVATION_PERMIT',id,{reason:input.reason || null});
    }
    return {ids};
  });
}
