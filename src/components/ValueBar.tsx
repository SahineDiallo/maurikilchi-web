import { type Lang } from '../constants/i18n'

interface Props { lang: Lang }

const ITEMS = (lang: Lang) => [
  { icon: '🚚', title: lang === 'fr' ? 'Livraison locale' : 'توصيل محلي', sub: lang === 'fr' ? 'Dans toute la Mauritanie' : 'في جميع أنحاء موريتانيا' },
  { icon: '💬', title: 'WhatsApp', sub: lang === 'fr' ? 'Commandez via WhatsApp' : 'اطلب عبر واتساب' },
  { icon: '✅', title: lang === 'fr' ? 'Vendeurs vérifiés' : 'بائعون موثوقون', sub: lang === 'fr' ? 'Boutiques de confiance' : 'متاجر موثوقة' },
  { icon: '🔄', title: lang === 'fr' ? 'Mis à jour en temps réel' : 'تحديث فوري', sub: lang === 'fr' ? 'Stocks toujours à jour' : 'المخزون محدث دائماً' },
]

export default function ValueBar({ lang }: Props) {
  return (
    <section className="border-y border-border bg-secondary/40">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-5">
        {ITEMS(lang).map(item => (
          <div key={item.title} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center shrink-0 shadow-sm text-lg">
              {item.icon}
            </div>
            <div>
              <p className="text-sm md:text-base font-semibold text-foreground">{item.title}</p>
              <p className="text-xs md:text-sm text-muted">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
