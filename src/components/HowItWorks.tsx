import { t, Lang } from '../constants/i18n'

interface Props { lang: Lang }

export default function HowItWorks({ lang }: Props) {
  const isRtl = lang === 'ar'

  return (
    <section
      id="how-it-works"
      dir={isRtl ? 'rtl' : 'ltr'}
      className="py-20 px-4 sm:px-6"
      style={{ background: 'linear-gradient(180deg, #FAFAF8 0%, #FFFBF0 100%)' }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">{t.howItWorks.title[lang]}</h2>
          <p className="text-gray-500 text-base">{t.howItWorks.subtitle[lang]}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {t.howItWorks.steps.map((step, i) => (
            <div key={i} className="relative flex flex-col items-center text-center">
              {/* Connector line */}
              {i < t.howItWorks.steps.length - 1 && (
                <div className={`hidden md:block absolute top-10 ${isRtl ? 'left-0' : 'right-0'} w-1/2 border-t-2 border-dashed border-amber-200`} />
              )}

              {/* Icon circle */}
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl mb-5 shadow-sm relative z-10"
                style={{ background: 'white', border: '2px solid #FFE0B2' }}
              >
                {step.icon}
              </div>

              {/* Step number */}
              <div
                className="absolute top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white z-20"
                style={{ background: '#F8AC12', [isRtl ? 'left' : 'right']: '30%' }}
              >
                {i + 1}
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title[lang]}</h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs">{step.desc[lang]}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
