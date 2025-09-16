// Simple client-side rate limiter for form submissions
interface RateLimitEntry {
  count: number;
  lastReset: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 5) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const entry = this.limits.get(identifier);

    if (!entry) {
      this.limits.set(identifier, { count: 1, lastReset: now });
      return true;
    }

    // Reset window if expired
    if (now - entry.lastReset > this.windowMs) {
      entry.count = 1;
      entry.lastReset = now;
      return true;
    }

    // Check if within limits
    if (entry.count >= this.maxRequests) {
      return false;
    }

    entry.count++;
    return true;
  }

  getRemainingTime(identifier: string): number {
    const entry = this.limits.get(identifier);
    if (!entry) return 0;
    
    const elapsed = Date.now() - entry.lastReset;
    return Math.max(0, this.windowMs - elapsed);
  }
}

// Rate limiters for different endpoints
export const contactFormLimiter = new RateLimiter(60000, 3); // 3 requests per minute
export const newsletterLimiter = new RateLimiter(300000, 2); // 2 requests per 5 minutes