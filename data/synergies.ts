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
  requiredTags: WeaponTag[]  // 必要なタグ
  isSpecial?: boolean        // 特殊シナジー（複合タグ、1回のみ判定、効果は上昇しない）
  stackable?: boolean        // スタック可能（デフォルト: true、同一タグの数だけ効果が増加）
  effects: {
    attackBonus?: number     // 攻撃力ボーナス（%）
    magicBonus?: number      // 魔法力ボーナス（%）
    speedBonus?: number      // 速度ボーナス（%）
    critChanceBonus?: number // クリティカル率ボーナス（%）
    critDamageBonus?: number // クリティカルダメージボーナス（%）
    statusPowerBonus?: number // 状態異常威力ボーナス（%）
    lifeStealBonus?: number  // ライフスティールボーナス（%）
  }
}

export const TAG_SYNERGIES: TagSynergy[] = [
  // === 基本シナジー（タグごと、スタック可能） ===
  {
    id: 'fast_synergy',
    name: '高速シナジー',
    description: '同じ「高速」タグが増えるほど効果が上昇',
    requiredTags: ['fast'],
    stackable: true,
    effects: {
      speedBonus: 20,
      attackBonus: 8
    }
  },
  {
    id: 'heavy_synergy',
    name: '重撃シナジー',
    description: '同じ「重撃」タグが増えるほど効果が上昇',
    requiredTags: ['heavy'],
    stackable: true,
    effects: {
      attackBonus: 25,
      critDamageBonus: 15
    }
  },
  {
    id: 'precise_synergy',
    name: '精密シナジー',
    description: '同じ「精密」タグが増えるほど効果が上昇',
    requiredTags: ['precise'],
    stackable: true,
    effects: {
      critChanceBonus: 15,
      critDamageBonus: 20
    }
  },
  {
    id: 'elemental_synergy',
    name: '属性シナジー',
    description: '同じ「属性」タグが増えるほど効果が上昇',
    requiredTags: ['elemental'],
    stackable: true,
    effects: {
      magicBonus: 20,
      statusPowerBonus: 12
    }
  },
  {
    id: 'cursed_synergy',
    name: '呪いシナジー',
    description: '同じ「呪い」タグが増えるほど効果が上昇',
    requiredTags: ['cursed'],
    stackable: true,
    effects: {
      attackBonus: 12,
      magicBonus: 12,
      statusPowerBonus: 18,
      lifeStealBonus: 1
    }
  },
  {
    id: 'venomous_synergy',
    name: '猛毒シナジー',
    description: '同じ「猛毒」タグが増えるほど効果が上昇',
    requiredTags: ['venomous'],
    stackable: true,
    effects: {
      statusPowerBonus: 25,
      magicBonus: 8
    }
  },
  {
    id: 'bloodthirsty_synergy',
    name: '血渇シナジー',
    description: '同じ「血渇」タグが増えるほど効果が上昇',
    requiredTags: ['bloodthirsty'],
    stackable: true,
    effects: {
      attackBonus: 12,
      statusPowerBonus: 20,
      lifeStealBonus: 2
    }
  },
  {
    id: 'flame_synergy',
    name: '業火シナジー',
    description: '同じ「業火」タグが増えるほど効果が上昇',
    requiredTags: ['flame'],
    stackable: true,
    effects: {
      magicBonus: 16,
      statusPowerBonus: 24
    }
  },
  {
    id: 'frost_synergy',
    name: '氷結シナジー',
    description: '同じ「氷結」タグが増えるほど効果が上昇',
    requiredTags: ['frost'],
    stackable: true,
    effects: {
      magicBonus: 16,
      statusPowerBonus: 20,
      speedBonus: 8
    }
  },
  {
    id: 'defensive_synergy',
    name: '防御シナジー',
    description: '同じ「防御」タグが増えるほど効果が上昇',
    requiredTags: ['defensive'],
    stackable: true,
    effects: {
      attackBonus: 8,
      statusPowerBonus: 16
    }
  },
  {
    id: 'healing_synergy',
    name: '回復シナジー',
    description: '同じ「回復」タグが増えるほど効果が上昇',
    requiredTags: ['healing'],
    stackable: true,
    effects: {
      attackBonus: 12,
      magicBonus: 12,
      lifeStealBonus: 3
    }
  },
  {
    id: 'versatile_synergy',
    name: '万能シナジー',
    description: '同じ「万能」タグが増えるほど効果が上昇',
    requiredTags: ['versatile'],
    stackable: true,
    effects: {
      attackBonus: 10,
      magicBonus: 10,
      speedBonus: 10,
      critChanceBonus: 8
    }
  },

  // === 特殊シナジー（複合タグ、1回のみ判定、効果は上昇しない） ===
  {
    id: 'speed_precision_synergy',
    name: '高速精密の極意',
    description: '速度+30%、クリティカル率+35%、クリティカルダメージ+40%（高速+精密両方で発動）',
    requiredTags: ['fast', 'precise'],
    isSpecial: true,
    stackable: false,
    effects: {
      speedBonus: 30,
      critChanceBonus: 35,
      critDamageBonus: 40
    }
  },
  {
    id: 'power_precision_synergy',
    name: '豪腕精密の秘訣',
    description: '攻撃力+40%、クリティカル率+25%、クリティカルダメージ+50%（重撃+精密両方で発動）',
    requiredTags: ['heavy', 'precise'],
    isSpecial: true,
    stackable: false,
    effects: {
      attackBonus: 40,
      critChanceBonus: 25,
      critDamageBonus: 50
    }
  },
  {
    id: 'magic_status_synergy',
    name: '魔力と異常の共鳴',
    description: '魔法力+50%、状態異常威力+60%（属性+いずれかの状態異常タグ両方で発動）',
    requiredTags: ['elemental', 'venomous', 'bloodthirsty', 'flame', 'frost'],
    isSpecial: true,
    stackable: false,
    effects: {
      magicBonus: 50,
      statusPowerBonus: 60
    }
  },
  {
    id: 'defensive_absorption',
    name: '防御による吸収',
    description: '攻撃力+25%、魔法力+25%、状態異常威力+35%（防御+いずれかの状態異常タグ両方で発動）',
    requiredTags: ['defensive', 'venomous', 'bloodthirsty', 'flame', 'frost', 'cursed'],
    isSpecial: true,
    stackable: false,
    effects: {
      attackBonus: 25,
      magicBonus: 25,
      statusPowerBonus: 35
    }
  },
  {
    id: 'dot_trinity_ultimate',
    name: '継続ダメージの集約',
    description: '状態異常威力+80%、魔法力+40%、攻撃力+20%（毒/血渇/炎 すべて1つ以上で発動）',
    requiredTags: ['venomous', 'bloodthirsty', 'flame'],
    isSpecial: true,
    stackable: false,
    effects: {
      statusPowerBonus: 80,
      magicBonus: 40,
      attackBonus: 20
    }
  },
  {
    id: 'ice_magic_mastery',
    name: '氷結魔法の極限',
    description: '魔法力+60%、状態異常威力+70%、速度+35%（氷結+属性両方で発動）',
    requiredTags: ['frost', 'elemental'],
    isSpecial: true,
    stackable: false,
    effects: {
      magicBonus: 60,
      statusPowerBonus: 70,
      speedBonus: 35
    }
  }
]

/**
 * 装備武器から発動しているシナジーを計算
 * 通常シナジーはタグの数だけスタックして効果が増加
 * 特殊シナジーは複合タグで1回のみ判定され、効果は上昇しない
 */
export interface ActiveSynergy extends TagSynergy {
  stackCount?: number  // スタック数（通常シナジー用）
}

export function calculateActiveSynergies(weaponTags: WeaponTag[][]): ActiveSynergy[] {
  const activeSynergies: ActiveSynergy[] = []
  
  // 全タグを集計
  const tagCounts = new Map<WeaponTag, number>()
  weaponTags.forEach(tags => {
    tags.forEach(tag => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
    })
  })

  // 通常シナジーをチェック（タグごと、最小1つ必要）
  const normalSynergies: TagSynergy[] = []
  const specialSynergies: TagSynergy[] = []
  
  for (const synergy of TAG_SYNERGIES) {
    if (synergy.isSpecial) {
      specialSynergies.push(synergy)
    } else {
      normalSynergies.push(synergy)
    }
  }
  
  // 通常シナジーを処理（タグが1つ以上あればスタック）
  for (const synergy of normalSynergies) {
    const stackCount = synergy.requiredTags.reduce((max, tag) => {
      const count = tagCounts.get(tag) || 0
      return Math.max(max, count)
    }, 0)

    if (stackCount > 0) {
      activeSynergies.push({
        ...synergy,
        stackCount: stackCount
      })
    }
  }
  
  // 特殊シナジーを処理（複合タグ、1回のみ）
  const appliedSpecialIds = new Set<string>()
  
  for (const synergy of specialSynergies) {
    // 必要なタグのすべてが1つ以上あるかチェック
    const allTagsPresent = synergy.requiredTags.every(tag => {
      const count = tagCounts.get(tag) || 0
      return count > 0
    })
    
    if (allTagsPresent && !appliedSpecialIds.has(synergy.id)) {
      activeSynergies.push({
        ...synergy,
        stackCount: 1  // 特殊シナジーは常にスタック1
      })
      appliedSpecialIds.add(synergy.id)
    }
  }

  return activeSynergies
}

/**
 * シナジーボーナスを合計
 * スタック可能なシナジーはスタック数だけ効果が増加
 */
export function getTotalSynergyBonus(synergies: ActiveSynergy[]): TagSynergy['effects'] {
  return synergies.reduce((total, synergy) => {
    const multiplier = (synergy.stackable !== false) ? (synergy.stackCount || 1) : 1
    
    return {
      attackBonus: (total.attackBonus || 0) + ((synergy.effects.attackBonus || 0) * multiplier),
      magicBonus: (total.magicBonus || 0) + ((synergy.effects.magicBonus || 0) * multiplier),
      speedBonus: (total.speedBonus || 0) + ((synergy.effects.speedBonus || 0) * multiplier),
      critChanceBonus: (total.critChanceBonus || 0) + ((synergy.effects.critChanceBonus || 0) * multiplier),
      critDamageBonus: (total.critDamageBonus || 0) + ((synergy.effects.critDamageBonus || 0) * multiplier),
      statusPowerBonus: (total.statusPowerBonus || 0) + ((synergy.effects.statusPowerBonus || 0) * multiplier),
      lifeStealBonus: (total.lifeStealBonus || 0) + ((synergy.effects.lifeStealBonus || 0) * multiplier)
    }
  }, {} as TagSynergy['effects'])
}
