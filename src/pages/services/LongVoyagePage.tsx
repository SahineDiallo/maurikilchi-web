import { useState, useEffect, useLayoutEffect } from 'react'
import { type Lang } from '../../constants/i18n'
import { api } from '../../lib/api'
import { ALL_LOCATIONS } from '../../constants/mauritaniaCities'

interface Props { lang: Lang }

const MAURITANIA_CITIES = ALL_LOCATIONS

interface Voyageur {
  id: number
  name: string
  phone: string
  avatar_url?: string | null
  trajet_depart?: string
  trajet_destination?: string
}

function Avatar({ name, url }: { name: string; url?: string | null }) {
  if (url) return <img src={url} alt={name} className="w-11 h-11 rounded-full object-cover border border-gray-200" />
  return (
    <div className="w-11 h-11 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-600 font-bold text-base flex-shrink-0">
      {name?.[0]?.toUpperCase() ?? '?'}
    </div>
  )
}

function VoyageurCard({ v, lang }: { v: Voyageur; lang: Lang }) {
  const phone = v.phone?.replace(/\D/g, '') ?? ''
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
      <Avatar name={v.name} url={v.avatar_url} />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm truncate">{v.name}</p>
        {v.trajet_depart && v.trajet_destination && (
          <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
            <span className="font-medium text-gray-700 truncate max-w-[80px]">{v.trajet_depart}</span>
            <span className="text-amber-400">→</span>
            <span className="font-medium text-gray-700 truncate max-w-[80px]">{v.trajet_destination}</span>
          </div>
        )}
      </div>
      <div className="flex gap-2 flex-shrink-0">
        {phone && (
          <a href={`https://wa.me/${phone}`} target="_blank" rel="noreferrer"
            className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center hover:opacity-90 transition-opacity"
            title="WhatsApp">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.1.546 4.07 1.5 5.78L0 24l6.375-1.5C8.07 23.454 10.01 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.89 0-3.7-.49-5.28-1.37l-.38-.21-3.79.89.89-3.79-.21-.38A9.93 9.93 0 012 12C2 6.48 6.48 2 12 2s10 4.48 10 10-4.48 10-10 10z"/>
            </svg>
          </a>
        )}
        {phone && (
          <a href={`tel:${phone}`}
            className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center hover:opacity-90 transition-opacity"
            title={lang === 'fr' ? 'Appeler' : 'اتصل'}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012 0h3a2 2 0 012 1.72c.127 1.004.362 1.99.7 2.94a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.14-1.14a2 2 0 012.11-.45c.95.338 1.937.573 2.94.7A2 2 0 0122 16.92z"/>
            </svg>
          </a>
        )}
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 animate-pulse">
      <div className="w-11 h-11 rounded-full bg-gray-100 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-gray-100 rounded w-2/5" />
        <div className="h-3 bg-gray-100 rounded w-1/3" />
      </div>
      <div className="flex gap-2">
        <div className="w-9 h-9 rounded-full bg-gray-100" />
        <div className="w-9 h-9 rounded-full bg-gray-100" />
      </div>
    </div>
  )
}

function CitySelect({
  value, onChange, placeholder, lang,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  lang: Lang
}) {
  const [open, setOpen]   = useState(false)
  const [query, setQuery] = useState('')
  const filtered = query.trim()
    ? MAURITANIA_CITIES.filter(c => c.toLowerCase().includes(query.toLowerCase()))
    : MAURITANIA_CITIES

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => { setOpen(o => !o); setQuery('') }}
        className={`w-full flex items-center gap-2 bg-white border rounded-xl px-4 py-3 text-sm transition-all ${open ? 'border-amber-400 ring-2 ring-amber-100' : 'border-gray-200 hover:border-gray-300'}`}>
        <span className="text-gray-400">📍</span>
        <span className={`flex-1 text-start truncate ${value ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
          {value || placeholder}
        </span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={lang === 'fr' ? 'Rechercher...' : 'بحث...'}
              className="w-full text-sm px-3 py-2 bg-gray-50 rounded-lg outline-none placeholder-gray-400"
            />
          </div>
          <ul className="max-h-52 overflow-y-auto">
            {filtered.map(city => (
              <li key={city}>
                <button
                  type="button"
                  onClick={() => { onChange(city); setOpen(false) }}
                  className={`w-full text-start px-4 py-2.5 text-sm hover:bg-amber-50 transition-colors ${city === value ? 'font-bold text-amber-600 bg-amber-50' : 'text-gray-700'}`}>
                  {city}
                  {city === value && <span className="float-end text-amber-500">✓</span>}
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-4 py-3 text-sm text-gray-400 text-center">
                {lang === 'fr' ? 'Aucune ville trouvée' : 'لا توجد مدينة'}
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

export default function LongVoyagePage({ lang }: Props) {
  const isRtl = lang === 'ar'
  const [origin,      setOrigin]      = useState('')
  const [destination, setDestination] = useState('')
  const [voyageurs,   setVoyageurs]   = useState<Voyageur[]>([])
  const [loading,     setLoading]     = useState(false)
  const [searched,    setSearched]    = useState(false)

  useLayoutEffect(() => {
    if (origin && destination) {
      setLoading(true)
      setSearched(false)
      setVoyageurs([])
    }
  }, [origin, destination])

  useEffect(() => {
    if (!origin || !destination) return
    let cancelled = false
    ;(async () => {
      try {
        const [fwd, rev] = await Promise.allSettled([
          api.get<Voyageur[]>(`/auth/voyageurs/?depart=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`),
          api.get<Voyageur[]>(`/auth/voyageurs/?depart=${encodeURIComponent(destination)}&destination=${encodeURIComponent(origin)}`),
        ])
        if (cancelled) return
        const fwdData = fwd.status === 'fulfilled' && Array.isArray(fwd.value.data) ? fwd.value.data : []
        const revData = rev.status === 'fulfilled' && Array.isArray(rev.value.data) ? rev.value.data : []
        const seen = new Set<number>()
        const merged: Voyageur[] = []
        for (const item of [...fwdData, ...revData]) {
          if (!seen.has(item.id)) { seen.add(item.id); merged.push(item) }
        }
        setVoyageurs(merged)
      } catch {
        if (!cancelled) setVoyageurs([])
      } finally {
        if (!cancelled) { setLoading(false); setSearched(true) }
      }
    })()
    return () => { cancelled = true }
  }, [origin, destination])

  const swap = () => {
    const tmp = origin
    setOrigin(destination)
    setDestination(tmp)
  }

  return (
    <div className="min-h-screen bg-[#f8f7f5] pt-[152px] sm:pt-[100px]" dir={isRtl ? 'rtl' : 'ltr'}>

      {/* Hero header */}
      <div className="bg-gradient-to-br from-[#FFE14D] via-[#FFF5B0] to-white pb-6">
        <div className="max-w-3xl mx-auto px-4 md:px-8 pt-10">
          <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-amber-200 rounded-full px-4 py-1.5 text-sm font-semibold text-amber-700 mb-4">
            🚌 {lang === 'fr' ? 'Long Voyage' : 'سفر طويل'}
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {lang === 'fr' ? 'Trouvez un voyageur' : 'ابحث عن مسافر'}
          </h1>
          <p className="text-gray-600 mb-8">
            {lang === 'fr'
              ? 'Des particuliers qui font le même trajet que vous — contactez-les directement.'
              : 'أشخاص يسافرون على نفس الطريق — تواصل معهم مباشرة.'}
          </p>

          {/* Route search card */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-end gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">
                  {lang === 'fr' ? 'Départ' : 'المغادرة'}
                </label>
                <CitySelect
                  value={origin}
                  onChange={setOrigin}
                  placeholder={lang === 'fr' ? 'Choisir une ville' : 'اختر مدينة'}
                  lang={lang}
                />
              </div>

              {/* Swap button */}
              <button
                type="button"
                onClick={swap}
                disabled={!origin && !destination}
                className="mb-0.5 w-9 h-9 rounded-full border border-gray-200 bg-gray-50 hover:bg-amber-50 hover:border-amber-300 transition-colors flex items-center justify-center disabled:opacity-40 flex-shrink-0 justify-self-center sm:justify-self-auto">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                  <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/>
                </svg>
              </button>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">
                  {lang === 'fr' ? 'Destination' : 'الوجهة'}
                </label>
                <CitySelect
                  value={destination}
                  onChange={setDestination}
                  placeholder={lang === 'fr' ? 'Choisir une ville' : 'اختر مدينة'}
                  lang={lang}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">

        {/* Prompt state */}
        {!origin || !destination ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🚌</div>
            <h2 className="font-semibold text-gray-700 text-lg mb-2">
              {lang === 'fr' ? 'Choisissez votre trajet' : 'اختر طريقك'}
            </h2>
            <p className="text-gray-400 text-sm max-w-xs mx-auto">
              {lang === 'fr'
                ? 'Sélectionnez un départ et une destination pour trouver des voyageurs disponibles.'
                : 'اختر مدينة المغادرة والوجهة للعثور على مسافرين متاحين.'}
            </p>
          </div>
        ) : loading ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-400">{lang === 'fr' ? 'Recherche en cours...' : 'جار البحث...'}</p>
            </div>
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : searched && voyageurs.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">😔</div>
            <h2 className="font-semibold text-gray-700 text-lg mb-2">
              {lang === 'fr' ? 'Aucun voyageur trouvé' : 'لا يوجد مسافر'}
            </h2>
            <p className="text-gray-400 text-sm max-w-xs mx-auto">
              {lang === 'fr'
                ? `Personne ne fait le trajet ${origin} → ${destination} pour le moment. Réessayez plus tard.`
                : `لا أحد يسافر من ${origin} إلى ${destination} الآن. حاول مرة أخرى لاحقاً.`}
            </p>
          </div>
        ) : searched ? (
          <div>
            <p className="text-sm text-gray-500 mb-4">
              <span className="font-semibold text-gray-800">{voyageurs.length}</span>
              {' '}{lang === 'fr'
                ? `voyageur${voyageurs.length !== 1 ? 's' : ''} disponible${voyageurs.length !== 1 ? 's' : ''}`
                : 'مسافر متاح'}
              {' — '}
              <span className="text-amber-600 font-medium">{origin}</span>
              {' → '}
              <span className="text-amber-600 font-medium">{destination}</span>
            </p>
            <div className="space-y-3">
              {voyageurs.map(v => <VoyageurCard key={v.id} v={v} lang={lang} />)}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
