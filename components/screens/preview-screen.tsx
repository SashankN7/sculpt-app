"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { useApp } from "@/lib/app-context"
import { PREVIEW_PACK_PRICING } from "@/lib/types"
import { ChevronLeft, Sparkles, Loader2, Eye, AlertTriangle, ShoppingBag, Check, Camera } from "lucide-react"

export function PreviewScreen() {
  const { state, navigateTo, goBack, addPreviewCredits, previewRecommendation, setUploadedImage } = useApp()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPurchaseSuccess, setShowPurchaseSuccess] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

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
  const hasPhoto = !!state.uploadedImages.front

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const url = ev.target?.result as string
      setUploadedImage('front', url)
      setError(null)
    }
    reader.readAsDataURL(file)
    // Reset input so the same file can be re-selected
    e.target.value = ''
  }

  const handleGeneratePreview = async () => {
    if (!recommendation) {
      setError('No style selected. Please save a hairstyle first, then try previewing it.')
      return
    }

    if (!hasPhoto) {
      setError('Please take or upload a front-facing photo before generating a preview.')
      return
    }

    if (!hasCredits) {
      return
    }

    setIsGenerating(true)
    setError(null)
    setPreviewUrl(null)

    try {
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

  // No saved style selected
  if (!recommendation) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 md:px-6 py-2">
          <button
            onClick={goBack}
            className="flex items-center gap-1 text-sm text-foreground hover:text-gold transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            BACK
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-gold" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">No Style Selected</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-[280px]">
            Save at least one hairstyle from your recommendations to preview it on your photo. You can do this by completing an analysis first.
          </p>
          <button
            onClick={() => navigateTo('recommendation-detail')}
            className="w-full py-3 px-6 bg-gold text-gold-foreground font-semibold rounded-xl hover:bg-gold/90 transition-colors"
          >
            View My Recommendations
          </button>
          <button
            onClick={goBack}
            className="w-full mt-2 py-3 px-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
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
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoCapture}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={handlePhotoCapture}
      />

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
      <div className="flex-1 pt-4 pb-6 overflow-y-auto">
        <div className="px-6 md:px-8 mx-auto w-full max-w-lg">
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
            See how <span className="text-gold font-medium">{recommendation.name}</span> looks on you.
          </p>

          {/* Preview area */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {/* Original photo — with camera/upload controls */}
            <div className="text-center">
              <div className="relative h-48 bg-secondary border border-border rounded-xl overflow-hidden flex items-center justify-center group">
                {hasPhoto ? (
                  <>
                    <img src={state.uploadedImages.front!} alt="Your photo" className="w-full h-full object-cover" />
                    {/* Always-visible camera button for mobile */}
                    <button
                      onClick={() => cameraInputRef.current?.click()}
                      className="absolute bottom-2 right-2 p-1.5 bg-gold rounded-lg text-gold-foreground hover:bg-gold/90 transition-colors shadow-lg"
                      title="Change photo"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 px-2">
                    <Camera className="w-8 h-8 text-muted-foreground opacity-30" />
                    <span className="text-[10px] text-muted-foreground mb-1">No photo yet</span>
                    <button
                      onClick={() => cameraInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gold/10 border border-gold/30 rounded-lg text-[10px] font-medium text-gold hover:bg-gold/15 transition-colors"
                    >
                      <Camera className="w-3 h-3" />
                      Take Photo
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary border border-border rounded-lg text-[10px] font-medium text-muted-foreground hover:text-foreground hover:border-muted-foreground/50 transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      Upload
                    </button>
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
                With {recommendation.name}
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

          {/* Missing photo warning */}
          {!hasPhoto && hasCredits && (
            <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/30 rounded-xl mb-4">
              <Camera className="w-4 h-4 text-warning flex-shrink-0" />
              <p className="text-xs text-warning">Take or upload a front-facing photo to generate a preview.</p>
            </div>
          )}

          {/* Generate button or Purchase button */}
          {hasCredits ? (
            <button
              onClick={handleGeneratePreview}
              disabled={isGenerating || !hasPhoto}
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
