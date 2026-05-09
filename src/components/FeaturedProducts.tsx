import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { api, type Product } from '../lib/api'
import { CATEGORIES } from '../constants/categories'
import { type Lang } from '../constants/i18n'

interface Props { lang: Lang }

function ProductSkeleton() {
  return (
    <div className="shrink-0 w-44 sm:w-52 animate-pulse">
      <div className="bg-gray-100 rounded-2xl h-44 sm:h-52 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-4/5 mb-1.5" />
      <div className="h-3 bg-gray-100 rounded w-2/5" />
    </div>
  )
}

function MiniProductCard({ item }: { item: Product }) {
  const image = item.primary_image_url ?? item.primary_image ?? item.images?.[0]?.image_url ?? null
  return (
    <a href={`/produit/${item.slug}`}
      className="group shrink-0 w-44 sm:w-52 block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
      <div className="p-2">
        <div className="relative rounded-xl overflow-hidden h-36 sm:h-44 bg-amber-50">
          {image
            ? <img src={image} alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy" />
            : <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>}
          {item.category_name && (
            <span className="absolute top-2 left-2 bg-black/50 text-white text-[9px] font-medium px-1.5 py-0.5 rounded-md leading-none">
              {item.category_name}
            </span>
          )}
        </div>
      </div>
      <div className="px-2.5 pb-3">
        <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug mb-1">
          {item.title}
        </p>
        <span className="text-sm font-bold text-gray-900">
          {parseFloat(item.price).toLocaleString('fr-FR')}
          <span className="text-xs font-normal text-gray-400 ml-1">MRU</span>
        </span>
        {item.boutique_name && (
          <p className="text-[10px] text-gray-400 mt-0.5 truncate">📍 {item.boutique_name}</p>
        )}
      </div>
    </a>
  )
}

export default function FeaturedProducts({ lang }: Props) {
  const navigate  = useNavigate()
  const isRtl     = lang === 'ar'
  const scrollRef = useRef<HTMLDivElement>(null)

  const [activeKey, setActiveKey] = useState(CATEGORIES[0].key)
  const [products,  setProducts]  = useState<Product[]>([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    setLoading(true)
    setProducts([])
    api.get(`/products/?boutique_type=${activeKey}&limit=16`)
      .then(r => setProducts(r.data?.results ?? r.data ?? []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [activeKey])

  const scroll = (dir: 'prev' | 'next') => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'next' ? 220 : -220, behavior: 'smooth' })
  }

  const activeCat = CATEGORIES.find(c => c.key === activeKey)!

  return (
    <section dir={isRtl ? 'rtl' : 'ltr'}
      className="max-w-[1440px] mx-auto px-4 md:px-6 py-8">

      {/* Section title */}
      <h2 className="font-display text-2xl font-bold text-foreground mb-5">
        {lang === 'fr' ? 'Produits populaires' : 'منتجات شائعة'}
      </h2>

      {/* Parent category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-6" style={{ scrollbarWidth: 'none' }}>
        {CATEGORIES.map(cat => (
          <button key={cat.key}
            onClick={() => setActiveKey(cat.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap shrink-0 border transition-all ${
              activeKey === cat.key
                ? 'bg-[#F8AC12] border-[#F8AC12] text-gray-900 shadow-sm'
                : 'bg-white border-gray-200 text-gray-600 hover:border-amber-300 hover:text-gray-900'
            }`}>
            <span className="text-base">{cat.emoji}</span>
            {cat.label[lang]}
          </button>
        ))}
      </div>

      {/* Products carousel */}
      <div className="relative">
        {/* Arrows — desktop only */}
        <button onClick={() => scroll('prev')}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-9 h-9 rounded-full bg-white border border-gray-200 shadow-md items-center justify-center hover:border-amber-400 hover:text-amber-600 transition-all">
          <ChevronLeft size={16} />
        </button>
        <button onClick={() => scroll('next')}
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-9 h-9 rounded-full bg-white border border-gray-200 shadow-md items-center justify-center hover:border-amber-400 hover:text-amber-600 transition-all">
          <ChevronRight size={16} />
        </button>

        <div ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-3"
          style={{ scrollbarWidth: 'none', scrollSnapType: 'x mandatory' }}>

          {loading
            ? Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
            : products.length === 0
              ? (
                <div className="flex flex-col items-center justify-center w-full py-14 text-center">
                  <p className="text-3xl mb-3">{activeCat.emoji}</p>
                  <p className="text-sm text-gray-400">
                    {lang === 'fr'
                      ? `Aucun produit disponible en ${activeCat.label.fr} pour l'instant.`
                      : `لا توجد منتجات في ${activeCat.label.ar} حالياً.`}
                  </p>
                </div>
              )
              : products.map(p => (
                  <div key={p.id} style={{ scrollSnapAlign: 'start' }}>
                    <MiniProductCard item={p} />
                  </div>
                ))}
        </div>
      </div>

      {/* "Voir tout" footer link */}
      {!loading && products.length > 0 && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => navigate(`/explorer?parent=${activeKey}`)}
            className="flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors">
            {lang === 'fr' ? `Voir tout ${activeCat.label.fr}` : `عرض كل ${activeCat.label.ar}`}
            <ArrowRight size={14} />
          </button>
        </div>
      )}
    </section>
  )
}
