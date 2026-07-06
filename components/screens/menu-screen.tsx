"use client"

import { motion } from "framer-motion"
import { useApp } from "@/lib/app-context"
import { ChevronLeft, Settings, Crown, User, LogOut, Shield, Bell, HelpCircle, ChevronRight } from "lucide-react"

interface MenuItemProps {
  icon: React.ReactNode
  label: string
  value?: string
  onClick?: () => void
  isDestructive?: boolean
  badge?: string
}

function MenuItem({ icon, label, value, onClick, isDestructive, badge }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 py-3.5 border-b border-border last:border-0 hover:bg-secondary/50 transition-colors"
    >
      <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 text-left">
        <span className={`text-sm ${isDestructive ? 'text-error' : 'text-foreground'}`}>
          {label}
        </span>
      </div>
      {badge && (
        <span className="px-2 py-0.5 bg-gold/20 text-gold text-[10px] font-medium rounded-full">
          {badge}
        </span>
      )}
      {value && (
        <span className="text-xs text-muted-foreground">{value}</span>
      )}
      <ChevronRight className={`w-4 h-4 ${isDestructive ? 'text-error/50' : 'text-muted-foreground/50'}`} />
    </button>
  )
}

export function MenuScreen() {
  const { state, navigateTo, goBack, setUserSession, setSettingsScrollTo } = useApp()
  const { userSession, email, settings } = state
  const isPremium = userSession === 'premium'

  const handleSignOut = () => {
    setUserSession('guest')
    navigateTo('landing')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center px-4 md:px-6 py-3 border-b border-border">
        <button
          onClick={goBack}
          className="flex items-center gap-1 text-sm text-foreground hover:text-gold transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          BACK
        </button>
        <span className="flex-1 text-center text-sm font-semibold text-foreground">
          Menu
        </span>
        <div className="w-12" />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pt-4 pb-6">
        <div className="px-6 md:px-8 mx-auto w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Profile Card */}
          <div className="bg-secondary border border-border rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center">
                <span className="text-sm font-semibold text-gold">
                  {email ? email.charAt(0).toUpperCase() : 'G'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {email || 'Guest User'}
                </p>
                <span
                  className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded-full mt-1 ${
                    isPremium
                      ? 'bg-gold/20 text-gold'
                      : 'bg-muted-foreground/20 text-muted-foreground'
                  }`}
                >
                  {isPremium ? 'SCULPT PREMIUM' : 'FREE TIER'}
                </span>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="bg-secondary border border-border rounded-xl px-4 overflow-hidden mb-6">
            <MenuItem
              icon={<User className="w-4 h-4 text-gold" />}
              label="Profile"
              onClick={() => navigateTo('profile')}
            />
            <MenuItem
              icon={<Crown className="w-4 h-4 text-gold" />}
              label="Subscription"
              value={isPremium ? 'Active' : 'Free'}
              badge={!isPremium ? 'Upgrade' : undefined}
              onClick={() => navigateTo('paywall')}
            />
            <MenuItem
              icon={<Settings className="w-4 h-4 text-gold" />}
              label="Settings"
              onClick={() => navigateTo('settings')}
            />
            <MenuItem
              icon={<Bell className="w-4 h-4 text-gold" />}
              label="Notifications"
              value={settings.notifications.maintenanceReminders ? 'On' : 'Off'}
              onClick={() => {
                setSettingsScrollTo('notifications')
                navigateTo('settings')
              }}
            />
          </div>

          {/* Support & Legal */}
          <div className="bg-secondary border border-border rounded-xl px-4 overflow-hidden mb-6">
            <MenuItem
              icon={<HelpCircle className="w-4 h-4 text-gold" />}
              label="Help & Support"
              onClick={() => navigateTo('help-support')}
            />
            <MenuItem
              icon={<Shield className="w-4 h-4 text-gold" />}
              label="Privacy & Legal"
              onClick={() => navigateTo('privacy-legal')}
            />
          </div>

          {/* Sign Out */}
          <div className="bg-secondary border border-border rounded-xl px-4 overflow-hidden">
            <MenuItem
              icon={<LogOut className="w-4 h-4 text-error" />}
              label="Sign Out"
              onClick={handleSignOut}
              isDestructive
            />
          </div>
        </motion.div>
        </div>
      </div>
    </div>
  )
}
