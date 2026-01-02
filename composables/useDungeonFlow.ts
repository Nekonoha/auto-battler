/**
 * ダンジョン進行・ステージ管理コンポーザブル
 * 
 * 責務:
 * - ダンジョンステージの進行
 * - 敵生成
 * - ステージクリア・失敗判定
 */

import { ref, type Ref, type ComputedRef } from 'vue'
import type { Player, EnemyTier, Dungeon } from '~/types'
import { useBattleFlow } from './useBattleFlow'
import { CombatSystem } from '~/systems/CombatSystem'

export function useDungeonFlow(
  player: Player,
  selectedDungeon: ComputedRef<Dungeon | undefined>,
  currentLevel: Ref<number>
) {
  const {
    enemy,
    combat,
    combatLogs,
    explorationCombatLogs,
    dungeonLogs,
    startBattle,
    runTurn,
    goNextBattle
  } = useBattleFlow(player, selectedDungeon, currentLevel)

  const currentStage = ref(0)
  const totalStages = 10
  const isDungeonRunning = ref(false)
  const isDebugMode = ref(false)
  const currentEvent = ref<'battle' | 'chest' | null>(null)
  const infoMessages = ref<string[]>([])

  const getRandomTier = (dungeon?: Dungeon): EnemyTier => {
    if (!dungeon) return 'normal'
    const namedChance = Math.max(0, Math.min(1, dungeon.namedChance ?? 0))
    const eliteChance = Math.max(0, Math.min(1, dungeon.eliteChance ?? 0))
    const roll = Math.random()
    if (roll < namedChance) return 'named'
    if (roll < namedChance + eliteChance) return 'elite'
    return 'normal'
  }

  const addInfo = (msg: string) => infoMessages.value.push(msg)

  const clearInfos = () => {
    infoMessages.value = []
  }

  const resetPlayerState = () => {
    player.currentHp = player.maxHp
    player.statusEffects = []
  }

  const startStageBattle = (opts?: { forcedTier?: EnemyTier; debugMode?: boolean }) => {
    isDebugMode.value = false
    resetPlayerState()
    startBattle({ forcedTier: opts?.forcedTier })
  }

  const startNextStage = () => {
    if (currentStage.value < totalStages) {
      currentStage.value += 1
      startStageBattle()
    }
  }

  const startDebugBattle = (debugTemplateId?: string) => {
    isDebugMode.value = true
    resetPlayerState()
    combatLogs.value = []
    explorationCombatLogs.value = []
    dungeonLogs.value = []
    enemy.value = CombatSystem.generateEnemy(player.level, { debugMode: true, debugTemplateId })
    combat.value = enemy.value ? new CombatSystem(player, enemy.value) : null
    if (combat.value) {
      isDungeonRunning.value = false
      currentEvent.value = null
      addInfo('デバッグ敵とスパーリングを開始')
    }
  }

  const abandonDungeon = () => {
    isDungeonRunning.value = false
    currentStage.value = 0
    currentEvent.value = null
    resetPlayerState()
    combatLogs.value = []
    explorationCombatLogs.value = []
    dungeonLogs.value = []
    addInfo('探索を中止しました')
  }

  return {
    // State
    currentStage,
    totalStages,
    isDungeonRunning,
    isDebugMode,
    currentEvent,
    infoMessages,
    enemy,
    combat,
    combatLogs,
    explorationCombatLogs,
    dungeonLogs,
    
    // Methods
    getRandomTier,
    addInfo,
    clearInfos,
    resetPlayerState,
    startStageBattle,
    startNextStage,
    startDebugBattle,
    abandonDungeon,
    runTurn,
    goNextBattle
  }
}
