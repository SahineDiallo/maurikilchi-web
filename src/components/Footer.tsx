import { t, type Lang } from '../constants/i18n'

interface Props { lang: Lang }

export default function Footer({ lang }: Props) {
  const isRtl = lang === 'ar'

  return (
    <footer dir={isRtl ? 'rtl' : 'ltr'} className="bg-black text-white px-4 md:px-8 pt-16 pb-8">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-5">
              <img src="/logo.png" alt="Mauri-Kilchi" className="h-16 w-auto object-contain" />
            </div>
            <p className="text-base text-gray-300 leading-relaxed max-w-xs">{t.footer.tagline[lang]}</p>
            <p className="text-sm text-gray-400 mt-5">🇲🇷 Mauritanie · 🇸🇳 Sénégal</p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-white mb-5">{t.footer.links.title[lang]}</h4>
            <ul className="space-y-3.5 text-base text-gray-400">
              <li><a href="#boutiques"    className="hover:text-white transition-colors">{t.footer.links.browse[lang]}</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">{t.footer.links.howItWorks[lang]}</a></li>
              <li><a href="#download"     className="hover:text-white transition-colors">{t.footer.links.download[lang]}</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-white mb-5">{t.footer.contact.title[lang]}</h4>
            <ul className="space-y-3.5 text-base text-gray-400">
              <li>
                <a href="https://wa.me/22200000000" className="hover:text-white transition-colors flex items-center gap-2">
                  💬 WhatsApp
                </a>
              </li>
            </ul>
          </div>

          {/* App */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-white mb-5">
              {lang === 'fr' ? 'Application' : 'التطبيق'}
            </h4>
            <a href="https://play.google.com/store/apps/details?id=com.maurikilchi.marketplace"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl border border-gray-700 text-base text-gray-300 hover:border-white hover:text-white transition-colors">
              <span>📱</span>
              <span>{lang === 'fr' ? 'Google Play' : 'جوجل بلاي'}</span>
            </a>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} Mauri-Kilchi. {t.footer.rights[lang]}</p>
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            {lang === 'fr' ? 'Systèmes opérationnels' : 'الأنظمة تعمل'}
          </div>
        </div>
      </div>
    </footer>
  )
}
