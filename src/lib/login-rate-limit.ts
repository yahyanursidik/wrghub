const attempts = new Map<string, { count: number; expires: number }>();
export function allowLoginAttempt(key: string, now = Date.now()) {
  if (attempts.size >= 4096) {
    for (const [key, value] of attempts) if (value.expires <= now) attempts.delete(key);
    if (attempts.size >= 4096) attempts.delete(attempts.keys().next().value!);
  }
  const previous = attempts.get(key);
  const entry = previous && previous.expires > now ? previous : { count: 0, expires: now + 10 * 60 * 1000 };
  entry.count++;
  attempts.set(key, entry);
  return entry.count <= 20;
}
