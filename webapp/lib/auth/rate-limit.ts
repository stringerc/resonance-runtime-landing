import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis client (Upstash serverless Redis)
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

/**
 * Login attempts: 5 per 15 minutes per IP
 */
export const loginRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  analytics: true,
  prefix: "ratelimit:login",
});

/**
 * Password reset: 3 per hour per email
 */
export const passwordResetRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 h"),
  prefix: "ratelimit:password-reset",
});

/**
 * Registration: 3 per hour per IP
 */
export const registrationRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 h"),
  prefix: "ratelimit:register",
});

/**
 * Account lockout after 5 failed attempts (15 min cooldown)
 */
export async function checkAccountLockout(
  email: string
): Promise<{ locked: boolean; unlockAt?: Date }> {
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
  const key = `lockout:${email}`;
  await redis.del(key);
}

