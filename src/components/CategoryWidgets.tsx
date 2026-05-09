import { useRef } from 'react'
import { type Lang } from '../constants/i18n'
import { CATEGORIES } from '../constants/categories'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  lang: Lang
  onFilter: (parentKey: string) => void
  onSubFilter: (subSlug: string) => void
}

export default function CategoryWidgets({ lang, onFilter, onSubFilter }: Props) {
  const isRtl   = lang === 'ar'
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'prev' | 'next') => {
    const el = scrollRef.current
    if (!el) return
    const cardW = el.firstElementChild?.clientWidth ?? 320
    el.scrollBy({ left: dir === 'next' ? cardW + 16 : -(cardW + 16), behavior: 'smooth' })
  }

  return (
    <section id="boutiques" dir={isRtl ? 'rtl' : 'ltr'}
      className="max-w-[1440px] mx-auto px-4 md:px-6 py-10">

      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold text-foreground">
          {lang === 'fr' ? 'Explorer par catégorie' : 'تصفح حسب الفئة'}
        </h2>
        {/* Desktop arrows */}
        <div className="hidden sm:flex items-center gap-2">
          <button onClick={() => scroll('prev')}
            className="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:border-amber-400 hover:text-amber-600 transition-all shadow-sm">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => scroll('next')}
            className="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:border-amber-400 hover:text-amber-600 transition-all shadow-sm">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
        style={{ scrollbarWidth: 'none', scrollSnapType: 'x mandatory' }}>

        {CATEGORIES.map(widget => {
          const photos = widget.subs.slice(0, 4)
          return (
            <div key={widget.key}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow shrink-0"
              style={{
                scrollSnapAlign: 'start',
                // Mobile: (100vw - 88px) shows ~40 px peek of next card so users see it's a carousel
                // Capped at 340px on wider screens where multiple cards fit naturally
                width: 'clamp(260px, calc(100vw - 88px), 340px)',
              }}>

              <div className="px-4 pt-4 pb-2 flex items-center gap-2">
                <span className="text-lg">{widget.emoji}</span>
                <h3 className="font-semibold text-base text-foreground">{widget.label[lang]}</h3>
              </div>

              {/* 2×2 photo grid */}
              <div className="grid grid-cols-2 gap-0.5 px-4 pb-2">
                {photos.map(photo => (
                  <button key={photo.slug}
                    onClick={() => onSubFilter(photo.slug)}
                    className="group relative aspect-square overflow-hidden rounded-lg bg-gray-50">
                    <img
                      src={photo.img}
                      alt={photo.label[lang]}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                    <span className="absolute bottom-1.5 left-0 right-0 text-center text-white text-[10px] font-medium px-1 leading-tight drop-shadow">
                      {photo.label[lang]}
                    </span>
                  </button>
                ))}
              </div>

              <div className="px-4 pb-4">
                <button
                  onClick={() => onFilter(widget.key)}
                  className="text-sm font-semibold hover:underline transition-colors"
                  style={{ color: '#F8AC12' }}>
                  {lang === 'fr' ? `Voir ${widget.label.fr} →` : `عرض ${widget.label.ar} →`}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
