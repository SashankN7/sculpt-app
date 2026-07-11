"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { useApp } from "@/lib/app-context"
import { track } from "@/lib/posthog"
import { canLogHaircut } from "@/lib/gamification"
import { ChevronLeft, Camera, Loader2, Check, X, Scissors } from "lucide-react"

export function LogCutScreen() {
  const { state, navigateTo, goBack, logHaircut, addLoggedCut } = useApp()
  const { savedRecommendations, currentScanIds } = state
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [styleName, setStyleName] = useState("")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Get the last saved card name as default style
  const currentSavedCards = currentScanIds.length > 0
    ? savedRecommendations.filter(r => currentScanIds.includes(r.id))
    : savedRecommendations
  const defaultStyleName = currentSavedCards.length > 0
    ? currentSavedCards[currentSavedCards.length - 1].name
    : ""

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      setPhotoUrl(result)
    }
    reader.readAsDataURL(file)
  }

  // Cooldown check
  const haircutCooldown = canLogHaircut(state.gamification.lastCutLoggedDate)

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      const hairstyleName = styleName.trim() || defaultStyleName || "Haircut"

      // Check cooldown before logging
      if (haircutCooldown.allowed) {
        logHaircut(hairstyleName)
      }

      // Store the logged cut with photo
      addLoggedCut({
        id: `cut-${Date.now()}`,
        date: new Date().toISOString(),
        hairstyleName,
        photoUrl,
        notes: notes.trim(),
      })

      track("haircut_logged", { has_photo: !!photoUrl, style: hairstyleName })

      setShowSuccess(true)
      await new Promise(resolve => setTimeout(resolve, 1200))
      navigateTo("dashboard")
    } catch {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center px-4 md:px-6 py-2">
        <button
          onClick={goBack}
          className="flex items-center gap-1 text-sm text-foreground hover:text-gold transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          BACK
        </button>
      </div>

      <div className="flex-1 pt-4 overflow-y-auto">
        <div className="px-6 md:px-8 mx-auto w-full max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Title */}
            <h2 className="text-xl font-semibold text-foreground mb-1">
              LOG YOUR CUT
            </h2>
            <p className="text-sm text-muted-foreground mb-2">
              Just got a fresh haircut? Log it here to track your grooming journey.
            </p>
            <div className="bg-gold/10 border border-gold/30 rounded-lg p-3 mb-6">
              <p className="text-[11px] text-gold font-medium">
                ✂️ This is for logging cuts you&apos;ve already gotten — not for tracking growth between cuts.
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                Use &quot;Progress Photos&quot; to track how your hair grows out between visits.
              </p>
            </div>

            {/* Photo Capture */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full mb-4 rounded-xl border-2 border-dashed border-border hover:border-gold/50 transition-colors overflow-hidden"
            >
              {photoUrl ? (
                <div className="relative aspect-[4/3]">
                  <img
                    src={photoUrl}
                    alt="Your haircut"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setPhotoUrl(null)
                      }}
                      className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 rounded-lg">
                    <span className="text-[10px] text-white font-medium">Tap to retake</span>
                  </div>
                </div>
              ) : (
                <div className="aspect-[4/3] flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center">
                    <Camera className="w-8 h-8 text-gold" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Take a photo</p>
                    <p className="text-[10px] text-muted-foreground">or choose from gallery</p>
                  </div>
                </div>
              )}
            </button>

            {/* Style Name */}
            <div className="mb-3">
              <label className="text-[10px] font-medium text-gold tracking-wider uppercase mb-1.5 block">
                HAIRSTYLE NAME
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Scissors className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={styleName}
                  onChange={(e) => setStyleName(e.target.value)}
                  placeholder={defaultStyleName || "e.g. Low Taper Fade"}
                  className="w-full pl-11 pr-4 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all text-sm"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="text-[10px] font-medium text-gold tracking-wider uppercase mb-1.5 block">
                NOTES (OPTIONAL)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How's the cut? Any adjustments for next time?"
                rows={3}
                className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all text-sm resize-none"
              />
            </div>

            {/* Submit Button */}
            <motion.button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`relative w-full py-4 px-6 font-semibold rounded-xl transition-all overflow-hidden ${
                isSubmitting
                  ? 'bg-gold/50 text-gold-foreground'
                  : 'bg-gold text-gold-foreground hover:bg-gold/90'
              }`}
              whileTap={!isSubmitting ? { scale: 0.98 } : {}}
            >
              {isSubmitting ? (
                showSuccess ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center justify-center"
                  >
                    <Check className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                )
              ) : (
                <span className="flex items-center justify-center gap-2">
                  LOG THIS CUT
                  <Scissors className="w-4 h-4" />
                </span>
              )}
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
