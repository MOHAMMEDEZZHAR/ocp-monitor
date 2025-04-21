"use client"

import { useEffect, useState, useRef } from "react"
import { useWebSocket } from "@/services/websocket-context"
import { Header } from "@/components/header"
import { GaugeCard } from "@/components/gauge-card"
import { AlertPanel } from "@/components/alert-panel"
import { GraphsSection } from "@/components/graphs-section"
import { SettingsPanel } from "@/components/settings-panel"
import { AlertHistory } from "@/components/alert-history"
import { checkThresholds } from "@/utils/alerts"
import {
  loadAlertHistory,
  loadThresholds,
  saveDarkMode,
  loadDarkMode,
  loadLanguage,
  saveLanguage,
} from "@/utils/storage"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { defaultThresholds } from "@/config/thresholds"
import { Sun, Moon, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DashboardConfig, type DashboardConfig as DashboardConfigType } from "@/components/dashboard-config"
import { DataExport } from "@/components/data-export"
import { useHistory } from "@/services/history-service"

export function Dashboard() {
  const { data, isConnected, lastUpdate } = useWebSocket()
  const [alerts, setAlerts] = useState<any[]>([])
  const [alertHistory, setAlertHistory] = useState<any[]>([])
  const [historicalData, setHistoricalData] = useState<any[]>([])
  const previousAlertsRef = useRef<Record<string, boolean>>({})
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [language, setLanguage] = useState("en")
  const [thresholdsList, setThresholdsList] = useState(defaultThresholds) // Ajouter un état pour thresholdsList

  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfigType>({
    showGauges: true,
    showGraphs: true,
    showAlerts: true,
    showSummary: true,
    layout: "default",
    gaugeColumns: 4,
    graphsPosition: "left",
    editMode: false,
    componentOrder: ["gauges", "graphs", "alerts", "summary"],
  })

  const { historicalData: serverHistoricalData, isLoading: isHistoryLoading } = useHistory()

  // Charger les seuils dans un useEffect
  useEffect(() => {
    const thresholds = loadThresholds() || defaultThresholds
    setThresholdsList(thresholds)
  }, [])

  // Charger l'historique des alertes, le mode sombre et la langue au montage
  useEffect(() => {
    const history = loadAlertHistory()
    setAlertHistory(history)

    const darkMode = loadDarkMode()
    setIsDarkMode(darkMode)
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }

    const savedLanguage = loadLanguage()
    setLanguage(savedLanguage)
  }, [])

  // Basculer le mode sombre
  const toggleDarkMode = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    saveDarkMode(newMode)

    if (newMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  // Définir la langue
  useEffect(() => {
    saveLanguage(language)
  }, [language])

  // Basculer la visibilité des composants en mode édition
  const toggleComponentVisibility = (
    component: keyof Pick<DashboardConfigType, "showGauges" | "showGraphs" | "showAlerts" | "showSummary">,
  ) => {
    if (!isEditMode) return

    setDashboardConfig((prev) => {
      const newConfig = {
        ...prev,
        [component]: !prev[component],
      }

      localStorage.setItem("dashboard-config", JSON.stringify(newConfig))
      return newConfig
    })
  }

  // Traiter les données lorsqu'elles arrivent
  useEffect(() => {
    if (!data) return

    const updatedData = { ...data }
    if (updatedData.donnees && Array.isArray(updatedData.donnees)) {
      updatedData.donnees = updatedData.donnees.map((item: any) => {
        const tagInfo = thresholdsList.find((t: { tag: any }) => t.tag === item.tag)
        if (tagInfo) {
          if (item.valeur < tagInfo.min || item.valeur > tagInfo.max) {
            return { ...item, statut: "OFF" }
          }
        }
        return item
      })
    }

    const currentAlerts = checkThresholds(updatedData)
    setAlerts(currentAlerts)

    setHistoricalData((prev) => {
      const newData = [...prev, { timestamp: new Date(), ...updatedData }]
      return newData.slice(-50)
    })

    if (serverHistoricalData && serverHistoricalData.length > 0) {
      setHistoricalData(serverHistoricalData)
    }

    const newAlerts: any[] = []
    const newPreviousAlerts: Record<string, boolean> = {}

    currentAlerts.forEach((alert: { tag: any; valeur: number }) => {
      const alertKey = `${alert.tag}-${alert.valeur.toFixed(2)}`
      newPreviousAlerts[alertKey] = true

      if (!previousAlertsRef.current[alertKey]) {
        newAlerts.push({
          ...alert,
          historyTimestamp: new Date().toISOString(),
        })
      }
    })

    previousAlertsRef.current = newPreviousAlerts

    if (newAlerts.length > 0) {
      let updatedHistory = [...alertHistory]

      newAlerts.forEach((alert) => {
        const alertWithId = {
          ...alert,
          id: `${alert.tag}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        }
        updatedHistory.unshift(alertWithId)
      })

      updatedHistory = updatedHistory.slice(0, 100)
      setAlertHistory(updatedHistory)

      try {
        localStorage.setItem("opcua-alert-history", JSON.stringify(updatedHistory))
      } catch (error) {
        console.error("Error saving alert history:", error)
      }
    }
  }, [data, serverHistoricalData, thresholdsList]) // Ajouter thresholdsList comme dépendance

  // Créer les descriptions des tags à partir des seuils
  const tagDescriptions: Record<string, { label: string; unit: string; min: number; max: number }> = {}
  thresholdsList.forEach((item: { tag: string | number; label: any; unit: any; min: any; max: any }) => {
    tagDescriptions[item.tag] = {
      label: item.label,
      unit: item.unit,
      min: item.min,
      max: item.max,
    }
  })

  // Rendre les composants en fonction de l'ordre
  const renderComponent = (componentId: string, index: number) => {
    switch (componentId) {
      case "gauges":
        return (
          dashboardConfig.showGauges && (
            <div className="relative mb-8" key={`component-${componentId}-${index}`}>
              {isEditMode && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -top-2 -right-2 z-10 bg-background/80 rounded-full"
                  onClick={() => toggleComponentVisibility("showGauges")}
                >
                  <EyeOff className="h-4 w-4" />
                </Button>
              )}
              <div
                className={`grid grid-cols-1 ${
                  dashboardConfig.layout === "compact"
                    ? `md:grid-cols-${Math.min(dashboardConfig.gaugeColumns, 3)} lg:grid-cols-${dashboardConfig.gaugeColumns}`
                    : dashboardConfig.layout === "expanded"
                      ? `md:grid-cols-${Math.min(dashboardConfig.gaugeColumns - 1, 2)} lg:grid-cols-${Math.min(dashboardConfig.gaugeColumns, 3)}`
                      : `md:grid-cols-${Math.min(dashboardConfig.gaugeColumns - 2, 2)} lg:grid-cols-${Math.min(dashboardConfig.gaugeColumns, 4)}`
                } gap-4`}
              >
                {data?.donnees?.map((item: any) => (
                  <GaugeCard
                    key={item.tag}
                    value={item.valeur}
                    tag={item.tag}
                    status={item.statut}
                    timestamp={item.horodatage}
                    {...tagDescriptions[item.tag]}
                  />
                ))}
              </div>
            </div>
          )
        )

      case "graphs":
        return (
          <Tabs defaultValue="graphs" className="mb-8" key={`component-${componentId}-${index}`}>
            <TabsList className="mb-4">
              <TabsTrigger value="graphs">Graphs & Alerts</TabsTrigger>
              <TabsTrigger value="history">Alert History</TabsTrigger>
            </TabsList>

            <TabsContent value="graphs">
              <div
                className={`grid grid-cols-1 ${
                  dashboardConfig.graphsPosition === "full"
                    ? ""
                    : dashboardConfig.layout === "compact"
                      ? "lg:grid-cols-1"
                      : dashboardConfig.layout === "expanded"
                        ? "lg:grid-cols-2 xl:grid-cols-3"
                        : "lg:grid-cols-3"
                } gap-4`}
              >
                {dashboardConfig.showGraphs && (
                  <div
                    className={`relative ${
                      dashboardConfig.graphsPosition === "left"
                        ? "lg:col-span-2"
                        : dashboardConfig.graphsPosition === "right"
                          ? "lg:col-start-2 lg:col-span-2"
                          : ""
                    }`}
                  >
                    {isEditMode && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -top-2 -right-2 z-10 bg-background/80 rounded-full"
                        onClick={() => toggleComponentVisibility("showGraphs")}
                      >
                        <EyeOff className="h-4 w-4" />
                      </Button>
                    )}
                    <GraphsSection historicalData={historicalData} isDarkMode={isDarkMode} />
                  </div>
                )}

                {dashboardConfig.showAlerts && (
                  <div className="relative">
                    {isEditMode && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -top-2 -right-2 z-10 bg-background/80 rounded-full"
                        onClick={() => toggleComponentVisibility("showAlerts")}
                      >
                        <EyeOff className="h-4 w-4" />
                      </Button>
                    )}
                    <AlertPanel alerts={alerts} tagDescriptions={tagDescriptions} />
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="history">
              <AlertHistory
                alertHistory={alertHistory}
                tagDescriptions={tagDescriptions}
                setAlertHistory={setAlertHistory}
              />
            </TabsContent>
          </Tabs>
        )

      case "summary":
        return (
          dashboardConfig.showSummary && (
            <div className="relative mb-8" key={`component-${componentId}-${index}`}>
              {isEditMode && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -top-2 -right-2 z-10 bg-background/80 rounded-full"
                  onClick={() => toggleComponentVisibility("showSummary")}
                >
                  <EyeOff className="h-4 w-4" />
                </Button>
              )}
              <Card className="p-4">
                <h3 className="text-lg font-medium mb-2">System Summary</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Tags</p>
                    <p className="text-2xl font-bold">{data?.donnees?.length || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Valid</p>
                    <p className="text-2xl font-bold text-green-500">
                      {data?.donnees?.filter((item: any) => item.statut === "OK").length || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Errors</p>
                    <p className="text-2xl font-bold text-red-500">
                      {data?.donnees?.filter((item: any) => item.statut !== "OK").length || 0}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header isConnected={isConnected} lastUpdate={lastUpdate} language={language} onLanguageChange={setLanguage} />

      <main className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            {language === "fr"
              ? "Valeurs Actuelles"
              : language === "es"
                ? "Valores Actuales"
                : language === "de"
                  ? "Aktuelle Werte"
                  : "Current Values"}
          </h2>
          <div className="flex items-center gap-2">
            {isEditMode && (
              <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs px-2 py-1 rounded-md flex items-center">
                <Eye className="h-3 w-3 mr-1" />
                {language === "fr"
                  ? "Mode Édition"
                  : language === "es"
                    ? "Modo Edición"
                    : language === "de"
                      ? "Bearbeitungsmodus"
                      : "Edit Mode"}
              </div>
            )}
            <DataExport
              alertHistory={alertHistory}
              measurementData={historicalData}
              tagDescriptions={tagDescriptions}
              language={language}
            />
            <Button variant="outline" size="icon" onClick={toggleDarkMode} className="rounded-full">
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {isHistoryLoading && (
          <div className="text-center py-4">
            <p>
              {language === "fr"
                ? "Chargement des données historiques..."
                : language === "es"
                  ? "Cargando datos históricos..."
                  : language === "de"
                    ? "Historische Daten werden geladen..."
                    : "Loading historical data..."}
            </p>
          </div>
        )}

        {dashboardConfig.componentOrder.map((componentId, index) => renderComponent(componentId, index))}

        <SettingsPanel language={language} />
        <DashboardConfig onConfigChange={setDashboardConfig} onEditModeChange={setIsEditMode} />
      </main>
    </div>
  )
}