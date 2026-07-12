export type Screen =
  | 'landing'
  | 'auth'
  | 'upload'
  | 'questionnaire-1'
  | 'questionnaire-2'
  | 'questionnaire-3'
  | 'questionnaire-4'
  | 'processing'
  | 'low-confidence'
  | 'recommendations'
  | 'recommendation-detail'
  | 'recommendation-full'
  | 'barber-card'
  | 'chat-assistant'
  | 'paywall'
  | 'feedback'
  | 'history'
  | 'settings'
  | 'dashboard'
  | 'menu'
  | 'progress-tracker'
  | 'gamification'
  | 'profile'
  | 'help-support'
  | 'privacy-legal'
  | 'profile-setup'
  | 'log-cut'
  | 'daily-checkin'

export type UserSession = 'guest' | 'authenticated' | 'trial' | 'premium'

// Scan limits — free users get 1/day, premium/trial get unlimited
// Free users get questionnaire-based inference only (no AI photo analysis)
// Premium users get AI-powered analysis + unlimited scans
export const SCAN_LIMITS: Record<UserSession, number> = {
  guest: 1,          // 1 scan/day — questionnaire-based recs only
  authenticated: 1,   // 1 scan/day — questionnaire-based recs only
  trial: 9999,       // unlimited scans — full AI analysis
  premium: 9999,     // unlimited scans — full AI analysis
}

// Pricing
export const PRICING = {
  monthly: { price: 14.99, label: '$14.99/mo', period: 'Monthly' },
  annual: { price: 89.99, label: '$89.99/yr', period: 'Annual', monthlyEquivalent: 7.50 },
  trialDays: 30,
} as const

// Trait-specific metadata colors: high professionalism/trendiness = green (good), high maintenance/styling = red (bad)
export type TraitKey = 'maintenance' | 'stylingEffort' | 'professionalism' | 'trendiness'

export const TRAIT_COLOR_MAP: Record<TraitKey, { high: string; mid: string; low: string }> = {
  professionalism: { high: 'bg-success', mid: 'bg-warning', low: 'bg-error' },
  trendiness:     { high: 'bg-success', mid: 'bg-warning', low: 'bg-error' },
  maintenance:    { high: 'bg-error',   mid: 'bg-warning', low: 'bg-success' },
  stylingEffort:  { high: 'bg-error',   mid: 'bg-warning', low: 'bg-success' },
}

export const TRAIT_TEXT_COLOR_MAP: Record<TraitKey, { high: string; mid: string; low: string }> = {
  professionalism: { high: 'text-success', mid: 'text-warning', low: 'text-error' },
  trendiness:     { high: 'text-success', mid: 'text-warning', low: 'text-error' },
  maintenance:    { high: 'text-error',   mid: 'text-warning', low: 'text-success' },
  stylingEffort:  { high: 'text-error',   mid: 'text-warning', low: 'text-success' },
}

export function getTraitBgColor(value: number, traitKey: TraitKey): string {
  const map = TRAIT_COLOR_MAP[traitKey]
  if (value <= 40) return map.low
  if (value <= 70) return map.mid
  return map.high
}

export function getTraitTextColor(value: number, traitKey: TraitKey): string {
  const map = TRAIT_TEXT_COLOR_MAP[traitKey]
  if (value <= 40) return map.low
  if (value <= 70) return map.mid
  return map.high
}

// Daily usage limits for premium/trial users (cost protection)
// Trial users get identical limits to premium users
// Previews are a SEPARATE purchase ($2.99 / 5-pack) — not included in any tier
export const DAILY_USAGE_LIMITS = {
  analyses: 10,    // GPT-4o Vision photo analyses per day
  chatMessages: 30, // GPT-4o-mini chat messages per day
  barberCards: 10,  // AI-enhanced barber card generations per day
} as const



// Questionnaire question types
export type QuestionType = 'single' | 'multiple' | 'scale' | 'text'

// Question option for choice-based questions
export interface QuestionOption {
  label: string
  value: string
}

// Individual questionnaire question
export interface QuestionnaireQuestion {
  id: string
  type: QuestionType
  category: string // e.g., 'maintenance', 'boldness', 'lifestyle'
  question: string
  subtext?: string
  options?: QuestionOption[]
  minLabel?: string // for scale questions
  maxLabel?: string
  scaleRange?: number // e.g., 5 or 10
  placeholder?: string // for text questions
}

// Answers stored per question ID
export type QuestionnaireAnswersMap = Record<string, string | string[] | number | null>

// Settings types
export type PhotoRetentionOption = 'indefinite' | '30days' | '7days' | 'immediate'

export interface SettingsState {
  photoRetention: PhotoRetentionOption
  aiPersonalization: {
    useFeedback: boolean
    includeTrends: boolean
    allowAnalytics: boolean
  }
  notifications: {
    maintenanceReminders: boolean
    trendUpdates: boolean
    newRecommendations: boolean
  }
}

export type MaintenanceLevel = 'low' | 'medium' | 'high' | null
export type StyleGoal = 'safe' | 'modern' | 'bold' | null

export interface UploadedImages {
  front: string | null
  side: string | null
  hairline: string | null
}

export interface QuestionnaireAnswers {
  maintenance: MaintenanceLevel
  styleGoal: StyleGoal
}

export interface AnalysisResult {
  faceShape: string
  densityScore: number
  textureProfile: {
    waviness: number
    curliness: number
    straightness: number
  }
  confidenceScore: number
  warnings: string[]
}

export interface HairstyleRecommendation {
  id: string
  name: string
  compatibilityScore: number
  description: string
  imageUrl: string
  isSculptPick: boolean
  isTrending?: boolean
  trendScore?: number
  metadata: {
    maintenance: number
    stylingEffort: number
    professionalism: number
    trendiness: number
  }
  elements: string[] // Tags for AI mixing
  barberCard: BarberCard
}

export interface BarberCard {
  hairstyleName: string
  cuttingMetrics: {
    top: string
    sides: string
    boundary: string
  }
  stylingProtocols: string[]
  warnings: string[]
}

export interface HaircutHistory {
  id: string
  hairstyleName: string
  date: string
  accuracyIndex: number
  isCurrent: boolean
}

// ── Logged Cut — photo captured when user logs a haircut ──
export interface LoggedCut {
  id: string
  date: string
  hairstyleName: string
  photoUrl: string | null
  notes: string
}

// ── Gamification ──
export interface Badge {
  id: string
  name: string
  description: string
  icon: string // emoji
  category: 'streak' | 'milestone' | 'style' | 'social'
  requirement: number // e.g. cuts logged, days streak
  earnedAt: string | null
}

export interface GamificationState {
  badges: Badge[]
  totalCutsLogged: number
  currentStreak: number
  longestStreak: number
  styleVariety: number // unique styles tried
  lastCutLoggedDate: string | null
  // Daily check-in system
  dailyCheckInStreak: number
  longestDailyCheckInStreak: number
  lastCheckInDate: string | null
  totalCheckIns: number
  unlockedRewards: string[] // IDs of earned daily rewards
}

// ── Daily Check-In Reward Tiers ──
export interface DailyReward {
  id: string
  name: string
  description: string
  icon: string // emoji
  streakRequired: number
  type: 'bonus-scan' | 'bonus-chat' | 'feature-preview' | 'premium-day' | 'exclusive-style'
  claimed: boolean
}

export const DAILY_REWARD_TIERS: Omit<DailyReward, 'claimed'>[] = [
  { id: 'reward-3', name: 'Streak Starter', description: '3-day streak unlocked! Enjoy a bonus chat message.', icon: '🎯', streakRequired: 3, type: 'bonus-chat' },
  { id: 'reward-7', name: 'Week Warrior', description: '7 days straight! Heres a bonus scan on us.', icon: '⚡', streakRequired: 7, type: 'bonus-scan' },
  { id: 'reward-14', name: 'Dedicated Groomer', description: '14 days! Unlock a premium feature preview.', icon: '💎', streakRequired: 14, type: 'feature-preview' },
  { id: 'reward-30', name: 'Monthly Master', description: '30-day streak! You earned a free premium day.', icon: '👑', streakRequired: 30, type: 'premium-day' },
  { id: 'reward-60', name: 'Grooming Legend', description: '60 days! Access an exclusive hairstyle.', icon: '🏆', streakRequired: 60, type: 'exclusive-style' },
  { id: 'reward-90', name: 'Sculpt Champion', description: '90-day streak! Youre a true Sculpt champion.', icon: '🔥', streakRequired: 90, type: 'premium-day' },
]

// ── Hair Growth Tracker ──
export interface ProgressPhoto {
  id: string
  imageUrl: string
  date: string
  growthStage: 'fresh' | 'growing' | 'needs-trim' | 'overgrown'
  notes: string
  haircutName?: string
}

// ── Seasonal Styles ──
export interface SeasonalStyle {
  name: string
  description: string
  tag: string // 'Trending' | 'Seasonal' | 'Classic'
  season: 'spring' | 'summer' | 'fall' | 'winter' | 'all'
}

export interface FeedbackData {
  recommendationId: string
  matched: boolean | null
  afterPhoto: string | null
  additionalComments: string
  barberNotes: string
  satisfaction?: number
}

// ── Scan History — each entry archives one completed scan's results ──
export interface ScanHistoryEntry {
  id: string
  date: string
  savedRecommendations: HairstyleRecommendation[]
  rejectedRecommendations: HairstyleRecommendation[]
  recommendations: HairstyleRecommendation[]
  analysisResult: AnalysisResult | null
}

export interface AppState {
  currentScreen: Screen
  userSession: UserSession
  uploadedImages: UploadedImages
  questionnaireData: QuestionnaireAnswersMap
  analysisResult: AnalysisResult | null
  recommendations: HairstyleRecommendation[]
  currentRecommendationIndex: number
  currentSavedIndex: number
  savedRecommendations: HairstyleRecommendation[]
  rejectedRecommendations: HairstyleRecommendation[]
  history: HaircutHistory[]
  feedbackData: FeedbackData
  email: string
  settings: SettingsState
  scanCountToday: number
  lastScanDate: string
  lastCutDate: string | null
  cutFrequency: string | null
  // Trial state
  trialStartedAt: string | null
  // Gamification
  gamification: GamificationState
  // Hair growth tracker
  progressPhotos: ProgressPhoto[]
  // Push notifications
  pushPermission: 'default' | 'granted' | 'denied'
  pushSubscriptionEndpoint: string | null
  // Profile
  profile: {
    firstName: string
    lastName: string
    location: string
    dateOfBirth: string
    profileComplete: boolean
  }
  // Current scan recommendation IDs — used to filter saved/rejected to only current scan
  currentScanIds: string[]
  // Scan history — archived saved/rejected from previous scans
  scanHistory: ScanHistoryEntry[]
  // Logged cuts — photos captured when user logs a haircut
  loggedCuts: LoggedCut[]
  // Navigation helpers
  settingsScrollTo: string | null
  detailViewMode: 'full' | 'savedOnly'

}

export const defaultSettingsState: SettingsState = {
  photoRetention: '30days',
  aiPersonalization: {
    useFeedback: true,
    includeTrends: true,
    allowAnalytics: true,
  },
  notifications: {
    maintenanceReminders: true,
    trendUpdates: false,
    newRecommendations: true,
  },
}

export const initialAppState: AppState = {
  currentScreen: 'landing',
  userSession: 'guest',
  uploadedImages: {
    front: null,
    side: null,
    hairline: null,
  },
  questionnaireData: {},
  analysisResult: null,
  recommendations: [],
  currentRecommendationIndex: 0,
  currentSavedIndex: 0,
  savedRecommendations: [],
  rejectedRecommendations: [],
  history: [],
  feedbackData: {
    recommendationId: '',
    matched: null,
    afterPhoto: null,
    additionalComments: '',
    barberNotes: '',
    satisfaction: 7,
  },
  email: '',
  settings: defaultSettingsState,
  scanCountToday: 0,
  lastScanDate: '',
  lastCutDate: null,
  cutFrequency: null,
  trialStartedAt: null,
  gamification: {
    badges: [
      { id: 'streak-3', name: 'Getting Started', description: 'Log 3 haircuts in a row', icon: '🔥', category: 'streak' as const, requirement: 3, earnedAt: null },
      { id: 'streak-7', name: 'On Fire', description: '7-day grooming streak', icon: '🔥', category: 'streak' as const, requirement: 7, earnedAt: null },
      { id: 'streak-30', name: 'Unstoppable', description: '30-day grooming streak', icon: '💫', category: 'streak' as const, requirement: 30, earnedAt: null },
      { id: 'streak-90', name: 'Grooming Legend', description: '90-day grooming streak', icon: '👑', category: 'streak' as const, requirement: 90, earnedAt: null },
      { id: 'cuts-1', name: 'First Cut', description: 'Log your first haircut', icon: '✂️', category: 'milestone' as const, requirement: 1, earnedAt: null },
      { id: 'cuts-5', name: 'Regular', description: 'Log 5 haircuts', icon: '💇', category: 'milestone' as const, requirement: 5, earnedAt: null },
      { id: 'cuts-10', name: 'Dedicated', description: 'Log 10 haircuts', icon: '🏆', category: 'milestone' as const, requirement: 10, earnedAt: null },
      { id: 'cuts-25', name: 'Haircut Veteran', description: 'Log 25 haircuts', icon: '🎖️', category: 'milestone' as const, requirement: 25, earnedAt: null },
      { id: 'cuts-50', name: 'Sculpt Master', description: 'Log 50 haircuts', icon: '🏅', category: 'milestone' as const, requirement: 50, earnedAt: null },
      { id: 'variety-3', name: 'Style Explorer', description: 'Try 3 different styles', icon: '🎨', category: 'style' as const, requirement: 3, earnedAt: null },
      { id: 'variety-5', name: 'Fashion Forward', description: 'Try 5 different styles', icon: '🌟', category: 'style' as const, requirement: 5, earnedAt: null },
      { id: 'variety-10', name: 'Chameleon', description: 'Try 10 different styles', icon: '🦎', category: 'style' as const, requirement: 10, earnedAt: null },
      { id: 'share-1', name: 'Social Butterfly', description: 'Share your first barber card', icon: '🦋', category: 'social' as const, requirement: 1, earnedAt: null },
      { id: 'share-5', name: 'Trendsetter', description: 'Share 5 barber cards', icon: '📡', category: 'social' as const, requirement: 5, earnedAt: null },
      { id: 'progress-3', name: 'Documentarian', description: 'Upload 3 progress photos', icon: '📸', category: 'milestone' as const, requirement: 3, earnedAt: null },
      { id: 'progress-10', name: 'Hair Historian', description: 'Upload 10 progress photos', icon: '📚', category: 'milestone' as const, requirement: 10, earnedAt: null },
    ],
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
  },
  progressPhotos: [],
  pushPermission: 'default',
  pushSubscriptionEndpoint: null,
  currentScanIds: [],
  scanHistory: [],
  loggedCuts: [],
  profile: {
    firstName: '',
    lastName: '',
    location: '',
    dateOfBirth: '',
    profileComplete: false,
  },
  settingsScrollTo: null,
  detailViewMode: 'full',

}
