import type { WeaponEnchantment, StatusEffectType } from '~/types'

/**
 * 武器エンチャントデータベース
 * 接頭辞・接尾辞として武器名に付与され、ステータスや効果を変化させる
 */

export const ENCHANTMENTS: WeaponEnchantment[] = [
  // === 接頭辞：速度系 ===
  {
    id: 'swift',
    name: 'すばやい',
    position: 'prefix',
    rarityBonus: 0,
    statModifiers: {
      speed: 1.3,
      attack: 0.9
    },
    addTags: ['fast'],
    weight: 10
  },
  {
    id: 'lightning',
    name: '電光石火の',
    position: 'prefix',
    rarityBonus: 1,
    statModifiers: {
      speed: 1.6,
      attack: 0.85,
      critChance: 1.2
    },
    addTags: ['fast', 'elemental'],
    weight: 3
  },

  // === 接頭辞：攻撃系 ===
  {
    id: 'heavy',
    name: '重い',
    position: 'prefix',
    rarityBonus: 0,
    statModifiers: {
      attack: 1.3,
      speed: 0.8
    },
    addTags: ['heavy'],
    weight: 10
  },
  {
    id: 'brutal',
    name: '残忍な',
    position: 'prefix',
    rarityBonus: 1,
    statModifiers: {
      attack: 1.5,
      critDamage: 1.2,
      speed: 0.7
    },
    addTags: ['heavy', 'bloodthirsty'],
    weight: 4
  },
  {
    id: 'titans',
    name: '巨人の',
    position: 'prefix',
    rarityBonus: 1,
    statModifiers: {
      attack: 1.6,
      speed: 0.6
    },
    addTags: ['heavy'],
    weight: 2
  },

  // === 接頭辞：魔法力系 ===
  {
    id: 'magical',
    name: '魔力のこもった',
    position: 'prefix',
    rarityBonus: 0,
    statModifiers: {
      magic: 1.4,
      attack: 0.8
    },
    addTags: ['elemental'],
    weight: 8
  },
  {
    id: 'arcane',
    name: '秘術の',
    position: 'prefix',
    rarityBonus: 1,
    statModifiers: {
      magic: 1.7,
      statusPower: 1.3,
      attack: 0.7
    },
    addTags: ['elemental', 'cursed'],
    weight: 3
  },

  // === 接頭辞：クリティカル系 ===
  {
    id: 'precise',
    name: '精密な',
    position: 'prefix',
    rarityBonus: 0,
    statModifiers: {
      critChance: 1.5,
      critDamage: 1.1
    },
    addTags: ['precise'],
    weight: 8
  },
  {
    id: 'deadly',
    name: '致命的な',
    position: 'prefix',
    rarityBonus: 1,
    statModifiers: {
      critChance: 1.8,
      critDamage: 1.4
    },
    addTags: ['precise'],
    weight: 3
  },

  // === 接頭辞：状態異常系 ===
  {
    id: 'venomous',
    name: '猛毒の',
    position: 'prefix',
    rarityBonus: 0,
    statModifiers: {
      statusPower: 1.4
    },
    addTags: ['venomous'],
    addEffects: [{
      type: 'poison' as StatusEffectType,
      chance: 30,
      stacks: 2,
      duration: 3
    }],
    weight: 7
  },
  {
    id: 'flaming',
    name: '炎を盛る',
    position: 'prefix',
    rarityBonus: 0,
    statModifiers: {
      magic: 1.2,
      statusPower: 1.3
    },
    addTags: ['flame', 'elemental'],
    addEffects: [{
      type: 'burn' as StatusEffectType,
      chance: 35,
      stacks: 2,
      duration: 3
    }],
    weight: 7
  },
  {
    id: 'frost',
    name: '凍てつく',
    position: 'prefix',
    rarityBonus: 1,
    statModifiers: {
      magic: 1.3,
      statusPower: 1.4
    },
    addTags: ['frost', 'elemental'],
    addEffects: [{
      type: 'frozen' as StatusEffectType,
      chance: 15,
      stacks: 1,
      duration: 2
    }],
    weight: 4
  },
  {
    id: 'bloodthirsty',
    name: '出血の',
    position: 'prefix',
    rarityBonus: 0,
    statModifiers: {
      attack: 1.1,
      statusPower: 1.3
    },
    addTags: ['bloodthirsty'],
    addEffects: [{
      type: 'bleed' as StatusEffectType,
      chance: 40,
      stacks: 2,
      duration: 4
    }],
    weight: 7
  },
  {
    id: 'poisonous',
    name: '毒塗れの',
    position: 'prefix',
    rarityBonus: 0,
    statModifiers: {
      statusPower: 1.4,
      attack: 0.9
    },
    addTags: ['venomous'],
    addEffects: [{
      type: 'poison' as StatusEffectType,
      chance: 35,
      stacks: 2,
      duration: 4
    }],
    weight: 7
  },
  {
    id: 'terrifying',
    name: '恐怖の',
    position: 'prefix',
    rarityBonus: 1,
    statModifiers: {
      magic: 1.3,
      statusPower: 1.3
    },
    addTags: ['cursed'],
    addEffects: [{
      type: 'fear' as StatusEffectType,
      chance: 20,
      stacks: 1,
      duration: 2
    }],
    weight: 4
  },
  {
    id: 'sleepy',
    name: '眠りの',
    position: 'prefix',
    rarityBonus: 1,
    statModifiers: {
      magic: 1.2,
      statusPower: 1.4
    },
    addTags: ['cursed'],
    addEffects: [{
      type: 'sleep' as StatusEffectType,
      chance: 18,
      stacks: 1,
      duration: 2
    }],
    weight: 3
  },

  // === 接頭辞：特殊系 ===
  {
    id: 'cursed',
    name: '呪われた',
    position: 'prefix',
    rarityBonus: 1,
    statModifiers: {
      attack: 1.4,
      magic: 1.4,
      critChance: 1.3,
      critDamage: 1.3
    },
    addTags: ['cursed'],
    weight: 2
  },
  {
    id: 'vampiric',
    name: '吸血の',
    position: 'prefix',
    rarityBonus: 1,
    statModifiers: {
      attack: 1.2,
      statusPower: 1.2
    },
    addTags: ['healing', 'cursed'],
    weight: 3
  },
  {
    id: 'balanced',
    name: 'バランスの取れた',
    position: 'prefix',
    rarityBonus: 0,
    statModifiers: {
      attack: 1.1,
      magic: 1.1,
      speed: 1.1
    },
    addTags: ['versatile'],
    weight: 6
  },

  // === 接尾辞：特化系 ===
  {
    id: 'destruction',
    name: '破壊',
    position: 'suffix',
    rarityBonus: 1,
    statModifiers: {
      attack: 1.4,
      critDamage: 1.3
    },
    weight: 4
  },
  {
    id: 'fury',
    name: '激怒',
    position: 'suffix',
    rarityBonus: 0,
    statModifiers: {
      attack: 1.2,
      speed: 1.2
    },
    addTags: ['fast'],
    weight: 6
  },
  {
    id: 'storm',
    name: '嵐',
    position: 'suffix',
    rarityBonus: 1,
    statModifiers: {
      magic: 1.5,
      speed: 1.2
    },
    addTags: ['elemental', 'fast'],
    weight: 3
  },
  {
    id: 'venom',
    name: '猛毒',
    position: 'suffix',
    rarityBonus: 0,
    statModifiers: {
      statusPower: 1.5
    },
    addTags: ['venomous'],
    addEffects: [{
      type: 'poison' as StatusEffectType,
      chance: 40,
      stacks: 3,
      duration: 4
    }],
    weight: 5
  },
  {
    id: 'fire',
    name: '業火',
    position: 'suffix',
    rarityBonus: 1,
    statModifiers: {
      magic: 1.3,
      statusPower: 1.4
    },
    addTags: ['flame', 'elemental'],
    addEffects: [{
      type: 'burn' as StatusEffectType,
      chance: 45,
      stacks: 3,
      duration: 3
    }],
    weight: 4
  },
  {
    id: 'ice',
    name: '氷結',
    position: 'suffix',
    rarityBonus: 1,
    statModifiers: {
      magic: 1.4,
      statusPower: 1.3
    },
    addTags: ['frost', 'elemental'],
    addEffects: [{
      type: 'frozen' as StatusEffectType,
      chance: 15,
      stacks: 1,
      duration: 2
    }],
    weight: 4
  },
  {
    id: 'plague',
    name: '疫病',
    position: 'suffix',
    rarityBonus: 1,
    statModifiers: {
      statusPower: 1.6,
      magic: 1.2
    },
    addTags: ['cursed', 'venomous'],
    addEffects: [{
      type: 'epidemic' as StatusEffectType,
      chance: 30,
      stacks: 3,
      duration: 4
    }],
    weight: 2
  },
  {
    id: 'vulnerability',
    name: '脆弱',
    position: 'suffix',
    rarityBonus: 0,
    statModifiers: {
      statusPower: 1.4,
      attack: 1.1
    },
    addEffects: [{
      type: 'vulnerable' as StatusEffectType,
      chance: 40,
      stacks: 2,
      duration: 3
    }],
    weight: 5
  },
  {
    id: 'precision',
    name: '精密',
    position: 'suffix',
    rarityBonus: 0,
    statModifiers: {
      critChance: 1.4,
      critDamage: 1.2
    },
    addTags: ['precise'],
    weight: 6
  },
  {
    id: 'swiftness',
    name: '迅速',
    position: 'suffix',
    rarityBonus: 0,
    statModifiers: {
      speed: 1.4,
      critChance: 1.1
    },
    addTags: ['fast'],
    weight: 6
  },
  {
    id: 'protection',
    name: '守護',
    position: 'suffix',
    rarityBonus: 0,
    statModifiers: {
      attack: 0.9,
      magic: 0.9
    },
    addTags: ['defensive'],
    weight: 4
  },
  {
    id: 'mastery',
    name: '熟練',
    position: 'suffix',
    rarityBonus: 1,
    statModifiers: {
      attack: 1.2,
      magic: 1.2,
      critChance: 1.2,
      critDamage: 1.2
    },
    addTags: ['versatile'],
    weight: 2
  },
  {
    id: 'chaos',
    name: '混沌',
    position: 'suffix',
    rarityBonus: 1,
    statModifiers: {
      attack: 1.3,
      magic: 1.3,
      speed: 1.1,
      statusPower: 1.3
    },
    addTags: ['cursed', 'elemental'],
    weight: 2
  },
  {
    id: 'slaughter',
    name: '虐殺',
    position: 'suffix',
    rarityBonus: 1,
    statModifiers: {
      attack: 1.5,
      critDamage: 1.4
    },
    addTags: ['heavy', 'bloodthirsty'],
    addEffects: [{
      type: 'bleed' as StatusEffectType,
      chance: 50,
      stacks: 4,
      duration: 4
    }],
    weight: 2
  }
]

/**
 * IDでエンチャントを取得
 */
export function getEnchantmentById(id: string): WeaponEnchantment | undefined {
  return ENCHANTMENTS.find(e => e.id === id)
}

/**
 * 接頭辞エンチャントを取得
 */
export function getPrefixEnchantments(): WeaponEnchantment[] {
  return ENCHANTMENTS.filter(e => e.position === 'prefix')
}

/**
 * 接尾辞エンチャントを取得
 */
export function getSuffixEnchantments(): WeaponEnchantment[] {
  return ENCHANTMENTS.filter(e => e.position === 'suffix')
}

/**
 * 重みに基づいてランダムなエンチャントを選択
 */
export function getRandomEnchantment(position: 'prefix' | 'suffix'): WeaponEnchantment | null {
  const enchantments = position === 'prefix' ? getPrefixEnchantments() : getSuffixEnchantments()
  const totalWeight = enchantments.reduce((sum, e) => sum + e.weight, 0)
  let random = Math.random() * totalWeight
  
  for (const enchantment of enchantments) {
    random -= enchantment.weight
    if (random <= 0) {
      return enchantment
    }
  }
  
  return enchantments[0] || null
}
