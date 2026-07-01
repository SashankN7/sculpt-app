"use client"

import { useRef } from "react"
import { motion } from "framer-motion"
import { useApp } from "@/lib/app-context"
import { ChevronLeft, Camera, CheckCircle, Trash2, Lock, Sparkles, Settings, Sun, Crown } from "lucide-react"

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        onUpload(result)
      }
      reader.readAsDataURL(file)
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
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </motion.div>
    )
  }

  return (
    <button
      onClick={handleClick}
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
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </button>
  )
}

export function UploadScreen() {
  const { state, navigateTo, setUploadedImage, goBack, canScan, scansRemaining, incrementScanCount } = useApp()
  const { uploadedImages, userSession } = state
  const isPremium = userSession === 'premium'

  const hasFrontPhoto = !!uploadedImages.front
  const scanAvailable = canScan()
  const remaining = scansRemaining()
  const canProceed = hasFrontPhoto && scanAvailable

  const handleAnalyze = () => {
    if (canProceed) {
      incrementScanCount()
      navigateTo('questionnaire-1')
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2">
        <button 
          onClick={goBack}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          BACK
        </button>
        <div className="flex items-center gap-2">
          {/* Scan Counter */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium ${
            isPremium
              ? 'bg-gold/10 border border-gold/30 text-gold'
              : 'bg-secondary border border-border text-muted-foreground'
          }`}>
            {isPremium && <Crown className="w-3 h-3" />}
            <span>{remaining} scan{remaining !== 1 ? 's' : ''} left</span>
          </div>
          <button
            onClick={() => navigateTo('menu')}
            className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center hover:bg-muted transition-colors"
          >
            <Settings className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="flex-1 px-6 pt-4 pb-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Title */}
          <h2 className="text-xl font-semibold text-foreground mb-2">
            UPLOAD YOUR PHOTOS
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            {isPremium
              ? 'AI-powered analysis reads face geometry and density from your photos.'
              : 'Our analysis reads face geometry and density from your photos.'}
          </p>

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

          {!scanAvailable && !isPremium && (
            <div className="mt-3 space-y-2">
              <p className="text-xs text-error text-center">
                Daily scan limit reached. Resets tomorrow.
              </p>
              <button
                onClick={() => navigateTo('paywall')}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gold/10 border border-gold/30 rounded-xl text-xs font-medium text-gold hover:bg-gold/15 transition-colors"
              >
                <Crown className="w-3.5 h-3.5" />
                Upgrade to Premium — 10 scans/day
              </button>
            </div>
          )}

          {!hasFrontPhoto && scanAvailable && (
            <p className="text-xs text-muted-foreground text-center mt-3">
              Please upload a front photo to unlock analysis
            </p>
          )}

          {/* Tier info */}
          {!isPremium && scanAvailable && (
            <p className="text-[10px] text-muted-foreground/50 text-center mt-4">
              Unlimited scans · Premium unlocks AI-powered analysis
            </p>
          )}

          {isPremium && (
            <p className="text-[10px] text-gold/50 text-center mt-4">
              Premium tier: AI-powered analysis with GPT-4o Vision
            </p>
          )}
        </motion.div>
      </div>
    </div>
  )
}
