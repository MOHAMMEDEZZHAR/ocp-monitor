"use client"
import { Dashboard } from "@/components/dashboard"
import { WebSocketProvider } from "@/services/websocket-context"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
// Importer le HistoryProvider
import { HistoryProvider } from "@/services/history-service"

// Modifier le composant Home pour inclure HistoryProvider
export default function Home() {
  return (
    <ThemeProvider>
      <WebSocketProvider>
        <HistoryProvider>
          <Dashboard />
          <Toaster />
        </HistoryProvider>
      </WebSocketProvider>
    </ThemeProvider>
  )
}
