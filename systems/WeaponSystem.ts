import type { Weapon, WeaponType, DamageResult, CombatUnit, Enemy, WeaponEffect } from '../types'
import { StatusEffectSystem } from './StatusEffectSystem'
import { DamageSystem } from './DamageSystem'
import { getStatusEffectDefinition } from '../data/statusEffects'

/**
 * 武器システム
 * 武器タイプ別のダメージ計算と攻撃処理を行う
 */
export class WeaponSystem {
  private static calculateStatusPowerMultiplier(statusPower: number): number {
    if (statusPower <= 0) return 1
    const blocks = statusPower / 100
    const linearGain = blocks * 0.005 // 100ごとに0.5%の基礎増加
    const diminishing = linearGain / (1 + blocks * 0.8) // ステが上がるほど伸びを緩やかに
    return 1 + Math.max(0, diminishing)
  }

  /**
   * 武器で攻撃を行う
   */
  static attack(
    weapon: Weapon, 
    attacker: CombatUnit, 
    target: CombatUnit,
    synergyBonus?: { attackBonus?: number; magicBonus?: number; speedBonus?: number; critChanceBonus?: number; critDamageBonus?: number; statusPowerBonus?: number; resistancePenetrationBonus?: number; lifeStealBonus?: number } | null
  ): DamageResult {
    type AppliedEffect = WeaponEffect & { powerScale?: number }

    // シナジーボーナスを適用した武器ステータスを計算（元のステータスは変更しない）
    // プレイヤーの基本ステータスと武器ステータスを合算し、シナジーボーナスを適用
    const attackerStats = 'stats' in attacker ? (attacker as any).stats : { attack: 0, magic: 0, speed: 0, critChance: 0, critDamage: 0, statusPower: 0 }
    const effectiveStats = {
      attack: (weapon.stats.attack + (attackerStats.attack || 0)) * (1 + (synergyBonus?.attackBonus || 0) / 100),
      magic: (weapon.stats.magic + (attackerStats.magic || 0)) * (1 + (synergyBonus?.magicBonus || 0) / 100),
      speed: (weapon.stats.speed + (attackerStats.speed || 0)) * (1 + (synergyBonus?.speedBonus || 0) / 100),
      critChance: (weapon.stats.critChance + (attackerStats.critChance || 0)) + (synergyBonus?.critChanceBonus || 0),
      critDamage: (weapon.stats.critDamage + (attackerStats.critDamage || 0)) + (synergyBonus?.critDamageBonus || 0),
      statusPower: weapon.stats.statusPower + (attackerStats.statusPower || 0) + (synergyBonus?.statusPowerBonus || 0)
    }

    const attackerStatusPower = 'stats' in attacker ? ((attacker as any).stats?.statusPower ?? 0) : 0
    const totalStatusPower = effectiveStats.statusPower + attackerStatusPower
    const statusPowerMultiplier = this.calculateStatusPowerMultiplier(totalStatusPower)
    
    // 武器タイプに応じたダメージ計算
    let baseDamage = this.calculateBaseDamageWithStats(weapon.type, { ...effectiveStats, statusPower: totalStatusPower })
    
    // クリティカル判定（複数段階のクリティカルシステム）
    let criticalType: 'normal' | 'critical' | 'overCritical' | 'limitBreak' = 'normal'
    const isCritical = Math.random() * 100 < effectiveStats.critChance
    
    if (isCritical) {
      baseDamage *= effectiveStats.critDamage
      
      // クリティカル率が100%を超えている場合、オーバークリティカルの可能性がある
      if (effectiveStats.critChance > 100) {
        const overChance = effectiveStats.critChance - 100
        
        if (effectiveStats.critChance > 200) {
          // 200%を超えている場合、リミットブレイクの判定
          const limitBreakChance = effectiveStats.critChance - 200
          if (Math.random() * 100 < limitBreakChance) {
            // リミットブレイク発動：クリティカル倍率を3乗する（通常の2乗以上の倍率）
            baseDamage = (baseDamage / effectiveStats.critDamage) * Math.pow(effectiveStats.critDamage, 3)
            criticalType = 'limitBreak'
          } else {
            // オーバークリティカル発動：クリティカル倍率を2乗する
            baseDamage = (baseDamage / effectiveStats.critDamage) * Math.pow(effectiveStats.critDamage, 2)
            criticalType = 'overCritical'
          }
        } else {
          // 100-200%の場合、オーバークリティカルの判定
          if (Math.random() * 100 < overChance) {
            // オーバークリティカル発動：クリティカル倍率を2乗する
            baseDamage = (baseDamage / effectiveStats.critDamage) * Math.pow(effectiveStats.critDamage, 2)
            criticalType = 'overCritical'
          } else {
            criticalType = 'critical'
          }
        }
      } else {
        criticalType = 'critical'
      }
    }
    
    // 状態異常による攻撃力補正
    const modifiedDamage = StatusEffectSystem.applyDamageModifiers(attacker, baseDamage)

    // 防御力を考慮した最終ダメージ計算
    let finalDamage: number
    let resistanceApplied = 0
    let blocked = false
    let penetrationLog: string | undefined
    let attackerResistancePenetration = 0
    
    // 敵への攻撃の場合はトレイト（耐性・無効化）を考慮
    if ('tier' in target && 'traits' in target) {
      const enemy = target as Enemy

      // 攻撃側の耐性貫通を集計（武器固有 + 全装備ボーナス + シナジー）
      if ('weapons' in attacker) {
        const traitBonus = WeaponSystem.getWeaponTraitsBonus((attacker as any).weapons, (synergyBonus as any) || undefined)
        attackerResistancePenetration += traitBonus.resistancePenetration
      }
      if (weapon.traits?.resistancePenetration) attackerResistancePenetration += weapon.traits.resistancePenetration
      if (synergyBonus?.resistancePenetrationBonus) attackerResistancePenetration += synergyBonus.resistancePenetrationBonus

      const damageResult = DamageSystem.calculateDamageWithTraits(
        modifiedDamage,
        enemy,
        weapon.type === 'magic',
        weapon.type,
        attackerResistancePenetration
      )
      finalDamage = damageResult.damage
      resistanceApplied = damageResult.resistanceApplied
      blocked = damageResult.blocked
      penetrationLog = damageResult.penetrationLog
    } else {
      finalDamage = DamageSystem.calculateDamage(modifiedDamage, target as any, weapon.type === 'magic')
    }

    // 状態異常による被ダメージ補正
    finalDamage = StatusEffectSystem.applyVulnerabilityModifier(target, finalDamage)

    // ダメージを与える
    target.currentHp = Math.max(0, target.currentHp - finalDamage)
    
    // 状態異常を付与
    const appliedEffects: AppliedEffect[] = []

    for (const effect of weapon.effects) {
      const def = getStatusEffectDefinition(effect.type as any)
      const defaultRecipient = def?.type === 'Buff' ? attacker : target
      const recipient = effect.target === 'self' ? attacker : effect.target === 'enemy' ? target : defaultRecipient

      // 敵への状態異常付与時、耐性チェック（別スタック化した burn 系も親の burn 免疫を継承）
      if (recipient === target && 'tier' in target && 'traits' in target) {
        const enemy = target as Enemy
        if (StatusEffectSystem['isImmune']?.(enemy as any, effect.type)) {
          continue
        }
      }
      
      // 確率判定（statusPowerで上昇、最大100%）
      const effectiveChance = Math.min(100, effect.chance * statusPowerMultiplier)
      if (Math.random() * 100 < effectiveChance) {
        // statusPowerでスタック数と持続時間を補正
        const stacks = Math.max(1, Math.floor(effect.stacks * statusPowerMultiplier))
        const duration = Math.max(1, Math.floor(effect.duration * statusPowerMultiplier))
        // 付与時の威力倍率を保持
        appliedEffects.push({
          ...effect,
          stacks,
          duration,
          powerScale: statusPowerMultiplier,
          target: recipient === attacker ? 'self' : 'enemy'
        })
      }
    }
    
    return {
      damage: finalDamage,
      isCritical,
      criticalType,
      statusEffects: appliedEffects,
      resistanceApplied,
      blocked,
      actualDamageInflicted: finalDamage,
      penetrationLog
    }
  }

  /**
   * 武器タイプ別の基礎ダメージ計算（効果適用済みステータスを使用）
   */
  private static calculateBaseDamageWithStats(
    weaponType: WeaponType,
    stats: { attack: number; magic: number; speed: number; statusPower: number }
  ): number {
    switch (weaponType) {
      case 'melee':
        // 近接武器: 攻撃力が主、速度が副
        return stats.attack * 1.2 + stats.speed * 0.3
      
      case 'ranged':
        // 遠距離武器: 攻撃力と速度のバランス型
        return stats.attack * 1.0 + stats.speed * 0.5
      
      case 'magic':
        // 魔法武器: 魔法攻撃力が主
        return stats.magic * 1.5 + stats.attack * 0.2
      
      case 'dot':
        // 状態異常特化: 直接ダメージは低いが状態異常が強力
        return stats.attack * 0.5 + stats.statusPower * 0.4
      
      default:
        return stats.attack
    }
  }

  /**
   * 武器の総合的な強さを評価（ソート用）
   */
  static evaluateWeapon(weapon: Weapon): number {
    const stats = weapon.stats
    const rarityBonus = this.getRarityMultiplier(weapon.rarity)
    
    // 武器タイプによって評価を変える
    let score = 0
    switch (weapon.type) {
      case 'melee':
        score = stats.attack * 2 + stats.speed + stats.critChance * 0.5
        break
      case 'ranged':
        score = stats.attack * 1.5 + stats.speed * 1.5 + stats.critChance * 0.5
        break
      case 'magic':
        score = stats.magic * 2 + stats.attack + stats.critChance * 0.3
        break
      case 'dot':
        score = stats.statusPower * 2 + stats.attack + weapon.effects.length * 10
        break
    }
    
    return score * rarityBonus
  }

  /**
   * レアリティによる倍率
   */
  private static getRarityMultiplier(rarity: string): number {
    const baseMultipliers: Record<string, number> = {
      common: 1.0,
      rare: 1.3,
      epic: 1.6,
      legendary: 2.0,
      mythic: 2.4
    }
    if (rarity.startsWith('mythic')) {
      const plus = rarity.replace('mythic', '').length
      return (baseMultipliers.mythic || 2.4) + plus * 0.2
    }
    return baseMultipliers[rarity] || 1.0
  }

  /**
   * 武器タイプの説明を取得
   */
  static getWeaponTypeDescription(type: WeaponType): string {
    const descriptions: Record<WeaponType, string> = {
      melee: '近接物理攻撃。高い攻撃力と安定性',
      ranged: '遠距離物理攻撃。攻撃力と速度のバランス型',
      magic: '魔法攻撃。魔力依存の高火力',
      dot: '状態異常特化。継続ダメージで敵を弱体化'
    }
    return descriptions[type]
  }

  /**
   * レアリティの色を取得（UI用）
   */
  static getRarityColor(rarity: string): string {
    const colors: Record<string, string> = {
      common: '#95a5a6',
      rare: '#3498db',
      epic: '#9b59b6',
      legendary: '#f39c12',
      mythic: '#e91e63'
    }
    // mythic, mythic+, mythic++ などはすべてmythicと同じピンク色
    if (rarity.startsWith('mythic')) return colors['mythic']
    return colors[rarity] || '#95a5a6'
  }

  /**
   * 装備武器からtraitsボーナスを集計（プレイヤー用）
   * 各耐性の累積は最大70%までの上限がある
   */
  static getWeaponTraitsBonus(weapons: Weapon[], synergyBonus?: { physicalResistanceBonus?: number; magicalResistanceBonus?: number; statusResistanceBonus?: number; damageReductionBonus?: number; resistancePenetrationBonus?: number }): {
    physicalResistance: number
    magicalResistance: number
    statusResistance: number
    damageReduction: number
    resistancePenetration: number
  } {
    const bonus = {
      physicalResistance: 0,
      magicalResistance: 0,
      statusResistance: 0,
      damageReduction: 0,
      resistancePenetration: 0
    }
    
    const MAX_RESISTANCE = 70 // 最大耐性率
    const MAX_PENETRATION = 100

    for (const weapon of weapons) {
      if (!weapon.traits) continue
      if (weapon.traits.physicalResistance) bonus.physicalResistance += weapon.traits.physicalResistance
      if (weapon.traits.magicalResistance) bonus.magicalResistance += weapon.traits.magicalResistance
      if (weapon.traits.statusResistance) bonus.statusResistance += weapon.traits.statusResistance
      if (weapon.traits.damageReduction) bonus.damageReduction += weapon.traits.damageReduction
      if (weapon.traits.resistancePenetration) bonus.resistancePenetration += weapon.traits.resistancePenetration
    }

    // シナジー由来の特性ボーナスを加算
    if (synergyBonus) {
      bonus.physicalResistance += synergyBonus.physicalResistanceBonus || 0
      bonus.magicalResistance += synergyBonus.magicalResistanceBonus || 0
      bonus.statusResistance += synergyBonus.statusResistanceBonus || 0
      bonus.damageReduction += synergyBonus.damageReductionBonus || 0
      bonus.resistancePenetration += synergyBonus.resistancePenetrationBonus || 0
    }

    // 各耐性の上限を70%に制限
    bonus.physicalResistance = Math.min(bonus.physicalResistance, MAX_RESISTANCE)
    bonus.magicalResistance = Math.min(bonus.magicalResistance, MAX_RESISTANCE)
    bonus.statusResistance = Math.min(bonus.statusResistance, MAX_RESISTANCE)
    bonus.damageReduction = Math.min(bonus.damageReduction, MAX_RESISTANCE)
    bonus.resistancePenetration = Math.min(bonus.resistancePenetration, MAX_PENETRATION)

    return bonus
  }
}
