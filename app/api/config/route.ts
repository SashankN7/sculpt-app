import { NextResponse } from 'next/server'
import { features } from '@/lib/env'
import { DAILY_USAGE_LIMITS } from '@/lib/types'

export async function GET() {
  return NextResponse.json({
    hasOpenAI: features.hasOpenAI,
    hasStripe: features.hasStripe,
    limits: {
      free: {
        scansPerDay: 9999,  // unlimited for all tiers
        aiAnalyses: 1,       // 1 free AI analysis, then questionnaire-based
        previews: 0,         // separate purchase for all tiers
        chatMessages: 0,
      },
      premium: {
        scansPerDay: 9999,  // unlimited for all tiers
        aiAnalyses: DAILY_USAGE_LIMITS.analyses,
        previews: 0,         // separate purchase for all tiers
        chatMessages: DAILY_USAGE_LIMITS.chatMessages,
        barberCards: DAILY_USAGE_LIMITS.barberCards,
      },
    },
  })
}
