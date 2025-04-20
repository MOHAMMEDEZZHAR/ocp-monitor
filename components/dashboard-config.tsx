"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Save, X, Layout, Eye, EyeOff, Columns, Rows, Grip } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Switch } from "@/components/ui/switch"

interface DashboardConfigProps {
  onConfigChange: (config: DashboardConfig) => void
  onEditModeChange: (isEditMode: boolean) => void
}

export interface DashboardConfig {
  showGauges: boolean
  showGraphs: boolean
  showAlerts: boolean
  showSummary: boolean
  layout: "default" | "compact" | "expanded"
  gaugeColumns: number
  graphsPosition: "left" | "right" | "full"
  editMode: boolean
  componentOrder: string[]
}

const defaultConfig: DashboardConfig = {
  showGauges: true,
  showGraphs: true,
  showAlerts: true,
  showSummary: true,
  layout: "default",
  gaugeColumns: 4,
  graphsPosition: "left",
  editMode: false,
  componentOrder: ["gauges", "graphs", "alerts", "summary"],
}

const DASHBOARD_CONFIG_KEY = "dashboard-config"

export function DashboardConfig({ onConfigChange, onEditModeChange }: DashboardConfigProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<DashboardConfig>(defaultConfig)
  const [activeTab, setActiveTab] = useState("visibility")

  // Load config from localStorage on component mount
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem(DASHBOARD_CONFIG_KEY)
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig)
        setConfig(parsedConfig)
        onConfigChange(parsedConfig)

        // Apply edit mode if it was saved
        if (parsedConfig.editMode) {
          onEditModeChange(parsedConfig.editMode)
        }
      }
    } catch (error) {
      console.error("Error loading dashboard config:", error)
    }
  }, [onConfigChange, onEditModeChange])

  const handleSave = () => {
    try {
      localStorage.setItem(DASHBOARD_CONFIG_KEY, JSON.stringify(config))
      onConfigChange(config)
      onEditModeChange(config.editMode)
      toast({
        title: "Success",
        description: "Dashboard configuration saved successfully.",
      })
      setIsOpen(false)
    } catch (error) {
      console.error("Error saving dashboard config:", error)
      toast({
        title: "Error",
        description: "Failed to save dashboard configuration.",
        variant: "destructive",
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
    toast({
      title: "Reset Complete",
      description: "Dashboard configuration has been reset to defaults.",
    })
  }

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 left-4 z-50 rounded-full h-12 w-12 shadow-lg"
        onClick={() => setIsOpen(true)}
      >
        <Layout className="h-5 w-5" />
      </Button>
    )
  }

  return (
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
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="layout" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Layout Preset</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={config.layout === "default" ? "default" : "outline"}
                      className="w-full"
                      onClick={() => handleChange("layout", "default")}
                    >
                      Default
                    </Button>
                    <Button
                      variant={config.layout === "compact" ? "default" : "outline"}
                      className="w-full"
                      onClick={() => handleChange("layout", "compact")}
                    >
                      Compact
                    </Button>
                    <Button
                      variant={config.layout === "expanded" ? "default" : "outline"}
                      className="w-full"
                      onClick={() => handleChange("layout", "expanded")}
                    >
                      Expanded
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
                      max="6"
                      value={config.gaugeColumns}
                      onChange={(e) => handleChange("gaugeColumns", Number.parseInt(e.target.value) || 1)}
                      className="w-16 text-center"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleChange("gaugeColumns", Math.min(6, config.gaugeColumns + 1))}
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
                  <div className="grid grid-cols-3 gap-2">
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
                    <Button
                      variant={config.graphsPosition === "full" ? "default" : "outline"}
                      className="w-full"
                      onClick={() => handleChange("graphsPosition", "full")}
                    >
                      <Rows className="h-4 w-4 mr-2" />
                      Full
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
  )
}
