"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { useApp } from "@/lib/app-context"
import { ChevronLeft, Camera, ChevronRight, Check } from "lucide-react"

type MatchRating = 'close' | 'somewhat' | 'different' | null

export function FeedbackScreen() {
  const { state, navigateTo, setFeedbackData } = useApp()
  const { feedbackData, uploadedImages } = state
  const inputRef = useRef<HTMLInputElement>(null)
  const [satisfaction, setSatisfaction] = useState(feedbackData.satisfaction || 7)
  const [matchRating, setMatchRating] = useState<MatchRating>(null)
  const [notes, setNotes] = useState(feedbackData.barberNotes || "")
  const [additionalComments, setAdditionalComments] = useState(feedbackData.additionalComments || "")
  const [submitted, setSubmitted] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setFeedbackData({ afterPhoto: url })
    }
  }

  const handleSubmit = () => {
    setFeedbackData({
      matched: matchRating === 'close',
      barberNotes: notes,
      additionalComments: additionalComments,
      satisfaction: satisfaction,
    })
    setSubmitted(true)
    setTimeout(() => {
      navigateTo('dashboard')
    }, 2000)
  }

  const handleGoBack = () => {
    navigateTo('recommendation-detail')
  }

  const getSatisfactionLabel = (val: number) => {
    if (val <= 3) return 'Needs work'
    if (val <= 5) return 'Decent'
    if (val <= 7) return 'Good'
    return 'Excellent'
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <div className="w-20 h-20 rounded-full bg-gold/20 border-2 border-gold flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-gold" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Profile Updated
          </h2>
          <p className="text-sm text-muted-foreground">
            Your next results will be sharper.
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center px-4 py-2">
        <button
          onClick={handleGoBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          RESULTS
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 px-6 pt-4 pb-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Title */}
          <h2 className="text-xl font-semibold text-foreground mb-1 text-center">
            How Did It Go?
          </h2>
          <p className="text-sm text-muted-foreground mb-6 text-center">
            Your feedback helps Sculpt learn what works for you.
          </p>

          {/* Before / After Comparison */}
          <div className="grid grid-cols-2 gap-2 mb-8">
            {/* Before */}
            <div className="text-center">
              <div className="relative h-40 bg-secondary border border-border rounded-xl overflow-hidden flex items-center justify-center">
                {uploadedImages.front ? (
                  <img src={uploadedImages.front} alt="Before" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-muted-foreground text-center px-2">
                    <Camera className="w-8 h-8 mx-auto mb-1 opacity-30" />
                    <span className="text-[10px]">Original photo</span>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground tracking-wider uppercase mt-1.5 block">
                Before
              </span>
            </div>

            {/* After */}
            <div className="text-center">
              <button
                onClick={() => inputRef.current?.click()}
                className={`relative h-40 rounded-xl overflow-hidden flex items-center justify-center w-full transition-colors ${
                  feedbackData.afterPhoto
                    ? 'border border-gold bg-secondary'
                    : 'border-2 border-dashed border-border bg-secondary hover:border-gold/40'
                }`}
              >
                {feedbackData.afterPhoto ? (
                  <>
                    <img src={feedbackData.afterPhoto} alt="After" className="w-full h-full object-cover" />
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-gold flex items-center justify-center">
                      <Check className="w-3 h-3 text-background" />
                    </div>
                  </>
                ) : (
                  <div className="text-center px-2">
                    <Camera className="w-8 h-8 mx-auto mb-1 text-gold opacity-50" />
                    <span className="text-[10px] text-muted-foreground">Tap to upload</span>
                  </div>
                )}
              </button>
              <span className="text-[10px] text-gold tracking-wider uppercase mt-1.5 block font-medium">
                After
              </span>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Satisfaction Rating */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-foreground">
                How satisfied are you with this haircut?
              </p>
            </div>

            {/* Satisfaction indicator */}
            <div className="text-center mb-2">
              <p className="text-lg font-semibold text-gold">{satisfaction}/10</p>
              <p className="text-xs text-muted-foreground">{getSatisfactionLabel(satisfaction)}</p>
            </div>

            {/* Slider */}
            <div className="relative px-1">
              <input
                type="range"
                min={1}
                max={10}
                value={satisfaction}
                onChange={(e) => setSatisfaction(parseInt(e.target.value))}
                className="w-full h-1.5 bg-secondary rounded-full appearance-none cursor-pointer accent-gold"
                style={{
                  background: `linear-gradient(to right, oklch(0.78 0.12 85) 0%, oklch(0.78 0.12 85) ${(satisfaction - 1) / 9 * 100}%, oklch(0.25 0.01 85) ${(satisfaction - 1) / 9 * 100}%, oklch(0.25 0.01 85) 100%)`,
                }}
              />
              <div className="flex justify-between mt-1.5">
                <span className="text-[10px] text-muted-foreground">Not great</span>
                <span className="text-[10px] text-muted-foreground">Perfect</span>
              </div>
            </div>
          </div>

          {/* Quick Feedback Pills */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-3">
              Did the recommendation match what you got?
            </p>
            <div className="flex gap-2">
              {([
                { value: 'close' as const, label: 'Close match' },
                { value: 'somewhat' as const, label: 'Somewhat' },
                { value: 'different' as const, label: 'Different' },
              ]).map((option) => (
                <button
                  key={option.value}
                  onClick={() => setMatchRating(option.value)}
                  className={`flex-1 py-2.5 px-2 rounded-xl border text-xs font-medium transition-all ${
                    matchRating === option.value
                      ? 'border-gold bg-gold/10 text-gold'
                      : 'border-border bg-secondary text-muted-foreground hover:border-muted-foreground/50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Barber Notes */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-2">
              Anything your barber did differently? <span className="text-muted-foreground/50">(Optional)</span>
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any surprises? Different length? Different fade?"
              className="w-full h-20 bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none focus:border-gold/40 transition-colors"
            />
          </div>

          {/* Additional Comments */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-2">
              Any other comments about your haircut? <span className="text-muted-foreground/50">(Optional)</span>
            </p>
            <textarea
              value={additionalComments}
              onChange={(e) => setAdditionalComments(e.target.value)}
              placeholder="Share any feedback you want Sculpt to consider for future recommendations..."
              className="w-full h-24 bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none focus:border-gold/40 transition-colors"
            />
          </div>
        </motion.div>
      </div>

      {/* Bottom CTA */}
      <div className="px-6 pb-4 pt-2 border-t border-border">
        <motion.button
          onClick={handleSubmit}
          disabled={matchRating === null}
          className={`flex items-center justify-center gap-2 w-full py-4 px-6 font-semibold rounded-xl transition-all ${
            matchRating !== null
              ? 'bg-gold text-gold-foreground hover:bg-gold/90'
              : 'bg-secondary text-muted-foreground'
          }`}
          whileTap={matchRating !== null ? { scale: 0.98 } : {}}
        >
          SUBMIT FEEDBACK
          <ChevronRight className="w-5 h-5" />
        </motion.button>
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          Sculpt will use this to refine your next recommendations.
        </p>
      </div>
    </div>
  )
}
