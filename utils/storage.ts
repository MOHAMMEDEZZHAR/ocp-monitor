const THRESHOLD_KEY = "custom_thresholds"
const DARK_MODE_KEY = "dark_mode"
const LANGUAGE_KEY = "language"
const DASHBOARD_CONFIG_KEY = "dashboard-config"

const isBrowser = typeof window !== "undefined"

// Interface pour les seuils
interface Threshold {
  tag: string
  label: string
  unit: string
  min: number
  max: number
}

// Interface pour dashboardConfig (basée sur DashboardConfigType dans dashboard.tsx)
interface DashboardConfig {
  showGauges: boolean
  showGraphs: boolean
  showAlerts: boolean
  showSummary: boolean
  layout: "default" | "compact" | "expanded"
  gaugeColumns: number
  graphsPosition: "left" | "right" | "full"
  editMode: boolean
  componentOrder: string[]
}

// Save alerts to localStorage
export const saveAlerts = (alerts: any[]) => {
  if (!isBrowser) return
  try {
    localStorage.setItem("opcua-alerts", JSON.stringify(alerts))
  } catch (error) {
    console.error("Error saving alerts to localStorage:", error)
  }
}

// Load alerts from localStorage
export const loadAlerts = (): any[] => {
  if (!isBrowser) return []
  try {
    const savedAlerts = localStorage.getItem("opcua-alerts")
    return savedAlerts ? JSON.parse(savedAlerts) : []
  } catch (error) {
    console.error("Error loading alerts from localStorage:", error)
    return []
  }
}

// Add an alert to history - NOT USED ANYMORE
export const addAlertToHistory = (alert: any) => {
  if (!isBrowser) return []
  try {
    const alertHistory = loadAlertHistory()

    const alertWithTimestamp = {
      ...alert,
      historyTimestamp: alert.historyTimestamp || new Date().toISOString(),
      id: `${alert.tag}-${Date.now()}`,
    }

    alertHistory.unshift(alertWithTimestamp)
    const trimmedHistory = alertHistory.slice(0, 100)

    localStorage.setItem("opcua-alert-history", JSON.stringify(trimmedHistory))
    return trimmedHistory
  } catch (error) {
    console.error("Error adding alert to history:", error)
    return []
  }
}

// Load alert history from localStorage
export const loadAlertHistory = (): any[] => {
  if (!isBrowser) return []
  try {
    const alertHistory = localStorage.getItem("opcua-alert-history")
    return alertHistory ? JSON.parse(alertHistory) : []
  } catch (error) {
    console.error("Error loading alert history:", error)
    return []
  }
}

// Clear alert history
export const clearAlertHistory = () => {
  if (!isBrowser) return
  try {
    localStorage.removeItem("opcua-alert-history")
  } catch (error) {
    console.error("Error clearing alert history:", error)
  }
}

// Save settings to localStorage
export const saveSettings = (settings: any) => {
  if (!isBrowser) return
  try {
    localStorage.setItem("opcua-settings", JSON.stringify(settings))
  } catch (error) {
    console.error("Error saving settings to localStorage:", error)
  }
}

// Load settings from localStorage
export const loadSettings = (): any => {
  if (!isBrowser) return {}
  try {
    const savedSettings = localStorage.getItem("opcua-settings")
    return savedSettings ? JSON.parse(savedSettings) : {}
  } catch (error) {
    console.error("Error loading settings from localStorage:", error)
    return {}
  }
}

// Save thresholds
export const saveThresholds = (thresholds: Threshold[]) => {
  if (!isBrowser) return
  try {
    localStorage.setItem(THRESHOLD_KEY, JSON.stringify(thresholds))
  } catch (error) {
    console.error("Error saving thresholds to localStorage:", error)
  }
}

// Load thresholds
export const loadThresholds = (): Threshold[] => {
  if (!isBrowser) return []
  try {
    const savedThresholds = localStorage.getItem(THRESHOLD_KEY)
    return savedThresholds ? JSON.parse(savedThresholds) : []
  } catch (error) {
    console.error("Error loading thresholds from localStorage:", error)
    return []
  }
}

// Save dark mode
export const saveDarkMode = (isDarkMode: boolean) => {
  if (!isBrowser) return
  try {
    localStorage.setItem(DARK_MODE_KEY, JSON.stringify(isDarkMode))
  } catch (error) {
    console.error("Error saving dark mode to localStorage:", error)
  }
}

// Load dark mode
export const loadDarkMode = (): boolean => {
  if (!isBrowser) return false
  try {
    const savedMode = localStorage.getItem(DARK_MODE_KEY)
    return savedMode ? JSON.parse(savedMode) : false
  } catch (error) {
    console.error("Error loading dark mode from localStorage:", error)
    return false
  }
}

// Save language
export const saveLanguage = (language: string) => {
  if (!isBrowser) return
  try {
    localStorage.setItem(LANGUAGE_KEY, language)
  } catch (error) {
    console.error("Error saving language to localStorage:", error)
  }
}

// Load language
export const loadLanguage = (): string => {
  if (!isBrowser) return "en"
  try {
    return localStorage.getItem(LANGUAGE_KEY) || "en"
  } catch (error) {
    console.error("Error loading language from localStorage:", error)
    return "en"
  }
}

// Save dashboard config
export const saveDashboardConfig = (config: DashboardConfig) => {
  if (!isBrowser) return
  try {
    localStorage.setItem(DASHBOARD_CONFIG_KEY, JSON.stringify(config))
  } catch (error) {
    console.error("Error saving dashboard config to localStorage:", error)
  }
}

// Load dashboard config
export const loadDashboardConfig = (): DashboardConfig | null => {
  if (!isBrowser) return null
  try {
    const savedConfig = localStorage.getItem(DASHBOARD_CONFIG_KEY)
    return savedConfig ? JSON.parse(savedConfig) : null
  } catch (error) {
    console.error("Error loading dashboard config from localStorage:", error)
    return null
  }
}