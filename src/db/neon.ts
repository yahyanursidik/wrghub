import postgres from 'postgres';
import 'dotenv/config';

// Never embed database credentials or fall back to an unrelated remote database.
// SQLite callers remain usable when DATABASE_URL is intentionally unset.
const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/wargahub';
export const neonSql = postgres(connectionString, {
  ssl: process.env.DATABASE_URL ? 'require' : false,
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

export async function isNeonConnected(): Promise<boolean> {
  if (!process.env.DATABASE_URL) return false;
  try {
    const result = await neonSql`SELECT 1 as connected`;
    return Boolean(result[0]?.connected);
  } catch {
    return false;
  }
}
