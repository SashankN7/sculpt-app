"use client"

import { useApp } from "@/lib/app-context"
import { QuestionnaireBase } from "@/components/screens/questionnaire-base"
import { questionnaireStep2Questions } from "@/lib/questionnaire-data"

export function QuestionnaireStyle() {
  const { navigateTo } = useApp()

  const handleNext = () => {
    navigateTo('questionnaire-3')
  }

  const handleBack = () => {
    navigateTo('questionnaire-1')
  }

  return (
    <QuestionnaireBase
      stepNumber={2}
      totalSteps={4}
      title="Your Style Ambition"
      subtitle="We match ambition to outcome — be honest about how adventurous you want to go."
      questions={questionnaireStep2Questions}
      onNext={handleNext}
      onBack={handleBack}
      nextLabel="NEXT"
    />
  )
}