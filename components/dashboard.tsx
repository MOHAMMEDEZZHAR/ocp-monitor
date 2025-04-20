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
import { loadAlertHistory, loadThresholds, saveDarkMode, loadDarkMode } from "@/utils/storage"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { defaultThresholds } from "@/config/thresholds"
import { Sun, Moon, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
// Update the Dashboard component to use the configurable dashboard
// Add the import for DashboardConfig
import { DashboardConfig, type DashboardConfig as DashboardConfigType } from "@/components/dashboard-config"
import { DataExport } from "@/components/data-export"
// Ajouter l'import pour useHistory
import { useHistory } from "@/services/history-service"

export function Dashboard() {
  const { data, isConnected, lastUpdate } = useWebSocket()
  const [alerts, setAlerts] = useState<any[]>([])
  const [alertHistory, setAlertHistory] = useState<any[]>([])
  const [historicalData, setHistoricalData] = useState<any[]>([])
  const previousAlertsRef = useRef<Record<string, boolean>>({})
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  // Add dashboardConfig state
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

  // Dans le composant Dashboard, ajouter:
  const { historicalData: serverHistoricalData, isLoading: isHistoryLoading } = useHistory()

  // Load alert history and dark mode on component mount
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
  }, [])

  // Toggle dark mode
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

  // Toggle component visibility in edit mode
  const toggleComponentVisibility = (
    component: keyof Pick<DashboardConfigType, "showGauges" | "showGraphs" | "showAlerts" | "showSummary">,
  ) => {
    if (!isEditMode) return

    setDashboardConfig((prev) => {
      const newConfig = {
        ...prev,
        [component]: !prev[component],
      }

      // Save to localStorage
      localStorage.setItem("dashboard-config", JSON.stringify(newConfig))

      return newConfig
    })
  }

  // Process data when it arrives
  useEffect(() => {
    if (!data) return

    // Check for alerts
    const currentAlerts = checkThresholds(data)
    setAlerts(currentAlerts)

    // Add to historical data (limited to last 50 points)
    setHistoricalData((prev) => {
      const newData = [...prev, { timestamp: new Date(), ...data }]
      return newData.slice(-50)
    })

    // Modifier useEffect pour utiliser les données historiques du serveur si disponibles
    if (serverHistoricalData && serverHistoricalData.length > 0) {
      setHistoricalData(serverHistoricalData)
    }

    // Track new alerts for history
    const newAlerts: any[] = []
    const newPreviousAlerts: Record<string, boolean> = {}

    currentAlerts.forEach((alert) => {
      const alertKey = `${alert.tag}-${alert.valeur.toFixed(2)}`
      newPreviousAlerts[alertKey] = true

      // Only add to history if this is a new alert
      if (!previousAlertsRef.current[alertKey]) {
        newAlerts.push({
          ...alert,
          historyTimestamp: new Date().toISOString(),
        })
      }
    })

    // Update the ref without causing re-renders
    previousAlertsRef.current = newPreviousAlerts

    // Only update alert history if there are new alerts
    if (newAlerts.length > 0) {
      // Add all new alerts to history at once
      let updatedHistory = [...alertHistory]

      newAlerts.forEach((alert) => {
        const alertWithId = {
          ...alert,
          id: `${alert.tag}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        }
        updatedHistory.unshift(alertWithId)
      })

      // Keep only the last 100 alerts
      updatedHistory = updatedHistory.slice(0, 100)

      // Update state and localStorage
      setAlertHistory(updatedHistory)

      // Save to localStorage outside of the render cycle
      try {
        localStorage.setItem("opcua-alert-history", JSON.stringify(updatedHistory))
      } catch (error) {
        console.error("Error saving alert history:", error)
      }
    }
  }, [data, serverHistoricalData]) // Only depend on data, not on alertHistory or previousAlerts

  // Get tag descriptions from thresholds
  const thresholdsList = loadThresholds() || defaultThresholds
  const tagDescriptions: Record<string, { label: string; unit: string; min: number; max: number }> = {}

  thresholdsList.forEach((item) => {
    tagDescriptions[item.tag] = {
      label: item.label,
      unit: item.unit,
      min: item.min,
      max: item.max,
    }
  })

  // Render components based on order
  const renderComponent = (componentId: string) => {
    switch (componentId) {
      case "gauges":
        return (
          dashboardConfig.showGauges && (
            <div className="relative mb-8">
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
          <Tabs defaultValue="graphs" className="mb-8">
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
                    <GraphsSection historicalData={historicalData} />
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
            <div className="relative mb-8">
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
                    <p className="text-2xl font-bold">{data?.resume?.total || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Valid</p>
                    <p className="text-2xl font-bold text-green-500">{data?.resume?.valide || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Errors</p>
                    <p className="text-2xl font-bold text-red-500">{data?.resume?.erreur || 0}</p>
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
      <Header isConnected={isConnected} lastUpdate={lastUpdate} />

      <main className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Current Values</h2>
          <div className="flex items-center gap-2">
            {isEditMode && (
              <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs px-2 py-1 rounded-md flex items-center">
                <Eye className="h-3 w-3 mr-1" />
                Edit Mode
              </div>
            )}
            <DataExport
              alertHistory={alertHistory}
              measurementData={historicalData}
              tagDescriptions={tagDescriptions}
            />
            <Button variant="outline" size="icon" onClick={toggleDarkMode} className="rounded-full">
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {isHistoryLoading && (
          <div className="text-center py-4">
            <p>Chargement des données historiques...</p>
          </div>
        )}

        {dashboardConfig.componentOrder.map((componentId) => renderComponent(componentId))}

        <SettingsPanel />
        <DashboardConfig onConfigChange={setDashboardConfig} onEditModeChange={setIsEditMode} />
      </main>
    </div>
  )
}
