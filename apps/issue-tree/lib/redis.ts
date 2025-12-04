import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function getJson<T>(key: string): Promise<T | null> {
  const data = await redis.get<T>(key);
  return data ?? null;
}

export async function setJson<T>(
  key: string,
  value: T,
  options?: { ex?: number }
): Promise<void> {
  if (options?.ex) {
    await redis.set(key, value, { ex: options.ex });
  } else {
    await redis.set(key, value);
  }
}

export async function deleteKey(key: string): Promise<void> {
  await redis.del(key);
}

export async function deleteKeys(keys: string[]): Promise<void> {
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

export async function deleteByPattern(pattern: string): Promise<void> {
  let cursor = 0;
  do {
    const [nextCursor, keys] = await redis.scan(cursor, { match: pattern, count: 100 });
    cursor = Number(nextCursor);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } while (cursor !== 0);
}

export { redis };
