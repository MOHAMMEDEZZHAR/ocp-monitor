import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, CheckCircle } from "lucide-react"

interface GaugeCardProps {
  tag: string
  value: number
  status: string
  timestamp: string
  label: string
  unit: string
  min: number
  max: number
}

export function GaugeCard({ tag, value, status, timestamp, label, unit, min, max }: GaugeCardProps) {
  const isAlert = value < min || value > max || status !== "OK"
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))

  return (
    <Card className={`${isAlert ? "border-red-500 dark:border-red-500" : ""}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex justify-between items-center">
          <span>{label}</span>
          {isAlert ? (
            <AlertTriangle className="h-4 w-4 text-red-500" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-2 flex items-end">
          {value.toFixed(2)}
          <span className="text-sm text-muted-foreground ml-1">{unit}</span>
        </div>

        <Progress
          value={percentage}
          className={isAlert ? "bg-red-200 dark:bg-red-900/30" : "bg-gray-200 dark:bg-gray-800"}
          indicatorClassName={isAlert ? "bg-red-500" : "bg-green-500"}
        />

        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>
            {min} {unit}
          </span>
          <span>
            {max} {unit}
          </span>
        </div>

        <div className="mt-2 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Status: {status}</span>
            <span>ID: {tag}</span>
          </div>
          <div className="truncate">Updated: {new Date(timestamp).toLocaleString()}</div>
        </div>
      </CardContent>
    </Card>
  )
}
