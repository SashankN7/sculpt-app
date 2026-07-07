import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — Sculpt',
  description: 'Sculpt Terms of Service. Read our terms and conditions.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#1C1C20] text-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <a href="/" className="text-sm text-gray-400 hover:text-[#D4A73A] transition-colors mb-8 inline-block">
          &larr; Back to Sculpt
        </a>
        <a href="/" className="text-sm text-gray-400 hover:text-[#D4A73A] transition-colors mb-8 inline-block">
          &larr; Back to Sculpt
        </a>
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: January 2024</p>

        <div className="space-y-8 text-gray-300 leading-relaxed text-sm">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Acceptance of Terms</h2>
            <p>
              By using Sculpt, you agree to these Terms of Service. If you do not agree, do not use
              the app.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. Service Description</h2>
            <p>Sculpt provides AI-generated hairstyle recommendations for informational purposes. Our service includes:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Face analysis for hairstyle compatibility</li>
              <li>Personalized haircut recommendations</li>
              <li>Barber specification cards</li>
              <li>AI chat assistance for grooming advice</li>
              <li>Progress tracking for hair growth</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. User Responsibilities</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>You must be at least 13 years old to use Sculpt</li>
              <li>You are responsible for maintaining account security</li>
              <li>You agree not to misuse the app or attempt to access others&apos; accounts</li>
              <li>You are responsible for the photos you upload</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Disclaimer of Warranties</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Results may vary based on individual features</li>
              <li>We do not guarantee specific outcomes from recommendations</li>
              <li>AI-generated content is for reference only</li>
              <li>Always consult with a professional barber for final decisions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Limitation of Liability</h2>
            <p>Sculpt is not liable for any damages arising from:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Use or inability to use the service</li>
              <li>Unauthorized access to your data</li>
              <li>Errors or omissions in recommendations</li>
              <li>Third-party services integrated into the app</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Subscription Terms</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Premium subscriptions auto-renew unless cancelled</li>
              <li>You can cancel anytime from Settings &gt; Manage Subscription</li>
              <li>Refunds are handled according to app store policies</li>
              <li>Free tier features may change with notice</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Intellectual Property</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>The app and its content are owned by Sculpt</li>
              <li>You retain ownership of your photos and data</li>
              <li>We may use anonymized data to improve our services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Changes to Terms</h2>
            <p>
              We may update these terms at any material changes. Continued use constitutes
              acceptance of new terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Contact</h2>
            <p>
              <a href="mailto:sashanknandanavanam@gmail.com" className="text-[#D4A73A] hover:underline">
                sashanknandanavanam@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
