"use client"

import { motion } from "framer-motion"
import { useApp } from "@/lib/app-context"
import { AlertTriangle, RefreshCw, ChevronRight } from "lucide-react"

export function LowConfidenceScreen() {
  const { navigateTo, resetUpload } = useApp()

  const handleRetake = () => {
    resetUpload()
    navigateTo('upload')
  }

  const handleContinue = () => {
    navigateTo('recommendations')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center px-4 py-2">
        <div className="flex items-center gap-2 text-warning">
          <AlertTriangle className="w-5 h-5" />
          <span className="text-sm font-medium">Analysis Warning</span>
        </div>
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
            POOR PHOTO VISIBILITY DIAGNOSED
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Our engine struggled to accurately trace features.
          </p>

          {/* Reasons */}
          <div className="bg-secondary border border-border rounded-xl p-4 mb-8">
            <p className="text-sm font-medium text-foreground mb-3">
              Possible reasons detected:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-warning mt-0.5">•</span>
                Severe backlighting/shadows masking chin profile.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-warning mt-0.5">•</span>
                Camera angle tilted too high.
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <motion.button
              onClick={handleRetake}
              className="flex items-center justify-center gap-2 w-full py-4 px-6 bg-gold text-gold-foreground font-semibold rounded-xl transition-all hover:bg-gold/90"
              whileTap={{ scale: 0.98 }}
            >
              <RefreshCw className="w-5 h-5" />
              RE-TAKE HIGH CONTRAST PHOTO
            </motion.button>

            <button
              onClick={handleContinue}
              className="flex items-center justify-center gap-2 w-full py-4 px-6 bg-secondary border border-border text-foreground font-medium rounded-xl transition-all hover:bg-secondary/80"
            >
              CONTINUE WITH UNVERIFIED RESULTS
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-4">
            (Warning: Recommendations may be highly general)
          </p>
        </motion.div>
      </div>
    </div>
  )
}
