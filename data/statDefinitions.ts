/**
 * ステータスの定義（名前、説明、アイコン）
 */

export interface StatDefinition {
  name: string
  icon: string
  description: string
  substatsDescription?: string  // サブステータス向け説明（武器別など）
}

export const STAT_DEFINITIONS: Record<string, StatDefinition> = {
  attack: {
    name: '攻撃力',
    icon: '⚔️',
    description: '物理ダメージに影響'
  },
  magic: {
    name: '魔法',
    icon: '✨',
    description: '魔法ダメージに影響'
  },
  defense: {
    name: '物理防御',
    icon: '🛡️',
    description: '物理ダメージ軽減に影響'
  },
  magicDefense: {
    name: '魔法防御',
    icon: '🔮',
    description: '魔法ダメージ軽減に影響'
  },
  speed: {
    name: '速度',
    icon: '⚡',
    description: '行動順序と回避率に影響'
  },
  statusPower: {
    name: '状態異常威力',
    icon: '🧿',
    description: '状態異常の効果を増幅'
  },
  lifeSteal: {
    name: 'ライフスティール',
    icon: '🩸',
    description: '与えたダメージの一部をHPとして吸収',
    substatsDescription: '武器ごとに適用。ここは基礎＋シナジー＋特性のみを表示'
  },
  critChance: {
    name: 'クリティカル率',
    icon: '🎯',
    description: '攻撃がクリティカルになる確率。100%を超えるとオーバークリティカルが発動する可能性がある',
    substatsDescription: '武器別に判定。表示は基礎＋シナジー＋特性のみ'
  },
  critDamage: {
    name: 'クリティカル倍率',
    icon: '💥',
    description: 'クリティカル時のダメージ倍率',
    substatsDescription: '武器別に判定。表示は基礎＋シナジー＋特性のみ'
  }
}

/**
 * ステータス定義を取得
 */
export function getStatDefinition(stat: string): StatDefinition {
  return STAT_DEFINITIONS[stat] || { name: stat, icon: '?', description: '' }
}

/**
 * ステータスの名前を取得
 */
export function getStatName(stat: string): string {
  return getStatDefinition(stat).name
}

/**
 * ステータスのアイコンを取得
 */
export function getStatIcon(stat: string): string {
  return getStatDefinition(stat).icon
}

/**
 * ステータスの説明を取得
 */
export function getStatDescription(stat: string): string {
  return getStatDefinition(stat).description
}

/**
 * ステータスのサブステータス向け説明を取得
 */
export function getStatSubstatsDescription(stat: string): string {
  const def = getStatDefinition(stat)
  return def.substatsDescription || def.description
}

/**
 * Tooltip用にタイトルをフォーマット（アイコン + 名前）
 */
export function formatStatTitle(stat: string): string {
  const def = getStatDefinition(stat)
  return `${def.icon} ${def.name}`
}
