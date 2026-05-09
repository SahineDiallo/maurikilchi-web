export type Lang = 'fr' | 'ar'

export const t = {
  nav: {
    browse: { fr: 'Explorer', ar: 'استكشف' },
    howItWorks: { fr: 'Comment ça marche', ar: 'كيف يعمل' },
    download: { fr: 'Télécharger l\'appli', ar: 'تحميل التطبيق' },
  },
  hero: {
    tag: { fr: 'Marketplace mauritanien', ar: 'السوق الموريتاني' },
    title: { fr: 'Tout ce dont vous avez besoin,\nlivré chez vous.', ar: 'كل ما تحتاجه،\nيصلك إلى باب بيتك.' },
    subtitle: {
      fr: 'Boutiques locales, restaurants, arrivages et bien plus — découvrez le meilleur de la Mauritanie.',
      ar: 'محلات محلية، مطاعم، بضائع جديدة وأكثر — اكتشف أفضل ما في موريتانيا.'
    },
    searchPlaceholder: { fr: 'Chercher une boutique, un produit…', ar: 'ابحث عن متجر أو منتج...' },
    searchBtn: { fr: 'Chercher', ar: 'بحث' },
    ctaApp: { fr: 'Télécharger l\'appli', ar: 'تحميل التطبيق' },
    stats: {
      boutiques: { fr: 'boutiques actives', ar: 'متجر نشط' },
      products: { fr: 'produits listés', ar: 'منتج مدرج' },
      cities: { fr: 'villes couvertes', ar: 'مدينة مشمولة' },
    }
  },
  categories: {
    title: { fr: 'Explorez par catégorie', ar: 'استكشف حسب الفئة' },
    all: { fr: 'Tout', ar: 'الكل' },
  },
  boutiques: {
    title: { fr: 'Boutiques en vedette', ar: 'المتاجر المميزة' },
    products: { fr: 'produits', ar: 'منتج' },
    viewAll: { fr: 'Voir toutes les boutiques', ar: 'عرض جميع المتاجر' },
    empty: { fr: 'Aucune boutique trouvée', ar: 'لا توجد متاجر' },
  },
  howItWorks: {
    title: { fr: 'Comment ça marche', ar: 'كيف يعمل' },
    subtitle: { fr: 'Simple, rapide et local.', ar: 'بسيط وسريع ومحلي.' },
    steps: [
      {
        title: { fr: 'Téléchargez l\'appli', ar: 'حمّل التطبيق' },
        desc: { fr: 'Disponible sur Android. Créez votre compte en quelques secondes.', ar: 'متاح على أندرويد. أنشئ حسابك في ثوانٍ.' },
        icon: '📱',
      },
      {
        title: { fr: 'Explorez les boutiques', ar: 'استكشف المتاجر' },
        desc: { fr: 'Restaurants, supermarché, arrivages — tout est à portée de main.', ar: 'مطاعم، سوبرماركت، بضائع جديدة — كل شيء في متناول يدك.' },
        icon: '🛍️',
      },
      {
        title: { fr: 'Commandez & recevez', ar: 'اطلب واستلم' },
        desc: { fr: 'Passez votre commande et faites-la livrer directement chez vous.', ar: 'اطلب وسيصلك مباشرة إلى باب منزلك.' },
        icon: '🚀',
      },
    ],
  },
  appDownload: {
    title: { fr: 'Disponible sur Android', ar: 'متاح على أندرويد' },
    subtitle: {
      fr: 'Téléchargez MAURI-KILCHI et commencez à explorer les meilleures boutiques de Mauritanie.',
      ar: 'حمّل MAURI-KILCHI وابدأ باستكشاف أفضل المتاجر في موريتانيا.'
    },
    btn: { fr: 'Télécharger sur Google Play', ar: 'تحميل من Google Play' },
  },
  footer: {
    tagline: { fr: 'Le marché de la Mauritanie.', ar: 'سوق موريتانيا.' },
    links: {
      title: { fr: 'Liens utiles', ar: 'روابط مفيدة' },
      browse: { fr: 'Explorer les boutiques', ar: 'استكشف المتاجر' },
      howItWorks: { fr: 'Comment ça marche', ar: 'كيف يعمل' },
      download: { fr: 'Télécharger l\'appli', ar: 'تحميل التطبيق' },
    },
    contact: {
      title: { fr: 'Contact', ar: 'تواصل معنا' },
    },
    rights: { fr: 'Tous droits réservés.', ar: 'جميع الحقوق محفوظة.' },
  },
  types: {
    restaurant: { fr: 'Restaurant', ar: 'مطعم' },
    arrivage: { fr: 'Arrivage', ar: 'بضائع جديدة' },
    supermarche: { fr: 'Supermarché', ar: 'سوبرماركت' },
    electronique: { fr: 'Électronique', ar: 'إلكترونيات' },
    quincaillerie: { fr: 'Quincaillerie', ar: 'أدوات' },
    autre: { fr: 'Autre', ar: 'أخرى' },
  }
}

export const typeEmojis: Record<string, string> = {
  restaurant: '🍽️',
  arrivage: '📦',
  supermarche: '🛒',
  electronique: '📱',
  quincaillerie: '🔧',
  autre: '🏪',
}
