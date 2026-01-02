/**
 * 武器のレアリティ
 * mythic 以上は "mythic+" のように + で段階を表現する
 */
export type WeaponRarity = 'common' | 'rare' | 'epic' | 'legendary' | `mythic${string}`

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
  lifeSteal?: number    // ライフスティール（与えたダメージの％で回復）
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
 * 武器の特性（高レアリティ武器に付く可能性があるマイルドな効果）
 */
export interface WeaponTraits {
  physicalResistance?: number     // 物理耐性（%）10-20%程度
  magicalResistance?: number      // 魔法耐性（%）10-20%程度
  statusResistance?: number       // 状態異常全般への耐性（%）10-20%程度
  damageReduction?: number        // 被ダメージ軽減（%）5-15%程度
}

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
  | 'poison' | 'burn' | 'burnDot' | 'burnWeaken' | 'bleed' | 'kissed' | 'epidemic' | 'corrosion' | 'electrificationDot'
  // 行動阻害
  | 'slow' | 'stun' | 'sleep' | 'sleepLock' | 'sleepVulnerable' | 'frozen' | 'frozenLock' | 'frozenGuard' | 'petrification' | 'petrificationLock' | 'petrificationGuard' | 'fear' | 'drunk' | 'electrification' | 'electrificationSlow' | 'electrificationParalysis'
  // 状態変化
  | 'vulnerable' | 'weak' | 'mist'
  // バフ
  | 'fleet' | 'armor' | 'thorn' | 'power' | 'intellect' | 'precision'

/**
 * 武器が付与する状態異常効果
 */
export interface WeaponEffect {
  type: StatusEffectType
  chance: number        // 付与確率（0-100）
  stacks: number        // 付与するスタック数
  duration: number      // 継続ターン数
  /**
   * 付与対象（デフォルトは敵）。デバッグ武器などで自己バフを入れる用途。
   */
  target?: 'enemy' | 'self'
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
  traits?: WeaponTraits    // 高レアリティ武器に付く可能性がある特性
}

/**
 * 戦闘中の状態異常インスタンス
 */
export interface StatusEffect {
  type: StatusEffectType
  stacks: number
  duration: number
  appliedBy?: 'player' | 'enemy'
  /** 状態異常威力の乗算係数（付与元の statusPower から計算） */
  powerScale?: number
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
  statusPower: number     // 状態異常威力（%加算換算）
  lifeSteal?: number      // ライフスティール（与えたダメージの％で回復）
}

export interface PlayerAllocatedStats {
  maxHp: number
  attack: number
  magic: number
  defense: number
  magicDefense: number
  speed: number
  statusPower: number
  lifeSteal?: number
}

/**
 * プレイヤーデータ
 */
export interface Player extends CombatUnit {
  name: string            // プレイヤー名
  level: number           // プレイヤーレベル
  exp: number             // 現在の経験値
  nextLevelExp: number    // 次レベルまでの経験値
  weapons: Weapon[]       // 装備中の武器リスト
  weaponSlots: number     // 武器スロット数（購入で拡張）
  stats: PlayerStats      // ステータス
  statPoints: number      // 未割り振りステータスポイント
  allocatedStats?: PlayerAllocatedStats // 割り振り管理用
  unlockedDungeons: string[]  // クリア済み/アンロック済みダンジョンのIDリスト
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
  /** 状態異常の軽減（%）。個別ID優先、なければカテゴリ(control/damage/modifier)、最後にall。 */
  statusResistances?: Partial<Record<StatusEffectType | 'control' | 'damage' | 'modifier' | 'all', number>>
  attackImmunities?: WeaponType[]        // 無効な攻撃タイプ
  expMultiplier?: number                 // 経験値倍率（デフォルト1.0）
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
  statusPower: number
  lifeSteal?: number
}

export type EnemyActionType = 'attack' | 'defend' | 'nothing' | 'status'

export interface EnemyActionEffect {
  type: StatusEffectType
  stacks: number
  duration: number
  chance?: number
  target?: 'self' | 'enemy'
}

export interface EnemyAction {
  type: EnemyActionType
  weight: number  // 選択確率の重み
  effects?: EnemyActionEffect[] // type === 'status' 用の付与効果
  name?: string                 // ログ表示用（行動名）
  label?: string                // 追加の説明（ログ補足）
  attackType?: 'physical' | 'magic'  // 攻撃種別（物理/魔法）- type === 'attack' 用
  /**
   * 特殊行動のログスタイル。
   * 'special' を指定すると強調表示（critical ログ）を使う。
   */
  logStyle?: 'special' | 'status' | 'info'
  /**
   * 付随ダメージ設定。未指定ならダメージ無しの純粋なバフ/デバフ行動。
   */
  damage?: {
    stat: 'attack' | 'magic'           // どのステータスを基準にするか
    multiplier?: number                // 基準ステータスへの乗算（デフォルト1）
    flat?: number                      // 追加固定値
    variance?: number                  // 振れ幅。0.2なら ±20%（デフォルト0.2）
    type?: DamageType                  // ダメージ種別（省略時 stat に応じて）
  }
  /**
   * ライフスティール効果（攻撃に加えて与えたダメージの％を吸収）
   */
  lifeStealPercent?: number
}

export interface Enemy extends CombatUnit {
  tier: EnemyTier
  type?: EnemyType
  traits?: EnemyTraits
  stats: EnemyStats
  level: number
  actionPool?: EnemyAction[]  // 実行可能な行動のプール
}

export interface Dungeon {
  id: string
  name: string
  description: string
  levelRange: [number, number]
  prereq?: string  // 前提ダンジョンID（未指定時は最初から利用可）
  tierWeights: Record<EnemyTier, number>
  eliteChance?: number
  namedChance?: number
  enemyPool?: string[]  // 出現する敵テンプレートIDリスト（未指定時はランダム生成）
  bossId?: string       // ボス戦で使用するテンプレートID
  lootWeights: Record<string, number>
  chestLootWeights?: Record<string, number>
  chestWeaponPool?: string[] // チェストで優先されるベース武器ID
  chestChance?: number
  characteristics?: {
    statusAffinity?: {
      high: string[]    // 頻繁に使ってくる状態異常
      chance: number    // その確率 (%)
    }
    resistanceTheme?: {
      type: 'physical' | 'magical' | 'mixed'
      baseResistance: number
    }
    immunitiesTheme?: string[]  // 敵が共通で無効化する攻撃
  }
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
  type: 'damage' | 'status' | 'info' | 'critical' | 'loot' | 'buff' | 'debuff' | 'special'
  actor?: 'player' | 'enemy'  // 行動者の区別
  actionCategory?: 'attack' | 'defend' | 'skill' | 'special'  // 行動のカテゴリ
}

// ダンジョン内の戦闘ごとのログ（探索戦闘ログ）
export interface ExplorationEventLogEntry {
  dungeonName: string
  stage: number
  eventType: 'battle' | 'chest'
  // 敵戦闘の場合
  enemyName?: string
  enemyLevel?: number
  enemyTier?: EnemyTier
  result?: 'victory' | 'defeat'
  logs?: CombatLogEntry[]
  // 宝箱の場合
  chestCount?: number
  itemsDropped?: Weapon[]
}

// 後方互換性のため、ExplorationCombatLogEntryはExplorationEventLogEntryのエイリアス
export type ExplorationCombatLogEntry = ExplorationEventLogEntry

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
  statusEffects: Array<WeaponEffect & { powerScale?: number }>
  resistanceApplied?: number
  blocked?: boolean
  actualDamageInflicted?: number  // 実際に与えたダメージ（防御・耐性後）
}

/**
 * ゲーム状態（セーブデータ）
 * localStorage や API を通じて永続化される主要なゲーム状態
 */
export interface GameState {
  version: string
  timestamp: number
  player: Player
  availableWeapons: Weapon[]
  selectedDungeonId: string
  currentLevel: number
  combatLogs: any[]
  explorationCombatLogs: any[]
  dungeonLogs: any[]
}
