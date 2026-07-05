import { NextResponse } from 'next/server'
import { features } from '@/lib/env'
import { DAILY_USAGE_LIMITS, SCAN_LIMITS } from '@/lib/types'

export async function GET() {
  return NextResponse.json({
    hasOpenAI: features.hasOpenAI,
    hasStripe: features.hasStripe,
    limits: {
      free: {
        scansPerDay: SCAN_LIMITS.authenticated,
        aiAnalyses: 1,   // 1 free AI analysis, then questionnaire-based inference
        previews: 0,
        chatMessages: 0,
      },
      premium: {
        scansPerDay: SCAN_LIMITS.premium,
        aiAnalyses: DAILY_USAGE_LIMITS.analyses,
        previews: DAILY_USAGE_LIMITS.previews,
        chatMessages: DAILY_USAGE_LIMITS.chatMessages,
        barberCards: DAILY_USAGE_LIMITS.barberCards,
      },
    },
  })
}
