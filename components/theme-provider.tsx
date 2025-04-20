"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { loadDarkMode, saveDarkMode } from "@/utils/storage"

type Theme = "dark" | "light" | "system"

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
}

interface ThemeProviderState {
  theme: Theme
  isDarkMode: boolean
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  isDarkMode: false,
  setTheme: () => null,
  toggleTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({ children, defaultTheme = "system" }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false)

  useEffect(() => {
    const savedDarkMode = loadDarkMode()
    const initialTheme = savedDarkMode ? "dark" : "light"
    setTheme(initialTheme)
    setIsDarkMode(savedDarkMode)

    if (savedDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    const newDarkMode = newTheme === "dark"

    setTheme(newTheme)
    setIsDarkMode(newDarkMode)
    saveDarkMode(newDarkMode)

    if (newDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  const value = {
    theme,
    isDarkMode,
    setTheme: (theme: Theme) => {
      setTheme(theme)
      const isDark = theme === "dark"
      setIsDarkMode(isDark)
      saveDarkMode(isDark)

      if (isDark) {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
    },
    toggleTheme,
  }

  return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
