"use client"

import { AppProvider } from "@/lib/app-context"
import { SculptApp } from "@/components/sculpt-app"
import { ErrorBoundary } from "@/components/error-boundary"

export function AppHome() {
  return (
    <ErrorBoundary>
      {/* Static SEO content — visible to Google crawlers, hidden visually when app loads */}
      <noscript>
        <div style={{ padding: '2rem', fontFamily: 'sans-serif', color: '#e0e0e0', background: '#1a1a1f' }}>
          <h1>SCULPT — AI-Powered Haircut Recommendations</h1>
          <p>
            Sculpt helps you find the perfect haircut. Upload your photo and our AI analyzes your face shape,
            hair type, and style preferences to deliver personalized hairstyle recommendations — complete with
            detailed barber instructions you can hand directly to your barber.
          </p>
          <h2>How It Works</h2>
          <ol>
            <li>Upload front, side, and hairline photos of yourself</li>
            <li>Our AI analyzes your face shape, hair density, and texture</li>
            <li>Get personalized barber cards with cutting metrics and styling tips</li>
            <li>Save your favorites and track your grooming journey</li>
          </ol>
          <h2>Features</h2>
          <ul>
            <li>AI-powered face shape and hair analysis</li>
            <li>Personalized hairstyle compatibility scores</li>
            <li>Detailed barber cards with cutting instructions</li>
            <li>Progress tracking between haircuts</li>
            <li>Grooming streak and badge system</li>
          </ul>
          <p>Visit <a href="https://v0-sculpt-app.vercel.app" style={{ color: '#C8982D' }}>Sculpt</a> to get started.</p>
        </div>
      </noscript>

      {/* Interactive app — rendered for real users */}
      <AppProvider>
        <SculptApp />
      </AppProvider>
    </ErrorBoundary>
  )
}
