import { Clock } from "lucide-react"
import { LanguageSelector } from "./language-selector"

interface HeaderProps {
  isConnected: boolean
  lastUpdate: Date | null
}

export function Header({ isConnected, lastUpdate }: HeaderProps) {
  return (
    <header className="bg-card border-b sticky top-0 z-10 text-foreground">
      <div className="container mx-auto p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">OPC UA Monitoring Dashboard</h1>

        <div className="flex items-center gap-4">
          <LanguageSelector />

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : "No data yet"}</span>
          </div>

          <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
            <span className="text-sm">{isConnected ? "Connected" : "Disconnected"}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
