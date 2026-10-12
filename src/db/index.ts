import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';
import path from 'node:path';
import fs from 'node:fs';

// Test suites can use an isolated directory without touching the application's data.
const dbDir = path.resolve(process.env.WARGAHUB_DATA_DIR || path.join(process.cwd(), 'data'));
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'wargahub.db');
const client = createClient({
  url: `file:${dbPath.replace(/\\/g, '/')}`
});

export const db = drizzle(client, { schema });
export { client, schema };
