import { createBrowserClient } from '@supabase/ssr'

// Browser client — used in "use client" components
// Uses localStorage for session persistence so sessions survive
// iOS Safari tab cleanup and browser cookie clearing
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        maxAge: 60 * 60 * 24 * 365, // 1 year
      },
    }
  )
}

// Remember-me helpers using localStorage
const REMEMBER_EMAIL_KEY = 'sculpt_remember_email'
const REMEMBER_ME_KEY = 'sculpt_remember_me'

export function saveRememberedEmail(email: string): void {
  try {
    localStorage.setItem(REMEMBER_EMAIL_KEY, email)
    localStorage.setItem(REMEMBER_ME_KEY, 'true')
  } catch { /* silently fail */ }
}

export function getRememberedEmail(): string | null {
  try {
    if (localStorage.getItem(REMEMBER_ME_KEY) === 'true') {
      return localStorage.getItem(REMEMBER_EMAIL_KEY)
    }
    return null
  } catch { return null }
}

export function clearRememberedEmail(): void {
  try {
    localStorage.removeItem(REMEMBER_EMAIL_KEY)
    localStorage.removeItem(REMEMBER_ME_KEY)
  } catch { /* silently fail */ }
}
