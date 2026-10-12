import { defineMiddleware } from 'astro/middleware';
import type { UserSession } from './types/auth';
import { allowedApiRoles, canAccessAdminPage, isResidentRole, residentWriteMatches, residentPropertyUpdateMatches } from './lib/access-policy';
import { isSessionCurrent } from './lib/session-policy';
import { allowLoginAttempt } from './lib/login-rate-limit';
import { resolveSessionPrincipal } from './services/session-principal.service';

export const onRequest = defineMiddleware(async (context, next) => {
  const path = context.url.pathname.replace(/\/$/, '') || '/';
  const method = context.request.method;
  if (path === '/admin/login') return context.redirect('/login?portal=admin', 302);
  const privatePage = path === '/admin' || path.startsWith('/admin/') || path === '/warga' || path === '/portal';
  const api = path.startsWith('/api/');
  if (path === '/api/auth/login' && method === 'POST') {
    let address = 'unavailable';
    try { address = context.clientAddress; } catch {}
    if (!allowLoginAttempt(address)) return Response.json({ error: { message: 'Terlalu banyak percobaan masuk. Coba lagi dalam beberapa menit.' } }, { status: 429, headers: { 'Retry-After': '600' } });
  }
  const roles = api ? allowedApiRoles(path, method) : null;
  if (!privatePage && (!api || roles === null)) {
    const origin = context.request.headers.get('origin');
    if (api && !['GET', 'HEAD', 'OPTIONS'].includes(method) && origin && origin !== context.url.origin) return Response.json({ error: { message: 'Asal permintaan tidak diizinkan.' } }, { status: 403 });
    return next();
  }
  let user = await context.session?.get('wargahub_user') as UserSession | undefined;
  if (user) {
    try {
      user = isSessionCurrent(await context.session?.get('issued_at'))
        ? await resolveSessionPrincipal(user, await context.session?.get('credential_version') as string | undefined)
        : undefined;
      if (user) await context.session?.set('wargahub_user', user);
      else await context.session?.destroy();
    } catch {
      if (api) return Response.json({ error: { message: 'Sesi belum bisa diperiksa. Coba lagi.' } }, { status: 503 });
      return new Response('Sesi belum bisa diperiksa. Silakan muat ulang halaman.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }
  }
  if (!user?.id) {
    if (api) return Response.json({ error: { message: 'Silakan masuk untuk melanjutkan.' } }, { status: 401 });
    return context.redirect(`/login?portal=${path.startsWith('/admin') ? 'admin' : 'resident'}`, 302);
  }
  if (privatePage && path.startsWith('/admin') && !canAccessAdminPage(user.role, path)) {
    return isResidentRole(user.role) || user.role === 'VIEWER' ? context.redirect('/warga', 302) : context.redirect('/admin', 302);
  }
  if (api) {
    if (!roles?.includes(user.role)) return Response.json({ error: { message: 'Akun Anda tidak memiliki akses ke tindakan ini.' } }, { status: 403 });
    if (isResidentRole(user.role) && path === '/api/voting/polls') {
      const propertyCode = context.url.searchParams.get('propertyCode');
      if (propertyCode && propertyCode.toLowerCase() !== user.propertyCode?.toLowerCase()) return Response.json({ error: { message: 'Riwayat suara hanya dapat dibaca untuk rumah akun Anda.' } }, { status: 403 });
    }
    if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      const origin = context.request.headers.get('origin');
      if (origin && origin !== context.url.origin) return Response.json({ error: { message: 'Asal permintaan tidak diizinkan.' } }, { status: 403 });
      if (isResidentRole(user.role) && path !== '/api/ai/chat') {
        const body = await context.request.clone().json().catch(() => null);
        const ownProperty = body && typeof body === 'object' && !Array.isArray(body)
          && (path === '/api/properties/update' ? residentPropertyUpdateMatches(body, user) : residentWriteMatches(body, user));
        if (!ownProperty || (path === '/api/payments/submit' && !body.invoiceId)) return Response.json({ error: { message: 'Tindakan warga harus terkait dengan rumah dan tagihan milik akun Anda.' } }, { status: 403 });
      }
    }
  }
  const response = await next();
  response.headers.set('Cache-Control', 'private, no-store');
  response.headers.append('Vary', 'Cookie');
  return response;
});
