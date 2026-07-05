"use client"

import { motion } from "framer-motion"
import { useApp } from "@/lib/app-context"
import { ChevronLeft, Shield, FileText, Download, Mail, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

interface PolicySectionProps {
  title: string
  content: string
}

function PolicySection({ title, content }: PolicySectionProps) {
  const [expanded, setExpanded] = useState(false)
  
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between py-3 text-left"
      >
        <span className="text-sm font-medium text-foreground pr-2">{title}</span>
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
          <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{content}</p>
        </motion.div>
      )}
    </div>
  )
}

export function PrivacyLegalScreen() {
  const { goBack, navigateTo } = useApp()

  const privacyPolicy = `Sculpt ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and services.

Information We Collect:
• Photos: We collect face photos solely to generate hairstyle recommendations. Photos are processed locally or via secure AI APIs and are never shared with third parties.
• Questionnaire Data: Your style preferences, lifestyle information, and feedback to improve recommendations.
• Usage Data: Anonymous analytics to improve app functionality and recommendation accuracy.
• Account Information: Email address and subscription status (if you create an account).

How We Use Your Information:
• To generate personalized hairstyle recommendations
• To provide AI-powered chat assistance
• To track your hair growth and provide trim timing suggestions
• To improve our recommendation algorithms
• To send maintenance reminders and trend updates (if enabled)

Data Storage & Security:
• Photos are stored encrypted on secure servers
• You control photo retention (auto-delete after 7, 30 days, or keep indefinitely)
• We use industry-standard encryption for data transmission
• We do not sell or share personal data with third parties

Your Rights:
• Access: Request a copy of all your data
• Deletion: Delete your account and all associated data at any time
• Export: Download your recommendations, photos, and profile data
• Control: Adjust privacy settings in the app

Contact Us:
If you have questions about this policy, email us at sashanknandanavanam@gmail.com.`

  const termsOfService = `Last updated: January 2024

1. Acceptance of Terms
By using Sculpt, you agree to these Terms of Service. If you do not agree, do not use the app.

2. Service Description
Sculpt provides AI-generated hairstyle recommendations for informational purposes. Our service includes:
• Face analysis for hairstyle compatibility
• Personalized haircut recommendations
• Barber specification cards
• AI chat assistance for grooming advice
• Progress tracking for hair growth

3. User Responsibilities
• You must be at least 13 years old to use Sculpt
• You are responsible for maintaining account security
• You agree not to misuse the app or attempt to access others' accounts
• You are responsible for the photos you upload

4. Disclaimer of Warranties
• Results may vary based on individual features
• We do not guarantee specific outcomes from recommendations
• AI-generated content is for reference only
• Always consult with a professional barber for final decisions

5. Limitation of Liability
Sculpt is not liable for any damages arising from:
• Use or inability to use the service
• Unauthorized access to your data
• Errors or omissions in recommendations
• Third-party services integrated into the app

6. Subscription Terms
• Premium subscriptions auto-renew unless cancelled
• You can cancel anytime from Settings > Manage Subscription
• Refunds are handled according to app store policies
• Free tier features may change with notice

7. Intellectual Property
• The app and its content are owned by Sculpt
• You retain ownership of your photos and data
• We may use anonymized data to improve our services

8. Changes to Terms
We may update these terms at any material changes. Continued use constitutes acceptance of new terms.

Contact: sashanknandanavanam@gmail.com`

  const dataExportInfo = `You have the right to export all your data from Sculpt. This includes:

• Your account information and preferences
• All hairstyle recommendations generated for you
• Saved styles and barber cards
• Progress photos and growth tracking data
• Questionnaire responses and feedback
• Chat history with the AI assistant

To request a data export:
1. Go to Settings > Export My Data
2. Or request through the app's data export feature
3. You'll receive a download link within 48 hours
4. Data is provided in JSON format for easy import elsewhere

Note: We may retain some anonymized analytics data for service improvement, but all personal identifiable information will be included in your export.`

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

      <div className="flex-1 pt-4 pb-6 overflow-y-auto mx-auto w-full max-w-2xl">
        <div className="px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Title */}
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-6 h-6 text-gold" />
            <h2 className="text-xl font-semibold text-foreground">Privacy & Legal</h2>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <button
              onClick={() => navigateTo('settings')}
              className="bg-secondary border border-border rounded-xl p-4 flex flex-col items-center gap-2 hover:border-gold/40 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-gold" />
              </div>
              <span className="text-xs font-medium text-foreground">Privacy Settings</span>
              <span className="text-[10px] text-muted-foreground">Control your data</span>
            </button>
            
            <button
              onClick={() => alert('Data export request sent. You will receive an email with your data within 48 hours.')}
              className="bg-secondary border border-border rounded-xl p-4 flex flex-col items-center gap-2 hover:border-gold/40 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                <Download className="w-5 h-5 text-gold" />
              </div>
              <span className="text-xs font-medium text-foreground">Export My Data</span>
              <span className="text-[10px] text-muted-foreground">Download everything</span>
            </button>
          </div>

          {/* Privacy Policy */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <p className="text-xs font-medium text-gold tracking-wider uppercase mb-3">
              Privacy Policy
            </p>
            <div className="bg-secondary border border-border rounded-xl px-4 overflow-hidden">
              <PolicySection title="Full Privacy Policy" content={privacyPolicy} />
              <PolicySection title="Data Collection & Usage" content="We collect only the data necessary to provide our services. Your photos are processed securely and never shared. You have full control over your data retention settings." />
              <PolicySection title="Third-Party Services" content="We use secure AI APIs for photo analysis and recommendation generation. These services are contractually bound to protect your data and cannot use it for other purposes." />
              <PolicySection title="Cookies & Tracking" content="Sculpt uses essential cookies for app functionality. We do not use advertising trackers or sell data to third parties." />
            </div>
          </motion.div>

          {/* Terms of Service */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <p className="text-xs font-medium text-gold tracking-wider uppercase mb-3">
              Terms of Service
            </p>
            <div className="bg-secondary border border-border rounded-xl px-4 overflow-hidden">
              <PolicySection title="Full Terms of Service" content={termsOfService} />
              <PolicySection title="Subscription Terms" content="Premium subscriptions auto-renew monthly or annually. You can cancel anytime. Refunds are handled through the App Store or Google Play. Free tier features may change with notice." />
              <PolicySection title="User Content" content="You retain ownership of all photos and content you upload. By using Sculpt, you grant us a limited license to process your photos for generating recommendations. This license ends when you delete your account." />
              <PolicySection title="Prohibited Uses" content="You agree not to: misuse the app, attempt to access others' accounts, reverse engineer the AI, or use the service for illegal purposes. Violation may result in account termination." />
            </div>
          </motion.div>

          {/* Data Export Details */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <p className="text-xs font-medium text-gold tracking-wider uppercase mb-3">
              Data Export
            </p>
            <div className="bg-secondary border border-border rounded-xl px-4 overflow-hidden">
              <PolicySection title="What Data Can I Export?" content={dataExportInfo} />
              <PolicySection title="How to Request Export" content="1. Go to Settings > Export My Data\n2. You'll receive a download link within 48 hours\n3. Data is provided in JSON format" />
              <PolicySection title="Data Retention After Export" content="Exporting your data does not delete it from our servers. To delete your data, use Settings > Delete Account. We retain anonymized analytics for service improvement." />
            </div>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6"
          >
            <div className="bg-secondary border border-border rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-gold" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Legal & Privacy Inquiries</p>
                <button
                  onClick={() => window.open("mailto:sashanknandanavanam@gmail.com?subject=Sculpt Privacy/Legal Inquiry", "_blank")}
                  className="text-xs text-gold hover:text-gold/80 transition-colors"
                >
                  sashanknandanavanam@gmail.com
                </button>
              </div>
            </div>
          </motion.div>

          {/* App Version */}
          <p className="text-xs text-muted-foreground text-center">
            Sculpt v1.0.0 • Last updated: January 2024
          </p>
        </motion.div>
        </div>
      </div>
    </div>
  )
}
