import { NextRequest, NextResponse } from 'next/server'
import { validateEnv, features } from '@/lib/env'
import { checkRateLimit } from '@/lib/rate-limit'
import type { HairstyleRecommendation } from '@/lib/types'

validateEnv()
const HAS_REPLICATE = features.hasReplicate
const HAS_OPENAI = features.hasOpenAI

// Helper to refund a preview credit on failure
async function refundCredit(userId: string | undefined) {
  if (!userId) return
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceKey) {
      console.error('Failed to refund preview credit: Supabase credentials missing')
      return
    }
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, serviceKey)
    const { data: userData } = await supabase
      .from('user_data')
      .select('preview_credits')
      .eq('user_id', userId)
      .single()
    if (userData) {
      await supabase
        .from('user_data')
        .update({ preview_credits: userData.preview_credits + 1 })
        .eq('user_id', userId)
    }
  } catch {
    console.error('Failed to refund preview credit')
  }
}

export async function POST(request: NextRequest) {
  // Rate limit: 10 preview generations per minute per IP
  const { result: rl, response: rlResponse } = await checkRateLimit(request, {
    maxRequests: 10,
    windowMs: 60_000,
    keyPrefix: 'preview',
  })
  if (rlResponse) return rlResponse

  let userId: string | undefined

  try {
    const body = await request.json()
    const { frontImage, recommendation, userId: bodyUserId } = body as {
      frontImage: string
      recommendation: HairstyleRecommendation
      userId?: string
    }

    userId = bodyUserId

    if (!frontImage || !recommendation) {
      return NextResponse.json(
        { error: 'Front image and recommendation data are required' },
        { status: 400 }
      )
    }

    if (!HAS_REPLICATE && !HAS_OPENAI) {
      return NextResponse.json(
        { error: 'Preview generation not available — no AI provider configured.' },
        { status: 503 }
      )
    }

    // Require authentication for preview generation
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required for preview generation.' },
        { status: 401 }
      )
    }

    // Server-side Supabase client + credit enforcement
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: 'Server configuration error — Supabase credentials missing.' },
        { status: 500 }
      )
    }
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, serviceKey)

    // Fetch user data (previews are purchased, not subscription-based)
    const { data: userData, error: fetchError } = await supabase
      .from('user_data')
      .select('preview_credits')
      .eq('user_id', userId)
      .single()

    // Check credit balance
    if (fetchError || !userData || userData.preview_credits <= 0) {
      return NextResponse.json(
        { error: 'No preview credits remaining. Purchase a preview pack ($2.99 for 5 previews) to continue.' },
        { status: 402 }
      )
    }

    // Atomically decrement credits (server is source of truth)
    const { error: decrementError } = await supabase
      .from('user_data')
      .update({
        preview_credits: userData.preview_credits - 1,
      })
      .eq('user_id', userId)
      .eq('preview_credits', userData.preview_credits) // Optimistic lock

    if (decrementError) {
      return NextResponse.json(
        { error: 'Failed to use preview credit. Please try again.' },
        { status: 500 }
      )
    }

    let previewUrl: string

    if (HAS_OPENAI) {
      // Use OpenAI gpt-image-1 for high-quality hairstyle preview
      const { default: OpenAI } = await import('openai')
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

      const styleDescription = [
        recommendation.name,
        recommendation.barberCard.cuttingMetrics.top,
        recommendation.barberCard.cuttingMetrics.sides,
      ].join('. ')

      const response = await openai.images.generate({
        model: 'gpt-image-1',
        prompt: `A photorealistic portrait of a man with the same face and facial features as the reference photo, but with this specific haircut: ${styleDescription}. The hairstyle should look natural, well-groomed, and professionally styled. Maintain the same lighting, angle, and background as the original photo. High quality, professional photography style.`,
        n: 1,
        size: '1024x1024',
        quality: 'medium',
      })

      if (!response.data || response.data.length === 0 || !response.data[0].url) {
        await refundCredit(userId)
        return NextResponse.json(
          { error: 'Preview generation failed — no output returned' },
          { status: 500 }
        )
      }

      previewUrl = response.data[0].url
    } else {
      // Use Replicate with wty-ustc/hairclip for virtual try-on
      const Replicate = (await import('replicate')).default
      const replicate = new Replicate({
        auth: process.env.REPLICATE_API_TOKEN,
      })

      // Convert base64 data URL to a File object for Replicate
      const base64Data = frontImage.split(',')[1] || frontImage
      const mimeMatch = frontImage.match(/data:([^;]+);/)
      const mimeType = mimeMatch?.[1] || 'image/jpeg'
      const buffer = Buffer.from(base64Data, 'base64')
      const blob = new Blob([buffer], { type: mimeType })
      const file = new File([blob], 'photo.jpg', { type: mimeType })

      const styleDescription = [
        recommendation.name,
        recommendation.barberCard.cuttingMetrics.top,
        recommendation.barberCard.cuttingMetrics.sides,
      ].join('. ')

      const output = await replicate.run(
        'wty-ustc/hairclip:b95cb2a1',
        {
          input: {
            input_image: file,
            text: `A professional men's haircut: ${styleDescription}. Clean, modern grooming style.`,
            operation: 'hairstyle',
          },
        }
      ) as string[]

      if (!output || output.length === 0) {
        await refundCredit(userId)
        return NextResponse.json(
          { error: 'Preview generation failed — no output returned' },
          { status: 500 }
        )
      }

      previewUrl = output[0]
    }

    // Return the new credit count so client can sync without double-decrementing
    const { data: updatedData } = await supabase
      .from('user_data')
      .select('preview_credits')
      .eq('user_id', userId)
      .single()

    return NextResponse.json({
      success: true,
      previewUrl,
      creditsRemaining: updatedData?.preview_credits ?? 0,
    })
  } catch (error: unknown) {
    console.error('Preview generation error:', error)
    // Refund credit on any failure
    await refundCredit(userId)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Preview generation failed: ${message}` },
      { status: 500 }
    )
  }
}
