import { StrictMode, useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import type { PaletteMode } from '@mui/material'
import './index.css'
import App from './App.tsx'

const THEME_STORAGE_KEY = 'rededoar_theme_mode'

function getInitialMode(): PaletteMode {
  const storedMode = localStorage.getItem(THEME_STORAGE_KEY)
  if (storedMode === 'light' || storedMode === 'dark') {
    return storedMode
  }

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  return prefersDark ? 'dark' : 'light'
}

function RootApp() {
  const [mode, setMode] = useState<PaletteMode>(() => getInitialMode())

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, mode)
    document.documentElement.setAttribute('data-theme', mode)
  }, [mode])

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#117a63',
          },
          secondary: {
            main: '#f28a1f',
          },
          background: {
            default: mode === 'dark' ? '#0f1318' : '#f4efe7',
            paper: mode === 'dark' ? '#161d24' : '#fffdf8',
          },
        },
        shape: {
          borderRadius: 12,
        },
      }),
    [mode],
  )

  function toggleTheme() {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App mode={mode} onToggleTheme={toggleTheme} />
    </ThemeProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootApp />
  </StrictMode>,
)
