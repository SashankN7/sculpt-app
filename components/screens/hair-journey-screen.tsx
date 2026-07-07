"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useApp } from "@/lib/app-context"
import { ChevronLeft, Camera, Plus, Clock, TrendingUp, Trash2, X, Scissors, MessageSquare, Calendar } from "lucide-react"
import type { ProgressPhoto, LoggedCut } from "@/lib/types"

const GROWTH_STAGES = {
  fresh: { label: "Fresh Cut", color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/30", emoji: "✨" },
  growing: { label: "Growing Out", color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/30", emoji: "🌱" },
  "needs-trim": { label: "Needs Trim", color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/30", emoji: "✂️" },
  overgrown: { label: "Overgrown", color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/30", emoji: "🌿" },
} as const

// Unified timeline entry type
type TimelineEntry =
  | { type: "cut"; data: LoggedCut; date: Date }
  | { type: "photo"; data: ProgressPhoto; date: Date }

function formatDate(isoDate: string): string {
  const d = new Date(isoDate)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined })
}

function formatFullDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  })
}

// ── Cut Card ──
function CutCard({ cut, onDelete }: { cut: LoggedCut; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-secondary border border-orange-400/20 rounded-xl overflow-hidden"
    >
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left">
        <div className="flex items-start gap-3 p-3.5">
          <div className="w-14 h-14 rounded-lg bg-background border border-border overflow-hidden flex-shrink-0">
            {cut.photoUrl ? (
              <img src={cut.photoUrl} alt={cut.hairstyleName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Scissors className="w-5 h-5 text-orange-400" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Scissors className="w-3 h-3 text-orange-400" />
              <span className="text-[9px] font-medium text-orange-400 tracking-wider uppercase">LOGGED CUT</span>
            </div>
            <p className="text-sm font-semibold text-foreground truncate">{cut.hairstyleName}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-3 h-3 text-muted-foreground" />
              <p className="text-[11px] text-muted-foreground">{formatDate(cut.date)}</p>
            </div>
            {cut.notes && !expanded && (
              <div className="flex items-center gap-1 mt-1">
                <MessageSquare className="w-3 h-3 text-gold" />
                <p className="text-[10px] text-gold truncate">{cut.notes}</p>
              </div>
            )}
          </div>
          <ChevronLeft className={`w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 mt-1 ${expanded ? "-rotate-90" : "rotate-90"}`} />
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-3.5 pb-3.5 pt-0 border-t border-border/50">
              {cut.photoUrl && (
                <div className="mt-3 mb-3 rounded-lg overflow-hidden">
                  <img src={cut.photoUrl} alt={cut.hairstyleName} className="w-full max-h-64 object-cover" />
                </div>
              )}
              {cut.notes && (
                <div className="mb-3">
                  <p className="text-[10px] font-medium text-gold tracking-wider uppercase mb-1">NOTES</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{cut.notes}</p>
                </div>
              )}
              <div className="mb-3">
                <p className="text-[10px] font-medium text-gold tracking-wider uppercase mb-1">LOGGED</p>
                <p className="text-xs text-muted-foreground">{formatFullDate(cut.date)}</p>
              </div>
              {deleteConfirm ? (
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-error flex-1">Delete this cut?</p>
                  <button onClick={() => { onDelete(cut.id); setDeleteConfirm(false); setExpanded(false) }} className="px-3 py-1.5 bg-error/20 text-error text-[11px] font-medium rounded-lg hover:bg-error/30 transition-colors">Confirm</button>
                  <button onClick={() => setDeleteConfirm(false)} className="px-3 py-1.5 bg-secondary text-muted-foreground text-[11px] font-medium rounded-lg hover:bg-muted transition-colors">Cancel</button>
                </div>
              ) : (
                <button onClick={() => setDeleteConfirm(true)} className="flex items-center gap-1.5 mt-1 text-[11px] text-muted-foreground hover:text-error transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Photo Card ──
function PhotoCard({ photo, onDelete }: { photo: ProgressPhoto; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const stageConfig = GROWTH_STAGES[photo.growthStage]
  const daysSince = Math.floor((Date.now() - new Date(photo.date).getTime()) / (1000 * 60 * 60 * 24))

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-secondary border border-border rounded-xl overflow-hidden"
    >
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left">
        <div className="relative aspect-[4/3] bg-background">
          {photo.imageUrl.startsWith("data:") ? (
            <img src={photo.imageUrl} alt="Progress" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Camera className="w-8 h-8 text-muted-foreground/30" />
            </div>
          )}
        </div>
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full ${stageConfig.bg} ${stageConfig.border} border`}>
              <span className="text-xs">{stageConfig.emoji}</span>
              <span className={`text-[10px] font-medium ${stageConfig.color}`}>{stageConfig.label}</span>
              {daysSince > 0 && <span className="text-[9px] text-muted-foreground">· {daysSince}d ago</span>}
            </div>
            <span className="text-[10px] text-muted-foreground">{formatDate(photo.date)}</span>
          </div>
          {photo.haircutName && <p className="text-xs font-medium text-foreground mb-0.5">{photo.haircutName}</p>}
          {photo.notes && <p className="text-[10px] text-muted-foreground line-clamp-2">{photo.notes}</p>}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-3.5 pb-3.5 pt-0 border-t border-border/50">
              <div className="mt-3 mb-3 rounded-lg overflow-hidden">
                <img src={photo.imageUrl} alt="Progress" className="w-full max-h-64 object-cover" />
              </div>
              <div className="mb-3">
                <p className="text-[10px] font-medium text-gold tracking-wider uppercase mb-1">LOGGED</p>
                <p className="text-xs text-muted-foreground">{formatFullDate(photo.date)}</p>
              </div>
              {deleteConfirm ? (
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-error flex-1">Delete this photo?</p>
                  <button onClick={() => { onDelete(photo.id); setDeleteConfirm(false); setExpanded(false) }} className="px-3 py-1.5 bg-error/20 text-error text-[11px] font-medium rounded-lg hover:bg-error/30 transition-colors">Confirm</button>
                  <button onClick={() => setDeleteConfirm(false)} className="px-3 py-1.5 bg-secondary text-muted-foreground text-[11px] font-medium rounded-lg hover:bg-muted transition-colors">Cancel</button>
                </div>
              ) : (
                <button onClick={() => setDeleteConfirm(true)} className="flex items-center gap-1.5 mt-1 text-[11px] text-muted-foreground hover:text-error transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Add Progress Photo Modal ──
function UploadPhotoModal({ onClose, onSave }: { onClose: () => void; onSave: (photo: Omit<ProgressPhoto, "id">) => void }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [growthStage, setGrowthStage] = useState<ProgressPhoto["growthStage"]>("fresh")
  const [notes, setNotes] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setImageUrl(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    if (!imageUrl) return
    onSave({ imageUrl, date: new Date().toISOString(), growthStage, notes })
    onClose()
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={onClose}>
      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="bg-secondary border-t border-border rounded-t-2xl w-full max-w-md max-h-[80vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-foreground">Add Progress Photo</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center hover:bg-gold/30 transition-colors">
            <X className="w-4 h-4 text-gold" />
          </button>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        {imageUrl ? (
          <div className="relative mb-4 rounded-xl overflow-hidden">
            <img src={imageUrl} alt="Preview" className="w-full aspect-[4/3] object-cover" />
            <button onClick={() => setImageUrl(null)} className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center">
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        ) : (
          <button onClick={() => fileInputRef.current?.click()} className="w-full aspect-[4/3] border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 hover:border-gold/40 transition-colors mb-4">
            <Camera className="w-8 h-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Tap to upload photo</p>
          </button>
        )}
        <p className="text-xs font-medium text-foreground mb-2">Growth Stage</p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {(Object.keys(GROWTH_STAGES) as Array<ProgressPhoto["growthStage"]>).map((stage) => {
            const config = GROWTH_STAGES[stage]
            return (
              <button key={stage} onClick={() => setGrowthStage(stage)} className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${growthStage === stage ? `${config.bg} ${config.border}` : "bg-secondary border-border hover:border-muted-foreground/50"}`}>
                <span className="text-base">{config.emoji}</span>
                <span className={`text-xs font-medium ${growthStage === stage ? config.color : "text-muted-foreground"}`}>{config.label}</span>
              </button>
            )
          })}
        </div>
        <p className="text-xs font-medium text-foreground mb-2">Notes (optional)</p>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="How's the style looking? Any observations..." className="w-full h-16 px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground resize-none mb-4" />
        <button onClick={handleSave} disabled={!imageUrl} className="w-full py-3 px-6 bg-gold text-gold-foreground font-semibold rounded-xl hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Save Progress Photo</button>
      </motion.div>
    </motion.div>
  )
}

// ── Main Unified Screen ──
export function HairJourneyScreen() {
  const { state, goBack, navigateTo, addProgressPhoto, removeProgressPhoto, removeLoggedCut } = useApp()
  const { loggedCuts, progressPhotos } = state
  const [showUpload, setShowUpload] = useState(false)

  // Build unified timeline
  const timeline: TimelineEntry[] = [
    ...loggedCuts.map(c => ({ type: "cut" as const, data: c, date: new Date(c.date) })),
    ...progressPhotos.map(p => ({ type: "photo" as const, data: p, date: new Date(p.date) })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime())

  const totalEntries = timeline.length
  const totalCuts = loggedCuts.length
  const totalPhotos = progressPhotos.length

  const handleSavePhoto = (photoData: Omit<ProgressPhoto, "id">) => {
    addProgressPhoto({
      ...photoData,
      id: `progress-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center px-4 md:px-6 py-2">
        <button onClick={goBack} className="flex items-center gap-1 text-sm text-foreground hover:text-gold transition-colors">
          <ChevronLeft className="w-5 h-5" /> BACK
        </button>
      </div>

      <div className="flex-1 pt-2 pb-6 overflow-y-auto w-full">
        <div className="px-4 md:px-6 lg:px-8 max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            {/* Title */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-gold" />
                <h2 className="text-xl font-semibold text-foreground">Hair Journey</h2>
              </div>
              <div className="flex gap-2">
                <button onClick={() => navigateTo("log-cut")} className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-400/10 border border-orange-400/30 rounded-lg text-[11px] font-medium text-orange-400 hover:bg-orange-400/15 transition-colors">
                  <Scissors className="w-3.5 h-3.5" /> Log Cut
                </button>
                <button onClick={() => setShowUpload(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-gold/10 border border-gold/30 rounded-lg text-[11px] font-medium text-gold hover:bg-gold/15 transition-colors">
                  <Camera className="w-3.5 h-3.5" /> Add Photo
                </button>
              </div>
            </div>

            {/* Stats */}
            {totalEntries > 0 && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-3 gap-2 mb-6">
                <div className="bg-secondary border border-border rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-orange-400">{totalCuts}</p>
                  <p className="text-[10px] text-muted-foreground">Cuts Logged</p>
                </div>
                <div className="bg-secondary border border-border rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-gold">{totalPhotos}</p>
                  <p className="text-[10px] text-muted-foreground">Photos</p>
                </div>
                <div className="bg-secondary border border-border rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-foreground">{totalEntries}</p>
                  <p className="text-[10px] text-muted-foreground">Total Entries</p>
                </div>
              </motion.div>
            )}

            {/* Timeline */}
            {totalEntries > 0 ? (
              <div className="space-y-3">
                {timeline.map((entry) =>
                  entry.type === "cut" ? (
                    <CutCard key={`cut-${entry.data.id}`} cut={entry.data} onDelete={removeLoggedCut} />
                  ) : (
                    <PhotoCard key={`photo-${entry.data.id}`} photo={entry.data} onDelete={removeProgressPhoto} />
                  )
                )}
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-secondary border border-border flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">Start Your Hair Journey</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
                  Log your haircuts and take progress photos to track your grooming journey over time.
                </p>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => navigateTo("log-cut")} className="px-5 py-3 bg-orange-400 text-white font-semibold rounded-xl text-sm">
                    Log a Cut
                  </button>
                  <button onClick={() => setShowUpload(true)} className="px-5 py-3 bg-gold text-gold-foreground font-semibold rounded-xl text-sm">
                    Add Photo
                  </button>
                </div>
              </motion.div>
            )}

            {/* Benefits */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-6 bg-gold/5 border border-gold/20 rounded-xl p-4">
              <p className="text-[10px] font-medium text-gold tracking-wider uppercase mb-2">WHY TRACK YOUR HAIR?</p>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-gold mt-0.5">•</span>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="text-foreground font-medium">Build your grooming streak</span> — log cuts to earn badges and track your consistency
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-gold mt-0.5">•</span>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="text-foreground font-medium">Visual timeline</span> — see how each cut grows out and compare styles over time
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-gold mt-0.5">•</span>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="text-foreground font-medium">Barber proof</span> — show your barber exactly how your last cut grew out for better results
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && <UploadPhotoModal onClose={() => setShowUpload(false)} onSave={handleSavePhoto} />}
      </AnimatePresence>
    </div>
  )
}
