import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { query, writeTransaction, type Query } from '../db/operational-query';
import { monthBounds } from '../lib/cash-data';
import type { UserSession } from '../types/auth';
import { idField, operationalAudit, textField } from './operational-mutation';

export const patrolConditions=['AMAN_KONDUSIF','LAMPU_PJU_MATI','PORTAL_TERBUKA','MENCURIGAKAN','HEWAN_LIAR','LAINNYA'] as const;
export const patrolInput=z.object({checkpointName:textField(160).pipe(z.string().min(2)),checkpointCode:textField(30).pipe(z.string().min(1)),
  guardName:textField(120).pipe(z.string().min(2)),guardId:idField.optional(),condition:z.enum(patrolConditions),notes:textField(750).optional()});
export type RecordedPatrol={id:string;checkpointName:string;checkpointCode:string;guardName:string;guardId:string;
  condition:typeof patrolConditions[number];notes:string;recordedAt:string;displayTime:string;displayDate:string};

export function recordedTime(value:Date|string) {
  return value instanceof Date ? value : new Date(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(value)?value.replace(' ','T')+'Z':value);
}
export function jakartaMonthTimes(month:string) {
  return monthBounds(month).map(day=>new Date(day+'T00:00:00+07:00').toISOString());
}
/** PostgreSQL uses timestamptz; SQLite can contain both ISO and CURRENT_TIMESTAMP text. */
export const monthTimeSql=(column:'created_at')=>process.env.DATABASE_URL ? `${column}>=? AND ${column}<?` :
  `julianday(${column})>=julianday(?) AND julianday(${column})<julianday(?)`;
const timeFormat=new Intl.DateTimeFormat('id-ID',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Jakarta'});
const dateFormat=new Intl.DateTimeFormat('id-ID',{day:'numeric',month:'short',year:'numeric',timeZone:'Asia/Jakarta'});
const dateFields=(date:Date)=>({recordedAt:date.toISOString(),displayTime:timeFormat.format(date)+' WIB',displayDate:dateFormat.format(date)});

export async function recordPatrol(input:z.output<typeof patrolInput>,actor:UserSession):Promise<RecordedPatrol> {
  const now=new Date();
  const patrol={...input,id:`pat-${randomUUID()}`,guardId:input.guardId || '',notes:input.notes || '',...dateFields(now)};
  await writeTransaction(run=>operationalAudit(run,actor,'security.record_patrol','PATROL_LOG',patrol.id,{
    checkpoint:input.checkpointName,checkpointCode:input.checkpointCode,guardName:input.guardName,guardId:patrol.guardId,condition:input.condition,notes:patrol.notes,
  }));
  return patrol;
}

export async function getRecordedPatrols(month?:string):Promise<RecordedPatrol[]> {
  const rows=await query<{entity_id:string;actor_name:string;created_at:string|Date;new_value_json:string|null}>(`SELECT entity_id,actor_name,created_at,new_value_json FROM audit_logs
    WHERE action='security.record_patrol' AND entity_type='PATROL_LOG' ${month?'AND '+monthTimeSql('created_at'):''}
    ORDER BY created_at DESC,id DESC LIMIT 120`,month?jakartaMonthTimes(month):[]);
  return rows.flatMap(row=>{
    const date=recordedTime(row.created_at);
    if (!Number.isFinite(date.getTime())) return [];
    try {
      const data=JSON.parse(row.new_value_json || '{}');
      if (typeof data.checkpoint!=='string' || !patrolConditions.includes(data.condition)) return [];
      return [{id:row.entity_id,checkpointName:data.checkpoint,checkpointCode:typeof data.checkpointCode==='string'?data.checkpointCode:'—',
        guardName:typeof data.guardName==='string'?data.guardName:row.actor_name,guardId:typeof data.guardId==='string'?data.guardId:'',
        condition:data.condition,notes:typeof data.notes==='string'?data.notes:'',...dateFields(date)}];
    } catch { return []; }
  });
}

export async function countRecordedPatrols(month:string,run:Query=query) {
  const [row]=await run<{count:number|string}>(`SELECT COUNT(*) AS count FROM audit_logs WHERE action='security.record_patrol'
    AND entity_type='PATROL_LOG' AND ${monthTimeSql('created_at')}`,jakartaMonthTimes(month));
  return Number(row.count);
}
