import { neonSql } from '../db/neon';
import { client } from '../db';
import type { UserRole, UserSession } from '../types/auth';
import { credentialVersion } from '../lib/passwords';
import { getLocalCredentialHash } from './local-credentials.service';
import { roleLabels } from '../lib/navigation';

/** Revalidate the real account, role and credential version on private requests. */
export async function resolveSessionPrincipal(previous: UserSession, version: string | undefined): Promise<UserSession | undefined> {
  if (!version) return undefined;
  let row: any;
  let stored: string | undefined;
  if (process.env.DATABASE_URL) {
    const rows = await neonSql`SELECT id, username, email, full_name, role, avatar_url, property_id, property_code, password_hash, is_active FROM users WHERE id = ${previous.id} LIMIT 1`;
    row = rows[0]; stored = row?.password_hash;
  } else {
    const result = await client.execute({ sql: `SELECT u.*, p.id AS property_id, p.code AS property_code FROM users u LEFT JOIN user_property_access upa ON upa.user_id = u.id AND upa.ended_at IS NULL LEFT JOIN properties p ON p.id = upa.property_id WHERE u.id = ? LIMIT 1`, args: [previous.id] });
    row = result.rows[0]; stored = row ? await getLocalCredentialHash(String(row.id)) || row.password_hash?.toString() : undefined;
  }
  if (!row?.is_active || !stored || credentialVersion(stored) !== version || !roleLabels[row.role as UserRole]) return undefined;
  return { id: String(row.id), username: String(row.username), email: String(row.email), fullName: String(row.full_name), role: row.role as UserRole, avatarUrl: row.avatar_url?.toString() || '', propertyId: row.property_id?.toString(), propertyCode: row.property_code?.toString() };
}
