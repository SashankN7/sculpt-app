"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useApp } from "@/lib/app-context"
import { ChevronLeft, Camera, Plus, Clock, TrendingUp, Trash2, X } from "lucide-react"
import type { ProgressPhoto } from "@/lib/types"

const GROWTH_STAGES = {
  fresh: { label: "Fresh Cut", color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/30", emoji: "✨" },
  growing: { label: "Growing Out", color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/30", emoji: "🌱" },
  "needs-trim": { label: "Needs Trim", color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/30", emoji: "✂️" },
  overgrown: { label: "Overgrown", color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/30", emoji: "🌿" },
} as const

function GrowthStageIndicator({ stage, date }: { stage: ProgressPhoto["growthStage"]; date: string }) {
  const config = GROWTH_STAGES[stage]
  const daysSince = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full ${config.bg} ${config.border} border`}>
      <span className="text-xs">{config.emoji}</span>
      <span className={`text-[10px] font-medium ${config.color}`}>{config.label}</span>
      {daysSince > 0 && (
        <span className="text-[9px] text-muted-foreground">· {daysSince}d ago</span>
      )}
    </div>
  )
}

function PhotoCard({ photo, onDelete }: { photo: ProgressPhoto; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-secondary border border-border rounded-xl overflow-hidden"
      >
        <div className="relative aspect-[4/3] bg-background">
          {photo.imageUrl.startsWith("data:") ? (
            <img src={photo.imageUrl} alt="Progress" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Camera className="w-8 h-8 text-muted-foreground/30" />
            </div>
          )}
          <button
            onClick={() => onDelete(photo.id)}
            className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            <Trash2 className="w-3 h-3 text-white" />
          </button>
        </div>
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <GrowthStageIndicator stage={photo.growthStage} date={photo.date} />
            <span className="text-[10px] text-muted-foreground">
              {new Date(photo.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </div>
          {photo.haircutName && (
            <p className="text-xs font-medium text-foreground mb-0.5">{photo.haircutName}</p>
          )}
          {photo.notes && (
            <p className="text-[10px] text-muted-foreground line-clamp-2">{photo.notes}</p>
          )}
        </div>
      </motion.div>

      {/* Expanded view */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setExpanded(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-sm w-full"
            >
              <img src={photo.imageUrl} alt="Progress" className="w-full rounded-xl" />
              <button
                onClick={() => setExpanded(false)}
                className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function UploadPhotoModal({ onClose, onSave }: { onClose: () => void; onSave: (photo: Omit<ProgressPhoto, "id">) => void }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [growthStage, setGrowthStage] = useState<ProgressPhoto["growthStage"]>("fresh")
  const [notes, setNotes] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      setImageUrl(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    if (!imageUrl) return
    onSave({
      imageUrl,
      date: new Date().toISOString(),
      growthStage,
      notes,
    })
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-secondary border-t border-border rounded-t-2xl w-full max-w-md max-h-[80vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-foreground">Add Progress Photo</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center hover:bg-gold/30 transition-colors">
            <X className="w-4 h-4 text-gold" />
          </button>
        </div>

        {/* Photo upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {imageUrl ? (
          <div className="relative mb-4 rounded-xl overflow-hidden">
            <img src={imageUrl} alt="Preview" className="w-full aspect-[4/3] object-cover" />
            <button
              onClick={() => setImageUrl(null)}
              className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-[4/3] border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 hover:border-gold/40 transition-colors mb-4"
          >
            <Camera className="w-8 h-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Tap to upload photo</p>
          </button>
        )}

        {/* Growth stage selector */}
        <p className="text-xs font-medium text-foreground mb-2">Growth Stage</p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {(Object.keys(GROWTH_STAGES) as Array<ProgressPhoto["growthStage"]>).map((stage) => {
            const config = GROWTH_STAGES[stage]
            return (
              <button
                key={stage}
                onClick={() => setGrowthStage(stage)}
                className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
                  growthStage === stage
                    ? `${config.bg} ${config.border}`
                    : "bg-secondary border-border hover:border-muted-foreground/50"
                }`}
              >
                <span className="text-base">{config.emoji}</span>
                <span className={`text-xs font-medium ${growthStage === stage ? config.color : "text-muted-foreground"}`}>
                  {config.label}
                </span>
              </button>
            )
          })}
        </div>

        {/* Notes */}
        <p className="text-xs font-medium text-foreground mb-2">Notes (optional)</p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How's the style looking? Any observations..."
          className="w-full h-16 px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground resize-none mb-4"
        />

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={!imageUrl}
          className="w-full py-3 px-6 bg-gold text-gold-foreground font-semibold rounded-xl hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save Progress Photo
        </button>
      </motion.div>
    </motion.div>
  )
}

export function ProgressTrackerScreen() {
  const { state, goBack, addProgressPhoto, removeProgressPhoto } = useApp()
  const { progressPhotos, gamification } = state

  const [showUpload, setShowUpload] = useState(false)
  // Sort photos by date (newest first)
  const sortedPhotos = [...progressPhotos].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const handleSavePhoto = (photoData: Omit<ProgressPhoto, "id">) => {
    const newPhoto: ProgressPhoto = {
      ...photoData,
      id: `progress-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    }
    addProgressPhoto(newPhoto)
  }

  const handleDeletePhoto = (id: string) => {
    removeProgressPhoto(id)
  }

  // Calculate growth timeline
  const latestPhoto = sortedPhotos[0]
  const oldestPhoto = sortedPhotos[sortedPhotos.length - 1]

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

      <div className="flex-1 pt-2 pb-6 overflow-y-auto mx-auto w-full max-w-2xl">
        <div className="px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Title */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-gold" />
              <h2 className="text-xl font-semibold text-foreground">Hair Journey</h2>
            </div>
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gold/10 border border-gold/30 rounded-lg text-gold text-xs font-medium hover:bg-gold/15 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Photo
            </button>
          </div>

          {/* Stats */}
          {sortedPhotos.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="grid grid-cols-3 gap-2 mb-6"
            >
              <div className="bg-secondary border border-border rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-gold">{sortedPhotos.length}</p>
                <p className="text-[10px] text-muted-foreground">Photos</p>
              </div>
              <div className="bg-secondary border border-border rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-foreground">
                  {oldestPhoto && latestPhoto
                    ? Math.floor((new Date(latestPhoto.date).getTime() - new Date(oldestPhoto.date).getTime()) / (1000 * 60 * 60 * 24))
                    : 0}
                </p>
                <p className="text-[10px] text-muted-foreground">Days Tracked</p>
              </div>
              <div className="bg-secondary border border-border rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-green-400">
                  {GROWTH_STAGES[latestPhoto?.growthStage || "fresh"].label.split(" ")[0]}
                </p>
                <p className="text-[10px] text-muted-foreground">Current</p>
              </div>
            </motion.div>
          )}

          {/* Growth Timeline */}
          {sortedPhotos.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-secondary border border-border rounded-xl p-4 mb-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-gold" />
                <p className="text-[10px] font-medium text-gold tracking-wider uppercase">GROWTH TIMELINE</p>
              </div>
              <div className="flex items-center gap-1 overflow-x-auto pb-1">
                {sortedPhotos.map((photo, i) => (
                  <div key={photo.id} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      i === 0 ? "border-gold bg-gold/10" : "border-border bg-secondary"
                    }`}>
                      <span className="text-xs">{GROWTH_STAGES[photo.growthStage].emoji}</span>
                    </div>
                    {i < sortedPhotos.length - 1 && (
                      <div className="w-6 h-px bg-border" />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[9px] text-muted-foreground">
                  {new Date(oldestPhoto.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
                <span className="text-[9px] text-muted-foreground">Now</span>
              </div>
            </motion.div>
          )}

          {/* Photo Grid */}
          {sortedPhotos.length > 0 ? (
            <div className="space-y-3">
              {sortedPhotos.map((photo) => (
                <PhotoCard key={photo.id} photo={photo} onDelete={handleDeletePhoto} />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 rounded-full bg-secondary border border-border flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-base font-medium text-foreground mb-2">Start Your Hair Journey</h3>
              <p className="text-xs text-muted-foreground max-w-[260px] mx-auto mb-6">
                Upload progress photos between haircuts to track how your style grows out. The AI will analyze your growth stage.
              </p>
              <button
                onClick={() => setShowUpload(true)}
                className="px-6 py-3 bg-gold text-gold-foreground font-semibold rounded-xl hover:bg-gold/90 transition-colors"
              >
                Add First Photo
              </button>
            </motion.div>
          )}

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-6 bg-gold/5 border border-gold/20 rounded-xl p-4"
          >
            <p className="text-[10px] font-medium text-gold tracking-wider uppercase mb-2">WHY TRACK YOUR HAIR?</p>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-gold mt-0.5">•</span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="text-foreground font-medium">AI trim timing</span> — after 3+ photos, get personalized alerts for your optimal next cut date
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-gold mt-0.5">•</span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="text-foreground font-medium">Growth pattern insights</span> — AI learns your growth rate and suggests the best time to book your barber
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-gold mt-0.5">•</span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="text-foreground font-medium">Unlock exclusive badges</span> — earn Documentarian (3 photos) and Hair Historian (10 photos) achievements
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-gold mt-0.5">•</span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="text-foreground font-medium">Visual timeline</span> — see your hair journey from fresh cut to overgrown and share your progress
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-gold mt-0.5">•</span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="text-foreground font-medium">Barber proof</span> — show your barber exactly how your last cut grew out for better results next time
                </p>
              </div>
            </div>
            {progressPhotos.length >= 3 && (
              <div className="mt-3 pt-3 border-t border-gold/20">
                <div className="flex items-center gap-2">
                  <span className="text-sm">📸</span>
                  <p className="text-xs text-foreground font-medium">AI Insight Available!</p>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">With {progressPhotos.length} photos logged, your AI can now predict your optimal next trim date and growth patterns.</p>
              </div>
            )}
          </motion.div>
        </motion.div>
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <UploadPhotoModal onClose={() => setShowUpload(false)} onSave={handleSavePhoto} />
        )}
      </AnimatePresence>
    </div>
  )
}
