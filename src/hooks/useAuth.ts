import { useCallback, useEffect, useState } from 'react'
import { APP_PASSWORD, STORAGE_KEYS } from '../config'

interface AuthState {
  ready: boolean
  isAuthenticated: boolean
  login: (password: string) => boolean
  logout: () => void
}

export function useAuth(): AuthState {
  const [ready, setReady] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const session = localStorage.getItem(STORAGE_KEYS.session)
    setIsAuthenticated(session === 'ok')
    setReady(true)
  }, [])

  const login = useCallback((password: string) => {
    if (password === APP_PASSWORD) {
      localStorage.setItem(STORAGE_KEYS.session, 'ok')
      setIsAuthenticated(true)
      return true
    }
    return false
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.session)
    setIsAuthenticated(false)
  }, [])

  return { ready, isAuthenticated, login, logout }
}
