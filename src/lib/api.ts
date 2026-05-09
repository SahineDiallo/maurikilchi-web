import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 10000,
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

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

export interface Product {
  id: number
  slug: string
  title: string
  price: string
  primary_image_url: string | null
  primary_image: string | null
  images?: { image_url: string }[]
  category_name: string
  boutique_name: string
  boutique_slug?: string
  description?: string
  is_available?: boolean
  old_price?: string | null
}

export interface ProductDetail extends Product {
  is_available: boolean
  stock_quantity: number | null
  category_slug: string | null
  boutique_ville: string | null
  boutique_whatsapp: string | null
  boutique_phone: string | null
}
