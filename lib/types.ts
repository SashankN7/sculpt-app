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
  | 'preview'

export type UserSession = 'guest' | 'authenticated' | 'trial' | 'premium'

// Scan limits per tier — free users get unlimited scans, premium unlocks real AI analysis
export const SCAN_LIMITS: Record<UserSession, number> = {
  guest: 999,   // unlimited scans (local engine only)
  authenticated: 999, // unlimited scans (local engine only)
  trial: 999,    // unlimited scans + real AI
  premium: 999,  // unlimited scans + real AI
}

// Pricing
export const PRICING = {
  monthly: { price: 14.99, label: '$14.99/mo', period: 'Monthly' },
  annual: { price: 89.99, label: '$89.99/yr', period: 'Annual', monthlyEquivalent: 7.50 },
  trialDays: 7,
} as const

// Preview pack pricing
export const PREVIEW_PACK_PRICING = {
  price: 2.99,
  credits: 5,
  label: '$2.99 for 5 Previews',
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
  metadata: {
    maintenance: number
    stylingEffort: number
    professionalism: number
    trendiness: number
  }
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

export interface FeedbackData {
  recommendationId: string
  matched: boolean | null
  afterPhoto: string | null
  additionalComments: string
  barberNotes: string
  satisfaction?: number
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
  // Retention
  groomingStreak: number
  lastGroomingTipDate: string | null
  // Preview
  previewCredits: number
  // Navigation helpers
  settingsScrollTo: string | null
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
  groomingStreak: 0,
  lastGroomingTipDate: null,
  previewCredits: 0,
  settingsScrollTo: null,
}
