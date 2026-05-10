/**
 * Product creation modal + compact product row.
 * Used on the boutique management page.
 */

import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { X, Plus, Package, Trash2, ChevronRight, Image as ImgIcon, Bold, Italic, List, ListOrdered } from 'lucide-react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { api } from '../lib/api'
import { type Lang } from '../constants/i18n'

export interface SubCat   { id: number; name: string; icon: string }
export interface Category { id: number; name: string; icon: string; subcategories: SubCat[] }
export interface Product  { id: number; slug: string; title: string; price: string; primary_image_url: string | null; is_available: boolean; stock_quantity: number | null; category_name: string }

// ─── Category picker ──────────────────────────────────────────────────────────
import { ChevronDown } from 'lucide-react'

function CategorySelect({ categories, value, lang, onChange }: {
  categories: Category[]; value: string; lang: Lang; onChange: (v: string) => void
}) {
  const [open,       setOpen]       = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const selectedSub = categories.flatMap(c => c.subcategories).find(s => String(s.id) === value)

  const handleOpen = () => {
    if (!open && value) {
      const parent = categories.find(c => c.subcategories.some(s => String(s.id) === value))
      if (parent) setExpandedId(parent.id)
    }
    setOpen(o => !o)
  }
  const pick = (id: string) => { onChange(id); setOpen(false) }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden transition-all focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-100">
      <button type="button" onClick={handleOpen}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-white hover:bg-gray-50 transition-colors text-sm">
        <span className={selectedSub ? 'text-gray-900 font-medium' : 'text-gray-400'}>
          {selectedSub ? selectedSub.name : (lang === 'fr' ? '— Aucune catégorie —' : '— بدون فئة —')}
        </span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="border-t border-gray-100 max-h-60 overflow-y-auto">
          <button type="button" onClick={() => pick('')}
            className={`w-full text-left px-4 py-2.5 text-sm border-b border-gray-100 transition-colors
              ${!value ? 'text-amber-700 bg-amber-50 font-medium' : 'text-gray-400 hover:bg-gray-50'}`}>
            {lang === 'fr' ? '— Aucune catégorie —' : '— بدون فئة —'}
          </button>
          {categories.map(cat => {
            const isExpanded = expandedId === cat.id
            const hasActive  = cat.subcategories.some(s => String(s.id) === value)
            return (
              <div key={cat.id} className="border-b border-gray-50 last:border-0">
                <button type="button" onClick={() => setExpandedId(isExpanded ? null : cat.id)}
                  className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-gray-50 ${hasActive ? 'text-amber-700' : 'text-gray-800'}`}>
                  <span className="flex items-center gap-2">
                    {cat.icon && <span className="text-base leading-none">{cat.icon}</span>}
                    {cat.name}
                  </span>
                  <ChevronDown size={12} className={`text-gray-400 shrink-0 transition-transform duration-150 ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
                {isExpanded && (
                  <div className="bg-gray-50/50 pb-1">
                    {cat.subcategories.length === 0
                      ? <p className="pl-8 py-2 text-xs text-gray-400 italic">{lang === 'fr' ? 'Aucune sous-catégorie' : 'لا توجد فئات فرعية'}</p>
                      : cat.subcategories.map(sub => (
                        <button type="button" key={sub.id} onClick={() => pick(String(sub.id))}
                          className={`w-full text-left pl-8 pr-4 py-2 text-sm transition-colors
                            ${String(sub.id) === value ? 'text-amber-700 font-semibold bg-amber-50' : 'text-gray-600 hover:bg-amber-50/60 hover:text-gray-900'}`}>
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

function ToolBtn({ onClick, active, children }: { onClick: () => void; active?: boolean; children: React.ReactNode }) {
  return (
    <button type="button" onMouseDown={e => { e.preventDefault(); onClick() }}
      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors
        ${active ? 'bg-amber-100 text-amber-700' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'}`}>
      {children}
    </button>
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

// ─── Product creation modal ───────────────────────────────────────────────────
export default function ProductModal({ boutiqueId, categories, lang, onClose, onCreated }: {
  boutiqueId: number; categories: Category[]; lang: Lang
  onClose: () => void; onCreated: (p: Product) => void
}) {
  const [form, setForm] = useState({ title: '', price: '', category: '', stock_quantity: '', is_available: true })
  const [imageFile,     setImageFile]     = useState<File | null>(null)
  const [preview,       setPreview]       = useState<string | null>(null)
  const [checking,      setChecking]      = useState(false)
  const [personErr,     setPersonErr]     = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const [extraFiles,     setExtraFiles]     = useState<File[]>([])
  const [extraPreviews,  setExtraPreviews]  = useState<string[]>([])
  const [checkingExtra,  setCheckingExtra]  = useState(false)
  const [extraPersonErr, setExtraPersonErr] = useState('')
  const extraFileRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(false)
  const [err,     setErr]     = useState('')

  const set = (k: keyof typeof form, v: string | boolean) => setForm(f => ({ ...f, [k]: v }))

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    editorProps: { attributes: { class: 'min-h-[96px] px-4 py-3 text-sm text-gray-800 outline-none' } },
  })

  const moderateFile = async (f: File): Promise<'ok' | 'person' | 'error'> => {
    try {
      const fd = new FormData(); fd.append('image', f)
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
    if (result === 'person') setPersonErr(lang === 'fr' ? 'Cette image contient une personne et ne peut pas être utilisée.' : 'تحتوي هذه الصورة على شخص ولا يمكن استخدامها.')
    else { setImageFile(f); setPreview(URL.createObjectURL(f)) }
  }

  const pickExtra = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return
    e.target.value = ''; setExtraPersonErr(''); setCheckingExtra(true)
    const result = await moderateFile(f)
    setCheckingExtra(false)
    if (result === 'person') setExtraPersonErr(lang === 'fr' ? 'Image refusée : personne détectée.' : 'صورة مرفوضة: تم اكتشاف شخص.')
    else { setExtraFiles(prev => [...prev, f]); setExtraPreviews(prev => [...prev, URL.createObjectURL(f)]) }
  }

  const removeExtra = (i: number) => {
    setExtraFiles(prev => prev.filter((_, idx) => idx !== i))
    setExtraPreviews(prev => prev.filter((_, idx) => idx !== i))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.price.trim()) { setErr(lang === 'fr' ? 'Titre et prix requis.' : 'العنوان والسعر مطلوبان.'); return }
    setErr(''); setLoading(true)
    try {
      const description = editor?.getHTML() ?? ''
      const body: Record<string, unknown> = {
        title: form.title.trim(), price: form.price.trim(), boutique: boutiqueId, is_available: form.is_available,
      }
      if (description && description !== '<p></p>') body.description = description
      if (form.category)       body.category       = Number(form.category)
      if (form.stock_quantity) body.stock_quantity = Number(form.stock_quantity)

      const res = await api.post('/products/', body)
      const product: Product & { id: number } = res.data

      if (imageFile) {
        try {
          const fd = new FormData(); fd.append('image', imageFile); fd.append('is_primary', 'true')
          await api.post(`/products/${product.id}/images/`, fd)
          product.primary_image_url = preview
        } catch { }
      }
      for (const file of extraFiles) {
        try {
          const fd = new FormData(); fd.append('image', file); fd.append('is_primary', 'false')
          await api.post(`/products/${product.id}/images/`, fd)
        } catch { }
      }
      onCreated(product); onClose()
    } catch (e: any) {
      setErr(e.response?.data?.detail ?? (lang === 'fr' ? 'Erreur lors de la création.' : 'خطأ في الإنشاء.'))
    } finally { setLoading(false) }
  }

  const isRtl = lang === 'ar'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div dir={isRtl ? 'rtl' : 'ltr'} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="font-bold text-gray-900">{lang === 'fr' ? 'Ajouter un produit' : 'إضافة منتج'}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"><X size={15} /></button>
        </div>

        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          {/* Main image */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{lang === 'fr' ? 'Photo principale' : 'الصورة الرئيسية'}</label>
            <button type="button" onClick={() => !checking && fileRef.current?.click()} disabled={checking}
              className="w-full h-32 rounded-xl border-2 border-dashed transition-colors flex flex-col items-center justify-center gap-2 relative overflow-hidden disabled:opacity-60 border-gray-200 hover:border-amber-400 bg-gray-50 hover:bg-amber-50">
              {checking
                ? <><div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" /><span className="text-xs text-gray-400">{lang === 'fr' ? 'Vérification…' : 'جارٍ التحقق…'}</span></>
                : preview ? <img src={preview} className="absolute inset-0 w-full h-full object-cover rounded-xl" alt="" />
                : <><ImgIcon size={24} className="text-gray-300" /><span className="text-xs text-gray-400">{lang === 'fr' ? 'Cliquer pour ajouter' : 'انقر للإضافة'}</span></>}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickMain} />
            {personErr && <PersonErrBanner msg={personErr} lang={lang} />}
          </div>

          {/* Extra images */}
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
                  {checkingExtra ? <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                    : <><Plus size={16} className="text-gray-400" /><span className="text-[10px] text-gray-400">{lang === 'fr' ? 'Ajouter' : 'إضافة'}</span></>}
                </button>
              )}
            </div>
            <input ref={extraFileRef} type="file" accept="image/*" className="hidden" onChange={pickExtra} />
            {extraPersonErr && <PersonErrBanner msg={extraPersonErr} lang={lang} />}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{lang === 'fr' ? 'Titre *' : 'العنوان *'}</label>
            <input type="text" required value={form.title} onChange={e => set('title', e.target.value)}
              placeholder={lang === 'fr' ? 'Nom du produit' : 'اسم المنتج'}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all" />
          </div>

          {/* Price + Stock */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{lang === 'fr' ? 'Prix (MRU) *' : 'السعر (أوقية) *'}</label>
              <input type="number" required min="0" step="0.01" value={form.price} onChange={e => set('price', e.target.value)}
                placeholder="0.00"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{lang === 'fr' ? 'Stock' : 'المخزون'}</label>
              <input type="number" min="0" value={form.stock_quantity} onChange={e => set('stock_quantity', e.target.value)}
                placeholder={lang === 'fr' ? 'Illimité' : 'غير محدود'}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all" />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{lang === 'fr' ? 'Catégorie' : 'الفئة'}</label>
            <CategorySelect categories={categories} value={form.category} lang={lang} onChange={v => set('category', v)} />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{lang === 'fr' ? 'Description' : 'الوصف'}</label>
            <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-100 transition-all">
              <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-gray-100 bg-gray-50">
                <ToolBtn onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive('bold')}><Bold size={13} /></ToolBtn>
                <ToolBtn onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive('italic')}><Italic size={13} /></ToolBtn>
                <div className="w-px h-4 bg-gray-200 mx-1" />
                <ToolBtn onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive('bulletList')}><List size={13} /></ToolBtn>
                <ToolBtn onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive('orderedList')}><ListOrdered size={13} /></ToolBtn>
              </div>
              <EditorContent editor={editor} className="[&_.ProseMirror]:outline-none [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5 [&_.ProseMirror_p]:leading-relaxed" />
            </div>
          </div>

          {/* Availability */}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
            <span className="text-sm font-medium text-gray-700">{lang === 'fr' ? 'Disponible à la vente' : 'متاح للبيع'}</span>
            <button type="button" onClick={() => set('is_available', !form.is_available)}
              className={`relative w-11 h-6 rounded-full transition-colors ${form.is_available ? 'bg-amber-400' : 'bg-gray-200'}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${form.is_available ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>

          {err && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{err}</p>}

          <button type="submit" disabled={loading || checking || checkingExtra}
            className="w-full py-3 rounded-xl bg-[#F8AC12] text-gray-900 font-bold text-sm hover:bg-amber-400 transition-colors disabled:opacity-60">
            {loading
              ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-gray-900/20 border-t-gray-900/70 rounded-full animate-spin" />{lang === 'fr' ? 'Création…' : 'جارٍ الإنشاء…'}</span>
              : lang === 'fr' ? 'Créer le produit' : 'إنشاء المنتج'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Product compact row (for boutique management page) ───────────────────────
export function ProductRow({ product, lang, onDelete }: { product: Product; lang: Lang; onDelete: (slug: string) => void }) {
  const [deleting, setDeleting] = useState(false)
  const handleDelete = async () => {
    if (!window.confirm(lang === 'fr' ? `Supprimer "${product.title}" ?` : `حذف "${product.title}"؟`)) return
    setDeleting(true)
    try { await api.delete(`/products/${product.slug}/`); onDelete(product.slug) }
    catch { setDeleting(false) }
  }
  return (
    <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-3 hover:shadow-sm transition-shadow">
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
        <button onClick={handleDelete} disabled={deleting}
          className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors text-gray-400 disabled:opacity-40">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}
