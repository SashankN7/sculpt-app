"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { useApp } from "@/lib/app-context"
import { getMaintenanceReminder } from "@/lib/history"
import { getTopSeasonalPicks, getCurrentSeason, getSeasonDisplayName } from "@/lib/seasonal"
import { getEarnedBadges, getRecentBadges } from "@/lib/gamification"
import { Settings, FileText, ChevronRight, Plus, Sparkles, User, Clock, TrendingUp, Scissors, Camera, Crown, AlertTriangle, Timer, BookOpen, Trophy, Lock, MessageSquare } from "lucide-react"
import { canLogHaircut, HAIRCUT_COOLDOWN_DAYS } from "@/lib/gamification"
import { DAILY_USAGE_LIMITS } from "@/lib/types"

const GROOMING_TIPS = [
  { title: 'Less Product is More', content: 'Start with a dime-sized amount of product. You can always add more, but overloading makes hair look greasy and flat.' },
  { title: 'The 4-Week Rule', content: 'Most men\'s haircuts start losing their shape after 4 weeks. Book your next appointment before you need one.' },
  { title: 'Matte vs Shine', content: 'Matte products (clay, paste) give a natural look. Shine products (pomade, gel) give a polished, wet look. Match to your vibe.' },
  { title: 'Pre-Styler Secret', content: 'A pre-styler (mousse or sea salt spray) before blow drying adds volume without the heavy feel of finishing products.' },
  { title: 'Wash Less, Style More', content: 'Washing hair daily strips natural oils. Every 2-3 days is ideal. On off days, a water rinse is enough.' },
  { title: 'Neckline Maintenance', content: 'Clean up your neckline between cuts with a trimmer. The neckline defines your haircut more than you think.' },
]

export function DashboardScreen() {
  const { state, featureConfig, navigateTo, trialDaysLeft, setCurrentSavedIndex, syncRecommendationIndex, setDetailViewMode } = useApp()
  const { userSession, savedRecommendations, email, recommendations, gamification, progressPhotos, currentScanIds } = state
  const isPremium = userSession === 'premium'
  const isTrial = userSession === 'trial'
  const daysLeft = isTrial ? trialDaysLeft() : 0

  // Filter saved barber cards to current scan only (avoid duplicates across scans)
  const currentSavedCards = currentScanIds.length > 0
    ? savedRecommendations.filter(r => currentScanIds.includes(r.id))
    : savedRecommendations

  const recentScans = recommendations.length > 0 ? 1 : 0
  const savedCards = currentSavedCards.length
  const avgScore = currentSavedCards.length > 0
    ? Math.round(currentSavedCards.reduce((sum, r) => sum + r.compatibilityScore, 0) / currentSavedCards.length)
    : 0

  // Dynamic maintenance reminder
  const reminder = useMemo(() => {
    return getMaintenanceReminder(state.lastCutDate, state.cutFrequency)
  }, [state.lastCutDate, state.cutFrequency])

  // Seasonal styles
  const seasonalStyles = useMemo(() => getTopSeasonalPicks(), [])
  const currentSeason = useMemo(() => getCurrentSeason(), [])
  const seasonDisplayName = useMemo(() => getSeasonDisplayName(currentSeason), [currentSeason])

  // Gamification
  const earnedBadges = useMemo(() => getEarnedBadges(gamification), [gamification])
  const recentBadges = useMemo(() => getRecentBadges(gamification), [gamification])

  // Whether this is a first-time user (no data yet)
  const isFirstTime = recommendations.length === 0 && savedRecommendations.length === 0

  // Haircut cooldown check
  const haircutCooldown = useMemo(() => canLogHaircut(state.gamification.lastCutLoggedDate), [state.gamification.lastCutLoggedDate])



  const handleViewSavedCard = (savedIndex: number) => {
    setCurrentSavedIndex(savedIndex)
    const rec = currentSavedCards[savedIndex]
    if (rec) {
      const recIndex = recommendations.findIndex(r => r.id === rec.id)
      if (recIndex !== -1) syncRecommendationIndex(recIndex)
    }
    setDetailViewMode('savedOnly')
    navigateTo('recommendation-detail')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isPremium
              ? 'bg-gold/20 border border-gold/40'
              : 'bg-secondary border border-border'
          }`}>
            <span className={`text-xs font-semibold ${isPremium ? 'text-gold' : 'text-muted-foreground'}`}>
              {email ? email.charAt(0).toUpperCase() : 'G'}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground leading-tight">
              {state.profile.firstName || (email ? email.split('@')[0] : 'Guest User')}
            </p>
            <div className="flex items-center gap-1.5">
              {isPremium ? (
                <span className="flex items-center gap-1 px-1.5 py-0.5 bg-gold/10 rounded-full">
                  <Crown className="w-2.5 h-2.5 text-gold" />
                  <span className="text-[9px] font-semibold text-gold">PREMIUM</span>
                </span>
              ) : isTrial ? (
                <span className="flex items-center gap-1 px-1.5 py-0.5 bg-gold/10 rounded-full">
                  <Timer className="w-2.5 h-2.5 text-warning" />
                  <span className="text-[9px] font-semibold text-warning">TRIAL · {daysLeft}d</span>
                </span>
              ) : (
                <span className="text-[10px] text-muted-foreground">FREE TIER</span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => navigateTo('menu')}
          className="w-9 h-9 rounded-full bg-secondary border border-border flex items-center justify-center hover:bg-muted transition-colors"
        >
          <Settings className="w-4 h-4 text-foreground" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 pb-4 overflow-y-auto w-full">
        <div className="px-4 md:px-6 lg:px-8 space-y-5 max-w-3xl mx-auto">
        {/* Guest Upgrade Banner */}
        {userSession === 'guest' && !isFirstTime && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-400/10 to-blue-400/5 border border-blue-400/30 rounded-xl p-4 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-400/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Save your results</p>
              <p className="text-[11px] text-muted-foreground">Create an account to keep your analysis across devices</p>
            </div>
            <button
              onClick={() => navigateTo('auth')}
              className="flex-shrink-0 px-3 py-1.5 bg-blue-400 text-white text-[11px] font-medium rounded-lg hover:bg-blue-400/90 transition-colors"
            >
              Create Account
            </button>
          </motion.div>
        )}

        {/* Welcome banner for first-time users */}
        {isFirstTime && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-gold/15 to-gold/5 border border-gold/30 rounded-xl p-5 text-center"
          >
            <div className="w-14 h-14 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-7 h-7 text-gold" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">Welcome to Sculpt</h3>
            <p className="text-xs text-muted-foreground mb-4 max-w-[260px] mx-auto">
              Get AI-powered haircut recommendations tailored to your face shape, hair type, and style preferences.
            </p>
            <button
              onClick={() => navigateTo('upload')}
              className="w-full py-3 px-6 bg-gold text-gold-foreground font-semibold rounded-xl hover:bg-gold/90 transition-colors"
            >
              Start Your First Analysis
            </button>
          </motion.div>
        )}

        {/* Trial Expiry Reminder (only for trial users) */}
        {isTrial && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.02 }}
            className={`rounded-xl p-4 flex items-center gap-3 ${
              daysLeft <= 1
                ? 'bg-error/10 border border-error/30'
                : daysLeft <= 3
                ? 'bg-warning/10 border border-warning/30'
                : 'bg-gold/10 border border-gold/30'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              daysLeft <= 1
                ? 'bg-error/20'
                : daysLeft <= 3
                ? 'bg-warning/20'
                : 'bg-gold/20'
            }`}>
              {daysLeft <= 1 ? (
                <AlertTriangle className="w-5 h-5 text-error" />
              ) : daysLeft <= 3 ? (
                <Timer className="w-5 h-5 text-warning" />
              ) : (
                <Crown className="w-5 h-5 text-gold" />
              )}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                daysLeft <= 1 ? 'text-error' : daysLeft <= 3 ? 'text-warning' : 'text-foreground'
              }`}>
                {daysLeft <= 1
                  ? 'Trial ends tomorrow!'
                  : daysLeft <= 3
                  ? `${daysLeft} days left in your trial`
                  : `${daysLeft} days left in your free trial`
                }
              </p>
              <p className="text-xs text-muted-foreground">
                {daysLeft <= 1
                  ? 'Subscribe now to keep premium access'
                  : daysLeft <= 3
                  ? 'Lock in full AI analysis, chat, and PDF export'
                  : 'You have full access to all premium features'
                }
              </p>
            </div>
            <button
              onClick={() => navigateTo('paywall')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors flex-shrink-0 ${
                daysLeft <= 1
                  ? 'bg-error/20 text-error hover:bg-error/30'
                  : daysLeft <= 3
                  ? 'bg-warning/20 text-warning hover:bg-warning/30'
                  : 'bg-gold/20 text-gold hover:bg-gold/30'
              }`}
            >
              Subscribe
            </button>
          </motion.div>
        )}

        {/* Scan Counter + Stats Row */}
        {!isFirstTime && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            {/* Usage Status — Clear breakdown for ALL tiers */}
            <div className={`rounded-xl p-3.5 mb-3 ${
              isPremium || isTrial
                ? 'bg-gold/5 border border-gold/20'
                : 'bg-secondary border border-border'
            }`}>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles className={`w-4 h-4 ${isPremium || isTrial ? 'text-gold' : 'text-muted-foreground'}`} />
                  <span className="text-xs font-semibold text-foreground">
                    {isPremium ? 'PREMIUM' : isTrial ? `TRIAL · ${daysLeft}d left` : 'FREE TIER'}
                  </span>
                </div>
                {!(isPremium || isTrial) && (
                  <button
                    onClick={() => navigateTo('paywall')}
                    className="px-2 py-0.5 bg-gold/10 border border-gold/30 rounded-full text-[9px] font-medium text-gold hover:bg-gold/15 transition-colors"
                  >
                    Upgrade →
                  </button>
                )}
              </div>
              {/* AI analysis row */}
              <div className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-gold" />
                  <span className="text-[11px] text-muted-foreground">AI Photo Analysis</span>
                </div>
                <span className={`text-[11px] font-semibold ${
                  isPremium || isTrial ? 'text-gold' : 'text-muted-foreground'
                }`}>
                  {isPremium || isTrial
                    ? featureConfig && !featureConfig.hasOpenAI
                      ? '10/day (AI key needed)'
                      : `${DAILY_USAGE_LIMITS.analyses}/day`
                    : 'Questionnaire-based'
                  }
                </span>
              </div>
              {/* Chat row */}
              <div className="flex items-center justify-between py-1.5 border-t border-border/50">
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-3 h-3 text-gold" />
                  <span className="text-[11px] text-muted-foreground">AI Chat Assistant</span>
                </div>
                <span className={`text-[11px] font-semibold ${
                  isPremium || isTrial ? 'text-gold' : 'text-muted-foreground'
                }`}>
                  {isPremium || isTrial ? `${DAILY_USAGE_LIMITS.chatMessages}/day` : 'Not included'}
                </span>
              </div>

              {/* Free tier note */}
              {!(isPremium || isTrial) && (
                <div className="mt-2 pt-2 border-t border-border/50">
                  <p className="text-[10px] text-muted-foreground/70 italic">
                    Free: 1 scan/day with questionnaire-based suggestions. Upgrade for AI photo analysis, chat, and more.
                  </p>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-secondary border border-border rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-foreground">{recentScans}</p>
                <p className="text-[10px] text-muted-foreground">Scans</p>
              </div>
              <div className="bg-secondary border border-border rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-foreground">{savedCards}</p>
                <p className="text-[10px] text-muted-foreground">Saved</p>
              </div>
              <div className="bg-secondary border border-border rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-gold">{avgScore || '—'}</p>
                <p className="text-[10px] text-muted-foreground">Avg Score</p>
              </div>
              <div className="bg-secondary border border-border rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-orange-400">{gamification.currentStreak}</p>
                <p className="text-[10px] text-muted-foreground">Streak</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Grooming Insight */}
        {currentSavedCards.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-secondary border border-border rounded-xl p-4"
          >
            <p className="text-[10px] font-medium text-gold tracking-wider uppercase mb-2">SCULPT INSIGHT</p>
            <p className="text-xs text-muted-foreground italic leading-relaxed">
              You tend to prefer {currentSavedCards[0]?.metadata.professionalism >= 70 ? 'professional, polished' : 'modern, textured'} styles.
              Your top pick scored {currentSavedCards[0]?.compatibilityScore}% — above average for your profile.
            </p>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <p className="text-[10px] font-medium text-gold tracking-wider uppercase mb-2">QUICK ACTIONS</p>
          <div className="space-y-2">
            <button
              onClick={() => navigateTo('upload')}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-gold/10 border border-gold/30 hover:bg-gold/15 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-gold/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-gold" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-foreground">
                  {isFirstTime ? 'Start Your Analysis' : 'New Analysis'}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {isPremium || isTrial
                    ? `${DAILY_USAGE_LIMITS.analyses} AI analyses · ${DAILY_USAGE_LIMITS.chatMessages} chat messages/day`
                    : isFirstTime
                    ? '1 free scan/day · AI-powered analysis'
                    : '1 scan/day · Upgrade for AI analysis'}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>

            {currentSavedCards.length > 0 && (
              <button
                onClick={() => handleViewSavedCard(0)}
                className="w-full flex items-center gap-3 p-3.5 bg-secondary border border-border rounded-xl hover:bg-muted transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-background flex items-center justify-center">
                  <FileText className="w-5 h-5 text-gold" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-foreground">View Saved Picks</p>
                  <p className="text-[10px] text-muted-foreground">{savedCards} saved style{savedCards !== 1 ? 's' : ''}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            )}

            {/* Progress Tracker Quick Action */}
            <button
              onClick={() => navigateTo('progress-tracker')}
              className="w-full flex items-center gap-3 p-3.5 bg-secondary border border-border rounded-xl hover:bg-muted transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-400/10 flex items-center justify-center">
                <Camera className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-foreground">Hair Journey</p>
                <p className="text-[10px] text-muted-foreground">
                  {progressPhotos.length > 0
                    ? `${progressPhotos.length} progress photo${progressPhotos.length !== 1 ? 's' : ''} tracked`
                    : 'Track your hair growth between cuts'}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>

            {/* Achievements Quick Action */}
            <button
              onClick={() => navigateTo('gamification')}
              className="w-full flex items-center gap-3 p-3.5 bg-secondary border border-border rounded-xl hover:bg-muted transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-orange-400/10 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-orange-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-foreground">Achievements</p>
                <p className="text-[10px] text-muted-foreground">
                  {earnedBadges.length > 0
                    ? `${earnedBadges.length} badge${earnedBadges.length !== 1 ? 's' : ''} earned`
                    : 'Earn badges for your grooming journey'}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </motion.div>            {/* Saved Barber Cards */}
        {currentSavedCards.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-[10px] font-medium text-gold tracking-wider uppercase mb-2">SAVED BARBER CARDS</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {currentSavedCards.map((rec, index) => (
                <button
                  key={rec.id}
                  onClick={() => handleViewSavedCard(index)}
                  className="flex-shrink-0 w-24 h-32 bg-secondary border border-gold/30 rounded-xl p-2.5 flex flex-col items-center justify-center gap-1 hover:border-gold/60 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center overflow-hidden">
                    {rec.imageUrl ? (
                      <img src={rec.imageUrl} alt={rec.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-gold" />
                    )}
                  </div>
                  <p className="text-[10px] font-medium text-foreground text-center leading-tight truncate w-full">
                    {rec.name}
                  </p>
                  <p className="text-[9px] text-gold font-semibold">{rec.compatibilityScore}%</p>
                </button>
              ))}
              <button
                onClick={() => navigateTo('upload')}
                className="flex-shrink-0 w-24 h-32 bg-secondary border border-dashed border-border rounded-xl p-2.5 flex flex-col items-center justify-center gap-1 hover:border-gold/40 transition-colors"
              >
                <Plus className="w-5 h-5 text-muted-foreground" />
                <p className="text-[10px] text-muted-foreground">New</p>
              </button>
            </div>
          </motion.div>
        )}

        {/* Seasonal Styles (Dynamic) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-medium text-gold tracking-wider uppercase">
              {seasonDisplayName} PICKS
            </p>
            <span className="text-[9px] text-muted-foreground">Personalized</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {seasonalStyles.map((style) => (
              <div
                key={style.name}
                className="flex-shrink-0 w-32 bg-secondary border border-border rounded-xl p-3 flex flex-col gap-1"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <TrendingUp className="w-3 h-3 text-gold flex-shrink-0" />
                  <span className="text-[9px] font-medium text-gold truncate">{style.tag}</span>
                </div>
                <p className="text-[10px] font-medium text-foreground leading-tight">{style.name}</p>
                <p className="text-[9px] text-muted-foreground leading-tight">{style.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Maintenance Reminder */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`rounded-xl p-4 ${
            reminder?.urgency === 'overdue'
              ? 'bg-error/10 border border-error/30'
              : reminder?.urgency === 'soon'
              ? 'bg-warning/10 border border-warning/30'
              : 'bg-secondary border border-border'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
              reminder?.urgency === 'overdue'
                ? 'bg-error/20'
                : reminder?.urgency === 'soon'
                ? 'bg-warning/10'
                : 'bg-warning/10'
            }`}>
              {reminder?.urgency === 'overdue' ? (
                <AlertTriangle className="w-5 h-5 text-error" />
              ) : (
                <Clock className="w-5 h-5 text-warning" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground mb-0.5">Cleanup Reminder</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {reminder
                  ? reminder.message
                  : state.lastCutDate
                  ? 'Your haircut is looking fresh. No cleanup needed yet.'
                  : 'Track your haircuts to get personalized cleanup reminders.'
                }
              </p>
              {!state.lastCutDate && (
                <button
                  onClick={() => navigateTo('feedback')}
                  className="text-[10px] text-gold hover:text-gold/80 transition-colors mt-1"
                >
                  Log your last haircut →
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Log Haircut Button */}
        {currentSavedCards.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <button
              onClick={() => {
                if (!haircutCooldown.allowed) return
                navigateTo('log-cut')
              }}
              disabled={!haircutCooldown.allowed}
              className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-colors ${
                haircutCooldown.allowed
                  ? 'bg-gradient-to-r from-orange-400/10 to-orange-400/5 border border-orange-400/30 hover:from-orange-400/15 hover:to-orange-400/10'
                  : 'bg-secondary border border-border opacity-60 cursor-not-allowed'
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                haircutCooldown.allowed ? 'bg-orange-400/20' : 'bg-muted-foreground/10'
              }`}>
                {haircutCooldown.allowed ? (
                  <Scissors className="w-5 h-5 text-orange-400" />
                ) : (
                  <Lock className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 text-left">
                <p className={`text-sm font-medium ${haircutCooldown.allowed ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {haircutCooldown.allowed ? 'Log Haircut' : `Available in ${haircutCooldown.daysUntilAvailable} days`}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {haircutCooldown.allowed
                    ? 'Track your latest cut to build your streak'
                    : `${HAIRCUT_COOLDOWN_DAYS}-day cooldown between logs`
                  }
                </p>
              </div>
              <span className="text-lg">{haircutCooldown.allowed ? '🔥' : '⏳'}</span>
            </button>
          </motion.div>
        )}

        {/* Grooming Streak (Real) */}
        {gamification.totalCutsLogged > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
            className="bg-gradient-to-br from-orange-400/10 to-orange-400/5 border border-orange-400/30 rounded-xl p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-orange-400/20 flex items-center justify-center">
                  <span className="text-xl font-bold text-orange-400">{gamification.currentStreak}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Grooming Streak</p>
                  <p className="text-[10px] text-muted-foreground">
                    {gamification.totalCutsLogged} cut{gamification.totalCutsLogged !== 1 ? 's' : ''} logged
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigateTo('progress-tracker')}
                className="text-[10px] text-orange-400 hover:text-orange-300 transition-colors"
              >
                View Cuts →
              </button>
            </div>
          </motion.div>
        )}

        {/* Recent Badges */}
        {recentBadges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.34 }}
            className="bg-gold/5 border border-gold/20 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-medium text-gold tracking-wider uppercase">NEW BADGES</p>
              <button
                onClick={() => navigateTo('gamification')}
                className="text-[10px] text-gold hover:text-gold/80 transition-colors"
              >
                View All →
              </button>
            </div>
            <div className="flex gap-3">
              {recentBadges.slice(0, 3).map((badge) => (
                <div key={badge.id} className="flex items-center gap-2">
                  <span className="text-lg">{badge.icon}</span>
                  <div>
                    <p className="text-xs font-medium text-foreground">{badge.name}</p>
                    <p className="text-[9px] text-muted-foreground">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Grooming Tip of the Day */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36 }}
          className="bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/30 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-gold" />
            <p className="text-[10px] font-medium text-gold tracking-wider uppercase">GROOMING TIP OF THE DAY</p>
          </div>
          <p className="text-sm text-foreground font-medium mb-1">
            {GROOMING_TIPS[new Date().getDay() % GROOMING_TIPS.length].title}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {GROOMING_TIPS[new Date().getDay() % GROOMING_TIPS.length].content}
          </p>
        </motion.div>

        {/* How Sculpt Works */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
          className="bg-secondary border border-border rounded-xl p-4"
        >
          <p className="text-[10px] font-medium text-gold tracking-wider uppercase mb-3">HOW SCULPT WORKS</p>
          <div className="space-y-3">
            {[
              { step: '01', icon: <Camera className="w-4 h-4" />, text: 'Upload your face photos' },
              { step: '02', icon: <Sparkles className="w-4 h-4" />, text: 'AI analyzes your features' },
              { step: '03', icon: <Scissors className="w-4 h-4" />, text: 'Get personalized barber cards' },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-gold w-5">{item.step}</span>
                <div className="w-7 h-7 rounded-lg bg-background flex items-center justify-center text-gold">
                  {item.icon}
                </div>
                <p className="text-xs text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Premium Upsell (for free users only) */}
        {!isPremium && !isTrial && !isFirstTime && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gold/5 border border-gold/30 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <Crown className="w-4 h-4 text-gold" />
              <p className="text-sm font-medium text-foreground">
                Unlock AI-Powered Analysis
              </p>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              10 real AI analyses/day · 30 chat messages/day · PDF export — all powered by GPT-4o Vision.
            </p>
            <button
              onClick={() => navigateTo('paywall')}
              className="text-xs text-gold font-medium hover:text-gold/80 transition-colors"
            >
              Start Free 30-Day Trial →
            </button>
          </motion.div>
        )}

        {/* App Version */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="text-center pb-4"
        >
          <p className="text-[10px] text-muted-foreground/50">Sculpt v1.0.0 · {isPremium ? 'Premium' : isTrial ? 'Trial' : 'Free'}</p>
        </motion.div>
        </div>
      </div>
    </div>
  )
}
