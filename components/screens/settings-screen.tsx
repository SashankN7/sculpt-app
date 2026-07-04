"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useApp } from "@/lib/app-context"
import { ChevronLeft, Check, ChevronRight, AlertTriangle, Shield, Bell } from "lucide-react"
import type { PhotoRetentionOption } from "@/lib/types"

interface ToggleRowProps {
  label: string
  sublabel: string
  value: boolean
  onChange: (value: boolean) => void
  isPremium?: boolean
  onClickPremium?: () => void
  userIsPremium?: boolean
}

function ToggleRow({ label, sublabel, value, onChange, isPremium, onClickPremium, userIsPremium }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{label}</span>
          {isPremium && (
            <span className="px-2 py-0.5 bg-gold/20 text-gold text-xs font-medium rounded-full">
              Premium
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>
      </div>
      <button
        onClick={() => (isPremium && !value && !userIsPremium) ? onClickPremium?.() : onChange(!value)}
        className={`w-12 h-7 rounded-full transition-all relative ${
          value ? 'bg-gold' : 'bg-muted-foreground/30'
        }`}
      >
        <span
          className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${
            value ? 'left-6' : 'left-1'
          }`}
        />
      </button>
    </div>
  )
}

interface RadioRowProps {
  label: string
  description?: string
  isSelected: boolean
  onClick: () => void
}

function RadioRow({ label, description, isSelected, onClick }: RadioRowProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-3 py-3 border-b border-border last:border-0"
    >
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
          isSelected ? 'border-gold bg-gold' : 'border-muted-foreground/50'
        }`}
      >
        {isSelected && <Check className="w-3 h-3 text-gold-foreground" />}
      </div>
      <div className="flex-1 text-left">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
    </button>
  )
}

interface ActionRowProps {
  label: string
  value?: string
  description?: string
  onClick?: () => void
  isDestructive?: boolean
  showChevron?: boolean
}

function ActionRow({ label, value, onClick, isDestructive, showChevron = true }: ActionRowProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between py-3 border-b border-border last:border-0 hover:bg-secondary/50 transition-colors"
    >
      <span className={`text-sm ${isDestructive ? 'text-error' : 'text-foreground'}`}>
        {label}
      </span>
      <div className="flex items-center gap-2">
        {value && (
          <span className={`text-sm ${isDestructive ? 'text-error/70' : 'text-muted-foreground'}`}>
            {value}
          </span>
        )}
        {showChevron && (
          <ChevronRight className={`w-4 h-4 ${isDestructive ? 'text-error/50' : 'text-muted-foreground'}`} />
        )}
      </div>
    </button>
  )
}

export function SettingsScreen() {
  const { state, navigateTo, goBack, setPhotoRetention, setAiPersonalization, setNotification, setUserSession, signOut, clearSettingsScrollTo } = useApp()
  const { settings, userSession, settingsScrollTo } = state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (settingsScrollTo) {
      const timer = setTimeout(() => {
        const el = document.getElementById(`settings-section-${settingsScrollTo}`)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        clearSettingsScrollTo()
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [settingsScrollTo, clearSettingsScrollTo])

  const handleSignOut = async () => {
    await signOut()
    navigateTo('landing')
  }

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true)
  }

  const confirmDelete = () => {
    // In real app, would call API to delete account
    setUserSession('guest')
    navigateTo('landing')
  }

  const handlePhotoRetentionChange = (option: PhotoRetentionOption) => {
    setPhotoRetention(option)
  }

  const isPremium = userSession === 'premium'

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

      <div className="flex-1 px-6 md:px-8 pt-4 pb-6 overflow-y-auto mx-auto w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Title */}
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-6 h-6 text-gold" />
            <h2 className="text-xl font-semibold text-foreground">Settings</h2>
          </div>

          {/* Back to Dashboard */}
          <button
            onClick={() => navigateTo('dashboard')}
            className="w-full flex items-center justify-center gap-2 py-3 mb-6 bg-gold text-gold-foreground font-semibold rounded-xl hover:bg-gold/90 transition-colors"
          >
            Back to Dashboard
          </button>

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-secondary border border-border rounded-xl p-6 w-full max-w-sm"
              >
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-6 h-6 text-error" />
                  <h3 className="text-lg font-semibold text-foreground">Delete Account?</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  This will permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-3 px-4 bg-secondary border border-border text-foreground font-medium rounded-xl hover:bg-secondary/80 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 py-3 px-4 bg-error text-white font-medium rounded-xl hover:bg-error/90 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* SECTION: Account */}
          <div className="mb-8">
            <p className="text-xs font-medium text-gold tracking-wider uppercase mb-3">Account</p>
            <div className="bg-secondary border border-border rounded-xl overflow-hidden">
              {/* Account Type */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="text-sm text-foreground">Account Type</span>
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    isPremium
                      ? 'bg-gold/20 text-gold'
                      : 'bg-muted-foreground/20 text-muted-foreground'
                  }`}
                >
                  {isPremium ? 'Premium' : 'Free Tier'}
                </span>
              </div>

              {/* Manage Subscription */}
              {isPremium && (
                <ActionRow
                  label="Manage Subscription"
                  onClick={() => alert('Subscription management would open here')}
                />
              )}

              {/* Sign Out */}
              <div className="px-4">
                <ActionRow
                  label="Sign Out"
                  onClick={handleSignOut}
                  isDestructive
                  showChevron={false}
                />
              </div>

              {/* Delete Account */}
              <div className="px-4">
                <ActionRow
                  label="Delete Account"
                  onClick={handleDeleteAccount}
                  isDestructive
                  showChevron={false}
                />
              </div>
            </div>
          </div>

          {/* SECTION: Photo Retention */}
          <div className="mb-8">
            <p className="text-xs font-medium text-gold tracking-wider uppercase mb-3">Photo Retention</p>
            <div className="bg-secondary border border-border rounded-xl px-4">
              <p className="text-xs text-muted-foreground italic py-3 border-b border-border">
                Sculpt analyzes your photos to generate recommendations. You control how long they are stored.
              </p>
              <RadioRow
                label="Keep photos indefinitely"
                isSelected={settings.photoRetention === 'indefinite'}
                onClick={() => handlePhotoRetentionChange('indefinite')}
              />
              <RadioRow
                label="Auto-delete after 30 days"
                description="Selected by default"
                isSelected={settings.photoRetention === '30days'}
                onClick={() => handlePhotoRetentionChange('30days')}
              />
              <RadioRow
                label="Auto-delete after 7 days"
                isSelected={settings.photoRetention === '7days'}
                onClick={() => handlePhotoRetentionChange('7days')}
              />
              <RadioRow
                label="Delete photos immediately after analysis"
                isSelected={settings.photoRetention === 'immediate'}
                onClick={() => handlePhotoRetentionChange('immediate')}
              />
              <p className="text-xs text-muted-foreground/70 py-3">
                Deleting photos does not delete your recommendation history or preference profile.
              </p>
            </div>
          </div>

          {/* SECTION: AI Personalization */}
          <div className="mb-8">
            <p className="text-xs font-medium text-gold tracking-wider uppercase mb-3">AI Personalization</p>
            <div className="bg-secondary border border-border rounded-xl px-4">
              <ToggleRow
                label="Use feedback to improve recommendations"
                sublabel="Sculpt learns from your post-haircut ratings."
                value={settings.aiPersonalization.useFeedback}
                onChange={(v) => setAiPersonalization('useFeedback', v)}
              />
              <ToggleRow
                label="Include trend signals"
                sublabel="Allow seasonal and trending style data to influence recommendations."
                value={settings.aiPersonalization.includeTrends}
                onChange={(v) => setAiPersonalization('includeTrends', v)}
              />
              <ToggleRow
                label="Allow anonymous usage analytics"
                sublabel="Helps improve Sculpt's recommendation accuracy. No personal data shared."
                value={settings.aiPersonalization.allowAnalytics}
                onChange={(v) => setAiPersonalization('allowAnalytics', v)}
              />
            </div>
          </div>

          {/* SECTION: Notifications */}
          <div id="settings-section-notifications" className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-4 h-4 text-gold" />
              <p className="text-xs font-medium text-gold tracking-wider uppercase">Notifications</p>
            </div>
            <div className="bg-secondary border border-border rounded-xl px-4">
              <ToggleRow
                label="Maintenance reminders"
                sublabel="Receive alerts when your style may need a cleanup."
                value={settings.notifications.maintenanceReminders}
                onChange={(v) => setNotification('maintenanceReminders', v)}
              />
              <ToggleRow
                label="Trend updates"
                sublabel="Get notified about seasonal style trends tailored to you."
                value={settings.notifications.trendUpdates}
                onChange={(v) => setNotification('trendUpdates', v)}
                isPremium
                onClickPremium={() => navigateTo('paywall')}
                userIsPremium={isPremium}
              />
              <ToggleRow
                label="New recommendation available"
                sublabel="When your profile updates with new matching styles."
                value={settings.notifications.newRecommendations}
                onChange={(v) => setNotification('newRecommendations', v)}
              />
            </div>
          </div>

          {/* SECTION: Data Export Action */}
          <div className="mb-8">
            <div className="bg-secondary border border-border rounded-xl overflow-hidden">
              <ActionRow
                label="Export My Data"
                description="Download all your data"
                onClick={() => alert('Data export request sent. You will receive an email with your data within 48 hours.')}
              />
            </div>
          </div>

          {/* App Version */}
          <p className="text-xs text-muted-foreground text-center">
            Sculpt v1.0.0
          </p>
        </motion.div>
      </div>
    </div>
  )
}