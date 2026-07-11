import type { Badge, GamificationState } from '@/lib/types'
import { DAILY_REWARD_TIERS } from '@/lib/types'

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
    dailyCheckInStreak: 0,
    longestDailyCheckInStreak: 0,
    lastCheckInDate: null,
    totalCheckIns: 0,
    unlockedRewards: [],
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

// ── Minimum days between haircut logs (2 weeks) ──
export const HAIRCUT_COOLDOWN_DAYS = 14

// ── Check if user can log a haircut (cooldown check) ──
export function canLogHaircut(lastCutLoggedDate: string | null): { allowed: boolean; daysUntilAvailable: number } {
  if (!lastCutLoggedDate) return { allowed: true, daysUntilAvailable: 0 }

  const last = new Date(lastCutLoggedDate)
  const now = new Date()
  const diffMs = now.getTime() - last.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays >= HAIRCUT_COOLDOWN_DAYS) {
    return { allowed: true, daysUntilAvailable: 0 }
  }

  return { allowed: false, daysUntilAvailable: HAIRCUT_COOLDOWN_DAYS - diffDays }
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

// ── Daily Check-In System ──

/** Check if user has already checked in today */
export function hasCheckedInToday(lastCheckInDate: string | null): boolean {
  if (!lastCheckInDate) return false
  const today = new Date().toISOString().split('T')[0]
  return lastCheckInDate === today
}

/** Get the next daily reward the user can earn */
export function getNextDailyReward(gamification: GamificationState): { reward: typeof DAILY_REWARD_TIERS[0] | null; daysNeeded: number; percentage: number } {
  const unclaimed = DAILY_REWARD_TIERS.filter(r => !gamification.unlockedRewards.includes(r.id))
  if (unclaimed.length === 0) return { reward: null, daysNeeded: 0, percentage: 100 }

  const next = unclaimed[0]
  const daysNeeded = Math.max(0, next.streakRequired - gamification.dailyCheckInStreak)
  const percentage = Math.min(100, Math.round((gamification.dailyCheckInStreak / next.streakRequired) * 100))
  return { reward: next, daysNeeded, percentage }
}

/** Get all daily rewards with their claim status */
export function getAllDailyRewards(gamification: GamificationState) {
  return DAILY_REWARD_TIERS.map(r => ({
    ...r,
    claimed: gamification.unlockedRewards.includes(r.id),
    reached: gamification.dailyCheckInStreak >= r.streakRequired,
  }))
}

/** Check in for today — updates streak and checks for reward unlocks */
export function checkInToday(
  gamification: GamificationState
): { gamification: GamificationState; newReward: typeof DAILY_REWARD_TIERS[0] | null } {
  const today = new Date().toISOString().split('T')[0]

  // Already checked in today — no-op
  if (gamification.lastCheckInDate === today) {
    return { gamification, newReward: null }
  }

  const lastDate = gamification.lastCheckInDate
  let newStreak = 1

  if (lastDate) {
    const last = new Date(lastDate)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      // Consecutive day — increment streak
      newStreak = gamification.dailyCheckInStreak + 1
    }
    // diffDays > 1 or diffDays === 0 (already handled above) — reset to 1
  }

  const newLongest = Math.max(newStreak, gamification.longestDailyCheckInStreak)
  const totalCheckIns = gamification.totalCheckIns + 1

  // Check for reward unlocks
  let newReward: typeof DAILY_REWARD_TIERS[0] | null = null
  const newUnlocked = [...gamification.unlockedRewards]

  for (const tier of DAILY_REWARD_TIERS) {
    if (!newUnlocked.includes(tier.id) && newStreak >= tier.streakRequired) {
      newUnlocked.push(tier.id)
      newReward = tier // Return the latest unlock
    }
  }

  return {
    gamification: {
      ...gamification,
      dailyCheckInStreak: newStreak,
      longestDailyCheckInStreak: newLongest,
      lastCheckInDate: today,
      totalCheckIns,
      unlockedRewards: newUnlocked,
    },
    newReward,
  }
}

/** Get a weekly view of check-in history (last 7 days) */
export function getWeeklyCheckInHistory(lastCheckInDate: string | null, dailyCheckInStreak: number): boolean[] {
  // Returns an array of 7 booleans (Mon-Sun) showing which days were checked in
  // This is a simplified version — in production you'd store daily history
  const history: boolean[] = [false, false, false, false, false, false, false]
  if (!lastCheckInDate) return history

  const today = new Date()
  const todayDayOfWeek = today.getDay() // 0=Sun, 1=Mon, ...
  const lastCheckIn = new Date(lastCheckInDate)
  const diffDays = Math.floor((today.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60 * 24))

  // Mark checked-in days working backwards from today
  for (let i = 0; i <= Math.min(diffDays, 6); i++) {
    const dayIndex = (todayDayOfWeek - i + 7) % 7
    if (i <= dailyCheckInStreak) {
      history[dayIndex] = true
    }
  }

  // Today is always included
  history[todayDayOfWeek] = true

  return history
}
