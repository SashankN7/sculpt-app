"use client"

import posthog from "posthog-js"

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com"

// Initialize PostHog (client-side only)
if (typeof window !== "undefined" && POSTHOG_KEY && !posthog.__loaded) {
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: false, // We'll track page views manually for SPA
    capture_pageleave: true,
    autocapture: true, // Auto-track clicks, inputs, etc.
    persistence: "localStorage",
    person_profiles: "identified_only", // Only create profiles for identified users
  })
}

// Track an event with optional properties
export function track(event: string, properties?: Record<string, unknown>) {
  if (!POSTHOG_KEY) return // Silently skip if not configured
  try {
    posthog.capture(event, properties)
  } catch {
    // Don't break the app if analytics fails
  }
}

// Identify a user (call after login/signup)
export function identify(userId: string, properties?: Record<string, unknown>) {
  if (!POSTHOG_KEY) return
  try {
    posthog.identify(userId, properties)
  } catch {
    // Silently fail
  }
}

// Reset user identity (call on logout)
export function resetIdentity() {
  if (!POSTHOG_KEY) return
  try {
    posthog.reset()
  } catch {
    // Silently fail
  }
}

// Track page view (for SPA navigation)
export function trackPageView(name: string) {
  if (!POSTHOG_KEY) return
  try {
    posthog.capture("$pageview", { $current_url: window.location.href, page_name: name })
  } catch {
    // Silently fail
  }
}
