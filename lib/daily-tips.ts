// Personalized daily hair tips — rotated by day, filtered by user profile

export interface DailyTip {
  id: string
  title: string
  content: string
  icon: string
  tags: string[] // e.g. ['low-maintenance', 'professional', 'summer', 'curly']
}

// ── Tip Database ──
const DAILY_TIPS: DailyTip[] = [
  // Universal tips
  { id: 'u1', title: 'Less Product is More', content: 'Start with a dime-sized amount of product. You can always add more, but overloading makes hair look greasy and flat.', icon: '🧴', tags: [] },
  { id: 'u2', title: 'The 4-Week Rule', content: 'Most men\'s haircuts start losing their shape after 4 weeks. Book your next appointment before you need one.', icon: '📅', tags: [] },
  { id: 'u3', title: 'Matte vs Shine', content: 'Matte products (clay, paste) give a natural look. Shine products (pomade, gel) give a polished, wet look. Match to your vibe.', icon: '✨', tags: [] },
  { id: 'u4', title: 'Pre-Styler Secret', content: 'A pre-styler (mousse or sea salt spray) before blow drying adds volume without the heavy feel of finishing products.', icon: '💨', tags: [] },
  { id: 'u5', title: 'Wash Less, Style More', content: 'Washing hair daily strips natural oils. Every 2-3 days is ideal. On off days, a water rinse is enough.', icon: '🚿', tags: [] },
  { id: 'u6', title: 'Neckline Maintenance', content: 'Clean up your neckline between cuts with a trimmer. The neckline defines your haircut more than you think.', icon: '✂️', tags: [] },

  // Low maintenance
  { id: 'lm1', title: 'The Air-Dry Hack', content: 'For low-effort styling, towel-dry and apply a light cream. Let it air dry — no blow dryer needed. Looks natural and takes 2 minutes.', icon: '🌬️', tags: ['low-maintenance'] },
  { id: 'lm2', title: 'One Product Routine', content: 'Pick ONE product that works for your hair type: clay for texture, cream for control, paste for versatility. Keep it simple.', icon: '☝️', tags: ['low-maintenance'] },
  { id: 'lm3', title: 'Bedhead is a Style', content: 'Short textured styles look best when slightly messy. Just wake up and go — no mirror required.', icon: '😴', tags: ['low-maintenance'] },

  // Professional
  { id: 'p1', title: 'The Power Part', content: 'A clean side part instantly looks more professional. Use a comb and a small amount of pomade for a sharp, defined line.', icon: '👔', tags: ['professional'] },
  { id: 'p2', title: 'Groom Your Edges', content: 'Clean sideburns and a sharp neckline make any haircut look 10x more polished. Touch up every 2 weeks.', icon: '🪒', tags: ['professional'] },
  { id: 'p3', title: 'The Boardroom Finish', content: 'For important meetings, blow dry forward with a round brush, then finish with a light-hold pomade. Clean and controlled.', icon: '💼', tags: ['professional'] },

  // Bold/Trendy
  { id: 'b1', title: 'Texture is King', content: 'The modern look is all about texture. Use a matte clay on dry hair, scrunch with fingers, and let it do its thing.', icon: '🔥', tags: ['bold', 'trendy'] },
  { id: 'b2', title: 'The Hard Part Upgrade', content: 'Ask your barber to razor in a hard part. It adds instant edge to any side-part style and takes 2 minutes to maintain.', icon: '⚡', tags: ['bold', 'trendy'] },
  { id: 'b3', title: 'Volume Play', content: 'Blow dry upside down for 60 seconds, then style with your hands. Instant volume that lasts all day.', icon: '📈', tags: ['bold', 'trendy'] },

  // Curly hair
  { id: 'c1', title: 'Curly Hair Rule #1', content: 'Never brush curly hair when dry. Only detangle in the shower with conditioner and a wide-tooth comb.', icon: '🌀', tags: ['curly'] },
  { id: 'c2', title: 'Diffuse, Don\'t Dry', content: 'Use a diffuser attachment on low heat to dry curly hair without frizz. Scrunch upward for defined curls.', icon: '🌀', tags: ['curly'] },
  { id: 'c3', title: 'Curl Cream > Gel', content: 'For natural-looking curls, use a curl cream instead of gel. It defines without the crunchy feel.', icon: '💧', tags: ['curly'] },

  // Straight hair
  { id: 's1', title: 'Pump Up the Volume', content: 'Straight hair can look flat. Use a root-lifting spray before blow drying, and style with your head upside down.', icon: '📊', tags: ['straight'] },
  { id: 's2', title: 'The Pomade Sweet Spot', content: 'Straight hair holds pomade beautifully. Use a medium-hold, high-shine pomade for a classic look.', icon: '💎', tags: ['straight'] },

  // Wavy hair
  { id: 'w1', title: 'Enhance the Wave', content: 'Apply sea salt spray to damp hair and scrunch. Air dry or diffuse for natural, beachy waves.', icon: '🌊', tags: ['wavy'] },
  { id: 'w2', title: 'Wave Control', content: 'Wavy hair can get frizzy in humidity. A lightweight anti-humidity spray keeps waves defined without weight.', icon: '🏖️', tags: ['wavy'] },

  // Seasonal
  { id: 'sm1', title: 'Summer Hair Care', content: 'Hot weather = more sweat and oil. Wash more frequently and use a lightweight, matte product. Skip heavy pomades.', icon: '☀️', tags: ['summer'] },
  { id: 'sm2', title: 'Winter Hair Protection', content: 'Cold air dries out hair. Use a leave-in conditioner and avoid hot water when showering. Your scalp will thank you.', icon: '❄️', tags: ['winter'] },
  { id: 'sm3', title: 'Humidity Shield', content: 'High humidity = frizz city. Use an anti-humidity spray or a small amount of argan oil to seal the cuticle.', icon: '🌧️', tags: ['humid'] },

  // Hair journey / growth
  { id: 'hj1', title: 'Patience is a Virtue', content: 'Growing out a haircut takes 3-6 months. Get a "cleanup" trim every 8 weeks to keep the shape while it grows.', icon: '🌱', tags: ['growing-out'] },
  { id: 'hj2', title: 'The Awkward Stage Fix', content: 'The awkward stage (2-3 months in) is real. Use a headband, hat, or style it back with a strong-hold product.', icon: '🎩', tags: ['growing-out'] },
  { id: 'hj3', title: 'Fresh Cut Maintenance', content: 'Just got a fresh cut? Sleep on a silk pillowcase to preserve the style longer. Cotton creates friction and bedhead.', icon: '🛏️', tags: ['fresh-cut'] },

  // Barber communication
  { id: 'bc1', title: 'Show, Don\'t Tell', content: 'Bring 2-3 reference photos to your barber. Words like "short" mean different things to different barbers.', icon: '📸', tags: ['barber'] },
  { id: 'bc2', title: 'The Guard Number', content: 'Learn your guard numbers. A #2 on the sides = 6mm, #3 = 10mm, #4 = 13mm. Specificity gets better results.', icon: '🔢', tags: ['barber'] },
  { id: 'bc3', title: 'Ask for Texture', content: 'Tell your barber to "texture the top" or "point cut" for a more modern, piecey look instead of a blunt cut.', icon: '✂️', tags: ['barber'] },

  // Products
  { id: 'pr1', title: 'Clay vs Pomade', content: 'Clay = matte finish, strong hold, textured look. Pomade = shine, medium hold, polished look. Choose your vibe.', icon: '🏷️', tags: ['products'] },
  { id: 'pr2', title: 'Apply to Damp Hair', content: 'Most products work best on towel-dried, damp hair — not soaking wet and not bone dry. The sweet spot is 70% dry.', icon: '💦', tags: ['products'] },
  { id: 'pr3', title: 'Warm It Up', content: 'Rub product between your palms for 5 seconds to warm it up. It spreads more evenly and won\'t clump.', icon: '🤲', tags: ['products'] },
]

// ── Season Detection ──
function getCurrentSeason(): 'spring' | 'summer' | 'fall' | 'winter' {
  const month = new Date().getMonth() // 0-11
  if (month >= 2 && month <= 4) return 'spring'
  if (month >= 5 && month <= 7) return 'summer'
  if (month >= 8 && month <= 10) return 'fall'
  return 'winter'
}

// ── Get Personalized Tip for Today ──
export function getDailyTip(userTags: string[] = []): DailyTip {
  const today = new Date()
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))

  const season = getCurrentSeason()
  const seasonTag = season === 'summer' ? 'summer' : season === 'winter' ? 'winter' : ''

  // Build priority tags from user profile
  const allTags = [...userTags]
  if (seasonTag) allTags.push(seasonTag)

  // Score each tip
  const scored = DAILY_TIPS.map(tip => {
    let score = 0

    // Base rotation by day
    const tipIndex = DAILY_TIPS.indexOf(tip)
    if (tipIndex === dayOfYear % DAILY_TIPS.length) score += 5

    // Tag matching
    if (tip.tags.length === 0) {
      // Universal tip — always relevant
      score += 1
    } else {
      // More tag matches = higher score
      const matches = tip.tags.filter(t => allTags.includes(t))
      score += matches.length * 3
    }

    return { tip, score }
  })

  // Sort by score (highest first), then by pseudo-random daily rotation
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    // Tie-break by day rotation
    const aIndex = DAILY_TIPS.indexOf(a.tip)
    const bIndex = DAILY_TIPS.indexOf(b.tip)
    return ((dayOfYear + aIndex) % DAILY_TIPS.length) - ((dayOfYear + bIndex) % DAILY_TIPS.length)
  })

  return scored[0].tip
}

// ── Map user profile to tags ──
export function getUserTags(questionnaireData: Record<string, unknown>, savedRecommendations: Array<{ metadata?: { maintenance?: number; professionalism?: number } }>): string[] {
  const tags: string[] = []

  // From questionnaire maintenance level
  const maintenance = questionnaireData['maintenance'] as string | undefined
  if (maintenance === 'low') tags.push('low-maintenance')
  if (maintenance === 'high') tags.push('bold', 'trendy')

  // From style goal
  const styleGoal = questionnaireData['styleGoal'] as string | undefined
  if (styleGoal === 'professional') tags.push('professional')
  if (styleGoal === 'bold') tags.push('bold', 'trendy')
  if (styleGoal === 'safe') tags.push('professional')

  // From saved recommendation metadata
  if (savedRecommendations.length > 0) {
    const avgProfessionalism = savedRecommendations.reduce((sum, r) => sum + (r.metadata?.professionalism ?? 50), 0) / savedRecommendations.length
    if (avgProfessionalism >= 70) tags.push('professional')
  }

  return [...new Set(tags)]
}

// ── Get all tips for a category ──
export function getTipsByTag(tag: string): DailyTip[] {
  return DAILY_TIPS.filter(t => t.tags.includes(tag) || t.tags.length === 0)
}
