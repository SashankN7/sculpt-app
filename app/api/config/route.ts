import { NextResponse } from 'next/server'
import { features } from '@/lib/env'
import { DAILY_USAGE_LIMITS } from '@/lib/types'

export async function GET() {
  return NextResponse.json({
    hasOpenAI: features.hasOpenAI,
    hasStripe: features.hasStripe,
    limits: {        free: {
        scansPerDay: 9999,
        aiAnalyses: 1,
        chatMessages: 0,
      },
      premium: {
        scansPerDay: 9999,
        aiAnalyses: DAILY_USAGE_LIMITS.analyses,
        chatMessages: DAILY_USAGE_LIMITS.chatMessages,
        barberCards: DAILY_USAGE_LIMITS.barberCards,
      },
    },
  })
}
