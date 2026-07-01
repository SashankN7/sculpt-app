import type { QuestionnaireQuestion } from "@/lib/types"

// Step 1: Maintenance + Styling Time + Concerns
export const questionnaireStep1Questions: QuestionnaireQuestion[] = [
  {
    id: 'maintenance',
    type: 'single',
    category: 'maintenance',
    question: 'How much daily styling effort do you want to put in?',
    subtext: 'This determines which haircut vectors we prioritize.',
    options: [
      { label: 'Zero — wash and go', value: 'zero' },
      { label: 'Low — quick dry and a little product', value: 'low' },
      { label: 'Medium — blow dry and style daily', value: 'medium' },
      { label: 'High — full routine with tools and products', value: 'high' },
    ],
  },
  {
    id: 'stylingTime',
    type: 'scale',
    category: 'lifestyle',
    question: 'How many minutes do you spend on hair in the morning?',
    minLabel: '0 min',
    maxLabel: '30+ min',
    scaleRange: 5,
  },
  {
    id: 'hairConcerns',
    type: 'multiple',
    category: 'concerns',
    question: 'What are your hair concerns?',
    subtext: 'Select all that apply — we factor these into recommendations.',
    options: [
      { label: 'Thinning or recession', value: 'thinning' },
      { label: 'Excessive oiliness', value: 'oily' },
      { label: 'Frizzy or unmanageable texture', value: 'frizzy' },
      { label: 'Flat, limp hair — no volume', value: 'flat' },
      { label: 'Scalp visibility showing', value: 'scalp' },
      { label: 'None of the above', value: 'none' },
    ],
  },
]

// Step 2: Boldness + Lifestyle/Activity
export const questionnaireStep2Questions: QuestionnaireQuestion[] = [
  {
    id: 'boldness',
    type: 'scale',
    category: 'boldness',
    question: 'How bold are you willing to go with this cut?',
    subtext: 'A higher score unlocks experimental styles with higher upside but more risk.',
    minLabel: 'Play it safe',
    maxLabel: 'Complete transformation',
    scaleRange: 5,
  },
  {
    id: 'activity',
    type: 'multiple',
    category: 'lifestyle',
    question: 'What best describes your lifestyle?',
    subtext: 'We factor activity level into maintenance and styling ease.',
    options: [
      { label: 'Corporate / Professional', value: 'corporate' },
      { label: 'Active / Athletic', value: 'athletic' },
      { label: 'Creative / Artistic', value: 'creative' },
      { label: 'Student', value: 'student' },
      { label: 'Remote / Flexible', value: 'remote' },
    ],
  },
  {
    id: 'riskTolerance',
    type: 'single',
    category: 'risk',
    question: 'If your haircut doesn’t go as planned, how do you handle it?',
    options: [
      { label: 'I’ll own it — hair grows back', value: 'high' },
      { label: 'I’ll adapt with products or styling', value: 'medium' },
      { label: 'I need a guaranteed safe result', value: 'low' },
    ],
  },
]

// Step 3: Hair Goals + Professional Context
export const questionnaireStep3Questions: QuestionnaireQuestion[] = [
  {
    id: 'hairGoals',
    type: 'multiple',
    category: 'goals',
    question: 'What do you most want from this haircut?',
    subtext: 'Pick the top 1–2 priorities.',
    options: [
      { label: 'Look more professional', value: 'professional' },
      { label: 'Look younger', value: 'younger' },
      { label: 'Hide thinning or recession', value: 'hideHairLoss' },
      { label: 'Match current trends', value: 'trendy' },
      { label: 'Minimize daily styling effort', value: 'lowMaintenance' },
      { label: 'Stand out / express personality', value: 'expressive' },
    ],
  },
  {
    id: 'workContext',
    type: 'single',
    category: 'social',
    question: 'How important is workplace appropriateness for this cut?',
    options: [
      { label: 'Critical — needs to be boardroom-ready', value: 'critical' },
      { label: 'Important — mostly professional with some flexibility', value: 'important' },
      { label: 'Flexible — my workplace is casual', value: 'flexible' },
    ],
  },
  {
    id: 'changeAmount',
    type: 'single',
    category: 'boldness',
    question: 'How different should this be from your current look?',
    options: [
      { label: 'Same look, just cleaner version', value: 'subtle' },
      { label: 'Noticeably different but recognizable', value: 'moderate' },
      { label: 'Complete departure from what I have now', value: 'dramatic' },
    ],
  },
]

// Step 4: Social Context + Emotional Friction
export const questionnaireStep4Questions: QuestionnaireQuestion[] = [
  {
    id: 'socialSignals',
    type: 'single',
    category: 'social',
    question: 'What signal do you want your haircut to send?',
    subtext: 'Haircuts communicate — what do you want yours to say about you?',
    options: [
      { label: 'Competent and reliable', value: 'competent' },
      { label: 'Ambitious and trending', value: 'ambitious' },
      { label: 'Creative and expressive', value: 'creative' },
      { label: 'Clean and low-maintenance', value: 'clean' },
      { label: 'I don’t think about this', value: 'neutral' },
    ],
  },
  {
    id: 'barberComfort',
    type: 'single',
    category: 'emotional',
    question: 'How comfortable are you explaining exactly what you want to a barber?',
    options: [
      { label: 'Very comfortable — I know exactly what to say', value: 'high' },
      { label: 'Somewhat — I usually show reference photos', value: 'medium' },
      { label: 'Awkward — I struggle to communicate style goals', value: 'low' },
    ],
  },
  {
    id: 'cutFrequency',
    type: 'single',
    category: 'lifestyle',
    question: 'How often do you actually get your hair cut?',
    options: [
      { label: 'Every 2–3 weeks', value: 'biweekly' },
      { label: 'Every 4–6 weeks', value: 'monthly' },
      { label: 'Every 6–8 weeks', value: 'quarterly' },
      { label: 'I only go when it gets long', value: 'rarely' },
    ],
  },
]

export const allQuestionnaireQuestions = [
  ...questionnaireStep1Questions,
  ...questionnaireStep2Questions,
  ...questionnaireStep3Questions,
  ...questionnaireStep4Questions,
]

export function getQuestionById(id: string): QuestionnaireQuestion | undefined {
  return allQuestionnaireQuestions.find(q => q.id === id)
}

// Check if all required questions in a step are answered
export function isStepComplete(stepQuestions: QuestionnaireQuestion[], answers: Record<string, string | string[] | number | null>): boolean {
  return stepQuestions.every(q => {
    const answer = answers[q.id]
    if (answer === null || answer === undefined) return false
    if (Array.isArray(answer)) return answer.length > 0
    if (typeof answer === 'string') return answer.length > 0
    if (typeof answer === 'number') return true
    return false
  })
}