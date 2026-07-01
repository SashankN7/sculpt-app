"use client"

import { useApp } from "@/lib/app-context"
import { QuestionnaireBase } from "@/components/screens/questionnaire-base"
import { questionnaireStep3Questions } from "@/lib/questionnaire-data"

export function QuestionnaireGoals() {
  const { navigateTo } = useApp()

  const handleNext = () => {
    navigateTo('questionnaire-4')
  }

  const handleBack = () => {
    navigateTo('questionnaire-2')
  }

  return (
    <QuestionnaireBase
      stepNumber={3}
      totalSteps={4}
      title="Your Goals"
      subtitle="What are you trying to achieve with this haircut change?"
      questions={questionnaireStep3Questions}
      onNext={handleNext}
      onBack={handleBack}
      nextLabel="NEXT"
    />
  )
}