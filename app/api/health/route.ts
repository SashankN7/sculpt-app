import { NextResponse } from 'next/server'

// Health check endpoint — pings Supabase to prevent free-tier database pause
// Use with an external cron service (e.g., cron-job.org) to ping every 2-3 days
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ status: 'ok', supabase: 'not configured' })
    }

    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, serviceKey)

    // Simple query to keep the database active
    const { error } = await supabase.from('user_profiles').select('user_id').limit(1)

    if (error) {
      return NextResponse.json({ status: 'ok', supabase: 'query failed but awake', error: error.message })
    }

    return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() })
  } catch {
    return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() })
  }
}
