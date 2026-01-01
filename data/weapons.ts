import type { Weapon } from '../types'

/**
 * 自動生成された100種類の武器データベース
 * 4タイプ × レアリティ分布: common 40%, rare 35%, epic 20%, legendary 5%
 */

const generateWeaponId = (type: string, rarity: string, index: number) => 
  `${type}_${rarity}_${index}`.toLowerCase()

export const weaponDatabase: Weapon[] = [
  // ========== COMMON (40個) ==========
  // Melee Common (10個)
  {
    id: generateWeaponId('melee', 'common', 1),
    name: '錆びた剣',
    type: 'melee',
    rarity: 'common',
    stats: { attack: 12, magic: 0, speed: 8, critChance: 5, critDamage: 1.2, statusPower: 0 },
    tags: [],
    effects: [],
    description: '古びた剣。最低限の性能'
  },
  {
    id: generateWeaponId('melee', 'common', 2),
    name: '木の棒',
    type: 'melee',
    rarity: 'common',
    stats: { attack: 10, magic: 0, speed: 12, critChance: 3, critDamage: 1.3, statusPower: 0 },
    tags: ['fast'],
    effects: [],
    description: '軽い木製の棒'
  },
  {
    id: generateWeaponId('melee', 'common', 3),
    name: '石斧',
    type: 'melee',
    rarity: 'common',
    stats: { attack: 18, magic: 0, speed: 5, critChance: 8, critDamage: 1.4, statusPower: 0 },
    tags: ['heavy'],
    effects: [],
    description: '重い石の斧'
  },
  {
    id: generateWeaponId('melee', 'common', 4),
    name: '短剣',
    type: 'melee',
    rarity: 'common',
    stats: { attack: 13, magic: 0, speed: 15, critChance: 10, critDamage: 1.5, statusPower: 0 },
    tags: ['fast', 'precise'],
    effects: [],
    description: '素早い攻撃が可能'
  },
  {
    id: generateWeaponId('melee', 'common', 5),
    name: 'ハンマー',
    type: 'melee',
    rarity: 'common',
    stats: { attack: 20, magic: 0, speed: 6, critChance: 7, critDamage: 1.5, statusPower: 0 },
    tags: ['heavy'],
    effects: [],
    description: '鈍器の一撃'
  },
  {
    id: generateWeaponId('melee', 'common', 6),
    name: '青銅の剣',
    type: 'melee',
    rarity: 'common',
    stats: { attack: 15, magic: 0, speed: 10, critChance: 5, critDamage: 1.3, statusPower: 0 },
    tags: [],
    effects: [],
    description: '標準的な青銅製の剣'
  },
  {
    id: generateWeaponId('melee', 'common', 7),
    name: 'スピア',
    type: 'melee',
    rarity: 'common',
    stats: { attack: 14, magic: 0, speed: 9, critChance: 6, critDamage: 1.4, statusPower: 0 },
    tags: [],
    effects: [],
    description: '槍による刺突攻撃'
  },
  {
    id: generateWeaponId('melee', 'common', 8),
    name: 'サーベル',
    type: 'melee',
    rarity: 'common',
    stats: { attack: 16, magic: 0, speed: 11, critChance: 8, critDamage: 1.4, statusPower: 0 },
    tags: ['fast'],
    effects: [],
    description: '曲刀による斬撃'
  },
  {
    id: generateWeaponId('melee', 'common', 9),
    name: 'モーニングスター',
    type: 'melee',
    rarity: 'common',
    stats: { attack: 17, magic: 0, speed: 7, critChance: 9, critDamage: 1.5, statusPower: 0 },
    tags: ['heavy'],
    effects: [],
    description: 'トゲ付きの鈍器'
  },
  {
    id: generateWeaponId('melee', 'common', 10),
    name: 'ロングソード',
    type: 'melee',
    rarity: 'common',
    stats: { attack: 15, magic: 0, speed: 9, critChance: 6, critDamage: 1.3, statusPower: 0 },
    tags: [],
    effects: [],
    description: '長めの剣'
  },

  // Ranged Common (10個)
  {
    id: generateWeaponId('ranged', 'common', 1),
    name: '弱い弓',
    type: 'ranged',
    rarity: 'common',
    stats: { attack: 11, magic: 0, speed: 13, critChance: 8, critDamage: 1.3, statusPower: 0 },
    tags: ['fast'],
    effects: [],
    description: '基本的な弓'
  },
  {
    id: generateWeaponId('ranged', 'common', 2),
    name: 'スリング',
    type: 'ranged',
    rarity: 'common',
    stats: { attack: 9, magic: 0, speed: 15, critChance: 5, critDamage: 1.2, statusPower: 0 },
    tags: ['fast'],
    effects: [],
    description: '投石器'
  },
  {
    id: generateWeaponId('ranged', 'common', 3),
    name: '狩猟弓',
    type: 'ranged',
    rarity: 'common',
    stats: { attack: 14, magic: 0, speed: 12, critChance: 10, critDamage: 1.4, statusPower: 0 },
    tags: ['precise'],
    effects: [],
    description: '動物狩り用の弓'
  },
  {
    id: generateWeaponId('ranged', 'common', 4),
    name: '手投げナイフ',
    type: 'ranged',
    rarity: 'common',
    stats: { attack: 10, magic: 0, speed: 16, critChance: 7, critDamage: 1.3, statusPower: 0 },
    tags: ['fast'],
    effects: [],
    description: '投擲用ナイフ'
  },
  {
    id: generateWeaponId('ranged', 'common', 5),
    name: 'ショートボウ',
    type: 'ranged',
    rarity: 'common',
    stats: { attack: 12, magic: 0, speed: 14, critChance: 9, critDamage: 1.4, statusPower: 0 },
    tags: ['fast'],
    effects: [],
    description: '短めの弓'
  },
  {
    id: generateWeaponId('ranged', 'common', 6),
    name: 'ダーツ',
    type: 'ranged',
    rarity: 'common',
    stats: { attack: 8, magic: 0, speed: 17, critChance: 6, critDamage: 1.2, statusPower: 0 },
    tags: ['fast'],
    effects: [],
    description: '小型の投擲武器'
  },
  {
    id: generateWeaponId('ranged', 'common', 7),
    name: 'ジャベリン',
    type: 'ranged',
    rarity: 'common',
    stats: { attack: 15, magic: 0, speed: 11, critChance: 8, critDamage: 1.4, statusPower: 0 },
    tags: [],
    effects: [],
    description: '投げ槍'
  },
  {
    id: generateWeaponId('ranged', 'common', 8),
    name: 'ブーメラン',
    type: 'ranged',
    rarity: 'common',
    stats: { attack: 11, magic: 0, speed: 13, critChance: 7, critDamage: 1.3, statusPower: 0 },
    tags: ['fast'],
    effects: [],
    description: '戻ってくる武器'
  },
  {
    id: generateWeaponId('ranged', 'common', 9),
    name: 'ロングボウ',
    type: 'ranged',
    rarity: 'common',
    stats: { attack: 16, magic: 0, speed: 10, critChance: 10, critDamage: 1.5, statusPower: 0 },
    tags: ['precise'],
    effects: [],
    description: '長距離射撃用'
  },
  {
    id: generateWeaponId('ranged', 'common', 10),
    name: '吹き矢',
    type: 'ranged',
    rarity: 'common',
    stats: { attack: 7, magic: 0, speed: 14, critChance: 6, critDamage: 1.2, statusPower: 3 },
    tags: ['fast'],
    effects: [],
    description: '毒を塗れる'
  },

  // Magic Common (10個)
  {
    id: generateWeaponId('magic', 'common', 1),
    name: '木の杖',
    type: 'magic',
    rarity: 'common',
    stats: { attack: 3, magic: 18, speed: 7, critChance: 5, critDamage: 1.3, statusPower: 3 },
    tags: ['elemental'],
    effects: [],
    description: '見習い魔法使いの杖'
  },
  {
    id: generateWeaponId('magic', 'common', 2),
    name: '水晶の杖',
    type: 'magic',
    rarity: 'common',
    stats: { attack: 2, magic: 20, speed: 8, critChance: 6, critDamage: 1.4, statusPower: 4 },
    tags: ['elemental'],
    effects: [],
    description: '小さな水晶付き'
  },
  {
    id: generateWeaponId('magic', 'common', 3),
    name: '魔法の杖',
    type: 'magic',
    rarity: 'common',
    stats: { attack: 4, magic: 19, speed: 8, critChance: 7, critDamage: 1.3, statusPower: 5 },
    tags: ['elemental'],
    effects: [],
    description: '基本的な魔法杖'
  },
  {
    id: generateWeaponId('magic', 'common', 4),
    name: 'ワンド',
    type: 'magic',
    rarity: 'common',
    stats: { attack: 2, magic: 17, speed: 9, critChance: 5, critDamage: 1.2, statusPower: 3 },
    tags: [],
    effects: [],
    description: '短い魔法の棒'
  },
  {
    id: generateWeaponId('magic', 'common', 5),
    name: '古書',
    type: 'magic',
    rarity: 'common',
    stats: { attack: 3, magic: 21, speed: 6, critChance: 8, critDamage: 1.4, statusPower: 5 },
    tags: ['elemental'],
    effects: [],
    description: '魔法の書物'
  },
  {
    id: generateWeaponId('magic', 'common', 6),
    name: 'オーブ',
    type: 'magic',
    rarity: 'common',
    stats: { attack: 1, magic: 22, speed: 7, critChance: 6, critDamage: 1.3, statusPower: 4 },
    tags: ['elemental'],
    effects: [],
    description: '魔力の球体'
  },
  {
    id: generateWeaponId('magic', 'common', 7),
    name: 'ルーンストーン',
    type: 'magic',
    rarity: 'common',
    stats: { attack: 2, magic: 19, speed: 8, critChance: 7, critDamage: 1.4, statusPower: 5 },
    tags: [],
    effects: [],
    description: '魔法の石'
  },
  {
    id: generateWeaponId('magic', 'common', 8),
    name: 'チャーム',
    type: 'magic',
    rarity: 'common',
    stats: { attack: 3, magic: 18, speed: 9, critChance: 5, critDamage: 1.2, statusPower: 3 },
    tags: [],
    effects: [],
    description: '護符'
  },
  {
    id: generateWeaponId('magic', 'common', 9),
    name: 'スクロール',
    type: 'magic',
    rarity: 'common',
    stats: { attack: 2, magic: 20, speed: 8, critChance: 6, critDamage: 1.3, statusPower: 4 },
    tags: ['elemental'],
    effects: [],
    description: '魔法の巻物'
  },
  {
    id: generateWeaponId('magic', 'common', 10),
    name: 'アミュレット',
    type: 'magic',
    rarity: 'common',
    stats: { attack: 1, magic: 21, speed: 7, critChance: 7, critDamage: 1.4, statusPower: 5 },
    tags: [],
    effects: [],
    description: 'お守り'
  },

  // Hybrid Common (10個)
  {
    id: generateWeaponId('hybrid', 'common', 1),
    name: '魔法剣',
    type: 'hybrid',
    rarity: 'common',
    stats: { attack: 11, magic: 11, speed: 9, critChance: 6, critDamage: 1.3, statusPower: 2 },
    tags: [],
    effects: [],
    description: '物理と魔法のハイブリッド'
  },
  {
    id: generateWeaponId('hybrid', 'common', 2),
    name: 'エンチャントボウ',
    type: 'hybrid',
    rarity: 'common',
    stats: { attack: 10, magic: 12, speed: 11, critChance: 8, critDamage: 1.4, statusPower: 3 },
    tags: ['elemental'],
    effects: [],
    description: '魔力を帯びた弓'
  },
  {
    id: generateWeaponId('hybrid', 'common', 3),
    name: '戦闘杖',
    type: 'hybrid',
    rarity: 'common',
    stats: { attack: 12, magic: 10, speed: 8, critChance: 5, critDamage: 1.3, statusPower: 2 },
    tags: [],
    effects: [],
    description: '殴れる杖'
  },
  {
    id: generateWeaponId('hybrid', 'common', 4),
    name: 'ルーンソード',
    type: 'hybrid',
    rarity: 'common',
    stats: { attack: 13, magic: 9, speed: 10, critChance: 7, critDamage: 1.4, statusPower: 3 },
    tags: ['elemental'],
    effects: [],
    description: 'ルーンが刻まれた剣'
  },
  {
    id: generateWeaponId('hybrid', 'common', 5),
    name: 'チャクラム',
    type: 'hybrid',
    rarity: 'common',
    stats: { attack: 9, magic: 13, speed: 12, critChance: 9, critDamage: 1.3, statusPower: 2 },
    tags: ['fast'],
    effects: [],
    description: '魔力を帯びた円盤'
  },
  {
    id: generateWeaponId('hybrid', 'common', 6),
    name: '聖なる槍',
    type: 'hybrid',
    rarity: 'common',
    stats: { attack: 14, magic: 8, speed: 9, critChance: 6, critDamage: 1.4, statusPower: 2 },
    tags: [],
    effects: [],
    description: '祝福された槍'
  },
  {
    id: generateWeaponId('hybrid', 'common', 7),
    name: 'バトルロッド',
    type: 'hybrid',
    rarity: 'common',
    stats: { attack: 11, magic: 11, speed: 8, critChance: 5, critDamage: 1.3, statusPower: 3 },
    tags: [],
    effects: [],
    description: '魔法戦士の杖'
  },
  {
    id: generateWeaponId('hybrid', 'common', 8),
    name: 'フレイムダガー',
    type: 'hybrid',
    rarity: 'common',
    stats: { attack: 10, magic: 12, speed: 13, critChance: 10, critDamage: 1.4, statusPower: 4 },
    tags: ['fast', 'elemental'],
    effects: [{ type: 'burn', chance: 10, stacks: 1, duration: 2 }],
    description: '炎を纏う短剣'
  },
  {
    id: generateWeaponId('hybrid', 'common', 9),
    name: 'サンダースピア',
    type: 'hybrid',
    rarity: 'common',
    stats: { attack: 12, magic: 10, speed: 10, critChance: 7, critDamage: 1.3, statusPower: 3 },
    tags: ['elemental'],
    effects: [],
    description: '雷を宿した槍'
  },
  {
    id: generateWeaponId('hybrid', 'common', 10),
    name: 'アイススタッフ',
    type: 'hybrid',
    rarity: 'common',
    stats: { attack: 8, magic: 14, speed: 9, critChance: 6, critDamage: 1.4, statusPower: 4 },
    tags: ['elemental'],
    effects: [{ type: 'frozen', chance: 8, stacks: 1, duration: 2 }],
    description: '氷の力を持つ杖'
  },

  // ========== RARE (35個) ==========
  // Melee Rare (9個)
  {
    id: generateWeaponId('melee', 'rare', 1),
    name: '鋼の剣',
    type: 'melee',
    rarity: 'rare',
    stats: { attack: 28, magic: 0, speed: 14, critChance: 15, critDamage: 1.7, statusPower: 0 },
    tags: ['fast'],
    effects: [],
    description: '高品質な鋼鉄製'
  },
  {
    id: generateWeaponId('melee', 'rare', 2),
    name: '大剣',
    type: 'melee',
    rarity: 'rare',
    stats: { attack: 35, magic: 0, speed: 10, critChance: 18, critDamage: 2.0, statusPower: 0 },
    tags: ['heavy'],
    effects: [],
    description: '巨大な両手剣'
  },
  {
    id: generateWeaponId('melee', 'rare', 3),
    name: 'バトルアックス',
    type: 'melee',
    rarity: 'rare',
    stats: { attack: 32, magic: 0, speed: 11, critChance: 16, critDamage: 1.9, statusPower: 0 },
    tags: ['heavy'],
    effects: [],
    description: '戦斧'
  },
  {
    id: generateWeaponId('melee', 'rare', 4),
    name: 'レイピア',
    type: 'melee',
    rarity: 'rare',
    stats: { attack: 24, magic: 0, speed: 18, critChance: 22, critDamage: 1.8, statusPower: 0 },
    tags: ['fast', 'precise'],
    effects: [],
    description: '優雅な刺突剣'
  },
  {
    id: generateWeaponId('melee', 'rare', 5),
    name: 'ウォーハンマー',
    type: 'melee',
    rarity: 'rare',
    stats: { attack: 34, magic: 0, speed: 9, critChance: 14, critDamage: 1.9, statusPower: 0 },
    tags: ['heavy'],
    effects: [],
    description: '戦鎚'
  },
  {
    id: generateWeaponId('melee', 'rare', 6),
    name: 'カタール',
    type: 'melee',
    rarity: 'rare',
    stats: { attack: 26, magic: 0, speed: 17, critChance: 20, critDamage: 1.8, statusPower: 8 },
    tags: ['fast', 'bleeding'],
    effects: [{ type: 'bleed', chance: 25, stacks: 2, duration: 3 }],
    description: '二連の刃'
  },
  {
    id: generateWeaponId('melee', 'rare', 7),
    name: 'フランシスカ',
    type: 'melee',
    rarity: 'rare',
    stats: { attack: 30, magic: 0, speed: 12, critChance: 17, critDamage: 1.9, statusPower: 0 },
    tags: ['heavy'],
    effects: [],
    description: '投げれる戦斧'
  },
  {
    id: generateWeaponId('melee', 'rare', 8),
    name: 'ツヴァイハンダー',
    type: 'melee',
    rarity: 'rare',
    stats: { attack: 36, magic: 0, speed: 8, critChance: 15, critDamage: 2.0, statusPower: 0 },
    tags: ['heavy'],
    effects: [],
    description: '超巨大剣'
  },
  {
    id: generateWeaponId('melee', 'rare', 9),
    name: 'シミター',
    type: 'melee',
    rarity: 'rare',
    stats: { attack: 27, magic: 0, speed: 16, critChance: 19, critDamage: 1.7, statusPower: 0 },
    tags: ['fast'],
    effects: [],
    description: '湾曲した剣'
  },

  // Ranged Rare (9個)
  {
    id: generateWeaponId('ranged', 'rare', 1),
    name: '複合弓',
    type: 'ranged',
    rarity: 'rare',
    stats: { attack: 26, magic: 0, speed: 16, critChance: 18, critDamage: 1.8, statusPower: 0 },
    tags: ['precise'],
    effects: [],
    description: '強力な複合材料製'
  },
  {
    id: generateWeaponId('ranged', 'rare', 2),
    name: 'クロスボウ',
    type: 'ranged',
    rarity: 'rare',
    stats: { attack: 30, magic: 0, speed: 13, critChance: 20, critDamage: 1.9, statusPower: 0 },
    tags: ['precise'],
    effects: [],
    description: '高威力の弩'
  },
  {
    id: generateWeaponId('ranged', 'rare', 3),
    name: '狙撃弓',
    type: 'ranged',
    rarity: 'rare',
    stats: { attack: 28, magic: 0, speed: 14, critChance: 24, critDamage: 2.0, statusPower: 0 },
    tags: ['precise'],
    effects: [],
    description: '精密射撃用'
  },
  {
    id: generateWeaponId('ranged', 'rare', 4),
    name: '手裏剣',
    type: 'ranged',
    rarity: 'rare',
    stats: { attack: 22, magic: 0, speed: 20, critChance: 16, critDamage: 1.6, statusPower: 5 },
    tags: ['fast'],
    effects: [],
    description: '忍者の投擲武器'
  },
  {
    id: generateWeaponId('ranged', 'rare', 5),
    name: 'ヘビークロスボウ',
    type: 'ranged',
    rarity: 'rare',
    stats: { attack: 33, magic: 0, speed: 11, critChance: 19, critDamage: 1.9, statusPower: 0 },
    tags: ['heavy', 'precise'],
    effects: [],
    description: '重装弩'
  },
  {
    id: generateWeaponId('ranged', 'rare', 6),
    name: 'トライデント',
    type: 'ranged',
    rarity: 'rare',
    stats: { attack: 29, magic: 5, speed: 15, critChance: 17, critDamage: 1.7, statusPower: 7 },
    tags: [],
    effects: [],
    description: '三叉の槍'
  },
  {
    id: generateWeaponId('ranged', 'rare', 7),
    name: 'エルフの弓',
    type: 'ranged',
    rarity: 'rare',
    stats: { attack: 25, magic: 10, speed: 18, critChance: 21, critDamage: 1.8, statusPower: 8 },
    tags: ['fast', 'elemental'],
    effects: [],
    description: 'エルフ製の名弓'
  },
  {
    id: generateWeaponId('ranged', 'rare', 8),
    name: '毒矢筒',
    type: 'ranged',
    rarity: 'rare',
    stats: { attack: 20, magic: 0, speed: 17, critChance: 15, critDamage: 1.6, statusPower: 15 },
    tags: ['fast'],
    effects: [{ type: 'poison', chance: 35, stacks: 2, duration: 4 }],
    description: '毒を塗った矢'
  },
  {
    id: generateWeaponId('ranged', 'rare', 9),
    name: 'リピートクロスボウ',
    type: 'ranged',
    rarity: 'rare',
    stats: { attack: 24, magic: 0, speed: 19, critChance: 16, critDamage: 1.7, statusPower: 0 },
    tags: ['fast'],
    effects: [],
    description: '連射可能'
  },

  // Magic Rare (9個)
  {
    id: generateWeaponId('magic', 'rare', 1),
    name: '賢者の杖',
    type: 'magic',
    rarity: 'rare',
    stats: { attack: 8, magic: 32, speed: 13, critChance: 14, critDamage: 1.7, statusPower: 12 },
    tags: ['elemental'],
    effects: [],
    description: '知識の力を秘める'
  },
  {
    id: generateWeaponId('magic', 'rare', 2),
    name: '雷の杖',
    type: 'magic',
    rarity: 'rare',
    stats: { attack: 10, magic: 30, speed: 14, critChance: 16, critDamage: 1.8, statusPower: 10 },
    tags: ['elemental'],
    effects: [{ type: 'stun', chance: 20, stacks: 1, duration: 2 }],
    description: '雷撃を放つ'
  },
  {
    id: generateWeaponId('magic', 'rare', 3),
    name: '氷結の書',
    type: 'magic',
    rarity: 'rare',
    stats: { attack: 6, magic: 34, speed: 12, critChance: 15, critDamage: 1.7, statusPower: 14 },
    tags: ['elemental'],
    effects: [{ type: 'frozen', chance: 30, stacks: 2, duration: 3 }],
    description: '氷の魔法書'
  },
  {
    id: generateWeaponId('magic', 'rare', 4),
    name: '炎の宝珠',
    type: 'magic',
    rarity: 'rare',
    stats: { attack: 7, magic: 33, speed: 13, critChance: 17, critDamage: 1.8, statusPower: 13 },
    tags: ['elemental'],
    effects: [{ type: 'burn', chance: 35, stacks: 2, duration: 3 }],
    description: '炎を操る球体'
  },
  {
    id: generateWeaponId('magic', 'rare', 5),
    name: '魔道士の書',
    type: 'magic',
    rarity: 'rare',
    stats: { attack: 9, magic: 31, speed: 14, critChance: 16, critDamage: 1.7, statusPower: 11 },
    tags: ['elemental'],
    effects: [],
    description: '魔道書'
  },
  {
    id: generateWeaponId('magic', 'rare', 6),
    name: '月光の杖',
    type: 'magic',
    rarity: 'rare',
    stats: { attack: 5, magic: 35, speed: 11, critChance: 14, critDamage: 1.9, statusPower: 15 },
    tags: ['elemental'],
    effects: [],
    description: '月の力を借りる'
  },
  {
    id: generateWeaponId('magic', 'rare', 7),
    name: 'クリスタルロッド',
    type: 'magic',
    rarity: 'rare',
    stats: { attack: 10, magic: 29, speed: 15, critChance: 18, critDamage: 1.8, statusPower: 10 },
    tags: ['elemental'],
    effects: [],
    description: '水晶の杖'
  },
  {
    id: generateWeaponId('magic', 'rare', 8),
    name: '毒の書',
    type: 'magic',
    rarity: 'rare',
    stats: { attack: 7, magic: 28, speed: 13, critChance: 15, critDamage: 1.7, statusPower: 20 },
    tags: ['elemental'],
    effects: [{ type: 'poison', chance: 40, stacks: 3, duration: 4 }],
    description: '毒魔法の書'
  },
  {
    id: generateWeaponId('magic', 'rare', 9),
    name: 'ルビーワンド',
    type: 'magic',
    rarity: 'rare',
    stats: { attack: 8, magic: 32, speed: 14, critChance: 16, critDamage: 1.8, statusPower: 12 },
    tags: ['elemental'],
    effects: [],
    description: 'ルビーが輝く'
  },

  // Hybrid Rare (8個)
  {
    id: generateWeaponId('hybrid', 'rare', 1),
    name: 'スペルブレード',
    type: 'hybrid',
    rarity: 'rare',
    stats: { attack: 24, magic: 22, speed: 15, critChance: 18, critDamage: 1.8, statusPower: 10 },
    tags: ['elemental'],
    effects: [],
    description: '魔法戦士の剣'
  },
  {
    id: generateWeaponId('hybrid', 'rare', 2),
    name: '聖なる杖',
    type: 'hybrid',
    rarity: 'rare',
    stats: { attack: 20, magic: 25, speed: 13, critChance: 16, critDamage: 1.7, statusPower: 12 },
    tags: ['elemental'],
    effects: [],
    description: '治癒の力'
  },
  {
    id: generateWeaponId('hybrid', 'rare', 3),
    name: 'エレメントボウ',
    type: 'hybrid',
    rarity: 'rare',
    stats: { attack: 22, magic: 23, speed: 17, critChance: 19, critDamage: 1.8, statusPower: 11 },
    tags: ['elemental', 'fast'],
    effects: [{ type: 'burn', chance: 25, stacks: 2, duration: 3 }],
    description: '属性矢を放つ'
  },
  {
    id: generateWeaponId('hybrid', 'rare', 4),
    name: 'バトルメイジロッド',
    type: 'hybrid',
    rarity: 'rare',
    stats: { attack: 23, magic: 24, speed: 14, critChance: 17, critDamage: 1.7, statusPower: 13 },
    tags: [],
    effects: [],
    description: '戦闘魔法士用'
  },
  {
    id: generateWeaponId('hybrid', 'rare', 5),
    name: 'アークランス',
    type: 'hybrid',
    rarity: 'rare',
    stats: { attack: 26, magic: 20, speed: 13, critChance: 16, critDamage: 1.9, statusPower: 9 },
    tags: [],
    effects: [],
    description: '魔力を帯びた槍'
  },
  {
    id: generateWeaponId('hybrid', 'rare', 6),
    name: 'ルーンブレード',
    type: 'hybrid',
    rarity: 'rare',
    stats: { attack: 25, magic: 21, speed: 15, critChance: 18, critDamage: 1.8, statusPower: 10 },
    tags: ['elemental'],
    effects: [],
    description: 'ルーンの刻まれた刀'
  },
  {
    id: generateWeaponId('hybrid', 'rare', 7),
    name: 'サンダーブレード',
    type: 'hybrid',
    rarity: 'rare',
    stats: { attack: 24, magic: 22, speed: 16, critChance: 19, critDamage: 1.8, statusPower: 11 },
    tags: ['elemental', 'fast'],
    effects: [{ type: 'stun', chance: 20, stacks: 1, duration: 2 }],
    description: '雷を纏う剣'
  },
  {
    id: generateWeaponId('hybrid', 'rare', 8),
    name: 'フロストアックス',
    type: 'hybrid',
    rarity: 'rare',
    stats: { attack: 27, magic: 19, speed: 12, critChance: 17, critDamage: 1.9, statusPower: 12 },
    tags: ['heavy', 'elemental'],
    effects: [{ type: 'frozen', chance: 28, stacks: 2, duration: 3 }],
    description: '氷の戦斧'
  },

  // ========== EPIC (20個) ==========
  // Melee Epic (5個)
  {
    id: generateWeaponId('melee', 'epic', 1),
    name: 'ドラゴンスレイヤー',
    type: 'melee',
    rarity: 'epic',
    stats: { attack: 48, magic: 15, speed: 22, critChance: 30, critDamage: 2.5, statusPower: 15 },
    tags: ['heavy', 'precise'],
    effects: [{ type: 'burn', chance: 40, stacks: 3, duration: 4 }],
    description: '竜殺しの大剣'
  },
  {
    id: generateWeaponId('melee', 'epic', 2),
    name: '妖刀ムラマサ',
    type: 'melee',
    rarity: 'epic',
    stats: { attack: 42, magic: 20, speed: 28, critChance: 35, critDamage: 2.8, statusPower: 18 },
    tags: ['fast', 'precise', 'cursed'],
    effects: [{ type: 'bleed', chance: 50, stacks: 3, duration: 4 }],
    description: '呪われし名刀'
  },
  {
    id: generateWeaponId('melee', 'epic', 3),
    name: 'エクスカリバー',
    type: 'melee',
    rarity: 'epic',
    stats: { attack: 45, magic: 18, speed: 24, critChance: 28, critDamage: 2.4, statusPower: 12 },
    tags: ['precise'],
    effects: [],
    description: '聖剣'
  },
  {
    id: generateWeaponId('melee', 'epic', 4),
    name: 'デーモンアックス',
    type: 'melee',
    rarity: 'epic',
    stats: { attack: 50, magic: 12, speed: 18, critChance: 26, critDamage: 2.6, statusPower: 20 },
    tags: ['heavy', 'cursed'],
    effects: [{ type: 'burn', chance: 45, stacks: 3, duration: 5 }],
    description: '悪魔の斧'
  },
  {
    id: generateWeaponId('melee', 'epic', 5),
    name: 'ヴァンパイアブレード',
    type: 'melee',
    rarity: 'epic',
    stats: { attack: 40, magic: 22, speed: 26, critChance: 32, critDamage: 2.7, statusPower: 22 },
    tags: ['fast', 'cursed', 'bleeding'],
    effects: [{ type: 'bleed', chance: 55, stacks: 4, duration: 5 }],
    description: '吸血の剣'
  },

  // Ranged Epic (5個)
  {
    id: generateWeaponId('ranged', 'epic', 1),
    name: 'フェニックスボウ',
    type: 'ranged',
    rarity: 'epic',
    stats: { attack: 43, magic: 18, speed: 25, critChance: 33, critDamage: 2.6, statusPower: 18 },
    tags: ['precise', 'elemental'],
    effects: [{ type: 'burn', chance: 50, stacks: 4, duration: 5 }],
    description: '不死鳥の弓'
  },
  {
    id: generateWeaponId('ranged', 'epic', 2),
    name: 'アイスボウ',
    type: 'ranged',
    rarity: 'epic',
    stats: { attack: 40, magic: 20, speed: 23, critChance: 30, critDamage: 2.5, statusPower: 20 },
    tags: ['precise', 'elemental'],
    effects: [{ type: 'frozen', chance: 48, stacks: 3, duration: 5 }],
    description: '氷結の弓'
  },
  {
    id: generateWeaponId('ranged', 'epic', 3),
    name: 'ストームクロスボウ',
    type: 'ranged',
    rarity: 'epic',
    stats: { attack: 46, magic: 16, speed: 21, critChance: 29, critDamage: 2.7, statusPower: 16 },
    tags: ['heavy', 'precise'],
    effects: [{ type: 'stun', chance: 35, stacks: 2, duration: 3 }],
    description: '嵐の弩'
  },
  {
    id: generateWeaponId('ranged', 'epic', 4),
    name: 'シャドウダガー',
    type: 'ranged',
    rarity: 'epic',
    stats: { attack: 35, magic: 25, speed: 30, critChance: 38, critDamage: 2.4, statusPower: 22 },
    tags: ['fast', 'precise', 'cursed'],
    effects: [{ type: 'poison', chance: 52, stacks: 4, duration: 6 }],
    description: '影の短剣'
  },
  {
    id: generateWeaponId('ranged', 'epic', 5),
    name: 'ドラゴンボウ',
    type: 'ranged',
    rarity: 'epic',
    stats: { attack: 44, magic: 19, speed: 24, critChance: 31, critDamage: 2.6, statusPower: 17 },
    tags: ['precise', 'elemental'],
    effects: [{ type: 'burn', chance: 47, stacks: 3, duration: 5 }],
    description: '竜の力を秘めた弓'
  },

  // Magic Epic (5個)
  {
    id: generateWeaponId('magic', 'epic', 1),
    name: '大魔導師の杖',
    type: 'magic',
    rarity: 'epic',
    stats: { attack: 15, magic: 48, speed: 20, critChance: 25, critDamage: 2.3, statusPower: 25 },
    tags: ['elemental'],
    effects: [{ type: 'burn', chance: 45, stacks: 3, duration: 5 }],
    description: '大魔導師の遺産'
  },
  {
    id: generateWeaponId('magic', 'epic', 2),
    name: '星の書',
    type: 'magic',
    rarity: 'epic',
    stats: { attack: 12, magic: 50, speed: 18, critChance: 23, critDamage: 2.4, statusPower: 28 },
    tags: ['elemental'],
    effects: [{ type: 'frozen', chance: 42, stacks: 3, duration: 5 }],
    description: '星の魔法書'
  },
  {
    id: generateWeaponId('magic', 'epic', 3),
    name: '闇の宝珠',
    type: 'magic',
    rarity: 'epic',
    stats: { attack: 10, magic: 52, speed: 16, critChance: 22, critDamage: 2.5, statusPower: 30 },
    tags: ['elemental', 'cursed'],
    effects: [{ type: 'poison', chance: 50, stacks: 4, duration: 6 }],
    description: '闇の力を秘める'
  },
  {
    id: generateWeaponId('magic', 'epic', 4),
    name: 'タイムロッド',
    type: 'magic',
    rarity: 'epic',
    stats: { attack: 14, magic: 46, speed: 22, critChance: 26, critDamage: 2.2, statusPower: 24 },
    tags: ['elemental'],
    effects: [{ type: 'stun', chance: 38, stacks: 2, duration: 4 }],
    description: '時を操る杖'
  },
  {
    id: generateWeaponId('magic', 'epic', 5),
    name: 'プラズマオーブ',
    type: 'magic',
    rarity: 'epic',
    stats: { attack: 16, magic: 47, speed: 21, critChance: 24, critDamage: 2.3, statusPower: 26 },
    tags: ['elemental'],
    effects: [{ type: 'burn', chance: 46, stacks: 3, duration: 5 }],
    description: 'プラズマの球体'
  },

  // Hybrid Epic (5個)
  {
    id: generateWeaponId('hybrid', 'epic', 1),
    name: 'ホーリーアベンジャー',
    type: 'hybrid',
    rarity: 'epic',
    stats: { attack: 38, magic: 35, speed: 23, critChance: 28, critDamage: 2.4, statusPower: 20 },
    tags: ['elemental'],
    effects: [{ type: 'burn', chance: 40, stacks: 3, duration: 4 }],
    description: '聖なる復讐者'
  },
  {
    id: generateWeaponId('hybrid', 'epic', 2),
    name: 'カオスブレード',
    type: 'hybrid',
    rarity: 'epic',
    stats: { attack: 40, magic: 33, speed: 25, critChance: 30, critDamage: 2.6, statusPower: 22 },
    tags: ['fast', 'cursed', 'elemental'],
    effects: [
      { type: 'burn', chance: 35, stacks: 2, duration: 4 },
      { type: 'frozen', chance: 35, stacks: 2, duration: 4 }
    ],
    description: '混沌の剣'
  },
  {
    id: generateWeaponId('hybrid', 'epic', 3),
    name: 'セレスティアルスタッフ',
    type: 'hybrid',
    rarity: 'epic',
    stats: { attack: 35, magic: 38, speed: 21, critChance: 27, critDamage: 2.3, statusPower: 24 },
    tags: ['elemental'],
    effects: [{ type: 'stun', chance: 36, stacks: 2, duration: 3 }],
    description: '天界の杖'
  },
  {
    id: generateWeaponId('hybrid', 'epic', 4),
    name: 'エレメントランス',
    type: 'hybrid',
    rarity: 'epic',
    stats: { attack: 42, magic: 31, speed: 22, critChance: 29, critDamage: 2.5, statusPower: 21 },
    tags: ['elemental'],
    effects: [
      { type: 'burn', chance: 30, stacks: 2, duration: 3 },
      { type: 'frozen', chance: 30, stacks: 2, duration: 3 }
    ],
    description: '属性の槍'
  },
  {
    id: generateWeaponId('hybrid', 'epic', 5),
    name: 'アークメイジソード',
    type: 'hybrid',
    rarity: 'epic',
    stats: { attack: 37, magic: 36, speed: 24, critChance: 31, critDamage: 2.4, statusPower: 23 },
    tags: ['fast', 'elemental'],
    effects: [{ type: 'burn', chance: 42, stacks: 3, duration: 4 }],
    description: '大魔術師の剣'
  },

  // ========== LEGENDARY (5個) ==========
  {
    id: generateWeaponId('melee', 'legendary', 1),
    name: '神殺しの剣グラム',
    type: 'melee',
    rarity: 'legendary',
    stats: { attack: 65, magic: 30, speed: 35, critChance: 45, critDamage: 3.5, statusPower: 30 },
    tags: ['fast', 'precise'],
    effects: [
      { type: 'bleed', chance: 60, stacks: 5, duration: 6 },
      { type: 'burn', chance: 50, stacks: 4, duration: 5 }
    ],
    description: '神をも殺す究極の剣'
  },
  {
    id: generateWeaponId('ranged', 'legendary', 1),
    name: '終焉の弓ヨルムンガンド',
    type: 'ranged',
    rarity: 'legendary',
    stats: { attack: 58, magic: 35, speed: 38, critChance: 48, critDamage: 3.8, statusPower: 35 },
    tags: ['precise', 'elemental', 'cursed'],
    effects: [
      { type: 'poison', chance: 70, stacks: 6, duration: 7 },
      { type: 'frozen', chance: 55, stacks: 4, duration: 6 }
    ],
    description: '世界蛇の名を冠する究極の弓'
  },
  {
    id: generateWeaponId('magic', 'legendary', 1),
    name: '創世の魔導書アカシャ',
    type: 'magic',
    rarity: 'legendary',
    stats: { attack: 20, magic: 70, speed: 30, critChance: 40, critDamage: 3.2, statusPower: 40 },
    tags: ['elemental'],
    effects: [
      { type: 'burn', chance: 55, stacks: 5, duration: 6 },
      { type: 'frozen', chance: 55, stacks: 5, duration: 6 },
      { type: 'poison', chance: 50, stacks: 4, duration: 6 }
    ],
    description: '全ての魔法を記録する書'
  },
  {
    id: generateWeaponId('hybrid', 'legendary', 1),
    name: '双剣アルス＆ノヴァ',
    type: 'hybrid',
    rarity: 'legendary',
    stats: { attack: 55, magic: 55, speed: 40, critChance: 50, critDamage: 4.0, statusPower: 38 },
    tags: ['fast', 'precise', 'elemental'],
    effects: [
      { type: 'burn', chance: 60, stacks: 5, duration: 6 },
      { type: 'frozen', chance: 60, stacks: 5, duration: 6 },
      { type: 'stun', chance: 45, stacks: 3, duration: 4 }
    ],
    description: '光と闇の双剣'
  },
  {
    id: generateWeaponId('melee', 'legendary', 2),
    name: '破壊神の戦斧ラグナロク',
    type: 'melee',
    rarity: 'legendary',
    stats: { attack: 70, magic: 25, speed: 28, critChance: 42, critDamage: 3.6, statusPower: 32 },
    tags: ['heavy', 'precise', 'elemental'],
    effects: [
      { type: 'burn', chance: 65, stacks: 6, duration: 7 },
      { type: 'stun', chance: 50, stacks: 3, duration: 5 }
    ],
    description: '世界を終わらせる戦斧'
  }
]

/**
 * IDから武器を取得
 */
export function getWeaponById(id: string): Weapon | undefined {
  return weaponDatabase.find(w => w.id === id)
}

/**
 * ランダムな武器を取得
 */
export function getRandomWeapon(): Weapon {
  return weaponDatabase[Math.floor(Math.random() * weaponDatabase.length)]
}

/**
 * レアリティでフィルタ
 */
export function getWeaponsByRarity(rarity: string): Weapon[] {
  return weaponDatabase.filter(w => w.rarity === rarity)
}

/**
 * タイプでフィルタ
 */
export function getWeaponsByType(type: string): Weapon[] {
  return weaponDatabase.filter(w => w.type === type)
}
