export interface HairstyleEntry {
  name: string
  category: string
  compatibleFaceShapes: string[]
  compatibleTextures: string[]
  maintenanceLevel: number
  stylingEffort: number
  professionalism: number
  trendiness: number
  barberDifficulty: number
  minDensityScore: number
  idealDensityScore: number
  maxDensityScore: number
  imageUrl: string
  description: string
  barberCard: {
    cuttingMetrics: {
      top: string
      sides: string
      boundary: string
    }
    stylingProtocols: string[]
    warnings: string[]
  }
}

export const hairstyleDatabase: HairstyleEntry[] = [
  {
    name: 'Textured Modern Crop',
    category: 'Crop',
    compatibleFaceShapes: ['oval', 'square', 'rectangle', 'diamond'],
    compatibleTextures: ['straight', 'wavy', 'curly'],
    maintenanceLevel: 45,
    stylingEffort: 35,
    professionalism: 78,
    trendiness: 88,
    barberDifficulty: 40,
    minDensityScore: 45,
    idealDensityScore: 72,
    maxDensityScore: 95,
    imageUrl: 'https://placehold.co/400x500/1C1917/D4A853?text=Textured%0ACrop&font=raleway',
    description: 'A versatile, low-maintenance style that uses natural texture on top with a clean fade or taper on the sides. Works exceptionally well with oval and square face shapes.',
    barberCard: {
      cuttingMetrics: {
        top: '2-3 inches length, point-cut for natural texture and movement',
        sides: 'Low taper fade blending smoothly from skin at temples',
        boundary: 'Free natural blend, no hard lines',
      },
      stylingProtocols: [
        'Apply matte clay or paste to damp hair',
        'Use fingers to tousle and create texture',
        'Let air dry or use diffuser on low heat',
      ],
      warnings: [],
    },
  },
  {
    name: 'Classic Side Part',
    category: 'Classic',
    compatibleFaceShapes: ['oval', 'square', 'rectangle', 'heart'],
    compatibleTextures: ['straight', 'wavy'],
    maintenanceLevel: 55,
    stylingEffort: 50,
    professionalism: 95,
    trendiness: 62,
    barberDifficulty: 45,
    minDensityScore: 50,
    idealDensityScore: 70,
    maxDensityScore: 90,
    imageUrl: 'https://placehold.co/400x500/1C1917/D4A853?text=Classic%0ASide+Part&font=raleway',
    description: 'A timeless professional look with a defined part line. Clean, structured, and boardroom-appropriate while still feeling modern.',
    barberCard: {
      cuttingMetrics: {
        top: '3-4 inches with graduated length toward the part',
        sides: 'Medium fade with #2 guard at temples, blending into scissor work',
        boundary: 'Clean tapered neckline with natural hairline',
      },
      stylingProtocols: [
        'Apply pomade or wax to damp hair',
        'Comb through to define the part line',
        'Use medium-hold product for all-day structure',
      ],
      warnings: [],
    },
  },
  {
    name: 'Low Fade Quiff',
    category: 'Quiff',
    compatibleFaceShapes: ['oval', 'square', 'diamond', 'triangle'],
    compatibleTextures: ['straight', 'wavy', 'curly'],
    maintenanceLevel: 68,
    stylingEffort: 72,
    professionalism: 72,
    trendiness: 91,
    barberDifficulty: 55,
    minDensityScore: 55,
    idealDensityScore: 75,
    maxDensityScore: 95,
    imageUrl: 'https://placehold.co/400x500/1C1917/D4A853?text=Low+Fade%0AQuiff&font=raleway',
    description: 'Modern and versatile with volume at the front. Adds height and works with your face proportions for a confident, trendy look.',
    barberCard: {
      cuttingMetrics: {
        top: '4-5 inches at the front, tapering to 3 inches at crown',
        sides: 'Low skin fade starting at #0, blending to #3 at parietal ridge',
        boundary: 'Crisp lineup at temples, tapered neckline',
      },
      stylingProtocols: [
        'Blow dry with round brush for volume',
        'Apply pre-styler to damp hair',
        'Finish with matte clay for hold and texture',
      ],
      warnings: ['This style requires daily blow drying for best results.'],
    },
  },
  {
    name: 'Crew Cut',
    category: 'Short',
    compatibleFaceShapes: ['oval', 'square', 'rectangle', 'round', 'diamond'],
    compatibleTextures: ['straight', 'wavy', 'curly'],
    maintenanceLevel: 25,
    stylingEffort: 15,
    professionalism: 90,
    trendiness: 65,
    barberDifficulty: 30,
    minDensityScore: 40,
    idealDensityScore: 65,
    maxDensityScore: 100,
    imageUrl: 'https://placehold.co/400x500/1C1917/D4A853?text=Crew%0ACut&font=raleway',
    description: 'A clean, low-maintenance classic. Short on the sides, slightly longer on top. Works for virtually every face shape and hair type.',
    barberCard: {
      cuttingMetrics: {
        top: '1.5-2 inches, scissor cut for slight texture',
        sides: 'Short taper, #2-3 guard blend',
        boundary: 'Natural neckline, tapered edges',
      },
      stylingProtocols: [
        'Minimal product needed — light pomade optional',
        'Apply to damp hair and shape with fingers',
        'Air dry is fine',
      ],
      warnings: [],
    },
  },
  {
    name: 'Textured French Crop',
    category: 'Crop',
    compatibleFaceShapes: ['oval', 'square', 'rectangle', 'round'],
    compatibleTextures: ['straight', 'wavy'],
    maintenanceLevel: 40,
    stylingEffort: 30,
    professionalism: 82,
    trendiness: 85,
    barberDifficulty: 42,
    minDensityScore: 50,
    idealDensityScore: 70,
    maxDensityScore: 90,
    imageUrl: 'https://placehold.co/400x500/1C1917/D4A853?text=French%0ACrop&font=raleway',
    description: 'A clean fringe-forward crop with textured top. Excellent for hiding a higher forehead or hairline concerns while looking sharp and modern.',
    barberCard: {
      cuttingMetrics: {
        top: '2-3 inches, textured with point cutting',
        sides: 'Low to mid taper fade',
        boundary: 'Fringe sits naturally across forehead, soft edge',
      },
      stylingProtocols: [
        'Work matte paste through damp hair',
        'Push fringe forward and slightly to one side',
        'Air dry or minimal blow drying',
      ],
      warnings: [],
    },
  },
  {
    name: 'Buzz Cut Fade',
    category: 'Short',
    compatibleFaceShapes: ['oval', 'square', 'rectangle', 'diamond', 'round'],
    compatibleTextures: ['straight', 'wavy', 'curly', 'coily'],
    maintenanceLevel: 15,
    stylingEffort: 5,
    professionalism: 85,
    trendiness: 70,
    barberDifficulty: 25,
    minDensityScore: 30,
    idealDensityScore: 60,
    maxDensityScore: 100,
    imageUrl: 'https://placehold.co/400x500/1C1917/D4A853?text=Buzz+Cut%0AFade&font=raleway',
    description: 'Ultra-low maintenance with a bold, clean statement. The fade adds dimension. Great for those who want zero daily styling.',
    barberCard: {
      cuttingMetrics: {
        top: '#2-3 guard uniform length',
        sides: 'Skin fade or high taper to blend',
        boundary: 'Clean lineup at temples and neck',
      },
      stylingProtocols: [
        'No product needed',
        'Wash and go',
      ],
      warnings: ['Requires regular cleanup every 2-3 weeks to maintain fade.'],
    },
  },
  {
    name: 'Modern Pompadour',
    category: 'Pomp',
    compatibleFaceShapes: ['oval', 'square', 'diamond', 'triangle'],
    compatibleTextures: ['straight', 'wavy'],
    maintenanceLevel: 75,
    stylingEffort: 80,
    professionalism: 80,
    trendiness: 78,
    barberDifficulty: 60,
    minDensityScore: 60,
    idealDensityScore: 80,
    maxDensityScore: 95,
    imageUrl: 'https://placehold.co/400x500/1C1917/D4A853?text=Modern%0APompadour&font=raleway',
    description: 'A bold, voluminous style with height at the front. Statement look that requires commitment to daily styling but delivers serious impact.',
    barberCard: {
      cuttingMetrics: {
        top: '5-6 inches at front, graduating toward crown',
        sides: 'Mid to high fade for contrast',
        boundary: 'Disconnected or blended depending on preference',
      },
      stylingProtocols: [
        'Blow dry hair upward and back from the front',
        'Apply pre-styler for volume',
        'Lock in with strong-hold pomade',
      ],
      warnings: ['Requires daily blow drying and strong-hold products.'],
    },
  },
  {
    name: 'Curtains',
    category: 'Medium',
    compatibleFaceShapes: ['oval', 'square', 'diamond', 'rectangle'],
    compatibleTextures: ['straight', 'wavy'],
    maintenanceLevel: 50,
    stylingEffort: 45,
    professionalism: 70,
    trendiness: 92,
    barberDifficulty: 35,
    minDensityScore: 55,
    idealDensityScore: 75,
    maxDensityScore: 90,
    imageUrl: 'https://placehold.co/400x500/1C1917/D4A853?text=Curtains&font=raleway',
    description: 'A retro-modern style with a center part and flowing sides. Trendy and youthful with a relaxed, effortless vibe.',
    barberCard: {
      cuttingMetrics: {
        top: '5-7 inches with even length for natural part',
        sides: 'Scissor cut, slightly shorter but not faded',
        boundary: 'Natural, slightly grown out',
      },
      stylingProtocols: [
        'Find natural center part when damp',
        'Blow dry away from center on each side',
        'Light hold product, keep it loose',
      ],
      warnings: [],
    },
  },
  {
    name: 'Slick Back',
    category: 'Classic',
    compatibleFaceShapes: ['oval', 'square', 'diamond', 'heart'],
    compatibleTextures: ['straight', 'wavy'],
    maintenanceLevel: 50,
    stylingEffort: 40,
    professionalism: 88,
    trendiness: 72,
    barberDifficulty: 40,
    minDensityScore: 50,
    idealDensityScore: 70,
    maxDensityScore: 90,
    imageUrl: 'https://placehold.co/400x500/1C1917/D4A853?text=Slick%0ABack&font=raleway',
    description: 'Clean, powerful, and professional. Hair slicked back with a natural or wet finish. Exudes confidence and control.',
    barberCard: {
      cuttingMetrics: {
        top: '4-5 inches, uniform length for clean pull-back',
        sides: 'Low to mid taper, scissor or clipper',
        boundary: 'Clean natural neckline',
      },
      stylingProtocols: [
        'Apply pomade to damp hair',
        'Comb straight back with a wide-tooth comb',
        'For wet look: use more product. For natural: less product, air dry',
      ],
      warnings: [],
    },
  },
  {
    name: 'Taper Fringe',
    category: 'Crop',
    compatibleFaceShapes: ['oval', 'square', 'rectangle', 'round', 'triangle'],
    compatibleTextures: ['straight', 'wavy', 'curly'],
    maintenanceLevel: 42,
    stylingEffort: 38,
    professionalism: 75,
    trendiness: 87,
    barberDifficulty: 45,
    minDensityScore: 45,
    idealDensityScore: 68,
    maxDensityScore: 90,
    imageUrl: 'https://placehold.co/400x500/1C1917/D4A853?text=Taper%0AFringe&font=raleway',
    description: 'A textured fringe with a clean taper. Modern and forgiving — the fringe adds character while the taper keeps it clean.',
    barberCard: {
      cuttingMetrics: {
        top: '3-4 inches, textured and point-cut',
        sides: 'Low taper fade, natural blend',
        boundary: 'Fringe falls naturally, slight texture at edge',
      },
      stylingProtocols: [
        'Apply texture clay to damp hair',
        'Push fringe forward, tousle with fingers',
        'Let air dry for natural movement',
      ],
      warnings: [],
    },
  },
  {
    name: 'Ivy League',
    category: 'Classic',
    compatibleFaceShapes: ['oval', 'square', 'rectangle', 'heart', 'diamond'],
    compatibleTextures: ['straight', 'wavy'],
    maintenanceLevel: 48,
    stylingEffort: 42,
    professionalism: 92,
    trendiness: 68,
    barberDifficulty: 40,
    minDensityScore: 45,
    idealDensityScore: 68,
    maxDensityScore: 88,
    imageUrl: 'https://placehold.co/400x500/1C1917/D4A853?text=Ivy%0ALeague&font=raleway',
    description: 'The refined cousin of the crew cut. Slightly longer on top for side-parting flexibility. Preppy, polished, and always appropriate.',
    barberCard: {
      cuttingMetrics: {
        top: '2-3 inches, scissor cut for soft texture',
        sides: 'Short taper, #3-4 guard blend',
        boundary: 'Clean tapered neckline',
      },
      stylingProtocols: [
        'Apply light pomade or cream to damp hair',
        'Comb to one side or push back',
        'Medium hold for a natural finish',
      ],
      warnings: [],
    },
  },
  {
    name: 'Faux Hawk',
    category: 'Spiky',
    compatibleFaceShapes: ['oval', 'square', 'diamond', 'round'],
    compatibleTextures: ['straight', 'wavy', 'curly'],
    maintenanceLevel: 55,
    stylingEffort: 50,
    professionalism: 65,
    trendiness: 80,
    barberDifficulty: 48,
    minDensityScore: 50,
    idealDensityScore: 72,
    maxDensityScore: 92,
    imageUrl: 'https://placehold.co/400x500/1C1917/D4A853?text=Faux%0AHawk&font=raleway',
    description: 'A subtle take on the mohawk — volume centered on top without shaved sides. Edgy but wearable in most settings.',
    barberCard: {
      cuttingMetrics: {
        top: '3-4 inches at center, shorter toward sides',
        sides: 'Medium taper fade for subtle contrast',
        boundary: 'Blended naturally, no hard disconnect',
      },
      stylingProtocols: [
        'Apply wax or clay to damp hair',
        'Push hair upward toward center',
        'Pinch and twist sections for texture',
      ],
      warnings: [],
    },
  },
  {
    name: 'Modern Mullet',
    category: 'Medium',
    compatibleFaceShapes: ['oval', 'square', 'diamond', 'triangle'],
    compatibleTextures: ['straight', 'wavy', 'curly'],
    maintenanceLevel: 60,
    stylingEffort: 55,
    professionalism: 45,
    trendiness: 95,
    barberDifficulty: 55,
    minDensityScore: 50,
    idealDensityScore: 70,
    maxDensityScore: 90,
    imageUrl: 'https://placehold.co/400x500/1C1917/D4A853?text=Modern%0AMullet&font=raleway',
    description: 'The bold, trend-forward choice. Business in the front, party in the back — modernized with cleaner lines and texture.',
    barberCard: {
      cuttingMetrics: {
        top: '3-4 inches, textured and layered',
        sides: 'Taper fade at temples, longer toward back',
        boundary: 'Extended length at nape, layered blend',
      },
      stylingProtocols: [
        'Apply texturizing spray or light clay',
        'Air dry for natural movement',
        'Tousle for a lived-in look',
      ],
      warnings: ['This style may not be appropriate for conservative workplaces.'],
    },
  },
  {
    name: 'High Skin Fade with Textured Top',
    category: 'Fade',
    compatibleFaceShapes: ['oval', 'square', 'rectangle', 'round', 'diamond'],
    compatibleTextures: ['straight', 'wavy', 'curly', 'coily'],
    maintenanceLevel: 50,
    stylingEffort: 35,
    professionalism: 75,
    trendiness: 90,
    barberDifficulty: 50,
    minDensityScore: 40,
    idealDensityScore: 65,
    maxDensityScore: 95,
    imageUrl: 'https://placehold.co/400x500/1C1917/D4A853?text=High+Skin%0AFade&font=raleway',
    description: 'A sharp, modern look with high contrast between the faded sides and textured top. Clean and trendy without being over the top.',
    barberCard: {
      cuttingMetrics: {
        top: '2-3 inches, point-cut for texture',
        sides: 'High skin fade starting at #0, blending at parietal ridge',
        boundary: 'Sharp lineup at temples, clean neck taper',
      },
      stylingProtocols: [
        'Apply matte clay to damp or dry hair',
        'Tousle with fingers for natural texture',
        'No blow drying required',
      ],
      warnings: ['Requires cleanup every 2-3 weeks to maintain fade sharpness.'],
    },
  },
  {
    name: 'Caesar Cut',
    category: 'Crop',
    compatibleFaceShapes: ['oval', 'square', 'rectangle', 'round', 'triangle'],
    compatibleTextures: ['straight', 'wavy', 'curly'],
    maintenanceLevel: 20,
    stylingEffort: 10,
    professionalism: 80,
    trendiness: 60,
    barberDifficulty: 25,
    minDensityScore: 35,
    idealDensityScore: 60,
    maxDensityScore: 100,
    imageUrl: 'https://placehold.co/400x500/1C1917/D4A853?text=Caesar%0ACut&font=raleway',
    description: 'A short, even crop with a slight fringe. Minimal effort, maximum reliability. Great for thinning hair or those who want simplicity.',
    barberCard: {
      cuttingMetrics: {
        top: '1-1.5 inches, even length',
        sides: 'Short taper or #2 guard',
        boundary: 'Short fringe, natural hairline',
      },
      stylingProtocols: [
        'Minimal product — light wax if desired',
        'Brush forward and shape fringe',
        'Air dry',
      ],
      warnings: [],
    },
  },
]

export function getCompatibleHairstyles(
  faceShape: string,
  densityScore: number,
  textureProfile: { waviness: number; curliness: number; straightness: number }
): HairstyleEntry[] {
  const textureLabel = textureProfile.curliness > 0.5 ? 'curly'
    : textureProfile.waviness > 0.5 ? 'wavy'
    : 'straight'

  return hairstyleDatabase.filter(style => {
    const faceMatch = style.compatibleFaceShapes.some(
      fs => fs.toLowerCase() === faceShape.toLowerCase()
    )
    const densityMatch = densityScore >= style.minDensityScore && densityScore <= style.maxDensityScore
    const textureMatch = style.compatibleTextures.includes(textureLabel) ||
      style.compatibleTextures.includes('wavy') // wavy works with most textures
    return faceMatch && densityMatch && textureMatch
  })
}
