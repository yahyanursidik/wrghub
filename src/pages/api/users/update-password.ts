import type { APIRoute } from 'astro';
import { z } from 'zod';
import { neonSql } from '../../../db/neon';
import { client as sqliteClient } from '../../../db/index';
import { recordAuditLog } from '../../../services/audit.service';
import { hashPassword } from '../../../lib/passwords';
import { setLocalCredentialHash } from '../../../services/local-credentials.service';
import type { UserSession } from '../../../types/auth';

const updatePasswordSchema = z.object({
  userId: z.string().min(1, 'ID atau username pengguna wajib diisi'),
  newPassword: z.string().min(4, 'Password minimal 4 karakter').max(1024),
  actorName: z.string().optional().default('Admin Pengurus'),
  reason: z.string().optional().default('Pembaruan password oleh admin'),
});

export const POST: APIRoute = async ({ request, session }) => {
  try {
    const body = await request.json();
    const { userId, newPassword, reason } = updatePasswordSchema.parse(body);
    const passwordHash = hashPassword(newPassword);
    const actor = await session?.get('wargahub_user') as UserSession;

    if (process.env.DATABASE_URL) {
      // 1. Check if user exists
      const existing = await neonSql`
        SELECT id, username, full_name, role, property_code 
        FROM users 
        WHERE id = ${userId} OR username = ${userId} OR property_code = ${userId}
        LIMIT 1;
      `;

      if (!existing.length) {
        return new Response(JSON.stringify({
          error: `Pengguna dengan identifikasi '${userId}' tidak ditemukan.`
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const targetUser = existing[0];
      if (targetUser.role === 'SUPER_ADMIN' && actor?.role !== 'SUPER_ADMIN') return Response.json({ error: 'Akses super admin diperlukan untuk akun ini.' }, { status: 403 });

      // 2. Update password in Neon PostgreSQL
      await neonSql`
        UPDATE users 
        SET 
          password_hash = ${passwordHash},
          updated_at = NOW()
        WHERE id = ${targetUser.id};
      `;

      // 4. Record audit log
      await recordAuditLog({
        actorUserId: actor.id,
        actorName: actor.fullName,
        action: 'user.password_updated',
        entityType: 'USER',
        entityId: targetUser.id,
        newValue: {
          username: targetUser.username,
          fullName: targetUser.full_name,
          propertyCode: targetUser.property_code,
          role: targetUser.role,
          reason,
          updatedAt: new Date().toISOString()
        }
      });

      return new Response(JSON.stringify({
        data: {
          success: true,
          userId: targetUser.id,
          username: targetUser.username,
          fullName: targetUser.full_name,
          propertyCode: targetUser.property_code,
          message: `Password untuk akun ${targetUser.full_name} (${targetUser.property_code || targetUser.username}) berhasil diperbarui.`
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const localUsers = await sqliteClient.execute({ sql: 'SELECT id, role FROM users WHERE id = ? OR username = ?', args: [userId, userId] });
    const localUser = localUsers.rows[0];
    if (!localUser) return Response.json({ error: 'Pengguna tidak ditemukan.' }, { status: 404 });
    if (localUser.role === 'SUPER_ADMIN' && actor?.role !== 'SUPER_ADMIN') return Response.json({ error: 'Akses super admin diperlukan untuk akun ini.' }, { status: 403 });
    await setLocalCredentialHash(String(localUser.id), passwordHash);
    await recordAuditLog({ actorUserId: actor.id, actorName: actor.fullName, action: 'user.password_updated', entityType: 'USER', entityId: String(localUser.id), newValue: { reason } });
    return new Response(JSON.stringify({
      data: { success: true, message: 'Password diperbarui di mode lokal.' }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('API /api/users/update-password error:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Gagal memperbarui password.'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
