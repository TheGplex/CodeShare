// Simple sliding-window rate limiter (in-memory).
// For multi-instance deployments swap this for Redis or @upstash/ratelimit.

type Bucket = { hits: number[]; };

const store = new Map<string, Bucket>();

export type RateLimitOptions = {
  windowMs: number;
  max: number;
};

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetMs: number;
};

export function rateLimit(
  key: string,
  { windowMs, max }: RateLimitOptions,
): RateLimitResult {
  const now = Date.now();
  const start = now - windowMs;
  const bucket = store.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((t) => t > start);

  if (bucket.hits.length >= max) {
    store.set(key, bucket);
    const oldest = bucket.hits[0] ?? now;
    return { ok: false, remaining: 0, resetMs: oldest + windowMs - now };
  }

  bucket.hits.push(now);
  store.set(key, bucket);
  return {
    ok: true,
    remaining: max - bucket.hits.length,
    resetMs: windowMs,
  };
}

export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const xri = req.headers.get("x-real-ip");
  if (xri) return xri;
  return "unknown";
}

// Periodic cleanup so the map doesn't grow unbounded.
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const cutoff = Date.now() - 60 * 60 * 1000;
    for (const [k, v] of store.entries()) {
      if (v.hits.length === 0 || v.hits[v.hits.length - 1] < cutoff) {
        store.delete(k);
      }
    }
  }, 5 * 60 * 1000).unref?.();
}
