import { useState, useRef } from 'react'
import { Grid3X3 } from 'lucide-react'
import { type Lang } from '../constants/i18n'
import { CATEGORIES } from '../constants/categories'

interface Props { lang: Lang; onFilter: (type: string) => void }

export default function CategoryBar({ lang, onFilter }: Props) {
  const [active, setActive] = useState<string | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isRtl = lang === 'ar'

  const open = (key: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setActive(key)
  }
  const close = () => {
    timeoutRef.current = setTimeout(() => setActive(null), 160)
  }
  const keep = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }

  const activeCat = CATEGORIES.find(c => c.key === active)

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'}
      className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-stretch overflow-x-auto" style={{ scrollbarWidth: 'none' }}>

          {/* "Tout voir" tab */}
          <button
            onClick={() => { onFilter(''); setActive(null) }}
            className="flex items-center gap-2 px-5 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 border-transparent hover:border-primary hover:text-primary transition-all shrink-0 text-gray-600">
            <Grid3X3 size={14} />
            {lang === 'fr' ? 'Tout voir' : 'عرض الكل'}
          </button>

          {/* Category tabs */}
          {CATEGORIES.map(cat => (
            <button key={cat.key}
              onMouseEnter={() => open(cat.key)}
              onMouseLeave={close}
              onClick={() => { onFilter(cat.key); setActive(null) }}
              className="flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all shrink-0"
              style={{
                borderBottomColor: active === cat.key ? '#F8AC12' : 'transparent',
                color: active === cat.key ? '#F8AC12' : '#4B5563',
              }}>
              <span>{cat.emoji}</span>
              {cat.label[lang]}
            </button>
          ))}
        </div>
      </div>

      {/* ── Megadropdown ──────────────────────────────────────────────────── */}
      {activeCat && (
        <div
          className="absolute left-0 right-0 bg-white border-t border-gray-100 shadow-2xl z-50"
          onMouseEnter={keep}
          onMouseLeave={close}>
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">

            {/* Header */}
            <div className="flex items-center gap-2 mb-5 text-xs font-bold uppercase tracking-widest text-gray-400">
              <span>{activeCat.emoji}</span>
              {activeCat.label[lang]}
            </div>

            {/* Subcategory grid — image cards */}
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {activeCat.subs.map(sub => (
                <button
                  key={sub.slug}
                  onClick={() => { onFilter(activeCat.key); setActive(null) }}
                  className="group flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-amber-50 transition-all text-center">

                  {/* Image thumbnail */}
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100 group-hover:border-amber-200 transition-all">
                    <img
                      src={sub.img}
                      alt={sub.label.fr}
                      loading="lazy"
                      className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300"
                    />
                  </div>

                  {/* Label */}
                  <span className="text-[11px] font-medium text-gray-600 group-hover:text-amber-700 leading-tight line-clamp-2 transition-colors w-full">
                    {sub.label[lang]}
                  </span>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                {lang === 'fr'
                  ? `${activeCat.subs.length} sous-catégories dans "${activeCat.label.fr}"`
                  : `${activeCat.subs.length} فئة فرعية في "${activeCat.label.ar}"`}
              </p>
              <button
                onClick={() => { onFilter(activeCat.key); setActive(null) }}
                className="text-xs font-semibold px-4 py-1.5 rounded-full hover:opacity-90 transition-all"
                style={{ background: '#F8AC12', color: '#0D0D0D' }}>
                {lang === 'fr' ? 'Voir tout →' : 'عرض الكل →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
