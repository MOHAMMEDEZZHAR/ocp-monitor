"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Save, X, Layout, Eye, EyeOff, Columns, Grip, AlertCircle, CheckCircle } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { saveDashboardConfig, loadDashboardConfig } from "@/utils/storage"
import { useGaugeStyle } from "@/contexts/GaugeStyleContext"

interface DashboardConfigProps {
  onConfigChange: (config: DashboardConfig) => void
  onEditModeChange: (isEditMode: boolean) => void
}

export interface DashboardConfig {
  showGauges: boolean
  showGraphs: boolean
  showAlerts: boolean
  showSummary: boolean
  showAlertHistory: boolean
  layout: "default"
  gaugeColumns: number
  graphsPosition: "left" | "right"
  editMode: boolean
  componentOrder: string[]
}

const defaultConfig: DashboardConfig = {
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

// Type pour les notifications
type NotificationType = "success" | "error" | "warning" | null
interface Notification {
  type: NotificationType
  message: string
}

export function DashboardConfig({ onConfigChange, onEditModeChange }: DashboardConfigProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<DashboardConfig>(() => {
    const savedConfig = loadDashboardConfig()
    return savedConfig ?? defaultConfig // Utilisation de ?? pour gérer le cas null/undefined
  })
  const [activeTab, setActiveTab] = useState("visibility")
  // État pour les notifications
  const [notification, setNotification] = useState<Notification | null>(null)
  const { gaugeStyle, setGaugeStyle } = useGaugeStyle()

  // Load config from localStorage on component mount
  useEffect(() => {
    try {
      const savedConfig = loadDashboardConfig()
      if (savedConfig !== null) { // Vérification explicite que savedConfig n'est pas null
        setConfig(savedConfig)
        onConfigChange(savedConfig)

        // Apply edit mode if it was saved
        if (savedConfig.editMode) {
          onEditModeChange(savedConfig.editMode)
        }
      } else {
        // Si savedConfig est null, utiliser la configuration par défaut
        setConfig(defaultConfig)
        onConfigChange(defaultConfig)
      }
    } catch (error) {
      console.error("Error loading dashboard config:", error)
      setConfig(defaultConfig)
      onConfigChange(defaultConfig)
    }
  }, [onConfigChange, onEditModeChange])

  const handleSave = () => {
    try {
      saveDashboardConfig(config)
      onConfigChange(config)
      onEditModeChange(config.editMode)

      // Utiliser setNotification au lieu de toast
      setNotification({
        type: "success",
        message: "Dashboard configuration saved successfully.",
      })

      setTimeout(() => {
        setIsOpen(false)
        // Effacer la notification après la fermeture
        setTimeout(() => setNotification(null), 500)
      }, 1500)
    } catch (error) {
      console.error("Error saving dashboard config:", error)

      // Utiliser setNotification au lieu de toast
      setNotification({
        type: "error",
        message: "Failed to save dashboard configuration.",
      })
    }
  }

  const handleChange = (key: keyof DashboardConfig, value: any) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }))

    // If toggling edit mode, immediately notify parent
    if (key === "editMode") {
      onEditModeChange(value)
    }
  }

  const handleOrderChange = (id: string, direction: "up" | "down") => {
    const currentIndex = config.componentOrder.indexOf(id)
    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === config.componentOrder.length - 1)
    ) {
      return // Can't move further
    }

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    const newOrder = [...config.componentOrder]

    // Swap positions
    const temp = newOrder[currentIndex]
    newOrder[currentIndex] = newOrder[newIndex]
    newOrder[newIndex] = temp

    setConfig((prev) => ({
      ...prev,
      componentOrder: newOrder,
    }))
  }

  const resetToDefaults = () => {
    setConfig(defaultConfig)

    // Utiliser setNotification au lieu de toast
    setNotification({
      type: "success",
      message: "Dashboard configuration has been reset to defaults.",
    })
  }

  // Composant de notification simple
  const NotificationDisplay = () => {
    if (!notification) return null

    const bgColor =
      notification.type === "success"
        ? "bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800"
        : notification.type === "error"
          ? "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800"
          : "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800"

    const textColor =
      notification.type === "success"
        ? "text-green-800 dark:text-green-200"
        : notification.type === "error"
          ? "text-red-800 dark:text-red-200"
          : "text-yellow-800 dark:text-yellow-200"

    const Icon =
      notification.type === "success" ? CheckCircle : notification.type === "error" ? AlertCircle : AlertCircle

    return (
      <div className={`fixed top-4 right-4 z-[100] p-4 rounded-md border ${bgColor} shadow-lg max-w-md`}>
        <div className={`flex items-center gap-2 ${textColor}`}>
          <Icon className="h-5 w-5" />
          <p>{notification.message}</p>
        </div>
      </div>
    )
  }

  if (!isOpen) {
    return (
      <>
        {notification && <NotificationDisplay />}
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 left-4 z-50 rounded-full h-12 w-12 shadow-lg"
          onClick={() => setIsOpen(true)}
        >
          <Layout className="h-5 w-5" />
        </Button>
      </>
    )
  }

  return (
    <>
      {notification && <NotificationDisplay />}
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-xl max-h-[90vh] overflow-auto">
          <CardHeader>
            <CardTitle>Dashboard Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="visibility">Visibility</TabsTrigger>
                <TabsTrigger value="layout">Layout</TabsTrigger>
                <TabsTrigger value="order">Component Order</TabsTrigger>
              </TabsList>

              <TabsContent value="visibility" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="edit-mode"
                        checked={config.editMode}
                        onCheckedChange={(checked) => handleChange("editMode", checked)}
                      />
                      <Label htmlFor="edit-mode">Edit Mode</Label>
                    </div>
                    <span className="text-xs text-muted-foreground">{config.editMode ? "On" : "Off"}</span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Visible Sections</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="show-gauges"
                            checked={config.showGauges}
                            onCheckedChange={(checked) => handleChange("showGauges", !!checked)}
                          />
                          <Label htmlFor="show-gauges">Gauges</Label>
                        </div>
                        {config.showGauges ? (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="show-graphs"
                            checked={config.showGraphs}
                            onCheckedChange={(checked) => handleChange("showGraphs", !!checked)}
                          />
                          <Label htmlFor="show-graphs">Graphs</Label>
                        </div>
                        {config.showGraphs ? (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="show-alerts"
                            checked={config.showAlerts}
                            onCheckedChange={(checked) => handleChange("showAlerts", !!checked)}
                          />
                          <Label htmlFor="show-alerts">Alerts</Label>
                        </div>
                        {config.showAlerts ? (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="show-summary"
                            checked={config.showSummary}
                            onCheckedChange={(checked) => handleChange("showSummary", !!checked)}
                          />
                          <Label htmlFor="show-summary">Summary</Label>
                        </div>
                        {config.showSummary ? (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="show-alert-history"
                            checked={config.showAlertHistory}
                            onCheckedChange={(checked) => handleChange("showAlertHistory", !!checked)}
                          />
                          <Label htmlFor="show-alert-history">Alert History</Label>
                        </div>
                        {config.showAlertHistory ? (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Style des jauges</Label>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant={gaugeStyle === 'classic' ? 'default' : 'outline'}
                        onClick={() => setGaugeStyle('classic')}
                        size="sm"
                      >
                        Classique
                      </Button>
                      <Button
                        variant={gaugeStyle === 'modern' ? 'default' : 'outline'}
                        onClick={() => setGaugeStyle('modern')}
                        size="sm"
                      >
                        Moderne
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="layout" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Layout Preset</h3>
                    <div className="grid grid-cols-1 gap-2">
                      <Button
                        variant={config.layout === "default" ? "default" : "outline"}
                        className="w-full"
                        onClick={() => handleChange("layout", "default")}
                      >
                        Default
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Gauge Columns</h3>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleChange("gaugeColumns", Math.max(1, config.gaugeColumns - 1))}
                      >
                        -
                      </Button>
                      <Input
                        type="number"
                        min="1"
                        max="7"
                        value={config.gaugeColumns}
                        onChange={(e) => handleChange("gaugeColumns", Number.parseInt(e.target.value) || 1)}
                        className="w-16 text-center"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleChange("gaugeColumns", Math.min(7, config.gaugeColumns + 1))}
                      >
                        +
                      </Button>
                      <div className="ml-2 flex items-center gap-1">
                        {Array.from({ length: config.gaugeColumns }).map((_, i) => (
                          <div key={i} className="w-4 h-8 bg-muted rounded-sm"></div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Graphs Position</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={config.graphsPosition === "left" ? "default" : "outline"}
                        className="w-full"
                        onClick={() => handleChange("graphsPosition", "left")}
                      >
                        <Columns className="h-4 w-4 mr-2" />
                        Left
                      </Button>
                      <Button
                        variant={config.graphsPosition === "right" ? "default" : "outline"}
                        className="w-full"
                        onClick={() => handleChange("graphsPosition", "right")}
                      >
                        <Columns className="h-4 w-4 mr-2 rotate-180" />
                        Right
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="order" className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Component Order</h3>
                  <p className="text-xs text-muted-foreground">Drag to reorder components on the dashboard</p>

                  <div className="space-y-2 mt-4">
                    {config.componentOrder.map((id, index) => {
                      const labels = {
                        gauges: "Gauges",
                        graphs: "Graphs",
                        alerts: "Alerts",
                        summary: "Summary",
                      }

                      return (
                        <div key={id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                          <div className="flex items-center">
                            <Grip className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{labels[id as keyof typeof labels]}</span>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={index === 0}
                              onClick={() => handleOrderChange(id, "up")}
                            >
                              ↑
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={index === config.componentOrder.length - 1}
                              onClick={() => handleOrderChange(id, "down")}
                            >
                              ↓
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div>
              <Button variant="outline" onClick={resetToDefaults} className="mr-2">
                Reset
              </Button>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  )
}