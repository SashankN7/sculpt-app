// Push notification infrastructure
// This sets up the client-side notification system.
// When you're ready to go live, integrate with OneSignal, Firebase Cloud Messaging,
// or Expo Push Notifications for actual server-side delivery.

// ── Notification Types ──
export interface NotificationPayload {
  title: string
  body: string
  icon?: string
  tag?: string // Dedup tag — prevents stacking
  data?: Record<string, string>
}

export type NotificationType =
  | 'maintenance-reminder'    // "Your cleanup is due in 3 days"
  | 'trend-update'            // "New trending styles for your profile"
  | 'new-recommendation'      // "We found 3 new styles matching you"
  | 'streak-reminder'         // "Don't break your streak! Log your cut"
  | 'growth-check'            // "Time to check your progress photos"
  | 'seasonal-alert'          // "Summer styles are here"

// ── Request Notification Permission ──
export async function requestNotificationPermission(): Promise<'granted' | 'denied' | 'default'> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'default'
  }

  try {
    const permission = await Notification.requestPermission()
    return permission
  } catch {
    return 'default'
  }
}

// ── Check Current Permission ──
export function getNotificationPermission(): 'granted' | 'denied' | 'default' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'default'
  }
  return Notification.permission
}

// ── Send a Local Notification ──
// This shows an in-app notification. For actual push notifications,
// you'll need to integrate with a push service (OneSignal, FCM, etc.)
export function sendLocalNotification(payload: NotificationPayload): void {
  if (typeof window === 'undefined') return

  // Try native Notification API first
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/icon.png',
        tag: payload.tag,
      })
      return
    } catch {
      // Fall through to in-app notification
    }
  }

  // Dispatch custom event for in-app notification display
  window.dispatchEvent(
    new CustomEvent('sculpt-notification', {
      detail: payload,
    })
  )
}

// ── Generate Notification Content ──
export function generateMaintenanceReminder(
  daysUntil: number,
  hairstyleName?: string
): NotificationPayload {
  if (daysUntil < 0) {
    return {
      title: '⏰ Overdue for a Cleanup',
      body: hairstyleName
        ? `Your ${hairstyleName} is ${Math.abs(daysUntil)} days past its ideal cleanup date. Time to book!`
        : `You're ${Math.abs(daysUntil)} days past your ideal cleanup date. Time to book!`,
      tag: 'maintenance-overdue',
    }
  }

  if (daysUntil <= 3) {
    return {
      title: '✂️ Cleanup Coming Up',
      body: hairstyleName
        ? `Schedule a ${hairstyleName} cleanup in the next ${daysUntil} day${daysUntil !== 1 ? 's' : ''}.`
        : `Your style cleanup is due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}.`,
      tag: 'maintenance-soon',
    }
  }

  return {
    title: '📅 Upcoming Cleanup',
    body: `Your next cleanup is in about ${daysUntil} days. Consider booking ahead.`,
    tag: 'maintenance-normal',
  }
}

export function generateStreakReminder(currentStreak: number): NotificationPayload {
  return {
    title: `🔥 Don't Break Your Streak!`,
    body: `You've got a ${currentStreak}-day grooming streak going. Log your latest cut to keep it alive!`,
    tag: 'streak-reminder',
  }
}

export function generateTrendAlert(): NotificationPayload {
  return {
    title: '🌟 New Trending Styles',
    body: 'Check out this season\'s trending haircuts — personalized for your profile.',
    tag: 'trend-update',
  }
}

export function generateGrowthCheck(): NotificationPayload {
  return {
    title: '📸 Time for a Progress Check',
    body: 'Upload a progress photo to track how your style is growing out.',
    tag: 'growth-check',
  }
}

export function generateSeasonalAlert(season: string): NotificationPayload {
  const seasonEmoji: Record<string, string> = {
    spring: '🌸',
    summer: '☀️',
    fall: '🍂',
    winter: '❄️',
  }

  return {
    title: `${seasonEmoji[season] || '💇'} ${season.charAt(0).toUpperCase() + season.slice(1)} Styles Are Here`,
    body: `Discover ${season}-perfect haircuts tailored to your face shape and preferences.`,
    tag: `seasonal-${season}`,
  }
}

// ── Smart Notification Scheduler ──
// Determines which notifications to send based on user state
export function getSmartNotifications(userState: {
  lastCutDate: string | null
  cutFrequency: string | null
  currentStreak: number
  progressPhotoCount: number
}): NotificationPayload[] {
  const notifications: NotificationPayload[] = []

  // Maintenance reminder
  if (userState.lastCutDate && userState.cutFrequency) {
    const lastCut = new Date(userState.lastCutDate)
    const now = new Date()
    const freqWeeks: Record<string, number> = { biweekly: 3, monthly: 5, quarterly: 7, rarely: 8 }
    const weeks = freqWeeks[userState.cutFrequency] || 5
    const nextCleanup = new Date(lastCut)
    nextCleanup.setDate(nextCleanup.getDate() + weeks * 7)
    const daysUntil = Math.ceil((nextCleanup.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntil <= 7) {
      notifications.push(generateMaintenanceReminder(daysUntil))
    }
  }

  // Streak reminder (if streak > 3 and hasn't logged in 2+ days)
  if (userState.currentStreak > 3 && userState.lastCutDate) {
    const lastCut = new Date(userState.lastCutDate)
    const daysSince = Math.floor((Date.now() - lastCut.getTime()) / (1000 * 60 * 60 * 24))
    if (daysSince >= 2) {
      notifications.push(generateStreakReminder(userState.currentStreak))
    }
  }

  // Growth check (if has progress photos and hasn't checked in 2 weeks)
  if (userState.progressPhotoCount > 0 && userState.lastCutDate) {
    const lastCut = new Date(userState.lastCutDate)
    const daysSince = Math.floor((Date.now() - lastCut.getTime()) / (1000 * 60 * 60 * 24))
    if (daysSince >= 14) {
      notifications.push(generateGrowthCheck())
    }
  }

  return notifications.slice(0, 1) // Max 1 notification at a time
}

// ── Service Worker Registration (for push notifications) ──
// This is the foundation for actual push notifications when you integrate
// with OneSignal, Firebase, or another push service.
export async function registerServiceWorker(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js')
    return !!registration
  } catch {
    return false
  }
}
