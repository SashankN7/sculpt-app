"use client"

import { motion } from "framer-motion"
import { useApp } from "@/lib/app-context"
import { ChevronLeft, Star, MessageCircle, User, AlertTriangle } from "lucide-react"
import type { HairstyleRecommendation, TraitKey } from "@/lib/types"
import { getTraitBgColor, getTraitTextColor } from "@/lib/types"

const TRAIT_KEYS = ['maintenance', 'stylingEffort', 'professionalism', 'trendiness'] as const
const TRAIT_LABELS: Record<string, string> = {
  maintenance: 'Maintenance Difficulty',
  stylingEffort: 'Styling Effort',
  professionalism: 'Professionalism',
  trendiness: 'Trendiness',
}

function getBarColor(value: number, traitKey: string): string {
  return getTraitBgColor(value, traitKey as TraitKey)
}

function getScoreColor(value: number, traitKey: string): string {
  return getTraitTextColor(value, traitKey as TraitKey)
}

export function RecommendationFullScreen() {
  const { state, navigateTo } = useApp()
  const { recommendations, currentRecommendationIndex } = state
  const recommendation = recommendations[currentRecommendationIndex]

  if (!recommendation) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-8 text-center">
        <p className="text-muted-foreground">No recommendation selected</p>
        <button onClick={() => navigateTo('recommendations')} className="mt-4 text-gold underline">
          Back to Recommendations
        </button>
      </div>
    )
  }

  const handleOpenChat = () => {
    navigateTo('chat-assistant')
  }

  const handleBack = () => {
    navigateTo('recommendation-detail')
  }

  // Mock analysis data — in real app this comes from the analysis result
  const faceShape = state.analysisResult?.faceShape || 'Oval'
  const textureWaviness = state.analysisResult?.textureProfile?.waviness ?? 0.5
  const densityScore = state.analysisResult?.densityScore ?? 70

  const getTextureLabel = (w: number) => {
    if (w < 0.3) return 'Straight'
    if (w < 0.6) return 'Wavy'
    return 'Curly'
  }

  const getDensityLabel = (d: number) => {
    if (d < 40) return 'Thin'
    if (d < 70) return 'Medium'
    return 'Thick'
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2">
        <button
          onClick={handleBack}
          className="flex items-center gap-1 text-sm text-foreground hover:text-gold transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          RESULTS
        </button>
        <button
          onClick={handleOpenChat}
          className="flex items-center gap-1.5 text-sm text-gold hover:text-gold/80 transition-colors font-medium"
        >
          <MessageCircle className="w-4 h-4" />
          Ask AI
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 mx-auto w-full max-w-3xl">
        {/* Hero Image Area */}
        <div className="relative h-48 bg-background flex items-center justify-center mx-4 rounded-xl overflow-hidden">
          {recommendation.imageUrl ? (
            <img
              src={recommendation.imageUrl}
              alt={recommendation.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-muted-foreground text-center">
              <User className="w-16 h-16 mx-auto mb-2 opacity-30" />
              <span className="text-xs">Style Preview</span>
            </div>
          )}
          {/* Gradient overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
          {/* Name + Score overlay */}
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
            <h1 className="text-xl font-semibold text-foreground truncate flex-1 min-w-0">
              {recommendation.name}
            </h1>
            <div className="flex items-center gap-1 px-2.5 py-1 bg-background/80 backdrop-blur-sm border border-gold/30 rounded-full">
              {recommendation.isSculptPick && (
                <Star className="w-3 h-3 text-gold fill-gold" />
              )}
              <span className="text-sm font-bold text-gold">{recommendation.compatibilityScore}</span>
              <span className="text-xs text-muted-foreground">/100</span>
            </div>
          </div>
        </div>

        <div className="px-4 pt-4 pb-6 space-y-5">
          {/* Why This Works For You */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <p className="text-[10px] font-medium text-gold tracking-wider uppercase mb-2">
              Why This Works For You
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {recommendation.description}
            </p>
          </motion.div>

          {/* Analysis Rows */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            {/* Face Shape */}
            <div className="flex items-start gap-3 py-2.5 border-b border-border">
              <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <ellipse cx="12" cy="12" rx="8" ry="10" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Face Shape: {faceShape}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {faceShape === 'Oval' || faceShape === 'Square'
                    ? `Ideal match — ${faceShape.toLowerCase()} faces suit nearly all variations of this style.`
                    : `${faceShape} face shape — this style complements your facial structure.`}
                </p>
              </div>
            </div>

            {/* Hair Texture */}
            <div className="flex items-start gap-3 py-2.5 border-b border-border">
              <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 12c2-3 4-3 6 0s4 3 6 0s4-3 6 0" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Texture: {getTextureLabel(textureWaviness)} / {getDensityLabel(densityScore)} Density
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {textureWaviness >= 0.3 && textureWaviness < 0.6
                    ? 'Wavy texture adds natural volume without requiring heavy product.'
                    : textureWaviness >= 0.6
                    ? 'Curly texture provides natural movement and body for this style.'
                    : 'Straight texture creates a clean, structured look for this style.'}
                </p>
              </div>
            </div>

            {/* Hairline */}
            <div className="flex items-start gap-3 py-2.5">
              <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 8c3-2 6-2 8 0s5 2 8 0" />
                  <path d="M4 12c3-2 6-2 8 0s5 2 8 0" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Hairline: Standard</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  No constraints detected. Full range of options available.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Metadata Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-[10px] font-medium text-gold tracking-wider uppercase mb-3">
              Metadata Breakdown
            </p>
            <div className="space-y-3">
              {TRAIT_KEYS.map((key) => {
                const value = recommendation.metadata[key]
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">{TRAIT_LABELS[key]}</span>
                      <span className={`text-xs font-semibold ${getScoreColor(value, key)}`}>{value}</span>
                    </div>
                    <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${value}%` }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className={`h-full rounded-full ${getBarColor(value, key)}`}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Warnings (if any) */}
          {recommendation.barberCard.warnings.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-[10px] font-medium text-error tracking-wider uppercase mb-2">
                Warnings
              </p>
              <div className="space-y-2">
                {recommendation.barberCard.warnings.map((warning, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-3 bg-error/5 border border-error/20 rounded-xl">
                    <AlertTriangle className="w-4 h-4 text-error flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">{warning}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="px-4 py-3 border-t border-border">
        <motion.button
          onClick={handleBack}
          className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-secondary border border-border text-sm font-medium text-foreground rounded-xl hover:bg-muted transition-colors"
          whileTap={{ scale: 0.98 }}
        >
          ← Back to Results
        </motion.button>
      </div>
    </div>
  )
}
