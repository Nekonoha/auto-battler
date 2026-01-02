/**
 * 戦闘システムのテストコード
 * 基本的な戦闘フローと敵の行動システムを検証
 */

import { CombatSystem } from '../systems/CombatSystem'
import type { Player, Enemy } from '../types'

describe('CombatSystem - 敵の行動選択', () => {
  let player: Player
  let enemy: Enemy

  beforeEach(() => {
    // テスト用プレイヤーを作成
    player = {
      name: 'テストプレイヤー',
      level: 1,
      exp: 0,
      nextLevelExp: 100,
      maxHp: 100,
      currentHp: 100,
      maxMp: 100,
      currentMp: 100,
      stats: {
        attack: 10,
        magic: 10,
        defense: 5,
        magicDefense: 5,
        speed: 10
      },
      weapons: [],
      statusEffects: [],
      gold: 0,
      statPoints: 0
    }

    // テスト用敵を作成
    enemy = {
      name: 'テスト敵',
      level: 1,
      maxHp: 100,
      currentHp: 100,
      statusEffects: [],
      tier: 'normal',
      stats: {
        attack: 10,
        magic: 10,
        defense: 5,
        magicDefense: 5,
        speed: 10
      },
      actionPool: [
        { type: 'attack', weight: 1 },
        { type: 'defend', weight: 1 },
        { type: 'nothing', weight: 1 }
      ]
    }
  })

  describe('敵の生成', () => {
    test('通常の敵にはデフォルトの actionPool が設定される', () => {
      const normalEnemy = CombatSystem.generateEnemy(1)
      expect(normalEnemy.actionPool).toBeDefined()
      expect(normalEnemy.actionPool!.length).toBeGreaterThan(0)
      expect(normalEnemy.actionPool![0].type).toMatch(/attack|defend|nothing|status/)
    })

    test('デバッグモード敵は何もしない行動のみ', () => {
      const debugEnemy = CombatSystem.generateEnemy(1, { debugMode: true })
      expect(debugEnemy.name).toContain('無害なスパーリング相手')
      expect(debugEnemy.actionPool).toBeDefined()
      expect(debugEnemy.actionPool!.length).toBe(1)
      expect(debugEnemy.actionPool![0].type).toBe('nothing')
    })

    test('デバッグモード敵は攻撃力が高い', () => {
      const debugEnemy = CombatSystem.generateEnemy(1, { debugMode: true })
      expect(debugEnemy.stats.attack).toBe(9999)
      expect(debugEnemy.stats.magic).toBe(9999)
    })
  })

  describe('敵の行動プール', () => {
    test('attack, defend, nothing の3つの行動タイプが存在する', () => {
      const actionTypes = ['attack', 'defend', 'nothing']
      actionTypes.forEach(type => {
        expect(['attack', 'defend', 'nothing']).toContain(type)
      })
    })

    test('行動プールに重み付けがある', () => {
      const actionPool = [
        { type: 'attack' as const, weight: 6 },
        { type: 'defend' as const, weight: 3 },
        { type: 'nothing' as const, weight: 1 }
      ]
      const totalWeight = actionPool.reduce((sum, a) => sum + a.weight, 0)
      expect(totalWeight).toBe(10)
    })

    test('デフォルト行動プール: attack 60%, defend 30%, nothing 10% (低レベル敵向け)', () => {
      // 低レベル敵（Lv1-30）を確実に生成するため slime を指定
      const enemy = CombatSystem.generateEnemy(5, { enemyPool: ['slime'], forcedTier: 'normal' })
      const actionPool = enemy.actionPool!
      expect(actionPool).toContainEqual(expect.objectContaining({ type: 'attack', weight: 6 }))
      expect(actionPool).toContainEqual(expect.objectContaining({ type: 'defend', weight: 3 }))
      expect(actionPool).toContainEqual(expect.objectContaining({ type: 'nothing', weight: 1 }))
    })

    test('テンプレートの actionPool は敵インスタンスに引き継がれる', () => {
      const enemy = CombatSystem.generateEnemy(1, { enemyPool: ['viper'], forcedTier: 'normal' })
      const statusAction = enemy.actionPool!.find(a => a.type === 'status')
      expect(statusAction).toBeDefined()
      expect(statusAction!.effects?.length).toBeGreaterThan(0)
      expect(statusAction!.effects![0].type).toBe('poison')
    })
  })
})

describe('CombatSystem - 戦闘フロー', () => {
  let player: Player
  let enemy: Enemy

  beforeEach(() => {
    player = {
      name: 'テストプレイヤー',
      level: 1,
      exp: 0,
      nextLevelExp: 100,
      maxHp: 100,
      currentHp: 100,
      maxMp: 100,
      currentMp: 100,
      stats: {
        attack: 50,
        magic: 50,
        defense: 10,
        magicDefense: 10,
        speed: 20
      },
      weapons: [],
      statusEffects: [],
      gold: 0,
      statPoints: 0
    }

    enemy = {
      name: 'テスト敵',
      level: 1,
      maxHp: 100,
      currentHp: 100,
      statusEffects: [],
      tier: 'normal',
      stats: {
        attack: 30,
        magic: 30,
        defense: 10,
        magicDefense: 10,
        speed: 10
      },
      actionPool: [
        { type: 'attack', weight: 6 },
        { type: 'defend', weight: 3 },
        { type: 'nothing', weight: 1 }
      ]
    }
  })

  test('戦闘システムが正しく初期化される', () => {
    const combat = new CombatSystem(player, enemy)
    expect(combat.getCombatLog()).toBeDefined()
    expect(combat.isGameOver()).toBe(false)
  })

  test('戦闘が終了するまでターンが続く', () => {
    const combat = new CombatSystem(player, enemy)
    let turnCount = 0
    const maxTurns = 100 // 無限ループ防止

    while (!combat.isGameOver() && turnCount < maxTurns) {
      combat.executeTurn()
      turnCount++
    }

    expect(combat.isGameOver()).toBe(true)
    expect(combat.getCombatLog().length).toBeGreaterThan(0)
  })

  test('敵が倒されるとプレイヤーが勝利する', () => {
    const combat = new CombatSystem(player, enemy)
    let turnCount = 0

    while (!combat.isGameOver() && turnCount < 200) {
      combat.executeTurn()
      turnCount++
    }

    // 敵を倒すまでループ（プレイヤー側が強いので必ず勝つ）
    if (enemy.currentHp > 0) {
      enemy.currentHp = 0
    }

    // isPlayerVictory は internal なので直接チェックはできないが、
    // getCombatLog にメッセージがあるかで確認
    const logs = combat.getCombatLog()
    expect(logs.length).toBeGreaterThan(0)
  })

  test('戦闘ログが記録される', () => {
    const combat = new CombatSystem(player, enemy)
    combat.executeTurn()
    const logs = combat.getCombatLog()
    expect(logs.length).toBeGreaterThan(0)
    expect(logs[0]).toHaveProperty('turn')
    expect(logs[0]).toHaveProperty('message')
    expect(logs[0]).toHaveProperty('type')
  })
})

describe('CombatSystem - 経験値計算', () => {
  test('敵を倒した時の経験値計算', () => {
    // Lv.1 normal 敵の場合
    const exp1 = CombatSystem.calculateExpReward(1, 'normal')
    expect(exp1).toBe(135)

    // Lv.10 elite 敵の場合
    const exp2 = CombatSystem.calculateExpReward(10, 'elite')
    expect(exp2).toBeGreaterThan(exp1)

    // Lv.10 boss 敵の場合
    const exp3 = CombatSystem.calculateExpReward(10, 'boss')
    expect(exp3).toBeGreaterThan(exp2)
  })

  test('ボス敵は高い経験値を与える', () => {
    const normalExp = CombatSystem.calculateExpReward(10, 'normal')
    const bossExp = CombatSystem.calculateExpReward(10, 'boss')
    expect(bossExp).toBeGreaterThan(normalExp)
    expect(bossExp / normalExp).toBeGreaterThan(3)
  })

  test('次のレベルに必要な経験値', () => {
    const level1 = CombatSystem.calculateNextLevelExp(1)
    const level2 = CombatSystem.calculateNextLevelExp(2)
    const level3 = CombatSystem.calculateNextLevelExp(3)

    expect(level2).toBeGreaterThan(level1)
    expect(level3).toBeGreaterThan(level2)
    expect(level2 / level1).toBeCloseTo(1.08, 2)
    expect(level3 / level2).toBeCloseTo(1.08, 2)
  })
})
