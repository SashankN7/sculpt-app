"use client"

import { Component, type ReactNode } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Sculpt error:", error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  handleHardReset = () => {
    try {
      localStorage.removeItem("sculpt_app_state")
    } catch {
      // ignore
    }
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-error/10 border-2 border-error/30 flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8 text-error" />
          </div>

          <h1 className="text-xl font-semibold text-foreground mb-2">
            Something went wrong
          </h1>
          <p className="text-sm text-muted-foreground mb-8 max-w-sm">
            Sculpt hit an unexpected error. Your data is safe — try again or
            start fresh.
          </p>

          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button
              onClick={this.handleReset}
              className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-gold text-gold-foreground font-semibold rounded-xl hover:bg-gold/90 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>

            <button
              onClick={this.handleHardReset}
              className="w-full py-3 px-6 border border-border text-muted-foreground font-medium rounded-xl hover:bg-secondary transition-colors"
            >
              Start Fresh
            </button>
          </div>

          {process.env.NODE_ENV === "development" && this.state.error && (
            <details className="mt-8 w-full max-w-md text-left">
              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                Error details (dev only)
              </summary>
              <pre className="mt-2 p-3 bg-secondary border border-border rounded-lg text-xs text-error overflow-x-auto">
                {this.state.error.message}
                {"\n\n"}
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
}
