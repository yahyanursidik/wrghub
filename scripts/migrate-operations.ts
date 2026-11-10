import 'dotenv/config';
import postgres from 'postgres';
import { operationColumns, operationTables, migrateSqliteOperations } from '../src/db/operations-schema';
import { postgresSsl } from '../src/db/postgres-connection';

const target = process.argv[2];
if (target === '--postgres') {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL wajib untuk migrasi PostgreSQL.');
  if (new URL(url).hostname.includes('-pooler.')) throw new Error('Gunakan koneksi PostgreSQL langsung untuk migrasi.');
  const sql = postgres(url, { ssl: postgresSsl(url), max: 1 });
  try {
    await sql.begin(async tx => {
      await tx`SELECT pg_advisory_xact_lock(41050601)`;
      for (const [table, columns] of Object.entries(operationColumns))
        for (const [name, definition] of Object.entries(columns))
          await tx.unsafe(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${name} ${definition}`);
      for (const statement of operationTables) await tx.unsafe(statement);
      await tx`CREATE TABLE IF NOT EXISTS public.wargahub_sessions (
        session_id text PRIMARY KEY,
        data text,
        expires_at timestamptz NOT NULL
      )`;
      await tx`CREATE INDEX IF NOT EXISTS wargahub_sessions_expiry_idx
        ON public.wargahub_sessions (expires_at)`;
    });
    console.log('Migrasi modul operasional PostgreSQL selesai.');
  } finally { await sql.end(); }
} else if (target === '--sqlite') {
  const { client } = await import('../src/db');
  try { await migrateSqliteOperations(client); console.log('Migrasi modul operasional SQLite selesai.'); }
  finally { client.close(); }
} else throw new Error('Pilih --postgres atau --sqlite.');
