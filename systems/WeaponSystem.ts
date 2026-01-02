import type { Weapon, WeaponType, DamageResult, CombatUnit, Enemy } from '../types'
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
    synergyBonus?: { attackBonus?: number; magicBonus?: number; speedBonus?: number; critChanceBonus?: number; critDamageBonus?: number; statusPowerBonus?: number } | null
  ): DamageResult {
    type AppliedEffect = WeaponEffect & { powerScale?: number }

    // シナジーボーナスを適用した武器ステータスを計算（元のステータスは変更しない）
    const effectiveStats = {
      attack: weapon.stats.attack * (1 + (synergyBonus?.attackBonus || 0) / 100),
      magic: weapon.stats.magic * (1 + (synergyBonus?.magicBonus || 0) / 100),
      speed: weapon.stats.speed * (1 + (synergyBonus?.speedBonus || 0) / 100),
      critChance: weapon.stats.critChance + (synergyBonus?.critChanceBonus || 0),
      critDamage: weapon.stats.critDamage + (synergyBonus?.critDamageBonus || 0) / 100,
      statusPower: weapon.stats.statusPower + (synergyBonus?.statusPowerBonus || 0)
    }

    const attackerStatusPower = 'stats' in attacker ? ((attacker as any).stats?.statusPower ?? 0) : 0
    const totalStatusPower = effectiveStats.statusPower + attackerStatusPower
    const statusPowerMultiplier = this.calculateStatusPowerMultiplier(totalStatusPower)
    
    // 武器タイプに応じたダメージ計算
    let baseDamage = this.calculateBaseDamageWithStats(weapon.type, { ...effectiveStats, statusPower: totalStatusPower })
    
    // クリティカル判定
    const isCritical = Math.random() * 100 < effectiveStats.critChance
    if (isCritical) {
      baseDamage *= effectiveStats.critDamage
    }
    
    // 状態異常による攻撃力補正
    const modifiedDamage = StatusEffectSystem.applyDamageModifiers(attacker, baseDamage)

    // 防御力を考慮した最終ダメージ計算
    let finalDamage: number
    let resistanceApplied = 0
    let blocked = false
    
    // 敵への攻撃の場合はトレイト（耐性・無効化）を考慮
    if ('tier' in target && 'traits' in target) {
      const enemy = target as Enemy
      const damageResult = DamageSystem.calculateDamageWithTraits(
        modifiedDamage,
        enemy,
        weapon.type === 'magic',
        weapon.type
      )
      finalDamage = damageResult.damage
      resistanceApplied = damageResult.resistanceApplied
      blocked = damageResult.blocked
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
      statusEffects: appliedEffects,
      resistanceApplied,
      blocked,
      actualDamageInflicted: finalDamage
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
    if (rarity.startsWith('mythic')) return colors.mythic
    return colors[rarity] || '#95a5a6'
  }

  /**
   * 装備武器からtraitsボーナスを集計（プレイヤー用）
   */
  static getWeaponTraitsBonus(weapons: Weapon[]): {
    physicalResistance: number
    magicalResistance: number
    statusResistance: number
    damageReduction: number
  } {
    const bonus = {
      physicalResistance: 0,
      magicalResistance: 0,
      statusResistance: 0,
      damageReduction: 0
    }

    for (const weapon of weapons) {
      if (!weapon.traits) continue
      if (weapon.traits.physicalResistance) bonus.physicalResistance += weapon.traits.physicalResistance
      if (weapon.traits.magicalResistance) bonus.magicalResistance += weapon.traits.magicalResistance
      if (weapon.traits.statusResistance) bonus.statusResistance += weapon.traits.statusResistance
      if (weapon.traits.damageReduction) bonus.damageReduction += weapon.traits.damageReduction
    }

    return bonus
  }
}
