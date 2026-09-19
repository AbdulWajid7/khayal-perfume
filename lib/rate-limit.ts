export type RateLimitResult = { allowed: true } | { allowed: false; retryAfterSeconds: number };

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();
const DEFAULT_WINDOW_MS = 60 * 1000;
const DEFAULT_MAX_REQUESTS = 5;

export function checkRateLimit(
  key: string,
  maxRequests: number = DEFAULT_MAX_REQUESTS,
  windowMs: number = DEFAULT_WINDOW_MS
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (entry.count < maxRequests) {
    entry.count += 1;
    return { allowed: true };
  }

  const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
  return { allowed: false, retryAfterSeconds };
}

export function resetRateLimit(key: string): void {
  store.delete(key);
}
