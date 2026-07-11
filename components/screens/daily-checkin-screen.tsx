"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useApp } from "@/lib/app-context"
import { hasCheckedInToday, getNextDailyReward, getAllDailyRewards, getWeeklyCheckInHistory } from "@/lib/gamification"
import { getDailyTip, getUserTags } from "@/lib/daily-tips"
import { ChevronLeft, Flame, Calendar, Gift, Trophy, Check, Camera, Sparkles, TrendingUp, ChevronRight } from "lucide-react"

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"]

export function DailyCheckInScreen() {
  const { state, goBack, checkInToday, navigateTo } = useApp()
  const { gamification, questionnaireData, savedRecommendations } = state

  const [showRewardUnlock, setShowRewardUnlock] = useState(false)
  const [unlockedReward, setUnlockedReward] = useState<{ name: string; icon: string; description: string } | null>(null)
  const [justCheckedIn, setJustCheckedIn] = useState(false)

  const isCheckedIn = hasCheckedInToday(gamification.lastCheckInDate)
  const nextReward = getNextDailyReward(gamification)
  const allRewards = getAllDailyRewards(gamification)
  const weeklyHistory = getWeeklyCheckInHistory(gamification.lastCheckInDate, gamification.dailyCheckInStreak)

  // Personalized tip
  const userTags = useMemo(() => getUserTags(questionnaireData, savedRecommendations), [questionnaireData, savedRecommendations])
  const dailyTip = useMemo(() => getDailyTip(userTags), [userTags])

  const handleCheckIn = () => {
    if (isCheckedIn) return
    const rewardId = checkInToday()
    setJustCheckedIn(true)

    if (rewardId) {
      const reward = allRewards.find(r => r.id === rewardId)
      if (reward) {
        setTimeout(() => {
          setUnlockedReward({ name: reward.name, icon: reward.icon, description: reward.description })
          setShowRewardUnlock(true)
        }, 800)
      }
    }

    setTimeout(() => setJustCheckedIn(false), 2000)
  }

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
        <div className="px-6 md:px-8 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Title */}
            <div className="flex items-center gap-2 mb-6">
              <Flame className="w-6 h-6 text-orange-400" />
              <h2 className="text-xl font-semibold text-foreground">Daily Check-In</h2>
            </div>

            {/* Streak Hero Card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-orange-400/15 to-orange-400/5 border-2 border-orange-400/30 rounded-2xl p-6 mb-6 text-center relative overflow-hidden"
            >
              {/* Background fire emojis */}
              {gamification.dailyCheckInStreak >= 7 && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {[...Array(6)].map((_, i) => (
                    <motion.span
                      key={i}
                      className="absolute text-lg opacity-20"
                      initial={{ y: 100, x: `${15 + i * 15}%` }}
                      animate={{ y: -20, opacity: [0.2, 0.4, 0.2] }}
                      transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
                    >
                      🔥
                    </motion.span>
                  ))}
                </div>
              )}

              <div className="relative z-10">
                {/* Streak count */}
                <motion.div
                  key={gamification.dailyCheckInStreak}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <p className="text-5xl font-bold text-orange-400 mb-1">{gamification.dailyCheckInStreak}</p>
                  <p className="text-sm text-muted-foreground mb-4">day streak</p>
                </motion.div>

                {/* Check-in button */}
                {!isCheckedIn ? (
                  <motion.button
                    onClick={handleCheckIn}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-8 py-3 bg-orange-400 text-white font-bold rounded-xl hover:bg-orange-500 transition-colors shadow-lg shadow-orange-400/25"
                  >
                    <div className="flex items-center gap-2">
                      <Flame className="w-5 h-5" />
                      CHECK IN TODAY
                    </div>
                  </motion.button>
                ) : (
                  <div className="flex items-center justify-center gap-2 px-6 py-3 bg-green-400/15 border border-green-400/30 rounded-xl">
                    <Check className="w-5 h-5 text-green-400" />
                    <span className="text-sm font-semibold text-green-400">Checked in today!</span>
                  </div>
                )}

                {/* Just checked in animation */}
                <AnimatePresence>
                  {justCheckedIn && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                      <motion.span
                        className="text-6xl"
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.5, 1] }}
                        transition={{ duration: 0.6 }}
                      >
                        🔥
                      </motion.span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Weekly View */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-secondary border border-border rounded-xl p-4 mb-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-gold" />
                <p className="text-[10px] font-medium text-gold tracking-wider uppercase">THIS WEEK</p>
              </div>
              <div className="flex items-center justify-between">
                {DAY_LABELS.map((label, i) => {
                  const isToday = i === new Date().getDay()
                  const isChecked = weeklyHistory[i]
                  return (
                    <div key={i} className="flex flex-col items-center gap-1.5">
                      <span className={`text-[10px] ${isToday ? 'text-gold font-bold' : 'text-muted-foreground'}`}>
                        {label}
                      </span>
                      <motion.div
                        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                          isChecked
                            ? 'bg-orange-400 border-orange-400 text-white'
                            : isToday
                            ? 'border-orange-400/50 bg-orange-400/10'
                            : 'border-border bg-secondary'
                        }`}
                        animate={isChecked ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        {isChecked ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : isToday ? (
                          <Flame className="w-3.5 h-3.5 text-orange-400/50" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-border" />
                        )}
                      </motion.div>
                    </div>
                  )
                })}
              </div>
            </motion.div>

            {/* Next Reward Progress */}
            {nextReward.reward && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/30 rounded-xl p-4 mb-6"
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
                    {gamification.dailyCheckInStreak}/{nextReward.reward.streakRequired} days
                  </span>
                  <span className="text-[10px] text-gold font-medium">{nextReward.daysNeeded} more to go</span>
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

            {/* All Rewards */}
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
                        {reward.streakRequired}d
                      </span>
                      {reward.claimed && (
                        <div className="w-5 h-5 bg-gold rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-gold-foreground" />
                        </div>
                      )}
                      {reward.reached && !reward.claimed && (
                        <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Personalized Tip */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/30 rounded-xl p-4 mb-6"
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-gold" />
                <p className="text-[10px] font-medium text-gold tracking-wider uppercase">YOUR DAILY TIP</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-0.5">{dailyTip.icon}</span>
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">{dailyTip.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{dailyTip.content}</p>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="space-y-2 mb-6"
            >
              <button
                onClick={() => navigateTo('progress-tracker')}
                className="w-full flex items-center gap-3 p-3.5 bg-secondary border border-border rounded-xl hover:bg-muted transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-400/10 flex items-center justify-center">
                  <Camera className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-foreground">Log Today&apos;s Look</p>
                  <p className="text-[10px] text-muted-foreground">Take a progress photo</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>

              <button
                onClick={() => navigateTo('gamification')}
                className="w-full flex items-center gap-3 p-3.5 bg-secondary border border-border rounded-xl hover:bg-muted transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-orange-400/10 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-orange-400" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-foreground">View Achievements</p>
                  <p className="text-[10px] text-muted-foreground">See all your badges</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            </motion.div>

            {/* Stats Footer */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-3 gap-2 mb-4"
            >
              <div className="bg-secondary border border-border rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-orange-400">{gamification.totalCheckIns}</p>
                <p className="text-[10px] text-muted-foreground">Total Check-ins</p>
              </div>
              <div className="bg-secondary border border-border rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-gold">{gamification.longestDailyCheckInStreak}</p>
                <p className="text-[10px] text-muted-foreground">Best Streak</p>
              </div>
              <div className="bg-secondary border border-border rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-green-400">{gamification.unlockedRewards.length}</p>
                <p className="text-[10px] text-muted-foreground">Rewards</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Reward Unlock Modal */}
      <AnimatePresence>
        {showRewardUnlock && unlockedReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6"
            onClick={() => setShowRewardUnlock(false)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-secondary border-2 border-gold/40 rounded-2xl p-8 text-center max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.span
                className="text-6xl block mb-4"
                animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {unlockedReward.icon}
              </motion.span>
              <p className="text-xs text-gold font-medium tracking-wider uppercase mb-2">REWARD UNLOCKED!</p>
              <p className="text-lg font-bold text-foreground mb-1">{unlockedReward.name}</p>
              <p className="text-xs text-muted-foreground mb-6">{unlockedReward.description}</p>
              <button
                onClick={() => setShowRewardUnlock(false)}
                className="w-full py-3 bg-gold text-gold-foreground font-bold rounded-xl hover:bg-gold/90 transition-colors"
              >
                Awesome! 🎉
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
