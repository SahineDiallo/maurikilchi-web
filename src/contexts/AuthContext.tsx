import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { api } from '../lib/api'

export interface AuthUser {
  id: string
  phone: string
  first_name: string
  last_name: string
  avatar_url?: string | null
  role?: string
  vehicle_type?: string
  trajet_depart?: string
  trajet_destination?: string
  wilaya?: string
}

interface PendingAuth {
  phone: string
  firstName: string
  lastName: string
  role: string
  vehicle: string
  trajetDepart: string
  trajetDest: string
  wilaya: string
}

interface AuthContextValue {
  user: AuthUser | null
  accessToken: string | null
  isAuthenticated: boolean
  bootstrapDone: boolean
  pending: PendingAuth
  setPending: (p: Partial<PendingAuth>) => void
  clearPending: () => void
  login: (access: string, refresh: string, user: AuthUser) => void
  logout: () => void
}

const BLANK_PENDING: PendingAuth = {
  phone: '', firstName: '', lastName: '',
  role: 'vendeur', vehicle: '', trajetDepart: '', trajetDest: '', wilaya: '',
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [bootstrapDone, setBootstrapDone] = useState(false)
  const [pending, setPendingState] = useState<PendingAuth>(BLANK_PENDING)

  useEffect(() => {
    const access = localStorage.getItem('access_token')
    if (access) {
      setAccessToken(access)
      api.get('/auth/me/').then(res => {
        setUser(res.data)
      }).catch(() => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        setAccessToken(null)
      }).finally(() => setBootstrapDone(true))
    } else {
      setBootstrapDone(true)
    }
  }, [])

  const login = (access: string, refresh: string, u: AuthUser) => {
    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
    setAccessToken(access)
    setUser(u)
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setAccessToken(null)
    setUser(null)
  }

  const setPending = (p: Partial<PendingAuth>) =>
    setPendingState(prev => ({ ...prev, ...p }))

  const clearPending = () => setPendingState(BLANK_PENDING)

  return (
    <AuthContext.Provider value={{
      user,
      accessToken,
      isAuthenticated: !!accessToken && !!user,
      bootstrapDone,
      pending,
      setPending,
      clearPending,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
