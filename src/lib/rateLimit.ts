const rateLimit = new Map<string, { count: number, resetTime: number }>();

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = 5; // 5 requests
  const windowMs = 60 * 60 * 1000; // 1 hour

  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  const record = rateLimit.get(ip)!;
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count += 1;
  return true;
}
