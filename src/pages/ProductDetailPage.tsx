import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSeo } from '../hooks/useSeo'
import {
  ArrowLeft, MapPin, ShoppingBag, ChevronRight,
  Phone, Share2, CheckCircle2, XCircle,
} from 'lucide-react'
import { type Lang } from '../constants/i18n'
import { api, type ProductDetail, type Product } from '../lib/api'
import ProductCard from '../components/ProductCard'

// ─── WhatsApp SVG (no Lucide equivalent) ─────────────────────────────────────
function WaIcon({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="pt-[192px] sm:pt-[100px] min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">
          {/* Image skeleton */}
          <div className="flex gap-3">
            <div className="hidden md:flex flex-col gap-2">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="w-16 h-16 rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
            <div className="flex-1 aspect-square bg-gray-100 rounded-2xl animate-pulse" />
          </div>
          {/* Info skeleton */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="h-6 w-20 bg-gray-100 rounded-lg animate-pulse" />
              <div className="h-6 w-16 bg-gray-100 rounded-lg animate-pulse" />
            </div>
            <div className="h-8 bg-gray-100 rounded-xl animate-pulse" />
            <div className="h-5 w-3/4 bg-gray-100 rounded-xl animate-pulse" />
            <div className="h-28 bg-gray-100 rounded-2xl animate-pulse mt-4" />
            <div className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
            <div className="flex gap-3 mt-4">
              <div className="flex-1 h-14 bg-gray-100 rounded-2xl animate-pulse" />
              <div className="w-28 h-14 bg-gray-100 rounded-2xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
interface Props { lang: Lang }

export default function ProductDetailPage({ lang }: Props) {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const isRtl = lang === 'ar'

  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [similar, setSimilar] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useSeo({
    title      : product ? `${product.title} — ${product.price} MRU` : 'Produit — Maurikilchi',
    description: product
      ? `${product.title} à ${product.price} MRU sur Maurikilchi. ${product.description ? product.description.replace(/<[^>]+>/g, '').slice(0, 120) : 'Disponible en ligne, livraison en Mauritanie.'}`
      : 'Découvrez ce produit sur Maurikilchi, la marketplace mauritanienne.',
    keywords   : product ? `${product.title}, ${product.category_name}, ${product.boutique_name}, acheter Mauritanie, Maurikilchi` : undefined,
    url        : `https://maurikilchi.com/produit/${slug}`,
    image      : product?.primary_image_url ?? undefined,
    type       : 'product',
    schema     : product ? {
      '@context'   : 'https://schema.org',
      '@type'      : 'Product',
      name         : product.title,
      description  : product.description?.replace(/<[^>]+>/g, '') ?? '',
      image        : product.primary_image_url ?? undefined,
      url          : `https://maurikilchi.com/produit/${slug}`,
      category     : product.category_name,
      offers       : {
        '@type'       : 'Offer',
        price         : product.price,
        priceCurrency : 'MRU',
        availability  : product.is_available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        seller        : { '@type': 'Organization', name: product.boutique_name },
      },
    } : undefined,
  })
  const [notFound, setNotFound] = useState(false)
  const [activeImg, setActiveImg] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setNotFound(false)
    setProduct(null)
    setSimilar([])
    setActiveImg(0)

    api.get(`/products/${slug}/`)
      .then(res => {
        const p: ProductDetail = res.data
        setProduct(p)
        const catSlug = p.category_slug
        if (catSlug) {
          api.get('/products/', { params: { category: catSlug, page_size: 10 } })
            .then(r => {
              const list: Product[] = Array.isArray(r.data) ? r.data : (r.data?.results ?? [])
              setSimilar(list.filter(x => x.slug !== slug).slice(0, 8))
            }).catch(() => {})
        }
      })
      .catch(err => {
        if (err?.response?.status === 404) setNotFound(true)
      })
      .finally(() => setLoading(false))
  }, [slug])

  const share = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (loading) return <Skeleton />

  if (notFound || !product) {
    return (
      <div className="pt-[192px] sm:pt-[100px] min-h-screen bg-white flex flex-col items-center justify-center gap-4 text-center px-4">
        <span className="text-7xl select-none">📦</span>
        <h1 className="text-xl font-bold text-gray-900">
          {lang === 'fr' ? 'Produit introuvable' : 'المنتج غير موجود'}
        </h1>
        <p className="text-sm text-gray-400 max-w-xs">
          {lang === 'fr'
            ? 'Ce produit n\'existe plus ou a été retiré.'
            : 'هذا المنتج لم يعد متاحاً أو تمت إزالته.'}
        </p>
        <button onClick={() => navigate('/explorer')}
          className="mt-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all hover:opacity-90"
          style={{ background: '#F8AC12', color: '#0D0D0D' }}>
          {lang === 'fr' ? '← Retour à l\'exploration' : '← العودة للاستكشاف'}
        </button>
      </div>
    )
  }

  // Build image list (deduplicate)
  const images: string[] = []
  if (product.primary_image_url) images.push(product.primary_image_url)
  else if (product.primary_image) images.push(product.primary_image)
  ;(product.images ?? []).forEach(i => {
    const url = i.image_url
    if (url && !images.includes(url)) images.push(url)
  })
  const hasImages = images.length > 0

  const hasWhatsApp = !!product.boutique_whatsapp
  const hasPhone = !!product.boutique_phone
  const waNumber = product.boutique_whatsapp?.replace(/\D/g, '') ?? ''
  const price = parseFloat(product.price).toLocaleString('fr-FR')

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="pt-[192px] sm:pt-[100px] bg-white min-h-screen">

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="border-b border-gray-100 bg-white/95 backdrop-blur sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-11 flex items-center justify-between">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 overflow-hidden">
            <a href="/" className="hover:text-gray-600 transition-colors shrink-0">
              {lang === 'fr' ? 'Accueil' : 'الرئيسية'}
            </a>
            <span className="shrink-0">/</span>
            <a href="/explorer" className="hover:text-gray-600 transition-colors shrink-0">
              {lang === 'fr' ? 'Explorer' : 'استكشف'}
            </a>
            {product.category_name && (
              <>
                <span className="shrink-0">/</span>
                <span className="shrink-0">{product.category_name}</span>
              </>
            )}
            <span className="shrink-0">/</span>
            <span className="text-gray-700 font-medium truncate">{product.title}</span>
          </nav>

          <div className="flex items-center gap-2 shrink-0 ml-4">
            <button onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors px-2 py-1 rounded-lg hover:bg-gray-50">
              <ArrowLeft size={13} />
              {lang === 'fr' ? 'Retour' : 'رجوع'}
            </button>
            <button onClick={share}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors px-2 py-1 rounded-lg hover:bg-gray-50">
              {copied ? <CheckCircle2 size={13} className="text-green-500" /> : <Share2 size={13} />}
              {copied ? (lang === 'fr' ? 'Copié !' : 'تم النسخ!') : (lang === 'fr' ? 'Partager' : 'مشاركة')}
            </button>
          </div>
        </div>
      </div>

      {/* ── Product section ──────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">

          {/* ── LEFT: Image gallery ─────────────────────────────────────── */}
          <div>
            <div className="flex gap-3">

              {/* Vertical thumbnail strip — desktop only */}
              {images.length > 1 && (
                <div className="hidden md:flex flex-col gap-2 shrink-0">
                  {images.map((src, i) => (
                    <button key={i}
                      onClick={() => setActiveImg(i)}
                      className={`w-[68px] h-[68px] rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-gray-50 ${
                        i === activeImg
                          ? 'border-amber-400 shadow-md'
                          : 'border-gray-100 hover:border-gray-300'
                      }`}>
                      <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}

              {/* Main image */}
              <div className="flex-1 relative aspect-square bg-gray-50 rounded-2xl overflow-hidden flex items-center justify-center border border-gray-100">
                {hasImages ? (
                  <img
                    src={images[activeImg]}
                    alt={product.title}
                    key={activeImg}
                    className="w-full h-full object-contain p-4"
                    style={{ animation: 'fadeIn 0.2s ease' }}
                  />
                ) : (
                  <span className="text-8xl select-none">📦</span>
                )}
                {/* Availability ribbon */}
                {!product.is_available && (
                  <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                    {lang === 'fr' ? 'Rupture' : 'نفد'}
                  </div>
                )}
              </div>
            </div>

            {/* Horizontal thumbnail strip — mobile only */}
            {images.length > 1 && (
              <div className="md:hidden flex gap-2 overflow-x-auto mt-3 pb-1" style={{ scrollbarWidth: 'none' }}>
                {images.map((src, i) => (
                  <button key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 bg-gray-50 transition-all ${
                      i === activeImg ? 'border-amber-400' : 'border-gray-100'
                    }`}>
                    <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Product info ─────────────────────────────────────── */}
          <div className="lg:sticky lg:top-[88px] self-start">

            {/* Badges */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {product.category_name && (
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg"
                  style={{ background: '#FFF5D6', color: '#C98A00' }}>
                  {product.category_name}
                </span>
              )}
              <span className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                product.is_available ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
              }`}>
                {product.is_available
                  ? <CheckCircle2 size={11} />
                  : <XCircle size={11} />}
                {product.is_available
                  ? (lang === 'fr' ? 'En stock' : 'متوفر')
                  : (lang === 'fr' ? 'Rupture de stock' : 'نفد المخزون')}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-6">
              {product.title}
            </h1>

            {/* Price block */}
            <div className="rounded-2xl px-5 py-4 mb-5 border"
              style={{ background: '#FFFBEB', borderColor: '#FDE68A' }}>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-600 mb-1.5">
                {lang === 'fr' ? 'Prix' : 'السعر'}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900 leading-none">{price}</span>
                <span className="text-base text-gray-400 font-medium">MRU</span>
              </div>
              {product.stock_quantity != null && (
                <p className="text-xs text-gray-500 mt-2">
                  {product.stock_quantity}{' '}
                  {lang === 'fr'
                    ? `unité${product.stock_quantity !== 1 ? 's' : ''} disponible${product.stock_quantity !== 1 ? 's' : ''}`
                    : 'وحدة متاحة'}
                </p>
              )}
            </div>

            {/* Boutique card */}
            {product.boutique_name && (
              <a href={`/boutique/${product.boutique_slug}`}
                className="group flex items-center gap-3 border border-gray-100 rounded-2xl px-4 py-3.5 mb-5 hover:border-amber-200 hover:bg-amber-50/40 transition-all">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: '#FFF5D6' }}>
                  <ShoppingBag size={17} style={{ color: '#C98A00' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-gray-900 truncate">{product.boutique_name}</p>
                  {product.boutique_ville && (
                    <p className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                      <MapPin size={10} />
                      {product.boutique_ville}
                    </p>
                  )}
                </div>
                <ChevronRight size={15} className="text-gray-300 group-hover:text-amber-400 transition-colors shrink-0" />
              </a>
            )}

            {/* Contact section header */}
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">
              {lang === 'fr' ? 'Contacter le vendeur' : 'تواصل مع البائع'}
            </p>

            {/* CTA buttons */}
            <div className="flex gap-3">
              {hasWhatsApp && (
                <a href={`https://wa.me/${waNumber}?text=${encodeURIComponent(lang === 'fr' ? `Bonjour, je suis intéressé par votre produit "${product.title}".` : `مرحباً، أنا مهتم بمنتجك "${product.title}".`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 h-13 py-4 rounded-2xl text-white font-bold text-sm transition-all hover:opacity-90 hover:shadow-lg"
                  style={{ background: '#25D366', boxShadow: '0 4px 16px rgba(37,211,102,0.3)' }}>
                  <WaIcon size={18} />
                  WhatsApp
                </a>
              )}
              {hasPhone && (
                <a href={`tel:${product.boutique_phone}`}
                  className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm transition-all hover:opacity-90 hover:shadow-lg ${
                    hasWhatsApp ? 'px-6' : 'flex-1'
                  }`}
                  style={{
                    background: '#F8AC12',
                    color: '#0D0D0D',
                    boxShadow: '0 4px 16px rgba(248,172,18,0.35)',
                  }}>
                  <Phone size={17} />
                  {!hasWhatsApp && (lang === 'fr' ? 'Appeler' : 'اتصال')}
                </a>
              )}
              {!hasWhatsApp && !hasPhone && product.boutique_slug && (
                <a href={`/boutique/${product.boutique_slug}`}
                  className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm bg-gray-900 text-white hover:bg-gray-700 transition-all">
                  <ShoppingBag size={17} />
                  {lang === 'fr' ? 'Voir la boutique' : 'عرض المتجر'}
                </a>
              )}
            </div>

            {/* Trust row */}
            <div className="flex items-center gap-4 mt-5 pt-5 border-t border-gray-100">
              {[
                { emoji: '🔒', label: lang === 'fr' ? 'Paiement sécurisé' : 'دفع آمن' },
                { emoji: '🚀', label: lang === 'fr' ? 'Livraison rapide' : 'توصيل سريع' },
                { emoji: '✅', label: lang === 'fr' ? 'Vendeur vérifié' : 'بائع موثق' },
              ].map(t => (
                <div key={t.label} className="flex items-center gap-1.5 text-xs text-gray-400">
                  <span>{t.emoji}</span>
                  <span>{t.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Description ─────────────────────────────────────────────────── */}
        {product.description && (
          <div className="mt-12 pt-10 border-t border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-5">
              {lang === 'fr' ? 'Description du produit' : 'وصف المنتج'}
            </h2>
            <div className={`text-sm text-gray-600 leading-7 whitespace-pre-line ${!expanded ? 'line-clamp-6' : ''}`}>
              {product.description}
            </div>
            {product.description.length > 400 && (
              <button onClick={() => setExpanded(v => !v)}
                className="mt-3 text-sm font-bold transition-colors hover:opacity-80"
                style={{ color: '#C98A00' }}>
                {expanded
                  ? (lang === 'fr' ? '↑ Réduire' : '↑ تقليص')
                  : (lang === 'fr' ? '↓ Lire plus' : '↓ قراءة المزيد')}
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Similar products ─────────────────────────────────────────────── */}
      {similar.length > 0 && (
        <div className="border-t border-gray-100 bg-gray-50/60">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              {lang === 'fr' ? 'Produits similaires' : 'منتجات مشابهة'}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
              {similar.map(p => <ProductCard key={p.id} item={p} />)}
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile sticky bottom bar ─────────────────────────────────────── */}
      {(hasWhatsApp || hasPhone) && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 px-4 py-3 flex gap-3">
          {hasWhatsApp && (
            <a href={`https://wa.me/${waNumber}?text=${encodeURIComponent(lang === 'fr' ? `Bonjour, je suis intéressé par "${product.title}".` : `مرحباً، أنا مهتم بـ "${product.title}".`)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90"
              style={{ background: '#25D366' }}>
              <WaIcon size={17} />
              WhatsApp
            </a>
          )}
          {hasPhone && (
            <a href={`tel:${product.boutique_phone}`}
              className={`flex items-center justify-center gap-2 h-12 rounded-xl font-bold text-sm transition-all hover:opacity-90 ${
                hasWhatsApp ? 'px-6' : 'flex-1'
              }`}
              style={{ background: '#F8AC12', color: '#0D0D0D' }}>
              <Phone size={17} />
              {!hasWhatsApp && (lang === 'fr' ? 'Appeler' : 'اتصال')}
            </a>
          )}
        </div>
      )}

      {/* Fade-in keyframe */}
      <style>{`@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }`}</style>
    </div>
  )
}
