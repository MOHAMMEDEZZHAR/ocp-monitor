// Add these constants at the top of the file
const THRESHOLD_KEY = "custom_thresholds"
const DARK_MODE_KEY = "dark_mode"
const LANGUAGE_KEY = "language"

// Save alerts to localStorage
export const saveAlerts = (alerts: any[]) => {
  try {
    localStorage.setItem("opcua-alerts", JSON.stringify(alerts))
  } catch (error) {
    console.error("Error saving alerts to localStorage:", error)
  }
}

// Load alerts from localStorage
export const loadAlerts = (): any[] => {
  try {
    const savedAlerts = localStorage.getItem("opcua-alerts")
    return savedAlerts ? JSON.parse(savedAlerts) : []
  } catch (error) {
    console.error("Error loading alerts from localStorage:", error)
    return []
  }
}

// Add an alert to history - NOT USED ANYMORE, logic moved to Dashboard component
export const addAlertToHistory = (alert: any) => {
  try {
    // Get existing alert history
    const alertHistory = loadAlertHistory()

    // Add the new alert with a timestamp if it doesn't have one
    const alertWithTimestamp = {
      ...alert,
      historyTimestamp: alert.historyTimestamp || new Date().toISOString(),
      id: `${alert.tag}-${Date.now()}`, // Add a unique ID
    }

    // Add to the beginning of the array (newest first)
    alertHistory.unshift(alertWithTimestamp)

    // Keep only the last 100 alerts
    const trimmedHistory = alertHistory.slice(0, 100)

    // Save back to localStorage
    localStorage.setItem("opcua-alert-history", JSON.stringify(trimmedHistory))

    return trimmedHistory
  } catch (error) {
    console.error("Error adding alert to history:", error)
    return []
  }
}

// Load alert history from localStorage
export const loadAlertHistory = (): any[] => {
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
  try {
    localStorage.removeItem("opcua-alert-history")
  } catch (error) {
    console.error("Error clearing alert history:", error)
  }
}

// Save settings to localStorage
export const saveSettings = (settings: any) => {
  try {
    localStorage.setItem("opcua-settings", JSON.stringify(settings))
  } catch (error) {
    console.error("Error saving settings to localStorage:", error)
  }
}

// Load settings from localStorage
export const loadSettings = (): any => {
  try {
    const savedSettings = localStorage.getItem("opcua-settings")
    return savedSettings ? JSON.parse(savedSettings) : {}
  } catch (error) {
    console.error("Error loading settings from localStorage:", error)
    return {}
  }
}

// Add these functions for threshold management
export const saveThresholds = (thresholds: any[]) => {
  try {
    localStorage.setItem(THRESHOLD_KEY, JSON.stringify(thresholds))
  } catch (error) {
    console.error("Error saving thresholds to localStorage:", error)
  }
}

export const loadThresholds = () => {
  try {
    const savedThresholds = localStorage.getItem(THRESHOLD_KEY)
    return savedThresholds ? JSON.parse(savedThresholds) : null
  } catch (error) {
    console.error("Error loading thresholds from localStorage:", error)
    return null
  }
}

// Add these functions for dark mode
export const saveDarkMode = (isDarkMode: boolean) => {
  try {
    localStorage.setItem(DARK_MODE_KEY, JSON.stringify(isDarkMode))
  } catch (error) {
    console.error("Error saving dark mode to localStorage:", error)
  }
}

export const loadDarkMode = () => {
  try {
    const savedMode = localStorage.getItem(DARK_MODE_KEY)
    return savedMode ? JSON.parse(savedMode) : false
  } catch (error) {
    console.error("Error loading dark mode from localStorage:", error)
    return false
  }
}

// Add these functions for language
export const saveLanguage = (language: string) => {
  try {
    localStorage.setItem(LANGUAGE_KEY, language)
  } catch (error) {
    console.error("Error saving language to localStorage:", error)
  }
}

export const loadLanguage = () => {
  try {
    return localStorage.getItem(LANGUAGE_KEY) || "en"
  } catch (error) {
    console.error("Error loading language from localStorage:", error)
    return "en"
  }
}
