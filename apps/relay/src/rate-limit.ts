export type RateLimitDecision = {
  key: string;
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: string;
};

export const MAX_DEVELOPMENT_RATE_LIMIT = 1_000_000;
export const MAX_RATE_LIMIT_WINDOW_MS = 2_147_483_647;

export class SlidingWindowRateLimiter {
  private readonly attempts = new Map<string, number[]>();
  private readonly options: Readonly<{
    limit: number;
    windowMs: number;
  }>;

  constructor(options: { limit: number; windowMs: number }) {
    const { limit, windowMs } = options;

    if (
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > MAX_DEVELOPMENT_RATE_LIMIT
    ) {
      throw new Error(`Rate limit must be an integer from 1 through ${MAX_DEVELOPMENT_RATE_LIMIT}`);
    }

    if (
      !Number.isInteger(windowMs) ||
      windowMs < 1000 ||
      windowMs > MAX_RATE_LIMIT_WINDOW_MS
    ) {
      throw new Error(`Rate limit window must be an integer from 1000 through ${MAX_RATE_LIMIT_WINDOW_MS}`);
    }

    this.options = Object.freeze({ limit, windowMs });
  }

  consume(key: string, now = new Date()): RateLimitDecision {
    const timestamp = now.getTime();
    const windowStart = timestamp - this.options.windowMs;
    const current = (this.attempts.get(key) ?? []).filter((entry) => entry > windowStart);
    const allowed = current.length < this.options.limit;

    if (allowed) {
      current.push(timestamp);
      this.attempts.set(key, current);
    } else {
      this.attempts.set(key, current);
    }

    const oldest = current[0] ?? timestamp;
    const resetAt = new Date(oldest + this.options.windowMs).toISOString();

    return {
      key,
      allowed,
      limit: this.options.limit,
      remaining: Math.max(this.options.limit - current.length, 0),
      resetAt
    };
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

export function createDevelopmentRateLimiter(env: NodeJS.ProcessEnv, prefix: string): SlidingWindowRateLimiter {
  const limit = parseExactIntegerEnv(
    env[`${prefix}_LIMIT`],
    5,
    1,
    MAX_DEVELOPMENT_RATE_LIMIT,
    `${prefix}_LIMIT`
  );
  const windowMs = parseExactIntegerEnv(
    env[`${prefix}_WINDOW_MS`],
    60_000,
    1000,
    MAX_RATE_LIMIT_WINDOW_MS,
    `${prefix}_WINDOW_MS`
  );
  return new SlidingWindowRateLimiter({ limit, windowMs });
}

function parseExactIntegerEnv(
  raw: string | undefined,
  fallback: number,
  min: number,
  max: number,
  name: string
): number {
  if (raw === undefined) {
    return fallback;
  }

  if (!/^(0|[1-9]\d*)$/.test(raw)) {
    throw new Error(`${name} must be a canonical positive integer`);
  }

  const value = Number.parseInt(raw, 10);
  if (value < min) {
    throw new Error(`${name} must be at least ${min}`);
  }

  if (value > max) {
    throw new Error(`${name} must be at most ${max}`);
  }

  return value;
}
