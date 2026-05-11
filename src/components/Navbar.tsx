import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { MapPin, Search, ChevronDown, LogOut, Grid3X3, User } from 'lucide-react'
import { type Lang } from '../constants/i18n'
import { CATEGORIES } from '../constants/categories'
import { useAuth } from '../contexts/AuthContext'

const TRANSPORT_EMOJI: Record<string, string> = {
  livreur: '🏍️', voyageur: '🚌', maurigo: '🚕',
}

function userEmoji(user: { seller_profile?: { is_active?: boolean } | null; transport?: { type?: string } | null }) {
  if (user.seller_profile?.is_active) return '🏪'
  if (user.transport?.type) return TRANSPORT_EMOJI[user.transport.type] ?? null
  return null
}

const SERVICES = [
  { key: 'livraison',   emoji: '🏍️', label: { fr: 'Livraison',  ar: 'توصيل'    }, href: '/livraison'   },
  { key: 'long-voyage', emoji: '🚌', label: { fr: 'Long Voyage', ar: 'سفر طويل' }, href: '/long-voyage' },
  { key: 'car-rapide',  emoji: '🚕', label: { fr: 'Car Rapide',  ar: 'كار رابيد'}, href: '/car-rapide'  },
]

// desktop: 56px main bar + 44px category tabs
// mobile:  56px + 52px search + 40px services + 44px category tabs
export const NAVBAR_HEIGHT        = 100
export const MOBILE_NAVBAR_HEIGHT = 192

// v3 busts stale BigDataCloud city-level cache
const LOC_KEY = 'mk_loc_v3'

interface Props { lang: Lang; onLangToggle: () => void }

export default function Navbar({ lang, onLangToggle }: Props) {
  const [menuOpen, setMenuOpen]             = useState(false)
  const [userMenuOpen, setUserMenuOpen]     = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [city, setCity]                     = useState<string | null>(null)
  const [locLoading, setLocLoading]         = useState(false)
  const dropdownTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const userMenuRef   = useRef<HTMLDivElement>(null)
  const isRtl    = lang === 'ar'
  const navigate = useNavigate()
  const routeLoc = useLocation()
  const { isAuthenticated, user, logout } = useAuth()

  // ── Geolocation: Nominatim/OSM suburb → cache; IP city as placeholder ────
  useEffect(() => {
    // 1. Show cached suburb immediately if we have one
    const cached = localStorage.getItem(LOC_KEY)
    if (cached) setCity(cached)

    // 2. IP → city-level placeholder (never cached, GPS suburb will override)
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then((d: Record<string, string>) => {
        // Only use IP if we don't have a GPS-quality cache yet
        if (!localStorage.getItem(LOC_KEY)) {
          const name = (d.city || d.region || '').trim()
          if (name) setCity(name)
        }
      })
      .catch(() => {})

    // 3. GPS → Nominatim OSM → suburb/neighbourhood (finest grain)
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}&zoom=14&accept-language=fr`,
            { headers: { 'User-Agent': 'MauriKilchi/1.0 contact@maurikilchi.com' } }
          )
          const d = await r.json()
          const a = d.address ?? {}
          // Nominatim field priority: suburb → neighbourhood → quarter → city_district → town → city
          const name = (a.suburb || a.neighbourhood || a.quarter || a.city_district || a.town || a.city || '').trim()
          if (name) { setCity(name); localStorage.setItem(LOC_KEY, name) }
        } catch { /* keep displayed value */ }
      },
      () => { /* GPS denied — IP placeholder already shown */ },
      { timeout: 10000, maximumAge: 60000 }
    )
  }, [])

  // Close user menu on outside click
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node))
        setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const refreshLocation = useCallback(() => {
    if (locLoading || !navigator.geolocation) return
    setLocLoading(true)
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}&zoom=14&accept-language=fr`,
            { headers: { 'User-Agent': 'MauriKilchi/1.0 contact@maurikilchi.com' } }
          )
          const d = await r.json()
          const a = d.address ?? {}
          const name = (a.suburb || a.neighbourhood || a.quarter || a.city_district || a.town || a.city || '').trim()
          if (name) { setCity(name); localStorage.setItem(LOC_KEY, name) }
        } catch {}
        setLocLoading(false)
      },
      () => setLocLoading(false),
      { timeout: 10000, maximumAge: 0 }
    )
  }, [locLoading])

  const openDrop = (key: string) => {
    if (dropdownTimer.current) clearTimeout(dropdownTimer.current)
    setActiveDropdown(key)
  }
  const closeDrop = () => {
    dropdownTimer.current = setTimeout(() => setActiveDropdown(null), 150)
  }
  const keepDrop = () => {
    if (dropdownTimer.current) clearTimeout(dropdownTimer.current)
  }

  // Search clears any active category filter so they don't combine
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const q = (e.currentTarget.elements.namedItem('q') as HTMLInputElement).value.trim()
    if (q) navigate(`/explorer?q=${encodeURIComponent(q)}`)
  }

  const handleLogout = () => { logout(); setUserMenuOpen(false); navigate('/') }

  const activeCat = CATEGORIES.find(c => c.key === activeDropdown)

  return (
    <header dir={isRtl ? 'rtl' : 'ltr'}
      className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">

      {/* ── Main bar (56px) ─────────────────────────────────────────────── */}
      <div className="h-14 border-b border-gray-100 flex items-center">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 w-full flex items-center gap-3">

          {/* Logo */}
          <Link to="/" className="shrink-0">
            <img src="/logo.png" alt="Mauri-Kilchi" className="h-14 w-auto object-contain" />
          </Link>

          {/* Location — right after logo */}
          <button
            onClick={refreshLocation}
            title={lang === 'fr' ? 'Actualiser ma position' : 'تحديث موقعي'}
            className="hidden sm:flex items-center gap-1.5 shrink-0 group max-w-[140px]">
            <MapPin size={15} className={`shrink-0 transition-colors ${locLoading ? 'text-gray-300 animate-pulse' : 'text-amber-500 group-hover:text-amber-600'}`} />
            <div className="text-left min-w-0">
              <p className="text-xs text-gray-400 leading-none mb-0.5">
                {lang === 'fr' ? 'Livrer à' : 'التوصيل إلى'}
              </p>
              <p className="text-sm font-semibold text-gray-800 group-hover:text-amber-700 transition-colors truncate leading-none">
                {locLoading ? '…' : (city ?? (lang === 'fr' ? 'Localiser' : 'الموقع'))}
              </p>
            </div>
          </button>

          {/* Search bar — desktop only; hidden on mobile so hamburger stays visible */}
          <form onSubmit={handleSearch} className="hidden sm:flex flex-1">
            <div className="relative w-full flex rounded-xl border border-gray-200 hover:border-amber-400 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-100 transition-all overflow-hidden">
              <input
                name="q"
                type="text"
                placeholder={lang === 'fr' ? 'Rechercher un produit, une boutique…' : 'ابحث عن منتج أو متجر...'}
                className={`flex-1 h-10 text-sm text-gray-800 placeholder-gray-400 focus:outline-none bg-white ${isRtl ? 'pr-4 pl-1' : 'pl-4 pr-1'}`}
              />
              <button type="submit"
                className="flex items-center justify-center w-11 h-10 shrink-0 hover:opacity-85 transition-opacity"
                style={{ background: '#F8AC12' }}>
                <Search size={16} className="text-white" />
              </button>
            </div>
          </form>

          {/* Mobile spacer — pushes auth+hamburger to the right when search is hidden */}
          <div className="flex-1 sm:hidden" />

          {/* Service links — shown directly in the navbar on desktop */}
          {SERVICES.map(svc => (
            <Link key={svc.key} to={svc.href}
              className={`hidden sm:flex items-center gap-1.5 h-10 px-3 rounded-xl border text-sm font-semibold shrink-0 transition-all ${
                routeLoc.pathname === svc.href
                  ? 'border-amber-500 text-amber-700 bg-amber-50'
                  : 'border-gray-200 text-gray-600 hover:border-amber-400 hover:text-amber-700 hover:bg-amber-50'
              }`}>
              <span className="text-base leading-none">{svc.emoji}</span>
              <span className="hidden lg:inline">{svc.label[lang]}</span>
            </Link>
          ))}

          {/* Auth + lang */}
          <div className="flex items-center gap-2 shrink-0">
            {isAuthenticated && user ? (
              <div className="relative" ref={userMenuRef}>
                <button onClick={() => setUserMenuOpen(v => !v)}
                  className="flex items-center gap-2 h-10 px-3 rounded-xl border border-gray-200 hover:border-amber-400 hover:bg-amber-50 transition-all">
                  {user.avatar_url
                    ? <img src={user.avatar_url} alt="" className="w-5 h-5 rounded-full object-cover" />
                    : <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-[11px] font-bold text-amber-700">
                        {user.first_name?.[0]?.toUpperCase() ?? '?'}
                      </div>
                  }
                  <span className="hidden md:block text-sm font-medium text-gray-800 max-w-[72px] truncate">{user.first_name}</span>
                  {userEmoji(user) && <span className="text-sm">{userEmoji(user)}</span>}
                  <ChevronDown size={12} className="text-gray-400" />
                </button>
                {userMenuOpen && (
                  <div className={`absolute top-full mt-2 w-52 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden ${isRtl ? 'left-0' : 'right-0'}`}>
                    <div className="px-4 py-3 border-b border-gray-100 bg-amber-50">
                      <p className="font-semibold text-sm text-gray-900">{user.first_name} {user.last_name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{userEmoji(user)} {user.phone}</p>
                    </div>
                    <Link to="/compte" onClick={() => setUserMenuOpen(false)}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <User size={14} className="text-gray-400" />
                      {lang === 'fr' ? 'Mon compte' : 'حسابي'}
                    </Link>
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100">
                      <LogOut size={14} />
                      {lang === 'fr' ? 'Se déconnecter' : 'تسجيل الخروج'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/connexion"
                className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 text-gray-600 hover:border-amber-400 hover:text-amber-700 transition-all">
                <User size={17} />
              </Link>
            )}

            {/* Language toggle */}
            <button onClick={onLangToggle}
              className="hidden sm:block text-xs font-bold text-gray-400 hover:text-amber-600 transition-colors px-1">
              {lang === 'fr' ? 'ع' : 'FR'}
            </button>

            {/* Mobile hamburger */}
            <button className="sm:hidden p-1.5" onClick={() => setMenuOpen(!menuOpen)}>
              <svg width="20" height="20" fill="none" stroke="#111" strokeWidth="2" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile search row (between main bar and category tabs) ─────── */}
      <div className="sm:hidden px-4 py-2 border-b border-gray-100 bg-white">
        <form onSubmit={handleSearch}
          className="relative w-full flex rounded-xl border border-gray-200 hover:border-amber-400 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-100 transition-all overflow-hidden">
          <input
            name="q"
            type="text"
            placeholder={lang === 'fr' ? 'Rechercher un produit, une boutique…' : 'ابحث عن منتج أو متجر...'}
            className={`flex-1 h-9 text-sm text-gray-800 placeholder-gray-400 focus:outline-none bg-white ${isRtl ? 'pr-4 pl-1' : 'pl-4 pr-1'}`}
          />
          <button type="submit"
            className="flex items-center justify-center w-10 h-9 shrink-0 hover:opacity-85 transition-opacity"
            style={{ background: '#F8AC12' }}>
            <Search size={14} className="text-white" />
          </button>
        </form>
      </div>

      {/* ── Mobile services row (40px, mobile only) ─────────────────────── */}
      <div className="sm:hidden h-10 border-b border-gray-100 bg-white flex items-center">
        <div className="flex items-center gap-2 px-4 overflow-x-auto w-full" style={{ scrollbarWidth: 'none' }}>
          {SERVICES.map(svc => (
            <Link key={svc.key} to={svc.href}
              className={`flex items-center gap-1.5 h-7 px-3 rounded-full border text-xs font-semibold shrink-0 transition-all ${
                routeLoc.pathname === svc.href
                  ? 'border-amber-500 text-amber-700 bg-amber-50'
                  : 'border-gray-200 text-gray-600 hover:border-amber-400 hover:text-amber-700 hover:bg-amber-50'
              }`}>
              <span className="leading-none">{svc.emoji}</span>
              {svc.label[lang]}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Category tabs (44px) ────────────────────────────────────────── */}
      <div className="h-11 border-b border-gray-100 flex items-stretch">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 w-full">
          <div className="flex items-stretch overflow-x-auto h-full" style={{ scrollbarWidth: 'none' }}>

            <Link to="/explorer"
              className={`flex items-center gap-1.5 px-4 text-sm font-medium whitespace-nowrap border-b-2 transition-all shrink-0 ${
                routeLoc.pathname === '/explorer' && !routeLoc.search
                  ? 'border-amber-500 text-amber-700'
                  : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
              }`}>
              <Grid3X3 size={13} />
              {lang === 'fr' ? 'Produits' : 'المنتجات'}
            </Link>

            <Link to="/boutiques"
              className={`flex items-center gap-1.5 px-4 text-sm font-medium whitespace-nowrap border-b-2 transition-all shrink-0 ${
                routeLoc.pathname === '/boutiques'
                  ? 'border-amber-500 text-amber-700'
                  : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
              }`}>
              🏪 {lang === 'fr' ? 'Boutiques' : 'المتاجر'}
            </Link>

            {CATEGORIES.map(cat => (
              <button key={cat.key}
                onMouseEnter={() => openDrop(cat.key)}
                onMouseLeave={closeDrop}
                onClick={() => navigate(`/explorer?parent=${cat.key}`)}
                className={`flex items-center gap-1.5 px-4 text-sm font-medium whitespace-nowrap border-b-2 transition-all shrink-0 ${
                  activeDropdown === cat.key || routeLoc.search.includes(`parent=${cat.key}`)
                    ? 'border-amber-500 text-amber-700'
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                }`}>
                <span className="text-base">{cat.emoji}</span>
                {cat.label[lang]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Category megadropdown ────────────────────────────────────────── */}
      {activeCat && (
        <div className="bg-white border-t border-gray-100 shadow-2xl"
          onMouseEnter={keepDrop}
          onMouseLeave={closeDrop}>
          <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-1.5">
              <span>{activeCat.emoji}</span>
              {activeCat.label[lang]}
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
              {activeCat.subs.map(sub => (
                <button key={sub.slug}
                  onClick={() => { navigate(`/explorer?cat=${sub.slug}`); setActiveDropdown(null) }}
                  className="group flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-amber-50 transition-all text-center">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 group-hover:border-amber-200 transition-all">
                    <img src={sub.img} alt={sub.label.fr} loading="lazy"
                      className="w-full h-full object-cover opacity-75 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
                  </div>
                  <span className="text-[10px] font-medium text-gray-600 group-hover:text-amber-700 leading-tight line-clamp-2 w-full">
                    {sub.label[lang]}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
              <p className="text-xs text-gray-400">
                {lang === 'fr' ? `${activeCat.subs.length} sous-catégories` : `${activeCat.subs.length} فئة فرعية`}
              </p>
              <button
                onClick={() => { navigate(`/explorer?parent=${activeCat.key}`); setActiveDropdown(null) }}
                className="text-xs font-semibold px-4 py-1.5 rounded-full hover:opacity-90"
                style={{ background: '#F8AC12', color: '#0D0D0D' }}>
                {lang === 'fr' ? 'Voir tout →' : 'عرض الكل →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile drawer overlay ────────────────────────────────────────── */}
      {menuOpen && (
        <div
          className="sm:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
          style={{ top: 0 }}
        />
      )}

      {/* ── Mobile drawer panel ──────────────────────────────────────────── */}
      <div className={`sm:hidden fixed top-0 ${isRtl ? 'left-0' : 'right-0'} h-full w-72 bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${menuOpen ? 'translate-x-0' : (isRtl ? '-translate-x-full' : 'translate-x-full')}`}>

        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <img src="/logo.png" alt="Mauri-Kilchi" className="h-12 w-auto object-contain" />
          <button onClick={() => setMenuOpen(false)}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <svg width="14" height="14" fill="none" stroke="#555" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Drawer body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">

          {/* Location */}
          <button onClick={() => { refreshLocation(); setMenuOpen(false) }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-amber-50 transition-colors text-sm text-gray-700">
            <MapPin size={15} className="text-amber-500 shrink-0" />
            <span className="font-medium truncate">{city ?? (lang === 'fr' ? 'Localiser…' : 'الموقع...')}</span>
            {locLoading && <span className="text-xs text-amber-500 ml-auto">…</span>}
          </button>

          <div className="h-px bg-gray-100 my-2" />

          {/* Navigation links */}
          <Link to="/explorer" onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
            <Grid3X3 size={15} className="text-gray-400" />
            {lang === 'fr' ? 'Tous les produits' : 'كل المنتجات'}
          </Link>

          <Link to="/boutiques" onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
            <span>🏪</span>
            {lang === 'fr' ? 'Boutiques' : 'المتاجر'}
          </Link>

          <div className="h-px bg-gray-100 my-2" />

          {/* Categories */}
          <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 py-1">
            {lang === 'fr' ? 'Catégories' : 'الفئات'}
          </p>
          {CATEGORIES.map(cat => (
            <button key={cat.key}
              onClick={() => { navigate(`/explorer?parent=${cat.key}`); setMenuOpen(false) }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
              <span className="text-base">{cat.emoji}</span>
              {cat.label[lang]}
            </button>
          ))}

        </div>

        {/* Drawer footer */}
        <div className="border-t border-gray-100 px-5 py-4 space-y-2">
          {isAuthenticated && user ? (
            <>
              <Link to="/compte" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-amber-50 transition-colors text-sm font-medium text-gray-700">
                <User size={15} className="text-amber-500" />
                {user.first_name} {user.last_name}
              </Link>
              <button onClick={() => { handleLogout(); setMenuOpen(false) }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors text-sm font-medium text-red-600">
                <LogOut size={15} />
                {lang === 'fr' ? 'Se déconnecter' : 'تسجيل الخروج'}
              </button>
            </>
          ) : (
            <Link to="/connexion" onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#F8AC12] text-gray-900 text-sm font-bold hover:bg-amber-400 transition-colors">
              <User size={14} />
              {lang === 'fr' ? 'Connexion' : 'تسجيل الدخول'}
            </Link>
          )}
          <button onClick={() => { onLangToggle(); setMenuOpen(false) }}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-500 hover:bg-gray-50 transition-colors">
            {lang === 'fr' ? '🇲🇷 عربي' : '🇫🇷 Français'}
          </button>
        </div>
      </div>
    </header>
  )
}
