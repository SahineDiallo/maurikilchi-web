import { useState, useEffect, useMemo, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, MapPin, Search, X,
  Share2, CheckCircle2, Phone,
} from 'lucide-react'
import { type Lang } from '../constants/i18n'
import { api, type Boutique, type Product } from '../lib/api'
import ProductCard from '../components/ProductCard'

// ─── Constants ────────────────────────────────────────────────────────────────
const TYPE_EMOJI: Record<string, string> = {
  restaurant: '🍽️', arrivage: '📦', supermarche: '🛒',
  electronique: '📱', quincaillerie: '🔩', autre: '🏪',
}
const TYPE_GRADIENT: Record<string, string> = {
  restaurant:    'linear-gradient(135deg, #3d0f00 0%, #1a0800 60%, #0e0000 100%)',
  arrivage:      'linear-gradient(135deg, #0a1628 0%, #0d1f3c 60%, #0a1628 100%)',
  supermarche:   'linear-gradient(135deg, #003d1a 0%, #001f0d 60%, #002914 100%)',
  electronique:  'linear-gradient(135deg, #0a0a1a 0%, #12122a 60%, #0d0d1e 100%)',
  quincaillerie: 'linear-gradient(135deg, #1a1200 0%, #0e0a00 60%, #1a1200 100%)',
  autre:         'linear-gradient(135deg, #0e0e0e 0%, #1a1000 60%, #0e0e0e 100%)',
}

function WaIcon({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="pt-[152px] sm:pt-[100px] min-h-screen bg-[#f8f8f8]">
      <div className="h-72 bg-gray-200 animate-pulse" />
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6">
        <div className="flex gap-6 items-start">
          <div className="hidden lg:block w-72 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 h-[480px] animate-pulse" />
          </div>
          <div className="flex-1 space-y-4">
            <div className="h-14 bg-white rounded-2xl animate-pulse" />
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-64 animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
interface Props { lang: Lang }

export default function BoutiquePage({ lang }: Props) {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const isRtl = lang === 'ar'

  const [boutique, setBoutique] = useState<Boutique | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [nextUrl, setNextUrl] = useState<string | null>(null)
  const [activeCat, setActiveCat] = useState('__all__')
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setSearch(query), 280)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setNotFound(false)
    setBoutique(null)
    setProducts([])

    api.get(`/boutiques/${slug}/`)
      .then(res => {
        const b: Boutique = res.data
        setBoutique(b)
        return api.get('/products/', { params: { boutique: b.id, page_size: 24 } })
      })
      .then(res => {
        const data = res.data
        const results: Product[] = Array.isArray(data) ? data : (data?.results ?? [])
        setProducts(results)
        setNextUrl(Array.isArray(data) ? null : (data?.next ?? null))
      })
      .catch(err => { if (err?.response?.status === 404) setNotFound(true) })
      .finally(() => setLoading(false))
  }, [slug])

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

  const shareUrl = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    })
  }

  const cats = useMemo(() => {
    const names = products.map(p => p.category_name).filter(Boolean) as string[]
    return Array.from(new Set(names))
  }, [products])

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchCat = activeCat === '__all__' || p.category_name === activeCat
      const matchSearch = !search.trim() || p.title.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
  }, [products, activeCat, search])

  if (loading) return <Skeleton />

  if (notFound || !boutique) {
    return (
      <div className="pt-[152px] sm:pt-[100px] min-h-screen bg-white flex flex-col items-center justify-center gap-4 text-center px-4">
        <span className="text-7xl select-none">🏪</span>
        <h1 className="text-xl font-bold text-gray-900">
          {lang === 'fr' ? 'Boutique introuvable' : 'المتجر غير موجود'}
        </h1>
        <p className="text-sm text-gray-400 max-w-xs">
          {lang === 'fr' ? "Cette boutique n'existe plus ou a été retirée." : 'هذا المتجر لم يعد متاحاً.'}
        </p>
        <button onClick={() => navigate('/')}
          className="mt-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all hover:opacity-90"
          style={{ background: '#F8AC12', color: '#0D0D0D' }}>
          {lang === 'fr' ? "← Retour à l'accueil" : '← العودة للرئيسية'}
        </button>
      </div>
    )
  }

  const heroImg = boutique.image_url
  const emoji = TYPE_EMOJI[boutique.boutique_type] ?? '🏪'
  const gradient = TYPE_GRADIENT[boutique.boutique_type] ?? TYPE_GRADIENT.autre
  const typeLabel = boutique.boutique_type_display ?? boutique.boutique_type
  const available = products.filter(p => p.is_available !== false).length
  const hasWhatsApp = !!boutique.whatsap_number
  const hasPhone = !!boutique.phone_number
  const waNumber = boutique.whatsap_number?.replace(/\D/g, '') ?? ''
  const waMsg = encodeURIComponent(
    lang === 'fr'
      ? `Bonjour, je suis intéressé par votre boutique "${boutique.name}".`
      : `مرحباً، أنا مهتم بمتجر "${boutique.name}".`
  )

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="pt-[152px] sm:pt-[100px] min-h-screen bg-[#f8f8f8]">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative h-56 md:h-80 overflow-hidden bg-gray-900">
        {heroImg ? (
          <>
            <img src={heroImg} alt={boutique.name}
              className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.30) 50%, rgba(0,0,0,0.45) 100%)' }} />
          </>
        ) : (
          <>
            <div className="absolute inset-0" style={{ background: gradient }} />
            <div className="absolute inset-0 flex items-center justify-center text-[200px] opacity-[0.08] select-none pointer-events-none">
              {emoji}
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-56 rounded-full pointer-events-none"
              style={{ background: 'rgba(255,228,77,0.10)', filter: 'blur(50px)' }} />
            <div className="absolute inset-x-0 bottom-0 h-40 pointer-events-none"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)' }} />
          </>
        )}

        {/* Action bar */}
        <div className="absolute top-0 inset-x-0 flex items-center justify-between px-4 md:px-8 pt-4 z-10">
          <button onClick={() => navigate(-1)}
            className="flex items-center justify-center w-9 h-9 rounded-xl border border-white/15 text-white transition-all hover:bg-white/20"
            style={{ background: 'rgba(0,0,0,0.40)', backdropFilter: 'blur(8px)' }}>
            <ArrowLeft size={18} />
          </button>
          <button onClick={shareUrl}
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-white/15 text-white text-xs font-medium transition-all hover:bg-white/20"
            style={{ background: 'rgba(0,0,0,0.40)', backdropFilter: 'blur(8px)' }}>
            {copied ? <CheckCircle2 size={13} className="text-green-400" /> : <Share2 size={13} />}
            {copied ? (lang === 'fr' ? 'Copié !' : 'تم!') : (lang === 'fr' ? 'Partager' : 'مشاركة')}
          </button>
        </div>

        {/* Identity pinned to bottom */}
        <div className="absolute bottom-0 inset-x-0 px-4 md:px-8 pb-6 z-10">
          <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md mb-3"
            style={{ background: '#F8AC12', color: '#0D0D0D' }}>
            {emoji} {typeLabel}
          </span>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-white leading-tight mb-2">
            {boutique.name}
          </h1>
          {boutique.ville && (
            <p className="flex items-center gap-1.5 text-sm text-white/70">
              <MapPin size={13} />
              {boutique.ville}
            </p>
          )}
        </div>
      </div>

      {/* ── Two-column layout ─────────────────────────────────────────────── */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6">
        <div className="flex gap-6 items-start">

          {/* ── Left sidebar — store info card (desktop only) ── */}
          <aside className="hidden lg:block w-72 xl:w-80 shrink-0 sticky top-[108px] self-start space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                {/* Thumbnail */}
                {heroImg ? (
                  <div className="h-48 overflow-hidden">
                    <img src={heroImg} alt={boutique.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="h-36 flex items-center justify-center text-7xl select-none"
                    style={{ background: gradient }}>
                    {emoji}
                  </div>
                )}

                <div className="p-5">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full mb-3"
                    style={{ background: '#FFF8E7', color: '#C98A00' }}>
                    {emoji} {typeLabel}
                  </span>

                  <h2 className="text-xl font-bold text-gray-900 leading-tight mb-1">
                    {boutique.name}
                  </h2>

                  {boutique.ville && (
                    <p className="flex items-center gap-1.5 text-sm text-gray-400 mb-4">
                      <MapPin size={12} />
                      {boutique.ville}
                    </p>
                  )}

                  {boutique.description && (
                    <p className="text-sm text-gray-500 leading-relaxed mb-5 line-clamp-5">
                      {boutique.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {lang === 'fr' ? 'Produits' : 'منتجات'}
                      </p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-amber-600">{available}</p>
                      <p className="text-xs text-amber-400 mt-0.5">
                        {lang === 'fr' ? 'En stock' : 'في المخزن'}
                      </p>
                    </div>
                  </div>

                  {/* CTAs */}
                  <div className="space-y-2.5">
                    {hasWhatsApp && (
                      <a href={`https://wa.me/${waNumber}?text=${waMsg}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full h-12 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90"
                        style={{ background: '#25D366', boxShadow: '0 4px 14px rgba(37,211,102,0.25)' }}>
                        <WaIcon size={17} />
                        WhatsApp
                      </a>
                    )}
                    {hasPhone && (
                      <a href={`tel:${boutique.phone_number}`}
                        className="flex items-center justify-center gap-2 w-full h-12 rounded-xl font-bold text-sm transition-all hover:opacity-90"
                        style={{ background: '#F8AC12', color: '#0D0D0D', boxShadow: '0 4px 14px rgba(248,172,18,0.25)' }}>
                        <Phone size={15} />
                        {lang === 'fr' ? 'Appeler' : 'اتصال'}
                      </a>
                    )}
                  </div>
                </div>
              </div>
          </aside>

          {/* ── Main content (right) ── */}
          <main className="flex-1 min-w-0">

            {/* Mobile: compact info + CTAs */}
            <div className="lg:hidden bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
              {boutique.description && (
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-3">
                  {boutique.description}
                </p>
              )}
              <div className="flex items-center gap-4 mb-3">
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{products.length}</p>
                  <p className="text-[10px] text-gray-400">{lang === 'fr' ? 'Produits' : 'منتجات'}</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-amber-600">{available}</p>
                  <p className="text-[10px] text-amber-400">{lang === 'fr' ? 'En stock' : 'في المخزن'}</p>
                </div>
              </div>
              {(hasWhatsApp || hasPhone) && (
                <div className="flex gap-2">
                  {hasWhatsApp && (
                    <a href={`https://wa.me/${waNumber}?text=${waMsg}`} target="_blank" rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl text-white text-sm font-bold"
                      style={{ background: '#25D366' }}>
                      <WaIcon size={14} /> WhatsApp
                    </a>
                  )}
                  {hasPhone && (
                    <a href={`tel:${boutique.phone_number}`}
                      className={`flex items-center justify-center gap-1.5 h-10 rounded-xl text-sm font-bold ${hasWhatsApp ? 'px-5' : 'flex-1'}`}
                      style={{ background: '#F8AC12', color: '#0D0D0D' }}>
                      <Phone size={14} />
                      {!hasWhatsApp && (lang === 'fr' ? 'Appeler' : 'اتصال')}
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Sticky search + category tabs */}
            <div className="sticky top-[100px] z-20 bg-white rounded-2xl border border-gray-100 shadow-sm mb-5 overflow-hidden">
              <div className="px-4 pt-3 pb-0">
                <div className="relative">
                  <Search size={14}
                    className={`absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none ${isRtl ? 'right-3' : 'left-3'}`} />
                  <input
                    ref={searchRef}
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder={lang === 'fr' ? 'Rechercher dans cette boutique…' : 'ابحث في هذا المتجر...'}
                    className={`w-full h-10 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:border-amber-300 focus:outline-none transition-colors ${isRtl ? 'pr-9 pl-8' : 'pl-9 pr-8'}`}
                  />
                  {query && (
                    <button onClick={() => setQuery('')}
                      className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 ${isRtl ? 'left-3' : 'right-3'}`}>
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>

              {cats.length > 0 && (
                <div className="flex overflow-x-auto px-4 mt-1" style={{ scrollbarWidth: 'none' }}>
                  {[
                    { key: '__all__', label: lang === 'fr' ? 'Tous' : 'الكل' },
                    ...cats.map(c => ({ key: c, label: c })),
                  ].map(tab => (
                    <button key={tab.key}
                      onClick={() => setActiveCat(tab.key)}
                      className="relative px-4 py-3 text-sm whitespace-nowrap shrink-0 transition-colors"
                      style={{
                        color: activeCat === tab.key ? '#0D0D0D' : '#9CA3AF',
                        fontWeight: activeCat === tab.key ? 700 : 400,
                      }}>
                      {tab.label}
                      {activeCat === tab.key && (
                        <span className="absolute bottom-0 left-4 right-4 h-[2.5px] rounded-full"
                          style={{ background: '#F8AC12' }} />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Count label */}
            {filtered.length > 0 && (
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  {activeCat === '__all__'
                    ? (lang === 'fr' ? 'Tous les produits' : 'جميع المنتجات')
                    : activeCat}
                </h2>
                <span className="text-xs text-gray-400">
                  {filtered.length} {lang === 'fr' ? `produit${filtered.length > 1 ? 's' : ''}` : 'منتج'}
                </span>
              </div>
            )}

            {/* Product grid */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <span className="text-5xl mb-4 select-none">🔍</span>
                <p className="text-base font-semibold text-gray-700 mb-1">
                  {lang === 'fr' ? 'Aucun produit trouvé' : 'لم يُعثر على منتجات'}
                </p>
                <p className="text-sm text-gray-400">
                  {lang === 'fr' ? 'Essayez un autre terme de recherche.' : 'جرّب كلمة بحث أخرى.'}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 pb-6">
                  {filtered.map(p => <ProductCard key={p.id ?? p.slug} item={p} />)}
                </div>

                {nextUrl && !search && activeCat === '__all__' && (
                  <div className="flex justify-center mt-4 mb-8">
                    <button onClick={loadMore} disabled={loadingMore}
                      className="px-10 py-3 rounded-full text-sm font-semibold border-2 transition-all disabled:opacity-40 hover:bg-amber-50"
                      style={{ borderColor: '#F8AC12', color: '#C98A00' }}>
                      {loadingMore
                        ? (lang === 'fr' ? 'Chargement…' : 'جار التحميل…')
                        : (lang === 'fr' ? 'Voir plus de produits' : 'عرض المزيد')}
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
