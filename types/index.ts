/**
 * 武器のレアリティ
 */
export type WeaponRarity = 'common' | 'rare' | 'epic' | 'legendary'

/**
 * 武器のタイプ（攻撃方法を決定）
 */
export type WeaponType = 'melee' | 'ranged' | 'magic' | 'dot'

/**
 * 武器のステータス
 */
export interface WeaponStats {
  attack: number        // 物理攻撃力
  magic: number         // 魔法攻撃力
  speed: number         // 攻撃速度
  critChance: number    // クリティカル率（0-100）
  critDamage: number    // クリティカルダメージ倍率（1.5 = 150%）
  statusPower: number   // 状態異常の効果量
}

/**
 * 武器の特性タグ
 */
export type WeaponTag = 
  | 'fast'          // 高速攻撃
  | 'heavy'         // 重い一撃
  | 'precise'       // 高精度
  | 'elemental'     // 属性攻撃
  | 'cursed'        // 呪い系
  | 'bleeding'      // 出血系

/**
 * 状態異常の種類
 */
export type StatusEffectType = 
  // DoT系
  | 'poison' | 'burn' | 'bleed' | 'kissed' | 'epidemic'
  // 行動阻害
  | 'slow' | 'stun' | 'sleep' | 'frozen' | 'petrification' | 'fear' | 'drunk'
  // 状態変化
  | 'vulnerable' | 'weak'
  // バフ
  | 'fleet' | 'armor' | 'thorn'

/**
 * 武器が付与する状態異常効果
 */
export interface WeaponEffect {
  type: StatusEffectType
  chance: number        // 付与確率（0-100）
  stacks: number        // 付与するスタック数
  duration: number      // 継続ターン数
}

/**
 * 武器データ構造
 */
export interface Weapon {
  id: string
  name: string
  type: WeaponType
  rarity: WeaponRarity
  limitBreak?: number      // 限界突破回数（0-4）
  limitBreakMax?: number   // 最大限界突破回数
  stats: WeaponStats
  tags: WeaponTag[]
  effects: WeaponEffect[]
  description: string
}

/**
 * 戦闘中の状態異常インスタンス
 */
export interface StatusEffect {
  type: StatusEffectType
  stacks: number
  duration: number
}

/**
 * 戦闘ユニット（プレイヤー / 敵）の基本構造
 */
export interface CombatUnit {
  name: string
  maxHp: number
  currentHp: number
  statusEffects: StatusEffect[]
}

/**
 * ステータスタイプ（プレイヤーが成長時に選べる項目）
 */
export type StatBoostType = 'maxHp' | 'attack' | 'magic' | 'defense' | 'magicDefense' | 'speed'

/**
 * ステータス成長オプション（宝箱から選ぶやつ）
 */
export interface StatBoost {
  type: StatBoostType
  value: number
  label: string
}

/**
 * ダメージタイプ
 */
export type DamageType = 'physical' | 'magical' | 'pure'

/**
 * プレイヤーステータス
 */
export interface PlayerStats {
  attack: number          // 物理攻撃力
  magic: number           // 魔法攻撃力
  defense: number         // 物理防御力
  magicDefense: number    // 魔法防御力
  speed: number           // 攻撃速度
}

export interface PlayerAllocatedStats {
  maxHp: number
  attack: number
  magic: number
  defense: number
  magicDefense: number
  speed: number
}

/**
 * プレイヤーデータ
 */
export interface Player extends CombatUnit {
  level: number           // プレイヤーレベル
  exp: number             // 現在の経験値
  nextLevelExp: number    // 次レベルまでの経験値
  weapons: Weapon[]       // 装備中の武器リスト
  stats: PlayerStats      // ステータス
  statPoints: number      // 未割り振りステータスポイント
  allocatedStats?: PlayerAllocatedStats // 割り振り管理用
  gold: number            // 所持ゴールド
}

/**
 * 敵データ
 */
export type EnemyTier = 'normal' | 'elite' | 'named' | 'boss'

export interface EnemyStats {
  attack: number
  magic: number
  defense: number
  magicDefense: number
  speed: number
}

export interface Enemy extends CombatUnit {
  tier: EnemyTier
  stats: EnemyStats
  level: number
}

export interface Dungeon {
  id: string
  name: string
  description: string
  levelRange: [number, number]
  tierWeights: Record<EnemyTier, number>
  lootWeights: Record<'common' | 'rare' | 'epic' | 'legendary', number>
  chestChance?: number
}

export interface LootChest {
  options: Weapon[]
  source: EnemyTier
}

export interface LootReward {
  weapon?: Weapon
  chest?: LootChest
}

/**
 * 戦闘ログのエントリ
 */
export interface CombatLogEntry {
  turn: number
  message: string
  type: 'damage' | 'status' | 'info' | 'critical' | 'loot'
}

/**
 * ダメージ計算結果
 */
export interface DamageResult {
  damage: number
  isCritical: boolean
  statusEffects: WeaponEffect[]
}
