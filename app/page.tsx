import type { Metadata } from 'next'
import { AppHome } from '@/components/app-home'

export const metadata: Metadata = {
  title: 'SCULPT - AI-Powered Haircut Recommendations',
  description: 'Find the haircut that actually fits you. Sculpt uses AI to analyze your face shape, hair type, and personal style to deliver personalized hairstyle recommendations with detailed barber instructions.',
  openGraph: {
    title: 'SCULPT - AI-Powered Haircut Recommendations',
    description: 'AI-powered grooming intelligence. Upload your photo, get a personalized analysis, and receive barber-ready hairstyle cards tailored to your face and hair.',
    siteName: 'Sculpt',
    type: 'website',
  },
}

export default function Home() {
  return <AppHome />
}
