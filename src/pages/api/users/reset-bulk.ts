import type { APIRoute } from 'astro';
import { z } from 'zod';
import { neonSql } from '../../../db/neon';
import { client as sqliteClient } from '../../../db/index';
import { recordAuditLog } from '../../../services/audit.service';
import { hashPassword } from '../../../lib/passwords';
import { setLocalCredentialHash } from '../../../services/local-credentials.service';
import type { UserSession } from '../../../types/auth';

const resetBulkSchema = z.object({
  scope: z.enum(['ALL_RESIDENTS', 'ALL_STAFF', 'KAVLING_ONLY']),
  defaultPassword: z.string().min(4).max(1024),
  actorName: z.string().optional().default('Admin Pengurus'),
});

export const POST: APIRoute = async ({ request, session }) => {
  try {
    const body = await request.json();
    const { scope, defaultPassword } = resetBulkSchema.parse(body);
    const actor = await session?.get('wargahub_user') as UserSession;
    const passwordHash = hashPassword(defaultPassword);

    if (process.env.DATABASE_URL) {
      let updatedUsers: any[] = [];

      if (scope === 'ALL_RESIDENTS') {
        updatedUsers = await neonSql`
          UPDATE users 
          SET password_hash = ${passwordHash}, updated_at = NOW()
          WHERE role IN ('HOUSEHOLD_HEAD', 'RESIDENT', 'HOUSE_OWNER')
          RETURNING id, username, full_name, property_code;
        `;
      } else if (scope === 'KAVLING_ONLY') {
        updatedUsers = await neonSql`
          UPDATE users 
          SET password_hash = ${passwordHash}, updated_at = NOW()
          WHERE (property_code LIKE 'Kav%' OR property_code LIKE 'KV%') AND role IN ('HOUSEHOLD_HEAD', 'RESIDENT', 'HOUSE_OWNER')
          RETURNING id, username, full_name, property_code;
        `;
      } else if (scope === 'ALL_STAFF') {
        updatedUsers = await neonSql`
          UPDATE users 
          SET password_hash = ${passwordHash}, updated_at = NOW()
          WHERE role IN ('SECURITY', 'MAINTENANCE')
          RETURNING id, username, full_name, property_code;
        `;
      }

      await recordAuditLog({
        actorUserId: actor.id,
        actorName: actor.fullName,
        action: 'user.bulk_password_reset',
        entityType: 'USERS',
        entityId: scope,
        newValue: {
          scope,
          affectedCount: updatedUsers.length
        }
      });

      return new Response(JSON.stringify({
        data: {
          success: true,
          count: updatedUsers.length,
          message: `Kata sandi ${updatedUsers.length} akun diperbarui.`
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const local = await sqliteClient.execute('SELECT u.id, u.role, p.code FROM users u LEFT JOIN user_property_access upa ON upa.user_id = u.id AND upa.ended_at IS NULL LEFT JOIN properties p ON p.id = upa.property_id');
    const selected = [...new Set(local.rows.filter(user => scope === 'ALL_RESIDENTS' ? ['HOUSEHOLD_HEAD', 'HOUSE_OWNER', 'RESIDENT'].includes(String(user.role)) : scope === 'ALL_STAFF' ? ['SECURITY', 'MAINTENANCE'].includes(String(user.role)) : ['HOUSEHOLD_HEAD', 'HOUSE_OWNER', 'RESIDENT'].includes(String(user.role)) && /^(Kav|KV)/i.test(String(user.code || ''))).map(user => String(user.id)))];
    for (const id of selected) await setLocalCredentialHash(id, hashPassword(defaultPassword));
    await recordAuditLog({ actorUserId: actor.id, actorName: actor.fullName, action: 'user.bulk_password_reset', entityType: 'USERS', entityId: scope, newValue: { scope, affectedCount: selected.length } });
    return new Response(JSON.stringify({
      data: { success: true, count: selected.length, message: `Kata sandi ${selected.length} akun lokal diperbarui.` }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('API /api/users/reset-bulk error:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Gagal reset password massal.'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
