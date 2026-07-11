"use client"

import { useRef, useState } from "react"
import { motion } from "framer-motion"
import { useApp } from "@/lib/app-context"
import { processUploadedImage } from "@/lib/image-utils"
import { track } from "@/lib/posthog"
import { ChevronLeft, Camera, CheckCircle, Trash2, Lock, Sparkles, Settings, Sun, AlertTriangle, Crown } from "lucide-react"

interface UploadCardProps {
  label: string
  description: string
  isRequired?: boolean
  imageUrl: string | null
  onUpload: (url: string) => void
  onClear: () => void
}

function UploadCard({ label, description, isRequired, imageUrl, onUpload, onClear }: UploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setProcessing(true)
    try {
      const dataUrl = await processUploadedImage(file)
      onUpload(dataUrl)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to process image'
      setError(message)
    } finally {
      setProcessing(false)
      // Reset input so same file can be re-selected
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const handleClick = () => {
    inputRef.current?.click()
  }

  if (imageUrl) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-secondary border border-border rounded-xl p-4 overflow-hidden"
      >
        <div className="flex items-start gap-3">
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-background flex-shrink-0">
            <img 
              src={imageUrl} 
              alt={label}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-success mb-1">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Upload complete!</span>
            </div>
            <button
              onClick={onClear}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Tap to clear image
            </button>
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          className="hidden"
        />
      </motion.div>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={processing}
      className="w-full bg-secondary border border-border rounded-xl p-4 text-left hover:border-gold/30 transition-colors group"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center text-muted-foreground group-hover:text-gold transition-colors">
          <Camera className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground mb-0.5">
            {label} {isRequired ? <span className="text-gold">(Required)</span> : <span className="text-muted-foreground">(Optional)</span>}
          </p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {processing && (
        <div className="mt-2 flex items-center gap-2 text-xs text-gold">
          <div className="w-3 h-3 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          Processing image...
        </div>
      )}
      {error && (
        <div className="mt-2 flex items-start gap-2 text-xs text-error">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />
    </button>
  )
}

export function UploadScreen() {
  const { state, navigateTo, setUploadedImage, goBack, incrementScanCount, canScan, scansRemaining } = useApp()
  const { uploadedImages, userSession } = state
  const isPremium = userSession === 'premium'
  const isTrial = userSession === 'trial'
  const scansLeft = scansRemaining()
  const userCanScan = canScan()

  const hasFrontPhoto = !!uploadedImages.front
  const canProceed = hasFrontPhoto && userCanScan

  const handleAnalyze = () => {
    if (canProceed) {
      track('analysis_started', { has_front: !!uploadedImages.front, has_side: !!uploadedImages.side, has_hairline: !!uploadedImages.hairline })
      incrementScanCount()
      navigateTo('questionnaire-1')
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-2">
        <button 
          onClick={goBack}
          className="flex items-center gap-1 text-sm text-foreground hover:text-gold transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          BACK
        </button>
        <button
          onClick={() => navigateTo('menu')}
          className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center hover:bg-muted transition-colors"
        >
          <Settings className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="flex-1 pt-4 pb-6 overflow-y-auto">
        <div className="px-6 md:px-8 mx-auto w-full max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Title */}
          <h2 className="text-xl font-semibold text-foreground mb-2">
            UPLOAD YOUR PHOTOS
          </h2>
          <p className="text-sm text-muted-foreground mb-2">
            {isPremium
              ? 'AI-powered analysis reads face geometry and density from your photos.'
              : 'Upload your photos, then complete a questionnaire for personalized recommendations.'}
          </p>

          {/* Free tier photo analysis limitation banner */}
          {!isPremium && !isTrial && (
            <div className="mb-5 p-3 bg-gradient-to-r from-orange-400/15 to-orange-400/5 border-2 border-orange-400/40 rounded-xl">
              <div className="flex items-center gap-2 mb-1.5">
                <AlertTriangle className="w-4 h-4 text-orange-400 flex-shrink-0" />
                <p className="text-[11px] font-bold text-orange-400 uppercase tracking-wide">Photos Won't Be Analyzed by AI</p>
              </div>
              <p className="text-[11px] text-foreground leading-relaxed mb-2">
                On the free plan, your photos are <span className="font-bold">not processed by AI</span>. Recommendations are generated from your questionnaire answers only — no face shape, hair density, or texture detection.
              </p>
              <button
                onClick={() => navigateTo('paywall')}
                className="flex items-center justify-center gap-1.5 w-full py-2 bg-gold text-gold-foreground text-[11px] font-bold rounded-lg hover:bg-gold/90 transition-colors"
              >
                <Crown className="w-3.5 h-3.5" />
                UPGRADE FOR AI PHOTO ANALYSIS
              </button>
            </div>
          )}

          <div className="mb-6" />

          {/* Upload Cards */}
          <div className="space-y-3 mb-8">
            <UploadCard
              label="FRONT PHOTO"
              description="Tap to open camera or camera roll"
              isRequired
              imageUrl={uploadedImages.front}
              onUpload={(url) => setUploadedImage('front', url)}
              onClear={() => setUploadedImage('front', null)}
            />

            <UploadCard
              label="SIDE PROFILE"
              description="Locks secondary recommendations"
              imageUrl={uploadedImages.side}
              onUpload={(url) => setUploadedImage('side', url)}
              onClear={() => setUploadedImage('side', null)}
            />

            <UploadCard
              label="HAIRLINE WINDOW"
              description="Unlocks recession/thinning risk assessment"
              imageUrl={uploadedImages.hairline}
              onUpload={(url) => setUploadedImage('hairline', url)}
              onClear={() => setUploadedImage('hairline', null)}
            />
          </div>

          {/* Lighting Guidance Banner */}
          <div className="flex items-start gap-2.5 p-3 bg-secondary border border-gold/20 rounded-xl mb-6">
            <Sun className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Best results: natural light, neutral background, no hat or glasses.
            </p>
          </div>

          {/* Photo Tips */}
          <div className="mb-6">
            <p className="text-[10px] font-medium text-gold tracking-wider uppercase mb-2">PHOTO TIPS</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-secondary border border-success/30 rounded-xl p-3">
                <div className="w-full h-16 bg-background rounded-lg flex items-center justify-center mb-2 border border-success/20">
                  <div className="text-center">
                    <div className="w-8 h-8 mx-auto rounded-full bg-success/10 flex items-center justify-center mb-1">
                      <svg className="w-4 h-4 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /></svg>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-success font-medium">Good photo</p>
                <p className="text-[9px] text-muted-foreground leading-relaxed">Front-facing, even natural light, neutral background</p>
              </div>
              <div className="bg-secondary border border-error/30 rounded-xl p-3">
                <div className="w-full h-16 bg-background rounded-lg flex items-center justify-center mb-2 border border-error/20">
                  <div className="text-center">
                    <div className="w-8 h-8 mx-auto rounded-full bg-error/10 flex items-center justify-center mb-1">
                      <svg className="w-4 h-4 text-error" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><line x1="4" y1="4" x2="20" y2="20" /></svg>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-error font-medium">Avoid</p>
                <p className="text-[9px] text-muted-foreground leading-relaxed">Shadows, hat/glasses, blurry, extreme angles</p>
              </div>
            </div>
          </div>

          {/* Analyze Button */}
          <motion.button
            onClick={handleAnalyze}
            disabled={!canProceed}
            className={`flex items-center justify-center gap-2 w-full py-4 px-6 font-semibold rounded-xl transition-all ${
              canProceed 
                ? 'bg-gold text-gold-foreground hover:bg-gold/90' 
                : 'bg-secondary text-muted-foreground'
            }`}
            whileTap={canProceed ? { scale: 0.98 } : {}}
          >
            {canProceed ? (
              <>
                <Sparkles className="w-5 h-5" />
                ANALYZE MY PHOTOS
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                ANALYZE MY PHOTOS
              </>
            )}
          </motion.button>

          {!hasFrontPhoto && (
            <p className="text-xs text-muted-foreground text-center mt-3">
              Please upload a front photo to unlock analysis
            </p>
          )}

          {!isPremium && !isTrial && scansLeft <= 0 && (
            <div className="mt-4 p-3 bg-gold/10 border border-gold/30 rounded-xl text-center">
              <p className="text-xs font-medium text-gold mb-1">Daily scan limit reached</p>
              <p className="text-[10px] text-muted-foreground mb-2">Upgrade to Premium for unlimited scans and AI-powered analysis.</p>
              <button
                onClick={() => navigateTo('paywall')}
                className="px-3 py-1.5 bg-gold text-gold-foreground text-[11px] font-medium rounded-lg hover:bg-gold/90 transition-colors"
              >
                Upgrade to Premium
              </button>
            </div>
          )}

          {!isPremium && !isTrial && scansLeft > 0 && (
            <div className="mt-4 p-3 bg-gold/10 border border-gold/30 rounded-xl text-center">
              <p className="text-[11px] font-bold text-gold">{scansLeft} scan{scansLeft !== 1 ? 's' : ''} remaining today</p>
            </div>
          )}

          {(isPremium || isTrial) && (
            <p className="text-[10px] text-gold/50 text-center mt-4">
              AI-powered analysis with GPT-4o Vision · Unlimited scans
            </p>
          )}
        </motion.div>
        </div>
      </div>
    </div>
  )
}
