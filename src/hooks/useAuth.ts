import { useCallback, useEffect, useState } from 'react'
import { APP_PASSWORD, STORAGE_KEYS, type PartnerName } from '../config'

interface AuthState {
  ready: boolean
  isAuthenticated: boolean
  identity: PartnerName | null
  login: (password: string) => boolean
  logout: () => void
  setIdentity: (name: PartnerName) => void
}

export function useAuth(): AuthState {
  const [ready, setReady] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [identity, setIdentityState] = useState<PartnerName | null>(null)

  useEffect(() => {
    const session = localStorage.getItem(STORAGE_KEYS.session)
    const savedIdentity = localStorage.getItem(STORAGE_KEYS.identity) as PartnerName | null
    setIsAuthenticated(session === 'ok')
    if (savedIdentity === 'Ava' || savedIdentity === 'Lucas') {
      setIdentityState(savedIdentity)
    }
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

  const setIdentity = useCallback((name: PartnerName) => {
    localStorage.setItem(STORAGE_KEYS.identity, name)
    setIdentityState(name)
  }, [])

  return { ready, isAuthenticated, identity, login, logout, setIdentity }
}
