import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — Sculpt',
  description: 'Sculpt Privacy Policy. Learn how we collect, use, and protect your data.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#1C1C20] text-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <a href="/" className="text-sm text-gray-400 hover:text-[#D4A73A] transition-colors mb-8 inline-block">
          &larr; Back to Sculpt
        </a>
        <a href="/" className="text-sm text-gray-400 hover:text-[#D4A73A] transition-colors mb-8 inline-block">
          &larr; Back to Sculpt
        </a>
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: January 2024</p>

        <div className="space-y-8 text-gray-300 leading-relaxed text-sm">
          <p>
            Sculpt (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your
            privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your
            information when you use our mobile application and services.
          </p>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Information We Collect</h2>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Photos:</strong> We collect face photos solely to generate hairstyle recommendations. Photos are processed locally or via secure AI APIs and are never shared with third parties.</li>
              <li><strong>Questionnaire Data:</strong> Your style preferences, lifestyle information, and feedback to improve recommendations.</li>
              <li><strong>Usage Data:</strong> Anonymous analytics to improve app functionality and recommendation accuracy.</li>
              <li><strong>Account Information:</strong> Email address and subscription status (if you create an account).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>To generate personalized hairstyle recommendations</li>
              <li>To provide AI-powered chat assistance</li>
              <li>To track your hair growth and provide trim timing suggestions</li>
              <li>To improve our recommendation algorithms</li>
              <li>To send maintenance reminders and trend updates (if enabled)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Data Storage &amp; Security</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Photos are stored encrypted on secure servers</li>
              <li>You control photo retention (auto-delete after 7, 30 days, or keep indefinitely)</li>
              <li>We use industry-standard encryption for data transmission</li>
              <li>We do not sell or share personal data with third parties</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Your Rights</h2>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Access:</strong> Request a copy of all your data</li>
              <li><strong>Deletion:</strong> Delete your account and all associated data at any time</li>
              <li><strong>Export:</strong> Download your recommendations, photos, and profile data</li>
              <li><strong>Control:</strong> Adjust privacy settings in the app</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Contact Us</h2>
            <p>
              If you have questions about this policy, email us at{' '}
              <a href="mailto:sashanknandanavanam@gmail.com" className="text-[#D4A73A] hover:underline">
                sashanknandanavanam@gmail.com
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
