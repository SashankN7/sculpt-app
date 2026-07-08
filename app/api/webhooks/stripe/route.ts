import { NextRequest, NextResponse } from 'next/server'
import { validateEnv, features } from '@/lib/env'

validateEnv()
const HAS_STRIPE = features.hasStripe

// Server-side PostHog — initialized once at module level
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let posthogClient: any = null
function getPosthogClient() {
  if (posthogClient) return posthogClient
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (!posthogKey) return null
  try {
    // Dynamic import to avoid bundling posthog-node in client builds
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const PostHogModule = require('posthog-node') as { PostHog: typeof import('posthog-node').PostHog }
    posthogClient = new PostHogModule.PostHog(posthogKey, { host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com' })
    return posthogClient
  } catch {
    return null
  }
}

function trackServerEvent(event: string, properties?: Record<string, unknown>, distinctId?: string) {
  try {
    const client = getPosthogClient()
    if (!client) return
    client.capture({ event, distinctId: distinctId || 'server', properties })
    client.flush()
  } catch {
    // Don't break webhook if analytics fails
  }
}

export async function POST(request: NextRequest) {
  if (!HAS_STRIPE) {
    return NextResponse.json({ received: true, simulated: true })
  }

  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!stripeKey || !webhookSecret || !supabaseUrl || !serviceKey) {
      console.error('Stripe webhook: missing required environment variables')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(stripeKey)

    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    let event
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      )
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid signature'
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, serviceKey)

    // Handle subscription events
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object
        const customerId = subscription.customer as string
        const subscriptionId = subscription.id
        const status = subscription.status
        const trialEnd = subscription.trial_end as number | null
        const plan = subscription.metadata?.plan || 'annual'
        const userId = subscription.metadata?.user_id as string | undefined

        // Track subscription events
        trackServerEvent(`subscription_${event.type === 'customer.subscription.created' ? 'created' : 'updated'}`, {
          subscription_id: subscriptionId,
          customer_id: customerId,
          status,
          plan,
          event_type: event.type,
        }, userId)

        // Determine tier from status
        let tier = 'free'
        if (status === 'trialing') {
          tier = 'trial'
        } else if (status === 'active') {
          tier = 'premium'
        }

        const updateData: Record<string, unknown> = {
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          tier,
          subscription_plan: plan,
          updated_at: new Date().toISOString(),
        }

        // Track trial dates
        if (status === 'trialing' && trialEnd) {
          updateData.trial_started_at = new Date((subscription.trial_start as number || Date.now() / 1000) * 1000).toISOString()
          updateData.trial_ends_at = new Date(trialEnd * 1000).toISOString()
        }

        // Update or create user profile
        const { error } = await supabase
          .from('user_profiles')
          .upsert(updateData, {
            onConflict: 'stripe_customer_id',
          })

        if (error) {
          console.error('Failed to update user profile:', error)
        } else {
          console.log(`Subscription ${event.type}: ${subscriptionId} — tier: ${tier}`)
        }
        break
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        const customerId = subscription.customer as string
        const deletedUserId = subscription.metadata?.user_id as string | undefined

        // Track subscription cancellation
        trackServerEvent('subscription_cancelled', {
          subscription_id: subscription.id,
          customer_id: customerId,
        }, deletedUserId)

        // Set user back to free tier
        const { error } = await supabase
          .from('user_profiles')
          .upsert({
            stripe_customer_id: customerId,
            tier: 'free',
            stripe_subscription_id: null,
            subscription_plan: null,
            trial_started_at: null,
            trial_ends_at: null,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'stripe_customer_id',
          })

        if (error) {
          console.error('Failed to downgrade user:', error)
        } else {
          console.log(`Subscription deleted: ${subscription.id} — tier: free`)
        }
        break
      }
      case 'checkout.session.completed': {
        const session = event.data.object as {
          metadata?: { type?: string; user_id?: string; credits?: string; product?: string; plan?: string }
          customer?: string
          amount_total?: number | null
          currency?: string | null
          payment_status?: string | null
          subscription?: string | null
        }
        const userId = session.metadata?.user_id
        const revenue = session.amount_total ? session.amount_total / 100 : 0 // cents to dollars

        // Track checkout completed with revenue
        trackServerEvent('checkout_completed', {
          type: session.metadata?.type || 'subscription',
          product: session.metadata?.product || 'sculpt-premium',
          plan: session.metadata?.plan || 'annual',
          revenue,
          currency: session.currency || 'usd',
          payment_status: session.payment_status || 'unknown',
          has_subscription: !!session.subscription,
        }, userId)

        break
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as { id?: string; amount_paid?: number; currency?: string; customer?: string; subscription?: string }
        trackServerEvent('payment_succeeded', {
          invoice_id: invoice.id,
          amount: invoice.amount_paid ? invoice.amount_paid / 100 : 0,
          currency: invoice.currency || 'usd',
          customer_id: invoice.customer,
          is_subscription: !!invoice.subscription,
        })
        console.log(`Payment succeeded: ${invoice.id}`)
        break
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as { id?: string; amount_due?: number; currency?: string; customer?: string }
        trackServerEvent('payment_failed', {
          invoice_id: invoice.id,
          amount: invoice.amount_due ? invoice.amount_due / 100 : 0,
          currency: invoice.currency || 'usd',
          customer_id: invoice.customer,
        })
        console.log(`Payment failed: ${invoice.id}`)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: unknown) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
