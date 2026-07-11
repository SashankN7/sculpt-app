"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/lib/app-context"
import { LandingScreen } from "@/components/screens/landing-screen"
import { InstallPrompt } from "@/components/install-prompt"
import { AuthScreen } from "@/components/screens/auth-screen"
import { UploadScreen } from "@/components/screens/upload-screen"
import { QuestionnaireMaintenance } from "@/components/screens/questionnaire-maintenance"
import { QuestionnaireStyle } from "@/components/screens/questionnaire-style"
import { QuestionnaireGoals } from "@/components/screens/questionnaire-3"
import { QuestionnaireFinal } from "@/components/screens/questionnaire-4"
import { RecommendationDetailScreen } from "@/components/screens/recommendation-detail-screen"
import { RecommendationFullScreen } from "@/components/screens/recommendation-full-screen"
import { ChatAssistantScreen } from "@/components/screens/chat-assistant-screen"
import { SettingsScreen } from "@/components/screens/settings-screen"
import { ProcessingScreen } from "@/components/screens/processing-screen"
import { LowConfidenceScreen } from "@/components/screens/low-confidence-screen"
import { RecommendationsScreen } from "@/components/screens/recommendations-screen"
import { BarberCardScreen } from "@/components/screens/barber-card-screen"
import { PaywallScreen } from "@/components/screens/paywall-screen"
import { FeedbackScreen } from "@/components/screens/feedback-screen"
import { HistoryScreen } from "@/components/screens/history-screen"
import { DashboardScreen } from "@/components/screens/dashboard-screen"
import { MenuScreen } from "@/components/screens/menu-screen"
import { HairJourneyScreen } from "@/components/screens/hair-journey-screen"
import { GamificationScreen } from "@/components/screens/gamification-screen"
import { ProfileScreen } from "@/components/screens/profile-screen"
import { HelpSupportScreen } from "@/components/screens/help-support-screen"
import { PrivacyLegalScreen } from "@/components/screens/privacy-legal-screen"
import { ProfileSetupScreen } from "@/components/screens/profile-setup-screen"
import { LogCutScreen } from "@/components/screens/log-cut-screen"
import { DailyCheckInScreen } from "@/components/screens/daily-checkin-screen"
import { ReferFriendScreen } from "@/components/screens/refer-friend-screen"
import { motion, AnimatePresence } from "framer-motion"
import { getDailyCheckInNotification, sendLocalNotification, requestNotificationPermission } from "@/lib/notifications"

export function SculptApp() {
  const { state } = useApp()
  const [isBooting, setIsBooting] = useState(true)

  // Show splash for a brief moment while session loads
  useEffect(() => {
    const timer = setTimeout(() => setIsBooting(false), 800)
    return () => clearTimeout(timer)
  }, [])

  // Daily check-in notification — send reminder after 6 PM if not checked in
  useEffect(() => {
    if (state.userSession === 'guest') return
    // Check notification permission on first load
    requestNotificationPermission()
    // Send check-in reminder if applicable
    const notif = getDailyCheckInNotification(
      state.gamification.lastCheckInDate,
      state.gamification.dailyCheckInStreak
    )
    if (notif) {
      sendLocalNotification(notif)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Branded splash screen while app boots
  if (isBooting) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-background">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-gold animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 12h8"/>
              <path d="M12 8v8"/>
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">SCULPT</h1>
        <p className="text-sm text-muted-foreground">Loading your style...</p>
        <div className="mt-6 w-32 h-1 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-gold rounded-full animate-pulse-gold" style={{ width: '60%' }} />
        </div>
      </div>
    )
  }

  const renderScreen = () => {
    switch (state.currentScreen) {
      case 'landing':
        return <LandingScreen />
      case 'auth':
        return <AuthScreen />
      case 'upload':
        return <UploadScreen />
      case 'questionnaire-1':
        return <QuestionnaireMaintenance />
      case 'questionnaire-2':
        return <QuestionnaireStyle />
      case 'questionnaire-3':
        return <QuestionnaireGoals />
      case 'questionnaire-4':
        return <QuestionnaireFinal />
      case 'settings':
        return <SettingsScreen />
      case 'processing':
        return <ProcessingScreen />
      case 'low-confidence':
        return <LowConfidenceScreen />
      case 'recommendations':
        return <RecommendationsScreen />
      case 'recommendation-detail':
        return <RecommendationDetailScreen savedOnly={state.detailViewMode === 'savedOnly'} />
      case 'recommendation-full':
        return <RecommendationFullScreen />
      case 'chat-assistant':
        return <ChatAssistantScreen />
      case 'barber-card':
        return <BarberCardScreen />
      case 'paywall':
        return <PaywallScreen />
      case 'feedback':
        return <FeedbackScreen />
      case 'history':
        return <HistoryScreen />
      case 'dashboard':
        return <DashboardScreen />
      case 'menu':
        return <MenuScreen />
      case 'progress-tracker':
        return <HairJourneyScreen />
      case 'gamification':
        return <GamificationScreen />
      case 'profile':
        return <ProfileScreen />
      case 'help-support':
        return <HelpSupportScreen />
      case 'privacy-legal':
        return <PrivacyLegalScreen />
      case 'profile-setup':
        return <ProfileSetupScreen />
      case 'log-cut':
        return <LogCutScreen />
      case 'daily-checkin':
        return <DailyCheckInScreen />
      case 'refer-friend':
        return <ReferFriendScreen />
      default:
        return <LandingScreen />
    }
  }

  return (
    <div className="h-screen bg-background overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={state.currentScreen}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="h-full"
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>
      <InstallPrompt />
    </div>
  )
}
