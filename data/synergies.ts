import type { WeaponTag } from '~/types'

/**
 * タグの定義
 */
export interface TagDefinition {
  id: WeaponTag
  name: string
  description: string
  icon: string
}

/**
 * タグマスターデータ
 */
export const TAG_DEFINITIONS: Record<WeaponTag, TagDefinition> = {
  fast: {
    id: 'fast',
    name: '高速',
    description: '攻撃速度が速い武器。手数で圧倒する。',
    icon: '⚡'
  },
  heavy: {
    id: 'heavy',
    name: '重撃',
    description: '重量級の武器。一撃の威力が高い。',
    icon: '🔨'
  },
  precise: {
    id: 'precise',
    name: '精密',
    description: '精度が高い武器。クリティカルが出やすい。',
    icon: '🎯'
  },
  elemental: {
    id: 'elemental',
    name: '属性',
    description: '魔法属性を持つ武器。魔法ダメージに優れる。',
    icon: '✨'
  },
  cursed: {
    id: 'cursed',
    name: '呪い',
    description: '呪いの力を秘めた武器。特殊な状態異常を付与。',
    icon: '👿'
  },
  bloodthirsty: {
    id: 'bloodthirsty',
    name: '血渇',
    description: '出血効果と相性が良い武器。継続ダメージ重視。',
    icon: '🩸'
  },
  healing: {
    id: 'healing',
    name: '回復',
    description: '回復効果を持つ武器。持久戦に強い。',
    icon: '💚'
  },
  defensive: {
    id: 'defensive',
    name: '防御',
    description: '防御力を高める武器。耐久性重視。',
    icon: '🛡️'
  },
  versatile: {
    id: 'versatile',
    name: '万能',
    description: 'バランスの取れた武器。あらゆる状況に対応。',
    icon: '⚖️'
  },
  venomous: {
    id: 'venomous',
    name: '猛毒',
    description: '毒効果と相性が良い武器。毒ダメージを強化。',
    icon: '☠️'
  },
  flame: {
    id: 'flame',
    name: '業火',
    description: '炎効果と相性が良い武器。燃焼ダメージを強化。',
    icon: '🔥'
  },
  frost: {
    id: 'frost',
    name: '氷結',
    description: '氷効果と相性が良い武器。敵の動きを封じる。',
    icon: '❄️'
  }
}

/**
 * タグシナジーシステム
 * 装備している武器のタグの組み合わせによってボーナス効果を発動
 */

export interface TagSynergy {
  id: string
  name: string
  description: string
  requiredTags: WeaponTag[]  // 必要なタグ（OR条件）
  minCount: number           // 最小武器数
  effects: {
    attackBonus?: number     // 攻撃力ボーナス（%）
    magicBonus?: number      // 魔法力ボーナス（%）
    speedBonus?: number      // 速度ボーナス（%）
    critChanceBonus?: number // クリティカル率ボーナス（%）
    critDamageBonus?: number // クリティカルダメージボーナス（%）
    statusPowerBonus?: number // 状態異常威力ボーナス（%）
  }
}

export const TAG_SYNERGIES: TagSynergy[] = [
  // === 2武器シナジー ===
  {
    id: 'dual_fast',
    name: '二刀流',
    description: '速度+25%、攻撃力+10%',
    requiredTags: ['fast'],
    minCount: 2,
    effects: {
      speedBonus: 25,
      attackBonus: 10
    }
  },
  {
    id: 'dual_heavy',
    name: '重撃戦術',
    description: '攻撃力+30%、クリティカルダメージ+20%',
    requiredTags: ['heavy'],
    minCount: 2,
    effects: {
      attackBonus: 30,
      critDamageBonus: 20
    }
  },
  {
    id: 'precision_pair',
    name: '精密二連',
    description: 'クリティカル率+20%、クリティカルダメージ+25%',
    requiredTags: ['precise'],
    minCount: 2,
    effects: {
      critChanceBonus: 20,
      critDamageBonus: 25
    }
  },
  {
    id: 'elemental_dual',
    name: '魔力共鳴',
    description: '魔法力+25%、状態異常威力+15%',
    requiredTags: ['elemental'],
    minCount: 2,
    effects: {
      magicBonus: 25,
      statusPowerBonus: 15
    }
  },
  {
    id: 'poison_combo',
    name: '猛毒連鎖',
    description: '状態異常威力+30%、魔法力+10%',
    requiredTags: ['venomous'],
    minCount: 2,
    effects: {
      statusPowerBonus: 30,
      magicBonus: 10
    }
  },
  {
    id: 'bleed_combo',
    name: '血渇戦術',
    description: '攻撃力+15%、状態異常威力+25%',
    requiredTags: ['bloodthirsty'],
    minCount: 2,
    effects: {
      attackBonus: 15,
      statusPowerBonus: 25
    }
  },
  {
    id: 'fire_combo',
    name: '業火の舞',
    description: '魔法力+20%、状態異常威力+30%',
    requiredTags: ['flame'],
    minCount: 2,
    effects: {
      magicBonus: 20,
      statusPowerBonus: 30
    }
  },
  {
    id: 'ice_combo',
    name: '氷結の息吹',
    description: '魔法力+20%、状態異常威力+25%、速度+10%',
    requiredTags: ['frost'],
    minCount: 2,
    effects: {
      magicBonus: 20,
      statusPowerBonus: 25,
      speedBonus: 10
    }
  },

  // === 3武器シナジー ===
  {
    id: 'triple_fast',
    name: '疾風三連',
    description: '速度+50%、攻撃力+20%、クリティカル率+15%',
    requiredTags: ['fast'],
    minCount: 3,
    effects: {
      speedBonus: 50,
      attackBonus: 20,
      critChanceBonus: 15
    }
  },
  {
    id: 'triple_heavy',
    name: '破壊の三叉',
    description: '攻撃力+60%、クリティカルダメージ+40%',
    requiredTags: ['heavy'],
    minCount: 3,
    effects: {
      attackBonus: 60,
      critDamageBonus: 40
    }
  },
  {
    id: 'elemental_trinity',
    name: '三位一体',
    description: '攻撃力+15%、魔法力+40%、状態異常威力+30%、クリティカル率+10%',
    requiredTags: ['elemental'],
    minCount: 3,
    effects: {
      attackBonus: 15,
      magicBonus: 40,
      statusPowerBonus: 30,
      critChanceBonus: 10
    }
  },
  {
    id: 'cursed_trinity',
    name: '呪いの三重奏',
    description: '攻撃力+25%、魔法力+25%、状態異常威力+40%、クリティカルダメージ+20%',
    requiredTags: ['cursed'],
    minCount: 3,
    effects: {
      attackBonus: 25,
      magicBonus: 25,
      statusPowerBonus: 40,
      critDamageBonus: 20
    }
  },
  {
    id: 'dot_trinity',
    name: '継続ダメージ特化',
    description: '状態異常威力+50%、魔法力+20%（毒/血渇/炎いずれか3つ）',
    requiredTags: ['venomous', 'bloodthirsty', 'flame'],
    minCount: 3,
    effects: {
      statusPowerBonus: 50,
      magicBonus: 20
    }
  },

  // === 混合シナジー ===
  {
    id: 'speed_precision',
    name: '高速精密',
    description: '速度+20%、クリティカル率+25%、クリティカルダメージ+15%（高速+精密）',
    requiredTags: ['fast', 'precise'],
    minCount: 2,
    effects: {
      speedBonus: 20,
      critChanceBonus: 25,
      critDamageBonus: 15
    }
  },
  {
    id: 'power_precision',
    name: '豪腕精密',
    description: '攻撃力+25%、クリティカル率+15%、クリティカルダメージ+30%（重撃+精密）',
    requiredTags: ['heavy', 'precise'],
    minCount: 2,
    effects: {
      attackBonus: 25,
      critChanceBonus: 15,
      critDamageBonus: 30
    }
  },
  {
    id: 'versatile_master',
    name: '万能の極み',
    description: '攻撃力+15%、魔法力+15%、速度+15%、クリティカル率+10%',
    requiredTags: ['versatile'],
    minCount: 2,
    effects: {
      attackBonus: 15,
      magicBonus: 15,
      speedBonus: 15,
      critChanceBonus: 10
    }
  },
  {
    id: 'defensive_stance',
    name: '防御態勢',
    description: '攻撃力+10%、状態異常威力+20%',
    requiredTags: ['defensive'],
    minCount: 2,
    effects: {
      attackBonus: 10,
      statusPowerBonus: 20
    }
  },
  {
    id: 'healing_focus',
    name: '生命の鼓動',
    description: '攻撃力+15%、魔法力+15%',
    requiredTags: ['healing'],
    minCount: 2,
    effects: {
      attackBonus: 15,
      magicBonus: 15
    }
  }
]

/**
 * 装備武器から発動しているシナジーを計算
 */
export function calculateActiveSynergies(weaponTags: WeaponTag[][]): TagSynergy[] {
  const activeSynergies: TagSynergy[] = []
  
  // 全タグを集計
  const tagCounts = new Map<WeaponTag, number>()
  weaponTags.forEach(tags => {
    tags.forEach(tag => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
    })
  })

  // 各シナジーをチェック
  for (const synergy of TAG_SYNERGIES) {
    // 必要なタグのいずれかが必要数以上あるかチェック
    const matchingTagCount = synergy.requiredTags.reduce((max, tag) => {
      const count = tagCounts.get(tag) || 0
      return Math.max(max, count)
    }, 0)

    if (matchingTagCount >= synergy.minCount) {
      activeSynergies.push(synergy)
    }
  }

  return activeSynergies
}

/**
 * シナジーボーナスを合計
 */
export function getTotalSynergyBonus(synergies: TagSynergy[]): TagSynergy['effects'] {
  return synergies.reduce((total, synergy) => {
    return {
      attackBonus: (total.attackBonus || 0) + (synergy.effects.attackBonus || 0),
      magicBonus: (total.magicBonus || 0) + (synergy.effects.magicBonus || 0),
      speedBonus: (total.speedBonus || 0) + (synergy.effects.speedBonus || 0),
      critChanceBonus: (total.critChanceBonus || 0) + (synergy.effects.critChanceBonus || 0),
      critDamageBonus: (total.critDamageBonus || 0) + (synergy.effects.critDamageBonus || 0),
      statusPowerBonus: (total.statusPowerBonus || 0) + (synergy.effects.statusPowerBonus || 0)
    }
  }, {} as TagSynergy['effects'])
}
