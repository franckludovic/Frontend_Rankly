import { useEffect, useState } from 'react'
import AppRouter from './router/AppRouter.jsx'
import './styles/theme.css'
import { useTheme } from './styles/theme.js'
import { restoreSession } from './features/auth/services/authService.js'
import LoadingSpinner from './shared/components/LoadingSpinner.jsx'

export default function App() {
  const { initTheme } = useTheme()
  const [isRestoring, setIsRestoring] = useState(true)

  useEffect(() => {
    initTheme()
    // Restore session from localStorage on app load
    restoreSession().finally(() => {
      setIsRestoring(false)
    })
  }, [initTheme])

  if (isRestoring) {
    return <LoadingSpinner fullScreen={true} />
  }

  return <AppRouter />
}
