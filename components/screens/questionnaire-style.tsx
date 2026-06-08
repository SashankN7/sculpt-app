"use client"

import { motion } from "framer-motion"
import { useApp } from "@/lib/app-context"
import { ChevronLeft, Sparkles } from "lucide-react"
import type { StyleGoal } from "@/lib/types"

interface OptionCardProps {
  icon: string
  label: string
  description: string
  isSelected: boolean
  onClick: () => void
}

function OptionCard({ icon, label, description, isSelected, onClick }: OptionCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full bg-secondary border rounded-xl p-4 text-left transition-all ${
        isSelected 
          ? 'border-gold ring-1 ring-gold/30' 
          : 'border-border hover:border-muted-foreground/30'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground mb-0.5">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        {isSelected && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-5 h-5 rounded-full bg-gold flex items-center justify-center flex-shrink-0"
          >
            <svg className="w-3 h-3 text-gold-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
        )}
      </div>
    </button>
  )
}

export function QuestionnaireStyle() {
  const { state, navigateTo, setStyleGoal, goBack } = useApp()
  const { questionnaireAnswers } = state

  const handleRunAnalysis = () => {
    navigateTo('processing')
  }

  const options: { value: StyleGoal; icon: string; label: string; description: string }[] = [
    {
      value: 'safe',
      icon: '💼',
      label: 'Safe & Professional',
      description: 'Refining your current style, boardroom clean',
    },
    {
      value: 'modern',
      icon: '⚡',
      label: 'Modern & Trendy',
      description: 'Texture crops, modern pomps, mid-fades',
    },
    {
      value: 'bold',
      icon: '💥',
      label: 'Bold / Complete Transformation',
      description: 'High risk, high payout look shift',
    },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2">
        <button 
          onClick={goBack}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          BACK
        </button>
        <span className="text-sm text-muted-foreground">Step 2 of 3</span>
      </div>

      <div className="flex-1 px-6 pt-4 pb-6 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex-1"
        >
          {/* Title */}
          <h2 className="text-xl font-semibold text-foreground mb-2">
            STYLE DIRECTION & RISK INTENT
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            What is your goal for this haircut change?
          </p>

          {/* Options */}
          <div className="space-y-3">
            {options.map((option) => (
              <OptionCard
                key={option.value}
                icon={option.icon}
                label={option.label}
                description={option.description}
                isSelected={questionnaireAnswers.styleGoal === option.value}
                onClick={() => setStyleGoal(option.value)}
              />
            ))}
          </div>
        </motion.div>

        {/* Run Analysis Button */}
        <motion.button
          onClick={handleRunAnalysis}
          className="flex items-center justify-center gap-2 w-full py-4 px-6 bg-gold text-gold-foreground font-semibold rounded-xl transition-all hover:bg-gold/90 mt-auto"
          whileTap={{ scale: 0.98 }}
        >
          <Sparkles className="w-5 h-5" />
          RUN AI ANALYSIS
        </motion.button>
      </div>
    </div>
  )
}
