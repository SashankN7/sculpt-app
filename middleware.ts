import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ── Global rate limit (in-memory sliding window) ─────────────
const apiHits = new Map<string, number[]>()

// Clean up stale entries every 5 minutes to prevent memory leak
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, timestamps] of apiHits) {
      const fresh = timestamps.filter(t => t > now - 10 * 60 * 1000)
      if (fresh.length === 0) apiHits.delete(key)
      else apiHits.set(key, fresh)
    }
  }, 5 * 60 * 1000)
}

function globalRateLimit(ip: string, limit: number, windowMs: number): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const key = `global:${ip}`
  const timestamps = (apiHits.get(key) ?? []).filter(t => t > now - windowMs)
  const allowed = timestamps.length < limit
  if (allowed) timestamps.push(now)
  apiHits.set(key, timestamps)
  return { allowed, remaining: Math.max(0, limit - timestamps.length) }
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Middleware: Supabase credentials missing — skipping auth refresh')
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Global rate limit on API routes: 60 requests per minute per IP
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded?.split(',')[0]?.trim() ?? '127.0.0.1'
    const { allowed, remaining } = globalRateLimit(ip, 60, 60_000)

    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please slow down.' },
        { status: 429, headers: { 'Retry-After': '60' } },
      )
    }

    supabaseResponse.headers.set('X-RateLimit-Remaining', String(remaining))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
