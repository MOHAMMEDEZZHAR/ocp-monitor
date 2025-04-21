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
      console.log("Connecting to WebSocket for historical data...")
      const ws = new WebSocket("ws://localhost:1880/ws/change")

      // Set a timeout for the connection
      const connectionTimeout = setTimeout(() => {
        console.log("WebSocket connection timeout")
        ws.close()
        setError("Connection timeout. Server might be unavailable.")
        setIsLoading(false)
      }, 5000)

      ws.onopen = () => {
        clearTimeout(connectionTimeout)
        console.log("WebSocket connected for historical data")
        // Request historical data
        ws.send(JSON.stringify({ type: "get_history" }))
      }

      ws.onmessage = (event) => {
        try {
          console.log("Received historical data from WebSocket")
          const parsedData = JSON.parse(event.data)
          setHistoricalData(parsedData)
          setIsLoading(false)
          ws.close()
        } catch (error) {
          console.error("Error parsing WebSocket historical data:", error)
          setError("Failed to parse historical data")
          setIsLoading(false)
          ws.close()
        }
      }

      ws.onclose = (event) => {
        clearTimeout(connectionTimeout)
        console.log("WebSocket for historical data closed:", event.code, event.reason)
        if (isLoading && !event.wasClean) {
          setError(`Connection closed unexpectedly: ${event.code}`)
          setIsLoading(false)
        }
      }

      ws.onerror = () => {
        clearTimeout(connectionTimeout)
        console.error("WebSocket error for historical data")
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
