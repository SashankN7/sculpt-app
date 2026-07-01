/**
 * Rate limiting utility for Sculpt API routes.
 *
 * Two strategies:
 *  1. In-memory sliding window (fast, works in dev / single-server)
 *  2. Supabase-backed (persistent, works across serverless instances)
 *
 * Falls back gracefully: if Supabase is unreachable the in-memory store
 * is used so requests are never silently dropped.
 */

import { NextRequest, NextResponse } from 'next/server'

// ── Types ────────────────────────────────────────────────────

export interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  maxRequests: number
  /** Window duration in milliseconds (default 60 000 = 1 min) */
  windowMs?: number
  /** Unique key prefix to namespace different route limits */
  keyPrefix?: string
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  limit: number
  resetMs: number
}

// ── In-memory sliding-window store ───────────────────────────

const hits = new Map<string, number[]>()

function cleanup() {
  const now = Date.now()
  for (const [key, timestamps] of hits) {
    const fresh = timestamps.filter(t => t > now - 10 * 60 * 1000)
    if (fresh.length === 0) hits.delete(key)
    else hits.set(key, fresh)
  }
}

// Run cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanup, 5 * 60 * 1000)
}

function inMemoryCheck(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now()
  const windowMs = config.windowMs ?? 60_000
  const timestamps = hits.get(key) ?? []
  const windowStart = now - windowMs

  // Keep only timestamps inside the current window
  const valid = timestamps.filter(t => t > windowStart)
  const allowed = valid.length < config.maxRequests

  if (allowed) {
    valid.push(now)
  }
  hits.set(key, valid)

  const oldest = valid[0] ?? now
  return {
    allowed,
    remaining: Math.max(0, config.maxRequests - valid.length),
    limit: config.maxRequests,
    resetMs: oldest + windowMs,
  }
}

// ── Supabase-backed store (persistent across cold starts) ────

async function supabaseCheck(
  identifier: string,
  endpoint: string,
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceKey) {
      // Fall back to in-memory rate limiting when Supabase is not configured
      return inMemoryCheck(identifier, config)
    }
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, serviceKey)

    const windowMs = config.windowMs ?? 60_000
    const windowStart = new Date(Date.now() - windowMs).toISOString()

    // Count requests in the window
    const { count, error: countError } = await supabase
      .from('scan_usage')
      .select('id', { count: 'exact', head: true })
      .eq('endpoint', endpoint)
      .or(`user_id.eq.${identifier},ip_address.eq.${identifier}`)
      .gte('created_at', windowStart)

    if (countError) throw countError

    const current = count ?? 0
    const allowed = current < config.maxRequests

    if (allowed) {
      // Record this request
      await supabase.from('scan_usage').insert({
        endpoint,
        ...(identifier.includes('.')
          ? { ip_address: identifier }
          : { user_id: identifier }),
      })
    }

    return {
      allowed,
      remaining: Math.max(0, config.maxRequests - current - (allowed ? 1 : 0)),
      limit: config.maxRequests,
      resetMs: Date.now() + windowMs,
    }
  } catch {
    // Supabase unavailable — fall back to in-memory
    return inMemoryCheck(identifier, config)
  }
}

// ── Public API ───────────────────────────────────────────────

/**
 * Check and enforce rate limiting for a request.
 *
 * @param request  - The incoming Next.js request
 * @param config   - Rate limit configuration
 * @returns        - RateLimitResult + sets standard headers on response
 */
export async function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig,
): Promise<{ result: RateLimitResult; response?: NextResponse }> {
  const keyPrefix = config.keyPrefix ?? 'api'
  const endpoint = keyPrefix

  // Identify the caller: prefer authenticated user ID, fall back to IP
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() ?? '127.0.0.1'
  const identifier = ip

  const key = `${keyPrefix}:${identifier}`
  const result = await supabaseCheck(identifier, endpoint, config)

  if (!result.allowed) {
    const retryAfter = Math.ceil((result.resetMs - Date.now()) / 1000)
    const response = NextResponse.json(
      {
        error: 'Too many requests. Please try again later.',
        retryAfter,
      },
      { status: 429 },
    )
    response.headers.set('X-RateLimit-Limit', String(result.limit))
    response.headers.set('X-RateLimit-Remaining', '0')
    response.headers.set('X-RateLimit-Reset', String(Math.ceil(result.resetMs / 1000)))
    response.headers.set('Retry-After', String(retryAfter))
    return { result, response }
  }

  return { result, response: undefined }
}

/**
 * Apply rate-limit headers to a successful response.
 */
export function applyRateLimitHeaders(
  response: NextResponse,
  result: RateLimitResult,
): NextResponse {
  response.headers.set('X-RateLimit-Limit', String(result.limit))
  response.headers.set('X-RateLimit-Remaining', String(result.remaining))
  response.headers.set('X-RateLimit-Reset', String(Math.ceil(result.resetMs / 1000)))
  return response
}
