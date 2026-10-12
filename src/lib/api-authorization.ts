import type { APIContext } from 'astro';
import type { UserRole, UserSession } from '../types/auth';

export const financeEditors: UserRole[] = ['SUPER_ADMIN', 'CHAIRMAN', 'TREASURER'];
export async function authorizeApi(context: APIContext, roles: readonly UserRole[]) {
  // Only server-side sessions established by successful authentication are trusted.
  const user = await context.session?.get('wargahub_user') as UserSession | undefined;
  if (!user?.id) return { user: undefined, response: Response.json({ error: { message: 'Silakan masuk kembali untuk melanjutkan.' } }, { status: 401 }) };
  if (!roles.includes(user.role)) return { user: undefined, response: Response.json({ error: { message: 'Akun Anda tidak memiliki akses untuk tindakan ini.' } }, { status: 403 }) };
  return { user, response: undefined };
}
