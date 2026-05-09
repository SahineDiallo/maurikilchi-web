import { useState } from 'react'
import { Lang } from './constants/i18n'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import BoutiqueGrid from './components/BoutiqueGrid'
import HowItWorks from './components/HowItWorks'
import AppDownload from './components/AppDownload'
import Footer from './components/Footer'
import './index.css'

export default function App() {
  const [lang, setLang] = useState<Lang>('fr')
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (q: string) => {
    setSearchQuery(q)
    document.getElementById('boutiques')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar lang={lang} onLangToggle={() => setLang(l => l === 'fr' ? 'ar' : 'fr')} />
      <main className="flex-1">
        <Hero lang={lang} onSearch={handleSearch} />
        <BoutiqueGrid lang={lang} searchQuery={searchQuery} />
        <HowItWorks lang={lang} />
        <AppDownload lang={lang} />
      </main>
      <Footer lang={lang} />
    </div>
  )
}
