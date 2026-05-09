// Mirrors the backend seed_categories.py — single source of truth for the web

export interface SubCategory {
  slug: string
  label: { fr: string; ar: string }
  img: string // Unsplash image for hover thumbnails
}

export interface ParentCategory {
  key: string          // matches boutique_type on the backend
  emoji: string
  label: { fr: string; ar: string }
  subs: SubCategory[]
}

const u = (id: string) => `https://images.unsplash.com/${id}?w=600&q=80`

export const CATEGORIES: ParentCategory[] = [
  {
    key: 'restaurant',
    emoji: '🍽️',
    label: { fr: 'Restaurants', ar: 'مطاعم' },
    subs: [
      { slug: 'burgers',            label: { fr: 'Burgers',             ar: 'برغر'           }, img: u('photo-1568901346375-23c9450c58cd') },
      { slug: 'pizzas',             label: { fr: 'Pizzas',              ar: 'بيتزا'           }, img: u('photo-1565299624946-b28f40a0ae38') },
      { slug: 'poulet',             label: { fr: 'Poulet',              ar: 'دجاج'            }, img: u('photo-1604908176997-125f25cc6f3d') },
      { slug: 'sandwichs',          label: { fr: 'Sandwichs',           ar: 'ساندويتش'        }, img: u('photo-1528735602780-2552fd46c7af') },
      { slug: 'tacos',              label: { fr: 'Tacos',               ar: 'تاكو'            }, img: u('photo-1551504734-5ee1c4a1479b') },
      { slug: 'plats-traditionnels',label: { fr: 'Plats traditionnels', ar: 'أطباق تقليدية'  }, img: u('photo-1476718406336-bb5a9690ee2a') },
      { slug: 'desserts',           label: { fr: 'Desserts',            ar: 'حلويات'          }, img: u('photo-1563805042-7684c019e1cb') },
      { slug: 'boissons-resto',     label: { fr: 'Boissons',            ar: 'مشروبات'         }, img: u('photo-1544145945-f90425340c7e') },
      { slug: 'petit-dejeuner',     label: { fr: 'Petit déjeuner',      ar: 'فطور'            }, img: u('photo-1504754524776-8f4f37790ca0') },
      { slug: 'poissons-mer',       label: { fr: 'Poissons & Mer',      ar: 'سمك وبحر'        }, img: u('photo-1534482421-64566f976cfa') },
    ],
  },
  {
    key: 'supermarche',
    emoji: '🛒',
    label: { fr: 'Supermarché', ar: 'سوبرماركت' },
    subs: [
      { slug: 'fruits-legumes',      label: { fr: 'Fruits & Légumes',      ar: 'فواكه وخضروات' }, img: u('photo-1542838132-92c53300491e') },
      { slug: 'viandes-poissons',    label: { fr: 'Viandes & Poissons',    ar: 'لحوم وسمك'     }, img: u('photo-1615937657715-bc7b4b7962c1') },
      { slug: 'produits-laitiers',   label: { fr: 'Produits laitiers',     ar: 'منتجات الألبان' }, img: u('photo-1563636619-e9143da7973b') },
      { slug: 'epicerie',            label: { fr: 'Épicerie',              ar: 'بقالة'          }, img: u('photo-1578916171728-46686eac8d58') },
      { slug: 'snacks-confiseries',  label: { fr: 'Snacks & Confiseries',  ar: 'سناكات وحلوى'  }, img: u('photo-1621939514649-280e2ee25f60') },
      { slug: 'hygiene-beaute',      label: { fr: 'Hygiène & Beauté',      ar: 'نظافة وجمال'   }, img: u('photo-1556228578-8c89e6adf883') },
      { slug: 'produits-menagers',   label: { fr: 'Produits ménagers',     ar: 'منتجات منزلية' }, img: u('photo-1563453392212-326f5e854473') },
      { slug: 'boulangerie',         label: { fr: 'Boulangerie',           ar: 'مخبز'           }, img: u('photo-1509440159596-0249088772ff') },
      { slug: 'boissons-eau',        label: { fr: 'Boissons & Eau',        ar: 'مشروبات ومياه' }, img: u('photo-1543256485-25d3b8bc6d4a') },
    ],
  },
  {
    key: 'arrivage',
    emoji: '📦',
    label: { fr: 'Arrivages', ar: 'بضائع جديدة' },
    subs: [
      // Clothing: flat-lay / product-only shots — no people
      { slug: 'vetements-homme',    label: { fr: 'Vêtements Homme',    ar: 'ملابس رجالية'    }, img: u('photo-1602810318383-e386cc2a3ccf') },
      { slug: 'vetements-femme',    label: { fr: 'Vêtements Femme',    ar: 'ملابس نسائية'    }, img: u('photo-1567401893414-76b7b1e5a7a5') },
      { slug: 'vetements-enfant',   label: { fr: 'Vêtements Enfant',   ar: 'ملابس أطفال'     }, img: u('photo-1471286174890-9c112ffca5b4') },
      { slug: 'chaussures',         label: { fr: 'Chaussures',         ar: 'أحذية'            }, img: u('photo-1542291026-7eec264c27ff') },
      { slug: 'sacs-maroquinerie',  label: { fr: 'Sacs & Maroquinerie',ar: 'حقائب وجلديات'  }, img: u('photo-1548036328-c9fa89d128fa') },
      { slug: 'accessoires-mode',   label: { fr: 'Accessoires mode',   ar: 'إكسسوارات'       }, img: u('photo-1535632066927-ab7c9ab60908') },
      { slug: 'linge-maison',       label: { fr: 'Linge de maison',    ar: 'مفروشات'          }, img: u('photo-1617325247661-675ab4b64ae2') },
    ],
  },
  {
    key: 'electronique',
    emoji: '📱',
    label: { fr: 'Électronique', ar: 'إلكترونيات' },
    subs: [
      { slug: 'telephones',          label: { fr: 'Téléphones',              ar: 'هواتف'            }, img: u('photo-1511707171634-5f897ff02aa9') },
      { slug: 'accessoires-tel',     label: { fr: 'Accessoires téléphone',   ar: 'ملحقات الهاتف'   }, img: u('photo-1601784551446-20c9e07cdbdb') },
      { slug: 'audio-son',           label: { fr: 'Audio & Son',             ar: 'صوتيات'           }, img: u('photo-1505740420928-5e560c06d30e') },
      { slug: 'ordinateurs-tablettes',label: { fr: 'Ordinateurs & Tablettes',ar: 'حواسيب وأجهزة'  }, img: u('photo-1496181133206-80ce9b88a853') },
      { slug: 'tv-ecrans',           label: { fr: 'TV & Écrans',             ar: 'تلفزيونات وشاشات' }, img: u('photo-1593784991095-a205069470b6') },
      { slug: 'electromenager',      label: { fr: 'Électroménager',          ar: 'أجهزة منزلية'    }, img: u('photo-1556909172-8c2f041fca1e') },
      { slug: 'jeux-consoles',       label: { fr: 'Jeux & Consoles',         ar: 'ألعاب وأجهزة'    }, img: u('photo-1606144042614-b2417e99c4e3') },
      { slug: 'reseaux',             label: { fr: 'Réseaux',                 ar: 'شبكات'            }, img: u('photo-1544197150-b99a580bb7a8') },
    ],
  },
  {
    key: 'parc_auto',
    emoji: '🚗',
    label: { fr: 'Parc Auto', ar: 'معرض سيارات' },
    subs: [
      { slug: 'voitures-occasion',  label: { fr: "Voitures d'occasion", ar: 'سيارات مستعملة'  }, img: u('photo-1494976388531-d1058494cdd8') },
      { slug: 'voitures-neuves',    label: { fr: 'Voitures neuves',      ar: 'سيارات جديدة'    }, img: u('photo-1503376780353-7e6692767b70') },
      { slug: 'motos-scooters',     label: { fr: 'Motos & Scooters',     ar: 'دراجات نارية'    }, img: u('photo-1558981403-c5f9899a28bc') },
      { slug: 'camions-utilitaires',label: { fr: 'Camions & Utilitaires',ar: 'شاحنات'          }, img: u('photo-1601584115197-04ecc0da31d7') },
      { slug: 'pieces-detachees',   label: { fr: 'Pièces détachées',     ar: 'قطع غيار'        }, img: u('photo-1492144534655-ae79c964c9d7') },
      { slug: 'accessoires-auto',   label: { fr: 'Accessoires auto',     ar: 'إكسسوارات السيارة'}, img: u('photo-1621929747188-0b4dc28498d2') },
    ],
  },
  {
    key: 'autre',
    emoji: '🏪',
    label: { fr: 'Autres', ar: 'أخرى' },
    subs: [
      { slug: 'vehicules',     label: { fr: 'Véhicules',            ar: 'مركبات'          }, img: u('photo-1494976388531-d1058494cdd8') },
      { slug: 'immobilier',    label: { fr: 'Immobilier',           ar: 'عقارات'          }, img: u('photo-1560518883-ce09059eeffa') },
      { slug: 'maison',        label: { fr: 'Maison',               ar: 'المنزل'          }, img: u('photo-1555041469-a586c61ea9bc') },
      { slug: 'mode-beaute',   label: { fr: 'Mode & Beauté',        ar: 'أزياء وجمال'    }, img: u('photo-1596462502278-27bfdc403348') },
      { slug: 'sport-loisirs', label: { fr: 'Sport & Loisirs',      ar: 'رياضة وترفيه'   }, img: u('photo-1571019614242-c5c5dee9f50b') },
      { slug: 'emploi',        label: { fr: "Demande d'emploi",     ar: 'طلب عمل'        }, img: u('photo-1586281380349-632531db7ed4') },
      { slug: 'materiaux',     label: { fr: 'Matériaux & Outils',   ar: 'مواد وأدوات'    }, img: u('photo-1504148455328-c376907d081c') },
      { slug: 'aliments',      label: { fr: 'Aliments',             ar: 'مواد غذائية'    }, img: u('photo-1504674900247-0877df9cc836') },
      { slug: 'animaux',       label: { fr: 'Animaux',              ar: 'حيوانات'         }, img: u('photo-1516750105099-4b8a83e217ee') },
    ],
  },
]
