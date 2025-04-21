import { Clock } from "lucide-react"
import { LanguageSelector } from "./language-selector"

interface HeaderProps {
  isConnected: boolean
  lastUpdate: Date | null
  language: string
  onLanguageChange: (language: string) => void
}

export function Header({ isConnected, lastUpdate, language, onLanguageChange }: HeaderProps) {
  const getTitle = () => {
    switch (language) {
      case "fr":
        return "Tableau de Bord de Surveillance OPC UA"
      case "es":
        return "Panel de Control de Monitoreo OPC UA"
      case "de":
        return "OPC UA Überwachungs-Dashboard"
      default:
        return "OPC UA Monitoring Dashboard"
    }
  }

  const getConnectionStatus = () => {
    switch (language) {
      case "fr":
        return isConnected ? "Connecté" : "Déconnecté"
      case "es":
        return isConnected ? "Conectado" : "Desconectado"
      case "de":
        return isConnected ? "Verbunden" : "Getrennt"
      default:
        return isConnected ? "Connected" : "Disconnected"
    }
  }

  return (
    <header className="bg-card border-b sticky top-0 z-10 text-foreground">
      <div className="container mx-auto p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">{getTitle()}</h1>

        <div className="flex items-center gap-4">
          <LanguageSelector currentLanguage={language} onLanguageChange={onLanguageChange} />

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {lastUpdate
                ? new Date(lastUpdate).toLocaleTimeString(
                    language === "fr" ? "fr-FR" : language === "es" ? "es-ES" : language === "de" ? "de-DE" : "en-US",
                  )
                : language === "fr"
                  ? "Pas encore de données"
                  : language === "es"
                    ? "Sin datos aún"
                    : language === "de"
                      ? "Noch keine Daten"
                      : "No data yet"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
            <span className="text-sm">{getConnectionStatus()}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
