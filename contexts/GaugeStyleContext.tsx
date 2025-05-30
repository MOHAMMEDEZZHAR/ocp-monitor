"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

type GaugeStyle = 'classic' | 'modern'

interface GaugeStyleContextType {
  gaugeStyle: GaugeStyle
  setGaugeStyle: (style: GaugeStyle) => void
  toggleGaugeStyle: () => void
}

const GaugeStyleContext = createContext<GaugeStyleContextType | undefined>(undefined)

export function GaugeStyleProvider({ children }: { children: ReactNode }) {
  const [gaugeStyle, setGaugeStyle] = useState<GaugeStyle>('classic')

  // Charger le style depuis le stockage local
  useEffect(() => {
    const savedStyle = localStorage.getItem('gaugeStyle') as GaugeStyle | null
    if (savedStyle) {
      setGaugeStyle(savedStyle)
    }
  }, [])

  // Sauvegarder le style dans le stockage local
  const updateGaugeStyle = (style: GaugeStyle) => {
    setGaugeStyle(style)
    localStorage.setItem('gaugeStyle', style)
  }

  const toggleGaugeStyle = () => {
    const newStyle = gaugeStyle === 'classic' ? 'modern' : 'classic'
    updateGaugeStyle(newStyle)
  }

  return (
    <GaugeStyleContext.Provider 
      value={{ 
        gaugeStyle, 
        setGaugeStyle: updateGaugeStyle, 
        toggleGaugeStyle 
      }}
    >
      {children}
    </GaugeStyleContext.Provider>
  )
}

export function useGaugeStyle() {
  const context = useContext(GaugeStyleContext)
  if (context === undefined) {
    throw new Error('useGaugeStyle must be used within a GaugeStyleProvider')
  }
  return context
}
