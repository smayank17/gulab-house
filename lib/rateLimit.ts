import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = url && token ? new Redis({ url, token }) : null;

export const ratelimit =
  redis &&
  new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "60 s") // 10 requests/min per IP
  });

export async function checkRateLimit(key: string) {
  if (!ratelimit) return { ok: true, remaining: 999 };
  const res = await ratelimit.limit(key);
  return { ok: res.success, remaining: res.remaining };
}