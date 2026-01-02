import type { EnemyType, EnemyTraits } from '~/types'

/**
 * 敵のテンプレート定義
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
    hpMultiplier: number
  }
}

export const enemyTemplates: EnemyTemplate[] = [
  // ========== 初心者向け (Lv1-5) ==========
  {
    id: 'slime',
    baseName: 'スライム',
    type: 'beast',
    traits: { physicalResistance: -10 },
    baseStats: { attack: 6, magic: 0, defense: 4, magicDefense: 2, speed: 8, hpMultiplier: 0.6 }
  },
  {
    id: 'giant_rat',
    baseName: '大ネズミ',
    type: 'beast',
    traits: {},
    baseStats: { attack: 8, magic: 0, defense: 4, magicDefense: 3, speed: 14, hpMultiplier: 0.65 }
  },
  {
    id: 'goblin',
    baseName: 'ゴブリン',
    type: 'humanoid',
    traits: {},
    baseStats: { attack: 10, magic: 0, defense: 6, magicDefense: 4, speed: 12, hpMultiplier: 0.7 }
  },

  // ========== 初級 (Lv5-15) - バランス型 ==========
  {
    id: 'wolf',
    baseName: 'ウルフ',
    type: 'beast',
    traits: { physicalResistance: 10 },
    baseStats: { attack: 15, magic: 0, defense: 8, magicDefense: 5, speed: 18, hpMultiplier: 1.0 }
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
    baseStats: { attack: 12, magic: 0, defense: 5, magicDefense: 5, speed: 20, hpMultiplier: 0.8 }
  },
  {
    id: 'bandit',
    baseName: 'バンディット',
    type: 'humanoid',
    traits: {
      inflictsStatus: [{
        type: 'bleed',
        chance: 35,
        stacks: 1,
        duration: 3
      }]
    },
    baseStats: { attack: 16, magic: 0, defense: 7, magicDefense: 5, speed: 16, hpMultiplier: 0.8 }
  },
  {
    id: 'skeleton',
    baseName: 'スケルトン',
    type: 'undead',
    traits: {
      physicalResistance: 20,
      statusImmunities: ['poison', 'bleed']
    },
    baseStats: { attack: 18, magic: 0, defense: 10, magicDefense: 5, speed: 12, hpMultiplier: 0.9 }
  },

  // ========== 中級 (Lv15-30) - 暗黒の森 ==========
  // 物理攻撃型が多い
  {
    id: 'bear',
    baseName: 'ベア',
    type: 'beast',
    traits: { physicalResistance: 25 },
    baseStats: { attack: 25, magic: 0, defense: 20, magicDefense: 8, speed: 8, hpMultiplier: 1.5 }
  },
  {
    id: 'goblin_warrior',
    baseName: 'ゴブリンウォーリア',
    type: 'humanoid',
    traits: { physicalResistance: 10 },
    baseStats: { attack: 16, magic: 0, defense: 10, magicDefense: 6, speed: 13, hpMultiplier: 0.9 }
  },
  {
    id: 'dark_elf',
    baseName: 'ダークエルフ',
    type: 'humanoid',
    traits: { magicalResistance: 10 },
    baseStats: { attack: 18, magic: 14, defense: 10, magicDefense: 12, speed: 16, hpMultiplier: 0.95 }
  },
  {
    id: 'treant',
    baseName: 'トレント',
    type: 'elemental',
    traits: { physicalResistance: 20, statusImmunities: ['bleed'] },
    baseStats: { attack: 14, magic: 10, defense: 22, magicDefense: 14, speed: 6, hpMultiplier: 1.4 }
  },
  {
    id: 'wild_boar',
    baseName: 'ワイルドボア',
    type: 'beast',
    traits: { physicalResistance: 15 },
    baseStats: { attack: 20, magic: 0, defense: 14, magicDefense: 6, speed: 10, hpMultiplier: 1.2 }
  },

  // ========== 古代の遺跡 (Lv30-60) - アンデッド系が多い ==========
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
    baseStats: { attack: 20, magic: 0, defense: 15, magicDefense: 3, speed: 5, hpMultiplier: 1.3 }
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
    baseStats: { attack: 8, magic: 20, defense: 3, magicDefense: 15, speed: 15, hpMultiplier: 0.7 }
  },
  {
    id: 'knight',
    baseName: 'ナイト',
    type: 'humanoid',
    traits: { physicalResistance: 25 },
    baseStats: { attack: 24, magic: 0, defense: 22, magicDefense: 10, speed: 10, hpMultiplier: 1.3 }
  },
  {
    id: 'mage',
    baseName: 'メイジ',
    type: 'humanoid',
    traits: { magicalResistance: 20 },
    baseStats: { attack: 8, magic: 26, defense: 8, magicDefense: 16, speed: 14, hpMultiplier: 0.85 }
  },
  {
    id: 'gargoyle',
    baseName: 'ガーゴイル',
    type: 'construct',
    traits: { physicalResistance: 35, statusImmunities: ['poison', 'bleed', 'stun'] },
    baseStats: { attack: 22, magic: 6, defense: 28, magicDefense: 12, speed: 8, hpMultiplier: 1.4 }
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
        { type: 'fear', chance: 40, stacks: 1, duration: 4 },
        { type: 'stun', chance: 20, stacks: 1, duration: 2 }
      ]
    },
    baseStats: { attack: 12, magic: 28, defense: 12, magicDefense: 24, speed: 10, hpMultiplier: 1.2 }
  },

  // ========== 火山クレーター (Lv60-120) - 炎系・魔法系 ==========
  {
    id: 'imp',
    baseName: 'インプ',
    type: 'demon',
    traits: { inflictsStatus: [{ type: 'burn', chance: 35, stacks: 1, duration: 3 }] },
    baseStats: { attack: 18, magic: 16, defense: 8, magicDefense: 12, speed: 16, hpMultiplier: 0.95 }
  },
  {
    id: 'demon_warrior',
    baseName: 'デーモンウォーリア',
    type: 'demon',
    traits: {
      magicalResistance: 15,
      inflictsStatus: [{ type: 'burn', chance: 45, stacks: 2, duration: 3 }]
    },
    baseStats: { attack: 28, magic: 10, defense: 18, magicDefense: 14, speed: 14, hpMultiplier: 1.3 }
  },
  {
    id: 'fire_elemental',
    baseName: 'ファイアエレメンタル',
    type: 'elemental',
    traits: {
      magicalResistance: 30,
      attackImmunities: ['melee'],
      statusImmunities: ['burn'],
      inflictsStatus: [{ type: 'burn', chance: 50, stacks: 3, duration: 4 }]
    },
    baseStats: { attack: 6, magic: 28, defense: 10, magicDefense: 20, speed: 14, hpMultiplier: 1.1 }
  },
  {
    id: 'lava_golem',
    baseName: 'ラバゴーレム',
    type: 'construct',
    traits: {
      physicalResistance: 45,
      statusImmunities: ['poison', 'bleed', 'burn']
    },
    baseStats: { attack: 26, magic: 8, defense: 32, magicDefense: 10, speed: 6, hpMultiplier: 1.8 }
  },
  {
    id: 'flame_drake',
    baseName: 'フレイムドレイク',
    type: 'dragon',
    traits: {
      physicalResistance: 25,
      magicalResistance: 15,
      inflictsStatus: [{ type: 'burn', chance: 45, stacks: 3, duration: 4 }]
    },
    baseStats: { attack: 34, magic: 18, defense: 22, magicDefense: 16, speed: 14, hpMultiplier: 1.6 }
  },
  {
    id: 'salamander',
    baseName: 'サラマンダー',
    type: 'dragon',
    traits: {
      magicalResistance: 20,
      inflictsStatus: [{ type: 'burn', chance: 50, stacks: 2, duration: 4 }]
    },
    baseStats: { attack: 22, magic: 24, defense: 14, magicDefense: 18, speed: 16, hpMultiplier: 1.2 }
  },

  // ========== 凍てつく凍土 (Lv120-200) - 氷系・耐性系 ==========
  {
    id: 'ice_elemental',
    baseName: 'アイスエレメンタル',
    type: 'elemental',
    traits: {
      magicalResistance: 35,
      attackImmunities: ['melee'],
      statusImmunities: ['frozen'],
      inflictsStatus: [{ type: 'frozen', chance: 50, stacks: 2, duration: 3 }]
    },
    baseStats: { attack: 6, magic: 28, defense: 10, magicDefense: 22, speed: 16, hpMultiplier: 1.1 }
  },
  {
    id: 'frost_giant',
    baseName: 'フロストジャイアント',
    type: 'humanoid',
    traits: {
      physicalResistance: 35,
      statusImmunities: ['frozen']
    },
    baseStats: { attack: 32, magic: 8, defense: 28, magicDefense: 18, speed: 8, hpMultiplier: 1.9 }
  },
  {
    id: 'yeti',
    baseName: 'イエティ',
    type: 'beast',
    traits: { physicalResistance: 20 },
    baseStats: { attack: 26, magic: 6, defense: 24, magicDefense: 14, speed: 10, hpMultiplier: 1.6 }
  },
  {
    id: 'frozen_lich',
    baseName: 'フローズンリッチ',
    type: 'undead',
    traits: {
      magicalResistance: 25,
      statusImmunities: ['frozen', 'poison', 'bleed'],
      inflictsStatus: [{ type: 'frozen', chance: 45, stacks: 2, duration: 3 }]
    },
    baseStats: { attack: 14, magic: 36, defense: 16, magicDefense: 28, speed: 10, hpMultiplier: 1.5 }
  },
  {
    id: 'ice_dragon',
    baseName: 'アイスドラゴン',
    type: 'dragon',
    traits: {
      magicalResistance: 25,
      statusImmunities: ['frozen'],
      inflictsStatus: [{ type: 'frozen', chance: 50, stacks: 2, duration: 3 }]
    },
    baseStats: { attack: 30, magic: 28, defense: 22, magicDefense: 22, speed: 12, hpMultiplier: 1.8 }
  },

  // ========== 呪われた大聖堂 (Lv200-350) - 状態異常・呪い系 ==========
  {
    id: 'vampire',
    baseName: 'ヴァンパイア',
    type: 'undead',
    traits: {
      statusImmunities: ['bleed'],
      inflictsStatus: [{ type: 'bleed', chance: 60, stacks: 2, duration: 4 }]
    },
    baseStats: { attack: 28, magic: 18, defense: 18, magicDefense: 16, speed: 18, hpMultiplier: 1.4 }
  },
  {
    id: 'death_knight',
    baseName: 'デスナイト',
    type: 'undead',
    traits: {
      physicalResistance: 35,
      magicalResistance: 10,
      inflictsStatus: [
        { type: 'fear', chance: 40, stacks: 1, duration: 4 },
        { type: 'bleed', chance: 35, stacks: 1, duration: 3 }
      ]
    },
    baseStats: { attack: 34, magic: 12, defense: 30, magicDefense: 18, speed: 12, hpMultiplier: 1.7 }
  },
  {
    id: 'dark_priest',
    baseName: 'ダークプリースト',
    type: 'undead',
    traits: {
      magicalResistance: 25,
      inflictsStatus: [
        { type: 'fear', chance: 50, stacks: 1, duration: 4 },
        { type: 'stun', chance: 25, stacks: 1, duration: 2 }
      ]
    },
    baseStats: { attack: 10, magic: 32, defense: 12, magicDefense: 24, speed: 12, hpMultiplier: 1.1 }
  },
  {
    id: 'banshee',
    baseName: 'バンシー',
    type: 'undead',
    traits: {
      physicalResistance: 40,
      inflictsStatus: [
        { type: 'stun', chance: 45, stacks: 1, duration: 2 },
        { type: 'fear', chance: 40, stacks: 1, duration: 3 }
      ]
    },
    baseStats: { attack: 12, magic: 26, defense: 14, magicDefense: 22, speed: 16, hpMultiplier: 1.25 }
  },
  {
    id: 'wraith',
    baseName: 'レイス',
    type: 'undead',
    traits: {
      physicalResistance: 50,
      attackImmunities: ['melee'],
      statusImmunities: ['poison', 'bleed'],
      inflictsStatus: [
        { type: 'fear', chance: 55, stacks: 1, duration: 4 },
        { type: 'stun', chance: 30, stacks: 1, duration: 2 }
      ]
    },
    baseStats: { attack: 8, magic: 32, defense: 12, magicDefense: 26, speed: 14, hpMultiplier: 1.3 }
  },

  // ========== 深淵の奈落 (Lv350-550) - 複合耐性・多属性 ==========
  {
    id: 'assassin',
    baseName: 'アサシン',
    type: 'humanoid',
    traits: {
      inflictsStatus: [
        { type: 'bleed', chance: 50, stacks: 2, duration: 4 },
        { type: 'poison', chance: 40, stacks: 1, duration: 3 }
      ]
    },
    baseStats: { attack: 32, magic: 10, defense: 14, magicDefense: 12, speed: 20, hpMultiplier: 0.9 }
  },
  {
    id: 'void_walker',
    baseName: 'ヴォイドウォーカー',
    type: 'demon',
    traits: {
      magicalResistance: 35,
      statusImmunities: ['stun']
    },
    baseStats: { attack: 30, magic: 34, defense: 20, magicDefense: 28, speed: 18, hpMultiplier: 1.6 }
  },
  {
    id: 'storm_elemental',
    baseName: 'ストームエレメンタル',
    type: 'elemental',
    traits: {
      magicalResistance: 32,
      attackImmunities: ['melee'],
      statusImmunities: ['stun'],
      inflictsStatus: [
        { type: 'stun', chance: 40, stacks: 1, duration: 2 },
        { type: 'burn', chance: 30, stacks: 1, duration: 2 }
      ]
    },
    baseStats: { attack: 8, magic: 32, defense: 12, magicDefense: 24, speed: 18, hpMultiplier: 1.2 }
  },
  {
    id: 'golem',
    baseName: 'ゴーレム',
    type: 'construct',
    traits: {
      physicalResistance: 40,
      statusImmunities: ['poison', 'bleed', 'stun']
    },
    baseStats: { attack: 28, magic: 6, defense: 36, magicDefense: 14, speed: 6, hpMultiplier: 2.0 }
  },
  {
    id: 'drake',
    baseName: 'ドレイク',
    type: 'dragon',
    traits: {
      physicalResistance: 22,
      magicalResistance: 18,
      inflictsStatus: [
        { type: 'burn', chance: 35, stacks: 1, duration: 3 },
        { type: 'poison', chance: 30, stacks: 1, duration: 3 }
      ]
    },
    baseStats: { attack: 32, magic: 20, defense: 20, magicDefense: 18, speed: 14, hpMultiplier: 1.5 }
  },
  {
    id: 'wyvern',
    baseName: 'ワイバーン',
    type: 'dragon',
    traits: {
      magicalResistance: 20,
      inflictsStatus: [{ type: 'poison', chance: 45, stacks: 2, duration: 4 }]
    },
    baseStats: { attack: 30, magic: 14, defense: 18, magicDefense: 16, speed: 16, hpMultiplier: 1.4 }
  },
  {
    id: 'eldritch_horror',
    baseName: 'エルドリッチホラー',
    type: 'demon',
    traits: {
      statusImmunities: ['poison', 'bleed', 'burn', 'frozen']
    },
    baseStats: { attack: 32, magic: 40, defense: 26, magicDefense: 32, speed: 12, hpMultiplier: 2.1 }
  },

  // ========== 竜の巣 (Lv550-800) - 竜族・複合防御 ==========
  {
    id: 'dragon',
    baseName: 'ドラゴン',
    type: 'dragon',
    traits: {
      physicalResistance: 30,
      magicalResistance: 20,
      inflictsStatus: [
        { type: 'burn', chance: 40, stacks: 2, duration: 3 },
        { type: 'bleed', chance: 30, stacks: 1, duration: 3 }
      ]
    },
    baseStats: { attack: 38, magic: 24, defense: 28, magicDefense: 24, speed: 14, hpMultiplier: 2.0 }
  },
  {
    id: 'dragon_knight',
    baseName: 'ドラゴンナイト',
    type: 'humanoid',
    traits: { physicalResistance: 25 },
    baseStats: { attack: 34, magic: 12, defense: 26, magicDefense: 18, speed: 14, hpMultiplier: 1.6 }
  },
  {
    id: 'dragon_shaman',
    baseName: '竜人シャーマン',
    type: 'humanoid',
    traits: { magicalResistance: 25 },
    baseStats: { attack: 18, magic: 34, defense: 16, magicDefense: 24, speed: 14, hpMultiplier: 1.4 }
  },
  {
    id: 'chaos_apostle',
    baseName: '混沌の使徒',
    type: 'demon',
    traits: {
      magicalResistance: 30,
      inflictsStatus: [
        { type: 'fear', chance: 50, stacks: 1, duration: 4 },
        { type: 'stun', chance: 35, stacks: 1, duration: 2 }
      ]
    },
    baseStats: { attack: 28, magic: 36, defense: 22, magicDefense: 30, speed: 16, hpMultiplier: 1.7 }
  },
  {
    id: 'ancient_dragon',
    baseName: 'アンシェントドラゴン',
    type: 'dragon',
    traits: {
      physicalResistance: 40,
      magicalResistance: 30,
      statusImmunities: ['poison'],
      inflictsStatus: [
        { type: 'burn', chance: 50, stacks: 3, duration: 4 },
        { type: 'bleed', chance: 40, stacks: 2, duration: 4 },
        { type: 'fear', chance: 30, stacks: 1, duration: 3 }
      ]
    },
    baseStats: { attack: 46, magic: 32, defense: 34, magicDefense: 30, speed: 16, hpMultiplier: 2.4 }
  },

  // ========== 虚無の核心 (Lv800-1000) - 究極の敵 ==========
  {
    id: 'dimension_guardian',
    baseName: '次元の守護者',
    type: 'construct',
    traits: {
      physicalResistance: 35,
      magicalResistance: 35,
      statusImmunities: ['poison', 'bleed']
    },
    baseStats: { attack: 34, magic: 26, defense: 32, magicDefense: 32, speed: 12, hpMultiplier: 2.0 }
  },
  {
    id: 'void_ruler',
    baseName: '虚無の支配者',
    type: 'demon',
    traits: {
      physicalResistance: 35,
      magicalResistance: 40,
      statusImmunities: ['poison', 'bleed', 'frozen'],
      inflictsStatus: [
        { type: 'fear', chance: 60, stacks: 2, duration: 4 },
        { type: 'stun', chance: 40, stacks: 1, duration: 2 }
      ]
    },
    baseStats: { attack: 40, magic: 44, defense: 32, magicDefense: 34, speed: 16, hpMultiplier: 2.5 }
  },
  {
    id: 'infinite_avatar',
    baseName: '無限の化身',
    type: 'elemental',
    traits: {
      statusImmunities: ['poison', 'bleed', 'burn', 'frozen', 'stun']
    },
    baseStats: { attack: 42, magic: 42, defense: 30, magicDefense: 36, speed: 18, hpMultiplier: 2.3 }
  }
]

// 敵IDのユニオン型
export type EnemyId = typeof enemyTemplates[number]['id']
/**
 * IDまたは名前から敵テンプレートを取得
 */
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
export function getEnemyTemplatesByType(type: string): EnemyTemplate[] {
  return enemyTemplates.filter(t => t.type === type)
}

/**
 * ランダムな敵テンプレートを取得
 */
export function getRandomEnemyTemplate(): EnemyTemplate {
  return enemyTemplates[Math.floor(Math.random() * enemyTemplates.length)]
}