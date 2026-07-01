"use client"

import { motion } from "framer-motion"
import { useApp } from "@/lib/app-context"
import { Settings, Calendar, RefreshCw, FileText, Trash2, Star } from "lucide-react"

export function HistoryScreen() {
  const { state, navigateTo, resetUpload } = useApp()
  const { savedRecommendations, rejectedRecommendations, recommendations, analysisResult } = state

  // Build history from actual data
  const allStyles = [...savedRecommendations, ...rejectedRecommendations]
  const hasData = allStyles.length > 0 || recommendations.length > 0

  const handleViewBarberCard = (index: number) => {
    // Find the recommendation index in the main list
    const rec = savedRecommendations[index]
    const origIndex = recommendations.findIndex(r => r.id === rec.id)
    if (origIndex !== -1) {
      navigateTo('recommendation-full')
    } else {
      navigateTo('recommendation-detail')
    }
  }

  const handleNewAnalysis = () => {
    resetUpload()
    navigateTo('upload')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2">
        <button 
          onClick={() => navigateTo('menu')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Settings className="w-5 h-5" />
          Settings
        </button>
      </div>

      <div className="flex-1 px-6 pt-4 pb-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Title */}
          <h2 className="text-xl font-semibold text-foreground mb-6">
            YOUR STYLE TIMELINE
          </h2>

          {!hasData ? (
            /* Empty State */
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-secondary border border-border flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No Styles Yet</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
                Complete your first analysis to start building your style timeline.
              </p>
              <button
                onClick={handleNewAnalysis}
                className="px-6 py-3 bg-gold text-gold-foreground font-semibold rounded-xl"
              >
                Start Analysis
              </button>
            </div>
          ) : (
            <>
              {/* Analysis Info */}
              {analysisResult && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-secondary border border-border rounded-xl p-4 mb-4"
                >
                  <p className="text-[10px] font-medium text-gold tracking-wider uppercase mb-2">
                    LAST ANALYSIS
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Face: <strong className="text-foreground">{analysisResult.faceShape}</strong></span>
                    <span>Density: <strong className="text-foreground">{analysisResult.densityScore}/100</strong></span>
                    <span>Confidence: <strong className="text-foreground">{Math.round(analysisResult.confidenceScore * 100)}%</strong></span>
                  </div>
                </motion.div>
              )}

              {/* Saved Styles */}
              {savedRecommendations.length > 0 && (
                <div className="mb-6">
                  <p className="text-[10px] font-medium text-gold tracking-wider uppercase mb-3">
                    SAVED PICKS ({savedRecommendations.length})
                  </p>
                  <div className="space-y-2">
                    {savedRecommendations.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-secondary border border-gold/30 rounded-xl p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-lg bg-background overflow-hidden flex-shrink-0">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Star className="w-5 h-5 text-gold" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {item.isSculptPick && (
                                <span className="text-[9px] font-bold text-gold bg-gold/10 px-1.5 py-0.5 rounded-full">
                                  #1 PICK
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-semibold text-foreground truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Compatibility: <span className="text-gold font-semibold">{item.compatibilityScore}%</span>
                            </p>
                          </div>
                          <button
                            onClick={() => handleViewBarberCard(index)}
                            className="flex-shrink-0 p-2 text-muted-foreground hover:text-gold transition-colors"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rejected Styles */}
              {rejectedRecommendations.length > 0 && (
                <div className="mb-6">
                  <p className="text-[10px] font-medium text-muted-foreground tracking-wider uppercase mb-3">
                    PASSED ON ({rejectedRecommendations.length})
                  </p>
                  <div className="space-y-2">
                    {rejectedRecommendations.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-secondary border border-border rounded-xl p-3 opacity-60"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-background overflow-hidden flex-shrink-0">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Trash2 className="w-4 h-4 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              Score: {item.compatibilityScore}%
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* All Recommendations */}
              {savedRecommendations.length === 0 && rejectedRecommendations.length === 0 && recommendations.length > 0 && (
                <div className="mb-6">
                  <p className="text-[10px] font-medium text-muted-foreground tracking-wider uppercase mb-3">
                    ALL RECOMMENDATIONS ({recommendations.length})
                  </p>
                  <div className="space-y-2">
                    {recommendations.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-secondary border border-border rounded-xl p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-background overflow-hidden flex-shrink-0">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Star className="w-4 h-4 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              Score: {item.compatibilityScore}%
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* New Analysis Button */}
          <motion.button
            onClick={handleNewAnalysis}
            className="flex items-center justify-center gap-2 w-full py-4 px-6 bg-gold text-gold-foreground font-semibold rounded-xl transition-all hover:bg-gold/90"
            whileTap={{ scale: 0.98 }}
          >
            <RefreshCw className="w-5 h-5" />
            START NEW HAIR ANALYSIS
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}
