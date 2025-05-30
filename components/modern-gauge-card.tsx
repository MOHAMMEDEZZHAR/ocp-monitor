"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useThresholds } from "@/contexts/ThresholdContext"
import { AlertTriangle } from "lucide-react"

interface ModernGaugeCardProps {
  value: number
  tag: string
  status: string
  timestamp: string
  label?: string
  unit?: string
  min?: number
  max?: number
}

export function ModernGaugeCard({ 
  value, 
  tag, 
  status, 
  timestamp, 
  label, 
  unit = "°C", 
  min, 
  max 
}: ModernGaugeCardProps) {
  const { thresholds } = useThresholds()
  const tagThreshold = thresholds.find(t => t.tag === tag)
  const minValue = tagThreshold?.min ?? (min ?? 0)
  const maxValue = tagThreshold?.max ?? (max ?? 100)
  const isOutOfRange = value < minValue || value > maxValue
  const normalizedValue = Math.max(0, Math.min(100, ((value - minValue) / (maxValue - minValue)) * 100))
  const isInDanger = isOutOfRange || status !== "OK"

  return (
    <Card className={`relative h-full ${isInDanger ? "bg-red-50 dark:bg-red-900/40 border-red-200 dark:border-red-500" : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700"}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex justify-between items-center">
          <span className={isInDanger ? "text-red-700 dark:text-red-300" : "text-gray-900 dark:text-gray-100"}>
            {label || tag}
          </span>
          {isInDanger && <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-300 animate-pulse" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold mb-4 ${isInDanger ? "text-red-700 dark:text-red-300" : "dark:text-white"}`}>
          {value.toFixed(2)} {unit}
        </div>
        <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              isInDanger 
                ? "bg-red-500 dark:bg-red-500 animate-pulse" 
                : "bg-green-500 dark:bg-green-400"
            }`}
            style={{ width: `${normalizedValue}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300 mt-1">
          <span>{minValue} {unit}</span>
          <span>{maxValue} {unit}</span>
        </div>
        <div className="mt-4 space-y-1">
          <p className="text-xs text-gray-600 dark:text-gray-300">Status: {status}</p>
          <p className="text-xs text-gray-600 dark:text-gray-300">ID: {tag}</p>
          <p className="text-xs text-gray-600 dark:text-gray-300">
            Updated: {new Date(timestamp).toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
