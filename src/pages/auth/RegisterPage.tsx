import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ChevronDown, Check } from 'lucide-react'
import { api } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { type Lang } from '../../constants/i18n'
import { COUNTRIES, DEFAULT_COUNTRY } from '../../constants/countries'

interface Props { lang: Lang }

type Role = 'vendeur' | 'livreur' | 'voyageur' | 'maurigo'

const ROLES = [
  { key: 'vendeur'  as Role, emoji: '🏪', label: { fr: 'Vendeur',      ar: 'بائع'      }, desc: { fr: 'Créez votre boutique et vendez vos produits à toute la Mauritanie.',                     ar: 'أنشئ متجرك وبع منتجاتك في جميع أنحاء موريتانيا.'        } },
  { key: 'livreur'  as Role, emoji: '🏍️', label: { fr: 'Livreur',      ar: 'موصّل'      }, desc: { fr: 'Devenez livreur indépendant et recevez des commandes dans votre zone.',                  ar: 'كن موصّلاً مستقلاً واستقبل طلبات التوصيل في منطقتك.'     } },
  { key: 'voyageur' as Role, emoji: '🚌', label: { fr: 'Long Voyage',   ar: 'سفر طويل'  }, desc: { fr: 'Proposez des trajets entre villes et transportez des colis ou passagers.',                ar: 'اعرض رحلات بين المدن وانقل الطرود أو الركاب.'            } },
  { key: 'maurigo'  as Role, emoji: '🚕', label: { fr: 'Car Rapide',    ar: 'كار رابيد' }, desc: { fr: 'Proposez vos courses en Car Rapide dans votre wilaya. Les clients vous contactent.',     ar: 'اعرض خدمات الكار رابيد في ولايتك. يتواصل العملاء مباشرة.' } },
]

const VEHICLES = [
  { key: 'moto',          emoji: '🏍️', label: { fr: 'Moto',          ar: 'دراجة نارية' } },
  { key: 'thiouk_thiouk', emoji: '🛺',  label: { fr: 'Thiouk Thiouk', ar: 'ثيوك ثيوك'  } },
  { key: 'auto',          emoji: '🚗',  label: { fr: 'Auto',          ar: 'سيارة'       } },
]

const WILAYAS = [
  'Nouakchott-Ouest', 'Nouakchott-Nord', 'Nouakchott-Sud',
  'Hodh Ech Chargui', 'Hodh El Gharbi', 'Assaba', 'Gorgol',
  'Brakna', 'Trarza', 'Adrar', 'Nouadhibou', 'Tagant',
  'Guidimakha', 'Tiris Zemmour', 'Inchiri', 'Dakhlet Nouadhibou',
]

// Brand panel — same on all steps
function BrandPanel({ lang, isRtl: _isRtl }: { lang: Lang; isRtl: boolean }) {
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
          {lang === 'fr' ? 'Rejoignez la\ncommunauté.' : 'انضم إلى\nالمجتمع.'}
        </p>
        <p className="text-amber-400 font-medium text-base mb-10">
          {lang === 'fr' ? 'Vendeurs, livreurs, voyageurs — tous connectés.' : 'بائعون، موصّلون، مسافرون — كلهم متصلون.'}
        </p>
        <div className="grid grid-cols-2 gap-4 pt-8 border-t border-white/10">
          {[
            { emoji: '🏪', n: '1 200+', fr: 'Vendeurs', ar: 'بائع' },
            { emoji: '🏍️', n: '450+',  fr: 'Livreurs', ar: 'موصّل' },
            { emoji: '🚌', n: '120+',  fr: 'Voyageurs', ar: 'مسافر' },
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
  const navigate  = useNavigate()
  const location  = useLocation()
  const { setPending, isAuthenticated, bootstrapDone } = useAuth()
  const isRtl = lang === 'ar'

  // Arriving from sign-in with an unknown number — OTP already sent
  const fromSignIn = location.state as { phone?: string; dialCode?: string; otpSent?: boolean } | null
  const prefilledPhone   = fromSignIn?.phone    ?? ''
  const prefilledOtpSent = fromSignIn?.otpSent  ?? false

  useEffect(() => {
    if (bootstrapDone && isAuthenticated) navigate('/', { replace: true })
  }, [bootstrapDone, isAuthenticated])

  const [phase, setPhase] = useState<'role-pick' | 'form'>('role-pick')
  const [role, setRole] = useState<Role>('vendeur')
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [country, setCountry] = useState(() => {
    if (fromSignIn?.dialCode) {
      return COUNTRIES.find(c => c.dialCode === fromSignIn.dialCode) ?? DEFAULT_COUNTRY
    }
    return DEFAULT_COUNTRY
  })
  const [showCountries, setShowCountries] = useState(false)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName]   = useState('')
  const [phone, setPhone]         = useState(prefilledPhone)
  const [vehicle, setVehicle]     = useState('')
  const [trajetDepart, setTrajetDepart] = useState('')
  const [trajetDest, setTrajetDest]     = useState('')
  const [wilaya, setWilaya]       = useState('')
  const [err, setErr]             = useState('')
  const [loading, setLoading]     = useState(false)

  const needsStep3 = role === 'livreur' || role === 'voyageur' || role === 'maurigo'
  // When phone is pre-filled, step 2 is skipped — adjust visible step count and display index
  const totalSteps = prefilledOtpSent ? (needsStep3 ? 2 : 1) : (needsStep3 ? 3 : 2)
  const displayStep = prefilledOtpSent && step === 3 ? 2 : step
  const roleInfo = ROLES.find(r => r.key === role)!

  const selectRole = (r: Role) => {
    setRole(r); setStep(1); setVehicle(''); setTrajetDepart(''); setTrajetDest(''); setWilaya('')
    setErr(''); setFirstName(''); setLastName('')
    if (!prefilledOtpSent) setPhone('')  // keep pre-filled phone when coming from sign-in
    setPhase('form')
  }

  const handleBack = () => {
    if (phase === 'role-pick') { navigate(-1); return }
    if (step === 1) { setPhase('role-pick'); return }
    // When phone is pre-filled step 2 is skipped, so step 3 goes back to step 1
    if (step === 3 && prefilledOtpSent) { setStep(1); return }
    setStep(s => (s - 1) as any)
  }

  const goStep2 = () => {
    if (firstName.trim().length < 2 || lastName.trim().length < 2) {
      setErr(lang === 'fr' ? 'Veuillez renseigner votre nom complet.' : 'يرجى إدخال اسمك الكامل.')
      return
    }
    setErr('')
    if (prefilledOtpSent) {
      // Phone already known from sign-in — skip the phone step entirely
      if (needsStep3) setStep(3)
      else void onSubmit()
    } else {
      setStep(2)
    }
  }

  const goStep3 = () => {
    if (phone.replace(/\s/g, '').length < 6) {
      setErr(lang === 'fr' ? 'Numéro invalide.' : 'رقم غير صالح.')
      return
    }
    setErr(''); setStep(3)
  }

  const onSubmit = async () => {
    if (phone.replace(/\s/g, '').length < 6) { setErr(lang === 'fr' ? 'Numéro invalide.' : 'رقم غير صالح.'); return }
    if (role === 'livreur' && !vehicle) { setErr(lang === 'fr' ? 'Choisissez votre véhicule.' : 'اختر مركبتك.'); return }
    if (role === 'voyageur' && (!trajetDepart || !trajetDest)) { setErr(lang === 'fr' ? 'Renseignez votre trajet.' : 'أدخل مسارك.'); return }
    if (role === 'maurigo' && !wilaya) { setErr(lang === 'fr' ? 'Choisissez votre wilaya.' : 'اختر ولايتك.'); return }
    setErr(''); setLoading(true)
    const full = prefilledOtpSent ? `${country.dialCode}${phone}` : `${country.dialCode}${phone}`
    const pending = {
      phone: full, firstName: firstName.trim(), lastName: lastName.trim(), role,
      vehicle: role === 'livreur' ? vehicle : '',
      trajetDepart: role === 'voyageur' ? trajetDepart : '',
      trajetDest: role === 'voyageur' ? trajetDest : '',
      wilaya: role === 'maurigo' ? wilaya : '',
    }
    try {
      if (!prefilledOtpSent) {
        // Normal registration — send OTP now
        await api.post('/auth/send-otp/', { phone: full })
      }
      setPending(pending)
      navigate('/verification')
    } catch (e: any) {
      setErr(e.response?.data?.detail ?? (lang === 'fr' ? "Erreur d'envoi du code." : 'حدث خطأ.'))
    } finally {
      setLoading(false)
    }
  }

  // ── Role pick ──────────────────────────────────────────────────────────────
  if (phase === 'role-pick') {
    return (
      <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen flex pt-[152px] sm:pt-[100px] lg:pt-0">
        <BrandPanel lang={lang} isRtl={isRtl} />
        <div className="flex-1 flex flex-col">
          <div className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <Link to="/"><img src="/logo.png" alt="Mauri-Kilchi" className="h-8 w-auto object-contain" /></Link>
          </div>
          <div className="flex-1 flex items-center justify-center px-6 py-10 overflow-y-auto">
            <div className="w-full max-w-md">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {lang === 'fr' ? 'Créer un compte' : 'إنشاء حساب'}
                </h1>
                <p className="text-gray-500 text-base">
                  {lang === 'fr' ? 'Choisissez votre type de compte pour commencer.' : 'اختر نوع حسابك للبدء.'}
                </p>
              </div>

              <div className="space-y-3">
                {ROLES.map(r => (
                  <button key={r.key} onClick={() => selectRole(r.key)}
                    className="w-full flex items-start gap-4 p-4 border border-gray-200 rounded-2xl hover:border-amber-400 hover:bg-amber-50/30 text-left transition-all group">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-gray-50 group-hover:bg-amber-100 transition-colors">
                      <span className="text-2xl">{r.emoji}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 text-sm">{r.label.fr}</span>
                        <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">{r.label.ar}</span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">{r.desc[lang]}</p>
                    </div>
                    <ArrowRight size={16} className="text-gray-300 group-hover:text-amber-500 shrink-0 mt-1 transition-colors" />
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 my-7">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">{lang === 'fr' ? 'Déjà un compte ?' : 'لديك حساب؟'}</span>
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

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen flex">
      <BrandPanel lang={lang} isRtl={isRtl} />
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
              {/* Role badge */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-full border border-amber-200">
                <span className="text-sm">{roleInfo.emoji}</span>
                <span className="text-xs font-semibold text-amber-700">{roleInfo.label[lang]}</span>
              </div>
            </div>

            {/* ── Step 1: Name ── */}
            {step === 1 && (
              <>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {lang === 'fr' ? 'Comment vous appelez-vous ?' : 'ما اسمك؟'}
                </h1>
                <p className="text-gray-500 text-sm mb-8">{lang === 'fr' ? 'Entrez votre nom complet' : 'أدخل اسمك الكامل'}</p>

                <div className="space-y-4 mb-6">
                  {[
                    { label: { fr: 'Prénom', ar: 'الاسم الأول' }, value: firstName, set: setFirstName, ph: { fr: 'Votre prénom', ar: 'اسمك الأول' } },
                    { label: { fr: 'Nom de famille', ar: 'اسم العائلة' }, value: lastName, set: setLastName, ph: { fr: 'Votre nom', ar: 'اسم عائلتك' } },
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

                <button onClick={goStep2}
                  className="w-full h-12 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                  style={{ background: '#F8AC12', color: '#0D0D0D' }}>
                  {lang === 'fr' ? 'Continuer' : 'متابعة'} <ArrowRight size={16} />
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
                  {lang === 'fr' ? 'Vous recevrez un code de vérification via WhatsApp' : 'ستتلقى رمز تحقق عبر واتساب'}
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
                    <input autoFocus={!prefilledOtpSent} type="tel" value={phone}
                      onChange={e => !prefilledOtpSent && setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                      readOnly={prefilledOtpSent}
                      placeholder="XX XX XX XX"
                      className={`flex-1 h-12 px-4 bg-transparent text-base font-semibold text-gray-900 tracking-widest placeholder-gray-300 focus:outline-none ${prefilledOtpSent ? 'opacity-60 cursor-not-allowed' : ''}`}
                    />
                  </div>
                </div>

                {err && <p className="text-sm text-red-500 mb-4">{err}</p>}

                <button onClick={needsStep3 ? goStep3 : onSubmit} disabled={loading}
                  className="w-full h-12 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-40 transition-all"
                  style={{ background: '#F8AC12', color: '#0D0D0D' }}>
                  {loading
                    ? <span className="w-5 h-5 border-2 border-black/20 border-t-black/70 rounded-full animate-spin" />
                    : <><span>{lang === 'fr' ? (needsStep3 ? 'Continuer' : 'Recevoir le code') : (needsStep3 ? 'متابعة' : 'استقبال الرمز')}</span><ArrowRight size={16} /></>
                  }
                </button>
              </>
            )}

            {/* ── Step 3: Vehicle (livreur) ── */}
            {step === 3 && role === 'livreur' && (
              <>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {lang === 'fr' ? 'Votre véhicule' : 'مركبتك'}
                </h1>
                <p className="text-gray-500 text-sm mb-8">{lang === 'fr' ? 'Choisissez votre moyen de livraison' : 'اختر وسيلة التوصيل'}</p>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  {VEHICLES.map(v => {
                    const on = vehicle === v.key
                    return (
                      <button key={v.key} onClick={() => setVehicle(v.key)}
                        className={`relative flex flex-col items-center py-5 px-3 rounded-2xl border-2 transition-all ${on ? 'border-amber-400 bg-amber-50' : 'border-gray-200 hover:border-amber-200 bg-white'}`}>
                        {on && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center">
                            <Check size={11} strokeWidth={3} className="text-white" />
                          </div>
                        )}
                        <span className="text-3xl mb-2">{v.emoji}</span>
                        <span className={`text-xs font-semibold text-center ${on ? 'text-amber-700' : 'text-gray-700'}`}>{v.label[lang]}</span>
                      </button>
                    )
                  })}
                </div>

                {err && <p className="text-sm text-red-500 mb-4">{err}</p>}

                <button onClick={onSubmit} disabled={!vehicle || loading}
                  className="w-full h-12 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-40 transition-all"
                  style={{ background: '#F8AC12', color: '#0D0D0D' }}>
                  {loading
                    ? <span className="w-5 h-5 border-2 border-black/20 border-t-black/70 rounded-full animate-spin" />
                    : <><span>{lang === 'fr' ? (prefilledOtpSent ? 'Créer mon compte' : 'Recevoir le code') : (prefilledOtpSent ? 'إنشاء حسابي' : 'استقبال الرمز')}</span><ArrowRight size={16} /></>
                  }
                </button>
              </>
            )}

            {/* ── Step 3: Trajet (voyageur) ── */}
            {step === 3 && role === 'voyageur' && (
              <>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {lang === 'fr' ? 'Votre trajet habituel' : 'مسارك المعتاد'}
                </h1>
                <p className="text-gray-500 text-sm mb-8">
                  {lang === 'fr' ? 'Le trajet retour est inclus automatiquement.' : 'رحلة العودة مضمّنة تلقائياً.'}
                </p>

                <div className="space-y-4 mb-6">
                  {[
                    { label: { fr: 'Ville de départ', ar: 'مدينة الانطلاق' }, val: trajetDepart, set: setTrajetDepart, exclude: trajetDest },
                    { label: { fr: "Ville d'arrivée", ar: 'مدينة الوصول'  }, val: trajetDest,    set: setTrajetDest,   exclude: trajetDepart },
                  ].map((f, i) => (
                    <div key={i}>
                      {i === 1 && <div className="flex justify-center text-gray-400 text-xl my-1">↓</div>}
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{f.label[lang]}</label>
                      <select value={f.val} onChange={e => f.set(e.target.value)}
                        className="w-full h-12 px-4 border border-gray-200 rounded-xl text-sm text-gray-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 focus:outline-none bg-white">
                        <option value="">{lang === 'fr' ? 'Sélectionner...' : 'اختر...'}</option>
                        {WILAYAS.filter(w => w !== f.exclude).map(w => <option key={w} value={w}>{w}</option>)}
                      </select>
                    </div>
                  ))}
                  {trajetDepart && trajetDest && (
                    <div className="flex items-center justify-center py-3 px-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <span className="font-bold text-sm text-amber-700">{trajetDepart} ⇄ {trajetDest}</span>
                    </div>
                  )}
                </div>

                {err && <p className="text-sm text-red-500 mb-4">{err}</p>}

                <button onClick={onSubmit} disabled={!trajetDepart || !trajetDest || loading}
                  className="w-full h-12 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-40 transition-all"
                  style={{ background: '#F8AC12', color: '#0D0D0D' }}>
                  {loading
                    ? <span className="w-5 h-5 border-2 border-black/20 border-t-black/70 rounded-full animate-spin" />
                    : <><span>{lang === 'fr' ? (prefilledOtpSent ? 'Créer mon compte' : 'Recevoir le code') : (prefilledOtpSent ? 'إنشاء حسابي' : 'استقبال الرمز')}</span><ArrowRight size={16} /></>
                  }
                </button>
              </>
            )}

            {/* ── Step 3: Wilaya (maurigo) ── */}
            {step === 3 && role === 'maurigo' && (
              <>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {lang === 'fr' ? 'Votre wilaya' : 'ولايتك'}
                </h1>
                <p className="text-gray-500 text-sm mb-8">
                  {lang === 'fr' ? 'Choisissez la wilaya où vous exercez votre activité.' : 'اختر الولاية التي تمارس فيها نشاطك.'}
                </p>

                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {lang === 'fr' ? 'Wilaya' : 'الولاية'}
                </label>
                <select value={wilaya} onChange={e => setWilaya(e.target.value)}
                  className="w-full h-12 px-4 border border-gray-200 rounded-xl text-sm text-gray-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 focus:outline-none bg-white mb-6">
                  <option value="">{lang === 'fr' ? 'Sélectionner votre wilaya...' : 'اختر ولايتك...'}</option>
                  {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                </select>

                {err && <p className="text-sm text-red-500 mb-4">{err}</p>}

                <button onClick={onSubmit} disabled={!wilaya || loading}
                  className="w-full h-12 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-40 transition-all"
                  style={{ background: '#F8AC12', color: '#0D0D0D' }}>
                  {loading
                    ? <span className="w-5 h-5 border-2 border-black/20 border-t-black/70 rounded-full animate-spin" />
                    : <><span>{lang === 'fr' ? (prefilledOtpSent ? 'Créer mon compte' : 'Recevoir le code') : (prefilledOtpSent ? 'إنشاء حسابي' : 'استقبال الرمز')}</span><ArrowRight size={16} /></>
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
