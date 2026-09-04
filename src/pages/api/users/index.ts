import type { APIRoute } from 'astro';
import { z } from 'zod';
import { neonSql } from '../../../db/neon';
import { db, schema } from '../../../db';
import { recordAuditLog } from '../../../services/audit.service';

const createUserSchema = z.object({
  username: z.string().min(2, 'Username minimal 2 karakter'),
  fullName: z.string().min(2, 'Nama lengkap wajib diisi'),
  role: z.enum([
    'SUPER_ADMIN',
    'CHAIRMAN',
    'SECRETARY',
    'TREASURER',
    'RESIDENT_ADMIN',
    'SECURITY',
    'MAINTENANCE',
    'HOUSE_OWNER',
    'HOUSEHOLD_HEAD',
    'RESIDENT',
    'AUDITOR',
    'VIEWER'
  ]),
  password: z.string().min(4, 'Password minimal 4 karakter'),
  propertyCode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
});

export const GET: APIRoute = async () => {
  try {
    if (process.env.DATABASE_URL) {
      const rows = await neonSql`
        SELECT 
          u.id, 
          u.username, 
          u.email, 
          u.full_name, 
          u.role, 
          u.property_id, 
          u.property_code,
          u.password_hash, 
          u.is_active, 
          u.created_at,
          COALESCE(per.phone, '') as phone,
          p.address as property_address,
          p.occupancy_status
        FROM users u
        LEFT JOIN persons per ON u.person_id = per.id
        LEFT JOIN properties p ON u.property_id = p.id
        ORDER BY 
          CASE 
            WHEN u.role IN ('SUPER_ADMIN', 'CHAIRMAN', 'TREASURER', 'SECRETARY') THEN 1
            WHEN u.role IN ('SECURITY', 'MAINTENANCE') THEN 2
            ELSE 3
          END ASC,
          u.property_code ASC,
          u.username ASC
      `;

      const users = rows.map((r: any) => ({
        id: r.id,
        username: r.username,
        fullName: r.full_name,
        email: r.email,
        role: r.role,
        propertyId: r.property_id,
        propertyCode: r.property_code,
        passwordHash: r.password_hash || 'warga123',
        isActive: Boolean(r.is_active),
        phone: r.phone || '',
        propertyAddress: r.property_address || '',
        occupancyStatus: r.occupancy_status || '',
        createdAt: r.created_at || new Date().toISOString(),
      }));

      return new Response(JSON.stringify({ data: users }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // SQLite Fallback
    const localUsers = await db.select().from(schema.users);
    return new Response(JSON.stringify({ data: localUsers }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('API /api/users error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = createUserSchema.parse(body);

    const cleanUsername = validated.username.trim().toLowerCase().replace(/\s+/g, '_');
    const userId = `user-${cleanUsername.replace(/[^a-z0-9_-]/g, '')}-${Date.now().toString().slice(-4)}`;
    const cleanEmail = validated.email?.trim() || `${cleanUsername}@wargahub.id`;
    const cleanPropCode = validated.propertyCode?.trim() || null;
    const cleanPropId = cleanPropCode ? `prop-${cleanPropCode.toLowerCase().replace(/[^a-z0-9]/g, '-')}` : null;

    if (process.env.DATABASE_URL) {
      // Create person record if phone is provided
      let personId: string | null = null;
      if (validated.phone) {
        personId = `person-${userId}`;
        await neonSql`
          INSERT INTO persons (id, name, phone, email, is_active)
          VALUES (${personId}, ${validated.fullName}, ${validated.phone}, ${cleanEmail}, true)
          ON CONFLICT (id) DO UPDATE SET phone = ${validated.phone}, name = ${validated.fullName};
        `;
      }

      await neonSql`
        INSERT INTO users (
          id, username, email, full_name, role,
          property_id, property_code, password_hash, person_id, is_active
        ) VALUES (
          ${userId}, ${cleanUsername}, ${cleanEmail}, ${validated.fullName}, ${validated.role},
          ${cleanPropId}, ${cleanPropCode}, ${validated.password}, ${personId}, true
        )
        ON CONFLICT (id) DO UPDATE SET
          full_name = ${validated.fullName},
          role = ${validated.role},
          property_id = ${cleanPropId},
          property_code = ${cleanPropCode},
          password_hash = ${validated.password},
          person_id = COALESCE(${personId}, users.person_id),
          is_active = true;
      `;

      // If linked to property, grant access
      if (cleanPropId) {
        await neonSql`
          INSERT INTO user_property_access (
            id, user_id, property_id, relationship, can_view_billing, can_pay, can_edit_occupants, can_view_property, started_at
          ) VALUES (
            ${'uacc-' + userId}, ${userId}, ${cleanPropId}, 'OWNER', true, true, true, true, NOW()
          )
          ON CONFLICT (id) DO NOTHING;
        `;
      }

      await recordAuditLog({
        actorName: 'Admin Pengurus',
        action: 'user.created',
        entityType: 'USER',
        entityId: userId,
        newValue: {
          username: cleanUsername,
          fullName: validated.fullName,
          role: validated.role,
          propertyCode: cleanPropCode,
          phone: validated.phone
        }
      });

      return new Response(JSON.stringify({
        data: {
          id: userId,
          username: cleanUsername,
          fullName: validated.fullName,
          role: validated.role,
          propertyCode: cleanPropCode,
          message: `Akun untuk ${validated.fullName} (${cleanUsername}) berhasil dibuat.`
        }
      }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      data: { id: userId, message: 'Akun berhasil dibuat di mode lokal.' }
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('API /api/users POST error:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Gagal membuat akun baru.'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
