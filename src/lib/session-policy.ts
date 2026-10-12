export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

/** A fixed login deadline prevents private requests from extending a session forever. */
export function isSessionCurrent(issuedAt: unknown, now = Date.now()): boolean {
  return typeof issuedAt === 'number' && Number.isFinite(issuedAt)
    && issuedAt <= now && now - issuedAt < SESSION_MAX_AGE_SECONDS * 1000;
}
