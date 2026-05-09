import { t, type Lang } from '../constants/i18n'

interface Props { lang: Lang; onSearch: (q: string) => void }

const HERO_IMG = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&q=85'

export default function Hero({ lang, onSearch }: Props) {
  const isRtl = lang === 'ar'

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const q = (e.currentTarget.elements.namedItem('q') as HTMLInputElement).value.trim()
    if (q) onSearch(q)
  }

  return (
    <section dir={isRtl ? 'rtl' : 'ltr'} className="relative overflow-hidden bg-foreground">
      <div className="mx-auto grid max-w-7xl items-center gap-0 md:grid-cols-2 min-h-screen">

        {/* Left: content */}
        <div className="relative z-10 px-6 py-28 md:px-12 lg:px-16">
          {/* Badge */}
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/80 mb-6">
            ✦ {t.hero.tag[lang]} · {lang === 'fr' ? 'Mauritanie' : 'موريتانيا'}
          </span>

          {/* Heading */}
          <h1 className={`font-display font-medium leading-[1.08] tracking-tight text-white mb-5 ${isRtl ? 'text-5xl md:text-6xl' : 'text-5xl md:text-7xl'}`}>
            {lang === 'fr' ? (
              <>Le marché<br />mauritanien,<br /><em className="not-italic" style={{ color: '#F8AC12' }}>réinventé.</em></>
            ) : (
              <>السوق<br />الموريتاني،<br /><em className="not-italic" style={{ color: '#F8AC12' }}>من جديد.</em></>
            )}
          </h1>

          <p className="text-white/55 text-base md:text-lg max-w-sm mb-8 leading-relaxed">
            {t.hero.subtitle[lang]}
          </p>

          {/* Search */}
          <form onSubmit={handleSubmit} className="flex gap-2 mb-8 max-w-sm">
            <input
              name="q"
              type="text"
              placeholder={t.hero.searchPlaceholder[lang]}
              className={`flex-1 h-12 bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-full text-sm px-5 focus:border-white/60 focus:bg-white/15 transition-all`}
            />
            <button type="submit"
              className="h-12 px-5 rounded-full text-sm font-semibold shrink-0 transition-all hover:opacity-90"
              style={{ background: '#F8AC12', color: '#0D0D0D' }}>
              {t.hero.searchBtn[lang]}
            </button>
          </form>

          {/* CTA */}
          <div className="flex flex-wrap gap-3 mb-12">
            <a href="#download"
              className="h-11 px-6 rounded-full text-sm font-semibold flex items-center gap-2 transition-all hover:opacity-90"
              style={{ background: '#F8AC12', color: '#0D0D0D' }}>
              {t.hero.ctaApp[lang]} →
            </a>
            <a href="#boutiques"
              className="h-11 px-6 rounded-full text-sm font-semibold flex items-center gap-2 border border-white/25 text-white hover:bg-white/10 transition-all">
              {t.nav.browse[lang]}
            </a>
          </div>

          {/* Stats */}
          <div className="flex gap-10 border-t border-white/10 pt-8">
            {[
              { n: '200+', l: t.hero.stats.boutiques[lang] },
              { n: '5k+', l: t.hero.stats.products[lang] },
              { n: '10+', l: t.hero.stats.cities[lang] },
            ].map(s => (
              <div key={s.l}>
                <p className="font-display text-2xl text-white">{s.n}</p>
                <p className="text-xs text-white/40 mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: image */}
        <div className="relative h-[50vh] md:h-screen">
          <img src={HERO_IMG} alt="Boutique Mauri-Kilchi"
            className="absolute inset-0 w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, #0D0D0D 0%, transparent 40%)' }} />

          {/* Floating card */}
          <div className="absolute bottom-8 left-6 right-6 md:left-8 md:right-8 flex items-center justify-between rounded-2xl p-4 border border-white/10"
            style={{ background: 'rgba(13,13,13,0.75)', backdropFilter: 'blur(12px)' }}>
            <div>
              <p className="text-xs uppercase tracking-wider text-white/40">{lang === 'fr' ? 'En vedette' : 'مميز'}</p>
              <p className="font-display text-white text-base mt-0.5">{lang === 'fr' ? 'Boutiques locales' : 'متاجر محلية'}</p>
            </div>
            <a href="#boutiques"
              className="h-9 px-4 rounded-full text-xs font-semibold flex items-center transition-all hover:opacity-90"
              style={{ background: '#F8AC12', color: '#0D0D0D' }}>
              {lang === 'fr' ? 'Voir' : 'عرض'} →
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
