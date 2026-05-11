import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Grid3X3, Search, X, ChevronDown, SlidersHorizontal } from 'lucide-react'
import { type Lang } from '../constants/i18n'
import { api, type Product } from '../lib/api'
import { CATEGORIES } from '../constants/categories'
import ProductCard from '../components/ProductCard'
import { useSeo } from '../hooks/useSeo'

// ─── Skeleton card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
      <div className="p-2">
        <div className="h-44 bg-gray-100 rounded-xl" />
      </div>
      <div className="px-3 pb-3 pt-1 space-y-2">
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-3/4" />
        <div className="h-4 bg-gray-100 rounded w-1/3 mt-2" />
      </div>
    </div>
  )
}

// ─── Sidebar skeleton ─────────────────────────────────────────────────────────
function SidebarSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-pulse">
      <div className="p-4 space-y-3">
        {[80, 60, 70, 65, 75].map((w, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gray-100 rounded" />
            <div className={`h-3 bg-gray-100 rounded`} style={{ width: `${w}%` }} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Sort options ─────────────────────────────────────────────────────────────
const SORT_OPTIONS = (lang: Lang) => [
  { value: '',             label: lang === 'fr' ? 'Pertinence'       : 'الأكثر صلة'    },
  { value: 'price',       label: lang === 'fr' ? 'Prix croissant'   : 'السعر: الأدنى' },
  { value: '-price',      label: lang === 'fr' ? 'Prix décroissant' : 'السعر: الأعلى' },
  { value: '-created_at', label: lang === 'fr' ? 'Plus récent'      : 'الأحدث'         },
]

// ─── Filter panel (sidebar + mobile sheet) ───────────────────────────────────
function FilterPanel({
  lang, ordering, onOrdering,
  localMin, localMax, onLocalMin, onLocalMax, onApplyPrice, onClearPrice,
  inStock, onInStock, hasActiveFilters, onClearAll,
}: {
  lang: Lang
  ordering: string; onOrdering: (v: string) => void
  localMin: string; localMax: string
  onLocalMin: (v: string) => void; onLocalMax: (v: string) => void
  onApplyPrice: () => void; onClearPrice: () => void
  inStock: boolean; onInStock: (v: boolean) => void
  hasActiveFilters: boolean; onClearAll: () => void
}) {
  const sortOpts = SORT_OPTIONS(lang)

  return (
    <div>
      {hasActiveFilters && (
        <div className="px-4 py-2.5 border-b border-gray-100">
          <button onClick={onClearAll}
            className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors">
            {lang === 'fr' ? '✕ Réinitialiser les filtres' : '✕ إعادة تعيين الفلاتر'}
          </button>
        </div>
      )}

      {/* Sort */}
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2.5">
          {lang === 'fr' ? 'Trier par' : 'ترتيب حسب'}
        </p>
        <div className="space-y-0.5">
          {sortOpts.map(opt => (
            <button key={opt.value} onClick={() => onOrdering(opt.value)}
              className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm transition-all text-left ${
                ordering === opt.value ? 'bg-amber-50 text-amber-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'
              }`}>
              <span className={`w-3 h-3 rounded-full border-2 flex items-center justify-center shrink-0 ${
                ordering === opt.value ? 'border-amber-500' : 'border-gray-300'
              }`}>
                {ordering === opt.value && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
              </span>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            {lang === 'fr' ? 'Prix (MRU)' : 'السعر (أوقية)'}
          </p>
          {(localMin || localMax) && (
            <button onClick={onClearPrice} className="text-[10px] text-gray-400 hover:text-red-400 transition-colors">
              {lang === 'fr' ? 'Effacer' : 'مسح'}
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 mb-2">
          <input type="number" min="0" value={localMin}
            onChange={e => onLocalMin(e.target.value)}
            placeholder={lang === 'fr' ? 'Min' : 'أدنى'}
            className="w-full h-8 px-2.5 text-xs border border-gray-200 rounded-lg focus:border-amber-400 focus:outline-none bg-gray-50" />
          <span className="text-gray-300 shrink-0">—</span>
          <input type="number" min="0" value={localMax}
            onChange={e => onLocalMax(e.target.value)}
            placeholder={lang === 'fr' ? 'Max' : 'أقصى'}
            className="w-full h-8 px-2.5 text-xs border border-gray-200 rounded-lg focus:border-amber-400 focus:outline-none bg-gray-50" />
        </div>
        <button onClick={onApplyPrice}
          className="w-full h-8 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
          style={{ background: '#F8AC12', color: '#0D0D0D' }}>
          {lang === 'fr' ? 'Appliquer' : 'تطبيق'}
        </button>
      </div>

      {/* Availability */}
      <div className="px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2.5">
          {lang === 'fr' ? 'Disponibilité' : 'التوفر'}
        </p>
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <span className={`w-5 h-5 rounded flex items-center justify-center border-2 shrink-0 transition-colors ${
            inStock ? 'border-amber-500 bg-amber-500' : 'border-gray-300 group-hover:border-amber-300'
          }`}>
            {inStock && (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1.5 5.5L3.5 7.5L8.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
          <input type="checkbox" className="sr-only" checked={inStock} onChange={e => onInStock(e.target.checked)} />
          <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
            {lang === 'fr' ? 'En stock uniquement' : 'المتاح فقط'}
          </span>
        </label>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
interface Props { lang: Lang }

export default function ExplorePage({ lang }: Props) {
  useSeo({
    title      : 'Explorer les Produits en Mauritanie — Catalogue Maurikilchi',
    description: 'Explorez des milliers de produits mauritaniens : vêtements, alimentation, électronique, artisanat, arrivages et plus. Livraison disponible à Nouakchott et partout en Mauritanie.',
    keywords   : 'produits Mauritanie, catalogue Mauritanie, shopping en ligne Mauritanie, acheter Mauritanie, vêtements Mauritanie, alimentation Mauritanie, électronique Mauritanie, arrivage Mauritanie',
    url        : 'https://maurikilchi.com/explorer',
  })

  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts]       = useState<Product[]>([])
  const [loading, setLoading]         = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [nextUrl, setNextUrl]         = useState<string | null>(null)
  const [total, setTotal]             = useState(0)
  const [mobileParent, setMobileParent] = useState<string | null>(null)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [localMin, setLocalMin] = useState('')
  const [localMax, setLocalMax] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)

  // ── URL params (source of truth) ──────────────────────────────────────────
  const activeSlug  = searchParams.get('cat')      ?? '__all__'
  const parentParam = searchParams.get('parent')   ?? null
  const searchQuery = searchParams.get('q')         ?? ''
  const ordering    = searchParams.get('ordering')  ?? ''
  const minPrice    = searchParams.get('min_price') ?? ''
  const maxPrice    = searchParams.get('max_price') ?? ''
  const inStock     = searchParams.get('in_stock')  === 'true'
  const isRtl = lang === 'ar'

  // Which parent is currently expanded in the sidebar
  const activeParentFromSub = CATEGORIES.find(c => c.subs.some(s => s.slug === activeSlug))?.key ?? null
  const expandedParent = parentParam ?? activeParentFromSub

  // Sync local price inputs with URL
  useEffect(() => { setLocalMin(minPrice) }, [minPrice])
  useEffect(() => { setLocalMax(maxPrice) }, [maxPrice])

  // Sync search input with URL
  useEffect(() => {
    if (searchInputRef.current) searchInputRef.current.value = searchQuery
  }, [searchQuery])

  // ── Fetch products ────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setProducts([])
    setNextUrl(null)

    const params: Record<string, string | number> = { page_size: 24 }
    // Sub selected → filter by subcategory slug
    if (activeSlug !== '__all__')   params.category     = activeSlug
    // Parent selected but no sub → filter by boutique_type
    else if (parentParam)           params.boutique_type = parentParam
    if (searchQuery)                params.search        = searchQuery
    if (ordering)                   params.ordering      = ordering
    if (minPrice)                   params.min_price     = minPrice
    if (maxPrice)                   params.max_price     = maxPrice
    if (inStock)                    params.is_available  = 'true'

    api.get('/products/', { params })
      .then(res => {
        if (cancelled) return
        const data = res.data
        const results: Product[] = Array.isArray(data) ? data : (data?.results ?? [])
        setProducts(results)
        setTotal(Array.isArray(data) ? data.length : (data?.count ?? results.length))
        setNextUrl(Array.isArray(data) ? null : (data?.next ?? null))
      })
      .catch(() => { if (!cancelled) setProducts([]) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [activeSlug, parentParam, searchQuery, ordering, minPrice, maxPrice, inStock])

  // ── Load more ─────────────────────────────────────────────────────────────
  const loadMore = () => {
    if (!nextUrl || loadingMore) return
    setLoadingMore(true)
    api.get(nextUrl)
      .then(res => {
        const data = res.data
        const results: Product[] = Array.isArray(data) ? data : (data?.results ?? [])
        setProducts(prev => [...prev, ...results])
        setNextUrl(Array.isArray(data) ? null : (data?.next ?? null))
      })
      .catch(() => {})
      .finally(() => setLoadingMore(false))
  }

  // ── URL helpers ───────────────────────────────────────────────────────────
  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value); else next.delete(key)
    setSearchParams(next)
  }

  // Click subcategory: sets ?cat=slug, clears ?parent
  const handleSubClick = (slug: string) => {
    const next = new URLSearchParams(searchParams)
    next.delete('parent')
    if (slug === '__all__') { next.delete('cat') }
    else { next.set('cat', slug) }
    setSearchParams(next)
  }

  // Click parent: toggle expand / collapse
  const handleParentClick = (key: string) => {
    const next = new URLSearchParams(searchParams)
    next.delete('cat')
    if (expandedParent === key) { next.delete('parent') }
    else { next.set('parent', key) }
    setSearchParams(next)
  }

  const handleSearch = (q: string) => {
    const next = new URLSearchParams(searchParams)
    if (q.trim()) next.set('q', q.trim()); else next.delete('q')
    setSearchParams(next)
  }

  const clearSearch = () => {
    if (searchInputRef.current) searchInputRef.current.value = ''
    const next = new URLSearchParams(searchParams)
    next.delete('q')
    setSearchParams(next)
  }

  const handleApplyPrice = () => {
    const next = new URLSearchParams(searchParams)
    if (localMin) next.set('min_price', localMin); else next.delete('min_price')
    if (localMax) next.set('max_price', localMax); else next.delete('max_price')
    setSearchParams(next)
  }

  const handleClearPrice = () => {
    setLocalMin(''); setLocalMax('')
    const next = new URLSearchParams(searchParams)
    next.delete('min_price'); next.delete('max_price')
    setSearchParams(next)
  }

  const handleClearAll = () => {
    setLocalMin(''); setLocalMax('')
    if (searchInputRef.current) searchInputRef.current.value = ''
    setSearchParams(new URLSearchParams())
  }

  const hasActiveFilters = ordering !== '' || minPrice !== '' || maxPrice !== '' || inStock

  // Active label pills
  const activeSubLabel = (() => {
    if (activeSlug === '__all__') return null
    for (const cat of CATEGORIES) {
      const sub = cat.subs.find(s => s.slug === activeSlug)
      if (sub) return sub.label[lang]
    }
    return activeSlug
  })()

  const activeParentLabel = (() => {
    if (!parentParam || activeSlug !== '__all__') return null
    return CATEGORIES.find(c => c.key === parentParam)?.label[lang] ?? null
  })()

  // Mobile subs
  const mobileSubs = mobileParent ? CATEGORIES.find(c => c.key === mobileParent)?.subs ?? [] : []

  const filterPanelProps = {
    lang, ordering,
    onOrdering: (v: string) => setParam('ordering', v),
    localMin, localMax, onLocalMin: setLocalMin, onLocalMax: setLocalMax,
    onApplyPrice: handleApplyPrice, onClearPrice: handleClearPrice,
    inStock, onInStock: (v: boolean) => setParam('in_stock', v ? 'true' : ''),
    hasActiveFilters, onClearAll: handleClearAll,
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="pt-[152px] sm:pt-[100px] min-h-screen bg-[#f8f8f8]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6">
        <div className="flex gap-5 py-6">

          {/* ── Sidebar (desktop) ─────────────────────────────────────────── */}
          <aside className="hidden lg:block w-60 xl:w-64 shrink-0">
            <div className="sticky top-[108px]">
              {loading && products.length === 0 ? (
                <SidebarSkeleton />
              ) : (
                <div
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden overflow-y-auto"
                  style={{ maxHeight: 'calc(100vh - 160px)', scrollbarWidth: 'thin' }}>

                  {/* Filter panel */}
                  <FilterPanel {...filterPanelProps} />

                  {/* Divider */}
                  <div className="h-2 bg-gray-50 border-y border-gray-100" />

                  {/* All products */}
                  <button
                    onClick={() => handleSubClick('__all__')}
                    className={`w-full flex items-center gap-2.5 px-4 py-3 border-b border-gray-100 text-sm font-semibold transition-colors ${
                      activeSlug === '__all__' && !expandedParent
                        ? 'bg-amber-50 text-amber-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}>
                    <Grid3X3 size={14} className={activeSlug === '__all__' && !expandedParent ? 'text-amber-500' : 'text-gray-400'} />
                    {lang === 'fr' ? 'Tous les produits' : 'جميع المنتجات'}
                  </button>

                  {/* Parent categories — single-open accordion */}
                  {CATEGORIES.map(cat => {
                    const isExpanded = expandedParent === cat.key
                    const hasActiveSub = cat.subs.some(s => s.slug === activeSlug)

                    return (
                      <div key={cat.key} className="border-b border-gray-100 last:border-0">

                        {/* Parent row */}
                        <button
                          onClick={() => handleParentClick(cat.key)}
                          className={`w-full flex items-center justify-between px-4 py-3 transition-colors group ${
                            isExpanded || hasActiveSub ? 'bg-amber-50/70' : 'hover:bg-gray-50'
                          }`}>
                          <span className="flex items-center gap-2.5">
                            <span className="text-base leading-none">{cat.emoji}</span>
                            <span className={`text-sm font-semibold leading-tight ${
                              isExpanded || hasActiveSub ? 'text-amber-800' : 'text-gray-700 group-hover:text-gray-900'
                            }`}>
                              {cat.label[lang]}
                            </span>
                          </span>
                          <ChevronDown size={13} className={`shrink-0 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180 text-amber-500' : 'text-gray-400'
                          }`} />
                        </button>

                        {/* Subcategories */}
                        {isExpanded && (
                          <div className="pb-2 px-2 bg-gray-50/40">
                            {cat.subs.map(sub => {
                              const active = activeSlug === sub.slug
                              return (
                                <button key={sub.slug}
                                  onClick={() => handleSubClick(sub.slug)}
                                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all text-left ${
                                    active
                                      ? 'bg-white text-amber-700 font-semibold shadow-sm border border-amber-100'
                                      : 'text-gray-500 hover:bg-white hover:text-gray-800'
                                  }`}>
                                  <div className="w-6 h-6 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                                    <img src={sub.img} alt="" className="w-full h-full object-cover" loading="lazy" />
                                  </div>
                                  <span className="truncate text-[13px]">{sub.label[lang]}</span>
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </aside>

          {/* ── Main content ──────────────────────────────────────────────── */}
          <main className="flex-1 min-w-0">

            {/* Page header */}
            <div className="mb-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {lang === 'fr' ? 'Explorer' : 'استكشف'}
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {loading
                        ? (lang === 'fr' ? 'Chargement…' : 'جار التحميل…')
                        : `${total.toLocaleString('fr-FR')} ${lang === 'fr' ? `produit${total !== 1 ? 's' : ''}` : 'منتج'}`}
                    </p>
                  </div>
                  {/* Mobile filter icon — always visible, opens full sidebar sheet */}
                  <button
                    onClick={() => setShowMobileFilters(true)}
                    className={`lg:hidden flex items-center gap-1.5 h-9 px-3.5 rounded-xl border text-sm font-semibold transition-all ${
                      hasActiveFilters
                        ? 'bg-amber-500 text-white border-amber-500'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-amber-300'
                    }`}>
                    <SlidersHorizontal size={15} />
                    {lang === 'fr' ? 'Filtres' : 'فلاتر'}
                    {hasActiveFilters && (
                      <span className="w-4 h-4 rounded-full bg-white/30 text-[9px] font-bold flex items-center justify-center">
                        {[ordering, minPrice || maxPrice, inStock].filter(Boolean).length}
                      </span>
                    )}
                  </button>
                </div>

                {/* Search */}
                <form
                  onSubmit={e => { e.preventDefault(); handleSearch(searchInputRef.current?.value ?? '') }}
                  className="relative sm:w-72">
                  <Search size={14} className={`absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none ${isRtl ? 'right-3' : 'left-3'}`} />
                  <input ref={searchInputRef} type="text" defaultValue={searchQuery}
                    placeholder={lang === 'fr' ? 'Rechercher un produit…' : 'ابحث عن منتج...'}
                    className={`w-full h-10 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100 transition-all ${isRtl ? 'pr-9 pl-9' : 'pl-9 pr-9'}`}
                  />
                  {searchQuery && (
                    <button type="button" onClick={clearSearch}
                      className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 ${isRtl ? 'left-3' : 'right-3'}`}>
                      <X size={13} />
                    </button>
                  )}
                </form>
              </div>

              {/* Active filter pills */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {activeParentLabel && (
                  <button onClick={() => handleSubClick('__all__')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border"
                    style={{ background: '#FFF8E7', color: '#C98A00', borderColor: '#F8AC1250' }}>
                    {CATEGORIES.find(c => c.key === parentParam)?.emoji} {activeParentLabel} <X size={11} />
                  </button>
                )}
                {activeSubLabel && (
                  <button onClick={() => handleSubClick('__all__')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border"
                    style={{ background: '#FFF8E7', color: '#C98A00', borderColor: '#F8AC1250' }}>
                    {activeSubLabel} <X size={11} />
                  </button>
                )}
                {ordering && (
                  <button onClick={() => setParam('ordering', '')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                    {SORT_OPTIONS(lang).find(o => o.value === ordering)?.label} <X size={11} />
                  </button>
                )}
                {(minPrice || maxPrice) && (
                  <button onClick={handleClearPrice}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                    {minPrice && maxPrice ? `${minPrice}–${maxPrice} MRU` : minPrice ? `≥ ${minPrice} MRU` : `≤ ${maxPrice} MRU`}
                    <X size={11} />
                  </button>
                )}
                {inStock && (
                  <button onClick={() => setParam('in_stock', '')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                    {lang === 'fr' ? 'En stock' : 'في المخزن'} <X size={11} />
                  </button>
                )}
              </div>
            </div>

            {/* ── Mobile: parent chips + Filtres button ── */}
            <div className="lg:hidden mb-3">
              <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                <button
                  onClick={() => { handleSubClick('__all__'); setMobileParent(null) }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap border shrink-0 transition-all ${
                    activeSlug === '__all__' && !mobileParent && !parentParam
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                  }`}>
                  <Grid3X3 size={11} />
                  {lang === 'fr' ? 'Tout' : 'الكل'}
                </button>
                {CATEGORIES.map(cat => (
                  <button key={cat.key}
                    onClick={() => {
                      setMobileParent(p => p === cat.key ? null : cat.key)
                      if (mobileParent !== cat.key) handleParentClick(cat.key)
                    }}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap border shrink-0 transition-all ${
                      mobileParent === cat.key || cat.key === expandedParent
                        ? 'bg-amber-500 text-white border-amber-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-amber-300'
                    }`}>
                    <span>{cat.emoji}</span>
                    {cat.label[lang]}
                  </button>
                ))}
              </div>

              {/* Mobile subcategory chips */}
              {mobileParent && mobileSubs.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pt-2 pb-1" style={{ scrollbarWidth: 'none' }}>
                  {mobileSubs.map(sub => (
                    <button key={sub.slug}
                      onClick={() => { handleSubClick(sub.slug); setMobileParent(null) }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border shrink-0 transition-all ${
                        activeSlug === sub.slug
                          ? 'bg-amber-50 text-amber-700 border-amber-400'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-amber-300'
                      }`}>
                      <div className="w-4 h-4 rounded-sm overflow-hidden shrink-0">
                        <img src={sub.img} alt="" className="w-full h-full object-cover" />
                      </div>
                      {sub.label[lang]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Product grid ── */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
                {Array.from({ length: 20 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-28 text-center">
                <span className="text-5xl mb-5 select-none">🔍</span>
                <p className="text-lg font-bold text-gray-800 mb-2">
                  {lang === 'fr' ? 'Aucun produit trouvé' : 'لم يُعثر على منتجات'}
                </p>
                <p className="text-sm text-gray-500 max-w-xs">
                  {lang === 'fr'
                    ? 'Essayez une autre catégorie ou modifiez vos filtres.'
                    : 'جرّب فئة أخرى أو عدّل فلاتر البحث.'}
                </p>
                <button onClick={handleClearAll}
                  className="mt-6 px-6 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition-all"
                  style={{ background: '#F8AC12', color: '#0D0D0D' }}>
                  {lang === 'fr' ? 'Voir tous les produits' : 'عرض جميع المنتجات'}
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
                  {products.map(p => <ProductCard key={p.id} item={p} />)}
                </div>
                {nextUrl && (
                  <div className="flex justify-center mt-10 mb-4">
                    <button onClick={loadMore} disabled={loadingMore}
                      className="px-10 py-3 rounded-full text-sm font-semibold border-2 transition-all disabled:opacity-40 hover:bg-amber-50"
                      style={{ borderColor: '#F8AC12', color: '#C98A00' }}>
                      {loadingMore
                        ? (lang === 'fr' ? 'Chargement…' : 'جار التحميل…')
                        : (lang === 'fr' ? 'Voir plus' : 'عرض المزيد')}
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* ── Mobile filter bottom sheet ─────────────────────────────────────── */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMobileFilters(false)} />
          <div className="relative bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto">

            {/* Sheet header */}
            <div className="sticky top-0 bg-white px-4 py-4 border-b border-gray-100 flex items-center justify-between z-10">
              <h3 className="text-base font-bold text-gray-900">
                {lang === 'fr' ? 'Filtres & Catégories' : 'فلاتر وفئات'}
              </h3>
              <button onClick={() => setShowMobileFilters(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                <X size={15} />
              </button>
            </div>

            {/* Sort / Price / Availability */}
            <FilterPanel {...filterPanelProps} />

            {/* Divider */}
            <div className="h-2 bg-gray-50 border-y border-gray-100" />

            {/* Category section — mirrors desktop sidebar */}
            <div>
              {/* All products */}
              <button
                onClick={() => { handleSubClick('__all__'); setMobileParent(null); setShowMobileFilters(false) }}
                className={`w-full flex items-center gap-2.5 px-4 py-3 border-b border-gray-100 text-sm font-semibold transition-colors ${
                  activeSlug === '__all__' && !expandedParent
                    ? 'bg-amber-50 text-amber-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}>
                <Grid3X3 size={14} className={activeSlug === '__all__' && !expandedParent ? 'text-amber-500' : 'text-gray-400'} />
                {lang === 'fr' ? 'Tous les produits' : 'جميع المنتجات'}
              </button>

              {/* Parent categories accordion */}
              {CATEGORIES.map(cat => {
                const isExpanded = mobileParent === cat.key || expandedParent === cat.key
                const hasActiveSub = cat.subs.some(s => s.slug === activeSlug)
                return (
                  <div key={cat.key} className="border-b border-gray-100 last:border-0">
                    <button
                      onClick={() => setMobileParent(p => p === cat.key ? null : cat.key)}
                      className={`w-full flex items-center justify-between px-4 py-3 transition-colors group ${
                        isExpanded || hasActiveSub ? 'bg-amber-50/70' : 'hover:bg-gray-50'
                      }`}>
                      <span className="flex items-center gap-2.5">
                        <span className="text-base leading-none">{cat.emoji}</span>
                        <span className={`text-sm font-semibold leading-tight ${
                          isExpanded || hasActiveSub ? 'text-amber-800' : 'text-gray-700 group-hover:text-gray-900'
                        }`}>
                          {cat.label[lang]}
                        </span>
                      </span>
                      <ChevronDown size={13} className={`shrink-0 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180 text-amber-500' : 'text-gray-400'
                      }`} />
                    </button>

                    {isExpanded && (
                      <div className="pb-2 px-2 bg-gray-50/40">
                        {cat.subs.map(sub => {
                          const active = activeSlug === sub.slug
                          return (
                            <button key={sub.slug}
                              onClick={() => { handleSubClick(sub.slug); setMobileParent(null); setShowMobileFilters(false) }}
                              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all text-left ${
                                active
                                  ? 'bg-white text-amber-700 font-semibold shadow-sm border border-amber-100'
                                  : 'text-gray-500 hover:bg-white hover:text-gray-800'
                              }`}>
                              <div className="w-6 h-6 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                                <img src={sub.img} alt="" className="w-full h-full object-cover" loading="lazy" />
                              </div>
                              <span className="truncate text-[13px]">{sub.label[lang]}</span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Apply / close */}
            <div className="px-4 pt-3 pb-8">
              <button onClick={() => setShowMobileFilters(false)}
                className="w-full h-12 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                style={{ background: '#0D0D0D', color: '#fff' }}>
                {lang === 'fr' ? 'Voir les résultats' : 'عرض النتائج'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
