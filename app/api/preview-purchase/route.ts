import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { validateEnv, features } from '@/lib/env'
import { PREVIEW_PACK_PRICING } from '@/lib/types'

validateEnv()
const HAS_STRIPE = features.hasStripe

export async function POST(request: NextRequest) {
  // If no Stripe, simulate the purchase for local dev
  if (!HAS_STRIPE) {
    let userId = 'local-dev-user'
    try {
      const body = await request.json()
      userId = body.userId || userId
    } catch {
      // body not provided
    }

    // For simulated mode, add credits directly via client state
    return NextResponse.json({
      success: true,
      simulated: true,
      creditsAdded: PREVIEW_PACK_PRICING.credits,
      message: 'Stripe not configured — simulated preview pack purchase',
    })
  }

  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY
    if (!stripeKey) {
      return NextResponse.json(
        { error: 'Stripe is not configured on this server.' },
        { status: 503 }
      )
    }
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(stripeKey)

    // Get the authenticated user
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await request.json().catch(() => ({}))
    const email = user?.email || body.email || ''

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Sculpt Preview Pack',
              description: `${PREVIEW_PACK_PRICING.credits} haircut previews — see how each style looks on you before your appointment.`,
              metadata: {
                type: 'preview-pack',
                credits: String(PREVIEW_PACK_PRICING.credits),
              },
            },
            unit_amount: Math.round(PREVIEW_PACK_PRICING.price * 100), // $2.99 in cents
          },
          quantity: 1,
        },
      ],
      ...(email ? { customer_email: email } : {}),
      success_url: `${features.appUrl}/?preview_purchase=success`,
      cancel_url: `${features.appUrl}/?preview_purchase=cancelled`,
      metadata: {
        type: 'preview-pack',
        user_id: user?.id || '',
        credits: String(PREVIEW_PACK_PRICING.credits),
      },
    })

    return NextResponse.json({ success: true, url: session.url })
  } catch (error: unknown) {
    console.error('Preview purchase error:', error)
    const message = error instanceof Error ? error.message : 'Purchase failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
