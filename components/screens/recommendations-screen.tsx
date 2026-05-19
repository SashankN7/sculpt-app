"use client"

import { useState, useRef } from "react"
import { motion, useMotionValue, useTransform, animate, type PanInfo } from "framer-motion"
import { useApp } from "@/lib/app-context"
import { User, Star, FileText } from "lucide-react"
import type { HairstyleRecommendation } from "@/lib/types"

interface SwipeCardProps {
  recommendation: HairstyleRecommendation
  onSwipeLeft: () => void
  onSwipeRight: () => void
  isTop: boolean
}

function SwipeCard({ recommendation, onSwipeLeft, onSwipeRight, isTop }: SwipeCardProps) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-25, 25])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5])

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

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      className={`absolute inset-0 ${isTop ? 'cursor-grab active:cursor-grabbing z-10' : 'z-0'}`}
    >
      <div className="h-full bg-secondary border border-border rounded-2xl overflow-hidden flex flex-col">
        {/* Sculpt Pick Badge */}
        {recommendation.isSculptPick && (
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-gold text-gold-foreground rounded-full text-xs font-semibold">
            <Star className="w-3.5 h-3.5" />
            SCULPT PICK
          </div>
        )}

        {/* Image Area */}
        <div className="relative h-48 bg-background flex items-center justify-center">
          <div className="text-muted-foreground text-center">
            <User className="w-16 h-16 mx-auto mb-2 opacity-30" />
            <span className="text-xs">Preview Image</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {recommendation.name}
          </h3>
          
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm text-muted-foreground">Compatibility Rating:</span>
            <span className={`text-lg font-bold ${
              recommendation.compatibilityScore >= 90 ? 'text-success' :
              recommendation.compatibilityScore >= 70 ? 'text-gold' : 'text-warning'
            }`}>
              {recommendation.compatibilityScore}%
            </span>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed flex-1">
            Analysis: {recommendation.description}
          </p>

          {/* Metadata Scores */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            <MetadataItem label="Maintenance" value={recommendation.metadata.maintenance} />
            <MetadataItem label="Styling" value={recommendation.metadata.stylingEffort} />
            <MetadataItem label="Professional" value={recommendation.metadata.professionalism} />
            <MetadataItem label="Trendy" value={recommendation.metadata.trendiness} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function MetadataItem({ label, value }: { label: string; value: number }) {
  const getColor = (v: number) => {
    if (v <= 40) return 'bg-success'
    if (v <= 70) return 'bg-warning'
    return 'bg-error'
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${getColor(value)}`} />
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs text-foreground ml-auto">{value}</span>
    </div>
  )
}

export function RecommendationsScreen() {
  const { state, navigateTo, nextRecommendation, saveRecommendation } = useApp()
  const { recommendations, currentRecommendationIndex } = state
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null)

  const currentRecommendation = recommendations[currentRecommendationIndex]
  const nextRecommendationData = recommendations[currentRecommendationIndex + 1]

  const handleSwipeLeft = () => {
    setExitDirection('left')
    setTimeout(() => {
      nextRecommendation()
      setExitDirection(null)
    }, 100)
  }

  const handleSwipeRight = () => {
    if (currentRecommendation) {
      saveRecommendation(currentRecommendation)
    }
    setExitDirection('right')
    setTimeout(() => {
      nextRecommendation()
      setExitDirection(null)
    }, 100)
  }

  const handleViewBarberCard = () => {
    navigateTo('barber-card')
  }

  const handleGoToProfile = () => {
    navigateTo('history')
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
            Check your saved styles in your profile.
          </p>
          <button
            onClick={handleGoToProfile}
            className="px-6 py-3 bg-gold text-gold-foreground font-semibold rounded-xl"
          >
            View Saved Styles
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2">
        <button 
          onClick={handleGoToProfile}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <User className="w-5 h-5" />
          Profile
        </button>
        <span className="text-sm text-muted-foreground">Step 3 of 3</span>
      </div>

      <div className="flex-1 px-4 pt-2 pb-4 flex flex-col">
        {/* Title */}
        <h2 className="text-lg font-semibold text-foreground mb-3 px-2">
          YOUR CURATED MATCHES
        </h2>

        {/* Card Stack */}
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
        <p className="text-xs text-muted-foreground text-center mb-4">
          SWIPE LEFT TO REJECT &nbsp;&nbsp; SWIPE RIGHT TO SAVE
        </p>

        {/* Barber Card Button */}
        <motion.button
          onClick={handleViewBarberCard}
          className="flex items-center justify-center gap-2 w-full py-4 px-6 bg-gold text-gold-foreground font-semibold rounded-xl transition-all hover:bg-gold/90"
          whileTap={{ scale: 0.98 }}
        >
          <FileText className="w-5 h-5" />
          VIEW BARBER CARD
        </motion.button>
      </div>
    </div>
  )
}
