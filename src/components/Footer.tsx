import { t, Lang } from '../constants/i18n'

interface Props { lang: Lang }

export default function Footer({ lang }: Props) {
  const isRtl = lang === 'ar'

  return (
    <footer
      dir={isRtl ? 'rtl' : 'ltr'}
      className="bg-gray-900 text-gray-300 px-4 sm:px-6 pt-14 pb-8"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#F8AC12' }}>
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="font-bold text-white text-lg">MAURI-KILCHI</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">{t.footer.tagline[lang]}</p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">{t.footer.links.title[lang]}</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#boutiques" className="hover:text-amber-400 transition-colors">{t.footer.links.browse[lang]}</a></li>
              <li><a href="#how-it-works" className="hover:text-amber-400 transition-colors">{t.footer.links.howItWorks[lang]}</a></li>
              <li><a href="#download" className="hover:text-amber-400 transition-colors">{t.footer.links.download[lang]}</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">{t.footer.contact.title[lang]}</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="https://wa.me/22200000000" className="flex items-center gap-2 hover:text-amber-400 transition-colors">
                  <span className="text-base">💬</span> WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} MAURI-KILCHI. {t.footer.rights[lang]}</p>
          <p>🇲🇷 Mauritanie</p>
        </div>
      </div>
    </footer>
  )
}
