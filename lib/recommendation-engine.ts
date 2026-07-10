import type { AnalysisResult, QuestionnaireAnswersMap, HairstyleRecommendation } from '@/lib/types'
import { getCompatibleHairstyles, type HairstyleEntry } from '@/lib/hairstyle-db'
import { getStyleTrendScore } from '@/lib/trends'

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

interface UserHistory {
  savedStyleNames: string[]   // styles the user saved (liked)
  rejectedStyleNames: string[] // styles the user rejected
  allPastStyleNames: string[]  // every style they've seen before
}

function calculateCompatibilityScore(
  entry: HairstyleEntry,
  analysis: AnalysisResult,
  answers: QuestionnaireAnswersMap,
  history?: UserHistory
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

  // Professionalism (15% weight — reduced from 25% to avoid bias toward short conservative styles)
  const profWeight = getProfessionalismWeight(answers)
  const profScore = (entry.professionalism / 100) * profWeight

  // Trend alignment (15% weight — increased from 5% to give trendy/longer styles a fair shot)
  const trendWeight = getTrendWeight(answers)
  const trendScore = (entry.trendiness / 100) * trendWeight

  // Weighted final score
  // Reduced professionalism (25→15%), increased trendiness (5→15%) to reduce short-style bias
  let raw = (
    physicalScore * 0.40 +
    Math.max(0, maintFit) * 0.15 +
    Math.max(0, boldFit) * 0.15 +
    Math.min(1, profScore) * 0.15 +
    Math.min(1, trendScore) * 0.15
  )

  // History adjustments — learn from past saved/rejected styles
  if (history) {
    const nameLower = entry.name.toLowerCase()

    // Penalize styles the user has already seen (avoid repeats)
    if (history.allPastStyleNames.some(n => n.toLowerCase() === nameLower)) {
      raw *= 0.85 // 15% penalty for previously seen styles
    }

    // Boost styles similar to what the user saved (liked)
    if (history.savedStyleNames.some(n => n.toLowerCase() === nameLower)) {
      raw = Math.min(1, raw * 1.15) // 15% boost for previously saved styles
    }

    // Penalize styles the user explicitly rejected
    if (history.rejectedStyleNames.some(n => n.toLowerCase() === nameLower)) {
      raw *= 0.3 // 70% penalty for rejected styles — strongly avoid
    }

    // If user has saved styles, look at their metadata patterns and boost similar styles
    if (history.savedStyleNames.length > 0) {
      // This is handled by the saved style name check above
      // but we could also analyze metadata patterns in the future
    }
  }

  // Scale to 0-100 — deterministic, no randomness
  const score = Math.round(Math.min(98, Math.max(45, raw * 100)))

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

export async function generateRecommendations(
  analysis: AnalysisResult,
  answers: QuestionnaireAnswersMap,
  count?: number,
  includeTrends?: boolean,
  history?: UserHistory
): Promise<HairstyleRecommendation[]> {
  const compatible = getCompatibleHairstyles(
    analysis.faceShape,
    analysis.densityScore,
    analysis.textureProfile
  )

  // includeTrends passed as parameter from settings
  
  const scored: ScoredHairstyle[] = await Promise.all(
    compatible.map(async entry => {
      let compatibilityScore = calculateCompatibilityScore(entry, analysis, answers, history)
      
      // Apply trend boost if enabled
      if (includeTrends) {
        const trendScore = await getStyleTrendScore(entry.name)
        // Boost score by up to 8 points for trending styles (trendScore 0-100)
        const trendBoost = (trendScore / 100) * 8
        compatibilityScore = Math.min(98, compatibilityScore + trendBoost)
      }
      
      const explanation = generateExplanation(entry, analysis, compatibilityScore)
      return { entry, compatibilityScore, explanation }
    })
  )

  // Sort by score descending
  scored.sort((a, b) => b.compatibilityScore - a.compatibilityScore)

  // ─── Diversity pass: ensure a mix of short / medium / long styles ───
  // Classify each style by approximate length category
  const getCategory = (e: HairstyleEntry): 'short' | 'medium' | 'long' => {
    const cats = e.category
    if (['Fade', 'Crop', 'Short', 'Quiff', 'Spiky'].includes(cats)) return 'short'
    if (['Medium', 'Edgy'].includes(cats)) return 'medium'
    if (cats === 'Long') return 'long'
    // For Classic and Curly: check top length from barberCard to classify correctly
    const topMetric = e.barberCard.cuttingMetrics.top.toLowerCase()
    if (topMetric.includes('#') || topMetric.includes('guard') || topMetric.includes('1-1') || topMetric.includes('1.5-2')) return 'short'
    if (topMetric.includes('8+') || topMetric.includes('8-12') || topMetric.includes('6-10')) return 'long'
    return 'medium'
  }

  const desiredCount = count || scored.length
  const picked: ScoredHairstyle[] = []

  // First pass: pick top scoring style from each of the 3 length categories
  // Only include if score >= 50 (reasonably compatible) — don't force bad matches
  for (const cat of ['short', 'medium', 'long'] as const) {
    const candidate = scored.find(s => getCategory(s.entry) === cat && !picked.includes(s) && s.compatibilityScore >= 50)
    if (candidate) {
      picked.push(candidate)
    }
  }

  // Fill the rest from the top-scored pool (avoiding duplicates)
  for (const s of scored) {
    if (picked.length >= desiredCount) break
    if (!picked.includes(s)) {
      picked.push(s)
    }
  }

  // Re-sort picked by original score so the best overall style is first
  picked.sort((a, b) => b.compatibilityScore - a.compatibilityScore)

  const top = picked.slice(0, desiredCount)

  // Mark top 1 as Sculpt Pick, add trend badge for top trending styles
  return top.map((item, index) => ({
    id: `rec-${Date.now()}-${index}`,
    name: item.entry.name.toUpperCase(),
    compatibilityScore: Math.round(item.compatibilityScore),
    description: item.explanation,
    imageUrl: item.entry.imageUrl,
    isSculptPick: index === 0,
    isTrending: includeTrends && (item.compatibilityScore > 80),
    trendScore: includeTrends ? Math.min(100, Math.round((item.compatibilityScore - 65) * 3.3)) : undefined,
    metadata: {
      maintenance: item.entry.maintenanceLevel,
      stylingEffort: item.entry.stylingEffort,
      professionalism: item.entry.professionalism,
      trendiness: item.entry.trendiness,
    },
    elements: item.entry.elements,
    barberCard: {
      hairstyleName: item.entry.name,
      cuttingMetrics: item.entry.barberCard.cuttingMetrics,
      stylingProtocols: item.entry.barberCard.stylingProtocols,
      warnings: item.entry.barberCard.warnings,
    },
  }))
}
