import { t, Lang, typeEmojis } from '../constants/i18n'

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
    <div dir={isRtl ? 'rtl' : 'ltr'} className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
        {TYPES.map((type) => {
          const isActive = active === type
          return (
            <button
              key={type || 'all'}
              onClick={() => onChange(type)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium shrink-0 transition-all border ${
                isActive
                  ? 'text-white border-transparent shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-amber-300 hover:text-amber-700'
              }`}
              style={isActive ? { background: '#F8AC12', borderColor: '#F8AC12' } : {}}
            >
              {type !== '' && <span>{typeEmojis[type]}</span>}
              {label(type)}
            </button>
          )
        })}
      </div>
    </div>
  )
}
