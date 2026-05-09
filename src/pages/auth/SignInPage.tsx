import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ChevronDown, ArrowRight, MapPin, Package, ShoppingCart, Truck } from 'lucide-react'
import { api } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { type Lang } from '../../constants/i18n'
import { COUNTRIES, DEFAULT_COUNTRY } from '../../constants/countries'

interface Props { lang: Lang }

const FEATURES = [
  { icon: ShoppingCart, fr: 'Des milliers de boutiques locales', ar: 'آلاف المتاجر المحلية' },
  { icon: Truck,        fr: 'Livraison rapide dans votre ville', ar: 'توصيل سريع في مدينتك' },
  { icon: Package,      fr: 'Arrivages & produits frais chaque jour', ar: 'بضائع جديدة ومنتجات طازجة يومياً' },
  { icon: MapPin,       fr: 'Couverture nationale — toutes les wilayas', ar: 'تغطية وطنية — جميع الولايات' },
]

export default function SignInPage({ lang }: Props) {
  const navigate = useNavigate()
  const { setPending, isAuthenticated, bootstrapDone } = useAuth()
  const [country, setCountry] = useState(DEFAULT_COUNTRY)

  useEffect(() => {
    if (bootstrapDone && isAuthenticated) navigate('/', { replace: true })
  }, [bootstrapDone, isAuthenticated])
  const [showCountries, setShowCountries] = useState(false)
  const [phone, setPhone] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const isRtl = lang === 'ar'
  const isValid = phone.replace(/\s/g, '').length >= 6

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || loading) return
    setErr(''); setLoading(true)
    const full = `${country.dialCode}${phone}`
    try {
      await api.post('/auth/send-otp/', { phone: full })
      setPending({ phone: full })
      navigate('/verification')
    } catch (e: any) {
      setErr(e.response?.data?.detail ?? (lang === 'fr' ? "Erreur d'envoi du code." : 'حدث خطأ في إرسال الرمز.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen flex pt-[152px] sm:pt-[100px] lg:pt-0">

      {/* ── Left brand panel (desktop only) ──────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] shrink-0 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #0D0D0D 0%, #1a1a1a 60%, #2d2200 100%)' }}>

        {/* Amber glow */}
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #F8AC12 0%, transparent 70%)', transform: 'translate(30%, 30%)' }} />

        <div className="relative z-10 p-10">
          {/* Logo */}
          <Link to="/">
            <img src="/logo.png" alt="Mauri-Kilchi" className="h-12 w-auto object-contain" />
          </Link>
        </div>

        <div className="relative z-10 px-10 py-12">
          <p className="text-4xl font-bold text-white leading-tight mb-2">
            {lang === 'fr' ? 'Le marché de la\nMauritanie.' : 'سوق موريتانيا.'}
          </p>
          <p className="text-amber-400 font-medium text-base mb-10">
            {lang === 'fr' ? 'Tout ce dont vous avez besoin, en un seul endroit.' : 'كل ما تحتاجه في مكان واحد.'}
          </p>

          <div className="space-y-4 mb-12">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(248,172,18,0.15)' }}>
                  <f.icon size={15} className="text-amber-400" />
                </div>
                <span className="text-gray-300 text-sm">{lang === 'fr' ? f.fr : f.ar}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/10">
            {[
              { n: '1 200+', fr: 'Boutiques',  ar: 'متجر'   },
              { n: '15 000+', fr: 'Produits',  ar: 'منتج'   },
              { n: '13',      fr: 'Wilayas',   ar: 'ولاية'  },
            ].map(s => (
              <div key={s.n}>
                <p className="text-2xl font-bold text-white">{s.n}</p>
                <p className="text-xs text-gray-400 mt-0.5">{lang === 'fr' ? s.fr : s.ar}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col">
        {/* Top nav (mobile only) */}
        <div className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <Link to="/">
            <img src="/logo.png" alt="Mauri-Kilchi" className="h-8 w-auto object-contain" />
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">

            {/* Heading */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {lang === 'fr' ? 'Connexion' : 'تسجيل الدخول'}
              </h1>
              <p className="text-gray-500 text-base">
                {lang === 'fr'
                  ? 'Entrez votre numéro de téléphone pour continuer.'
                  : 'أدخل رقم هاتفك للمتابعة.'}
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
              {/* Phone label */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {lang === 'fr' ? 'Numéro de téléphone' : 'رقم الهاتف'}
                </label>

                {/* Phone input */}
                <div className="flex border border-gray-200 rounded-xl overflow-visible hover:border-amber-400 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-100 transition-all">
                  {/* Country picker */}
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowCountries(v => !v)}
                      className={`flex items-center gap-1.5 px-4 h-12 bg-gray-50 border-gray-200 hover:bg-gray-100 transition-colors rounded-l-xl ${isRtl ? 'rounded-l-none rounded-r-xl border-l border-r-0' : 'border-r'}`}>
                      <span className="text-xl">{country.flag}</span>
                      <span className="font-semibold text-sm text-gray-800">{country.dialCode}</span>
                      <ChevronDown size={13} className="text-gray-400" />
                    </button>
                    {showCountries && (
                      <div className={`absolute top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-xl overflow-y-auto max-h-60 w-60 ${isRtl ? 'right-0' : 'left-0'}`}>
                        {COUNTRIES.map(c => (
                          <button key={c.code} type="button"
                            onClick={() => { setCountry(c); setShowCountries(false); inputRef.current?.focus() }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50 text-left transition-colors">
                            <span className="text-lg">{c.flag}</span>
                            <span className="flex-1 text-sm text-gray-800">{c.name}</span>
                            <span className="text-sm text-gray-400 font-medium">{c.dialCode}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <input
                    ref={inputRef}
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                    placeholder="XX XX XX XX"
                    className="flex-1 h-12 px-4 bg-transparent text-base font-semibold text-gray-900 tracking-widest placeholder-gray-300 focus:outline-none"
                    autoFocus
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  {lang === 'fr' ? 'Un code de vérification sera envoyé via WhatsApp.' : 'سيتم إرسال رمز التحقق عبر واتساب.'}
                </p>
              </div>

              {err && (
                <div className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                  <span className="text-red-500 text-sm">{err}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={!isValid || loading}
                className="w-full h-12 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
                style={{ background: '#F8AC12', color: '#0D0D0D' }}>
                {loading
                  ? <span className="w-5 h-5 border-2 border-black/20 border-t-black/70 rounded-full animate-spin" />
                  : <><span>{lang === 'fr' ? 'Recevoir le code' : 'استقبال الرمز'}</span><ArrowRight size={16} /></>
                }
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-7">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">{lang === 'fr' ? 'Pas encore de compte ?' : 'ليس لديك حساب؟'}</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Register link */}
            <Link to="/inscription"
              className="w-full h-12 rounded-xl text-sm font-semibold border-2 border-gray-200 flex items-center justify-center gap-2 hover:border-amber-400 hover:text-amber-700 transition-all text-gray-700">
              {lang === 'fr' ? "Créer un compte" : 'إنشاء حساب جديد'}
            </Link>

            {/* Terms */}
            <p className="text-[11px] text-gray-400 text-center mt-6 leading-relaxed">
              {lang === 'fr' ? 'En continuant, vous acceptez nos ' : 'بالمتابعة أنت توافق على '}
              <span className="text-gray-600 underline cursor-pointer">{lang === 'fr' ? "Conditions d'utilisation" : 'شروط الاستخدام'}</span>
              {lang === 'fr' ? ' et notre ' : ' و'}
              <span className="text-gray-600 underline cursor-pointer">{lang === 'fr' ? 'Politique de confidentialité' : 'سياسة الخصوصية'}</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
