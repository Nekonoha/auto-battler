import { ref, type Ref, type ComputedRef } from 'vue'
import type { Player, Enemy, Dungeon, CombatLogEntry, DungeonLogEntry, EnemyTier } from '~/types'
import { CombatSystem } from '~/systems/CombatSystem'

/**
 * 戦闘開始・進行・終了処理を担うコンポーザブル
 */
export function useBattleFlow(
  player: Player,
  selectedDungeon: ComputedRef<Dungeon | undefined>,
  currentLevel: Ref<number>
) {
  const enemy = ref<Enemy | null>(null)
  const combat = ref<CombatSystem | null>(null)
  const combatLogs = ref<CombatLogEntry[]>([])
  const dungeonLogs = ref<DungeonLogEntry[]>([])
  const currentStageHpBefore = ref<number>(0)
  const isBattleActive = ref(false)

  const startBattle = (opts?: { forcedTier?: EnemyTier }) => {
    const dungeon = selectedDungeon.value
    if (!dungeon) return

    const level = Math.min(
      dungeon.levelRange[1],
      Math.max(dungeon.levelRange[0], currentLevel.value)
    )

    // 戦闘前のHP保存
    currentStageHpBefore.value = player.currentHp

    enemy.value = CombatSystem.generateEnemy(level, {
      dungeonName: dungeon.name,
      tierWeights: dungeon.tierWeights,
      enemyPool: dungeon.enemyPool,
      levelMultiplier: 1 + (level - dungeon.levelRange[0]) * 0.05,
      forcedTier: opts?.forcedTier
    })

    combat.value = new CombatSystem(player, enemy.value)
    // combatLogs.value = [] // ダンジョン内では戦闘ログを引き継ぐ
    isBattleActive.value = true
  }

  const runTurn = (onPlayerVictory?: (enemy: Enemy) => void) => {
    if (!combat.value) return

    combat.value.executeTurn()
    combatLogs.value = combat.value.getCombatLog()

    if (combat.value.isGameOver() && combat.value.isPlayerVictory() && enemy.value) {
      onPlayerVictory?.(enemy.value)
    }
  }

  const goNextBattle = (resetLoot: () => void) => {
    // ダンジョンログに記録
    if (combat.value && enemy.value) {
      const isVictory = combat.value.isPlayerVictory()
      dungeonLogs.value.push({
        stage: currentLevel.value,
        enemyName: enemy.value.name,
        enemyLevel: enemy.value.level,
        enemyTier: enemy.value.tier,
        playerHpBefore: currentStageHpBefore.value,
        playerHpAfter: isVictory ? player.currentHp : 0,
        result: isVictory ? 'victory' : 'defeat',
        goldEarned: 0, // 別途計算
        combatTurns: Math.max(...combatLogs.value.map(log => log.turn), 0)
      })
    }

    if (combat.value?.isPlayerVictory()) {
      const dungeon = selectedDungeon.value
      if (dungeon) {
        currentLevel.value = Math.min(dungeon.levelRange[1], currentLevel.value + 1)
      } else {
        currentLevel.value += 1
      }
    }

    CombatSystem.resetPlayer(player)
    isBattleActive.value = false
    combat.value = null
    enemy.value = null
    resetLoot()
  }

  return {
    enemy,
    combat,
    combatLogs,
    dungeonLogs,
    isBattleActive,
    startBattle,
    runTurn,
    goNextBattle
  }
}
