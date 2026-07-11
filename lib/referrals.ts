// Referral system — users share a unique code, both get rewards when friend signs up

export interface ReferralState {
  referralCode: string | null
  referredBy: string | null
  referralsSent: number
  referralsConverted: number
}

export interface ReferralReward {
  id: string
  name: string
  description: string
  icon: string
  referralsRequired: number
  claimed: boolean
  reached: boolean
}

interface ReferralRewardDef {
  id: string
  name: string
  description: string
  icon: string
  referralsRequired: number
}

export const REFERRAL_REWARDS: ReferralRewardDef[] = [
  { id: 'ref-1', name: 'First Referral', description: 'Your friend signed up! You both get a bonus scan.', icon: '🎯', referralsRequired: 1 },
  { id: 'ref-3', name: 'Triple Threat', description: '3 friends joined! Unlock a premium feature preview.', icon: '💎', referralsRequired: 3 },
  { id: 'ref-5', name: 'Popular Pick', description: '5 referrals! You earned a free premium day.', icon: '👑', referralsRequired: 5 },
  { id: 'ref-10', name: 'Sculpt Ambassador', description: '10 referrals! You are a legend. Enjoy 7 free premium days.', icon: '🏆', referralsRequired: 10 },
]

// Generate a unique referral code from user ID or email
export function generateReferralCode(userId: string): string {
  const hash = userId.slice(0, 8).toUpperCase()
  const random = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `SCULPT-${hash}-${random}`
}

// Get the referral share URL
export function getReferralUrl(code: string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://sculpt.app'
  return `${baseUrl}?ref=${code}`
}

// Get referral share text
export function getReferralShareText(code: string): string {
  const url = getReferralUrl(code)
  return `Check out Sculpt -- AI-powered haircut recommendations based on your face shape! Use my code ${code} when you sign up: ${url}`
}

// Check if user qualifies for a referral reward
export function getUnclaimedReferralRewards(
  referralsConverted: number,
  claimedRewards: string[]
): ReferralReward[] {
  return REFERRAL_REWARDS
    .filter(r => referralsConverted >= r.referralsRequired && !claimedRewards.includes(r.id))
    .map(r => ({ ...r, claimed: false, reached: true }))
}

// Get next referral reward and progress
export function getNextReferralReward(referralsConverted: number): { reward: ReferralReward | null; referralsNeeded: number; percentage: number } {
  const unclaimed = REFERRAL_REWARDS.filter(r => referralsConverted < r.referralsRequired)
  if (unclaimed.length === 0) return { reward: null, referralsNeeded: 0, percentage: 100 }

  const next = unclaimed[0]
  const referralsNeeded = Math.max(0, next.referralsRequired - referralsConverted)
  const percentage = Math.min(100, Math.round((referralsConverted / next.referralsRequired) * 100))
  return { reward: next, referralsNeeded, percentage }
}

// Get all rewards with claim status
export function getAllReferralRewards(referralsConverted: number, claimedRewards: string[]): ReferralReward[] {
  return REFERRAL_REWARDS.map(r => ({
    ...r,
    claimed: claimedRewards.includes(r.id),
    reached: referralsConverted >= r.referralsRequired,
  }))
}

// Extract referral code from URL params
export function getReferralCodeFromUrl(): string | null {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  return params.get('ref')
}
