import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import type { Lang } from './constants/i18n'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import HomePage from './pages/HomePage'
import ExplorePage from './pages/ExplorePage'
import ProductDetailPage from './pages/ProductDetailPage'
import BoutiquePage from './pages/BoutiquePage'
import BoutiquesListPage from './pages/BoutiquesListPage'
import SignInPage from './pages/auth/SignInPage'
import RegisterPage from './pages/auth/RegisterPage'
import VerifyPage from './pages/auth/VerifyPage'
import LivraisonPage from './pages/services/LivraisonPage'
import CarRapidePage from './pages/services/CarRapidePage'
import LongVoyagePage from './pages/services/LongVoyagePage'
import ProfilePage from './pages/ProfilePage'
import CreateBoutiquePage from './pages/CreateBoutiquePage'

export default function App() {
  const [lang, setLang] = useState<Lang>('fr')

  return (
    <AuthProvider>
      <AppShell lang={lang} setLang={setLang} />
    </AuthProvider>
  )
}

function AppShell({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <ScrollToTop />
      <Routes>
        {/* Auth pages — no Navbar/Footer */}
        <Route path="/connexion"   element={<SignInPage lang={lang} />} />
        <Route path="/inscription" element={<RegisterPage lang={lang} />} />
        <Route path="/verification" element={<VerifyPage lang={lang} />} />

        {/* Main app pages */}
        <Route path="*" element={
          <>
            <Navbar lang={lang} onLangToggle={() => setLang(lang === 'fr' ? 'ar' : 'fr')} />
            <Routes>
              <Route path="/" element={<HomePage lang={lang} />} />
              <Route path="/explorer" element={<ExplorePage lang={lang} />} />
              <Route path="/produit/:slug" element={<ProductDetailPage lang={lang} />} />
              <Route path="/boutiques" element={<BoutiquesListPage lang={lang} />} />
              <Route path="/boutique/:slug" element={<BoutiquePage lang={lang} />} />
              <Route path="/livraison" element={<LivraisonPage lang={lang} />} />
              <Route path="/car-rapide" element={<CarRapidePage lang={lang} />} />
              <Route path="/long-voyage" element={<LongVoyagePage lang={lang} />} />
              <Route path="/compte" element={<ProfilePage lang={lang} />} />
              <Route path="/boutique/create-boutique" element={<CreateBoutiquePage lang={lang} />} />
            </Routes>
            <Footer lang={lang} />
          </>
        } />
      </Routes>
    </div>
  )
}
