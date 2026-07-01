"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useApp } from "@/lib/app-context"
import { createClient } from "@/lib/supabase"
import { ChevronLeft, Mail, Loader2, Lock } from "lucide-react"

export function AuthScreen() {
  const { navigateTo, setUserSession, setEmail, goBack } = useApp()
  const [emailInput, setEmailInput] = useState("")
  const [password, setPassword] = useState("")
  const [isSignUp, setIsSignUp] = useState(true)
  const [isValidEmail, setIsValidEmail] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    setIsValidEmail(emailRegex.test(value))
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmailInput(value)
    validateEmail(value)
    setError(null)
  }

  const handleSubmit = async () => {
    if (!isValidEmail || password.length < 6) return
    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()

      if (isSignUp) {
        // Sign up with email/password
        const { error: signUpError } = await supabase.auth.signUp({
          email: emailInput,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        })

        if (signUpError) {
          setError(signUpError.message)
          setIsSubmitting(false)
          return
        }

        // Check if user was created (auto-confirm enabled) or needs email verification
        const { data: { session } } = await supabase.auth.getSession()

        if (session) {
          setEmail(emailInput)
          setUserSession('authenticated')
          setShowSuccess(true)
          await new Promise(resolve => setTimeout(resolve, 600))
          navigateTo('dashboard')
        } else {
          // Email confirmation required
          setError("Check your email for a confirmation link!")
          setIsSubmitting(false)
        }
      } else {
        // Sign in with email/password
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: emailInput,
          password,
        })

        if (signInError) {
          setError(signInError.message)
          setIsSubmitting(false)
          return
        }

        setEmail(emailInput)
        setUserSession('authenticated')
        setShowSuccess(true)
        await new Promise(resolve => setTimeout(resolve, 600))
        navigateTo('dashboard')
      }
    } catch {
      setError('Authentication failed. Please try again.')
      setIsSubmitting(false)
    }
  }

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      })

      if (error) {
        setError(`Failed to sign in with ${provider}. ${error.message}`)
        setIsSubmitting(false)
      }
      // OAuth redirects automatically on success
    } catch {
      setError(`Failed to sign in with ${provider}. Please try again.`)
      setIsSubmitting(false)
    }
  }

  const handleGuestBypass = () => {
    setUserSession('guest')
    navigateTo('upload')
  }

  const canSubmit = isValidEmail && password.length >= 6

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center px-4 py-2">
        <button
          onClick={goBack}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          BACK
        </button>
      </div>

      <div className="flex-1 px-6 pt-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Title */}
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {isSignUp ? 'CREATE YOUR ACCOUNT' : 'WELCOME BACK'}
          </h2>
          <p className="text-sm text-muted-foreground mb-8">
            {isSignUp
              ? 'Save your haircut evolution profile over time.'
              : 'Sign in to access your saved recommendations.'
            }
          </p>

          {/* Email Input */}
          <div className="relative mb-3">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Mail className="w-5 h-5" />
            </div>
            <input
              type="email"
              value={emailInput}
              onChange={handleEmailChange}
              placeholder="Enter email address"
              className="w-full pl-12 pr-4 py-4 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
            />
          </div>

          {/* Password Input */}
          <div className="relative mb-4">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Lock className="w-5 h-5" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError(null)
              }}
              placeholder="Password (min 6 characters)"
              className="w-full pl-12 pr-4 py-4 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
            />
          </div>

          {/* Error message */}
          {error && (
            <p className="text-xs text-error mb-4">{error}</p>
          )}

          {/* Toggle Sign In / Sign Up */}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError(null)
            }}
            className="text-xs text-gold mb-6 hover:underline"
          >
            {isSignUp
              ? "Already have an account? Sign in"
              : "Don't have an account? Sign up"
            }
          </button>

          {/* OAuth Buttons */}
          <button
            onClick={() => handleOAuth('google')}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-secondary border border-border rounded-xl text-foreground font-medium mb-3 hover:bg-secondary/80 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <button
            onClick={() => handleOAuth('apple')}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-secondary border border-border rounded-xl text-foreground font-medium mb-6 hover:bg-secondary/80 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Continue with Apple
          </button>

          {/* Terms */}
          <p className="text-xs text-muted-foreground text-center mb-4">
            By continuing, you agree to our Terms of Service.
          </p>

          {/* Guest Option */}
          <button
            onClick={handleGuestBypass}
            className="w-full py-3 px-6 border border-gold/40 text-gold font-medium rounded-xl hover:bg-gold/5 transition-colors mb-4"
          >
            Continue as Guest
          </button>
          <p className="text-[10px] text-muted-foreground/50 text-center mb-6">
            Guest sessions are temporary. Create an account to save your results.
          </p>

          {/* Continue with Email Button */}
          <motion.button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className={`relative w-full py-4 px-6 font-semibold rounded-xl transition-all overflow-hidden ${
              canSubmit
                ? 'bg-gold text-gold-foreground hover:bg-gold/90'
                : 'bg-secondary text-muted-foreground opacity-40'
            }`}
            whileTap={canSubmit ? { scale: 0.98 } : {}}
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : showSuccess ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center justify-center"
              >
                <svg className="w-6 h-6 text-gold-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <motion.path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </svg>
              </motion.div>
            ) : (
              <span className="flex items-center justify-center gap-2">
                {isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'}
                <ChevronLeft className="w-4 h-4 rotate-180" />
              </span>
            )}
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}
