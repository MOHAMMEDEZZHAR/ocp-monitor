"use client"

import { Button } from "@/components/ui/button"
import { format } from "date-fns"

interface DataExportProps {
  alertHistory: any[]
  measurementData: any[]
  tagDescriptions: Record<string, { label: string; unit: string; min: number; max: number }>

}

export function DataExport({ alertHistory, measurementData, tagDescriptions }: DataExportProps) {
  const getButtonText = () => {
    return "Measurement Data"
  }

  const exportToCSV = (dataType: string) => {
    let headers: string[] = []
    let csvRows: string[] = []

    if (dataType === "alerts") {
      headers = ["Timestamp", "Tag", "Label", "Value", "Unit", "Status"]
      csvRows = [headers.join(";")]

      alertHistory.forEach((alert) => {
        const tagInfo = tagDescriptions[alert.tag] || { label: "Unknown", unit: "" }
        const row = [
          format(new Date(alert.historyTimestamp), "yyyy-MM-dd HH:mm:ss"),
          alert.tag,
          tagInfo.label,
          alert.valeur.toFixed(2),
          tagInfo.unit,
          alert.statut,
        ]
        csvRows.push(row.join(";"))
      })
    } else if (dataType === "measurements") {
      headers = ["Timestamp"]
      const tags = Object.keys(tagDescriptions)
      tags.forEach((tag) => {
        headers.push(`${tagDescriptions[tag].label} (${tag})`)
      })
      csvRows = [headers.join(";")]

      measurementData.forEach((measurement) => {
        const row: string[] = [format(new Date(measurement.timestamp), "yyyy-MM-dd HH:mm:ss")]
        tags.forEach((tag) => {
          const tagData = measurement.donnees?.find((d: any) => d.tag === tag)
          row.push(tagData ? tagData.valeur.toFixed(2) : "")
        })
        csvRows.push(row.join(";"))
      })
    }

    // Ajouter BOM pour compatibilité Excel
    const csvContent = "\uFEFF" + csvRows.join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `${dataType}-${format(new Date(), "yyyy-MM-dd-HH-mm-ss")}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => exportToCSV("measurements")}
        title="Export Measurement Data to CSV"
      >
        {getButtonText()}
      </Button>
    </div>
  )
}
