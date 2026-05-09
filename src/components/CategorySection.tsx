import { t, typeEmojis, type Lang } from '../constants/i18n'

interface Props { lang: Lang; onFilter: (type: string) => void }

const CATS = [
  { type: 'restaurant', img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80', count: { fr: 'Restaurants & cafés', ar: 'مطاعم ومقاهي' } },
  { type: 'supermarche', img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80', count: { fr: 'Épiceries & supermarchés', ar: 'بقالات وسوبرماركت' } },
  { type: 'arrivage', img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80', count: { fr: 'Nouveaux arrivages', ar: 'بضائع جديدة' } },
  { type: 'electronique', img: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600&q=80', count: { fr: 'Électronique & tech', ar: 'إلكترونيات وتقنية' } },
]

export default function CategorySection({ lang, onFilter }: Props) {
  const isRtl = lang === 'ar'

  return (
    <section id="categories" dir={isRtl ? 'rtl' : 'ltr'} className="max-w-7xl mx-auto px-4 md:px-8 py-20">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted mb-2">{lang === 'fr' ? '— Explorer' : '— استكشف'}</p>
          <h2 className="font-display text-3xl md:text-4xl font-medium tracking-tight">{t.categories.title[lang]}</h2>
        </div>
        <a href="#boutiques" className="hidden md:inline-flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors">
          {lang === 'fr' ? 'Voir tout' : 'عرض الكل'} <span>→</span>
        </a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {CATS.map(cat => (
          <button key={cat.type} onClick={() => onFilter(cat.type)}
            className="group relative aspect-[3/4] overflow-hidden rounded-2xl text-left focus:outline-none">
            <img src={cat.img} alt={t.types[cat.type as keyof typeof t.types]?.[lang]}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(13,13,13,0.75) 0%, rgba(13,13,13,0.1) 60%, transparent 100%)' }} />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <p className="text-xl">{typeEmojis[cat.type]}</p>
              <p className="font-display text-lg font-medium mt-1">{t.types[cat.type as keyof typeof t.types]?.[lang]}</p>
              <p className="text-xs text-white/60 mt-0.5">{cat.count[lang]}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
