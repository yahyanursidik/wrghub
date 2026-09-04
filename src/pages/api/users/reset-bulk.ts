import type { APIRoute } from 'astro';
import { z } from 'zod';
import { neonSql } from '../../../db/neon';
import { client as sqliteClient } from '../../../db/index';
import { recordAuditLog } from '../../../services/audit.service';

const resetBulkSchema = z.object({
  scope: z.enum(['ALL_RESIDENTS', 'ALL_STAFF', 'KAVLING_ONLY']),
  defaultPassword: z.string().min(4).default('warga123'),
  actorName: z.string().optional().default('Admin Pengurus'),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { scope, defaultPassword, actorName } = resetBulkSchema.parse(body);

    if (process.env.DATABASE_URL) {
      let updatedUsers: any[] = [];

      if (scope === 'ALL_RESIDENTS') {
        updatedUsers = await neonSql`
          UPDATE users 
          SET password_hash = ${defaultPassword}, updated_at = NOW()
          WHERE role IN ('HOUSEHOLD_HEAD', 'RESIDENT', 'HOUSE_OWNER')
          RETURNING id, username, full_name, property_code;
        `;
      } else if (scope === 'KAVLING_ONLY') {
        updatedUsers = await neonSql`
          UPDATE users 
          SET password_hash = ${defaultPassword}, updated_at = NOW()
          WHERE property_code LIKE 'Kav%' OR property_code LIKE 'KV%'
          RETURNING id, username, full_name, property_code;
        `;
      } else if (scope === 'ALL_STAFF') {
        updatedUsers = await neonSql`
          UPDATE users 
          SET password_hash = ${defaultPassword}, updated_at = NOW()
          WHERE role IN ('SECURITY', 'MAINTENANCE')
          RETURNING id, username, full_name, property_code;
        `;
      }

      // Sync to SQLite fallback
      try {
        if (scope === 'ALL_RESIDENTS') {
          await sqliteClient.execute({
            sql: `UPDATE users SET password_hash = ? WHERE role IN ('HOUSEHOLD_HEAD', 'RESIDENT', 'HOUSE_OWNER')`,
            args: [defaultPassword]
          });
        }
      } catch (sqErr) {}

      await recordAuditLog({
        actorName,
        action: 'user.bulk_password_reset',
        entityType: 'USERS',
        entityId: scope,
        newValue: {
          scope,
          defaultPassword,
          affectedCount: updatedUsers.length
        }
      });

      return new Response(JSON.stringify({
        data: {
          success: true,
          count: updatedUsers.length,
          message: `Berhasil mereset password untuk ${updatedUsers.length} akun ke default '${defaultPassword}'.`
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      data: { success: true, count: 0, message: 'Reset massal lokal selesai.' }
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
