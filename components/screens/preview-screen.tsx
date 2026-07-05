"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useApp } from "@/lib/app-context"
import { PREVIEW_PACK_PRICING } from "@/lib/types"
import { ChevronLeft, Sparkles, Loader2, Eye, AlertTriangle, ShoppingBag, Check } from "lucide-react"

export function PreviewScreen() {
  const { state, navigateTo, goBack, addPreviewCredits, previewRecommendation } = useApp()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPurchaseSuccess, setShowPurchaseSuccess] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  // Get user ID from Supabase auth on mount
  useEffect(() => {
    async function getUserId() {
      try {
        const { createClient } = await import("@/lib/supabase")
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.id) setUserId(user.id)
      } catch {
        // Guest user — no userId
      }
    }
    getUserId()
  }, [])

  const recommendation = previewRecommendation
  const hasCredits = state.previewCredits > 0

  const handleGeneratePreview = async () => {
    if (!recommendation || !state.uploadedImages.front) {
      setError('No photo available. Please upload a photo first.')
      return
    }

    if (!hasCredits) {
      return
    }

    setIsGenerating(true)
    setError(null)
    setPreviewUrl(null)

    try {
      // Server handles credit validation and deduction (source of truth)
      const res = await fetch('/api/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frontImage: state.uploadedImages.front,
          recommendation,
          userId,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Preview generation failed')
      }

      // Server already decremented — sync local state to match
      if (typeof data.creditsRemaining === 'number') {
        addPreviewCredits(data.creditsRemaining - state.previewCredits)
      }
      setPreviewUrl(data.previewUrl)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate preview'
      setError(message)
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePurchasePack = async () => {
    try {
      const res = await fetch('/api/preview-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: state.email }),
      })

      const data = await res.json()

      if (data.simulated) {
        // Local dev — add credits directly
        addPreviewCredits(data.creditsAdded)
        setShowPurchaseSuccess(true)
        setTimeout(() => setShowPurchaseSuccess(false), 2000)
        return
      }

      if (data.url) {
        window.location.href = data.url
        return
      }

      throw new Error(data.error || 'Purchase failed')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Purchase failed'
      setError(message)
    }
  }

  // Purchase success state
  if (showPurchaseSuccess) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <div className="w-20 h-20 rounded-full bg-success/20 border-2 border-success flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-success" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {PREVIEW_PACK_PRICING.credits} Credits Added!
          </h2>
          <p className="text-sm text-muted-foreground">
            You can now preview {PREVIEW_PACK_PRICING.credits} hairstyles on your photo.
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-2">
        <button
          onClick={goBack}
          className="flex items-center gap-1 text-sm text-foreground hover:text-gold transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          BACK
        </button>
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-gold" />
          <span className="text-xs font-medium text-gold">{state.previewCredits} credits</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 pt-4 pb-6 overflow-y-auto mx-auto w-full max-w-lg">
        <div className="px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Title */}
          <h2 className="text-xl font-semibold text-foreground mb-1 text-center">
            HAIRCUT PREVIEW
          </h2>
          <p className="text-sm text-muted-foreground mb-6 text-center">
            See how <span className="text-gold font-medium">{recommendation?.name || 'this style'}</span> looks on you.
          </p>

          {/* Preview area */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {/* Original photo */}
            <div className="text-center">
              <div className="relative h-48 bg-secondary border border-border rounded-xl overflow-hidden flex items-center justify-center">
                {state.uploadedImages.front ? (
                  <img src={state.uploadedImages.front} alt="Your photo" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-muted-foreground text-center px-2">
                    <Eye className="w-8 h-8 mx-auto mb-1 opacity-30" />
                    <span className="text-[10px]">No photo</span>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground tracking-wider uppercase mt-1.5 block">
                You Now
              </span>
            </div>

            {/* Preview */}
            <div className="text-center">
              <div className={`relative h-48 rounded-xl overflow-hidden flex items-center justify-center ${
                previewUrl
                  ? 'border border-gold bg-secondary'
                  : 'border-2 border-dashed border-border bg-secondary'
              }`}>
                {isGenerating ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-gold animate-spin" />
                    <span className="text-[10px] text-muted-foreground">Generating...</span>
                  </div>
                ) : previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center px-2">
                    <Sparkles className="w-8 h-8 mx-auto mb-1 text-gold opacity-40" />
                    <span className="text-[10px] text-muted-foreground">AI preview</span>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-gold tracking-wider uppercase mt-1.5 block font-medium">
                With {recommendation?.name || 'Style'}
              </span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-error/10 border border-error/30 rounded-xl mb-4">
              <AlertTriangle className="w-4 h-4 text-error flex-shrink-0" />
              <p className="text-xs text-error">{error}</p>
            </div>
          )}

          {/* Generate button or Purchase button */}
          {hasCredits ? (
            <button
              onClick={handleGeneratePreview}
              disabled={isGenerating || !state.uploadedImages.front}
              className="w-full py-4 px-6 bg-gold text-gold-foreground font-semibold rounded-xl transition-all hover:bg-gold/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Preview...
                </>
              ) : previewUrl ? (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate New Preview
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Preview ({state.previewCredits} left)
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handlePurchasePack}
              className="w-full py-4 px-6 bg-gold text-gold-foreground font-semibold rounded-xl transition-all hover:bg-gold/90 flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              Get {PREVIEW_PACK_PRICING.credits} Previews — ${PREVIEW_PACK_PRICING.price}
            </button>
          )}

          {/* Credit info */}
          {!hasCredits && (
            <div className="mt-4 p-4 bg-secondary border border-border rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingBag className="w-4 h-4 text-gold" />
                <span className="text-xs font-medium text-foreground">Preview Pack</span>
              </div>
              <ul className="space-y-1.5">
                <li className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Check className="w-3 h-3 text-success" />
                  {PREVIEW_PACK_PRICING.credits} high-quality AI previews
                </li>
                <li className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Check className="w-3 h-3 text-success" />
                  Side-by-side comparison with your photo
                </li>
                <li className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Check className="w-3 h-3 text-success" />
                  Just ${PREVIEW_PACK_PRICING.price} — one-time purchase
                </li>
              </ul>
            </div>
          )}
        </motion.div>
        </div>
      </div>
    </div>
  )
}
