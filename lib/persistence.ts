// localStorage persistence layer for saving and restoring AppState across page refreshes

import type { AppState } from '@/lib/types'

const STORAGE_KEY = 'sculpt_app_state'
const EXPIRY_HOURS = 24 * 7 // 7 days

interface StoredState {
  data: AppState
  savedAt: number
}

// Strip blob URLs and large data before persisting
function sanitizeForStorage(state: AppState): AppState {
  return {
    ...state,
    uploadedImages: {
      // Keep data URLs (base64), drop blob URLs that won't survive refresh
      front: state.uploadedImages.front?.startsWith('data:') ? state.uploadedImages.front : null,
      side: state.uploadedImages.side?.startsWith('data:') ? state.uploadedImages.side : null,
      hairline: state.uploadedImages.hairline?.startsWith('data:') ? state.uploadedImages.hairline : null,
    },
    // Keep feedback photo data URL if present
    feedbackData: {
      ...state.feedbackData,
      afterPhoto: state.feedbackData.afterPhoto?.startsWith('data:') ? state.feedbackData.afterPhoto : null,
    },
  }
}

export function saveStateToStorage(state: AppState): void {
  try {
    const sanitized = sanitizeForStorage(state)
    const stored: StoredState = {
      data: sanitized,
      savedAt: Date.now(),
    }
    const serialized = JSON.stringify(stored)

    // Check size before writing (localStorage typically limited to 5MB)
    if (serialized.length > 4 * 1024 * 1024) {
      // If too large, strip images entirely
      const stripped = {
        data: {
          ...sanitized,
          uploadedImages: { front: null, side: null, hairline: null },
          feedbackData: { ...sanitized.feedbackData, afterPhoto: null },
        },
        savedAt: Date.now(),
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stripped))
    } else {
      localStorage.setItem(STORAGE_KEY, serialized)
    }
  } catch {
    // Storage full or unavailable — silently fail
  }
}

export function loadStateFromStorage(): AppState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const stored: StoredState = JSON.parse(raw)
    const ageHours = (Date.now() - stored.savedAt) / (1000 * 60 * 60)

    if (ageHours > EXPIRY_HOURS) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }

    return stored.data
  } catch {
    return null
  }
}

export function clearStateFromStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // silently fail
  }
}
