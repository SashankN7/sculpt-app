"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useApp } from "@/lib/app-context"
import { createClient } from "@/lib/supabase"
import { User, MapPin, Calendar, Loader2, ChevronLeft } from "lucide-react"

export function ProfileSetupScreen() {
  const { navigateTo, setProfile } = useApp()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [location, setLocation] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = firstName.trim().length > 0 && lastName.trim().length > 0

  const handleSubmit = async () => {
    if (!canSubmit) return
    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { error: upsertError } = await supabase
          .from("user_profiles")
          .upsert(
            {
              user_id: user.id,
              email: user.email,
              first_name: firstName.trim(),
              last_name: lastName.trim(),
              location: location.trim() || null,
              date_of_birth: dateOfBirth || null,
              profile_complete: true,
            },
            { onConflict: "user_id" }
          )

        if (upsertError) {
          console.error("Profile save error:", upsertError)
        }
      }

      // Save to local state
      setProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        location: location.trim(),
        dateOfBirth,
        profileComplete: true,
      })

      await new Promise((r) => setTimeout(r, 400))
      navigateTo("dashboard")
    } catch {
      // Even if Supabase fails, let the user continue
      setProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        location: location.trim(),
        dateOfBirth,
        profileComplete: true,
      })
      await new Promise((r) => setTimeout(r, 400))
      navigateTo("dashboard")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center px-4 md:px-6 py-2">
        <button
          onClick={() => navigateTo('dashboard')}
          className="flex items-center gap-1 text-sm text-foreground hover:text-gold transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          SKIP
        </button>
      </div>

      <div className="flex-1 pt-4 pb-6 overflow-y-auto mx-auto w-full max-w-lg">
        <div className="px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Title */}
          <h2 className="text-xl font-semibold text-foreground mb-2">
            COMPLETE YOUR PROFILE
          </h2>
          <p className="text-sm text-muted-foreground mb-8">
            Help us personalize your experience. You can always update this later.
          </p>

          {/* First Name */}
          <div className="mb-4">
            <label className="text-xs font-medium text-gold tracking-wider uppercase mb-2 block">
              First Name *
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value)
                  setError(null)
                }}
                placeholder="Enter first name"
                className="w-full pl-12 pr-4 py-4 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
              />
            </div>
          </div>

          {/* Last Name */}
          <div className="mb-4">
            <label className="text-xs font-medium text-gold tracking-wider uppercase mb-2 block">
              Last Name *
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value)
                  setError(null)
                }}
                placeholder="Enter last name"
                className="w-full pl-12 pr-4 py-4 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
              />
            </div>
          </div>

          {/* Location (optional) */}
          <div className="mb-4">
            <label className="text-xs font-medium text-gold tracking-wider uppercase mb-2 block">
              Location
              <span className="text-muted-foreground ml-1 normal-case tracking-normal">(optional)</span>
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                <MapPin className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City or region"
                className="w-full pl-12 pr-4 py-4 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
              />
            </div>
          </div>

          {/* Date of Birth (optional) */}
          <div className="mb-6">
            <label className="text-xs font-medium text-gold tracking-wider uppercase mb-2 block">
              Date of Birth
              <span className="text-muted-foreground ml-1 normal-case tracking-normal">(optional)</span>
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Calendar className="w-5 h-5" />
              </div>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Error message */}
          {error && (
            <p className="text-xs text-error mb-4">{error}</p>
          )}

          {/* Continue Button */}
          <motion.button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className={`relative w-full py-4 px-6 font-semibold rounded-xl transition-all overflow-hidden ${
              canSubmit
                ? "bg-gold text-gold-foreground hover:bg-gold/90"
                : "bg-secondary text-muted-foreground opacity-40"
            }`}
            whileTap={canSubmit ? { scale: 0.98 } : {}}
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              <span className="flex items-center justify-center gap-2">
                CONTINUE
                <ChevronLeft className="w-4 h-4 rotate-180" />
              </span>
            )}
          </motion.button>

          <p className="mt-4 text-[10px] text-muted-foreground/50 text-center">
            Your profile helps us tailor recommendations to your age group and location.
          </p>
        </motion.div>
        </div>
      </div>
    </div>
  )
}
