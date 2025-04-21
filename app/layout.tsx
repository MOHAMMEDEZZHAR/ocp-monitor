import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'OCP monitor',
  description: 'Created by ezzhar mohammed',
  generator: 'simo.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
