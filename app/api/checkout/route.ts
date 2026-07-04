import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { validateEnv, features } from '@/lib/env'

validateEnv()
const HAS_STRIPE = features.hasStripe

export async function POST(request: NextRequest) {
  // If no Stripe key, simulate the upgrade for local dev
  if (!HAS_STRIPE) {
    let email = 'user@sculpt.app'
    let trial = false
    let plan = 'annual'
    try {
      const body = await request.json()
      if (body?.email) email = body.email
      if (body?.trial) trial = body.trial
      if (body?.plan) plan = body.plan
    } catch {
      // body not provided or invalid JSON — use default
    }
    return NextResponse.json({
      success: true,
      simulated: true,
      message: 'Stripe not configured — simulated upgrade',
      email,
      trial,
      plan,
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

    // Get the authenticated user to link Stripe customer
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await request.json().catch(() => ({ email: '', plan: 'annual', trial: false }))
    const email = user?.email || body.email || ''
    const plan = body.plan || 'annual' // 'monthly' or 'annual'
    const trial = body.trial ?? false

    // Select the right price ID based on plan
    const annualPriceId = process.env.STRIPE_PRICE_ID_ANNUAL
    const monthlyPriceId = process.env.STRIPE_PRICE_ID_MONTHLY
    if (!annualPriceId || !monthlyPriceId) {
      return NextResponse.json(
        { error: 'Stripe price IDs not configured.' },
        { status: 500 }
      )
    }
    const priceId = plan === 'annual' ? annualPriceId : monthlyPriceId

    const sessionParams: Record<string, unknown> = {
      mode: 'subscription' as const,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      ...(email ? { customer_email: email } : {}),
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?upgraded=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?cancelled=true`,
      metadata: {
        product: 'sculpt-premium',
        user_id: user?.id || '',
        plan,
      },
    }

    // Add 7-day free trial if requested
    if (trial) {
      sessionParams.subscription_data = {
        trial_period_days: 30,
        metadata: {
          product: 'sculpt-premium',
          user_id: user?.id || '',
          plan,
        },
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    return NextResponse.json({ success: true, url: session.url })
  } catch (error: unknown) {
    console.error('Stripe checkout error:', error)
    const message = error instanceof Error ? error.message : 'Checkout failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
