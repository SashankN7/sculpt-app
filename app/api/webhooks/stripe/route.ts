import { NextRequest, NextResponse } from 'next/server'
import { validateEnv, features } from '@/lib/env'

validateEnv()
const HAS_STRIPE = features.hasStripe

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
        const session = event.data.object as { metadata?: { type?: string; user_id?: string; credits?: string }; customer?: string }
        if (session.metadata?.type === 'preview-pack' && session.metadata?.credits) {
          const userId = session.metadata.user_id
          const credits = parseInt(session.metadata.credits, 10)
          if (userId && credits) {
            // Add preview credits to user data
            const { data: userData } = await supabase
              .from('user_data')
              .select('preview_credits')
              .eq('user_id', userId)
              .single()

            const currentCredits = userData?.preview_credits ?? 0
            const { error } = await supabase
              .from('user_data')
              .upsert({
                user_id: userId,
                preview_credits: currentCredits + credits,
                updated_at: new Date().toISOString(),
              }, {
                onConflict: 'user_id',
              })

            if (error) {
              console.error('Failed to add preview credits:', error)
            } else {
              console.log(`Preview pack purchased: ${credits} credits for user ${userId}`)
            }
          }
        }
        break
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object
        console.log(`Payment succeeded: ${invoice.id}`)
        break
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object
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
