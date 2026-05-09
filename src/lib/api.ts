import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 10000,
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
