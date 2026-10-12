import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export const credentialVersion = (stored: string) => createHash('sha256').update(stored).digest('hex');

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  return `$scrypt$1$${salt}$${scryptSync(password, salt, 64).toString('hex')}`;
}

export function verifyPassword(password: string, stored: string | null | undefined) {
  if (!stored || password.length > 1024) return false;
  if (stored.startsWith('$scrypt$')) {
    const parts = stored.split('$');
    if (parts[2] !== '1' || !/^[a-f0-9]{32}$/.test(parts[3] || '') || !/^[a-f0-9]{128}$/.test(parts[4] || '')) return false;
    return timingSafeEqual(scryptSync(password, parts[3], 64), Buffer.from(parts[4], 'hex'));
  }
  // Compatibility is exact only. No universal PIN or demo-password bypass.
  const candidate = Buffer.from(password);
  const legacy = Buffer.from(stored);
  return candidate.length === legacy.length && timingSafeEqual(candidate, legacy);
}
