import { useState, useEffect } from 'react'
import { t, Lang } from '../constants/i18n'

interface Props {
  lang: Lang
  onLangToggle: () => void
}

export default function Navbar({ lang, onLangToggle }: Props) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const isRtl = lang === 'ar'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-sm border-b border-gray-100' : 'bg-white/90 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#F8AC12' }}>
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="font-bold text-lg tracking-tight text-gray-900">MAURI-KILCHI</span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7">
          <a href="#boutiques" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            {t.nav.browse[lang]}
          </a>
          <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            {t.nav.howItWorks[lang]}
          </a>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Lang toggle */}
          <button
            onClick={onLangToggle}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-xs font-medium text-gray-600 hover:border-amber-400 hover:text-amber-600 transition-all"
          >
            {lang === 'fr' ? '🇸🇦 عربي' : '🇫🇷 Français'}
          </button>

          {/* Download CTA */}
          <a
            href="#download"
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: '#F8AC12' }}
          >
            <span>📱</span>
            {t.nav.download[lang]}
          </a>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-4">
          <a href="#boutiques" className="text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>
            {t.nav.browse[lang]}
          </a>
          <a href="#how-it-works" className="text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>
            {t.nav.howItWorks[lang]}
          </a>
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <button onClick={onLangToggle} className="text-xs font-medium text-gray-500">
              {lang === 'fr' ? '🇸🇦 عربي' : '🇫🇷 Français'}
            </button>
            <a
              href="#download"
              className="flex-1 text-center py-2 rounded-full text-sm font-semibold text-white"
              style={{ background: '#F8AC12' }}
              onClick={() => setMenuOpen(false)}
            >
              {t.nav.download[lang]}
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
