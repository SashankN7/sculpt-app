"use client"

import { motion } from "framer-motion"
import { useApp } from "@/lib/app-context"
import { ChevronLeft, Crown, Timer, User, Scissors, Camera, Trophy, Calendar, Mail, Shield, Star, Clock } from "lucide-react"

export function ProfileScreen() {
  const { state, navigateTo, goBack, trialDaysLeft } = useApp()
  const { userSession, email, savedRecommendations, rejectedRecommendations, recommendations, gamification, progressPhotos, lastCutDate, analysisResult, profile } = state
  const isPremium = userSession === 'premium'
  const isTrial = userSession === 'trial'
  const daysLeft = isTrial ? trialDaysLeft() : 0

  const totalScans = state.scanHistory.length + (recommendations.length > 0 ? 1 : 0)
  const totalSaved = savedRecommendations.length + state.scanHistory.reduce((sum, s) => sum + s.savedRecommendations.length, 0)
  const totalRejected = rejectedRecommendations.length + state.scanHistory.reduce((sum, s) => sum + s.rejectedRecommendations.length, 0)

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
          {/* Profile Header */}
          <div className="text-center mb-6">
            <div className={`w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center ${
              isPremium
                ? 'bg-gold/20 border-2 border-gold/40'
                : 'bg-secondary border-2 border-border'
            }`}>
              <span className={`text-2xl font-bold ${isPremium ? 'text-gold' : 'text-muted-foreground'}`}>
                {email ? email.charAt(0).toUpperCase() : 'G'}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-1">
              {profile.firstName ? `${profile.firstName} ${profile.lastName}` : email ? email.split('@')[0] : 'Guest User'}
            </h2>
            {email && (
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Mail className="w-3 h-3" />
                {email}
              </p>
            )}
            <div className="flex items-center justify-center gap-2 mt-2">
              {isPremium ? (
                <span className="flex items-center gap-1 px-3 py-1 bg-gold/20 rounded-full">
                  <Crown className="w-3.5 h-3.5 text-gold" />
                  <span className="text-xs font-semibold text-gold">SCULPT PREMIUM</span>
                </span>
              ) : isTrial ? (
                <span className="flex items-center gap-1 px-3 py-1 bg-warning/20 rounded-full">
                  <Timer className="w-3.5 h-3.5 text-warning" />
                  <span className="text-xs font-semibold text-warning">TRIAL · {daysLeft}d left</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 px-3 py-1 bg-secondary border border-border rounded-full">
                  <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">FREE TIER</span>
                </span>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-secondary border border-border rounded-xl p-4 text-center">
              <Scissors className="w-5 h-5 text-gold mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{totalScans}</p>
              <p className="text-[10px] text-muted-foreground">Scans Completed</p>
            </div>
            <div className="bg-secondary border border-border rounded-xl p-4 text-center">
              <Star className="w-5 h-5 text-gold mx-auto mb-2" />
              <p className="text-2xl font-bold text-gold">{totalSaved}</p>
              <p className="text-[10px] text-muted-foreground">Styles Saved</p>
            </div>
            <div className="bg-secondary border border-border rounded-xl p-4 text-center">
              <Camera className="w-5 h-5 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-400">{progressPhotos.length}</p>
              <p className="text-[10px] text-muted-foreground">Progress Photos</p>
            </div>
            <div className="bg-secondary border border-border rounded-xl p-4 text-center">
              <Trophy className="w-5 h-5 text-orange-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-400">{gamification.badges.filter(b => b.earnedAt).length}</p>
              <p className="text-[10px] text-muted-foreground">Badges Earned</p>
            </div>
          </div>

          {/* Subscription Info */}
          <div className="mb-6">
            <p className="text-xs font-medium text-gold tracking-wider uppercase mb-3">Subscription</p>
            <div className="bg-secondary border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-foreground">Current Plan</span>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  isPremium ? 'bg-gold/20 text-gold' : 'bg-muted-foreground/20 text-muted-foreground'
                }`}>
                  {isPremium ? 'Premium' : isTrial ? 'Trial' : 'Free'}
                </span>
              </div>
              {isPremium && (
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-foreground">Status</span>
                  <span className="text-xs text-success font-medium">Active</span>
                </div>
              )}
              {!isPremium && (
                <button
                  onClick={() => navigateTo('paywall')}
                  className="w-full py-2.5 bg-gold/10 border border-gold/30 text-gold text-xs font-semibold rounded-lg hover:bg-gold/15 transition-colors"
                >
                  Upgrade to Premium
                </button>
              )}
            </div>
          </div>

          {/* Analysis Details */}
          {analysisResult && (
            <div className="mb-6">
              <p className="text-xs font-medium text-gold tracking-wider uppercase mb-3">Your Analysis</p>
              <div className="bg-secondary border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Face Shape</span>
                  <span className="text-sm font-medium text-gold">{analysisResult.faceShape}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Hair Density</span>
                  <span className="text-sm font-medium text-foreground">{analysisResult.densityScore}/100</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Texture</span>
                  <span className="text-sm font-medium text-foreground">
                    {analysisResult.textureProfile.waviness > 0.6 ? 'Curly' : analysisResult.textureProfile.waviness > 0.3 ? 'Wavy' : 'Straight'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Confidence</span>
                  <span className="text-sm font-medium text-success">{analysisResult.confidenceScore}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Haircut History */}
          {lastCutDate && (
            <div className="mb-6">
              <p className="text-xs font-medium text-gold tracking-wider uppercase mb-3">Haircut History</p>
              <div className="bg-secondary border border-border rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-400/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Last Haircut</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(lastCutDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-orange-400">{gamification.currentStreak}🔥</span>
                </div>
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                  <span>Total cuts logged: {gamification.totalCutsLogged}</span>
                  <span>Best streak: {gamification.longestStreak}</span>
                </div>
              </div>
            </div>
          )}

          {/* App Version */}
          <p className="text-xs text-muted-foreground text-center mt-4">
            Sculpt v1.0.0
          </p>
        </motion.div>
        </div>
      </div>
    </div>
  )
}
