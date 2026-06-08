"use client"

import { useRef } from "react"
import { motion } from "framer-motion"
import { useApp } from "@/lib/app-context"
import { ChevronLeft, Camera, CheckCircle, Trash2, Lock, Sparkles } from "lucide-react"

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
      // Create object URL for preview (in real app, would upload to storage)
      const url = URL.createObjectURL(file)
      onUpload(url)
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
  const { state, navigateTo, setUploadedImage, goBack } = useApp()
  const { uploadedImages } = state

  const hasFrontPhoto = !!uploadedImages.front
  const canProceed = hasFrontPhoto

  const handleAnalyze = () => {
    if (canProceed) {
      navigateTo('questionnaire-maintenance')
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
        <span className="text-sm text-muted-foreground">Step 1 of 3</span>
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
            Our vision model reads face geometry and density.
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

          {!canProceed && (
            <p className="text-xs text-muted-foreground text-center mt-3">
              Please upload required front photo to unlock analysis
            </p>
          )}
        </motion.div>
      </div>
    </div>
  )
}
