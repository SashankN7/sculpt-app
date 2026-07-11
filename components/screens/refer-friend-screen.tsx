"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { useApp } from "@/lib/app-context"
import { getNextReferralReward, getAllReferralRewards, getReferralUrl, getReferralShareText } from "@/lib/referrals"
import { ChevronLeft, Share2, Copy, Check, Users, Gift, Trophy, Sparkles } from "lucide-react"
import { useState } from "react"

export function ReferFriendScreen() {
  const { state, goBack, shareReferral, claimReferralReward } = useApp()
  const { referralCode, referralsSent, referralsConverted, referralRewardsClaimed } = state

  const [copied, setCopied] = useState(false)
  const [justShared, setJustShared] = useState(false)

  const nextReward = useMemo(() => getNextReferralReward(referralsConverted), [referralsConverted])
  const allRewards = useMemo(() => getAllReferralRewards(referralsConverted, referralRewardsClaimed), [referralsConverted, referralRewardsClaimed])

  const handleCopy = async () => {
    if (!referralCode) return
    const text = getReferralShareText(referralCode)
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    await shareReferral()
    setJustShared(true)
    setTimeout(() => setJustShared(false), 2000)
  }

  const referralUrl = referralCode ? getReferralUrl(referralCode) : ''

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center px-4 md:px-6 py-2">
        <button
          onClick={goBack}
          className="flex items-center gap-1 text-sm text-foreground hover:text-gold transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          BACK
        </button>
      </div>

      <div className="flex-1 pt-2 pb-6 overflow-y-auto w-full">
        <div className="px-6 md:px-8 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Title */}
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-6 h-6 text-gold" />
              <h2 className="text-xl font-semibold text-foreground">Refer a Friend</h2>
            </div>

            {/* Hero Card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/30 rounded-2xl p-6 mb-6 text-center"
            >
              <Sparkles className="w-8 h-8 text-gold mx-auto mb-3" />
              <h3 className="text-lg font-bold text-foreground mb-1">Share Sculpt, Get Rewards</h3>
              <p className="text-xs text-muted-foreground mb-4">
                When a friend signs up using your code, you both get bonus scans and features!
              </p>

              {/* Referral Code */}
              <div className="bg-secondary border border-border rounded-xl p-4 mb-4">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Your Referral Code</p>
                <p className="text-xl font-bold text-gold tracking-wider">{referralCode || 'SCULPT-XXXX-XXXX'}</p>
              </div>

              {/* Share Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gold text-gold-foreground font-semibold rounded-xl hover:bg-gold/90 transition-colors"
                >
                  {justShared ? (
                    <>
                      <Check className="w-4 h-4" />
                      Shared!
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      Share Link
                    </>
                  )}
                </button>
                <button
                  onClick={handleCopy}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-secondary border border-border text-foreground font-semibold rounded-xl hover:bg-muted transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Code
                    </>
                  )}
                </button>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-3 gap-2 mb-6"
            >
              <div className="bg-secondary border border-border rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-gold">{referralsSent}</p>
                <p className="text-[10px] text-muted-foreground">Links Shared</p>
              </div>
              <div className="bg-secondary border border-border rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-green-400">{referralsConverted}</p>
                <p className="text-[10px] text-muted-foreground">Friends Joined</p>
              </div>
              <div className="bg-secondary border border-border rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-gold">{referralRewardsClaimed.length}</p>
                <p className="text-[10px] text-muted-foreground">Rewards Earned</p>
              </div>
            </motion.div>

            {/* Next Reward Progress */}
            {nextReward.reward && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-gold/5 border border-gold/20 rounded-xl p-4 mb-6"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Gift className="w-4 h-4 text-gold" />
                  <p className="text-[10px] font-medium text-gold tracking-wider uppercase">NEXT REWARD</p>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{nextReward.reward.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{nextReward.reward.name}</p>
                    <p className="text-[10px] text-muted-foreground">{nextReward.reward.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-muted-foreground">
                    {referralsConverted}/{nextReward.reward.referralsRequired} referrals
                  </span>
                  <span className="text-[10px] text-gold font-medium">{nextReward.referralsNeeded} more to go</span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${nextReward.percentage}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-gold rounded-full"
                  />
                </div>
              </motion.div>
            )}

            {/* Reward Milestones */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-4 h-4 text-gold" />
                <p className="text-[10px] font-medium text-gold tracking-wider uppercase">REWARD MILESTONES</p>
              </div>
              <div className="space-y-2">
                {allRewards.map((reward, i) => (
                  <motion.div
                    key={reward.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + i * 0.05 }}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      reward.claimed
                        ? 'bg-gold/10 border-gold/30'
                        : reward.reached
                        ? 'bg-green-400/10 border-green-400/30'
                        : 'bg-secondary border-border opacity-60'
                    }`}
                  >
                    <span className="text-xl">{reward.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium ${reward.claimed ? 'text-gold' : 'text-foreground'}`}>
                        {reward.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">{reward.description}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className={`text-[10px] font-medium ${
                        reward.claimed ? 'text-gold' : reward.reached ? 'text-green-400' : 'text-muted-foreground'
                      }`}>
                        {reward.referralsRequired}
                      </span>
                      {reward.claimed && (
                        <div className="w-5 h-5 bg-gold rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-gold-foreground" />
                        </div>
                      )}
                      {reward.reached && !reward.claimed && (
                        <button
                          onClick={() => claimReferralReward(reward.id)}
                          className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center hover:bg-green-500 transition-colors"
                        >
                          <Check className="w-3 h-3 text-white" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* How It Works */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-secondary border border-border rounded-xl p-4"
            >
              <p className="text-[10px] font-medium text-gold tracking-wider uppercase mb-3">HOW IT WORKS</p>
              <div className="space-y-3">
                {[
                  { step: '1', text: 'Share your unique referral code with friends' },
                  { step: '2', text: 'They sign up using your link or code' },
                  { step: '3', text: 'You both earn bonus scans and features!' },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-gold w-5">{item.step}</span>
                    <p className="text-xs text-muted-foreground">{item.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
