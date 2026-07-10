"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useApp } from "@/lib/app-context"
import { ChevronLeft, Scissors, AlertTriangle, Share2, Loader2, Check, Lock, Crown } from "lucide-react"
import { exportBarberCardToPDF } from "@/lib/pdf-export"

export function BarberCardScreen() {
  const { state, navigateTo, goBack } = useApp()
  const { recommendations, currentRecommendationIndex, userSession, analysisResult } = state
  const isPremium = userSession === 'premium' || userSession === 'trial'
  const [isExporting, setIsExporting] = useState(false)
  const [exportDone, setExportDone] = useState(false)
  
  const currentRecommendation = recommendations[currentRecommendationIndex]
  const barberCard = currentRecommendation?.barberCard

  const handleExport = async () => {
    if (!currentRecommendation) return
    setIsExporting(true)
    try {
      await exportBarberCardToPDF(currentRecommendation, analysisResult)
      setExportDone(true)
      setTimeout(() => setExportDone(false), 2000)
    } catch {
      alert('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
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

  // --- FREE USER: Locked Preview ---
  if (!isPremium) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center px-4 md:px-6 py-2">
          <button
            onClick={() => navigateTo('recommendation-detail')}
            className="flex items-center gap-1 text-sm text-foreground hover:text-gold transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            BACK
          </button>
        </div>

        <div className="flex-1 pt-4 pb-6 overflow-y-auto w-full">
          <div className="px-6 md:px-8 max-w-2xl mx-auto">
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
                The exact words and specs to hand your stylist.
              </p>

              {/* Locked Preview — Cutting Metrics */}
              <div className="bg-gold/5 border border-gold/20 rounded-xl p-4 mb-4 relative overflow-hidden">
                <div className="flex items-center gap-2 mb-4">
                  <Scissors className="w-5 h-5 text-gold" />
                  <h3 className="text-sm font-semibold text-gold">EXACT CUTTING METRICS</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gold">TOP: </span>
                    <span className="text-muted-foreground blur-sm select-none">{barberCard.cuttingMetrics.top}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gold">SIDES: </span>
                    <span className="text-muted-foreground blur-sm select-none">{barberCard.cuttingMetrics.sides}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gold">BOUNDARY: </span>
                    <span className="text-muted-foreground blur-sm select-none">{barberCard.cuttingMetrics.boundary}</span>
                  </div>
                </div>
                {/* Blur overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background/90 flex items-end justify-center pb-4">
                  <button
                    onClick={() => navigateTo('paywall')}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-gold text-gold-foreground text-[11px] font-bold rounded-lg hover:bg-gold/90 transition-colors"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    UNLOCK FULL SPECS — PREMIUM
                  </button>
                </div>
              </div>

              {/* Locked Preview — Styling Protocols */}
              <div className="bg-secondary border border-border rounded-xl p-4 mb-4 relative overflow-hidden">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  <h3 className="text-sm font-semibold text-foreground">STYLING / PRODUCT PROTOCOLS</h3>
                </div>
                <div className="space-y-3">
                  {barberCard.stylingProtocols.map((protocol, index) => (
                    <div key={index} className="p-3 bg-gold/5 border border-gold/20 rounded-lg blur-sm select-none">
                      <div className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-[10px] font-bold text-gold">{index + 1}</span>
                        </span>
                        <span className="text-sm text-foreground leading-relaxed">{protocol}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background/90 flex items-end justify-center pb-4">
                  <button
                    onClick={() => navigateTo('paywall')}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-gold text-gold-foreground text-[11px] font-bold rounded-lg hover:bg-gold/90 transition-colors"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    UNLOCK STYLING PROTOCOLS — PREMIUM
                  </button>
                </div>
              </div>

              {/* Upgrade CTA */}
              <div className="bg-gradient-to-br from-gold/15 to-gold/5 border-2 border-gold/40 rounded-xl p-5 text-center">
                <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-3">
                  <Crown className="w-6 h-6 text-gold" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-1">Get Your Full Barber Card</h3>
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                  Premium gives you exact cutting specs, styling protocols, and PDF export — everything you need to hand your barber.
                </p>
                <button
                  onClick={() => navigateTo('paywall')}
                  className="flex items-center justify-center gap-1.5 w-full py-3 bg-gold text-gold-foreground font-bold text-xs rounded-xl hover:bg-gold/90 transition-colors"
                >
                  <Crown className="w-3.5 h-3.5" />
                  START FREE 30-DAY TRIAL
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  // --- PREMIUM USER: Full Barber Card ---
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center px-4 md:px-6 py-2">
        <button 
          onClick={() => navigateTo('recommendation-detail')}
          className="flex items-center gap-1 text-sm text-foreground hover:text-gold transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          BACK
        </button>
      </div>

      <div className="flex-1 pt-4 pb-6 overflow-y-auto w-full">
        <div className="px-6 md:px-8 max-w-2xl mx-auto">
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
          <div className="bg-gold/5 border border-gold/20 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <Scissors className="w-5 h-5 text-gold" />
              <h3 className="text-sm font-semibold text-gold">EXACT CUTTING METRICS</h3>
            </div>
            
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-semibold text-gold">TOP: </span>
                <span className="text-foreground">{barberCard.cuttingMetrics.top}</span>
              </div>
              <div>
                <span className="font-semibold text-gold">SIDES: </span>
                <span className="text-foreground">{barberCard.cuttingMetrics.sides}</span>
              </div>
              <div>
                <span className="font-semibold text-gold">BOUNDARY: </span>
                <span className="text-foreground">{barberCard.cuttingMetrics.boundary}</span>
              </div>
            </div>
          </div>

          {/* Styling Protocols Card */}
          <div className="bg-secondary border border-border rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <h3 className="text-sm font-semibold text-foreground">STYLING / PRODUCT PROTOCOLS</h3>
            </div>
            
            <div className="space-y-3">
              {barberCard.stylingProtocols.map((protocol, index) => (
                <div key={index} className="p-3 bg-gold/5 border border-gold/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-gold">{index + 1}</span>
                    </span>
                    <span className="text-sm text-foreground leading-relaxed">{protocol}</span>
                  </div>
                </div>
              ))}
            </div>
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
            disabled={isExporting}
            className="flex items-center justify-center gap-2 w-full py-4 px-6 bg-gold text-gold-foreground font-semibold rounded-xl transition-all hover:bg-gold/90 mt-4 disabled:opacity-60"
            whileTap={!isExporting ? { scale: 0.98 } : {}}
          >
            {exportDone ? (
              <>
                <Check className="w-5 h-5" />
                DOWNLOADED!
              </>
            ) : isExporting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Share2 className="w-5 h-5" />
                EXPORT & SHARE CARD
              </>
            )}
          </motion.button>
        </motion.div>
        </div>
      </div>
    </div>
  )
}
