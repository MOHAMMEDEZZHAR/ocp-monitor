import { loadThresholds } from "@/utils/storage"
import { defaultThresholds } from "@/config/thresholds"

export const checkThresholds = (data: any) => {
  if (!data || !data.donnees) return []

  // Load thresholds from localStorage or use defaults
  const thresholdsList = loadThresholds() || defaultThresholds

  // Convert array to object for easier lookup
  const thresholds: Record<string, { min: number; max: number }> = {}
  thresholdsList.forEach((item) => {
    thresholds[item.tag] = { min: item.min, max: item.max }
  })

  return data.donnees.filter(
    (item: any) =>
      thresholds[item.tag] &&
      (item.valeur < thresholds[item.tag].min || item.valeur > thresholds[item.tag].max || item.statut !== "OK"),
  )
}
