"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings, Save, X, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react"
import { saveSettings, loadSettings, saveThresholds, loadThresholds } from "@/utils/storage"
import { defaultThresholds, type TagThreshold } from "@/config/thresholds"

// Type pour les notifications
type NotificationType = "success" | "error" | "warning" | null
interface Notification {
  type: NotificationType
  message: string
}

interface SettingsPanelProps {
  language?: string
}

export function SettingsPanel({ language = "en" }: SettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [thresholds, setThresholds] = useState<TagThreshold[]>(defaultThresholds)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // État pour les notifications
  const [notification, setNotification] = useState<Notification | null>(null)

  // Traductions
  const translations = {
    title: {
      en: "Alert Threshold Settings",
      fr: "Paramètres des Seuils d'Alerte",
      es: "Configuración de Umbrales de Alerta",
      de: "Alarmschwellenwert-Einstellungen",
    },
    validationError: {
      en: "Please fix the following errors:",
      fr: "Veuillez corriger les erreurs suivantes :",
      es: "Por favor, corrija los siguientes errores:",
      de: "Bitte beheben Sie die folgenden Fehler:",
    },
    min: {
      en: "Min",
      fr: "Min",
      es: "Mín",
      de: "Min",
    },
    max: {
      en: "Max",
      fr: "Max",
      es: "Máx",
      de: "Max",
    },
    cancel: {
      en: "Cancel",
      fr: "Annuler",
      es: "Cancelar",
      de: "Abbrechen",
    },
    save: {
      en: "Save Settings",
      fr: "Enregistrer",
      es: "Guardar",
      de: "Speichern",
    },
    successSave: {
      en: "Threshold settings saved successfully.",
      fr: "Paramètres des seuils enregistrés avec succès.",
      es: "Configuración de umbrales guardada con éxito.",
      de: "Schwellenwerteinstellungen erfolgreich gespeichert.",
    },
    successWs: {
      en: "Thresholds sent to server successfully.",
      fr: "Seuils envoyés au serveur avec succès.",
      es: "Umbrales enviados al servidor con éxito.",
      de: "Schwellenwerte erfolgreich an den Server gesendet.",
    },
    errorWs: {
      en: "Unable to send thresholds to server.",
      fr: "Impossible d'envoyer les seuils au serveur.",
      es: "No se pueden enviar umbrales al servidor.",
      de: "Schwellenwerte können nicht an den Server gesendet werden.",
    },
  }

  // Load settings and thresholds from localStorage on component mount
  useEffect(() => {
    const savedSettings = loadSettings()
    const savedThresholds = loadThresholds()

    if (savedThresholds) {
      setThresholds(savedThresholds)
    } else if (savedSettings?.thresholds) {
      // For backward compatibility
      setThresholds(savedSettings.thresholds)
    }
  }, [])

  // Fonction pour envoyer les seuils via WebSocket
  const sendThresholdsViaWebSocket = (thresholds: TagThreshold[]) => {
    return new Promise<void>((resolve, reject) => {
      try {
        console.log("Initializing WebSocket connection to ws://localhost:1880/ws/historique")
        const ws = new WebSocket("ws://localhost:1880/ws/historique")

        // Définir un timeout pour la connexion
        const connectionTimeout = setTimeout(() => {
          console.error("WebSocket connection timeout")
          ws.close()
          reject(new Error("Connection timeout"))
        }, 5000)

        ws.onopen = () => {
          clearTimeout(connectionTimeout)
          console.log("WebSocket connected, sending threshold updates")

          // Format the payload as specified
          const payload: Record<string, { min: number; max: number }> = {}
          thresholds.forEach((threshold) => {
            payload[threshold.tag] = { min: threshold.min, max: threshold.max }
          })

          const message = JSON.stringify({
            type: "update_thresholds",
            payload,
          })

          console.log("Sending WebSocket message:", message)
          ws.send(message)

          // Attendre un peu avant de fermer pour s'assurer que le message est envoyé
          setTimeout(() => {
            ws.close()
            console.log("WebSocket closed after sending")
            resolve()
          }, 1000)
        }

        ws.onmessage = (event) => {
          console.log("Received WebSocket response:", event.data)
          try {
            const response = JSON.parse(event.data)
            if (response.status === "success") {
              resolve()
            } else {
              reject(new Error(response.message || "Unknown error"))
            }
          } catch (error) {
            console.error("Error parsing WebSocket response:", error)
            reject(error)
          }
        }

        ws.onerror = (error) => {
          clearTimeout(connectionTimeout)
          console.error("WebSocket error:", error)
          reject(error)
        }

        ws.onclose = (event) => {
          clearTimeout(connectionTimeout)
          console.log("WebSocket closed:", event.code, event.reason)
          if (!event.wasClean) {
            reject(new Error(`WebSocket closed unexpectedly: ${event.code} ${event.reason}`))
          }
        }
      } catch (error) {
        console.error("Error setting up WebSocket:", error)
        reject(error)
      }
    })
  }

  const handleSave = async () => {
    // Validate thresholds
    const errors: Record<string, string> = {}
    thresholds.forEach((threshold) => {
      if (threshold.min >= threshold.max) {
        errors[threshold.tag] = `Min value must be less than max value for ${threshold.label}`
      }
    })

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    // Clear validation errors
    setValidationErrors({})

    // Save thresholds to localStorage
    saveThresholds(thresholds)

    // For backward compatibility
    saveSettings({ thresholds })

    // Afficher notification de succès pour la sauvegarde locale
    setNotification({
      type: "success",
      message: translations.successSave[language as keyof typeof translations.successSave],
    })

    // Send thresholds to Node-RED via WebSocket
    try {
      await sendThresholdsViaWebSocket(thresholds)
      setNotification({
        type: "success",
        message: translations.successWs[language as keyof typeof translations.successWs],
      })
    } catch (error) {
      console.error("Failed to send thresholds via WebSocket:", error)
      setNotification({
        type: "error",
        message: translations.errorWs[language as keyof typeof translations.errorWs],
      })
    }

    // Fermer le panneau après un court délai pour que l'utilisateur puisse voir la notification
    setTimeout(() => {
      setIsOpen(false)
      // Effacer la notification après la fermeture
      setTimeout(() => setNotification(null), 500)
    }, 1500)
  }

  const handleChange = (tag: string, field: "min" | "max", value: string) => {
    setThresholds((prev) =>
      prev.map((item) => (item.tag === tag ? { ...item, [field]: Number.parseFloat(value) || 0 } : item)),
    )

    // Clear validation error for this tag when user makes changes
    if (validationErrors[tag]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[tag]
        return newErrors
      })
    }
  }

  // Composant de notification simple
  const NotificationDisplay = () => {
    if (!notification) return null

    const bgColor =
      notification.type === "success"
        ? "bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800"
        : notification.type === "error"
          ? "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800"
          : "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800"

    const textColor =
      notification.type === "success"
        ? "text-green-800 dark:text-green-200"
        : notification.type === "error"
          ? "text-red-800 dark:text-red-200"
          : "text-yellow-800 dark:text-yellow-200"

    const Icon =
      notification.type === "success" ? CheckCircle : notification.type === "error" ? AlertTriangle : AlertCircle

    return (
      <div className={`fixed top-4 right-4 z-[100] p-4 rounded-md border ${bgColor} shadow-lg max-w-md`}>
        <div className={`flex items-center gap-2 ${textColor}`}>
          <Icon className="h-5 w-5" />
          <p>{notification.message}</p>
        </div>
      </div>
    )
  }

  if (!isOpen) {
    return (
      <>
        {notification && <NotificationDisplay />}
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 right-4 z-50 rounded-full h-12 w-12 shadow-lg"
          onClick={() => setIsOpen(true)}
        >
          <Settings className="h-5 w-5" />
        </Button>
      </>
    )
  }

  return (
    <>
      {notification && <NotificationDisplay />}
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>{translations.title[language as keyof typeof translations.title]}</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[70vh] overflow-y-auto">
            <div className="space-y-4">
              {Object.keys(validationErrors).length > 0 && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 p-3 rounded-md mb-4">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-medium">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{translations.validationError[language as keyof typeof translations.validationError]}</span>
                  </div>
                  <ul className="mt-2 text-sm text-red-600 dark:text-red-400 pl-6 list-disc">
                    {Object.values(validationErrors).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {thresholds.map((threshold) => (
                <div
                  key={threshold.tag}
                  className={`grid grid-cols-12 gap-4 items-center p-2 rounded-md ${
                    validationErrors[threshold.tag]
                      ? "bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800"
                      : ""
                  }`}
                >
                  <div className="col-span-4">
                    <Label>{threshold.label}</Label>
                  </div>
                  <div className="col-span-3">
                    <Label htmlFor={`${threshold.tag}-min`} className="text-xs text-muted-foreground">
                      {translations.min[language as keyof typeof translations.min]} ({threshold.unit})
                    </Label>
                    <Input
                      id={`${threshold.tag}-min`}
                      type="number"
                      value={threshold.min}
                      onChange={(e) => handleChange(threshold.tag, "min", e.target.value)}
                      className={validationErrors[threshold.tag] ? "border-red-500" : ""}
                    />
                  </div>
                  <div className="col-span-3">
                    <Label htmlFor={`${threshold.tag}-max`} className="text-xs text-muted-foreground">
                      {translations.max[language as keyof typeof translations.max]} ({threshold.unit})
                    </Label>
                    <Input
                      id={`${threshold.tag}-max`}
                      type="number"
                      value={threshold.max}
                      onChange={(e) => handleChange(threshold.tag, "max", e.target.value)}
                      className={validationErrors[threshold.tag] ? "border-red-500" : ""}
                    />
                  </div>
                  <div className="col-span-2 text-center text-xs text-muted-foreground">{threshold.tag}</div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              {translations.cancel[language as keyof typeof translations.cancel]}
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              {translations.save[language as keyof typeof translations.save]}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  )
}
