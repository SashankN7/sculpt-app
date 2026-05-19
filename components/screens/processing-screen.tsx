"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useApp } from "@/lib/app-context"
import { Settings, Check, Loader2 } from "lucide-react"
import type { HairstyleRecommendation } from "@/lib/types"

interface ProcessingStep {
  label: string
  status: 'waiting' | 'reading' | 'done'
}

// Mock recommendations data
const mockRecommendations: HairstyleRecommendation[] = [
  {
    id: '1',
    name: 'TEXTURED MODERN CROP',
    compatibilityScore: 94,
    description: 'Ideal for your determined Square face shape and wavy, medium-density hair texture.',
    imageUrl: '/placeholder-haircut-1.jpg',
    isSculptPick: true,
    metadata: {
      maintenance: 45,
      stylingEffort: 35,
      professionalism: 78,
      trendiness: 88,
    },
    barberCard: {
      hairstyleName: 'Textured Modern Crop',
      cuttingMetrics: {
        top: '2.5 inches length, blunt-textured point-cut strategy to maximize natural volume wave.',
        sides: 'Low-drop taper fade beginning at skin, blending smoothly upward at temple apex line.',
        boundary: 'Free natural blend edge, square neck.',
      },
      stylingProtocols: [
        'Avoid high-shine oil base pomades.',
        'Apply matte styling clay paste evenly over damp roots.',
        'Use fingers to tousle for natural texture.',
      ],
      warnings: [],
    },
  },
  {
    id: '2',
    name: 'CLASSIC SIDE PART',
    compatibilityScore: 89,
    description: 'A timeless professional look that complements your strong jawline and works well with your natural hair pattern.',
    imageUrl: '/placeholder-haircut-2.jpg',
    isSculptPick: false,
    metadata: {
      maintenance: 55,
      stylingEffort: 50,
      professionalism: 95,
      trendiness: 62,
    },
    barberCard: {
      hairstyleName: 'Classic Side Part',
      cuttingMetrics: {
        top: '3-4 inches on top with graduated length toward the part.',
        sides: 'Medium fade with #2 guard at temples, blending into scissor work.',
        boundary: 'Clean tapered neckline with natural hairline.',
      },
      stylingProtocols: [
        'Apply pomade or wax to damp hair.',
        'Comb through to define part line.',
        'Use medium-hold product for all-day structure.',
      ],
      warnings: [],
    },
  },
  {
    id: '3',
    name: 'LOW FADE QUIFF',
    compatibilityScore: 86,
    description: 'Modern and versatile style that adds height and works with your face proportions.',
    imageUrl: '/placeholder-haircut-3.jpg',
    isSculptPick: false,
    metadata: {
      maintenance: 68,
      stylingEffort: 72,
      professionalism: 72,
      trendiness: 91,
    },
    barberCard: {
      hairstyleName: 'Low Fade Quiff',
      cuttingMetrics: {
        top: '4-5 inches at the front, tapering to 3 inches at crown.',
        sides: 'Low skin fade starting at #0, blending to #3 at parietal ridge.',
        boundary: 'Crisp lineup at temples, tapered neckline.',
      },
      stylingProtocols: [
        'Blow dry with round brush for volume.',
        'Apply pre-styler to damp hair.',
        'Finish with matte clay for hold and texture.',
      ],
      warnings: ['This style requires daily blow drying for best results.'],
    },
  },
]

export function ProcessingScreen() {
  const { navigateTo, setAnalysisResult, setRecommendations } = useApp()
  const [steps, setSteps] = useState<ProcessingStep[]>([
    { label: 'Mapping geometric face contours...', status: 'reading' },
    { label: 'Measuring texture & hair density...', status: 'waiting' },
    { label: 'Filtering matching hair vectors...', status: 'waiting' },
  ])

  useEffect(() => {
    // Simulate processing steps
    const timers: NodeJS.Timeout[] = []

    // Step 1 complete
    timers.push(setTimeout(() => {
      setSteps(prev => [
        { ...prev[0], status: 'done' },
        { ...prev[1], status: 'reading' },
        prev[2],
      ])
    }, 1500))

    // Step 2 complete
    timers.push(setTimeout(() => {
      setSteps(prev => [
        prev[0],
        { ...prev[1], status: 'done' },
        { ...prev[2], status: 'reading' },
      ])
    }, 3500))

    // Step 3 complete and navigate
    timers.push(setTimeout(() => {
      setSteps(prev => [
        prev[0],
        prev[1],
        { ...prev[2], status: 'done' },
      ])

      // Set mock analysis result
      setAnalysisResult({
        faceShape: 'Square',
        densityScore: 72,
        textureProfile: {
          waviness: 0.64,
          curliness: 0.31,
          straightness: 0.05,
        },
        confidenceScore: 0.92,
        warnings: [],
      })

      // Set mock recommendations
      setRecommendations(mockRecommendations)
    }, 5000))

    // Navigate to recommendations
    timers.push(setTimeout(() => {
      // Simulate a 10% chance of low confidence for demo purposes
      const isLowConfidence = Math.random() < 0.1
      navigateTo(isLowConfidence ? 'low-confidence' : 'recommendations')
    }, 6000))

    return () => {
      timers.forEach(clearTimeout)
    }
  }, [navigateTo, setAnalysisResult, setRecommendations])

  const getStatusIcon = (status: ProcessingStep['status']) => {
    switch (status) {
      case 'done':
        return <Check className="w-4 h-4 text-success" />
      case 'reading':
        return <Loader2 className="w-4 h-4 text-gold animate-spin" />
      default:
        return <span className="w-4 h-4 text-muted-foreground">⏳</span>
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full"
      >
        {/* Title */}
        <h2 className="text-lg font-semibold text-foreground mb-2">
          SCULPT AI ENGINE ACTIVE
        </h2>
        <p className="text-sm text-muted-foreground mb-10">
          Analyzing facial architecture & hair traits...
        </p>

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

        {/* Steps */}
        <div className="space-y-3 text-left">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
              className="flex items-center gap-3 text-sm"
            >
              <Settings className="w-4 h-4 text-muted-foreground" />
              <span className={step.status === 'waiting' ? 'text-muted-foreground' : 'text-foreground'}>
                {step.label}
              </span>
              <span className="ml-auto">{getStatusIcon(step.status)}</span>
            </motion.div>
          ))}
        </div>

        {/* Note */}
        <p className="mt-10 text-xs text-muted-foreground">
          Please keep the app open. This takes ~5-12 seconds.
        </p>
      </motion.div>
    </div>
  )
}
