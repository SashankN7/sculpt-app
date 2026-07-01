"use client"

import { useApp } from "@/lib/app-context"
import { PhoneFrame } from "@/components/phone-frame"
import { LandingScreen } from "@/components/screens/landing-screen"
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
import { PreviewScreen } from "@/components/screens/preview-screen"
import { motion, AnimatePresence } from "framer-motion"

export function SculptApp() {
  const { state } = useApp()

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
        return <RecommendationDetailScreen />
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
      case 'preview':
        return <PreviewScreen />
      default:
        return <LandingScreen />
    }
  }

  return (
    <PhoneFrame>
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
    </PhoneFrame>
  )
}
