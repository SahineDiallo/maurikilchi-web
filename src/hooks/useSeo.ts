import { useEffect } from 'react'

const SITE       = 'Maurikilchi'
const BASE_URL   = 'https://maurikilchi.com'
const OG_IMAGE   = 'https://maurikilchi.com/og-image.png'
const SCHEMA_ID  = 'page-ld-json'

export interface SeoProps {
  title       : string
  description : string
  keywords   ?: string
  image      ?: string
  url        ?: string
  type       ?: 'website' | 'article' | 'product'
  schema     ?: Record<string, unknown> | Record<string, unknown>[]
}

function setMeta(selector: string, key: string, val: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(key, val)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    document.head.appendChild(el)
  }
  el.href = href
}

export function useSeo({ title, description, keywords, image, url, type = 'website', schema }: SeoProps) {
  useEffect(() => {
    const fullTitle = `${title} | ${SITE}`
    const img       = image || OG_IMAGE
    const canonical = url   || BASE_URL

    document.title = fullTitle

    // Standard
    setMeta('meta[name="description"]',  'name',     'description',  description)
    if (keywords) setMeta('meta[name="keywords"]', 'name', 'keywords', keywords)
    setMeta('meta[name="robots"]',       'name',     'robots',        'index, follow')

    // Geo (Mauritania)
    setMeta('meta[name="geo.region"]',      'name', 'geo.region',      'MR')
    setMeta('meta[name="geo.placename"]',   'name', 'geo.placename',   'Nouakchott')
    setMeta('meta[name="geo.position"]',    'name', 'geo.position',    '18.0858;15.9785')
    setMeta('meta[name="ICBM"]',            'name', 'ICBM',            '18.0858, 15.9785')

    // Open Graph
    setMeta('meta[property="og:title"]',       'property', 'og:title',       fullTitle)
    setMeta('meta[property="og:description"]', 'property', 'og:description', description)
    setMeta('meta[property="og:type"]',        'property', 'og:type',        type)
    setMeta('meta[property="og:image"]',       'property', 'og:image',       img)
    setMeta('meta[property="og:url"]',         'property', 'og:url',         canonical)
    setMeta('meta[property="og:site_name"]',   'property', 'og:site_name',   SITE)
    setMeta('meta[property="og:locale"]',      'property', 'og:locale',      'fr_MR')

    // Twitter Card
    setMeta('meta[name="twitter:card"]',        'name', 'twitter:card',        'summary_large_image')
    setMeta('meta[name="twitter:title"]',       'name', 'twitter:title',       fullTitle)
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description)
    setMeta('meta[name="twitter:image"]',       'name', 'twitter:image',       img)

    // Canonical
    setLink('canonical', canonical)

    // JSON-LD
    let script = document.getElementById(SCHEMA_ID) as HTMLScriptElement | null
    if (schema) {
      if (!script) {
        script = document.createElement('script')
        script.id   = SCHEMA_ID
        script.type = 'application/ld+json'
        document.head.appendChild(script)
      }
      script.textContent = JSON.stringify(Array.isArray(schema) ? schema : schema)
    } else if (script) {
      script.remove()
    }
  }, [title, description, keywords, image, url, type, schema])
}
