import type { StatusEffectType } from '~/types'

/**
 * 状態異常の詳細定義
 * 
 * プレイヤーに存在するステータス（attack, magic, defense, magicDefense, speed）に
 * のみ影響を与える効果を定義する
 */
export type StatusEffectEffectKey =
  | 'damageOverTime'
  | 'attackModifier'
  | 'magicModifier'
  | 'defenseModifier'
  | 'magicDefenseModifier'
  | 'speedModifier'
  | 'damageTakenModifier'
  | 'reflectPercent'
  | 'critChanceModifier'
  | 'lifeStealModifier'

interface StatusSpecialEffects {
  lifeStealPercent?: number
  /** 受けたダメージを割合で反射（thorn 用） */
  reflectPercent?: number
  /** バリア吸収量（1スタックあたり） */
  barrierPerStack?: number
}

export interface StatusEffectDefinition {
  id: StatusEffectType
  type: 'Buff' | 'Debuff'
  category: 'Control' | 'Damage' | 'Modifier' | 'Enhancement'
  name: string
  tag: string
  icon: string
  color: string
  /** フレーバーや説明用テキスト */
  description: string
  /** 演出寄りの一言。無ければ description を使用 */
  flavor?: string
  /** 効果のゲーム的説明。無ければ description を使用 */
  mechanics?: string
  /** 数値の具体説明。未設定なら自動生成を試みる */
  numbers?: string
  effects: {
    // ダメージオーバータイム（毎ターン固定ダメージ）
    damageOverTime?: {
      enabled: boolean
      damagePerStack?: number
    }
    // ステータス修正（パーセンテージ）
    attackModifier?: number      // 攻撃力に対する修正（-30 = -30%）
    magicModifier?: number       // 魔法力に対する修正
    defenseModifier?: number     // 物理防御に対する修正
    magicDefenseModifier?: number // 魔法防御に対する修正
    speedModifier?: number        // 速度に対する修正
    damageTakenModifier?: number  // 被ダメージ修正（+25 = +25%）
    critChanceModifier?: number   // クリティカル率に対する修正（15 = +15%）
    lifeStealModifier?: number    // ライフスティール修正（%）
    // 特殊効果
    breakOnDamage?: boolean       // ダメージで解除（sleep用）
    cannotAct?: boolean           // 行動不能（stun, sleep, frozen, petrification用）
  } & StatusSpecialEffects
  stackable: boolean
  maxStack?: number
  /** 効果の持続ターン上限（付与時のdurationをこの値でクランプ） */
  maxDuration?: number
  refreshRule: 'refresh' | 'add' | 'ignore'
  /** 子エフェクトなど、親経由でのみ付与させたい場合は false にする（デバッグ武器などからの直接付与を禁止） */
  allowDirectApply?: boolean
  /**
   * 効果ごとのスタック上限（指定がなければ maxStack を使用）
   * DoT とステータス低下を別々に制限したい場合に利用
   */
  effectStackCaps?: Partial<Record<StatusEffectEffectKey, number>>
  /**
   * cannotAct（行動不能）の発動確率（%/スタック）
   * 例：20 の場合、1スタックで20%、2スタックで40%の確率で行動不能
   * 未指定または undefined の場合は cannotAct: true なら確定スタン
   */
  cannotActProbability?: number
  /**
   * 複合効果として別の状態異常を同時付与する場合の子エフェクト
   */
  compositeEffects?: { type: StatusEffectType }[]
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
    description: '脚が軽くなり、風のように駆け抜ける',
    flavor: '風切り音が足元から響く',
    numbers: '速度 +15%/スタック (最大5スタック)',
    effects: {
      speedModifier: 15
    },
    stackable: true,
    maxStack: 5,
    refreshRule: 'add'
  },

  armor: {
    id: 'armor',
    type: 'Buff',
    category: 'Enhancement',
    name: 'アーマー',
    tag: 'Armor',
    icon: '🛡️',
    color: '#2980b9',
    description: '鋼の甲殻が身体を覆い、打たれ強くなる',
    flavor: '鋼の甲殻が身体を覆う',
    numbers: '物理防御 +5%/スタック (最大8スタック)',
    effects: {
      defenseModifier: 5
    },
    stackable: true,
    maxStack: 8,
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
    description: '棘が身を覆い、受けた痛みを跳ね返す',
    flavor: '触れた者に棘が返礼する',
    numbers: '被ダメージの10%反射/スタック (最大3スタック)',
    effects: {
      reflectPercent: 10
    },
    stackable: true,
    maxStack: 3,
    refreshRule: 'add'
  },

  power: {
    id: 'power',
    type: 'Buff',
    category: 'Enhancement',
    name: '力強さ',
    tag: 'Power',
    icon: '💪',
    color: '#e74c3c',
    description: '力が漲り、一撃が鋭くなる',
    flavor: '筋肉が熱く脈動する',
    numbers: '攻撃力 +10%/スタック (最大5スタック)',
    effects: {
      attackModifier: 10
    },
    stackable: true,
    maxStack: 5,
    refreshRule: 'add'
  },

  intellect: {
    id: 'intellect',
    type: 'Buff',
    category: 'Enhancement',
    name: '魔力高揚',
    tag: 'Intellect',
    icon: '🔮',
    color: '#9b59b6',
    description: '魔力が高ぶり、魔法が冴え渡る',
    flavor: '脳が輝くような感覚',
    numbers: '魔法力 +10%/スタック (最大5スタック)',
    effects: {
      magicModifier: 10
    },
    stackable: true,
    maxStack: 5,
    refreshRule: 'add'
  },

  precision: {
    id: 'precision',
    type: 'Buff',
    category: 'Enhancement',
    name: '狙撃精度',
    tag: 'Precision',
    icon: '🎯',
    color: '#f39c12',
    description: '目が冴えわたり、狙いが定まる',
    flavor: '視界が研ぎ澄まされる',
    numbers: 'クリティカル率 +15%/スタック (最大4スタック)',
    effects: {
      // 注: critChanceはattackModifierではなく、別途処理が必要
      critChanceModifier: 15
    },
    stackable: true,
    maxStack: 4,
    refreshRule: 'add'
  },

  debuffImmunity: {
    id: 'debuffImmunity',
    type: 'Buff',
    category: 'Enhancement',
    name: '弱体無効',
    tag: 'Debuff Guard',
    icon: '🛡️',
    color: '#1abc9c',
    description: '次に受けるデバフを無効化し、効果が消える',
    flavor: '守護の加護が弱体を弾く',
    numbers: 'デバフを1回無効化/スタック (消費型)',
    effects: {},
    stackable: true,
    maxStack: 5,
    refreshRule: 'add'
  },

  barrier: {
    id: 'barrier',
    type: 'Buff',
    category: 'Enhancement',
    name: 'バリア',
    tag: 'Barrier',
    icon: '🛡️',
    color: '#6dd5ed',
    description: '一定量のダメージを肩代わりするシールド',
    flavor: '光の膜が衝撃を吸収する',
    numbers: '1スタックあたり15ダメージを吸収 (最大999スタック)',
    effects: {
      barrierPerStack: 15
    },
    stackable: true,
    maxStack: 999,
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
    description: '足取りが重くなり、動きが鈍る',
    flavor: '粘つく何かがまとわりつく',
    numbers: '速度 -15%/スタック (最大5スタック)',
    effects: {
      speedModifier: -15
    },
    stackable: true,
    maxStack: 5,
    refreshRule: 'add'
  },

  stun: {
    id: 'stun',
    type: 'Debuff',
    category: 'Control',
    name: '気絶',
    tag: 'Stun',
    icon: '💫',
    color: '#f39c12',
    description: '衝撃で意識が飛び、動けなくなる',
    flavor: '星が頭上を回る',
    effects: {
      cannotAct: true
    },
    stackable: false,
    maxStack: 1,
    maxDuration: 1,
    refreshRule: 'refresh'
  },

  sleep: {
    id: 'sleep',
    type: 'Debuff',
    category: 'Control',
    name: '睡眠（複合）',
    tag: 'Sleep',
    icon: '😴',
    color: '#3498db',
    description: '深い眠りに落ち、無防備になる。付与時に「睡眠（行動不能）」と「睡眠（被ダメージ増加）」を同時に与える。',
    effects: {},
    stackable: false,
    maxStack: 1,
    maxDuration: 1,
    refreshRule: 'refresh',
    compositeEffects: [
      { type: 'sleepLock' },
      { type: 'sleepVulnerable' }
    ]
  },

  sleepLock: {
    id: 'sleepLock',
    type: 'Debuff',
    category: 'Control',
    name: '睡眠（行動不能）',
    tag: 'Sleep (Lock)',
    icon: '😴',
    color: '#3498db',
    description: '眠りに落ちて動けない（ダメージで目覚める）',
    effects: {
      cannotAct: true,
      breakOnDamage: true
    },
    stackable: false,
    maxStack: 1,
    maxDuration: 1,
    refreshRule: 'refresh',
    allowDirectApply: false
  },

  sleepVulnerable: {
    id: 'sleepVulnerable',
    type: 'Debuff',
    category: 'Modifier',
    name: '睡眠（被ダメージ増加）',
    tag: 'Sleep (Vulnerable)',
    icon: '😴',
    color: '#3498db',
    description: '眠りが浅く、攻撃に脆くなる（ダメージで目覚める）',
    numbers: '被ダメージ +25% (最大1スタック)',
    effects: {
      damageTakenModifier: 25,
      breakOnDamage: true
    },
    stackable: true,
    maxStack: 1,
    maxDuration: 1,
    refreshRule: 'refresh',
    allowDirectApply: false
  },

  frozen: {
    id: 'frozen',
    type: 'Debuff',
    category: 'Control',
    name: '凍結（複合）',
    tag: 'Frozen',
    icon: '❄️',
    color: '#5dade2',
    description: '身体が凍りつき、動きも感覚も鈍る。付与時に「凍結（行動不能）」と「凍結（被ダメージ軽減）」を同時に与える。',
    effects: {},
    stackable: false,
    maxStack: 1,
    maxDuration: 1,
    refreshRule: 'refresh',
    compositeEffects: [
      { type: 'frozenLock' },
      { type: 'frozenGuard' }
    ]
  },

  frozenLock: {
    id: 'frozenLock',
    type: 'Debuff',
    category: 'Control',
    name: '凍結（行動不能）',
    tag: 'Frozen (Lock)',
    icon: '❄️',
    color: '#5dade2',
    description: '凍りついて身動きが取れない',
    effects: {
      cannotAct: true
    },
    stackable: false,
    maxStack: 1,
    maxDuration: 1,
    refreshRule: 'refresh',
    allowDirectApply: false
  },

  frozenGuard: {
    id: 'frozenGuard',
    type: 'Debuff',
    category: 'Modifier',
    name: '凍結（被ダメージ軽減）',
    tag: 'Frozen (Guard)',
    icon: '❄️',
    color: '#5dade2',
    description: '冷気が鎧となり、痛みを鈍らせる',
    numbers: '被ダメージ -30% (最大1スタック)',
    effects: {
      damageTakenModifier: -30
    },
    stackable: true,
    maxStack: 1,
    maxDuration: 1,
    refreshRule: 'refresh',
    allowDirectApply: false
  },

  petrification: {
    id: 'petrification',
    type: 'Debuff',
    category: 'Control',
    name: '石化（複合）',
    tag: 'Petrification',
    icon: '🗿',
    color: '#7f8c8d',
    description: '石へと変じ、硬化する。付与時に「石化（行動不能）」と「石化（被ダメージ軽減）」を同時に与える。',
    effects: {},
    stackable: false,
    maxStack: 1,
    maxDuration: 1,
    refreshRule: 'refresh',
    compositeEffects: [
      { type: 'petrificationLock' },
      { type: 'petrificationGuard' }
    ]
  },

  petrificationLock: {
    id: 'petrificationLock',
    type: 'Debuff',
    category: 'Control',
    name: '石化（行動不能）',
    tag: 'Petrification (Lock)',
    icon: '🗿',
    color: '#7f8c8d',
    description: '石と化し、動けない',
    effects: {
      cannotAct: true
    },
    stackable: false,
    maxStack: 1,
    maxDuration: 1,
    refreshRule: 'refresh',
    allowDirectApply: false
  },

  petrificationGuard: {
    id: 'petrificationGuard',
    type: 'Debuff',
    category: 'Modifier',
    name: '石化（被ダメージ軽減）',
    tag: 'Petrification (Guard)',
    icon: '🗿',
    color: '#7f8c8d',
    description: '石の硬さで攻撃を弾く',
    numbers: '被ダメージ -50% (最大1スタック)',
    effects: {
      damageTakenModifier: -50
    },
    stackable: true,
    maxStack: 1,
    maxDuration: 1,
    refreshRule: 'refresh',
    allowDirectApply: false
  },

  fear: {
    id: 'fear',
    type: 'Debuff',
    category: 'Control',
    name: '恐怖',
    tag: 'Fear',
    icon: '😱',
    color: '#8e44ad',
    description: '恐怖に震え、力が抜ける',
    numbers: '攻撃力 -10%/スタック\n物理防御 -8%/スタック\n(最大5スタック)',
    effects: {
      attackModifier: -10,
      defenseModifier: -8
    },
    stackable: true,
    maxStack: 5,
    maxDuration: 3,
    refreshRule: 'add'
  },

  drunk: {
    id: 'drunk',
    type: 'Debuff',
    category: 'Control',
    name: '酩酊',
    tag: 'Drunk',
    icon: '🍺',
    color: '#d35400',
    description: '酒に酔い、視界も足元もおぼつかなくなる',
    numbers: '攻撃力 -15%/スタック\n魔法力 -15%/スタック\n(最大4スタック)',
    effects: {
      attackModifier: -15,
      magicModifier: -15
    },
    stackable: true,
    maxStack: 4,
    maxDuration: 3,
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
    description: '毒が身体を巡り、じわじわと蝕む',
    numbers: '毎ターン 2ダメージ/スタック',
    effects: {
      damageOverTime: {
        enabled: true,
        damagePerStack: 2
      }
    },
    stackable: true,
    maxStack: 999,
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
    description: '血が止まらず、力が漏れ落ちる',
    numbers: '毎ターン 2ダメージ/スタック',
    effects: {
      damageOverTime: {
        enabled: true,
        damagePerStack: 2
      }
    },
    stackable: true,
    maxStack: 999,
    refreshRule: 'add'
  },

  burn: {
    id: 'burn',
    type: 'Debuff',
    category: 'Damage',
    name: '火傷（複合）',
    tag: 'Burn',
    icon: '🔥',
    color: '#e74c3c',
    description: '炎がまとわりつき、肌と気力を焼く。付与時に「火傷（ダメージ）」と「火傷（ステータス低下）」を同時に与える。',
    effects: {},
    stackable: true,
    maxStack: 999,
    refreshRule: 'add',
    compositeEffects: [
      { type: 'burnDot' },
      { type: 'burnWeaken' }
    ]
  },

  burnDot: {
    id: 'burnDot',
    type: 'Debuff',
    category: 'Damage',
    name: '火傷（ダメージ）',
    tag: 'Burn (DoT)',
    icon: '🔥',
    color: '#e74c3c',
    description: '焼ける痛みが続き、体力を奪う',
    numbers: '毎ターン 2ダメージ/スタック',
    effects: {
      damageOverTime: {
        enabled: true,
        damagePerStack: 2
      }
    },
    stackable: true,
    maxStack: 999,
    refreshRule: 'add',
    allowDirectApply: false
  },

  burnWeaken: {
    id: 'burnWeaken',
    type: 'Debuff',
    category: 'Modifier',
    name: '火傷（ステータス低下）',
    tag: 'Burn (Weaken)',
    icon: '🔥',
    color: '#c0392b',
    description: '火傷の痛みで力が入らない',
    numbers: '攻撃力 -3%/スタック (最大5スタック)',
    effects: {
      attackModifier: -3
    },
    stackable: true,
    maxStack: 5,
    refreshRule: 'add',
    allowDirectApply: false
  },

  kissed: {
    id: 'kissed',
    type: 'Debuff',
    category: 'Damage',
    name: '血の口づけ',
    tag: 'Kissed',
    icon: '💋',
    color: '#e91e63',
    description: '呪いの口付けが生命力を吸い上げる',
    numbers: '毎ターン 2ダメージ/スタック\n与ダメージの100%を吸収',
    effects: {
      damageOverTime: {
        enabled: true,
        damagePerStack: 2
      },
      lifeStealPercent: 100
    },
    stackable: true,
    maxStack: 999,
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
    description: '病が広がり、体力をむしばむ',
    numbers: '毎ターン 3ダメージ/スタック',
    effects: {
      damageOverTime: {
        enabled: true,
        damagePerStack: 3
      }
    },
    stackable: true,
    maxStack: 999,
    refreshRule: 'add'
  },

  // ===== Debuffs: Modifier =====
  vulnerable: {
    id: 'vulnerable',
    type: 'Debuff',
    category: 'Modifier',
    name: '虚弱',
    tag: 'Vulnerable',
    icon: '🥀',
    color: '#e67e22',
    description: '身が震え、攻撃に弱くなる',
    numbers: '被ダメージ +15%/スタック (最大5スタック)',
    effects: {
      damageTakenModifier: 15
    },
    stackable: true,
    maxStack: 5,
    maxDuration: 3,
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
    description: '力が抜け、攻撃が鈍る',
    numbers: '攻撃力 -7%/スタック (最大6スタック)',
    effects: {
      attackModifier: -7
    },
    stackable: true,
    maxStack: 6,
    maxDuration: 4,
    refreshRule: 'add'
  },

  curse: {
    id: 'curse',
    type: 'Debuff',
    category: 'Modifier',
    name: '呪い',
    tag: 'Curse',
    icon: '☠️',
    color: '#6c5ce7',
    description: '呪いに蝕まれ、力と防御が削がれる',
    numbers: '被ダメージ +12%/スタック\n攻撃力 -6%/スタック\n魔法力 -6%/スタック\n(最大4スタック)',
    effects: {
      damageTakenModifier: 12,
      attackModifier: -6,
      magicModifier: -6
    },
    stackable: true,
    maxStack: 4,
    maxDuration: 4,
    refreshRule: 'add'
  },

  grievousWound: {
    id: 'grievousWound',
    type: 'Debuff',
    category: 'Modifier',
    name: '重症',
    tag: 'Grievous Wound',
    icon: '🩹',
    color: '#c0392b',
    description: '傷口が開き、吸収がほとんど効かなくなる',
    numbers: 'ライフスティール -25%/スタック (最大4スタック)',
    effects: {
      lifeStealModifier: -25
    },
    stackable: true,
    maxStack: 4,
    maxDuration: 4,
    refreshRule: 'add'
  },

  dispel: {
    id: 'dispel',
    type: 'Debuff',
    category: 'Modifier',
    name: 'ディスペル',
    tag: 'Dispel',
    icon: '✨',
    color: '#95a5a6',
    description: '対象のバフを1つ打ち消す（バフが無ければ無効）',
    numbers: 'バフを1つ除去し、即座に消滅',
    effects: {},
    stackable: false,
    maxStack: 1,
    maxDuration: 1,
    refreshRule: 'refresh'
  },

  // ===== Debuffs: Composite & Additional Modifiers =====
  electrification: {
    id: 'electrification',
    type: 'Debuff',
    category: 'Control',
    name: '感電（複合）',
    tag: 'Electrification',
    icon: '⚡',
    color: '#f1c40f',
    description: '電撃が走り、体が痺れ身動きが鈍る。5スタック以上で行動不能になる。付与時に「感電（ダメージ）」「感電（速度低下）」「感電（麻痺）」を同時に与える。',
    effects: {},
    stackable: true,
    maxStack: 6,
    maxDuration: 2,
    refreshRule: 'add',
    compositeEffects: [
      { type: 'electrificationDot' },
      { type: 'electrificationSlow' },
      { type: 'electrificationParalysis' }
    ]
  },

  electrificationDot: {
    id: 'electrificationDot',
    type: 'Debuff',
    category: 'Damage',
    name: '感電（ダメージ）',
    tag: 'Electrification (DoT)',
    icon: '⚡',
    color: '#f1c40f',
    description: '電撃で体を焼かれ続ける',
    numbers: '毎ターン 1ダメージ/スタック',
    effects: {
      damageOverTime: {
        enabled: true,
        damagePerStack: 1
      }
    },
    stackable: true,
    maxStack: 999,
    maxDuration: 2,
    refreshRule: 'add',
    allowDirectApply: false
  },

  electrificationSlow: {
    id: 'electrificationSlow',
    type: 'Debuff',
    category: 'Modifier',
    name: '感電（速度低下）',
    tag: 'Electrification (Slow)',
    icon: '⚡',
    color: '#f1c40f',
    description: '電撃で身体が痺れ、動きが鈍る',
    numbers: '速度 -10%/スタック (最大6スタック)',
    effects: {
      speedModifier: -10
    },
    stackable: true,
    maxStack: 6,
    maxDuration: 2,
    refreshRule: 'add',
    allowDirectApply: false
  },

  electrificationParalysis: {
    id: 'electrificationParalysis',
    type: 'Debuff',
    category: 'Control',
    name: '感電（麻痺）',
    tag: 'Electrification (Paralysis)',
    icon: '⚡',
    color: '#f1c40f',
    description: '電撃による麻痺で身動きが取れない',
    numbers: '行動不能 スタック*20%の確率 (最大6スタック→120%＝確定)',
    effects: {
      cannotAct: true
    },
    stackable: true,
    maxStack: 6,
    maxDuration: 2,
    refreshRule: 'add',
    allowDirectApply: false,
    cannotActProbability: 20
  },

  mist: {
    id: 'mist',
    type: 'Debuff',
    category: 'Modifier',
    name: '霧',
    tag: 'Mist',
    icon: '🌫️',
    color: '#95a5a6',
    description: '視界を奪う霧が立ち込め、魔法防御が低下する',
    numbers: '魔法防御 -8%/スタック (最大5スタック)',
    effects: {
      magicDefenseModifier: -8
    },
    stackable: true,
    maxStack: 5,
    maxDuration: 3,
    refreshRule: 'add'
  },

  corrosion: {
    id: 'corrosion',
    type: 'Debuff',
    category: 'Damage',
    name: '腐食',
    tag: 'Corrosion',
    icon: '⚙️',
    color: '#16a085',
    description: '腐食が進み、防御を蝕む。継続ダメージと防御低下の複合効果。',
    numbers: '毎ターン 1ダメージ/スタック\n物理防御 -4%/スタック\n(最大5スタック)',
    effects: {
      damageOverTime: {
        enabled: true,
        damagePerStack: 1
      },
      defenseModifier: -4
    },
    stackable: true,
    maxStack: 5,
    maxDuration: 4,
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
