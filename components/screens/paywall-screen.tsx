"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useApp } from "@/lib/app-context"
import { PRICING } from "@/lib/types"
import { track } from "@/lib/posthog"
import { X, Crown, Check, Loader2, Sparkles, Zap, Calendar, ArrowRight, Eye } from "lucide-react"

export function PaywallScreen() {
  const { state, navigateTo, setUserSession, startTrial, goBack } = useApp()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingAction, setProcessingAction] = useState<'trial' | 'subscribe' | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [successType, setSuccessType] = useState<'trial' | 'subscribe'>('trial')
  const [error, setError] = useState<string | null>(null)

  const handleStartTrial = async () => {
    track('trial_started', { plan: billingCycle })
    setIsProcessing(true)
    setProcessingAction('trial')
    setError(null)

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: state.email,
          plan: billingCycle,
          trial: true,
        }),
      })

      const data = await res.json()

      if (data.simulated) {
        // No Stripe configured — simulate trial start for local dev
        await new Promise(resolve => setTimeout(resolve, 1200))
        startTrial()
        setSuccessType('trial')
        setIsSuccess(true)
        await new Promise(resolve => setTimeout(resolve, 1000))
        navigateTo('dashboard')
        return
      }

      if (data.url) {
        window.location.href = data.url
        return
      }

      throw new Error(data.error || 'Failed to start trial')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
      setIsProcessing(false)
    }
  }

  const handleSubscribe = async () => {
    track('checkout_initiated', { plan: billingCycle, trial: false })
    setIsProcessing(true)
    setProcessingAction('subscribe')
    setError(null)

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: state.email,
          plan: billingCycle,
          trial: false,
        }),
      })

      const data = await res.json()

      if (data.simulated) {
        await new Promise(resolve => setTimeout(resolve, 1200))
        setUserSession('premium')
        setSuccessType('subscribe')
        setIsSuccess(true)
        await new Promise(resolve => setTimeout(resolve, 1000))
        navigateTo('dashboard')
        return
      }

      if (data.url) {
        window.location.href = data.url
        return
      }

      throw new Error(data.error || 'Checkout failed')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Payment failed'
      setError(message)
      setIsProcessing(false)
    }
  }

  const premiumFeatures = [
    { text: 'Real GPT-4o Vision photo analysis', highlight: true },
    { text: 'AI grooming chat assistant', highlight: true },
    { text: 'Enhanced barber cards with personalized tips', highlight: false },
    { text: 'Download barber cards as PDFs', highlight: false },
    { text: 'Automatic maintenance reminders', highlight: false },
    { text: 'Style evolution tracking', highlight: false },
  ]

  const annualSavings = Math.round((1 - (PRICING.annual.price / (PRICING.monthly.price * 12))) * 100)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center px-4 md:px-6 py-2">
        <button
          onClick={goBack}
          className="flex items-center gap-1 text-sm text-foreground hover:text-gold transition-colors"
        >
          <X className="w-5 h-5" />
          CLOSE
        </button>
      </div>

      <div className="flex-1 pt-6 pb-6 flex flex-col items-center text-center overflow-y-auto">
        <div className="px-6 md:px-8 w-full mx-auto max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full"
        >
          {/* Icon */}
          <motion.div
            className="w-16 h-16 mx-auto mb-5 rounded-full bg-gold/20 flex items-center justify-center"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Crown className="w-8 h-8 text-gold" />
          </motion.div>

          {/* Title */}
          <h2 className="text-xl font-semibold text-foreground mb-1">
            UNLOCK SCULPT PREMIUM
          </h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
            Real GPT-4o Vision analysis of your face shape, hair density, and texture from your photos — not just questionnaire answers.
          </p>

          {/* Free vs Premium comparison */}
          <div className="bg-secondary border border-border rounded-xl mb-5 text-left overflow-hidden">
            {/* Free Tier */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-gold">FREE TIER</span>
                <span className="text-[10px] text-gold/70">· very limited</span>
              </div>
              <ul className="space-y-1.5">
                <li className="flex items-center gap-2 text-[11px] text-gold">
                  <span className="w-1 h-1 rounded-full bg-gold" />
                  <span className="font-bold">NO AI photo analysis — photos are ignored</span>
                </li>
                <li className="flex items-center gap-2 text-[11px] text-gold">
                  <span className="w-1 h-1 rounded-full bg-gold" />
                  <span className="font-bold">Questionnaire answers only — no face/density/texture detection</span>
                </li>
                <li className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                  No AI chat assistant
                </li>
                <li className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                  No PDF barber card export
                </li>
              </ul>
            </div>
            {/* Premium Tier */}
            <div className="p-4 bg-gold/5">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-3.5 h-3.5 text-gold" />
                <span className="text-xs font-semibold text-gold">PREMIUM / TRIAL</span>
                <span className="text-[10px] text-gold/70">· same features</span>
              </div>
              <ul className="space-y-1.5">
                <li className="flex items-center gap-2 text-[11px] text-foreground">
                  <Check className="w-3 h-3 text-gold flex-shrink-0" />
                  Unlimited scans
                </li>
                <li className="flex items-center gap-2 text-[11px] text-foreground">
                  <Check className="w-3 h-3 text-gold flex-shrink-0" />
                  10 real GPT-4o Vision analyses per day
                </li>
                <li className="flex items-center gap-2 text-[11px] text-foreground">
                  <Check className="w-3 h-3 text-gold flex-shrink-0" />
                  30 AI chat messages per day
                </li>
                <li className="flex items-center gap-2 text-[11px] text-foreground">
                  <Check className="w-3 h-3 text-gold flex-shrink-0" />
                  PDF barber card export
                </li>
              </ul>

            </div>
          </div>

          {/* Billing Toggle */}
          <div className="bg-secondary border border-border rounded-xl p-1 mb-5">
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`py-2.5 px-3 rounded-lg text-xs font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-background border border-border text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`py-2.5 px-3 rounded-lg text-xs font-medium transition-all relative ${
                  billingCycle === 'annual'
                    ? 'bg-background border-2 border-gold text-foreground shadow-sm ring-1 ring-gold/30'
                    : 'border border-gold/40 text-foreground hover:bg-gold/5'
                }`}
              >
                Annual
                <span className="ml-1.5 text-[10px] text-gold font-bold">
                  Save {annualSavings}%
                </span>
                {billingCycle !== 'annual' && (
                  <span className="absolute -top-2 right-1 text-[9px] bg-gold text-background px-1.5 py-0.5 rounded-full font-bold shadow-sm">
                    BEST VALUE
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Price Display */}
          <AnimatePresence mode="wait">
            <motion.div
              key={billingCycle}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="mb-5"
            >
              {billingCycle === 'annual' ? (
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    ${PRICING.annual.price}
                    <span className="text-sm font-normal text-muted-foreground">/year</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    That's just ${PRICING.annual.monthlyEquivalent.toFixed(2)}/mo — save ${annualSavings}% vs monthly
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    ${PRICING.monthly.price}
                    <span className="text-sm font-normal text-muted-foreground">/month</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Billed monthly. Cancel anytime.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* What you're missing banner */}
          <div className="bg-gold/10 border-2 border-gold/30 rounded-xl p-4 mb-5 text-left">
            <p className="text-sm font-bold text-gold mb-2">
              ⚠️ WHAT YOU'RE MISSING ON FREE:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-[11px]">
                <span className="text-gold mt-0.5">✕</span>
                <span className="text-foreground"><span className="font-bold">No face shape detection</span> from your photos</span>
              </li>
              <li className="flex items-start gap-2 text-[11px]">
                <span className="text-gold mt-0.5">✕</span>
                <span className="text-foreground"><span className="font-bold">No hair density or texture analysis</span></span>
              </li>
              <li className="flex items-start gap-2 text-[11px]">
                <span className="text-gold mt-0.5">✕</span>
                <span className="text-foreground"><span className="font-bold">Recommendations based on guesses</span>, not your actual face</span>
              </li>
              <li className="flex items-start gap-2 text-[11px]">
                <span className="text-gold mt-0.5">✕</span>
                <span className="text-foreground">No AI chat, no PDF export</span>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div className="bg-gold/5 border border-gold/20 rounded-xl p-4 mb-5 text-left">
            <p className="text-sm font-bold text-gold mb-3">
              ✨ PREMIUM INCLUDES:
            </p>
            <ul className="space-y-2.5">
              {premiumFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${feature.highlight ? 'text-gold' : 'text-success'}`} />
                  <span className={feature.highlight ? 'text-foreground font-medium' : ''}>
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-error mb-4">{error}</p>
          )}

          {/* Primary CTA — Start Free Trial */}
          <motion.button
            onClick={handleStartTrial}
            disabled={isProcessing}
            className="relative flex items-center justify-center gap-2 w-full py-4 px-6 bg-gold text-gold-foreground font-semibold rounded-xl transition-all hover:bg-gold/90 disabled:opacity-70 mb-3"
            whileTap={!isProcessing ? { scale: 0.98 } : {}}
          >
            {isSuccess ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2"
              >
                <Check className="w-5 h-5" />
                {successType === 'trial' ? 'Your trial has started!' : 'Welcome to Premium!'}
              </motion.div>
            ) : isProcessing && processingAction === 'trial' ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Starting your trial...
              </span>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                START 30-DAY FREE TRIAL
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>

          {/* Trial info */}
          <p className="text-[11px] text-muted-foreground mb-4">
            <Calendar className="w-3 h-3 inline mr-1" />
            {PRICING.trialDays}-day free trial · No charge until trial ends · Cancel anytime
          </p>

          {/* Secondary CTA — Subscribe now (skip trial) */}
          <button
            onClick={handleSubscribe}
            disabled={isProcessing}
            className="w-full py-3 px-6 border-2 border-gold text-white text-sm font-semibold rounded-xl hover:bg-gold/10 transition-colors mb-3 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isProcessing && processingAction === 'subscribe' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-white">Processing...</span>
              </>
            ) : (
              <span className="text-white">
                Subscribe without trial — {billingCycle === 'annual' ? PRICING.annual.label : PRICING.monthly.label}
              </span>
            )}
          </button>

          {/* Footer Links */}
          <div className="flex items-center justify-center gap-4 mt-6 text-xs text-muted-foreground">
            <button className="hover:text-foreground transition-colors">
              Restore Purchase
            </button>
            <span>·</span>
            <button className="hover:text-foreground transition-colors">
              Privacy
            </button>
            <span>·</span>
            <button className="hover:text-foreground transition-colors">
              Terms
            </button>
          </div>
        </motion.div>
        </div>
      </div>
    </div>
  )
}
