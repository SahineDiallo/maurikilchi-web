import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ChevronDown } from 'lucide-react'
import { api } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { type Lang } from '../../constants/i18n'
import { COUNTRIES, DEFAULT_COUNTRY } from '../../constants/countries'

interface Props { lang: Lang }

function BrandPanel({ lang }: { lang: Lang }) {
  return (
    <div className="hidden lg:flex flex-col justify-between w-[440px] shrink-0 relative overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #0D0D0D 0%, #1a1a1a 60%, #2d2200 100%)' }}>
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #F8AC12 0%, transparent 70%)', transform: 'translate(30%, 30%)' }} />
      <div className="relative z-10 p-10">
        <Link to="/"><img src="/logo.png" alt="Mauri-Kilchi" className="h-12 w-auto object-contain" /></Link>
      </div>
      <div className="relative z-10 px-10 py-12">
        <p className="text-4xl font-bold text-white leading-tight mb-3">
          {lang === 'fr' ? 'Rejoignez\nMauri-Kilchi.' : 'انضم إلى\nموري-كيلتشي.'}
        </p>
        <p className="text-amber-400 font-medium text-base mb-10">
          {lang === 'fr' ? 'Achetez, vendez, livrez — tout en un.' : 'اشترِ، بِع، وصِّل — كل شيء في مكان واحد.'}
        </p>
        <div className="grid grid-cols-2 gap-4 pt-8 border-t border-white/10">
          {[
            { emoji: '🏪', n: '1 200+', fr: 'Vendeurs',   ar: 'بائع'     },
            { emoji: '🏍️', n: '450+',  fr: 'Livreurs',   ar: 'موصّل'    },
            { emoji: '🚌', n: '120+',  fr: 'Voyageurs',  ar: 'مسافر'    },
            { emoji: '🚕', n: '80+',   fr: 'Car Rapides', ar: 'كار رابيد' },
          ].map(s => (
            <div key={s.n} className="flex items-center gap-2.5">
              <span className="text-xl">{s.emoji}</span>
              <div>
                <p className="text-xl font-bold text-white">{s.n}</p>
                <p className="text-xs text-gray-400">{lang === 'fr' ? s.fr : s.ar}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage({ lang }: Props) {
  const navigate = useNavigate()
  const location = useLocation()
  const { setPending, isAuthenticated, bootstrapDone } = useAuth()
  const isRtl = lang === 'ar'

  // Arriving from sign-in with an unknown number — OTP already sent
  const fromSignIn       = location.state as { phone?: string; dialCode?: string; otpSent?: boolean } | null
  const prefilledPhone   = fromSignIn?.phone   ?? ''
  const prefilledOtpSent = fromSignIn?.otpSent ?? false

  useEffect(() => {
    if (bootstrapDone && isAuthenticated) navigate('/compte', { replace: true })
  }, [bootstrapDone, isAuthenticated])

  // Step 1 = name, Step 2 = phone (skipped when prefilledOtpSent)
  const [step, setStep]       = useState<1 | 2>(1)
  const [firstName, setFirstName] = useState('')
  const [lastName,  setLastName]  = useState('')
  const [phone,     setPhone]     = useState(prefilledPhone)
  const [country,   setCountry]   = useState(() => {
    if (fromSignIn?.dialCode) return COUNTRIES.find(c => c.dialCode === fromSignIn.dialCode) ?? DEFAULT_COUNTRY
    return DEFAULT_COUNTRY
  })
  const [showCountries, setShowCountries] = useState(false)
  const [err,     setErr]     = useState('')
  const [loading, setLoading] = useState(false)

  const totalSteps  = prefilledOtpSent ? 1 : 2
  const displayStep = step

  const handleBack = () => {
    if (step === 1) { navigate(-1); return }
    setStep(1)
  }

  const goStep2 = () => {
    if (firstName.trim().length < 2 || lastName.trim().length < 2) {
      setErr(lang === 'fr' ? 'Veuillez renseigner votre nom complet.' : 'يرجى إدخال اسمك الكامل.')
      return
    }
    setErr('')
    if (prefilledOtpSent) {
      void onSubmit()
    } else {
      setStep(2)
    }
  }

  const onSubmit = async () => {
    const full = `${country.dialCode}${phone}`
    if (phone.replace(/\s/g, '').length < 6) {
      setErr(lang === 'fr' ? 'Numéro invalide.' : 'رقم غير صالح.')
      return
    }
    setErr(''); setLoading(true)
    try {
      if (!prefilledOtpSent) {
        await api.post('/auth/send-otp/', { phone: full })
      }
      setPending({ phone: full, firstName: firstName.trim(), lastName: lastName.trim() })
      navigate('/verification')
    } catch (e: any) {
      setErr(e.response?.data?.detail ?? (lang === 'fr' ? "Erreur d'envoi du code." : 'حدث خطأ.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen flex pt-[152px] sm:pt-[100px] lg:pt-0">
      <BrandPanel lang={lang} />

      <div className="flex-1 flex flex-col">
        <div className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <Link to="/"><img src="/logo.png" alt="Mauri-Kilchi" className="h-8 w-auto object-contain" /></Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-10 overflow-y-auto">
          <div className="w-full max-w-md">

            {/* Back + progress */}
            <div className="flex items-center gap-4 mb-8">
              <button onClick={handleBack}
                className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:border-amber-400 hover:text-amber-600 transition-all text-gray-500">
                <ArrowLeft size={16} className={isRtl ? 'rotate-180' : ''} />
              </button>
              <div className="flex items-center gap-1.5 flex-1">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div key={i} className="h-1.5 rounded-full transition-all"
                    style={{ width: i + 1 <= displayStep ? 36 : 20, background: i + 1 <= displayStep ? '#F8AC12' : '#e5e7eb' }} />
                ))}
                <span className="text-xs text-gray-400 ml-1">{displayStep}/{totalSteps}</span>
              </div>
            </div>

            {/* ── Step 1: Name ── */}
            {step === 1 && (
              <>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {lang === 'fr' ? 'Comment vous appelez-vous ?' : 'ما اسمك؟'}
                </h1>
                <p className="text-gray-500 text-sm mb-8">
                  {lang === 'fr' ? 'Ce nom sera visible sur votre profil.' : 'سيظهر هذا الاسم على ملفك الشخصي.'}
                </p>

                <div className="space-y-4 mb-6">
                  {[
                    { label: { fr: 'Prénom', ar: 'الاسم الأول' }, value: firstName, set: setFirstName, ph: { fr: 'Votre prénom', ar: 'اسمك الأول' } },
                    { label: { fr: 'Nom',    ar: 'اسم العائلة'  }, value: lastName,  set: setLastName,  ph: { fr: 'Votre nom',    ar: 'اسم عائلتك' } },
                  ].map((f, i) => (
                    <div key={i}>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{f.label[lang]}</label>
                      <input
                        autoFocus={i === 0}
                        value={f.value}
                        onChange={e => f.set(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && goStep2()}
                        placeholder={f.ph[lang]}
                        className="w-full h-12 px-4 border border-gray-200 rounded-xl text-sm text-gray-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 focus:outline-none transition-all placeholder-gray-300"
                      />
                    </div>
                  ))}
                </div>

                {err && <p className="text-sm text-red-500 mb-4">{err}</p>}

                <button onClick={goStep2} disabled={loading}
                  className="w-full h-12 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-40 transition-all"
                  style={{ background: '#F8AC12', color: '#0D0D0D' }}>
                  {loading
                    ? <span className="w-5 h-5 border-2 border-black/20 border-t-black/70 rounded-full animate-spin" />
                    : <><span>{lang === 'fr' ? 'Continuer' : 'متابعة'}</span><ArrowRight size={16} /></>
                  }
                </button>
              </>
            )}

            {/* ── Step 2: Phone ── */}
            {step === 2 && (
              <>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {lang === 'fr' ? 'Votre numéro' : 'رقمك الهاتفي'}
                </h1>
                <p className="text-gray-500 text-sm mb-8">
                  {lang === 'fr' ? 'Un code de vérification sera envoyé via WhatsApp.' : 'سيتم إرسال رمز التحقق عبر واتساب.'}
                </p>

                <div className="mb-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    {lang === 'fr' ? 'Numéro de téléphone' : 'رقم الهاتف'}
                  </label>
                  <div className="flex border border-gray-200 rounded-xl overflow-visible hover:border-amber-400 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-100 transition-all">
                    <div className="relative shrink-0">
                      <button type="button" onClick={() => setShowCountries(v => !v)}
                        className={`flex items-center gap-1.5 px-4 h-12 bg-gray-50 hover:bg-gray-100 transition-colors ${isRtl ? 'rounded-r-xl border-l border-gray-200' : 'rounded-l-xl border-r border-gray-200'}`}>
                        <span className="text-xl">{country.flag}</span>
                        <span className="font-semibold text-sm text-gray-800">{country.dialCode}</span>
                        <ChevronDown size={13} className="text-gray-400" />
                      </button>
                      {showCountries && (
                        <div className={`absolute top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-xl overflow-y-auto max-h-60 w-60 ${isRtl ? 'right-0' : 'left-0'}`}>
                          {COUNTRIES.map(c => (
                            <button key={c.code} type="button"
                              onClick={() => { setCountry(c); setShowCountries(false) }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50 text-left transition-colors">
                              <span className="text-lg">{c.flag}</span>
                              <span className="flex-1 text-sm text-gray-800">{c.name}</span>
                              <span className="text-sm text-gray-400 font-medium">{c.dialCode}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <input autoFocus type="tel" value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                      placeholder="XX XX XX XX"
                      className="flex-1 h-12 px-4 bg-transparent text-base font-semibold text-gray-900 tracking-widest placeholder-gray-300 focus:outline-none"
                    />
                  </div>
                </div>

                {err && <p className="text-sm text-red-500 mb-4">{err}</p>}

                <button onClick={onSubmit} disabled={loading || phone.replace(/\s/g, '').length < 6}
                  className="w-full h-12 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-40 transition-all"
                  style={{ background: '#F8AC12', color: '#0D0D0D' }}>
                  {loading
                    ? <span className="w-5 h-5 border-2 border-black/20 border-t-black/70 rounded-full animate-spin" />
                    : <><span>{lang === 'fr' ? 'Recevoir le code' : 'استقبال الرمز'}</span><ArrowRight size={16} /></>
                  }
                </button>
              </>
            )}

            {/* Sign-in link */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">{lang === 'fr' ? 'Déjà un compte ?' : 'لديك حساب؟'}</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <Link to="/connexion"
              className="w-full h-12 rounded-xl text-sm font-semibold border-2 border-gray-200 flex items-center justify-center gap-2 hover:border-amber-400 hover:text-amber-700 transition-all text-gray-700">
              {lang === 'fr' ? 'Se connecter' : 'تسجيل الدخول'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
