import type { Metadata } from 'next'
import { ThemeProvider } from "@/components/theme-provider"
import { ThresholdProvider } from "@/contexts/ThresholdContext"
import AuthProvider from "@/components/session-provider"
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
      <head>
        <link rel="icon" href="/OIP.jpeg" type="image/jpeg" />
      </head>
      <body>
        <AuthProvider>
          <ThemeProvider defaultTheme="system">
            <ThresholdProvider>
              {children}
            </ThresholdProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
