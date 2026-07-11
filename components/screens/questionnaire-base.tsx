"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useApp } from "@/lib/app-context"
import { ChevronLeft, ChevronRight, Check } from "lucide-react"
import type { QuestionnaireQuestion } from "@/lib/types"
import { isStepComplete } from "@/lib/questionnaire-data"

interface QuestionRendererProps {
  question: QuestionnaireQuestion
  value: string | string[] | number | null
  onChange: (id: string, value: string | string[] | number | null) => void
}

function SingleChoiceQuestion({ question, value, onChange }: QuestionRendererProps) {
  return (
    <div className="space-y-3">
      {question.options?.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(question.id, option.value)}
          className={`w-full bg-secondary border rounded-xl p-4 text-left transition-all flex items-center gap-3 ${
            value === option.value
              ? 'border-gold ring-1 ring-gold/30'
              : 'border-border hover:border-muted-foreground/30'
          }`}
        >
          <span className="text-sm font-medium text-foreground flex-1">{option.label}</span>
          {value === option.value && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-5 h-5 rounded-full bg-gold flex items-center justify-center"
            >
              <Check className="w-3 h-3 text-gold-foreground" />
            </motion.div>
          )}
        </button>
      ))}
    </div>
  )
}

function MultipleChoiceQuestion({ question, value, onChange }: QuestionRendererProps) {
  const selectedValues = Array.isArray(value) ? value : []

  const toggleOption = (optionValue: string) => {
    if (selectedValues.includes(optionValue)) {
      onChange(question.id, selectedValues.filter(v => v !== optionValue))
    } else {
      onChange(question.id, [...selectedValues, optionValue])
    }
  }

  return (
    <div className="space-y-3">
      {question.options?.map((option) => (
        <button
          key={option.value}
          onClick={() => toggleOption(option.value)}
          className={`w-full bg-secondary border rounded-xl p-4 text-left transition-all flex items-center gap-3 ${
            selectedValues.includes(option.value)
              ? 'border-gold ring-1 ring-gold/30'
              : 'border-border hover:border-muted-foreground/30'
          }`}
        >
          <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${
            selectedValues.includes(option.value)
              ? 'bg-gold border-gold'
              : 'border-muted-foreground/50'
          }`}>
            {selectedValues.includes(option.value) && (
              <Check className="w-3 h-3 text-gold-foreground" />
            )}
          </div>
          <span className="text-sm font-medium text-foreground">{option.label}</span>
        </button>
      ))}
    </div>
  )
}function ScaleQuestion({ question, value, onChange }: QuestionRendererProps) {
  const scaleRange = question.scaleRange || 5
  const currentValue = typeof value === 'number' ? value : null
  const selectedIndex = currentValue !== null ? currentValue - 1 : null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <span className="text-xs text-muted-foreground">{question.minLabel}</span>
        <span className="text-xs text-muted-foreground">{question.maxLabel}</span>
      </div>
      <div className="flex items-center gap-2">
        {Array.from({ length: scaleRange }, (_, i) => i + 1).map((num) => {
          const isSelected = selectedIndex === num - 1
          return (
            <button
              key={num}
              onClick={() => onChange(question.id, num)}
              className={`flex-1 h-12 rounded-lg border transition-all ${
                isSelected
                  ? 'bg-gold border-gold'
                  : 'bg-secondary border-border hover:border-gold/50'
              }`}
            >
              <span className={`text-sm font-medium ${
                isSelected ? 'text-gold-foreground' : 'text-foreground'
              }`}>
                {num}
              </span>
            </button>
          )
        })}
      </div>
      {currentValue !== null ? (
        <div className="text-center">
          <span className="text-lg font-semibold text-gold">{currentValue}</span>
          <span className="text-xs text-muted-foreground ml-1">/ {scaleRange}</span>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground text-center">Tap a number to answer</p>
      )}
    </div>
  )
}

function TextQuestion({ question, value, onChange }: QuestionRendererProps) {
  return (
    <textarea
      value={(value as string) || ''}
      onChange={(e) => onChange(question.id, e.target.value)}
      placeholder={question.placeholder || 'Type your answer...'}
      className="w-full bg-secondary border border-border rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all resize-none"
      rows={3}
    />
  )
}

function QuestionRenderer({ question, value, onChange }: QuestionRendererProps) {
  switch (question.type) {
    case 'single':
      return <SingleChoiceQuestion question={question} value={value} onChange={onChange} />
    case 'multiple':
      return <MultipleChoiceQuestion question={question} value={value} onChange={onChange} />
    case 'scale':
      return <ScaleQuestion question={question} value={value} onChange={onChange} />
    case 'text':
      return <TextQuestion question={question} value={value} onChange={onChange} />
    default:
      return null
  }
}

interface QuestionnaireBaseProps {
  stepNumber: number
  totalSteps: number
  title: string
  subtitle: string
  questions: QuestionnaireQuestion[]
  onNext: () => void
  onBack: () => void
  nextLabel?: string
  canSkip?: boolean
  onSkip?: () => void
}

export function QuestionnaireBase({
  stepNumber,
  totalSteps,
  title,
  subtitle,
  questions,
  onNext,
  onBack,
  nextLabel = 'NEXT',
  canSkip = false,
  onSkip,
}: QuestionnaireBaseProps) {
  const { state, setQuestionnaireAnswer, getQuestionnaireAnswer } = useApp()
  const { questionnaireData } = state

  const handleAnswerChange = (questionId: string, answer: string | string[] | number | null) => {
    setQuestionnaireAnswer(questionId, answer)
  }

  const isComplete = isStepComplete(questions, questionnaireData)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-foreground hover:text-gold transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          BACK
        </button>
        <span className="text-sm text-muted-foreground">Step {stepNumber} of {totalSteps}</span>
      </div>

      <div className="flex-1 px-6 md:px-8 pt-4 pb-6 flex flex-col overflow-y-auto mx-auto w-full max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex-1"
        >
          {/* Title */}
          <h2 className="text-xl font-semibold text-foreground mb-2">{title}</h2>
          <p className="text-sm text-muted-foreground mb-8">{subtitle}</p>

          {/* Questions */}
          <div className="space-y-8">
            {questions.map((question, index) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <p className="text-sm font-medium text-foreground mb-2">
                  {question.question}
                </p>
                {question.subtext && (
                  <p className="text-xs text-muted-foreground mb-3">{question.subtext}</p>
                )}
                <QuestionRenderer
                  question={question}
                  value={getQuestionnaireAnswer(question.id)}
                  onChange={handleAnswerChange}
                />
              </motion.div>
            ))}
          </div>

          {/* Skip Link */}
          {canSkip && onSkip && (
            <button
              onClick={onSkip}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 mt-6"
            >
              Skip this section
            </button>
          )}
        </motion.div>

        {/* Next Button — sticky at bottom of viewport */}
        <div className="sticky bottom-0 bg-background pt-4 pb-2">
          {!isComplete && (
            <p className="text-xs text-muted-foreground text-center mb-2">
              Answer all questions above to continue
            </p>
          )}
          <motion.button
            onClick={onNext}
            disabled={!isComplete}
            className={`flex items-center justify-center gap-2 w-full py-4 px-6 font-semibold rounded-xl transition-all ${
              isComplete
                ? 'bg-gold text-gold-foreground hover:bg-gold/90 cursor-pointer'
                : 'bg-secondary text-muted-foreground cursor-not-allowed'
            }`}
            whileTap={isComplete ? { scale: 0.98 } : {}}
          >
            {nextLabel}
            {isComplete && <ChevronRight className="w-5 h-5" />}
          </motion.button>
        </div>
      </div>
    </div>
  )
}