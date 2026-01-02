import type { EnemyType, EnemyTraits, StatusEffectType } from '~/types'

/**
 * 敵のテンプレート定義
 * 実際の敵はこれをベースに生成される
 */
export interface EnemyTemplate {
  id: string
  baseName: string
  type: EnemyType
  traits: EnemyTraits
  baseStats: {
    attack: number
    magic: number
    defense: number
    magicDefense: number
    speed: number
    hpMultiplier: number  // レベルごとのHP倍率
  }
}

/**
 * 敵のデータベース
 */
export const enemyTemplates: EnemyTemplate[] = [
  // ========== 獣系 (Beast) ==========
  {
    id: 'wolf',
    baseName: 'ウルフ',
    type: 'beast',
    traits: {
      physicalResistance: 10,
    },
    baseStats: {
      attack: 15,
      magic: 0,
      defense: 8,
      magicDefense: 5,
      speed: 18,
      hpMultiplier: 1.0
    }
  },
  {
    id: 'bear',
    baseName: 'ベア',
    type: 'beast',
    traits: {
      physicalResistance: 25,
    },
    baseStats: {
      attack: 25,
      magic: 0,
      defense: 20,
      magicDefense: 8,
      speed: 8,
      hpMultiplier: 1.5
    }
  },
  {
    id: 'viper',
    baseName: 'バイパー',
    type: 'beast',
    traits: {
      inflictsStatus: [{
        type: 'poison',
        chance: 40,
        stacks: 2,
        duration: 4
      }]
    },
    baseStats: {
      attack: 12,
      magic: 0,
      defense: 5,
      magicDefense: 5,
      speed: 20,
      hpMultiplier: 0.8
    }
  },

  // ========== アンデッド系 (Undead) ==========
  {
    id: 'skeleton',
    baseName: 'スケルトン',
    type: 'undead',
    traits: {
      physicalResistance: 20,
      statusImmunities: ['poison', 'bleed']
    },
    baseStats: {
      attack: 18,
      magic: 0,
      defense: 10,
      magicDefense: 5,
      speed: 12,
      hpMultiplier: 0.9
    }
  },
  {
    id: 'zombie',
    baseName: 'ゾンビ',
    type: 'undead',
    traits: {
      physicalResistance: 30,
      statusImmunities: ['poison', 'bleed', 'stun'],
      inflictsStatus: [{
        type: 'epidemic',
        chance: 25,
        stacks: 1,
        duration: 3
      }]
    },
    baseStats: {
      attack: 20,
      magic: 0,
      defense: 15,
      magicDefense: 3,
      speed: 5,
      hpMultiplier: 1.3
    }
  },
  {
    id: 'ghost',
    baseName: 'ゴースト',
    type: 'undead',
    traits: {
      physicalResistance: 50,
      magicalResistance: -20,
      attackImmunities: ['melee'],
      statusImmunities: ['poison', 'bleed', 'burn', 'frozen']
    },
    baseStats: {
      attack: 8,
      magic: 20,
      defense: 3,
      magicDefense: 15,
      speed: 15,
      hpMultiplier: 0.7
    }
  },
  {
    id: 'lich',
    baseName: 'リッチ',
    type: 'undead',
    traits: {
      physicalResistance: 30,
      magicalResistance: 20,
      statusImmunities: ['poison', 'bleed'],
      inflictsStatus: [
        {
          type: 'weak',
          chance: 30,
          stacks: 2,
          duration: 4
        },
        {
          type: 'fear',
          chance: 20,
          stacks: 1,
          duration: 3
        }
      ]
    },
    baseStats: {
      attack: 10,
      magic: 35,
      defense: 15,
      magicDefense: 25,
      speed: 10,
      hpMultiplier: 1.2
    }
  },

  // ========== 悪魔系 (Demon) ==========
  {
    id: 'imp',
    baseName: 'インプ',
    type: 'demon',
    traits: {
      magicalResistance: 15,
      inflictsStatus: [{
        type: 'burn',
        chance: 35,
        stacks: 2,
        duration: 3
      }]
    },
    baseStats: {
      attack: 10,
      magic: 18,
      defense: 8,
      magicDefense: 12,
      speed: 16,
      hpMultiplier: 0.9
    }
  },
  {
    id: 'demon_warrior',
    baseName: 'デーモンウォリアー',
    type: 'demon',
    traits: {
      physicalResistance: 20,
      magicalResistance: 20,
      inflictsStatus: [{
        type: 'burn',
        chance: 40,
        stacks: 3,
        duration: 4
      }]
    },
    baseStats: {
      attack: 30,
      magic: 15,
      defense: 20,
      magicDefense: 18,
      speed: 12,
      hpMultiplier: 1.4
    }
  },

  // ========== 精霊系 (Elemental) ==========
  {
    id: 'fire_elemental',
    baseName: 'ファイアエレメンタル',
    type: 'elemental',
    traits: {
      magicalResistance: 30,
      statusImmunities: ['burn'],
      inflictsStatus: [{
        type: 'burn',
        chance: 60,
        stacks: 3,
        duration: 4
      }]
    },
    baseStats: {
      attack: 5,
      magic: 30,
      defense: 10,
      magicDefense: 20,
      speed: 14,
      hpMultiplier: 1.0
    }
  },
  {
    id: 'ice_elemental',
    baseName: 'アイスエレメンタル',
    type: 'elemental',
    traits: {
      magicalResistance: 30,
      statusImmunities: ['frozen'],
      inflictsStatus: [{
        type: 'frozen',
        chance: 50,
        stacks: 2,
        duration: 3
      }]
    },
    baseStats: {
      attack: 5,
      magic: 28,
      defense: 12,
      magicDefense: 22,
      speed: 10,
      hpMultiplier: 1.0
    }
  },
  {
    id: 'storm_elemental',
    baseName: 'ストームエレメンタル',
    type: 'elemental',
    traits: {
      magicalResistance: 35,
      statusImmunities: ['stun'],
      inflictsStatus: [{
        type: 'stun',
        chance: 30,
        stacks: 1,
        duration: 2
      }]
    },
    baseStats: {
      attack: 8,
      magic: 32,
      defense: 8,
      magicDefense: 25,
      speed: 18,
      hpMultiplier: 0.9
    }
  },

  // ========== 人型 (Humanoid) ==========
  {
    id: 'bandit',
    baseName: 'バンディット',
    type: 'humanoid',
    traits: {},
    baseStats: {
      attack: 16,
      magic: 5,
      defense: 10,
      magicDefense: 8,
      speed: 14,
      hpMultiplier: 1.0
    }
  },
  {
    id: 'knight',
    baseName: 'ナイト',
    type: 'humanoid',
    traits: {
      physicalResistance: 35,
    },
    baseStats: {
      attack: 28,
      magic: 0,
      defense: 30,
      magicDefense: 12,
      speed: 8,
      hpMultiplier: 1.3
    }
  },
  {
    id: 'mage',
    baseName: 'メイジ',
    type: 'humanoid',
    traits: {
      magicalResistance: 25,
      inflictsStatus: [
        {
          type: 'burn',
          chance: 30,
          stacks: 2,
          duration: 3
        },
        {
          type: 'frozen',
          chance: 30,
          stacks: 2,
          duration: 3
        }
      ]
    },
    baseStats: {
      attack: 5,
      magic: 30,
      defense: 8,
      magicDefense: 20,
      speed: 12,
      hpMultiplier: 0.8
    }
  },
  {
    id: 'assassin',
    baseName: 'アサシン',
    type: 'humanoid',
    traits: {
      inflictsStatus: [{
        type: 'poison',
        chance: 50,
        stacks: 3,
        duration: 5
      }]
    },
    baseStats: {
      attack: 22,
      magic: 0,
      defense: 8,
      magicDefense: 8,
      speed: 22,
      hpMultiplier: 0.7
    }
  },

  // ========== ドラゴン系 (Dragon) ==========
  {
    id: 'drake',
    baseName: 'ドレイク',
    type: 'dragon',
    traits: {
      physicalResistance: 30,
      magicalResistance: 30,
      inflictsStatus: [{
        type: 'burn',
        chance: 45,
        stacks: 4,
        duration: 5
      }]
    },
    baseStats: {
      attack: 35,
      magic: 20,
      defense: 25,
      magicDefense: 20,
      speed: 10,
      hpMultiplier: 1.8
    }
  },
  {
    id: 'wyvern',
    baseName: 'ワイバーン',
    type: 'dragon',
    traits: {
      physicalResistance: 20,
      magicalResistance: 15,
      inflictsStatus: [{
        type: 'poison',
        chance: 40,
        stacks: 3,
        duration: 5
      }]
    },
    baseStats: {
      attack: 30,
      magic: 10,
      defense: 18,
      magicDefense: 15,
      speed: 16,
      hpMultiplier: 1.5
    }
  },

  // ========== 構造物系 (Construct) ==========
  {
    id: 'golem',
    baseName: 'ゴーレム',
    type: 'construct',
    traits: {
      physicalResistance: 40,
      magicalResistance: -20,
      statusImmunities: ['poison', 'bleed', 'burn', 'frozen', 'stun']
    },
    baseStats: {
      attack: 30,
      magic: 0,
      defense: 35,
      magicDefense: 5,
      speed: 5,
      hpMultiplier: 2.0
    }
  },
  {
    id: 'gargoyle',
    baseName: 'ガーゴイル',
    type: 'construct',
    traits: {
      physicalResistance: 35,
      statusImmunities: ['poison', 'bleed']
    },
    baseStats: {
      attack: 25,
      magic: 5,
      defense: 28,
      magicDefense: 15,
      speed: 12,
      hpMultiplier: 1.4
    }
  },

  // ========== 補完テンプレート (汎用/高レベル/虚無系など) ==========
  { id: 'slime', baseName: 'スライム', type: 'beast', traits: { physicalResistance: -10 }, baseStats: { attack: 6, magic: 0, defense: 4, magicDefense: 2, speed: 8, hpMultiplier: 0.6 } },
  { id: 'goblin', baseName: 'ゴブリン', type: 'humanoid', traits: {}, baseStats: { attack: 10, magic: 0, defense: 6, magicDefense: 4, speed: 12, hpMultiplier: 0.7 } },
  { id: 'giant_rat', baseName: '大ネズミ', type: 'beast', traits: {}, baseStats: { attack: 8, magic: 0, defense: 4, magicDefense: 3, speed: 14, hpMultiplier: 0.65 } },
  { id: 'goblin_warrior', baseName: 'ゴブリンウォーリア', type: 'humanoid', traits: { physicalResistance: 10 }, baseStats: { attack: 16, magic: 0, defense: 10, magicDefense: 6, speed: 13, hpMultiplier: 0.9 } },
  { id: 'dark_elf', baseName: 'ダークエルフ', type: 'humanoid', traits: { magicalResistance: 10 }, baseStats: { attack: 18, magic: 14, defense: 10, magicDefense: 12, speed: 16, hpMultiplier: 0.95 } },
  { id: 'treant', baseName: 'トレント', type: 'elemental', traits: { physicalResistance: 20, statusImmunities: ['bleed'] }, baseStats: { attack: 14, magic: 10, defense: 22, magicDefense: 14, speed: 6, hpMultiplier: 1.4 } },
  { id: 'lava_golem', baseName: 'ラバゴーレム', type: 'construct', traits: { physicalResistance: 45, statusImmunities: ['poison', 'bleed', 'burn'] }, baseStats: { attack: 26, magic: 8, defense: 32, magicDefense: 10, speed: 6, hpMultiplier: 1.8 } },
  { id: 'flame_drake', baseName: 'フレイムドレイク', type: 'dragon', traits: { physicalResistance: 25, magicalResistance: 15, inflictsStatus: [{ type: 'burn', chance: 45, stacks: 3, duration: 4 }] }, baseStats: { attack: 34, magic: 18, defense: 22, magicDefense: 16, speed: 14, hpMultiplier: 1.6 } },
  { id: 'salamander', baseName: 'サラマンダー', type: 'dragon', traits: { magicalResistance: 20, inflictsStatus: [{ type: 'burn', chance: 50, stacks: 2, duration: 4 }] }, baseStats: { attack: 22, magic: 24, defense: 14, magicDefense: 18, speed: 16, hpMultiplier: 1.2 } },
  { id: 'frost_giant', baseName: 'フロストジャイアント', type: 'humanoid', traits: { physicalResistance: 35, statusImmunities: ['frozen'] }, baseStats: { attack: 32, magic: 8, defense: 28, magicDefense: 18, speed: 8, hpMultiplier: 1.9 } },
  { id: 'ice_dragon', baseName: 'アイスドラゴン', type: 'dragon', traits: { magicalResistance: 25, statusImmunities: ['frozen'] }, baseStats: { attack: 30, magic: 28, defense: 22, magicDefense: 22, speed: 12, hpMultiplier: 1.8 } },
  { id: 'yeti', baseName: 'イエティ', type: 'beast', traits: { physicalResistance: 20 }, baseStats: { attack: 26, magic: 6, defense: 24, magicDefense: 14, speed: 10, hpMultiplier: 1.6 } },
  { id: 'frozen_lich', baseName: 'フローズンリッチ', type: 'undead', traits: { magicalResistance: 25, statusImmunities: ['frozen', 'poison', 'bleed'] }, baseStats: { attack: 14, magic: 36, defense: 16, magicDefense: 28, speed: 10, hpMultiplier: 1.5 } },
  { id: 'vampire', baseName: 'ヴァンパイア', type: 'undead', traits: { statusImmunities: ['bleed'], inflictsStatus: [{ type: 'bleed', chance: 60, stacks: 2, duration: 4 }] }, baseStats: { attack: 28, magic: 18, defense: 18, magicDefense: 16, speed: 18, hpMultiplier: 1.4 } },
  { id: 'death_knight', baseName: 'デスナイト', type: 'undead', traits: { physicalResistance: 35, magicalResistance: 10 }, baseStats: { attack: 34, magic: 12, defense: 30, magicDefense: 18, speed: 12, hpMultiplier: 1.7 } },
  { id: 'dark_priest', baseName: 'ダークプリースト', type: 'undead', traits: { magicalResistance: 25 }, baseStats: { attack: 10, magic: 32, defense: 12, magicDefense: 24, speed: 12, hpMultiplier: 1.1 } },
  { id: 'dragon', baseName: 'ドラゴン', type: 'dragon', traits: { physicalResistance: 30, magicalResistance: 20 }, baseStats: { attack: 38, magic: 24, defense: 28, magicDefense: 24, speed: 14, hpMultiplier: 2.0 } },
  { id: 'dragon_knight', baseName: 'ドラゴンナイト', type: 'humanoid', traits: { physicalResistance: 25 }, baseStats: { attack: 34, magic: 12, defense: 26, magicDefense: 18, speed: 14, hpMultiplier: 1.6 } },
  { id: 'dragon_shaman', baseName: '竜人シャーマン', type: 'humanoid', traits: { magicalResistance: 25 }, baseStats: { attack: 18, magic: 34, defense: 16, magicDefense: 24, speed: 14, hpMultiplier: 1.4 } },
  { id: 'ancient_dragon', baseName: 'アンシェントドラゴン', type: 'dragon', traits: { physicalResistance: 40, magicalResistance: 30 }, baseStats: { attack: 46, magic: 32, defense: 34, magicDefense: 30, speed: 16, hpMultiplier: 2.4 } },
  { id: 'void_walker', baseName: 'ヴォイドウォーカー', type: 'demon', traits: { magicalResistance: 35, statusImmunities: ['stun'] }, baseStats: { attack: 30, magic: 34, defense: 20, magicDefense: 28, speed: 18, hpMultiplier: 1.6 } },
  { id: 'eldritch_horror', baseName: 'エルドリッチホラー', type: 'demon', traits: { statusImmunities: ['poison', 'bleed', 'burn', 'frozen'] }, baseStats: { attack: 32, magic: 40, defense: 26, magicDefense: 32, speed: 12, hpMultiplier: 2.1 } },
  { id: 'chaos_apostle', baseName: '混沌の使徒', type: 'demon', traits: { magicalResistance: 30 }, baseStats: { attack: 28, magic: 36, defense: 22, magicDefense: 30, speed: 16, hpMultiplier: 1.7 } },
  { id: 'dimension_guardian', baseName: '次元の守護者', type: 'construct', traits: { physicalResistance: 35, magicalResistance: 35 }, baseStats: { attack: 34, magic: 26, defense: 32, magicDefense: 32, speed: 12, hpMultiplier: 2.0 } },
  { id: 'void_ruler', baseName: '虚無の支配者', type: 'demon', traits: { physicalResistance: 35, magicalResistance: 40 }, baseStats: { attack: 40, magic: 44, defense: 32, magicDefense: 34, speed: 16, hpMultiplier: 2.5 } },
  { id: 'infinite_avatar', baseName: '無限の化身', type: 'elemental', traits: { statusImmunities: ['poison', 'bleed', 'burn', 'frozen', 'stun'] }, baseStats: { attack: 42, magic: 42, defense: 30, magicDefense: 36, speed: 18, hpMultiplier: 2.3 } }
]

// ========== ヘルパー ==========
export function getEnemyTemplateByNameOrId(key: string): EnemyTemplate | undefined {
  const target = key.trim().toLowerCase()
  return enemyTemplates.find(t => t.id.toLowerCase() === target || t.baseName.toLowerCase() === target)
}

/**
 * IDから敵テンプレートを取得
 */
export function getEnemyTemplateById(id: string): EnemyTemplate | undefined {
  return enemyTemplates.find(t => t.id === id)
}

/**
 * タイプで敵をフィルタ
 */
export function getEnemyTemplatesByType(type: EnemyType): EnemyTemplate[] {
  return enemyTemplates.filter(t => t.type === type)
}

/**
 * ランダムな敵テンプレートを取得
 */
export function getRandomEnemyTemplate(): EnemyTemplate {
  return enemyTemplates[Math.floor(Math.random() * enemyTemplates.length)]
}
