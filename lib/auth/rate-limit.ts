import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Check if Redis is configured
const isRedisConfigured = !!(
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
);

// Initialize Redis client (Upstash serverless Redis)
// Only initialize if configured, otherwise use a mock
const redis = isRedisConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// Warn if Redis is not configured (rate limiting will not work)
if (!isRedisConfigured) {
  console.warn("⚠️  Upstash Redis not configured. Rate limiting disabled.");
}

// Create a wrapper that gracefully handles missing Redis
function createRatelimit(limiter: any, prefix: string) {
  if (!isRedisConfigured) {
    // Return a mock ratelimit that always allows requests
    return {
      limit: async (identifier: string) => {
        console.warn(`Rate limiting disabled (Redis not configured). Allowing request for ${prefix}`);
        return { success: true, limit: 0, remaining: 0, reset: 0 };
      },
    };
  }

  return new Ratelimit({
    redis: redis!,
    limiter,
    analytics: true,
    prefix,
  });
}

/**
 * Login attempts: 5 per 15 minutes per IP
 */
export const loginRatelimit = createRatelimit(
  Ratelimit.slidingWindow(5, "15 m"),
  "ratelimit:login"
);

/**
 * Password reset: 3 per hour per email
 */
export const passwordResetRatelimit = createRatelimit(
  Ratelimit.slidingWindow(3, "1 h"),
  "ratelimit:password-reset"
);

/**
 * Registration: 3 per hour per IP
 */
export const registrationRatelimit = createRatelimit(
  Ratelimit.slidingWindow(3, "1 h"),
  "ratelimit:register"
);

/**
 * Account lockout after 5 failed attempts (15 min cooldown)
 */
export async function checkAccountLockout(
  email: string
): Promise<{ locked: boolean; unlockAt?: Date }> {
  if (!isRedisConfigured) {
    return { locked: false };
  }

  try {
    const key = `lockout:${email}`;
    const attempts = await redis!.get<number>(key);
    
    if (attempts && attempts >= 5) {
      const ttl = await redis!.ttl(key);
      if (ttl > 0) {
        return {
          locked: true,
          unlockAt: new Date(Date.now() + ttl * 1000),
        };
      }
    }
  } catch (error) {
    console.error("Error checking account lockout:", error);
    // Fail open - don't lock account if Redis fails
  }
  
  return { locked: false };
}

/**
 * Record failed login attempt
 */
export async function recordFailedLogin(email: string): Promise<void> {
  if (!isRedisConfigured) {
    return;
  }

  try {
    const key = `lockout:${email}`;
    const attempts = await redis!.incr(key);
    
    if (attempts === 1) {
      // Set expiration to 15 minutes
      await redis!.expire(key, 60 * 15);
    }
  } catch (error) {
    console.error("Error recording failed login:", error);
    // Fail silently - don't block login if Redis fails
  }
}

/**
 * Reset failed login attempts on successful login
 */
export async function resetFailedLogins(email: string): Promise<void> {
  if (!isRedisConfigured) {
    return;
  }

  try {
    const key = `lockout:${email}`;
    await redis!.del(key);
  } catch (error) {
    console.error("Error resetting failed logins:", error);
    // Fail silently
  }
}

