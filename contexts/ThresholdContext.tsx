"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { loadThresholds } from "@/utils/storage"
import { defaultThresholds, type TagThreshold } from "@/config/thresholds"

interface ThresholdContextType {
  thresholds: TagThreshold[]
  updateThresholds: (newThresholds: TagThreshold[]) => void
}

const ThresholdContext = createContext<ThresholdContextType | undefined>(undefined)

export function ThresholdProvider({ children }: { children: React.ReactNode }) {
  const [thresholds, setThresholds] = useState<TagThreshold[]>(defaultThresholds)

  useEffect(() => {
    const savedThresholds = loadThresholds()
    if (savedThresholds) {
      setThresholds(savedThresholds)
    }
  }, [])

  // WebSocket connection for real-time updates
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:1880/ws/historique")

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === "threshold_update") {
          const newThresholds = thresholds.map(threshold => {
            if (data.payload[threshold.tag]) {
              return {
                ...threshold,
                min: data.payload[threshold.tag].min,
                max: data.payload[threshold.tag].max
              }
            }
            return threshold
          })
          setThresholds(newThresholds)
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error)
      }
    }

    return () => {
      ws.close()
    }
  }, [])

  const updateThresholds = (newThresholds: TagThreshold[]) => {
    setThresholds(newThresholds)
  }

  return (
    <ThresholdContext.Provider value={{ thresholds, updateThresholds }}>
      {children}
    </ThresholdContext.Provider>
  )
}

export function useThresholds() {
  const context = useContext(ThresholdContext)
  if (context === undefined) {
    throw new Error("useThresholds must be used within a ThresholdProvider")
  }
  return context
}
