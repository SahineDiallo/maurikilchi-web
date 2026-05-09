export interface Country {
  code: string
  name: string
  flag: string
  dialCode: string
}

export const COUNTRIES: Country[] = [
  { code: 'MR', name: 'Mauritanie', flag: '🇲🇷', dialCode: '+222' },
  { code: 'SN', name: 'Sénégal', flag: '🇸🇳', dialCode: '+221' },
  { code: 'ML', name: 'Mali', flag: '🇲🇱', dialCode: '+223' },
  { code: 'MA', name: 'Maroc', flag: '🇲🇦', dialCode: '+212' },
  { code: 'DZ', name: 'Algérie', flag: '🇩🇿', dialCode: '+213' },
  { code: 'TN', name: 'Tunisie', flag: '🇹🇳', dialCode: '+216' },
  { code: 'EG', name: 'Égypte', flag: '🇪🇬', dialCode: '+20' },
  { code: 'FR', name: 'France', flag: '🇫🇷', dialCode: '+33' },
  { code: 'ES', name: 'Espagne', flag: '🇪🇸', dialCode: '+34' },
  { code: 'US', name: 'États-Unis', flag: '🇺🇸', dialCode: '+1' },
  { code: 'GN', name: 'Guinée', flag: '🇬🇳', dialCode: '+224' },
  { code: 'GM', name: 'Gambie', flag: '🇬🇲', dialCode: '+220' },
  { code: 'MR_', name: 'Autres', flag: '🌍', dialCode: '+' },
]

export const DEFAULT_COUNTRY: Country = COUNTRIES[0]
