import { type Lang } from '../constants/i18n'
import HeroBanner from '../components/HeroBanner'
import ValueBar from '../components/ValueBar'
import CategoryWidgets from '../components/CategoryWidgets'
import FeaturedProducts from '../components/FeaturedProducts'
import HowItWorks from '../components/HowItWorks'
import AppDownload from '../components/AppDownload'
import { useNavigate } from 'react-router-dom'

interface Props { lang: Lang }

export default function HomePage({ lang }: Props) {
  const navigate = useNavigate()
  const goToParent  = (key: string)  => navigate(`/explorer?parent=${key}`)
  const goToSubCat  = (slug: string) => navigate(`/explorer?cat=${slug}`)

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
