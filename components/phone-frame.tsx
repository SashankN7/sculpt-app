"use client"

import type { ReactNode } from "react"

interface PhoneFrameProps {
  children: ReactNode
  batteryLevel?: number
  time?: string
}

export function PhoneFrame({ 
  children, 
  batteryLevel = 98,
  time 
}: PhoneFrameProps) {
  const currentTime = time || new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  })

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <div className="relative w-full max-w-[390px] h-[844px] bg-card rounded-[3rem] shadow-2xl overflow-hidden border-[8px] border-secondary">
        {/* Dynamic Island / Notch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-7 bg-background rounded-full z-50" />
        
        {/* Status Bar */}
        <div className="relative z-40 flex items-center justify-between px-8 pt-4 pb-2 text-xs text-foreground/80">
          <span className="font-medium">{currentTime}</span>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7z" opacity="0.3"/>
              <path d="M12 5c-3.86 0-7 3.14-7 7s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7z"/>
            </svg>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>
            </svg>
            <div className="flex items-center gap-0.5">
              <div className="relative w-6 h-3 border border-current rounded-sm">
                <div 
                  className="absolute inset-0.5 bg-current rounded-xs transition-all"
                  style={{ width: `${batteryLevel}%` }}
                />
              </div>
              <span className="text-[10px]">{batteryLevel}%</span>
            </div>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="h-[calc(100%-4rem)] overflow-hidden">
          {children}
        </div>
        
        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-foreground/30 rounded-full" />
      </div>
    </div>
  )
}
