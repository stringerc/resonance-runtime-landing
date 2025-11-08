import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis client (Upstash serverless Redis)
// Note: In production, these should be set. For development, rate limiting will fail gracefully.
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

let redis: Redis | null = null;
if (redisUrl && redisToken) {
  redis = new Redis({
    url: redisUrl,
    token: redisToken,
  });
} else {
  console.warn("⚠️  Upstash Redis not configured. Rate limiting will be disabled.");
}

function createRatelimit(limit: number, duration: Parameters<typeof Ratelimit.slidingWindow>[1], prefix: string) {
  if (!redis) {
    return {
      async limit() {
        return { success: true } as const;
      },
    };
  }

  const rl = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, duration),
    analytics: true,
    prefix,
  });

  return {
    async limit(identifier: string) {
      try {
        const result = await rl.limit(identifier);
        return { success: result.success } as const;
      } catch (error) {
        console.warn(`⚠️  Rate limiter (${prefix}) failed:`, error);
        return { success: true } as const;
      }
    },
  };
}

/**
 * Login attempts: 5 per 15 minutes per IP
 */
export const loginRatelimit = createRatelimit(5, "15 m", "ratelimit:login");

/**
 * Password reset: 3 per hour per email
 */
export const passwordResetRatelimit = createRatelimit(3, "1 h", "ratelimit:password-reset");

/**
 * Registration: 3 per hour per IP
 */
export const registrationRatelimit = createRatelimit(3, "1 h", "ratelimit:register");

/**
 * Account lockout after 5 failed attempts (15 min cooldown)
 */
export async function checkAccountLockout(
  email: string
): Promise<{ locked: boolean; unlockAt?: Date }> {
  if (!redis) {
    return { locked: false };
  }

  const key = `lockout:${email}`;
  const attempts = await redis.get<number>(key);
  
  if (attempts && attempts >= 5) {
    const ttl = await redis.ttl(key);
    if (ttl > 0) {
      return {
        locked: true,
        unlockAt: new Date(Date.now() + ttl * 1000),
      };
    }
  }
  
  return { locked: false };
}

/**
 * Record failed login attempt
 */
export async function recordFailedLogin(email: string): Promise<void> {
  if (!redis) {
    return;
  }

  const key = `lockout:${email}`;
  const attempts = await redis.incr(key);
  
  if (attempts === 1) {
    // Set expiration to 15 minutes
    await redis.expire(key, 60 * 15);
  }
}

/**
 * Reset failed login attempts on successful login
 */
export async function resetFailedLogins(email: string): Promise<void> {
  if (!redis) {
    return;
  }

  const key = `lockout:${email}`;
  await redis.del(key);
}

