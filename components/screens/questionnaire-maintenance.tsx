"use client"

import { motion } from "framer-motion"
import { useApp } from "@/lib/app-context"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { MaintenanceLevel } from "@/lib/types"

interface OptionCardProps {
  icon: string
  iconColor: string
  label: string
  description: string
  isSelected: boolean
  onClick: () => void
}

function OptionCard({ icon, iconColor, label, description, isSelected, onClick }: OptionCardProps) {
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
        <span className={`text-2xl ${iconColor}`}>{icon}</span>
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

export function QuestionnaireMaintenance() {
  const { state, navigateTo, setMaintenanceLevel, goBack } = useApp()
  const { questionnaireAnswers } = state

  const handleSkip = () => {
    setMaintenanceLevel(null)
    navigateTo('processing')
  }

  const handleNext = () => {
    navigateTo('questionnaire-style')
  }

  const options: { value: MaintenanceLevel; icon: string; iconColor: string; label: string; description: string }[] = [
    {
      value: 'low',
      icon: '🟢',
      iconColor: 'text-success',
      label: 'Low Maintenance',
      description: 'Buzz cuts, crew cuts, wash-and-go styles',
    },
    {
      value: 'medium',
      icon: '🟡',
      iconColor: 'text-warning',
      label: 'Medium Maintenance',
      description: 'Requires basic drying & light pomade/clay',
    },
    {
      value: 'high',
      icon: '🔴',
      iconColor: 'text-error',
      label: 'High Maintenance',
      description: 'Requires blow dryer, round brush, & products',
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
            DAILY MAINTENANCE
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            How much styling effort are you willing to put in?
          </p>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {options.map((option) => (
              <OptionCard
                key={option.value}
                icon={option.icon}
                iconColor={option.iconColor}
                label={option.label}
                description={option.description}
                isSelected={questionnaireAnswers.maintenance === option.value}
                onClick={() => setMaintenanceLevel(option.value)}
              />
            ))}
          </div>

          {/* Skip Link */}
          <button
            onClick={handleSkip}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
          >
            Skip Questionnaire
          </button>
        </motion.div>

        {/* Next Button */}
        <motion.button
          onClick={handleNext}
          className="flex items-center justify-center gap-2 w-full py-4 px-6 bg-gold text-gold-foreground font-semibold rounded-xl transition-all hover:bg-gold/90 mt-auto"
          whileTap={{ scale: 0.98 }}
        >
          NEXT
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  )
}
