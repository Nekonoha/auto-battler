import type { Player, Enemy, CombatLogEntry, Weapon, EnemyTier } from '../types'
import { WeaponSystem } from './WeaponSystem'
import { StatusEffectSystem } from './StatusEffectSystem'
import { DamageSystem } from './DamageSystem'
import { calculateActiveSynergies, getTotalSynergyBonus } from '../data/synergies'
import { calculateEnemyLevelForDungeon } from '../utils/levelScaling'
import { getEnemyTemplateByNameOrId, getRandomEnemyTemplate } from '../data/enemies'

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
      
      // ステータスボーナスを一時的に適用（元のステータスは保持）
      if (this.synergyBonus.attackBonus) this.player.attack = Math.floor(this.player.attack * (1 + this.synergyBonus.attackBonus / 100))
      if (this.synergyBonus.magicBonus) this.player.magic = Math.floor(this.player.magic * (1 + this.synergyBonus.magicBonus / 100))
      if (this.synergyBonus.speedBonus) this.player.speed = Math.floor(this.player.speed * (1 + this.synergyBonus.speedBonus / 100))
      
      // 武器のステータスは変更せず、攻撃計算時にボーナスを適用
      // (シナジーボーナスはWeaponSystem.attack内で計算時に反映される)
    }
  }

  /**
   * 戦闘ログを取得
   */
  getCombatLog(): CombatLogEntry[] {
    return this.combatLog
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
    const playerEffects = StatusEffectSystem.processStatusEffects(this.player)
    playerEffects.forEach(result => {
      if (result.damage > 0) {
        this.addLog(result.message, 'damage')
      } else {
        this.addLog(result.message, 'status')
      }
    })

    // 敵の状態異常処理
    const enemyEffects = StatusEffectSystem.processStatusEffects(this.enemy)
    enemyEffects.forEach(result => {
      if (result.damage > 0) {
        this.addLog(result.message, 'damage')
      } else {
        this.addLog(result.message, 'status')
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
      this.addLog('プレイヤーは行動できない！', 'status')
      return
    }

    if (this.player.weapons.length === 0) {
      this.addLog('プレイヤーは武器を装備していない！', 'info')
      return
    }

    // 装備している全ての武器で攻撃（1ターンで全武器使用）
    for (const weapon of this.player.weapons) {
      if (this.enemy.currentHp <= 0) break

      // 速度に応じた手数を計算（最低1回、最大4回）
      const swings = Math.min(4, Math.max(1, Math.floor(weapon.stats.speed / 20) + 1))

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

        let message = `プレイヤーは ${weapon.name} (${i}/${swings}) で攻撃！ ${result.damage}ダメージ`
        
        // 耐性適用のログ
        if (result.resistanceApplied && result.resistanceApplied > 0) {
          message += ` (耐性${result.resistanceApplied}%)`
        }
        
        if (result.isCritical) {
          message += ' クリティカル！'
          this.addLog(message, 'critical')
        } else {
          this.addLog(message, 'damage')
        }

        // 状態異常付与のログ
        result.statusEffects.forEach(effect => {
          const icon = StatusEffectSystem.getStatusIcon(effect.type)
          this.addLog(
            `${this.enemy.name}に${icon}${this.getStatusName(effect.type)}を付与した！`,
            'status'
          )
        })
        
        // 状態異常無効化のログ（武器に状態異常があるが付与されなかった場合）
        const immuneEffects = weapon.effects.filter(effect => 
          this.enemy.traits?.statusImmunities?.includes(effect.type) &&
          !result.statusEffects.some(applied => applied.type === effect.type)
        )
        immuneEffects.forEach(effect => {
          const icon = StatusEffectSystem.getStatusIcon(effect.type)
          this.addLog(
            `${icon}${this.getStatusName(effect.type)}は無効化された (状態異常耐性)`,
            'info'
          )
        })
      }
    }
  }

  /**
   * 敵攻撃フェーズ
   */
  private enemyAttackPhase(): void {
    if (this.enemy.currentHp <= 0) return

    // 行動不能状態チェック
    const cannotAct = StatusEffectSystem.cannotAct(this.enemy)
    if (cannotAct) {
      this.addLog(`${this.enemy.name}は行動できない！`, 'status')
      return
    }

    // 敵の速度に応じた攻撃回数（最低1回、最大3回）
    const numAttacks = Math.min(3, Math.max(1, Math.floor(this.enemy.stats.speed / 25)))
    
    for (let i = 1; i <= numAttacks; i++) {
      if (this.player.currentHp <= 0) break

      // 敵の基本攻撃（物理防御を考慮）
      let baseDamage = this.enemy.stats.attack
      
      // weak/fearによるダメージ減少
      baseDamage = StatusEffectSystem.applyDamageModifiers(this.enemy, baseDamage)
      
      const variance = 0.8 + Math.random() * 0.4 // 80%～120%のランダム性
      const attackDamage = baseDamage * variance
      const finalDamage = DamageSystem.calculateDamage(attackDamage, this.player, false)

      this.player.currentHp = Math.max(0, this.player.currentHp - finalDamage)
      
      const message = numAttacks > 1 
        ? `${this.enemy.name}の攻撃 (${i}/${numAttacks})！ ${finalDamage}ダメージ`
        : `${this.enemy.name}の攻撃！ ${finalDamage}ダメージ`
      this.addLog(message, 'damage')
      
      // 敵の状態異常付与（敵のtraitsから）
      if (this.enemy.traits?.inflictsStatus) {
        this.enemy.traits.inflictsStatus.forEach(effect => {
          if (Math.random() * 100 < effect.chance) {
            StatusEffectSystem.applyStatusEffect(this.player, effect.type, effect.stacks, effect.duration)
            const icon = StatusEffectSystem.getStatusIcon(effect.type)
            this.addLog(
              `プレイヤーに${icon}${this.getStatusName(effect.type)}を付与した！`,
              'status'
            )
          }
        })
      }
    }
  }

  /**
   * 戦闘終了判定
   */
  private checkBattleEnd(): boolean {
    if (this.player.currentHp <= 0) {
      this.isFinished = true
      this.addLog('プレイヤーは倒れた...', 'info')
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
   * ログに追加
   */
  private addLog(message: string, type: CombatLogEntry['type']): void {
    this.combatLog.push({
      turn: this.turnCount,
      message,
      type
    })
  }

  /**
   * 状態異常の名前を取得
   */
  private getStatusName(type: string): string {
    return StatusEffectSystem.getStatusName(type as any)
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
  }): Enemy {
    if (opts?.debugMode) {
      const hp = 5_000_000
      return {
        name: '【DEBUG】無害なスパーリング相手',
        level,
        maxHp: hp,
        currentHp: hp,
        statusEffects: [],
        tier: 'boss',
        stats: {
          attack: 0,
          magic: 0,
          defense: 9999,
          magicDefense: 9999,
          speed: 10
        }
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

    const tierNamePrefix = tier === 'boss' ? '【ボス】' : tier === 'named' ? '【ネームド】' : tier === 'elite' ? 'エリート' : ''

    // テンプレート選択
    const pool = (tier === 'boss' && opts?.bossId)
      ? [opts.bossId]
      : (opts?.enemyPool && opts.enemyPool.length ? opts.enemyPool : undefined)

    const template = (() => {
      if (pool) {
        const pick = pool[Math.floor(Math.random() * pool.length)]
        const found = getEnemyTemplateByNameOrId(pick)
        if (found) return found
      }
      return getRandomEnemyTemplate()
    })()

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

    const scaledStats = {
      attack: scale(template.baseStats.attack),
      magic: scale(template.baseStats.magic),
      defense: scale(template.baseStats.defense),
      magicDefense: scale(template.baseStats.magicDefense),
      speed: Math.max(1, Math.round(template.baseStats.speed * (1 + (actualLevel - 1) * 0.04) * statMult))
    }

    const baseHp = 70 * template.baseStats.hpMultiplier
    const hp = Math.max(30, Math.floor(baseHp * levelHpGrowth * hpMult * levelScale))

    return {
      name: `${opts?.dungeonName ? `[${opts.dungeonName}] ` : ''}${tierNamePrefix}${template.baseName} Lv.${actualLevel}`.trim(),
      level: actualLevel,
      maxHp: hp,
      currentHp: hp,
      statusEffects: [],
      tier,
      type: template.type,
      traits: template.traits,
      stats: scaledStats
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
  static calculateExpReward(enemyLevel: number, enemyTier: string): number {
    const baseExp = 50
    const levelBonus = enemyLevel * 20
    const tierMultiplier = enemyTier === 'boss' ? 3.5 : enemyTier === 'named' ? 2.5 : enemyTier === 'elite' ? 1.8 : 1.0
    
    return Math.floor((baseExp + levelBonus) * tierMultiplier)
  }

  /**
   * 次のレベルに必要な経験値を計算
   */
  static calculateNextLevelExp(level: number): number {
    const baseExp = 100
    return Math.floor(baseExp * Math.pow(1.15, level - 1))
  }
}
