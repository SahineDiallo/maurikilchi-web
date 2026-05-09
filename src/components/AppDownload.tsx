import { t, type Lang } from '../constants/i18n'

interface Props { lang: Lang }

const PLAY_URL = 'https://play.google.com/store/apps/details?id=com.maurikilchi.marketplace'
const PROMO_IMG = 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80'

export default function AppDownload({ lang }: Props) {
  const isRtl = lang === 'ar'

  return (
    <section id="download" dir={isRtl ? 'rtl' : 'ltr'} className="max-w-[1440px] mx-auto px-4 md:px-6 py-20">
      <div className="relative grid overflow-hidden rounded-3xl md:grid-cols-2"
        style={{ background: 'linear-gradient(135deg, #1a0a00, #3d2000)' }}>

        {/* Content */}
        <div className="p-10 md:p-14">
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#F8AC12' }}>
            {lang === 'fr' ? 'Application mobile' : 'تطبيق الجوال'}
          </p>
          <h3 className="font-display text-4xl md:text-5xl font-medium leading-tight text-white mb-4">
            {lang === 'fr' ? <>Téléchargez<br /><em>l'appli</em> gratuite.</> : <>حمّل<br /><em>التطبيق</em> مجاناً.</>}
          </h3>
          <p className="text-white/55 text-sm max-w-sm mb-8 leading-relaxed">{t.appDownload.subtitle[lang]}</p>
          <a href={PLAY_URL} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-4 px-6 py-4 rounded-2xl font-semibold text-sm transition-all hover:scale-105"
            style={{ background: '#F8AC12', color: '#0D0D0D' }}>
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
              <path d="M3.18 23.76c.3.17.64.24.99.2l12.6-12.6-3.19-3.19L3.18 23.76zM20.47 10.48l-2.55-1.47-3.55 3.55 3.55 3.55 2.58-1.49c.73-.43.73-1.72-.03-2.14zM1.64.43C1.25.74 1 1.26 1 1.96v20.08c0 .7.25 1.22.64 1.53l.09.07 11.25-11.25v-.27L1.73.36l-.09.07zM13.98 11.72l3.18-3.18-12.6-12.6c-.36-.04-.7.03-1 .2l10.42 15.58z"/>
            </svg>
            {t.appDownload.btn[lang]}
          </a>
        </div>

        {/* Image */}
        <div className="relative min-h-64 md:min-h-0">
          <img src={PROMO_IMG} alt="App Mauri-Kilchi"
            className="absolute inset-0 w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0" style={{ background: isRtl ? 'linear-gradient(to left, transparent, #1a0a00)' : 'linear-gradient(to right, transparent, #1a0a00)' }} />
        </div>
      </div>
    </section>
  )
}
