import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { Boutique } from '../lib/api'
import BoutiqueCard from './BoutiqueCard'
import { t, type Lang } from '../constants/i18n'

const FILTERS = (lang: Lang) => [
  { key: '', label: lang === 'fr' ? 'Tout' : 'الكل' },
  { key: 'restaurant', label: lang === 'fr' ? 'Restaurant' : 'مطعم' },
  { key: 'supermarche', label: lang === 'fr' ? 'Supermarché' : 'سوبرماركت' },
  { key: 'arrivage', label: lang === 'fr' ? 'Arrivage' : 'بضائع' },
  { key: 'electronique', label: lang === 'fr' ? 'Électronique' : 'إلكترونيات' },
]

function Skeleton() {
  return (
    <div className="animate-pulse bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      <div className="h-44 bg-gray-100" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-gray-100 rounded-full w-3/4" />
        <div className="h-3 bg-gray-100 rounded-full w-1/2" />
        <div className="h-8 bg-gray-100 rounded-xl mt-3" />
      </div>
    </div>
  )
}

interface Props { lang: Lang; searchQuery: string; activeType: string; onTypeChange: (t: string) => void }

export default function BoutiqueGrid({ lang, searchQuery, activeType, onTypeChange }: Props) {
  const [boutiques, setBoutiques] = useState<Boutique[]>([])
  const [loading, setLoading] = useState(true)
  const isRtl = lang === 'ar'

  useEffect(() => {
    setLoading(true)
    const params: Record<string, string> = {}
    if (activeType) params.boutique_type = activeType
    if (searchQuery) params.search = searchQuery
    api.get('/boutiques/', { params })
      .then(res => setBoutiques(res.data?.results ?? res.data ?? []))
      .catch(() => setBoutiques([]))
      .finally(() => setLoading(false))
  }, [activeType, searchQuery])

  return (
    <section id="boutiques" dir={isRtl ? 'rtl' : 'ltr'} className="max-w-7xl mx-auto px-4 md:px-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted mb-2">{lang === 'fr' ? '— La sélection' : '— الاختيار'}</p>
          <h2 className="font-display text-3xl md:text-4xl font-medium tracking-tight">{t.boutiques.title[lang]}</h2>
        </div>
        {/* Filter tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {FILTERS(lang).map(f => (
            <button key={f.key} onClick={() => onTypeChange(f.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium shrink-0 transition-all ${
                activeType === f.key
                  ? 'bg-foreground text-white'
                  : 'bg-secondary text-muted hover:text-foreground'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
          {[1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} />)}
        </div>
      ) : boutiques.length === 0 ? (
        <div className="text-center py-24 text-muted">
          <p className="text-4xl mb-4">🏪</p>
          <p className="text-sm">{t.boutiques.empty[lang]}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
            {boutiques.slice(0, 8).map(b => <BoutiqueCard key={b.id} boutique={b} lang={lang} />)}
          </div>
          {boutiques.length > 8 && (
            <div className="text-center mt-12">
              <a href="/boutiques"
                className="inline-flex items-center gap-2 h-11 px-8 rounded-full border-2 border-foreground text-sm font-semibold text-foreground hover:bg-foreground hover:text-white transition-all">
                {t.boutiques.viewAll[lang]} →
              </a>
            </div>
          )}
        </>
      )}
    </section>
  )
}
