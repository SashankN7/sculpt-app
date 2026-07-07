"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useApp } from "@/lib/app-context"
import { ChevronLeft, Scissors, Camera, Trash2, MessageSquare, Calendar, X } from "lucide-react"

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

export function LoggedCutsScreen() {
  const { state, goBack, removeLoggedCut, navigateTo } = useApp()
  const { loggedCuts } = state
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const handleDelete = (id: string) => {
    removeLoggedCut(id)
    setDeleteConfirmId(null)
    setExpandedId(null)
  }

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

      <div className="flex-1 pt-4 pb-6 overflow-y-auto w-full">
        <div className="px-4 md:px-6 lg:px-8 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Title */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground">LOGGED CUTS</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {loggedCuts.length} cut{loggedCuts.length !== 1 ? "s" : ""} logged
                </p>
              </div>
              <button
                onClick={() => navigateTo("log-cut")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gold/10 border border-gold/30 rounded-lg text-[11px] font-medium text-gold hover:bg-gold/15 transition-colors"
              >
                <Scissors className="w-3.5 h-3.5" />
                Log New
              </button>
            </div>

            {loggedCuts.length === 0 ? (
              /* Empty State */
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-secondary border border-border flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No Cuts Logged</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
                  Capture your haircut after each visit to track your grooming journey.
                </p>
                <button
                  onClick={() => navigateTo("log-cut")}
                  className="px-6 py-3 bg-gold text-gold-foreground font-semibold rounded-xl"
                >
                  Log Your First Cut
                </button>
              </div>
            ) : (
              /* Cut Cards */
              <div className="space-y-3">
                {loggedCuts.map((cut, index) => (
                  <motion.div
                    key={cut.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-secondary border border-border rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedId(expandedId === cut.id ? null : cut.id)}
                      className="w-full text-left"
                    >
                      <div className="flex items-start gap-3 p-3.5">
                        {/* Photo thumbnail */}
                        <div className="w-14 h-14 rounded-lg bg-background border border-border overflow-hidden flex-shrink-0">
                          {cut.photoUrl ? (
                            <img
                              src={cut.photoUrl}
                              alt={cut.hairstyleName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Scissors className="w-5 h-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {cut.hairstyleName}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            <p className="text-[11px] text-muted-foreground">
                              {formatDate(cut.date)}
                            </p>
                          </div>
                          {cut.notes && expandedId !== cut.id && (
                            <div className="flex items-center gap-1 mt-1">
                              <MessageSquare className="w-3 h-3 text-gold" />
                              <p className="text-[10px] text-gold truncate">{cut.notes}</p>
                            </div>
                          )}
                        </div>

                        {/* Expand indicator */}
                        <div className="flex-shrink-0 mt-1">
                          <ChevronLeft
                            className={`w-4 h-4 text-muted-foreground transition-transform ${
                              expandedId === cut.id ? "-rotate-90" : "rotate-90"
                            }`}
                          />
                        </div>
                      </div>
                    </button>

                    {/* Expanded detail */}
                    <AnimatePresence>
                      {expandedId === cut.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-3.5 pb-3.5 pt-0 border-t border-border/50">
                            {/* Full photo */}
                            {cut.photoUrl && (
                              <div className="mt-3 mb-3 rounded-lg overflow-hidden">
                                <img
                                  src={cut.photoUrl}
                                  alt={cut.hairstyleName}
                                  className="w-full max-h-64 object-cover"
                                />
                              </div>
                            )}

                            {/* Notes */}
                            {cut.notes && (
                              <div className="mb-3">
                                <p className="text-[10px] font-medium text-gold tracking-wider uppercase mb-1">
                                  NOTES
                                </p>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {cut.notes}
                                </p>
                              </div>
                            )}

                            {/* Date */}
                            <div className="mb-3">
                              <p className="text-[10px] font-medium text-gold tracking-wider uppercase mb-1">
                                LOGGED
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(cut.date).toLocaleDateString("en-US", {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </p>
                            </div>

                            {/* Delete button */}
                            {deleteConfirmId === cut.id ? (
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs text-error flex-1">Delete this cut?</p>
                                <button
                                  onClick={() => handleDelete(cut.id)}
                                  className="px-3 py-1.5 bg-error/20 text-error text-[11px] font-medium rounded-lg hover:bg-error/30 transition-colors"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="px-3 py-1.5 bg-secondary text-muted-foreground text-[11px] font-medium rounded-lg hover:bg-muted transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirmId(cut.id)}
                                className="flex items-center gap-1.5 mt-1 text-[11px] text-muted-foreground hover:text-error transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                              </button>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
