import type { WeaponTag } from '../types'

/**
 * タグシナジーの定義
 */
export interface TagSynergy {
  tag: WeaponTag
  name: string
  description: string
  bonusPerStack: {
    attack?: number
    magic?: number
    defense?: number
    magicDefense?: number
    speed?: number
    critChance?: number
  }
}

export const TAG_SYNERGIES: Record<WeaponTag, TagSynergy> = {
  fast: {
    tag: 'fast',
    name: '高速戦闘',
    description: '速度が上昇する',
    bonusPerStack: { speed: 3, critChance: 2 }
  },
  heavy: {
    tag: 'heavy',
    name: '重装備',
    description: '攻撃力と防御力が上昇',
    bonusPerStack: { attack: 4, defense: 2 }
  },
  precise: {
    tag: 'precise',
    name: '精密射撃',
    description: 'クリティカル率が大幅に上昇',
    bonusPerStack: { critChance: 5, attack: 2 }
  },
  elemental: {
    tag: 'elemental',
    name: '属性魔法',
    description: '魔法攻撃力が上昇',
    bonusPerStack: { magic: 4, magicDefense: 1 }
  },
  cursed: {
    tag: 'cursed',
    name: '呪い系',
    description: '魔法防御が上昇し敵を呪いやすくなる',
    bonusPerStack: { magicDefense: 3, magic: 2 }
  },
  bleeding: {
    tag: 'bleeding',
    name: '出血系',
    description: '攻撃力とスタン効果が上昇',
    bonusPerStack: { attack: 3, defense: 1 }
  }
}

/**
 * 装備中の武器から装備タグのボーナスを計算
 */
export function calculateTagBonuses(weapons: any[]) {
  const tagCount: Record<WeaponTag, number> = {
    fast: 0,
    heavy: 0,
    precise: 0,
    elemental: 0,
    cursed: 0,
    bleeding: 0
  }

  // タグをカウント
  for (const weapon of weapons) {
    const tags = weapon.tags as WeaponTag[]
    for (const tag of tags) {
      tagCount[tag] = (tagCount[tag] ?? 0) + 1
    }
  }

  // ボーナス計算
  const bonuses = {
    attack: 0,
    magic: 0,
    defense: 0,
    magicDefense: 0,
    speed: 0,
    critChance: 0
  }

  for (const [tag, count] of Object.entries(tagCount)) {
    if (count >= 2) {
      const synergy = TAG_SYNERGIES[tag as WeaponTag]
      const stackBonus = count - 1
      
      if (synergy.bonusPerStack.attack) bonuses.attack += synergy.bonusPerStack.attack * stackBonus
      if (synergy.bonusPerStack.magic) bonuses.magic += synergy.bonusPerStack.magic * stackBonus
      if (synergy.bonusPerStack.defense) bonuses.defense += synergy.bonusPerStack.defense * stackBonus
      if (synergy.bonusPerStack.magicDefense) bonuses.magicDefense += synergy.bonusPerStack.magicDefense * stackBonus
      if (synergy.bonusPerStack.speed) bonuses.speed += synergy.bonusPerStack.speed * stackBonus
      if (synergy.bonusPerStack.critChance) bonuses.critChance += synergy.bonusPerStack.critChance * stackBonus
    }
  }

  return { tagCount, bonuses }
}

/**
 * タグをカウントして、シナジーが発動しているタグを返す
 */
export function getActiveSynergies(weapons: any[]): WeaponTag[] {
  const { tagCount } = calculateTagBonuses(weapons)
  return (Object.entries(tagCount)
    .filter(([_, count]) => count >= 2)
    .map(([tag]) => tag) as WeaponTag[])
}
