import { ref, type Ref, type ComputedRef } from 'vue'
import type { Player, Enemy, Dungeon, CombatLogEntry, EnemyTier } from '~/types'
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
  const isBattleActive = ref(false)

  const startBattle = (opts?: { forcedTier?: EnemyTier }) => {
    const dungeon = selectedDungeon.value
    if (!dungeon) return

    const level = Math.min(
      dungeon.levelRange[1],
      Math.max(dungeon.levelRange[0], currentLevel.value)
    )

    enemy.value = CombatSystem.generateEnemy(level, {
      dungeonName: dungeon.name,
      tierWeights: dungeon.tierWeights,
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
    isBattleActive,
    startBattle,
    runTurn,
    goNextBattle
  }
}
