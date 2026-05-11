import { type Lang } from '../constants/i18n'
import HeroBanner from '../components/HeroBanner'
import ValueBar from '../components/ValueBar'
import CategoryWidgets from '../components/CategoryWidgets'
import FeaturedProducts from '../components/FeaturedProducts'
import HowItWorks from '../components/HowItWorks'
import AppDownload from '../components/AppDownload'
import { useNavigate } from 'react-router-dom'
import { useSeo } from '../hooks/useSeo'

interface Props { lang: Lang }

export default function HomePage({ lang }: Props) {
  const navigate = useNavigate()
  const goToParent  = (key: string)  => navigate(`/explorer?parent=${key}`)
  const goToSubCat  = (slug: string) => navigate(`/explorer?cat=${slug}`)

  useSeo({
    title       : 'Vente en ligne & Livraison en Mauritanie',
    description : 'Maurikilchi est la première marketplace mauritanienne. Achetez, vendez, faites livrer à Nouakchott et partout en Mauritanie. Car rapide, livraison à domicile, boutiques en ligne.',
    keywords    : 'Maurikilchi, vente en ligne Mauritanie, e-commerce Mauritanie, livraison Mauritanie, livraison Nouakchott, livraison à domicile, car rapide Nouakchott, boutique en ligne Mauritanie, marché en ligne, acheter Mauritanie, توصيل موريتانيا, تجارة إلكترونية موريتانيا',
    url         : 'https://maurikilchi.com',
    schema      : {
      '@context': 'https://schema.org',
      '@type'   : 'WebPage',
      name      : 'Maurikilchi — Accueil',
      url       : 'https://maurikilchi.com',
      description: 'Marketplace mauritanienne : vente en ligne, livraison, car rapide, boutiques.',
      breadcrumb: { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://maurikilchi.com' }] },
    },
  })

  return (
    <div className="pt-[152px] sm:pt-[100px]">
      <HeroBanner lang={lang} />
      <ValueBar lang={lang} />
      <CategoryWidgets lang={lang} onFilter={goToParent} onSubFilter={goToSubCat} />
      <FeaturedProducts lang={lang} />
      <HowItWorks lang={lang} />
      <AppDownload lang={lang} />
    </div>
  )
}
