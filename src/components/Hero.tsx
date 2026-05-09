import { t, Lang } from '../constants/i18n'

interface Props {
  lang: Lang
  onSearch: (q: string) => void
}

export default function Hero({ lang, onSearch }: Props) {
  const isRtl = lang === 'ar'
  const lines = t.hero.title[lang].split('\n')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const q = (e.currentTarget.elements.namedItem('q') as HTMLInputElement).value.trim()
    if (q) onSearch(q)
  }

  return (
    <section
      dir={isRtl ? 'rtl' : 'ltr'}
      className="relative pt-32 pb-20 px-4 sm:px-6 overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #FFFBF0 0%, #FAFAF8 60%, #FFF8E7 100%)' }}
    >
      {/* Decorative blobs */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-30 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #F8AC12 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}
      />
      <div
        className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #F8AC12 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }}
      />

      <div className="relative max-w-3xl mx-auto text-center">
        {/* Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
          style={{ background: '#FFF3CC', color: '#9A6500' }}>
          <span>🇲🇷</span>
          {t.hero.tag[lang]}
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight text-gray-900 mb-5">
          {lines.map((line, i) => (
            <span key={i}>
              {i === 1 ? <span style={{ color: '#F8AC12' }}>{line}</span> : line}
              {i < lines.length - 1 && <br />}
            </span>
          ))}
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
          {t.hero.subtitle[lang]}
        </p>

        {/* Search bar */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 max-w-xl mx-auto mb-8">
          <div className="flex-1 relative">
            <svg
              className={`absolute top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 ${isRtl ? 'right-4' : 'left-4'}`}
              fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
            </svg>
            <input
              name="q"
              type="text"
              placeholder={t.hero.searchPlaceholder[lang]}
              className={`w-full h-13 rounded-2xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all shadow-sm ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'}`}
              style={{ height: '52px' }}
            />
          </div>
          <button
            type="submit"
            className="h-13 px-6 rounded-2xl font-semibold text-sm text-white shadow-sm hover:opacity-90 active:scale-95 transition-all shrink-0"
            style={{ background: '#F8AC12', height: '52px' }}
          >
            {t.hero.searchBtn[lang]}
          </button>
        </form>

        {/* App CTA */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <a
            href="#download"
            className="flex items-center gap-3 px-5 py-3 rounded-2xl font-semibold text-sm text-gray-900 bg-white border border-gray-200 shadow-sm hover:border-amber-400 hover:shadow-md transition-all"
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Google_Play_Arrow_logo.svg/512px-Google_Play_Arrow_logo.svg.png" alt="Play Store" className="w-5 h-5 object-contain" />
            {t.hero.ctaApp[lang]}
          </a>
        </div>

        {/* Stats */}
        <div className="mt-14 flex items-center justify-center gap-8 sm:gap-14 flex-wrap">
          {[
            { value: '200+', label: t.hero.stats.boutiques[lang] },
            { value: '5k+', label: t.hero.stats.products[lang] },
            { value: '10+', label: t.hero.stats.cities[lang] },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
