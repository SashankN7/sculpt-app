"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useApp } from "@/lib/app-context"
import { ChevronLeft, Send, User, Star } from "lucide-react"
interface ChatMessage {
  id: string
  role: 'assistant' | 'user'
  text: string
}

const QUICK_REPLIES = [
  "Why was this ranked #1?",
  "How do I maintain this?",
  "Can this work professionally?",
  "What if my hair is thicker?",
  "How hard is this to style?",
  "Will this suit my face shape?",
]

export function ChatAssistantScreen() {
  const { state, navigateTo } = useApp()
  const [userId, setUserId] = useState<string | null>(null)

  // Get user ID for server-side chat tracking
  useEffect(() => {
    async function getUserId() {
      try {
        const { createClient } = await import("@/lib/supabase")
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.id) setUserId(user.id)
      } catch {
        // Guest user
      }
    }
    getUserId()
  }, [])
  const { recommendations, currentRecommendationIndex, analysisResult } = state
  const [selectedStyleIndex, setSelectedStyleIndex] = useState(currentRecommendationIndex)
  const recommendation = recommendations[selectedStyleIndex]
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      text: recommendation
        ? `Your ${recommendation.name} scored ${recommendation.compatibilityScore}/100 primarily because of your face shape — one of the most versatile for this style. Your natural texture also eliminates the need for heavy styling product.`
        : "Ask me anything about your hairstyle recommendation.",
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim()
    if (!messageText || isTyping) return

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: messageText,
    }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setIsTyping(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          recommendation,
          analysisResult,
          chatHistory: messages.map(m => ({ role: m.role, content: m.text })),
          userSession: state.userSession,
          userId,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        const errorMsg = data.error || 'Chat request failed'
        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: errorMsg,
        }
        setMessages(prev => [...prev, assistantMsg])
        return
      }

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: data.response,
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch {
      // Fallback response if API fails
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: "I'm having trouble connecting right now. Please try again in a moment.",
      }
      setMessages(prev => [...prev, assistantMsg])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top Bar */}
      <div className="flex items-center px-4 md:px-6 py-2 border-b border-border">
        <button
          onClick={() => navigateTo('recommendation-full')}
          className="flex items-center gap-1 text-sm text-foreground hover:text-gold transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="flex-1 text-center text-sm font-medium text-foreground">
          SCULPT Assistant
        </span>
        <span className="px-2 py-0.5 border border-gold/40 text-gold text-[10px] font-medium rounded-full">
          Hair Only
        </span>
      </div>

      {/* Context Card */}
      {recommendation && (
        <div className="mx-auto w-full max-w-3xl px-4 mt-3">
          <button
            onClick={() => {
              // Cycle through recommendations
              const nextIndex = (selectedStyleIndex + 1) % recommendations.length
              setSelectedStyleIndex(nextIndex)
              // Add a system message about the change
              setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant' as const,
                text: `Switched to discussing: ${recommendations[nextIndex].name} (${recommendations[nextIndex].compatibilityScore}/100). What would you like to know?`,
              }])
            }}
            className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl flex items-center gap-3 hover:border-gold/30 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">
                Discussing: {recommendation.name} — {recommendation.compatibilityScore}/100
              </p>
              <p className="text-[10px] text-gold font-medium">Tap to change style</p>
            </div>
            {recommendation.isSculptPick && (
              <Star className="w-4 h-4 text-gold fill-gold flex-shrink-0" />
            )}
          </button>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-3 mx-auto w-full max-w-3xl">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gold text-background rounded-2xl rounded-br-sm font-medium'
                    : 'bg-secondary border border-border text-foreground rounded-2xl rounded-bl-sm'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-1 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                    <span className="text-[9px] text-gold font-medium tracking-wider uppercase">SCULPT</span>
                  </div>
                )}
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-secondary border border-border rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Quick Reply Chips */}
      <div className="mx-auto w-full max-w-3xl px-4 pb-2">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {QUICK_REPLIES.map((reply) => (
            <button
              key={reply}
              onClick={() => handleSend(reply)}
              className="flex-shrink-0 px-3 py-1.5 bg-secondary border border-border rounded-full text-xs text-muted-foreground hover:text-foreground hover:border-gold/40 transition-colors"
            >
              {reply}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <div className="mx-auto w-full max-w-3xl px-4 pb-4 pt-2 border-t border-border">
        <div className="flex items-center gap-2 bg-background border border-border rounded-full px-4 py-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your hairstyle..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              input.trim() && !isTyping
                ? 'bg-gold text-background'
                : 'bg-secondary text-muted-foreground'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
