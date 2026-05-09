import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LogOut, Plus, X, Edit2, Check, Package, Store, ChevronRight, ChevronDown, Image as ImgIcon, Trash2, Bold, Italic, List, ListOrdered } from 'lucide-react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { type Lang } from '../constants/i18n'

interface Props { lang: Lang }

const ROLE_LABEL: Record<string, { fr: string; ar: string }> = {
  vendeur:  { fr: 'Vendeur',   ar: 'بائع'    },
  livreur:  { fr: 'Livreur',   ar: 'موصّل'   },
  voyageur: { fr: 'Voyageur',  ar: 'مسافر'   },
  maurigo:  { fr: 'Car Rapide',ar: 'كار رابيد'},
}
const ROLE_EMOJI: Record<string, string> = {
  vendeur: '🏪', livreur: '🏍️', voyageur: '🚌', maurigo: '🚕',
}

interface SubCat   { id: number; name: string; icon: string }
interface Category { id: number; name: string; icon: string; subcategories: SubCat[] }
interface Boutique { id: number; slug: string; name: string; image_url: string | null; boutique_type: string; ville: string; description: string; phone_number: string }
interface Product  { id: number; slug: string; title: string; price: string; primary_image_url: string | null; is_available: boolean; stock_quantity: number | null; category_name: string }

// ─── Category picker (custom, grouped, accordion) ─────────────────────────────
// The API returns root categories each with a nested `subcategories` array.
// We never deal with a flat list — just iterate roots and their children directly.
function CategorySelect({
  categories, value, lang, onChange,
}: {
  categories: Category[]
  value: string
  lang: Lang
  onChange: (v: string) => void
}) {
  const [open,       setOpen]       = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  // Find the selected subcategory across all parent groups
  const selectedSub = categories
    .flatMap(c => c.subcategories)
    .find(s => String(s.id) === value)

  const handleOpen = () => {
    if (!open && value) {
      // Auto-expand the parent containing the selected sub
      const parent = categories.find(c => c.subcategories.some(s => String(s.id) === value))
      if (parent) setExpandedId(parent.id)
    }
    setOpen(o => !o)
  }

  const pick = (id: string) => { onChange(id); setOpen(false) }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden transition-all focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-100">
      {/* Trigger */}
      <button
        type="button"
        onClick={handleOpen}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-white hover:bg-gray-50 transition-colors text-sm"
      >
        <span className={selectedSub ? 'text-gray-900 font-medium' : 'text-gray-400'}>
          {selectedSub ? selectedSub.name : (lang === 'fr' ? '— Aucune catégorie —' : '— بدون فئة —')}
        </span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Expanded panel */}
      {open && (
        <div className="border-t border-gray-100 max-h-60 overflow-y-auto">
          {/* Clear */}
          <button
            type="button"
            onClick={() => pick('')}
            className={`w-full text-left px-4 py-2.5 text-sm border-b border-gray-100 transition-colors
              ${!value ? 'text-amber-700 bg-amber-50 font-medium' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            {lang === 'fr' ? '— Aucune catégorie —' : '— بدون فئة —'}
          </button>

          {categories.map(cat => {
            const isExpanded = expandedId === cat.id
            const hasActive  = cat.subcategories.some(s => String(s.id) === value)

            return (
              <div key={cat.id} className="border-b border-gray-50 last:border-0">
                {/* Parent row */}
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : cat.id)}
                  className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-gray-50
                    ${hasActive ? 'text-amber-700' : 'text-gray-800'}`}
                >
                  <span className="flex items-center gap-2">
                    {cat.icon && <span className="text-base leading-none">{cat.icon}</span>}
                    {cat.name}
                  </span>
                  <ChevronDown size={12} className={`text-gray-400 shrink-0 transition-transform duration-150 ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                {/* Subcategories */}
                {isExpanded && (
                  <div className="bg-gray-50/50 pb-1">
                    {cat.subcategories.length === 0 ? (
                      <p className="pl-8 py-2 text-xs text-gray-400 italic">
                        {lang === 'fr' ? 'Aucune sous-catégorie' : 'لا توجد فئات فرعية'}
                      </p>
                    ) : cat.subcategories.map(sub => (
                      <button
                        type="button"
                        key={sub.id}
                        onClick={() => pick(String(sub.id))}
                        className={`w-full text-left pl-8 pr-4 py-2 text-sm transition-colors
                          ${String(sub.id) === value
                            ? 'text-amber-700 font-semibold bg-amber-50'
                            : 'text-gray-600 hover:bg-amber-50/60 hover:text-gray-900'}`}
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Rich text toolbar button ──────────────────────────────────────────────────
function ToolBtn({ onClick, active, children }: { onClick: () => void; active?: boolean; children: React.ReactNode }) {
  return (
    <button type="button" onMouseDown={e => { e.preventDefault(); onClick() }}
      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors
        ${active ? 'bg-amber-100 text-amber-700' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'}`}>
      {children}
    </button>
  )
}

// ─── Product create modal ──────────────────────────────────────────────────────
function ProductModal({
  boutiqueId, categories, lang, onClose, onCreated,
}: {
  boutiqueId: number
  categories: Category[]
  lang: Lang
  onClose: () => void
  onCreated: (p: Product) => void
}) {
  const [form, setForm] = useState({ title: '', price: '', category: '', stock_quantity: '', is_available: true })

  // Main image
  const [imageFile,  setImageFile]  = useState<File | null>(null)
  const [preview,    setPreview]    = useState<string | null>(null)
  const [checking,   setChecking]   = useState(false)
  const [personErr,  setPersonErr]  = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  // Extra images (up to 3)
  const [extraFiles,    setExtraFiles]    = useState<File[]>([])
  const [extraPreviews, setExtraPreviews] = useState<string[]>([])
  const [checkingExtra, setCheckingExtra] = useState(false)
  const [extraPersonErr, setExtraPersonErr] = useState('')
  const extraFileRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(false)
  const [err,     setErr]     = useState('')

  const set = (k: keyof typeof form, v: string | boolean) => setForm(f => ({ ...f, [k]: v }))

  // Rich text editor
  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    editorProps: {
      attributes: { class: 'min-h-[96px] px-4 py-3 text-sm text-gray-800 outline-none' },
    },
  })

  // ── Image moderation helper ──────────────────────────────────────────────
  const moderateFile = async (f: File): Promise<'ok' | 'person' | 'error'> => {
    try {
      const fd = new FormData()
      fd.append('image', f)
      await api.post('/moderation/check/', fd)
      return 'ok'
    } catch (e: any) {
      return e?.response?.data?.person_detected ? 'person' : 'error'
    }
  }

  const pickMain = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return
    e.target.value = ''; setPersonErr(''); setChecking(true)
    const result = await moderateFile(f)
    setChecking(false)
    if (result === 'person') {
      setPersonErr(lang === 'fr' ? 'Cette image contient une personne et ne peut pas être utilisée.' : 'تحتوي هذه الصورة على شخص ولا يمكن استخدامها.')
    } else {
      setImageFile(f); setPreview(URL.createObjectURL(f))
    }
  }

  const pickExtra = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return
    e.target.value = ''; setExtraPersonErr(''); setCheckingExtra(true)
    const result = await moderateFile(f)
    setCheckingExtra(false)
    if (result === 'person') {
      setExtraPersonErr(lang === 'fr' ? 'Image refusée : personne détectée.' : 'صورة مرفوضة: تم اكتشاف شخص.')
    } else {
      setExtraFiles(prev => [...prev, f])
      setExtraPreviews(prev => [...prev, URL.createObjectURL(f)])
    }
  }

  const removeExtra = (i: number) => {
    setExtraFiles(prev => prev.filter((_, idx) => idx !== i))
    setExtraPreviews(prev => prev.filter((_, idx) => idx !== i))
  }

  // ── Submit ───────────────────────────────────────────────────────────────
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.price.trim()) { setErr(lang === 'fr' ? 'Titre et prix requis.' : 'العنوان والسعر مطلوبان.'); return }
    setErr(''); setLoading(true)
    try {
      const description = editor?.getHTML() ?? ''
      const body: Record<string, unknown> = {
        title: form.title.trim(),
        price: form.price.trim(),
        boutique: boutiqueId,
        is_available: form.is_available,
      }
      if (description && description !== '<p></p>') body.description = description
      if (form.category)      body.category      = Number(form.category)
      if (form.stock_quantity) body.stock_quantity = Number(form.stock_quantity)

      const res = await api.post('/products/', body)
      const product: Product & { id: number } = res.data

      // Upload main image
      if (imageFile) {
        try {
          const fd = new FormData()
          fd.append('image', imageFile); fd.append('is_primary', 'true')
          await api.post(`/products/${product.id}/images/`, fd)
          product.primary_image_url = preview
        } catch { /* non-blocking */ }
      }

      // Upload extra images
      for (const file of extraFiles) {
        try {
          const fd = new FormData()
          fd.append('image', file); fd.append('is_primary', 'false')
          await api.post(`/products/${product.id}/images/`, fd)
        } catch { /* non-blocking */ }
      }

      onCreated(product); onClose()
    } catch (e: any) {
      setErr(e.response?.data?.detail ?? (lang === 'fr' ? 'Erreur lors de la création.' : 'خطأ في الإنشاء.'))
    } finally {
      setLoading(false)
    }
  }

  const isRtl = lang === 'ar'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div dir={isRtl ? 'rtl' : 'ltr'} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="font-bold text-gray-900">{lang === 'fr' ? 'Ajouter un produit' : 'إضافة منتج'}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <X size={15} />
          </button>
        </div>

        <form onSubmit={submit} className="px-6 py-5 space-y-4">

          {/* ── Main image ── */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {lang === 'fr' ? 'Photo principale' : 'الصورة الرئيسية'}
            </label>
            <button type="button" onClick={() => !checking && fileRef.current?.click()} disabled={checking}
              className="w-full h-32 rounded-xl border-2 border-dashed transition-colors flex flex-col items-center justify-center gap-2 relative overflow-hidden disabled:opacity-60 border-gray-200 hover:border-amber-400 bg-gray-50 hover:bg-amber-50">
              {checking
                ? <><div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-gray-400">{lang === 'fr' ? 'Vérification…' : 'جارٍ التحقق…'}</span></>
                : preview
                ? <img src={preview} className="absolute inset-0 w-full h-full object-cover rounded-xl" alt="" />
                : <><ImgIcon size={24} className="text-gray-300" />
                    <span className="text-xs text-gray-400">{lang === 'fr' ? 'Cliquer pour ajouter' : 'انقر للإضافة'}</span></>}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickMain} />
            {personErr && <PersonErrBanner msg={personErr} lang={lang} />}
          </div>

          {/* ── Extra images ── */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {lang === 'fr' ? `Photos supplémentaires (${extraPreviews.length}/3)` : `صور إضافية (${extraPreviews.length}/3)`}
            </label>
            <div className="flex gap-2 flex-wrap">
              {extraPreviews.map((src, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 shrink-0">
                  <img src={src} className="w-full h-full object-cover" alt="" />
                  <button type="button" onClick={() => removeExtra(i)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors">
                    <X size={10} color="white" />
                  </button>
                </div>
              ))}
              {extraPreviews.length < 3 && (
                <button type="button" onClick={() => !checkingExtra && extraFileRef.current?.click()} disabled={checkingExtra}
                  className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 hover:border-amber-400 bg-gray-50 hover:bg-amber-50 flex flex-col items-center justify-center gap-1 transition-colors disabled:opacity-60 shrink-0">
                  {checkingExtra
                    ? <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                    : <><Plus size={16} className="text-gray-400" />
                        <span className="text-[10px] text-gray-400">{lang === 'fr' ? 'Ajouter' : 'إضافة'}</span></>}
                </button>
              )}
            </div>
            <input ref={extraFileRef} type="file" accept="image/*" className="hidden" onChange={pickExtra} />
            {extraPersonErr && <PersonErrBanner msg={extraPersonErr} lang={lang} />}
          </div>

          {/* ── Title ── */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              {lang === 'fr' ? 'Titre *' : 'العنوان *'}
            </label>
            <input type="text" required value={form.title} onChange={e => set('title', e.target.value)}
              placeholder={lang === 'fr' ? 'Nom du produit' : 'اسم المنتج'}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all" />
          </div>

          {/* ── Price + Stock ── */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                {lang === 'fr' ? 'Prix (MRU) *' : 'السعر (أوقية) *'}
              </label>
              <input type="number" required min="0" step="0.01" value={form.price} onChange={e => set('price', e.target.value)}
                placeholder="0.00"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                {lang === 'fr' ? 'Stock' : 'المخزون'}
              </label>
              <input type="number" min="0" value={form.stock_quantity} onChange={e => set('stock_quantity', e.target.value)}
                placeholder={lang === 'fr' ? 'Illimité' : 'غير محدود'}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all" />
            </div>
          </div>

          {/* ── Category ── */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              {lang === 'fr' ? 'Catégorie' : 'الفئة'}
            </label>
            <CategorySelect
              categories={categories}
              value={form.category}
              lang={lang}
              onChange={v => set('category', v)}
            />
          </div>

          {/* ── Description (rich text) ── */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              {lang === 'fr' ? 'Description' : 'الوصف'}
            </label>
            <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-100 transition-all">
              {/* Toolbar */}
              <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-gray-100 bg-gray-50">
                <ToolBtn onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive('bold')}>
                  <Bold size={13} />
                </ToolBtn>
                <ToolBtn onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive('italic')}>
                  <Italic size={13} />
                </ToolBtn>
                <div className="w-px h-4 bg-gray-200 mx-1" />
                <ToolBtn onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive('bulletList')}>
                  <List size={13} />
                </ToolBtn>
                <ToolBtn onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive('orderedList')}>
                  <ListOrdered size={13} />
                </ToolBtn>
              </div>
              {/* Editor area */}
              <EditorContent editor={editor} className="[&_.ProseMirror]:outline-none [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5 [&_.ProseMirror_p]:leading-relaxed" />
            </div>
          </div>

          {/* ── Availability ── */}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
            <span className="text-sm font-medium text-gray-700">
              {lang === 'fr' ? 'Disponible à la vente' : 'متاح للبيع'}
            </span>
            <button type="button" onClick={() => set('is_available', !form.is_available)}
              className={`relative w-11 h-6 rounded-full transition-colors ${form.is_available ? 'bg-amber-400' : 'bg-gray-200'}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${form.is_available ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>

          {err && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{err}</p>}

          <button type="submit" disabled={loading || checking || checkingExtra}
            className="w-full py-3 rounded-xl bg-[#F8AC12] text-gray-900 font-bold text-sm hover:bg-amber-400 transition-colors disabled:opacity-60">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-gray-900/20 border-t-gray-900/70 rounded-full animate-spin" />
                {lang === 'fr' ? 'Création…' : 'جارٍ الإنشاء…'}
              </span>
            ) : (lang === 'fr' ? 'Créer le produit' : 'إنشاء المنتج')}
          </button>
        </form>
      </div>
    </div>
  )
}

function PersonErrBanner({ msg, lang }: { msg: string; lang: Lang }) {
  return (
    <div className="mt-2 flex items-start gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
      <span className="text-xs text-amber-800 flex-1">{msg}</span>
      <a href="https://gemini.google.com" target="_blank" rel="noopener noreferrer"
        className="text-xs font-semibold text-blue-600 hover:underline whitespace-nowrap">
        ✨ {lang === 'fr' ? 'Utiliser Gemini' : 'استخدم Gemini'}
      </a>
    </div>
  )
}

// ─── Product card (compact manager view) ──────────────────────────────────────
function ProductRow({ product, lang, onDelete }: { product: Product; lang: Lang; onDelete: (slug: string) => void }) {
  const [deleting, setDeleting] = useState(false)
  const confirmDelete = async () => {
    if (!window.confirm(lang === 'fr' ? `Supprimer "${product.title}" ?` : `حذف "${product.title}"؟`)) return
    setDeleting(true)
    try {
      await api.delete(`/products/${product.slug}/`)
      onDelete(product.slug)
    } catch { setDeleting(false) }
  }
  return (
    <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-3 hover:shadow-sm transition-shadow group">
      <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden shrink-0">
        {product.primary_image_url
          ? <img src={product.primary_image_url} alt={product.title} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={18} /></div>}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-900 truncate">{product.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-amber-600 font-bold text-sm">{product.price} MRU</span>
          {product.category_name && <span className="text-xs text-gray-400">· {product.category_name}</span>}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${product.is_available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {product.is_available ? (lang === 'fr' ? 'Dispo' : 'متاح') : (lang === 'fr' ? 'Indispo' : 'غير متاح')}
        </span>
        <Link to={`/produit/${product.slug}`}
          className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center hover:bg-amber-50 hover:text-amber-600 transition-colors text-gray-400">
          <ChevronRight size={13} />
        </Link>
        <button onClick={confirmDelete} disabled={deleting}
          className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors text-gray-400 disabled:opacity-40">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function ProfilePage({ lang }: Props) {
  const { user, logout, login } = useAuth()
  const navigate = useNavigate()
  const isRtl = lang === 'ar'

  const [boutique,    setBoutique]    = useState<Boutique | null>(null)
  const [products,    setProducts]    = useState<Product[]>([])
  const [categories,  setCategories]  = useState<Category[]>([])
  const [boutiqueLoad,setBoutiqueLoad]= useState(true)
  const [productsLoad,setProductsLoad]= useState(false)
  const [showModal,   setShowModal]   = useState(false)

  // Edit profile state
  const [editing,     setEditing]     = useState(false)
  const [firstName,   setFirstName]   = useState(user?.first_name ?? '')
  const [lastName,    setLastName]    = useState(user?.last_name ?? '')
  const [saveLoad,    setSaveLoad]    = useState(false)

  // Redirect if not authenticated
  useEffect(() => { if (!user) navigate('/connexion') }, [user, navigate])

  useEffect(() => {
    if (!user) return
    // Fetch boutique
    api.get('/boutiques/mine/').then(r => {
      const list = r.data?.results ?? r.data ?? []
      if (list.length > 0) setBoutique(list[0])
    }).catch(() => {}).finally(() => setBoutiqueLoad(false))
    // Fetch categories for product form
    api.get('/categories/').then(r => {
      const list = r.data?.results ?? r.data ?? []
      setCategories(list)
    }).catch(() => {})
  }, [user])

  useEffect(() => {
    if (!boutique) return
    setProductsLoad(true)
    api.get(`/products/?boutique=${boutique.slug}`).then(r => {
      const list = r.data?.results ?? r.data ?? []
      setProducts(list)
    }).catch(() => {}).finally(() => setProductsLoad(false))
  }, [boutique])

  const saveProfile = async () => {
    setSaveLoad(true)
    try {
      const r = await api.patch('/auth/me/', { first_name: firstName, last_name: lastName })
      if (user) login(localStorage.getItem('access_token')!, localStorage.getItem('refresh_token')!, { ...user, ...r.data })
      setEditing(false)
    } catch { /* keep editing open */ } finally { setSaveLoad(false) }
  }

  const handleLogout = () => { logout(); navigate('/') }

  if (!user) return null

  const roleLabel = user.role ? (ROLE_LABEL[user.role]?.[lang] ?? user.role) : null
  const isVendeur = user.role === 'vendeur'

  return (
    <div className="min-h-screen bg-[#f8f7f5] pt-[152px] sm:pt-[100px]" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">

          {/* ── LEFT: User card ──────────────────────────────────────────── */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              {/* Avatar */}
              <div className="flex flex-col items-center text-center mb-5">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-amber-200 mb-3">
                  {user.avatar_url
                    ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-amber-100 flex items-center justify-center text-3xl font-bold text-amber-600">
                        {user.first_name?.[0]?.toUpperCase() ?? '?'}
                      </div>}
                </div>

                {editing ? (
                  <div className="w-full space-y-2">
                    <input value={firstName} onChange={e => setFirstName(e.target.value)}
                      className="w-full text-center border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:border-amber-400 outline-none" />
                    <input value={lastName} onChange={e => setLastName(e.target.value)}
                      className="w-full text-center border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:border-amber-400 outline-none" />
                    <div className="flex gap-2">
                      <button onClick={saveProfile} disabled={saveLoad}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-amber-400 text-gray-900 text-xs font-bold hover:bg-amber-500 transition-colors disabled:opacity-60">
                        <Check size={12} /> {lang === 'fr' ? 'Sauvegarder' : 'حفظ'}
                      </button>
                      <button onClick={() => { setEditing(false); setFirstName(user.first_name); setLastName(user.last_name ?? '') }}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold hover:bg-gray-200 transition-colors">
                        <X size={12} /> {lang === 'fr' ? 'Annuler' : 'إلغاء'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="font-bold text-gray-900 text-lg">{user.first_name} {user.last_name}</h2>
                    <p className="text-sm text-gray-500 mt-0.5">{user.phone}</p>
                    {roleLabel && (
                      <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-3 py-1">
                        {user.role && ROLE_EMOJI[user.role]} {roleLabel}
                      </span>
                    )}
                  </>
                )}
              </div>

              <div className="space-y-2 border-t border-gray-100 pt-4">
                {!editing && (
                  <button onClick={() => setEditing(true)}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm text-gray-700 font-medium">
                    <Edit2 size={14} className="text-gray-400" />
                    {lang === 'fr' ? 'Modifier le profil' : 'تعديل الملف الشخصي'}
                  </button>
                )}
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl hover:bg-red-50 transition-colors text-sm text-red-600 font-medium">
                  <LogOut size={14} />
                  {lang === 'fr' ? 'Se déconnecter' : 'تسجيل الخروج'}
                </button>
              </div>
            </div>

            {/* Quick stats */}
            {isVendeur && boutique && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 grid grid-cols-2 gap-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{lang === 'fr' ? 'Produits' : 'منتجات'}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{products.filter(p => p.is_available).length}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{lang === 'fr' ? 'Disponibles' : 'متاح'}</p>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: Main content ──────────────────────────────────────── */}
          <div className="space-y-6">

            {/* Boutique section — vendeurs only */}
            {isVendeur && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Store size={16} className="text-amber-500" />
                    <h3 className="font-bold text-gray-900">{lang === 'fr' ? 'Ma boutique' : 'متجري'}</h3>
                  </div>
                  {!boutique && !boutiqueLoad && (
                    <Link to="/boutique/create-boutique"
                      className="text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors">
                      + {lang === 'fr' ? 'Créer' : 'إنشاء'}
                    </Link>
                  )}
                </div>

                {boutiqueLoad ? (
                  <div className="px-6 py-8 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : boutique ? (
                  <div className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                        {boutique.image_url
                          ? <img src={boutique.image_url} alt={boutique.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-gray-300"><Store size={20} /></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 truncate">{boutique.name}</h4>
                        <p className="text-sm text-gray-500">{boutique.boutique_type} · {boutique.ville}</p>
                        {boutique.description && <p className="text-xs text-gray-400 mt-1 line-clamp-1">{boutique.description}</p>}
                      </div>
                      <Link to={`/boutique/${boutique.slug}`}
                        className="shrink-0 text-xs font-semibold text-amber-600 hover:text-amber-700 border border-amber-200 rounded-lg px-3 py-1.5 hover:bg-amber-50 transition-colors">
                        {lang === 'fr' ? 'Voir' : 'عرض'} →
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="px-6 py-8 text-center">
                    <Store size={32} className="mx-auto text-gray-200 mb-3" />
                    <p className="text-sm text-gray-500 mb-4">{lang === 'fr' ? 'Vous n\'avez pas encore de boutique.' : 'ليس لديك متجر بعد.'}</p>
                    <Link to="/boutique/create-boutique"
                      className="inline-flex items-center gap-1.5 bg-amber-400 text-gray-900 font-bold text-sm px-4 py-2 rounded-xl hover:bg-amber-500 transition-colors">
                      <Plus size={14} /> {lang === 'fr' ? 'Créer ma boutique' : 'إنشاء متجري'}
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Products section — vendeurs only */}
            {isVendeur && boutique && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Package size={16} className="text-amber-500" />
                    <h3 className="font-bold text-gray-900">
                      {lang === 'fr' ? 'Mes produits' : 'منتجاتي'}
                      {products.length > 0 && <span className="ml-2 text-xs font-normal text-gray-400">({products.length})</span>}
                    </h3>
                  </div>
                  <button onClick={() => setShowModal(true)}
                    className="flex items-center gap-1.5 bg-[#F8AC12] text-gray-900 font-bold text-xs px-3 py-2 rounded-xl hover:bg-amber-400 transition-colors">
                    <Plus size={13} /> {lang === 'fr' ? 'Ajouter' : 'إضافة'}
                  </button>
                </div>

                <div className="px-6 py-4">
                  {productsLoad ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-3 animate-pulse">
                          <div className="w-14 h-14 rounded-lg bg-gray-100 shrink-0" />
                          <div className="flex-1 space-y-2">
                            <div className="h-3 bg-gray-100 rounded w-3/5" />
                            <div className="h-3 bg-gray-100 rounded w-2/5" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : products.length === 0 ? (
                    <div className="text-center py-10">
                      <Package size={36} className="mx-auto text-gray-200 mb-3" />
                      <p className="text-sm text-gray-500 mb-4">{lang === 'fr' ? 'Aucun produit pour l\'instant.' : 'لا توجد منتجات بعد.'}</p>
                      <button onClick={() => setShowModal(true)}
                        className="inline-flex items-center gap-1.5 bg-[#F8AC12] text-gray-900 font-bold text-sm px-4 py-2 rounded-xl hover:bg-amber-400 transition-colors">
                        <Plus size={14} /> {lang === 'fr' ? 'Ajouter mon premier produit' : 'أضف أول منتج'}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {products.map(p => (
                        <ProductRow
                          key={p.slug}
                          product={p}
                          lang={lang}
                          onDelete={slug => setProducts(prev => prev.filter(x => x.slug !== slug))}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Info for non-vendeurs */}
            {!isVendeur && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
                <p className="text-4xl mb-4">{user.role ? ROLE_EMOJI[user.role] : '👤'}</p>
                <h3 className="font-bold text-gray-900 text-lg mb-2">
                  {lang === 'fr' ? `Compte ${roleLabel ?? 'actif'}` : `حساب ${roleLabel ?? 'نشط'}`}
                </h3>
                <p className="text-sm text-gray-500 max-w-sm mx-auto">
                  {lang === 'fr'
                    ? 'Votre compte est configuré. Gérez vos activités depuis l\'application mobile Mauri-Kilchi.'
                    : 'حسابك مُعدّ. أدر نشاطاتك من تطبيق موريكيلشي المحمول.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product create modal */}
      {showModal && boutique && (
        <ProductModal
          boutiqueId={boutique.id}
          categories={categories}
          lang={lang}
          onClose={() => setShowModal(false)}
          onCreated={p => setProducts(prev => [p, ...prev])}
        />
      )}
    </div>
  )
}
