"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { useApp } from "@/lib/app-context"
import { Star, Check, Share2, FileText, X, ArrowRightFromLine, ArrowLeftFromLine, Home, Sparkles, Crown } from "lucide-react"
import type { HairstyleRecommendation } from "@/lib/types"

const TRAIT_LABELS = {
  maintenance: 'Maintenance',
  stylingEffort: 'Styling',
  professionalism: 'Professional',
  trendiness: 'Trendy',
} as const

const TRAIT_KEYS = ['maintenance', 'stylingEffort', 'professionalism', 'trendiness'] as const

function getTraitColor(value: number): string {
  if (value <= 40) return 'bg-success'
  if (value <= 70) return 'bg-warning'
  return 'bg-error'
}

function TraitDots({ recommendation }: { recommendation: HairstyleRecommendation }) {
  return (
    <div className="flex items-center gap-3">
      {TRAIT_KEYS.map((key) => {
        const value = recommendation.metadata[key]
        return (
          <div key={key} className="flex flex-col items-center gap-0.5">
            <div className={`w-2 h-2 rounded-full ${getTraitColor(value)}`} />
            <span className="text-[9px] text-muted-foreground leading-none">
              {TRAIT_LABELS[key]}
            </span>
            <span className="text-[9px] font-semibold text-foreground">{value}</span>
          </div>
        )
      })}
    </div>
  )
}

function RecommendationCard({
  recommendation,
  isSelected,
  isSculptPick,
  showSculptMessage,
  onSelect,
  onViewDetail,
  onPreview,
  onMoveToRejected,
  onMoveToSaved,
  animDelay = 0,
}: {
  recommendation: HairstyleRecommendation
  isSelected: boolean
  isSculptPick: boolean
  showSculptMessage?: boolean
  onSelect: () => void
  onViewDetail: () => void
  onPreview?: () => void
  onMoveToRejected?: () => void
  onMoveToSaved?: () => void
  animDelay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animDelay }}
      className={`rounded-xl border transition-all ${
        isSculptPick && isSelected
          ? 'border-gold ring-2 ring-gold/30 bg-gold/5'
          : isSelected
          ? 'border-muted-foreground/50 bg-secondary'
          : showSculptMessage
          ? 'border-gold/40 bg-gold/5'
          : 'border-border bg-secondary hover:border-muted-foreground/30'
      }`}
    >
      <button onClick={onSelect} className="w-full p-4 flex items-start gap-3 text-left">
        {isSculptPick ? (
          <div className="flex-shrink-0">
            <div className="w-5 h-5 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center">
              <Star className="w-3 h-3 text-gold" />
            </div>
          </div>
        ) : (
          <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${
            isSelected ? 'bg-gold border-gold' : 'border-muted-foreground/30'
          }`}>
            {isSelected && <Check className="w-3 h-3 text-gold-foreground" />}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <h4 className="text-sm font-semibold text-foreground truncate">{recommendation.name}</h4>
            {isSculptPick && (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-gold/20 rounded-full flex-shrink-0">
                <Star className="w-2.5 h-2.5 text-gold" />
                <span className="text-[9px] font-bold text-gold">SCULPT PICK</span>
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-sm font-bold ${
              recommendation.compatibilityScore >= 90 ? 'text-success' :
              recommendation.compatibilityScore >= 70 ? 'text-gold' : 'text-warning'
            }`}>
              {recommendation.compatibilityScore}%
            </span>
            <TraitDots recommendation={recommendation} />
          </div>

          {/* Sculpt message embedded inside the card — shown when this is the injected fallback sculpt */}
          {showSculptMessage && (
            <div className="mt-3 pt-3 border-t border-gold/20">
              <p className="text-xs font-semibold text-gold uppercase tracking-wide mb-0.5">SCULPT'S #1 PICK FOR YOU</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Based on your questionnaire responses, face shape, and hair type — this is the style Sculpt determined is your best match.
              </p>
            </div>
          )}
        </div>
      </button>

      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pb-4 flex flex-col gap-2"
          >
            <button
              onClick={(e) => { e.stopPropagation(); onViewDetail() }}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-gold text-gold-foreground text-xs font-semibold rounded-lg hover:bg-gold/90 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              VIEW DETAILS
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onPreview?.() }}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-background border border-gold/40 text-gold text-xs font-semibold rounded-lg hover:bg-gold/5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              SEE PREVIEW
            </button>
            <div className="flex gap-2">
              {onMoveToRejected && (
                <button
                  onClick={(e) => { e.stopPropagation(); onMoveToRejected() }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-background border border-border text-xs font-medium text-muted-foreground rounded-lg hover:text-error hover:border-error/50 hover:bg-error/5 transition-colors"
                >
                  <ArrowRightFromLine className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
              )}
              {onMoveToSaved && (
                <button
                  onClick={(e) => { e.stopPropagation(); onMoveToSaved() }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-background border border-border text-xs font-medium text-muted-foreground rounded-lg hover:text-success hover:border-success/50 hover:bg-success/5 transition-colors"
                >
                  <ArrowLeftFromLine className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const FREE_RECOMMENDATION_LIMIT = 3

export function RecommendationDetailScreen() {
  const { state, navigateTo, resetAll, syncRecommendationIndex, unsaveRecommendation, unrejectRecommendation, setPreviewRecommendation } = useApp()
  const { userSession } = state
  const { savedRecommendations, rejectedRecommendations, recommendations } = state
  const isPremium = userSession === 'premium' || userSession === 'trial'
  const [activeTab, setActiveTab] = useState<'saved' | 'rejected'>(
    savedRecommendations.length === 0 ? 'rejected' : 'saved'
  )
  const [currentSavedIndex, setCurrentSavedIndexLocal] = useState<number | null>(null)
  const [currentRejectedIndex, setCurrentRejectedIndex] = useState<number | null>(null)
  const [showActionSheet, setShowActionSheet] = useState(false)

  const sculptPick = recommendations.find(r => r.isSculptPick) ?? null
  const sculptWasSaved = savedRecommendations.some(r => r.isSculptPick)

  // Inject sculpt into Rejected when saved pile is empty and sculpt not in saved
  const needsRejectedInjection = savedRecommendations.length === 0 && !sculptWasSaved && sculptPick !== null

  // Deduplicate: only inject if sculpt isn't already in rejectedRecommendations
  const rejectedIds = new Set(rejectedRecommendations.map(r => r.id))
  const injectSculptIfNeeded: HairstyleRecommendation[] =
    needsRejectedInjection && sculptPick && !rejectedIds.has(sculptPick.id)
      ? [sculptPick]
      : []
  const rejectedWithSculpt: HairstyleRecommendation[] = [...injectSculptIfNeeded, ...rejectedRecommendations]

  const handleSelectSaved = (index: number) => {
    setCurrentSavedIndexLocal(prev => prev === index ? null : index)
    setCurrentRejectedIndex(null)
  }

  const handleSelectRejected = (index: number) => {
    setCurrentRejectedIndex(prev => prev === index ? null : index)
    setCurrentSavedIndexLocal(null)
  }

  const handleViewDetail = (rec: HairstyleRecommendation) => {
    const origIndex = recommendations.findIndex(r => r.id === rec.id)
    if (origIndex !== -1) syncRecommendationIndex(origIndex)
    navigateTo('recommendation-full')
  }

  const handleMoveToRejected = (rec: HairstyleRecommendation) => {
    unsaveRecommendation(rec.id)
    setCurrentSavedIndexLocal(null)
  }

  const handleMoveToSaved = (rec: HairstyleRecommendation) => {
    unrejectRecommendation(rec.id)
    setCurrentRejectedIndex(null)
  }

  const handleReturnHome = () => {
    if (userSession !== 'guest') {
      navigateTo('dashboard')
    } else {
      resetAll()
      navigateTo('landing')
    }
  }

  const handleStartOver = () => {
    resetAll()
    navigateTo('upload')
  }

  const handleExportAll = async () => {
    setShowActionSheet(false)
    if (savedRecommendations.length === 0) {
      alert('No saved barber cards to export.')
      return
    }
    try {
      const { exportBarberCardToPDF } = await import('@/lib/pdf-export')
      for (const rec of savedRecommendations) {
        await exportBarberCardToPDF(rec, state.analysisResult)
      }
    } catch {
      alert('Export failed. Please try again.')
    }
  }

  const totalRejected = rejectedWithSculpt.length

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2">
        <button
          onClick={handleReturnHome}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          title="Return to home"
        >
          <Home className="w-5 h-5" />
          HOME
        </button>
        <button
          onClick={() => setShowActionSheet(true)}
          className="flex items-center gap-1 text-sm text-gold hover:text-gold/80 transition-colors font-medium"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>

      <div className="flex-1 px-4 pt-2 pb-4 flex flex-col overflow-hidden">
        {/* Title */}
        <div className="mb-3 px-2">
          <h2 className="text-lg font-semibold text-foreground mb-0.5">
            YOUR RESULTS
          </h2>
          <p className="text-sm text-muted-foreground">
            {savedRecommendations.length > 0
              ? `${savedRecommendations.length} saved · ${rejectedRecommendations.length} rejected`
              : "Here's what Sculpt recommends for you"}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mb-4 px-2">
          <button
            onClick={() => { setActiveTab('saved'); setCurrentRejectedIndex(null) }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'saved'
                ? 'bg-gold text-gold-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            Saved ({savedRecommendations.length})
          </button>
          <button
            onClick={() => { setActiveTab('rejected'); setCurrentSavedIndexLocal(null) }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'rejected'
                ? 'bg-muted text-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            <X className="w-3.5 h-3.5" />
            Rejected ({totalRejected})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-3">
          <AnimatePresence mode="wait">
            {activeTab === 'saved' && (
              <motion.div
                key="saved"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-3"
              >
                {/* Helper text for saved tab */}
                <p className="text-xs text-muted-foreground px-1">
                  Tap a style to view its barber card or move it to the rejected pile.
                </p>

                {savedRecommendations.map((rec, index) => (
                  <RecommendationCard
                    key={rec.id}
                    recommendation={rec}
                    isSelected={currentSavedIndex === index}
                    isSculptPick={rec.isSculptPick}
                    onSelect={() => handleSelectSaved(index)}
                    onViewDetail={() => handleViewDetail(rec)}
                    onPreview={() => { setPreviewRecommendation(rec); navigateTo('preview') }}
                    onMoveToRejected={() => handleMoveToRejected(rec)}
                    animDelay={index * 0.05}
                  />
                ))}

                {savedRecommendations.length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground">No saved picks yet.</p>
                  </div>
                )}

                {/* Free tier upgrade nudge */}
                {!isPremium && savedRecommendations.length >= FREE_RECOMMENDATION_LIMIT && (
                  <button
                    onClick={() => navigateTo('paywall')}
                    className="w-full p-3 bg-gold/5 border border-gold/30 rounded-xl flex items-center gap-3 hover:bg-gold/10 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                      <Crown className="w-4 h-4 text-gold" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-semibold text-gold">Unlock more styles</p>
                      <p className="text-[10px] text-muted-foreground">Premium gets {recommendations.length}+ personalized recommendations</p>
                    </div>
                  </button>
                )}
              </motion.div>
            )}

            {activeTab === 'rejected' && (
              <motion.div
                key="rejected"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-3"
              >
                {/* Helper text for rejected tab */}
                <p className="text-xs text-muted-foreground px-1">
                  Tap a style to view its barber card or move it to the saved pile.
                </p>

                {rejectedWithSculpt.map((rec, index) => {
                  // The first item is the injected sculpt pick when needsRejectedInjection is true
                  const isInjectedSculpt = needsRejectedInjection && index === 0 && rec.isSculptPick
                  return (
                    <RecommendationCard
                      key={rec.id}
                      recommendation={rec}
                      isSelected={currentRejectedIndex === index}
                      isSculptPick={rec.isSculptPick}
                      showSculptMessage={isInjectedSculpt}
                      onSelect={() => handleSelectRejected(index)}
                      onViewDetail={() => handleViewDetail(rec)}
                      onPreview={() => { setPreviewRecommendation(rec); navigateTo('preview') }}
                      onMoveToSaved={() => handleMoveToSaved(rec)}
                      animDelay={index * 0.05}
                    />
                  )
                })}

                {rejectedWithSculpt.length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground">No rejected picks.</p>
                  </div>
                )}

                {/* Free tier upgrade nudge */}
                {!isPremium && rejectedWithSculpt.length >= FREE_RECOMMENDATION_LIMIT && (
                  <button
                    onClick={() => navigateTo('paywall')}
                    className="w-full p-3 bg-gold/5 border border-gold/30 rounded-xl flex items-center gap-3 hover:bg-gold/10 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                      <Crown className="w-4 h-4 text-gold" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-semibold text-gold">Unlock more styles</p>
                      <p className="text-[10px] text-muted-foreground">Premium gets {recommendations.length}+ personalized recommendations</p>
                    </div>
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 mt-2 border-t border-border space-y-2">
  
          <button
            onClick={handleReturnHome}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gold text-gold-foreground font-semibold rounded-xl transition-all hover:bg-gold/90"
          >
            <Home className="w-4 h-4" />
            Back to Dashboard
          </button>
          <button
            onClick={handleStartOver}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-secondary border border-border text-sm font-medium text-foreground rounded-xl hover:bg-muted transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Start New Analysis
          </button>
        </div>
      </div>

      {/* Share Action Sheet */}
      <AnimatePresence>
        {showActionSheet && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowActionSheet(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-0 left-0 right-0 bg-secondary border-t border-border rounded-t-2xl p-6 z-50 max-w-md mx-auto"
            >
              <div className="w-12 h-1 bg-border rounded-full mx-auto mb-4" />
              <h3 className="text-base font-semibold text-foreground mb-1">Share Your Picks</h3>
              <p className="text-sm text-muted-foreground mb-6">Export your saved barber cards to share with your stylist or save for later.</p>
              <div className="space-y-3">
                <button
                  onClick={handleExportAll}
                  className="w-full flex items-center gap-3 p-4 bg-background rounded-xl hover:bg-muted transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Export Barber Cards as PDF</p>
                    <p className="text-xs text-muted-foreground">Premium feature — share detailed specs with your stylist</p>
                  </div>
                </button>
              </div>
              <button
                onClick={() => setShowActionSheet(false)}
                className="w-full mt-4 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}