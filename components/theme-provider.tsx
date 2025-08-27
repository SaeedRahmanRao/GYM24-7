"use client"

import * as React from "react"

interface ThemeProviderProps {
  children: React.ReactNode
  attribute?: string
  defaultTheme?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

export function ThemeProvider({ 
  children, 
  attribute = "class",
  defaultTheme = "light",
  enableSystem = false,
  disableTransitionOnChange = false 
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState(defaultTheme)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    
    // Check for saved theme in localStorage
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      setTheme(savedTheme)
    } else if (enableSystem) {
      // Use system preference if enableSystem is true
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      setTheme(systemTheme)
    }
  }, [enableSystem])

  React.useEffect(() => {
    if (!mounted) return

    const root = document.documentElement
    
    if (attribute === 'class') {
      // Remove all theme classes first
      root.classList.remove('light', 'dark')
      // Add current theme class
      root.classList.add(theme)
    } else if (attribute) {
      root.setAttribute(attribute, theme)
    }

    // Save theme to localStorage
    localStorage.setItem('theme', theme)
  }, [theme, attribute, mounted])

  const value = React.useMemo(() => ({
    theme,
    setTheme,
    themes: ['light', 'dark'],
    systemTheme: mounted && enableSystem ? 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : 
      undefined
  }), [theme, mounted, enableSystem])

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

interface ThemeContextType {
  theme: string
  setTheme: (theme: string) => void
  themes: string[]
  systemTheme?: string
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = React.useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
