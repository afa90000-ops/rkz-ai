type RateWindow = { count: number; resetAt: number }
const store = new Map<string, RateWindow>()

// Prune expired entries periodically to prevent memory leak
setInterval(() => {
  const now = Date.now()
  for (const [k, v] of store) if (now > v.resetAt) store.delete(k)
}, 60_000)

export function rateLimit(
  key: string,
  max: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetInMs: number } {
  const now = Date.now()
  const w = store.get(key)

  if (!w || now > w.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: max - 1, resetInMs: windowMs }
  }

  if (w.count >= max) {
    return { allowed: false, remaining: 0, resetInMs: w.resetAt - now }
  }

  w.count++
  return { allowed: true, remaining: max - w.count, resetInMs: w.resetAt - now }
}

export function getClientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}
