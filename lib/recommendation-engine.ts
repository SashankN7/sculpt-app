import type { AnalysisResult, QuestionnaireAnswersMap, HairstyleRecommendation } from '@/lib/types'
import { getCompatibleHairstyles, type HairstyleEntry } from '@/lib/hairstyle-db'

interface ScoredHairstyle {
  entry: HairstyleEntry
  compatibilityScore: number
  explanation: string
}

function getMaintenancePreference(answers: QuestionnaireAnswersMap): number {
  const val = answers['maintenance'] as string | undefined
  switch (val) {
    case 'zero': return 10
    case 'low': return 30
    case 'medium': return 55
    case 'high': return 80
    default: return 50
  }
}

function getBoldnessPreference(answers: QuestionnaireAnswersMap): number {
  const val = answers['boldness'] as number | undefined
  if (val !== undefined) return (val / 5) * 100
  return 50
}

function getProfessionalismWeight(answers: QuestionnaireAnswersMap): number {
  const workContext = answers['workContext'] as string | undefined
  switch (workContext) {
    case 'critical': return 1.2
    case 'important': return 1.0
    case 'flexible': return 0.7
    default: return 1.0
  }
}

function getTrendWeight(answers: QuestionnaireAnswersMap): number {
  const lifestyle = answers['activity'] as string[] | undefined
  if (!lifestyle) return 1.0
  if (lifestyle.includes('creative') || lifestyle.includes('student')) return 1.3
  if (lifestyle.includes('corporate')) return 0.7
  return 1.0
}

function calculateCompatibilityScore(
  entry: HairstyleEntry,
  analysis: AnalysisResult,
  answers: QuestionnaireAnswersMap
): number {
  // Base physical compatibility (40% weight)
  const densityFit = 1 - Math.abs(analysis.densityScore - entry.idealDensityScore) / 50
  const textureFit = analysis.textureProfile.waviness >= 0.3 && analysis.textureProfile.waviness <= 0.7
    ? 0.9
    : 0.7

  const physicalScore = (Math.max(0, densityFit) * 0.5 + textureFit * 0.5)

  // Maintenance match (15% weight)
  const maintPref = getMaintenancePreference(answers)
  const maintFit = 1 - Math.abs(entry.maintenanceLevel - maintPref) / 100

  // Boldness alignment (15% weight)
  const boldPref = getBoldnessPreference(answers)
  const trendVsClassic = entry.trendiness
  const boldFit = 1 - Math.abs(trendVsClassic - boldPref) / 100

  // Professionalism (25% weight, adjusted by user context)
  const profWeight = getProfessionalismWeight(answers)
  const profScore = (entry.professionalism / 100) * profWeight

  // Trend alignment (5% weight, adjusted by lifestyle)
  const trendWeight = getTrendWeight(answers)
  const trendScore = (entry.trendiness / 100) * trendWeight

  // Weighted final score
  const raw = (
    physicalScore * 0.40 +
    Math.max(0, maintFit) * 0.15 +
    Math.max(0, boldFit) * 0.15 +
    Math.min(1, profScore) * 0.25 +
    Math.min(1, trendScore) * 0.05
  )

  // Scale to 0-100, with slight randomness for variety (±3 points)
  const jitter = (Math.random() - 0.5) * 6
  const score = Math.round(Math.min(98, Math.max(45, raw * 100 + jitter)))

  return score
}

function generateExplanation(
  entry: HairstyleEntry,
  analysis: AnalysisResult,
  score: number
): string {
  const faceShape = analysis.faceShape.toLowerCase()
  const density = analysis.densityScore
  const w = analysis.textureProfile.waviness

  const textureWord = w > 0.6 ? 'curly' : w > 0.3 ? 'wavy' : 'straight'
  const densityWord = density > 70 ? 'thick' : density > 45 ? 'medium-density' : 'fine'

  const parts: string[] = []

  if (score >= 85) {
    parts.push(`Strong match for ${faceShape} faces with ${textureWord}, ${densityWord} hair.`)
  } else if (score >= 70) {
    parts.push(`Good fit for your ${faceShape} face shape and ${textureWord} texture.`)
  } else {
    parts.push(`Compatible with your profile — ${faceShape} face with ${textureWord} hair.`)
  }

  if (entry.maintenanceLevel <= 30) {
    parts.push('Minimal daily effort — great for busy mornings.')
  } else if (entry.maintenanceLevel >= 70) {
    parts.push('Requires dedicated styling time for best results.')
  }

  return parts.join(' ')
}

export function generateRecommendations(
  analysis: AnalysisResult,
  answers: QuestionnaireAnswersMap,
  count?: number
): HairstyleRecommendation[] {
  const compatible = getCompatibleHairstyles(
    analysis.faceShape,
    analysis.densityScore,
    analysis.textureProfile
  )

  const scored: ScoredHairstyle[] = compatible.map(entry => {
    const compatibilityScore = calculateCompatibilityScore(entry, analysis, answers)
    const explanation = generateExplanation(entry, analysis, compatibilityScore)
    return { entry, compatibilityScore, explanation }
  })

  // Sort by score descending
  scored.sort((a, b) => b.compatibilityScore - a.compatibilityScore)

  // Return all compatible styles (optionally cap with count if provided)
  const top = count ? scored.slice(0, count) : scored

  // Mark top 1-2 as Sculpt Pick
  return top.map((item, index) => ({
    id: `rec-${Date.now()}-${index}`,
    name: item.entry.name.toUpperCase(),
    compatibilityScore: item.compatibilityScore,
    description: item.explanation,
    imageUrl: item.entry.imageUrl,
    isSculptPick: index < 2 && item.compatibilityScore >= 80,
    metadata: {
      maintenance: item.entry.maintenanceLevel,
      stylingEffort: item.entry.stylingEffort,
      professionalism: item.entry.professionalism,
      trendiness: item.entry.trendiness,
    },
    barberCard: {
      hairstyleName: item.entry.name,
      cuttingMetrics: item.entry.barberCard.cuttingMetrics,
      stylingProtocols: item.entry.barberCard.stylingProtocols,
      warnings: item.entry.barberCard.warnings,
    },
  }))
}
