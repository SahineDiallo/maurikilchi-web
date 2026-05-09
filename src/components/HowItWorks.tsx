import { t, type Lang } from '../constants/i18n'

interface Props { lang: Lang }

export default function HowItWorks({ lang }: Props) {
  const isRtl = lang === 'ar'

  return (
    <section id="how-it-works" dir={isRtl ? 'rtl' : 'ltr'}
      className="border-t border-border bg-secondary/30 py-20 px-4 md:px-6">
      <div className="max-w-[1440px] mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs uppercase tracking-widest text-muted mb-2">{lang === 'fr' ? '— Simple & rapide' : '— بسيط وسريع'}</p>
          <h2 className="font-display text-3xl md:text-4xl font-medium tracking-tight">{t.howItWorks.title[lang]}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {t.howItWorks.steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center text-center p-8 bg-background rounded-2xl border border-border hover:shadow-md transition-shadow">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-5 bg-secondary">
                {step.icon}
              </div>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mb-4"
                style={{ background: '#F8AC12', color: '#0D0D0D' }}>
                {i + 1}
              </div>
              <h3 className="font-display text-lg font-medium mb-2">{step.title[lang]}</h3>
              <p className="text-sm text-muted leading-relaxed">{step.desc[lang]}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
