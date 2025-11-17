import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

interface RateLimitConfig {
  endpoint: string;
  maxRequests: number;
  windowMs: number;
}

export async function checkRateLimit(
  supabase: SupabaseClient,
  config: RateLimitConfig,
  identifier: string,
  userAgent?: string
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const windowStart = new Date(Date.now() - config.windowMs);

  // Count recent requests from this identifier
  const { data: recentRequests, error } = await supabase
    .from('api_request_log')
    .select('id, created_at')
    .eq('endpoint', config.endpoint)
    .eq('identifier', identifier)
    .gte('created_at', windowStart.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Rate limit check error:', error);
    // Fail open - allow request if we can't check rate limit
    return { allowed: true };
  }

  const requestCount = recentRequests?.length || 0;

  if (requestCount >= config.maxRequests) {
    // Calculate retry-after in seconds
    const oldestRequest = recentRequests[recentRequests.length - 1];
    const oldestTimestamp = new Date(oldestRequest.created_at).getTime();
    const retryAfter = Math.ceil((oldestTimestamp + config.windowMs - Date.now()) / 1000);
    
    return { allowed: false, retryAfter: Math.max(retryAfter, 1) };
  }

  // Log this request
  await supabase
    .from('api_request_log')
    .insert({
      endpoint: config.endpoint,
      identifier,
      user_agent: userAgent?.substring(0, 500), // Limit length
      success: true
    });

  return { allowed: true };
}

export function getClientIdentifier(req: Request): string {
  // Try to get real IP from various headers (CloudFlare, Nginx, etc.)
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const cfConnectingIp = req.headers.get('cf-connecting-ip');
  
  return cfConnectingIp || realIp || forwardedFor?.split(',')[0].trim() || 'unknown';
}
