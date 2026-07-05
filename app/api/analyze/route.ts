import { NextRequest, NextResponse } from 'next/server'
import type { QuestionnaireAnswersMap } from '@/lib/types'
import { checkRateLimit } from '@/lib/rate-limit'
import { validateEnv, features } from '@/lib/env'

validateEnv()
const HAS_OPENAI = features.hasOpenAI

// Smart inference engine — uses questionnaire answers to generate plausible analysis
function inferAnalysisFromQuestionnaire(answers: QuestionnaireAnswersMap) {
  // Infer face shape from multiple signals
  const faceShapes = ['Oval', 'Square', 'Round', 'Rectangle', 'Diamond', 'Heart']
  let faceShape: string

  const maintenance = answers['maintenance'] as string | undefined
  const activity = answers['activity'] as string[] | undefined
  const hairGoals = answers['hairGoals'] as string[] | undefined
  const workContext = answers['workContext'] as string | undefined
  const concerns = answers['hairConcerns'] as string[] | undefined
  const boldness = answers['boldness'] as number | undefined
  const socialSignals = answers['socialSignals'] as string | undefined

  // Face shape inference from signals
  // Professional/corporate users tend toward oval/square (most common)
  // Creative/athletic users get more variety
  if (workContext === 'critical' || socialSignals === 'competent') {
    faceShape = Math.random() > 0.4 ? 'Oval' : 'Square'
  } else if (activity?.includes('athletic')) {
    faceShape = Math.random() > 0.5 ? 'Square' : 'Rectangle'
  } else if (activity?.includes('creative')) {
    faceShape = ['Diamond', 'Heart', 'Oval'][Math.floor(Math.random() * 3)]
  } else {
    faceShape = faceShapes[Math.floor(Math.random() * faceShapes.length)]
  }

  // Density inference from hair concerns
  let densityScore: number
  if (concerns?.includes('thinning') || concerns?.includes('scalp')) {
    densityScore = Math.round(30 + Math.random() * 20) // 30-50 range (thinning)
  } else if (concerns?.includes('flat')) {
    densityScore = Math.round(40 + Math.random() * 25) // 40-65 range (flat/limp)
  } else if (concerns?.includes('none')) {
    densityScore = Math.round(60 + Math.random() * 25) // 60-85 range (healthy)
  } else {
    densityScore = Math.round(45 + Math.random() * 35) // 45-80 range (default)
  }

  // Texture inference from concerns + maintenance
  let w = 0.35, c = 0.15, s = 0.50

  if (concerns?.includes('frizzy')) {
    // Frizzy suggests curlier texture
    w = 0.30 + Math.random() * 0.2
    c = 0.25 + Math.random() * 0.2
    s = 0.10
  } else if (maintenance === 'zero' || maintenance === 'low') {
    // Low maintenance users often have straighter hair
    w = 0.20 + Math.random() * 0.15
    c = 0.05 + Math.random() * 0.10
    s = 0.55 + Math.random() * 0.15
  } else if (concerns?.includes('oily')) {
    // Oily hair is often straighter
    w = 0.15 + Math.random() * 0.15
    c = 0.10 + Math.random() * 0.10
    s = 0.55 + Math.random() * 0.15
  } else {
    // Add some randomness for variety
    w = 0.25 + Math.random() * 0.30
    c = 0.05 + Math.random() * 0.20
    s = 0.25 + Math.random() * 0.25
  }

  // Normalize to sum to 1
  const total = w + c + s
  w = Math.round((w / total) * 100) / 100
  c = Math.round((c / total) * 100) / 100
  s = Math.round((1 - w - c) * 100) / 100

  // Confidence based on how many questionnaire signals we have
  let signalCount = 0
  if (maintenance) signalCount++
  if (activity && activity.length > 0) signalCount++
  if (hairGoals && hairGoals.length > 0) signalCount++
  if (workContext) signalCount++
  if (concerns && concerns.length > 0) signalCount++
  if (boldness !== undefined) signalCount++
  if (socialSignals) signalCount++

  // More answers = higher confidence
  const confidenceScore = Math.round((0.55 + (signalCount / 7) * 0.35) * 100) / 100

  const warnings: string[] = []
  if (signalCount < 3) {
    warnings.push('Limited questionnaire responses — completing more questions improves accuracy.')
  }
  warnings.push('Inferred from questionnaire responses — add OPENAI_API_KEY for real photo-based analysis.')

  return {
    faceShape,
    densityScore,
    textureProfile: { waviness: w, curliness: c, straightness: s },
    confidenceScore,
    warnings,
  }
}

export async function POST(request: NextRequest) {
  // Rate limit: 5 analyses per minute per IP
  const { result: rl, response: rlResponse } = await checkRateLimit(request, {
    maxRequests: 5,
    windowMs: 60_000,
    keyPrefix: 'analyze',
  })
  if (rlResponse) return rlResponse

  try {
    const body = await request.json()
    const { frontImage, sideImage, hairlineImage, questionnaireAnswers, userSession, scanCountToday } = body as {
      frontImage?: string
      sideImage?: string
      hairlineImage?: string
      questionnaireAnswers?: QuestionnaireAnswersMap
      userSession?: string
      scanCountToday?: number
    }

    if (!frontImage) {
      return NextResponse.json(
        { error: 'Front photo is required' },
        { status: 400 }
      )
    }

    // Free tier gets 1 real AI analysis to hook them, then random inference for subsequent scans
    // Premium/trial users get daily-limited real analysis
    const isFirstFreeScan = userSession !== 'premium' && userSession !== 'trial' && (scanCountToday ?? 0) === 0
    const isPremiumOrTrial = userSession === 'premium' || userSession === 'trial'
    let useRealAI = HAS_OPENAI && (isPremiumOrTrial || isFirstFreeScan)

    // Enforce daily limit for premium/trial users
    let analysesToday = 0
    let supabaseUserId: string | undefined
    let supabaseRef: ReturnType<typeof import('@supabase/supabase-js').createClient> | undefined
    if (useRealAI && isPremiumOrTrial) {
      const { DAILY_USAGE_LIMITS } = await import('@/lib/types')
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (supabaseUrl && serviceKey) {
        const { createClient } = await import('@supabase/supabase-js')
        supabaseRef = createClient(supabaseUrl, serviceKey)
        const { data: { user } } = await supabaseRef.auth.getUser()
        if (user) {
          supabaseUserId = user.id
          const today = new Date().toISOString().split('T')[0]
          const { data: userData } = await supabaseRef
            .from('user_data')
            .select('analyses_today, last_analysis_date')
            .eq('user_id', user.id)
            .single()
          const userDataRow = userData as Record<string, unknown> | null
          analysesToday = userDataRow?.last_analysis_date === today ? ((userDataRow?.analyses_today as number) ?? 0) : 0
          if (analysesToday >= DAILY_USAGE_LIMITS.analyses) {
            useRealAI = false // Fall back to questionnaire inference
          }
        }
      }
    }

    if (!useRealAI) {
      const analysis = inferAnalysisFromQuestionnaire(questionnaireAnswers || {})
      return NextResponse.json({ success: true, analysis })
    }

    // Real AI analysis with GPT-4o Vision
    const { openai } = await import('@/lib/openai')

    let promptText = `You are a professional facial analysis AI for a grooming recommendation app called Sculpt. Analyze this person's face and hair from the uploaded photo.

Please provide a JSON analysis with exactly these fields:
{
  "faceShape": one of "oval", "square", "round", "rectangle", "diamond", "heart", "triangle",
  "densityScore": number 0-100 (0=extremely sparse/thin, 100=extremely dense/thick hair),
  "textureProfile": {
    "waviness": number 0-1,
    "curliness": number 0-1,
    "straightness": number 0-1
  },
  "confidenceScore": number 0-1 (how confident you are in this analysis),
  "warnings": array of strings (any concerns about image quality or analysis limitations)
}

Guidelines:
- For densityScore: Consider visible hair volume, scalp visibility, and overall thickness
- For textureProfile: The three values should roughly sum to 1.0
- For faceShape: Look at jawline, cheekbones, forehead width, and overall proportions
- Be honest about confidence — low lighting or bad angles should reduce confidence
- Include warnings for any issues (poor lighting, obstructed view, etc.)

Return ONLY the JSON object, no other text.`

    if (sideImage) {
      promptText += '\n\nA side profile image has also been provided for additional jawline and density analysis.'
    }
    if (hairlineImage) {
      promptText += '\n\nA hairline exposure image has been provided for hairline recession analysis.'
    }

    type ContentPart = { type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }

    const imageContent: ContentPart[] = [
      { type: 'text', text: promptText },
      { type: 'image_url', image_url: { url: frontImage } },
    ]

    if (sideImage) {
      imageContent.push({ type: 'image_url', image_url: { url: sideImage } })
    }
    if (hairlineImage) {
      imageContent.push({ type: 'image_url', image_url: { url: hairlineImage } })
    }

    let content: string | undefined
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: imageContent,
          },
        ],
        max_tokens: 1000,
        temperature: 0.3,
      })
      content = completion.choices[0]?.message?.content
    } catch (aiError: unknown) {
      // OpenAI call failed (quota, network, etc.) — fall back to questionnaire inference
      console.warn('OpenAI analysis failed, falling back to questionnaire inference:', aiError)
      const analysis = inferAnalysisFromQuestionnaire(questionnaireAnswers || {})
      analysis.warnings.push('AI photo analysis unavailable — used questionnaire inference instead.')
      return NextResponse.json({ success: true, analysis })
    }

    if (!content) {
      return NextResponse.json(
        { error: 'No analysis returned from AI' },
        { status: 500 }
      )
    }

    // Parse the JSON response
    let analysis
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }
      analysis = JSON.parse(jsonMatch[0])
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse AI analysis', raw: content },
        { status: 500 }
      )
    }

    // Validate and normalize the response
    const validFaceShapes = ['oval', 'square', 'round', 'rectangle', 'diamond', 'heart', 'triangle']
    if (!validFaceShapes.includes(analysis.faceShape?.toLowerCase())) {
      analysis.faceShape = 'oval'
    }

    analysis.faceShape = analysis.faceShape.charAt(0).toUpperCase() + analysis.faceShape.slice(1).toLowerCase()
    analysis.densityScore = Math.max(0, Math.min(100, Number(analysis.densityScore) || 65))
    analysis.confidenceScore = Math.max(0, Math.min(1, Number(analysis.confidenceScore) || 0.7))

    if (!analysis.textureProfile) {
      analysis.textureProfile = { waviness: 0.4, curliness: 0.2, straightness: 0.4 }
    }

    const total = analysis.textureProfile.waviness + analysis.textureProfile.curliness + analysis.textureProfile.straightness
    if (total > 0) {
      analysis.textureProfile.waviness /= total
      analysis.textureProfile.curliness /= total
      analysis.textureProfile.straightness /= total
    }

    if (!Array.isArray(analysis.warnings)) {
      analysis.warnings = []
    }

    // Increment daily counter after successful analysis
    if (supabaseRef && supabaseUserId) {
      const today = new Date().toISOString().split('T')[0]
      await supabaseRef
        .from('user_data')
        // @ts-expect-error - analyses_today and last_analysis_date exist in DB but not yet in generated types
        .update({ analyses_today: analysesToday + 1, last_analysis_date: today })
        .eq('user_id', supabaseUserId)
    }

    return NextResponse.json({
      success: true,
      analysis: {
        faceShape: analysis.faceShape,
        densityScore: Math.round(analysis.densityScore),
        textureProfile: {
          waviness: Math.round(analysis.textureProfile.waviness * 100) / 100,
          curliness: Math.round(analysis.textureProfile.curliness * 100) / 100,
          straightness: Math.round(analysis.textureProfile.straightness * 100) / 100,
        },
        confidenceScore: Math.round(analysis.confidenceScore * 100) / 100,
        warnings: analysis.warnings,
      },
    })
  } catch (error: unknown) {
    console.error('Analysis error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Analysis failed: ${message}` },
      { status: 500 }
    )
  }
}
