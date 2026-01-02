/**
 * プレイヤーレベルに基づく難易度スケーリングシステム
 * レベル1～1000の急勾配な成長曲線を実装
 */

import type { PlayerStats, EnemyStats, EnemyTier } from '../types'

/**
 * プレイヤーレベルに基づいて予測ステータスを計算
 * 1～1000の範囲で指数関数的に成長
 */
export function playerStatsByLevel(level: number): PlayerStats {
  // レベルを1～1000にクランプ
  const clampedLevel = Math.max(1, Math.min(1000, level))
  
  // 基本ステータス（レベル1）
  const baseAttack = 15
  const baseMagic = 10
  const baseDefense = 8
  const baseMagicDefense = 6
  const baseSpeed = 5
  
  // 指数関数的成長を実現（1レベルあたり、平均1%程度の成長）
  // 1000レベルで約20000の攻撃力に達する設定
  const growthFactor = Math.pow(1.015, clampedLevel - 1)
  
  return {
    attack: Math.floor(baseAttack * growthFactor),
    magic: Math.floor(baseMagic * growthFactor),
    defense: Math.floor(baseDefense * growthFactor),
    magicDefense: Math.floor(baseMagicDefense * growthFactor),
    speed: Math.floor(baseSpeed * growthFactor)
  }
}

/**
 * 敵レベルとティアに基づいてステータスを計算
 * プレイヤーより弱い（通常）～強い（ボス）敵までティアに応じてスケール
 */
export function enemyStatsByLevel(
  level: number,
  tier: EnemyTier,
  baseStats?: Partial<EnemyStats>
): EnemyStats {
  const clampedLevel = Math.max(1, Math.min(1000, level))
  
  // ティアに応じたステータス乗数
  const tierMultipliers: Record<EnemyTier, number> = {
    normal: 1.0,       // 通常敵は等倍
    elite: 1.35,       // エリート敵は1.35倍
    named: 1.7,        // ネームド敵は1.7倍
    boss: 2.1          // ボス敵は2.1倍
  }
  
  const basePlayerStats = playerStatsByLevel(clampedLevel)
  const tierMult = tierMultipliers[tier]
  
  // ティアに応じたベースステータス
  const attack = Math.floor(basePlayerStats.attack * tierMult * 0.95)      // プレイヤーより若干弱い
  const magic = Math.floor(basePlayerStats.magic * tierMult * 0.95)
  const defense = Math.floor(basePlayerStats.defense * tierMult * 0.85)    // 防御は低めに
  const magicDefense = Math.floor(basePlayerStats.magicDefense * tierMult * 0.85)
  const speed = Math.floor(basePlayerStats.speed * tierMult * 0.9)
  
  // カスタムベースステータスがあれば適用
  return {
    attack: baseStats?.attack ?? attack,
    magic: baseStats?.magic ?? magic,
    defense: baseStats?.defense ?? defense,
    magicDefense: baseStats?.magicDefense ?? magicDefense,
    speed: baseStats?.speed ?? speed
  }
}

/**
 * プレイヤーレベルに基づいて敵レベルを計算
 * ダンジョンの推奨レベル範囲とプレイヤーレベルの相対関係で調整
 */
export function calculateEnemyLevelForDungeon(
  playerLevel: number,
  dungeonLevelRange: [number, number],
  variance: number = 0.1  // ±10%のばらつき
): number {
  const [minDungeonLevel, maxDungeonLevel] = dungeonLevelRange
  
  // プレイヤーレベルがダンジョンの推奨範囲内なら、その中央値あたり
  if (playerLevel >= minDungeonLevel && playerLevel <= maxDungeonLevel) {
    // プレイヤーレベルに少し近い敵レベルを生成
    const baseLevel = Math.floor((minDungeonLevel + maxDungeonLevel) / 2)
    const offset = Math.floor((playerLevel - baseLevel) * 0.5)
    return Math.max(minDungeonLevel, Math.min(maxDungeonLevel, baseLevel + offset))
  }
  
  // プレイヤーが推奨より低い場合
  if (playerLevel < minDungeonLevel) {
    // 最小レベルより低い敵を出す
    return Math.max(1, playerLevel)
  }
  
  // プレイヤーが推奨より高い場合
  if (playerLevel > maxDungeonLevel) {
    // 最大レベルより高い敵を出す
    return Math.min(1000, playerLevel)
  }
  
  return minDungeonLevel
}

/**
 * プレイヤーレベルに応じた「推奨レベル」を計算
 * ダンジョンの難易度ステージを推奨する際に使用
 */
export function getRecommendedDungeonIndex(playerLevel: number, dungeonLevelRanges: Array<[number, number]>): number {
  // プレイヤーレベルが入る範囲のダンジョンを探す
  for (let i = 0; i < dungeonLevelRanges.length; i++) {
    const [min, max] = dungeonLevelRanges[i]
    if (playerLevel <= max) {
      return i
    }
  }
  // 最後のダンジョンを推奨
  return Math.max(0, dungeonLevelRanges.length - 1)
}

/**
 * プレイヤーのステータスを取得（合計値の計算用）
 */
export function getTotalPlayerStats(baseStats: PlayerStats, equipment?: { attack: number; magic: number }): PlayerStats {
  return {
    attack: baseStats.attack + (equipment?.attack ?? 0),
    magic: baseStats.magic + (equipment?.magic ?? 0),
    defense: baseStats.defense,
    magicDefense: baseStats.magicDefense,
    speed: baseStats.speed
  }
}
