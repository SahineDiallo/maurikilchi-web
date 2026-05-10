import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Search } from 'lucide-react'
import { type Lang } from '../constants/i18n'

interface Props { lang: Lang }

const T = {
  fr: {
    code:        '404',
    title:       'Page introuvable',
    desc:        "Cette page n'existe pas ou a été déplacée. Vérifiez l'adresse ou retournez à l'accueil.",
    back:        "Retour à l'accueil",
    explore:     'Explorer les boutiques',
  },
  ar: {
    code:        '404',
    title:       'الصفحة غير موجودة',
    desc:        'هذه الصفحة غير موجودة أو تم نقلها. تحقق من العنوان أو عد إلى الصفحة الرئيسية.',
    back:        'العودة إلى الرئيسية',
    explore:     'استكشاف المتاجر',
  },
}

export default function NotFoundPage({ lang }: Props) {
  const t      = T[lang]
  const isRtl  = lang === 'ar'
  const nav    = useNavigate()

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-[70vh] flex items-center justify-center px-6 py-20">
      <div className="max-w-lg w-full text-center">

        {/* Decorative number */}
        <div className="relative select-none mb-6">
          <span
            className="text-[160px] sm:text-[200px] font-black leading-none tracking-tighter"
            style={{ color: '#F8AC12', opacity: 0.12 }}
          >
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: '#F8AC12' }}>
              <Search size={36} color="#0D0D0D" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{t.title}</h1>
        <p className="text-gray-500 text-sm sm:text-base leading-relaxed mb-10 max-w-sm mx-auto">{t.desc}</p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => nav(-1)}
            className="flex items-center justify-center gap-2 h-12 px-6 rounded-xl border-2 border-gray-200
                       text-sm font-semibold text-gray-700 hover:border-amber-400 hover:text-amber-700 transition-all"
          >
            <ArrowLeft size={16} className={isRtl ? 'rotate-180' : ''} />
            {lang === 'fr' ? 'Retour' : 'رجوع'}
          </button>
          <Link
            to="/"
            className="flex items-center justify-center gap-2 h-12 px-6 rounded-xl text-sm font-bold
                       hover:opacity-90 transition-all"
            style={{ background: '#F8AC12', color: '#0D0D0D' }}
          >
            {t.back}
          </Link>
          <Link
            to="/explorer"
            className="flex items-center justify-center gap-2 h-12 px-6 rounded-xl border-2 border-gray-200
                       text-sm font-semibold text-gray-700 hover:border-amber-400 hover:text-amber-700 transition-all"
          >
            {t.explore}
          </Link>
        </div>
      </div>
    </div>
  )
}
