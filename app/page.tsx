"use client"

import { AppProvider } from "@/lib/app-context"
import { SculptApp } from "@/components/sculpt-app"

export default function Home() {
  return (
    <AppProvider>
      <SculptApp />
    </AppProvider>
  )
}
