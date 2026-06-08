"use client"

import { motion } from "framer-motion"
import { useApp } from "@/lib/app-context"
import { ChevronLeft, Scissors, AlertTriangle, Share2 } from "lucide-react"

export function BarberCardScreen() {
  const { state, navigateTo, goBack } = useApp()
  const { recommendations, currentRecommendationIndex, userSession } = state
  
  const currentRecommendation = recommendations[currentRecommendationIndex]
  const barberCard = currentRecommendation?.barberCard

  const handleExport = () => {
    if (userSession === 'premium') {
      // In real app, would trigger native share sheet
      alert('Export functionality - would open native share dialog')
    } else {
      navigateTo('paywall')
    }
  }

  if (!barberCard) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-8 text-center">
        <p className="text-muted-foreground">No barber card available</p>
        <button onClick={goBack} className="mt-4 text-gold underline">
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center px-4 py-2">
        <button 
          onClick={goBack}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          BACK TO CARD STACK
        </button>
      </div>

      <div className="flex-1 px-6 pt-4 pb-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Title */}
          <h2 className="text-xl font-semibold text-foreground mb-2">
            BARBER SPECIFICATION CARD
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Show this breakdown block directly to your stylist.
          </p>

          {/* Cutting Metrics Card */}
          <div className="bg-secondary border border-border rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <Scissors className="w-5 h-5 text-gold" />
              <h3 className="text-sm font-semibold text-foreground">EXACT CUTTING METRICS</h3>
            </div>
            
            <div className="space-y-4 text-sm">
              <div>
                <span className="font-medium text-foreground">TOP: </span>
                <span className="text-muted-foreground">{barberCard.cuttingMetrics.top}</span>
              </div>
              <div>
                <span className="font-medium text-foreground">SIDES: </span>
                <span className="text-muted-foreground">{barberCard.cuttingMetrics.sides}</span>
              </div>
              <div>
                <span className="font-medium text-foreground">BOUNDARY: </span>
                <span className="text-muted-foreground">{barberCard.cuttingMetrics.boundary}</span>
              </div>
            </div>
          </div>

          {/* Styling Protocols Card */}
          <div className="bg-secondary border border-border rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <h3 className="text-sm font-semibold text-foreground">STYLING / PRODUCT PROTOCOLS</h3>
            </div>
            
            <ul className="space-y-2 text-sm text-muted-foreground">
              {barberCard.stylingProtocols.map((protocol, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-gold mt-0.5">•</span>
                  {protocol}
                </li>
              ))}
            </ul>
          </div>

          {/* Warnings if any */}
          {barberCard.warnings.length > 0 && (
            <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <span className="text-sm font-medium text-warning">Heads Up</span>
              </div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {barberCard.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Export Button */}
          <motion.button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 w-full py-4 px-6 bg-gold text-gold-foreground font-semibold rounded-xl transition-all hover:bg-gold/90 mt-4"
            whileTap={{ scale: 0.98 }}
          >
            <Share2 className="w-5 h-5" />
            EXPORT & SHARE CARD
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}
