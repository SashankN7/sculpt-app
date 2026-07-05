/**
 * Client-side image utilities for validating and compressing uploaded photos.
 * Handles mobile-specific issues: HEIC format, large file sizes, etc.
 */

const SUPPORTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const MAX_FILE_SIZE = 8 * 1024 * 1024 // 8MB before compression
const TARGET_SIZE = 1024 // Max dimension in pixels
const JPEG_QUALITY = 0.85

export interface ImageValidationResult {
  valid: boolean
  error?: string
  hint?: string
}

/**
 * Validate an image file before upload.
 * Returns validation result with user-friendly error messages.
 */
export function validateImageFile(file: File): ImageValidationResult {
  // Check MIME type
  if (!SUPPORTED_MIME_TYPES.includes(file.type)) {
    const isHeic = file.type === 'image/heic' || file.type === 'image/heif' ||
                   file.name.toLowerCase().endsWith('.heic') ||
                   file.name.toLowerCase().endsWith('.heif')

    if (isHeic) {
      return {
        valid: false,
        error: 'HEIC format not supported',
        hint: 'iPhone photos in HEIC format aren\'t supported. Go to Settings > Camera > Formats > Most Compatible to switch to JPEG, or take a new photo as JPEG.',
      }
    }

    return {
      valid: false,
      error: `Unsupported image format: ${file.type || 'unknown'}`,
      hint: 'Please upload a JPEG, PNG, or WebP image.',
    }
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'Image too large',
      hint: `This image is ${(file.size / 1024 / 1024).toFixed(1)}MB. It will be automatically compressed.`,
    }
  }

  return { valid: true }
}

/**
 * Compress and resize an image to reduce payload size.
 * Returns a base64 data URL.
 */
export function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      reject(new Error('Cannot create canvas context'))
      return
    }

    img.onload = () => {
      // Calculate new dimensions (maintain aspect ratio)
      let { width, height } = img

      if (width > TARGET_SIZE || height > TARGET_SIZE) {
        if (width > height) {
          height = Math.round((height / width) * TARGET_SIZE)
          width = TARGET_SIZE
        } else {
          width = Math.round((width / height) * TARGET_SIZE)
          height = TARGET_SIZE
        }
      }

      canvas.width = width
      canvas.height = height

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height)
      const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY)

      // Clean up
      URL.revokeObjectURL(img.src)

      resolve(dataUrl)
    }

    img.onerror = () => {
      URL.revokeObjectURL(img.src)
      reject(new Error('Failed to load image for compression'))
    }

    img.src = URL.createObjectURL(file)
  })
}

/**
 * Process an uploaded image file: validate, compress if needed, return base64 data URL.
 */
export async function processUploadedImage(file: File): Promise<string> {
  // Validate first
  const validation = validateImageFile(file)
  if (!validation.valid) {
    throw new Error(validation.hint ? `${validation.error}. ${validation.hint}` : validation.error)
  }

  // Compress if file is large or dimensions are big
  if (file.size > 1024 * 1024) { // > 1MB
    return compressImage(file)
  }

  // Small file — just read as data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read image file'))
    reader.readAsDataURL(file)
  })
}
