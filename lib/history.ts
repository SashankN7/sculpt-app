import type { HaircutHistory } from '@/lib/types'

const HISTORY_KEY = 'sculpt_history'
const HISTORY_EXPIRY_HOURS = 24 * 90 // 90 days

interface StoredHistory {
  data: HaircutHistory[]
  savedAt: number
}

export function saveHistory(history: HaircutHistory[]): void {
  try {
    const stored: StoredHistory = {
      data: history,
      savedAt: Date.now(),
    }
    localStorage.setItem(HISTORY_KEY, JSON.stringify(stored))
  } catch {
    // Storage full or unavailable
  }
}

export function loadHistory(): HaircutHistory[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []

    const stored: StoredHistory = JSON.parse(raw)
    const ageHours = (Date.now() - stored.savedAt) / (1000 * 60 * 60)

    if (ageHours > HISTORY_EXPIRY_HOURS) {
      localStorage.removeItem(HISTORY_KEY)
      return []
    }

    return stored.data
  } catch {
    return []
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY)
  } catch {
    // silently fail
  }
}

// Maintenance reminder logic
export function getNextCleanupDate(lastCutDate: string, frequency: string): Date {
  const lastCut = new Date(lastCutDate)
  const weeksMap: Record<string, number> = {
    biweekly: 3,
    monthly: 5,
    quarterly: 7,
    rarely: 8,
  }
  const weeks = weeksMap[frequency] || 5
  lastCut.setDate(lastCut.getDate() + weeks * 7)
  return lastCut
}

export function getMaintenanceReminder(
  lastCutDate: string | null,
  frequency: string | null
): { message: string; urgency: 'normal' | 'soon' | 'overdue'; daysUntil: number } | null {
  if (!lastCutDate || !frequency) return null

  const nextCleanup = getNextCleanupDate(lastCutDate, frequency)
  const now = new Date()
  const diffMs = nextCleanup.getTime() - now.getTime()
  const daysUntil = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (daysUntil < 0) {
    return {
      message: `You're ${Math.abs(daysUntil)} days past your ideal cleanup date. Time to book!`,
      urgency: 'overdue',
      daysUntil,
    }
  } else if (daysUntil <= 7) {
    return {
      message: `Schedule a cleanup in the next ${daysUntil} day${daysUntil !== 1 ? 's' : ''} to keep your style sharp.`,
      urgency: 'soon',
      daysUntil,
    }
  } else if (daysUntil <= 14) {
    return {
      message: `Your next cleanup is in about ${daysUntil} days. Consider booking ahead.`,
      urgency: 'normal',
      daysUntil,
    }
  }

  return null
}
