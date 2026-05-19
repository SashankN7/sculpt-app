"use client"

import { motion } from "framer-motion"
import { useApp } from "@/lib/app-context"
import { Zap } from "lucide-react"

export function LandingScreen() {
  const { navigateTo, setUserSession } = useApp()

  const handleStartAnalysis = () => {
    navigateTo('auth')
  }

  const handleGuestBypass = () => {
    setUserSession('guest')
    navigateTo('upload')
  }

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center"
      >
        {/* Logo */}
        <motion.h1 
          className="text-4xl font-bold tracking-[0.3em] text-foreground mb-2"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          SCULPT
        </motion.h1>
        <motion.div 
          className="w-16 h-0.5 bg-gold mb-10"
          initial={{ width: 0 }}
          animate={{ width: 64 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        />

        {/* Tagline */}
        <motion.p 
          className="text-lg text-muted-foreground mb-16 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {'"Find the haircut that'}
          <br />
          {'actually fits you."'}
        </motion.p>

        {/* CTA Button */}
        <motion.button
          onClick={handleStartAnalysis}
          className="flex items-center justify-center gap-2 w-full max-w-[240px] py-4 px-6 bg-gold text-gold-foreground font-semibold rounded-xl transition-all hover:bg-gold/90 active:scale-[0.98]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          whileTap={{ scale: 0.98 }}
        >
          <Zap className="w-5 h-5" />
          START ANALYSIS
        </motion.button>

        {/* Guest Link */}
        <motion.button
          onClick={handleGuestBypass}
          className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.4 }}
        >
          Continue as Guest
        </motion.button>

        {/* Subtext */}
        <motion.p 
          className="mt-12 text-xs text-muted-foreground/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
        >
          No account required to get started
        </motion.p>
      </motion.div>
    </div>
  )
}
