import type { Player, Enemy, CombatLogEntry, Weapon } from '../types'
import { WeaponSystem } from './WeaponSystem'
import { StatusEffectSystem } from './StatusEffectSystem'
import { DamageSystem } from './DamageSystem'
import { calculateActiveSynergies, getTotalSynergyBonus } from '../data/synergies'

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

        let message = `プレイヤーは ${weapon.name} (${i}/${swings}) で攻撃！ ${result.damage}ダメージ`
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
      if (this.enemy.traits?.applyEffects) {
        this.enemy.traits.applyEffects.forEach(effect => {
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
    const names: Record<string, string> = {
      poison: '毒',
      burn: '燃焼',
      frost: '凍結'
    }
    return names[type] || type
  }

  /**
   * 新しい敵を生成
   */
  static generateEnemy(level: number = 1, opts?: {
    dungeonName?: string
    tierWeights?: Partial<Record<Enemy['tier'], number>>
    levelMultiplier?: number
    forcedTier?: Enemy['tier']
    enemyPool?: string[]
  }): Enemy {
    const baseHp = 80
    const baseAtk = 15
    const baseMgc = 10
    const baseDef = 5
    const baseMgcDef = 4
    const baseSpd = 10

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

    // enemyPoolからランダムに敵を選択
    const enemyNames = opts?.enemyPool && opts.enemyPool.length > 0 
      ? opts.enemyPool 
      : ['スライム']
    const randomEnemy = enemyNames[Math.floor(Math.random() * enemyNames.length)]

    const tierMultiplier = tier === 'boss' ? 2.3 : tier === 'named' ? 1.8 : tier === 'elite' ? 1.4 : 1.0
    const tierNamePrefix = tier === 'boss' ? '【ボス】' : tier === 'named' ? '【ネームド】' : tier === 'elite' ? 'エリート' : ''
    const levelScale = opts?.levelMultiplier ?? 1

    const hp = Math.floor((baseHp + (level - 1) * 25) * tierMultiplier * levelScale)
    
    return {
      name: `${opts?.dungeonName ? `[${opts.dungeonName}] ` : ''}${tierNamePrefix}${randomEnemy} Lv.${level}`.trim(),
      level,
      maxHp: hp,
      currentHp: hp,
      statusEffects: [],
      tier,
      stats: {
        attack: Math.floor((baseAtk + (level - 1) * 6) * tierMultiplier * levelScale),
        magic: Math.floor((baseMgc + (level - 1) * 3) * tierMultiplier * levelScale),
        defense: Math.floor((baseDef + (level - 1) * 1.5) * tierMultiplier * levelScale),
        magicDefense: Math.floor((baseMgcDef + (level - 1) * 1) * tierMultiplier * levelScale),
        speed: Math.floor((baseSpd + (level - 1) * 2) * tierMultiplier * levelScale)
      }
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
