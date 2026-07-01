import { NextRequest, NextResponse } from 'next/server'
import type { HairstyleRecommendation } from '@/lib/types'
import { getFallbackResponse } from '@/lib/chat-fallbacks'
import { checkRateLimit } from '@/lib/rate-limit'
import { validateEnv, features } from '@/lib/env'

validateEnv()
const HAS_OPENAI = features.hasOpenAI

export async function POST(request: NextRequest) {
  // Rate limit: 20 messages per minute per IP
  const { result: rl, response: rlResponse } = await checkRateLimit(request, {
    maxRequests: 20,
    windowMs: 60_000,
    keyPrefix: 'chat',
  })
  if (rlResponse) return rlResponse

  try {
    const body = await request.json()
    const { message, recommendation, analysisResult, chatHistory } = body as {
      message: string
      recommendation?: HairstyleRecommendation
      analysisResult?: {
        faceShape: string
        densityScore: number
        textureProfile: { waviness: number; curliness: number; straightness: number }
      }
      chatHistory?: Array<{ role: 'user' | 'assistant'; content: string }>
    }

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // If no OpenAI key, use fallback responses
    if (!HAS_OPENAI) {
      const response = getFallbackResponse(message, recommendation)
      return NextResponse.json({ success: true, response })
    }

    // Real AI chat with GPT-4o-mini
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

    return NextResponse.json({
      success: true,
      response: responseContent,
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
