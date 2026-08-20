interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Clean up stale entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap.entries()) {
      if (now > entry.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
  totalLimit: number;
}

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 150,
  windowSeconds: number = 60
): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const entry = rateLimitMap.get(identifier);

  if (!entry || now > entry.resetTime) {
    // New or expired window
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetSeconds: windowSeconds,
      totalLimit: maxRequests,
    };
  }

  if (entry.count < maxRequests) {
    entry.count += 1;
    const remainingSeconds = Math.ceil((entry.resetTime - now) / 1000);
    return {
      allowed: true,
      remaining: maxRequests - entry.count,
      resetSeconds: Math.max(1, remainingSeconds),
      totalLimit: maxRequests,
    };
  }

  // Limit exceeded
  const remainingSeconds = Math.ceil((entry.resetTime - now) / 1000);
  return {
    allowed: false,
    remaining: 0,
    resetSeconds: Math.max(1, remainingSeconds),
    totalLimit: maxRequests,
  };
}

export function getClientIp(reqHeaders: Headers): string {
  const forwardedFor = reqHeaders.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = reqHeaders.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}
