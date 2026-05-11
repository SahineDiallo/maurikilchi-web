import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { type Lang } from '../constants/i18n'
import { api, type Boutique } from '../lib/api'
import BoutiqueCard from '../components/BoutiqueCard'
import { useSeo } from '../hooks/useSeo'

interface Props { lang: Lang }

const TYPES = [
  { key: '',             emoji: '🏪', label: { fr: 'Tous',          ar: 'الكل'          } },
  { key: 'restaurant',   emoji: '🍽️', label: { fr: 'Restaurants',   ar: 'مطاعم'         } },
  { key: 'supermarche',  emoji: '🛒', label: { fr: 'Supermarché',   ar: 'سوبرماركت'     } },
  { key: 'arrivage',     emoji: '📦', label: { fr: 'Arrivages',     ar: 'بضائع جديدة'   } },
  { key: 'electronique', emoji: '📱', label: { fr: 'Électronique',  ar: 'إلكترونيات'    } },
  { key: 'autre',        emoji: '🏬', label: { fr: 'Autres',        ar: 'أخرى'          } },
]

const SORT_OPTIONS = [
  { key: '',         label: { fr: 'Par défaut',         ar: 'افتراضي'       } },
  { key: 'products', label: { fr: 'Plus de produits',   ar: 'الأكثر منتجات' } },
  { key: 'name',     label: { fr: 'Nom A → Z',          ar: 'الاسم أ → ي'   } },
]

function SkeletonCard() {
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

export default function BoutiquesListPage({ lang }: Props) {
  useSeo({
    title      : 'Toutes les Boutiques en ligne — Mauritanie',
    description: 'Découvrez des centaines de boutiques mauritaniennes en ligne : restaurants, vêtements, alimentation, électronique, arrivages et plus. Commandez directement depuis Maurikilchi.',
    keywords   : 'boutiques Mauritanie, boutiques en ligne Mauritanie, commerce en ligne Mauritanie, magasins Nouakchott, shopping Mauritanie, restaurants Nouakchott, supermarché en ligne Mauritanie',
    url        : 'https://maurikilchi.com/boutiques',
  })

  const [searchParams, setSearchParams] = useSearchParams()
  const [boutiques, setBoutiques]       = useState<Boutique[]>([])
  const [loading, setLoading]           = useState(true)
  const [loadingMore, setLoadingMore]   = useState(false)
  const [nextUrl, setNextUrl]           = useState<string | null>(null)
  const [total, setTotal]               = useState(0)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  const activeType  = searchParams.get('type')  ?? ''
  const activeSort  = searchParams.get('sort')  ?? ''
  const searchQuery = searchParams.get('q')     ?? ''
  const isRtl = lang === 'ar'

  // Sync search input
  useEffect(() => {
    if (searchRef.current) searchRef.current.value = searchQuery
  }, [searchQuery])

  // Fetch boutiques
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setBoutiques([])
    setNextUrl(null)

    const params: Record<string, string | number> = { page_size: 24 }
    if (activeType)    params.boutique_type = activeType
    if (searchQuery)   params.search        = searchQuery
    if (activeSort === 'name')     params.ordering = 'name'
    if (activeSort === 'products') params.ordering = '-product_count'

    api.get('/boutiques/', { params })
      .then(res => {
        if (cancelled) return
        const data = res.data
        const results: Boutique[] = Array.isArray(data) ? data : (data?.results ?? [])
        setBoutiques(results)
        setTotal(Array.isArray(data) ? data.length : (data?.count ?? results.length))
        setNextUrl(Array.isArray(data) ? null : (data?.next ?? null))
      })
      .catch(() => { if (!cancelled) setBoutiques([]) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [activeType, searchQuery, activeSort])

  const loadMore = () => {
    if (!nextUrl || loadingMore) return
    setLoadingMore(true)
    api.get(nextUrl)
      .then(res => {
        const data = res.data
        const results: Boutique[] = Array.isArray(data) ? data : (data?.results ?? [])
        setBoutiques(prev => [...prev, ...results])
        setNextUrl(Array.isArray(data) ? null : (data?.next ?? null))
      })
      .catch(() => {})
      .finally(() => setLoadingMore(false))
  }

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next)
  }

  const clearAll = () => {
    setSearchParams(new URLSearchParams())
    if (searchRef.current) searchRef.current.value = ''
  }

  const hasFilters = activeType || searchQuery || activeSort
  const activeTypeMeta = TYPES.find(t => t.key === activeType)

  // ── Sidebar filter content (shared between desktop sidebar and mobile panel)
  const FilterContent = () => (
    <div className="space-y-6">

      {/* Type filter */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 px-1">
          {lang === 'fr' ? 'Type de boutique' : 'نوع المتجر'}
        </p>
        <div className="space-y-0.5">
          {TYPES.map(t => (
            <button key={t.key}
              onClick={() => { setParam('type', t.key); setMobileFiltersOpen(false) }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all text-left ${
                activeType === t.key
                  ? 'bg-amber-50 text-amber-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}>
              <span className="text-base shrink-0">{t.emoji}</span>
              <span className="truncate">{t.label[lang]}</span>
              {activeType === t.key && (
                <span className="ml-auto w-2 h-2 rounded-full bg-amber-500 shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div className="border-t border-gray-100 pt-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 px-1">
          {lang === 'fr' ? 'Trier par' : 'ترتيب حسب'}
        </p>
        <div className="space-y-0.5">
          {SORT_OPTIONS.map(s => (
            <button key={s.key}
              onClick={() => { setParam('sort', s.key); setMobileFiltersOpen(false) }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all text-left ${
                activeSort === s.key
                  ? 'bg-amber-50 text-amber-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}>
              {s.label[lang]}
              {activeSort === s.key && (
                <span className="ml-auto w-2 h-2 rounded-full bg-amber-500 shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Clear all */}
      {hasFilters && (
        <div className="border-t border-gray-100 pt-4">
          <button onClick={() => { clearAll(); setMobileFiltersOpen(false) }}
            className="w-full flex items-center justify-center gap-2 h-9 rounded-xl border border-red-200 text-sm text-red-500 hover:bg-red-50 transition-colors">
            <X size={14} />
            {lang === 'fr' ? 'Effacer les filtres' : 'مسح الفلاتر'}
          </button>
        </div>
      )}
    </div>
  )

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="pt-[192px] sm:pt-[100px] min-h-screen bg-[#f8f8f8]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6">
        <div className="flex gap-5 py-6">

          {/* ── Desktop sidebar ───────────────────────────────────────────── */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-[108px]">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                <p className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <SlidersHorizontal size={14} className="text-amber-500" />
                  {lang === 'fr' ? 'Filtres' : 'الفلاتر'}
                </p>
                <FilterContent />
              </div>
            </div>
          </aside>

          {/* ── Main content ──────────────────────────────────────────────── */}
          <main className="flex-1 min-w-0">

            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  {activeTypeMeta?.key
                    ? <>{activeTypeMeta.emoji} {activeTypeMeta.label[lang]}</>
                    : (lang === 'fr' ? 'Toutes les boutiques' : 'جميع المتاجر')}
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  {loading
                    ? (lang === 'fr' ? 'Chargement…' : 'جار التحميل…')
                    : `${total.toLocaleString('fr-FR')} ${lang === 'fr' ? 'boutique' + (total !== 1 ? 's' : '') : 'متجر'}`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Search */}
                <form
                  onSubmit={e => { e.preventDefault(); setParam('q', searchRef.current?.value ?? '') }}
                  className="relative flex-1 sm:w-64">
                  <Search size={14}
                    className={`absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none ${isRtl ? 'right-3' : 'left-3'}`} />
                  <input
                    ref={searchRef}
                    type="text"
                    defaultValue={searchQuery}
                    placeholder={lang === 'fr' ? 'Rechercher une boutique…' : 'ابحث عن متجر...'}
                    className={`w-full h-10 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100 transition-all ${isRtl ? 'pr-9 pl-9' : 'pl-9 pr-9'}`}
                  />
                  {searchQuery && (
                    <button type="button" onClick={() => { setParam('q', ''); if (searchRef.current) searchRef.current.value = '' }}
                      className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 ${isRtl ? 'left-3' : 'right-3'}`}>
                      <X size={13} />
                    </button>
                  )}
                </form>

                {/* Mobile filter button */}
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className={`lg:hidden flex items-center gap-1.5 h-10 px-3 rounded-xl border text-sm font-medium transition-all ${
                    hasFilters
                      ? 'border-amber-400 bg-amber-50 text-amber-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}>
                  <SlidersHorizontal size={14} />
                  {lang === 'fr' ? 'Filtres' : 'فلاتر'}
                  {hasFilters && <span className="w-2 h-2 rounded-full bg-amber-500" />}
                </button>
              </div>
            </div>

            {/* Active filter pills */}
            {hasFilters && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {activeType && (
                  <button onClick={() => setParam('type', '')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border"
                    style={{ background: '#FFF8E7', color: '#C98A00', borderColor: '#F8AC1250' }}>
                    {activeTypeMeta?.emoji} {activeTypeMeta?.label[lang]}
                    <X size={11} />
                  </button>
                )}
                {searchQuery && (
                  <button onClick={() => { setParam('q', ''); if (searchRef.current) searchRef.current.value = '' }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200">
                    «{searchQuery}» <X size={11} />
                  </button>
                )}
                {activeSort && (
                  <button onClick={() => setParam('sort', '')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200">
                    {SORT_OPTIONS.find(s => s.key === activeSort)?.label[lang]}
                    <X size={11} />
                  </button>
                )}
                <button onClick={clearAll}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                  {lang === 'fr' ? 'Tout effacer' : 'مسح الكل'}
                </button>
              </div>
            )}

            {/* Mobile type chips */}
            <div className="lg:hidden flex gap-2 overflow-x-auto pb-3 mb-3" style={{ scrollbarWidth: 'none' }}>
              {TYPES.map(t => (
                <button key={t.key}
                  onClick={() => setParam('type', t.key)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap border shrink-0 transition-all ${
                    activeType === t.key
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-amber-300'
                  }`}>
                  <span>{t.emoji}</span>
                  {t.label[lang]}
                </button>
              ))}
            </div>

            {/* Boutique grid */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {Array.from({ length: 24 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : boutiques.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-28 text-center">
                <span className="text-5xl mb-5 select-none">🏪</span>
                <p className="text-lg font-bold text-gray-800 mb-2">
                  {lang === 'fr' ? 'Aucune boutique trouvée' : 'لم يُعثر على متاجر'}
                </p>
                <p className="text-sm text-gray-500 max-w-xs">
                  {lang === 'fr'
                    ? 'Essayez un autre type ou modifiez votre recherche.'
                    : 'جرّب نوعاً آخر أو عدّل بحثك.'}
                </p>
                <button onClick={clearAll}
                  className="mt-6 px-6 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition-all"
                  style={{ background: '#F8AC12', color: '#0D0D0D' }}>
                  {lang === 'fr' ? 'Voir toutes les boutiques' : 'عرض جميع المتاجر'}
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                  {boutiques.map(b => <BoutiqueCard key={b.id} boutique={b} lang={lang} />)}
                </div>

                {nextUrl && (
                  <div className="flex justify-center mt-10 mb-4">
                    <button onClick={loadMore} disabled={loadingMore}
                      className="px-10 py-3 rounded-full text-sm font-semibold border-2 transition-all disabled:opacity-40 hover:bg-amber-50"
                      style={{ borderColor: '#F8AC12', color: '#C98A00' }}>
                      {loadingMore
                        ? (lang === 'fr' ? 'Chargement…' : 'جار التحميل…')
                        : (lang === 'fr' ? 'Voir plus de boutiques' : 'عرض المزيد من المتاجر')}
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* ── Mobile filter panel (bottom sheet) ───────────────────────────── */}
      {mobileFiltersOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setMobileFiltersOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white rounded-t-3xl shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <p className="font-bold text-gray-900 flex items-center gap-2">
                <SlidersHorizontal size={15} className="text-amber-500" />
                {lang === 'fr' ? 'Filtres' : 'الفلاتر'}
              </p>
              <button onClick={() => setMobileFiltersOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">
                <X size={15} />
              </button>
            </div>
            <div className="px-5 py-5">
              <FilterContent />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
