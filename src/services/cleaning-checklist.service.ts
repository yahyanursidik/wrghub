import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { query, writeTransaction } from '../db/operational-query';
import type { UserSession } from '../types/auth';
import { idField, operationalAudit, OperationalError, textField } from './operational-mutation';

const categories=['SAMPAH_WARGA','SAPU_JALAN','GOT_DRAINASE','FASUM_TAMAN','TPS_PENGOLAHAN'] as const;
export const taskInput=z.object({taskName:textField(160).min(2),category:z.enum(categories),location:textField(160).min(2),
  assignedTo:textField(160).min(2),notes:textField(1000).optional()});
export const taskUpdate=z.object({id:idField,isCompleted:z.boolean(),expectedCompleted:z.boolean()});
type Row={id:string;task_name:string;category:typeof categories[number];location:string;assigned_to:string;notes:string|null;completed_at:string|null};
function map(row:Row) {
  return {id:row.id,taskName:row.task_name,category:row.category,location:row.location,assignedTo:row.assigned_to,
    notes:row.notes || undefined,isCompleted:Boolean(row.completed_at),completedAt:row.completed_at || undefined};
}
export async function listCleaningTasks() {
  return (await query<Row>('SELECT * FROM cleaning_tasks ORDER BY created_at DESC,id')).map(map);
}
export async function createCleaningTask(input:z.output<typeof taskInput>,actor:UserSession) {
  return writeTransaction(async run=>{
    const id=`task-${randomUUID()}`;
    const [row]=await run<Row>('INSERT INTO cleaning_tasks (id,task_name,category,location,assigned_to,notes,created_at) VALUES (?,?,?,?,?,?,?) RETURNING *',
      [id,input.taskName,input.category,input.location,input.assignedTo,input.notes || null,new Date().toISOString()]);
    await operationalAudit(run,actor,'cleaning.task_create','CLEANING_TASK',id,{category:input.category});
    return map(row);
  });
}
export async function updateCleaningTask(input:z.output<typeof taskUpdate>,actor:UserSession) {
  return writeTransaction(async(run,lock)=>{
    const [old]=await run<Row>('SELECT * FROM cleaning_tasks WHERE id=?'+lock,[input.id]);
    if(!old) throw new OperationalError('Tugas tidak ditemukan.',404);
    if(Boolean(old.completed_at)!==input.expectedCompleted) throw new OperationalError('Status checklist sudah berubah. Muat ulang daftar.');
    if(Boolean(old.completed_at)===input.isCompleted) return map(old);
    const [row]=await run<Row>('UPDATE cleaning_tasks SET completed_at=?,completed_by=? WHERE id=? RETURNING *',
      [input.isCompleted ? new Date().toISOString() : null,input.isCompleted ? actor.id : null,input.id]);
    await operationalAudit(run,actor,'cleaning.task_status','CLEANING_TASK',input.id,{completed:input.isCompleted});
    return map(row);
  });
}
