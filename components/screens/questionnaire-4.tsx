"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useApp } from "@/lib/app-context"
import { QuestionnaireBase } from "@/components/screens/questionnaire-base"
import { questionnaireStep4Questions } from "@/lib/questionnaire-data"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function QuestionnaireFinal() {
  const { navigateTo, setQuestionnaireAnswer, getQuestionnaireAnswer } = useApp()
  const [showExtra, setShowExtra] = useState(false)

  const handleNext = () => {
    setShowExtra(true)
  }

  const handleBack = () => {
    if (showExtra) {
      setShowExtra(false)
    } else {
      navigateTo('questionnaire-3')
    }
  }

  const handleSubmit = () => {
    navigateTo('processing')
  }

  if (showExtra) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 md:px-6 py-2">
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-sm text-foreground hover:text-gold transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            BACK
          </button>
          <span className="text-sm text-muted-foreground">Final Step</span>
        </div>

        <div className="flex-1 px-6 md:px-8 pt-4 pb-6 flex flex-col overflow-y-auto mx-auto w-full max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex-1"
          >
            <h2 className="text-xl font-semibold text-foreground mb-2">Anything Else?</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Share any additional details about your preferences, concerns, work situation, or anything you want the AI to consider.
            </p>

            <textarea
              value={(getQuestionnaireAnswer('customNotes') as string) || ''}
              onChange={(e) => setQuestionnaireAnswer('customNotes', e.target.value)}
              placeholder="e.g. I have a receding hairline on the right side, I work in finance so I need to look professional, I want something that hides my forehead..."
              className="w-full h-40 bg-secondary border border-border rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all resize-none"
            />
            <p className="text-xs text-muted-foreground mt-2">
              This is optional but helps Sculpt personalize your results even further.
            </p>
          </motion.div>

          <div className="sticky bottom-0 bg-background pt-4 pb-2">
            <motion.button
              onClick={handleSubmit}
              className="flex items-center justify-center gap-2 w-full py-4 px-6 font-semibold rounded-xl transition-all bg-gold text-gold-foreground hover:bg-gold/90 cursor-pointer"
              whileTap={{ scale: 0.98 }}
            >
              GET MY RECOMMENDATIONS
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <QuestionnaireBase
      stepNumber={4}
      totalSteps={4}
      title="The Context"
      subtitle="A few last details to help us nail the recommendation."
      questions={questionnaireStep4Questions}
      onNext={handleNext}
      onBack={handleBack}
      nextLabel="NEXT"
    />
  )
}
