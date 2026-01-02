/**
 * 武器特性と敵特性の定義・説明を一元管理
 */

export interface TraitDefinition {
  id: string
  name: string
  description: string
  icon?: string
}

/**
 * 武器特性定義
 * ※プレイヤーの耐性は最大70%までの上限がある（敵は倒すため、プレイヤーが無敵になるのを防ぐため）
 */
export const WEAPON_TRAITS: Record<string, TraitDefinition> = {
  physicalResistance: {
    id: 'physicalResistance',
    name: '物理耐性',
    description: '敵の物理攻撃を軽減する。複数の武器で累積する（プレイヤーの耐性は最大70%まで）',
    icon: '🛡️'
  },
  magicalResistance: {
    id: 'magicalResistance',
    name: '魔法耐性',
    description: '敵の魔法攻撃を軽減する。複数の武器で累積する（プレイヤーの耐性は最大70%まで）',
    icon: '🔮'
  },
  statusResistance: {
    id: 'statusResistance',
    name: '状態異常耐性',
    description: '敵の状態異常を無効化・軽減する。複数の武器で累積する（プレイヤーの耐性は最大70%まで）',
    icon: '✨'
  },
  damageReduction: {
    id: 'damageReduction',
    name: 'ダメージ軽減',
    description: 'すべてのダメージを軽減する。複数の武器で累積する（プレイヤーの軽減は最大70%まで）',
    icon: '💎'
  }
}

/**
 * 敵特性定義
 */
export const ENEMY_TRAITS: Record<string, TraitDefinition> = {
  physicalResistance: {
    id: 'physicalResistance',
    name: '物理耐性',
    description: 'プレイヤーの物理攻撃を軽減する',
    icon: '🛡️'
  },
  magicalResistance: {
    id: 'magicalResistance',
    name: '魔法耐性',
    description: 'プレイヤーの魔法攻撃を軽減する',
    icon: '🔮'
  },
  statusImmunities: {
    id: 'statusImmunities',
    name: '状態異常無効',
    description: '特定の状態異常を完全に無効化する',
    icon: '🚫'
  },
  statusResistances: {
    id: 'statusResistances',
    name: '状態異常耐性',
    description: '状態異常を軽減する',
    icon: '✨'
  },
  attackImmunities: {
    id: 'attackImmunities',
    name: '攻撃無効',
    description: '特定の武器タイプの攻撃を無効化する',
    icon: '🚫'
  }
}

/**
 * 武器特性の名前を取得
 */
export function getWeaponTraitName(traitKey: string): string {
  return WEAPON_TRAITS[traitKey]?.name ?? traitKey
}

/**
 * 武器特性の説明を取得
 */
export function getWeaponTraitDescription(traitKey: string): string {
  return WEAPON_TRAITS[traitKey]?.description ?? ''
}

/**
 * 敵特性の名前を取得
 */
export function getEnemyTraitName(traitKey: string): string {
  return ENEMY_TRAITS[traitKey]?.name ?? traitKey
}

/**
 * 敵特性の説明を取得
 */
export function getEnemyTraitDescription(traitKey: string): string {
  return ENEMY_TRAITS[traitKey]?.description ?? ''
}

/**
 * 武器特性のアイコンを取得
 */
export function getWeaponTraitIcon(traitKey: string): string {
  return WEAPON_TRAITS[traitKey]?.icon ?? '⚙️'
}

/**
 * 敵特性のアイコンを取得
 */
export function getEnemyTraitIcon(traitKey: string): string {
  return ENEMY_TRAITS[traitKey]?.icon ?? '⚙️'
}
