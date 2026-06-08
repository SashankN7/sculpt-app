"use client"

import { motion } from "framer-motion"
import { useApp } from "@/lib/app-context"
import { Settings, Calendar, RefreshCw, FileText } from "lucide-react"

// Mock history data
const mockHistory = [
  {
    id: '1',
    hairstyleName: 'TEXTURED MODERN CROP',
    date: 'May 2026',
    accuracyIndex: 96,
    isCurrent: true,
  },
  {
    id: '2',
    hairstyleName: 'CLASSIC SIDE PART',
    date: 'March 2026',
    retention: '6 weeks',
    isCurrent: false,
  },
]

export function HistoryScreen() {
  const { navigateTo, resetUpload } = useApp()

  const handleViewBarberCard = () => {
    navigateTo('barber-card')
  }

  const handleNewAnalysis = () => {
    resetUpload()
    navigateTo('upload')
  }

  const handleSettings = () => {
    // Settings would be implemented in full app
    alert('Settings panel would open here')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2">
        <button 
          onClick={handleSettings}
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

          {/* History Cards */}
          <div className="space-y-3 mb-8">
            {mockHistory.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-secondary border rounded-xl p-4 ${
                  item.isCurrent ? 'border-gold' : 'border-border'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center text-gold">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">
                      {item.isCurrent ? 'CURRENT LOOK' : 'ARCHIVED LOOK'}
                    </p>
                    <p className="text-sm font-semibold text-foreground mb-1">
                      {item.hairstyleName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.isCurrent 
                        ? `Matched: ${item.date} · Accuracy Index: ${item.accuracyIndex}%`
                        : `Logged: ${item.date} · Retention: ${item.retention}`
                      }
                    </p>
                    {item.isCurrent && (
                      <button 
                        onClick={handleViewBarberCard}
                        className="text-xs text-gold hover:text-gold/80 transition-colors mt-2 flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        View Barber Card Blueprint specs
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* New Analysis Button */}
          <motion.button
            onClick={handleNewAnalysis}
            className="flex items-center justify-center gap-2 w-full py-4 px-6 bg-gold text-gold-foreground font-semibold rounded-xl transition-all hover:bg-gold/90"
            whileTap={{ scale: 0.98 }}
          >
            <RefreshCw className="w-5 h-5" />
            START NEW HAIR ANALYSIS RE-CYCLE
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}
