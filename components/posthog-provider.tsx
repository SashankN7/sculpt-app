"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { trackPageView } from "@/lib/posthog"

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Track page view on route change
  useEffect(() => {
    trackPageView(pathname)
  }, [pathname])

  return <>{children}</>
}
