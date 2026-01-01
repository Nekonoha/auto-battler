import type { StatusEffectType } from '~/types'

/**
 * 状態異常の詳細定義
 */
export interface StatusEffectDefinition {
  id: StatusEffectType
  type: 'Buff' | 'Debuff'
  category: 'Control' | 'Damage' | 'Modifier' | 'Enhancement'
  name: string
  tag: string
  icon: string
  color: string
  description: string
  effects: {
    damageOverTime?: {
      enabled: boolean
      damagePerStack?: number
      interval?: number
    }
    moveSpeedModifier?: number // percentage
    attackSpeedModifier?: number // percentage
    damageTakenModifier?: number // percentage
    armorModifier?: number // fixed value or percentage
    reflectDamage?: number // fixed value
    cannotMove?: boolean
    cannotAttack?: boolean
    breakOnDamage?: boolean
    lifeSteal?: boolean
    spreadToNearby?: boolean
    instantDeathChance?: number // percentage
  }
  stackable: boolean
  maxStack?: number
  refreshRule: 'refresh' | 'add' | 'ignore'
}

/**
 * 全状態異常の定義データベース
 */
export const STATUS_EFFECTS_DB: Record<StatusEffectType, StatusEffectDefinition> = {
  // ===== Buffs =====
  fleet: {
    id: 'fleet',
    type: 'Buff',
    category: 'Enhancement',
    name: '俊足',
    tag: 'Fleet-foot',
    icon: '⚡',
    color: '#27ae60',
    description: '移動速度・攻撃速度が増加',
    effects: {
      moveSpeedModifier: 30,
      attackSpeedModifier: 15
    },
    stackable: false,
    refreshRule: 'refresh'
  },

  armor: {
    id: 'armor',
    type: 'Buff',
    category: 'Enhancement',
    name: 'アーマー',
    tag: 'Armor',
    icon: '🛡️',
    color: '#2980b9',
    description: '被ダメージを軽減',
    effects: {
      damageTakenModifier: -20
    },
    stackable: true,
    maxStack: 5,
    refreshRule: 'add'
  },

  thorn: {
    id: 'thorn',
    type: 'Buff',
    category: 'Enhancement',
    name: '棘の鎧',
    tag: 'Thorn',
    icon: '🌹',
    color: '#16a085',
    description: '被ダメージを反射',
    effects: {
      reflectDamage: 10
    },
    stackable: true,
    maxStack: 3,
    refreshRule: 'add'
  },

  // ===== Debuffs: Control =====
  slow: {
    id: 'slow',
    type: 'Debuff',
    category: 'Control',
    name: '鈍足',
    tag: 'Slow',
    icon: '🐌',
    color: '#95a5a6',
    description: '移動速度が低下',
    effects: {
      moveSpeedModifier: -50
    },
    stackable: true,
    maxStack: 3,
    refreshRule: 'refresh'
  },

  stun: {
    id: 'stun',
    type: 'Debuff',
    category: 'Control',
    name: '気絶',
    tag: 'Stun',
    icon: '💫',
    color: '#f39c12',
    description: '移動・攻撃不能',
    effects: {
      cannotMove: true,
      cannotAttack: true
    },
    stackable: false,
    refreshRule: 'refresh'
  },

  sleep: {
    id: 'sleep',
    type: 'Debuff',
    category: 'Control',
    name: '睡眠',
    tag: 'Sleep',
    icon: '😴',
    color: '#3498db',
    description: '移動・攻撃不能、被ダメージ増加、攻撃で解除',
    effects: {
      cannotMove: true,
      cannotAttack: true,
      damageTakenModifier: 50,
      breakOnDamage: true
    },
    stackable: false,
    refreshRule: 'ignore'
  },

  frozen: {
    id: 'frozen',
    type: 'Debuff',
    category: 'Control',
    name: '凍結',
    tag: 'Frozen',
    icon: '❄️',
    color: '#5dade2',
    description: '移動・攻撃不能、被ダメージ軽減',
    effects: {
      cannotMove: true,
      cannotAttack: true,
      armorModifier: 30
    },
    stackable: false,
    refreshRule: 'refresh'
  },

  petrification: {
    id: 'petrification',
    type: 'Debuff',
    category: 'Control',
    name: '石化',
    tag: 'Petrification',
    icon: '🗿',
    color: '#7f8c8d',
    description: '移動・攻撃不能、被ダメージ軽減、確率で即死',
    effects: {
      cannotMove: true,
      cannotAttack: true,
      armorModifier: 50,
      instantDeathChance: 10
    },
    stackable: false,
    refreshRule: 'ignore'
  },

  fear: {
    id: 'fear',
    type: 'Debuff',
    category: 'Control',
    name: '恐怖',
    tag: 'Fear',
    icon: '😱',
    color: '#8e44ad',
    description: 'ランダムに強制移動',
    effects: {
      // 強制移動の実装はゲームロジック側で処理
    },
    stackable: false,
    refreshRule: 'refresh'
  },

  drunk: {
    id: 'drunk',
    type: 'Debuff',
    category: 'Control',
    name: '酩酊',
    tag: 'Drunk',
    icon: '🍺',
    color: '#d35400',
    description: 'ランダムに強制移動、確率で睡眠',
    effects: {
      // ランダム移動 + 睡眠は実装側で処理
    },
    stackable: true,
    maxStack: 3,
    refreshRule: 'add'
  },

  // ===== Debuffs: Damage =====
  poison: {
    id: 'poison',
    type: 'Debuff',
    category: 'Damage',
    name: '毒',
    tag: 'Poison',
    icon: '☠️',
    color: '#9b59b6',
    description: '毎ターン固定ダメージ（スタック×2）',
    effects: {
      damageOverTime: {
        enabled: true,
        damagePerStack: 2
      }
    },
    stackable: true,
    maxStack: 10,
    refreshRule: 'add'
  },

  bleed: {
    id: 'bleed',
    type: 'Debuff',
    category: 'Damage',
    name: '出血',
    tag: 'Bleed',
    icon: '🩸',
    color: '#c0392b',
    description: '毎ターンダメージ（スタック×2）',
    effects: {
      damageOverTime: {
        enabled: true,
        damagePerStack: 2
      }
    },
    stackable: true,
    maxStack: 10,
    refreshRule: 'add'
  },

  burn: {
    id: 'burn',
    type: 'Debuff',
    category: 'Damage',
    name: '火傷',
    tag: 'Burn',
    icon: '🔥',
    color: '#e74c3c',
    description: '毎ターンダメージ（スタック×3）+ 攻撃力-10%',
    effects: {
      damageOverTime: {
        enabled: true,
        damagePerStack: 3
      },
      attackSpeedModifier: -10
    },
    stackable: true,
    maxStack: 10,
    refreshRule: 'add'
  },

  kissed: {
    id: 'kissed',
    type: 'Debuff',
    category: 'Damage',
    name: '口付け',
    tag: 'Kissed',
    icon: '💋',
    color: '#e91e63',
    description: '毎ターンダメージ（スタック×3）+ HP吸収',
    effects: {
      damageOverTime: {
        enabled: true,
        damagePerStack: 3
      },
      lifeSteal: true
    },
    stackable: true,
    maxStack: 5,
    refreshRule: 'add'
  },

  epidemic: {
    id: 'epidemic',
    type: 'Debuff',
    category: 'Damage',
    name: '疫病',
    tag: 'Epidemic',
    icon: '🦠',
    color: '#4a5568',
    description: '毎ターンダメージ（スタック×4）+ 周囲に伝染',
    effects: {
      damageOverTime: {
        enabled: true,
        damagePerStack: 4
      },
      spreadToNearby: true
    },
    stackable: true,
    maxStack: 5,
    refreshRule: 'add'
  },

  // ===== Debuffs: Modifier =====
  vulnerable: {
    id: 'vulnerable',
    type: 'Debuff',
    category: 'Modifier',
    name: '虚弱',
    tag: 'Vulnerable',
    icon: '🛡️',
    color: '#e67e22',
    description: '被ダメージ増加',
    effects: {
      damageTakenModifier: 30
    },
    stackable: true,
    maxStack: 3,
    refreshRule: 'add'
  },

  weak: {
    id: 'weak',
    type: 'Debuff',
    category: 'Modifier',
    name: '弱体',
    tag: 'Weak',
    icon: '💔',
    color: '#c0392b',
    description: '攻撃力低下',
    effects: {
      attackSpeedModifier: -20
    },
    stackable: true,
    maxStack: 3,
    refreshRule: 'add'
  }
}

/**
 * 状態異常IDから定義を取得
 */
export function getStatusEffectDefinition(id: StatusEffectType): StatusEffectDefinition {
  return STATUS_EFFECTS_DB[id]
}

/**
 * 全てのバフを取得
 */
export function getAllBuffs(): StatusEffectDefinition[] {
  return Object.values(STATUS_EFFECTS_DB).filter(def => def.type === 'Buff')
}

/**
 * 全てのデバフを取得
 */
export function getAllDebuffs(): StatusEffectDefinition[] {
  return Object.values(STATUS_EFFECTS_DB).filter(def => def.type === 'Debuff')
}

/**
 * カテゴリ別に状態異常を取得
 */
export function getStatusEffectsByCategory(category: StatusEffectDefinition['category']): StatusEffectDefinition[] {
  return Object.values(STATUS_EFFECTS_DB).filter(def => def.category === category)
}
