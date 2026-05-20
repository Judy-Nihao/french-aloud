import type { ReactNode } from 'react'
import { Playfair_Display, DM_Sans, Caveat } from 'next/font/google'
import { VoiceProvider } from '@/components/v2/VoiceContext'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-caveat',
  display: 'swap',
})

export default function V2Layout({ children }: { children: ReactNode }) {
  return (
    <div className={`${playfair.variable} ${dmSans.variable} ${caveat.variable}`}>
      <VoiceProvider>{children}</VoiceProvider>
    </div>
  )
}
