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
  | 'bloodthirsty'  // 血渇系（シナジー用）
  | 'healing'       // 回復系
  | 'defensive'     // 防御系
  | 'versatile'     // 万能系
  | 'venomous'      // 毒系（シナジー用）
  | 'flame'         // 炎系（シナジー用）
  | 'frost'         // 氷系（シナジー用）

/**
 * 武器エンチャント（接頭辞/接尾辞）
 */
export interface WeaponEnchantment {
  id: string
  name: string                    // 接頭辞/接尾辞の名前（「すばやい」「重い」など）
  position: 'prefix' | 'suffix'   // 接頭辞か接尾辞か
  rarityBonus: number             // レアリティ上昇（0=なし, 1=1段階上昇）
  statModifiers?: {               // ステータス修正（乗算）
    attack?: number
    magic?: number
    speed?: number
    critChance?: number
    critDamage?: number
    statusPower?: number
  }
  addTags?: WeaponTag[]           // 追加されるタグ
  addEffects?: WeaponEffect[]     // 追加される効果
  weight: number                  // 出現確率の重み
}

/**
 * エンチャントされた武器インスタンス
 */
export interface EnchantedWeapon extends Weapon {
  baseWeaponId: string            // ベース武器のID
  enchantments: string[]          // 適用されているエンチャントID
  sellValue: number               // 売却価格
}

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

/**
 * 敵の特性
 */
export interface EnemyTraits {
  physicalResistance?: number     // 物理耐性（%）
  magicalResistance?: number      // 魔法耐性（%）
  statusImmunities?: StatusEffectType[]  // 無効な状態異常
  attackImmunities?: WeaponType[]        // 無効な攻撃タイプ
  inflictsStatus?: {                     // 攻撃時に付与する状態異常
    type: StatusEffectType
    chance: number
    stacks: number
    duration: number
  }[]
}

/**
 * 敵のタイプ（見た目・特性の分類）
 */
export type EnemyType = 
  | 'beast'      // 獣系
  | 'undead'     // アンデッド系
  | 'demon'      // 悪魔系
  | 'elemental'  // 精霊系
  | 'humanoid'   // 人型
  | 'dragon'     // ドラゴン系
  | 'construct'  // 構造物系

export interface EnemyStats {
  attack: number
  magic: number
  defense: number
  magicDefense: number
  speed: number
}

export interface Enemy extends CombatUnit {
  tier: EnemyTier
  type?: EnemyType
  traits?: EnemyTraits
  stats: EnemyStats
  level: number
}

export interface Dungeon {
  id: string
  name: string
  description: string
  levelRange: [number, number]
  tierWeights: Record<EnemyTier, number>
  enemyPool?: string[]  // 出現する敵のIDリスト（未指定時はランダム生成）
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
 * ダンジョンログのエントリ（ステージごと）
 */
export interface DungeonLogEntry {
  stage: number
  enemyName: string
  enemyLevel: number
  enemyTier: EnemyTier
  playerHpBefore: number
  playerHpAfter: number
  result: 'victory' | 'defeat'
  itemsDropped?: Weapon[]
  goldEarned: number
  combatTurns: number
}

/**
 * ダメージ計算結果
 */
export interface DamageResult {
  damage: number
  isCritical: boolean
  statusEffects: WeaponEffect[]
}
