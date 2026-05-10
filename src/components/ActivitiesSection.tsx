import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, X, Store, Plus, AlertCircle, Clock, XCircle } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { type Lang } from '../constants/i18n'

const WILAYAS = [
  'Nouakchott-Ouest', 'Nouakchott-Nord', 'Nouakchott-Sud',
  'Hodh Ech Chargui', 'Hodh El Gharbi', 'Assaba', 'Gorgol',
  'Brakna', 'Trarza', 'Adrar', 'Nouadhibou', 'Tagant',
  'Guidimakha', 'Tiris Zemmour', 'Inchiri', 'Dakhlet Nouadhibou',
]

const VEHICLES = [
  { key: 'moto',          emoji: '🏍️', fr: 'Moto',          ar: 'دراجة نارية' },
  { key: 'thiouk_thiouk', emoji: '🛺',  fr: 'Thiouk Thiouk', ar: 'ثيوك ثيوك'  },
  { key: 'auto',          emoji: '🚗',  fr: 'Auto',          ar: 'سيارة'       },
]

type TransportType = 'livreur' | 'voyageur' | 'maurigo'

const TRANSPORT_OPTIONS: { key: TransportType; emoji: string; fr: string; ar: string; desc: { fr: string; ar: string } }[] = [
  { key: 'livreur',  emoji: '🏍️', fr: 'Livreur',      ar: 'موصّل',      desc: { fr: 'Livraisons locales dans votre zone', ar: 'توصيل محلي في منطقتك' } },
  { key: 'voyageur', emoji: '🚌', fr: 'Long Voyage',   ar: 'سفر طويل',  desc: { fr: 'Trajets inter-villes et colis',      ar: 'رحلات بين المدن والطرود' } },
  { key: 'maurigo',  emoji: '🚕', fr: 'Car Rapide',    ar: 'كار رابيد', desc: { fr: 'Courses dans votre wilaya',          ar: 'رحلات في ولايتك' } },
]

function Spinner() {
  return <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin inline-block" />
}

interface Props { lang: Lang; hasBoutique: boolean }

export default function ActivitiesSection({ lang, hasBoutique }: Props) {
  const { user, login } = useAuth()
  const isRtl = lang === 'ar'

  const [sellerLoading,  setSellerLoading]  = useState(false)
  const [sellerErr,      setSellerErr]      = useState('')
  const [enableType,     setEnableType]     = useState<TransportType | null>(null)
  const [transportLoading, setTransportLoading] = useState(false)
  const [transportErr,   setTransportErr]   = useState('')
  const [removeLoading,  setRemoveLoading]  = useState(false)

  // Form state
  const [vehicle,      setVehicle]      = useState('')
  const [trajetDepart, setTrajetDepart] = useState('')
  const [trajetDest,   setTrajetDest]   = useState('')
  const [wilaya,       setWilaya]       = useState('')
  const [plate,        setPlate]        = useState('')

  if (!user) return null

  const seller    = user.seller_profile
  const transport = user.transport

  const refreshUser = async () => {
    const res = await api.get('/auth/me/')
    login(
      localStorage.getItem('access_token')!,
      localStorage.getItem('refresh_token')!,
      res.data,
    )
  }

  // ── Seller toggle ──────────────────────────────────────────────────────────
  const toggleSeller = async (enable: boolean) => {
    setSellerLoading(true); setSellerErr('')
    try {
      if (enable) await api.post('/auth/me/seller/')
      else        await api.delete('/auth/me/seller/')
      await refreshUser()
    } catch (e: any) {
      setSellerErr(e.response?.data?.detail ?? (lang === 'fr' ? 'Erreur.' : 'خطأ.'))
    } finally {
      setSellerLoading(false)
    }
  }

  // ── Transport enable ───────────────────────────────────────────────────────
  const enableTransport = async () => {
    if (!enableType) return
    setTransportErr('')

    if (enableType === 'livreur' && !vehicle) {
      setTransportErr(lang === 'fr' ? 'Choisissez votre véhicule.' : 'اختر مركبتك.'); return
    }
    if (enableType === 'voyageur' && (!trajetDepart || !trajetDest)) {
      setTransportErr(lang === 'fr' ? 'Renseignez votre trajet complet.' : 'أدخل مسارك كاملاً.'); return
    }
    if (enableType === 'maurigo' && !wilaya) {
      setTransportErr(lang === 'fr' ? 'Choisissez votre wilaya.' : 'اختر ولايتك.'); return
    }

    setTransportLoading(true)
    try {
      const body: Record<string, string> = { type: enableType }
      if (enableType === 'livreur')  { body.vehicle_type = vehicle }
      if (enableType === 'voyageur') { body.trajet_depart = trajetDepart; body.trajet_destination = trajetDest }
      if (enableType === 'maurigo')  { body.wilaya = wilaya; if (plate) body.plate_number = plate }

      await api.post('/auth/me/transport/', body)
      await refreshUser()
      setEnableType(null)
      setVehicle(''); setTrajetDepart(''); setTrajetDest(''); setWilaya(''); setPlate('')
    } catch (e: any) {
      setTransportErr(e.response?.data?.detail ?? (lang === 'fr' ? 'Erreur.' : 'خطأ.'))
    } finally {
      setTransportLoading(false)
    }
  }

  const removeTransport = async () => {
    setRemoveLoading(true)
    try {
      await api.delete('/auth/me/transport/')
      await refreshUser()
    } catch { /* ignore */ } finally {
      setRemoveLoading(false)
    }
  }

  const cancelEnable = () => {
    setEnableType(null); setTransportErr('')
    setVehicle(''); setTrajetDepart(''); setTrajetDest(''); setWilaya(''); setPlate('')
  }

  // ── Status badge for Maurigo ───────────────────────────────────────────────
  const MaurigoStatusBadge = ({ status }: { status?: string }) => {
    if (status === 'approved') return (
      <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
        <Check size={11} strokeWidth={3} /> {lang === 'fr' ? 'Approuvé' : 'معتمد'}
      </span>
    )
    if (status === 'rejected') return (
      <span className="flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-100 px-2.5 py-1 rounded-full">
        <XCircle size={11} /> {lang === 'fr' ? 'Rejeté' : 'مرفوض'}
      </span>
    )
    return (
      <span className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
        <Clock size={11} /> {lang === 'fr' ? 'En attente' : 'قيد المراجعة'}
      </span>
    )
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="font-bold text-gray-900">{lang === 'fr' ? 'Mes activités' : 'نشاطاتي'}</h3>
        <p className="text-xs text-gray-400 mt-0.5">
          {lang === 'fr'
            ? 'Activez les profils qui correspondent à ce que vous faites.'
            : 'فعّل الملفات التي تتوافق مع ما تقوم به.'}
        </p>
      </div>

      <div className="px-6 py-5 space-y-5">

        {/* ── Commerce / Seller ─────────────────────────────────────────── */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
            {lang === 'fr' ? 'Commerce' : 'تجارة'}
          </p>

          <div className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
            seller?.is_active
              ? 'border-amber-300 bg-amber-50/50'
              : 'border-gray-200 bg-gray-50/50'
          }`}>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              seller?.is_active ? 'bg-amber-100' : 'bg-gray-100'
            }`}>
              <Store size={20} className={seller?.is_active ? 'text-amber-600' : 'text-gray-400'} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm text-gray-900">
                  {lang === 'fr' ? 'Boutique & Vente' : 'متجر وبيع'}
                </span>
                {seller?.is_active && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                    <Check size={10} strokeWidth={3} /> {lang === 'fr' ? 'Actif' : 'نشط'}
                  </span>
                )}
                {seller && !seller.is_active && (
                  <span className="text-xs font-semibold text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                    {lang === 'fr' ? 'Désactivé' : 'معطّل'}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {lang === 'fr'
                  ? 'Créez une boutique et vendez vos produits partout en Mauritanie.'
                  : 'أنشئ متجراً وبِع منتجاتك في جميع أنحاء موريتانيا.'}
              </p>
              {sellerErr && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle size={11} /> {sellerErr}
                </p>
              )}
            </div>
            <div className="shrink-0">
              {!seller || !seller.is_active ? (
                <button onClick={() => toggleSeller(true)} disabled={sellerLoading}
                  className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-500 text-gray-900 text-xs font-bold px-3 py-2 rounded-xl transition-colors disabled:opacity-60">
                  {sellerLoading ? <Spinner /> : <Plus size={13} />}
                  {lang === 'fr' ? (seller ? 'Réactiver' : 'Activer') : (seller ? 'إعادة التفعيل' : 'تفعيل')}
                </button>
              ) : (
                <button onClick={() => toggleSeller(false)} disabled={sellerLoading}
                  className="text-xs text-gray-400 hover:text-red-500 font-medium transition-colors disabled:opacity-60 flex items-center gap-1">
                  {sellerLoading ? <Spinner /> : null}
                  {lang === 'fr' ? 'Désactiver' : 'تعطيل'}
                </button>
              )}
            </div>
          </div>

          {/* CTA when seller just enabled but no boutique */}
          {seller?.is_active && !hasBoutique && (
            <div className="mt-3 flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
              <span className="text-amber-500 text-lg">🎉</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">
                  {lang === 'fr' ? 'Prêt à vendre !' : 'جاهز للبيع!'}
                </p>
                <p className="text-xs text-gray-500">
                  {lang === 'fr' ? 'Créez votre boutique pour commencer.' : 'أنشئ متجرك للبدء.'}
                </p>
              </div>
              <Link to="/boutique/create-boutique"
                className="shrink-0 text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-2 rounded-lg transition-colors">
                {lang === 'fr' ? 'Créer →' : 'إنشاء →'}
              </Link>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100" />

        {/* ── Transport ─────────────────────────────────────────────────── */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
            {lang === 'fr' ? 'Transport' : 'نقل'}
          </p>

          {/* Active transport profile */}
          {transport ? (
            <div>
              <div className="flex items-start gap-4 p-4 rounded-2xl border-2 border-amber-300 bg-amber-50/50">
                <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-xl">
                  {transport.type === 'livreur'  && '🏍️'}
                  {transport.type === 'voyageur' && '🚌'}
                  {transport.type === 'maurigo'  && '🚕'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-sm text-gray-900">
                      {transport.type === 'livreur'  && (lang === 'fr' ? 'Livreur'      : 'موصّل')}
                      {transport.type === 'voyageur' && (lang === 'fr' ? 'Long Voyage'  : 'سفر طويل')}
                      {transport.type === 'maurigo'  && (lang === 'fr' ? 'Car Rapide'   : 'كار رابيد')}
                    </span>
                    {transport.type === 'maurigo'
                      ? <MaurigoStatusBadge status={transport.status} />
                      : (
                        <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                          <Check size={10} strokeWidth={3} /> {lang === 'fr' ? 'Actif' : 'نشط'}
                        </span>
                      )
                    }
                  </div>

                  {/* Transport-specific details */}
                  {transport.type === 'livreur' && (
                    <p className="text-xs text-gray-500">
                      {VEHICLES.find(v => v.key === transport.vehicle_type)?.[lang === 'fr' ? 'fr' : 'ar'] ?? transport.vehicle_type}
                      {transport.zone ? ` · ${transport.zone}` : ''}
                      {transport.rating !== undefined && ` · ⭐ ${transport.rating}`}
                    </p>
                  )}
                  {transport.type === 'voyageur' && (
                    <p className="text-xs text-gray-500 font-medium">
                      {transport.trajet_depart} ⇄ {transport.trajet_destination}
                    </p>
                  )}
                  {transport.type === 'maurigo' && (
                    <div className="space-y-0.5">
                      <p className="text-xs text-gray-500">{transport.wilaya}</p>
                      {transport.plate_number && <p className="text-xs text-gray-400">{lang === 'fr' ? 'Plaque' : 'اللوحة'}: {transport.plate_number}</p>}
                      {transport.status === 'pending' && (
                        <p className="text-xs text-amber-700 mt-1">
                          {lang === 'fr'
                            ? 'Ajoutez vos documents depuis l\'app mobile pour accélérer la vérification.'
                            : 'أضف وثائقك من التطبيق المحمول لتسريع المراجعة.'}
                        </p>
                      )}
                      {transport.status === 'rejected' && (
                        <p className="text-xs text-red-600 mt-1">
                          {lang === 'fr'
                            ? 'Profil rejeté. Contactez le support ou mettez à jour vos informations.'
                            : 'تم رفض الملف. تواصل مع الدعم أو حدّث معلوماتك.'}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <button onClick={removeTransport} disabled={removeLoading}
                  className="shrink-0 text-xs text-gray-400 hover:text-red-500 font-medium transition-colors disabled:opacity-60 flex items-center gap-1">
                  {removeLoading ? <Spinner /> : <X size={13} />}
                  {lang === 'fr' ? 'Retirer' : 'إزالة'}
                </button>
              </div>
            </div>
          ) : (
            /* No transport active — show 3 option cards */
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2.5">
                {TRANSPORT_OPTIONS.map(opt => {
                  const isSelected = enableType === opt.key
                  return (
                    <button key={opt.key}
                      onClick={() => { setEnableType(isSelected ? null : opt.key); setTransportErr('') }}
                      className={`relative flex flex-col items-center py-4 px-2 rounded-2xl border-2 transition-all text-center ${
                        isSelected
                          ? 'border-amber-400 bg-amber-50'
                          : 'border-gray-200 hover:border-amber-200 bg-white hover:bg-amber-50/30'
                      }`}>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center">
                          <Check size={9} strokeWidth={3} className="text-white" />
                        </div>
                      )}
                      <span className="text-2xl mb-1.5">{opt.emoji}</span>
                      <span className={`text-xs font-bold leading-tight ${isSelected ? 'text-amber-700' : 'text-gray-700'}`}>
                        {opt[lang === 'fr' ? 'fr' : 'ar']}
                      </span>
                      <span className="text-[10px] text-gray-400 mt-0.5 leading-tight">{opt.desc[lang]}</span>
                    </button>
                  )
                })}
              </div>

              {/* Inline enable form */}
              {enableType && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4 space-y-4">

                  {/* Livreur form */}
                  {enableType === 'livreur' && (
                    <>
                      <p className="text-sm font-semibold text-gray-800">
                        {lang === 'fr' ? 'Votre véhicule' : 'مركبتك'}
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {VEHICLES.map(v => (
                          <button key={v.key} type="button" onClick={() => setVehicle(v.key)}
                            className={`relative flex flex-col items-center py-3 px-2 rounded-xl border-2 transition-all ${
                              vehicle === v.key
                                ? 'border-amber-400 bg-amber-100'
                                : 'border-gray-200 bg-white hover:border-amber-200'
                            }`}>
                            {vehicle === v.key && (
                              <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center">
                                <Check size={9} strokeWidth={3} className="text-white" />
                              </div>
                            )}
                            <span className="text-xl mb-1">{v.emoji}</span>
                            <span className={`text-xs font-semibold text-center leading-tight ${vehicle === v.key ? 'text-amber-700' : 'text-gray-600'}`}>
                              {v[lang === 'fr' ? 'fr' : 'ar']}
                            </span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Voyageur form */}
                  {enableType === 'voyageur' && (
                    <>
                      <p className="text-sm font-semibold text-gray-800">
                        {lang === 'fr' ? 'Votre trajet habituel' : 'مسارك المعتاد'}
                      </p>
                      <div className="space-y-3">
                        {[
                          { label: { fr: 'Ville de départ', ar: 'مدينة الانطلاق' }, val: trajetDepart, set: setTrajetDepart, exclude: trajetDest },
                          { label: { fr: "Ville d'arrivée", ar: 'مدينة الوصول'  }, val: trajetDest,   set: setTrajetDest,   exclude: trajetDepart },
                        ].map((f, i) => (
                          <div key={i}>
                            {i === 1 && <div className="text-center text-gray-300 text-lg my-1">↓</div>}
                            <label className="block text-xs font-semibold text-gray-600 mb-1">{f.label[lang]}</label>
                            <select value={f.val} onChange={e => f.set(e.target.value)}
                              className="w-full h-10 px-3 border border-gray-200 rounded-xl text-sm text-gray-900 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none bg-white">
                              <option value="">{lang === 'fr' ? 'Sélectionner...' : 'اختر...'}</option>
                              {WILAYAS.filter(w => w !== f.exclude).map(w => <option key={w} value={w}>{w}</option>)}
                            </select>
                          </div>
                        ))}
                        {trajetDepart && trajetDest && (
                          <div className="flex items-center justify-center py-2 px-4 bg-amber-100 rounded-xl">
                            <span className="font-bold text-sm text-amber-800">{trajetDepart} ⇄ {trajetDest}</span>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Maurigo form */}
                  {enableType === 'maurigo' && (
                    <>
                      <p className="text-sm font-semibold text-gray-800">
                        {lang === 'fr' ? 'Votre wilaya & véhicule' : 'ولايتك ومركبتك'}
                      </p>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">
                            {lang === 'fr' ? 'Wilaya *' : 'الولاية *'}
                          </label>
                          <select value={wilaya} onChange={e => setWilaya(e.target.value)}
                            className="w-full h-10 px-3 border border-gray-200 rounded-xl text-sm text-gray-900 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none bg-white">
                            <option value="">{lang === 'fr' ? 'Sélectionner votre wilaya...' : 'اختر ولايتك...'}</option>
                            {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">
                            {lang === 'fr' ? 'Plaque d\'immatriculation' : 'رقم اللوحة'}
                          </label>
                          <input type="text" value={plate} onChange={e => setPlate(e.target.value.toUpperCase())}
                            placeholder={lang === 'fr' ? 'Ex: 12345 A NKT' : 'مثال: 12345 أ نكط'}
                            className="w-full h-10 px-3 border border-gray-200 rounded-xl text-sm text-gray-900 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none tracking-widest uppercase" />
                        </div>
                        <div className="flex items-start gap-2 px-3 py-2.5 bg-amber-100/80 rounded-xl">
                          <span className="text-amber-600 mt-0.5 shrink-0">📱</span>
                          <p className="text-xs text-amber-800">
                            {lang === 'fr'
                              ? 'Photo du véhicule, permis et selfie à ajouter depuis l\'app mobile pour finaliser la vérification.'
                              : 'صورة المركبة والرخصة والصورة الشخصية تضاف من التطبيق المحمول لإتمام المراجعة.'}
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {transportErr && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle size={12} /> {transportErr}
                    </p>
                  )}

                  {/* Form actions */}
                  <div className="flex gap-2">
                    <button onClick={cancelEnable}
                      className="flex-1 h-9 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                      {lang === 'fr' ? 'Annuler' : 'إلغاء'}
                    </button>
                    <button onClick={enableTransport} disabled={transportLoading}
                      className="flex-1 h-9 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60"
                      style={{ background: '#F8AC12', color: '#0D0D0D' }}>
                      {transportLoading ? <Spinner /> : <Check size={13} strokeWidth={3} />}
                      {lang === 'fr' ? 'Activer' : 'تفعيل'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <p className="text-[11px] text-gray-400 mt-3">
            {lang === 'fr'
              ? 'Livreur, Long Voyage et Car Rapide sont mutuellement exclusifs — un seul à la fois.'
              : 'الموصّل والسفر الطويل والكار رابيد حصرية — واحد فقط في نفس الوقت.'}
          </p>
        </div>
      </div>
    </div>
  )
}
