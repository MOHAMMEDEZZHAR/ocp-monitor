"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface WebSocketContextType {
  data: any | null
  isConnected: boolean
  lastUpdate: Date | null
}

const WebSocketContext = createContext<WebSocketContextType>({
  data: null,
  isConnected: false,
  lastUpdate: null,
})

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [data, setData] = useState<any | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  useEffect(() => {
    const connectWebSocket = () => {
      const ws = new WebSocket("ws://localhost:1880/ws/opcua")

      ws.onopen = () => {
        console.log("WebSocket connected")
        setIsConnected(true)
      }

      ws.onmessage = (event) => {
        try {
          const parsedData = JSON.parse(event.data)
          setData(parsedData)
          setLastUpdate(new Date())
        } catch (error) {
          console.error("Error parsing WebSocket data:", error)
        }
      }

      ws.onclose = () => {
        console.log("WebSocket disconnected, attempting to reconnect...")
        setIsConnected(false)
        setTimeout(connectWebSocket, 5000)
      }

      ws.onerror = (error) => {
        console.error("WebSocket error:", error)
        ws.close()
      }

      setSocket(ws)
    }

    connectWebSocket()

    return () => {
      if (socket) {
        socket.close()
      }
    }
  }, [])

  return <WebSocketContext.Provider value={{ data, isConnected, lastUpdate }}>{children}</WebSocketContext.Provider>
}

export function useWebSocket() {
  return useContext(WebSocketContext)
}
