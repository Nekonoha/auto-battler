import type { Weapon } from '~/types'

/**
 * ベース武器データベース。エンチャント前の素材となる武器。
 * 30種類のベース武器から、エンチャントシステムで多様性を生み出す。
 */

export const BASE_WEAPONS: Weapon[] = [
  // === 近接武器 (Melee) ===
  {
    id: 'rusty_sword',
    name: '錆びた剣',
    type: 'melee',
    rarity: 'common',
    stats: {
      attack: 15,
      magic: 0,
      speed: 20,
      critChance: 5,
      critDamage: 1.5,
      statusPower: 10
    },
    tags: ['fast'],
    effects: [],
    description: '錆びているが切れ味はまだある'
  },
  {
    id: 'iron_sword',
    name: '鉄の剣',
    type: 'melee',
    rarity: 'common',
    stats: {
      attack: 20,
      magic: 0,
      speed: 22,
      critChance: 8,
      critDamage: 1.6,
      statusPower: 12
    },
    tags: ['fast'],
    effects: [],
    description: '標準的な鉄製の剣'
  },
  {
    id: 'battle_axe',
    name: '戦斧',
    type: 'melee',
    rarity: 'common',
    stats: {
      attack: 30,
      magic: 0,
      speed: 15,
      critChance: 10,
      critDamage: 1.8,
      statusPower: 15
    },
    tags: ['heavy'],
    effects: [],
    description: '重く強力な一撃を放つ'
  },
  {
    id: 'dagger',
    name: '短剣',
    type: 'melee',
    rarity: 'common',
    stats: {
      attack: 12,
      magic: 0,
      speed: 35,
      critChance: 15,
      critDamage: 2.0,
      statusPower: 18
    },
    tags: ['fast', 'precise'],
    effects: [{
      type: 'fleet',
      chance: 30,
      stacks: 1,
      duration: 2,
      target: 'self'
    }],
    description: '素早く連続攻撃が可能'
  },
  {
    id: 'war_hammer',
    name: '戦槌',
    type: 'melee',
    rarity: 'rare',
    stats: {
      attack: 40,
      magic: 0,
      speed: 12,
      critChance: 12,
      critDamage: 2.2,
      statusPower: 20
    },
    tags: ['heavy'],
    effects: [{
      type: 'stun',
      chance: 15,
      stacks: 1,
      duration: 1
    }],
    description: '強烈な一撃で敵を気絶させる'
  },
  {
    id: 'rapier',
    name: 'レイピア',
    type: 'melee',
    rarity: 'rare',
    stats: {
      attack: 18,
      magic: 0,
      speed: 30,
      critChance: 25,
      critDamage: 2.5,
      statusPower: 15
    },
    tags: ['fast', 'precise'],
    effects: [],
    description: '高い精度で急所を突く'
  },
  {
    id: 'great_sword',
    name: '大剣',
    type: 'melee',
    rarity: 'epic',
    stats: {
      attack: 55,
      magic: 0,
      speed: 10,
      critChance: 15,
      critDamage: 2.5,
      statusPower: 25
    },
    tags: ['heavy'],
    effects: [{
      type: 'bleed',
      chance: 30,
      stacks: 2,
      duration: 3
    }],
    description: '圧倒的な破壊力を誇る巨大な剣'
  },
  {
    id: 'katana',
    name: '刀',
    type: 'melee',
    rarity: 'epic',
    stats: {
      attack: 35,
      magic: 5,
      speed: 28,
      critChance: 30,
      critDamage: 3.0,
      statusPower: 22
    },
    tags: ['fast', 'precise', 'bloodthirsty'],
    effects: [{
      type: 'bleed',
      chance: 40,
      stacks: 3,
      duration: 4
    }],
    description: '鋭い切れ味で一閃する名刀'
  },

  // === 遠隔武器 (Ranged) ===
  {
    id: 'short_bow',
    name: '短弓',
    type: 'ranged',
    rarity: 'common',
    stats: {
      attack: 14,
      magic: 0,
      speed: 25,
      critChance: 10,
      critDamage: 1.8,
      statusPower: 12
    },
    tags: ['fast'],
    effects: [],
    description: '扱いやすい小型の弓'
  },
  {
    id: 'crossbow',
    name: 'クロスボウ',
    type: 'ranged',
    rarity: 'common',
    stats: {
      attack: 25,
      magic: 0,
      speed: 18,
      critChance: 15,
      critDamage: 2.0,
      statusPower: 15
    },
    tags: ['heavy', 'precise'],
    effects: [],
    description: '強力だが装填に時間がかかる'
  },
  {
    id: 'long_bow',
    name: '長弓',
    type: 'ranged',
    rarity: 'rare',
    stats: {
      attack: 28,
      magic: 0,
      speed: 22,
      critChance: 18,
      critDamage: 2.2,
      statusPower: 18
    },
    tags: ['fast', 'precise'],
    effects: [],
    description: '遠距離から正確な射撃が可能'
  },
  {
    id: 'throwing_knife',
    name: '投げナイフ',
    type: 'ranged',
    rarity: 'rare',
    stats: {
      attack: 16,
      magic: 0,
      speed: 40,
      critChance: 20,
      critDamage: 2.0,
      statusPower: 20
    },
    tags: ['fast', 'precise'],
    effects: [{
      type: 'bleed',
      chance: 35,
      stacks: 2,
      duration: 3
    }],
    description: '連続投擲で出血を誘う'
  },
  {
    id: 'sniper_bow',
    name: '狙撃弓',
    type: 'ranged',
    rarity: 'epic',
    stats: {
      attack: 45,
      magic: 0,
      speed: 15,
      critChance: 40,
      critDamage: 3.5,
      statusPower: 25
    },
    tags: ['heavy', 'precise'],
    effects: [{
      type: 'precision',
      chance: 100,
      stacks: 1,
      duration: 2,
      target: 'self'
    }],
    description: '一撃必殺の精密射撃'
  },

  // === 魔法武器 (Magic) ===
  {
    id: 'wooden_staff',
    name: '木の杖',
    type: 'magic',
    rarity: 'common',
    stats: {
      attack: 5,
      magic: 18,
      speed: 20,
      critChance: 8,
      critDamage: 1.5,
      statusPower: 15
    },
    tags: ['elemental'],
    effects: [],
    description: '魔法の基礎を学ぶための杖'
  },
  {
    id: 'fire_wand',
    name: '炎の杖',
    type: 'magic',
    rarity: 'rare',
    stats: {
      attack: 8,
      magic: 25,
      speed: 22,
      critChance: 12,
      critDamage: 1.8,
      statusPower: 22
    },
    tags: ['elemental', 'flame'],
    effects: [{
      type: 'burn',
      chance: 40,
      stacks: 2,
      duration: 3
    }],
    description: '炎の魔法を宿す杖'
  },
  {
    id: 'ice_staff',
    name: '氷の杖',
    type: 'magic',
    rarity: 'rare',
    stats: {
      attack: 8,
      magic: 25,
      speed: 20,
      critChance: 10,
      critDamage: 1.7,
      statusPower: 25
    },
    tags: ['elemental', 'frost'],
    effects: [{
      type: 'frozen',
      chance: 15,
      stacks: 1,
      duration: 2
    }],
    description: '氷結の魔法で敵を遅延させる'
  },
  {
    id: 'poison_orb',
    name: '毒の宝珠',
    type: 'magic',
    rarity: 'rare',
    stats: {
      attack: 6,
      magic: 22,
      speed: 24,
      critChance: 10,
      critDamage: 1.6,
      statusPower: 30
    },
    tags: ['venomous', 'cursed'],
    effects: [{
      type: 'poison',
      chance: 50,
      stacks: 3,
      duration: 4
    }],
    description: '猛毒を放つ不気味な宝珠'
  },
  {
    id: 'arcane_tome',
    name: '秘術書',
    type: 'magic',
    rarity: 'epic',
    stats: {
      attack: 10,
      magic: 40,
      speed: 18,
      critChance: 15,
      critDamage: 2.0,
      statusPower: 28
    },
    tags: ['elemental', 'cursed'],
    effects: [{
      type: 'vulnerable',
      chance: 35,
      stacks: 2,
      duration: 3
    }],
    description: '古代の秘術を記した禁書'
  },
  {
    id: 'crystal_staff',
    name: 'クリスタルの杖',
    type: 'magic',
    rarity: 'epic',
    stats: {
      attack: 12,
      magic: 50,
      speed: 22,
      critChance: 20,
      critDamage: 2.5,
      statusPower: 35
    },
    tags: ['elemental', 'precise'],
    effects: [{
      type: 'intellect',
      chance: 100,
      stacks: 1,
      duration: 3,
      target: 'self'
    }],
    description: '純粋な魔力の結晶を宿す'
  },

  // === DoT特化武器 ===
  {
    id: 'venom_blade',
    name: '毒の短剣',
    type: 'dot',
    rarity: 'rare',
    stats: {
      attack: 18,
      magic: 10,
      speed: 26,
      critChance: 12,
      critDamage: 1.7,
      statusPower: 35
    },
    tags: ['venomous', 'fast'],
    effects: [{
      type: 'poison',
      chance: 60,
      stacks: 4,
      duration: 5
    }],
    description: '強力な毒を塗られた刃'
  },
  {
    id: 'blood_scythe',
    name: '血の鎌',
    type: 'dot',
    rarity: 'epic',
    stats: {
      attack: 30,
      magic: 15,
      speed: 20,
      critChance: 18,
      critDamage: 2.0,
      statusPower: 40
    },
    tags: ['bloodthirsty', 'cursed', 'heavy'],
    effects: [{
      type: 'bleed',
      chance: 70,
      stacks: 5,
      duration: 5
    }],
    description: '敵の生命を吸い取る呪われた鎌'
  },
  {
    id: 'inferno_chain',
    name: '業火の鎖',
    type: 'dot',
    rarity: 'epic',
    stats: {
      attack: 25,
      magic: 30,
      speed: 24,
      critChance: 15,
      critDamage: 1.9,
      statusPower: 45
    },
    tags: ['flame', 'elemental', 'cursed'],
    effects: [{
      type: 'burn',
      chance: 80,
      stacks: 5,
      duration: 4
    }],
    description: '消えない炎で敵を焼き尽くす'
  },

  // === 特殊武器 ===
  {
    id: 'cursed_blade',
    name: '呪われた剣',
    type: 'melee',
    rarity: 'epic',
    stats: {
      attack: 45,
      magic: 20,
      speed: 20,
      critChance: 25,
      critDamage: 2.8,
      statusPower: 30
    },
    tags: ['cursed', 'heavy'],
    effects: [{
      type: 'fear',
      chance: 25,
      stacks: 1,
      duration: 2
    }],
    description: '持つ者に力を与えるが代償を要求する'
  },
  {
    id: 'healing_mace',
    name: '癒しの鈍器',
    type: 'melee',
    rarity: 'rare',
    stats: {
      attack: 22,
      magic: 15,
      speed: 18,
      critChance: 8,
      critDamage: 1.5,
      statusPower: 20
    },
    tags: ['healing', 'defensive', 'heavy'],
    effects: [{
      type: 'armor',
      chance: 100,
      stacks: 1,
      duration: 3,
      target: 'self'
    }],
    description: '攻撃しつつ自身を回復する不思議な武器'
  },
  {
    id: 'balanced_sword',
    name: 'バランスソード',
    type: 'melee',
    rarity: 'rare',
    stats: {
      attack: 24,
      magic: 12,
      speed: 24,
      critChance: 12,
      critDamage: 1.8,
      statusPower: 18
    },
    tags: ['versatile', 'fast'],
    effects: [{
      type: 'power',
      chance: 100,
      stacks: 1,
      duration: 3,
      target: 'self'
    }],
    description: '攻防のバランスに優れた万能剣'
  },
  {
    id: 'chaos_orb',
    name: '混沌の宝珠',
    type: 'magic',
    rarity: 'legendary',
    stats: {
      attack: 20,
      magic: 60,
      speed: 25,
      critChance: 20,
      critDamage: 2.5,
      statusPower: 50
    },
    tags: ['cursed', 'elemental', 'versatile'],
    effects: [
      {
        type: 'poison',
        chance: 30,
        stacks: 3,
        duration: 4
      },
      {
        type: 'burn',
        chance: 30,
        stacks: 3,
        duration: 3
      },
      {
        type: 'weak',
        chance: 25,
        stacks: 2,
        duration: 3
      }
    ],
    description: '予測不能な効果を生み出す混沌の力'
  },
  {
    id: 'dragon_fang',
    name: '竜牙',
    type: 'melee',
    rarity: 'legendary',
    stats: {
      attack: 65,
      magic: 25,
      speed: 22,
      critChance: 30,
      critDamage: 3.5,
      statusPower: 40
    },
    tags: ['heavy', 'elemental', 'bloodthirsty'],
    effects: [
      {
        type: 'bleed',
        chance: 50,
        stacks: 4,
        duration: 4
      },
      {
        type: 'burn',
        chance: 40,
        stacks: 3,
        duration: 3
      }
    ],
    description: '古龍の牙から作られた最強の武器'
  },
  {
    id: 'vampire_dagger',
    name: '吸血の短剣',
    type: 'melee',
    rarity: 'epic',
    stats: {
      attack: 28,
      magic: 10,
      speed: 32,
      critChance: 20,
      critDamage: 2.2,
      statusPower: 35
    },
    tags: ['fast', 'cursed', 'healing'],
    effects: [{
      type: 'kissed',
      chance: 45,
      stacks: 3,
      duration: 4
    }],
    description: '敵の生命力を奪う呪われた短剣'
  },
  {
    id: 'plague_staff',
    name: '疫病の杖',
    type: 'magic',
    rarity: 'legendary',
    stats: {
      attack: 15,
      magic: 55,
      speed: 20,
      critChance: 15,
      critDamage: 2.0,
      statusPower: 60
    },
    tags: ['cursed', 'elemental', 'venomous'],
    effects: [{
      type: 'epidemic',
      chance: 40,
      stacks: 4,
      duration: 5
    }],
    description: '伝染する疫病を操る禁断の杖'
  },
  {
    id: 'sleep_flute',
    name: '眠りの笛',
    type: 'magic',
    rarity: 'rare',
    stats: {
      attack: 10,
      magic: 30,
      speed: 25,
      critChance: 10,
      critDamage: 1.5,
      statusPower: 40
    },
    tags: ['elemental', 'cursed'],
    effects: [{
      type: 'sleep',
      chance: 25,
      stacks: 1,
      duration: 2
    }],
    description: '眠りを誘う魔法の笛'
  },
  {
    id: 'void_blade',
    name: '虚無の刃',
    type: 'melee',
    rarity: 'legendary',
    stats: {
      attack: 55,
      magic: 35,
      speed: 28,
      critChance: 35,
      critDamage: 4.0,
      statusPower: 45
    },
    tags: ['cursed', 'fast', 'precise'],
    effects: [{
      type: 'fear',
      chance: 40,
      stacks: 2,
      duration: 3
    }],
    description: '虚無から生まれた存在を消し去る刃'
  }
]

/**
 * IDで武器を取得
 */
export function getBaseWeaponById(id: string): Weapon | undefined {
  return BASE_WEAPONS.find(w => w.id === id)
}

/**
 * レアリティで武器を絞り込み
 */
export function getBaseWeaponsByRarity(rarity: string): Weapon[] {
  return BASE_WEAPONS.filter(w => w.rarity === rarity)
}

/**
 * タイプで武器を絞り込み
 */
export function getBaseWeaponsByType(type: string): Weapon[] {
  return BASE_WEAPONS.filter(w => w.type === type)
}

/**
 * ランダムな武器を取得
 */
export function getRandomBaseWeapon(): Weapon {
  return BASE_WEAPONS[Math.floor(Math.random() * BASE_WEAPONS.length)]
}
