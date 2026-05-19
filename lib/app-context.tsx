"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { type AppState, type Screen, initialAppState, type HairstyleRecommendation } from "@/lib/types"

interface AppContextType {
  state: AppState
  navigateTo: (screen: Screen) => void
  setUserSession: (session: AppState['userSession']) => void
  setEmail: (email: string) => void
  setUploadedImage: (type: 'front' | 'side' | 'hairline', url: string | null) => void
  setMaintenanceLevel: (level: AppState['questionnaireAnswers']['maintenance']) => void
  setStyleGoal: (goal: AppState['questionnaireAnswers']['styleGoal']) => void
  setAnalysisResult: (result: AppState['analysisResult']) => void
  setRecommendations: (recommendations: HairstyleRecommendation[]) => void
  nextRecommendation: () => void
  saveRecommendation: (recommendation: HairstyleRecommendation) => void
  setFeedbackMatched: (matched: boolean | null) => void
  setFeedbackPhoto: (url: string | null) => void
  resetUpload: () => void
  goBack: () => void
}

const AppContext = createContext<AppContextType | null>(null)

const screenHistory: Screen[] = []

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialAppState)

  const navigateTo = (screen: Screen) => {
    screenHistory.push(state.currentScreen)
    setState(prev => ({ ...prev, currentScreen: screen }))
  }

  const goBack = () => {
    const previousScreen = screenHistory.pop()
    if (previousScreen) {
      setState(prev => ({ ...prev, currentScreen: previousScreen }))
    }
  }

  const setUserSession = (userSession: AppState['userSession']) => {
    setState(prev => ({ ...prev, userSession }))
  }

  const setEmail = (email: string) => {
    setState(prev => ({ ...prev, email }))
  }

  const setUploadedImage = (type: 'front' | 'side' | 'hairline', url: string | null) => {
    setState(prev => ({
      ...prev,
      uploadedImages: { ...prev.uploadedImages, [type]: url }
    }))
  }

  const setMaintenanceLevel = (maintenance: AppState['questionnaireAnswers']['maintenance']) => {
    setState(prev => ({
      ...prev,
      questionnaireAnswers: { ...prev.questionnaireAnswers, maintenance }
    }))
  }

  const setStyleGoal = (styleGoal: AppState['questionnaireAnswers']['styleGoal']) => {
    setState(prev => ({
      ...prev,
      questionnaireAnswers: { ...prev.questionnaireAnswers, styleGoal }
    }))
  }

  const setAnalysisResult = (analysisResult: AppState['analysisResult']) => {
    setState(prev => ({ ...prev, analysisResult }))
  }

  const setRecommendations = (recommendations: HairstyleRecommendation[]) => {
    setState(prev => ({ ...prev, recommendations, currentRecommendationIndex: 0 }))
  }

  const nextRecommendation = () => {
    setState(prev => ({
      ...prev,
      currentRecommendationIndex: Math.min(
        prev.currentRecommendationIndex + 1,
        prev.recommendations.length - 1
      )
    }))
  }

  const saveRecommendation = (recommendation: HairstyleRecommendation) => {
    setState(prev => ({
      ...prev,
      savedRecommendations: [...prev.savedRecommendations, recommendation]
    }))
  }

  const setFeedbackMatched = (matched: boolean | null) => {
    setState(prev => ({
      ...prev,
      feedbackData: { ...prev.feedbackData, matched }
    }))
  }

  const setFeedbackPhoto = (url: string | null) => {
    setState(prev => ({
      ...prev,
      feedbackData: { ...prev.feedbackData, afterPhoto: url }
    }))
  }

  const resetUpload = () => {
    setState(prev => ({
      ...prev,
      uploadedImages: { front: null, side: null, hairline: null },
      questionnaireAnswers: { maintenance: null, styleGoal: null },
    }))
  }

  return (
    <AppContext.Provider value={{
      state,
      navigateTo,
      setUserSession,
      setEmail,
      setUploadedImage,
      setMaintenanceLevel,
      setStyleGoal,
      setAnalysisResult,
      setRecommendations,
      nextRecommendation,
      saveRecommendation,
      setFeedbackMatched,
      setFeedbackPhoto,
      resetUpload,
      goBack,
    }}>
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
