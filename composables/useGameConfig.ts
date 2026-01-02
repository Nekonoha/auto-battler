/**
 * ゲーム設定・初期化管理コンポーザブル
 * 
 * 責務:
 * - プレイヤー初期化・デフォルト値管理
 * - ステータス割り当てロジック
 * - ダンジョンアンロック管理
 */

import type { Player, PlayerStats, PlayerAllocatedStats } from '~/types'

// デフォルトステータス値（リセット用）
const DEFAULT_PLAYER_STATS: Record<keyof PlayerStats, number> = {
  attack: 10,
  magic: 5,
  defense: 5,
  magicDefense: 5,
  speed: 10,
  statusPower: 0,
  lifeSteal: 0
}

// ステータス割り当てコスト（1ポイント当たり）
const STAT_DELTAS: Record<keyof Omit<PlayerStats, 'statusPower' | 'lifeSteal'>, number> = {
  attack: 5,
  magic: 5,
  defense: 3,
  magicDefense: 3,
  speed: 2
}

export function useGameConfig(player: Player) {
  /**
   * プレイヤーの割り当てステータスが未初期化の場合は初期化する
   */
  const ensureAllocations = (): PlayerAllocatedStats => {
    if (!player.allocatedStats) {
      player.allocatedStats = {
        maxHp: 0,
        attack: 0,
        magic: 0,
        defense: 0,
        magicDefense: 0,
        speed: 0,
        statusPower: 0,
        lifeSteal: 0
      }
    }
    return player.allocatedStats as PlayerAllocatedStats
  }

  /**
   * 指定されたステータスに1ポイント割り当てる
   */
  const allocateStat = (stat: keyof PlayerStats) => {
    if (player.statPoints <= 0) return { ok: false, reason: 'no-points' }
    const allocations = ensureAllocations()

    const deltas: Record<keyof PlayerStats, number> = {
      attack: 5,
      magic: 5,
      defense: 3,
      magicDefense: 3,
      speed: 2,
      statusPower: 0,
      lifeSteal: 0
    }

    if (stat === 'attack' || stat === 'magic' || stat === 'defense' || stat === 'magicDefense' || stat === 'speed') {
      player.stats[stat] += deltas[stat]
      allocations[stat] += 1
      return { ok: true }
    }

    return { ok: false, reason: 'unknown-stat' }
  }

  /**
   * 最大HPに1ポイント割り当てる
   */
  const allocateMaxHp = () => {
    if (player.statPoints <= 0) return { ok: false, reason: 'no-points' }
    const allocations = ensureAllocations()
    player.maxHp += 25
    player.currentHp = Math.min(player.currentHp + 25, player.maxHp)
    allocations.maxHp += 1
    return { ok: true }
  }

  /**
   * 割り当てたステータスをリセットする
   */
  const resetAllocatedStats = (cost: number) => {
    const allocations = ensureAllocations()

    const totalPointsAllocated =
      allocations.maxHp +
      allocations.attack +
      allocations.magic +
      allocations.defense +
      allocations.magicDefense +
      allocations.speed

    if (totalPointsAllocated === 0) return { ok: false, reason: 'no-allocation' }
    if (player.gold < cost) return { ok: false, reason: 'no-gold' }

    // デフォルト値に戻す
    player.maxHp = 100
    player.stats.attack = DEFAULT_PLAYER_STATS.attack
    player.stats.magic = DEFAULT_PLAYER_STATS.magic
    player.stats.defense = DEFAULT_PLAYER_STATS.defense
    player.stats.magicDefense = DEFAULT_PLAYER_STATS.magicDefense
    player.stats.speed = DEFAULT_PLAYER_STATS.speed

    player.gold -= cost
    player.currentHp = Math.min(player.currentHp, player.maxHp)

    allocations.maxHp = 0
    allocations.attack = 0
    allocations.magic = 0
    allocations.defense = 0
    allocations.magicDefense = 0
    allocations.speed = 0

    // リセット後、statPoints を正確に再計算
    const multipliers = { maxHp: 25, attack: 5, magic: 5, defense: 3, magicDefense: 3, speed: 2 }
    const allocatedPoints =
      Math.floor((player.maxHp - 100) / multipliers.maxHp) +
      Math.floor((player.stats.attack - DEFAULT_PLAYER_STATS.attack) / multipliers.attack) +
      Math.floor((player.stats.magic - DEFAULT_PLAYER_STATS.magic) / multipliers.magic) +
      Math.floor((player.stats.defense - DEFAULT_PLAYER_STATS.defense) / multipliers.defense) +
      Math.floor((player.stats.magicDefense - DEFAULT_PLAYER_STATS.magicDefense) / multipliers.magicDefense) +
      Math.floor((player.stats.speed - DEFAULT_PLAYER_STATS.speed) / multipliers.speed)
    player.statPoints = (player.level * 5) - allocatedPoints

    return { ok: true }
  }

  /**
   * 古いセーブ互換: アンロックリストが無い場合は初期ダンジョンのみ解放
   */
  const ensureUnlockedDungeons = () => {
    if (!Array.isArray(player.unlockedDungeons) || player.unlockedDungeons.length === 0) {
      player.unlockedDungeons = ['tutorial-field']
    }
  }

  /**
   * 武器スロット数が正確に設定されているか確認
   */
  const ensureWeaponSlots = () => {
    if (typeof player.weaponSlots !== 'number') {
      player.weaponSlots = Math.max(2, player.weapons?.length ?? 0)
    }
  }

  return {
    ensureAllocations,
    allocateStat,
    allocateMaxHp,
    resetAllocatedStats,
    ensureUnlockedDungeons,
    ensureWeaponSlots,
    STAT_DELTAS
  }
}
