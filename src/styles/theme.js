import { useCallback } from 'react'

const THEME_STORAGE_KEY = 'rankly.theme'

export function getPreferredTheme() {
  const stored =
    typeof window !== 'undefined' ? window.localStorage.getItem(THEME_STORAGE_KEY) : null
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export function applyTheme(theme) {
  const root = document.documentElement
  root.setAttribute('data-theme', theme)
}

export function useTheme() {
  const initTheme = useCallback(() => {
    const theme = getPreferredTheme()
    applyTheme(theme)
  }, [])

  const setTheme = useCallback((theme) => {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    applyTheme(theme)
  }, [])

  return { initTheme, setTheme }
}


