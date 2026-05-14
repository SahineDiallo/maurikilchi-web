import { useState, useEffect, useMemo, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSeo } from '../hooks/useSeo'
import {
  ArrowLeft, MapPin, Search, X,
  Share2, CheckCircle2, Phone, Plus, Trash2, Edit2, Image as ImgIcon,
} from 'lucide-react'
import { type Lang } from '../constants/i18n'
import { api, cachedGet, bustCache, type Boutique, type Product } from '../lib/api'
import ProductCard from '../components/ProductCard'
import { useAuth } from '../contexts/AuthContext'
import ProductModal, { type Category as MgmtCategory } from '../components/ProductModal'

// ─── Constants ────────────────────────────────────────────────────────────────
const TYPE_EMOJI: Record<string, string> = {
  restaurant: '🍽️', arrivage: '📦', supermarche: '🛒',
  electronique: '📱', quincaillerie: '🔩', autre: '🏪',
}
const TYPE_GRADIENT: Record<string, string> = {
  restaurant:    'linear-gradient(135deg, #3d0f00 0%, #1a0800 60%, #0e0000 100%)',
  arrivage:      'linear-gradient(135deg, #0a1628 0%, #0d1f3c 60%, #0a1628 100%)',
  supermarche:   'linear-gradient(135deg, #003d1a 0%, #001f0d 60%, #002914 100%)',
  electronique:  'linear-gradient(135deg, #0a0a1a 0%, #12122a 60%, #0d0d1e 100%)',
  quincaillerie: 'linear-gradient(135deg, #1a1200 0%, #0e0a00 60%, #1a1200 100%)',
  autre:         'linear-gradient(135deg, #0e0e0e 0%, #1a1000 60%, #0e0e0e 100%)',
}

function WaIcon({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

// ─── Edit product modal ───────────────────────────────────────────────────────
function EditProductModal({ product, categories, lang, onClose, onUpdated }: {
  product: Product; categories: MgmtCategory[]; lang: Lang
  onClose: () => void; onUpdated: (p: Product) => void
}) {
  const isRtl = lang === 'ar'
  const [title,     setTitle]     = useState(product.title)
  const [price,     setPrice]     = useState(product.price)
  const [stock,     setStock]     = useState(String(product.stock_quantity ?? ''))
  const [available, setAvailable] = useState(product.is_available !== false)
  const [catId,     setCatId]     = useState(String(product.category ?? ''))
  const [desc,      setDesc]      = useState((product.description ?? '').replace(/<[^>]+>/g, '').trim())
  const [loading,   setLoading]   = useState(false)
  const [err,       setErr]       = useState('')
  const imgRef = useRef<HTMLInputElement>(null)

  type Img = { id: number; image_url: string; is_primary: boolean }
  const [images,        setImages]        = useState<Img[]>(product.images as Img[] ?? [])
  const [deletingImgId, setDeletingImgId] = useState<number | null>(null)
  const [addingImg,     setAddingImg]     = useState(false)
  const [imgErr,        setImgErr]        = useState('')

  const deleteImg = async (id: number) => {
    setDeletingImgId(id)
    try {
      await api.delete(`/products/${product.id}/images/${id}/`)
      setImages(prev => prev.filter(i => i.id !== id))
    } catch { }
    setDeletingImgId(null)
  }

  const pickImg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return
    e.target.value = ''; setImgErr(''); setAddingImg(true)
    try {
      const fd = new FormData(); fd.append('image', f)
      try { await api.post('/moderation/check/', fd) }
      catch (e: any) {
        if (e.response?.data?.person_detected) {
          setImgErr(lang === 'fr' ? 'Image refusée : personne détectée.' : 'صورة مرفوضة: تم اكتشاف شخص.')
          setAddingImg(false); return
        }
      }
      const fd2 = new FormData(); fd2.append('image', f)
      fd2.append('is_primary', images.length === 0 ? 'true' : 'false')
      const r = await api.post(`/products/${product.id}/images/`, fd2)
      setImages(prev => [...prev, { id: r.data.id, image_url: r.data.image_url, is_primary: r.data.is_primary }])
    } catch { setImgErr(lang === 'fr' ? 'Erreur de téléchargement.' : 'خطأ في الرفع.') }
    setAddingImg(false)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !price.trim()) { setErr(lang === 'fr' ? 'Titre et prix requis.' : 'العنوان والسعر مطلوبان.'); return }
    setLoading(true); setErr('')
    try {
      const body: Record<string, unknown> = { title: title.trim(), price: price.trim(), is_available: available }
      if (stock) body.stock_quantity = Number(stock)
      if (desc.trim()) body.description = desc.trim()
      if (catId) body.category = Number(catId)
      const r = await api.patch(`/products/${product.slug}/`, body)
      onUpdated({ ...product, ...r.data, images })
      onClose()
    } catch (e: any) {
      setErr(e.response?.data?.detail ?? (lang === 'fr' ? 'Erreur.' : 'خطأ.'))
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div dir={isRtl ? 'rtl' : 'ltr'} className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="font-bold text-gray-900">{lang === 'fr' ? 'Modifier le produit' : 'تعديل المنتج'}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"><X size={15} /></button>
        </div>
        <form onSubmit={submit} className="px-6 py-5 space-y-4">

          {/* Images */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{lang === 'fr' ? 'Images' : 'الصور'}</label>
            <div className="flex gap-2 flex-wrap">
              {images.map(img => (
                <div key={img.id} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 shrink-0">
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                  {img.is_primary && (
                    <span className="absolute bottom-0 left-0 right-0 text-center text-[8px] font-bold bg-amber-400/90 text-gray-900 py-0.5">
                      {lang === 'fr' ? 'Principale' : 'رئيسية'}
                    </span>
                  )}
                  <button type="button" onClick={() => deleteImg(img.id)} disabled={deletingImgId === img.id}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors disabled:opacity-50">
                    {deletingImgId === img.id
                      ? <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                      : <X size={10} color="white" />}
                  </button>
                </div>
              ))}
              {images.length < 4 && (
                <button type="button" onClick={() => !addingImg && imgRef.current?.click()} disabled={addingImg}
                  className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 hover:border-amber-400 bg-gray-50 hover:bg-amber-50 flex flex-col items-center justify-center gap-1 transition-colors disabled:opacity-60 shrink-0">
                  {addingImg ? <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                    : <><Plus size={16} className="text-gray-400" /><span className="text-[10px] text-gray-400">{lang === 'fr' ? 'Ajouter' : 'إضافة'}</span></>}
                </button>
              )}
            </div>
            <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={pickImg} />
            {imgErr && <p className="text-xs text-red-500 mt-1">{imgErr}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{lang === 'fr' ? 'Titre *' : 'العنوان *'}</label>
            <input type="text" required value={title} onChange={e => setTitle(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{lang === 'fr' ? 'Prix (MRU) *' : 'السعر *'}</label>
              <input type="number" required min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{lang === 'fr' ? 'Stock' : 'المخزون'}</label>
              <input type="number" min="0" value={stock} onChange={e => setStock(e.target.value)}
                placeholder={lang === 'fr' ? 'Illimité' : 'غير محدود'}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all" />
            </div>
          </div>
          {categories.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{lang === 'fr' ? 'Catégorie' : 'الفئة'}</label>
              <select value={catId} onChange={e => setCatId(e.target.value)}
                className="w-full h-10 px-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-amber-400 bg-white">
                <option value="">{lang === 'fr' ? '— Aucune —' : '— بدون —'}</option>
                {categories.map(cat => (
                  <optgroup key={cat.id} label={`${cat.icon} ${cat.name}`}>
                    {cat.subcategories.map(sub => (
                      <option key={sub.id} value={String(sub.id)}>{sub.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{lang === 'fr' ? 'Description' : 'الوصف'}</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={4}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all resize-none" />
          </div>
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
            <span className="text-sm font-medium text-gray-700">{lang === 'fr' ? 'Disponible à la vente' : 'متاح للبيع'}</span>
            <button type="button" onClick={() => setAvailable(v => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors ${available ? 'bg-amber-400' : 'bg-gray-200'}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${available ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
          {err && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{err}</p>}
          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              {lang === 'fr' ? 'Annuler' : 'إلغاء'}
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 rounded-xl bg-[#F8AC12] text-gray-900 font-bold text-sm hover:bg-amber-400 transition-colors disabled:opacity-60">
              {loading ? '…' : (lang === 'fr' ? 'Enregistrer' : 'حفظ')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Edit boutique modal ──────────────────────────────────────────────────────
function EditBoutiqueModal({
  boutique, lang, onClose, onUpdated,
}: {
  boutique: Boutique
  lang: Lang
  onClose: () => void
  onUpdated: (b: Boutique) => void
}) {
  const isRtl = lang === 'ar'
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name:          boutique.name,
    description:   boutique.description,
    phone_number:  boutique.phone_number,
    whatsap_number: boutique.whatsap_number,
  })
  const [imageFile,  setImageFile]  = useState<File | null>(null)
  const [preview,    setPreview]    = useState<string | null>(boutique.image_url)
  const [loading,    setLoading]    = useState(false)
  const [err,        setErr]        = useState('')

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }))

  const pickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return
    e.target.value = ''
    setImageFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setErr(lang === 'fr' ? 'Le nom est requis.' : 'الاسم مطلوب.'); return }
    setErr(''); setLoading(true)
    try {
      const res = await api.patch(`/boutiques/${boutique.slug}/`, {
        name:           form.name.trim(),
        description:    form.description.trim(),
        phone_number:   form.phone_number.trim(),
        whatsap_number: form.whatsap_number.trim(),
      })
      let updated: Boutique = res.data

      if (imageFile) {
        const fd = new FormData()
        fd.append('image', imageFile)
        try {
          const imgRes = await api.post(`/boutiques/${boutique.slug}/image/`, fd)
          updated = { ...updated, image_url: imgRes.data.image_url }
        } catch (imgErr: any) {
          const detail = imgErr?.response?.data?.detail
          if (detail) { setErr(detail); setLoading(false); return }
        }
      }

      bustCache(`/boutiques/${boutique.slug}/`)
      onUpdated(updated)
      onClose()
    } catch (e: any) {
      setErr(e.response?.data?.detail ?? (lang === 'fr' ? 'Erreur lors de la mise à jour.' : 'خطأ في التحديث.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div dir={isRtl ? 'rtl' : 'ltr'} className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="font-bold text-gray-900">{lang === 'fr' ? 'Modifier la boutique' : 'تعديل المتجر'}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <X size={15} />
          </button>
        </div>

        <form onSubmit={submit} className="px-6 py-5 space-y-4">

          {/* Image */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {lang === 'fr' ? 'Photo de la boutique' : 'صورة المتجر'}
            </label>
            <button type="button" onClick={() => fileRef.current?.click()}
              className="w-full h-36 rounded-xl border-2 border-dashed border-gray-200 hover:border-amber-400 bg-gray-50 hover:bg-amber-50 flex flex-col items-center justify-center gap-2 relative overflow-hidden transition-colors">
              {preview
                ? <img src={preview} className="absolute inset-0 w-full h-full object-cover rounded-xl" alt="" />
                : <><ImgIcon size={24} className="text-gray-300" />
                    <span className="text-xs text-gray-400">{lang === 'fr' ? 'Changer la photo' : 'تغيير الصورة'}</span></>}
              {preview && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-xl">
                  <span className="text-white text-xs font-semibold">{lang === 'fr' ? 'Changer' : 'تغيير'}</span>
                </div>
              )}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickImage} />
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              {lang === 'fr' ? 'Nom *' : 'الاسم *'}
            </label>
            <input type="text" required value={form.name} onChange={e => set('name', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all" />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              {lang === 'fr' ? 'Description' : 'الوصف'}
            </label>
            <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all resize-none" />
          </div>

          {/* Phone + WhatsApp */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                {lang === 'fr' ? 'Téléphone' : 'هاتف'}
              </label>
              <input type="tel" value={form.phone_number} onChange={e => set('phone_number', e.target.value)}
                placeholder="+222..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                WhatsApp
              </label>
              <input type="tel" value={form.whatsap_number} onChange={e => set('whatsap_number', e.target.value)}
                placeholder="+222..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all" />
            </div>
          </div>

          {err && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{err}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl bg-[#F8AC12] text-gray-900 font-bold text-sm hover:bg-amber-400 transition-colors disabled:opacity-60">
            {loading
              ? <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-gray-900/20 border-t-gray-900/70 rounded-full animate-spin" />
                  {lang === 'fr' ? 'Enregistrement…' : 'جارٍ الحفظ…'}
                </span>
              : (lang === 'fr' ? 'Enregistrer les modifications' : 'حفظ التغييرات')}
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="pt-[152px] sm:pt-[100px] min-h-screen bg-[#f8f8f8]">
      <div className="h-72 bg-gray-200 animate-pulse" />
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6">
        <div className="flex gap-6 items-start">
          <div className="hidden lg:block w-72 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 h-[480px] animate-pulse" />
          </div>
          <div className="flex-1 space-y-4">
            <div className="h-14 bg-white rounded-2xl animate-pulse" />
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-64 animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
interface Props { lang: Lang }

export default function BoutiquePage({ lang }: Props) {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const isRtl = lang === 'ar'
  const { user } = useAuth()

  const [boutique, setBoutique] = useState<Boutique | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Owner management state
  const [showModal,     setShowModal]     = useState(false)
  const [showEdit,      setShowEdit]      = useState(false)
  const [mgmtCats,      setMgmtCats]     = useState<MgmtCategory[]>([])
  const [deletingSlug,  setDeletingSlug]  = useState<string | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  useSeo({
    title      : boutique ? `${boutique.name} — Boutique en ligne Mauritanie` : 'Boutique en ligne — Maurikilchi',
    description: boutique
      ? `${boutique.name} sur Maurikilchi — ${boutique.description || 'Boutique en ligne mauritanienne'}. Livraison disponible à Nouakchott et en Mauritanie.`
      : 'Découvrez cette boutique sur Maurikilchi, la marketplace mauritanienne.',
    keywords   : boutique ? `${boutique.name}, boutique en ligne Mauritanie, ${boutique.ville}, Maurikilchi` : undefined,
    url        : `https://maurikilchi.com/boutique/${slug}`,
    image      : boutique?.image_url ?? undefined,
    type       : 'website',
    schema     : boutique ? {
      '@context'  : 'https://schema.org',
      '@type'     : 'Store',
      name        : boutique.name,
      description : boutique.description,
      image       : boutique.image_url ?? undefined,
      url         : `https://maurikilchi.com/boutique/${slug}`,
      address     : { '@type': 'PostalAddress', addressLocality: boutique.ville, addressCountry: 'MR' },
    } : undefined,
  })
  const [loadingMore, setLoadingMore] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [nextUrl, setNextUrl] = useState<string | null>(null)
  const [activeCat, setActiveCat] = useState('__all__')
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setSearch(query), 280)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setNotFound(false)
    setBoutique(null)
    setProducts([])

    Promise.all([
      cachedGet<Boutique>(`/boutiques/${slug}/`),
      cachedGet<{ results?: Product[]; next?: string } | Product[]>('/products/', { boutique: slug, page_size: 24 }),
    ])
      .then(([b, data]) => {
        setBoutique(b)
        const results: Product[] = Array.isArray(data) ? data : (data?.results ?? [])
        setProducts(results)
        setNextUrl(Array.isArray(data) ? null : ((data as any)?.next ?? null))
      })
      .catch(err => { if ((err as any)?.response?.status === 404) setNotFound(true) })
      .finally(() => setLoading(false))
  }, [slug])

  const loadMore = () => {
    if (!nextUrl || loadingMore) return
    setLoadingMore(true)
    api.get(nextUrl)
      .then(res => {
        const data = res.data
        const results: Product[] = Array.isArray(data) ? data : (data?.results ?? [])
        setProducts(prev => [...prev, ...results])
        setNextUrl(Array.isArray(data) ? null : (data?.next ?? null))
      })
      .catch(() => {})
      .finally(() => setLoadingMore(false))
  }

  const isOwner = !!user && !!boutique && String(boutique.owner.id) === String(user.id)

  // Fetch categories once we know the user is the owner
  useEffect(() => {
    if (!isOwner) return
    api.get('/categories/').then(r => {
      setMgmtCats(r.data?.results ?? r.data ?? [])
    }).catch(() => {})
  }, [isOwner])

  const deleteProduct = async (productSlug: string) => {
    setDeletingSlug(productSlug)
    try {
      await api.delete(`/products/${productSlug}/`)
      setProducts(prev => prev.filter(p => p.slug !== productSlug))
      bustCache('/products/')
    } catch { } finally { setDeletingSlug(null) }
  }

  const shareUrl = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    })
  }

  const cats = useMemo(() => {
    const names = products.map(p => p.category_name).filter(Boolean) as string[]
    return Array.from(new Set(names))
  }, [products])

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchCat = activeCat === '__all__' || p.category_name === activeCat
      const matchSearch = !search.trim() || p.title.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
  }, [products, activeCat, search])

  if (loading) return <Skeleton />

  if (notFound || !boutique) {
    return (
      <div className="pt-[152px] sm:pt-[100px] min-h-screen bg-white flex flex-col items-center justify-center gap-4 text-center px-4">
        <span className="text-7xl select-none">🏪</span>
        <h1 className="text-xl font-bold text-gray-900">
          {lang === 'fr' ? 'Boutique introuvable' : 'المتجر غير موجود'}
        </h1>
        <p className="text-sm text-gray-400 max-w-xs">
          {lang === 'fr' ? "Cette boutique n'existe plus ou a été retirée." : 'هذا المتجر لم يعد متاحاً.'}
        </p>
        <button onClick={() => navigate('/')}
          className="mt-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all hover:opacity-90"
          style={{ background: '#F8AC12', color: '#0D0D0D' }}>
          {lang === 'fr' ? "← Retour à l'accueil" : '← العودة للرئيسية'}
        </button>
      </div>
    )
  }

  const heroImg = boutique.image_url
  const emoji = TYPE_EMOJI[boutique.boutique_type] ?? '🏪'
  const gradient = TYPE_GRADIENT[boutique.boutique_type] ?? TYPE_GRADIENT.autre
  const typeLabel = boutique.boutique_type_display ?? boutique.boutique_type
  const available = products.filter(p => p.is_available !== false).length
  const hasWhatsApp = !!boutique.whatsap_number
  const hasPhone = !!boutique.phone_number
  const waNumber = boutique.whatsap_number?.replace(/\D/g, '') ?? ''
  const waMsg = encodeURIComponent(
    lang === 'fr'
      ? `Bonjour, je suis intéressé par votre boutique "${boutique.name}".`
      : `مرحباً، أنا مهتم بمتجر "${boutique.name}".`
  )

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="pt-[152px] sm:pt-[100px] min-h-screen bg-[#f8f8f8]">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative h-56 md:h-80 overflow-hidden bg-gray-900">
        {heroImg ? (
          <>
            <img src={heroImg} alt={boutique.name}
              className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.30) 50%, rgba(0,0,0,0.45) 100%)' }} />
          </>
        ) : (
          <>
            <div className="absolute inset-0" style={{ background: gradient }} />
            <div className="absolute inset-0 flex items-center justify-center text-[200px] opacity-[0.08] select-none pointer-events-none">
              {emoji}
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-56 rounded-full pointer-events-none"
              style={{ background: 'rgba(255,228,77,0.10)', filter: 'blur(50px)' }} />
            <div className="absolute inset-x-0 bottom-0 h-40 pointer-events-none"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)' }} />
          </>
        )}

        {/* Action bar */}
        <div className="absolute top-0 inset-x-0 flex items-center justify-between px-4 md:px-8 pt-4 z-10">
          <button onClick={() => navigate(-1)}
            className="flex items-center justify-center w-9 h-9 rounded-xl border border-white/15 text-white transition-all hover:bg-white/20"
            style={{ background: 'rgba(0,0,0,0.40)', backdropFilter: 'blur(8px)' }}>
            <ArrowLeft size={18} />
          </button>
          <button onClick={shareUrl}
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-white/15 text-white text-xs font-medium transition-all hover:bg-white/20"
            style={{ background: 'rgba(0,0,0,0.40)', backdropFilter: 'blur(8px)' }}>
            {copied ? <CheckCircle2 size={13} className="text-green-400" /> : <Share2 size={13} />}
            {copied ? (lang === 'fr' ? 'Copié !' : 'تم!') : (lang === 'fr' ? 'Partager' : 'مشاركة')}
          </button>
        </div>

        {/* Identity pinned to bottom */}
        <div className="absolute bottom-0 inset-x-0 px-4 md:px-8 pb-6 z-10">
          <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md mb-3"
            style={{ background: '#F8AC12', color: '#0D0D0D' }}>
            {emoji} {typeLabel}
          </span>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-white leading-tight mb-2">
            {boutique.name}
          </h1>
          {boutique.ville && (
            <p className="flex items-center gap-1.5 text-sm text-white/70">
              <MapPin size={13} />
              {boutique.ville}
            </p>
          )}
        </div>
      </div>

      {/* ── Two-column layout ─────────────────────────────────────────────── */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6">
        <div className="flex gap-6 items-start">

          {/* ── Left sidebar — store info card (desktop only) ── */}
          <aside className="hidden lg:block w-72 xl:w-80 shrink-0 sticky top-[108px] self-start space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                {/* Thumbnail */}
                {heroImg ? (
                  <div className="h-48 overflow-hidden">
                    <img src={heroImg} alt={boutique.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="h-36 flex items-center justify-center text-7xl select-none"
                    style={{ background: gradient }}>
                    {emoji}
                  </div>
                )}

                <div className="p-5">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full mb-3"
                    style={{ background: '#FFF8E7', color: '#C98A00' }}>
                    {emoji} {typeLabel}
                  </span>

                  <h2 className="text-xl font-bold text-gray-900 leading-tight mb-1">
                    {boutique.name}
                  </h2>

                  {boutique.ville && (
                    <p className="flex items-center gap-1.5 text-sm text-gray-400 mb-4">
                      <MapPin size={12} />
                      {boutique.ville}
                    </p>
                  )}

                  {boutique.description && (
                    <p className="text-sm text-gray-500 leading-relaxed mb-5 line-clamp-5">
                      {boutique.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {lang === 'fr' ? 'Produits' : 'منتجات'}
                      </p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-amber-600">{available}</p>
                      <p className="text-xs text-amber-400 mt-0.5">
                        {lang === 'fr' ? 'En stock' : 'في المخزن'}
                      </p>
                    </div>
                  </div>

                  {/* CTAs */}
                  <div className="space-y-2.5">
                    {hasWhatsApp && (
                      <a href={`https://wa.me/${waNumber}?text=${waMsg}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full h-12 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90"
                        style={{ background: '#25D366', boxShadow: '0 4px 14px rgba(37,211,102,0.25)' }}>
                        <WaIcon size={17} />
                        WhatsApp
                      </a>
                    )}
                    {hasPhone && (
                      <a href={`tel:${boutique.phone_number}`}
                        className="flex items-center justify-center gap-2 w-full h-12 rounded-xl font-bold text-sm transition-all hover:opacity-90"
                        style={{ background: '#F8AC12', color: '#0D0D0D', boxShadow: '0 4px 14px rgba(248,172,18,0.25)' }}>
                        <Phone size={15} />
                        {lang === 'fr' ? 'Appeler' : 'اتصال'}
                      </a>
                    )}
                  </div>
                </div>
              </div>
          </aside>

          {/* ── Main content (right) ── */}
          <main className="flex-1 min-w-0">

            {/* Mobile: compact info + CTAs */}
            <div className="lg:hidden bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
              {boutique.description && (
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-3">
                  {boutique.description}
                </p>
              )}
              <div className="flex items-center gap-4 mb-3">
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{products.length}</p>
                  <p className="text-[10px] text-gray-400">{lang === 'fr' ? 'Produits' : 'منتجات'}</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-amber-600">{available}</p>
                  <p className="text-[10px] text-amber-400">{lang === 'fr' ? 'En stock' : 'في المخزن'}</p>
                </div>
              </div>
              {(hasWhatsApp || hasPhone) && (
                <div className="flex gap-2">
                  {hasWhatsApp && (
                    <a href={`https://wa.me/${waNumber}?text=${waMsg}`} target="_blank" rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl text-white text-sm font-bold"
                      style={{ background: '#25D366' }}>
                      <WaIcon size={14} /> WhatsApp
                    </a>
                  )}
                  {hasPhone && (
                    <a href={`tel:${boutique.phone_number}`}
                      className={`flex items-center justify-center gap-1.5 h-10 rounded-xl text-sm font-bold ${hasWhatsApp ? 'px-5' : 'flex-1'}`}
                      style={{ background: '#F8AC12', color: '#0D0D0D' }}>
                      <Phone size={14} />
                      {!hasWhatsApp && (lang === 'fr' ? 'Appeler' : 'اتصال')}
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Owner management bar */}
            {isOwner && (
              <div className="flex items-center gap-2 mb-4">
                  <button
                    onClick={() => setShowEdit(true)}
                    className="flex items-center gap-1.5 border border-gray-200 text-gray-700 font-bold text-xs px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <Edit2 size={12} /> {lang === 'fr' ? 'Modifier' : 'تعديل'}
                  </button>
                  <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-1.5 bg-[#F8AC12] text-gray-900 font-bold text-xs px-3 py-2 rounded-xl hover:bg-amber-400 transition-colors"
                  >
                    <Plus size={13} /> {lang === 'fr' ? 'Ajouter un produit' : 'إضافة منتج'}
                  </button>
              </div>
            )}

            {/* Sticky search + category tabs */}
            <div className="sticky top-[100px] z-20 bg-white rounded-2xl border border-gray-100 shadow-sm mb-5 overflow-hidden">
              <div className="px-4 pt-3 pb-0">
                <div className="relative">
                  <Search size={14}
                    className={`absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none ${isRtl ? 'right-3' : 'left-3'}`} />
                  <input
                    ref={searchRef}
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder={lang === 'fr' ? 'Rechercher dans cette boutique…' : 'ابحث في هذا المتجر...'}
                    className={`w-full h-10 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:border-amber-300 focus:outline-none transition-colors ${isRtl ? 'pr-9 pl-8' : 'pl-9 pr-8'}`}
                  />
                  {query && (
                    <button onClick={() => setQuery('')}
                      className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 ${isRtl ? 'left-3' : 'right-3'}`}>
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>

              {cats.length > 0 && (
                <div className="flex overflow-x-auto px-4 mt-1" style={{ scrollbarWidth: 'none' }}>
                  {[
                    { key: '__all__', label: lang === 'fr' ? 'Tous' : 'الكل' },
                    ...cats.map(c => ({ key: c, label: c })),
                  ].map(tab => (
                    <button key={tab.key}
                      onClick={() => setActiveCat(tab.key)}
                      className="relative px-4 py-3 text-sm whitespace-nowrap shrink-0 transition-colors"
                      style={{
                        color: activeCat === tab.key ? '#0D0D0D' : '#9CA3AF',
                        fontWeight: activeCat === tab.key ? 700 : 400,
                      }}>
                      {tab.label}
                      {activeCat === tab.key && (
                        <span className="absolute bottom-0 left-4 right-4 h-[2.5px] rounded-full"
                          style={{ background: '#F8AC12' }} />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Count label */}
            {filtered.length > 0 && (
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  {activeCat === '__all__'
                    ? (lang === 'fr' ? 'Tous les produits' : 'جميع المنتجات')
                    : activeCat}
                </h2>
                <span className="text-xs text-gray-400">
                  {filtered.length} {lang === 'fr' ? `produit${filtered.length > 1 ? 's' : ''}` : 'منتج'}
                </span>
              </div>
            )}

            {/* Product grid */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <span className="text-5xl mb-4 select-none">🔍</span>
                <p className="text-base font-semibold text-gray-700 mb-1">
                  {lang === 'fr' ? 'Aucun produit trouvé' : 'لم يُعثر على منتجات'}
                </p>
                <p className="text-sm text-gray-400">
                  {lang === 'fr' ? 'Essayez un autre terme de recherche.' : 'جرّب كلمة بحث أخرى.'}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 pb-6">
                  {filtered.map(p => (
                    <div key={p.id ?? p.slug} className="relative group/card">
                      <ProductCard item={p} />
                      {isOwner && (
                        <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover/card:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditingProduct(p)}
                            className="w-7 h-7 rounded-lg bg-white/90 border border-amber-200 flex items-center justify-center text-amber-600 hover:bg-amber-50 transition-all shadow-sm"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => deleteProduct(p.slug)}
                            disabled={deletingSlug === p.slug}
                            className="w-7 h-7 rounded-lg bg-white/90 border border-red-200 flex items-center justify-center text-red-500 hover:bg-red-50 transition-all shadow-sm disabled:opacity-50"
                          >
                            {deletingSlug === p.slug
                              ? <span className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                              : <Trash2 size={12} />}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {nextUrl && !search && activeCat === '__all__' && (
                  <div className="flex justify-center mt-4 mb-8">
                    <button onClick={loadMore} disabled={loadingMore}
                      className="px-10 py-3 rounded-full text-sm font-semibold border-2 transition-all disabled:opacity-40 hover:bg-amber-50"
                      style={{ borderColor: '#F8AC12', color: '#C98A00' }}>
                      {loadingMore
                        ? (lang === 'fr' ? 'Chargement…' : 'جار التحميل…')
                        : (lang === 'fr' ? 'Voir plus de produits' : 'عرض المزيد')}
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Product creation modal — owner only */}
      {isOwner && showModal && boutique && (
        <ProductModal
          boutiqueId={boutique.id}
          categories={mgmtCats}
          lang={lang}
          onClose={() => setShowModal(false)}
          onCreated={p => { bustCache('/products/'); setProducts(prev => [p as unknown as Product, ...prev]) }}
        />
      )}

      {/* Edit product modal — owner only */}
      {isOwner && editingProduct && (
        <EditProductModal
          product={editingProduct}
          categories={mgmtCats}
          lang={lang}
          onClose={() => setEditingProduct(null)}
          onUpdated={updated => {
            bustCache('/products/'); setProducts(prev => prev.map(p => p.slug === updated.slug ? updated : p))
            setEditingProduct(null)
          }}
        />
      )}

      {/* Edit boutique modal — owner only */}
      {isOwner && showEdit && boutique && (
        <EditBoutiqueModal
          boutique={boutique}
          lang={lang}
          onClose={() => setShowEdit(false)}
          onUpdated={updated => setBoutique(updated)}
        />
      )}
    </div>
  )
}
