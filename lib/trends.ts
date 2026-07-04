// Google Trends integration for hairstyle recommendations
// Fetches trending hairstyle data and caches results to avoid rate limits

const CACHE_DURATION_MS = 60 * 60 * 1000 // 1 hour cache

interface CachedTrendData {
  scores: Record<string, number>
  timestamp: number
}

const trendCache = new Map<string, CachedTrendData>()

// Hairstyle keywords to check trends for
const TREND_KEYWORDS = [
  'mid fade', 'low fade', 'high fade', 'taper fade', 'drop fade',
  'textured crop', 'french crop', 'caesar cut',
  'classic side part', 'pompadour', 'slick back',
  'undercut', 'crew cut', 'ivy league',
  'curly hair men', 'afro', 'twist out',
  'wolf cut', 'curtains hair', 'mullet',
  'buzz cut', 'fade haircut', 'taper haircut',
  'quiff', 'faux hawk', 'man bun',
]

// Map hairstyle database names to trend keywords
const STYLE_TO_KEYWORD: Record<string, string> = {
  'HIGH SKIN FADE WITH TEXTURED TOP': 'high fade',
  'MID FADE': 'mid fade',
  'LOW FADE': 'low fade',
  'DROP FADE': 'drop fade',
  'BURST FADE': 'fade haircut',
  'TAPER FADE': 'taper fade',
  'TEMPLE FADE': 'taper fade',
  'SHADOW FADE': 'fade haircut',
  'SKIN FADE BUZZ': 'buzz cut',
  'SCISSOR FADE': 'fade haircut',
  'UNDERCUT FADE': 'undercut',
  'BURST FADE MULLET': 'mullet',
  'FADE WITH HARD PART': 'fade haircut',
  'DROP TAPER FADE': 'taper fade',
  'TEXTURED MODERN CROP': 'textured crop',
  'TEXTURED FRENCH CROP': 'french crop',
  'CAESAR CUT': 'caesar cut',
  'BLUNT CROP': 'textured crop',
  'MICRO CROP': 'textured crop',
  'CROPPED FRINGE': 'textured crop',
  'CHOPPY CROP': 'textured crop',
  'FORWARD SWEPT CROP': 'textured crop',
  'LAYERED CROP': 'textured crop',
  'ANGULAR FRINGE CROP': 'textured crop',
  'MESSY CROP': 'textured crop',
  'SHORT CROP FADE': 'textured crop',
  'CLASSIC SIDE PART': 'classic side part',
  'SLICK BACK': 'slick back',
  'MODERN POMPADOUR': 'pompadour',
  'CREW CUT': 'crew cut',
  'IVY LEAGUE': 'ivy league',
  'EXECUTIVE CONTOUR': 'classic side part',
  'REGULATION CUT': 'classic side part',
  "GENTLEMAN'S CUT": 'classic side part',
  'CLASSIC TAPER': 'taper haircut',
  'SLICKED BACK UNDERCUT': 'undercut',
  'SIDE PART FADE': 'classic side part',
  'HARD PART POMPADOUR': 'pompadour',
  'BRUSHED BACK CLASSIC': 'slick back',
  'DUCKTAIL': 'classic side part',
  'SHORT BACK AND SIDES': 'classic side part',
  'CURTAINS': 'curtains hair',
  'MODERN MULLET': 'mullet',
  'WOLF CUT': 'wolf cut',
  'MOP TOP': 'curtains hair',
  'FEATHERED HAIR': 'curtains hair',
  'MEDIUM LAYERED': 'curtains hair',
  'FLOW / HOCKEY HAIR': 'curtains hair',
  'SIDE SWEPT MEDIUM': 'curtains hair',
  'MESSY MEDIUM': 'curtains hair',
  'PUSH BACK': 'slick back',
  'CURTAIN BANGS': 'curtains hair',
  'MEDIUM TAPER': 'taper haircut',
  'MAN BUN': 'man bun',
  'TOP KNOT': 'man bun',
  'SLICKED BACK LONG': 'slick back',
  'LONG LAYERS': 'curtains hair',
  'SURFER HAIR': 'curtains hair',
  'LONG CURLY': 'curly hair men',
  'AFRO': 'afro',
  'FROHAWK': 'faux hawk',
  'TWIST OUT': 'twist out',
  'CURLY TOP FADE': 'curly hair men',
  'DEFINED CURLS': 'curly hair men',
  'COILY HIGH TOP': 'curly hair men',
  'CURLY CROP': 'curly hair men',
  'LOOSE CURLS': 'curly hair men',
  'CURLY SLICK BACK': 'curly hair men',
  'CURLY QUIFF': 'curly hair men',
  'LOW FADE QUIFF': 'quiff',
  'FAUX HAWK': 'faux hawk',
  'MESSY TEXTURE': 'textured crop',
  'PIECE-Y TEXTURE': 'textured crop',
  'TOUSLED TOP': 'textured crop',
  'TEXTURED QUIFF': 'quiff',
  'CHOPPY LAYERS': 'textured crop',
  'DECONSTRUCTED CROP': 'textured crop',
  'AIR-DRIED TEXTURE': 'textured crop',
  'TEXTURED SPIKES': 'textured crop',
  'BUZZ CUT FADE': 'buzz cut',
  'INDUCTION CUT': 'buzz cut',
  'HIGH AND TIGHT': 'buzz cut',
  'FLATTOP': 'buzz cut',
  'BUTCH CUT': 'buzz cut',
  'BRUSH CUT': 'buzz cut',
  'SHORT TAPER': 'taper haircut',
  'HIGH SKIN FADE BUZZ': 'buzz cut',
  'DISCONNECTED UNDERCUT': 'undercut',
  'TWO-BLOCK': 'undercut',
  'LIBERTY SPIKES': 'textured crop',
  'MESSY MOHAWK': 'faux hawk',
  'UNDERCUT WITH DESIGN': 'undercut',
  'NECK TAPER': 'taper haircut',
}

async function fetchGoogleTrends(keyword: string): Promise<number> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const googleTrends = require('google-trends-api')
    const result = await googleTrends.interestOverTime({
      keyword,
      startTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // last 30 days
      endTime: new Date(),
      geo: 'US',
    })

    const data = JSON.parse(result)
    if (!data.default?.timelineData?.length) return 50 // default neutral

    // Get the most recent data point
    const recent = data.default.timelineData.slice(-4) // last 4 weeks
    const avgInterest = recent.reduce((sum: number, d: { value: [number] }) => sum + d.value[0], 0) / recent.length
    return Math.round(avgInterest)
  } catch {
    // If Google Trends fails, return neutral score
    return 50
  }
}

export async function getTrendScores(): Promise<Map<string, number>> {
  const scores = new Map<string, number>()

  // Check cache first
  const now = Date.now()
  const cached = trendCache.get('all')
  if (cached && now - cached.timestamp < CACHE_DURATION_MS) {
    for (const [keyword, interest] of Object.entries(cached.scores)) {
      scores.set(keyword, interest)
    }
    return scores
  }

  // Fetch trends for a subset of keywords (to avoid rate limits)
  const sampleKeywords = TREND_KEYWORDS.slice(0, 12) // limit to 12 keywords per request
  
  for (const keyword of sampleKeywords) {
    const interest = await fetchGoogleTrends(keyword)
    scores.set(keyword, interest)
  }

  // Cache results as a plain object
  const scoresObj: Record<string, number> = {}
  scores.forEach((value, key) => {
    scoresObj[key] = value
  })
  trendCache.set('all', { scores: scoresObj, timestamp: now })

  return scores
}

export async function getStyleTrendScore(styleName: string): Promise<number> {
  const keyword = STYLE_TO_KEYWORD[styleName.toUpperCase()] || 'fade haircut'
  const scores = await getTrendScores()
  return scores.get(keyword) || 50
}

export function getTrendingStyles(scores: Map<string, number>): string[] {
  const trending: string[] = []
  for (const [keyword, interest] of scores.entries()) {
    if (interest > 60) {
      trending.push(keyword)
    }
  }
  return trending.sort((a, b) => (scores.get(b) || 0) - (scores.get(a) || 0))
}
