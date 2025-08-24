import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GlowUp - Gamified Wellness Tracker',
  description: 'Gamify your wellness journey – Small habits, big wins.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
