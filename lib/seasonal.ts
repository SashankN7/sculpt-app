import type { SeasonalStyle } from '@/lib/types'

// ── Seasonal Style Data ──
export const SEASONAL_STYLES: SeasonalStyle[] = [
  // Summer
  { name: 'Textured Crop', description: 'Short, low-maintenance, perfect for hot weather', tag: 'Summer Pick', season: 'summer' },
  { name: 'Buzz Cut', description: 'Clean and cool — ideal for summer heat', tag: 'Hot Weather', season: 'summer' },
  { name: 'Low Taper Fade', description: 'Fresh and sharp, stays clean longer', tag: 'Trending', season: 'summer' },
  { name: 'French Crop', description: 'Minimal styling, maximum cool', tag: 'Low Effort', season: 'summer' },
  { name: 'Caesar Cut', description: 'Classic short crop that beats the heat', tag: 'Classic', season: 'summer' },

  // Winter
  { name: 'Modern Quiff', description: 'Volume and warmth for colder months', tag: 'Winter Favorite', season: 'winter' },
  { name: 'Side Part', description: 'Polished and professional for layering season', tag: 'Professional', season: 'winter' },
  { name: 'Pompadour', description: 'Bold statement style for sweater weather', tag: 'Statement', season: 'winter' },
  { name: 'Medium Length Textured', description: 'Grow it out — extra length suits cold weather', tag: 'Grow Out', season: 'winter' },
  { name: 'Slick Back', description: 'Sleek and sophisticated for the season', tag: 'Sleek', season: 'winter' },

  // Spring
  { name: 'Medium Taper', description: 'Fresh start for a new season', tag: 'Fresh', season: 'spring' },
  { name: 'Textured Fringe', description: 'Light, breezy, perfect for spring', tag: 'Breezy', season: 'spring' },
  { name: 'Curtains', description: 'Retro comeback style for the season', tag: 'Retro', season: 'spring' },
  { name: 'Modern Mullet', description: 'Bold transition style for the brave', tag: 'Bold', season: 'spring' },
  { name: 'Two-Block', description: 'Clean transition from winter length', tag: 'Clean Cut', season: 'spring' },

  // Fall
  { name: 'Crew Cut', description: 'Classic and clean as leaves change', tag: 'Classic', season: 'fall' },
  { name: 'High Taper Fade', description: 'Sharp lines for structured fall looks', tag: 'Sharp', season: 'fall' },
  { name: 'Ivy League', description: 'Preppy and polished for the season', tag: 'Preppy', season: 'fall' },
  { name: 'Mid Fade', description: 'Versatile fade for layering weather', tag: 'Versatile', season: 'fall' },
  { name: 'Textured Quiff', description: 'Volume with texture for the cooling temps', tag: 'Textured', season: 'fall' },

  // All-season classics
  { name: 'Skin Fade', description: 'Always fresh, always sharp', tag: 'Always Fresh', season: 'all' },
  { name: 'Classic Taper', description: 'Timeless — works year-round', tag: 'Timeless', season: 'all' },
  { name: 'Short Back and Sides', description: 'The universal safe pick', tag: 'Safe Pick', season: 'all' },
]

// ── Get Current Season ──
export function getCurrentSeason(): 'spring' | 'summer' | 'fall' | 'winter' {
  const month = new Date().getMonth() // 0-11

  if (month >= 2 && month <= 4) return 'spring'    // Mar-May
  if (month >= 5 && month <= 7) return 'summer'    // Jun-Aug
  if (month >= 8 && month <= 10) return 'fall'     // Sep-Nov
  return 'winter'                                   // Dec-Feb
}

// ── Get Season Display Name ──
export function getSeasonDisplayName(season: string): string {
  const names: Record<string, string> = {
    spring: '🌸 Spring',
    summer: '☀️ Summer',
    fall: '🍂 Fall',
    winter: '❄️ Winter',
  }
  return names[season] || season
}

// ── Get Seasonal Styles for Current Time ──
export function getCurrentSeasonalStyles(): SeasonalStyle[] {
  const season = getCurrentSeason()
  return SEASONAL_STYLES.filter(s => s.season === season || s.season === 'all')
}

// ── Get Top Seasonal Picks (3-4 for dashboard) ──
export function getTopSeasonalPicks(): SeasonalStyle[] {
  const seasonStyles = getCurrentSeasonalStyles()
  // Return up to 4 styles — mix seasonal-specific with all-season
  const seasonal = seasonStyles.filter(s => s.season !== 'all').slice(0, 3)
  const allSeason = seasonStyles.filter(s => s.season === 'all').slice(0, 1)
  return [...seasonal, ...allSeason].slice(0, 4)
}

// ── Get Upcoming Season ──
export function getUpcomingSeason(): { season: string; label: string; daysUntil: number } {
  const now = new Date()
  const month = now.getMonth()
  const year = now.getFullYear()

  // Season start months: Spring=2, Summer=5, Fall=8, Winter=11
  const seasons = [
    { month: 2, season: 'spring', label: '🌸 Spring' },
    { month: 5, season: 'summer', label: '☀️ Summer' },
    { month: 8, season: 'fall', label: '🍂 Fall' },
    { month: 11, season: 'winter', label: '❄️ Winter' },
  ]

  for (const s of seasons) {
    if (s.month > month) {
      const nextStart = new Date(year, s.month, 1)
      const daysUntil = Math.ceil((nextStart.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return { season: s.season, label: s.label, daysUntil }
    }
  }

  // Next year's spring
  const nextSpring = new Date(year + 1, 2, 1)
  const daysUntil = Math.ceil((nextSpring.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return { season: 'spring', label: '🌸 Spring', daysUntil }
}
