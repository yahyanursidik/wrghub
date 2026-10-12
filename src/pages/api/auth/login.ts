import type { APIRoute } from 'astro';
import { z } from 'zod';
import { authenticateUser } from '../../../services/auth.service';

const loginSchema = z.object({
  identifier: z.string().min(1, 'Username atau No. Rumah wajib diisi').max(200),
  password: z.string().min(1, 'Password / PIN wajib diisi').max(1024),
  portal: z.enum(['resident', 'admin', 'any']).default('any'),
});

export const POST: APIRoute = async ({ request, cookies, session }) => {
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
    if (!session) throw new Error('Penyimpanan sesi belum tersedia. Hubungi pengurus.');
    await session.regenerate();
    await session.set('wargahub_user', user);
    await session.set('credential_version', result.credentialVersion);
    await session.set('issued_at', Date.now());
    const isAdminRole = ['SUPER_ADMIN', 'CHAIRMAN', 'SECRETARY', 'TREASURER', 'RESIDENT_ADMIN', 'SECURITY', 'MAINTENANCE', 'AUDITOR'].includes(user.role);

    // Determine redirect
    let redirectUrl = '/warga';
    if (isAdminRole && portal !== 'resident') {
      redirectUrl = user.role === 'TREASURER' ? '/admin/payments'
        : user.role === 'SECURITY' ? '/admin/security-gate'
        : user.role === 'MAINTENANCE' ? '/admin/cleaning-staff'
        : user.role === 'SECRETARY' ? '/admin/announcements'
        : '/admin';
    } else {
      redirectUrl = '/warga';
    }

    // Retire the legacy identity cookie; authorization and SSR use the server session.
    cookies.delete('wargahub_user', { path: '/' });

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
      { status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } }
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
