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
  synergy: number
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

// クリティカル倍率を%表記に正規化（1.5 → 150）
const toCritDamagePercent = (value: number): number => {
  if (!value) return 0
  return Math.round(value < 5 ? value * 100 : value)
}

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
      critDamage: result.critDamageBonus || 0,  // %値（加算）
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
    // critChance は1回の攻撃で参照されるのは使用中の武器のみなので、合算ではなく最大値を表示
    return p.weapons.reduce((total, w) => ({
      attack: total.attack + (w.stats.attack || 0),
      magic: total.magic + (w.stats.magic || 0),
      speed: total.speed + (w.stats.speed || 0),
      // クリ率/クリダメ/ライフスティールは武器ごと判定なので集計しない（表示は基礎＋シナジー＋特性のみ）
      critChance: total.critChance,
      critDamage: total.critDamage,
      statusPower: total.statusPower + (w.stats.statusPower || 0),
      lifeSteal: total.lifeSteal
    }), { attack: 0, magic: 0, speed: 0, critChance: 0, critDamage: 0, statusPower: 0, lifeSteal: 0 })
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
    } else if (stat === 'critChance') {
      base = p.stats.critChance || 0
    } else if (stat === 'critDamage') {
      base = toCritDamagePercent(p.stats.critDamage || 0)
    }

    // 武器ステータス
    const weaponStat = weaponStats.value[stat as keyof typeof weaponStats.value] || 0
    base += weaponStat

    // シナジーボーナス（加算）
    if (stat in synergyBonuses.value) {
      const bonusValue = synergyBonuses.value[stat as keyof typeof synergyBonuses.value]
      synergy = bonusValue
    }

    // 状態異常による修正（ライフスティール、クリティカル率、クリティカル倍率は修正なし）
    let buff = 0
    let debuff = 0
    let modifierPct = 0
    if (stat !== 'lifeSteal' && stat !== 'critChance' && stat !== 'critDamage') {
      const modifiers = StatusEffectSystem.getStatModifiers(p)
      modifierPct = modifiers[stat as keyof typeof modifiers] || 0
      const buffDebuffValue = Math.round(base * (modifierPct / 100))
      if (buffDebuffValue > 0) {
        buff = buffDebuffValue
      } else if (buffDebuffValue < 0) {
        debuff = -buffDebuffValue
      }
    }

    const isCritDamage = stat === 'critDamage'
    const finalValue = isCritDamage
      ? Math.max(0, Math.round(base + synergy))  // クリダメは%表示（基礎倍率→%換算済みを前提）
      : Math.max(0, Math.round(base + synergy + buff - debuff))
    const entries = StatusEffectSystem.getStatModifierEntries(p, stat as any)

    return {
      value: finalValue,
      base: isCritDamage ? base : Math.round(base),
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
    const statKeys: StatKey[] = ['attack', 'magic', 'defense', 'magicDefense', 'speed', 'statusPower', 'lifeSteal', 'critChance', 'critDamage']
    
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
    } else if (stat === 'critChance') {
      base = e.stats.critChance || 0
    } else if (stat === 'critDamage') {
      base = toCritDamagePercent(e.stats.critDamage || 0)
    }

    // 状態異常による修正（ライフスティール、クリティカル率、クリティカル倍率は修正なし）
    let buff = 0
    let debuff = 0
    let modifierPct = 0
    if (stat !== 'lifeSteal' && stat !== 'critChance' && stat !== 'critDamage') {
      const modifiers = StatusEffectSystem.getStatModifiers(e)
      modifierPct = modifiers[stat as keyof typeof modifiers] || 0
      const buffDebuffValue = Math.round(base * (modifierPct / 100))
      if (buffDebuffValue > 0) {
        buff = buffDebuffValue
      } else if (buffDebuffValue < 0) {
        debuff = -buffDebuffValue
      }
    }

    const finalValue = stat === 'critDamage'
      ? Math.max(0, Math.round(base))  // クリダメは%表示（倍率ではなく%）
      : Math.max(0, Math.round(base + buff - debuff))
    const entries = StatusEffectSystem.getStatModifierEntries(e, stat as any)

    return {
      value: finalValue,
      base: stat === 'critDamage' ? base : Math.round(base),
      synergy: 0,
      buff,
      debuff,
      modifierPct,
      entries
    }
  }

  // 全ステータス詳細
  const enemyStatDetails = computed(() => {
    const stats: Partial<Record<StatKey, StatDetail>> = {}
    const statKeys: StatKey[] = ['attack', 'magic', 'defense', 'magicDefense', 'speed', 'statusPower', 'lifeSteal', 'critChance', 'critDamage']
    
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
