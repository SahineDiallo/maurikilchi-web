import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LogOut, Plus, Edit2, Check, Store, X, Package, Eye, EyeOff, Trash2, MoreVertical } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { type Lang } from '../constants/i18n'
import ActivitiesSection from '../components/ActivitiesSection'

interface Props { lang: Lang }

interface Boutique {
  id: number; slug: string; name: string; image_url: string | null
  boutique_type: string; ville: string; description: string
  phone_number: string; is_active: boolean
}

export default function ProfilePage({ lang }: Props) {
  const { user, logout, login, bootstrapDone } = useAuth()
  const navigate = useNavigate()
  const isRtl = lang === 'ar'
  const menuRef = useRef<HTMLDivElement>(null)

  const [activeTab, setActiveTab] = useState<'dashboard' | 'activities'>('dashboard')

  const [boutique,      setBoutique]      = useState<Boutique | null>(null)
  const [boutiqueLoad,  setBoutiqueLoad]  = useState(true)
  const [productCount,  setProductCount]  = useState<number | null>(null)

  // Edit profile
  const [editing,   setEditing]   = useState(false)
  const [firstName, setFirstName] = useState(user?.first_name ?? '')
  const [lastName,  setLastName]  = useState(user?.last_name ?? '')
  const [saveLoad,  setSaveLoad]  = useState(false)

  // Boutique actions
  const [boutiqueActing, setBoutiqueActing] = useState(false)
  const [confirmDelete,  setConfirmDelete]  = useState(false)
  const [menuOpen,       setMenuOpen]       = useState(false)

  // Close ellipsis menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
        setConfirmDelete(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => { if (bootstrapDone && !user) navigate('/connexion') }, [bootstrapDone, user, navigate])

  useEffect(() => {
    if (!user) return
    api.get('/boutiques/mine/').then(r => {
      const list = r.data?.results ?? r.data ?? []
      if (list.length > 0) setBoutique(list[0])
    }).catch(() => {}).finally(() => setBoutiqueLoad(false))
  }, [user])

  useEffect(() => {
    if (!boutique) return
    api.get(`/products/?boutique=${boutique.slug}&page_size=1`).then(r => {
      setProductCount(r.data?.count ?? null)
    }).catch(() => {})
  }, [boutique])

  const toggleBoutiqueActive = async () => {
    if (!boutique || boutiqueActing) return
    setBoutiqueActing(true)
    try {
      const r = await api.patch(`/boutiques/${boutique.slug}/`, { is_active: !boutique.is_active })
      setBoutique(b => b ? { ...b, is_active: r.data.is_active } : b)
      setMenuOpen(false)
    } catch { } finally { setBoutiqueActing(false) }
  }

  const deleteBoutique = async () => {
    if (!boutique || boutiqueActing) return
    setBoutiqueActing(true)
    try {
      await api.delete(`/boutiques/${boutique.slug}/`)
      setBoutique(null)
      setProductCount(null)
      setConfirmDelete(false)
      setMenuOpen(false)
    } catch { } finally { setBoutiqueActing(false) }
  }

  const saveProfile = async () => {
    setSaveLoad(true)
    try {
      const r = await api.patch('/auth/me/', { first_name: firstName, last_name: lastName })
      if (user) login(localStorage.getItem('access_token')!, localStorage.getItem('refresh_token')!, { ...user, ...r.data })
      setEditing(false)
    } catch { } finally { setSaveLoad(false) }
  }

  const handleLogout = () => { logout(); navigate('/') }

  if (!user) return null

  const isSellerActive = !!user.seller_profile?.is_active
  const transport      = user.transport

  const activeBadges = []
  if (isSellerActive)              activeBadges.push({ emoji: '🏪', fr: 'Vendeur',     ar: 'بائع'      })
  if (transport?.type === 'livreur')  activeBadges.push({ emoji: '🏍️', fr: 'Livreur',     ar: 'موصّل'     })
  if (transport?.type === 'voyageur') activeBadges.push({ emoji: '🚌', fr: 'Long Voyage', ar: 'سفر طويل'  })
  if (transport?.type === 'maurigo')  activeBadges.push({ emoji: '🚕', fr: 'Car Rapide',  ar: 'كار رابيد' })

  return (
    <div className="min-h-screen bg-[#f8f7f5] pt-[152px] sm:pt-[100px]" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">

          {/* ── LEFT: User card + stats ─────────────────────────────────── */}
          <div className="space-y-4">

            {/* User card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
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
                    {activeBadges.length > 0 ? (
                      <div className="flex flex-wrap justify-center gap-1.5 mt-2">
                        {activeBadges.map(b => (
                          <span key={b.fr} className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2.5 py-0.5">
                            {b.emoji} {b[lang === 'fr' ? 'fr' : 'ar']}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold bg-gray-100 text-gray-500 rounded-full px-3 py-1">
                        👤 {lang === 'fr' ? 'Client' : 'عميل'}
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

            {/* Stats card — shown when user has an active role */}
            {(isSellerActive || transport) && (
              <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                  {lang === 'fr' ? 'Statistiques' : 'إحصائيات'}
                </p>

                <div className="space-y-2.5">

                  {/* Seller: product count */}
                  {isSellerActive && boutique && (
                    <div className="flex items-center justify-between bg-amber-50 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Package size={15} className="text-amber-500" />
                        <span className="text-sm font-medium text-gray-700">
                          {lang === 'fr' ? 'Produits en ligne' : 'المنتجات'}
                        </span>
                      </div>
                      <span className="text-2xl font-bold text-gray-900">
                        {productCount !== null ? productCount : '—'}
                      </span>
                    </div>
                  )}

                  {/* Livreur: deliveries + rating */}
                  {transport?.type === 'livreur' && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-blue-50 rounded-xl px-3 py-3 text-center">
                        <p className="text-2xl font-bold text-gray-900">{transport.deliveries_count ?? 0}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{lang === 'fr' ? 'Livraisons' : 'توصيلات'}</p>
                      </div>
                      <div className="bg-amber-50 rounded-xl px-3 py-3 text-center">
                        <p className="text-2xl font-bold text-gray-900">
                          {transport.rating !== undefined ? transport.rating : '—'}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">⭐ {lang === 'fr' ? 'Note' : 'التقييم'}</p>
                      </div>
                    </div>
                  )}

                  {/* Voyageur: trajet */}
                  {transport?.type === 'voyageur' && (
                    <div className="bg-green-50 rounded-xl px-4 py-3">
                      <p className="text-xs text-gray-500 mb-1">{lang === 'fr' ? 'Trajet habituel' : 'المسار المعتاد'}</p>
                      <p className="font-bold text-sm text-gray-900">
                        {transport.trajet_depart} ⇄ {transport.trajet_destination}
                      </p>
                    </div>
                  )}

                  {/* Maurigo: wilaya + status */}
                  {transport?.type === 'maurigo' && (
                    <div className="bg-purple-50 rounded-xl px-4 py-3">
                      <p className="text-xs text-gray-500 mb-1">{lang === 'fr' ? 'Wilaya' : 'الولاية'}</p>
                      <p className="font-bold text-sm text-gray-900">{transport.wilaya}</p>
                      {transport.plate_number && (
                        <p className="text-xs text-gray-400 mt-1">
                          {lang === 'fr' ? 'Plaque' : 'اللوحة'}: {transport.plate_number}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: Main content ──────────────────────────────────────── */}
          <div className="space-y-6">

            {/* Tab bar */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="flex">
                {([
                  { key: 'dashboard',  fr: 'Tableau de bord', ar: 'لوحة القيادة' },
                  { key: 'activities', fr: 'Mes activités',   ar: 'نشاطاتي'      },
                ] as const).map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className="relative flex-1 py-3.5 text-sm font-semibold transition-colors"
                    style={{
                      color:      activeTab === tab.key ? '#0D0D0D' : '#9CA3AF',
                      fontWeight: activeTab === tab.key ? 700 : 500,
                    }}
                  >
                    {tab[lang === 'fr' ? 'fr' : 'ar']}
                    {activeTab === tab.key && (
                      <span className="absolute bottom-0 left-4 right-4 h-[2.5px] rounded-full" style={{ background: '#F8AC12' }} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === 'activities' && (
              <ActivitiesSection
                lang={lang}
                hasBoutique={!!boutique}
                boutique={boutique}
                boutiqueActing={boutiqueActing}
                onToggleBoutique={toggleBoutiqueActive}
                onDeleteBoutique={deleteBoutique}
              />
            )}

            {/* No active roles hint on dashboard */}
            {activeTab === 'dashboard' && !isSellerActive && !transport && (
              <div className="bg-white rounded-2xl border border-gray-100 px-4 py-10 text-center">
                <span className="text-5xl select-none">🚀</span>
                <p className="font-semibold text-gray-800 mt-4 mb-1">
                  {lang === 'fr' ? 'Commencez à gagner sur Maurikilchi !' : 'ابدأ الكسب على موريكيلتشي!'}
                </p>
                <p className="text-sm text-gray-400 mb-5 max-w-xs mx-auto">
                  {lang === 'fr'
                    ? "Activez un profil vendeur ou transporteur depuis l'onglet « Mes activités »."
                    : 'فعّل ملف بائع أو ناقل من تبويب "نشاطاتي".'}
                </p>
                <button
                  onClick={() => setActiveTab('activities')}
                  className="inline-flex items-center gap-2 bg-[#F8AC12] text-gray-900 font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-amber-400 transition-colors"
                >
                  {lang === 'fr' ? 'Découvrir les activités' : 'استكشاف النشاطات'} →
                </button>
              </div>
            )}

            {/* Boutique card — seller only, dashboard tab */}
            {activeTab === 'dashboard' && isSellerActive && (
              <div className="bg-white rounded-2xl border border-gray-100">
                <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
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
                  <div className="px-4 py-8 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : boutique ? (
                  <div className="px-4 py-4">

                    {/* Inactive banner */}
                    {!boutique.is_active && (
                      <div className="flex items-center gap-2 mb-3 text-xs font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2">
                        <EyeOff size={13} />
                        {lang === 'fr'
                          ? 'Boutique désactivée — invisible au public. Vos produits sont conservés.'
                          : 'المتجر معطّل — غير مرئي للعموم. منتجاتك محفوظة.'}
                      </div>
                    )}

                    {/* Boutique row */}
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0 transition-opacity ${!boutique.is_active ? 'opacity-50' : ''}`}>
                        {boutique.image_url
                          ? <img src={boutique.image_url} alt={boutique.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-gray-300"><Store size={20} /></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900 truncate">{boutique.name}</h4>
                          {boutique.is_active
                            ? <span className="shrink-0 text-[10px] font-bold bg-green-100 text-green-700 rounded-full px-2 py-0.5">{lang === 'fr' ? 'Active' : 'نشط'}</span>
                            : <span className="shrink-0 text-[10px] font-bold bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">{lang === 'fr' ? 'Désactivée' : 'معطّل'}</span>}
                        </div>
                        <p className="text-sm text-gray-500">{boutique.boutique_type} · {boutique.ville}</p>
                        {boutique.description && (
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{boutique.description}</p>
                        )}
                      </div>

                      {/* Manage link + ⋮ menu */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Link
                          to={`/boutique/${boutique.slug}`}
                          className="text-xs font-semibold text-amber-600 hover:text-amber-700 border border-amber-200 rounded-lg px-3 py-1.5 hover:bg-amber-50 transition-colors whitespace-nowrap"
                        >
                          {lang === 'fr' ? 'Gérer →' : 'إدارة →'}
                        </Link>

                        {/* Ellipsis dropdown */}
                        <div ref={menuRef} className="relative">
                          <button
                            onClick={() => { setMenuOpen(o => !o); setConfirmDelete(false) }}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                          >
                            <MoreVertical size={16} />
                          </button>

                          {menuOpen && (
                            <div className="absolute right-0 top-10 w-56 bg-white rounded-xl shadow-lg border border-gray-100 z-20">

                              {/* Deactivate / Reactivate */}
                              <button
                                onClick={toggleBoutiqueActive}
                                disabled={boutiqueActing}
                                className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition-colors hover:bg-gray-50 disabled:opacity-50 rounded-t-xl
                                  ${boutique.is_active ? 'text-orange-600' : 'text-green-700'}`}
                              >
                                {boutiqueActing && !confirmDelete
                                  ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                  : boutique.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                                {boutique.is_active
                                  ? (lang === 'fr' ? 'Désactiver la boutique' : 'تعطيل المتجر')
                                  : (lang === 'fr' ? 'Réactiver la boutique'  : 'إعادة تفعيل المتجر')}
                              </button>

                              <div className="h-px bg-gray-100" />

                              {/* Delete — two-step inline confirmation */}
                              {!confirmDelete ? (
                                <button
                                  onClick={() => setConfirmDelete(true)}
                                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors rounded-b-xl"
                                >
                                  <Trash2 size={14} />
                                  {lang === 'fr' ? 'Supprimer la boutique' : 'حذف المتجر'}
                                </button>
                              ) : (
                                <div className="px-4 py-3 bg-red-50 space-y-2.5 rounded-b-xl">
                                  <p className="text-xs text-red-700 font-medium leading-snug">
                                    {lang === 'fr'
                                      ? 'Boutique et tous les produits seront définitivement supprimés.'
                                      : 'المتجر وجميع المنتجات ستُحذف نهائياً.'}
                                  </p>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={deleteBoutique}
                                      disabled={boutiqueActing}
                                      className="flex-1 flex items-center justify-center text-xs font-bold text-white bg-red-500 hover:bg-red-600 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                      {boutiqueActing
                                        ? <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                                        : (lang === 'fr' ? 'Confirmer' : 'تأكيد')}
                                    </button>
                                    <button
                                      onClick={() => setConfirmDelete(false)}
                                      className="flex-1 text-xs font-semibold text-gray-600 hover:text-gray-800 bg-white rounded-lg py-1.5 border border-gray-200 transition-colors"
                                    >
                                      {lang === 'fr' ? 'Annuler' : 'إلغاء'}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center">
                    <Store size={32} className="mx-auto text-gray-200 mb-3" />
                    <p className="text-sm text-gray-500 mb-4">
                      {lang === 'fr' ? "Vous n'avez pas encore de boutique." : 'ليس لديك متجر بعد.'}
                    </p>
                    <Link
                      to="/boutique/create-boutique"
                      className="inline-flex items-center gap-1.5 bg-amber-400 text-gray-900 font-bold text-sm px-4 py-2 rounded-xl hover:bg-amber-500 transition-colors"
                    >
                      <Plus size={14} /> {lang === 'fr' ? 'Créer ma boutique' : 'إنشاء متجري'}
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
