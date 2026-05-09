export interface LocationGroup {
  groupLabel: string
  locations: string[]
}

export const LOCATION_GROUPS: LocationGroup[] = [
  {
    groupLabel: '🇲🇷 Nouakchott',
    locations: [
      'Tevragh Zeina', 'Ksar', 'Sebkha', 'El Mina', 'Arafat',
      'Riadh', 'Teyaret', 'Toujounine', 'Dar Naim', 'Ain Talh',
      'Socogim', 'Bouhdida', 'PK5', 'PK6', 'PK7', 'PK8',
    ],
  },
  {
    groupLabel: '🇲🇷 Mauritanie',
    locations: [
      'Nouadhibou', 'Kiffa', 'Kaédi', 'Rosso', 'Zouerate', 'Atar',
      'Tidjikja', 'Aleg', 'Boutilimit', 'Néma', 'Sélibaby', 'Akjoujt',
      'Aïoun el-Atrouss', 'Tichit', 'Chinguetti', 'Ouadane', 'Bogué',
      'Mbout', 'Kankossa', 'Maghama', 'Guerou', 'Tamchakett',
      'Bassikounou', 'Kobeni',
    ],
  },
  {
    groupLabel: '🇸🇳 Dakar',
    locations: [
      'Plateau', 'Médina', 'Grand Dakar', 'Fann', 'Point E', 'Mermoz',
      'Sacré-Cœur', 'Liberté 1', 'Liberté 2', 'Liberté 3', 'Liberté 4',
      'Liberté 5', 'Liberté 6', 'HLM', 'Dieuppeul', 'Biscuiterie',
      'Gueule Tapée', 'Grand Yoff', 'Ouakam', 'Yoff', 'Almadies', 'Ngor',
      'Parcelles Assainies', 'Pikine', 'Guédiawaye', 'Keur Massar',
      'Yeumbeul', 'Thiaroye', 'Mbao', 'Rufisque', 'Hann', 'Bargny',
    ],
  },
  {
    groupLabel: '🇸🇳 Sénégal',
    locations: [
      'Thiès', 'Saint-Louis', 'Kaolack', 'Ziguinchor', 'Touba',
      'Diourbel', 'Louga', 'Tambacounda', 'Kolda', 'Matam', 'Fatick',
      'Kaffrine', 'Sédhiou', 'Kédougou',
    ],
  },
  {
    groupLabel: '🌍 Autres pays',
    locations: [
      'Bamako', 'Abidjan', 'Conakry', 'Paris', 'Madrid',
    ],
  },
]

export const ALL_LOCATIONS: string[] = LOCATION_GROUPS.flatMap(g => g.locations)

// Backward-compat alias used by older imports
export const MAURITANIA_CITIES = ALL_LOCATIONS
