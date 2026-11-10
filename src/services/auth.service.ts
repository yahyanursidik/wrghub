import { neonSql } from '../db/neon';
import { type UserRole, type UserSession } from '../types/auth';
import { client } from '../db';
import { credentialVersion, verifyPassword } from '../lib/passwords';
import { getLocalCredentialHash } from './local-credentials.service';

export * from '../types/auth';

export async function authenticateUser(identifier: string, password: string): Promise<{ success: boolean; user?: UserSession; credentialVersion?: string; error?: string }> {
  const cleanId=identifier.trim().toLowerCase();
  const norm=cleanId.replace(/[\s_-]/g,'');
  const alternate=norm.startsWith('kva')?'kava'+norm.slice(3):norm;
  const digits=/^[\d+().\s-]+$/.test(cleanId)?cleanId.replace(/\D/g,''):'';
  const phoneSuffix=digits.length>=10?'%'+digits.slice(-10):null;
  const invalid={success:false,error:'Username, nomor rumah, atau kata sandi tidak sesuai.'};
  if(!cleanId) return invalid;
  try {
    const candidates=process.env.DATABASE_URL
      ? await neonSql`SELECT u.id,u.username,u.email,u.full_name,u.role,u.avatar_url,u.password_hash,u.property_id,
        coalesce(p.code,u.property_code) AS property_code,
        CASE WHEN lower(u.username)=${cleanId} THEN 0 WHEN lower(u.email)=${cleanId} THEN 1 ELSE 2 END AS rank
        FROM users u LEFT JOIN properties p ON p.id=u.property_id
        WHERE u.is_active=true AND (
          lower(u.username)=${cleanId} OR lower(u.email)=${cleanId} OR lower(coalesce(p.code,u.property_code,''))=${cleanId}
          OR regexp_replace(lower(coalesce(p.code,u.property_code,'')), '[ _-]', '', 'g') IN (${norm},${alternate})
          OR regexp_replace(lower(u.username), '[ _-]', '', 'g') IN (${norm},${alternate})
          OR EXISTS (SELECT 1 FROM persons person WHERE person.id=u.person_id AND person.is_active=true
            AND regexp_replace(person.phone,'[^0-9]','','g') LIKE ${phoneSuffix})
        ) ORDER BY rank,u.id LIMIT 13`
      : (await client.execute({
        sql:`SELECT u.*,p.id AS property_id,p.code AS property_code,
          CASE WHEN lower(u.username)=? THEN 0 WHEN lower(u.email)=? THEN 1 ELSE 2 END AS rank FROM users u
          LEFT JOIN properties p ON p.id=(SELECT a.property_id FROM user_property_access a WHERE a.user_id=u.id AND a.ended_at IS NULL ORDER BY a.started_at DESC,a.id LIMIT 1)
          WHERE u.is_active=true AND (lower(u.username)=? OR lower(u.email)=? OR lower(p.code)=?
            OR replace(replace(replace(lower(p.code),' ',''),'-',''),'_','') IN (?,?))
          ORDER BY rank,u.id LIMIT 13`,
        args:[cleanId,cleanId,cleanId,cleanId,cleanId,norm,alternate],
      })).rows;
    if(!candidates.length) return invalid;
    const firstRank=Number(candidates[0].rank);
    const matching=candidates.filter(row=>Number(row.rank)===firstRank);
    if(matching.length>12) return invalid;
    let chosen:{row:typeof candidates[number];hash:string}|undefined;
    for(const row of matching) {
      const stored=process.env.DATABASE_URL ? row.password_hash?.toString()
        : (await getLocalCredentialHash(String(row.id))) || row.password_hash?.toString();
      if(stored && verifyPassword(password,stored)) {
        if(chosen) return {...invalid,error:'Nomor rumah cocok dengan beberapa akun. Masuk dengan username masing-masing.'};
        chosen={row,hash:stored};
      }
    }
    if(!chosen) return invalid;
    const {row,hash}=chosen;
    return {success:true,credentialVersion:credentialVersion(hash),user:{
      id:String(row.id),username:String(row.username),fullName:String(row.full_name),email:String(row.email),role:row.role as UserRole,
      avatarUrl:row.avatar_url?.toString() || '',propertyId:row.property_id?.toString(),propertyCode:row.property_code?.toString(),
    }};
  } catch {
    return {success:false,error:'Layanan masuk belum bisa dihubungi. Coba lagi.'};
  }
}

const PERMISSION_MATRIX: Record<string, UserRole[]> = {
  'property.read': ['SUPER_ADMIN', 'CHAIRMAN', 'SECRETARY', 'TREASURER', 'RESIDENT_ADMIN', 'SECURITY', 'AUDITOR', 'VIEWER'],
  'property.create': ['SUPER_ADMIN', 'CHAIRMAN', 'SECRETARY', 'RESIDENT_ADMIN'],
  'property.update': ['SUPER_ADMIN', 'CHAIRMAN', 'SECRETARY', 'RESIDENT_ADMIN'],
  'person.read': ['SUPER_ADMIN', 'CHAIRMAN', 'SECRETARY', 'RESIDENT_ADMIN', 'SECURITY'],
  'person.update': ['SUPER_ADMIN', 'CHAIRMAN', 'SECRETARY', 'RESIDENT_ADMIN'],
  'billing.read': ['SUPER_ADMIN', 'CHAIRMAN', 'TREASURER', 'AUDITOR'],
  'billing.create': ['SUPER_ADMIN', 'CHAIRMAN', 'TREASURER'],
  'billing.update': ['SUPER_ADMIN', 'CHAIRMAN', 'TREASURER'],
  'payment.read': ['SUPER_ADMIN', 'CHAIRMAN', 'TREASURER', 'AUDITOR'],
  'payment.submit': ['SUPER_ADMIN', 'CHAIRMAN', 'TREASURER', 'HOUSE_OWNER', 'HOUSEHOLD_HEAD', 'RESIDENT'],
  'payment.verify': ['SUPER_ADMIN', 'TREASURER', 'CHAIRMAN'],
  'payment.reverse': ['SUPER_ADMIN', 'TREASURER'],
  'expense.read': ['SUPER_ADMIN', 'CHAIRMAN', 'TREASURER', 'AUDITOR'],
  'expense.create': ['SUPER_ADMIN', 'TREASURER', 'CHAIRMAN'],
  'expense.approve': ['SUPER_ADMIN', 'CHAIRMAN'],
  'ledger.read': ['SUPER_ADMIN', 'CHAIRMAN', 'TREASURER', 'AUDITOR'],
  'report.read': ['SUPER_ADMIN', 'CHAIRMAN', 'SECRETARY', 'TREASURER', 'AUDITOR', 'VIEWER', 'HOUSE_OWNER', 'HOUSEHOLD_HEAD', 'RESIDENT'],
  'report.publish': ['SUPER_ADMIN', 'CHAIRMAN', 'TREASURER'],
  'announcement.create': ['SUPER_ADMIN', 'CHAIRMAN', 'SECRETARY'],
  'announcement.update': ['SUPER_ADMIN', 'CHAIRMAN', 'SECRETARY'],
  'complaint.create': ['SUPER_ADMIN', 'CHAIRMAN', 'SECRETARY', 'HOUSE_OWNER', 'HOUSEHOLD_HEAD', 'RESIDENT'],
  'complaint.manage': ['SUPER_ADMIN', 'CHAIRMAN', 'SECRETARY', 'MAINTENANCE', 'SECURITY'],
  'facility.manage': ['SUPER_ADMIN', 'CHAIRMAN', 'MAINTENANCE'],
  'audit.read': ['SUPER_ADMIN', 'CHAIRMAN', 'AUDITOR'],
};

export function can(user: { role: UserRole } | null | undefined, permission: string): boolean {
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN') return true;
  const allowedRoles = PERMISSION_MATRIX[permission];
  if (!allowedRoles) return false;
  return allowedRoles.includes(user.role);
}

export function getCurrentUser(): UserSession {
  return {
    id: 'usr-admin',
    username: 'admin',
    fullName: 'Pengurus Komplek',
    email: 'admin@wargahub.id',
    role: 'CHAIRMAN',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
  };
}
