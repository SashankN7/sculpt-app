"use client"

import { useRef } from "react"
import { motion } from "framer-motion"
import { useApp } from "@/lib/app-context"
import { Home, ThumbsUp, ThumbsDown, Camera, ChevronRight } from "lucide-react"

export function FeedbackScreen() {
  const { state, navigateTo, setFeedbackMatched, setFeedbackPhoto } = useApp()
  const { feedbackData } = state
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setFeedbackPhoto(url)
    }
  }

  const handleSubmit = () => {
    // In real app, would send feedback to backend
    navigateTo('history')
  }

  const handleGoHome = () => {
    navigateTo('landing')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center px-4 py-2">
        <button 
          onClick={handleGoHome}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Home className="w-5 h-5" />
          HOME
        </button>
      </div>

      <div className="flex-1 px-6 pt-4 pb-6 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex-1"
        >
          {/* Title */}
          <h2 className="text-xl font-semibold text-foreground mb-2">
            RATE YOUR FRESH CUT
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Help us perfect your AI scoring weight accuracy.
          </p>

          {/* Question */}
          <p className="text-sm text-foreground mb-6">
            {"Did your barber's result match the prediction goal?"}
          </p>

          {/* Yes/No Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <button
              onClick={() => setFeedbackMatched(true)}
              className={`flex flex-col items-center justify-center gap-2 py-6 px-4 rounded-xl border transition-all ${
                feedbackData.matched === true
                  ? 'bg-success/20 border-success text-success'
                  : 'bg-secondary border-border text-muted-foreground hover:border-muted-foreground/50'
              }`}
            >
              <ThumbsUp className="w-8 h-8" />
              <span className="text-sm font-medium">YES, MATCHED WELL</span>
            </button>

            <button
              onClick={() => setFeedbackMatched(false)}
              className={`flex flex-col items-center justify-center gap-2 py-6 px-4 rounded-xl border transition-all ${
                feedbackData.matched === false
                  ? 'bg-error/20 border-error text-error'
                  : 'bg-secondary border-border text-muted-foreground hover:border-muted-foreground/50'
              }`}
            >
              <ThumbsDown className="w-8 h-8" />
              <span className="text-sm font-medium">NO, DID NOT MATCH</span>
            </button>
          </div>

          {/* Photo Upload */}
          <button
            onClick={() => inputRef.current?.click()}
            className="w-full bg-secondary border border-border rounded-xl p-4 text-left hover:border-gold/30 transition-colors group mb-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center text-muted-foreground group-hover:text-gold transition-colors">
                <Camera className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground mb-0.5">
                  UPLOAD FRESH POST-CUT PHOTO <span className="text-muted-foreground">(Optional)</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Refines AI calibration dataset matrices.
                </p>
              </div>
            </div>
            {feedbackData.afterPhoto && (
              <div className="mt-3 w-20 h-20 rounded-lg overflow-hidden">
                <img 
                  src={feedbackData.afterPhoto} 
                  alt="Post-cut photo"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </motion.div>

        {/* Submit Button */}
        <motion.button
          onClick={handleSubmit}
          disabled={feedbackData.matched === null}
          className={`flex items-center justify-center gap-2 w-full py-4 px-6 font-semibold rounded-xl transition-all mt-auto ${
            feedbackData.matched !== null
              ? 'bg-gold text-gold-foreground hover:bg-gold/90'
              : 'bg-secondary text-muted-foreground'
          }`}
          whileTap={feedbackData.matched !== null ? { scale: 0.98 } : {}}
        >
          SAVE AND UPDATE
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  )
}
