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
    const { recommendation, analysisResult } = body as {
      recommendation: HairstyleRecommendation
      analysisResult?: {
        faceShape: string
        densityScore: number
        textureProfile: { waviness: number; curliness: number; straightness: number }
      }
    }

    if (!recommendation) {
      return NextResponse.json(
        { error: 'Recommendation data is required' },
        { status: 400 }
      )
    }

    // If no OpenAI key, use fallback barber card
    if (!HAS_OPENAI) {
      const barberCard = getFallbackBarberCard(recommendation)
      return NextResponse.json({ success: true, barberCard })
    }

    // Real AI-enhanced barber card with GPT-4o-mini
    const { openai } = await import('@/lib/openai')

    const prompt = `You are a professional barber communication expert. Generate detailed, precise barber instructions for this hairstyle recommendation.

STYLE: ${recommendation.name}
FACE SHAPE: ${analysisResult?.faceShape || 'Not specified'}
HAIR DENSITY: ${analysisResult?.densityScore || 'Not specified'}/100

EXISTING METRICS:
- Top: ${recommendation.barberCard.cuttingMetrics.top}
- Sides: ${recommendation.barberCard.cuttingMetrics.sides}
- Boundary: ${recommendation.barberCard.cuttingMetrics.boundary}

STYLE PROTOCOLS:
${recommendation.barberCard.stylingProtocols.map((p: string) => `- ${p}`).join('\n')}

Generate a JSON response with these fields:
{
  "enhancedInstructions": "A 2-3 sentence professional summary the user can read before their appointment",
  "barberTalkingPoints": ["3-4 specific phrases to say to the barber"],
  "whatToAvoid": ["2-3 things to tell the barber NOT to do"],
  "maintenanceNote": "One sentence about upkeep frequency"
}

Return ONLY the JSON object.`

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
      max_tokens: 500,
      temperature: 0.4,
    })

    const content = completion.choices[0]?.message?.content

    let enhanced
    try {
      const jsonMatch = content?.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        enhanced = JSON.parse(jsonMatch[0])
      }
    } catch {
      // Fall back to default
    }

    if (!enhanced) {
      return NextResponse.json({
        success: true,
        barberCard: getFallbackBarberCard(recommendation),
      })
    }

    return NextResponse.json({
      success: true,
      barberCard: {
        ...recommendation.barberCard,
        enhancedInstructions: enhanced.enhancedInstructions,
        barberTalkingPoints: enhanced.barberTalkingPoints,
        whatToAvoid: enhanced.whatToAvoid,
        maintenanceNote: enhanced.maintenanceNote,
      },
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
