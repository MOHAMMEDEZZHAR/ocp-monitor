"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { loadThresholds } from "@/utils/storage"
import { defaultThresholds } from "@/config/thresholds"

// Interfaces pour le typage
interface Threshold {
  tag: string
  label: string
  unit: string
}

interface TagData {
  tag: string
  valeur: number
}

interface HistoricalDataItem {
  timestamp: string | Date
  donnees?: TagData[]
}

interface GraphsSectionProps {
  historicalData: HistoricalDataItem[]
  isDarkMode: boolean
}

export function GraphsSection({ historicalData, isDarkMode }: GraphsSectionProps) {
  const [activeTag, setActiveTag] = useState<string>("Tag_1001")
  const [thresholdsList, setThresholdsList] = useState<Threshold[]>(defaultThresholds)

  // Charger les seuils dans un useEffect
  useEffect(() => {
    const thresholds = loadThresholds() || defaultThresholds
    setThresholdsList(thresholds)
  }, [])

  // Traiter les données pour le tag sélectionné
  const chartData = historicalData.map((item) => {
    const tagData = item.donnees?.find((d) => d.tag === activeTag)
    return {
      timestamp: new Date(item.timestamp).toLocaleTimeString(),
      value: tagData?.valeur || 0,
    }
  })

  // Créer les descriptions des tags à partir des seuils
  const tagDescriptions: Record<string, { label: string; unit: string }> = {}
  thresholdsList.forEach((item) => {
    tagDescriptions[item.tag] = {
      label: item.label,
      unit: item.unit,
    }
  })

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle>Historical Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="Tag_1001" onValueChange={setActiveTag}>
          <TabsList className="grid grid-cols-4 md:grid-cols-7 mb-4">
            {Object.keys(tagDescriptions).map((tag) => (
              <TabsTrigger key={tag} value={tag} className="text-xs">
                {tagDescriptions[tag].label.split(" ")[0]}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.keys(tagDescriptions).map((tag) => (
            <TabsContent key={tag} value={tag} className="h-[400px]">
              <ChartContainer
                config={{
                  value: {
                    label: tagDescriptions[tag].label,
                    color: isDarkMode ? "hsl(var(--chart-1))" : "hsl(var(--chart-1))",
                  },
                }}
              >
                <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
                  />
                  <XAxis
                    dataKey="timestamp"
                    tickMargin={10}
                    tickFormatter={(value: string) => value.split(":").slice(0, 2).join(":")}
                    stroke={isDarkMode ? "#aaa" : "#333"}
                  />
                  <YAxis
                    label={{
                      value: tagDescriptions[tag].unit,
                      angle: -90,
                      position: "insideLeft",
                      style: { textAnchor: "middle", fill: isDarkMode ? "#aaa" : "#333" },
                    }}
                    stroke={isDarkMode ? "#aaa" : "#333"}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="var(--color-value)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ChartContainer>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}