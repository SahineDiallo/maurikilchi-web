import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react'
import { api } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { type Lang } from '../../constants/i18n'

interface Props { lang: Lang }

const fmt = (s: number) =>
  `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

const mask = (p: string) =>
  p.length > 6 ? `${p.slice(0, 4)} ••• ${p.slice(-2)}` : p

export default function VerifyPage({ lang }: Props) {
  const navigate = useNavigate()
  const { pending, clearPending, login, isAuthenticated, bootstrapDone } = useAuth()
  const isRtl = lang === 'ar'

  // Only redirect if already authenticated before reaching this page (e.g. back button)
  useEffect(() => {
    if (bootstrapDone && isAuthenticated && !pending.phone) navigate('/', { replace: true })
  }, [bootstrapDone, isAuthenticated])

  const [digits,   setDigits]   = useState(['', '', '', '', '', ''])
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [success,  setSuccess]  = useState(false)
  const [timer,    setTimer]    = useState(120)
  const [canResend, setCanResend] = useState(false)
  const refs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (!pending.phone) { navigate('/connexion'); return }
  }, [])

  useEffect(() => {
    if (timer <= 0) { setCanResend(true); return }
    const id = setInterval(() => setTimer(t => t - 1), 1000)
    return () => clearInterval(id)
  }, [timer])

  const onChange = (text: string, i: number) => {
    if (text.length === 6 && /^\d+$/.test(text)) {
      setDigits(text.split('')); refs.current[5]?.focus(); return
    }
    const d = text.replace(/\D/g, '').slice(-1)
    const next = [...digits]; next[i] = d; setDigits(next)
    if (d && i < 5) refs.current[i + 1]?.focus()
  }

  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== 'Backspace') return
    const next = [...digits]
    if (next[i] === '' && i > 0) { next[i - 1] = ''; setDigits(next); refs.current[i - 1]?.focus() }
    else { next[i] = ''; setDigits(next) }
  }

  const filled = digits.every(d => d !== '')

  const verify = useCallback(async () => {
    const code = digits.join('')
    if (code.length < 6 || loading || success) return
    setError(''); setLoading(true)
    try {
      const payload: any = { phone: pending.phone, code }
      // Only send registration fields when it's a registration flow (firstName is set)
      const isRegistration = !!pending.firstName
      if (isRegistration) {
        payload.first_name         = pending.firstName
        payload.last_name          = pending.lastName
        payload.role               = pending.role
        if (pending.vehicle)       payload.vehicle_type       = pending.vehicle
        if (pending.trajetDepart)  payload.trajet_depart      = pending.trajetDepart
        if (pending.trajetDest)    payload.trajet_destination = pending.trajetDest
        if (pending.wilaya)        payload.wilaya             = pending.wilaya
      }
      const res = await api.post<{ access: string; refresh: string; user: any }>('/auth/verify-otp/', payload)
      login(res.data.access, res.data.refresh, res.data.user)
      clearPending()
      setSuccess(true)
      setTimeout(() => navigate('/'), 1000)
    } catch (e: any) {
      setError(e.response?.data?.detail ?? (lang === 'fr' ? 'Code invalide ou expiré.' : 'رمز غير صالح أو منتهي الصلاحية.'))
    } finally {
      setLoading(false)
    }
  }, [digits, loading, success, pending])

  useEffect(() => { if (filled && !loading && !success) verify() }, [digits])

  const resend = () => {
    setTimer(120); setCanResend(false)
    setDigits(['', '', '', '', '', '']); setError('')
    api.post('/auth/send-otp/', { phone: pending.phone }).catch(() => {})
    refs.current[0]?.focus()
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen bg-gray-50 flex flex-col pt-[152px] sm:pt-[100px] lg:pt-0">
      {/* Top nav */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:border-amber-400 hover:text-amber-600 transition-all text-gray-500">
          <ArrowLeft size={16} className={isRtl ? 'rotate-180' : ''} />
        </button>
        <Link to="/">
          <img src="/logo.png" alt="Mauri-Kilchi" className="h-8 w-auto object-contain" />
        </Link>
      </div>

      {/* Centered card */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">

          {/* Card header */}
          <div className="px-8 pt-8 pb-6 border-b border-gray-100 text-center">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: success ? 'rgba(34,197,94,0.1)' : 'rgba(248,172,18,0.12)' }}>
              <ShieldCheck size={26} className={success ? 'text-green-500' : 'text-amber-500'} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">
              {success
                ? (lang === 'fr' ? 'Compte vérifié !' : 'تم التحقق!')
                : (lang === 'fr' ? 'Vérifiez votre numéro' : 'تحقق من رقمك')}
            </h1>
            <p className="text-sm text-gray-500">
              {lang === 'fr' ? 'Code envoyé au ' : 'تم إرسال الرمز إلى '}
              <strong className="text-gray-800 font-semibold">{mask(pending.phone || '')}</strong>
            </p>
          </div>

          {/* OTP input */}
          <div className="px-8 py-8">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 text-center">
              {lang === 'fr' ? 'Entrez le code à 6 chiffres' : 'أدخل الرمز المكون من 6 أرقام'}
            </p>

            <div className="flex gap-2 mb-4 justify-center">
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={el => { refs.current[i] = el }}
                  type="tel"
                  inputMode="numeric"
                  maxLength={6}
                  value={success ? '✓' : d}
                  onChange={e => onChange(e.target.value, i)}
                  onKeyDown={e => onKeyDown(e, i)}
                  autoFocus={i === 0}
                  readOnly={success}
                  className={`w-11 h-14 rounded-xl border-2 text-center text-xl font-bold transition-all focus:outline-none select-all ${
                    success
                      ? 'border-green-400 bg-green-50 text-green-600'
                      : error
                      ? 'border-red-300 bg-red-50 text-gray-900'
                      : d
                      ? 'border-amber-400 bg-amber-50 text-gray-900'
                      : 'border-gray-200 bg-gray-50 text-gray-900 focus:border-amber-400 focus:bg-white'
                  }`}
                />
              ))}
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl mb-4">
                <span className="text-red-500 text-sm">{error}</span>
              </div>
            )}

            {/* Resend */}
            <div className="flex justify-center mb-6">
              {canResend ? (
                <button onClick={resend} className="text-sm font-semibold text-amber-600 hover:text-amber-700 underline underline-offset-2">
                  {lang === 'fr' ? 'Renvoyer le code' : 'إعادة إرسال الرمز'}
                </button>
              ) : (
                <p className="text-sm text-gray-400">
                  {lang === 'fr' ? 'Renvoyer dans ' : 'إعادة الإرسال خلال '}
                  <strong className="text-gray-700 tabular-nums">{fmt(timer)}</strong>
                </p>
              )}
            </div>

            {/* CTA */}
            <button
              onClick={verify}
              disabled={!filled || loading || success}
              className={`w-full h-12 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:cursor-not-allowed ${
                success
                  ? 'bg-green-500 text-white'
                  : filled && !loading
                  ? 'hover:opacity-90'
                  : 'opacity-40'
              }`}
              style={success ? {} : { background: '#F8AC12', color: '#0D0D0D' }}>
              {loading ? (
                <span className="w-5 h-5 border-2 border-black/20 border-t-black/70 rounded-full animate-spin" />
              ) : success ? (
                <span>{lang === 'fr' ? 'Connecté ! Redirection…' : 'تم الدخول! جاري التحويل…'}</span>
              ) : (
                <><span>{lang === 'fr' ? 'Vérifier' : 'تحقق'}</span>{filled && <ArrowRight size={16} />}</>
              )}
            </button>

            <p className="text-xs text-gray-400 text-center mt-4">
              {lang === 'fr' ? 'Mauvais numéro ? ' : 'رقم خاطئ؟ '}
              <Link to="/connexion" className="text-amber-600 font-medium hover:underline">
                {lang === 'fr' ? 'Recommencer' : 'ابدأ من جديد'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
