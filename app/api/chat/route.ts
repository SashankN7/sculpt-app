import { NextRequest, NextResponse } from 'next/server'
import type { HairstyleRecommendation } from '@/lib/types'
import { getFallbackResponse } from '@/lib/chat-fallbacks'
import { checkRateLimit } from '@/lib/rate-limit'
import { validateEnv, features } from '@/lib/env'

validateEnv()
const HAS_OPENAI = features.hasOpenAI

// Daily message limits per tier (free users are cost-gated)
const DAILY_CHAT_LIMITS: Record<string, number> = {
  guest: 5,
  authenticated: 5,
  trial: 999,   // unlimited
  premium: 999, // unlimited
}

// ── In-memory daily chat counter (guests only — not persisted) ──
const guestChatCounts = new Map<string, { count: number; date: string }>()

function getGuestDailyCount(ip: string): number {
  const today = new Date().toISOString().split('T')[0]
  const entry = guestChatCounts.get(ip)
  if (!entry || entry.date !== today) {
    guestChatCounts.set(ip, { count: 0, date: today })
    return 0
  }
  return entry.count
}

function incrementGuestDailyCount(ip: string): void {
  const today = new Date().toISOString().split('T')[0]
  const entry = guestChatCounts.get(ip)
  if (!entry || entry.date !== today) {
    guestChatCounts.set(ip, { count: 1, date: today })
  } else {
    entry.count++
  }
}

// ── Server-side daily counter for authenticated users (Supabase) ──
async function getServerDailyCount(userId: string): Promise<number> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceKey) return 0

    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, serviceKey)
    const today = new Date().toISOString().split('T')[0]

    const { data } = await supabase
      .from('user_data')
      .select('chat_messages_today, last_chat_date')
      .eq('user_id', userId)
      .single()

    if (!data || data.last_chat_date !== today) return 0
    return data.chat_messages_today ?? 0
  } catch {
    return 0
  }
}

async function incrementServerDailyCount(userId: string): Promise<number> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceKey) return 0

    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, serviceKey)
    const today = new Date().toISOString().split('T')[0]

    const { data } = await supabase
      .from('user_data')
      .select('chat_messages_today, last_chat_date')
      .eq('user_id', userId)
      .single()

    const currentCount = data && data.last_chat_date === today ? (data.chat_messages_today ?? 0) : 0
    const newCount = currentCount + 1

    // Use update + insert to avoid wiping existing user data
    if (data) {
      await supabase
        .from('user_data')
        .update({ chat_messages_today: newCount, last_chat_date: today })
        .eq('user_id', userId)
    } else {
      await supabase
        .from('user_data')
        .insert({ user_id: userId, chat_messages_today: newCount, last_chat_date: today })
    }

    return newCount
  } catch {
    return 0
  }
}

export async function POST(request: NextRequest) {
  // Rate limit: 10 messages per minute per IP
  const { result: rl, response: rlResponse } = await checkRateLimit(request, {
    maxRequests: 10,
    windowMs: 60_000,
    keyPrefix: 'chat',
  })
  if (rlResponse) return rlResponse

  try {
    const body = await request.json()
    const { message, recommendation, analysisResult, chatHistory, userSession, userId } = body as {
      message: string
      recommendation?: HairstyleRecommendation
      analysisResult?: {
        faceShape: string
        densityScore: number
        textureProfile: { waviness: number; curliness: number; straightness: number }
      }
      chatHistory?: Array<{ role: 'user' | 'assistant'; content: string }>
      userSession?: string
      userId?: string
    }

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // If no OpenAI key, use fallback responses (free — no limit needed)
    if (!HAS_OPENAI) {
      const response = getFallbackResponse(message, recommendation)
      return NextResponse.json({ success: true, response })
    }

    // ── Server-side daily limit enforcement ──
    const tier = userSession || 'guest'
    const dailyLimit = DAILY_CHAT_LIMITS[tier] ?? 5

    // Premium/trial users skip the count entirely
    if (dailyLimit < 999) {
      let serverCount = 0

      if (userId) {
        // Authenticated user — count server-side in Supabase
        serverCount = await getServerDailyCount(userId)
      } else {
        // Guest — count by IP
        const forwarded = request.headers.get('x-forwarded-for')
        const ip = forwarded?.split(',')[0]?.trim() ?? '127.0.0.1'
        serverCount = getGuestDailyCount(ip)
      }

      if (serverCount >= dailyLimit) {
        return NextResponse.json(
          {
            error: `You've reached your daily limit of ${dailyLimit} messages. Upgrade to Premium for unlimited chat.`,
            limitReached: true,
          },
          { status: 429 }
        )
      }
    }

    // ── Make AI call ──
    const { openai } = await import('@/lib/openai')

    const systemParts: string[] = [
      'You are Sculpt Assistant — an AI grooming advisor inside the Sculpt app.',
      '',
      'HARD SCOPE — you MUST follow these rules strictly:',
      '- You ONLY answer questions related to: hairstyles, haircuts, hair care, hair products, barber communication, grooming, face shape, hair texture, hair density, styling techniques, maintenance, and anything directly related to the user\'s Sculpt recommendation or analysis.',
      '- You MUST REFUSE any question that is not about hair, grooming, or the user\'s Sculpt results. If the user asks about politics, sports, coding, food, relationships, or ANYTHING else, respond with exactly: "I\'m Sculpt Assistant — I can only help with hairstyles, grooming, and your haircut recommendations. Ask me about your style, maintenance tips, or how to talk to your barber!"',
      '- Do NOT answer riddles, jokes, trivia, or hypothetical questions unless they are directly about hair/grooming.',
      '- Do NOT provide medical advice about hair loss, scalp conditions, or medications. Instead say: "For medical hair concerns, please consult a dermatologist."',
      '',
      'TONE & STYLE:',
      '- Keep responses concise (2-4 sentences max)',
      '- Be helpful, confident, and direct',
      '- Reference the user\'s specific analysis and recommendation when relevant',
      '- Professional, knowledgeable tone — like a trusted barber',
      '- Never guarantee specific results',
    ]

    if (analysisResult) {
      systemParts.push('', `USER'S ANALYSIS: Face shape: ${analysisResult.faceShape}, Hair density: ${analysisResult.densityScore}/100, Texture: wavy=${analysisResult.textureProfile.waviness}, curly=${analysisResult.textureProfile.curliness}, straight=${analysisResult.textureProfile.straightness}`)
    }

    if (recommendation) {
      systemParts.push('', `CURRENT STYLE BEING DISCUSSED: ${recommendation.name} (Compatibility: ${recommendation.compatibilityScore}/100)`)
      systemParts.push(`Maintenance: ${recommendation.metadata.maintenance}/100, Styling effort: ${recommendation.metadata.stylingEffort}/100, Professionalism: ${recommendation.metadata.professionalism}/100, Trendiness: ${recommendation.metadata.trendiness}/100`)
    }

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemParts.join('\n') },
    ]

    if (chatHistory && chatHistory.length > 0) {
      const recentHistory = chatHistory.slice(-10)
      for (const msg of recentHistory) {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        })
      }
    }

    messages.push({ role: 'user', content: message })

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 300,
      temperature: 0.7,
    })

    const responseContent = completion.choices[0]?.message?.content

    if (!responseContent) {
      return NextResponse.json(
        { error: 'No response generated' },
        { status: 500 }
      )
    }

    // ── Increment server-side counter AFTER successful AI call ──
    let remainingMessages = dailyLimit - 1
    if (dailyLimit < 999) {
      if (userId) {
        const newCount = await incrementServerDailyCount(userId)
        remainingMessages = Math.max(0, dailyLimit - newCount)
      } else {
        const forwarded = request.headers.get('x-forwarded-for')
        const ip = forwarded?.split(',')[0]?.trim() ?? '127.0.0.1'
        incrementGuestDailyCount(ip)
        remainingMessages = Math.max(0, dailyLimit - getGuestDailyCount(ip))
      }
    }

    return NextResponse.json({
      success: true,
      response: responseContent,
      messagesRemaining: dailyLimit < 999 ? remainingMessages : undefined,
    })
  } catch (error: unknown) {
    console.error('Chat error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Chat failed: ${message}` },
      { status: 500 }
    )
  }
}
