import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

interface GaugeCardProps {
  value: number
  tag: string
  status: string
  timestamp: string
  label?: string
  unit?: string
  min?: number
  max?: number
}

export function GaugeCard({ value, tag, status, timestamp, label, unit = "°C", min = 1, max = 15 }: GaugeCardProps) {
  const isOutOfRange = value < min || value > max

  console.log(`GaugeCard for tag ${tag}: value=${value}, status=${status}, min=${min}, max=${max}, isOutOfRange=${isOutOfRange}`);

  return (
    <Card className="relative">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label || tag}</CardTitle>
        {isOutOfRange && <AlertTriangle className="h-4 w-4 text-red-500" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toFixed(2)} {unit}</div>
        <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isOutOfRange ? "bg-red-500" : "bg-green-500"
            }`}
            style={{
              width: `${Math.min(((value - min) / (max - min)) * 100, 100)}%`,
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{min}{unit}</span>
          <span>{max}{unit}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Status: <span className={status === "OK" ? "text-green-500" : "text-red-500"}>{status}</span>
        </p>
        <p className="text-xs text-muted-foreground">
          ID: {tag}
        </p>
        <p className="text-xs text-muted-foreground">
          Updated: {timestamp}
        </p>
      </CardContent>
    </Card>
  )
}