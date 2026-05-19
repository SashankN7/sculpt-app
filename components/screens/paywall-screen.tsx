"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useApp } from "@/lib/app-context"
import { X, Unlock, Crown, Check } from "lucide-react"

export function PaywallScreen() {
  const { navigateTo, setUserSession, goBack } = useApp()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleUpgrade = async () => {
    setIsProcessing(true)
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsSuccess(true)
    setUserSession('premium')
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    goBack() // Go back to barber card with premium access
  }

  const features = [
    'Unlimited barber specifications text downloads.',
    'PDF offline card downloads to photos roll.',
    'Multi-angle layout visual reference library views.',
    'Automatic 4-week haircut maintenance tracking app.',
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center px-4 py-2">
        <button 
          onClick={goBack}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
          CLOSE
        </button>
      </div>

      <div className="flex-1 px-6 pt-8 pb-6 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full"
        >
          {/* Icon */}
          <motion.div 
            className="w-16 h-16 mx-auto mb-6 rounded-full bg-gold/20 flex items-center justify-center"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Unlock className="w-8 h-8 text-gold" />
          </motion.div>

          {/* Title */}
          <h2 className="text-xl font-semibold text-foreground mb-4">
            UNLOCK ALL BARBER CARDS
          </h2>
          <p className="text-sm text-muted-foreground mb-8 max-w-xs mx-auto">
            Take your precise AI haircut blueprints directly to the shop and guarantee perfect execution.
          </p>

          {/* Features */}
          <div className="bg-secondary border border-border rounded-xl p-4 mb-8 text-left">
            <p className="text-sm font-medium text-foreground mb-4">
              PREMIUM ACCESS PASS INCLUDES:
            </p>
            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Upgrade Button */}
          <motion.button
            onClick={handleUpgrade}
            disabled={isProcessing}
            className="relative flex items-center justify-center gap-2 w-full py-4 px-6 bg-gold text-gold-foreground font-semibold rounded-xl transition-all hover:bg-gold/90 disabled:opacity-70"
            whileTap={!isProcessing ? { scale: 0.98 } : {}}
          >
            {isSuccess ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2"
              >
                <Check className="w-5 h-5" />
                Welcome to Premium!
              </motion.div>
            ) : isProcessing ? (
              <span className="flex items-center gap-2">
                <motion.div
                  className="w-5 h-5 border-2 border-gold-foreground/30 border-t-gold-foreground rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                Processing...
              </span>
            ) : (
              <>
                <Crown className="w-5 h-5" />
                UPGRADE NOW — $15.00 / MONTH
              </>
            )}
          </motion.button>

          {!isProcessing && !isSuccess && (
            <p className="text-xs text-muted-foreground mt-3">
              Cancel execution anytime seamlessly.
            </p>
          )}

          {/* Footer Links */}
          <div className="flex items-center justify-center gap-4 mt-8 text-xs text-muted-foreground">
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
  )
}
