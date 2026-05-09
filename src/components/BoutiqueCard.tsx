import type { Boutique } from '../lib/api'
import { type Lang } from '../constants/i18n'

interface Props { boutique: Boutique; lang: Lang }

const PLACEHOLDER = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80'

const TYPE_EMOJI: Record<string, string> = {
  restaurant: '🍽️', arrivage: '📦', supermarche: '🛒',
  electronique: '📱', quincaillerie: '🔩', autre: '🏪',
}
const TYPE_LABEL: Record<string, { fr: string; ar: string }> = {
  restaurant:    { fr: 'Restaurant',    ar: 'مطعم'         },
  supermarche:   { fr: 'Supermarché',   ar: 'سوبرماركت'    },
  arrivage:      { fr: 'Arrivage',      ar: 'بضائع جديدة'  },
  electronique:  { fr: 'Électronique',  ar: 'إلكترونيات'   },
  quincaillerie: { fr: 'Quincaillerie', ar: 'أدوات'        },
  autre:         { fr: 'Autre',         ar: 'أخرى'         },
}

function WaIcon() {
  return (
    <svg viewBox="0 0 24 24" width={13} height={13} fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

export default function BoutiqueCard({ boutique, lang }: Props) {
  const emoji     = TYPE_EMOJI[boutique.boutique_type] ?? '🏪'
  const typeLabel = TYPE_LABEL[boutique.boutique_type]?.[lang] ?? boutique.boutique_type_display
  const wa        = boutique.whatsap_number?.replace(/\D/g, '')

  return (
    <a href={`/boutique/${boutique.slug}`}
      className="group block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">

      {/* Cover image */}
      <div className="relative h-44 bg-gray-100 overflow-hidden">
        <img
          src={boutique.image_url || PLACEHOLDER}
          alt={boutique.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

        {/* Type badge — top left */}
        <span className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-1 rounded-full">
          <span>{emoji}</span>
          {typeLabel}
        </span>

        {/* Product count — top right */}
        {boutique.product_count > 0 && (
          <span className="absolute top-2.5 right-2.5 text-[10px] font-bold px-2 py-1 rounded-full"
            style={{ background: '#F8AC12', color: '#0D0D0D' }}>
            {boutique.product_count} {lang === 'fr' ? 'prod.' : 'منتج'}
          </span>
        )}

        {/* Store name — pinned to bottom of image */}
        <div className="absolute bottom-0 left-0 right-0 px-3 pb-2.5 pt-6">
          <p className="text-white font-bold text-sm leading-tight line-clamp-1 drop-shadow">
            {boutique.name}
          </p>
          {boutique.ville && (
            <p className="text-white/70 text-[10px] mt-0.5 flex items-center gap-1">
              <span>📍</span> {boutique.ville}
            </p>
          )}
        </div>
      </div>

      {/* Card body */}
      <div className="p-3">
        {boutique.description ? (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3 min-h-[32px]">
            {boutique.description}
          </p>
        ) : (
          <div className="min-h-[32px] mb-3" />
        )}

        <div className="flex items-center gap-2">
          {wa ? (
            <a
              href={`https://wa.me/${wa}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1.5 flex-1 justify-center h-8 rounded-xl text-[11px] font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: '#25D366' }}>
              <WaIcon /> WhatsApp
            </a>
          ) : null}
          <span
            className="flex items-center justify-center h-8 px-3 rounded-xl text-[11px] font-semibold border border-gray-200 text-gray-600 hover:border-amber-400 hover:text-amber-700 transition-all flex-1">
            {lang === 'fr' ? 'Voir →' : 'عرض →'}
          </span>
        </div>
      </div>
    </a>
  )
}
