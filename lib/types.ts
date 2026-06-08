export type Screen = 
  | 'landing'
  | 'auth'
  | 'upload'
  | 'questionnaire-maintenance'
  | 'questionnaire-style'
  | 'processing'
  | 'low-confidence'
  | 'recommendations'
  | 'barber-card'
  | 'paywall'
  | 'feedback'
  | 'history'

export type UserSession = 'guest' | 'authenticated' | 'premium'

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
}

export interface AppState {
  currentScreen: Screen
  userSession: UserSession
  uploadedImages: UploadedImages
  questionnaireAnswers: QuestionnaireAnswers
  analysisResult: AnalysisResult | null
  recommendations: HairstyleRecommendation[]
  currentRecommendationIndex: number
  savedRecommendations: HairstyleRecommendation[]
  history: HaircutHistory[]
  feedbackData: FeedbackData
  email: string
}

export const initialAppState: AppState = {
  currentScreen: 'landing',
  userSession: 'guest',
  uploadedImages: {
    front: null,
    side: null,
    hairline: null,
  },
  questionnaireAnswers: {
    maintenance: null,
    styleGoal: null,
  },
  analysisResult: null,
  recommendations: [],
  currentRecommendationIndex: 0,
  savedRecommendations: [],
  history: [],
  feedbackData: {
    recommendationId: '',
    matched: null,
    afterPhoto: null,
  },
  email: '',
}
