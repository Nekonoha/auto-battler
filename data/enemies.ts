import type { EnemyType, EnemyTraits, EnemyAction } from '~/types'

/**
 * 敵のテンプレート定義
 */
export interface EnemyTemplate {
  id: string
  baseName: string
  type: EnemyType
  traits: EnemyTraits
  actionPool: EnemyAction[]
  baseStats: {
    attack: number
    magic: number
    defense: number
    magicDefense: number
    speed: number
    statusPower?: number
    lifeSteal?: number
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
    actionPool: [
      { type: 'attack', weight: 6, name: '通常攻撃' },
      { type: 'defend', weight: 3, name: '防御' },
      { type: 'nothing', weight: 1, name: '様子を見る' }
    ],
    baseStats: { attack: 6, magic: 0, defense: 4, magicDefense: 2, speed: 8, hpMultiplier: 0.6 }
  },
  {
    id: 'giant_rat',
    baseName: '大ネズミ',
    type: 'beast',
    traits: {},
    actionPool: [
      { type: 'attack', weight: 6, name: '通常攻撃' },
      { type: 'defend', weight: 3, name: '防御' },
      { type: 'nothing', weight: 1, name: '様子を見る' }
    ],
    baseStats: { attack: 8, magic: 0, defense: 4, magicDefense: 3, speed: 14, hpMultiplier: 0.65 }
  },
  {
    id: 'goblin',
    baseName: 'ゴブリン',
    type: 'humanoid',
    traits: {},
    actionPool: [
      { type: 'attack', weight: 6, name: '通常攻撃' },
      { type: 'defend', weight: 3, name: '防御' },
      { type: 'nothing', weight: 1, name: '様子を見る' }
    ],
    baseStats: { attack: 10, magic: 0, defense: 6, magicDefense: 4, speed: 12, hpMultiplier: 0.7 }
  },

  // レア枠：高経験値ボーナス（低HP・高防御）
  {
    id: 'metal_slime',
    baseName: 'メタルスライム',
    type: 'elemental',
    traits: {
      physicalResistance: 75,
      magicalResistance: 75,
      statusImmunities: ['poison', 'bleed', 'burn', 'frozen'],
      expMultiplier: 12
    },
    actionPool: [
      { type: 'attack', weight: 6, name: '硬い体当たり' },
      { type: 'nothing', weight: 4, name: 'きらめく' }
    ],
    baseStats: { attack: 4, magic: 4, defense: 14, magicDefense: 14, speed: 24, hpMultiplier: 0.22 }
  },

  // ========== 初級 (Lv5-15) - バランス型 ==========
  {
    id: 'wolf',
    baseName: 'ウルフ',
    type: 'beast',
    traits: { physicalResistance: 10 },
    actionPool: [
      { type: 'attack', weight: 6, name: '通常攻撃' },
      { type: 'defend', weight: 3, name: '防御' },
      { type: 'nothing', weight: 1, name: '様子を見る' }
    ],
    baseStats: { attack: 15, magic: 0, defense: 8, magicDefense: 5, speed: 18, hpMultiplier: 1.0 }
  },
  {
    id: 'viper',
    baseName: 'バイパー',
    type: 'beast',
    traits: {},
    actionPool: [
      { type: 'attack', weight: 6, name: '通常攻撃' },
      { type: 'defend', weight: 3, name: '防御' },
      { type: 'nothing', weight: 1, name: '様子を見る' },
      { type: 'status', weight: 1, effects: [{ type: 'poison', chance: 40, stacks: 2, duration: 4 }], name: '毒牙' }
    ],
    baseStats: { attack: 12, magic: 0, defense: 5, magicDefense: 5, speed: 20, hpMultiplier: 0.8 }
  },
  {
    id: 'bandit',
    baseName: 'バンディット',
    type: 'humanoid',
    traits: {},
    actionPool: [
      { type: 'attack', weight: 6, name: '通常攻撃' },
      { type: 'defend', weight: 3, name: '防御' },
      { type: 'nothing', weight: 1, name: '様子を見る' },
      { type: 'status', weight: 1, effects: [{ type: 'bleed', chance: 35, stacks: 1, duration: 3 }], name: '流血剣' }
    ],
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
    actionPool: [
      { type: 'attack', weight: 6, name: '通常攻撃' },
      { type: 'defend', weight: 3, name: '防御' },
      { type: 'nothing', weight: 1, name: '様子を見る' }
    ],
    baseStats: { attack: 18, magic: 0, defense: 10, magicDefense: 5, speed: 12, hpMultiplier: 0.9 }
  },

  // ========== 中級 (Lv15-30) - 暗黒の森 ==========
  // 物理攻撃型が多い
  {
    id: 'bear',
    baseName: 'ベア',
    type: 'beast',
    traits: { physicalResistance: 25 },
    actionPool: [
      { type: 'attack', weight: 6, name: '通常攻撃' },
      { type: 'defend', weight: 3, name: '防御' },
      { type: 'nothing', weight: 1, name: '様子を見る' }
    ],
    baseStats: { attack: 25, magic: 0, defense: 20, magicDefense: 8, speed: 8, hpMultiplier: 1.5 }
  },
  {
    id: 'goblin_warrior',
    baseName: 'ゴブリンウォーリア',
    type: 'humanoid',
    traits: { physicalResistance: 10 },
    actionPool: [
      { type: 'attack', weight: 6, name: '通常攻撃' },
      { type: 'defend', weight: 3, name: '防御' },
      { type: 'nothing', weight: 1, name: '様子を見る' }
    ],
    baseStats: { attack: 16, magic: 0, defense: 10, magicDefense: 6, speed: 13, hpMultiplier: 0.9 }
  },
  {
    id: 'dark_elf',
    baseName: 'ダークエルフ',
    type: 'humanoid',
    traits: { magicalResistance: 10 },
    actionPool: [
      { type: 'attack', weight: 6, name: '通常攻撃', attackType: 'magic' },
      { type: 'defend', weight: 3, name: '防御' },
      { type: 'nothing', weight: 1, name: '様子を見る' }
    ],
    baseStats: { attack: 18, magic: 14, defense: 10, magicDefense: 12, speed: 16, hpMultiplier: 0.95 }
  },
  {
    id: 'treant',
    baseName: 'トレント',
    type: 'elemental',
    traits: { physicalResistance: 20, statusImmunities: ['bleed'] },
    actionPool: [
      { type: 'attack', weight: 6, name: '通常攻撃' },
      { type: 'defend', weight: 3, name: '防御' },
      { type: 'nothing', weight: 1, name: '様子を見る' }
    ],
    baseStats: { attack: 14, magic: 10, defense: 22, magicDefense: 14, speed: 6, hpMultiplier: 1.4 }
  },
  {
    id: 'wild_boar',
    baseName: 'ワイルドボア',
    type: 'beast',
    traits: { physicalResistance: 15 },
    actionPool: [
      { type: 'attack', weight: 6, name: '通常攻撃' },
      { type: 'defend', weight: 3, name: '防御' },
      { type: 'nothing', weight: 1, name: '様子を見る' }
    ],
    baseStats: { attack: 20, magic: 0, defense: 14, magicDefense: 6, speed: 10, hpMultiplier: 1.2 }
  },

  // ========== 古代の遺跡 (Lv30-60) - アンデッド系が多い ==========
  {
    id: 'zombie',
    baseName: 'ゾンビ',
    type: 'undead',
    traits: {
      physicalResistance: 30,
      statusImmunities: ['poison', 'bleed', 'stun']
    },
    actionPool: [
      { type: 'attack', weight: 6, name: '通常攻撃' },
      { type: 'defend', weight: 3, name: '防御' },
      { type: 'nothing', weight: 1, name: '様子を見る' },
      { type: 'status', weight: 1, effects: [{ type: 'epidemic', chance: 25, stacks: 1, duration: 3 }], name: '伝染病' }
    ],
    baseStats: { attack: 20, magic: 0, defense: 15, magicDefense: 3, speed: 5, hpMultiplier: 1.3 }
  },
  {
    id: 'ghost',
    baseName: 'ゴースト',
    type: 'undead',
    traits: {
      physicalResistance: 50,
      magicalResistance: -20,
      statusImmunities: ['poison', 'bleed', 'burn', 'frozen']
    },
    actionPool: [
      { type: 'attack', weight: 6, name: '通常攻撃', attackType: 'magic' },
      { type: 'defend', weight: 3, name: '防御' },
      { type: 'nothing', weight: 1, name: '様子を見る' }
    ],
    baseStats: { attack: 8, magic: 20, defense: 3, magicDefense: 15, speed: 15, hpMultiplier: 0.7 }
  },
  {
    id: 'knight',
    baseName: 'ナイト',
    type: 'humanoid',
    traits: { physicalResistance: 25 },
    actionPool: [
      { type: 'attack', weight: 6, name: '通常攻撃' },
      { type: 'defend', weight: 3, name: '防御' },
      { type: 'nothing', weight: 1, name: '様子を見る' }
    ],
    baseStats: { attack: 24, magic: 0, defense: 22, magicDefense: 10, speed: 10, hpMultiplier: 1.3 }
  },
  {
    id: 'mage',
    baseName: 'メイジ',
    type: 'humanoid',
    traits: { magicalResistance: 20 },
    actionPool: [
      { type: 'attack', weight: 6, name: '通常攻撃', attackType: 'magic' },
      { type: 'defend', weight: 3, name: '防御' },
      { type: 'nothing', weight: 1, name: '様子を見る' }
    ],
    baseStats: { attack: 8, magic: 26, defense: 8, magicDefense: 16, speed: 14, hpMultiplier: 0.85 }
  },
  {
    id: 'gargoyle',
    baseName: 'ガーゴイル',
    type: 'construct',
    traits: { physicalResistance: 35, statusImmunities: ['poison', 'bleed', 'stun'] },
    actionPool: [
      { type: 'attack', weight: 6, name: '通常攻撃' },
      { type: 'defend', weight: 3, name: '防御' },
      { type: 'nothing', weight: 1, name: '様子を見る' }
    ],
    baseStats: { attack: 22, magic: 6, defense: 28, magicDefense: 12, speed: 8, hpMultiplier: 1.4 }
  },
  {
    id: 'lich',
    baseName: 'リッチ',
    type: 'undead',
    traits: {
      physicalResistance: 30,
      magicalResistance: 20,
      statusImmunities: ['poison', 'bleed']
    },
    actionPool: [
      { type: 'attack', weight: 6, name: '通常攻撃', attackType: 'magic' },
      { type: 'defend', weight: 3, name: '防御' },
      { type: 'nothing', weight: 1, name: '様子を見る' },
      { type: 'status', weight: 1, effects: [{ type: 'fear', chance: 40, stacks: 1, duration: 4 }], name: '恐怖' },
      { type: 'status', weight: 1, effects: [{ type: 'stun', chance: 20, stacks: 1, duration: 2 }], name: '気絶' }
    ],
    baseStats: { attack: 12, magic: 28, defense: 12, magicDefense: 24, speed: 10, hpMultiplier: 1.2 }
  },

  // ========== 火山クレーター (Lv60-120) - 炎系・魔法系 ==========
  {
    id: 'imp',
    baseName: 'インプ',
    type: 'demon',
    traits: {},
    actionPool: [
      { type: 'attack', weight: 6, name: '通常攻撃' },
      { type: 'defend', weight: 3, name: '防御' },
      { type: 'status', weight: 1, effects: [{ type: 'burn', chance: 35, stacks: 1, duration: 3 }], name: '火の玉' }
    ],
    baseStats: { attack: 18, magic: 16, defense: 8, magicDefense: 12, speed: 16, hpMultiplier: 0.95 }
  },
  {
    id: 'demon_warrior',
    baseName: 'デーモンウォーリア',
    type: 'demon',
    traits: {
      magicalResistance: 15
    },
    actionPool: [
      { type: 'attack', weight: 6, name: '通常攻撃' },
      { type: 'defend', weight: 3, name: '防御' },
      { type: 'status', weight: 1, effects: [{ type: 'burn', chance: 45, stacks: 2, duration: 3 }], name: '灼熱斬り' }
    ],
    baseStats: { attack: 28, magic: 10, defense: 18, magicDefense: 14, speed: 14, hpMultiplier: 1.3 }
  },
  {
    id: 'fire_elemental',
    baseName: 'ファイアエレメンタル',
    type: 'elemental',
    traits: {
      magicalResistance: 30,
      statusImmunities: ['burn']
    },
    actionPool: [
      { type: 'attack', weight: 6, name: '通常攻撃', attackType: 'magic' },
      { type: 'defend', weight: 3, name: '防御' },
      { type: 'status', weight: 1, effects: [{ type: 'burn', chance: 50, stacks: 3, duration: 4 }], name: '燃え盛る抱擁' }
    ],
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
    actionPool: [
      { type: 'attack', weight: 6, name: '通常攻撃' },
      { type: 'defend', weight: 3, name: '防御' },
    ],
    baseStats: { attack: 26, magic: 8, defense: 32, magicDefense: 10, speed: 6, hpMultiplier: 1.8 }
  },
  {
    id: 'flame_drake',
    baseName: 'フレイムドレイク',
    type: 'dragon',
    traits: {
      physicalResistance: 25,
      magicalResistance: 15
    },
    actionPool: [
      { type: 'attack', weight: 6, name: '通常攻撃' },
      { type: 'defend', weight: 3, name: '防御' },
      { type: 'status', weight: 1, effects: [{ type: 'burn', chance: 45, stacks: 3, duration: 4 }], name: '火炎ブレス' }
    ],
    baseStats: { attack: 34, magic: 18, defense: 22, magicDefense: 16, speed: 14, hpMultiplier: 1.6 }
  },
  {
    id: 'salamander',
    baseName: 'サラマンダー',
    type: 'dragon',
    traits: {
      magicalResistance: 20
    },
    actionPool: [
      { type: 'attack', weight: 6, name: '通常攻撃' },
      { type: 'defend', weight: 3, name: '防御' },
      { type: 'status', weight: 1, effects: [{ type: 'burn', chance: 50, stacks: 2, duration: 4 }], name: '炎尾' }
    ],
    baseStats: { attack: 22, magic: 24, defense: 14, magicDefense: 18, speed: 16, hpMultiplier: 1.2 }
  },

  // ========== 凍てつく凍土 (Lv120-200) - 氷系・耐性系 ==========
  {
    id: 'ice_elemental',
    baseName: 'アイスエレメンタル',
    type: 'elemental',
    traits: {
      magicalResistance: 35,
      statusImmunities: ['frozen']
    },
    actionPool: [
      { type: 'attack', weight: 6, name: '通常攻撃', attackType: 'magic' },
      { type: 'defend', weight: 3, name: '防御' },
      { type: 'status', weight: 1, effects: [{ type: 'frozen', chance: 50, stacks: 2, duration: 3 }], name: '氷結' }
    ],
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
    actionPool: [
      { type: 'attack', weight: 6, name: '通常攻撃' },
      { type: 'defend', weight: 3, name: '防御' },
    ],
    baseStats: { attack: 32, magic: 8, defense: 28, magicDefense: 18, speed: 8, hpMultiplier: 1.9 }
  },
  {
    id: 'yeti',
    baseName: 'イエティ',
    type: 'beast',
    traits: { physicalResistance: 20 },
    actionPool: [
      { type: 'attack', weight: 6, name: '通常攻撃' },
      { type: 'defend', weight: 3, name: '防御' },
    ],
    baseStats: { attack: 26, magic: 6, defense: 24, magicDefense: 14, speed: 10, hpMultiplier: 1.6 }
  },
  {
    id: 'frozen_lich',
    baseName: 'フローズンリッチ',
    type: 'undead',
    traits: {
      magicalResistance: 25,
      statusImmunities: ['frozen', 'poison', 'bleed']
    },
    actionPool: [
      { type: 'attack', weight: 6, name: '通常攻撃', attackType: 'magic' },
      { type: 'defend', weight: 3, name: '防御' },
      { type: 'status', weight: 1, effects: [{ type: 'frozen', chance: 45, stacks: 2, duration: 3 }], name: '氷結の呪い' }
    ],
    baseStats: { attack: 14, magic: 36, defense: 16, magicDefense: 28, speed: 10, hpMultiplier: 1.5 }
  },
  {
    id: 'ice_dragon',
    baseName: 'アイスドラゴン',
    type: 'dragon',
    traits: {
      magicalResistance: 25,
      statusImmunities: ['frozen']
    },
    actionPool: [
      { type: 'attack', weight: 6, name: '通常攻撃', attackType: 'magic' },
      { type: 'defend', weight: 3, name: '防御' },
      { type: 'status', weight: 1, effects: [{ type: 'frozen', chance: 50, stacks: 2, duration: 3 }], name: '氷霧ブレス' }
    ],
    baseStats: { attack: 30, magic: 28, defense: 22, magicDefense: 22, speed: 12, hpMultiplier: 1.8 }
  },

  // ========== 呪われた大聖堂 (Lv200-350) - 状態異常・呪い系 ==========
  {
    id: 'vampire',
    baseName: 'ヴァンパイア',
    type: 'undead',
    traits: {
      statusImmunities: ['bleed']
    },
    actionPool: [
      { type: 'attack', weight: 6, name: '通常攻撃' },
      { type: 'defend', weight: 3, name: '防御' },
      { type: 'status', weight: 1, effects: [{ type: 'bleed', chance: 60, stacks: 2, duration: 4 }], name: '吸血の爪' }
    ],
    baseStats: { attack: 28, magic: 18, defense: 18, magicDefense: 16, speed: 18, hpMultiplier: 1.4 }
  },
  {
    id: 'death_knight',
    baseName: 'デスナイト',
    type: 'undead',
    traits: {
      physicalResistance: 35,
      magicalResistance: 10
    },
    actionPool: [
      { type: 'attack', weight: 6, name: '通常攻撃' },
      { type: 'defend', weight: 3, name: '防御' },
      { type: 'status', weight: 1, effects: [{ type: 'fear', chance: 40, stacks: 1, duration: 4 }], name: '恐怖の一撃' },
      { type: 'status', weight: 1, effects: [{ type: 'bleed', chance: 35, stacks: 1, duration: 3 }], name: '流血剣' }
    ],
    baseStats: { attack: 34, magic: 12, defense: 30, magicDefense: 18, speed: 12, hpMultiplier: 1.7 }
  },
  {
    id: 'dark_priest',
    baseName: 'ダークプリースト',
    type: 'undead',
    traits: {
      magicalResistance: 25
    },
    actionPool: [
      { type: 'attack', weight: 6, name: '通常攻撃', attackType: 'magic' },
      { type: 'defend', weight: 3, name: '防御' },
      { type: 'status', weight: 1, effects: [{ type: 'fear', chance: 50, stacks: 1, duration: 4 }], name: '闇の祝福' },
      { type: 'status', weight: 1, effects: [{ type: 'stun', chance: 25, stacks: 1, duration: 2 }], name: '呪縛' }
    ],
    baseStats: { attack: 10, magic: 32, defense: 12, magicDefense: 24, speed: 12, hpMultiplier: 1.1 }
  },
  {
    id: 'banshee',
    baseName: 'バンシー',
    type: 'undead',
    traits: {
      physicalResistance: 40
    },
    actionPool: [
      { type: 'attack', weight: 6, name: '通常攻撃' },
      { type: 'defend', weight: 3, name: '防御' },
      { type: 'status', weight: 1, effects: [{ type: 'stun', chance: 45, stacks: 1, duration: 2 }], name: '絶叫' },
      { type: 'status', weight: 1, effects: [{ type: 'fear', chance: 40, stacks: 1, duration: 3 }], name: '戦慄' }
    ],
    baseStats: { attack: 12, magic: 26, defense: 14, magicDefense: 22, speed: 16, hpMultiplier: 1.25 }
  },
  {
    id: 'wraith',
    baseName: 'レイス',
    type: 'undead',
    traits: {
      physicalResistance: 50,
      statusImmunities: ['poison', 'bleed']
    },
    actionPool: [
      { type: 'attack', weight: 6, name: '通常攻撃', attackType: 'magic' },
      { type: 'defend', weight: 3, name: '防御' },
      { type: 'status', weight: 1, effects: [{ type: 'fear', chance: 55, stacks: 1, duration: 4 }], name: '怨念' },
      { type: 'status', weight: 1, effects: [{ type: 'stun', chance: 30, stacks: 1, duration: 2 }], name: '凍てつく触手' }
    ],
    baseStats: { attack: 8, magic: 32, defense: 12, magicDefense: 26, speed: 14, hpMultiplier: 1.3 }
  },

  // ========== 深淵の奈落 (Lv350-550) - 複合耐性・多属性 ==========
  {
    id: 'assassin',
    baseName: 'アサシン',
    type: 'humanoid',
    traits: {},
    actionPool: [
      { type: 'attack', weight: 6, name: '通常攻撃' },
      { type: 'defend', weight: 3, name: '防御' },
      { type: 'status', weight: 1, effects: [{ type: 'bleed', chance: 50, stacks: 2, duration: 4 }], name: '致命の一刺し' },
      { type: 'status', weight: 1, effects: [{ type: 'poison', chance: 40, stacks: 1, duration: 3 }], name: '毒液' }
    ],
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
    actionPool: [
      { type: 'attack', weight: 6, name: '通常攻撃', attackType: 'magic' },
      { type: 'defend', weight: 3, name: '防御' },
    ],
    baseStats: { attack: 30, magic: 34, defense: 20, magicDefense: 28, speed: 18, hpMultiplier: 1.6 }
  },
  {
    id: 'storm_elemental',
    baseName: 'ストームエレメンタル',
    type: 'elemental',
    traits: {
      magicalResistance: 32,
      statusImmunities: ['stun']
    },
    actionPool: [
      { type: 'attack', weight: 6, name: '通常攻撃', attackType: 'magic' },
      { type: 'defend', weight: 3, name: '防御' },
      { type: 'status', weight: 1, effects: [{ type: 'stun', chance: 40, stacks: 1, duration: 2 }], name: '雷撃' },
      { type: 'status', weight: 1, effects: [{ type: 'burn', chance: 30, stacks: 1, duration: 2 }], name: '閃電' }
    ],
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
    actionPool: [
      { type: 'attack', weight: 6, name: '通常攻撃' },
      { type: 'defend', weight: 3, name: '防御' },
    ],
    baseStats: { attack: 28, magic: 6, defense: 36, magicDefense: 14, speed: 6, hpMultiplier: 2.0 }
  },
  {
    id: 'drake',
    baseName: 'ドレイク',
    type: 'dragon',
    traits: {
      physicalResistance: 22,
      magicalResistance: 18
    },
    actionPool: [
      { type: 'attack', weight: 6, name: '通常攻撃' },
      { type: 'defend', weight: 3, name: '防御' },
      { type: 'status', weight: 1, effects: [{ type: 'burn', chance: 35, stacks: 1, duration: 3 }], name: '火炎ブレス' },
      { type: 'status', weight: 1, effects: [{ type: 'poison', chance: 30, stacks: 1, duration: 3 }], name: '毒液' }
    ],
    baseStats: { attack: 32, magic: 20, defense: 20, magicDefense: 18, speed: 14, hpMultiplier: 1.5 }
  },
  {
    id: 'wyvern',
    baseName: 'ワイバーン',
    type: 'dragon',
    traits: {
      magicalResistance: 20
    },
    actionPool: [
      { type: 'attack', weight: 6, name: '通常攻撃' },
      { type: 'defend', weight: 3, name: '防御' },
      { type: 'status', weight: 1, effects: [{ type: 'poison', chance: 45, stacks: 2, duration: 4 }], name: '毒牙' }
    ],
    baseStats: { attack: 30, magic: 14, defense: 18, magicDefense: 16, speed: 16, hpMultiplier: 1.4 }
  },
  {
    id: 'eldritch_horror',
    baseName: 'エルドリッチホラー',
    type: 'demon',
    traits: {
      statusImmunities: ['poison', 'bleed', 'burn', 'frozen']
    },
    actionPool: [
      { type: 'attack', weight: 6, name: '通常攻撃', attackType: 'magic' },
      { type: 'defend', weight: 3, name: '防御' },
    ],
    baseStats: { attack: 32, magic: 40, defense: 26, magicDefense: 32, speed: 12, hpMultiplier: 2.1 }
  },

  // ========== 竜の巣 (Lv550-800) - 竜族・複合防御 ==========
  {
    id: 'dragon',
    baseName: 'ドラゴン',
    type: 'dragon',
    traits: {
      physicalResistance: 30,
      magicalResistance: 20
    },
    actionPool: [
      { type: 'attack', weight: 6, name: '通常攻撃', attackType: 'physical' },
      { type: 'defend', weight: 3, name: '防御' },
      { type: 'status', weight: 1, effects: [{ type: 'burn', chance: 40, stacks: 2, duration: 3 }], name: '火炎の息吹', damage: { stat: 'attack', multiplier: 1.2, variance: 0.25 }, logStyle: 'special' },
      { type: 'status', weight: 1, effects: [{ type: 'bleed', chance: 30, stacks: 1, duration: 3 }], name: '鉤爪', damage: { stat: 'attack', multiplier: 1.0, variance: 0.2 }, logStyle: 'special' }
    ],
    baseStats: { attack: 38, magic: 24, defense: 28, magicDefense: 24, speed: 14, hpMultiplier: 2.0 }
  },
  {
    id: 'dragon_knight',
    baseName: 'ドラゴンナイト',
    type: 'humanoid',
    traits: { physicalResistance: 25 },
    actionPool: [
      { type: 'attack', weight: 6, name: '通常攻撃' },
      { type: 'defend', weight: 3, name: '防御' },
    ],
    baseStats: { attack: 34, magic: 12, defense: 26, magicDefense: 18, speed: 14, hpMultiplier: 1.6 }
  },
  {
    id: 'dragon_shaman',
    baseName: '竜人シャーマン',
    type: 'humanoid',
    traits: { magicalResistance: 25 },
    actionPool: [
      { type: 'attack', weight: 6, name: '通常攻撃', attackType: 'magic' },
      { type: 'defend', weight: 3, name: '防御' },
    ],
    baseStats: { attack: 18, magic: 34, defense: 16, magicDefense: 24, speed: 14, hpMultiplier: 1.4 }
  },
  {
    id: 'chaos_apostle',
    baseName: '混沌の使徒',
    type: 'demon',
    traits: {
      magicalResistance: 30
    },
    actionPool: [
      { type: 'attack', weight: 6, name: '通常攻撃' },
      { type: 'defend', weight: 3, name: '防御' },
      { type: 'status', weight: 1, effects: [{ type: 'fear', chance: 50, stacks: 1, duration: 4 }], name: '混沌の視線', damage: { stat: 'magic', multiplier: 1.1, variance: 0.25 }, logStyle: 'special' },
      { type: 'status', weight: 1, effects: [{ type: 'stun', chance: 35, stacks: 1, duration: 2 }], name: '精神崩落', damage: { stat: 'magic', multiplier: 1.0, variance: 0.25 }, logStyle: 'special' }
    ],
    baseStats: { attack: 28, magic: 36, defense: 22, magicDefense: 30, speed: 16, hpMultiplier: 1.7 }
  },
  {
    id: 'ancient_dragon',
    baseName: 'アンシェントドラゴン',
    type: 'dragon',
    traits: {
      physicalResistance: 40,
      magicalResistance: 30,
      statusImmunities: ['poison']
    },
    actionPool: [
      { type: 'attack', weight: 6, name: '通常攻撃', attackType: 'physical' },
      { type: 'defend', weight: 3, name: '防御' },
      { type: 'status', weight: 1, effects: [{ type: 'burn', chance: 50, stacks: 3, duration: 4 }], name: '紅蓮のブレス', damage: { stat: 'attack', multiplier: 1.3, variance: 0.3 }, logStyle: 'special' },
      { type: 'status', weight: 1, effects: [{ type: 'bleed', chance: 40, stacks: 2, duration: 4 }], name: '裂傷の尾撃', damage: { stat: 'attack', multiplier: 1.1, variance: 0.25 }, logStyle: 'special' },
      { type: 'status', weight: 1, effects: [{ type: 'fear', chance: 30, stacks: 1, duration: 3 }], name: '威圧の咆哮', damage: { stat: 'attack', multiplier: 1.0, variance: 0.2 }, logStyle: 'special' }
    ],
    baseStats: { attack: 46, magic: 32, defense: 34, magicDefense: 30, speed: 16, hpMultiplier: 2.4 }
  },

  // ========== 高次元帯 (Lv500-800) - 武器タイプ無効・複合耐性 ==========
  {
    id: 'void_wyrm',
    baseName: 'ヴォイドワイバーン',
    type: 'dragon',
    traits: {
      physicalResistance: 40,
      magicalResistance: 40,
      attackImmunities: ['ranged'],
      statusImmunities: ['poison']
    },
    actionPool: [
      { type: 'attack', weight: 6, name: '通常攻撃' },
      { type: 'defend', weight: 3, name: '防御' },
      { type: 'status', weight: 1, effects: [{ type: 'burn', chance: 45, stacks: 2, duration: 3 }], name: '虚空のブレス', damage: { stat: 'attack', multiplier: 1.2, variance: 0.3 }, logStyle: 'special' }
    ],
    baseStats: { attack: 40, magic: 30, defense: 30, magicDefense: 28, speed: 16, hpMultiplier: 2.0 }
  },
  {
    id: 'phantom_mage',
    baseName: '幽界の魔導士',
    type: 'humanoid',
    traits: {
      magicalResistance: 45,
      attackImmunities: ['melee'],
      statusImmunities: ['frozen', 'bleed']
    },
    actionPool: [
      { type: 'attack', weight: 6, name: '通常攻撃', attackType: 'magic' },
      { type: 'defend', weight: 3, name: '防御' },
      { type: 'status', weight: 1, effects: [{ type: 'stun', chance: 50, stacks: 1, duration: 2 }], name: '幽界の衝撃', damage: { stat: 'magic', multiplier: 1.1, variance: 0.25 }, logStyle: 'special' }
    ],
    baseStats: { attack: 14, magic: 42, defense: 16, magicDefense: 36, speed: 16, hpMultiplier: 1.6 }
  },
  {
    id: 'crystalline_construct',
    baseName: '結晶体コンストラクト',
    type: 'construct',
    traits: {
      physicalResistance: 50,
      attackImmunities: ['magic'],
      statusImmunities: ['poison', 'bleed', 'burn', 'frozen']
    },
    actionPool: [
      { type: 'attack', weight: 6, name: '通常攻撃' },
      { type: 'defend', weight: 3, name: '防御' },
    ],
    baseStats: { attack: 38, magic: 10, defense: 40, magicDefense: 20, speed: 10, hpMultiplier: 2.3 }
  },
  {
    id: 'eternal_dragon',
    baseName: '永遠のドラゴン',
    type: 'dragon',
    traits: {
      physicalResistance: 45,
      magicalResistance: 45,
      attackImmunities: ['dot'],
      statusImmunities: ['poison', 'burn', 'bleed']
    },
    actionPool: [
      { type: 'attack', weight: 6, name: '通常攻撃' },
      { type: 'defend', weight: 3, name: '防御' },
      { type: 'status', weight: 1, effects: [{ type: 'burn', chance: 50, stacks: 3, duration: 5 }], name: '永遠の炎', damage: { stat: 'attack', multiplier: 1.3, variance: 0.3 }, logStyle: 'special' },
      { type: 'status', weight: 1, effects: [{ type: 'fear', chance: 40, stacks: 1, duration: 4 }], name: '尊厳の威圧', damage: { stat: 'attack', multiplier: 1.0, variance: 0.2 }, logStyle: 'special' }
    ],
    baseStats: { attack: 44, magic: 32, defense: 34, magicDefense: 32, speed: 16, hpMultiplier: 2.4 }
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
    actionPool: [
      { type: 'attack', weight: 6, name: '通常攻撃' },
      { type: 'defend', weight: 3, name: '防御' },
    ],
    baseStats: { attack: 34, magic: 26, defense: 32, magicDefense: 32, speed: 12, hpMultiplier: 2.0 }
  },
  {
    id: 'void_ruler',
    baseName: '虚無の支配者',
    type: 'demon',
    traits: {
      physicalResistance: 35,
      magicalResistance: 40,
      statusImmunities: ['poison', 'bleed', 'frozen']
    },
    actionPool: [
      { type: 'attack', weight: 6, name: '通常攻撃', attackType: 'magic' },
      { type: 'defend', weight: 3, name: '防御' },
      { type: 'status', weight: 1, effects: [{ type: 'fear', chance: 60, stacks: 2, duration: 4 }], name: '絶望の視線', damage: { stat: 'magic', multiplier: 1.1, variance: 0.25 }, logStyle: 'special' },
      { type: 'status', weight: 1, effects: [{ type: 'stun', chance: 40, stacks: 1, duration: 2 }], name: '虚無の拘束', damage: { stat: 'magic', multiplier: 1.0, variance: 0.2 }, logStyle: 'special' }
    ],
    baseStats: { attack: 40, magic: 44, defense: 32, magicDefense: 34, speed: 16, hpMultiplier: 2.5 }
  },
  {
    id: 'infinite_avatar',
    baseName: '無限の化身',
    type: 'elemental',
    traits: {
      statusImmunities: ['poison', 'bleed', 'burn', 'frozen', 'stun']
    },
    actionPool: [
      { type: 'attack', weight: 6, name: '通常攻撃', attackType: 'magic' },
      { type: 'defend', weight: 3, name: '防御' },
    ],
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