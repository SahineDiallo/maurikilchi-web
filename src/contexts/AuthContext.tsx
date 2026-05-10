import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import axios from 'axios'
import { api } from '../lib/api'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export interface SellerProfile {
  is_active: boolean
  created_at: string
}

export interface TransportProfile {
  type: 'livreur' | 'voyageur' | 'maurigo'
  // livreur
  vehicle_type?: string
  is_online?: boolean
  rating?: number
  deliveries_count?: number
  zone?: string
  // voyageur
  trajet_depart?: string
  trajet_destination?: string
  // maurigo
  wilaya?: string
  status?: 'pending' | 'approved' | 'rejected'
  plate_number?: string
  car_brand?: string
  car_year?: number | null
  car_photo_url?: string | null
  driver_photo_url?: string | null
  license_photo_url?: string | null
}

export interface AuthUser {
  id: string
  phone: string
  first_name: string
  last_name: string
  avatar_url?: string | null
  is_admin?: boolean
  seller_profile?: SellerProfile | null
  transport?: TransportProfile | null
}

interface PendingAuth {
  phone: string
  firstName: string
  lastName: string
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
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [bootstrapDone, setBootstrapDone] = useState(false)
  const [pending, setPendingState] = useState<PendingAuth>(BLANK_PENDING)

  useEffect(() => {
    const bootstrap = async () => {
      const access  = localStorage.getItem('access_token')
      const refresh = localStorage.getItem('refresh_token')

      if (!access && !refresh) { setBootstrapDone(true); return }

      try {
        // If access token exists, try /me/ directly (interceptor will refresh on 401)
        if (access) setAccessToken(access)
        const res = await api.get('/auth/me/')
        setUser(res.data)
        // Sync the (possibly refreshed) token back into state
        const current = localStorage.getItem('access_token')
        if (current && current !== access) setAccessToken(current)
      } catch {
        // Even refresh failed — clear everything
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        setAccessToken(null)
        setUser(null)
      } finally {
        setBootstrapDone(true)
      }
    }
    bootstrap()
  }, [])

  // Handle forced logout from the API interceptor (refresh token expired)
  useEffect(() => {
    const handler = () => { setAccessToken(null); setUser(null) }
    window.addEventListener('auth:logout', handler)
    return () => window.removeEventListener('auth:logout', handler)
  }, [])

  const login = (access: string, refresh: string, u: AuthUser) => {
    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
    setAccessToken(access)
    setUser(u)
  }

  const logout = useCallback(() => {
    const refresh = localStorage.getItem('refresh_token')
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setAccessToken(null)
    setUser(null)
    // Blacklist the refresh token on the backend (fire-and-forget)
    if (refresh) {
      axios.post(`${BASE_URL}/api/auth/logout/`, { refresh }).catch(() => {})
    }
  }, [])

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
