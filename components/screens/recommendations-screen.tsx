"use client"

import { useState } from "react"
import { motion, useMotionValue, useTransform, animate, AnimatePresence, type PanInfo } from "framer-motion"
import { useApp } from "@/lib/app-context"
import { track } from "@/lib/posthog"
import { Star, Settings, ExternalLink, Crown, AlertTriangle } from "lucide-react"
import type { HairstyleRecommendation, TraitKey } from "@/lib/types"
import { getTraitBgColor } from "@/lib/types"

interface SwipeCardProps {
  recommendation: HairstyleRecommendation
  onSwipeLeft: () => void
  onSwipeRight: () => void
  isTop: boolean
}

function SwipeCard({ recommendation, onSwipeLeft, onSwipeRight, isTop }: SwipeCardProps) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-25, 25])

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100
    if (info.offset.x > threshold) {
      animate(x, 500, { duration: 0.3 })
      setTimeout(onSwipeRight, 200)
    } else if (info.offset.x < -threshold) {
      animate(x, -500, { duration: 0.3 })
      setTimeout(onSwipeLeft, 200)
    } else {
      animate(x, 0, { duration: 0.3 })
    }
  }

  const isSculptPick = recommendation.isSculptPick

  return (
    <motion.div
      style={{ x, rotate }}
      drag={isTop ? "x" : false}
      dragElastic={0.9}
      dragConstraints={{ left: -300, right: 300 }}
      onDragEnd={handleDragEnd}
      className={`absolute inset-0 overflow-hidden ${isTop ? 'cursor-grab active:cursor-grabbing z-10' : 'z-0'} touch-pan-y select-none`}
    >
      {/* Opaque layer — covers card behind completely so nothing bleeds through */}
      <div className="absolute inset-0 bg-background rounded-2xl" />
      {/* Card content on top of the opaque layer — flex-col so button always sits at bottom */}
      <div className={`relative h-full rounded-2xl flex flex-col border-2 pointer-events-none overflow-hidden ${isSculptPick ? 'border-gold ring-2 ring-gold/20 bg-gold/5' : 'border-border bg-secondary'}`}>
        {/* Sculpt Pick Badge */}
        {isSculptPick && (
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-gold text-gold-foreground rounded-full text-xs font-semibold">
            <Star className="w-3.5 h-3.5" />
            #1 SCULPT PICK
          </div>
        )}

        {/* Image Area — gold decorative name */}
        <div className="relative h-44 shrink-0 bg-background flex items-center justify-center overflow-hidden">
          <span style={{ fontSize: '45px', lineHeight: '1.1' }} className="font-bold text-gold uppercase tracking-wide text-center px-4 line-clamp-2 pointer-events-none">
            {recommendation.name}
          </span>
        </div>

        {/* Content — flex-1 + min-h-0 so it shrinks to fit, leaving room for the button */}
        <div className="flex-1 min-h-0 px-4 pt-3 pb-2 flex flex-col overflow-hidden">
          <h3 style={{ fontSize: '7px', lineHeight: '1.1' }} className="font-semibold text-foreground mb-1 truncate uppercase tracking-wide">
            {recommendation.name}
          </h3>
          
          <div className="flex items-center gap-2 mb-2 shrink-0">
            <span className="text-[7px] text-muted-foreground uppercase tracking-wide">Compatibility:</span>
            <span className={`text-[9px] font-bold ${
              recommendation.compatibilityScore >= 90 ? 'text-success' :
              recommendation.compatibilityScore >= 70 ? 'text-gold' : 'text-warning'
            }`}>
              {recommendation.compatibilityScore}%
            </span>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            Analysis: {recommendation.description}
          </p>

          {/* Metadata Scores */}
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-3">
            <MetadataItem label="Maintenance" value={recommendation.metadata.maintenance} traitKey="maintenance" />
            <MetadataItem label="Styling" value={recommendation.metadata.stylingEffort} traitKey="stylingEffort" />
            <MetadataItem label="Professional" value={recommendation.metadata.professionalism} traitKey="professionalism" />
            <MetadataItem label="Trendy" value={recommendation.metadata.trendiness} traitKey="trendiness" />
          </div>
        </div>

        {/* View Reference Photos Button — positioned outside pointer-events-none so it's always clickable and visible */}
        <div className="px-4 pb-4 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation()
              window.open(
                `https://www.google.com/search?q=${encodeURIComponent(recommendation.name + ' men haircut')}&tbm=isch`,
                '_blank'
              )
            }}
            className="pointer-events-auto z-20 swipe-card-ref-btn"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View Reference Photos
          </button>
        </div>
      </div>
    </motion.div>
  )
}

function MetadataItem({ label, value, traitKey }: { label: string; value: number; traitKey: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-2 h-2 rounded-full shrink-0 ${getTraitBgColor(value, traitKey as TraitKey)}`} />
      <span className="text-[11px] text-muted-foreground truncate">{label}</span>
      <span className="text-[11px] font-semibold text-foreground ml-auto tabular-nums shrink-0">{value}</span>
    </div>
  )
}

export function RecommendationsScreen() {
  const { state, navigateTo, nextRecommendation, saveRecommendation, rejectRecommendation } = useApp()
  const { recommendations, currentRecommendationIndex, savedRecommendations } = state
  const [showFirstSaveModal, setShowFirstSaveModal] = useState(false)

  const currentRecommendation = recommendations[currentRecommendationIndex]
  const nextRecommendationData = recommendations[currentRecommendationIndex + 1]

  const handleSwipeLeft = () => {
    if (currentRecommendation) {
      track('recommendation_rejected', { name: currentRecommendation.name, compatibility: currentRecommendation.compatibilityScore })
      rejectRecommendation(currentRecommendation)
    }
    setTimeout(() => {
      const isLast = currentRecommendationIndex >= recommendations.length - 1
      if (isLast) {
        navigateTo('recommendation-detail')
      } else {
        nextRecommendation()
      }
    }, 100)
  }

  const handleSwipeRight = () => {
    if (currentRecommendation) {
      track('recommendation_saved', { name: currentRecommendation.name, compatibility: currentRecommendation.compatibilityScore })
      saveRecommendation(currentRecommendation)
    }
    if (savedRecommendations.length === 0) {
      setShowFirstSaveModal(true)
    }
    setTimeout(() => {
      const isLast = currentRecommendationIndex >= recommendations.length - 1
      if (isLast) {
        navigateTo('recommendation-detail')
      } else {
        nextRecommendation()
      }
    }, 100)
  }

  const handleGoToSavedPicks = () => {
    navigateTo('recommendation-detail')
  }

  if (!currentRecommendation) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <h2 className="text-xl font-semibold text-foreground mb-4">
            {"You've seen all recommendations!"}
          </h2>
          <p className="text-sm text-muted-foreground mb-8">
            Your picks are ready — see them all now.
          </p>
          <button
            onClick={handleGoToSavedPicks}
            className="px-6 py-3 bg-gold text-gold-foreground font-semibold rounded-xl"
          >
            View Saved Picks
          </button>
        </motion.div>
      </div>
    )
  }

  const { userSession } = state
  const isFreeUser = userSession === 'guest' || userSession === 'authenticated'

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-2">
        <div className="w-8" />
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateTo('settings')}
            className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center hover:bg-muted transition-colors"
          >
            <Settings className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="flex-1 px-4 pt-2 pb-4 flex flex-col">
        {/* Title */}
        <div className="flex items-center justify-between mb-2 px-2">
          <h2 className="text-lg font-semibold text-foreground">
            YOUR CURATED MATCHES
          </h2>
          <span className="text-xs text-muted-foreground">
            {currentRecommendationIndex + 1} / {recommendations.length}
          </span>
        </div>

        {/* Free user prominent banner */}
        {isFreeUser && (
          <div className="mb-3 mx-2 p-3 bg-gradient-to-r from-gold/15 to-gold/5 border-2 border-gold/40 rounded-xl">
            <div className="flex items-center gap-2 mb-1.5">
              <AlertTriangle className="w-4 h-4 text-gold flex-shrink-0" />
              <p className="text-[11px] font-bold text-gold uppercase tracking-wide">Questionnaire-Based Results</p>
            </div>
            <p className="text-[10px] text-foreground leading-relaxed mb-2">
              These recommendations are based on your <span className="font-bold">questionnaire answers only</span> — your photos were not analyzed by AI. Premium users get recommendations from real face shape, density, and texture analysis.
            </p>
            <button
              onClick={() => navigateTo('paywall')}
              className="flex items-center justify-center gap-1.5 w-full py-2 bg-gold text-gold-foreground text-[11px] font-bold rounded-lg hover:bg-gold/90 transition-colors"
            >
              <Crown className="w-3.5 h-3.5" />
              UPGRADE FOR AI-POWERED RESULTS
            </button>
          </div>
        )}

        {/* Card Stack (Swipe View) */}
        <>
          <div className="relative flex-1 mb-4">
            {nextRecommendationData && (
              <SwipeCard
                key={nextRecommendationData.id}
                recommendation={nextRecommendationData}
                onSwipeLeft={() => {}}
                onSwipeRight={() => {}}
                isTop={false}
              />
            )}
            <SwipeCard
              key={currentRecommendation.id}
              recommendation={currentRecommendation}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
              isTop
            />
          </div>

          {/* Swipe Instructions */}
          <p className="text-xs text-white/90 text-center font-medium">
            SWIPE LEFT TO REJECT &nbsp;&nbsp; SWIPE RIGHT TO SAVE
          </p>
        </>
      </div>

      {/* First Save Congrats Modal */}
      <AnimatePresence>
        {showFirstSaveModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50"
              onClick={() => setShowFirstSaveModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 30 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="fixed inset-0 flex items-center justify-center z-50 px-6 pointer-events-none"
            >
              <div className="bg-secondary border border-gold/40 rounded-2xl p-6 w-full max-w-sm pointer-events-auto text-center shadow-2xl">
                <div className="w-16 h-16 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-gold" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">First Pick Saved!</h3>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                  Nice eye. Keep swiping — save all the cuts you like, then we'll build your barber card.
                </p>
                <button
                  onClick={() => setShowFirstSaveModal(false)}
                  className="w-full py-3 bg-gold text-gold-foreground font-semibold rounded-xl hover:bg-gold/90 transition-colors"
                >
                  Keep Swiping
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}