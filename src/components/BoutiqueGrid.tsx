import { useEffect, useState } from 'react'
import { api, Boutique } from '../lib/api'
import BoutiqueCard from './BoutiqueCard'
import CategoryFilter from './CategoryFilter'
import { t, Lang } from '../constants/i18n'

interface Props {
  lang: Lang
  searchQuery: string
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
      <div className="h-48 bg-gray-100" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </div>
    </div>
  )
}

export default function BoutiqueGrid({ lang, searchQuery }: Props) {
  const [boutiques, setBoutiques] = useState<Boutique[]>([])
  const [loading, setLoading] = useState(true)
  const [activeType, setActiveType] = useState('')
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

  const visible = boutiques.slice(0, 12)

  return (
    <section id="boutiques" dir={isRtl ? 'rtl' : 'ltr'} className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{t.boutiques.title[lang]}</h2>
        </div>
        {!loading && boutiques.length > 12 && (
          <a
            href="/boutiques"
            className="text-sm font-semibold hover:underline transition-colors"
            style={{ color: '#F8AC12' }}
          >
            {t.boutiques.viewAll[lang]} →
          </a>
        )}
      </div>

      {/* Filter */}
      <div className="mb-8 -mx-4 sm:-mx-6 px-4 sm:px-6">
        <CategoryFilter lang={lang} active={activeType} onChange={setActiveType} />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {[1,2,3,4,5,6,7,8].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <span className="text-4xl">🏪</span>
          <p className="mt-3 text-sm">{t.boutiques.empty[lang]}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {visible.map(b => <BoutiqueCard key={b.id} boutique={b} lang={lang} />)}
        </div>
      )}
    </section>
  )
}
