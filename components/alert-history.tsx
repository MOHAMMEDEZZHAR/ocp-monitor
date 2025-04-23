"use client"

import { Button } from "@/components/ui/button"
import { clearAlertHistory } from "@/utils/storage"
import { Trash2 } from "lucide-react"
import { AlertTable } from "./alert-table"

interface AlertHistoryProps {
  alertHistory: any[]
  tagDescriptions: Record<string, { label: string; unit: string; min: number; max: number }>
  setAlertHistory: (history: any[]) => void
  isEditMode?: boolean
}

export function AlertHistory({ alertHistory, tagDescriptions, setAlertHistory, isEditMode }: AlertHistoryProps) {
  const handleClearHistory = () => {
    clearAlertHistory()
    setAlertHistory([])
  }

  // Filter out alerts with OK status
  const filteredAlertHistory = alertHistory.filter(alert => alert.statut !== "OK")

  return (
    <div className="space-y-4">
     
        <div className="flex justify-end">
          <Button variant="destructive" size="sm" onClick={handleClearHistory}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear History
          </Button>
        </div>
     
      <AlertTable alertHistory={filteredAlertHistory} tagDescriptions={tagDescriptions} />
    </div>
  )
}
