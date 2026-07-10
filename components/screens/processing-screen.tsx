"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useApp } from "@/lib/app-context"
import { track } from "@/lib/posthog"
import { Settings, Check, Loader2, AlertTriangle, Crown, Sparkles } from "lucide-react"

// Use a module-level flag to prevent double execution across strict mode remounts
let processingStarted = false
let processingTimers: ReturnType<typeof setTimeout>[] = []

export function resetProcessingState() {
  processingStarted = false
  processingTimers.forEach(clearTimeout)
  processingTimers = []
}

function getPersonalizedTips(answers: Record<string, unknown>): string[] {
  const tips: string[] = []
  const concerns = answers['hairConcerns'] as string[] | undefined
  const maintenance = answers['maintenance'] as string | undefined
  const boldness = answers['boldness'] as number | undefined
  const workContext = answers['workContext'] as string | undefined

  // Tips based on hair concerns
  if (concerns?.includes('thinning') || concerns?.includes('scalp')) {
    tips.push('Styles with volume on top can create the illusion of thicker hair.')
    tips.push('A matte clay adds texture without weighing hair down — great for thinning hair.')
  }
  if (concerns?.includes('frizzy')) {
    tips.push('Anti-frizz serum applied to damp hair tames flyaways all day.')
    tips.push('A leave-in conditioner before styling keeps frizz under control.')
  }
  if (concerns?.includes('flat')) {
    tips.push('Sea salt spray on damp hair adds instant volume and texture.')
    tips.push('Blow drying upside down lifts roots for a fuller look.')
  }
  if (concerns?.includes('oily')) {
    tips.push('Dry shampoo between washes absorbs oil and adds volume.')
    tips.push('Wash every 2-3 days instead of daily — overwashing increases oil production.')
  }

  // Tips based on maintenance level
  if (maintenance === 'zero' || maintenance === 'low') {
    tips.push('A textured crop is the lowest-maintenance style — just towel dry and go.')
    tips.push('Low-maintenance haircuts save time but still need trims every 4-6 weeks.')
  } else if (maintenance === 'high') {
    tips.push('A pre-styler before blow drying makes the biggest difference for high-effort styles.')
    tips.push('Invest in a quality blow dryer — it transforms styling results.')
  }

  // Tips based on boldness
  if (boldness !== undefined && boldness >= 7) {
    tips.push('Bold styles like a textured fringe or crop top make a statement.')
    tips.push('Don\'t be afraid to experiment — your barber can always adjust.')
  } else if (boldness !== undefined && boldness <= 3) {
    tips.push('Classic styles like a side part or crew cut are timeless and professional.')
    tips.push('Subtle changes to your current cut can feel fresh without being drastic.')
  }

  // Tips based on work context
  if (workContext === 'critical') {
    tips.push('For professional settings, keep the sides clean and the top structured.')
    tips.push('A subtle taper fade balances professionalism with modern style.')
  }

  // Always include a few general tips
  tips.push('Your face shape is the #1 factor in determining which cuts will look best on you.')
  tips.push('Barbers prefer reference photos over verbal descriptions for precision cuts.')
  tips.push('Most haircuts lose their shape after 4 weeks — booking early keeps you sharp.')

  return tips
}

export function ProcessingScreen() {
  const { state, navigateTo, setAnalysisResult, setRecommendations, setLastCutDate, setCutFrequency } = useApp()
  const [stepStatuses, setStepStatuses] = useState<Array<'waiting' | 'reading' | 'done' | 'error'>>(['reading', 'waiting', 'waiting'])
  const [error, setError] = useState<string | null>(null)
  const [tipIndex, setTipIndex] = useState(0)
  const [retryKey, setRetryKey] = useState(0)

  // Build personalized tips from questionnaire answers
  const personalizedTips = getPersonalizedTips(state.questionnaireData)

  // Rotate tips every 8 seconds
  useEffect(() => {
    if (personalizedTips.length <= 1) return
    const interval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % personalizedTips.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [personalizedTips.length])

  const stepLabels = [
    'Mapping geometric face contours...',
    'Measuring texture & hair density...',
    'Filtering matching hair vectors...',
  ]

  useEffect(() => {
    if (processingStarted) return
    processingStarted = true

    async function runAnalysis() {
      try {
        // Step 1: Call /api/analyze with uploaded images + questionnaire + user tier
        setStepStatuses(['reading', 'waiting', 'waiting'])

        const analyzeRes = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            frontImage: state.uploadedImages.front,
            sideImage: state.uploadedImages.side,
            hairlineImage: state.uploadedImages.hairline,
            questionnaireAnswers: state.questionnaireData,
            userSession: state.userSession,
            scanCountToday: state.scanCountToday,
          }),
        })

        if (!analyzeRes.ok) {
          const errData = await analyzeRes.json()
          throw new Error(errData.error || 'Analysis failed')
        }

        const { analysis } = await analyzeRes.json()
        setAnalysisResult(analysis)
        setStepStatuses(['done', 'reading', 'waiting'])

        // Step 2: Call /api/recommend with analysis + questionnaire + trend settings
        const isFreeUser = state.userSession === 'guest' || state.userSession === 'authenticated'
        const recommendRes = await fetch('/api/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            analysis,
            answers: state.questionnaireData,
            count: isFreeUser ? 3 : 8,
            includeTrends: state.settings.aiPersonalization.includeTrends,
            history: {
              savedStyleNames: state.savedRecommendations.map(r => r.name),
              rejectedStyleNames: state.rejectedRecommendations.map(r => r.name),
              allPastStyleNames: [
                ...state.savedRecommendations.map(r => r.name),
                ...state.rejectedRecommendations.map(r => r.name),
                ...state.scanHistory.flatMap(s => [
                  ...s.savedRecommendations.map(r => r.name),
                  ...s.rejectedRecommendations.map(r => r.name),
                ]),
              ],
            },
          }),
        })

        if (!recommendRes.ok) {
          const errData = await recommendRes.json()
          throw new Error(errData.error || 'Recommendation generation failed')
        }

        const { recommendations } = await recommendRes.json()
        setStepStatuses(['done', 'done', 'reading'])

        // Small delay for visual feel
        await new Promise(r => setTimeout(r, 800))

        setRecommendations(recommendations)
        setStepStatuses(['done', 'done', 'done'])
        track('analysis_completed', { confidence: analysis.confidenceScore, num_recommendations: recommendations.length, user_session: state.userSession })

        // Set maintenance tracking data from questionnaire
        setLastCutDate(new Date().toISOString().split('T')[0])
        const freq = state.questionnaireData['cutFrequency']
        if (typeof freq === 'string') {
          setCutFrequency(freq)
        }

        // Navigate to recommendations after brief pause
        processingTimers.push(setTimeout(() => {
          processingStarted = false
          if (analysis.confidenceScore < 0.5) {
            navigateTo('low-confidence')
          } else {
            navigateTo('recommendations')
          }
        }, 1200))

      } catch (err: unknown) {
        processingStarted = false
        const message = err instanceof Error ? err.message : 'Unknown error occurred'
        track('analysis_failed', { error: message })
        setError(message)
        setStepStatuses(prev => prev.map((s) => s === 'reading' ? 'error' : s))
      }
    }

    runAnalysis()

    return () => {
      processingTimers.forEach(clearTimeout)
      processingTimers = []
    }
  }, [retryKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const getStatusIcon = (status: 'waiting' | 'reading' | 'done' | 'error') => {
    switch (status) {
      case 'done':
        return <Check className="w-4 h-4 text-success" />
      case 'reading':
        return <Loader2 className="w-4 h-4 text-gold animate-spin" />
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-error" />
      default:
        return <span className="w-4 h-4 text-muted-foreground">-</span>
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="w-16 h-16 rounded-full bg-error/10 border border-error/30 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-error" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Analysis Failed
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            {error}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                resetProcessingState()
                setError(null)
                setStepStatuses(['reading', 'waiting', 'waiting'])
                setRetryKey(k => k + 1)
              }}
              className="w-full py-3 px-6 bg-gold text-gold-foreground font-semibold rounded-xl hover:bg-gold/90 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => {
                resetProcessingState()
                navigateTo('upload')
              }}
              className="w-full py-3 px-6 bg-secondary border border-border text-foreground font-medium rounded-xl hover:bg-muted transition-colors"
            >
              Back to Upload
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Free user prominent limitation banner */}
        {(state.userSession === 'guest' || state.userSession === 'authenticated') && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="p-4 bg-gradient-to-br from-orange-400/15 to-orange-400/5 border-2 border-orange-400/40 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-orange-400/20 flex items-center justify-center">
                  <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
                </div>
                <p className="text-xs font-bold text-orange-400 uppercase tracking-wide">Free Tier — Questionnaire Only</p>
              </div>
              <p className="text-[11px] text-foreground leading-relaxed mb-1">
                Your photos are <span className="font-bold text-orange-400">NOT being analyzed by AI</span>. Results are based purely on your questionnaire answers — no face shape, density, or texture detection from your photos.
              </p>
              <p className="text-[10px] text-muted-foreground leading-relaxed mb-3">
                Premium users get real GPT-4o Vision analysis of their actual face and hair from photos.
              </p>
              <button
                onClick={() => navigateTo('paywall')}
                className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-gold text-gold-foreground text-[11px] font-bold rounded-lg hover:bg-gold/90 transition-colors"
              >
                <Crown className="w-3.5 h-3.5" />
                UPGRADE FOR AI PHOTO ANALYSIS
              </button>
            </div>
          </motion.div>
        )}

        {/* Title — different for free vs premium users */}
        {(state.userSession === 'guest' || state.userSession === 'authenticated') ? (
          <>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              QUESTIONNAIRE-BASED MATCHING
            </h2>
            <p className="text-sm text-muted-foreground mb-10">
              Finding styles that match your preferences...
            </p>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              SCULPT AI ENGINE ACTIVE
            </h2>
            <p className="text-sm text-muted-foreground mb-10">
              Analyzing facial architecture & hair traits from your photos...
            </p>
          </>
        )}

        {/* Spinner */}
        <div className="relative w-24 h-24 mx-auto mb-10">
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-secondary"
          />
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-gold border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Settings className="w-8 h-8 text-gold animate-pulse" />
          </div>
        </div>

        {/* Steps — different labels for free vs premium */}
        <div className="space-y-3 text-left">
          {(state.userSession === 'guest' || state.userSession === 'authenticated'
            ? [
                'Reading your questionnaire responses...',
                'Matching preferences to compatible styles...',
                'Ranking your best-fit recommendations...',
              ]
            : stepLabels
          ).map((label, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
              className="flex items-center gap-3 text-sm"
            >
              <Settings className="w-4 h-4 text-muted-foreground" />
              <span className={stepStatuses[index] === 'waiting' ? 'text-muted-foreground' : 'text-foreground'}>
                {label}
              </span>
              <span className="ml-auto">{getStatusIcon(stepStatuses[index])}</span>
            </motion.div>
          ))}
        </div>

        {/* Tip while waiting — personalized based on questionnaire */}
        <div className="mt-10 p-4 bg-secondary border border-border rounded-xl">
          <p className="text-[10px] font-medium text-gold tracking-wider uppercase mb-2">DID YOU KNOW?</p>
          <motion.p
            key={tipIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-xs text-muted-foreground leading-relaxed"
          >
            {personalizedTips[tipIndex]}
          </motion.p>
        </div>

        {/* Free tier upsell at bottom */}
        {(state.userSession === 'guest' || state.userSession === 'authenticated') && (
          <div className="mt-4 p-3 bg-gold/5 border border-gold/20 rounded-xl">
            <p className="text-[10px] text-gold font-medium text-center">
              <Sparkles className="w-3 h-3 inline mr-1" />
              Upgrade to Premium for AI photo analysis — your face shape, density & texture detected from your actual photos.
            </p>
          </div>
        )}

        <p className="mt-4 text-xs text-muted-foreground">
          Please keep the app open. This takes ~5-15 seconds.
        </p>
      </motion.div>
    </div>
  )
}
