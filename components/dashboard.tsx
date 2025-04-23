"use client"

import { useEffect, useState, useRef, useMemo } from "react"
import { useWebSocket } from "@/services/websocket-context"
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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

  loadDashboardConfig,
  saveDashboardConfig,
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
  const { data: session } = useSession();
  const router = useRouter();
  const { data = {
    temperature: null,
    pressure: null,
    humidity: null,
    voltage: null
  }, isConnected, lastUpdate } = useWebSocket()

  // Authentication is now handled by middleware
  const [alerts, setAlerts] = useState<any[]>([])
  const [alertHistory, setAlertHistory] = useState<any[]>([])
  const [historicalData, setHistoricalData] = useState<any[]>([])
  const [processedData, setProcessedData] = useState<any>(null)
  const previousAlertsRef = useRef<Record<string, boolean>>({})
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  const defaultDashboardConfig: DashboardConfigType = {
    showGauges: true,
    showGraphs: true,
    showAlerts: true,
    showSummary: true,
    showAlertHistory: true,
    layout: "default",
    gaugeColumns: 4,
    graphsPosition: "left",
    editMode: false,
    componentOrder: ["gauges", "graphs", "alerts", "summary"],
  }

  const [thresholdsList, setThresholdsList] = useState(defaultThresholds)
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfigType>(defaultDashboardConfig)
  const [gaugeColumns, setGaugeColumns] = useState<number>(defaultDashboardConfig.gaugeColumns)

  useEffect(() => {
    const savedConfig = loadDashboardConfig()
    if (savedConfig) {
      setDashboardConfig(savedConfig)
      setGaugeColumns(savedConfig.gaugeColumns)
    }
  }, [])

  const { historicalData: serverHistoricalData, isLoading: isHistoryLoading } = useHistory()

  useEffect(() => {
    console.log("Current dashboardConfig:", dashboardConfig)
    setGaugeColumns(dashboardConfig.gaugeColumns)
  }, [dashboardConfig])

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

    const thresholds = loadThresholds() || defaultThresholds
    setThresholdsList(thresholds)
  }, [])

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

  const tagDescriptions = useMemo(() => {
    const descriptions: Record<string, { label: string; unit: string; min: number; max: number }> = {}
    thresholdsList.forEach((item: { tag: string | number; label: any; unit: any; min: any; max: any }) => {
      descriptions[item.tag] = {
        label: item.label,
        unit: item.unit,
        min: item.min,
        max: item.max,
      }
    })
    return descriptions
  }, [thresholdsList])

  const toggleComponentVisibility = (
    component: keyof Pick<DashboardConfigType, "showGauges" | "showGraphs" | "showAlerts" | "showSummary">,
  ) => {
    if (!isEditMode) return

    setDashboardConfig((prev) => {
      const newConfig = {
        ...prev,
        [component]: !prev[component],
      }
      saveDashboardConfig(newConfig)
      return newConfig
    })
  }

  useEffect(() => {
    if (!data) return

    const updatedData = { ...data }
    if (updatedData.donnees && Array.isArray(updatedData.donnees)) {
      // Générer des seuils par défaut pour les tags non trouvés
      let updatedThresholdsList = [...thresholdsList]
      updatedData.donnees.forEach((item: any) => {
        const existingThreshold = thresholdsList.find((t: { tag: any }) => t.tag === item.tag)
        if (!existingThreshold) {
          updatedThresholdsList.push({
            tag: item.tag,
            label: item.tag,
            unit: "°C",
            min: 1,
            max: 15,
          })
        }
      })

      // Mettre à jour les statuts
      updatedData.donnees = updatedData.donnees.map((item: any) => {
        const tagInfo = updatedThresholdsList.find((t: { tag: any }) => t.tag === item.tag)
        if (tagInfo) {
          const value = Number(item.valeur)
          if (isNaN(value)) {
            console.log(`Invalid value for tag ${item.tag}: ${item.valeur}. Setting status to OFF`);
            return { ...item, statut: "OFF" }
          }
          console.log(`Checking tag ${item.tag}: valeur=${value}, min=${tagInfo.min}, max=${tagInfo.max}`);
          if (value < tagInfo.min || value > tagInfo.max) {
            console.log(`Tag ${item.tag} is out of range: setting status to OFF`);
            return { ...item, statut: "OFF" }
          }
          console.log(`Tag ${item.tag} is within range: setting status to OK`);
          return { ...item, statut: "OK" }
        }
        console.log(`No threshold found for tag ${item.tag}: setting status to OFF`);
        return { ...item, statut: "OFF" }
      })

      // Appeler checkThresholds pour générer les alertes
      const currentAlerts = checkThresholds(updatedData)
      setAlerts(currentAlerts)

      // Recalculer les statuts après checkThresholds
      updatedData.donnees = updatedData.donnees.map((item: any) => {
        const tagInfo = updatedThresholdsList.find((t: { tag: any }) => t.tag === item.tag)
        if (tagInfo) {
          const value = Number(item.valeur)
          if (isNaN(value)) {
            return { ...item, statut: "OFF" }
          }
          if (value < tagInfo.min || value > tagInfo.max) {
            return { ...item, statut: "OFF" }
          }
          return { ...item, statut: "OK" }
        }
        return { ...item, statut: "OFF" }
      })

      // Mettre à jour processedData avec les données traitées
      setProcessedData(updatedData)
    }

    setHistoricalData((prev) => {
      const newData = [...prev, { timestamp: new Date(), ...updatedData }]
      return newData.slice(-50)
    })

    if (serverHistoricalData && serverHistoricalData.length > 0) {
      setHistoricalData(serverHistoricalData)
    }

    const newAlerts: any[] = []
    const newPreviousAlerts: Record<string, boolean> = {}

    alerts.forEach((alert: { tag: any; valeur: number }) => {
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
  }, [data, serverHistoricalData])

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
              <div className={`grid grid-cols-${gaugeColumns} gap-4`}>
                {processedData?.donnees?.map((item: any) => (
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
              <div className="grid grid-cols-3 gap-4 min-h-[450px]">
                {dashboardConfig.showGraphs && (
                  <div
                    className={`relative w-full col-span-2 ${
                      dashboardConfig.graphsPosition === "right" ? "order-last" : ""
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
                    <div className="w-full">
                      <GraphsSection historicalData={historicalData} isDarkMode={isDarkMode} />
                    </div>
                  </div>
                )}

                {dashboardConfig.showAlerts && (
                  <div className="relative w-full col-span-1">
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
                    <div className="w-full">
                      <AlertPanel alerts={alerts} tagDescriptions={tagDescriptions} />
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="history">
            {dashboardConfig.showAlertHistory && (
              <AlertHistory
                alertHistory={alertHistory}
                tagDescriptions={tagDescriptions}
                setAlertHistory={setAlertHistory}
              />
            )}
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
                    <p className="text-2xl font-bold">{processedData?.donnees?.length || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Valid</p>
                    <p className="text-2xl font-bold text-green-500">
                      {processedData?.donnees?.filter((item: any) => item.statut === "OK").length || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Errors</p>
                    <p className="text-2xl font-bold text-red-500">
                      {processedData?.donnees?.filter((item: any) => item.statut !== "OK").length || 0}
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header isConnected={isConnected} lastUpdate={lastUpdate} />
      <main className="container mx-auto p-4 dark:text-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleDarkMode}
              className="hover:bg-accent hover:text-accent-foreground"
              title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsEditMode(!isEditMode)}
              className="hover:bg-accent hover:text-accent-foreground"
              title={isEditMode ? 'View Mode' : 'Edit Mode'}
            >
              {isEditMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          <DataExport
            alertHistory={alertHistory}
            measurementData={historicalData}
            tagDescriptions={tagDescriptions}
          />
        </div>

        {isHistoryLoading && (
          <div className="text-center py-4">
            <p>Loading historical data...</p>
          </div>
        )}

        {dashboardConfig.componentOrder.map((componentId, index) => renderComponent(componentId, index))}

        <SettingsPanel />
        <DashboardConfig onConfigChange={setDashboardConfig} onEditModeChange={setIsEditMode} />
      </main>
    </div>
  )
}