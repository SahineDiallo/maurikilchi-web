import { Boutique } from '../lib/api'
import { t, Lang, typeEmojis } from '../constants/i18n'

interface Props {
  boutique: Boutique
  lang: Lang
}

const PLACEHOLDER = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80'

export default function BoutiqueCard({ boutique, lang }: Props) {
  const isRtl = lang === 'ar'
  const typeKey = boutique.boutique_type as keyof typeof t.types
  const typeLabel = t.types[typeKey]?.[lang] ?? boutique.boutique_type_display

  return (
    <a
      href={`/boutique/${boutique.slug}`}
      dir={isRtl ? 'rtl' : 'ltr'}
      className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-amber-200 hover:shadow-lg transition-all duration-200"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img
          src={boutique.image_url || PLACEHOLDER}
          alt={boutique.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER }}
        />
        {/* Type badge */}
        <div className={`absolute top-3 ${isRtl ? 'right-3' : 'left-3'} flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm`}
          style={{ background: 'rgba(255,255,255,0.92)', color: '#1A1A1A' }}>
          <span>{typeEmojis[boutique.boutique_type] ?? '🏪'}</span>
          {typeLabel}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-base line-clamp-1 mb-1">{boutique.name}</h3>

        {boutique.description ? (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">{boutique.description}</p>
        ) : (
          <div className="mb-3" />
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            {boutique.ville && (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{boutique.ville}</span>
              </>
            )}
          </div>
          <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
            {boutique.product_count} {t.boutiques.products[lang]}
          </span>
        </div>
      </div>
    </a>
  )
}
