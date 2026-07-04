import { NextResponse } from 'next/server'
import { getTrendScores, getTrendingStyles } from '@/lib/trends'

export async function GET() {
  try {
    const scores = await getTrendScores()
    const trending = getTrendingStyles(scores)
    
    // Convert Map to object for JSON serialization
    const scoresObj: Record<string, number> = {}
    scores.forEach((value, key) => {
      scoresObj[key] = value
    })

    return NextResponse.json({
      trending,
      scores: scoresObj,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Failed to fetch trends:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trend data' },
      { status: 500 }
    )
  }
}
