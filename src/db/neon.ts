import postgres from 'postgres';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_O4jVKCzUWex8@ep-damp-queen-azh98l8v-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

// Connection pooling for Neon PostgreSQL (serverless ready)
export const neonSql = postgres(connectionString, {
  ssl: 'require',
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

export async function isNeonConnected(): Promise<boolean> {
  try {
    const res = await neonSql`SELECT 1 as connected`;
    return Boolean(res[0]?.connected);
  } catch (e) {
    return false;
  }
}
