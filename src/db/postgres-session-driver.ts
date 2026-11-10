import type { SessionDriver } from 'astro';
import { neonSql } from './neon';
import { SESSION_MAX_AGE_SECONDS } from '../lib/session-policy';

export default function postgresSessionDriver(): SessionDriver {
  return {
    async getItem(key) {
      const [session] = await neonSql<{ data: string }[]>`
        SELECT data FROM public.wargahub_sessions
        WHERE session_id = ${key} AND expires_at > NOW() AND data IS NOT NULL
      `;
      return session?.data;
    },
    async setItem(key, value: string) {
      await neonSql`
        WITH expired AS (
          SELECT session_id FROM public.wargahub_sessions
          WHERE expires_at <= NOW() AND session_id <> ${key}
          ORDER BY expires_at LIMIT 100 FOR UPDATE SKIP LOCKED
        ), cleanup AS (
          DELETE FROM public.wargahub_sessions USING expired
          WHERE wargahub_sessions.session_id = expired.session_id
        )
        INSERT INTO public.wargahub_sessions AS stored (session_id, data, expires_at)
        VALUES (${key}, ${value}, NOW() + make_interval(secs => ${SESSION_MAX_AGE_SECONDS}))
        ON CONFLICT (session_id) DO UPDATE SET data = EXCLUDED.data
        WHERE stored.data IS NOT NULL AND stored.expires_at > NOW()
      `;
    },
    async removeItem(key) {
      // Keep the revoked key until expiry so a concurrent request cannot restore it.
      await neonSql`
        INSERT INTO public.wargahub_sessions (session_id, data, expires_at)
        VALUES (${key}, NULL, NOW() + make_interval(secs => ${SESSION_MAX_AGE_SECONDS}))
        ON CONFLICT (session_id) DO UPDATE SET data = NULL
      `;
    },
  };
}
