import type { Badge, GamificationState } from '@/lib/types'

// ── Badge Definitions ──
export const BADGE_DEFINITIONS: Omit<Badge, 'earnedAt'>[] = [
  // Streak badges
  { id: 'streak-3', name: 'Getting Started', description: 'Log 3 haircuts in a row', icon: '🔥', category: 'streak', requirement: 3 },
  { id: 'streak-7', name: 'On Fire', description: '7-day grooming streak', icon: '🔥', category: 'streak', requirement: 7 },
  { id: 'streak-30', name: 'Unstoppable', description: '30-day grooming streak', icon: '💫', category: 'streak', requirement: 30 },
  { id: 'streak-90', name: 'Grooming Legend', description: '90-day grooming streak', icon: '👑', category: 'streak', requirement: 90 },

  // Milestone badges
  { id: 'cuts-1', name: 'First Cut', description: 'Log your first haircut', icon: '✂️', category: 'milestone', requirement: 1 },
  { id: 'cuts-5', name: 'Regular', description: 'Log 5 haircuts', icon: '💇', category: 'milestone', requirement: 5 },
  { id: 'cuts-10', name: 'Dedicated', description: 'Log 10 haircuts', icon: '🏆', category: 'milestone', requirement: 10 },
  { id: 'cuts-25', name: 'Haircut Veteran', description: 'Log 25 haircuts', icon: '🎖️', category: 'milestone', requirement: 25 },
  { id: 'cuts-50', name: 'Sculpt Master', description: 'Log 50 haircuts', icon: '🏅', category: 'milestone', requirement: 50 },

  // Style variety badges
  { id: 'variety-3', name: 'Style Explorer', description: 'Try 3 different styles', icon: '🎨', category: 'style', requirement: 3 },
  { id: 'variety-5', name: 'Fashion Forward', description: 'Try 5 different styles', icon: '🌟', category: 'style', requirement: 5 },
  { id: 'variety-10', name: 'Chameleon', description: 'Try 10 different styles', icon: '🦎', category: 'style', requirement: 10 },

  // Social badges
  { id: 'share-1', name: 'Social Butterfly', description: 'Share your first barber card', icon: '🦋', category: 'social', requirement: 1 },
  { id: 'share-5', name: 'Trendsetter', description: 'Share 5 barber cards', icon: '📡', category: 'social', requirement: 5 },

  // Progress photo badges
  { id: 'progress-3', name: 'Documentarian', description: 'Upload 3 progress photos', icon: '📸', category: 'milestone', requirement: 3 },
  { id: 'progress-10', name: 'Hair Historian', description: 'Upload 10 progress photos', icon: '📚', category: 'milestone', requirement: 10 },
]

// ── Initialize gamification state with all badges ──
export function initGamification(): GamificationState {
  return {
    badges: BADGE_DEFINITIONS.map(b => ({ ...b, earnedAt: null })),
    totalCutsLogged: 0,
    currentStreak: 0,
    longestStreak: 0,
    styleVariety: 0,
    lastCutLoggedDate: null,
  }
}

// ── Streak Logic ──
export function calculateStreak(lastCutDate: string | null, currentStreak: number): { streak: number; isNewDay: boolean } {
  if (!lastCutDate) return { streak: 0, isNewDay: false }

  const last = new Date(lastCutDate)
  const now = new Date()
  const diffMs = now.getTime() - last.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  // Same day — no change
  if (diffDays === 0) return { streak: currentStreak, isNewDay: false }

  // Next day — streak continues
  if (diffDays === 1) return { streak: currentStreak + 1, isNewDay: true }

  // More than 1 day gap — streak resets
  if (diffDays > 1) return { streak: 1, isNewDay: true }

  // In the future (shouldn't happen) — no change
  return { streak: currentStreak, isNewDay: false }
}

// ── Log a haircut and update gamification state ──
export function logHaircut(
  gamification: GamificationState,
  hairstyleName: string,
  uniqueStyles: string[]
): GamificationState {
  const today = new Date().toISOString().split('T')[0]
  const lastDate = gamification.lastCutLoggedDate

  // Calculate streak using currentStreak (not longestStreak)
  let newStreak = 1
  if (lastDate) {
    const last = new Date(lastDate)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) {
      // Same day — keep current streak
      newStreak = gamification.currentStreak || 1
    } else if (diffDays === 1) {
      // Consecutive day — increment
      newStreak = gamification.currentStreak + 1
    }
    // diffDays > 1 — reset to 1 (new streak starts)
  }

  // Count unique styles
  const allStyles = new Set([...uniqueStyles, hairstyleName])
  const newVariety = allStyles.size

  // Update total cuts
  const totalCuts = gamification.totalCutsLogged + 1

  // Update badges
  const updatedBadges = gamification.badges.map(badge => {
    if (badge.earnedAt) return badge // Already earned

    let earned = false
    switch (badge.category) {
      case 'streak':
        earned = newStreak >= badge.requirement
        break
      case 'milestone':
        if (badge.id.startsWith('cuts-')) earned = totalCuts >= badge.requirement
        if (badge.id.startsWith('progress-')) earned = false // handled separately
        break
      case 'style':
        earned = newVariety >= badge.requirement
        break
      case 'social':
        earned = false // handled by share events
        break
    }

    return earned ? { ...badge, earnedAt: new Date().toISOString() } : badge
  })

  return {
    ...gamification,
    badges: updatedBadges,
    totalCutsLogged: totalCuts,
    currentStreak: newStreak,
    longestStreak: Math.max(newStreak, gamification.longestStreak),
    styleVariety: newVariety,
    lastCutLoggedDate: today,
  }
}

// ── Award a badge by ID ──
export function awardBadge(gamification: GamificationState, badgeId: string): GamificationState {
  return {
    ...gamification,
    badges: gamification.badges.map(b =>
      b.id === badgeId && !b.earnedAt
        ? { ...b, earnedAt: new Date().toISOString() }
        : b
    ),
  }
}

// ── Get earned badges ──
export function getEarnedBadges(gamification: GamificationState): Badge[] {
  return gamification.badges.filter(b => b.earnedAt)
}

// ── Get recently earned badges (last 7 days) ──
export function getRecentBadges(gamification: GamificationState): Badge[] {
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  return gamification.badges.filter(b => {
    if (!b.earnedAt) return false
    return new Date(b.earnedAt) >= weekAgo
  })
}

// ── Get badges by category ──
export function getBadgesByCategory(gamification: GamificationState, category: Badge['category']): Badge[] {
  return gamification.badges.filter(b => b.category === category)
}

// ── Progress to next badge in a category ──
export function getProgressToNextBadge(
  gamification: GamificationState,
  category: Badge['category']
): { next: Badge | null; current: number; target: number; percentage: number } {
  const unearned = gamification.badges
    .filter(b => b.category === category && !b.earnedAt)
    .sort((a, b) => a.requirement - b.requirement)

  const next = unearned[0] || null
  if (!next) return { next: null, current: 0, target: 0, percentage: 100 }

  let current = 0
  switch (category) {
    case 'streak':
      current = gamification.currentStreak
      break
    case 'milestone':
      current = gamification.totalCutsLogged
      break
    case 'style':
      current = gamification.styleVariety
      break
    case 'social':
      current = gamification.badges.filter(b => b.category === 'social' && b.earnedAt).length
      break
  }

  return {
    next,
    current,
    target: next.requirement,
    percentage: Math.min(100, Math.round((current / next.requirement) * 100)),
  }
}
