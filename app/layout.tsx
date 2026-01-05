import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Degen Betting App',
  description: 'A decentralized betting application',
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
