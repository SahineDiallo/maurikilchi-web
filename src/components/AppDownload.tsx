import { t, Lang } from '../constants/i18n'

interface Props { lang: Lang }

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.maurikilchi.marketplace'

export default function AppDownload({ lang }: Props) {
  const isRtl = lang === 'ar'

  return (
    <section
      id="download"
      dir={isRtl ? 'rtl' : 'ltr'}
      className="py-20 px-4 sm:px-6"
    >
      <div
        className="max-w-4xl mx-auto rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #F8AC12 0%, #F57C00 100%)' }}
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'white', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'white', transform: 'translate(-30%, 30%)' }} />

        <div className="relative z-10">
          <div className="text-5xl mb-5">📱</div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            {t.appDownload.title[lang]}
          </h2>
          <p className="text-white/85 text-base max-w-lg mx-auto mb-8 leading-relaxed">
            {t.appDownload.subtitle[lang]}
          </p>

          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-7 py-4 rounded-2xl font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-lg"
            style={{ background: 'white', color: '#1A1A1A' }}
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Google_Play_Arrow_logo.svg/512px-Google_Play_Arrow_logo.svg.png"
              alt="Google Play"
              className="w-6 h-6 object-contain"
            />
            {t.appDownload.btn[lang]}
          </a>
        </div>
      </div>
    </section>
  )
}
