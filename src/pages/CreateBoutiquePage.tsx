import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Image as ImgIcon, Store, ArrowLeft } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { type Lang } from '../constants/i18n'
import { LOCATION_GROUPS } from '../constants/mauritaniaCities'

interface Props { lang: Lang }

const BOUTIQUE_TYPES = [
  { key: 'arrivage',      fr: 'Arrivage',      ar: 'بضاعة وافدة'   },
  { key: 'supermarche',   fr: 'Supermarché',   ar: 'سوبرماركت'     },
  { key: 'electronique',  fr: 'Électronique',  ar: 'إلكترونيات'    },
  { key: 'quincaillerie', fr: 'Quincaillerie', ar: 'أدوات'          },
  { key: 'parc_auto',     fr: 'Parc Auto',     ar: 'معرض سيارات'   },
  { key: 'restaurant',    fr: 'Restaurant',    ar: 'مطعم'         },
  { key: 'autre',         fr: 'Autre',         ar: 'أخرى'         },
]

export default function CreateBoutiquePage({ lang }: Props) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isRtl = lang === 'ar'
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name: '', description: '', boutique_type: 'autre',
    ville: '', phone_number: '', whatsap_number: '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview,   setPreview]   = useState<string | null>(null)
  const [loading,   setLoading]   = useState(false)
  const [err,       setErr]       = useState('')

  if (!user) { navigate('/connexion'); return null }

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }))

  const pickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setImageFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setErr(lang === 'fr' ? 'Le nom est requis.' : 'الاسم مطلوب.'); return }
    setErr(''); setLoading(true)
    try {
      const res = await api.post('/boutiques/', {
        name:          form.name.trim(),
        description:   form.description.trim(),
        boutique_type: form.boutique_type,
        ville:         form.ville,
        phone_number:  form.phone_number.trim(),
        whatsap_number:form.whatsap_number.trim(),
      })
      const boutique = res.data

      if (imageFile) {
        const fd = new FormData()
        fd.append('image', imageFile)
        try {
          await api.post(`/boutiques/${boutique.slug}/image/`, fd)
        } catch (imgErr: any) {
          const detail = imgErr?.response?.data?.detail
          if (detail) {
            setErr(detail)
            setLoading(false)
            return
          }
        }
      }

      navigate('/compte')
    } catch (e: any) {
      const detail = e.response?.data?.detail ?? e.response?.data?.name?.[0]
      setErr(detail ?? (lang === 'fr' ? 'Erreur lors de la création.' : 'خطأ في الإنشاء.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f7f5] pt-[152px] sm:pt-[100px]" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600">
            <ArrowLeft size={16} className={isRtl ? 'rotate-180' : ''} />
          </button>
          <div>
            <h1 className="font-bold text-xl text-gray-900">
              {lang === 'fr' ? 'Créer ma boutique' : 'إنشاء متجري'}
            </h1>
            <p className="text-sm text-gray-500">
              {lang === 'fr' ? 'Remplissez les informations de votre boutique' : 'أكمل معلومات متجرك'}
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-5">

          {/* Image */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              {lang === 'fr' ? 'Photo de la boutique' : 'صورة المتجر'}
            </label>
            <button type="button" onClick={() => fileRef.current?.click()}
              className="w-full h-40 rounded-xl border-2 border-dashed border-gray-200 hover:border-amber-400 transition-colors flex flex-col items-center justify-center gap-2 bg-gray-50 hover:bg-amber-50 relative overflow-hidden">
              {preview
                ? <img src={preview} className="absolute inset-0 w-full h-full object-cover rounded-xl" alt="preview" />
                : <>
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                      <ImgIcon size={22} className="text-gray-400" />
                    </div>
                    <span className="text-sm text-gray-400 font-medium">
                      {lang === 'fr' ? 'Cliquer pour ajouter une photo' : 'انقر لإضافة صورة'}
                    </span>
                  </>}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickImage} />
          </div>

          {/* Basic info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Store size={15} className="text-amber-500" />
              {lang === 'fr' ? 'Informations générales' : 'المعلومات العامة'}
            </h2>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                {lang === 'fr' ? 'Nom de la boutique *' : 'اسم المتجر *'}
              </label>
              <input
                type="text" required value={form.name} onChange={e => set('name', e.target.value)}
                placeholder={lang === 'fr' ? 'Ex: Boutique Al Amine' : 'مثال: محل الأمين'}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                {lang === 'fr' ? 'Type de boutique' : 'نوع المتجر'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {BOUTIQUE_TYPES.map(t => (
                  <button key={t.key} type="button" onClick={() => set('boutique_type', t.key)}
                    className={`py-2 px-3 rounded-xl border text-sm font-medium transition-all ${
                      form.boutique_type === t.key
                        ? 'border-amber-400 bg-amber-50 text-amber-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    }`}>
                    {lang === 'fr' ? t.fr : t.ar}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                {lang === 'fr' ? 'Ville' : 'المدينة'}
              </label>
              <select value={form.ville} onChange={e => set('ville', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all bg-white">
                <option value="">{lang === 'fr' ? '— Choisir une ville / quartier —' : '— اختر مدينة / حي —'}</option>
                {LOCATION_GROUPS.map(group => (
                  <optgroup key={group.groupLabel} label={group.groupLabel}>
                    {group.locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                  </optgroup>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                {lang === 'fr' ? 'Description' : 'الوصف'}
              </label>
              <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)}
                placeholder={lang === 'fr' ? 'Décrivez votre boutique...' : 'صف متجرك...'}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all resize-none" />
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h2 className="font-semibold text-gray-900">
              {lang === 'fr' ? 'Contact' : 'التواصل'}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  {lang === 'fr' ? 'Téléphone' : 'الهاتف'}
                </label>
                <input type="tel" value={form.phone_number} onChange={e => set('phone_number', e.target.value)}
                  placeholder="+222 XX XX XX XX"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  WhatsApp
                </label>
                <input type="tel" value={form.whatsap_number} onChange={e => set('whatsap_number', e.target.value)}
                  placeholder="+222 XX XX XX XX"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all" />
              </div>
            </div>
          </div>

          {err && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              {err}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#F8AC12] text-gray-900 font-bold text-sm hover:bg-amber-400 transition-colors disabled:opacity-60 shadow-sm">
            {loading
              ? (lang === 'fr' ? 'Création en cours...' : 'جار الإنشاء...')
              : (lang === 'fr' ? 'Créer ma boutique' : 'إنشاء متجري')}
          </button>
        </form>
      </div>
    </div>
  )
}
