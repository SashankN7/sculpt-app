"use client"

import { motion } from "framer-motion"
import { useApp } from "@/lib/app-context"
import { ChevronLeft, HelpCircle, Mail, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

interface FAQItemProps {
  question: string
  answer: string
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [expanded, setExpanded] = useState(false)
  
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between py-3 text-left"
      >
        <span className="text-sm font-medium text-foreground pr-2">{question}</span>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        )}
      </button>
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="pb-3"
        >
          <p className="text-xs text-muted-foreground leading-relaxed">{answer}</p>
        </motion.div>
      )}
    </div>
  )
}

export function HelpSupportScreen() {
  const { goBack } = useApp()

  const faqSections = [
    {
      title: "Getting Started",
      items: [
        {
          question: "How do I get haircut recommendations?",
          answer: "Upload 2-3 photos of your face (front, side, and hairline), answer a few style questions, and Sculpt's AI will generate personalized haircut recommendations tailored to your face shape, hair type, and lifestyle."
        },
        {
          question: "What is a Barber Card?",
          answer: "A Barber Card contains exact cutting metrics (top length, sides, boundary) and styling protocols you can show directly to your barber for a precise cut. It's like giving your barber a blueprint for your perfect haircut."
        },
        {
          question: "How does the AI Chat work?",
          answer: "Ask the AI assistant anything about your recommended styles — maintenance tips, product suggestions, face shape compatibility, and more. It's trained specifically on grooming and hairstyling to give you expert advice."
        },
        {
          question: "Can I save my favorite styles?",
          answer: "Yes! After swiping through recommendations, you can save your favorite styles to your personal collection. Access them anytime from your dashboard or profile."
        }
      ]
    },
    {
      title: "Account & Subscription",
      items: [
        {
          question: "What's included in the Free Tier?",
          answer: "Free tier includes 3 AI analyses, basic hairstyle recommendations, barber cards, and limited AI chat. You can explore the app and see how Sculpt works before upgrading."
        },
        {
          question: "What does Premium include?",
          answer: "Premium unlocks unlimited AI analyses, advanced AI chat, trend updates, priority support, and exclusive style recommendations. It's designed for users who want the full Sculpt experience."
        },
        {
          question: "How do I cancel my subscription?",
          answer: "You can cancel your subscription anytime from Settings > Manage Subscription. Your access will continue until the end of your current billing period."
        },
        {
          question: "Can I export my data?",
          answer: "Yes! Go to Settings > Export My Data to request a full export of your recommendations, saved styles, progress photos, and account information. You'll receive an email within 48 hours."
        }
      ]
    },
    {
      title: "Features & Functionality",
      items: [
        {
          question: "How accurate are the recommendations?",
          answer: "Sculpt uses advanced AI to analyze your face shape, hair density, and texture. While results are highly personalized, we recommend discussing recommendations with your barber who can adjust based on your specific hair type and growth patterns."
        },
        {
          question: "What are progress photos for?",
          answer: "Progress photos help you track how your haircut grows out over time. The AI analyzes your growth stage and can suggest optimal timing for your next trim. You'll also earn badges for consistent tracking!"
        },
        {
          question: "Can I share my recommendations?",
          answer: "Absolutely! You can share your saved styles, barber cards, or recommendations via social media, messaging apps, or directly with your barber. Use the Share button on any recommendation."
        }
      ]
    },
    {
      title: "Troubleshooting",
      items: [
        {
          question: "My photos aren't uploading",
          answer: "Make sure you have a stable internet connection and that your photos are in JPEG or PNG format. If issues persist, try restarting the app or clearing your browser cache."
        },
        {
          question: "The AI chat isn't responding",
          answer: "The AI chat requires an internet connection. If you're online and still having issues, try refreshing the page or restarting the app. For persistent issues, contact our support team."
        },
        {
          question: "I'm not getting notifications",
          answer: "Check your device's notification settings for Sculpt. Go to Settings > Notifications in the app to ensure maintenance reminders and trend updates are enabled."
        }
      ]
    }
  ]

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

      <div className="flex-1 pt-4 pb-6 overflow-y-auto">
        <div className="px-6 md:px-8 mx-auto w-full max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Title */}
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle className="w-6 h-6 text-gold" />
            <h2 className="text-xl font-semibold text-foreground">Help & Support</h2>
          </div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="bg-secondary border border-border rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-gold" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Need more help?</p>
                <button
                  onClick={() => window.open("mailto:sashanknandanavanam@gmail.com?subject=Sculpt Support Request", "_blank")}
                  className="text-xs text-gold hover:text-gold/80 transition-colors"
                >
                  sashanknandanavanam@gmail.com
                </button>
              </div>
            </div>
          </motion.div>

          {/* FAQ Sections */}
          {faqSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
              className="mb-6"
            >
              <p className="text-xs font-medium text-gold tracking-wider uppercase mb-3">
                {section.title}
              </p>
              <div className="bg-secondary border border-border rounded-xl px-4 overflow-hidden">
                {section.items.map((item, itemIndex) => (
                  <FAQItem
                    key={itemIndex}
                    question={item.question}
                    answer={item.answer}
                  />
                ))}
              </div>
            </motion.div>
          ))}

          {/* App Version */}
          <p className="text-xs text-muted-foreground text-center">
            Sculpt v1.0.0
          </p>
        </motion.div>
        </div>
      </div>
    </div>
  )
}
