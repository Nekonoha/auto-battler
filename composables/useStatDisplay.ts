/**
 * ステータス表示用コンポーザブル
 * PlayerInfo と EnemyInfo で共通するステータス計算ロジックを統一
 */

import { computed, type ComputedRef } from 'vue'
import type { Player, Enemy, PlayerStats, EnemyStats, StatusEffectType } from '~/types'
import { StatusEffectSystem } from '~/systems/StatusEffectSystem'
import { calculateActiveSynergies, getTotalSynergyBonus } from '~/data/synergies'

export interface StatDetail {
  value: number
  base: number
  synergy?: number
  buff: number
  debuff: number
  modifierPct: number
  entries?: Array<{ type: StatusEffectType; percent: number }>
}

/**
 * 装備武器から得られるtraitボーナス
 */
export interface TraitBonus {
  physicalResistance: number
  magicalResistance: number
  statusResistance: number
  damageReduction: number
}

type StatKey = keyof PlayerStats | keyof EnemyStats

/**
 * プレイヤーのステータス表示を計算
 */
export function usePlayerStatDisplay(player: ComputedRef<Player> | Player) {
  const playerRef = 'value' in player ? player : computed(() => player)

  // シナジーボーナスの計算
  const synergyBonuses = computed(() => {
    const p = playerRef.value
    if (!p.weapons || p.weapons.length === 0) {
      return { attack: 0, magic: 0, speed: 0, critChance: 0, critDamage: 0, statusPower: 0, lifeSteal: 0 }
    }

    const weaponTags = p.weapons.map(w => w.tags)
    const activeSynergies = calculateActiveSynergies(weaponTags)
    const result = getTotalSynergyBonus(activeSynergies)
    return {
      attack: result.attackBonus || 0,
      magic: result.magicBonus || 0,
      speed: result.speedBonus || 0,
      critChance: result.critChanceBonus || 0,
      critDamage: result.critDamageBonus || 0,
      statusPower: result.statusPowerBonus || 0,
      lifeSteal: result.lifeStealBonus || 0
    }
  })

  // 武器からの基本ステータス
  const weaponStats = computed(() => {
    const p = playerRef.value
    if (!p.weapons || p.weapons.length === 0) {
      return { attack: 0, magic: 0, speed: 0, critChance: 0, critDamage: 0, statusPower: 0, lifeSteal: 0 }
    }

    // 武器の各ステータスを合計
    return p.weapons.reduce((total, w) => ({
      attack: total.attack + (w.stats.attack || 0),
      magic: total.magic + (w.stats.magic || 0),
      speed: total.speed + (w.stats.speed || 0),
      critChance: total.critChance + (w.stats.critChance || 0),
      critDamage: Math.max(total.critDamage, w.stats.critDamage || 1),
      statusPower: total.statusPower + (w.stats.statusPower || 0),
      lifeSteal: total.lifeSteal + (w.stats.lifeSteal || 0)
    }), { attack: 0, magic: 0, speed: 0, critChance: 0, critDamage: 1, statusPower: 0, lifeSteal: 0 })
  })

  // ステータス詳細計算
  const getEffectiveStat = (stat: StatKey): StatDetail => {
    const p = playerRef.value

    let base = 0
    let synergy = 0

    // プレイヤー基本ステータス
    if (stat === 'attack' || stat === 'magic' || stat === 'defense' || stat === 'magicDefense' || stat === 'speed') {
      base = p.stats[stat] || 0
    } else if (stat === 'statusPower') {
      base = p.stats.statusPower || 0
    } else if (stat === 'lifeSteal') {
      base = p.stats.lifeSteal || 0
    }

    // 武器ステータス
    const weaponStat = weaponStats.value[stat as keyof typeof weaponStats.value] || 0
    base += weaponStat

    // シナジーボーナス（attack, magic, speed など）
    if (stat in synergyBonuses.value) {
      synergy = synergyBonuses.value[stat as keyof typeof synergyBonuses.value]
    }

    // 状態異常による修正（ライフスティールは修正なし）
    let buff = 0
    let debuff = 0
    let modifierPct = 0
    if (stat !== 'lifeSteal') {
      const modifiers = StatusEffectSystem.getStatModifiers(p)
      modifierPct = modifiers[stat as keyof typeof modifiers] || 0
      const buffDebuffValue = Math.round(base * (modifierPct / 100))
      if (buffDebuffValue > 0) {
        buff = buffDebuffValue
      } else if (buffDebuffValue < 0) {
        debuff = -buffDebuffValue
      }
    }

    const finalValue = Math.max(0, Math.round(base + synergy + buff - debuff))
    const entries = StatusEffectSystem.getStatModifierEntries(p, stat as any)

    return {
      value: finalValue,
      base,
      synergy,
      buff,
      debuff,
      modifierPct,
      entries
    }
  }

  // 全ステータス詳細
  const playerStatDetails = computed(() => {
    const stats: Partial<Record<StatKey, StatDetail>> = {}
    const statKeys: StatKey[] = ['attack', 'magic', 'defense', 'magicDefense', 'speed', 'statusPower', 'lifeSteal']
    
    for (const stat of statKeys) {
      stats[stat] = getEffectiveStat(stat)
    }
    
    return stats
  })

  return {
    playerStatDetails,
    getEffectiveStat,
    synergyBonuses,
    weaponStats
  }
}

/**
 * 敵のステータス表示を計算
 */
export function useEnemyStatDisplay(enemy: ComputedRef<Enemy> | Enemy) {
  const enemyRef = 'value' in enemy ? enemy : computed(() => enemy)

  // ステータス詳細計算
  const getEnemyStat = (stat: StatKey): StatDetail => {
    const e = enemyRef.value

    let base = 0

    // 敵基本ステータス
    if (stat === 'attack' || stat === 'magic' || stat === 'defense' || stat === 'magicDefense' || stat === 'speed') {
      base = e.stats[stat] || 0
    } else if (stat === 'statusPower') {
      base = e.stats.statusPower || 0
    } else if (stat === 'lifeSteal') {
      base = e.stats.lifeSteal || 0
    }

    // 状態異常による修正（ライフスティールは修正なし）
    let buff = 0
    let debuff = 0
    let modifierPct = 0
    if (stat !== 'lifeSteal') {
      const modifiers = StatusEffectSystem.getStatModifiers(e)
      modifierPct = modifiers[stat as keyof typeof modifiers] || 0
      const buffDebuffValue = Math.round(base * (modifierPct / 100))
      if (buffDebuffValue > 0) {
        buff = buffDebuffValue
      } else if (buffDebuffValue < 0) {
        debuff = -buffDebuffValue
      }
    }

    const finalValue = Math.max(0, Math.round(base + buff - debuff))
    const entries = StatusEffectSystem.getStatModifierEntries(e, stat as any)

    return {
      value: finalValue,
      base,
      buff,
      debuff,
      modifierPct,
      entries
    }
  }

  // 全ステータス詳細
  const enemyStatDetails = computed(() => {
    const stats: Partial<Record<StatKey, StatDetail>> = {}
    const statKeys: StatKey[] = ['attack', 'magic', 'defense', 'magicDefense', 'speed', 'statusPower', 'lifeSteal']
    
    for (const stat of statKeys) {
      stats[stat] = getEnemyStat(stat)
    }
    
    return stats
  })

  return {
    enemyStatDetails,
    getEnemyStat
  }
}

/**
 * ステータスのツールチップ内容を生成
 */
export function getStatTooltipContent(
  statDetail: StatDetail | undefined,
  statName: string,
  getStatusName: (type: StatusEffectType) => string
): string {
  if (!statDetail) return `${statName}: 0`

  const parts: string[] = [`基本値: ${statDetail.base}`]

  if (statDetail.synergy && statDetail.synergy > 0) {
    parts.push(`<span class="tooltip-synergy">シナジー: +${statDetail.synergy}</span>`)
  }

  if (statDetail.buff > 0) {
    const entries = statDetail.entries?.filter(e => e.percent > 0) || []
    const detailText = entries.length > 0
      ? entries.map(e => `${getStatusName(e.type)} +${Math.round(statDetail.base * (Math.abs(e.percent) / 100))}`).join(', ')
      : `+${statDetail.buff}`
    parts.push(`<span class="tooltip-positive">バフ: ${detailText}</span>`)
  }

  if (statDetail.debuff > 0) {
    const entries = statDetail.entries?.filter(e => e.percent < 0) || []
    const detailText = entries.length > 0
      ? entries.map(e => `${getStatusName(e.type)} -${Math.round(statDetail.base * (Math.abs(e.percent) / 100))}`).join(', ')
      : `-${statDetail.debuff}`
    parts.push(`<span class="tooltip-negative">デバフ: ${detailText}</span>`)
  }

  parts.push(`適用倍率: ${statDetail.modifierPct.toFixed(1)}%`)
  parts.push(`実数値: ${statDetail.value}`)

  return parts.join('<br>')
}
