"use client"

import Script from "next/script"
import { createContext, useCallback, useContext, useEffect, useState } from "react"

const STORAGE_KEY = "theme"
const DEFAULT_THEME = "light"
const THEMES = ["light", "dark"]

type ThemeContextType = {
  theme: string
  setTheme: (theme: string) => void
  themes: string[]
}

const ThemeContext = createContext<ThemeContextType>({
  theme: DEFAULT_THEME,
  setTheme: () => {},
  themes: THEMES,
})

export function useTheme() {
  return useContext(ThemeContext)
}

export function ThemeProviderWrapper({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState(DEFAULT_THEME)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME
    setThemeState(stored)
  }, [])

  const setTheme = useCallback((newTheme: string) => {
    setThemeState(newTheme)
    try { localStorage.setItem(STORAGE_KEY, newTheme) } catch {}
    document.documentElement.classList.remove("light", "dark")
    document.documentElement.classList.add(newTheme)
    document.documentElement.style.colorScheme = newTheme
  }, [])

  if (!mounted) {
    return (
      <>
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function() {
            try {
              var t = localStorage.getItem("${STORAGE_KEY}") || "${DEFAULT_THEME}";
              document.documentElement.classList.remove("light", "dark");
              document.documentElement.classList.add(t);
              document.documentElement.style.colorScheme = t;
            } catch(e) {}
          })()`}
        </Script>
        {children}
      </>
    )
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  )
}
