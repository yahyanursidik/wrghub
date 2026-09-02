import type { APIRoute } from 'astro';
import { z } from 'zod';
import { authenticateUser } from '../../../services/auth.service';

const loginSchema = z.object({
  identifier: z.string().min(1, 'Username atau No. Rumah wajib diisi'),
  password: z.string().min(1, 'Password / PIN wajib diisi'),
  portal: z.enum(['resident', 'admin', 'any']).default('any'),
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { identifier, password, portal } = loginSchema.parse(body);

    const result = await authenticateUser(identifier, password);
    if (!result.success || !result.user) {
      return new Response(
        JSON.stringify({
          data: null,
          error: { code: 'AUTH_FAILED', message: result.error || 'Login gagal.' },
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const user = result.user;
    const isAdminRole = ['SUPER_ADMIN', 'CHAIRMAN', 'SECRETARY', 'TREASURER', 'RESIDENT_ADMIN', 'SECURITY', 'MAINTENANCE', 'AUDITOR'].includes(user.role);

    // Determine redirect
    let redirectUrl = '/warga';
    if (portal === 'admin' || (isAdminRole && portal !== 'resident')) {
      redirectUrl = user.role === 'TREASURER' ? '/admin/payments'
        : user.role === 'SECURITY' ? '/admin/security-gate'
        : user.role === 'MAINTENANCE' ? '/admin/cleaning-staff'
        : user.role === 'SECRETARY' ? '/admin/announcements'
        : '/admin';
    } else {
      redirectUrl = '/warga';
    }

    // Set cookie
    cookies.set('wargahub_user', JSON.stringify(user), {
      path: '/',
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
    });

    return new Response(
      JSON.stringify({
        data: {
          user,
          redirectUrl,
          message: `Selamat datang, ${user.fullName}!`,
        },
        meta: {},
        error: null,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        data: null,
        error: { code: 'INVALID_REQUEST', message: err.message || 'Format data login salah.' },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
