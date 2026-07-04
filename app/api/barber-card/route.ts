import { NextRequest, NextResponse } from 'next/server'
import type { HairstyleRecommendation } from '@/lib/types'
import { checkRateLimit } from '@/lib/rate-limit'
import { validateEnv, features } from '@/lib/env'

validateEnv()
const HAS_OPENAI = features.hasOpenAI

function getFallbackBarberCard(recommendation: HairstyleRecommendation) {
  return {
    ...recommendation.barberCard,
    enhancedInstructions: `${recommendation.barberCard.cuttingMetrics.top}. ${recommendation.barberCard.cuttingMetrics.sides}. ${recommendation.barberCard.cuttingMetrics.boundary}.`,
    barberTalkingPoints: [
      `I'd like a ${recommendation.name.toLowerCase().replace(/_/g, ' ')} style`,
      `Keep about ${recommendation.barberCard.cuttingMetrics.top.split(',')[0]} on top`,
      recommendation.barberCard.cuttingMetrics.sides,
    ],
    whatToAvoid: ['Don\'t go too short on top', 'Keep the blend natural'],
    maintenanceNote: 'Schedule a cleanup every 4-6 weeks to maintain the shape.',
  }
}

interface AnalysisResult {
  faceShape: string
  densityScore: number
  textureProfile: { waviness: number; curliness: number; straightness: number }
}

interface CustomCombination {
  name: string
  elements: string[]
  whyItWorks: string
}

interface EnhancedResponse {
  enhancedInstructions?: string
  barberTalkingPoints?: string[]
  whatToAvoid?: string[]
  maintenanceNote?: string
  updatedTop?: string
  updatedSides?: string
  updatedBoundary?: string
  customCombination?: CustomCombination
}

export async function POST(request: NextRequest) {
  // Rate limit: 10 requests per minute per IP
  const { result: rl, response: rlResponse } = await checkRateLimit(request, {
    maxRequests: 10,
    windowMs: 60_000,
    keyPrefix: 'barber-card',
  })
  if (rlResponse) return rlResponse

  try {
    const body = await request.json()
    const { recommendation, analysisResult, topStyles } = body as {
      recommendation: HairstyleRecommendation
      analysisResult?: AnalysisResult
      topStyles?: HairstyleRecommendation[]
    }

    if (!recommendation) {
      return NextResponse.json(
        { error: 'Recommendation data is required' },
        { status: 400 }
      )
    }

    // If no OpenAI key, use fallback barber card (free, no limit)
    if (!HAS_OPENAI) {
      const barberCard = getFallbackBarberCard(recommendation)
      return NextResponse.json({ success: true, barberCard })
    }

    // Daily limit enforcement for AI-enhanced cards
    const { DAILY_USAGE_LIMITS } = await import('@/lib/types')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    let dailyCardCount = 0
    let sbRef: ReturnType<typeof import('@supabase/supabase-js').createClient> | undefined
    let sbUserId: string | undefined
    if (supabaseUrl && serviceKey) {
      const { createClient } = await import('@supabase/supabase-js')
      sbRef = createClient(supabaseUrl, serviceKey)
      const { data: { user } } = await sbRef.auth.getUser()
      if (user) {
        sbUserId = user.id
        const today = new Date().toISOString().split('T')[0]
        const { data: userData } = await sbRef
          .from('user_data')
          .select('barber_cards_today, last_barber_card_date')
          .eq('user_id', user.id)
          .single()
        const userDataRow = userData as Record<string, unknown> | null
        dailyCardCount = userDataRow?.last_barber_card_date === today ? ((userDataRow?.barber_cards_today as number) ?? 0) : 0
        if (dailyCardCount >= DAILY_USAGE_LIMITS.barberCards) {
          return NextResponse.json(
            { error: `Daily barber card limit reached (${DAILY_USAGE_LIMITS.barberCards}/day). Try again tomorrow.` },
            { status: 429 }
          )
        }
      }
    }

    // Real AI-enhanced barber card with GPT-4o-mini
    const { openai } = await import('@/lib/openai')

    const faceShape = analysisResult?.faceShape || 'Not specified'
    const density = analysisResult?.densityScore || 'Not specified'
    const useMixing = topStyles && topStyles.length > 1

    let prompt: string

    if (useMixing) {
      // AI style mixing: combine elements from top recommended styles
      const stylesList = topStyles!.slice(0, 5).map((s, i) => {
        const elements = s.elements && s.elements.length > 0
          ? `\n  Elements: ${s.elements.join(', ')}`
          : ''
        return [
          `Style ${i + 1}: ${s.name} (Score: ${s.compatibilityScore}/100)${elements}`,
          `  Top: ${s.barberCard.cuttingMetrics.top}`,
          `  Sides: ${s.barberCard.cuttingMetrics.sides}`,
          `  Boundary: ${s.barberCard.cuttingMetrics.boundary}`,
          `  Protocols: ${s.barberCard.stylingProtocols.join('; ')}`,
        ].join('\n')
      }).join('\n\n')

      prompt = [
        'You are a professional barber and hairstyling expert.',
        'The user has been recommended several styles based on their face shape and hair type.',
        'Your job is to suggest ONE personalized, cohesive haircut that combines the BEST elements from their top recommended styles.',
        '',
        'USER PROFILE:',
        `- Face Shape: ${faceShape}`,
        `- Hair Density: ${density}/100`,
        `- Primary Style: ${recommendation.name} (Score: ${recommendation.compatibilityScore}/100)`,
        '',
        'TOP RECOMMENDED STYLES:',
        stylesList,
        '',
        'INSTRUCTIONS:',
        '1. Analyze the cutting metrics, textures, protocols, and ELEMENT TAGS from each style',
        '2. Use the Elements tags to understand what features each style offers (e.g., "fade", "texture", "volume", "fringe")',
        '3. Suggest ONE cohesive haircut that combines the best elements — take the top length from one style, the side technique from another, and the texturizing approach from a third',
        '4. The combination should be practical for a barber to execute and cohesive (not just a random mashup)',
        '5. Tailor the suggestion to the user\'s specific face shape and hair density',
        '6. Explain WHY you chose each element and how it benefits this specific user',
        '',
        'Generate a JSON response with exactly these fields:',
        '{',
        '  "enhancedInstructions": "A 2-3 sentence professional summary explaining the custom combination and why it works for this person",',
        '  "barberTalkingPoints": ["3-4 specific phrases to say to the barber, referencing the elements you are combining"],',
        '  "whatToAvoid": ["2-3 things to tell the barber NOT to do"],',
        '  "maintenanceNote": "One sentence about upkeep frequency for this combination",',
        '  "updatedTop": "The recommended top length and technique combining best elements",',
        '  "updatedSides": "The recommended side treatment combining best elements",',
        '  "updatedBoundary": "The recommended boundary and hairline treatment",',
        '  "customCombination": {',
        '    "name": "A short catchy name for this custom style",',
        '    "elements": ["List 2-4 specific elements borrowed from different styles"],',
        '    "whyItWorks": "1-2 sentences explaining why this combination works for the user"',
        '  }',
        '}',
        '',
        'Return ONLY the JSON object.',
      ].join('\n')
    } else {
      // Standard single-style barber card
      prompt = [
        'You are a professional barber communication expert.',
        'Generate detailed, precise barber instructions for this hairstyle recommendation.',
        '',
        `STYLE: ${recommendation.name}`,
        `FACE SHAPE: ${faceShape}`,
        `HAIR DENSITY: ${density}/100`,
        '',
        'EXISTING METRICS:',
        `- Top: ${recommendation.barberCard.cuttingMetrics.top}`,
        `- Sides: ${recommendation.barberCard.cuttingMetrics.sides}`,
        `- Boundary: ${recommendation.barberCard.cuttingMetrics.boundary}`,
        '',
        'STYLE PROTOCOLS:',
        ...recommendation.barberCard.stylingProtocols.map((p: string) => `- ${p}`),
        '',
        'Generate a JSON response with these fields:',
        '{',
        '  "enhancedInstructions": "A 2-3 sentence professional summary the user can read before their appointment",',
        '  "barberTalkingPoints": ["3-4 specific phrases to say to the barber"],',
        '  "whatToAvoid": ["2-3 things to tell the barber NOT to do"],',
        '  "maintenanceNote": "One sentence about upkeep frequency"',
        '}',
        '',
        'Return ONLY the JSON object.',
      ].join('\n')
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a professional barber communication expert. Return only valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 600,
      temperature: 0.4,
    })

    const content = completion.choices[0]?.message?.content

    let enhanced: EnhancedResponse | undefined
    try {
      const jsonMatch = content?.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        enhanced = JSON.parse(jsonMatch[0])
      }
    } catch {
      // Fall back to default
    }

    // Increment daily count after AI call
    if (sbRef && sbUserId) {
      const today = new Date().toISOString().split('T')[0]
      await sbRef
        .from('user_data')
        // @ts-expect-error - barber_cards_today and last_barber_card_date exist in DB but not yet in generated types
        .update({ barber_cards_today: dailyCardCount + 1, last_barber_card_date: today })
        .eq('user_id', sbUserId)
    }

    if (!enhanced) {
      return NextResponse.json({
        success: true,
        barberCard: getFallbackBarberCard(recommendation),
      })
    }

    // Build the response — include customCombination if AI mixing was used
    const cuttingMetrics = { ...recommendation.barberCard.cuttingMetrics }

    // If AI mixing was used, override cutting metrics with the combined suggestion
    if (useMixing && enhanced.customCombination) {
      if (enhanced.updatedTop) cuttingMetrics.top = enhanced.updatedTop
      if (enhanced.updatedSides) cuttingMetrics.sides = enhanced.updatedSides
      if (enhanced.updatedBoundary) cuttingMetrics.boundary = enhanced.updatedBoundary
    }

    const barberCard: Record<string, unknown> = {
      ...recommendation.barberCard,
      cuttingMetrics,
      enhancedInstructions: enhanced.enhancedInstructions,
      barberTalkingPoints: enhanced.barberTalkingPoints,
      whatToAvoid: enhanced.whatToAvoid,
      maintenanceNote: enhanced.maintenanceNote,
    }

    // Include customCombination in the response when mixing was used
    if (useMixing && enhanced.customCombination) {
      barberCard.customCombination = enhanced.customCombination
    }

    return NextResponse.json({
      success: true,
      barberCard,
    })
  } catch (error: unknown) {
    console.error('Barber card error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Barber card generation failed: ${message}` },
      { status: 500 }
    )
  }
}
