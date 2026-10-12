import { db, schema } from '../db';
import { eq } from 'drizzle-orm';

export async function setLocalCredentialHash(userId: string, hash: string) {
  const key = `auth.password.${userId}`;
  await db.insert(schema.settings).values({ id: `credential-${userId}`, key, value: hash, description: 'Hashed login credential', updatedAt: new Date().toISOString() })
    .onConflictDoUpdate({ target: schema.settings.key, set: { value: hash, updatedAt: new Date().toISOString() } });
}
export async function getLocalCredentialHash(userId: string) {
  const [record] = await db.select().from(schema.settings).where(eq(schema.settings.key, `auth.password.${userId}`));
  return record?.value;
}
