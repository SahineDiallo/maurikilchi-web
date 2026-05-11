import { type Lang } from '../../constants/i18n'
import { useSeo } from '../../hooks/useSeo'

interface Props { lang: Lang }

const APP_STORE_URL  = 'https://apps.apple.com/app/maurikilchi'
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.maurikilchi'

const HERO_IMG = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&q=80'

const STEPS = [
  {
    emoji: '📲',
    fr: 'Téléchargez l\'app',
    ar: 'حمّل التطبيق',
    descFr: 'Disponible sur iOS et Android, gratuit.',
    descAr: 'متاح على iOS وAndroid مجاناً.',
  },
  {
    emoji: '📍',
    fr: 'Localisez les cars proches',
    ar: 'حدد الكارات القريبة',
    descFr: 'Voyez en temps réel les cars rapides disponibles autour de vous.',
    descAr: 'شاهد في الوقت الفعلي الكارات المتاحة حولك.',
  },
  {
    emoji: '🚕',
    fr: 'Montez et partez',
    ar: 'اركب وانطلق',
    descFr: 'Appelez le chauffeur ou envoyez un message WhatsApp pour confirmer.',
    descAr: 'اتصل بالسائق أو أرسل رسالة واتساب للتأكيد.',
  },
]

export default function CarRapidePage({ lang }: Props) {
  const isRtl = lang === 'ar'

  useSeo({
    title      : 'Car Rapide Nouakchott — Trouvez votre Transport en temps réel',
    description: 'Trouvez un car rapide à Nouakchott en temps réel. Transport urbain, taxi collectif, déplacement rapide dans la ville. Maurikilchi connecte passagers et chauffeurs de car rapide.',
    keywords   : 'car rapide Nouakchott, car rapide Mauritanie, transport Nouakchott, taxi collectif Mauritanie, transport urbain Nouakchott, mobilité Mauritanie, كار راپيد نواكشوط, مواصلات موريتانيا',
    url        : 'https://maurikilchi.com/car-rapide',
    schema     : {
      '@context'  : 'https://schema.org',
      '@type'     : 'Service',
      name        : 'Car Rapide Nouakchott — Maurikilchi',
      description : 'Localisation en temps réel des cars rapides à Nouakchott et en Mauritanie.',
      provider    : { '@type': 'Organization', name: 'Maurikilchi', url: 'https://maurikilchi.com' },
      areaServed  : { '@type': 'City', name: 'Nouakchott' },
      serviceType : 'Transport urbain',
    },
  })

  return (
    <div className="min-h-screen bg-[#f8f7f5] pt-[152px] sm:pt-[100px]" dir={isRtl ? 'rtl' : 'ltr'}>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1a1200] via-[#2d2000] to-[#3d2e00]">
        {/* Real background photo */}
        <img
          src={HERO_IMG}
          alt="Car Rapide"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a1200]/90 via-[#1a1200]/60 to-transparent" />

        <div className="relative max-w-[1440px] mx-auto px-4 md:px-6 py-16 md:py-24 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 text-center md:text-start">
            <div className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-400/40 rounded-full px-4 py-1.5 text-sm font-semibold text-amber-300 mb-5">
              🚕 {lang === 'fr' ? 'Transport urbain' : 'نقل حضري'}
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
              {lang === 'fr'
                ? <>Car Rapide<br /><span className="text-amber-400">partout en ville</span></>
                : <>كار رابيد<br /><span className="text-amber-400">في كل مكان بالمدينة</span></>}
            </h1>
            <p className="text-white/65 text-lg mb-8 max-w-md">
              {lang === 'fr'
                ? 'Trouvez un car rapide disponible près de vous en temps réel. Transport rapide et abordable dans toute la Mauritanie.'
                : 'اعثر على كار رابيد متاح بالقرب منك في الوقت الفعلي. نقل سريع وبأسعار معقولة في كل موريتانيا.'}
            </p>

            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <a href={APP_STORE_URL} target="_blank" rel="noreferrer"
                className="flex items-center gap-2.5 bg-white text-gray-900 rounded-xl px-5 py-3 hover:bg-gray-100 transition-colors font-semibold shadow-lg">
                <span className="text-xl leading-none"></span>
                <div className="text-start">
                  <div className="text-[10px] opacity-50 leading-none mb-0.5">{lang === 'fr' ? 'Télécharger sur' : 'حمّل من'}</div>
                  <div className="text-sm font-bold leading-none">App Store</div>
                </div>
              </a>
              <a href={PLAY_STORE_URL} target="_blank" rel="noreferrer"
                className="flex items-center gap-2.5 bg-[#F8AC12] text-gray-900 rounded-xl px-5 py-3 hover:bg-amber-400 transition-colors font-semibold shadow-lg">
                <span className="text-xl leading-none">▶</span>
                <div className="text-start">
                  <div className="text-[10px] opacity-60 leading-none mb-0.5">{lang === 'fr' ? 'Disponible sur' : 'متاح على'}</div>
                  <div className="text-sm font-bold leading-none">Google Play</div>
                </div>
              </a>
            </div>
          </div>

          {/* Logo + badge */}
          <div className="flex-shrink-0 flex flex-col items-center gap-4">
            <div className="w-52 h-52 md:w-64 md:h-64 bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl flex items-center justify-center p-6 shadow-2xl">
              <img src="/logo.png" alt="Mauri-Kilchi" className="w-full h-full object-contain" />
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white text-xs font-medium">
                {lang === 'fr' ? 'Disponible maintenant' : 'متاح الآن'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-6 py-14">
        <h2 className="font-display text-2xl font-bold text-gray-900 text-center mb-10">
          {lang === 'fr' ? 'Comment ça marche ?' : 'كيف يعمل؟'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {STEPS.map((step, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-2xl">
                {step.emoji}
              </div>
              <div className="w-6 h-6 rounded-full bg-amber-400 text-gray-900 text-xs font-bold flex items-center justify-center">
                {i + 1}
              </div>
              <h3 className="font-semibold text-gray-900">{lang === 'fr' ? step.fr : step.ar}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {lang === 'fr' ? step.descFr : step.descAr}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1a1200] to-[#3d2e00]">
        <img src={HERO_IMG} alt="" className="absolute inset-0 w-full h-full object-cover opacity-15" />
        <div className="relative max-w-2xl mx-auto px-4 py-14 text-center">
          <img src="/logo.png" alt="Mauri-Kilchi" className="h-16 mx-auto mb-6 object-contain" />
          <h2 className="font-display text-2xl font-bold text-white mb-3">
            {lang === 'fr' ? 'Prêt à partir ?' : 'مستعد للانطلاق؟'}
          </h2>
          <p className="text-white/60 mb-8">
            {lang === 'fr'
              ? 'Téléchargez Maurikilchi et trouvez un car rapide en quelques secondes.'
              : 'حمّل موريكيلشي وجد كار رابيد في ثوانٍ معدودة.'}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href={APP_STORE_URL} target="_blank" rel="noreferrer"
              className="flex items-center gap-2.5 bg-white text-gray-900 rounded-xl px-5 py-3 hover:bg-gray-100 transition-colors font-semibold">
              <span className="text-xl"></span> App Store
            </a>
            <a href={PLAY_STORE_URL} target="_blank" rel="noreferrer"
              className="flex items-center gap-2.5 bg-[#F8AC12] text-gray-900 rounded-xl px-5 py-3 hover:bg-amber-400 transition-colors font-semibold">
              <span className="text-xl">▶</span> Google Play
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
