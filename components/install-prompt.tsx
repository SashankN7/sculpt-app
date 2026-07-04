"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Download, X } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Check if already in standalone/PWA mode
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window.navigator as any).standalone === true

    if (isStandalone) return

    // Check if user dismissed the banner before
    try {
      const dismissed = localStorage.getItem('sculpt_install_dismissed')
      if (dismissed) {
        const dismissedDate = new Date(dismissed)
        const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24)
        // Show again after 7 days
        if (daysSinceDismissed < 7) return
      }
    } catch { /* silently fail */ }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Show banner after a delay so it doesn't feel aggressive
      setTimeout(() => setShowBanner(true), 3000)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShowBanner(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowBanner(false)
    setIsDismissed(true)
    try {
      localStorage.setItem('sculpt_install_dismissed', new Date().toISOString())
    } catch { /* silently fail */ }
  }

  if (!showBanner || isDismissed) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
      >
        <div className="mx-auto w-full max-w-lg bg-card border border-gold/30 rounded-2xl p-4 shadow-lg shadow-black/40 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
              <Download className="w-5 h-5 text-gold" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground mb-0.5">
                Install SCULPT
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Add to your home screen for instant access — no browser needed.
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleInstall}
              className="flex-1 py-2.5 px-4 bg-gold text-gold-foreground text-sm font-semibold rounded-xl hover:bg-gold/90 transition-colors"
            >
              Install App
            </button>
            <button
              onClick={handleDismiss}
              className="py-2.5 px-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
