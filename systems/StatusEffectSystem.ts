import type { StatusEffect, StatusEffectType, CombatUnit, EnemyTraits } from '../types'
import type { StatusEffectEffectKey, StatusEffectDefinition } from '../data/statusEffects'
import { getStatusEffectDefinition } from '../data/statusEffects'

/**
 * 状態異常システム
 * 各状態異常の効果処理とスタック管理を行う
 */
interface ApplyStatusResult {
  type: StatusEffectType
  applied: boolean
  finalStacks: number
  finalDuration: number
  resistance?: number
  immunity?: boolean
  reason?: 'immune' | 'resisted' | 'applied'
}

export class StatusEffectSystem {
  private static getStackLimit(
    def: ReturnType<typeof getStatusEffectDefinition>,
    effectKey?: StatusEffectEffectKey
  ): number | undefined {
    if (!def) return undefined
    if (effectKey) {
      const effectCap = def.effectStackCaps?.[effectKey]
      if (effectCap !== undefined) return effectCap
    }
    return def?.maxStack
  }

  private static clampStacks(stacks: number, limit?: number): number {
    if (limit === undefined) return stacks
    return Math.min(stacks, limit)
  }

  private static getEffectiveStacks(
    effect: StatusEffect,
    def: ReturnType<typeof getStatusEffectDefinition>,
    effectKey?: StatusEffectEffectKey
  ): number {
    const limit = this.getStackLimit(def, effectKey)
    return this.clampStacks(effect.stacks, limit)
  }

  private static statusImmunityAliases: Partial<Record<StatusEffectType, StatusEffectType[]>> = {
    burnDot: ['burn'],
    burnWeaken: ['burn'],
    frozenLock: ['frozen'],
    frozenGuard: ['frozen'],
    petrificationLock: ['petrification'],
    petrificationGuard: ['petrification'],
    sleepLock: ['sleep'],
    sleepVulnerable: ['sleep']
  }

  private static isImmune(target: CombatUnit, type: StatusEffectType): boolean {
    const traits = (target as any).traits
    const immunities: StatusEffectType[] | undefined = traits?.statusImmunities
    if (!immunities) return false
    if (immunities.includes(type)) return true
    const aliases = this.statusImmunityAliases[type]
    return aliases ? aliases.some(a => immunities.includes(a)) : false
  }

  private static applyCompositeEffects(
    target: CombatUnit,
    def: ReturnType<typeof getStatusEffectDefinition>,
    stacks: number,
    duration: number,
    appliedBy?: 'player' | 'enemy'
  ): ApplyStatusResult[] {
    const results: ApplyStatusResult[] = []
    if (!def?.compositeEffects) return results

    // 親効果の耐性を先に判定（全子に統一適用）
    const parentResistance = this.getStatusResistance(target, def)

    for (const child of def.compositeEffects) {
      if (this.isImmune(target, child.type)) {
        results.push({ type: child.type, applied: false, finalStacks: 0, finalDuration: 0, immunity: true, reason: 'immune' })
        continue
      }
      results.push(this.applyStatusEffect(target, child.type, stacks, duration, { allowComposite: false, appliedBy, parentResistance, fromComposite: true }))
    }
    return results
  }

  /**
   * 状態異常を付与する
   */
  static applyStatusEffect(
    target: CombatUnit,
    type: StatusEffectType,
    stacks: number,
    duration: number,
    opts: { allowComposite?: boolean; appliedBy?: 'player' | 'enemy'; parentResistance?: number; fromComposite?: boolean } = {}
  ): ApplyStatusResult {
    const def = getStatusEffectDefinition(type)
    if (!def) return { type, applied: false, finalStacks: 0, finalDuration: 0, reason: 'resisted' }

    if (def.allowDirectApply === false && !opts.fromComposite) {
      return { type, applied: false, finalStacks: 0, finalDuration: 0, reason: 'resisted' }
    }

    if (this.isImmune(target, type)) {
      return { type, applied: false, finalStacks: 0, finalDuration: 0, immunity: true, reason: 'immune' }
    }

    const rawDuration = def.maxDuration ? Math.min(duration, def.maxDuration) : duration

    if (opts.allowComposite !== false && def.compositeEffects?.length) {
      const childResults = this.applyCompositeEffects(target, def, stacks, rawDuration, opts.appliedBy)
      const appliedAny = childResults.some(r => r.applied)
      const resistance = childResults.find(r => r.resistance !== undefined)?.resistance
      const immunity = childResults.every(r => r.immunity)
      return {
        type,
        applied: appliedAny,
        finalStacks: appliedAny ? stacks : 0,
        finalDuration: appliedAny ? rawDuration : 0,
        resistance,
        immunity: immunity || undefined,
        reason: appliedAny ? 'applied' : 'resisted'
      }
    }

    // 子エフェクトの場合、親の耐性を使用
    const resistance = opts.parentResistance !== undefined ? opts.parentResistance : this.getStatusResistance(target, def)
    const resistMultiplier = Math.max(0, 1 - (resistance ?? 0) / 100)
    const effectiveDuration = Math.max(0, Math.round(rawDuration * resistMultiplier))

    const incomingStacks = this.clampStacks(stacks, def.maxStack)
    const reducedStacks = def.stackable ? Math.round(incomingStacks * resistMultiplier) : 1
    if ((def.stackable && reducedStacks <= 0) || effectiveDuration <= 0) {
      return { type, applied: false, finalStacks: 0, finalDuration: 0, resistance, reason: 'resisted' }
    }

    const existing = target.statusEffects.find(e => e.type === type)

    if (existing) {
      if (!def.stackable) {
        if (def.refreshRule === 'refresh') {
          existing.duration = Math.max(existing.duration, effectiveDuration)
        }
        existing.stacks = 1
        return { type, applied: true, finalStacks: existing.stacks, finalDuration: existing.duration, resistance, reason: 'applied' }
      }

      const updatedStacks = this.clampStacks(existing.stacks + reducedStacks, def.maxStack)
      switch (def.refreshRule) {
        case 'ignore':
          existing.stacks = updatedStacks
          return { type, applied: true, finalStacks: existing.stacks, finalDuration: existing.duration, resistance, reason: 'applied' }
        case 'refresh':
        case 'add':
        default:
          existing.stacks = updatedStacks
          existing.duration = Math.max(existing.duration, effectiveDuration)
          return { type, applied: true, finalStacks: existing.stacks, finalDuration: existing.duration, resistance, reason: 'applied' }
      }
    }

    const initialStacks = def.stackable ? reducedStacks : 1
    target.statusEffects.push({ type, stacks: initialStacks, duration: effectiveDuration, appliedBy: opts.appliedBy })
    return { type, applied: true, finalStacks: initialStacks, finalDuration: effectiveDuration, resistance, reason: 'applied' }
  }

  /**
   * 状態異常のダメージを処理する（ターン開始時）
   * @returns ダメージ量と説明文のリスト
   */
  static processStatusEffects(unit: CombatUnit): Array<{ damage: number; message: string; healTarget?: 'player' | 'enemy'; healAmount?: number }> {
    const results: Array<{ damage: number; message: string; healTarget?: 'player' | 'enemy'; healAmount?: number }> = []

    for (const effect of unit.statusEffects) {
      const def = getStatusEffectDefinition(effect.type)
      if (!def) continue

      const result = this.processEffect(unit, effect, def)
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
    effect: StatusEffect,
    def: ReturnType<typeof getStatusEffectDefinition>
  ): { damage: number; message: string; healTarget?: 'player' | 'enemy'; healAmount?: number } | null {
    if (!def) return null

    const dot = def.effects.damageOverTime
    if (dot?.enabled) {
      const stacks = this.getEffectiveStacks(effect, def, 'damageOverTime')
      const damagePerStack = dot.damagePerStack ?? 0
      const damage = stacks * damagePerStack
      if (damage > 0) {
        unit.currentHp = Math.max(0, unit.currentHp - damage)
        const healPercent = def.effects.lifeStealPercent ?? 0
        const healAmount = healPercent > 0 ? Math.round(damage * healPercent / 100) : 0
        const healTarget = healPercent > 0 ? effect.appliedBy : undefined
        return {
          damage,
          healTarget,
          healAmount: healPercent > 0 ? healAmount : undefined,
          message: `${unit.name}は${def.name}で${damage}ダメージ (${def.description})${healPercent > 0 ? ` / ${healAmount}吸収` : ''}`
        }
      }
    }

    return null
  }

  /**
   * 全ステータス修正値を合算
   */
  private static aggregateModifiers(unit: CombatUnit): {
    attack: number
    magic: number
    defense: number
    magicDefense: number
    speed: number
    damageTaken: number
    critChance: number
  } {
    const totals = {
      attack: 0,
      magic: 0,
      defense: 0,
      magicDefense: 0,
      speed: 0,
      damageTaken: 0,
      critChance: 0
    }

    for (const effect of unit.statusEffects) {
      const def = getStatusEffectDefinition(effect.type)
      if (!def) continue

      const stacksForAttack = this.getEffectiveStacks(effect, def, 'attackModifier')
      if (def.effects.attackModifier !== undefined) {
        totals.attack += def.effects.attackModifier * stacksForAttack
      }

      const stacksForMagic = this.getEffectiveStacks(effect, def, 'magicModifier')
      if (def.effects.magicModifier !== undefined) {
        totals.magic += def.effects.magicModifier * stacksForMagic
      }

      const stacksForDefense = this.getEffectiveStacks(effect, def, 'defenseModifier')
      if (def.effects.defenseModifier !== undefined) {
        totals.defense += def.effects.defenseModifier * stacksForDefense
      }

      const stacksForMagicDefense = this.getEffectiveStacks(effect, def, 'magicDefenseModifier')
      if (def.effects.magicDefenseModifier !== undefined) {
        totals.magicDefense += def.effects.magicDefenseModifier * stacksForMagicDefense
      }

      const stacksForSpeed = this.getEffectiveStacks(effect, def, 'speedModifier')
      if (def.effects.speedModifier !== undefined) {
        totals.speed += def.effects.speedModifier * stacksForSpeed
      }

      const stacksForDamageTaken = this.getEffectiveStacks(effect, def, 'damageTakenModifier')
      if (def.effects.damageTakenModifier !== undefined) {
        totals.damageTaken += def.effects.damageTakenModifier * stacksForDamageTaken
      }

      const stacksForCritChance = this.getEffectiveStacks(effect, def, 'critChanceModifier')
      if (def.effects.critChanceModifier !== undefined) {
        totals.critChance += def.effects.critChanceModifier * stacksForCritChance
      }
    }

    return totals
  }

  /**
   * 状態異常耐性（%）を取得。個別ID > カテゴリ > all の順で適用。
   */
  private static getStatusResistance(unit: CombatUnit, def: StatusEffectDefinition): number {
    const traits = (unit as any).traits as EnemyTraits | undefined
    const resMap = traits?.statusResistances
    if (!resMap) return 0

    const byId = resMap[def.id]
    if (byId !== undefined) return Math.max(0, byId)

    const byCategory = def.category === 'Control'
      ? resMap.control
      : def.category === 'Damage'
        ? resMap.damage
        : def.category === 'Modifier'
          ? resMap.modifier
          : undefined
    if (byCategory !== undefined) return Math.max(0, byCategory)

    const all = resMap.all
    return all ? Math.max(0, all) : 0
  }

  /**
   * 被ダメージ修正に寄与する状態異常の内訳を取得
   */
  static getDamageTakenBreakdown(unit: CombatUnit): {
    type: StatusEffectType
    modifier: number
    stacks: number
    total: number
  }[] {
    const breakdown: {
      type: StatusEffectType
      modifier: number
      stacks: number
      total: number
    }[] = []

    for (const effect of unit.statusEffects) {
      const def = getStatusEffectDefinition(effect.type)
      if (!def) continue

      const modifier = def.effects.damageTakenModifier
      if (modifier === undefined) continue

      const stacks = this.getEffectiveStacks(effect, def, 'damageTakenModifier')
      const total = modifier * stacks
      if (total === 0) continue

      breakdown.push({
        type: effect.type,
        modifier,
        stacks,
        total
      })
    }

    return breakdown
  }

  /**
   * 反射ダメージ割合（%）を合算
   */
  static getReflectPercent(unit: CombatUnit): number {
    let total = 0
    for (const effect of unit.statusEffects) {
      const def = getStatusEffectDefinition(effect.type)
      if (!def?.effects.reflectPercent) continue
      const stacks = this.getEffectiveStacks(effect, def, 'reflectPercent')
      total += def.effects.reflectPercent * stacks
    }
    return total
  }

  /**
   * ステータスごとの修正値（%）を取得
   * UI 表示用に公開。攻撃/魔力/防御/魔防/速度のみを返す。
   */
  static getStatModifiers(unit: CombatUnit): {
    attack: number
    magic: number
    defense: number
    magicDefense: number
    speed: number
  } {
    const totals = this.aggregateModifiers(unit)
    return {
      attack: totals.attack,
      magic: totals.magic,
      defense: totals.defense,
      magicDefense: totals.magicDefense,
      speed: totals.speed
    }
  }

  /**
   * ステータス修正の内訳を取得（UI用）
   */
  static getStatModifierEntries(
    unit: CombatUnit,
    stat: 'attack' | 'magic' | 'defense' | 'magicDefense' | 'speed'
  ): Array<{ type: StatusEffectType; percent: number; stacks: number; stacksUsed: number }> {
    const effectKeyMap: Record<'attack' | 'magic' | 'defense' | 'magicDefense' | 'speed', StatusEffectEffectKey> = {
      attack: 'attackModifier',
      magic: 'magicModifier',
      defense: 'defenseModifier',
      magicDefense: 'magicDefenseModifier',
      speed: 'speedModifier'
    }

    const effectKey = effectKeyMap[stat]
    const entries: Array<{ type: StatusEffectType; percent: number; stacks: number; stacksUsed: number }> = []

    for (const effect of unit.statusEffects) {
      const def = getStatusEffectDefinition(effect.type)
      if (!def) continue
      const modifier = def.effects[effectKey]
      if (modifier === undefined || modifier === 0) continue

      const stacksUsed = this.getEffectiveStacks(effect, def, effectKey)
      if (stacksUsed === 0) continue

      entries.push({
        type: effect.type,
        percent: (modifier as number) * stacksUsed,
        stacks: effect.stacks,
        stacksUsed
      })
    }

    return entries
  }

  /**
   * 状態異常による攻撃力の減少を計算
   */
  static getAttackModifier(unit: CombatUnit): number {
    const totals = this.aggregateModifiers(unit)
    return Math.max(0, 1 + totals.attack / 100)
  }

  /**
   * 被ダメージ修正の合計（%）
   */
  static getDamageTakenModifier(unit: CombatUnit): number {
    const totals = this.aggregateModifiers(unit)
    return totals.damageTaken
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
   * 数値概要を自動で生成（numbers未指定の場合のフォールバック）
   */
  private static buildNumberSummary(def: ReturnType<typeof getStatusEffectDefinition>): string {
    if (!def) return ''
    const { effects } = def
    const parts: string[] = []
    const perStack = def.stackable ? '/スタック' : ''
    const addPct = (label: string, value?: number) => {
      if (value === undefined) return
      const sign = value > 0 ? '+' : ''
      parts.push(`${label} ${sign}${value}%${perStack}`)
    }

    if (effects.damageOverTime?.enabled) {
      const dmg = effects.damageOverTime.damagePerStack ?? 0
      parts.push(`DoT ${dmg} /T${perStack}`)
    }

    addPct('攻撃', effects.attackModifier)
    addPct('魔法', effects.magicModifier)
    addPct('物理防御', effects.defenseModifier)
    addPct('魔法防御', effects.magicDefenseModifier)
    addPct('速度', effects.speedModifier)
    addPct('被ダメ', effects.damageTakenModifier)

    if (effects.reflectPercent !== undefined) {
      const sign = effects.reflectPercent > 0 ? '+' : ''
      parts.push(`反射 ${sign}${effects.reflectPercent}%${perStack}`)
    }

    if (def.stackable && def.maxStack) {
      parts.push(`最大${def.maxStack}スタック`)
    }

    return parts.join(' / ')
  }

  /**
   * 状態異常の説明を取得（ツールチップ用）
   */
  static getStatusDescription(type: StatusEffectType): string {
    const def = getStatusEffectDefinition(type)
    if (!def) return '不明な状態異常'

    const flavor = def.flavor || def.description
    const mechanics = def.mechanics || def.description
    const numbers = def.numbers || this.buildNumberSummary(def)

    const parts: string[] = []
    if (flavor) parts.push(`🎭 ${flavor}`)
    if (mechanics) parts.push(`🎯 効果: ${mechanics}`)
    if (numbers) parts.push(`📊 数値: ${numbers}`)

    return parts.join('<br>')
  }

  /**
   * 状態異常の名前を取得
   */
  static getStatusName(type: StatusEffectType): string {
    const def = getStatusEffectDefinition(type)
    return def ? def.name : type
  }

  /**
   * 行動不能状態かチェック（stun, frozen, sleep, petrification）
   */
  static cannotAct(unit: CombatUnit): boolean {
    return unit.statusEffects.some(effect => {
      const def = getStatusEffectDefinition(effect.type)
      return def?.effects.cannotAct && this.getEffectiveStacks(effect, def) > 0
    })
  }

  /**
   * ダメージ修正を適用（weak, fear, vulnerable）
   */
  static applyDamageModifiers(unit: CombatUnit, baseDamage: number): number {
    const modifier = this.getAttackModifier(unit)
    return Math.round(baseDamage * modifier)
  }

  /**
   * 被ダメージ修正を適用（vulnerable, sleep, frozen, petrification）
   */
  static applyVulnerabilityModifier(unit: CombatUnit, incomingDamage: number): number {
    const totals = this.aggregateModifiers(unit)
    const multiplier = 1 + totals.damageTaken / 100
    return Math.round(Math.max(0, incomingDamage * multiplier))
  }
}
