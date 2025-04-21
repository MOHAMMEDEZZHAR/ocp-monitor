"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Download, Search, X } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"

interface AlertTableProps {
  alertHistory: any[]
  tagDescriptions: Record<string, { label: string; unit: string; min: number; max: number }>
}

export function AlertTable({ alertHistory, tagDescriptions }: AlertTableProps) {
  const [filteredAlerts, setFilteredAlerts] = useState(alertHistory)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTag, setFilterTag] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortBy, setSortBy] = useState<{ field: string; direction: "asc" | "desc" }>({
    field: "timestamp",
    direction: "desc",
  })

  // Apply filters and sorting when dependencies change
  useEffect(() => {
    let result = [...alertHistory]

    // Apply tag filter
    if (filterTag !== "all") {
      result = result.filter((alert) => alert.tag === filterTag)
    }

    // Apply status filter
    if (filterStatus !== "all") {
      result = result.filter((alert) => alert.statut === filterStatus)
    }

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (alert) =>
          alert.tag.toLowerCase().includes(term) ||
          (tagDescriptions[alert.tag]?.label || "").toLowerCase().includes(term) ||
          alert.statut.toLowerCase().includes(term),
      )
    }

    // Apply sorting
    result.sort((a, b) => {
      let valueA, valueB

      switch (sortBy.field) {
        case "timestamp":
          valueA = new Date(a.historyTimestamp).getTime()
          valueB = new Date(b.historyTimestamp).getTime()
          break
        case "tag":
          valueA = a.tag
          valueB = b.tag
          break
        case "value":
          valueA = a.valeur
          valueB = b.valeur
          break
        case "status":
          valueA = a.statut
          valueB = b.statut
          break
        default:
          valueA = a[sortBy.field]
          valueB = b[sortBy.field]
      }

      if (sortBy.direction === "asc") {
        return valueA > valueB ? 1 : -1
      } else {
        return valueA < valueB ? 1 : -1
      }
    })

    setFilteredAlerts(result)
  }, [alertHistory, searchTerm, filterTag, filterStatus, sortBy])

  // Get unique tags and statuses for filters
  const uniqueTags = Array.from(new Set(alertHistory.map((alert) => alert.tag)))
  const uniqueStatuses = Array.from(new Set(alertHistory.map((alert) => alert.statut)))

  // Handle sort click
  const handleSort = (field: string) => {
    setSortBy((prev) => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }))
  }

  // Export to CSV
  const exportToCSV = () => {
    const headers = ["Timestamp", "Tag", "Label", "Value", "Unit", "Status"]
    const csvRows = [headers.join(",")]

    filteredAlerts.forEach((alert) => {
      const tagInfo = tagDescriptions[alert.tag] || { label: "Unknown", unit: "" }
      const row = [
        `"${format(new Date(alert.historyTimestamp), "yyyy-MM-dd HH:mm:ss")}"`,
        `"${alert.tag}"`,
        `"${tagInfo.label}"`,
        `"${alert.valeur.toFixed(2)}"`,
        `"${tagInfo.unit}"`,
        `"${alert.statut}"`,
      ]
      csvRows.push(row.join(","))
    })

    const csvContent = csvRows.join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `alert-history-${format(new Date(), "yyyy-MM-dd-HH-mm-ss")}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span>Alert History ({filteredAlerts.length})</span>
          </CardTitle>

          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-9 md:w-[200px]"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full aspect-square rounded-l-none"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Select value={filterTag} onValueChange={setFilterTag}>
                <SelectTrigger className="h-9 w-[130px]">
                  <SelectValue placeholder="Filter by tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  {Object.keys(tagDescriptions).map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tagDescriptions[tag]?.label || tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-9 w-[130px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="OK">OK</SelectItem>
                  <SelectItem value="OFF">OFF</SelectItem>
                  {uniqueStatuses
                    .filter((status) => status !== "OK" && status !== "OFF")
                    .map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon" className="h-9 w-9" onClick={exportToCSV} title="Export to CSV">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] w-full">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("timestamp")}>
                    Timestamp {sortBy.field === "timestamp" && (sortBy.direction === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("tag")}>
                    Tag/Label {sortBy.field === "tag" && (sortBy.direction === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead className="cursor-pointer text-right" onClick={() => handleSort("value")}>
                    Value {sortBy.field === "value" && (sortBy.direction === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>
                    Status {sortBy.field === "status" && (sortBy.direction === "asc" ? "↑" : "↓")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlerts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No alerts found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAlerts.map((alert) => {
                    const tagInfo = tagDescriptions[alert.tag] || { label: "Unknown", unit: "" }
                    return (
                      <TableRow key={alert.id}>
                        <TableCell className="font-mono text-xs">
                          {format(new Date(alert.historyTimestamp), "yyyy-MM-dd HH:mm:ss")}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{tagInfo.label}</div>
                          <div className="text-xs text-muted-foreground">{alert.tag}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-medium">{alert.valeur.toFixed(2)}</span>
                          <span className="text-xs text-muted-foreground ml-1">{tagInfo.unit}</span>
                        </TableCell>
                        <TableCell>
                          <div
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              alert.statut === "OK"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                            }`}
                          >
                            {alert.statut}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
