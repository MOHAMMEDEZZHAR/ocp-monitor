import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface AlertPanelProps {
  alerts: any[]
  tagDescriptions: Record<string, { label: string; unit: string; min: number; max: number }>
}

export function AlertPanel({ alerts, tagDescriptions }: AlertPanelProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <span>Active Alerts ({alerts.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No active alerts</div>
          ) : (
            <div className="space-y-2">
              {alerts.map((alert, index) => {
                const tagInfo = tagDescriptions[alert.tag] || {
                  label: alert.tag,
                  unit: "N/A",
                  min: 0,
                  max: 0,
                }
                const alertMessage =
                  alert.valeur < tagInfo.min
                    ? `Below minimum (${tagInfo.min} ${tagInfo.unit})`
                    : `Above maximum (${tagInfo.max} ${tagInfo.unit})`

                return (
                  <Card key={index} className="bg-red-50 border-red-200">
                    <CardContent className="p-3">
                      <div className="font-medium">{tagInfo.label}</div>
                      <div className="text-sm text-gray-500">
                        Current: {alert.valeur.toFixed(2)} {tagInfo.unit} - {alertMessage}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(alert.horodatage).toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}