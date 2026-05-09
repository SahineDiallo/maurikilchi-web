import { t, typeEmojis, type Lang } from '../constants/i18n'

const TYPES = ['', 'restaurant', 'arrivage', 'supermarche', 'electronique', 'quincaillerie', 'autre'] as const
type BoutiqueType = typeof TYPES[number]

interface Props {
  lang: Lang
  active: string
  onChange: (type: string) => void
}

export default function CategoryFilter({ lang, active, onChange }: Props) {
  const isRtl = lang === 'ar'

  const label = (type: BoutiqueType) => {
    if (type === '') return t.categories.all[lang]
    return t.types[type as keyof typeof t.types]?.[lang] ?? type
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'}
      className="flex items-center gap-2 overflow-x-auto pb-1"
      style={{ scrollbarWidth: 'none' }}>
      {TYPES.map((type) => {
        const isActive = active === type
        return (
          <button
            key={type || 'all'}
            onClick={() => onChange(type)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold shrink-0 transition-all border-2 ${
              isActive
                ? 'text-white border-transparent shadow-lg scale-105'
                : 'bg-white text-gray-600 border-gray-200 hover:border-amber-400 hover:text-amber-700 hover:shadow-md'
            }`}
            style={isActive ? { background: 'linear-gradient(135deg, #F8AC12, #F57C00)', borderColor: 'transparent' } : {}}
          >
            {type !== '' && <span className="text-base">{typeEmojis[type]}</span>}
            {label(type)}
          </button>
        )
      })}
    </div>
  )
}
