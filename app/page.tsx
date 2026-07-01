"use client"

import { AppProvider } from "@/lib/app-context"
import { SculptApp } from "@/components/sculpt-app"
import { ErrorBoundary } from "@/components/error-boundary"

export default function Home() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <SculptApp />
      </AppProvider>
    </ErrorBoundary>
  )
}
