"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useApp } from "@/lib/app-context"
import { getEarnedBadges, getBadgesByCategory, getProgressToNextBadge } from "@/lib/gamification"
import { ChevronLeft, Trophy, Flame, Scissors, Palette, Share2 } from "lucide-react"
import type { Badge } from "@/lib/types"

const CATEGORY_CONFIG = {
  streak: { label: "Streak Badges", icon: Flame, color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/30" },
  milestone: { label: "Milestone Badges", icon: Scissors, color: "text-gold", bg: "bg-gold/10", border: "border-gold/30" },
  style: { label: "Style Badges", icon: Palette, color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/30" },
  social: { label: "Social Badges", icon: Share2, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/30" },
} as const

function BadgeCard({ badge, isEarned }: { badge: Badge; isEarned: boolean }) {
  const [showDetail, setShowDetail] = useState(false)

  return (
    <motion.button
      onClick={() => setShowDetail(!showDetail)}
      className={`relative flex flex-col items-center p-3 rounded-xl border transition-all ${
        isEarned
          ? "bg-gold/10 border-gold/30 hover:bg-gold/15"
          : "bg-secondary border-border opacity-50 hover:opacity-70"
      }`}
      whileTap={{ scale: 0.95 }}
    >
      <span className="text-2xl mb-1">{badge.icon}</span>
      <span className={`text-[10px] font-medium text-center leading-tight ${isEarned ? "text-foreground" : "text-muted-foreground"}`}>
        {badge.name}
      </span>
      {isEarned && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gold rounded-full flex items-center justify-center">
          <span className="text-[8px] text-gold-foreground">✓</span>
        </div>
      )}

      <AnimatePresence>
        {showDetail && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full mt-2 pt-2 border-t border-border"
          >
            <p className="text-[9px] text-muted-foreground text-center leading-relaxed">
              {badge.description}
            </p>
            {isEarned && badge.earnedAt && (
              <p className="text-[8px] text-gold text-center mt-1">
                Earned {new Date(badge.earnedAt).toLocaleDateString()}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

function ProgressBar({ current, target, percentage }: { current: number; target: number; percentage: number }) {
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-muted-foreground">{current}/{target}</span>
        <span className="text-[10px] text-gold font-medium">{percentage}%</span>
      </div>
      <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full bg-gold rounded-full"
        />
      </div>
    </div>
  )
}

export function GamificationScreen() {
  const { state, goBack } = useApp()
  const { gamification } = state

  const earnedBadges = getEarnedBadges(gamification)
  const streakProgress = getProgressToNextBadge(gamification, "streak")
  const milestoneProgress = getProgressToNextBadge(gamification, "milestone")
  const styleProgress = getProgressToNextBadge(gamification, "style")

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
            <Trophy className="w-6 h-6 text-gold" />
            <h2 className="text-xl font-semibold text-foreground">Achievements</h2>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            <div className="bg-secondary border border-border rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-gold">{earnedBadges.length}</p>
              <p className="text-[10px] text-muted-foreground">Earned</p>
            </div>
            <div className="bg-secondary border border-border rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-orange-400">{gamification.longestStreak}</p>
              <p className="text-[10px] text-muted-foreground">Best Streak</p>
            </div>
            <div className="bg-secondary border border-border rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-purple-400">{gamification.styleVariety}</p>
              <p className="text-[10px] text-muted-foreground">Styles Tried</p>
            </div>
          </div>

          {/* Streak Section */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-orange-400/10 to-orange-400/5 border border-orange-400/30 rounded-xl p-4 mb-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-4 h-4 text-orange-400" />
              <p className="text-[10px] font-medium text-orange-400 tracking-wider uppercase">GROOMING STREAK</p>
            </div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-2xl font-bold text-foreground">{gamification.longestStreak}</p>
                <p className="text-xs text-muted-foreground">day streak</p>
              </div>
              {streakProgress.next && (
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Next: {streakProgress.next.icon} {streakProgress.next.name}</p>
                  <p className="text-[10px] text-gold">{streakProgress.current}/{streakProgress.target} days</p>
                </div>
              )}
            </div>
            {streakProgress.next && (
              <ProgressBar current={streakProgress.current} target={streakProgress.target} percentage={streakProgress.percentage} />
            )}
          </motion.div>

          {/* Milestone Progress */}
          {milestoneProgress.next && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-secondary border border-border rounded-xl p-4 mb-4"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-foreground">
                  {milestoneProgress.next.icon} {milestoneProgress.next.name}
                </p>
                <p className="text-[10px] text-gold">{milestoneProgress.percentage}%</p>
              </div>
              <p className="text-[10px] text-muted-foreground mb-2">{milestoneProgress.next.description}</p>
              <ProgressBar current={milestoneProgress.current} target={milestoneProgress.target} percentage={milestoneProgress.percentage} />
            </motion.div>
          )}

          {/* Style Variety Progress */}
          {styleProgress.next && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-secondary border border-border rounded-xl p-4 mb-4"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-foreground">
                  {styleProgress.next.icon} {styleProgress.next.name}
                </p>
                <p className="text-[10px] text-gold">{styleProgress.percentage}%</p>
              </div>
              <p className="text-[10px] text-muted-foreground mb-2">{styleProgress.next.description}</p>
              <ProgressBar current={styleProgress.current} target={styleProgress.target} percentage={styleProgress.percentage} />
            </motion.div>
          )}

          {/* Badge Categories */}
          {(Object.keys(CATEGORY_CONFIG) as Array<keyof typeof CATEGORY_CONFIG>).map((category, catIndex) => {
            const config = CATEGORY_CONFIG[category]
            const badges = getBadgesByCategory(gamification, category)
            const Icon = config.icon

            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + catIndex * 0.05 }}
                className="mb-6"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Icon className={`w-4 h-4 ${config.color}`} />
                  <p className={`text-[10px] font-medium ${config.color} tracking-wider uppercase`}>
                    {config.label}
                  </p>
                  <span className="text-[10px] text-muted-foreground ml-auto">
                    {badges.filter(b => b.earnedAt).length}/{badges.length}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {badges.map(badge => (
                    <BadgeCard key={badge.id} badge={badge} isEarned={!!badge.earnedAt} />
                  ))}
                </div>
              </motion.div>
            )
          })}

          {/* Empty State */}
          {earnedBadges.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center py-8"
            >
              <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">No Badges Yet</p>
              <p className="text-xs text-muted-foreground max-w-[240px] mx-auto">
                Start logging haircuts and tracking your style journey to earn badges.
              </p>
            </motion.div>
          )}
        </motion.div>
        </div>
      </div>
    </div>
  )
}
