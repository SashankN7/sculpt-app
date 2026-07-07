import type { HairstyleRecommendation } from '@/lib/types'

// Comprehensive pre-written fallback responses for common questions
const FALLBACK_RESPONSES: Record<string, string> = {
  // Why ranked #1
  'why was this ranked #1?': 'This style scored highest because of your face shape compatibility and natural hair texture. The combination creates an effortless look that requires minimal product while maximizing your facial features.',
  'why is this my top pick?': 'This style scored highest because of your face shape compatibility and natural hair texture. The combination creates an effortless look that requires minimal product while maximizing your facial features.',
  'why did you pick this?': 'This style scored highest because of your face shape compatibility and natural hair texture. The combination creates an effortless look that requires minimal product while maximizing your facial features.',

  // Maintenance
  'how do i maintain this?': 'Schedule a cleanup every 4–5 weeks. Between visits, use a light matte clay on damp hair and let it air dry. The point-cut texture means it grows out gracefully.',
  'how often should i get a haircut?': 'For this style, every 4–6 weeks is ideal. Going longer than 6 weeks will lose the shape and structure that makes this cut work.',
  'what happens if i let it grow out?': 'This style grows out gracefully thanks to the textured cut. After 6–8 weeks it will look more relaxed but still presentable. After that, the fade/taper areas will need a cleanup.',
  'do i need regular trims?': 'Yes — every 4–6 weeks to maintain the shape. The sides especially will lose their clean look if you wait too long.',

  // Professional
  'can this work professionally?': 'Absolutely. This style scores high on professionalism while still feeling modern. It\'s boardroom-appropriate without looking overly conservative.',
  'is this appropriate for work?': 'Yes, this style is professional enough for most workplaces. It balances modern style with a clean, put-together appearance.',
  'would this work in a corporate setting?': 'This style works well in corporate environments. It\'s polished without being boring — the kind of cut that gets positive attention in meetings.',

  // Hair type
  'what if my hair is thicker?': 'Thicker hair actually benefits this style — it adds natural volume and texture. You may need slightly more product, but the overall look improves with density.',
  'what if my hair is thinner?': 'For thinner hair, this style still works well. Use a volumizing product before styling and avoid heavy gels that can make hair look flat.',
  'what if my hair is curlier?': 'Curlier hair adds natural movement to this style. You might need to adjust your product choice — a curl cream instead of clay works well.',
  'will this work with my hair type?': 'This style was specifically matched to your hair texture and density. It should work well with minimal adjustments.',

  // Styling
  'how hard is this to style?': 'Low effort — about 3–5 minutes. Apply a small amount of matte clay to damp hair, tousle with your fingers, and air dry. No blow dryer needed.',
  'what products should i use?': 'For this style, start with a matte clay or paste. Apply a dime-sized amount to damp hair and work through with your fingers. Avoid shiny pomades — matte products give a more natural finish.',
  'do i need a blow dryer?': 'Not necessarily. This style can be air-dried for a natural look. If you want more volume or control, a quick blast with a blow dryer on low heat helps.',
  'how much product do i need?': 'Start with a small amount — about the size of a dime. You can always add more, but too much product will weigh your hair down and look greasy.',
  'can i style this differently?': 'Yes! This cut is versatile. You can wear it textured and casual for weekends, or smoother and more structured for work. The key is how you apply product.',
  'what about second-day hair?': 'This style actually looks great on day 2. The texture from day 1 provides natural hold. Just add a tiny bit of dry shampoo if needed.',

  // Face shape
  'will this suit my face shape?': 'Yes — your face shape is one of the most versatile for this style. The proportions create natural balance and highlight your best features.',
  'what face shape do i have?': 'Based on your analysis, you have an oval face shape, which is considered the most versatile. Most styles work well, which gives you more options.',
  'does this work for round faces?': 'For round faces, styles with height on top and shorter sides work best to elongate the face. This style achieves that balance well.',

  // Barber communication
  'how do i ask for this at the barber?': 'Show them the barber card — it has exact cutting metrics. Key phrases: describe the length on top, the fade/taper type on the sides, and how you want the blend to look.',
  'what should i tell my barber?': 'Focus on three things: (1) the length on top, (2) the type of fade or taper on the sides, and (3) how you want the transition to look. The barber card has all this broken down.',
  'will my barber know this style?': 'Most barbers are familiar with this style. Having the specific cutting metrics from your barber card will help them execute it precisely.',
  'what if my barber messes up?': 'Hair grows back in 4–6 weeks. In the meantime, the right product and styling technique can help disguise any imperfections. Don\'t stress — it\'s temporary.',

  // General grooming
  'any other grooming tips?': 'Keep your neckline clean between cuts. Use a light conditioner to prevent dryness. And don\'t forget — a good haircut is only 50% of the look; the other 50% is how you style it.',
  'should i wash my hair daily?': 'Most stylists recommend washing every 2–3 days. Daily washing strips natural oils that help with styling. On non-wash days, a rinse with water is usually enough.',
  'best time to get a haircut?': 'Book your appointment for mid-week (Tues–Thurs) when barbers are less rushed. Morning appointments tend to get more attention to detail.',
}

// Keyword-based matching for questions not in the exact list
const KEYWORD_PATTERNS: Array<{ keywords: string[]; response: string }> = [
  { keywords: ['maintenance', 'maintain', 'upkeep', 'keep it up'], response: 'For this style, schedule a cleanup every 4–6 weeks. Use light styling product daily and avoid heavy gels that build up.' },
  { keywords: ['professional', 'work', 'office', 'corporate', 'business'], response: 'This style scores well for professional settings. It\'s modern without being edgy — perfect for the office.' },
  { keywords: ['style', 'product', 'gel', 'pomade', 'clay', 'wax'], response: 'Apply a small amount of matte clay or paste to damp hair, then tousle with your fingers. Air dry for a natural finish.' },
  { keywords: ['face', 'suit', 'shape', 'fit'], response: 'Based on your analysis, this style is well-suited to your face shape and hair type. That\'s why it scored well in your recommendations.' },
  { keywords: ['fade', 'taper', 'sides'], response: 'The fade/taper on the sides should blend smoothly from the shortest point to the longer top. Ask for a specific guard number if you want precision.' },
  { keywords: ['cost', 'price', 'expensive', 'cheap', 'budget'], response: 'Haircut costs vary by barber and location. A good cut typically runs $25–50. It\'s worth investing in a skilled barber for styles that require precision.' },
  { keywords: ['recession', 'thinning', 'bald', 'hair loss'], response: 'If you\'re concerned about thinning, shorter textured styles work well because they minimize contrast. The Caesar and Crew Cut are great options for this.' },
  { keywords: ['curly', 'wavy', 'straight', 'texture', 'type'], response: 'Your hair texture plays a big role in how a style looks. Products that work for straight hair may not work for curly — adjust accordingly.' },
  { keywords: ['time', 'quick', 'fast', 'morning', 'routine'], response: 'This style takes about 3–5 minutes in the morning. Apply product to damp hair, style with fingers, and you\'re good to go.' },
  { keywords: ['summer', 'winter', 'hot', 'cold', 'weather'], response: 'In summer, keep it shorter for comfort. In winter, slightly longer hair provides warmth. This style works year-round with minor length adjustments.' },
  { keywords: ['age', 'young', 'old', 'mature'], response: 'This style is age-appropriate for most adults. It can be adapted — younger users might wear it messier, while a cleaner version works for a more mature look.' },
  { keywords: ['compliment', 'impress', 'attract', 'date'], response: 'A well-executed haircut that suits your face shape is one of the most effective ways to improve your overall appearance. Confidence in your look goes a long way.' },
  { keywords: ['barber', 'barbershop', 'salon', 'find'], response: 'Look for barbers with strong portfolios of your desired style. Check Google reviews and Instagram for their work. A consultation before the cut helps ensure they understand your vision.' },
  { keywords: ['grow', 'grow out', 'growing', 'length'], response: 'Growing out a style takes patience — typically 3–6 months for a noticeable change. Regular trims every 6–8 weeks keep it looking intentional rather than messy.' },
  { keywords: ['afraid', 'nervous', 'scared', 'risk'], response: 'It\'s normal to feel nervous about a new style. Start with a subtle change rather than a dramatic one. Your barber can always adjust — communication is key.' },
  { keywords: ['photo', 'reference', 'picture', 'show barber'], response: 'Reference photos are the best way to communicate with your barber. Save 2–3 photos from different angles. Your Sculpt barber card has all the technical details they need.' },
  { keywords: ['daily', 'every day', 'routine', 'morning routine'], response: 'A good daily routine: wash every 2–3 days, apply product to damp hair, style with fingers. Takes 3–5 minutes. The right product makes all the difference.' },
  { keywords: ['scalp', 'dandruff', 'flaky', 'dry scalp'], response: 'For scalp concerns, try a gentle exfoliating shampoo 2x per week. Avoid hot water — lukewarm is better. If it persists, consult a dermatologist for personalized advice.' },
  { keywords: ['bald', 'balding', 'shave', 'buzz'], response: 'If you\'re considering going shorter, a buzz cut or clean shave can be a confident choice. It works well with most face shapes and requires zero maintenance.' },
  { keywords: ['fade', 'taper fade', 'skin fade', 'high fade', 'low fade'], response: 'A fade transitions from very short at the bottom to longer on top. High fades start blending higher up, low fades start lower. Ask your barber which suits your head shape best.' },
  { keywords: ['bangs', 'fringe', 'forehead', 'cover forehead'], response: 'Bangs or fringe styles work well for covering a larger forehead or receding hairline. A textured fringe is trendy and low-maintenance — just sweep it forward with light product.' },
  { keywords: ['compare', 'difference', 'versus', 'vs', 'better'], response: 'Hard to compare without knowing the specific styles. Both options likely score differently based on your maintenance preference and hair texture. Check the trait scores on each recommendation.' },
  { keywords: ['rating', 'score', 'compatibility', 'percent'], response: 'The compatibility score (0–100) reflects how well a style matches your face shape, hair density, texture, and personal preferences. Higher scores mean a better overall fit.' },
]

function findKeywordMatch(message: string): string | null {
  const lower = message.toLowerCase()
  for (const pattern of KEYWORD_PATTERNS) {
    if (pattern.keywords.some(kw => lower.includes(kw))) {
      return pattern.response
    }
  }
  return null
}

export function getFallbackResponse(message: string, recommendation?: HairstyleRecommendation): string {
  const lower = message.toLowerCase().trim()

  // Check exact matches first
  if (FALLBACK_RESPONSES[lower]) {
    return FALLBACK_RESPONSES[lower]
  }

  // Check partial matches against exact keys
  for (const [key, value] of Object.entries(FALLBACK_RESPONSES)) {
    if (lower.includes(key.split(' ').slice(0, 2).join(' '))) {
      return value
    }
  }

  // Keyword-based matching
  const keywordMatch = findKeywordMatch(lower)
  if (keywordMatch) return keywordMatch

  // Context-aware fallback using recommendation data
  if (recommendation) {
    if (lower.includes('this') || lower.includes('it')) {
      return `The ${recommendation.name} scored ${recommendation.compatibilityScore}/100 for your profile. It's a strong match based on your face shape, hair density, and style preferences.`
    }
  }

  return "That's a great question. Based on your analysis, this style adapts well to different conditions. The key is using the right product and technique for your specific hair type. Feel free to ask about maintenance, styling, products, or anything else about your haircut."
}
