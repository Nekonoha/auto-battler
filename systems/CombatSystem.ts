import type { Player, Enemy, CombatLogEntry, Weapon, EnemyTier, EnemyAction, EnemyActionEffect, StatusEffectType } from '../types'
import { WeaponSystem } from './WeaponSystem'
import { StatusEffectSystem } from './StatusEffectSystem'
import { getStatusEffectDefinition } from '../data/statusEffects'
import { DamageSystem } from './DamageSystem'
import { calculateActiveSynergies, getTotalSynergyBonus } from '../data/synergies'
import { calculateEnemyLevelForDungeon } from '../utils/levelScaling'
import { getEnemyTemplateByNameOrId, getRandomEnemyTemplate } from '../data/enemies'
import type { EnemyTemplate } from '../data/enemies'

/**
 * 戦闘システム
 * ターン制バトルのメインロジックを管理
 */
export class CombatSystem {
  private player: Player
  private enemy: Enemy
  private turnCount: number
  private combatLog: CombatLogEntry[]
  private isFinished: boolean
  private synergyBonus: ReturnType<typeof getTotalSynergyBonus> | null = null

  constructor(player: Player, enemy: Enemy) {
    this.player = player
    this.enemy = enemy
    this.turnCount = 0
    this.combatLog = []
    this.isFinished = false
    this.applySynergyBonuses()
  }

  /**
   * 装備武器のタグからシナジーを計算し、プレイヤーのステータスにボーナスを適用
   */
  private applySynergyBonuses() {
    const weaponTags = this.player.weapons.map(w => w.tags)
    const activeSynergies = calculateActiveSynergies(weaponTags)
    
    if (activeSynergies.length > 0) {
      this.synergyBonus = getTotalSynergyBonus(activeSynergies)
      
      // シナジーログを追加
      activeSynergies.forEach(synergy => {
        this.addLog(`シナジー発動: ${synergy.name}`, 'info')
      })
      
      // シナジーボーナスはWeaponSystem.attack内で計算時に反映される
      // (元のステータスは変更しない)
    }
  }

  /**
   * 戦闘ログを取得
   */
  getCombatLog(): CombatLogEntry[] {
    return this.combatLog
  }

  getLastDefeatInsights(): string[] {
    return []
  }

  /**
   * 戦闘が終了しているか
   */
  isGameOver(): boolean {
    return this.isFinished
  }

  /**
   * プレイヤーが勝利したか
   */
  isPlayerVictory(): boolean {
    return this.isFinished && this.enemy.currentHp <= 0
  }

  /**
   * 1ターンを実行
   */
  executeTurn(): void {
    if (this.isFinished) return

    this.turnCount++
    this.addLog(`--- ターン ${this.turnCount} ---`, 'info')

    // 1. 状態異常ダメージ処理
    this.processStatusEffectPhase()

    // 戦闘終了チェック
    if (this.checkBattleEnd()) return

    // 2. プレイヤーの攻撃フェーズ
    this.playerAttackPhase()

    // 戦闘終了チェック
    if (this.checkBattleEnd()) return

    // 3. 敵の攻撃フェーズ
    this.enemyAttackPhase()

    // 戦闘終了チェック
    this.checkBattleEnd()
  }

  /**
   * 状態異常ダメージフェーズ
   */
  private processStatusEffectPhase(): void {
    // プレイヤーの状態異常処理
    const playerEffectsBefore = this.player.statusEffects.map(e => e.type)
    const playerEffects = StatusEffectSystem.processStatusEffects(this.player)
    playerEffects.forEach(result => {
      if (result.damage > 0) {
        this.addLog(result.message, 'damage')
        if (result.healTarget === 'player' && result.healAmount) {
          this.player.currentHp = Math.min(this.player.maxHp, this.player.currentHp + result.healAmount)
          this.addLog(`プレイヤーは${result.healAmount}回復した`, 'status')
        }
        if (result.healTarget === 'enemy' && result.healAmount) {
          this.enemy.currentHp = Math.min(this.enemy.maxHp, this.enemy.currentHp + result.healAmount)
          this.addLog(`${this.enemy.name}は${result.healAmount}回復した`, 'status')
        }
      } else {
        this.addLog(result.message, 'status')
      }
    })
    // 解除された状態異常をログ出力
    const playerEffectsAfter = this.player.statusEffects.map(e => e.type)
    playerEffectsBefore.forEach(type => {
      if (!playerEffectsAfter.includes(type)) {
        const removed = ['stun', 'sleep', 'frozen', 'petrification'].includes(type)
        if (removed) {
          const statusName = StatusEffectSystem.getStatusName(type as any)
          this.addLog(`${this.player.name}は${statusName}から回復した！`, 'status', 'player', 'defend')
        }
      }
    })

    // 敵の状態異常処理
    const enemyEffectsBefore = this.enemy.statusEffects.map(e => e.type)
    const enemyEffects = StatusEffectSystem.processStatusEffects(this.enemy)
    enemyEffects.forEach(result => {
      if (result.damage > 0) {
        this.addLog(result.message, 'damage')
        if (result.healTarget === 'player' && result.healAmount) {
          this.player.currentHp = Math.min(this.player.maxHp, this.player.currentHp + result.healAmount)
          this.addLog(`プレイヤーは${result.healAmount}回復した`, 'status')
        }
        if (result.healTarget === 'enemy' && result.healAmount) {
          this.enemy.currentHp = Math.min(this.enemy.maxHp, this.enemy.currentHp + result.healAmount)
          this.addLog(`${this.enemy.name}は${result.healAmount}回復した`, 'status')
        }
      } else {
        this.addLog(result.message, 'status')
      }
    })
    // 解除された状態異常をログ出力
    const enemyEffectsAfter = this.enemy.statusEffects.map(e => e.type)
    enemyEffectsBefore.forEach(type => {
      if (!enemyEffectsAfter.includes(type)) {
        const removed = ['stun', 'sleep', 'frozen', 'petrification'].includes(type)
        if (removed) {
          const statusName = StatusEffectSystem.getStatusName(type as any)
          this.addLog(`${this.enemy.name}は${statusName}から回復した！`, 'status')
        }
      }
    })
  }

  /**
   * プレイヤー攻撃フェーズ
   */
  private playerAttackPhase(): void {
    // 行動不能状態チェック
    const cannotAct = StatusEffectSystem.cannotAct(this.player)
    if (cannotAct) {
      this.addLog(`${this.player.name}は行動できない！`, 'status', 'player', 'defend')
      return
    }

    if (this.player.weapons.length === 0) {
      this.addLog(`${this.player.name}は武器を装備していない！`, 'info', 'player', 'attack')
      return
    }

    // 1. 装備している全ての武器で攻撃（1ターンで全武器使用）
    for (const weapon of this.player.weapons) {
      if (this.enemy.currentHp <= 0) break

      // 速度に応じた手数を計算（最低1回、最大4回）
      const swings = Math.min(4, Math.max(1, Math.floor(Math.max(0, weapon.stats.speed) / 20) + 1))

      for (let i = 1; i <= swings; i++) {
        if (this.enemy.currentHp <= 0) break

        const result = WeaponSystem.attack(weapon, this.player, this.enemy, this.synergyBonus)

        // 攻撃無効化のログ
        if (result.blocked) {
          this.addLog(
            `${weapon.name} の攻撃は無効化された！ (${weapon.type}攻撃無効)`,
            'info'
          )
          continue
        }

        let message = `${this.player.name}は ${weapon.name} (${i}/${swings}) で攻撃！ ${result.damage}ダメージ`
        
        // 耐性適用のログ
        if (result.resistanceApplied && result.resistanceApplied > 0) {
          message += ` (耐性${result.resistanceApplied}%)`
        }
        
        // 被ダメージ修正をログに反映
        const damageTakenLog = this.formatDamageTakenLog(this.enemy)
        if (damageTakenLog) {
          message += ` ${damageTakenLog}`
        }
        
        if (result.isCritical) {
          message += ' クリティカル！'
          this.addLog(message, 'critical', 'player', 'attack')
        } else {
          this.addLog(message, 'damage', 'player', 'attack')
        }

        // ライフスティール効果（物理・魔法攻撃のみ、状態異常ダメージは対象外）
        const totalLifeSteal = (weapon.stats.lifeSteal ?? 0) + (this.synergyBonus?.lifeStealBonus ?? 0)
        if (totalLifeSteal > 0 && result.actualDamageInflicted) {
          const healAmount = Math.floor(result.actualDamageInflicted * (totalLifeSteal / 100))
          if (healAmount > 0) {
            this.player.currentHp = Math.min(this.player.maxHp, this.player.currentHp + healAmount)
            this.addLog(`${this.player.name}は${healAmount}のHPを吸収した！`, 'buff', 'player', 'attack')
          }
        }

        // 反射ダメージ処理（敵が棘の鎧などを持つ場合）
        this.applyReflection(this.enemy, this.player, result.damage)

        // ダメージを受けたことで breakOnDamage 効果を除去（睡眠系など）
        const beforeCount = this.enemy.statusEffects.length
        this.enemy.statusEffects = this.enemy.statusEffects.filter(e => {
          const def = getStatusEffectDefinition(e.type as any)
          return !def?.effects.breakOnDamage
        })
        if (this.enemy.statusEffects.length < beforeCount) {
          this.addLog(`${this.enemy.name}は眠りから目覚めた！`, 'status')
        }

        // 状態異常付与を即時処理（バフは自分、デバフは敵）
        this.applyResultEffects(result.statusEffects, this.player, this.enemy, 'player')
      }
    }
  }

  /**
   * 敵攻撃フェーズ
   */
  /**
   * 敵の行動を選択（重み付けランダム）
   */
  private chooseEnemyAction(): EnemyAction {
    const actionPool = this.enemy.actionPool || []
    
    // actionPool が空の場合はエラー（テンプレートに必ずactionPoolを設定すること）
    if (actionPool.length === 0) {
      console.warn(`Enemy ${this.enemy.name} has no actionPool defined, defaulting to attack`)
      return { type: 'attack' as const, weight: 1 }
    }
    
    // 重みの合計を計算
    const totalWeight = actionPool.reduce((sum, action) => sum + action.weight, 0)
    let random = Math.random() * totalWeight
    
    // 重み付けランダムで行動を選択
    for (const action of actionPool) {
      random -= action.weight
      if (random <= 0) {
        return action as EnemyAction
      }
    }
    
    return actionPool[0] as EnemyAction
  }

  private enemyAttackPhase(): void {
    if (this.enemy.currentHp <= 0) return

    // 行動不能状態チェック
    const cannotAct = StatusEffectSystem.cannotAct(this.enemy)
    if (cannotAct) {
      this.addLog(`${this.enemy.name}は行動できない！`, 'status')
      return
    }

    // 敵の速度に応じた攻撃回数（最低1回、最大3回）
    const numAttacks = Math.min(3, Math.max(1, Math.floor(Math.max(0, this.enemy.stats.speed) / 25)))
    
    // 1. 敵の行動フェーズを実行
    for (let i = 1; i <= numAttacks; i++) {
      if (this.player.currentHp <= 0) break

      const action = this.chooseEnemyAction()
      
      const actionName = action.name || (action.type === 'attack' ? '攻撃' : action.type === 'defend' ? '防御' : action.type === 'nothing' ? '様子見' : '行動')

      switch (action.type) {
        case 'attack': {
          // 敵の基本攻撃（物理/魔法属性を考慮）
          const isPhysical = action.attackType !== 'magic'  // デフォルトは物理
          const baseDamage = isPhysical ? Math.max(0, this.enemy.stats.attack) : Math.max(0, this.enemy.stats.magic)
          
          // weak/fearによるダメージ減少
          let finalBaseDamage = StatusEffectSystem.applyDamageModifiers(this.enemy, baseDamage)
          
          const variance = 0.8 + Math.random() * 0.4 // 80%～120%のランダム性
          const attackDamage = finalBaseDamage * variance
          
          // 武器traitsボーナスを取得
          const weaponTraitsBonus = WeaponSystem.getWeaponTraitsBonus(this.player.weapons)
          const damageResult = DamageSystem.calculatePlayerDamageWithTraits(attackDamage, this.player, !isPhysical, weaponTraitsBonus)
          let finalDamage = damageResult.damage
          finalDamage = StatusEffectSystem.applyVulnerabilityModifier(this.player, finalDamage)

          this.player.currentHp = Math.max(0, this.player.currentHp - finalDamage)

          let message = numAttacks > 1 
            ? `${this.enemy.name}の${actionName} (${i}/${numAttacks})！ ${finalDamage}ダメージ`
            : `${this.enemy.name}の${actionName}！ ${finalDamage}ダメージ`

          // ライフスティール処理（攻撃アクション時）
          if (action.lifeStealPercent && action.lifeStealPercent > 0 && finalDamage > 0) {
            const healAmount = Math.floor(finalDamage * (action.lifeStealPercent / 100))
            if (healAmount > 0) {
              this.enemy.currentHp = Math.min(this.enemy.maxHp, this.enemy.currentHp + healAmount)
              message += ` 🩸${healAmount}HP吸収`
            }
          }

          // 軽減情報をログに追加
          if (damageResult.reductionInfo.totalReduction > 0) {
            const reductions: string[] = []
            if (damageResult.reductionInfo.physicalResistanceApplied > 0) {
              reductions.push(`物理耐性${damageResult.reductionInfo.physicalResistanceApplied}%`)
            }
            if (damageResult.reductionInfo.magicalResistanceApplied > 0) {
              reductions.push(`魔法耐性${damageResult.reductionInfo.magicalResistanceApplied}%`)
            }
            if (damageResult.reductionInfo.damageReductionApplied > 0) {
              reductions.push(`ダメージ軽減${damageResult.reductionInfo.damageReductionApplied}%`)
            }
            if (reductions.length > 0) {
              const reducedAmount = Math.round(damageResult.reductionInfo.totalReduction)
              message += ` (${reductions.join('、')}で${reducedAmount}軽減)`
            }
          }

          const damageTakenLog = this.formatDamageTakenLog(this.player)
          if (damageTakenLog) {
            message += ` ${damageTakenLog}`
          }

          this.addLog(message, 'damage', 'enemy', 'attack')

          // 反射ダメージ処理（プレイヤーが棘の鎧などを持つ場合）
          this.applyReflection(this.player, this.enemy, finalDamage)

          // ダメージを受けたことで breakOnDamage 効果を除去（睡眠系など）
          const beforeCount = this.player.statusEffects.length
          this.player.statusEffects = this.player.statusEffects.filter(e => {
            const def = getStatusEffectDefinition(e.type as any)
            return !def?.effects.breakOnDamage
          })
          if (this.player.statusEffects.length < beforeCount) {
            this.addLog('プレイヤーは眠りから目覚めた！', 'status')
          }
          break
        }
        case 'defend': {
          this.addLog(`${this.enemy.name}は${actionName}の構えをとった！`, 'status')
          // 敵に防御バフを付与（次のターン分として）
          const statusPowerMultiplier = this.getStatusPowerMultiplier(this.enemy)
          const stacks = this.scaleStatusValue(2, statusPowerMultiplier)
          const duration = this.scaleStatusValue(1, statusPowerMultiplier)
          StatusEffectSystem.applyStatusEffect(this.enemy, 'armor', stacks, duration, { appliedBy: 'enemy', powerScale: statusPowerMultiplier })
          break
        }
        case 'status': {
          // 敵がバフを付与する行動（ランダムに複数のバフから選択）
          const buffOptions: Array<{ type: StatusEffectType; stacks: number; duration: number }> = [
            { type: 'power', stacks: 1, duration: 2 },
            { type: 'intellect', stacks: 1, duration: 2 },
            { type: 'armor', stacks: 2, duration: 2 },
            { type: 'fleet', stacks: 1, duration: 2 }
          ]
          const selectedBuff = buffOptions[Math.floor(Math.random() * buffOptions.length)]
          const statusPowerMultiplier = this.getStatusPowerMultiplier(this.enemy)
          const scaledStacks = this.scaleStatusValue(selectedBuff.stacks, statusPowerMultiplier)
          const scaledDuration = this.scaleStatusValue(selectedBuff.duration, statusPowerMultiplier)
          const result = StatusEffectSystem.applyStatusEffect(
            this.enemy,
            selectedBuff.type,
            scaledStacks,
            scaledDuration,
            { appliedBy: 'enemy', powerScale: statusPowerMultiplier }
          )
          const icon = StatusEffectSystem.getStatusIcon(selectedBuff.type)
          const statusName = this.getStatusName(selectedBuff.type)
          
          if (result.applied) {
            const resistNote = result.resistance ? ` (耐性${result.resistance}%で軽減)` : ''
            this.addLog(`${this.enemy.name}は${icon}${statusName}を得た！${resistNote}`, 'status')
          } else {
            this.addLog(`${this.enemy.name}の${icon}${statusName}は効果がなかった。`, 'status')
          }
          break
        }
        case 'nothing': {
          this.addLog(`${this.enemy.name}は${actionName}を選択した。`, 'status')
          break
        }
      }
    }
  }

  private applyResultEffects(effects: Weapon['effects'], attacker: Player | Enemy, target: Player | Enemy, appliedBy: 'player' | 'enemy') {
    effects.forEach(effect => {
      const powerScale = (effect as any).powerScale ?? 1
      const def = getStatusEffectDefinition(effect.type as any)
      const defaultRecipient = def?.type === 'Buff' ? attacker : target
      const recipient = effect.target === 'self' ? attacker : effect.target === 'enemy' ? target : defaultRecipient
      const result = StatusEffectSystem.applyStatusEffect(recipient, effect.type, effect.stacks, effect.duration, { appliedBy, powerScale })
      const icon = StatusEffectSystem.getStatusIcon(effect.type)
      const targetName = recipient === attacker ? (appliedBy === 'player' ? 'プレイヤー' : this.enemy.name) : (appliedBy === 'player' ? this.enemy.name : 'プレイヤー')
      if (result.applied) {
        const resistNote = result.resistance ? ` (耐性${result.resistance}%で軽減)` : ''
        this.addLog(`${targetName}に${icon}${this.getStatusName(effect.type)}を付与した！${resistNote}`, 'status')
      } else {
        this.addLog(this.formatStatusResistedLog(targetName, result), 'status')
      }
    })
  }

  /**
   * 被ダメージ修正のログ文字列を生成（ダメージ反映系のみ）
   */
  private formatDamageTakenLog(target: Player | Enemy): string | null {
    const breakdown = StatusEffectSystem.getDamageTakenBreakdown(target)
    if (breakdown.length === 0) return null

    const formatPercent = (value: number) => {
      const rounded = Math.round(value * 10) / 10
      return Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1)
    }

    const totalRaw = breakdown.reduce((sum, b) => sum + b.total, 0)
    const total = formatPercent(totalRaw)
    const sign = totalRaw > 0 ? '+' : ''
    const detail = breakdown
      .map(b => {
        const name = this.getStatusName(b.type)
        const icon = StatusEffectSystem.getStatusIcon(b.type)
        const stacks = b.stacks > 1 ? `x${b.stacks}` : ''
        const modSign = b.total > 0 ? '+' : ''
        return `${icon}${name}${stacks}(${modSign}${formatPercent(b.total)}%)`
      })
      .join(', ')

    return `【被ダメージ${sign}${total}%: ${detail}】`
  }

  private applyReflection(defender: Player | Enemy, attacker: Player | Enemy, damageDealt: number) {
    if (damageDealt <= 0) return
    const reflectPercent = StatusEffectSystem.getReflectPercent(defender)
    if (reflectPercent <= 0) return
    const reflected = Math.round(damageDealt * reflectPercent / 100)
    if (reflected <= 0) return
    attacker.currentHp = Math.max(0, attacker.currentHp - reflected)
    const defenderName = 'name' in defender ? defender.name : '防御側'
    const attackerName = 'name' in attacker ? attacker.name : '攻撃側'
    this.addLog(`${defenderName}の反射で${attackerName}は${reflected}ダメージを受けた`, 'damage')
  }

  private getStatusPowerMultiplier(unit: Player | Enemy): number {
    const raw = (unit as any)?.stats?.statusPower ?? 0
    return Math.max(0, 1 + raw / 100)
  }

  private scaleStatusValue(value: number, multiplier: number): number {
    return Math.max(1, Math.floor(value * multiplier))
  }

  /**
   * 戦闘終了判定
   */
  private checkBattleEnd(): boolean {
    if (this.player.currentHp <= 0) {
      this.isFinished = true
      this.addLog(`${this.player.name}は倒れた...`, 'info', 'player', 'defend')
      return true
    }

    if (this.enemy.currentHp <= 0) {
      this.isFinished = true
      this.addLog(`${this.enemy.name}を倒した！勝利！`, 'info')
      return true
    }

    return false
  }

  /**
   * ログに追加（拡張版：actor と actionCategory を指定可能）
   */
  private addLog(
    message: string,
    type: CombatLogEntry['type'],
    actor?: 'player' | 'enemy',
    actionCategory?: 'attack' | 'defend' | 'skill' | 'special'
  ): void {
    this.combatLog.push({
      turn: this.turnCount,
      message,
      type,
      actor,
      actionCategory
    })
  }

  /**
   * 状態異常の名前を取得
   */
  private getStatusName(type: string): string {
    return StatusEffectSystem.getStatusName(type as any)
  }

  /**
   * 状態異常が耐性/無効で弾かれた際のログ文字列
   */
  private formatStatusResistedLog(targetName: string, result: any): string {
    const icon = StatusEffectSystem.getStatusIcon(result.type)
    const name = this.getStatusName(result.type)
    if (result.immunity) {
      return `${targetName}は${icon}${name}を無効化した！`
    }
    const resistText = result.resistance !== undefined ? `耐性${result.resistance}%` : '耐性'
    return `${targetName}は${resistText}で${icon}${name}を弾いた！`
  }

  /**
   * 新しい敵を生成
   */
  static generateEnemy(level: number = 1, opts?: {
    playerLevel?: number
    dungeonName?: string
    dungeonLevelRange?: [number, number]
    tierWeights?: Partial<Record<Enemy['tier'], number>>
    levelMultiplier?: number
    forcedTier?: Enemy['tier']
    enemyPool?: string[]
    bossId?: string
    debugMode?: boolean
    debugTemplateId?: string
  }): Enemy {
    if (opts?.debugMode) {
      if (!opts.debugTemplateId) {
        const hp = 5_000_000
        return {
          name: '【DEBUG】無害なスパーリング相手',
          level,
          maxHp: hp,
          currentHp: hp,
          statusEffects: [],
          tier: 'boss',
          stats: {
            attack: 9999,
            magic: 9999,
            defense: 9999,
            magicDefense: 9999,
            speed: 10,
            statusPower: 0,
            lifeSteal: 0
          },
          actionPool: [
            { type: 'nothing', weight: 1 }
          ]
        }
      }

      const template = opts.debugTemplateId ? getEnemyTemplateByNameOrId(opts.debugTemplateId) : null
      if (!template) {
        const hp = 5_000_000
        return {
          name: '【DEBUG】無害なスパーリング相手',
          level,
          maxHp: hp,
          currentHp: hp,
          statusEffects: [],
          tier: 'boss',
          stats: {
            attack: 9999,
            magic: 9999,
            defense: 9999,
            magicDefense: 9999,
            speed: 10,
            statusPower: 0,
            lifeSteal: 0
          },
          actionPool: [
            { type: 'nothing', weight: 1 }
          ]
        }
      }

      // デバッグ用テンプレートをそのまま生成（ボス相当の耐久）
      const templateLevel = Math.max(1, Math.min(1000, level))
      const tier: Enemy['tier'] = 'boss'
      const tierStatMultiplier: Record<EnemyTier, number> = { normal: 1, elite: 1.18, named: 1.35, boss: 1.55 }
      const tierHpMultiplier: Record<EnemyTier, number> = { normal: 1, elite: 1.25, named: 1.5, boss: 1.8 }
      const levelStatGrowth = 1 + (templateLevel - 1) * 0.08
      const levelHpGrowth = 1 + (templateLevel - 1) * 0.12
      const statMult = tierStatMultiplier[tier]
      const hpMult = tierHpMultiplier[tier]
      const scale = (base: number) => Math.max(1, Math.round(base * levelStatGrowth * statMult))
      const statusPowerBase = template.baseStats.statusPower ?? 0
      const lifeStealBase = template.baseStats.lifeSteal ?? 0
      const scaledStats = {
        attack: scale(template.baseStats.attack),
        magic: scale(template.baseStats.magic),
        defense: scale(template.baseStats.defense),
        magicDefense: scale(template.baseStats.magicDefense),
        speed: Math.max(1, Math.round(template.baseStats.speed * (1 + (templateLevel - 1) * 0.04) * statMult)),
        statusPower: Math.max(0, Math.round(statusPowerBase * levelStatGrowth * statMult)),
        lifeSteal: Math.max(0, Math.round(lifeStealBase * levelStatGrowth * 10) / 10)
      }
      const baseHp = 70 * template.baseStats.hpMultiplier
      const hp = Math.max(30, Math.floor(baseHp * levelHpGrowth * hpMult))

      const actionPool = (() => {
        const basePool: EnemyAction[] = [
          { type: 'attack', weight: 4, name: '通常攻撃' },
          { type: 'defend', weight: 2, name: '防御' },
          { type: 'nothing', weight: 1, name: '様子を見る' }
        ]
        const actions = (template.actionPool ?? []).map(action => {
          const cloned: EnemyAction = {
            ...action,
            weight: Math.max(1, action.weight ?? 1),
            effects: action.effects?.map(e => ({ ...e }))
          }
          if (cloned.type === 'status') {
            cloned.weight = Math.max(1, cloned.weight * 5) // ボス相当の付与頻度
          }
          return cloned
        })
        return actions.length ? [...basePool, ...actions] : basePool
      })()

      return {
        name: `【DEBUG】${template.baseName}`,
        level: templateLevel,
        maxHp: hp,
        currentHp: hp,
        statusEffects: [],
        tier,
        type: template.type,
        traits: template.traits,
        stats: scaledStats,
        actionPool
      }
    }
    // プレイヤーレベルを考慮した敵レベルの計算
    let actualLevel = level
    if (opts?.playerLevel && opts?.dungeonLevelRange) {
      const predicted = calculateEnemyLevelForDungeon(opts.playerLevel, opts.dungeonLevelRange)
      const dungeonMid = Math.round((opts.dungeonLevelRange[0] + opts.dungeonLevelRange[1]) / 2)
      // ステージレベル, 推奨レンジ中央値, プレイヤー基準の平均を取って底上げ
      actualLevel = Math.max(level, Math.round((predicted + dungeonMid + level) / 3))
    }
    actualLevel = Math.max(1, Math.min(1000, actualLevel))

    // エリート/ネームド/ボスの抽選（forcedTierがあれば優先）
    let tier: Enemy['tier'] = 'normal'
    if (opts?.forcedTier) {
      tier = opts.forcedTier
    } else {
      const weights = {
        normal: opts?.tierWeights?.normal ?? 0.65,
        elite: opts?.tierWeights?.elite ?? 0.2,
        named: opts?.tierWeights?.named ?? 0.15,
        boss: opts?.tierWeights?.boss ?? 0
      }
      const total = weights.normal + weights.elite + weights.named + weights.boss
      let r = Math.random() * total
      if (r < weights.normal) {
        tier = 'normal'
      } else if (r < weights.normal + weights.elite) {
        tier = 'elite'
      } else if (r < weights.normal + weights.elite + weights.named) {
        tier = 'named'
      } else {
        tier = 'boss'
      }
    }

    // レアメタル枠：強制ボス/プール/デバッグがない通常抽選のみ
    let template: EnemyTemplate | null = null
    if (!opts?.debugMode && !opts?.bossId && !opts?.enemyPool && !opts?.forcedTier) {
      const metalChance = 0.03
      if (Math.random() < metalChance) {
        const metal = getEnemyTemplateByNameOrId('metal_slime')
        if (metal) {
          template = metal
          tier = 'named'
        }
      }
    }

    const tierNamePrefix = tier === 'boss' ? '【ボス】' : tier === 'named' ? '【ネームド】' : tier === 'elite' ? 'エリート' : ''

    // テンプレート選択
    const pool = (tier === 'boss' && opts?.bossId)
      ? [opts.bossId]
      : (opts?.enemyPool && opts.enemyPool.length ? opts.enemyPool : undefined)

    if (!template) {
      template = (() => {
        if (pool) {
          const pick = pool[Math.floor(Math.random() * pool.length)]
          const found = getEnemyTemplateByNameOrId(pick)
          if (found) return found
        }
        return getRandomEnemyTemplate()
      })()
    }

    const tierStatMultiplier: Record<EnemyTier, number> = {
      normal: 1.0,
      elite: 1.18,
      named: 1.35,
      boss: 1.55
    }
    const tierHpMultiplier: Record<EnemyTier, number> = {
      normal: 1.0,
      elite: 1.25,
      named: 1.5,
      boss: 1.8
    }

    const levelStatGrowth = 1 + (actualLevel - 1) * 0.08
    const levelHpGrowth = 1 + (actualLevel - 1) * 0.12
    const statMult = tierStatMultiplier[tier]
    const hpMult = tierHpMultiplier[tier]
    const levelScale = opts?.levelMultiplier ?? 1

    const scale = (base: number) => Math.max(1, Math.round(base * levelStatGrowth * statMult))

    const statusPowerBase = template.baseStats.statusPower ?? 0
    const lifeStealBase = template.baseStats.lifeSteal ?? 0
    const scaledStats = {
      attack: scale(template.baseStats.attack),
      magic: scale(template.baseStats.magic),
      defense: scale(template.baseStats.defense),
      magicDefense: scale(template.baseStats.magicDefense),
      speed: Math.max(1, Math.round(template.baseStats.speed * (1 + (actualLevel - 1) * 0.04) * statMult)),
      statusPower: Math.max(0, Math.round(statusPowerBase * levelStatGrowth * statMult * levelScale)),
      lifeSteal: Math.max(0, Math.round(lifeStealBase * levelStatGrowth * levelScale * 10) / 10)
    }

    const baseHp = 70 * template.baseStats.hpMultiplier
    const hp = Math.max(30, Math.floor(baseHp * levelHpGrowth * hpMult * levelScale))

    // 強敵は行動不能系に強耐性、その他デバフも軽減
    const controlResistByTier: Record<EnemyTier, number> = {
      normal: 0,
      elite: 50,
      named: 70,
      boss: 85
    }
    const debuffResistByTier: Record<EnemyTier, number> = {
      normal: 0,
      elite: 20,
      named: 35,
      boss: 50
    }
    const statusResistances = {
      ...(template.traits?.statusResistances ?? {})
    }
    const controlResist = controlResistByTier[tier]
    if (controlResist > 0 && statusResistances.control === undefined) {
      statusResistances.control = controlResist
    }
    const debuffResist = debuffResistByTier[tier]
    if (debuffResist > 0) {
      if (statusResistances.damage === undefined) statusResistances.damage = debuffResist
      if (statusResistances.modifier === undefined) statusResistances.modifier = debuffResist
    }

    const traits = {
      ...(template.traits ?? {}),
      ...(Object.keys(statusResistances).length ? { statusResistances } : {})
    }

    const baseActionPool: EnemyAction[] = []

    const tierStatusWeightScale: Record<EnemyTier, number> = {
      normal: 1,
      elite: 2,
      named: 3,
      boss: 5
    }

    const templateActions: EnemyAction[] = (template.actionPool ?? []).map((action: EnemyAction) => {
      const baseWeight = Math.max(1, action.weight ?? 1)
      const scaledWeight = action.type === 'status' ? Math.max(1, baseWeight * tierStatusWeightScale[tier]) : baseWeight
      return {
        ...action,
        weight: scaledWeight,
        effects: action.effects?.map((e: EnemyActionEffect) => ({ ...e }))
      }
    })

    const actionPool: EnemyAction[] = [...baseActionPool, ...templateActions]

    return {
      name: `${opts?.dungeonName ? `[${opts.dungeonName}] ` : ''}${tierNamePrefix}${template.baseName} Lv.${actualLevel}`.trim(),
      level: actualLevel,
      maxHp: hp,
      currentHp: hp,
      statusEffects: [],
      tier,
      type: template.type,
      traits,
      stats: scaledStats,
      // 行動プール（デフォルト＋状態異常行動）
      actionPool
    }
  }

  /**
   * プレイヤーをリセット（次の戦闘用）
   */
  static resetPlayer(player: Player): void {
    player.currentHp = player.maxHp
    player.statusEffects = []
  }

  /**
   * 敵を倒したときに獲得する経験値を計算
   */
  static calculateExpReward(enemyLevel: number, enemyTier: string, expMultiplier: number = 1): number {
    const baseExp = 100 + enemyLevel * 35
    const levelScale = Math.pow(1.055, Math.max(0, enemyLevel - 1))
    const tierMultiplier = enemyTier === 'boss' ? 3.2 : enemyTier === 'named' ? 2.4 : enemyTier === 'elite' ? 1.6 : 1

    return Math.floor(baseExp * levelScale * tierMultiplier * Math.max(0.1, expMultiplier))
  }

  /**
   * 次のレベルに必要な経験値を計算
   */
  static calculateNextLevelExp(level: number): number {
    const baseExp = 80
    return Math.round(baseExp * Math.pow(1.08, level - 1))
  }
}
