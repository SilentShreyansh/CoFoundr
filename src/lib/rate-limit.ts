import { headers } from "next/headers";

// In-memory fixed-window limiter. Good as a baseline; for multi-instance
// production (Vercel) swap for a shared store like Upstash Redis.
type Bucket = { count: number; resetAt: number };
const store = new Map<string, Bucket>();

export function rateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const bucket = store.get(key);
  if (!bucket || bucket.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, retryAfterMs: 0 };
  }
  if (bucket.count >= max) {
    return { success: false, retryAfterMs: bucket.resetAt - now };
  }
  bucket.count += 1;
  return { success: true, retryAfterMs: 0 };
}

export async function clientIp() {
  const h = await headers();
  const xff = h.get("x-forwarded-for");
  return xff?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}
