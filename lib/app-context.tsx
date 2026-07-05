"use client"

import { createContext, useContext, useState, useCallback, useMemo, useRef, useEffect, type ReactNode } from "react"
import { type AppState, type Screen, initialAppState, type HairstyleRecommendation, type PhotoRetentionOption, type FeedbackData, type ProgressPhoto, defaultSettingsState, SCAN_LIMITS, PRICING } from "@/lib/types"
import { saveStateToStorage, loadStateFromStorage } from "@/lib/persistence"
import { createClient, clearRememberedEmail } from "@/lib/supabase"
import { logHaircut as logHaircutUtil, awardBadge, initGamification, canLogHaircut } from "@/lib/gamification"

interface AppContextType {
  state: AppState
  navigateTo: (screen: Screen) => void
  setUserSession: (session: AppState['userSession']) => void
  setEmail: (email: string) => void
  startTrial: () => void
  isInTrial: () => boolean
  trialDaysLeft: () => number
  isPremiumActive: () => boolean
  setUploadedImage: (type: 'front' | 'side' | 'hairline', url: string | null) => void
  setMaintenanceLevel: (level: string) => void
  setStyleGoal: (goal: string) => void
  setQuestionnaireAnswer: (questionId: string, answer: string | string[] | number | null) => void
  getQuestionnaireAnswer: (questionId: string) => string | string[] | number | null
  setAnalysisResult: (result: AppState['analysisResult']) => void
  setRecommendations: (recommendations: HairstyleRecommendation[]) => void
  nextRecommendation: () => void
  saveRecommendation: (recommendation: HairstyleRecommendation) => void
  rejectRecommendation: (recommendation: HairstyleRecommendation) => void
  unsaveRecommendation: (id: string) => void
  unrejectRecommendation: (id: string) => void
  setFeedbackData: (data: Partial<FeedbackData>) => void
  setPhotoRetention: (option: PhotoRetentionOption) => void
  setAiPersonalization: (key: keyof AppState['settings']['aiPersonalization'], value: boolean) => void
  setNotification: (key: keyof AppState['settings']['notifications'], value: boolean) => void
  setLastCutDate: (date: string | null) => void
  setCutFrequency: (frequency: string | null) => void
  resetUpload: () => void
  resetAll: () => void
  setCurrentSavedIndex: (index: number) => void
  syncRecommendationIndex: (savedIndex: number) => void
  resetSwipeIndex: () => void
  canScan: () => boolean
  scansRemaining: () => number
  incrementScanCount: () => void
  goBack: () => void
  signOut: () => Promise<void>
  setSettingsScrollTo: (section: string | null) => void
  clearSettingsScrollTo: () => void
  addPreviewCredits: (count: number) => void
  previewRecommendation: HairstyleRecommendation | null
  setPreviewRecommendation: (rec: HairstyleRecommendation | null) => void
  logHaircut: (hairstyleName: string) => boolean
  addProgressPhoto: (photo: ProgressPhoto) => void
  removeProgressPhoto: (id: string) => void
  setPushPermission: (permission: 'default' | 'granted' | 'denied') => void
  setProfile: (profile: Partial<AppState['profile']>) => void
}

const AppContext = createContext<AppContextType | null>(null)



function getInitialState(): AppState {
  if (typeof window === 'undefined') return initialAppState
  const saved = loadStateFromStorage()
  if (saved) {
    // Ensure badges are always initialized from definitions
    const gamification = saved.gamification?.badges?.length
      ? saved.gamification
      : { ...initialAppState.gamification, ...saved.gamification, badges: initGamification().badges }
    return {
      ...initialAppState,
      ...saved,
      gamification,
      currentScreen: saved.userSession !== 'guest' ? 'dashboard' : 'landing',
      lastCutDate: saved.lastCutDate ?? null,
      cutFrequency: saved.cutFrequency ?? null,
    }
  }
  // Fresh state — initialize badges from definitions
  return { ...initialAppState, gamification: initGamification() }
}

// Cloud sync helpers
async function saveToSupabase(state: AppState) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Upsert user data
    const { error } = await supabase
      .from('user_data')
      .upsert({
        user_id: user.id,
        analysis_result: state.analysisResult,
        recommendations: state.recommendations,
        saved_recommendations: state.savedRecommendations,
        rejected_recommendations: state.rejectedRecommendations,
        questionnaire_data: state.questionnaireData,
        last_cut_date: state.lastCutDate,
        cut_frequency: state.cutFrequency,
        grooming_streak: state.gamification.currentStreak,
        preview_credits: state.previewCredits,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      })

    if (error) {
      console.error('Failed to save to Supabase:', error)
    }
  } catch (err) {
    console.error('Cloud sync error:', err)
  }
}

async function loadFromSupabase(): Promise<Partial<AppState> | null> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('user_data')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error || !data) return null

    return {
      analysisResult: data.analysis_result,
      recommendations: data.recommendations ?? [],
      savedRecommendations: data.saved_recommendations ?? [],
      rejectedRecommendations: data.rejected_recommendations ?? [],
      questionnaireData: data.questionnaire_data ?? {},
      lastCutDate: data.last_cut_date,
      cutFrequency: data.cut_frequency,
      gamification: {
        ...initialAppState.gamification,
        currentStreak: data.grooming_streak ?? 0,
        longestStreak: data.grooming_streak ?? 0,
      },
      previewCredits: data.preview_credits ?? 0,
    }
  } catch (err) {
    console.error('Failed to load from Supabase:', err)
    return null
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(getInitialState)
  const screenHistoryRef = useRef<Screen[]>([])
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-restore Supabase session on mount ("Remember me" persistence)
  // This ensures users stay logged in even after Safari clears cookies
  useEffect(() => {
    async function restoreSession() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (session && state.userSession !== 'authenticated' && state.userSession !== 'premium' && state.userSession !== 'trial') {
        setUserSession('authenticated')
      }
    }
    restoreSession()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Save to localStorage on every state change
  useEffect(() => {
    saveStateToStorage(state)
  }, [state])

  // Debounced cloud sync — saves to Supabase 2 seconds after last change
  useEffect(() => {
    if (state.userSession === 'guest') return

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current)
    }

    syncTimeoutRef.current = setTimeout(() => {
      saveToSupabase(state)
    }, 2000)

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }
    }
  }, [state, state.userSession])

  // Load cloud data on mount if authenticated
  useEffect(() => {
    if (state.userSession === 'guest') return

    async function loadCloudData() {
      const cloudData = await loadFromSupabase()
      if (cloudData) {
        setState(prev => ({
          ...prev,
          ...cloudData,
        }))
      }
    }

    loadCloudData()
  }, [state.userSession])

  // Detect OAuth callback on mount — clean URL and set session
  // Profile loading and screen routing is handled by the getUserInfo effect below
  useEffect(() => {
    async function handleOAuthCallback() {
      const url = new URL(window.location.href)
      const hasAuthCode = url.searchParams.has('code')
      const hasProfileSetup = url.searchParams.get('profile_setup') === 'true'

      if (!hasAuthCode && !hasProfileSetup) return

      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        // Clean up OAuth redirect URL params
        const cleanUrl = new URL(window.location.origin + window.location.pathname)
        window.history.replaceState({}, '', cleanUrl.toString())

        // Set session — triggers getUserInfo effect which handles profile + routing
        setUserSession('authenticated')
      }
    }

    handleOAuthCallback()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Get user email and profile from Supabase when session changes (non-OAuth)
  useEffect(() => {
    async function getUserInfo() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setState(prev => ({ ...prev, email: user.email! }))

        // Load profile data from user_profiles
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('first_name, last_name, location, date_of_birth, profile_complete')
          .eq('user_id', user.id)
          .single()

        if (profileData && profileData.profile_complete) {
          setState(prev => ({
            ...prev,
            profile: {
              firstName: profileData.first_name ?? '',
              lastName: profileData.last_name ?? '',
              location: profileData.location ?? '',
              dateOfBirth: profileData.date_of_birth ?? '',
              profileComplete: true,
            },
          }))
        } else {
          // No profile or incomplete — route to setup
          setState(prev => ({
            ...prev,
            currentScreen: 'profile-setup',
          }))
        }
      }
    }

    if (state.userSession === 'authenticated' || state.userSession === 'premium') {
      getUserInfo()
    }
  }, [state.userSession])

  const navigateTo = useCallback((screen: Screen) => {
    setState(prev => {
      screenHistoryRef.current.push(prev.currentScreen)
      return { ...prev, currentScreen: screen }
    })
  }, [])

  const goBack = useCallback(() => {
    const previousScreen = screenHistoryRef.current.pop()
    if (previousScreen) {
      setState(prev => ({ ...prev, currentScreen: previousScreen }))
    }
  }, [])

  const setUserSession = useCallback((userSession: AppState['userSession']) => {
    setState(prev => ({ ...prev, userSession }))
  }, [])

  const setEmail = useCallback((email: string) => {
    setState(prev => ({ ...prev, email }))
  }, [])

  const setUploadedImage = useCallback((type: 'front' | 'side' | 'hairline', url: string | null) => {
    setState(prev => ({
      ...prev,
      uploadedImages: { ...prev.uploadedImages, [type]: url }
    }))
  }, [])

  const setMaintenanceLevel = useCallback((maintenance: string) => {
    setState(prev => ({
      ...prev,
      questionnaireData: { ...prev.questionnaireData, maintenance }
    }))
  }, [])

  const setStyleGoal = useCallback((styleGoal: string) => {
    setState(prev => ({
      ...prev,
      questionnaireData: { ...prev.questionnaireData, styleGoal }
    }))
  }, [])

  const setQuestionnaireAnswer = useCallback((questionId: string, answer: string | string[] | number | null) => {
    setState(prev => ({
      ...prev,
      questionnaireData: { ...prev.questionnaireData, [questionId]: answer }
    }))
  }, [])

  const getQuestionnaireAnswer = useCallback((questionId: string): string | string[] | number | null => {
    return state.questionnaireData[questionId] ?? null
  }, [state.questionnaireData])

  const setAnalysisResult = useCallback((analysisResult: AppState['analysisResult']) => {
    setState(prev => ({ ...prev, analysisResult }))
  }, [])

  const setRecommendations = useCallback((recommendations: HairstyleRecommendation[]) => {
    setState(prev => ({ ...prev, recommendations, currentRecommendationIndex: 0 }))
  }, [])

  const nextRecommendation = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentRecommendationIndex: Math.min(
        prev.currentRecommendationIndex + 1,
        prev.recommendations.length - 1
      )
    }))
  }, [])

  const saveRecommendation = useCallback((recommendation: HairstyleRecommendation) => {
    setState(prev => {
      // Prevent duplicates
      if (prev.savedRecommendations.some(r => r.id === recommendation.id)) return prev
      // Remove from rejected if it was there
      const newRejected = prev.rejectedRecommendations.filter(r => r.id !== recommendation.id)
      return {
        ...prev,
        savedRecommendations: [...prev.savedRecommendations, recommendation],
        rejectedRecommendations: newRejected,
      }
    })
  }, [])

  const rejectRecommendation = useCallback((recommendation: HairstyleRecommendation) => {
    setState(prev => {
      // Prevent duplicates
      if (prev.rejectedRecommendations.some(r => r.id === recommendation.id)) return prev
      // Remove from saved if it was there
      const newSaved = prev.savedRecommendations.filter(r => r.id !== recommendation.id)
      return {
        ...prev,
        rejectedRecommendations: [...prev.rejectedRecommendations, recommendation],
        savedRecommendations: newSaved,
      }
    })
  }, [])

  const unsaveRecommendation = useCallback((id: string) => {
    setState(prev => {
      const rec = prev.savedRecommendations.find(r => r.id === id)
      return {
        ...prev,
        savedRecommendations: prev.savedRecommendations.filter(r => r.id !== id),
        rejectedRecommendations: rec
          ? [...prev.rejectedRecommendations, rec]
          : prev.rejectedRecommendations,
      }
    })
  }, [])

  const unrejectRecommendation = useCallback((id: string) => {
    setState(prev => {
      const rec = prev.rejectedRecommendations.find(r => r.id === id)
      return {
        ...prev,
        rejectedRecommendations: prev.rejectedRecommendations.filter(r => r.id !== id),
        savedRecommendations: rec
          ? [...prev.savedRecommendations, rec]
          : prev.savedRecommendations,
      }
    })
  }, [])

  const setFeedbackData = useCallback((data: Partial<FeedbackData>) => {
    setState(prev => ({
      ...prev,
      feedbackData: { ...prev.feedbackData, ...data }
    }))
  }, [])

  const setPhotoRetention = useCallback((option: PhotoRetentionOption) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, photoRetention: option }
    }))
  }, [])

  const setAiPersonalization = useCallback((key: keyof AppState['settings']['aiPersonalization'], value: boolean) => {
    setState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        aiPersonalization: { ...prev.settings.aiPersonalization, [key]: value }
      }
    }))
  }, [])

  const setNotification = useCallback((key: keyof AppState['settings']['notifications'], value: boolean) => {
    setState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        notifications: { ...prev.settings.notifications, [key]: value }
      }
    }))
  }, [])

  const setLastCutDate = useCallback((date: string | null) => {
    setState(prev => ({ ...prev, lastCutDate: date }))
  }, [])

  const setCutFrequency = useCallback((frequency: string | null) => {
    setState(prev => ({ ...prev, cutFrequency: frequency }))
  }, [])

  const resetUpload = useCallback(() => {
    setState(prev => ({
      ...prev,
      uploadedImages: { front: null, side: null, hairline: null },
      questionnaireData: {},
      analysisResult: null,
      recommendations: [],
      currentRecommendationIndex: 0,
      savedRecommendations: [],
      rejectedRecommendations: [],
      currentSavedIndex: 0,
    }))
  }, [])

  const resetAll = useCallback(() => {
    setState(initialAppState)
    screenHistoryRef.current = []
  }, [])

  const setCurrentSavedIndex = useCallback((index: number) => {
    setState(prev => ({ ...prev, currentSavedIndex: index }))
  }, [])

  const resetSwipeIndex = useCallback(() => {
    setState(prev => ({ ...prev, currentRecommendationIndex: 0 }))
  }, [])

  const signOut = useCallback(async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch (err) {
      console.error('Sign out error:', err)
    }
    clearRememberedEmail()
    setState(initialAppState)
    screenHistoryRef.current = []
  }, [])

  const addPreviewCredits = useCallback((count: number) => {
    setState(prev => ({ ...prev, previewCredits: prev.previewCredits + count }))
  }, [])

  const [previewRecommendation, setPreviewRecommendationState] = useState<HairstyleRecommendation | null>(null)

  const setPreviewRecommendation = useCallback((rec: HairstyleRecommendation | null) => {
    setPreviewRecommendationState(rec)
  }, [])

  // ── Gamification ──
  const logHaircut = useCallback((hairstyleName: string) => {
    // Check cooldown — only allow logging every 2 weeks
    const { allowed } = canLogHaircut(state.gamification.lastCutLoggedDate)
    if (!allowed) return false

    setState(prev => {
      const uniqueStyles = [
        ...new Set(prev.savedRecommendations.map(r => r.name)),
        ...new Set(prev.rejectedRecommendations.map(r => r.name)),
      ]
      const newGamification = logHaircutUtil(prev.gamification, hairstyleName, uniqueStyles)
      return { ...prev, gamification: newGamification, lastCutDate: new Date().toISOString().split('T')[0] }
    })
    return true
  }, [state.gamification.lastCutLoggedDate])

  // ── Progress Photos ──
  const addProgressPhoto = useCallback((photo: ProgressPhoto) => {
    setState(prev => {
      const newPhotos = [photo, ...prev.progressPhotos]
      const newCount = newPhotos.length
      let gamification = prev.gamification
      if (newCount >= 10) gamification = awardBadge(gamification, 'progress-10')
      else if (newCount >= 3) gamification = awardBadge(gamification, 'progress-3')
      return { ...prev, progressPhotos: newPhotos, gamification }
    })
  }, [])

  const removeProgressPhoto = useCallback((id: string) => {
    setState(prev => ({ ...prev, progressPhotos: prev.progressPhotos.filter(p => p.id !== id) }))
  }, [])

  const setPushPermission = useCallback((permission: 'default' | 'granted' | 'denied') => {
    setState(prev => ({ ...prev, pushPermission: permission }))
  }, [])

  const setProfile = useCallback((profile: Partial<AppState['profile']>) => {
    setState(prev => ({
      ...prev,
      profile: { ...prev.profile, ...profile, profileComplete: true }
    }))
  }, [])

  const setSettingsScrollTo = useCallback((section: string | null) => {
    setState(prev => ({ ...prev, settingsScrollTo: section }))
  }, [])

  const clearSettingsScrollTo = useCallback(() => {
    setState(prev => ({ ...prev, settingsScrollTo: null }))
  }, [])

  // Trial management
  const startTrial = useCallback(() => {
    const now = new Date().toISOString()
    setState(prev => ({
      ...prev,
      userSession: 'trial',
      trialStartedAt: now,
    }))
  }, [])

  const isInTrial = useCallback(() => {
    if (state.userSession !== 'trial' || !state.trialStartedAt) return false
    const start = new Date(state.trialStartedAt).getTime()
    const now = Date.now()
    const trialMs = PRICING.trialDays * 24 * 60 * 60 * 1000
    return now - start < trialMs
  }, [state.userSession, state.trialStartedAt])

  const trialDaysLeft = useCallback(() => {
    if (state.userSession !== 'trial' || !state.trialStartedAt) return 0
    const start = new Date(state.trialStartedAt).getTime()
    const now = Date.now()
    const trialMs = PRICING.trialDays * 24 * 60 * 60 * 1000
    const elapsed = now - start
    const remaining = Math.max(0, trialMs - elapsed)
    return Math.ceil(remaining / (24 * 60 * 60 * 1000))
  }, [state.userSession, state.trialStartedAt])

  // Check if user has premium access (paid or active trial)
  const isPremiumActive = useCallback(() => {
    return state.userSession === 'premium' || (state.userSession === 'trial' && isInTrial())
  }, [state.userSession, isInTrial])

  // Scan limit enforcement using SCAN_LIMITS from types
  const canScan = useCallback(() => {
    const limit = SCAN_LIMITS[state.userSession]
    const today = new Date().toISOString().split('T')[0]
    if (state.lastScanDate !== today) return true
    return state.scanCountToday < limit
  }, [state.userSession, state.scanCountToday, state.lastScanDate])

  // How many scans remaining today
  const scansRemaining = useCallback(() => {
    const limit = SCAN_LIMITS[state.userSession]
    const today = new Date().toISOString().split('T')[0]
    if (state.lastScanDate !== today) return limit
    return Math.max(0, limit - state.scanCountToday)
  }, [state.userSession, state.scanCountToday, state.lastScanDate])

  const incrementScanCount = useCallback(() => {
    const today = new Date().toISOString().split('T')[0]
    setState(prev => ({
      ...prev,
      scanCountToday: prev.lastScanDate === today ? prev.scanCountToday + 1 : 1,
      lastScanDate: today,
    }))
  }, [])

  const syncRecommendationIndex = useCallback((recIndex: number) => {
    if (recIndex >= 0 && recIndex < state.recommendations.length) {
      setState(prev => ({ ...prev, currentRecommendationIndex: recIndex }))
    }
  }, [state.recommendations.length])

  const contextValue = useMemo(() => ({
    state,
    navigateTo,
    setUserSession,
    setEmail,
    startTrial,
    isInTrial,
    trialDaysLeft,
    isPremiumActive,
    setUploadedImage,
    setMaintenanceLevel,
    setStyleGoal,
    setQuestionnaireAnswer,
    getQuestionnaireAnswer,
    setAnalysisResult,
    setRecommendations,
    nextRecommendation,
    saveRecommendation,
    rejectRecommendation,
    unsaveRecommendation,
    unrejectRecommendation,
    setFeedbackData,
    setPhotoRetention,
    setAiPersonalization,
    setNotification,
    setLastCutDate,
    setCutFrequency,
    resetUpload,
    resetAll,
    setCurrentSavedIndex,
    syncRecommendationIndex,
    resetSwipeIndex,
    canScan,
    scansRemaining,
    incrementScanCount,
    goBack,
    signOut,
    setSettingsScrollTo,
    clearSettingsScrollTo,
    addPreviewCredits,
    previewRecommendation,
    setPreviewRecommendation,
    logHaircut,
    addProgressPhoto,
    removeProgressPhoto,
    setPushPermission,
    setProfile,
  }), [
    state,
    navigateTo,
    setUserSession,
    setEmail,
    setUploadedImage,
    setMaintenanceLevel,
    setStyleGoal,
    setQuestionnaireAnswer,
    getQuestionnaireAnswer,
    setAnalysisResult,
    setRecommendations,
    nextRecommendation,
    saveRecommendation,
    rejectRecommendation,
    unsaveRecommendation,
    unrejectRecommendation,
    setFeedbackData,
    setPhotoRetention,
    setAiPersonalization,
    setNotification,
    setLastCutDate,
    setCutFrequency,
    startTrial,
    isInTrial,
    trialDaysLeft,
    isPremiumActive,
    resetUpload,
    resetAll,
    setCurrentSavedIndex,
    syncRecommendationIndex,
    resetSwipeIndex,
    canScan,
    scansRemaining,
    incrementScanCount,
    goBack,
    signOut,
    setSettingsScrollTo,
    clearSettingsScrollTo,
    addPreviewCredits,
    previewRecommendation,
    setPreviewRecommendation,
    logHaircut,
    addProgressPhoto,
    removeProgressPhoto,
    setPushPermission,
    setProfile,
  ])

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
