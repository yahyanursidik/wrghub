import type { APIRoute } from 'astro';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { query, writeTransaction } from '../../../db/operational-query';
import { isResidentRole } from '../../../lib/access-policy';
import { mayManageCredential } from '../../../lib/account-recovery';
import { roleLabels } from '../../../lib/navigation';
import { hashPassword } from '../../../lib/passwords';
import type { UserRole } from '../../../types/auth';
import { canUsePassword } from '../../../services/account-recovery.service';
import { mutation, operationalAudit, OperationalError, textField } from '../../../services/operational-mutation';

const input=z.object({
  username:z.string().trim().toLowerCase().regex(/^[a-z0-9._-]{2,60}$/),fullName:textField(150).min(2),
  role:z.enum(Object.keys(roleLabels) as [UserRole,...UserRole[]]),password:z.string().min(6).max(1024),
  propertyCode:textField(30).optional(),email:z.string().trim().email().max(100).or(z.literal('')).optional(),
});
type Row={id:string;username:string;full_name:string;role:UserRole;property_id:string|null;property_code:string|null;is_active:boolean|number};
export const GET:APIRoute=async ()=>{
  try {
    const rows=process.env.DATABASE_URL
      ? await query<Row>(`SELECT u.id,u.username,u.full_name,u.role,u.is_active,u.property_id,p.code AS property_code FROM users u
          LEFT JOIN properties p ON p.id=u.property_id ORDER BY u.full_name,u.id`)
      : await query<Row>(`SELECT u.id,u.username,u.full_name,u.role,u.is_active,p.id AS property_id,p.code AS property_code
          FROM users u LEFT JOIN properties p ON p.id=(SELECT a.property_id FROM user_property_access a
          WHERE a.user_id=u.id AND a.ended_at IS NULL ORDER BY a.started_at DESC,a.id LIMIT 1) ORDER BY u.full_name,u.id`);
    return Response.json({data:rows.map(row=>({id:row.id,username:row.username,fullName:row.full_name,role:row.role,
      propertyId:row.property_id,propertyCode:row.property_code,isActive:Boolean(row.is_active)}))});
  } catch {return Response.json({error:{message:'Daftar akun belum dapat dimuat.'}},{status:503});}
};

export const POST:APIRoute=mutation(input,async(data,actor)=>{
  if(!mayManageCredential(actor,{id:'new',role:data.role})) throw new OperationalError('Peran ini hanya dapat dibuat oleh super admin.',403);
  if(!canUsePassword(data.password,data.role)) throw new OperationalError('Gunakan kata sandi minimal 12 karakter atau PIN pos yang valid.',400);
  const hash=hashPassword(data.password);
  return writeTransaction(async(run,lock)=>{
    const property=data.propertyCode ? (await run<{id:string;code:string}>('SELECT id,code FROM properties WHERE lower(code)=lower(?) AND is_active=true'+lock,[data.propertyCode]))[0] : undefined;
    if((data.propertyCode || isResidentRole(data.role)) && !property) throw new OperationalError('Pilih rumah aktif untuk akun ini.',400);
    const email=data.email?.toLowerCase() || data.username+'@wargahub.invalid';
    if((await run('SELECT id FROM users WHERE lower(username)=? OR lower(email)=? LIMIT 1',[data.username,email])).length)
      throw new OperationalError('Username atau email sudah digunakan.');
    const id='user-'+randomUUID();
    if(process.env.DATABASE_URL) {
      await run(`INSERT INTO users (id,username,email,full_name,role,password_hash,property_id,property_code,is_active)
        VALUES (?,?,?,?,?,?,?,?,true)`,[id,data.username,email,data.fullName,data.role,hash,property?.id || null,property?.code || null]);
    } else {
      await run('INSERT INTO users (id,username,email,full_name,role,is_active) VALUES (?,?,?,?,?,true)',[id,data.username,email,data.fullName,data.role]);
      await run('INSERT INTO settings (id,key,value,description) VALUES (?,?,?,?)',['credential-'+id,'auth.password.'+id,hash,'Hashed login credential']);
    }
    if(property) await run(`INSERT INTO user_property_access (id,user_id,property_id,relationship,can_view_billing,can_pay,can_edit_occupants,can_view_property,started_at)
      VALUES (?,?,?,?,true,true,?,true,?)`,['access-'+randomUUID(),id,property.id,data.role==='HOUSE_OWNER'?'OWNER':data.role==='HOUSEHOLD_HEAD'?'HEAD':'RESIDENT',
      ['HOUSE_OWNER','HOUSEHOLD_HEAD'].includes(data.role),new Date().toISOString()]);
    await operationalAudit(run,actor,'user.created','USER',id,{username:data.username,role:data.role,propertyId:property?.id});
    return {id,username:data.username,fullName:data.fullName,role:data.role,propertyCode:property?.code || null,isActive:true};
  });
},201);
