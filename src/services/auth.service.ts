import { neonSql } from '../db/neon';
import { type UserRole, type UserSession } from '../types/auth';
import { client } from '../db';
import { credentialVersion, verifyPassword } from '../lib/passwords';
import { getLocalCredentialHash } from './local-credentials.service';

export * from '../types/auth';

export async function authenticateUser(identifier: string, password: string): Promise<{ success: boolean; user?: UserSession; credentialVersion?: string; error?: string }> {
  const cleanId = identifier.trim().toLowerCase();
  const cleanPass = password;

  // 1. Check in Neon PostgreSQL
  if (process.env.DATABASE_URL) {
    try {
      const normId = cleanId.replace(/[\s\-_]/g, '');
      const altKva = normId.startsWith('kva') ? 'kava' + normId.slice(3) : normId;
      const rawDigits = cleanId.replace(/[^0-9]/g, '');
      const phoneSuffix = rawDigits.length >= 8 ? rawDigits.slice(-8) : '___nomatch___';

      const users = await neonSql`
        SELECT u.* FROM users u
        LEFT JOIN property_ownerships po ON u.property_id = po.property_id AND po.is_active = true
        LEFT JOIN persons per ON (u.person_id = per.id OR po.person_id = per.id)
        WHERE (
          LOWER(u.username) = ${cleanId} 
          OR LOWER(u.email) = ${cleanId} 
          OR LOWER(COALESCE(u.property_code, '')) = ${cleanId}
          OR REPLACE(REPLACE(LOWER(COALESCE(u.property_code, '')), ' ', ''), '-', '') = ${normId}
          OR REPLACE(REPLACE(LOWER(COALESCE(u.property_code, '')), ' ', ''), '-', '') = ${altKva}
          OR REPLACE(REPLACE(LOWER(u.username), ' ', ''), '_', '') = ${normId}
          OR REPLACE(REPLACE(LOWER(u.username), ' ', ''), '_', '') = ${altKva}
          OR (per.phone IS NOT NULL AND per.phone LIKE ${'%' + phoneSuffix})
        )
        AND u.is_active = true
        LIMIT 1
      `;
      if (users.length) {
        const u = users[0];
        if (verifyPassword(cleanPass, u.password_hash)) {
          return {
            success: true,
            credentialVersion: credentialVersion(u.password_hash),
            user: {
              id: u.id,
              username: u.username,
              fullName: u.full_name,
              email: u.email,
              role: u.role as UserRole,
              avatarUrl: u.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
              propertyCode: u.property_code || undefined,
              propertyId: u.property_id || undefined,
            }
          };
        } else {
          return { success: false, error: 'Password atau PIN yang dimasukkan salah.' };
        }
      }
    } catch (e) {
      console.warn('Neon auth query error:', e);
      return { success: false, error: 'Layanan masuk belum bisa dihubungi. Coba lagi.' };
    }
  } else {
    try {
      const rows = await client.execute({
        sql: `SELECT u.*, p.id AS resolved_property_id, p.code AS resolved_property_code FROM users u
          LEFT JOIN user_property_access upa ON upa.user_id = u.id AND upa.ended_at IS NULL
          LEFT JOIN properties p ON p.id = upa.property_id
          WHERE u.is_active = 1 AND (LOWER(u.username) = ? OR LOWER(u.email) = ? OR LOWER(p.code) = ?) LIMIT 1`,
        args: [cleanId, cleanId, cleanId],
      });
      const row = rows.rows[0];
      if (row) {
        const stored = await getLocalCredentialHash(String(row.id)) || row.password_hash?.toString();
        if (verifyPassword(cleanPass, stored)) return { success: true, credentialVersion: credentialVersion(stored!), user: {
          id: String(row.id), username: String(row.username), fullName: String(row.full_name), email: String(row.email), role: row.role as UserRole,
          avatarUrl: row.avatar_url?.toString() || '', propertyId: row.resolved_property_id?.toString(), propertyCode: row.resolved_property_code?.toString(),
        } };
        return { success: false, error: 'Username atau kata sandi tidak sesuai.' };
      }
    } catch { return { success: false, error: 'Layanan masuk lokal belum dikonfigurasi. Hubungi pengurus.' }; }
  }

  return { success: false, error: 'Akun / No. Rumah tidak terdaftar di sistem komplek.' };
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
