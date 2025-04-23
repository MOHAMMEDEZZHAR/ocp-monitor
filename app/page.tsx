"use client"
import { Dashboard } from "@/components/dashboard"
import { WebSocketProvider } from "@/services/websocket-context"
import { HistoryProvider } from "@/services/history-service"
import { Toaster } from "@/components/ui/toaster"

export default function Home() {
  return (
    <WebSocketProvider>
      <HistoryProvider>
        <Dashboard />
        <Toaster />
      </HistoryProvider>
    </WebSocketProvider>
  )
}
