// Environment variable validation
// Runs once at server startup — fails fast if critical config is missing

const REQUIRED_SERVER_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const

const RECOMMENDED_SERVER_VARS = [
  "OPENAI_API_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_PRICE_ID_MONTHLY",
  "STRIPE_PRICE_ID_ANNUAL",
  "REPLICATE_API_TOKEN",
] as const

let validated = false

export function validateEnv() {
  if (validated) return
  validated = true

  const missing: string[] = []
  const warnings: string[] = []

  for (const key of REQUIRED_SERVER_VARS) {
    if (!process.env[key]) {
      missing.push(key)
    }
  }

  for (const key of RECOMMENDED_SERVER_VARS) {
    if (!process.env[key]) {
      warnings.push(key)
    }
  }

  if (missing.length > 0) {
    console.error(
      `\n🚨 Sculpt: Missing required environment variables:\n   ${missing.join(", ")}\n\n` +
      `   Copy .env.example to .env.local and fill in the values.\n`
    )
    // Don't crash in browser — only throw on server
    if (typeof window === "undefined") {
      throw new Error(`Missing required env vars: ${missing.join(", ")}`)
    }
  }

  if (warnings.length > 0) {
    console.warn(
      `\n⚠️  Sculpt: Optional environment variables not set:\n   ${warnings.join(", ")}\n\n` +
      `   The app will work with fallback/simulated features.\n`
    )
  }
}

// Feature flags derived from env
export const features = {
  get hasOpenAI() {
    return !!process.env.OPENAI_API_KEY
  },
  get hasStripe() {
    return !!process.env.STRIPE_SECRET_KEY
  },
  get hasReplicate() {
    return !!process.env.REPLICATE_API_TOKEN
  },
  get appUrl() {
    return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  },
} as const
