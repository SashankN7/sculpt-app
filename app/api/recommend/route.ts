import { NextRequest, NextResponse } from 'next/server'
import { generateRecommendations } from '@/lib/recommendation-engine'
import type { AnalysisResult, QuestionnaireAnswersMap } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { analysis, answers, count } = body as {
      analysis: AnalysisResult
      answers: QuestionnaireAnswersMap
      count?: number
    }

    if (!analysis) {
      return NextResponse.json(
        { error: 'Analysis data is required' },
        { status: 400 }
      )
    }

    // Generate recommendations using the structured scoring engine
    const recommendations = generateRecommendations(
      analysis,
      answers || {},
      count || 5
    )

    return NextResponse.json({
      success: true,
      recommendations,
    })
  } catch (error: unknown) {
    console.error('Recommendation error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Recommendation generation failed: ${message}` },
      { status: 500 }
    )
  }
}
