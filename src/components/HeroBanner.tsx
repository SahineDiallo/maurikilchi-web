import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { type Lang } from '../constants/i18n'

interface Slide {
  id: number
  bg: string
  accent: string
  img: string
  tag: { fr: string; ar: string }
  title: { fr: ReactNode; ar: ReactNode }
  sub: { fr: string; ar: string }
  cta: { fr: string; ar: string }
  href: string
}

const mkSlides = (accent1 = '#F8AC12', accent2 = '#FCD34D', accent3 = '#38BDF8'): Slide[] => [
  {
    id: 1,
    bg: 'linear-gradient(135deg, #0D0D0D 0%, #1a0800 60%, #2d1200 100%)',
    accent: accent1,
    img: 'https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=900&q=80',
    tag: { fr: '✦ Bienvenue sur Mauri-Kilchi', ar: '✦ مرحباً في موري-كيلشي' },
    title: {
      fr: <><span className="text-white">Le marché mauritanien,</span><br /><span style={{ color: accent1 }}>réinventé.</span></>,
      ar: <><span className="text-white">السوق الموريتاني،</span><br /><span style={{ color: accent1 }}>من جديد.</span></>,
    },
    sub: { fr: 'Boutiques locales, restaurants et arrivages — tout en un.', ar: 'متاجر محلية، مطاعم وبضائع — كل شيء في مكان واحد.' },
    cta: { fr: 'Explorer maintenant', ar: 'استكشف الآن' },
    href: '/explorer',
  },
  {
    id: 2,
    bg: 'linear-gradient(135deg, #6b0f0f 0%, #991b1b 50%, #b45309 100%)',
    accent: accent2,
    img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&q=80',
    tag: { fr: '🍽️ Restaurants & Cuisine', ar: '🍽️ مطاعم ومطبخ' },
    title: {
      fr: <><span className="text-white">Les meilleures saveurs</span><br /><span style={{ color: accent2 }}>de Mauritanie.</span></>,
      ar: <><span className="text-white">أفضل النكهات</span><br /><span style={{ color: accent2 }}>في موريتانيا.</span></>,
    },
    sub: { fr: 'Cuisine locale, fast food, pâtisseries — livré chez vous.', ar: 'مطبخ محلي، وجبات سريعة، حلويات — تُوصل إليك.' },
    cta: { fr: 'Voir les restaurants', ar: 'عرض المطاعم' },
    href: '/explorer?parent=restaurant',
  },
  {
    id: 3,
    bg: 'linear-gradient(135deg, #0c4a6e 0%, #075985 50%, #0369a1 100%)',
    accent: accent3,
    img: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=900&q=80',
    tag: { fr: '📦 Arrivages & Shopping', ar: '📦 بضائع ومشتريات' },
    title: {
      fr: <><span className="text-white">Nouveaux arrivages</span><br /><span style={{ color: accent3 }}>chaque semaine.</span></>,
      ar: <><span className="text-white">بضائع جديدة</span><br /><span style={{ color: accent3 }}>كل أسبوع.</span></>,
    },
    sub: { fr: 'Mode, électronique, mobilier — les dernières nouveautés.', ar: 'أزياء، إلكترونيات، أثاث — آخر الوافدين.' },
    cta: { fr: 'Voir les arrivages', ar: 'عرض البضائع' },
    href: '/explorer?parent=arrivage',
  },
]

interface Props { lang: Lang }

export default function HeroBanner({ lang }: Props) {
  const [current, setCurrent] = useState(0)
  const isRtl = lang === 'ar'
  const allSlides = mkSlides()

  const go = useCallback((idx: number) => setCurrent(idx), [])
  const next = useCallback(() => go((current + 1) % allSlides.length), [current, allSlides.length, go])
  const prev = () => go((current - 1 + allSlides.length) % allSlides.length)

  useEffect(() => {
    const t = setInterval(next, 5500)
    return () => clearInterval(t)
  }, [next])

  const activeSlide = allSlides[current]

  return (
    <div className="max-w-[1440px] mx-auto px-0 md:px-6 py-0 md:py-4">
      <div className="relative overflow-hidden md:rounded-2xl" style={{ height: '42vh', minHeight: 300, maxHeight: 480 }}>

        {/* All slides stacked — crossfade via opacity transition */}
        {allSlides.map((slide, i) => {
          const active = i === current
          return (
            <div
              key={slide.id}
              className="absolute inset-0"
              style={{
                opacity: active ? 1 : 0,
                transition: 'opacity 0.65s ease-in-out',
                pointerEvents: active ? 'auto' : 'none',
                borderRadius: 'inherit',
              }}>

              {/* Background gradient */}
              <div className="absolute inset-0" style={{ background: slide.bg, borderRadius: 'inherit' }} />

              {/* Content grid — mobile: image full-bleed bg + text overlay; desktop: side-by-side */}
              <div className={`relative z-10 h-full md:grid md:grid-cols-2`} dir={isRtl ? 'rtl' : 'ltr'}>

                {/* Photo — absolute full-bleed on mobile, left column on desktop */}
                <div className="absolute inset-0 md:relative md:inset-auto overflow-hidden">
                  <img
                    src={slide.img}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                    loading={i === 0 ? 'eager' : 'lazy'}
                  />
                  {/* Mobile: dark scrim so text is legible */}
                  <div className="absolute inset-0 bg-black/50 md:hidden" />
                  {/* Desktop: fade photo into the text-side gradient */}
                  <div className="absolute inset-0 hidden md:block"
                    style={{
                      background: isRtl
                        ? `linear-gradient(to left, ${slide.bg.split(',')[1]?.trim() ?? '#111'} 0%, transparent 60%)`
                        : `linear-gradient(to right, transparent 45%, ${slide.bg.split('100%')[0].split(',').pop()?.trim().replace(')', '') ?? '#111'} 100%)`,
                    }} />
                  {/* Top fade */}
                  <div className="absolute inset-x-0 top-0 h-16"
                    style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), transparent)' }} />
                </div>

                {/* Text — overlaid full-height on mobile, right column on desktop */}
                <div className={`relative z-10 h-full flex flex-col justify-end md:justify-center px-6 md:px-12 py-8 ${isRtl ? 'text-right' : 'text-left'}`}>
                  <span
                    className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full mb-4 w-fit border"
                    style={{ color: slide.accent, borderColor: `${slide.accent}50`, background: `${slide.accent}18` }}>
                    {slide.tag[lang]}
                  </span>

                  <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold leading-tight mb-3">
                    {slide.title[lang]}
                  </h2>

                  <p className="text-white/75 text-sm mb-5 max-w-xs leading-relaxed">
                    {slide.sub[lang]}
                  </p>

                  <Link
                    to={slide.href}
                    className="inline-flex items-center gap-2 h-10 px-6 rounded-full text-sm font-semibold w-fit transition-all hover:opacity-90 hover:scale-105"
                    style={{ background: slide.accent, color: '#0D0D0D' }}>
                    {slide.cta[lang]} →
                  </Link>
                </div>
              </div>
            </div>
          )
        })}

        {/* Prev / Next buttons — always on top */}
        {(['prev', 'next'] as const).map(dir => (
          <button key={dir}
            onClick={dir === 'prev' ? prev : next}
            className={`absolute top-1/2 -translate-y-1/2 ${
              (dir === 'prev') !== isRtl ? 'left-3' : 'right-3'
            } w-8 h-8 rounded-full flex items-center justify-center border border-white/20 text-white hover:bg-white/20 transition-all z-20`}
            style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(6px)' }}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" d={
                ((dir === 'prev') !== isRtl) ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'
              } />
            </svg>
          </button>
        ))}

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {allSlides.map((_s, i) => (
            <button key={i} onClick={() => go(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === current ? 22 : 6,
                height: 6,
                background: i === current ? activeSlide.accent : 'rgba(255,255,255,0.4)',
              }} />
          ))}
        </div>
      </div>
    </div>
  )
}
