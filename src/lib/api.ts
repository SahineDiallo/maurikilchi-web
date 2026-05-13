import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 10000,
})

// Attach access token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// On 401: try to refresh once, then retry; on failure clear tokens
let refreshing: Promise<string> | null = null

api.interceptors.response.use(
  res => res,
  async error => {
    const original = error.config
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error)
    }
    original._retry = true

    try {
      if (!refreshing) {
        refreshing = axios
          .post(`${BASE_URL}/api/auth/refresh/`, {
            refresh: localStorage.getItem('refresh_token'),
          })
          .then(r => {
            const newAccess: string = r.data.access
            localStorage.setItem('access_token', newAccess)
            if (r.data.refresh) localStorage.setItem('refresh_token', r.data.refresh)
            return newAccess
          })
          .finally(() => { refreshing = null })
      }

      const newAccess = await refreshing
      original.headers.Authorization = `Bearer ${newAccess}`
      return api(original)
    } catch {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      window.dispatchEvent(new Event('auth:logout'))
      return Promise.reject(error)
    }
  },
)

export interface Boutique {
  id: number
  slug: string
  name: string
  description: string
  image_url: string | null
  boutique_type: string
  boutique_type_display: string
  ville: string
  product_count: number
  phone_number: string
  whatsap_number: string
  owner: {
    id: number
    first_name: string
    last_name: string
    avatar_url: string | null
  }
}

export interface Category {
  id: number
  name: string
  slug: string
  image_url: string | null
  parent: number | null
  children?: Category[]
}

export interface ProductImage {
  id: number
  image_url: string
  is_primary: boolean
  order?: number
}

export interface Product {
  id: number
  slug: string
  title: string
  price: string
  primary_image_url: string | null
  primary_image: string | null
  images?: ProductImage[]
  category?: number | null
  category_name: string
  boutique_name: string
  boutique_slug?: string
  description?: string
  is_available?: boolean
  stock_quantity?: number | null
  old_price?: string | null
}

export interface ProductDetail extends Product {
  is_available: boolean
  stock_quantity: number | null
  category_slug: string | null
  boutique_ville: string | null
  boutique_whatsapp: string | null
  boutique_phone: string | null
  boutique_owner_id?: number
}

// ─── Simple in-memory GET cache (module-level, survives route changes) ────────
const _cache = new Map<string, { data: unknown; ts: number }>()
const CACHE_TTL = 90_000 // 90 seconds

export async function cachedGet<T = unknown>(url: string, params?: Record<string, unknown>): Promise<T> {
  const key = url + (params ? JSON.stringify(params) : '')
  const hit = _cache.get(key)
  if (hit && Date.now() - hit.ts < CACHE_TTL) return hit.data as T
  const res = await api.get<T>(url, { params })
  _cache.set(key, { data: res.data, ts: Date.now() })
  return res.data
}

export function bustCache(prefix: string) {
  for (const k of _cache.keys()) if (k.startsWith(prefix)) _cache.delete(k)
}
