"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface HistoryContextType {
  historicalData: any[] | null
  isLoading: boolean
  error: string | null
  fetchHistory: () => void
}

const HistoryContext = createContext<HistoryContextType>({
  historicalData: null,
  isLoading: false,
  error: null,
  fetchHistory: () => {},
})

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [historicalData, setHistoricalData] = useState<any[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchHistory = () => {
    setIsLoading(true)
    setError(null)

    try {
      const ws = new WebSocket("ws://localhost:1880/ws/historique")

      ws.onopen = () => {
        console.log("WebSocket connected for historical data")
        // Request historical data
        ws.send(JSON.stringify({ type: "get_history" }))
      }

      ws.onmessage = (event) => {
        try {
          const parsedData = JSON.parse(event.data)
          setHistoricalData(parsedData)
          setIsLoading(false)
        } catch (error) {
          console.error("Error parsing WebSocket historical data:", error)
          setError("Failed to parse historical data")
          setIsLoading(false)
        }
      }

      ws.onclose = () => {
        console.log("WebSocket for historical data closed")
      }

      ws.onerror = (error) => {
        console.error("WebSocket error for historical data:", error)
        setError("Failed to connect to historical data service")
        setIsLoading(false)
        ws.close()
      }
    } catch (error) {
      console.error("Error setting up WebSocket for historical data:", error)
      setError("Failed to set up connection to historical data service")
      setIsLoading(false)
    }
  }

  // Fetch historical data on component mount
  useEffect(() => {
    fetchHistory()
  }, [])

  return (
    <HistoryContext.Provider value={{ historicalData, isLoading, error, fetchHistory }}>
      {children}
    </HistoryContext.Provider>
  )
}

export function useHistory() {
  return useContext(HistoryContext)
}
