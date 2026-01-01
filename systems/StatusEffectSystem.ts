import type { StatusEffect, StatusEffectType, CombatUnit } from '../types'
import { getStatusEffectDefinition, STATUS_EFFECTS_DB } from '../data/statusEffects'

/**
 * 状態異常システム
 * 各状態異常の効果処理とスタック管理を行う
 */
export class StatusEffectSystem {
  /**
   * 状態異常を付与する
   */
  static applyStatusEffect(
    target: CombatUnit,
    type: StatusEffectType,
    stacks: number,
    duration: number
  ): void {
    const existing = target.statusEffects.find(e => e.type === type)
    
    if (existing) {
      // 既存の状態異常がある場合はスタックを追加し、継続時間を更新
      existing.stacks += stacks
      existing.duration = Math.max(existing.duration, duration)
    } else {
      // 新規の状態異常を追加
      target.statusEffects.push({ type, stacks, duration })
    }
  }

  /**
   * 状態異常のダメージを処理する（ターン開始時）
   * @returns ダメージ量と説明文のリスト
   */
  static processStatusEffects(unit: CombatUnit): Array<{ damage: number; message: string }> {
    const results: Array<{ damage: number; message: string }> = []

    for (const effect of unit.statusEffects) {
      const result = this.processEffect(unit, effect)
      if (result) {
        results.push(result)
      }
    }

    // 継続時間を減らし、切れたものを削除
    unit.statusEffects = unit.statusEffects
      .map(e => ({ ...e, duration: e.duration - 1 }))
      .filter(e => e.duration > 0)

    return results
  }

  /**
   * 個別の状態異常効果を処理
   */
  private static processEffect(
    unit: CombatUnit,
    effect: StatusEffect
  ): { damage: number; message: string } | null {
    switch (effect.type) {
      case 'poison':
        return this.processPoison(unit, effect)
      case 'burn':
        return this.processBurn(unit, effect)
      case 'bleed':
        return this.processBleed(unit, effect)
      case 'kissed':
        return this.processKissed(unit, effect)
      case 'epidemic':
        return this.processEpidemic(unit, effect)
      // 行動阻害系はプロセスフェーズではダメージなし
      case 'slow':
      case 'stun':
      case 'sleep':
      case 'frozen':
      case 'petrification':
      case 'fear':
      case 'drunk':
        return null
      // 状態変化系
      case 'vulnerable':
      case 'weak':
        return null
      // バフ系
      case 'fleet':
      case 'armor':
      case 'thorn':
        return null
      default:
        return null
    }
  }

  /**
   * 毒ダメージ処理（スタック毎に固定ダメージ）
   */
  private static processPoison(
    unit: CombatUnit,
    effect: StatusEffect
  ): { damage: number; message: string } {
    const damagePerStack = 2
    const damage = effect.stacks * damagePerStack
    unit.currentHp = Math.max(0, unit.currentHp - damage)
    
    return {
      damage,
      message: `${unit.name}は毒ダメージを${damage}受けた (スタック: ${effect.stacks})`
    }
  }

  /**
   * 燃焼ダメージ処理（スタック毎にダメージ、攻撃力も低下）
   */
  private static processBurn(
    unit: CombatUnit,
    effect: StatusEffect
  ): { damage: number; message: string } {
    const damagePerStack = 3
    const damage = effect.stacks * damagePerStack
    unit.currentHp = Math.max(0, unit.currentHp - damage)
    
    return {
      damage,
      message: `${unit.name}は燃焼ダメージを${damage}受けた (スタック: ${effect.stacks}、攻撃力-10%)`
    }
  }

  /**
   * 出血ダメージ処理
   */
  private static processBleed(
    unit: CombatUnit,
    effect: StatusEffect
  ): { damage: number; message: string } {
    const damagePerStack = 2
    const damage = effect.stacks * damagePerStack
    unit.currentHp = Math.max(0, unit.currentHp - damage)
    
    return {
      damage,
      message: `${unit.name}は出血ダメージを${damage}受けた (スタック: ${effect.stacks})`
    }
  }

  /**
   * 口付けダメージ処理（HP吸収）
   */
  private static processKissed(
    unit: CombatUnit,
    effect: StatusEffect
  ): { damage: number; message: string } {
    const damagePerStack = 3
    const damage = effect.stacks * damagePerStack
    unit.currentHp = Math.max(0, unit.currentHp - damage)
    
    return {
      damage,
      message: `${unit.name}は口付けでHPを${damage}吸収された (スタック: ${effect.stacks})`
    }
  }

  /**
   * 疫病ダメージ処理（伝染）
   */
  private static processEpidemic(
    unit: CombatUnit,
    effect: StatusEffect
  ): { damage: number; message: string } {
    const damagePerStack = 4
    const damage = effect.stacks * damagePerStack
    unit.currentHp = Math.max(0, unit.currentHp - damage)
    
    return {
      damage,
      message: `${unit.name}は疫病ダメージを${damage}受けた (スタック: ${effect.stacks}、周囲に伝染)`
    }
  }

  /**
   * 凍結処理（移動・攻撃不能、被ダメージ軽減）
   */
  private static processFrost(
    unit: CombatUnit,
    effect: StatusEffect
  ): { damage: number; message: string } {
    return {
      damage: 0,
      message: `${unit.name}は凍結している (スタック: ${effect.stacks}、移動/攻撃不能、被ダメージ-30%)`
    }
  }

  /**
   * 状態異常による攻撃力の減少を計算
   */
  static getAttackModifier(unit: CombatUnit): number {
    let modifier = 1.0
    
    const burn = unit.statusEffects.find(e => e.type === 'burn')
    if (burn) {
      modifier *= 0.9 // 燃焼中は攻撃力-10%
    }
    
    return modifier
  }

  /**
   * 状態異常アイコンの取得（UI用）
   */
  static getStatusIcon(type: StatusEffectType): string {
    const def = getStatusEffectDefinition(type)
    return def ? def.icon : '❓'
  }

  /**
   * 状態異常の色を取得（UI用）
   */
  static getStatusColor(type: StatusEffectType): string {
    const def = getStatusEffectDefinition(type)
    return def ? def.color : '#95a5a6'
  }

  /**
   * 状態異常の説明を取得（ツールチップ用）
   */
  static getStatusDescription(type: StatusEffectType): string {
    const def = getStatusEffectDefinition(type)
    return def ? def.description : '不明な状態異常'
  }

  /**
   * 状態異常の名前を取得
   */
  static getStatusName(type: StatusEffectType): string {
    const def = getStatusEffectDefinition(type)
    return def ? def.name : type
  }
}
